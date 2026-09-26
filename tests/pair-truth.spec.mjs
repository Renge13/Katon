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
