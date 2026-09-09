// ============================================================
// tests/pasangan-steps.spec.mjs — 1 Kamu, 2 Dia, 3 Email
// ============================================================
// Y-2 commit 2, ruling 3. The prompt names the propositions: "step order,
// summary line, edit reopens, B gate copy, `?dari` prefill." Four of the five
// are below. The fifth is answered rather than asserted, and the reason is in
// THE `?dari` PROPOSITION at the foot of this file.
//
// ── MOUNTED, NOT GREPPED ───────────────────────────────────
// A stepper is a state machine and its defects are transitions: a step that
// advances without its gate, an Ubah that submits the form instead of reopening
// a card, a summary that renders the OTHER person's birth. None of that is
// visible in source. So this drives the real component in jsdom, with
// `/api/season-check` stubbed, and reads what is on screen.
//
// ── WHAT IT DOES NOT TEST ──────────────────────────────────
// jsdom has no layout and no stylesheet, so nothing here says the completed
// cards LOOK flattened or that the step badges carry different accents. Those
// are `--emas`/`--senja` inline values asserted as strings at most; Reyner walks
// the preview for whether it reads as a stepper.

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { makeSetField } from './helpers/setField.mjs';
import Pasangan from '../components/Pasangan.jsx';
import { stepComplete, STEPS } from '../components/PasanganSteps.jsx';
import { CHROME_COPY, PASANGAN_COPY } from '../lib/site/copy.js';
import { birthSummary } from '../lib/site/birthSummary.js';
import { GENDER_WORDS } from '../components/BirthFields.jsx';

/**
 * `/api/season-check` answers NO by default. `turn` makes it say yes for one
 * date, which is how the gate is reached without a real solar-term calendar.
 */
function stubFetch({ turn = null } = {}) {
  const prev = globalThis.fetch;
  const calls = { seasonCheck: 0, pair: 0, pay: 0 };
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    if (u.includes('/api/season-check')) {
      calls.seasonCheck += 1;
      const body = JSON.parse(opts?.body || '{}');
      return { json: async () => (turn && body.birthDate === turn.birthDate
        ? { needsHour: true, term: turn.term, at: turn.at, hour: turn.hour }
        : { needsHour: false }) };
    }
    if (u === '/api/pair') { calls.pair += 1; return { json: async () => ({ id: 'pair1' }) }; }
    if (u.startsWith('/api/pay/')) { calls.pay += 1; return { json: async () => ({ ok: true, mock: false }) }; }
    return { json: async () => ({}) };
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

function mount(props = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(Pasangan, props)));
  const ui = {
    host,
    text: () => host.textContent,
    setField: makeSetField(host, act, window),
    submit: () => act(() => {
      host.querySelector('form')?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }));
    }),
    /** The visible button whose label is `label`, or null. */
    button: (label) => [...host.querySelectorAll('button')]
      .find((b) => (b.textContent || '').trim() === label) || null,
    click: (el) => act(() => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))),
    settle: async (ms = 5) => { await act(async () => {
      await new Promise((r) => setTimeout(r, ms)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
  return ui;
}

/** Fill the open birth step and press Lanjut. */
async function fillStep(ui, side, { date, time = '', gender = '' }) {
  ui.setField(`#${side}-date`, date);
  if (time) ui.setField(`#${side}-time`, time);
  if (gender) ui.setField(`#${side}-gender`, gender);
  ui.submit();
  await ui.settle();
}

// ── STEP ORDER ─────────────────────────────────────────────

test('ONE STEP IS OPEN AT A TIME, AND THEY OPEN IN ORDER', async () => {
  const f = stubFetch();
  const ui = mount();
  try {
    // Step 1 open: A's fields exist, B's and the email do not.
    assert.ok(ui.host.querySelector('#a-date'), 'step 1 is open');
    assert.equal(ui.host.querySelector('#b-date'), null, 'step 2 is not open yet');
    assert.equal(ui.host.querySelector('#pair-email'), null, 'step 3 is not open yet');

    // All three LABELS are visible from the start - a stepper that hides its own
    // length is a progress bar with no end, and the reader is about to be asked
    // for someone else's birth date. She should see that coming.
    for (const s of STEPS) assert.ok(ui.text().includes(s.label), `${s.label} is listed`);

    await fillStep(ui, 'a', { date: '1989-09-13', time: '09:00', gender: 'male' });
    assert.equal(ui.host.querySelector('#a-date'), null, 'step 1 collapsed');
    assert.ok(ui.host.querySelector('#b-date'), 'step 2 opened');
    assert.equal(ui.host.querySelector('#pair-email'), null, 'step 3 still closed');

    await fillStep(ui, 'b', { date: '1990-03-04' });
    assert.equal(ui.host.querySelector('#b-date'), null, 'step 2 collapsed');
    assert.ok(ui.host.querySelector('#pair-email'), 'step 3 opened');
  } finally { ui.unmount(); f.restore(); }
});

test('A STEP CANNOT BE LEFT WITHOUT ITS ONE REQUIRED FIELD', async () => {
  // Validation per step, not on submit (ruling 3). Pinned on the predicate AND
  // on the rendered button, because a disabled button with no predicate behind
  // it is a styling choice and a predicate with no button is unreachable.
  assert.equal(stepComplete(1, { a: { date: '' }, b: {}, email: '' }), false);
  assert.equal(stepComplete(1, { a: { date: '1989-09-13' }, b: {}, email: '' }), true);
  assert.equal(stepComplete(3, { a: {}, b: {}, email: '' }), false);
  assert.equal(stepComplete(3, { a: {}, b: {}, email: 'x@y.z' }), true);

  const f = stubFetch();
  const ui = mount();
  try {
    assert.equal(ui.button(CHROME_COPY.step_next).disabled, true, 'Lanjut is dead with no date');
    ui.setField('#a-date', '1989-09-13');
    await ui.settle();
    assert.equal(ui.button(CHROME_COPY.step_next).disabled, false, 'and live once there is one');

    // And the submit is inert too: a form dispatch with an empty step must not
    // advance, or the disabled attribute is the only thing holding the line.
    ui.setField('#a-date', '');
    await ui.settle();
    ui.submit();
    await ui.settle();
    assert.ok(ui.host.querySelector('#a-date'), 'step 1 is still open');
    assert.equal(f.calls.seasonCheck, 0, 'and nothing was asked about an empty date');
  } finally { ui.unmount(); f.restore(); }
});

// ── THE SUMMARY LINE ───────────────────────────────────────

test('A COMPLETED STEP COLLAPSES TO ITS OWN ONE-LINE SUMMARY', async () => {
  const f = stubFetch();
  const ui = mount();
  try {
    await fillStep(ui, 'a', { date: '1989-09-13', time: '09:00', gender: 'male' });
    assert.ok(ui.text().includes('13 Sep 1989, 09.00, Laki-laki'),
      `step 1's summary is missing from: ${ui.text().slice(0, 400)}`);

    // B's summary must be B's. The two people are the thing this whole screen is
    // about telling apart, so a summary keyed to the wrong side is the defect
    // worth the most here.
    await fillStep(ui, 'b', { date: '1990-03-04', gender: 'female' });
    assert.ok(ui.text().includes('4 Mar 1990'), "step 2's summary is B's date");
    assert.ok(ui.text().includes('13 Sep 1989'), "and A's stays on screen");
  } finally { ui.unmount(); f.restore(); }
});

test('NO HOUR SAYS SO; NO GENDER DOES NOT', () => {
  const opts = { timeUnknown: CHROME_COPY.summary_time_unknown, genderWords: GENDER_WORDS };
  assert.equal(birthSummary({ date: '1989-09-13', time: '09:00', gender: 'male' }, opts),
    '13 Sep 1989, 09.00, Laki-laki');

  // The hour is the fourth pillar. Its absence is NAMED, so a reader cannot pay
  // without noticing she skipped the one optional field that changes what she
  // gets.
  assert.equal(birthSummary({ date: '1989-09-13', time: '', gender: 'female' }, opts),
    `13 Sep 1989, ${CHROME_COPY.summary_time_unknown}, Perempuan`);

  // Gender feeds the card footer and nothing the reading renders, so its absence
  // is SILENT rather than announced.
  assert.equal(birthSummary({ date: '1989-09-13', time: '09:00', gender: '' }, opts),
    '13 Sep 1989, 09.00');
  assert.equal(birthSummary({ date: '', time: '', gender: '' }, opts), null);

  // Parsed by splitting, never through `new Date()`: `new Date('1989-09-13')` is
  // UTC midnight and prints as the 12th anywhere west of Greenwich.
  assert.equal(birthSummary({ date: '2001-01-01', time: '00:00' }, opts),
    `1 Jan 2001, 00.00`);
});

// ── EDIT REOPENS ───────────────────────────────────────────

test('UBAH REOPENS THE STEP IT NAMES, AND DOES NOT SUBMIT THE FORM', async () => {
  const f = stubFetch();
  const ui = mount();
  try {
    await fillStep(ui, 'a', { date: '1989-09-13', time: '09:00' });
    await fillStep(ui, 'b', { date: '1990-03-04' });
    assert.ok(ui.host.querySelector('#pair-email'), 'on step 3');

    const edit = ui.button(CHROME_COPY.step_edit);   // the FIRST Ubah is step 1's

    // ── THE ATTRIBUTE, NOT THE CONSEQUENCE ────────────────────
    // A button inside a `<form>` defaults to `type="submit"`, so without this
    // Ubah would submit the form it sits in and advance the very step it was
    // reopening. That consequence is NOT assertable here: jsdom does not run
    // implicit form submission for a synthetic `click`, so deleting
    // `type="button"` leaves every behavioural assertion in this test green -
    // measured, by deleting it. So the attribute itself is the assertion, and
    // the browser is where the behaviour is checked.
    assert.equal(edit.type, 'button',
      'Ubah must not be a submit button; inside a form it would advance the step it reopens');

    const before = f.calls.seasonCheck;
    ui.click(edit);
    await ui.settle();

    assert.ok(ui.host.querySelector('#a-date'), 'step 1 reopened');
    assert.equal(ui.host.querySelector('#pair-email'), null, 'and step 3 closed behind it');
    assert.equal(f.calls.seasonCheck, before, 'Ubah asked nothing and advanced nothing');

    // The values survive: reopening to check a date must not clear it.
    assert.equal(ui.host.querySelector('#a-date').value, '1989-09-13');
    assert.equal(ui.host.querySelector('#a-time').value, '09:00');
  } finally { ui.unmount(); f.restore(); }
});

// ── THE GATE, INSIDE ITS STEP, WITH B'S OWN SENTENCE ───────

test("THE SEASON GATE OPENS INSIDE ITS STEP, AND B GETS B'S SENTENCE", async () => {
  const f = stubFetch({ turn: { birthDate: '1990-03-04', term: 'Jingzhe', at: '04:27', hour: 4 } });
  const ui = mount();
  try {
    // A is an ordinary date and passes straight through.
    await fillStep(ui, 'a', { date: '1989-09-13', time: '09:00' });
    assert.equal(ui.text().includes(PASANGAN_COPY.season_gate_b_intro), false,
      "A's step must not carry B's intro");

    // B's date carries a turn, so advancing opens the gate rather than step 3.
    await fillStep(ui, 'b', { date: '1990-03-04' });
    assert.equal(ui.host.querySelector('#pair-email'), null,
      'the gate must block step 3, not sit beside it');
    assert.ok(ui.text().includes(PASANGAN_COPY.season_gate_b_intro),
      `B's gate must carry B's own sentence; got: ${ui.text().slice(0, 500)}`);

    // A's summary is STILL on screen while B is being asked, which is the whole
    // point of moving the gate inside the step: it used to take over the page.
    assert.ok(ui.text().includes('13 Sep 1989'), "A's summary survives B's gate");
  } finally { ui.unmount(); f.restore(); }
});

// ── THE `?dari` PROPOSITION, ANSWERED RATHER THAN ASSERTED ──

test('`?dari` PREFILLS NOTHING, BECAUSE THERE IS NOTHING TO PREFILL', async () => {
  // ── THE PROMPT IS WRONG HERE AND THIS IS THE RECORD ────────
  // Y-2 commit 2 says "`?dari=<token>` prefills step 1 and starts on step 2".
  // It cannot. `GET /api/mirror/<token>` returns NO birth data - the free card is
  // built with `birthDate: null` precisely so nothing about a birth leaves the
  // server on that path - so `PasanganFromQuery` has only a reading id to carry,
  // and says so in its own comment.
  //
  // Starting on step 2 would render a COMPLETED step 1 summarising an empty
  // birth. This test pins the honest behaviour so the prompt's sentence cannot
  // be implemented later without meeting it.
  const f = stubFetch();
  const ui = mount({ initialA: { readingId: 'tok1' } });
  try {
    assert.ok(ui.host.querySelector('#a-date'), 'step 1 is open, not skipped');
    assert.equal(ui.host.querySelector('#a-date').value, '', 'and it is empty');
    assert.equal(ui.host.querySelector('#b-date'), null, 'step 2 has not been jumped to');
  } finally { ui.unmount(); f.restore(); }
});
