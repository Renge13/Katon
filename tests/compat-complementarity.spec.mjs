// ============================================================
// tests/compat-complementarity.spec.mjs
// ============================================================
// WHAT THIS ASSERTS, AND WHAT IT CANNOT.
//
// There is NO ORACLE FOR A PAIR CLAIM (Joey Yap's plotter is single-chart, probed
// 2026-08-12), so nothing here claims a pair "really is" complementary. Every
// expectation asserts INTERNAL CONSISTENCY: that `compatComplementarity` reads the
// two existing functions it is supposed to read, in the order they already define,
// and combines them without re-ranking or recomputing anything.
//
// THE TWO SOURCES, and they are deliberately different computations:
//   computeStrength(chart).favorable   lib/bazi/strength.ts:628-643, returned :660
//       The favourable elements, ALREADY ORDERED BY SCARCITY - `byScarcity` at
//       :629 sorts ascending on elementTotals, so favorable[0] is the scarcest and
//       therefore the most needed. This module does not re-sort that list; it walks
//       it in the engine's own priority order and takes the first hit.
//   elementPresence(chart)             lib/semantic/facts.js:121
//       Presence as percent of the chart's total weight, over
//       `chart.elementBalance` = countElements() at lib/bazi/buildChart.js:80.
//
// PRESENCE IS NOT STRENGTH, AND THAT IS RULE 9. `strength.elementStrength` is a
// seasonal strength distribution; `elementPresence` counts what the chart actually
// holds. Rule 9 forbids treating display normalisation as a strength score, and the
// live version of that confusion is using one of these where the other belongs. A
// supplier supplies what it HOLDS, so presence is correct here and the spec asserts
// the module never reaches for elementStrength.
//
// ABSENCE MEANS EXACTLY ZERO, and the threshold is not this module's to invent.
// lib/semantic/facts.js:297 fires `element_absent` on `if (pct > 0) continue` - so
// absent is presence === 0, and `sameImbalance` uses the same test.
//
// THE EXPECTED VALUES BELOW WERE PRINTED FROM THOSE TWO FUNCTIONS, 2026-09-07,
// not derived from the module under test:
//
//   $ node --input-type=module -e "... computeStrength(c); elementPresence(c) ..."
//     chart   1  weak      fav Wood,Fire        absent Wood
//                presence  Wood 0    Fire 27.5  Earth 15    Metal 20    Water 37.5
//     chart   5  balanced  fav Wood,Fire        absent Metal
//                presence  Wood 17.5 Fire 20    Earth 53.8  Metal 0     Water 8.8
//     chart 101  weak      fav Wood,Fire        absent Wood   (chart 1, no hour)
//                presence  Wood 0    Fire 26.7  Earth 18.3  Metal 21.7  Water 33.3
//     chart 105  balanced  fav Metal,Water,Earth  absent Metal  (chart 5, no hour)
//                presence  Wood 16.7 Fire 26.7  Earth 55    Metal 0     Water 1.7
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeStrength } from '../lib/bazi/strength.ts';
import { elementPresence } from '../lib/semantic/facts.js';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';
import { compatComplementarity } from '../lib/compat/complementarity.js';

const chartFor = (tc) => calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
const fixture = (id) => {
  const tc = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS].find((c) => c.id === id);
  assert.ok(tc, `fixture chart ${id} exists`);
  return chartFor(tc);
};

test('the printed favourable lists and presences this spec depends on are still true', () => {
  // THE GUARD ON THE COMMENT BLOCK ABOVE. Those numbers are inputs, and an input
  // quoted in a comment is a memory the moment the engine moves. If a later change
  // to strength.ts or countElements shifts them, this fails FIRST and names the
  // cause, instead of the expectations below failing and looking like a defect in
  // lib/compat/.
  const expected = {
    1: { favorable: ['Wood', 'Fire'], Wood: 0, Fire: 27.5, Metal: 20, Water: 37.5 },
    5: { favorable: ['Wood', 'Fire'], Wood: 17.5, Fire: 20, Metal: 0, Water: 8.8 },
    101: { favorable: ['Wood', 'Fire'], Wood: 0, Fire: 26.7, Metal: 21.7, Water: 33.3 },
    105: { favorable: ['Metal', 'Water', 'Earth'], Wood: 16.7, Fire: 26.7, Metal: 0, Water: 1.7 },
  };
  for (const [id, want] of Object.entries(expected)) {
    const chart = fixture(Number(id));
    const { favorable, ...presences } = want;
    assert.deepEqual(computeStrength(chart).favorable, favorable, `chart ${id} favorable`);
    const presence = elementPresence(chart);
    for (const [element, value] of Object.entries(presences)) {
      assert.equal(presence[element], value, `chart ${id} presence ${element}`);
    }
  }
});

test('each side supplies the scarcest favourable element the OTHER needs (charts 1 x 5)', () => {
  const out = compatComplementarity(fixture(1), fixture(5));

  // A supplies from B's list, in B's own scarcity order: [Wood, Fire].
  //   Wood - A holds 0 of it, so A cannot supply it. This is the case that matters:
  //          Wood is B's FIRST choice and A's own missing element.
  //   Fire - A holds 27.5, so this is what A can actually give. rank 1, not 0.
  assert.deepEqual(out.aSupplies, {
    kind: 'compat_complementarity',
    element: 'Fire',
    supplier: 'A',
    receiver: 'B',
    receiver_favourable_rank: 1,
    supplier_presence_percent: 27.5,
  });

  // B supplies from A's list [Wood, Fire]. B holds 17.5 Wood, so the first choice
  // lands and rank is 0.
  assert.deepEqual(out.bSupplies, {
    kind: 'compat_complementarity',
    element: 'Wood',
    supplier: 'B',
    receiver: 'A',
    receiver_favourable_rank: 0,
    supplier_presence_percent: 17.5,
  });

  // Chart 1 lacks Wood, chart 5 lacks Metal. Different gaps, so no shared one.
  assert.deepEqual(out.sameImbalance, []);
});

test('sameImbalance names the element BOTH charts lack (charts 5 x 105)', () => {
  // WHY THIS PAIR, AND ITS LIMITATION STATED RATHER THAN HIDDEN: no two DISTINCT
  // charts in the 13-chart fixture share an absent element - charts 1 and 101 lack
  // Wood, charts 5 and 105 lack Metal, and nothing else lacks anything. 105 IS
  // chart 5 without a birth time (fixture row: from: 5), so this pair is one birth
  // date against itself hour-known vs hour-unknown. It exercises the code path
  // correctly and it is not a claim about two people. A fixture with more charts
  // would give a real pair; that is a fixture gap, not a module gap.
  const out = compatComplementarity(fixture(5), fixture(105));

  assert.deepEqual(out.sameImbalance, ['Metal']);

  // And the supply directions still resolve independently of the shared gap:
  //   A supplies from B(105)'s list [Metal, Water, Earth] - Metal is A's own gap at
  //   0, so it falls through to Water at 8.8, rank 1.
  assert.deepEqual(out.aSupplies, {
    kind: 'compat_complementarity',
    element: 'Water',
    supplier: 'A',
    receiver: 'B',
    receiver_favourable_rank: 1,
    supplier_presence_percent: 8.8,
  });
  //   B supplies from A(5)'s list [Wood, Fire] - B holds 16.7 Wood against A's 17.5,
  //   less, so it is skipped (ruling 2, AL §3); Fire 26.7 > 20, rank 1.
  assert.deepEqual(out.bSupplies, {
    kind: 'compat_complementarity',
    element: 'Fire',
    supplier: 'B',
    receiver: 'A',
    receiver_favourable_rank: 1,
    supplier_presence_percent: 26.7,
  });
});

test('null when the supplier holds none of the receiver\'s favourable elements', () => {
  // THE NULL BRANCH CANNOT BE REACHED FROM THE FIXTURE, so it is asserted with
  // INJECTED STRENGTH and that is said out loud. No fixture chart lacks more than
  // one element, and every favourable list has two or three entries, so a real pair
  // always has something to give. Passing a synthetic `{ favorable: ['Wood'] }`
  // tests THIS MODULE'S CONTRACT - return null when every favourable element of the
  // receiver is absent from the supplier - and asserts nothing about BaZi. The
  // charts are real; only the favourable list is stipulated.
  const a = fixture(1);    // Wood 0
  const b = fixture(101);  // Wood 0
  const woodOnly = { favorable: ['Wood'] };

  const out = compatComplementarity(a, b, woodOnly, woodOnly);
  assert.equal(out.aSupplies, null);
  assert.equal(out.bSupplies, null);
  // Both charts genuinely lack Wood, from the real presences.
  assert.deepEqual(out.sameImbalance, ['Wood']);
});

test('the caller\'s strength objects are used, not recomputed', () => {
  // Injection is the reason the parameter exists: a caller that already holds
  // computeStrength output must not pay for it twice, and a test must be able to
  // pin the favourable list. If the module ignored the argument and recomputed,
  // chart 1's real list [Wood, Fire] would make B supply Wood at rank 0; the
  // stipulated list below puts Fire first instead, so the two are distinguishable.
  const out = compatComplementarity(fixture(1), fixture(5), { favorable: ['Fire', 'Wood'] });
  // Fire first, but chart 5 holds 20 Fire against chart 1's 27.5, so it is skipped
  // (ruling 2, AL §3) and Wood lands at rank 1 - still distinguishable from the
  // recomputed list, where Wood is rank 0.
  assert.equal(out.bSupplies.element, 'Wood');
  assert.equal(out.bSupplies.receiver_favourable_rank, 1);
  assert.equal(out.bSupplies.supplier_presence_percent, 17.5);  // chart 5 holds 17.5 Wood
});

test('touches neither closed engine file, and no Indonesian string', () => {
  const source = readFileSync(new URL('../lib/compat/complementarity.js', import.meta.url), 'utf8');
  const imports = [...source.matchAll(/^import .*?from '(.+?)';$/gmu)].map((m) => m[1]);

  // Rule 7: tenGods.js and mainProfile.js are not to be touched. Rule 9's named
  // function, buildElementBars, lived in lib/readingView.js and was DELETED at the
  // 2026-08-23 promotion (`grep -rn "buildElementBars" lib/` -> only comments in
  // strength.ts), so it cannot be imported; the assertion stays as the guard that
  // notices if it ever comes back.
  const code = source.replace(/^\s*\/\/.*$/gmu, '');
  for (const forbidden of ['tenGods', 'mainProfile', 'buildElementBars', 'elementStrength']) {
    assert.ok(!code.includes(forbidden), `must not reference ${forbidden}`);
  }

  // Reuse, not reimplementation: the two source functions are imported, not copied.
  assert.deepEqual(imports.sort(), ['../bazi/strength.ts', '../semantic/facts.js']);

  // No Indonesian element names. `elementId()` (lib/semantic/glossary.js:35) returns
  // GLOSSARY.elemen[...].name_id, an Indonesian display string, and prompt W bars
  // any Indonesian string from lib/compat/. Elements stay in the engine's own
  // English keys here; mapping to Indonesian is the semantic layer's job in
  // tranche 2.
  for (const name of ['Kayu', 'Api', 'Tanah', 'Logam', 'Air']) {
    assert.ok(!code.includes(`'${name}'`), `must not carry the Indonesian element ${name}`);
  }
  assert.ok(!code.includes('elementId'), 'must not call elementId');
});

// ── PENYEIMBANG UNSUR: THE SUPPLIER MUST HOLD MORE (Reyner's ruling 2, Prompt AL §3) ──
// docs/product/ah-protection-rulings-2026-09-28.md, third set: "X membawa elemen E"
// only when X holds MORE of E than the receiver; less or the same amount is skipped.
// The walk is unchanged (the receiver's favourable list, scarcest first).
const pairCharts = (a, b) => [calculateBaziChart(a), calculateBaziChart(b)];

test('rVe4ca: A brings B Fire (not Water), B brings A Earth (not Fire) - AK §2\'s numbers', () => {
  // A holds Water 1.3 against B's 5: less, skipped; Fire 11.3 > 7.5. B holds Fire
  // 7.5 against A's 11.3: less, skipped; Earth 51.3 > 35.
  const [a, b] = pairCharts({ birthDate: '1981-02-20', birthTime: '07:00' }, { birthDate: '1988-07-04', birthTime: '05:00' });
  const out = compatComplementarity(a, b);
  assert.equal(out.aSupplies.element, 'Fire');
  assert.equal(out.bSupplies.element, 'Earth');
});

test('NO ELEMENT QUALIFIES in one direction: that direction is null, the other stands (charts 9 x 11)', () => {
  // Chart 9 favours [Water, Wood]; chart 11 holds Water 5 < 13.8 and Wood 11.3 < 17.5.
  const out = compatComplementarity(fixture(9), fixture(11));
  assert.equal(out.bSupplies, null);
  assert.equal(out.aSupplies.element, 'Fire');
});

test('THE SAME AMOUNT DOES NOT QUALIFY: a chart against itself supplies nothing either way', () => {
  const out = compatComplementarity(fixture(1), fixture(1));
  assert.equal(out.aSupplies, null);
  assert.equal(out.bSupplies, null);
});

test('A DIRECTION WITH NO QUALIFYING ELEMENT carries no Penyeimbang fact: the fact, the PDF column and the no-supply cell', async () => {
  const { buildPairSemantic } = await import('../lib/semantic/pair.js');
  const { factRows } = await import('../lib/pdf/pairDocument.js');
  // 9 x 11: only A gives. The p3_supply fact lists one direction; the PDF row keeps
  // its term and leaves B's column empty rather than naming an element.
  const oneWay = buildPairSemantic(fixture(9), fixture(11));
  const supplies = oneWay.facts.find((f) => f.id === 'p3_supply').provenance.supplies;
  assert.deepEqual(supplies.map((s) => `${s.from}>${s.to}`), ['a>b']);
  // Only the reader gives, so the row is the reader-side cell (Prompt AM ruling 1).
  const row = factRows(oneWay).find((r) => r.anchorKey === 'p3_reader_gives');
  assert.equal(row.a, 'Api');
  assert.equal(row.b, '');
  // A chart against itself: nothing qualifies either way, so the ruled no-supply
  // cell stands in and no Penyeimbang row is printed.
  const none = buildPairSemantic(fixture(1), fixture(1));
  assert.deepEqual(none.facts.find((f) => f.id === 'p3_supply').provenance.supplies, []);
  const rows = factRows(none).map((r) => r.anchorKey);
  assert.ok(rows.includes('p3_no_supply'));
  assert.equal(rows.includes('p3_supplies'), false);
});

// ── WHO GIVES DECIDES THE CELL (Prompt AM ruling 1, 2026-09-28) ──
// `p3_supplies` says "Dia membawa ..." - the partner brings the reader something.
// When only the reader gives (A to B, no B to A), that line is untrue, so the
// engine picks the ruled `p3_reader_gives` ("Kamu membawa ...") on every surface
// that prints the cell: the floor, the PDF facts table and the glossary appendix.
// Both directions, or the partner alone, keep `p3_supplies`. Texts are read from
// the glossary, never restated here.
const P3 = async (a, b) => {
  const { buildPairSemantic } = await import('../lib/semantic/pair.js');
  const { factRows } = await import('../lib/pdf/pairDocument.js');
  const { buildPairAppendix } = await import('../lib/pdf/pairAppendix.js');
  const { assembleFallback } = await import('../lib/render/fallback.js');
  const { GLOSSARY } = await import('../lib/semantic/glossary.js');
  const sj = buildPairSemantic(a, b);
  const floor = assembleFallback(sj).blocks.find((bl) => (bl.fact_ids || []).includes('p3_supply'));
  const row = factRows(sj).find((r) => /^p3_(supplies|reader_gives)$/u.test(r.anchorKey));
  const appendixKeys = buildPairAppendix({ chartA: a, chartB: b, semanticJson: sj }).groups
    .flatMap((g) => g.entries).filter((e) => e.section === 'kompatibilitas').map((e) => e.key);
  return {
    K: GLOSSARY.kompatibilitas,
    directions: sj.facts.find((f) => f.id === 'p3_supply').provenance.supplies.map((s) => `${s.from}>${s.to}`),
    floor: floor?.text ?? '', row, appendixKeys,
  };
};

test('ONLY THE READER GIVES (9 x 11): floor, PDF row and appendix all use p3_reader_gives', async () => {
  const r = await P3(fixture(9), fixture(11));
  assert.deepEqual(r.directions, ['a>b'], 'precondition: only A gives');
  assert.ok(r.floor.includes(r.K.p3_reader_gives.label_meaning), `floor: ${r.floor}`);
  assert.equal(r.floor.includes(r.K.p3_supplies.label_meaning), false, 'the floor must not say the partner gives');
  assert.equal(r.row.anchorKey, 'p3_reader_gives');
  assert.equal(r.row.meaning, r.K.p3_reader_gives.label_meaning);
  assert.equal(r.row.term, 'Penyeimbang Unsur');
  assert.equal(r.row.a, 'Api');
  assert.equal(r.row.b, '');
  assert.ok(r.appendixKeys.includes('p3_reader_gives'));
  assert.equal(r.appendixKeys.includes('p3_supplies'), false);
});

for (const [name, a, b, want] of [
  ['BOTH GIVE (rVe4ca)', { birthDate: '1981-02-20', birthTime: '07:00' }, { birthDate: '1988-07-04', birthTime: '05:00' }, ['a>b', 'b>a']],
  ['ONLY THE PARTNER GIVES (2 x 6)', 2, 6, ['b>a']],
]) {
  test(`${name}: p3_supplies stays, on every surface`, async () => {
    const chart = (x) => (typeof x === 'number' ? fixture(x) : calculateBaziChart(x));
    const r = await P3(chart(a), chart(b));
    assert.deepEqual(r.directions, want, 'precondition: the directions');
    assert.ok(r.floor.includes(r.K.p3_supplies.label_meaning), `floor: ${r.floor}`);
    assert.equal(r.row.anchorKey, 'p3_supplies');
    assert.equal(r.row.meaning, r.K.p3_supplies.label_meaning);
    assert.ok(r.appendixKeys.includes('p3_supplies'));
    assert.equal(r.appendixKeys.includes('p3_reader_gives'), false);
  });
}
