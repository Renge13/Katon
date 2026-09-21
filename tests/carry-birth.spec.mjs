// ============================================================
// tests/carry-birth.spec.mjs — she does not type her birth date twice
// ============================================================
// Run: npm run test:carry-birth
//
// Closes the DEFERRED REGISTER row `?dari=<token> DOES NOT PREFILL COMPAT STEP 1`
// (docs/PROGRESS.md, added 2026-09-09), which names both the harm and the remedy:
//
//   "A reader arriving from her own free reading retypes her own birth date
//    before she can buy, and nothing measures how many stop there."
//   unblocked by: "A CLIENT-SIDE `sessionStorage` WRITE at funnel submit, read on
//    step 1 mount. No payload change, no server change, no birth data crossing a
//    network boundary it does not already cross."
//
// ── WHY THIS DRIVES BOTH REAL COMPONENTS ──────────────────
// The proposition is a HANDOFF, and a handoff is the one thing neither side can
// be tested for alone. A test that wrote the storage itself and mounted only
// `Pasangan` would prove the reader works; a test that mounted only `Funnel` would
// prove the writer runs. Both would pass with the two sides using different keys
// or different shapes - which is the entire failure mode. So the mirror funnel is
// submitted for real, and then the compat form is mounted for real, and nothing in
// between is stubbed but the network.
//
// It is also what made this test writable BEFORE the implementation: it imports
// only components that already existed, so its first run went red on an assertion
// about an empty field rather than on a missing module.
//
// ── WHAT IS DELIBERATELY NOT ASSERTED ─────────────────────
// That step 1 AUTO-ADVANCES once prefilled. Y-2's prompt asked for "prefills step 1
// and starts on step 2" and the second half stays unbuilt: a reader must see the
// birth date she is about to buy a reading against, and skipping her past it is a
// choice she can SEE, which makes it Reyner's (rule 9) and not this commit's. The
// step-1-stays-open assertion below is therefore a real assertion, not an omission.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { makeSetField } from './helpers/setField.mjs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import Funnel from '../components/Funnel.jsx';
import Pasangan from '../components/Pasangan.jsx';
import { rememberBirth, recallBirth } from '../lib/site/carryBirth.js';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));

const BIRTH = { date: '1989-09-13', time: '09:00', gender: 'female' };

/** Every endpoint both components touch. The season gate says no unless asked. */
function stubFetch({ needsHour = false } = {}) {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    if (u.includes('/api/season-check')) {
      return { json: async () => (needsHour
        ? { needsHour: true, term: 'Lichun', at: '04:27', hour: 4, minute: 27 }
        : { needsHour: false }) };
    }
    if (u === '/api/mirror' && opts?.method === 'POST') {
      return { json: async () => ({ token: 'tok1', chart: CHART_VIEW }) };
    }
    if (u.startsWith('/api/mirror/')) {
      if (u.endsWith('/event')) return { json: async () => ({ ok: true }) };
      return { json: async () => ({
        token: 'tok1', chart: CHART_VIEW, blocks: [], penutup: '', card: null,
      }) };
    }
    if (u === '/api/pair') return { json: async () => ({ id: 'pair1' }) };
    return { json: async () => ({}) };
  };
  return { restore: () => { globalThis.fetch = prev; } };
}

function mount(Component, props = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(Component, props)));
  return {
    host,
    text: () => host.textContent,
    setField: makeSetField(host, act, window),
    submit: () => act(() => {
      host.querySelector('form')?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }));
    }),
    settle: async (ms = 5) => {
      await act(async () => { await new Promise((r) => setTimeout(r, ms)); });
    },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

/** Submit the mirror funnel exactly as a reader does. */
async function walkTheFunnel(birth = BIRTH) {
  const ui = mount(Funnel);
  try {
    ui.setField('#mirror-date', birth.date);
    if (birth.time) ui.setField('#mirror-time', birth.time);
    if (birth.gender) ui.setField('#mirror-gender', birth.gender);
    ui.submit();
    await ui.settle(30);
  } finally { ui.unmount(); }
}

const clearStorage = () => {
  try { window.sessionStorage.clear(); } catch { /* nothing to clear */ }
};

// ── THE HANDOFF ────────────────────────────────────────────

test('HER BIRTH CARRIES FROM THE MIRROR FUNNEL INTO COMPAT STEP 1', async () => {
  const f = stubFetch();
  clearStorage();
  try {
    await walkTheFunnel();

    const ui = mount(Pasangan, { initialA: { readingId: 'tok1' } });
    try {
      // THE FIELDS, not a storage key. What the reader sees is the proposition;
      // the key is an implementation detail neither side should be tested on.
      assert.equal(ui.host.querySelector('#a-date')?.value, BIRTH.date, 'her date is there');
      assert.equal(ui.host.querySelector('#a-time')?.value, BIRTH.time, 'and her hour');
      assert.equal(ui.host.querySelector('#a-gender')?.value, BIRTH.gender, 'and her gender');
    } finally { ui.unmount(); }
  } finally { f.restore(); clearStorage(); }
});

test('STEP 1 STAYS OPEN, PREFILLED - SHE IS NOT SKIPPED PAST HER OWN BIRTH', async () => {
  // The half of Y-2's sentence that is deliberately NOT built. A prefilled value
  // she never saw is worse than a blank she types: it is a claim about her that
  // she did not make, on the form that takes her money.
  const f = stubFetch();
  clearStorage();
  try {
    await walkTheFunnel();
    const ui = mount(Pasangan, { initialA: { readingId: 'tok1' } });
    try {
      assert.ok(ui.host.querySelector('#a-date'), 'step 1 is open');
      assert.equal(ui.host.querySelector('#b-date'), null, 'step 2 has not been jumped to');
    } finally { ui.unmount(); }
  } finally { f.restore(); clearStorage(); }
});

test('ONLY HER SIDE IS PREFILLED - THE OTHER PERSON IS STILL A STRANGER', async () => {
  // A carried birth is A's. If it ever reached B the reader would buy a reading
  // of herself against herself, and the summary would look plausible while being
  // nonsense. Asserted by walking to step 2 and finding it empty.
  const f = stubFetch();
  clearStorage();
  try {
    await walkTheFunnel();
    const ui = mount(Pasangan, { initialA: { readingId: 'tok1' } });
    try {
      ui.submit();
      await ui.settle();
      assert.ok(ui.host.querySelector('#b-date'), 'step 2 opened off the prefilled step 1');
      assert.equal(ui.host.querySelector('#b-date').value, '', "B's date is empty");
      assert.equal(ui.host.querySelector('#b-time')?.value ?? '', '', "B's hour is empty");
    } finally { ui.unmount(); }
  } finally { f.restore(); clearStorage(); }
});

// ── AND WHAT MUST STILL BE TRUE WITH NOTHING CARRIED ──────

test('NOTHING CARRIED MEANS AN EMPTY FORM, NOT A BROKEN ONE', async () => {
  // The ordinary case for anyone who did not come from a reading in this tab:
  // a new device, a cleared session, a shared link. `?dari` still carries only a
  // reference, which is the original row's point and stays true.
  const f = stubFetch();
  clearStorage();
  try {
    const ui = mount(Pasangan, { initialA: { readingId: 'tok1' } });
    try {
      assert.ok(ui.host.querySelector('#a-date'), 'step 1 is open');
      assert.equal(ui.host.querySelector('#a-date').value, '', 'and empty');
      assert.equal(ui.host.querySelector('#b-date'), null, 'step 2 not jumped to');
    } finally { ui.unmount(); }
  } finally { f.restore(); clearStorage(); }
});

test('A SESSION STORE THAT THROWS IS AN EMPTY FORM, NOT A BLANK PAGE', async () => {
  // Private windows, blocked site data and embedded webviews all make the
  // accessor THROW rather than return null. An unguarded read there takes the
  // whole compat form down - and it would do it only for the readers whose
  // browsers are least ordinary, which is the worst possible sample to break.
  const f = stubFetch();
  clearStorage();
  const real = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    get() { throw new Error('SecurityError: access denied'); },
  });
  try {
    const ui = mount(Pasangan, { initialA: { readingId: 'tok1' } });
    try {
      assert.ok(ui.host.querySelector('#a-date'), 'the form still renders');
      assert.equal(ui.host.querySelector('#a-date').value, '', 'empty, and nothing threw');
    } finally { ui.unmount(); }
  } finally {
    if (real) Object.defineProperty(window, 'sessionStorage', real);
    f.restore();
  }
});

test('A CORRUPTED STORED VALUE IS SANITISED AT THE READ, NOT AT THE INPUT', async () => {
  // ── WHY THIS IS A UNIT ASSERTION AND NOT A RENDERED ONE ───
  // The first version of this test stored `{"date":"not-a-date"}` and asserted the
  // date input came back empty. IT PASSED WITH THE VALIDATION DELETED, and the
  // falsification pass caught it: `<input type="date">` rejects a malformed value
  // on its own, so the assertion was measuring jsdom's sanitiser rather than this
  // repo's. A test the platform passes for you is worse than no test.
  //
  // So the validation is asserted where it lives. The values below are the ones
  // that MATTER rather than the ones that are easy: a numeric `time` is the
  // dangerous shape, because `form.time.slice(0, 2)` runs on it in two places
  // (`gateFor` and `birthBody`) and a number has no `.slice` - that is a TypeError
  // on submit, not a cosmetic glitch.
  clearStorage();
  try {
    assert.equal(recallBirth(), null, 'nothing stored, nothing carried');

    const store = (raw) => {
      rememberBirth(BIRTH);
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        window.sessionStorage.setItem(window.sessionStorage.key(i), raw);
      }
    };

    store('{"date":"not-a-date","time":"09:00"}');
    assert.equal(recallBirth(), null, 'a malformed date is not a carry at all');

    store('{"date":"1989-09-13","time":99,"gender":"female"}');
    assert.deepEqual(recallBirth(), { date: '1989-09-13', time: '', gender: 'female' },
      'a numeric time is dropped, and the fields around it survive');

    store('{"date":"1989-09-13","time":"09:00","gender":"../../etc"}');
    assert.deepEqual(recallBirth(), { date: '1989-09-13', time: '09:00', gender: '' },
      'a gender outside the two option values is dropped');

    store('not json at all');
    assert.equal(recallBirth(), null, 'a truncated write is not a crash');

    store('"a bare string"');
    assert.equal(recallBirth(), null, 'nor is a value of the wrong type');
  } finally { clearStorage(); }
});

test('THE HOUR CARRIED IS THE ONE THAT MADE THE CHART, not the one she first typed', async () => {
  // ── THE SEASON GATE CHANGES THE ANSWER ────────────────────
  // On a 節 day with no hour given, the funnel asks, and `answer({ birthTime })`
  // re-creates the reading with the hour she supplies. `createReading` therefore
  // has TWO candidate times - its `birthTime` argument (null here) and
  // `resolution.birthTime` (hers) - and only the second one made this chart.
  //
  // Carrying the wrong one would prefill compat with a birth that produced a
  // DIFFERENT reading than the one she just read, which is the kind of wrong that
  // looks right. Added after the falsification pass showed that swapping in
  // `form.time` left every other test in this file green.
  const f = stubFetch({ needsHour: true });
  clearStorage();
  try {
    const ui = mount(Funnel);
    try {
      // No hour at the front door, so the gate opens asking which side of the turn.
      ui.setField('#mirror-date', '1989-02-04');
      ui.setField('#mirror-gender', 'female');
      ui.submit();
      await ui.settle(30);

      const byText = (label) => [...ui.host.querySelectorAll('button')]
        .find((b) => (b.textContent || '').trim() === label);
      const remember = byText('Aku ingat jam lahirku');
      assert.ok(remember, `the gate offers the exact-hour path; saw: ${ui.text().slice(0, 200)}`);
      await act(async () => {
        remember.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });

      ui.setField('select[aria-label="Jam"]', '7');
      ui.setField('select[aria-label="Menit"]', '30');
      const lanjut = byText('Lanjut');
      assert.ok(lanjut, 'the exact-hour form offers Lanjut');
      await act(async () => {
        lanjut.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });
      await ui.settle(30);
    } finally { ui.unmount(); }

    assert.deepEqual(recallBirth(), { date: '1989-02-04', time: '07:30', gender: 'female' },
      "the gate's hour is what carried, not the empty one she submitted with");
  } finally { f.restore(); clearStorage(); }
});
