// ============================================================
// tests/offer-seen-route.spec.mjs — `offer_seen` and `reading_created`, server side
// ============================================================
// Run: npm run test:offer-seen-route
//
// Prompt BG §2 (Reyner, 2026-10-06). `offer_seen` is recorded once per reading, never
// on a paid reading, never while payments are closed. The client cannot be trusted with
// any of the three: a reload, a second device and a stale tab all post again. So the
// route enforces them, and these tests post the event directly, the way any client can.
//
// `reading_created` already carries `has_hour` (since 2026-08-29); this pins it, with
// no birth data beside it, because §2.6's funnel split reads it.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { createMirrorReading, serveMirrorReading, recordMirrorEvent } from '../lib/mirror/handlers.js';
import { markReadingPaid } from '../lib/readingStore.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';
import { readEvents, __resetAnalyticsMemForTest } from '../lib/analytics/events.js';

const ORIGIN = 'http://localhost/api/mirror';
const readingMem = () => globalThis.__katonReadingMem;

let realFetch;
let savedProvider;

const request = (body) => new Request(ORIGIN, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const post = (token, body) => recordMirrorEvent(request(body), token);
const rowsOf = async (event) => (await readEvents()).filter((r) => r.event === event);

/** A created and served reading: the event route 404s on one with no cache row. */
async function readyReading(birth = { birthDate: '1989-02-04', birthTime: '04:00' }) {
  const res = await createMirrorReading(request(birth));
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
  const served = await serveMirrorReading(new Request(ORIGIN), token);
  assert.equal(served.status, 200);
  return token;
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  savedProvider = process.env.PAYMENTS_PROVIDER;
  // Payments OPEN for these tests: mock, which the fence allows outside production.
  process.env.PAYMENTS_PROVIDER = 'mock';
  realFetch = globalThis.fetch;
  readingMem().clear();
  __clearMemCache();
  __clearMemRateLimit();
  __resetAnalyticsMemForTest();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
  if (savedProvider === undefined) delete process.env.PAYMENTS_PROVIDER; else process.env.PAYMENTS_PROVIDER = savedProvider;
});

test('BG §2.3: offer_seen is ONE row per reading, however often it is posted', async () => {
  const token = await readyReading();
  for (let i = 0; i < 3; i += 1) assert.equal((await post(token, { event: 'offer_seen' })).status, 200);
  const rows = await rowsOf('offer_seen');
  assert.equal(rows.length, 1, 'one row: a reload, a re-scroll or a second device adds none');
  assert.equal(rows[0].reading_id, token);
});

test('BG §2.3: offer_seen on a PAID reading records nothing', async () => {
  const token = await readyReading();
  await markReadingPaid(token, new Date().toISOString());
  const res = await post(token, { event: 'offer_seen' });
  assert.equal(res.status, 200, 'answered, so a client has nothing to retry');
  assert.equal((await rowsOf('offer_seen')).length, 0, 'no offer_seen for a reading she already owns');
  // The control: the same route still records another client event on that reading.
  await post(token, { event: 'card_downloaded' });
  assert.equal((await rowsOf('card_downloaded')).length, 1, 'the route itself still records');
});

test('BG §2.3: offer_seen while payments are CLOSED records nothing', async () => {
  const token = await readyReading();
  delete process.env.PAYMENTS_PROVIDER; // unset fails closed (lib/paymentFence.js)
  const res = await post(token, { event: 'offer_seen' });
  assert.equal(res.status, 200);
  assert.equal((await rowsOf('offer_seen')).length, 0, 'no offer is made while the fence is closed');
  process.env.PAYMENTS_PROVIDER = 'mock';
  await post(token, { event: 'offer_seen' });
  assert.equal((await rowsOf('offer_seen')).length, 1, 'and it records once payments are open (control)');
});

test('BG §2.2: reading_created says whether the hour was given, and carries no birth data', async () => {
  const withHour = await readyReading({ birthDate: '1989-02-04', birthTime: '04:00' });
  const noHour = await readyReading({ birthDate: '1990-03-04', birthTime: null });
  const created = await rowsOf('reading_created');
  const byToken = Object.fromEntries(created.map((r) => [r.reading_id, r.detail]));
  // Since Prompt BM (2026-10-08) it also carries the link source, all null here because
  // these creates send no `src` (tests/link-source-route.spec.mjs covers the rest). The
  // exact shape stays pinned, so a birth field added beside them still fails here.
  const NO_SOURCE = { k: null, ref: null, landing: null };
  assert.deepEqual(byToken[withHour], { has_hour: true, ...NO_SOURCE });
  assert.deepEqual(byToken[noHour], { has_hour: false, ...NO_SOURCE });
});
