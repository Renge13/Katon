// ============================================================
// tests/pair-reading-route.spec.mjs — GET /api/pair/[id]/reading
// ============================================================
// No network and no API key. The provider is stubbed through `globalThis.fetch`,
// the pattern tests/mirror-route.spec.mjs uses, so "a cache hit makes zero
// provider calls" is asserted against a stub that THROWS if touched rather than
// against the absence of a key - which would make it vacuously true.
//
// ══ THE FLOOR IS SERVABLE NOW, AND IT WAS NOT AN HOUR AGO ══
// Reyner's 24 `kompatibilitas` cells were applied on 2026-09-08. Before that the
// floor was assembled out of `@@UNRULED: kompat_*@@` placeholders and could not
// be served at all; this file asserted the refusal. It now asserts the serve.
//
// THE TWO GUARDS THAT STOOD IN THE WAY ARE BOTH STILL ARMED, and that is what
// the last test here is for. Neither was deleted for going quiet:
//
//   1. `floorRefusalReason` - the mirror's policy, imported. It hard-failed on
//      the placeholder floor and, later, on `fact.condition_named` when
//      `p0_names` had no cell. Both causes are gone; the policy is not.
//   2. The SENTINEL guard in `lib/pair/serveReading.js`. It exists because at one
//      point the placeholder floor produced only SOFT findings, so
//      `floorRefusalReason` returned null and a paying customer would have
//      received a page of `@@UNRULED@@` at HTTP 200. It is unreachable today and
//      it is the one that guards the NEXT unruled cell.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { servePairReading } from '../lib/pair/serveReading.js';
import { createPair, getPair, markPairPaid } from '../lib/pairStore.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRendering } from '../lib/validate/index.js';
import { __clearMemCache, readCache } from '../lib/render/cache.js';
import { cacheKey, buildSemanticJson } from '../lib/semantic/index.js';
import { geminiConfigured } from '../lib/render/config.js';
import { __clearMemRateLimit, RATE_LIMITS } from '../lib/ratelimit.js';
import { priceFor } from '../lib/pricing.js';

const pairMem = (globalThis.__katonPairMem ??= new Map());

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };

const request = () => new Request('http://localhost/api/pair/x/reading');

let realFetch;
let fetchCalls;

/** Any provider call at all is a test failure. */
function stubForbiddenProvider() {
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('the provider was called when it must not have been');
  };
}

/** Every provider call fails, so the chain exhausts onto the floor. */
function stubFailingProvider() {
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response('upstream down', { status: 503 });
  };
}

beforeEach(() => {
  // A DUMMY KEY, the pattern tests/mirror-route.spec.mjs uses at its line 132.
  // Without it `geminiConfigured()` is false, the chain SKIPS the provider
  // entirely and drops straight to the floor - so a stubbed fetch is never
  // called and every 'the provider was offered X' assertion is vacuous. That is
  // exactly what happened on the first run of these two tests.
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  pairMem.clear();
  __clearMemCache();
  __clearMemRateLimit();
  realFetch = globalThis.fetch;
  fetchCalls = 0;
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
});

const newPair = async (paid = false) => {
  const id = `pair-${Math.random().toString(36).slice(2, 10)}`;
  await createPair({
    id,
    a_birth_date: A.birthDate, a_birth_time: A.birthTime, a_gender: null, a_term_side: null,
    b_birth_date: B.birthDate, b_birth_time: B.birthTime, b_gender: null, b_term_side: null,
    sku: 'compat', paid: false, email: null,
  });
  if (paid) await markPairPaid(id, new Date().toISOString());
  return id;
};

test('an unknown id is a 404', async () => {
  const res = await servePairReading(request(), 'no-such-pair');
  assert.equal(res.status, 404);
});

test('UNPAID SERVES NO PROSE, and does not even START a render', async () => {
  // Ruling 3: no Gemini render before payment. The stub throws if touched, so
  // this asserts the render was never begun rather than that its output was
  // withheld - a distinction that is the difference between a leak and a bill.
  stubForbiddenProvider();
  const id = await newPair(false);

  const res = await servePairReading(request(), id);
  assert.equal(res.status, 200);
  const body = await res.json();

  assert.equal(body.status, 'not_paid');
  assert.equal(body.sku, 'compat');
  assert.equal(body.price, priceFor('compat'));
  assert.deepEqual(Object.keys(body).sort(), ['price', 'sku', 'status']);
  assert.equal('reading' in body, false, 'no prose');
  assert.equal('facts' in body, false, 'and no facts either');

  assert.equal(fetchCalls, 0, 'THE PROVIDER WAS NEVER CALLED');
});

test('A PAID PAIR NOW SERVES A FLOOR, and there is no sentinel in it', async () => {
  // Every provider call fails, the chain exhausts onto the module-assembly
  // floor, and the floor is now built from Reyner's ruled cells - so it is
  // served rather than refused. This is the assertion that inverted when the
  // rulings landed.
  stubFailingProvider();
  const id = await newPair(true);

  const res = await servePairReading(request(), id);
  assert.equal(res.status, 200, 'served, not refused');
  const body = await res.json();

  assert.equal(body.status, 'paid');
  assert.equal(body.served_from, 'floor');
  assert.ok(body.reading.blocks.length > 0, 'there is prose');
  // NO PENUTUP, and that is the MIRROR's behaviour too rather than a pair gap:
  // `assembleFallback` returns `penutup: ""` for both kinds. The floor assembles
  // ruled glossary strings and a closing verdict is not one of them - writing one
  // would be authoring. Checked against the mirror before asserting it here.
  assert.equal(body.reading.penutup, '', 'the floor closes with nothing, as the mirror does');

  const raw = JSON.stringify(body);
  assert.ok(!raw.includes('@@UNRULED'), 'NO SENTINEL reaches the customer');
  assert.ok(fetchCalls > 0, 'and the chain really did try the provider first');
});

test('THE FLOOR PASSES STAGE 6, which is what makes it servable', async () => {
  // Pinning the CAUSE separately from the symptom, the same way this file did
  // when the cause was the opposite. Before the rulings this assertion read
  // `gate.ok === false`; it is the one line that tells a later reader which half
  // of the system changed.
  const sj = buildPairSemantic(calculateBaziChart(A), calculateBaziChart(B));
  const floor = assembleFallback(sj);

  assert.ok(!JSON.stringify(floor.blocks).includes('@@UNRULED'), 'the cells are ruled');

  const gate = validateRendering(
    { blocks: floor.blocks, penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.' },
    sj,
    { provider: 'module_assembly' },
  );
  assert.equal(gate.hard, false, 'no HARD finding');
  assert.equal(gate.ok, true, 'the floor passes the gate every output has to pass');
});

test('NO SENTINEL CAN REACH THE CLIENT, by either of two mechanisms', async () => {
  // The invariant, asserted on the OUTCOME rather than on a status code, because
  // measuring it showed the two guards fire in the opposite order to what I
  // assumed. Handing the chain a response that carries a sentinel does NOT reach
  // `serveReading.js`'s refusal: Stage 6's own `style.code_leak` rejects it
  // first, the chain regenerates, and the floor is served clean at 200.
  //
  // So the serve-boundary guard is DEFENCE IN DEPTH behind Stage 6, not the
  // first line. It is kept for the case Stage 6 cannot see - a sentinel that
  // survives the style check - and it is unreachable today. What must hold
  // either way is this: whatever the provider returns, no `@@UNRULED@@` reaches
  // the customer.
  const id = await newPair(true);
  const sj = buildPairSemantic(calculateBaziChart(A), calculateBaziChart(B));
  const poisoned = {
    blocks: assembleFallback(sj).blocks.map((b, i) => (
      i === 0 ? { ...b, text: `${b.text} @@UNRULED: kompat_fake@@` } : b
    )),
    penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.',
  };
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return Response.json({
      candidates: [{ content: { parts: [{ text: JSON.stringify(poisoned) }] }, finishReason: 'STOP' }],
    });
  };

  const res = await servePairReading(request(), id);
  const raw = await res.text();
  assert.ok(!raw.includes('@@UNRULED'), 'no sentinel in the response, whatever the status');
  assert.ok(fetchCalls > 0, 'and the poisoned response really was offered');
});

test('RULE 16: a floor is NEVER persisted', async () => {
  // `persistRendered` is the single door and refuses `module_assembly` itself.
  // A stored floor would cost a PAYING customer her real reading permanently:
  // the next request is a cache hit and the chain never runs again until
  // ENGINE_VERSION moves.
  stubFailingProvider();
  const id = await newPair(true);

  await servePairReading(request(), id);

  const sj = buildPairSemantic(calculateBaziChart(A), calculateBaziChart(B));
  assert.equal(
    await readCache(cacheKey(sj)), null,
    'nothing was written to render_cache',
  );
  // Absent rather than null: createPair's dev row never sets the column, and
  // setPairCacheKey was not called. Both are 'no cache key', and asserting the
  // falsy-ness rather than the exact value keeps this about the BEHAVIOUR.
  assert.ok(!(await getPair(id)).cache_key, 'and the row learned no cache key');
});

test('the rate-limit bucket exists and carries the mirror GET\'s dimensions', () => {
  const pair = RATE_LIMITS.pair_serve;
  assert.ok(pair, 'pair_serve exists');
  assert.deepEqual(
    Object.keys(pair).sort(),
    Object.keys(RATE_LIMITS.mirror_serve).sort(),
    'same dimensions as mirror_serve',
  );
  assert.notEqual(pair, RATE_LIMITS.mirror_serve, 'its own budget, not the mirror\'s');
});

test('the pair semantic JSON it renders is the PAIR builder\'s, not the mirror\'s', () => {
  // A WIRING assertion. If this route built a MIRROR semantic JSON from one of
  // the two charts, every other test in this file would still pass - the floor
  // would still carry placeholders, the 503 would still fire - and the endpoint
  // would be serving the wrong product's contract entirely.
  const sj = buildPairSemantic(calculateBaziChart(A), calculateBaziChart(B));
  assert.equal(sj.kind, 'pair');
  assert.ok(sj.facts.some((f) => f.id === 'p5_pull_fit'));

  // The route's 503 body is the same either way, so the discriminator is the
  // CACHE KEY: it hashes `kind`, so a mirror-shaped JSON keys differently.
  // Asserting the two keys differ is what makes 'this route builds a pair' a
  // checkable claim rather than a reading of the source.
  const mirrorish = buildSemanticJson(calculateBaziChart(A));
  assert.notEqual(cacheKey(sj), cacheKey(mirrorish));
});

test('NO PROVIDER IS CONFIGURED HERE, and that is why commit 3 is BLOCKED', () => {
  // Recorded as an assertion rather than a sentence in a PR, because it is the
  // reason a whole commit of this prompt did not land. With no GEMINI_API_KEY the
  // chain skips the provider entirely and goes straight to the floor - so no
  // Gemini output exists to show a new Stage 6 check rejecting, which is exactly
  // what prompt X-b2 requires before such a check may be cited as protection.
  // Read OUTSIDE the beforeEach's dummy key: this asks about the developer's own
  // environment, not the test harness's. `.env.local` is not loaded by plain
  // node, so a key living there does not make this true either - commit 3's real
  // render loads it explicitly.
  delete process.env.GEMINI_API_KEY;
  assert.equal(geminiConfigured(), false,
    'the TEST env never carries a real key; commit 3 loads .env.local explicitly');
});
// ── NO RAW ENGINE KEY LEAVES THE SERVER, 2026-09-08 ────────
// Reyner paid Rp 39.000 and the report printed `contrasting` and `q4` where the
// pattern badge and the quadrant name belong. The payload sent
// `semanticJson.core.pattern` / `.quadrant` and the component believed they were
// glossary names.

test('facts.pattern AND facts.quadrant ARE GLOSSARY NAMES', async () => {
  const id = `spec-names-${Date.now()}`;
  await createPair({
    id,
    a_reading_id: null,
    a_birth_date: '1989-09-13', a_birth_time: '09:00', a_gender: null, a_term_side: null,
    b_birth_date: '1990-06-07', b_birth_time: '12:00', b_gender: null, b_term_side: null,
    sku: 'compat',
  });
  await markPairPaid(id, new Date().toISOString());

  const res = await servePairReading(request(), id);
  const out = await res.json();
  assert.equal(out.status, 'paid');

  // THE ASSERTION THE PROMPT ASKED FOR, and it is a negative over the whole
  // object rather than a check on two fields: any future field that leaks a key
  // fails here too.
  const serialised = JSON.stringify(out.facts);
  assert.equal(/"(matching|related|contrasting|q[1-4])"/u.test(serialised), false,
    `a raw engine key is in facts: ${serialised.slice(0, 200)}`);

  // And they ARE the glossary's, not merely not-keys.
  const names = Object.values(GLOSSARY.kompatibilitas).map((c) => c.name_id).filter(Boolean);
  assert.ok(names.includes(out.facts.pattern), `pattern "${out.facts.pattern}" is a ruled name`);
  assert.ok(names.includes(out.facts.quadrant), `quadrant "${out.facts.quadrant}" is a ruled name`);
});
