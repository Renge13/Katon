// ============================================================
// Fixture-shape lock for Joey's full ten bars
// ============================================================
// Validates the `allBars` shape against the ONE row transcribed so far
// (chart 13), so that when the remaining twelve land the shape is already proven
// and any transcription slip is caught immediately rather than after a model has
// been fitted to it.
//
// This asserts nothing about the ENGINE. It checks the fixture against itself and
// against the element totals published in docs/prompts/C3-ruling-B.md.
//
// Run: npm run test:joey-bars
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import { elementBarsFrom, elementRankFrom, hasFullBars, crossCheckBars } from './joey-bars.mjs';
import { ALL_TEN_GODS } from '../lib/bazi/strength.ts';

const withFullBars = VALIDATION_CHARTS.filter(hasFullBars);

test('at least one chart carries the full ten bars', () => {
  assert.ok(withFullBars.length >= 1, 'chart 13 should be transcribed');
});

test('pending rows are null, never partially filled', () => {
  // A half-transcribed row is the dangerous state: it looks like data and fits
  // like noise. Either all ten gods are present or the field is absent.
  for (const tc of VALIDATION_CHARTS) {
    const bars = tc.expect.allBars;
    if (bars == null) continue;
    const missing = ALL_TEN_GODS.filter((g) => typeof bars[g] !== 'number');
    assert.deepEqual(missing, [], `chart ${tc.id} is missing ${missing.join(',')}`);
    assert.equal(Object.keys(bars).length, 10, `chart ${tc.id} has extra keys`);
  }
});

test('allBars agrees with the independently transcribed topThreeBars', () => {
  // Both come from the same PDF page, so disagreement means one transcription is
  // wrong. This is the check that pays off when the other twelve arrive.
  for (const tc of withFullBars) {
    const problems = crossCheckBars(tc);
    assert.deepEqual(problems, [], `chart ${tc.id}: ${problems.join('; ')}`);
  }
});

test('chart 13 element totals derive to the values published in C3-ruling-B.md', () => {
  const tc = VALIDATION_CHARTS.find((c) => c.id === 13);
  assert.ok(hasFullBars(tc), 'chart 13 must carry allBars');

  const derived = elementBarsFrom(tc.expect.allBars, tc.expect.dayMasterElement);
  assert.deepEqual(derived, { Earth: 150, Wood: 135, Water: 80, Metal: 55, Fire: 34 });

  // The ruling quotes this ordering; lock it so a mapping change cannot silently
  // reshuffle what we are fitting against.
  assert.deepEqual(
    elementRankFrom(tc.expect.allBars, tc.expect.dayMasterElement),
    ['Earth', 'Wood', 'Water', 'Metal', 'Fire'],
  );
});

test('summing all ten bars equals summing the five derived elements', () => {
  // Conservation: the pair-sum derivation must not lose or invent mass.
  for (const tc of withFullBars) {
    const bars = tc.expect.allBars;
    const barTotal = ALL_TEN_GODS.reduce((s, g) => s + bars[g], 0);
    const elementTotal = Object.values(elementBarsFrom(bars, tc.expect.dayMasterElement))
      .reduce((s, v) => s + v, 0);
    assert.equal(elementTotal, barTotal, `chart ${tc.id}`);
  }
});

test('every god pair maps to exactly one element', () => {
  // Guards tenGodElement: ten gods must collapse to five elements, two each.
  const tc = VALIDATION_CHARTS.find((c) => c.id === 13);
  const counts = {};
  for (const god of ALL_TEN_GODS) {
    const el = Object.keys(elementBarsFrom({ ...zeroBars(), [god]: 1 }, tc.expect.dayMasterElement))
      .find((k) => elementBarsFrom({ ...zeroBars(), [god]: 1 }, tc.expect.dayMasterElement)[k] === 1);
    counts[el] = (counts[el] ?? 0) + 1;
  }
  assert.deepEqual(Object.values(counts).sort(), [2, 2, 2, 2, 2]);
});

function zeroBars() {
  const z = {};
  for (const g of ALL_TEN_GODS) z[g] = 0;
  return z;
}
