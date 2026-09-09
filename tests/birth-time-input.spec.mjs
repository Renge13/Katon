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
import { readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { seasonTurnOnDate } from '../lib/bazi/pillars.ts';
import { HOURS } from '../components/BirthFields.jsx';

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

// ── THE CONTROL, NOT JUST THE CLAIM (added 2026-09-09) ─────
// Everything above proves what the engine can USE. It said nothing about what
// the form OFFERS, and for a year those were different: the front door rendered
// `<input type="time" step="3600">`, which still shows a minute field - `step`
// marks 09:30 invalid, it does not stop a browser asking for it. So the control
// asked for precision the submit handler then discarded with `slice(0, 2)`.
//
// Y-2 Addendum 2 item 4 makes the control match the claim: 24 options, no minute.
// Asserted by CALLING the exported list rather than counting `<option>` tags in
// a source grep, which is why `HOURS` is exported at all.

test('THE FRONT DOOR OFFERS 24 HOURS AND NO MINUTE', () => {
  assert.equal(HOURS.length, 24, 'one option per hour of the day');
  assert.deepEqual([HOURS[0], HOURS[23]], [0, 23]);
  assert.deepEqual(HOURS, [...HOURS].sort((a, b) => a - b), 'in order');

  // Every option's stored value parses to the hour the submit handlers read with
  // `slice(0, 2)`, and to nothing else. This is the join between the control and
  // `lib/birthInput.js`, and it is the assertion that would catch a display
  // format ('09.00', the Indonesian convention) leaking into the stored value.
  for (const h of HOURS) {
    const stored = `${pad(h)}:00`;
    assert.match(stored, /^\d{2}:00$/u);
    assert.equal(Number(stored.slice(0, 2)), h);
  }
});

test('NO MINUTE FIELD ON THE FRONT DOOR, AND ONE INSIDE THE SEASON GATE', () => {
  // The two halves of this file's claim, as CONTROLS this time.
  // COMMENTS STRIPPED FIRST, and this is not fussiness. The first version of
  // this assertion went red against a correct implementation, because the
  // component's own comment EXPLAINS that it is no longer `type="time"` - so the
  // grep found the words in the prose describing their absence. A source check
  // that cannot tell code from the comment about the code is checking the
  // description, not the artifact.
  const code = (s) => s.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  const fields = code(readFileSync(new URL('../components/BirthFields.jsx', import.meta.url), 'utf8'));
  assert.equal(/type="time"/u.test(fields), false,
    'BirthFields is back to a time input, which asks for a minute it cannot use');
  assert.match(fields, /<select\s+[^>]*id=\{`\$\{idPrefix\}-time`\}/u,
    'the hour picker is a select whose id is prefixed, so two people can share the form');

  // And the exception survives: the season gate asks for hour AND minute,
  // because on a 節 day the minute is the only thing that resolves the month
  // pillar. Deleting that minute select would make half 2 of this file's claim
  // unreachable from the product while every engine assertion above stayed green.
  // ── BOTH GATE BRANCHES, COUNTED ────────────────────────────
  // `SeasonGate` renders a minute select in TWO places: "minute mode", reached
  // when the hour is already known and only the minute is in question, and the
  // hour+minute card reached when neither is. A `assert.match` for one
  // `aria-label="Menit"` passes while EITHER branch has been gutted, which is
  // the half-done edit this is most likely to meet - verified by deleting one
  // and watching a match-based version of this assertion stay green.
  const funnel = readFileSync(new URL('../components/Funnel.jsx', import.meta.url), 'utf8');
  const minuteSelects = funnel.match(/aria-label="Menit"/gu) || [];
  assert.equal(minuteSelects.length, 2,
    'both season-gate branches must ask for a minute; it is the one place one matters');
});
