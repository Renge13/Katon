// ============================================================
// tests/voice-gate.spec.mjs — the v2 deterministic reviewer, D1-D4 (spec §4a)
// ============================================================
// Run: npm run test:voice-gate
//
// Every case is planted into a draft that PASSES as built (the floor's own blocks,
// which cite every required point), so each red is caused by the one thing planted.
// The logged-not-gating cases assert both halves: v2 accepts it AND v1 rejects it,
// so the test fails if either gate changes behaviour.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRenderingV2 } from '../lib/validate/v2.js';
import { validateRendering } from '../lib/validate/index.js';

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });
const HOURLESS = calculateBaziChart({ birthDate: '1989-09-13', birthTime: null });

const v2 = (chart) => buildSemanticJson(chart, { voice: 'v2' });
const draftFor = (sj) => structuredClone(assembleFallback(sj));
/** Append a sentence to the first block's text. */
const plant = (draft, sentence) => {
  draft.blocks[0].text = `${draft.blocks[0].text} ${sentence}`;
  return draft;
};
const checks = (r) => r.findings.filter((f) => f.severity !== 'flag').map((f) => f.check);

test('PRECONDITION: the unplanted floor drafts pass the v2 gate, mirror AND pair', () => {
  const r = validateRenderingV2(draftFor(v2(A)), v2(A));
  assert.deepEqual(checks(r), []);
  assert.equal(r.ok, true);
  // The pair floor names the quadrant "Tarikan Kuat, Ritme Bergesek": its "Kuat"
  // is that supplied name, not an invented strength (the first run's false positive).
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  assert.deepEqual(checks(validateRenderingV2(draftFor(pj), pj)), []);
});

test('D1: a badge this chart does not carry is HARD; one it carries is not', () => {
  const sj = v2(A);
  // Chart A carries no Mata Pisau (羊刃) - it is B's badge.
  assert.equal(sj.facts.some((f) => f.label === 'Mata Pisau'), false, 'precondition');
  const bad = validateRenderingV2(plant(draftFor(sj), 'Mata Pisau di baganmu membuatmu cepat memutuskan.'), sj);
  assert.ok(checks(bad).includes('v2.d1_invented_term'), JSON.stringify(checks(bad)));
  assert.equal(bad.ok, false);
  const good = validateRenderingV2(plant(draftFor(sj), 'Bunga Persik membuat orang mengingatmu.'), sj);
  assert.equal(checks(good).includes('v2.d1_invented_term'), false, 'a supplied badge passes');
});

test('D1: Pilar Arah on an hour-less chart is invented', () => {
  const sj = v2(HOURLESS);
  const r = validateRenderingV2(plant(draftFor(sj), 'Di Pilar Arah, rencanamu terbaca jelas.'), sj);
  assert.ok(checks(r).includes('v2.d1_invented_term'));
});

test('D1: a one-word condition name opening a sentence is ordinary Indonesian, not a claim', () => {
  const sj = v2(A); // chart A is Lemah; "Kuat" would be invented mid-sentence
  const ordinary = validateRenderingV2(plant(draftFor(sj), 'Kuat atau tidak, kamu tetap berjalan.'), sj);
  assert.equal(checks(ordinary).includes('v2.d1_invented_term'), false);
  const claimed = validateRenderingV2(plant(draftFor(sj), 'Baganmu termasuk Kuat.'), sj);
  assert.ok(checks(claimed).includes('v2.d1_invented_term'));
});

test('D2: a required point no block cites is SOFT', () => {
  const sj = v2(A);
  const draft = draftFor(sj);
  const point = sj.required_points[2].fact_id;
  for (const b of draft.blocks) b.fact_ids = (b.fact_ids || []).filter((id) => id !== point);
  draft.blocks = draft.blocks.filter((b) => b.fact_ids.length > 0);
  const r = validateRenderingV2(draft, sj);
  const d2 = r.findings.find((f) => f.check === 'v2.d2_point_not_cited');
  assert.ok(d2, 'D2 fired');
  assert.equal(d2.severity, 'soft');
});

test('D3: hanzi, a typographic dash, and a percentage are each HARD', () => {
  const sj = v2(A);
  for (const [sentence, check] of [
    ['Pilar harimu 丙子 berdiri tegak.', 'v2.d3_hanzi'],
    ['Ini penting — sangat penting.', 'v2.d3_typography'],
    ['Api-mu mengisi 27,5% bagan.', 'v2.d3_score'],
  ]) {
    const r = validateRenderingV2(plant(draftFor(sj), sentence), sj);
    assert.ok(checks(r).includes(check), `${check}: ${JSON.stringify(checks(r))}`);
  }
});

test('D4: fatalism is HARD; a pair verdict is HARD', () => {
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj), 'Nasibmu sudah ditakdirkan dan tidak bisa diubah.'), sj);
  assert.ok(checks(r).some((c) => c === 'forbidden.fatalism'), JSON.stringify(checks(r)));
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  const pr = validateRenderingV2(plant(draftFor(pj), 'Kalian sangat cocok.'), pj);
  assert.ok(checks(pr).includes('v2.d4_verdict'), JSON.stringify(checks(pr)));
  // And v1's own pair.verdict still only LOGS it, so the promotion is v2's alone.
  const pj1 = buildPairSemantic(A, B, { voice: 'v1' });
  const v1r = validateRendering(plant(draftFor(pj1), 'Kalian sangat cocok.'), pj1);
  assert.equal(v1r.findings.find((f) => f.check === 'pair.verdict')?.severity, 'flag');
});

test('LOGGED, NOT GATING: a style.* hit rejects under v1 and passes under v2', () => {
  // `slang` is a style category (blocklist.json style.slang). v1 rejects it; v2
  // records it at severity `flag` and accepts - the spec's "removed from the gate".
  const sentence = 'Kamu sering ngerasa capek setelah bekerja.';
  const v1json = buildSemanticJson(A, { voice: 'v1' });
  const v1 = validateRendering(plant(draftFor(v1json), sentence), v1json);
  assert.equal(v1.ok, false, 'precondition: v1 rejects slang');
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj), sentence), sj);
  assert.equal(r.ok, true, JSON.stringify(checks(r)));
  assert.ok(r.findings.some((f) => f.check.startsWith('style.') && f.severity === 'flag'), 'but it is logged');
});

// ── THE ROUTE: a v2 JSON is judged by the v2 gate, a v1 JSON by v1's ──
// End to end through renderReading, with the provider stubbed. The same draft -
// the floor's own blocks plus one slang sentence - is ACCEPTED under v2 and floors
// under v1, so the route is proven both ways.
import { renderReading, __clearInFlight } from '../lib/render/index.js';
import { __clearMemCache } from '../lib/render/cache.js';

test('ROUTING: the same slang draft is served under v2 and floors under v1', async () => {
  const prev = { fetch: globalThis.fetch, key: process.env.GEMINI_API_KEY };
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  const slangDraft = (sj) => {
    const d = plant(draftFor(sj), 'Kamu sering ngerasa capek setelah bekerja.');
    return { blocks: d.blocks, penutup: 'Penutup yang cukup panjang untuk sebuah bacaan.' };
  };
  const serve = async (sj) => {
    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(slangDraft(sj)) }] } }],
    }), { status: 200 });
    __clearMemCache(); __clearInFlight();
    return renderReading(sj, { spendGuards: false, dedupeInFlight: false });
  };
  try {
    const onV2 = await serve(v2(A));
    assert.equal(onV2.source, 'gemini', `v2 floored: ${JSON.stringify(onV2.qa_flag)}`);
    assert.equal(onV2.stage6_version, '1.26.0');
    const onV1 = await serve(buildSemanticJson(A, { voice: 'v1' }));
    assert.equal(onV1.source, 'module_assembly', 'v1 rejects the slang draft and floors');
  } finally {
    globalThis.fetch = prev.fetch;
    if (prev.key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev.key;
  }
});
