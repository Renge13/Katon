// ============================================================
// tests/birth-time-input.spec.mjs — what the front door is allowed to ask for
// ============================================================
// The birth-time input asks for a DATE and an HOUR, and asks for a MINUTE only
// inside the season gate. That is not a UI preference, it is a claim about the
// engine, and this file is the claim written down so it fails if it stops being
// true. Measured 2026-08-12, pinned 2026-08-13.
//
// The claim has two halves:
//
//   1. Off a solar-term day, a minute cannot move a single pillar. Every 時辰
//      opens on an exact odd hour, so the whole hour shares one hour pillar and
//      the other three do not read the clock at all. A minute field on the front
//      door would collect precision that has nowhere to go.
//
//   2. ON a solar-term day it can move TWO pillars, because the 節 instant sits
//      at a minute inside some hour. That is the exception the season gate
//      exists for, and it is why the gate is now reached with an hour in hand
//      as well as without one (components/Funnel.jsx, onSubmit).
//
// If half 1 ever fails, the front door is silently rounding away something real
// and the minute field has to come back. If half 2 fails, the gate has stopped
// being necessary. Neither is a UI bug; both are engine changes.

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { seasonTurnOnDate } from '../lib/bazi/pillars.ts';

const pad = (n) => String(n).padStart(2, '0');
const pillars = (date, time) => {
  const c = calculateBaziChart({ birthDate: date, birthTime: time });
  return ['year', 'month', 'day', 'hour'].map((k) => (c[k] ? c[k].stem + c[k].branch : '--')).join(' ');
};

// Four ordinary dates, deliberately spread across seasons and decades. None of
// them carries a 節 — asserted below rather than assumed, because a date that
// quietly acquired one would turn this whole sweep into a tautology.
const ORDINARY_DATES = ['1990-06-15', '2001-11-03', '1975-03-21', '1988-09-09'];

test('the sweep dates are genuinely ordinary (no 節 falls inside them)', () => {
  for (const date of ORDINARY_DATES) {
    assert.equal(seasonTurnOnDate(date), null, `${date} carries a season turn`);
  }
});

test('off a solar-term day, no minute moves any pillar', () => {
  let checked = 0;
  for (const date of ORDINARY_DATES) {
    for (let h = 0; h < 24; h++) {
      const onTheHour = pillars(date, `${pad(h)}:00`);
      for (let mi = 1; mi < 60; mi++) {
        checked++;
        assert.equal(
          pillars(date, `${pad(h)}:${pad(mi)}`), onTheHour,
          `${date} ${pad(h)}:${pad(mi)} differs from ${pad(h)}:00`,
        );
      }
    }
  }
  assert.equal(checked, ORDINARY_DATES.length * 24 * 59); // 5664
});

test('時辰 boundaries sit on exact hours, so the hour is the whole question', () => {
  // The last minute of one 時辰 and the first of the next: same date, adjacent
  // minutes, different hour pillar. This is what makes the hour load-bearing and
  // the minute inert either side of it.
  assert.equal(pillars('1990-06-15', '14:59'), pillars('1990-06-15', '14:00'));
  assert.notEqual(pillars('1990-06-15', '15:00'), pillars('1990-06-15', '14:59'));
});

test('on a 節 day the minute moves TWO pillars — the season gate exception', () => {
  // 1989-02-04 is 立春, and CLAUDE.md rule 6 pins the turn at 04:27 (+08).
  const before = pillars('1989-02-04', '04:00');
  const after = pillars('1989-02-04', '04:30');
  assert.notEqual(before, after);
  assert.equal(before.startsWith('戊辰 乙丑'), true, before);
  assert.equal(after.startsWith('己巳 丙寅'), true, after);
});

test('the 節 instant carries SECONDS, so 04:27 is still before it', () => {
  // 立春 1989 fires at 04:27:09 (lib/bazi/pillars.ts). A birth at 04:27:00 is
  // therefore genuinely pre-term and the pillars flip at 04:28, not at 04:27.
  // Inclusivity is intended: this asserts the boundary is read to the second
  // rather than rounded to the displayed minute.
  assert.equal(pillars('1989-02-04', '04:27'), pillars('1989-02-04', '04:00'));
  assert.notEqual(pillars('1989-02-04', '04:28'), pillars('1989-02-04', '04:27'));
});

test('seasonTurnOnDate reports the hour the funnel compares against', () => {
  // The funnel gates on `birthHour === turn.hour`, so `hour` must be the turn's
  // own hour as a NUMBER, agreeing with the `at` string it displays.
  const turn = seasonTurnOnDate('1989-02-04');
  assert.notEqual(turn, null);
  assert.equal(turn.term, '立春');
  assert.equal(turn.hour, 4);
  assert.equal(turn.minute, 27);
  assert.equal(turn.at, '04:27');
});

test('only the hour containing the turn is ambiguous', () => {
  // Every OTHER hour of a 節 day sits cleanly on one side, which is what lets
  // the gate stay silent for 23 of the 24. Checked across the whole day: within
  // any hour that is not the turn's, the minute changes nothing.
  const turn = seasonTurnOnDate('1989-02-04');
  for (let h = 0; h < 24; h++) {
    if (h === turn.hour) continue;
    const onTheHour = pillars('1989-02-04', `${pad(h)}:00`);
    for (let mi = 1; mi < 60; mi++) {
      assert.equal(
        pillars('1989-02-04', `${pad(h)}:${pad(mi)}`), onTheHour,
        `1989-02-04 ${pad(h)}:${pad(mi)} differs from ${pad(h)}:00`,
      );
    }
  }
});
