// ============================================================
// tests/link-source-route.spec.mjs — the source rides on the two creates
// ============================================================
// Run: npm run test:link-source-route
//
// Prompt BM item 4 (Reyner, 2026-10-08). `POST /api/mirror` and `POST /api/pair` take
// `src: {k, ref, landing}` from the client, re-validate it (lib/site/linkSource.js),
// and record it ONCE: on `reading_created` for a mirror, on the new `pair_created` for
// a pair. Never on checkout_started or purchase_confirmed - they share the id, so the
// SQL joins them to the create.
//
// THE FALSIFICATION FOR RULE 1 is the first test. `assertNoPii` throws on a date run in
// `detail` and `recordEvent` swallows it, so an unvalidated `th-2026-10-08` would make
// `reading_created` silently vanish. This test was shown red by passing the raw code
// through (the PR body has the run): the event went missing, so the test can see it.
//
// In-memory backends only (no Supabase configured): no shared-DB rows.
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';

import { createMirrorReading } from '../lib/mirror/handlers.js';
import { createPairRow } from '../lib/pair/handlers.js';
import { readEvents, __resetAnalyticsMemForTest } from '../lib/analytics/events.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';

const json = (url, body) => new Request(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

const BIRTH = { birthDate: '1994-11-21', birthTime: '13:45' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const SRC = { k: 'th-arch1', ref: 'l.threads.com', landing: 'home' };

async function mirror(extra = {}) {
  const res = await createMirrorReading(json('http://localhost/api/mirror', { ...BIRTH, ...extra }));
  assert.equal(res.status, 201, await res.clone().text());
  return (await res.json()).token;
}

async function pair(extra = {}) {
  const res = await createPairRow(json('http://localhost/api/pair', { a: BIRTH, b: B, status: 'PDKT', ...extra }));
  assert.equal(res.status, 201, await res.clone().text());
  return (await res.json()).id;
}

async function eventFor(id, name) {
  return (await readEvents()).find((e) => e.reading_id === id && e.event === name);
}

beforeEach(() => {
  __resetAnalyticsMemForTest();
  __clearMemRateLimit();
  globalThis.__katonReadingMem?.clear();
  globalThis.__katonPairMem?.clear();
});

test('BM rule 1 FALSIFICATION: a date-shaped code still records reading_created, with k null', async () => {
  const token = await mirror({ src: { k: 'th-2026-10-08', ref: 'l.threads.com', landing: 'home' } });
  const row = await eventFor(token, 'reading_created');
  assert.ok(row, 'reading_created must exist: a bad code may never cost the event');
  assert.deepEqual(row.detail, { has_hour: true, k: null, ref: 'l.threads.com', landing: 'home' });
});

test('BM 4: a mirror create with a valid src stores it on reading_created', async () => {
  const token = await mirror({ src: SRC });
  assert.deepEqual((await eventFor(token, 'reading_created')).detail,
    { has_hour: true, k: 'th-arch1', ref: 'l.threads.com', landing: 'home' });
});

test('BM 4: a mirror create with no src stores nulls and still records', async () => {
  const token = await mirror();
  assert.deepEqual((await eventFor(token, 'reading_created')).detail,
    { has_hour: true, k: null, ref: null, landing: null });
});

test('BM 4: the server re-validates every field - never trust the client', async () => {
  const token = await mirror({ src: { k: 'TH', ref: 'x.com/path', landing: 'r/eJm6p6PjG8f_0eridE39x', extra: 'x' } });
  assert.deepEqual((await eventFor(token, 'reading_created')).detail,
    { has_hour: true, k: null, ref: null, landing: null });
});

test('BM 4: a pair create with a valid src records pair_created with it, from_mirror false', async () => {
  const id = await pair({ src: { ...SRC, landing: 'kompatibilitas' } });
  assert.deepEqual((await eventFor(id, 'pair_created')).detail,
    { k: 'th-arch1', ref: 'l.threads.com', landing: 'kompatibilitas', from_mirror: false });
});

test('BM 4: a pair create from a mirror says so; no src stores nulls and still records', async () => {
  const id = await pair({ a_reading_id: 'someReadingId' });
  assert.deepEqual((await eventFor(id, 'pair_created')).detail,
    { k: null, ref: null, landing: null, from_mirror: true });
});

test('BM 4: a date-shaped pair code still records pair_created, with k null', async () => {
  const id = await pair({ src: { k: 'th-2026-10-08' } });
  const row = await eventFor(id, 'pair_created');
  assert.ok(row, 'pair_created must exist');
  assert.equal(row.detail.k, null);
});

test('BM 4: a refused pair create (409, nothing written) records no pair_created', async () => {
  const res = await createPairRow(json('http://localhost/api/pair', {
    a: BIRTH, b: { birthDate: '1985-02-04', birthTime: null }, status: 'PDKT', src: SRC,
  }));
  assert.equal(res.status, 409);
  assert.equal((await readEvents()).filter((e) => e.event === 'pair_created').length, 0);
});
