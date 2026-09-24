// ============================================================
// tests/pair-pdf-route.spec.mjs — GET /api/pair/[id]/pdf, the gate
// ============================================================
// Run: npm run test:pair-pdf-route
//
// Prompt Y-3 commit 5. THE GATE, not the bytes. `renderPdf` is injected by the
// route file (the `server-only` seam), so this spec injects a stub instead and
// never builds a PDF - which is what lets it run under `--conditions=react-server`
// beside its siblings. The bytes have their own suite,
// `tests/pdf-pair-document.spec.mjs`, under plain node.
//
// THE STUB IS NOT A WEAKENING. Every assertion here is about who gets bytes and
// who does not, and a real 11-page build would make each of them a second slower
// while proving nothing extra. The one thing the stub must not hide is whether the
// handler CALLED it - so it counts, and the refusal tests assert zero calls.
// ============================================================

import assert from 'node:assert/strict';
import {
  test, beforeEach, afterEach,
} from 'node:test';

import { servePairPdf } from '../lib/pair/servePdf.js';
import { createPair, markPairPaid } from '../lib/pairStore.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { cacheKey } from '../lib/semantic/index.js';
import { writeCache, __clearMemCache } from '../lib/render/cache.js';
import { __clearMemRateLimit, RATE_LIMITS } from '../lib/ratelimit.js';
import { priceFor } from '../lib/pricing.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';

const pairMem = (globalThis.__katonPairMem ??= new Map());

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };

// ── THE REQUEST CARRIES AN IP, AND IT HAS TO ──────────────
// `deliver_pdf` declares ONLY an `ip` dimension, and `consume` skips a dimension
// whose value is absent - "a request with no resolvable client IP is a local one".
// `clientIp` reads `x-forwarded-for` and returns null without it, so a Request built
// bare is never charged and the limiter CANNOT fire. The first version of this file
// built one, and both rate-limit tests below passed while asserting nothing: one
// expected a 429 it never got, and the other proved an unpaid caller could not spend
// a budget that was not being spent at all.
const IP = { 'x-forwarded-for': '203.0.113.7' };
const request = (headers = IP) => new Request('http://localhost/api/pair/x/pdf', { headers });

let calls;
/** The injected builder. Counts, so "it refused" and "it built anyway" differ. */
const stubPdf = () => {
  calls = 0;
  return async () => {
    calls += 1;
    return { buffer: Buffer.from('%PDF-1.7\nstub\n%%EOF\n'), pageMap: {}, report: {} };
  };
};

beforeEach(() => {
  pairMem.clear();
  __clearMemCache();
  __clearMemRateLimit();
  calls = 0;
});
afterEach(() => {
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

/** The semantic JSON the handler will rebuild from the row, for the cache key. */
const semanticFor = () => buildPairSemantic(
  calculateBaziChart(A),
  calculateBaziChart(B),
);

/** Put a gate-passing reading in the cache, the way a real serve would have. */
async function seedCache() {
  const sj = semanticFor();
  const rendered = assembleFallback(sj);
  // `writeCache` takes camelCase and REFUSES without an engine version, which is
  // what makes a row servable. Written the way a real serve writes it rather than
  // hand-shaped, so a change to that contract fails here instead of drifting.
  await writeCache(cacheKey(sj), {
    ...rendered,
    engineVersion: sj.engine_version,
    source: 'gemini',
    model: 'test-model',
    promptVersion: 'testprompt00',
    stage6Version: '1.25.0',
  });
  return rendered;
}

test('an unknown id is a 404, and nothing is built', async () => {
  const res = await servePairPdf(request(), 'no-such-pair', { renderPdf: stubPdf() });
  assert.equal(res.status, 404);
  assert.equal(calls, 0);
});

test('UNPAID IS 402 AND LEAKS NOTHING DERIVED - no chart, no hanzi, no archetype', async () => {
  // X-b1 ruling 3, and the assertion is about the BODY rather than the status: a
  // 402 that carried an archetype name would still have sold the answer.
  const id = await newPair(false);
  const res = await servePairPdf(request(), id, { renderPdf: stubPdf() });

  assert.equal(res.status, 402);
  assert.equal(res.headers.get('content-type')?.includes('application/json'), true);
  const body = await res.json();
  assert.deepEqual(body, { status: 'not_paid', sku: 'compat', price: priceFor('compat') });

  const raw = JSON.stringify(body);
  assert.equal('facts' in body, false);
  assert.equal(/[一-鿿]/u.test(raw), false, 'a hanzi reached an unpaid caller');
  // Every archetype name, not just the two this pair has - a leak of the WRONG
  // name is still a leak, and naming the set makes this independent of the fixture.
  for (const entry of Object.values(GLOSSARY.arketipe)) {
    if (!entry?.name_id) continue;
    assert.equal(raw.includes(entry.name_id), false, `${entry.name_id} reached an unpaid caller`);
  }
  assert.equal(calls, 0, 'a document was built for an unpaid caller');
});

test('PAID WITH NO CACHE ROW AND A WARM THAT FLOORS IS 409 reading_not_rendered, and builds no PDF', async () => {
  // THE FLOOR CASE, which is the one this answer exists for. Rule 16 keeps floors
  // out of `render_cache`, so a reader whose render failed has no row - and she gets
  // a refusal rather than a document, because her next page load retries the
  // provider and a PDF built from a floor would be the version she keeps.
  //
  // ── RETITLED 2026-09-24: it was "and starts no render" ────
  // Since the pre-bump fix, a miss is warmed through the REAL report door
  // (`servePairReading`, the default `warm`). With no GEMINI_API_KEY here that door
  // floors, persists nothing, and the route still refuses - so this now proves the
  // floor case END TO END through the real door, not by skipping it.
  const id = await newPair(true);
  const res = await servePairPdf(request(), id, { renderPdf: stubPdf() });

  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: 'reading_not_rendered' });
  assert.equal(calls, 0);
});

test('PAID WITH A ROW IS 200 application/pdf, from the CACHED reading', async () => {
  const id = await newPair(true);
  const cached = await seedCache();

  let handed = null;
  const res = await servePairPdf(request(), id, {
    renderPdf: async (args) => {
      handed = args;
      return { buffer: Buffer.from('%PDF-1.7\nstub\n%%EOF\n') };
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(
    res.headers.get('content-disposition'),
    `attachment; filename="katon-pasangan-${id}.pdf"`,
  );
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString('latin1'), '%PDF', 'not a PDF');
  assert.equal(res.headers.get('content-length'), String(bytes.length));

  // THE DOCUMENT IS THE SERVED READING, byte for byte. This is the assertion that
  // the PDF is not a second reading: the builder is handed the CACHE ROW, not a
  // fresh render, and the blocks it gets are the ones that passed the gate.
  assert.ok(handed, 'the builder was never called');
  assert.deepEqual(handed.rendered.blocks, cached.blocks);
  assert.equal(handed.rendered.penutup, cached.penutup);
  // And both charts, rebuilt from the PAIR ROW rather than from a reading row -
  // person B has no reading and never will (ruled 2026-09-07).
  assert.equal(handed.chartA.day.stem, calculateBaziChart(A).day.stem);
  assert.equal(handed.chartB.day.stem, calculateBaziChart(B).day.stem);
  assert.equal(handed.semanticJson.kind, 'pair');
  // The two births for the cover, and nothing else about either person.
  assert.deepEqual(handed.pair, {
    a: { date: A.birthDate, gender: null },
    b: { date: B.birthDate, gender: null },
  });
});

test('THE deliver_pdf LIMITER FIRES on the N+1th call, AFTER the gate', async () => {
  const limit = RATE_LIMITS.deliver_pdf?.ip?.limit;
  assert.ok(Number.isFinite(limit) && limit > 0, 'precondition: deliver_pdf has a limit');

  const id = await newPair(true);
  await seedCache();
  const renderPdf = stubPdf();

  for (let i = 0; i < limit; i += 1) {
    const ok = await servePairPdf(request(), id, { renderPdf });
    assert.equal(ok.status, 200, `call ${i + 1} of ${limit} was refused early`);
  }
  const res = await servePairPdf(request(), id, { renderPdf });
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, 'rate_limited');
  // AFTER THE GATE, BEFORE THE WORK: the refused call built nothing, and the limit
  // is what makes rebuilding on every request affordable rather than a DoS.
  assert.equal(calls, limit, 'the rate-limited call still built a document');
});

test('AN UNPAID CALLER CANNOT SPEND THE PDF BUDGET', async () => {
  // The ordering assertion from the other side. If the limiter ran BEFORE the paid
  // gate, an unpaid caller in a loop could exhaust a paying reader's budget - which
  // is the cheap denial-of-service this endpoint would otherwise carry.
  const limit = RATE_LIMITS.deliver_pdf.ip.limit;
  const unpaid = await newPair(false);
  const renderPdf = stubPdf();
  for (let i = 0; i < limit + 2; i += 1) {
    const res = await servePairPdf(request(), unpaid, { renderPdf });
    assert.equal(res.status, 402, `call ${i + 1} changed answer`);
  }

  const paid = await newPair(true);
  await seedCache();
  const res = await servePairPdf(request(), paid, { renderPdf });
  assert.equal(res.status, 200, 'an unpaid caller drained the paid budget');
});

// ── THE PRE-BUMP BUYER (Reyner, 2026-09-24) ─────────────────
// Production, 2026-09-24: `GET /api/pair/g4WH4_9QbCrCj3Gha934q/pdf` answered
// `409 {"error":"reading_not_rendered"}` for Reyner's own paid pair. Her reading
// was cached on 09-08 under an older ENGINE_VERSION, which is hashed into the key,
// so the PDF route's read missed; only the REPORT page renders, so a buyer who
// tapped "Unduh PDF" first got JSON. Ruled: the PDF route warms the render through
// the SAME door the report page uses (`servePairReading`, which the settle path
// also warms through), then prints that cached row. No second render path.

test('A PRE-BUMP BUYER GETS A PDF: an old-engine row is warmed through the report door', async () => {
  const id = await newPair(true);
  const sj = semanticFor();
  // Her reading as it was cached BEFORE the bump: a real row, under an old key.
  const old = { ...sj, engine_version: '0.0.1-before-the-bump' };
  await writeCache(cacheKey(old), {
    ...assembleFallback(sj), engineVersion: old.engine_version, source: 'gemini',
    model: 'test-model', promptVersion: 'oldprompt000', stage6Version: '1.17.0',
  });

  // The warm door, standing in for `servePairReading`'s effect: a render that
  // passed the gate is persisted under the CURRENT key. Counted, so "warmed once"
  // and "never warmed" differ.
  let warmed = 0;
  const warm = async () => { warmed += 1; await seedCache(); };

  let handed = null;
  const res = await servePairPdf(request(), id, {
    renderPdf: async (args) => { handed = args; return { buffer: Buffer.from('%PDF-1.7\nstub\n%%EOF\n') }; },
    warm,
  });

  assert.equal(res.status, 200, 'a pre-bump buyer who taps Unduh PDF first gets a file, not 409');
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(warmed, 1, 'the report door was asked exactly once');
  assert.equal(handed.rendered.prompt_version, 'testprompt00', 'the PDF prints the WARMED current row');
});

test('A WARM THAT CACHES NOTHING (a floor) IS STILL 409, and builds nothing', async () => {
  // The floor is never persisted (rule 16), so a warm that floors leaves the cache
  // empty and the route refuses exactly as before - her next load retries.
  const id = await newPair(true);
  let warmed = 0;
  const res = await servePairPdf(request(), id, {
    renderPdf: stubPdf(),
    warm: async () => { warmed += 1; },
  });
  assert.equal(res.status, 409);
  assert.equal(warmed, 1);
  assert.equal(calls, 0);
});
