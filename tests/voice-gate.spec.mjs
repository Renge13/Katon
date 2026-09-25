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

// A typographic dash was HARD here until 1.32.0; fix (ii) normalises it instead,
// and the FIX (ii) tests below assert that.
test('D3: hanzi outside a bracket and a percentage are each HARD', () => {
  const sj = v2(A);
  for (const [sentence, check] of [
    ['Pilar harimu 丙子 berdiri tegak.', 'v2.d3_hanzi'],
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

test('D4: ranking and self_harm are HARD under v2 too (spec §4a, corrected 2026-09-24)', () => {
  const sj = v2(A);
  const ranked = validateRenderingV2(plant(draftFor(sj), 'Ini aspek terbaik yang bisa dimiliki seseorang.'), sj);
  assert.ok(checks(ranked).includes('forbidden.ranking'), JSON.stringify(checks(ranked)));
  assert.equal(ranked.ok, false);
  const harm = validateRenderingV2(plant(draftFor(sj), 'Kadang rasanya tidak ada gunanya mencoba lagi.'), sj);
  assert.ok(checks(harm).includes('forbidden.self_harm'), JSON.stringify(checks(harm)));
  assert.equal(harm.ok, false);
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

// ── FIX (i), ROUND 3: THE ARCHETYPE BRACKET IS THE ENGINE'S (1.31.0) ──
// Round 2's served v2 readings wrote "Matahari (Bing)", "Embun (Water)", and
// "Matahari (丙)" floored PZ0t on D3. The bracket now comes from
// core.archetype_name_en, before any check runs.
/** Put a sentence at the START of the first block, so it is the first prose mention. */
const lead = (draft, sentence) => {
  draft.blocks[0].text = `${sentence} ${draft.blocks[0].text}`;
  return draft;
};
const prose = (r) => [...r.normalized.blocks.map((b) => b.text), r.normalized.penutup].join('\n');

test('FIX (i): a wrong archetype bracket is replaced with core.archetype_name_en', () => {
  const sj = v2(A);
  assert.equal(sj.core.archetype_name_en, 'The Sun', 'precondition');
  const r = validateRenderingV2(lead(draftFor(sj), 'Kamu adalah Matahari (Bing), unsur Api.'), sj);
  assert.ok(prose(r).startsWith('Kamu adalah Matahari (The Sun), unsur Api.'), prose(r).slice(0, 80));
  assert.equal(prose(r).includes('(Bing)'), false);
});

test('FIX (i): a hanzi archetype bracket no longer rejects on D3 - the bracket is the engine\'s', () => {
  const sj = v2(A);
  const r = validateRenderingV2(lead(draftFor(sj), 'Kamu adalah Matahari (丙), unsur Api.'), sj);
  assert.deepEqual(checks(r), [], JSON.stringify(checks(r)));
  assert.ok(prose(r).startsWith('Kamu adalah Matahari (The Sun)'));
});

test('FIX (i): a square-bracket gloss after the archetype is replaced, not doubled; an element keeps its own', () => {
  const sj = v2(A);
  const r = validateRenderingV2(lead(draftFor(sj), 'Kamu adalah Api [Fire] dengan arketipe Matahari [Sun].'), sj);
  assert.ok(prose(r).startsWith('Kamu adalah Api [Fire] dengan arketipe Matahari (The Sun).'), prose(r).slice(0, 90));
});

test('FIX (i): a pair brackets BOTH archetypes and leaves the ruled opening untouched', () => {
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  assert.deepEqual([pj.core.a.archetype_name_en, pj.core.b.archetype_name_en], ['The Sun', 'The Mountain'], 'precondition');
  const d = draftFor(pj);
  const opening = { fact_ids: ['p0_opening'], heading: '', text: 'Ini adalah bacaan tentang dua individu: Matahari dan Gunung.' };
  const body = lead({ ...d, blocks: d.blocks.filter((b) => !(b.fact_ids || []).includes('p0_opening')) },
    'Kamu adalah Matahari (Bing). Dia adalah Gunung (戊).');
  const r = validateRenderingV2({ ...body, blocks: [opening, ...body.blocks] }, pj);
  assert.equal(r.normalized.blocks[0].text, opening.text, 'the opening is byte-identical');
  assert.ok(r.normalized.blocks[1].text.startsWith('Kamu adalah Matahari (The Sun). Dia adalah Gunung (The Mountain).'),
    r.normalized.blocks[1].text.slice(0, 90));
  assert.deepEqual(checks(r), [], JSON.stringify(checks(r)));
});

// ── FIX (ii), ROUND 3: TYPOGRAPHY IS NORMALISED, NOT REJECTED (1.32.0) ──
// Round 2: 6 of 22 v2 drafts rejected on typography, every run-2 hit U+2014, and
// chart 1 floored on it. Each character has one keyboard equivalent.
test('FIX (ii): an em-dash, en-dash, curly quotes and an ellipsis are normalised and served', () => {
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj),
    'Rasanya ‘hampir pas’—seolah selalu ada yang kurang – kata orang “nanti saja”…'), sj);
  assert.deepEqual(checks(r), [], JSON.stringify(checks(r)));
  assert.ok(prose(r).includes('Rasanya \'hampir pas\' - seolah selalu ada yang kurang - kata orang "nanti saja"...'),
    prose(r).slice(-140));
  assert.equal(/[—–‘’“”…]/u.test(prose(r)), false);
});

test('FIX (ii): a hanzi-only bracket is removed; hanzi outside a bracket still rejects', () => {
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj), 'Kamu memegang Aspek Pengelola (正財) di Pilar Kerja.'), sj);
  assert.deepEqual(checks(r), [], JSON.stringify(checks(r)));
  assert.ok(prose(r).includes('Kamu memegang Aspek Pengelola di Pilar Kerja.'), prose(r).slice(-120));
  const bare = validateRenderingV2(plant(draftFor(sj), 'Pilar harimu 丙子 berdiri tegak.'), sj);
  assert.ok(checks(bare).includes('v2.d3_hanzi'), 'hanzi outside a bracket is still D3');
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
    assert.equal(onV2.stage6_version, '1.33.0');
    const onV1 = await serve(buildSemanticJson(A, { voice: 'v1' }));
    assert.equal(onV1.source, 'module_assembly', 'v1 rejects the slang draft and floors');
  } finally {
    globalThis.fetch = prev.fetch;
    if (prev.key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev.key;
  }
});

// ── A v2 PAIR MAY CITE EITHER PERSON'S SUPPLIED MIRROR FACTS (1.30.0) ──
// The first v2 render run floored both pairs: every draft opened with a block about
// the reader citing `day_master_Fire`, a fact E2 supplies under `mirror.a`, and the
// shape check knew only the pair's own ids. The same draft still refuses under v1,
// which supplies no mirror.
test('PAIR SHAPE: a block citing a supplied mirror fact is served under v2, refused under v1', async () => {
  const prev = { fetch: globalThis.fetch, key: process.env.GEMINI_API_KEY };
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  const serve = async (sj) => {
    const d = draftFor(sj);
    const portrait = {
      fact_ids: ['day_master_Fire'], heading: 'Kamu dalam Hubungan Ini',
      text: 'Kamu adalah Matahari, dan tenagamu harus terus diisi dari luar.',
    };
    const body = { blocks: [portrait, ...d.blocks], penutup: 'Penutup yang cukup panjang untuk sebuah bacaan.' };
    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(body) }] } }],
    }), { status: 200 });
    __clearMemCache(); __clearInFlight();
    return renderReading(sj, { spendGuards: false, dedupeInFlight: false, validationRetries: 0 });
  };
  try {
    const pj2 = buildPairSemantic(A, B, { voice: 'v2' });
    assert.ok(pj2.mirror.a.facts.some((f) => f.id === 'day_master_Fire'), 'precondition: supplied under mirror.a');
    assert.ok(!pj2.facts.some((f) => f.id === 'day_master_Fire'), 'precondition: not a pair fact');
    const onV2 = await serve(pj2);
    assert.equal(onV2.source, 'gemini', JSON.stringify(onV2.attempts?.map((a) => a.error ?? a.stage6)));
    const onV1 = await serve(buildPairSemantic(A, B, { voice: 'v1' }));
    assert.equal(onV1.source, 'module_assembly');
    assert.match(String(onV1.attempts?.[0]?.error), /cites unknown fact "day_master_Fire"/);
  } finally {
    globalThis.fetch = prev.fetch;
    if (prev.key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev.key;
  }
});
