// ============================================================
// Time-convention LOCK
// ============================================================
// This is NOT a timezone layer and it is NOT a test of timezone handling. It
// exists to prove the engine does NO time conversion at all.
//
// WHY
// Every fixture row in tests/bazi-validation.fixture.js is transcribed from Joey
// Yap's plotter, which is Katon's accuracy oracle. That plotter has no city
// field and no timezone field, so it applies neither UTC conversion nor True
// Solar Time / longitude correction — it reads the entered wall clock literally.
// Katon must not convert either, or it silently loses parity with its own oracle.
//
// Each case below sits close enough to a boundary that any conversion moves it:
//   1. 立春 1989 fires 04:27 (+08). A naive 04:00 keeps the PRIOR year (戊辰).
//      Shift the input an hour forward and the year pillar flips to 己巳.
//   2. 白露 1989 fires 23:53 (+08). A naive 23:30 keeps the 申 month.
//      Shift it forward and the month flips to 酉.
//   3. 晚子時 / 流派2: the day must NOT roll at 23:00. Day 甲子, hour 丙子.
//      tyme4ts's DEFAULT provider yields day 乙丑 here — this case is also the
//      lock on LunarSect2EightCharProvider being installed.
//
// If any of these shift by an hour, someone reintroduced timezone conversion.
//
// The 節 instants are asserted directly too. tyme4ts's JulianDay is UTC+8-based,
// NOT UT-based; hand-rolled JD arithmetic on top of it double-shifts by 8 hours
// and silently flips month branches. These asserts catch that.
//
// Run: node --test tests/time-convention.spec.ts
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SolarTerm } from 'tyme4ts';

import { computePillars } from '../lib/bazi/pillars.ts';

const str = (p: { stem: string; branch: string } | null) => (p ? `${p.stem}${p.branch}` : '——');

const chartOf = (date: string, time: string) => {
  const p = computePillars({ date, time });
  return [str(p.year), str(p.month), str(p.day), str(p.hour)].join(' ');
};

// ── 節 instants: UTC+8 wall clock, no double shift ──────────

test('立春 1989 lands at 1989-02-04 04:27 (+08)', () => {
  const at = SolarTerm.fromName(1989, '立春').getJulianDay().getSolarTime();
  assert.equal(at.getYear(), 1989);
  assert.equal(at.getMonth(), 2);
  assert.equal(at.getDay(), 4);
  assert.equal(at.getHour(), 4, 'an 8-hour delta means the UTC+8 Julian Day was double-shifted');
  assert.equal(at.getMinute(), 27);
});

test('白露 1989 lands at 1989-09-07 23:53 (+08)', () => {
  const at = SolarTerm.fromName(1989, '白露').getJulianDay().getSolarTime();
  assert.equal(at.getYear(), 1989);
  assert.equal(at.getMonth(), 9);
  assert.equal(at.getDay(), 7);
  assert.equal(at.getHour(), 23, 'an 8-hour delta means the UTC+8 Julian Day was double-shifted');
  assert.equal(at.getMinute(), 53);
});

// ── The three convention locks ─────────────────────────────

test('1989-02-04 04:00 → 戊辰 乙丑 乙未 戊寅 (naive time keeps the prior year)', () => {
  assert.equal(chartOf('1989-02-04', '04:00'), '戊辰 乙丑 乙未 戊寅');
});

test('1989-09-07 23:30 → 己巳 壬申 庚午 戊子 (naive time keeps the 申 month)', () => {
  assert.equal(chartOf('1989-09-07', '23:30'), '己巳 壬申 庚午 戊子');
});

test('1993-06-12 23:30 → 癸酉 戊午 甲子 丙子 (晚子時 / 流派2 provider)', () => {
  assert.equal(chartOf('1993-06-12', '23:30'), '癸酉 戊午 甲子 丙子');
});

// ── Conversion would be visible, not silent ────────────────
// Proof the cases above are actually load-bearing: feeding the WIB→CST offset
// (+1h) that a timezone layer would apply changes the answer. These assert the
// shifted values so the file documents exactly what breaks.

test('a +1h shift visibly breaks case 1 and case 2 — they are load-bearing', () => {
  assert.equal(chartOf('1989-02-04', '05:00').split(' ')[0], '己巳', 'year flips past 立春');
  assert.equal(chartOf('1989-09-08', '00:30').split(' ')[1], '癸酉', 'month flips past 白露');
});

// ── tz is accepted and ignored ─────────────────────────────

test('tz is accepted, persisted upstream, and never applied', () => {
  const bare = computePillars({ date: '1989-02-04', time: '04:00' });
  for (const tz of ['Asia/Jakarta', 'Asia/Shanghai', 'UTC', '+07:00', null]) {
    const withTz = computePillars({ date: '1989-02-04', time: '04:00', tz });
    assert.deepEqual(withTz, bare, `tz "${tz}" must not change the pillars`);
  }
});

// ── No-hour contract ───────────────────────────────────────

test('time: null yields hour: null and does not default to midnight', () => {
  const noHour = computePillars({ date: '1993-06-12', time: null });
  assert.equal(noHour.hour, null);

  // Midnight would have produced hour 甲子; the day pillar must be unaffected.
  assert.equal(str(noHour.day), '甲子');
  assert.equal(str(computePillars({ date: '1993-06-12', time: '00:00' }).hour), '甲子');
});

// ── Boundary flag ──────────────────────────────────────────

test('solarTerm fires within ±2 min of a 節 — the risk that moves the month pillar', () => {
  const nearJie = computePillars({ date: '1989-02-04', time: '04:26' });
  assert.equal(nearJie.boundary.solarTerm.flagged, true);
  assert.equal(nearJie.boundary.solarTerm.term, '立春');
  // Fractional: 立春 fires at 04:27:09, so 04:26 is 69 s = 1.15 min before it.
  assert.equal(nearJie.boundary.solarTerm.minutesFrom, -1.15);
  assert.equal(nearJie.boundary.hourEdge.flagged, false);
  assert.equal(nearJie.boundaryFlag, true);
  assert.match(nearJie.boundaryReason ?? '', /立春/);

  // 27 min away is not a boundary, even though it IS a 立春 day.
  const sameDayClear = computePillars({ date: '1989-02-04', time: '04:00' });
  assert.equal(sameDayClear.boundary.solarTerm.flagged, false);
  assert.equal(sameDayClear.boundaryFlag, false);
});

test('a round hour does NOT trip hourEdge — rounding is not precision', () => {
  // 09:00 IS the 巳時 edge. Flagging it would fire on a large share of all
  // charts and carry no information, so timeLikelyRounded suppresses it.
  const round = computePillars({ date: '1989-09-13', time: '09:00' });
  assert.equal(round.boundary.timeLikelyRounded, true);
  assert.equal(round.boundary.hourEdge.flagged, false);
  assert.equal(round.boundaryFlag, false);
  assert.equal(round.boundaryReason, undefined);

  // 09:30 is rounded too, and nowhere near an edge either way.
  const halfPast = computePillars({ date: '1989-09-13', time: '09:30' });
  assert.equal(halfPast.boundary.timeLikelyRounded, true);
  assert.equal(halfPast.boundaryFlag, false);
});

test('hourEdge fires only on a precise time near an edge', () => {
  const precise = computePillars({ date: '1989-09-13', time: '09:01' });
  assert.equal(precise.boundary.timeLikelyRounded, false);
  assert.equal(precise.boundary.hourEdge.flagged, true);
  assert.equal(precise.boundary.hourEdge.minutesFrom, 1);
  assert.equal(precise.boundary.solarTerm.flagged, false);
  assert.match(precise.boundaryReason ?? '', /時辰/);

  const away = computePillars({ date: '1989-09-13', time: '09:14' });
  assert.equal(away.boundary.hourEdge.flagged, false);
  assert.equal(away.boundary.hourEdge.minutesFrom, undefined);
  assert.equal(away.boundaryFlag, false);
});

test('no time on a 節 day flags solarTerm with no minutesFrom', () => {
  // The boundary is somewhere inside the day, so the uncertainty is a whole day
  // wide — not a near miss. minutesFrom would be meaningless here.
  const b = computePillars({ date: '1989-02-04', time: null }).boundary;
  assert.equal(b.solarTerm.flagged, true);
  assert.equal(b.solarTerm.term, '立春');
  assert.equal(b.solarTerm.minutesFrom, undefined);
  assert.equal(b.timeLikelyRounded, false, 'no time was entered, so nothing was rounded');

  // An ordinary day with no time flags nothing.
  const ordinary = computePillars({ date: '1989-09-13', time: null });
  assert.equal(ordinary.boundaryFlag, false);
});

test('boundaryFlag equals solarTerm.flagged || hourEdge.flagged', () => {
  for (const [date, time] of [
    ['1989-02-04', '04:26'], ['1989-09-13', '09:00'], ['1989-09-13', '09:01'],
    ['1989-09-13', '09:14'], ['1989-02-04', null], ['1993-06-12', '23:30'],
  ] as [string, string | null][]) {
    const p = computePillars({ date, time });
    assert.equal(
      p.boundaryFlag,
      p.boundary.solarTerm.flagged || p.boundary.hourEdge.flagged,
      `${date} ${time}`,
    );
  }
});
