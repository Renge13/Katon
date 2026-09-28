// ============================================================
// tests/pair-truth.spec.mjs — engine-provable pair truths are HARD (Prompt AG item 1)
// ============================================================
// Run: npm run test:pair-truth
//
// Each check is shown on a REAL wrong text first (a production cache row or a
// captured writer draft), then on a planted one, then on the correct text, which
// must pass. The fixtures are the repo's own; nothing here is retyped from memory
// except the planted sentences, which are marked as planted.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { validateRendering } from '../lib/validate/index.js';

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

// g4WH4: A 丙 Fire (Matahari), B 己 Earth (Taman). p1 a_produces_b. p3: A brings
// Water, B brings Wood. Inputs from the fixture itself.
const G4 = fixture('compat-g4WH4-reading.json');
const g4 = buildPairSemantic(calculateBaziChart(G4.inputs.a), calculateBaziChart(G4.inputs.b));

// PZ0t (the calibrate-j1 pair): A 1989-09-13 09:00, B 1990-03-04 14:00.
const pz = buildPairSemantic(
  calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }),
  calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' }),
);

const checks = (rendered, sj) => validateRendering(rendered, sj).findings.map((f) => f.check);
const withBlock = (rendered, factId, text) => ({
  ...rendered,
  blocks: rendered.blocks.map((b) => ((b.fact_ids || []).includes(factId) ? { ...b, text } : b)),
});

test('THE PREMISE: g4WH4 is a_produces_b, A brings Water, B brings Wood', () => {
  const p1 = g4.facts.find((f) => f.id === 'p1_stem_relation').provenance;
  const p3 = g4.facts.find((f) => f.id === 'p3_supply').provenance;
  assert.equal(p1.cycle, 'a_produces_b');
  assert.deepEqual(p3.supplies.map((s) => [s.from, s.element]), [['a', 'Water'], ['b', 'Wood']]);
});

// ── DIRECTION AND SUPPLIER (STAGE6 1.39.0) ───────────────────

test('SUPPLIER: v1 PRODUCTION served the g4WH4 inversion, and it now fires', () => {
  // tests/fixtures/pair-reading-g4WH4.json is a real paid response, served from
  // cache, 2026-09-08: "Dia membawa elemen air yang tidak dominan di baganmu."
  const prod = fixture('pair-reading-g4WH4.json').reading;
  assert.ok(checks(prod, g4).includes('pair.supply_inverted'));
});

test('SUPPLIER: the v2 round-2 g4WH4 draft (dia brings Air) fires', () => {
  // Verbatim from tests/fixtures/voice-v2-g4WH4-round2.json (feat/voice-v2), the
  // block citing p3_supply.
  const draft = 'Namun, di sinilah letak kekuatannya: dia membawa elemen Air yang tidak dominan di baganmu, memberikan keseimbangan yang menenangkan di area yang tadinya rawan rapuh.';
  assert.ok(checks(withBlock(G4.rendered, 'p3_supply', draft), g4).includes('pair.supply_inverted'));
});

test('SUPPLIER: the reverse direction fires (planted: kamu brings Kayu)', () => {
  const planted = 'Kamu membawa unsur Kayu yang tidak dominan di bagannya.';
  assert.ok(checks(withBlock(G4.rendered, 'p3_supply', planted), g4).includes('pair.supply_inverted'));
});

test('SUPPLIER: the true sentences pass, both directions', () => {
  for (const text of [
    'Dia membawa elemen Kayu yang tidak dominan di baganmu.',
    'Kamu membawa elemen Air yang ia butuhkan, dan ia membawa elemen Kayu yang kamu butuhkan.',
    'Dari dia kamu menerima unsur Kayu.',
  ]) {
    assert.ok(!checks(withBlock(G4.rendered, 'p3_supply', text), g4).includes('pair.supply_inverted'), text);
  }
});

test('SUPPLIER: a recipient after a preposition is not what is brought', () => {
  // A true p1 sentence in a block that also cites p3 (the S4 sample's own line).
  const text = 'Api milikmu memberi energi ke Tanah miliknya.';
  const rendered = { blocks: [{ fact_ids: ['p1_stem_relation', 'p3_supply'], heading: 'x', text }], penutup: '' };
  assert.ok(!checks(rendered, g4).includes('pair.supply_inverted'));
});

test('DIRECTION: planted "dia menghidupi kamu" fires where the engine says the reverse', () => {
  const planted = 'Dalam hubungan ini, dia menghidupi kamu dengan alur yang stabil.';
  assert.ok(checks(withBlock(G4.rendered, 'p1_stem_relation', planted), g4).includes('pair.stem_inverted'));
  const passive = 'Api milikmu dihidupi oleh Tanah miliknya.';
  assert.ok(checks(withBlock(G4.rendered, 'p1_stem_relation', passive), g4).includes('pair.stem_inverted'));
});

test('DIRECTION: the correct g4WH4 texts pass (production v1 and the v2 draft)', () => {
  const v2p1 = 'Dalam hubungan ini, kamu berperan sebagai sumber energi yang menghidupi dia.';
  const found = [
    ...checks(G4.rendered, g4),
    ...checks(fixture('pair-reading-g4WH4.json').reading, g4),
    ...checks(withBlock(G4.rendered, 'p1_stem_relation', v2p1), g4),
  ];
  assert.ok(!found.includes('pair.stem_inverted'));
  // And the correct reading, 2026-09-26 production, carries no supply claim at all.
  assert.ok(!checks(G4.rendered, g4).includes('pair.supply_inverted'));
});

test('DIRECTION: a negated clause is not read ("bukan dia yang menghidupi kamu")', () => {
  const text = 'Bukan dia yang menghidupi kamu, melainkan kamu yang menghidupi dia.';
  assert.ok(!checks(withBlock(G4.rendered, 'p1_stem_relation', text), g4).includes('pair.stem_inverted'));
});

test('DIRECTION AND SUPPLIER ARE HARD', () => {
  const planted = withBlock(G4.rendered, 'p1_stem_relation', 'Dia menghidupi kamu.');
  const gate = validateRendering(planted, g4);
  assert.equal(gate.findings.find((f) => f.check === 'pair.stem_inverted').severity, 'hard');
  assert.equal(gate.hard, true);
});

test('PZ0t: the same planted inversion fires on a second pair', () => {
  const cycle = pz.facts.find((f) => f.id === 'p1_stem_relation').provenance.cycle;
  assert.equal(cycle, 'a_produces_b');
  const rendered = { blocks: [{ fact_ids: ['p1_stem_relation'], heading: 'x', text: 'Unsur Tanah miliknya menghidupi unsur Api milikmu.' }], penutup: '' };
  assert.ok(checks(rendered, pz).includes('pair.stem_inverted'));
});

// ── CROSS-CHART RELATIONS LAND ON DAY SEATS (STAGE6 1.40.0) ──

// The S4 compat sample (docs/content/voice-v2-worksheet-2026-09-24.md §S4, the
// "After" blockquote), which calibrate-j1 plants its seeds into. Written for PZ0t.
const worksheet = readFileSync(new URL('../docs/content/voice-v2-worksheet-2026-09-24.md', import.meta.url), 'utf8')
  .replace(/\r\n?/g, '\n');
const s4Quote = worksheet.slice(worksheet.indexOf('### S4.'), worksheet.indexOf('**Penutup**', worksheet.indexOf('### S4.')))
  .split('\n').filter((l) => l.startsWith('> ') && !l.startsWith('> **')).map((l) => l.slice(2));
const S4_SEATS = s4Quote.find((p) => p.startsWith('Kursi pasangan kalian'));
const PAIR_IDS = ['p1_stem_relation', 'p2_day_pair', 'p2_palace_frame', 'p3_supply', 'p4_temperament', 'p5_pull_fit'];
const one = (text) => ({ blocks: [{ fact_ids: ['p2_day_pair', 'p2_palace_frame'], heading: 'Di Antara Kalian', text }], penutup: '' });
const ANCHOR = 'Dari arah sebaliknya, Pilar Kerja-mu terikat dengan kursi pasangannya.';
const plant = (seed) => S4_SEATS.replace(ANCHOR, `${ANCHOR} ${seed}`);

test('THE PREMISE: in PZ0t every cross-chart hit lands on a day seat, and B year 午 clashes A day 子', () => {
  const frame = pz.facts.find((f) => f.id === 'p2_palace_frame').provenance;
  for (const hit of [...frame.a_hits_b, ...frame.b_hits_a]) assert.equal(hit.to.position, 'day');
  assert.ok(frame.b_hits_a.some((h) => h.relation === '冲' && h.from.position === 'year' && h.from.branch === '午'));
  assert.ok(S4_SEATS.includes(ANCHOR), 'the S4 sample moved; the seeds have no anchor');
});

test('SEATS: seed-S4 fires ("Pilar Akarmu dan Pilar Akar-nya juga saling mengikat")', () => {
  assert.ok(checks(one(plant('Pilar Akarmu dan Pilar Akar-nya juga saling mengikat.')), pz).includes('pair.cross_chart_seat'));
});

test('SEATS: fail-monthclash fires ("Pilar Kerja kalian berdua saling berbenturan")', () => {
  const seed = 'Misalnya, ketika kalian berdebat soal uang, biasanya itu karena Pilar Kerja kalian berdua saling berbenturan.';
  assert.ok(checks(one(plant(seed)), pz).includes('pair.cross_chart_seat'));
});

test('SEATS: the true S4 text passes, including B year clashing A seat', () => {
  assert.ok(S4_SEATS.includes('Pilar Akar-nya berbenturan dengan Fondasi Pasanganmu.'));
  assert.ok(!checks(one(S4_SEATS), pz).includes('pair.cross_chart_seat'));
  assert.ok(!checks(one('Pilar Akar-nya berbenturan dengan kursi pasanganmu.'), pz).includes('pair.cross_chart_seat'));
  // One person's own two pillars is not a cross-chart claim.
  assert.ok(!checks(one('Pilar Kerja-mu dan Pilar Akar-mu saling berbenturan.'), pz).includes('pair.cross_chart_seat'));
});

test('THE WHOLE S4 SAMPLE PASSES ALL THREE PAIR-TRUTH CHECKS', () => {
  const rendered = { blocks: [{ fact_ids: PAIR_IDS, heading: 'S4', text: s4Quote.join('\n\n') }], penutup: '' };
  const found = checks(rendered, pz);
  for (const id of ['pair.stem_inverted', 'pair.supply_inverted', 'pair.cross_chart_seat']) {
    assert.ok(!found.includes(id), `${id} fired on the true S4 sample`);
  }
});

// ── ELEMENT DOMINANCE AGREES WITH THE ENGINE (STAGE6 1.41.0) ──

// calibrate-j1's mirror: A 1989-09-13 09:00. Kayu 0 (element_missing_Wood), Air
// 37.5 (element_dominant_Water, the top share), Api 27.5.
const chartA = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' });
const mirror = buildSemanticJson(chartA);
const mirrorOne = (text) => ({ blocks: [{ fact_ids: ['spouse_palace'], heading: 'x', text }], penutup: '' });

test('THE PREMISE: Kayu is missing and Air is the top share', () => {
  const p = mirror.chart.element_presence;
  assert.equal(p.Kayu, 0);
  assert.equal(Math.max(...Object.values(p)), p.Air);
  assert.ok(mirror.facts.some((f) => f.id === 'element_missing_Wood'));
  assert.ok(mirror.facts.some((f) => f.id === 'element_dominant_Water'));
});

test('DOMINANCE: seed-S3 fires ("Kayu adalah unsur yang paling banyak", Kayu is missing)', () => {
  assert.ok(checks(mirrorOne('Di baganmu, Kayu adalah unsur yang paling banyak.'), mirror).includes('fact.element_dominance'));
});

test('DOMINANCE: an element that is present but not the top share fires', () => {
  assert.ok(checks(mirrorOne('Api mendominasi baganmu.'), mirror).includes('fact.element_dominance'));
});

test('DOMINANCE: the true sentence passes, and so does a negated one', () => {
  for (const text of [
    'Di baganmu, Air adalah unsur yang paling banyak.',
    'Unsur Air dominan di baganmu.',
    'Dia membawa elemen Kayu yang tidak dominan di baganmu.',
    'Karakter dominanmu adalah Aspek Pengelola.',
  ]) {
    assert.ok(!checks(mirrorOne(text), mirror).includes('fact.element_dominance'), text);
  }
});

test('DOMINANCE: an element name inside a longer word is not an element (word boundary)', () => {
  // Kayu is missing on this chart, so a boundary-less match would fire here. This
  // test exists because the first version's boundaries were written through a
  // shell heredoc and lost their backslashes (`[\p{L}]` became `[p{L}]`), and
  // every other test still passed.
  assert.ok(!checks(mirrorOne('Kayuagung paling banyak menghasilkan jati.'), mirror).includes('fact.element_dominance'));
});

test('DOMINANCE ON A PAIR: per person through mirror.a / mirror.b (v2); a v1 pair has no element facts', () => {
  const planted = { blocks: [{ fact_ids: ['p3_supply'], heading: 'x', text: 'Kayu adalah unsur yang paling banyak di baganmu.' }], penutup: '' };
  // v1 (main): nothing to compare against, so nothing fires.
  assert.ok(!checks(planted, g4).includes('fact.element_dominance'));
  // v2 shape: each person's mirror facts ride on the pair object.
  const mA = buildSemanticJson(calculateBaziChart(G4.inputs.a));
  const mB = buildSemanticJson(calculateBaziChart(G4.inputs.b));
  const g4v2 = { ...g4, mirror: { a: { facts: mA.facts }, b: { facts: mB.facts } } };
  assert.ok(checks(planted, g4v2).includes('fact.element_dominance'));
  const trueB = { ...planted, blocks: [{ ...planted.blocks[0], text: 'Tanah mendominasi bagannya.' }] };
  assert.ok(mB.facts.some((f) => f.id === 'element_dominant_Earth'));
  assert.ok(!checks(trueB, g4v2).includes('fact.element_dominance'));
});
