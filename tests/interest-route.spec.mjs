// ============================================================
// tests/interest-route.spec.mjs — the interest tap, and what it refuses
// ============================================================
// Run: npm run test:interest  (needs --conditions=react-server; the script does it)
//
// Prompt Q commit 4. The event ENDPOINT had no test at all before this file -
// `tests/analytics-events.spec.mjs` covers the storage module, and
// `tests/mirror-route.spec.mjs` never touches `/event`. So the fence that stops a
// client asserting a purchase was, until now, asserted nowhere.
//
// THE FOUR PROPOSITIONS, each of which is a silent wrong number if it breaks:
//
//   1. A TAP WITHOUT A PRODUCT IS NOT A SIGNAL. Defaulting it to one of the two
//      would fabricate the exact comparison September exists to make.
//   2. A CLIENT CANNOT ASSERT A SERVER FACT. `purchase_confirmed` is webhook-only.
//   3. TAPPING BOTH PRODUCTS COUNTS AS TWO INTERESTS, ONE EVENT. This is the
//      assertion behind the comment in `recordMirrorEvent`: `funnel_event` is
//      unique on (reading_id, event), so per-product counts MUST come from
//      `product_interest` or the second tap vanishes.
//   4. CONTACT IS OPTIONAL AND LATE. The signal is recorded on the tap; a contact
//      supplied afterwards attaches to it and never creates a second signal.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { createMirrorReading, serveMirrorReading, recordMirrorEvent } from '../lib/mirror/handlers.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';
import { readEvents, readInterest, __resetAnalyticsMemForTest } from '../lib/analytics/events.js';

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

/**
 * A reading whose cache row exists, because `recordMirrorEvent` 404s on a reading
 * with no `cache_key` and every test here needs to get past that.
 */
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

test('interest_registered without a product is refused', async () => {
  const token = await readyReading();
  const res = await post(token, { event: 'interest_registered' });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /product must be one of/);
  assert.deepEqual(await readInterest(), [], 'nothing may be recorded on a refusal');
});

test('interest_registered with an unknown product is refused', async () => {
  const token = await readyReading();
  const res = await post(token, { event: 'interest_registered', product: 'tarot' });
  assert.equal(res.status, 400);
  assert.deepEqual(await readInterest(), []);
});

test('a client may not assert a purchase', async () => {
  const token = await readyReading();
  for (const event of ['purchase_confirmed', 'checkout_started', 'mirror_served', 'reading_created']) {
    const res = await post(token, { event, sku: 'artifact' });
    assert.equal(res.status, 400, `${event} must not be client-fireable`);
  }
});

test('a tap records the interest with no contact', async () => {
  const token = await readyReading();
  const res = await post(token, { event: 'interest_registered', product: 'compat' });
  assert.equal(res.status, 200);

  const rows = await readInterest();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].product, 'compat');
  assert.equal(rows[0].contact, null, 'the tap alone must not invent a contact');
});

test('tapping both products is two interests and ONE event row', async () => {
  const token = await readyReading();
  await post(token, { event: 'interest_registered', product: 'compat' });
  await post(token, { event: 'interest_registered', product: 'annual' });

  const interests = await readInterest();
  assert.deepEqual(interests.map((r) => r.product).sort(), ['annual', 'compat'],
    'both taps must survive as distinct per-product signals');

  const events = (await readEvents()).filter((e) => e.event === 'interest_registered');
  assert.equal(events.length, 1, 'funnel_event is unique on (reading_id, event)');
  assert.equal(events[0].count, 2);
  // THE POINT OF THIS TEST. The event row remembers only the FIRST product, so a
  // read-out that derived per-product interest from `detail` would report one tap
  // where there were two - a plausible-looking number, which is the worst kind.
  assert.equal(events[0].detail.product, 'compat');
});

test('a contact supplied after the tap attaches to the same signal', async () => {
  const token = await readyReading();
  await post(token, { event: 'interest_registered', product: 'annual' });
  await post(token, { event: 'interest_registered', product: 'annual', contact: 'someone@example.com' });

  const rows = await readInterest();
  assert.equal(rows.length, 1, 'a late contact must not create a second signal');
  assert.equal(rows[0].contact, 'someone@example.com');
});

test('upcoming_seen needs no payload and stays one row across refreshes', async () => {
  const token = await readyReading();
  for (let i = 0; i < 5; i += 1) {
    assert.equal((await post(token, { event: 'upcoming_seen' })).status, 200);
  }
  const rows = (await readEvents()).filter((e) => e.event === 'upcoming_seen');
  assert.equal(rows.length, 1, 'the second denominator must not be inflated by a refresh');
  assert.equal(rows[0].count, 5);
});
