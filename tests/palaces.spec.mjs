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
import { lifePalaceCandidate } from '../lib/bazi/pillars.ts';
import { BRANCHES, STEMS } from '../lib/bazi/stems.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const chart1 = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });

test('chart 1 reproduces Joey\'s printed 胎元', () => {
  assert.equal(`${chart1.conceptionPalace.stem}${chart1.conceptionPalace.branch}`, '甲子');
  // Joey prints "Wood Rat".
  assert.equal(chart1.conceptionPalace.element, 'Wood');
  assert.equal(chart1.conceptionPalace.animal, 'Tikus');
});

test('命宮 is NOT on the chart object — it is deliberately absent', () => {
  // The removal itself, asserted. If someone re-adds the field this fails, which
  // is the point: the reasoning below is easy to forget and 4/5 looks passable.
  assert.equal('lifePalace' in chart1, false, '命宮 must not be emitted');
  assert.equal(chart1.lifePalace, undefined);
});

// ── XFAIL: the 命宮 convention, recorded so the finding is not lost ──
// D1b collected four more Joey values after the n=1 caveat on the first. NEITHER
// candidate convention reproduces him:
//
//   ch  Joey   solar-term month (shipped)   lunar month number
//    1  丁卯    丁卯  OK                      丁卯  OK
//    2  癸未    甲申  XX                      癸未  OK
//    3  己酉    己酉  OK                      己酉  OK
//    7  癸亥    癸亥  OK                      甲子  XX
//   10  乙酉    乙酉  OK                      丙戌  XX
//                    4/5                            3/5
//
// It fails exactly where the engine already has convention ambiguity, because
// 命宮 consumes the YEAR STEM, the MONTH and the HOUR and so compounds three
// choices at once: chart 2 is a CNY/solar-term mismatch, chart 7 is 晚子時,
// chart 10 is 立春. "Close enough" is not a sensible target for a field whose
// only job is to be cross-checked.
//
// To un-defer: settle it against 10+ Joey values deliberately including a
// CNY/solar mismatch, a 晚子時 birth and a 立春 birth. Reyner can collect them —
// the plotter needs a sign-in and he is logged in.

/** Joey's collected 命宮 values. GROUND TRUTH — do not adjust to make a test pass. */
const JOEY_LIFE_PALACE = {
  1: { date: '1989-09-13', time: '09:00', joey: '丁卯' },
  2: { date: '1990-03-04', time: '14:00', joey: '癸未' },
  3: { date: '1992-04-20', time: '08:00', joey: '己酉' },
  7: { date: '1993-06-12', time: '23:30', joey: '癸亥' },
  10: { date: '1985-02-04', time: '12:00', joey: '乙酉' },
};

test('XFAIL 命宮 — the solar-term convention is 4/5, and misses chart 2', () => {
  const misses = [];
  for (const [id, { date, time, joey }] of Object.entries(JOEY_LIFE_PALACE)) {
    const c = lifePalaceCandidate({ date, time });
    if (`${c.stem}${c.branch}` !== joey) misses.push(Number(id));
  }
  // Asserted as a KNOWN FAILURE, not a target. If this ever becomes 5/5 the
  // convention question may be resolved — re-open it deliberately, with more
  // data, rather than flipping the field back on because a test went green.
  assert.deepEqual(misses, [2], 'expected exactly chart 2 to miss');
  assert.equal(Object.keys(JOEY_LIFE_PALACE).length - misses.length, 4, '4 of 5');
});

test('命宮 candidate stays null without an hour — it reads the hour branch', () => {
  assert.equal(lifePalaceCandidate({ date: '1989-09-13', time: null }), null);
  assert.notEqual(lifePalaceCandidate({ date: '1989-09-13', time: '09:00' }), null);
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

test('no chart emits 命宮, with or without an hour', () => {
  for (const tc of VALIDATION_CHARTS) {
    for (const chart of [
      calculateBaziChart({ birthDate: tc.date, birthTime: tc.time }),
      calculateBaziChart({ birthDate: tc.date }),
    ]) {
      assert.equal('lifePalace' in chart, false, `chart ${tc.id}`);
    }
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

test('胎元 carries no interpretation', () => {
  // Guards the ruling: display only. No Ten God, no polarity role, no score.
  assert.deepEqual(Object.keys(chart1.conceptionPalace).sort(), ['animal', 'branch', 'element', 'stem']);
});
