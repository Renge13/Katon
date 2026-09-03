// ============================================================
// tests/funnel-submit-guard.spec.mjs — one submit, one reading
// ============================================================
// The anticipation takeover is gone. During `calculating` the reader stays on the
// form and the submit button carries the state, so for the first time in this
// project's life THE SUBMIT CONTROL IS STILL ON SCREEN WHILE A CREATE IS IN
// FLIGHT. That is the whole point of the change and it is also the new hazard.
//
// ── WHY THE COUNT, AND NOT THE LABEL ───────────────────────
// Reyner's prompt is explicit: "a test that only checks the button's label passes
// on the defect." A build that renders `Menyiapkan...` on a button that still
// dispatches is exactly the bug, and it is invisible to a label assertion. So the
// proposition asserted here is a COUNT of network calls across a second submit.
//
// The consequence being prevented is not cosmetic. A second submit is a second
// `POST /api/mirror`, which is a second row and a second `reading_created` event
// under a different reading_id - it inflates the denominator of the demand test
// during the week that test is being measured.
//
// ── SHOWN RED BEFORE THE CHANGE ────────────────────────────
// Two runs, and the second is the load-bearing one.
//
// RUN 1, against `f24242d` (the takeover still full-screen):
//
//     ✖ the form survives `calculating`, and a second submit creates nothing
//       AssertionError: the form must still be on screen during `calculating`
//     ✖ the busy button says `Menyiapkan...`, and says it where she is looking
//     ✖ the season gate stays put while its answer is in flight
//       actual: 'Membaca tanggal lahirmu'   expected: /Hari yang jarang/
//     ✖ the anticipation component and its copy are gone from the module
//     4 of 5 failing
//
// That red is real but WEAK: every one of those fails on ABSENCE, which any build
// that merely keeps <Home> mounted would satisfy - including one with no guard at
// all, which is precisely the defect. So RUN 2 was taken against the finished
// change with ONLY the `if (busy) return` deleted from `onSubmit`, leaving the
// `Menyiapkan...` label and the `disabled` attribute both in place:
//
//     ✖ the form survives `calculating`, and a second submit creates nothing
//       AssertionError [ERR_ASSERTION]: a second submit must not re-run the gate
//       check
//         actual: 3,
//         expected: 1,
//     ✔ the busy button says `Menyiapkan...`, and says it where she is looking
//     ✔ the season gate stays put while its answer is in flight
//     ✔ the anticipation component and its copy are gone from the module
//
// THE OTHER THREE STAYED GREEN, and that is the whole point of recording it: a
// build with the right label on a properly dimmed button that still fires three
// creates passes every assertion in this file except the count. Both runs are
// quoted in the commit message.
//
// ── WHAT THIS FILE DOES NOT TEST ───────────────────────────
// jsdom has no layout and no CSS animation, so nothing here says the busy state
// LOOKS right. `disabled` is asserted as an attribute, not as a dimmed pixel.
// Reyner walks the funnel on a phone; this suite being green means the double
// create is impossible, and nothing more.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import Funnel from '../components/Funnel.jsx';

// A REAL chart, from the engine, under the same key the route returns it. A
// hand-written stub was not attempted: tests/share-sheet.spec.mjs records what
// that costs, and <Reading> reaches into day_master, element_presence and the
// pillars deeply enough that a stub would fail for the wrong proposition.
const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));

/**
 * Stub every endpoint the funnel touches and COUNT the calls.
 *
 * `hold` keeps `POST /api/mirror` in flight for as long as the test wants, which
 * is what makes a "second submit while calculating" expressible at all. Without
 * it the create resolves between the two submits and the second one is a
 * different scenario entirely - the one where a reader taps a button that is no
 * longer there.
 */
function stubFetch({ needsHour = false } = {}) {
  const rec = { seasonCheck: 0, create: 0, serve: 0, release: null };
  const held = new Promise((r) => { rec.release = r; });
  const prev = globalThis.fetch;

  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    if (u.includes('/api/season-check')) {
      rec.seasonCheck += 1;
      return { json: async () => (needsHour
        ? { needsHour: true, term: 'Lichun', at: '04:27', hour: 4, minute: 27 }
        : { needsHour: false }) };
    }
    if (u === '/api/mirror' && opts?.method === 'POST') {
      rec.create += 1;
      await held;
      return { json: async () => ({ token: `tok${rec.create}`, chart: CHART_VIEW }) };
    }
    if (u.startsWith('/api/mirror/')) {
      // the event beacon shares this prefix and is not a serve
      if (u.endsWith('/event')) return { json: async () => ({ ok: true }) };
      rec.serve += 1;
      return { json: async () => ({
        token: 'tok1', chart: CHART_VIEW, blocks: [], penutup: '', card: null,
      }) };
    }
    return { json: async () => ({}) };
  };
  rec.restore = () => { globalThis.fetch = prev; };
  return rec;
}

function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(Funnel)));
  return {
    host,
    form: () => host.querySelector('form'),
    submitButton: () => host.querySelector('button[type="submit"]'),
    text: () => host.textContent,
    setField: (sel, value) => act(() => {
      const el = host.querySelector(sel);
      const proto = Object.getPrototypeOf(el);
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
    }),
    // A real submit event, which is what a second tap produces. Dispatched on the
    // FORM rather than clicked on the button on purpose: a click on a disabled
    // button is swallowed by the DOM, so clicking would prove the browser's
    // behaviour rather than the component's guard.
    submit: () => act(() => {
      host.querySelector('form')?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }));
    }),
    click: (el) => act(() => el.dispatchEvent(
      new window.MouseEvent('click', { bubbles: true }))),
    settle: async (ms = 5) => { await act(async () => {
      await new Promise((r) => setTimeout(r, ms)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

/**
 * THE 2.5s FLOOR IS GONE, AND WITH IT THIS FILE'S ONLY REASON TO BE SLOW.
 *
 * `onSubmit` used to race `/api/season-check` against `delay(2500)` in a
 * `Promise.all`, so nothing past the gate decision happened for two and a half
 * seconds and every test here had to wait it out - about 3s each. Commit 3
 * deleted the pause (it was scaffolding for the anticipation screen commit 1
 * removed), so the flow is now bounded by the stubbed fetches alone.
 *
 * WHAT KEEPS THE "SECOND SUBMIT" SCENARIO EXPRESSIBLE is not the floor and never
 * was: `stubFetch` holds `POST /api/mirror` open until the test releases it. That
 * is the window a real second tap lands in, and it is independent of any timer.
 */

/** Fill the front door with a date the engine accepts, and submit once. */
async function submitBirthDate(ui, { date = '1989-09-13', time = '04:00' } = {}) {
  ui.setField('input[type="date"]', date);
  if (time) ui.setField('input[type="time"]', time);
  ui.submit();
  await ui.settle();
}

// ── THE PROPOSITION ────────────────────────────────────────

test('the form survives `calculating`, and a second submit creates nothing', async () => {
  const f = stubFetch();
  const ui = mount();
  try {
    await submitBirthDate(ui);

    // The premise. Asserted FIRST and explicitly, because every assertion below
    // it is vacuous without it: on a build that replaces the form with a
    // full-screen takeover there is nothing left to submit twice, and a bare
    // "no second POST" would pass on the takeover for the wrong reason.
    assert.notEqual(ui.form(), null,
      'the form must still be on screen during `calculating`');

    const btn = ui.submitButton();
    assert.notEqual(btn, null, 'the submit button must still be on screen');
    assert.equal(btn.disabled, true,
      'a reader who sees no feedback taps again; disabled is the feedback');

    // She taps again. Twice, because impatience does not stop at one. Both land
    // INSIDE the 2.5s floor, which is the real window a second tap arrives in.
    ui.submit();
    ui.submit();
    await ui.settle();

    // The early tell: season-check is issued first and a second flow would double
    // it, so this catches a runaway submit before any create has resolved.
    assert.equal(f.seasonCheck, 1, 'a second submit must not re-run the gate check');

    // Now let the first flow finish, and count what actually reached the server.
    f.release();
    await ui.settle(30);

    assert.equal(f.create, 1,
      'a second submit must not create a second reading - that is a second row '
      + 'and a second reading_created event under a different reading_id');
    assert.equal(f.seasonCheck, 1, 'nor a second season-check');
  } finally { ui.unmount(); f.restore(); }
});

test('the busy button says `Menyiapkan...`, and says it where she is looking', async () => {
  const f = stubFetch();
  const ui = mount();
  try {
    await submitBirthDate(ui);
    assert.match(ui.submitButton().textContent, /Menyiapkan/,
      'the button carries the state now that nothing replaces the screen');
    // The takeover is gone, not relocated: none of its copy may survive.
    assert.doesNotMatch(ui.text(), /Membaca tanggal lahirmu|Menyusun empat pilarmu/,
      'the anticipation lines were deleted, not moved');

    // Walked to completion rather than abandoned: unmounting on top of an
    // in-flight create left a setState firing into a dead root and the test hung
    // for 40s. A test that leaves its own flow running is measuring the teardown,
    // not the component.
    f.release();
    await ui.settle(30);

    // The reading replaced the form; the busy label must not be what she is left
    // reading anywhere on the page.
    assert.equal(ui.form(), null, 'the reading replaces the form on success');
    assert.doesNotMatch(ui.text(), /Menyiapkan\.\.\./);
  } finally { ui.unmount(); f.restore(); }
});

// ── THE SEASON PATH: ~12 DAYS A YEAR, AND THE ONE THAT BREAKS ──
//
// `calculating` is entered a SECOND time from onSeasonAnswer, and at that point
// there is no form to return to. Falling back to <Home> would throw her backwards
// past a question she has just answered, so the gate has to hold its own busy
// state. This path will not appear in casual testing, which is why it is asserted
// rather than walked.

test('the season gate stays put while its answer is in flight', async () => {
  const f = stubFetch({ needsHour: true });
  const ui = mount();
  try {
    // No hour: the turn is a whole day wide, so the gate is unconditional.
    await submitBirthDate(ui, { date: '1989-02-04', time: null });

    // The gate is up. Its own heading is the marker; `Hari yang jarang` is the
    // eyebrow it has carried since the promotion.
    assert.match(ui.text(), /Hari yang jarang/, 'the season gate must be showing');

    const before = [...ui.host.querySelectorAll('button')]
      .find((b) => /Aku tidak yakin/.test(b.textContent));
    ui.click(before);
    await ui.settle();

    // STILL THE GATE. Not <Home>, which would be a question she already answered,
    // and not a takeover, which is the thing being deleted.
    assert.match(ui.text(), /Hari yang jarang/,
      'the gate must hold its own busy state rather than fall back to the form');
    assert.equal(ui.form(), null, 'falling back to the form would rewind her');

    // A second answer, from the same impatience as a second submit. This one is
    // ALREADY guarded, by <SeasonGate>'s own `busy` - it had one before this
    // commit, for its own double-answer case. Asserted anyway, because deleting
    // the takeover is what makes those buttons reachable a second time at all,
    // and an existing guard that nothing holds in place is a guard on its way out.
    const again = [...ui.host.querySelectorAll('button')]
      .find((b) => /Aku tidak yakin/.test(b.textContent));
    if (again) ui.click(again);
    await ui.settle();

    f.release();
    await ui.settle(30);
    assert.equal(f.create, 1, 'a second answer must not create a second reading');
  } finally { ui.unmount(); f.restore(); }
});

test('the anticipation component and its copy are gone from the module', async () => {
  // A grep, executed rather than remembered - the repo convention is that a
  // code-fact carries the command that produced it.
  //
  // The patterns are DECLARATIONS, not the bare word. `ANTICIPATION` appears in a
  // comment in the deleting commit itself, explaining why the screen went, and a
  // bare /ANTICIPATION/ matched that comment - a check that fires on the record of
  // its own subject being removed. Booleans rather than assert.doesNotMatch(src,
  // ...) for the same reason share-sheet keeps its messages short: a failed
  // doesNotMatch prints the entire 72k file into the run output, which buries the
  // four other reds this file exists to show.
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../components/Funnel.jsx', import.meta.url), 'utf8');
  assert.equal(/function Anticipation/.test(src), false, 'the component is deleted');
  assert.equal(/const ANTICIPATION\s*=/.test(src), false, 'its copy array is deleted');
  assert.equal(/Membaca tanggal lahirmu/.test(src), false, 'its strings are deleted');
  assert.equal(/k-ring/.test(src), false, 'the ripple rings go with it');
});
