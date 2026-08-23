// ============================================================
// The Rp 19.000 delivery — the gate, the readiness rule, and the refusals
// ============================================================
// Run: npm run test:deliver
//
// NOTE: runs with `--conditions=react-server` (the npm script does this), like every
// other route-handler spec here. `lib/render/cache.js` carries `server-only` and is
// an empty stub without it.
//
// SO THIS SPEC NEVER RENDERS A PDF, and that is structural rather than a shortcut:
// @react-pdf/renderer needs the client React build and dies under this condition.
// `serveDeliveryPdf` therefore takes the builder as a parameter, the route file wires
// the real one, and this file passes a stub that records its arguments. What is under
// test here is the GATE - the security-critical half - and the bytes have their own
// suite in tests/pdf-document.spec.mjs under plain node.
//
// MOST OF WHAT IS BELOW IS A REFUSAL. A paywall whose refusals have never been
// observed refusing is a paywall nobody has tested, and this repo has the scar:
// NEXT_PUBLIC_FREE_FULL_READING was set in Vercel and production served the paid
// product to everyone until Xendit rejected the site for it.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';

import {
  serveDeliveryManifest, serveDeliveryCard, serveDeliveryPdf,
  deliverable, DELIVERY_ITEMS, NOT_PAID, LEGACY_READING, NOT_RENDERED,
} from '../lib/deliver/handlers.js';
import { createReading } from '../lib/readingStore.js';
import { writeCache, __clearMemCache } from '../lib/render/cache.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { STAGE6_VERSION } from '../lib/render/fence.js';
import { RATE_LIMITS, __clearMemRateLimit } from '../lib/ratelimit.js';

const BIRTH = { birth_date: '1989-09-13', birth_time: '09:00' };
let seq = 0;

/**
 * A reading row. `paid` and `cache_key` are the two axes every test below varies,
 * because they are the two axes `deliverable` reads.
 */
async function seed({ paid = false, cacheKey = null } = {}) {
  seq += 1;
  const id = `deliv${seq}`;
  await createReading({
    id, ...BIRTH, paid, cache_key: cacheKey, gender: 'female',
  });
  return id;
}

/**
 * The render_cache row a promoted reading would have. No provider, no spend.
 *
 * `stage6Version` is set, because `readCache` treats a null one as unservable and
 * `serveDeliveryPdf` reads with `includeUnvalidated: false` - a row that never
 * passed the gate is not a reading, and a paid document is the last place to relax
 * that. The FIXTURE PROSE IS THE FLOOR, which is the right thing to store in a test
 * (byte-stable) and the wrong thing to serve unlabelled, and the two facts are not
 * in tension: what is under test is whether the cached row reaches the builder, not
 * what is in it.
 */
async function cacheAReading() {
  const { semanticJson, key } = semanticFromRow({ ...BIRTH });
  await writeCache(key, {
    ...assembleFallback(semanticJson),
    engineVersion: semanticJson.engine_version,
    source: 'module_assembly',
    promptVersion: 'testprompt00',
    stage6Version: STAGE6_VERSION,
  });
  return key;
}

const stubPdf = () => {
  const calls = [];
  return {
    calls,
    renderPdf: async (args) => {
      calls.push(args);
      return { buffer: Buffer.from('%PDF-1.3 stub'), pageMap: {}, report: {} };
    },
  };
};

const req = (ip = '203.0.113.9') => new Request('https://katon.app/api/deliver/x/pdf', {
  headers: { 'x-forwarded-for': ip },
});

beforeEach(() => {
  __clearMemCache();
  __clearMemRateLimit();
});

// ── the readiness rule, on its own ──

test('deliverable() reads exactly two fields, and names why it refused', () => {
  assert.deepEqual(deliverable({ paid: false, cache_key: 'k' }),
    { ready: false, reason: NOT_PAID });
  assert.deepEqual(deliverable({ paid: true, cache_key: null }),
    { ready: false, reason: LEGACY_READING });
  assert.deepEqual(deliverable({ paid: true, cache_key: 'k' }),
    { ready: true, reason: null });

  // A truthy-but-not-true `paid` MUST NOT open it. Rule 18 is `row.paid === true`,
  // and a Supabase column read back as the string "true" is exactly the shape that
  // would slip through a loose check.
  for (const paid of ['true', 1, {}, 'yes']) {
    assert.equal(deliverable({ paid, cache_key: 'k' }).ready, false,
      `paid=${JSON.stringify(paid)} must not be treated as paid`);
  }
});

// ── the manifest ──

test('the manifest describes the offer BEFORE payment, without paid data in it', async () => {
  const id = await seed({ paid: false });
  const res = await serveDeliveryManifest(id);
  const body = await res.json();

  assert.equal(res.status, 200, 'the paywall must be able to describe what it sells');
  assert.equal(body.paid, false);
  assert.deepEqual(body.items.map((i) => i.item), DELIVERY_ITEMS);
  assert.ok(body.items.every((i) => i.ready === false && i.reason === NOT_PAID));
  // Nothing in it is paid content: two item names and a boolean.
  assert.equal(JSON.stringify(body).includes('birth'), false);
});

test('the two items are ONE delivery - they are never ready separately', async () => {
  for (const state of [{ paid: false }, { paid: true }, { paid: true, cacheKey: 'k' }]) {
    const id = await seed(state);
    const body = await serveDeliveryManifest(id).then((r) => r.json());
    const readiness = new Set(body.items.map((i) => `${i.ready}:${i.reason}`));
    assert.equal(readiness.size, 1,
      `${JSON.stringify(state)}: card and pdf disagreed, so this is no longer one delivery`);
  }
});

test('an unknown token is a 404 on all three endpoints', async () => {
  const { renderPdf } = stubPdf();
  assert.equal((await serveDeliveryManifest('nope')).status, 404);
  assert.equal((await serveDeliveryCard('nope')).status, 404);
  assert.equal((await serveDeliveryPdf(req(), 'nope', { renderPdf })).status, 404);
});

// ── the gate ──

test('AN UNPAID READING GETS NO CARD DATA AND NO PDF', async () => {
  const id = await seed({ paid: false, cacheKey: 'k' });
  const { renderPdf, calls } = stubPdf();

  const card = await serveDeliveryCard(id);
  assert.equal(card.status, 402);
  assert.equal((await card.json()).error, NOT_PAID);

  const pdf = await serveDeliveryPdf(req(), id, { renderPdf });
  assert.equal(pdf.status, 402);
  assert.equal((await pdf.json()).error, NOT_PAID);
  assert.equal(calls.length, 0, 'an unpaid request must not reach the renderer at all');
});

test('a LEGACY paid reading is refused, not served a floor-built document', async () => {
  // The interim state PROGRESS records: paid today buys the 7-beat deep read, and
  // those rows never call setReadingCacheKey. A PDF here would be built on module
  // assembly, and the floor reads like the real thing - which is the reason this is
  // a refusal rather than a fallback.
  const id = await seed({ paid: true, cacheKey: null });
  const { renderPdf, calls } = stubPdf();

  const pdf = await serveDeliveryPdf(req(), id, { renderPdf });
  assert.equal(pdf.status, 409);
  assert.equal((await pdf.json()).error, LEGACY_READING);
  assert.equal(calls.length, 0);

  const card = await serveDeliveryCard(id);
  assert.equal(card.status, 409, 'the card would name her Bambu beside a reading '
    + 'that names her Akar - two live name sets, PROGRESS LIVE STATE divergence 3');
});

test('a paid mirror reading with NO cached render is refused, not rendered fresh', async () => {
  // Rule 16 and prompt M both: the PDF reads render_cache and never re-renders. A
  // PDF that regenerates its own prose is a second reading wearing the first one's
  // name, and the buyer would get a document that does not match what she read.
  const id = await seed({ paid: true, cacheKey: 'a-key-that-was-served-once' });
  const { renderPdf, calls } = stubPdf();

  const res = await serveDeliveryPdf(req(), id, { renderPdf });
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, NOT_RENDERED);
  assert.equal(calls.length, 0);
});

// ── the happy path ──

test('a paid mirror reading gets the PDF, built from the row she actually read', async () => {
  const id = await seed({ paid: true, cacheKey: 'set-by-the-mirror-serve-path' });
  const key = await cacheAReading();
  const { renderPdf, calls } = stubPdf();

  const res = await serveDeliveryPdf(req(), id, { renderPdf });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.match(res.headers.get('content-disposition'), /attachment; filename="katon-.*\.pdf"/);
  // A paid artifact is per-buyer and must not sit in a shared cache.
  assert.match(res.headers.get('cache-control'), /private/);
  assert.match(res.headers.get('cache-control'), /no-store/);

  assert.equal(calls.length, 1);
  const [args] = calls;
  // THE PROSE IS THE CACHED PROSE. Not re-rendered, and not the floor computed here.
  assert.ok(args.rendered.blocks?.length, 'the builder got a rendered row');
  assert.equal(args.rendered.stage6_version, STAGE6_VERSION);
  assert.equal(args.chart.birthDate, BIRTH.birth_date);
  assert.ok(args.semanticJson.core?.archetype_name_id);

  // And the key it read is the RECOMPUTED one, not the stale column. The column said
  // `set-by-the-mirror-serve-path`; the cache was written under the engine's current
  // key, and the row was found - so the recompute is what resolved it.
  assert.notEqual(key, 'set-by-the-mirror-serve-path');
});

test('a paid mirror reading gets the card data', async () => {
  const id = await seed({ paid: true, cacheKey: 'k' });
  const res = await serveDeliveryCard(id);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.card, 'the card payload is present');
  // The card needs no render_cache row - its data is engine-derived - which is why
  // its refusal above had to come from the shared predicate rather than from a
  // missing cache row.
  assert.equal(JSON.stringify(body).includes(BIRTH.birth_time), false,
    'birth time is never returned to the client');
});

// ── the compute ceiling ──

test('the PDF endpoint is rate-limited per IP, and the limit is real', async () => {
  const id = await seed({ paid: true, cacheKey: 'k' });
  await cacheAReading();
  const { renderPdf, calls } = stubPdf();
  const limit = RATE_LIMITS.deliver_pdf.ip.limit;

  for (let i = 0; i < limit; i += 1) {
    const res = await serveDeliveryPdf(req('198.51.100.7'), id, { renderPdf });
    assert.equal(res.status, 200, `request ${i + 1} of ${limit} should pass`);
  }
  const refused = await serveDeliveryPdf(req('198.51.100.7'), id, { renderPdf });
  assert.equal(refused.status, 429);
  assert.equal((await refused.json()).error, 'rate_limited');
  assert.equal(calls.length, limit, 'a refused request must not reach the renderer');

  // A DIFFERENT IP IS NOT AFFECTED. The buyer opening her own link on a phone and a
  // laptop is the case the bucket has no session dimension for.
  const other = await serveDeliveryPdf(req('198.51.100.8'), id, { renderPdf });
  assert.equal(other.status, 200);
});

test('the rate limit sits AFTER the gate, so a refusal cannot be probed for free', async () => {
  // An unpaid caller must be refused on the gate rather than consuming the compute
  // bucket - otherwise an attacker exhausts a buyer's shared-NAT budget without ever
  // having paid.
  const id = await seed({ paid: false });
  const { renderPdf } = stubPdf();
  for (let i = 0; i < RATE_LIMITS.deliver_pdf.ip.limit + 5; i += 1) {
    const res = await serveDeliveryPdf(req('192.0.2.44'), id, { renderPdf });
    assert.equal(res.status, 402, 'still the gate, never the rate limiter');
  }
});
