// ============================================================
// 命宮 / 胎元 lock — conventions and the no-hour contract
// ============================================================
// Both are DISPLAY ONLY. This file locks the two things that can silently go
// wrong: the derivation convention, and the null contract.
//
// VERIFICATION (D1 required a second source):
//   胎元 — triple-verified. Joey's printed 甲子 for chart 1, tyme4ts
//          getFetalOrigin(), and the standard formula (month stem +1, branch +3)
//          computed by hand, all agreeing across five charts.
//   命宮 — tyme4ts getOwnSign() reproduces Joey's printed 丁卯 for chart 1.
//          命宮 has more than one convention in circulation, so the matching one
//          is recorded rather than assumed. CAVEAT: one Joey data point. His
//          plotter moved behind a sign-in, so more were not collectable.
//
// Run: npm run test:palaces
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { BRANCHES, STEMS } from '../lib/bazi/stems.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const chart1 = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });

test('chart 1 reproduces Joey\'s printed palaces', () => {
  // The direct test D1 named. If either fails, the convention is wrong.
  assert.equal(`${chart1.lifePalace.stem}${chart1.lifePalace.branch}`, '丁卯', '命宮');
  assert.equal(`${chart1.conceptionPalace.stem}${chart1.conceptionPalace.branch}`, '甲子', '胎元');
  // Joey prints "Fire Rabbit" and "Wood Rat".
  assert.equal(chart1.lifePalace.element, 'Fire');
  assert.equal(chart1.lifePalace.animal, 'Kelinci');
  assert.equal(chart1.conceptionPalace.element, 'Wood');
  assert.equal(chart1.conceptionPalace.animal, 'Tikus');
});

test('胎元 matches the standard formula on every fixture chart', () => {
  // Independent of tyme4ts: month stem +1, month branch +3.
  for (const tc of VALIDATION_CHARTS) {
    const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const stem = STEMS[(STEMS.indexOf(chart.month.stem) + 1) % 10];
    const branch = BRANCHES[(BRANCHES.indexOf(chart.month.branch) + 3) % 12];
    assert.equal(chart.conceptionPalace.stem, stem, `chart ${tc.id} 胎元 stem`);
    assert.equal(chart.conceptionPalace.branch, branch, `chart ${tc.id} 胎元 branch`);
  }
});

test('命宮 is null without a birth hour, and is never faked from the noon probe', () => {
  // The derivation reads the hour branch. With no hour there is nothing to
  // compute, and the noon probe used for year/month/day must not leak into it.
  for (const tc of VALIDATION_CHARTS) {
    const withHour = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const noHour = calculateBaziChart({ birthDate: tc.date });
    assert.notEqual(withHour.lifePalace, null, `chart ${tc.id} should have 命宮 with an hour`);
    assert.equal(noHour.lifePalace, null, `chart ${tc.id} must have NO 命宮 without an hour`);
  }
});

test('胎元 is hour-independent — it survives an unknown birth time', () => {
  for (const tc of VALIDATION_CHARTS) {
    const withHour = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const noHour = calculateBaziChart({ birthDate: tc.date });
    // Charts on a 節 day can legitimately shift their MONTH pillar without an
    // hour, and 胎元 derives from the month pillar, so compare only where the
    // month pillar itself is stable.
    if (withHour.month.stem !== noHour.month.stem || withHour.month.branch !== noHour.month.branch) continue;
    assert.deepEqual(noHour.conceptionPalace, withHour.conceptionPalace, `chart ${tc.id}`);
  }
});

test('palaces carry no interpretation', () => {
  // Guards the ruling: display only. No Ten God, no polarity role, no score.
  for (const palace of [chart1.lifePalace, chart1.conceptionPalace]) {
    assert.deepEqual(Object.keys(palace).sort(), ['animal', 'branch', 'element', 'stem']);
  }
});
