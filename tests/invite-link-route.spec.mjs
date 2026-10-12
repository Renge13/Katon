// ============================================================
// tests/invite-link-route.spec.mjs — the server side of `invite_shared`
// ============================================================
// Run: npm run test:invite-link-route  (needs --conditions=react-server; the script does it)
//
// Prompt BP §3 (Reyner, 2026-10-12). `invite_shared` is a CLIENT event keyed by the
// mirror reading id, like the compat CTA events. Its detail carries only `via`
// ('share' or 'copy'), never anything else a client sends with it.
//
// The server rejects nothing new: the new event is accepted, and an unknown event
// still 400s. `via` is REQUIRED, on the precedent of `interest_registered`'s product:
// an invite that cannot say how it left is not a signal.
//
// Red first: shown failing on main (`6e7fbf7`). The run is in the commit message.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { createMirrorReading, serveMirrorReading, recordMirrorEvent, CLIENT_EVENTS } from '../lib/mirror/handlers.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';
import { readEvents, FUNNEL_EVENTS, __resetAnalyticsMemForTest } from '../lib/analytics/events.js';

const ORIGIN = 'http://localhost/api/mirror';
const CHART = { birthDate: '1989-02-04', birthTime: '04:00' };
const readingMem = () => globalThis.__katonReadingMem;

let realFetch;

function request(body) {
  return new Request(ORIGIN, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const post = (token, body) => recordMirrorEvent(request(body), token);

/** A reading with a cache row; `recordMirrorEvent` 404s on one without. */
async function readyReading() {
  const res = await createMirrorReading(request(CHART));
  assert.equal(res.status, 201);
  const { token } = await res.json();
  const { semanticJson } = semanticFromRow(readingMem().get(token));
  const reading = {
    blocks: assembleFallback(semanticJson).blocks,
    penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.',
  };
  globalThis.fetch = async () => Response.json({
    candidates: [{ content: { parts: [{ text: JSON.stringify(reading) }] }, finishReason: 'STOP' }],
  });
  const served = await (await serveMirrorReading(new Request(ORIGIN), token)).json();
  assert.equal(served.meta.source, 'gemini', 'the warm-up render did not pass the gate');
  return token;
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  realFetch = globalThis.fetch;
  readingMem().clear();
  __clearMemCache();
  __clearMemRateLimit();
  __resetAnalyticsMemForTest();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
});

test('invite_shared IS A FUNNEL EVENT AND A CLIENT EVENT', () => {
  assert.ok(FUNNEL_EVENTS.includes('invite_shared'), 'missing from FUNNEL_EVENTS');
  assert.ok(CLIENT_EVENTS.includes('invite_shared'), 'missing from CLIENT_EVENTS');
});

test('POST invite_shared via share / via copy is ACCEPTED and recorded, keyed by the reading', async () => {
  const token = await readyReading();
  assert.equal((await post(token, { event: 'invite_shared', via: 'share' })).status, 200);
  const rows = (await readEvents()).filter((e) => e.event === 'invite_shared');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].reading_id, token);
  assert.deepEqual(rows[0].detail, { via: 'share' });

  const other = await readyReading();
  assert.equal((await post(other, { event: 'invite_shared', via: 'copy' })).status, 200);
  const copyRow = (await readEvents()).find((e) => e.event === 'invite_shared' && e.reading_id === other);
  assert.deepEqual(copyRow.detail, { via: 'copy' });
});

test('THE DETAIL CARRIES ONLY via: anything else the client sends is dropped', async () => {
  const token = await readyReading();
  const res = await post(token, { event: 'invite_shared', via: 'share', text: 'apa saja', k: 'ajak', extra: { a: 1 } });
  assert.equal(res.status, 200);
  const row = (await readEvents()).find((e) => e.event === 'invite_shared');
  assert.deepEqual(row.detail, { via: 'share' });
});

test('invite_shared WITHOUT A VALID via IS REFUSED, and records nothing', async () => {
  const token = await readyReading();
  assert.equal((await post(token, { event: 'invite_shared' })).status, 400);
  assert.equal((await post(token, { event: 'invite_shared', via: 'whatsapp' })).status, 400);
  assert.equal((await readEvents()).filter((e) => e.event === 'invite_shared').length, 0);
});

test('AN UNKNOWN EVENT STILL 400s', async () => {
  const token = await readyReading();
  assert.equal((await post(token, { event: 'invite_sent', via: 'share' })).status, 400);
  assert.equal((await post(token, { event: 'purchase_confirmed' })).status, 400);
});
