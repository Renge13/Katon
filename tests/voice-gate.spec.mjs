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
import { GLOSSARY } from '../lib/semantic/glossary.js';

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

// ── D2's REQUIRED SET (Prompt AD amendment 1, item 2, 2026-09-26) ──
// Citation-based as before; only the set shrinks. Mirror: the three identity facts.
// Pair: p2_day_pair and p5_pull_fit. The identity ids are derived HERE from the
// facts' own provenance, never read off required_points, so the test cannot agree
// with the code by construction.
const identityIds = (sj) => [
  sj.facts.find((f) => f.provenance.kind === 'day_stem' && f.provenance.stem === sj.core.day_master),
  sj.facts.find((f) => f.provenance.kind === 'strength' && f.provenance.verdict === sj.strength.verdict),
  sj.facts.find((f) => (f.god ?? f.provenance.god) === sj.core.main_profile && f.hierarchy.role === 'spine'),
].map((f) => f.id);
/** The floor draft, citing only `keep`; blocks left citing nothing are dropped. */
const citingOnly = (sj, keep) => {
  const draft = draftFor(sj);
  for (const b of draft.blocks) b.fact_ids = (b.fact_ids || []).filter((id) => keep.includes(id));
  draft.blocks = draft.blocks.filter((b) => b.fact_ids.length > 0);
  return draft;
};
const d2Of = (r) => r.findings.filter((f) => f.check === 'v2.d2_point_not_cited').map((f) => f.where);

test('D2 (mirror): citing only the three identity facts leaves no D2 finding', () => {
  const sj = v2(A);
  const ids = identityIds(sj);
  assert.equal(new Set(ids).size, 3, 'precondition: three distinct identity facts');
  assert.ok(sj.facts.filter((f) => f.hierarchy.role === 'spine' || f.importance >= 65).length > 3,
    'precondition: the v1 set is larger than three, or this test proves nothing');
  assert.deepEqual(d2Of(validateRenderingV2(citingOnly(sj, ids), sj)), []);
});

test('D2 (mirror): the same draft without the strength fact has exactly one D2, soft, on strength', () => {
  const sj = v2(A);
  const [dm, strength, profile] = identityIds(sj);
  const r = validateRenderingV2(citingOnly(sj, [dm, profile]), sj);
  assert.deepEqual(d2Of(r), [strength]);
  assert.equal(r.findings.find((f) => f.check === 'v2.d2_point_not_cited').severity, 'soft');
});

test('D2 (pair): citing p2_day_pair and p5_pull_fit, not p3/p4, leaves no D2 finding', () => {
  const sj = buildPairSemantic(A, B, { voice: 'v2' });
  const dropped = sj.facts.filter((f) => /^p[34]_/u.test(f.id)).map((f) => f.id);
  assert.ok(dropped.includes('p4_temperament'), `precondition: ${dropped}`);
  const keep = sj.facts.map((f) => f.id).filter((id) => !dropped.includes(id));
  assert.ok(keep.includes('p2_day_pair') && keep.includes('p5_pull_fit'));
  assert.deepEqual(d2Of(validateRenderingV2(citingOnly(sj, keep), sj)), []);
});

// ── SQUARE-BRACKET GLOSSES (Prompt AD amendment 2, item 4, 2026-09-26) ──
// Post-processing, not a gate: a bound term (rule 23: archetype, Aspek, Bintang)
// gets its sanctioned round bracket; anything else loses the gloss.
const served = (r) => [...r.normalized.blocks.map((b) => b.text), r.normalized.penutup].join('\n');

test('SQUARE BRACKETS: an element or relation gloss is removed; nothing square is served', () => {
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj),
    'Kamu adalah Logam [Metal] di luar, Api [Fire] di dalam, dengan Setengah Gabungan [Half Combination].'), sj);
  const text = served(r);
  assert.equal(text.includes('['), false, text.slice(0, 200));
  assert.ok(text.includes('Kamu adalah Logam di luar, Api di dalam, dengan Setengah Gabungan.'));
});

test('SQUARE BRACKETS: a bound Aspek keeps its SANCTIONED gloss, round, even when the writer paraphrased it', () => {
  const sj = v2(A);
  assert.equal(sj.facts.find((f) => f.label === 'Aspek Pengelola')?.label_bracket, 'Direct Wealth', 'precondition');
  const r = validateRenderingV2(plant(draftFor(sj),
    'Aspek Pengelola [Direct Wealth] menjaga ritmemu, dan Bintang Penolong [Helper] datang tepat waktu.'), sj);
  const text = served(r);
  assert.ok(text.includes('Aspek Pengelola (Direct Wealth) menjaga ritmemu'), text.slice(0, 300));
  assert.ok(text.includes('Bintang Penolong (Nobleman) datang tepat waktu'));
  assert.equal(text.includes('['), false);
});

// ── factGuard ON v2 (Prompt AD amendment 2, item 3, 2026-09-26) ──
// Six truth checks hard, three voice checks logged. Each assertion names the fact.*
// check itself: D1 also catches some of these plants, and a test that passed on D1
// would pass whether or not factGuard runs.
const findingOf = (r, check) => r.findings.find((f) => f.check === check);

test('factGuard on v2: a planted strength contradiction is fact.strength_contradiction, HARD', () => {
  const sj = v2(A);
  assert.equal(sj.strength.verdict, 'weak', 'precondition');
  const draft = draftFor(sj);
  const block = draft.blocks.find((b) => (b.fact_ids || []).some((id) => id.startsWith('strength_')));
  block.text += ' Bagan kamu termasuk Kuat.';
  const f = findingOf(validateRenderingV2(draft, sj), 'fact.strength_contradiction');
  assert.ok(f, 'fired');
  assert.equal(f.severity, 'hard');
});

test('factGuard on v2: a planted invented badge is fact.badge_invented, HARD', () => {
  const sj = v2(A);
  assert.equal(sj.facts.some((f) => f.id === 'badge_驛馬'), false, 'precondition');
  const r = validateRenderingV2(plant(draftFor(sj), 'Kamu juga membawa Bintang Perantau.'), sj);
  const f = findingOf(r, 'fact.badge_invented');
  assert.ok(f, 'fired');
  assert.equal(f.severity, 'hard');
});

test('factGuard on v2: the three voice checks are LOGGED, never rejecting', () => {
  const sj = v2(A);
  const draft = draftFor(sj);
  const block = draft.blocks.find((b) => (b.fact_ids || []).some((id) => id.startsWith('strength_')));
  block.text = 'Kamu Lemah.'; // a bare label: rule 21's same-breath explanation is gone
  const r = validateRenderingV2(draft, sj);
  const voice = r.findings.filter((f) => ['fact.strength_bare_label', 'fact.strength_same_breath', 'fact.palace_dropped'].includes(f.check));
  assert.ok(voice.length > 0, 'precondition: the plant trips at least one of the three');
  for (const f of voice) assert.equal(f.severity, 'flag', `${f.check} is logged on v2`);
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

test('D4 AFTER AZ (1.64.0): fatalism and a pair verdict no longer gate; medical still does', () => {
  // THIS TEST ASSERTED THE OPPOSITE until 2026-10-01: fatalism and the pair verdict
  // were HARD on v2. Reyner lifted both ("don't be an oracle", "no fatalism" as
  // direction, "not by banning word A, B, or C"); the gate keeps three checks.
  const sj = v2(A);
  const r = validateRenderingV2(plant(draftFor(sj), 'Nasibmu sudah ditakdirkan dan tidak bisa diubah.'), sj);
  assert.equal(checks(r).includes('forbidden.fatalism'), false, JSON.stringify(checks(r)));
  assert.equal(r.ok, true, JSON.stringify(checks(r)));
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  const pr = validateRenderingV2(plant(draftFor(pj), 'Kalian sangat cocok.'), pj);
  assert.equal(checks(pr).includes('v2.d4_verdict'), false, JSON.stringify(checks(pr)));
  const pj1 = buildPairSemantic(A, B, { voice: 'v1' });
  const v1r = validateRendering(plant(draftFor(pj1), 'Kalian sangat cocok.'), pj1);
  assert.equal(v1r.findings.some((f) => f.check === 'pair.verdict'), false, 'v1 no longer logs it either');
  // A KEPT category, same plant: still HARD on v2.
  // `obat` left the ban 2026-10-02 (D1); `resep dokter` is kept.
  const med = validateRenderingV2(plant(draftFor(sj), 'Mintalah resep dokter yang tepat untukmu.'), sj);
  assert.ok(checks(med).includes('forbidden.medical'), JSON.stringify(checks(med)));
  assert.equal(med.ok, false);
});

test('D4: self_harm is HARD under v2; ranking is lifted (AZ, 1.64.0)', () => {
  const sj = v2(A);
  const ranked = validateRenderingV2(plant(draftFor(sj), 'Ini aspek terbaik yang bisa dimiliki seseorang.'), sj);
  assert.equal(checks(ranked).includes('forbidden.ranking'), false, JSON.stringify(checks(ranked)));
  assert.equal(ranked.ok, true, 'ranking is direction now, not a ban');
  // `tidak ada gunanya` left the ban 2026-10-02 (D2); the first pattern is kept.
  const harm = validateRenderingV2(plant(draftFor(sj), 'Kadang terpikir untuk menyakiti diri.'), sj);
  assert.ok(checks(harm).includes('forbidden.self_harm'), JSON.stringify(checks(harm)));
  assert.equal(harm.ok, false);
});

test('LOGGED, NOT GATING: a style.* hit rejects under v1 and passes under v2', () => {
  // A KEPT style category (style.code_leak): `slang`, which this used, was retired
  // 2026-10-01 (AZ). v1 rejects the leak; v2 records it at severity `flag` and accepts.
  const sentence = 'Kamu sering merasa lelah, nilaimu null setelah bekerja.';
  const v1json = buildSemanticJson(A, { voice: 'v1' });
  const v1 = validateRendering(plant(draftFor(v1json), sentence), v1json);
  assert.equal(v1.ok, false, 'precondition: v1 rejects the leak');
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

test('FIX (i): a square-bracket gloss after the archetype is replaced, not doubled; an element loses its own (1.37.0)', () => {
  const sj = v2(A);
  const r = validateRenderingV2(lead(draftFor(sj), 'Kamu adalah Api [Fire] dengan arketipe Matahari [Sun].'), sj);
  // Until 1.37.0 fix (i) left "Api [Fire]" as written (its scope was the archetype);
  // AD amendment 2 item 4 removes an unbound term's square gloss.
  assert.ok(prose(r).startsWith('Kamu adalah Api dengan arketipe Matahari (The Sun).'), prose(r).slice(0, 90));
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

test('ROUTING: the same leaking draft is served under v2 and floors under v1', async () => {
  // Was a slang draft; slang is retired (AZ, 1.64.0), so a kept style group routes it.
  const prev = { fetch: globalThis.fetch, key: process.env.GEMINI_API_KEY };
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  const slangDraft = (sj) => {
    const d = plant(draftFor(sj), 'Kamu sering merasa lelah, nilaimu null setelah bekerja.');
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
    assert.equal(onV2.stage6_version, '1.68.0');
    const onV1 = await serve(buildSemanticJson(A, { voice: 'v1' }));
    assert.equal(onV1.source, 'module_assembly', 'v1 rejects the leaking draft and floors');
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

// ── fact.badge_invented READS BOTH MIRRORS ON A v2 PAIR (STAGE6 1.44.0) ──
// Prompt AG item 4, an AF defect: checkBadgeInvention read only `semantic.facts`,
// which on a pair holds the pair facts. On a v2 pair each person's badges ride in
// `mirror.a` / `mirror.b`, so naming a badge the engine SUPPLIED was a hard
// fact.badge_invented (hard on v2 through V2_FACT_HARD).
test('BADGES ON A v2 PAIR: a supplied badge (either person) passes; an absent one is still invented', () => {
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  const aBadges = pj.mirror.a.facts.filter((f) => f.id.startsWith('badge_')).map((f) => f.label);
  const bBadges = pj.mirror.b.facts.filter((f) => f.id.startsWith('badge_')).map((f) => f.label);
  assert.ok(aBadges.includes('Bunga Persik'), `precondition: A carries Bunga Persik (${aBadges})`);
  assert.ok(bBadges.includes('Mata Pisau'), `precondition: B carries Mata Pisau (${bBadges})`);
  for (const sentence of ['Bunga Persik membuat orang mengingatmu.', 'Mata Pisau-nya membuatnya cepat memutuskan.']) {
    const r = validateRenderingV2(plant(draftFor(pj), sentence), pj);
    assert.equal(r.findings.some((f) => f.check === 'fact.badge_invented'), false, `${sentence} -> ${JSON.stringify(checks(r))}`);
  }
  // A badge neither person carries still fires, so the test can fail the other way.
  // Every SUPPLIED label, not only badge_* ids: Tanda Kekosongan rides on a void_* fact.
  const all = new Set([...pj.facts, ...pj.mirror.a.facts, ...pj.mirror.b.facts].map((f) => f.label));
  const absent = Object.values(GLOSSARY.bintang).map((e) => e.name_id).find((n) => n && !all.has(n));
  assert.ok(absent, 'precondition: some glossary badge is carried by neither person');
  const bad = validateRenderingV2(plant(draftFor(pj), `${absent} membuatmu gelisah.`), pj);
  assert.ok(bad.findings.some((f) => f.check === 'fact.badge_invented' && f.severity === 'hard'),
    `${absent}: ${JSON.stringify(bad.findings.map((f) => `${f.severity} ${f.check}`))}`);
});

// ── fact.element_dominance IS HARD ON v2 (STAGE6 1.46.0, Prompt AG item 1) ──
// Main's 1.41.0 check lives in factGuard; v2 downgrades every factGuard id to a
// flag unless it is in V2_FACT_HARD. A truth check that only logs on the voice
// that launches would not be the ruled "hard deterministic checks on v1 and v2".
test('ELEMENT DOMINANCE IS HARD ON v2: seed-S3 on a v2 mirror rejects', () => {
  const sj = v2(A);
  assert.ok(sj.facts.some((f) => f.id === 'element_missing_Wood'), 'precondition: no Kayu');
  const r = validateRenderingV2(plant(draftFor(sj), 'Di baganmu, Kayu adalah unsur yang paling banyak.'), sj);
  const f = r.findings.find((x) => x.check === 'fact.element_dominance');
  assert.ok(f, JSON.stringify(r.findings.map((x) => x.check)));
  assert.equal(f.severity, 'hard');
  assert.equal(r.ok, false);
});

// ── NO NESTED BRACKETS (STAGE6 1.51.0, Prompt AJ §3) ──
// Round 4 served "Sebagai Kayu (Bambu (The Bamboo))" and "Sebagai Logam (Besi Tempa
// (The Forge))": the writer put the archetype in parentheses after the element, and
// the insertion bracketed that mention anyway. Cowork's ruling: never insert on an
// archetype mention already inside parentheses; bracket the first BARE mention; if
// there is none, insert nothing (the cover already shows the English name).
import NESTED from './fixtures/voice-v2-round4-nested-brackets.json' with { type: 'json' };

const NESTED_RE = /\([^()]*\([^()]*\)[^()]*\)/u;
for (const c of NESTED.cases) {
  test(`NO NESTED BRACKET: ${c.subject}'s round-4 draft, verbatim`, () => {
    assert.ok(NESTED_RE.test(c.served_text), 'precondition: the fixture records the served defect');
    const sj = buildSemanticJson(calculateBaziChart(c.inputs.a), { voice: 'v2' });
    // THE DRAFT BLOCK ALONE. Padding it with the floor's blocks made this pass on the
    // defect: the floor's identity line already carries "(The Bamboo)", so the
    // insertion saw the bracket present and inserted nothing. Only the normalised
    // text is read here, so the gate's verdict on a one-block draft does not matter.
    const draft = { blocks: [{ fact_ids: c.fact_ids, heading: 'x', text: c.draft_text }], penutup: '' };
    const out = validateRenderingV2(draft, sj);
    const served = out.normalized.blocks[0].text;
    assert.equal(NESTED_RE.test(served), false, `nested bracket served: ${served.slice(0, 80)}`);
    const name = sj.core.archetype_name_id;
    assert.ok(served.includes(`(${name})`), 'the writer\'s own parenthesis is kept as written');
  });
}

test('NO NESTED BRACKET: the English goes on the first BARE mention, and nowhere when there is none', () => {
  const sj = v2(A);
  const name = sj.core.archetype_name_id;
  const en = sj.core.archetype_name_en;
  const withBare = draftFor(sj);
  withBare.blocks[0].text = `Sebagai Api (${name}), kamu hangat. ${name} menerangi sekitarmu.`;
  const t1 = validateRenderingV2(withBare, sj).normalized.blocks[0].text;
  assert.ok(t1.includes(`${name} (${en}) menerangi`), t1.slice(0, 120));
  assert.equal(NESTED_RE.test(t1), false);
  const onlyInside = draftFor(sj);
  onlyInside.blocks = onlyInside.blocks.map((b) => ({ ...b, text: b.text.split(name).join('dia') }));
  onlyInside.blocks[0].text = `Sebagai Api (${name}), kamu hangat.`;
  const out = validateRenderingV2(onlyInside, sj);
  const all = out.normalized.blocks.map((b) => b.text).join(' ');
  assert.equal(all.includes(`(${en})`), false, 'inserted on a mention inside parentheses');
});

// ── POST-PROCESSING NEVER NESTS A BRACKET (STAGE6 1.59.0, AS Amendment 1 §B) ──
// r5-05 was SERVED with "(Aspek Penantang (Seven Killings))" and three more. The
// writer put the Indonesian name in parentheses and its English in square brackets;
// brackets.square_normalised made the square gloss round INSIDE the open parenthesis.
// Cowork's ruling: a square gloss being normalised inside an open parenthesis is
// removed with its content, never converted. The fixture is that draft, verbatim.
import NESTING_R5 from './fixtures/bracket-nesting-r5-05.json' with { type: 'json' };

const NESTED_ANY = /\([^()]*\([^()]*\)[^()]*\)/gu;
const servedText = (out) => [...out.normalized.blocks.map((b) => b.text), out.normalized.penutup || ''].join('\n');

test('NO NESTED BRACKET: r5-05\'s served text, reproduced from its draft, verbatim', () => {
  assert.equal(NESTING_R5.served_nested.length, 4, 'precondition: the fixture records the four served nests');
  const sj = buildSemanticJson(calculateBaziChart(NESTING_R5.inputs), { voice: 'v2' });
  const out = validateRenderingV2(withEngineOpening(NESTING_R5.draft, sj).rendered, sj);
  const nests = servedText(out).match(NESTED_ANY) || [];
  assert.deepEqual(nests, [], `nested brackets served: ${nests.join(' ')}`);
  // The writer's own parenthesis stays, without the English that would have nested.
  assert.ok(servedText(out).includes('(Aspek Penantang)'), 'the parenthesis is kept as written, minus the gloss');
});

test('NO NESTED BRACKET CONTROL: a BARE square gloss after a supplied Aspek still becomes round', () => {
  const sj = buildSemanticJson(calculateBaziChart(NESTING_R5.inputs), { voice: 'v2' });
  const draft = draftFor(sj);
  draft.blocks[0].text += ' Aspek Penantang [Seven Killings] menetap di Pilar Kerja.';
  const t = validateRenderingV2(draft, sj).normalized.blocks[0].text;
  assert.ok(t.includes('Aspek Penantang (Seven Killings) menetap'), t.slice(-120));
});

test('NO NESTED BRACKET: an archetype square gloss inside a parenthesis is removed, not converted', () => {
  const sj = v2(A);
  const name = sj.core.archetype_name_id;
  const draft = draftFor(sj);
  draft.blocks[0].text = `Sebagai Api (${name} [${sj.core.archetype_name_en}]), kamu hangat. ${name} menerangi sekitarmu.`;
  const t = validateRenderingV2(draft, sj).normalized.blocks[0].text;
  assert.equal(NESTED_ANY.test(t), false, t.slice(0, 120));
  NESTED_ANY.lastIndex = 0;
  assert.ok(t.startsWith(`Sebagai Api (${name}),`), t.slice(0, 120));
});

test('NO NESTED BRACKET on v1: insertBrackets skips a mention inside parentheses for the next bare one', () => {
  const sj = buildSemanticJson(A);
  const aspek = sj.facts.find((f) => f.label === 'Aspek Pengelola');
  assert.ok(aspek?.label_bracket, 'precondition: chart 1 supplies Aspek Pengelola');
  const draft = draftFor(sj);
  const block = draft.blocks.find((b) => b.fact_ids.includes(aspek.id));
  // Strip the floor's own bracketed mentions so the insertion has work to do.
  draft.blocks = draft.blocks.map((b) => ({ ...b, text: b.text.split(`${aspek.label} (${aspek.label_bracket})`).join(aspek.label) }));
  const idx = draft.blocks.indexOf(draft.blocks.find((b) => b.fact_ids.includes(aspek.id)));
  draft.blocks[idx] = { ...block, text: `Kamu pengatur (${aspek.label}) yang rapi. ${aspek.label} menjaga semuanya.` };
  const out = validateRendering(draft, sj);
  const t = out.normalized.blocks[idx].text;
  assert.equal(/\([^()]*\([^()]*\)[^()]*\)/u.test(t), false, t);
  assert.ok(t.includes(`${aspek.label} (${aspek.label_bracket}) menjaga`), t);
});

// ── A SUPPLIED TERM WRITTEN WITH "dan" FOR ITS COMMA IS THAT TERM (STAGE6 1.53.0, AK §1) ──
// rVe4ca floored in round 4b and in the AJ §2 measurement. One cause: the writer
// wrote the supplied quadrant name "Tarikan Kuat, Ritme Seirama" as "Tarikan Kuat
// dan Ritme Seirama", the mask no longer matched it, and D1 rejected the bare "Kuat"
// as an invented strength term. Cowork's ruling: normalise it to the ruled spelling
// and LOG it, never reject it - for terms the engine supplied for this reading only.
import D1_MISFIRES from './fixtures/voice-v2-d1-misfires.json' with { type: 'json' };

const rVe = () => buildPairSemantic(
  calculateBaziChart(D1_MISFIRES.inputs.a), calculateBaziChart(D1_MISFIRES.inputs.b), { voice: 'v2' },
);
const danBlock = D1_MISFIRES.blocks.find((b) => b.text.includes('Tarikan Kuat dan Ritme Seirama'));

test('THE REJECTION LINE THIS IS ABOUT: D1 said "Kuat" (kekuatan) was invented', () => {
  assert.ok(D1_MISFIRES.rejections.some((r) => r.message.startsWith('"Kuat" (kekuatan) appears in the prose')));
  assert.ok(danBlock, 'the draft block behind it is in the fixture');
});

test('"Tarikan Kuat dan Ritme Seirama" IS THE SUPPLIED "Tarikan Kuat, Ritme Seirama": normalised and logged, not rejected', () => {
  const sj = rVe();
  assert.ok(sj.facts.some((f) => f.label === 'Tarikan Kuat, Ritme Seirama'), 'precondition: the engine supplies it');
  const draft = draftFor(sj);
  draft.blocks = [{ fact_ids: danBlock.fact_ids, heading: 'x', text: danBlock.text }, ...draft.blocks];
  const out = validateRenderingV2(draft, sj);
  assert.equal(out.findings.some((f) => f.check === 'v2.d1_invented_term' && f.message.startsWith('"Kuat"')), false,
    JSON.stringify(out.findings.filter((f) => f.check === 'v2.d1_invented_term').map((f) => f.message)));
  assert.ok(out.normalized.blocks[0].text.includes('Tarikan Kuat, Ritme Seirama'), 'served in the ruled spelling');
  assert.equal(out.normalized.blocks[0].text.includes('Tarikan Kuat dan Ritme Seirama'), false);
  const log = out.findings.find((f) => f.check === 'terms.normalised');
  assert.ok(log && log.severity === 'flag', 'logged as normalised, at flag');
});

test('ONLY SUPPLIED TERMS: a "dan" spelling of a quadrant this reading was NOT given is not normalised', () => {
  const sj = rVe();
  const other = 'Tarikan Tenang, Ritme Bergesek';
  assert.equal(sj.facts.some((f) => f.label === other), false, 'precondition');
  const draft = draftFor(sj);
  draft.blocks[0].text = `${draft.blocks[0].text} Hubungan kalian memiliki Tarikan Tenang dan Ritme Bergesek.`;
  const out = validateRenderingV2(draft, sj);
  assert.ok(out.normalized.blocks[0].text.includes('Tarikan Tenang dan Ritme Bergesek'), 'left as written');
});

// ── D1 IN A HEADING: TITLE CASE IS NOT A TERM CLAIM (STAGE6 1.54.0, Prompt AL §1) ──
// Headings are title case, so a capital letter there is not evidence of a term.
// PZ0t (round 4c) was rejected for "Kuat" in the heading "Tarikan Kuat dan
// Perbedaan Sudut Pandang"; rVe4ca (round 4b) for "Berseberangan" in "Perspektif
// yang Berseberangan". Neither term was anywhere in the prose. Cowork's ruling: in
// a heading, D1 fires only on a complete MULTI-WORD glossary term name the engine
// did not supply. Prose is unchanged.
import D1_HEADINGS from './fixtures/voice-v2-d1-heading-misfires.json' with { type: 'json' };

const pairOf = (c) => buildPairSemantic(calculateBaziChart(c.inputs.a), calculateBaziChart(c.inputs.b), { voice: 'v2' });
const d1Terms = (r) => r.findings.filter((f) => f.check === 'v2.d1_invented_term').map((f) => /^"([^"]+)"/u.exec(f.message)[1]);
const withHeading = (sj, heading) => {
  const draft = draftFor(sj);
  draft.blocks[draft.blocks.length - 1].heading = heading;
  return draft;
};

test('THE REJECTION LINES THIS IS ABOUT: both are single-word terms, both from a heading only', () => {
  assert.deepEqual(D1_HEADINGS.cases.map((c) => c.source.split('/')[2]), ['round4c', 'round4b']);
  for (const c of D1_HEADINGS.cases) {
    assert.ok(c.rejection.startsWith(`"${c.term}" (`), c.rejection);
    assert.equal(c.term.includes(' '), false, 'a single-word term');
  }
});

for (const c of D1_HEADINGS.cases) {
  test(`HEADING "${c.heading}": no D1 on the single word "${c.term}"`, () => {
    const sj = pairOf(c);
    assert.ok(checks(validateRenderingV2(draftFor(sj), sj)).length === 0, 'precondition: the floor draft passes');
    const r = validateRenderingV2(withHeading(sj, c.heading), sj);
    assert.equal(d1Terms(r).includes(c.term), false, JSON.stringify(d1Terms(r)));
  });

  test(`PROSE IS UNCHANGED: "${c.heading}" mid-sentence still rejects "${c.term}"`, () => {
    const sj = pairOf(c);
    const r = validateRenderingV2(plant(draftFor(sj), `Bagian ini tentang ${c.heading}.`), sj);
    assert.ok(d1Terms(r).includes(c.term), JSON.stringify(d1Terms(r)));
  });
}

test('CONTROL: a heading carrying a complete multi-word glossary term the engine did not supply still rejects', () => {
  const c = D1_HEADINGS.cases[0];
  const sj = pairOf(c);
  const supplied = new Set([
    ...sj.facts, ...(sj.mirror?.a?.facts || []), ...(sj.mirror?.b?.facts || []),
  ].flatMap((f) => [f.label, f.palace]).filter(Boolean));
  // Picked by script, from the sections D1 reads (lib/validate/v2.js termUniverse).
  const term = ['aspek', 'bintang', 'kekuatan', 'relasi_cabang', 'pilar', 'kompatibilitas']
    .flatMap((s) => Object.entries(GLOSSARY[s] || {}).filter(([k]) => !k.startsWith('_')).map(([, cell]) => cell?.name_id))
    .find((name) => name && name.includes(' ') && ![...supplied].some((s) => s.includes(name) || name.includes(s)));
  assert.ok(term, 'there is an unsupplied multi-word term to plant');
  const r = validateRenderingV2(withHeading(sj, `Tentang ${term}`), sj);
  assert.ok(d1Terms(r).includes(term), `${term}: ${JSON.stringify(d1Terms(r))}`);
  assert.equal(r.ok, false);
});

// ── THE CLOSING HEDGE IS DROPPED, DETERMINISTICALLY (STAGE6 1.55.0, Prompt AL §2) ──
// Reyner's B33 ("remove it"), recorded as B35: the prompt route was tried twice
// (B31, B33) and "Mungkin menarik" stayed. If a block's (or the penutup's) FINAL
// sentence begins "Mungkin menarik untuk" or "Menarik untuk", that sentence is
// dropped, provided one sentence remains. Nothing is added or rewritten. The gate
// re-runs on the result; if a check that rejects would newly fail, the sentence is
// kept (`close.hedge_kept`). v2 only.
import HEDGES from './fixtures/voice-v2-closing-hedges.json' with { type: 'json' };
import { withEngineOpening } from '../lib/render/pairOpening.js';

const semanticOf = (rec) => (rec.kind === 'pair'
  ? buildPairSemantic(calculateBaziChart(rec.inputs.a), calculateBaziChart(rec.inputs.b), { voice: 'v2' })
  : buildSemanticJson(calculateBaziChart(rec.inputs.a), { voice: 'v2' }));
const logOf = (r, check) => r.findings.filter((f) => f.check === check);

test('THE FIVE ROUND-4c CLOSES THIS IS ABOUT: each is the final sentence of a penutup', () => {
  assert.deepEqual(HEDGES.readings.map((r) => r.source.split('/').at(-1)).sort(),
    ['PZ0t_B3YDnzdXc2LWV38D-v2.json', 'chart13-v2.json', 'chart4-v2.json', 'chart6-v2.json', 'chart8-v2.json']);
  for (const r of HEDGES.readings) {
    assert.deepEqual(r.closes.map((c) => c.where), ['penutup']);
    assert.ok(r.rendered.penutup.trimEnd().endsWith(r.closes[0].sentence));
  }
});

for (const rec of HEDGES.readings) {
  const name = rec.source.split('/').at(-1);
  test(`${name}: the closing hedge is dropped and nothing else in the penutup moves`, () => {
    const sj = semanticOf(rec);
    const r = validateRenderingV2(withEngineOpening(structuredClone(rec.rendered), sj).rendered, sj);
    const { sentence } = rec.closes[0];
    const before = rec.rendered.penutup;
    const expected = before.slice(0, before.lastIndexOf(sentence)).trimEnd();
    assert.equal(r.normalized.penutup, expected);
    const dropped = logOf(r, 'close.hedge_dropped');
    assert.equal(dropped.length, 1);
    assert.equal(dropped[0].severity, 'flag');
    assert.ok(dropped[0].message.includes(sentence));
  });
}

test('MID-BLOCK: the phrase opening a sentence that is not the last is left alone and logged', () => {
  const sj = v2(A);
  const draft = draftFor(sj);
  const penutup = 'Mungkin menarik untuk melihat pola ini lebih dekat. Arahmu sudah cukup jelas.';
  draft.penutup = penutup;
  const r = validateRenderingV2(draft, sj);
  assert.equal(r.normalized.penutup, penutup);
  assert.equal(logOf(r, 'close.hedge_dropped').length, 0);
  assert.equal(logOf(r, 'close.hedge_midblock').length, 1);
});

test('A LONE SENTENCE: a block that is only the hedge keeps it, because one sentence must remain', () => {
  const sj = v2(A);
  const draft = draftFor(sj);
  draft.penutup = 'Menarik untuk melihat bagaimana ini berkembang.';
  const r = validateRenderingV2(draft, sj);
  assert.equal(r.normalized.penutup, draft.penutup);
  assert.equal(logOf(r, 'close.hedge_dropped').length, 0);
});

test('KEPT: when dropping the hedge would make a rejecting check fail, the sentence stays (close.hedge_kept)', () => {
  // The example check is `pair.both_named` since 2026-10-02: it used to be
  // `pair.reframe_missing`, which A4 removed (STAGE6 1.66.0).
  const sj = buildPairSemantic(A, B, { voice: 'v2' });
  const { archetype_name_id: nameA } = sj.core.a;
  const { archetype_name_id: nameB } = sj.core.b;
  const draft = draftFor(sj);
  const idx = 0;
  // Both names live ONLY in the final, hedged sentence of the opening block.
  const text = `Kalian berdua sama-sama cepat membaca suasana. Mungkin menarik untuk melihat bahwa ${nameA} dan ${nameB} saling melengkapi.`;
  draft.blocks[idx].text = text;
  const r = validateRenderingV2(draft, sj);
  assert.equal(r.normalized.blocks[idx].text.includes(nameA) && r.normalized.blocks[idx].text.includes(nameB), true, 'the hedged sentence is kept');
  assert.equal(r.findings.some((f) => f.check === 'pair.both_named'), false, 'the kept reading names both');
  assert.equal(logOf(r, 'close.hedge_kept').length, 1);
  assert.equal(logOf(r, 'close.hedge_dropped').length, 0);
});

test('v1 IS UNTOUCHED: the v1 gate drops nothing and logs no close.* line', () => {
  const rec = HEDGES.readings[0];
  const sj = rec.kind === 'pair'
    ? buildPairSemantic(calculateBaziChart(rec.inputs.a), calculateBaziChart(rec.inputs.b))
    : buildSemanticJson(calculateBaziChart(rec.inputs.a));
  const r = validateRendering(withEngineOpening(structuredClone(rec.rendered), sj).rendered, sj);
  assert.equal(r.findings.some((f) => f.check.startsWith('close.')), false);
});

// ── ASPEK AT A NAMED PILLAR (STAGE6 1.56.0, Prompt AO §2; Reyner's AN ruling) ──
// "Aspek <X> ... di Pilar <Y>" (and lists, "di Pilar Kerja dan Pilar Diri") must match
// where the engine places X for the person it is about - a pillar is right if ANY stem
// or hidden stem there carries X (aspekOccurrences, lib/semantic/facts.js). Subject:
// the reader on a mirror; on a pair, "-mu" on the Aspek name is A, "-nya" or "dia" is
// B, otherwise it does not fire and is logged (fact.aspek_pillar_unattributed).
// Literals extracted by scripts/extract-aspek-pillar-fixture.mjs from served JSON.
import ASPEK_PILLAR from './fixtures/voice-v2-aspek-pillar.json' with { type: 'json' };

const caseOf = (role) => ASPEK_PILLAR.cases.filter((c) => c.role === role);
const pairSj = (c, voice) => buildPairSemantic(calculateBaziChart(c.inputs.a), calculateBaziChart(c.inputs.b), { voice });
const aspekHard = (r) => r.findings.filter((f) => f.check === 'fact.aspek_pillar' && f.severity !== 'flag');

test('ASPEK@PILLAR: the round-4d served sentence ("Aspek Pengelola-mu ... Pilar Kerja dan Pilar Diri") is HARD on a v2 pair', () => {
  const [c] = caseOf('reject');
  const sj = pairSj(c, 'v2');
  const r = validateRenderingV2(plant(draftFor(sj), c.sentence), sj);
  const hits = aspekHard(r);
  assert.equal(hits.length, 1, JSON.stringify(r.findings.filter((f) => f.check.startsWith('fact.aspek'))));
  assert.match(hits[0].message, /Pilar Diri/u);
  assert.equal(r.ok, false);
});

// ── FALSE FOR BOTH PEOPLE IS FALSE WHOEVER IT IS ABOUT (STAGE6 1.57.0, Prompt AP §3) ──
// Cowork's technical ruling, inside Reyner's AN ruling: a no-marker claim that matches
// NEITHER person's placement is rejected; true for one and false for the other, it is
// still only logged, because there is no way to know which person is meant.
test('ASPEK@PILLAR: the no-possessive an2 run-1 claim is false for BOTH people, so it is HARD', () => {
  const [c] = caseOf('log');
  const sj = pairSj(c, 'v2');
  const r = validateRenderingV2(plant(draftFor(sj), c.sentence), sj);
  const hits = aspekHard(r);
  assert.equal(hits.length, 1, JSON.stringify(r.findings.filter((f) => f.check.startsWith('fact.aspek'))));
  assert.match(hits[0].message, /both/u);
  assert.equal(r.findings.some((f) => f.check === 'fact.aspek_pillar_unattributed'), false);
});

test('ASPEK@PILLAR: a no-possessive claim true for ONE person (round 4c) is still only LOGGED', () => {
  const [c] = caseOf('one-true');
  const sj = pairSj(c, 'v2');
  const r = validateRenderingV2(plant(draftFor(sj), c.sentence), sj);
  assert.equal(aspekHard(r).length, 0);
  const log = r.findings.filter((f) => f.check === 'fact.aspek_pillar_unattributed');
  assert.equal(log.length, 1);
  assert.equal(log[0].severity, 'flag');
});

test('ASPEK@PILLAR CONTROL: chart1\'s true served sentences pass on both voices', () => {
  const chart = calculateBaziChart(caseOf('control')[0].inputs.a);
  for (const voice of ['v1', 'v2']) {
    const sj = buildSemanticJson(chart, { voice });
    let draft = draftFor(sj);
    for (const c of caseOf('control')) draft = plant(draft, c.sentence);
    const r = (voice === 'v2' ? validateRenderingV2 : validateRendering)(draft, sj);
    assert.deepEqual(r.findings.filter((f) => f.check.startsWith('fact.aspek')), [], voice);
  }
});

test('ASPEK@PILLAR on a MIRROR: a false pillar is HARD on both voices, a true one passes', () => {
  // A: Aspek Pengelola sits at Pilar Kerja only (the 辛 hidden in 酉).
  for (const voice of ['v1', 'v2']) {
    const sj = buildSemanticJson(A, { voice });
    const gate = voice === 'v2' ? validateRenderingV2 : validateRendering;
    assert.equal(aspekHard(gate(plant(draftFor(sj), 'Aspek Pengelola-mu terlihat di Pilar Diri.'), sj)).length, 1, voice);
    assert.equal(aspekHard(gate(plant(draftFor(sj), 'Aspek Pengelola-mu terlihat di Pilar Kerja.'), sj)).length, 0, voice);
  }
});

test('ASPEK@PILLAR on a v2 PAIR: "-nya" is B (Pengelola at Pilar Diri only)', () => {
  const sj = buildPairSemantic(A, B, { voice: 'v2' });
  assert.equal(aspekHard(validateRenderingV2(plant(draftFor(sj), 'Aspek Pengelola-nya menonjol di Pilar Kerja.'), sj)).length, 1);
  assert.equal(aspekHard(validateRenderingV2(plant(draftFor(sj), 'Aspek Pengelola-nya menonjol di Pilar Diri.'), sj)).length, 0);
});

// ── THE FONDASI OCCUPANT IS A SUPPLIED TERM (STAGE6 1.60.0, Prompt AU §4, CHECK 3) ──
// The engine supplies what sits in the Fondasi Pasangan as spouse_palace.seat_content,
// and the writer payload carries it. D1's supplied list read fact labels and palaces
// only, so on a chart whose occupant has no fact of its own (chart 12: 食神, Aspek
// Perajin) naming it was rejected as invented. That was the one chart of 13 where the
// AS §4 fold tripped D1.
const D1 = (r) => r.findings.filter((f) => f.check === 'v2.d1_invented_term').map((f) => f.message);

test('D1: the Fondasi occupant the engine supplies is not an invented term (chart 12, Aspek Perajin)', () => {
  const sj = v2(calculateBaziChart({ birthDate: '1990-06-07', birthTime: '12:00' }));
  const sp = sj.facts.find((f) => f.id === 'spouse_palace');
  assert.equal(sp.seat_content?.label, 'Aspek Perajin', 'precondition: the engine seats Aspek Perajin there');
  assert.equal(sj.facts.some((f) => f.label === 'Aspek Perajin'), false, 'precondition: no fact of its own');
  assert.deepEqual(D1(validateRenderingV2(plant(draftFor(sj), 'Di fondasi ini ada Aspek Perajin.'), sj)), []);
});

test('D1 CONTROL: an Aspek the engine supplies nowhere is still invented (chart 12, Aspek Pelindung)', () => {
  const sj = v2(calculateBaziChart({ birthDate: '1990-06-07', birthTime: '12:00' }));
  assert.equal(JSON.stringify(sj).includes('Aspek Pelindung'), false, 'precondition: not supplied anywhere');
  assert.equal(D1(validateRenderingV2(plant(draftFor(sj), 'Di fondasi ini ada Aspek Pelindung.'), sj)).length, 1);
});

// ── ROUND 6: A FOLDED RELATIONS BLOCK IS READ SENTENCE BY SENTENCE (Prompt AT §2, checks vs folding) ──
// fact.relation_positions read the WHOLE block for every relation it cites. Folded
// ("Weave them into one story"), a block cites several relations, so a pillar named for
// one was charged to all the others, and "hari-harimu" (her days) read as the day
// pillar. Loosened, not widened: in a block citing more than one relation, a relation is
// judged only on the sentences that NAME it. A partial list in such a sentence still
// rejects: the check keeps guarding the false statement.
const foldedDraft = (sj, extra = '') => {
  const rels = sj.facts.filter((f) => ['branch_relation', 'punishment'].includes(f.provenance?.kind));
  const d = draftFor(sj);
  d.blocks = d.blocks.filter((b) => !b.fact_ids.some((id) => rels.some((r) => r.id === id)));
  const names = rels.map((r) => r.label);
  d.blocks.push({
    fact_ids: rels.map((r) => r.id), heading: 'Tarikan sehari-hari',
    text: `Hari-harimu jarang berjalan satu arah. ${names.slice(0, -1).join(', ')} dan ${names.at(-1)} bergerak bersamaan, sehingga satu urusan sering menarik urusan lain. Yang membantu: selesaikan satu hal sebelum membuka yang berikutnya.${extra}`,
  });
  d.penutup = 'Kamu membawa ketenangan yang jarang dimiliki orang lain.';
  return d;
};
const positionFindings = (r) => r.findings.filter((f) => f.check === 'fact.relation_positions').map((f) => f.message);

test('ROUND 6 FOLDING: relations named in passing, none located, is not a dropped position', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '2001-02-14', birthTime: '13:00' }), { voice: 'v2' });
  assert.deepEqual(positionFindings(validateRenderingV2(foldedDraft(sj), sj)), []);
});

test('ROUND 6 FOLDING: one relation located with its full positions_id does not charge the others', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '1995-06-01', birthTime: '06:00' }), { voice: 'v2' });
  const benturan = sj.facts.find((f) => f.label === 'Benturan');
  assert.ok(benturan, 'precondition: chart 4 carries a Benturan');
  const d = foldedDraft(sj, ` Benturan terasa di antara ${benturan.provenance.positions_id}.`);
  assert.deepEqual(positionFindings(validateRenderingV2(d, sj)), []);
});

test('ROUND 6 FOLDING CONTROL: a folded sentence giving a relation PART of its pillars still rejects', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '2001-02-14', birthTime: '13:00' }), { voice: 'v2' });
  // Benturan spans [month, day]; this sentence gives only Pilar Kerja.
  const r = validateRenderingV2(foldedDraft(sj, ' Benturan terasa paling keras di Pilar Kerja.'), sj);
  const hits = positionFindings(r);
  assert.equal(hits.length, 1, hits.join(' | '));
  assert.match(hits[0], /relation_冲_寅申 .*dropping \[day\]/u);
  assert.equal(r.ok, false, 'a false partial span is still HARD');
});

test('ROUND 6: on v2 a relation\'s English is an unsanctioned bracket, an Aspek\'s is not', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '2001-02-14', birthTime: '13:00' }), { voice: 'v2' });
  const draft = draftFor(sj);
  // Not directly after a relation's name, so the mirror's strip (1.62.0) leaves it for
  // this logged rule to see: the two cover different positions.
  draft.penutup = 'Hari-harimu sering terasa seperti tabrakan kecil (Clash), dan Aspek Penantang (Seven Killings) menjaga langkahmu.';
  const r = validateRenderingV2(draft, sj);
  const hits = r.findings.filter((f) => f.check === 'style.unsanctioned_bracket').map((f) => f.message);
  assert.ok(hits.some((m) => m.includes('(Clash)')), `relation English not flagged: ${hits.join(' | ')}`);
  assert.equal(hits.some((m) => m.includes('(Seven Killings)')), false, 'an Aspek bracket stays sanctioned');
  // Logged, never rejecting: style is a flag on v2.
  assert.ok(r.findings.filter((f) => f.check === 'style.unsanctioned_bracket').every((f) => f.severity === 'flag'));
});

// ── RELATIONS CARRY NO ENGLISH: THE MECHANICAL STRIP (STAGE6 1.62.0, Prompt AV §2 item 3) ──
// Reyner, 2026-09-30: English brackets on Arketipe, Aspek and Bintang only; none for a
// relation. Round 6 took the English off the writer payload and the writer typed its
// own ("(trine)", "(self-punishment)"). So on a v2 MIRROR a parenthetical directly
// after a relation's Indonesian name (glossary relasi_cabang) is removed WHATEVER IT
// CONTAINS, and logged. Position, not a word list. Rejects nothing.
import RELATION_R6 from './fixtures/relation-english-r6.json' with { type: 'json' };

const RELATION_NAMES = Object.entries(GLOSSARY.relasi_cabang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v.name_id);
const relationBrackets = (text) => RELATION_NAMES.flatMap((n) => {
  const hits = [];
  let at = text.indexOf(n);
  while (at !== -1) {
    const m = /^\s*\(([^()]{1,60})\)/u.exec(text.slice(at + n.length));
    if (m) hits.push(`${n} (${m[1]})`);
    at = text.indexOf(n, at + 1);
  }
  return hits;
});

for (const rec of RELATION_R6.readings) {
  test(`RELATION STRIP: ${rec.id}'s served draft carries no relation English after the gate`, () => {
    assert.ok(rec.served_relation_english.length >= 3, 'precondition: the fixture records what was served');
    const sj = buildSemanticJson(calculateBaziChart(rec.inputs), { voice: 'v2' });
    const out = validateRenderingV2(withEngineOpening(structuredClone(rec.draft), sj).rendered, sj);
    assert.deepEqual(relationBrackets(servedText(out)), [], 'no parenthetical after a relation name');
    const logged = out.findings.filter((f) => f.check === 'brackets.relation_stripped');
    for (const was of rec.served_relation_english) {
      assert.ok(logged.some((f) => f.message.includes(was)), `logged: ${was}`);
    }
    assert.ok(logged.every((f) => f.severity === 'flag'), 'logged, never rejecting');
  });
}

test('RELATION STRIP CONTROLS: an Aspek or Bintang bracket stays, a lowercase common noun is not a relation, the rest of the sentence is kept', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '2001-02-14', birthTime: '13:00' }), { voice: 'v2' });
  const draft = draftFor(sj);
  draft.penutup = 'Benturan (Pilar Kerja dan Pilar Diri) yang kamu rasakan tidak menggoyahkan Aspek Penantang (Seven Killings), dan ikatan (bond) dengan orang terdekat tetap kuat.';
  const t = validateRenderingV2(draft, sj).normalized.penutup;
  assert.ok(t.startsWith('Benturan yang kamu rasakan'), t);
  assert.ok(t.includes('Aspek Penantang (Seven Killings)'), t);
  assert.ok(t.includes('ikatan (bond)'), t);
});

test('RELATION STRIP: a pair reading is unchanged (the pair writer was not switched)', () => {
  const pj = buildPairSemantic(A, B, { voice: 'v2' });
  const draft = draftFor(pj);
  draft.penutup = `${draft.penutup || ''} Benturan (clash) di antara kalian terasa di hari biasa.`.trim();
  const out = validateRenderingV2(draft, pj);
  assert.ok(out.normalized.penutup.includes('Benturan (clash)'), out.normalized.penutup);
  assert.equal(out.findings.some((f) => f.check === 'brackets.relation_stripped'), false);
});

// ── THE ROUND-6 SWITCH ON THE WIRE (Prompt AV §2 items 2 and 3) ──
// What the provider is SENT, captured off the stubbed fetch: the v2 MIRROR writer runs
// at temperature 0.9 and is handed no English for a relation; the v2 pair and every v1
// reading keep 0.2 and their payload as before (neither was tested in round 6).
const SMEW = calculateBaziChart({ birthDate: '2001-02-14', birthTime: '13:00' });
const RELATION_KIND = new Set(['branch_relation', 'punishment']);
async function onTheWire(sj) {
  const prev = { fetch: globalThis.fetch, key: process.env.GEMINI_API_KEY };
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  let body = null;
  globalThis.fetch = async (url, init) => {
    body = JSON.parse(init.body);
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(draftFor(sj)) }] } }],
    }), { status: 200 });
  };
  try {
    __clearMemCache(); __clearInFlight();
    await renderReading(sj, { spendGuards: false, dedupeInFlight: false });
    const payload = JSON.parse(body.contents[0].parts[0].text);
    const relationFacts = [...(payload.facts || []), ...(payload.mirror?.a?.facts || []), ...(payload.mirror?.b?.facts || [])]
      .filter((f) => RELATION_KIND.has(f.provenance?.kind));
    return { temperature: body.generationConfig.temperature, relationFacts };
  } finally {
    globalThis.fetch = prev.fetch;
    if (prev.key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev.key;
  }
}

test('ROUND-6 SWITCH: the v2 mirror writer runs at 0.9 and is handed no relation English', async () => {
  const w = await onTheWire(v2(SMEW));
  assert.equal(w.temperature, 0.9);
  assert.ok(w.relationFacts.length >= 4, 'precondition: smewTN carries four relation facts');
  assert.deepEqual(w.relationFacts.filter((f) => f.label_bracket).map((f) => f.id), []);
  assert.ok(w.relationFacts.every((f) => f.label), 'the Indonesian name is still handed over');
});

test('ROUND-6 SWITCH CONTROLS: the v2 pair and the v1 mirror are unchanged (0.2, relation English kept)', async () => {
  const pair = await onTheWire(buildPairSemantic(SMEW, B, { voice: 'v2' }));
  assert.equal(pair.temperature, 0.2);
  assert.ok(pair.relationFacts.some((f) => f.label_bracket), 'the pair payload keeps its relation English');
  const v1 = await onTheWire(buildSemanticJson(SMEW, { voice: 'v1' }));
  assert.equal(v1.temperature, 0.2);
  assert.ok(v1.relationFacts.some((f) => f.label_bracket), 'the v1 payload keeps its relation English');
});

// ── A BADGE AT A NAMED PILLAR MUST BE WHERE THE ENGINE PLACES IT (STAGE6 1.63.0, Prompt AV §4) ──
// Since #177 a correct badge card sits beside the prose, so a sentence placing the badge
// on the wrong pillar contradicts the card on the same screen. "Bintang X ... di Pilar Y"
// (every glossary bintang, Tanda Kekosongan included) is HARD when the engine does not
// place X at Y. Subject handling is fact.aspek_pillar's: the reader on a mirror; on a pair
// "-mu" is A, "-nya"/"dia" is B, no marker and false for both is hard, true for one only
// is logged (fact.bintang_pillar_unattributed).
import BINTANG_CONTROLS from './fixtures/bintang-pillar-controls.json' with { type: 'json' };

const bintangHits = (r) => r.findings.filter((f) => f.check === 'fact.bintang_pillar');
const R605 = RELATION_R6.readings.find((x) => x.id === 'r6-05');

test('BINTANG PILLAR RED: r6-05\'s served draft with Bintang Perantau moved to Pilar Arah (by script) is HARD', () => {
  const sj = buildSemanticJson(calculateBaziChart(R605.inputs), { voice: 'v2' });
  const TRUE = 'Bintang Perantau (Sky Horse) di Pilar Kerja';
  const draft = structuredClone(R605.draft);
  const block = draft.blocks.find((b) => b.text.includes(TRUE));
  assert.ok(block, 'precondition: the served draft places Bintang Perantau at Pilar Kerja, where the engine does');
  assert.deepEqual(bintangHits(validateRenderingV2(withEngineOpening(structuredClone(draft), sj).rendered, sj)), [], 'the true draft passes');
  block.text = block.text.replace(TRUE, 'Bintang Perantau (Sky Horse) di Pilar Arah');
  const r = validateRenderingV2(withEngineOpening(draft, sj).rendered, sj);
  const hits = bintangHits(r);
  assert.equal(hits.length, 1, hits.map((h) => h.message).join(' | '));
  assert.match(hits[0].message, /Bintang Perantau sits at Pilar Kerja, not Pilar Arah/u);
  assert.equal(hits[0].severity, 'hard');
  assert.equal(r.ok, false);
});

test('BINTANG PILLAR RED, v1 too: the same wrong pillar on a v1 mirror is HARD', () => {
  const sj = buildSemanticJson(calculateBaziChart(R605.inputs), { voice: 'v1' });
  const r = validateRendering(plant(draftFor(sj), 'Bintang Perantau terasa paling kuat di Pilar Arah.'), sj);
  assert.equal(r.findings.filter((f) => f.check === 'fact.bintang_pillar' && f.severity === 'hard').length, 1);
});

test(`BINTANG PILLAR CONTROLS: all ${BINTANG_CONTROLS.spans.length} true badge-pillar spans from rounds 5 and 6 pass, both voices`, () => {
  assert.ok(BINTANG_CONTROLS.spans.length >= 10, 'precondition: the fixture holds the extracted spans');
  for (const c of BINTANG_CONTROLS.spans) {
    for (const voice of ['v2', 'v1']) {
      const sj = buildSemanticJson(calculateBaziChart(c.inputs), { voice });
      const draft = plant(draftFor(sj), `${c.span}.`);
      const r = voice === 'v2' ? validateRenderingV2(draft, sj) : validateRendering(draft, sj);
      assert.deepEqual(bintangHits(r).map((h) => h.message), [], `${voice} ${c.from}: ${c.span}`);
    }
  }
});

test('BINTANG PILLAR, a partial but true list passes: Bintang Penolong at Pilar Kerja alone, where it sits at Kerja and Arah', () => {
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '1995-06-01', birthTime: '06:00' }), { voice: 'v2' });
  assert.deepEqual(bintangHits(validateRenderingV2(plant(draftFor(sj), 'Bintang Penolong hadir di Pilar Kerja.'), sj)), []);
  assert.deepEqual(bintangHits(validateRenderingV2(plant(draftFor(sj), 'Bintang Penolong bersarang di Pilar Kerja dan Pilar Arah.'), sj)), []);
});

test('BINTANG PILLAR ON A PAIR: -mu is A, -nya is B; no marker false for both is HARD, true for one is logged', () => {
  // A = smewTN (Bintang Cendekia at Pilar Diri), B = chart 4 (Bintang Cendekia at Pilar Arah).
  const pj = buildPairSemantic(SMEW, calculateBaziChart({ birthDate: '1995-06-01', birthTime: '06:00' }), { voice: 'v2' });
  const run = (s) => validateRenderingV2(plant(draftFor(pj), s), pj).findings
    .filter((f) => f.check.startsWith('fact.bintang_pillar')).map((f) => `${f.check}/${f.severity}`);
  assert.deepEqual(run('Bintang Cendekia-mu ada di Pilar Arah.'), ['fact.bintang_pillar/hard'], 'false for A');
  assert.deepEqual(run('Bintang Cendekia-nya ada di Pilar Arah.'), [], 'true for B');
  assert.deepEqual(run('Bintang Cendekia ada di Pilar Akar.'), ['fact.bintang_pillar/hard'], 'no marker, false for both');
  assert.deepEqual(run('Bintang Cendekia ada di Pilar Arah.'), ['fact.bintang_pillar_unattributed/flag'], 'no marker, true for B only');
});
