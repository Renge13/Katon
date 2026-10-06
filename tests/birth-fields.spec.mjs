// ============================================================
// tests/birth-fields.spec.mjs — the date as three fields, and labels inside the fields
// ============================================================
// Run: npm run test:birth-fields
//
// Prompt BG §3 and §4 (Reyner, 2026-10-06). The native date picker becomes Tanggal /
// Bulan / Tahun in the ONE shared BirthFields, used by the front door and the compat
// form. The stored value stays `YYYY-MM-DD`. Impossible dates cannot be entered; the
// 1900-to-today rule is kept, with the existing message. Every field's label sits inside
// it and floats when focused or filled, a real <label> each time.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import Funnel from '../components/Funnel.jsx';
import Pasangan from '../components/Pasangan.jsx';
import {
  BirthFields, daysInMonth, composeDate, splitDate, DATE_RANGE_ERROR, EARLIEST_BIRTH_DATE, today,
} from '../components/BirthFields.jsx';
import { rememberBirth, forgetBirth } from '../lib/site/carryBirth.js';
import { makeSetField } from './helpers/setField.mjs';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return {
    host,
    q: (sel) => host.querySelector(sel),
    set: makeSetField(host, act, window),
    unmount: async () => { await act(async () => root.unmount()); host.remove(); },
  };
}

/** BirthFields with a parent holding the value, as both forms do. */
function Harness({ onDate }) {
  const [v, setV] = useState({ date: '', time: '', gender: '' });
  return React.createElement(BirthFields, {
    value: v, idPrefix: 't',
    onChange: (k, x) => { setV((prev) => ({ ...prev, [k]: x })); if (k === 'date') onDate(x); },
  });
}
async function harness() {
  const dates = [];
  const ui = await mount(React.createElement(Harness, { onDate: (d) => dates.push(d) }));
  const pick = (part, value) => ui.set(`#t-${part}`, value);
  return { ...ui, dates, pick, last: () => dates.at(-1) ?? '' };
}

// ── §3: THE CALENDAR ─────────────────────────────────────────

test('BG §3: the calendar - Februari by year, 30 and 31-day months, and an unknown year', () => {
  assert.equal(daysInMonth(2, '2000'), 29, '2000 is a leap year');
  assert.equal(daysInMonth(2, '1900'), 28, '1900 is not');
  assert.equal(daysInMonth(2, '1990'), 28);
  assert.equal(daysInMonth(2, '19'), 29, 'year still being typed: 29 allowed, the year decides');
  assert.equal(daysInMonth(4, '1990'), 30);
  assert.equal(daysInMonth(1, ''), 31);
  assert.equal(daysInMonth('', ''), 31, 'no month yet');
});

test('BG §3: a valid date round-trips; impossible dates compose to nothing', () => {
  assert.deepEqual(splitDate('1989-09-13'), { day: '13', month: '9', year: '1989' });
  assert.equal(composeDate(splitDate('1989-09-13')), '1989-09-13');
  assert.equal(composeDate({ day: '29', month: '2', year: '2000' }), '2000-02-29');
  assert.equal(composeDate({ day: '31', month: '2', year: '1990' }), '', '31 Februari');
  assert.equal(composeDate({ day: '29', month: '2', year: '1990' }), '', '29 Februari, common year');
  assert.equal(composeDate({ day: '31', month: '4', year: '1990' }), '', '31 April');
  assert.equal(composeDate({ day: '5', month: '3', year: '199' }), '', 'a year still being typed');
  assert.deepEqual(splitDate('not-a-date'), { day: '', month: '', year: '' });
  assert.deepEqual(splitDate('1990-02-31'), { day: '', month: '', year: '' }, 'an impossible stored date opens empty');
});

// ── §3: THE FIELDS ───────────────────────────────────────────

test('BG §3: Tanggal / Bulan / Tahun store YYYY-MM-DD; the year is typed, numeric, with bday autocomplete', async () => {
  const ui = await harness();
  try {
    const day = ui.q('#t-day'); const month = ui.q('#t-month'); const year = ui.q('#t-year');
    assert.equal(day.tagName, 'SELECT');
    assert.equal(month.tagName, 'SELECT');
    assert.equal(year.tagName, 'INPUT');
    assert.equal(year.getAttribute('inputmode'), 'numeric');
    assert.deepEqual([day, month, year].map((el) => el.getAttribute('autocomplete')), ['bday-day', 'bday-month', 'bday-year']);
    assert.equal(ui.q('input[type="date"]'), null, 'no native date picker');
    assert.deepEqual([...month.options].slice(1).map((o) => o.textContent),
      ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']);

    await ui.pick('day', '13'); await ui.pick('month', '9');
    assert.equal(ui.last(), '', 'incomplete: nothing stored yet');
    await ui.pick('year', '1989');
    assert.equal(ui.last(), '1989-09-13', 'stored as YYYY-MM-DD');
    assert.equal(ui.q('#t-date').getAttribute('data-value'), '1989-09-13');
  } finally { await ui.unmount(); }
});

test('BG §3: 31 then Februari clears the day; 29 Februari survives a leap year only', async () => {
  const ui = await harness();
  try {
    await ui.pick('day', '31'); await ui.pick('year', '1990'); await ui.pick('month', '2');
    assert.equal(ui.q('#t-day').value, '', '31 Februari: the day is cleared, never clamped');
    assert.equal(ui.last(), '');
    assert.equal([...ui.q('#t-day').options].at(-1).value, '28', 'Februari 1990 offers 28 days');

    await ui.pick('day', '29');
    assert.equal(ui.q('#t-day').value, '', '29 is not offered in Februari 1990');
    await ui.pick('year', '2000'); await ui.pick('day', '29');
    assert.equal(ui.last(), '2000-02-29', '29 Februari 2000 is a real date');
    await ui.pick('year', '2001');
    assert.equal(ui.q('#t-day').value, '', 'and a common year clears it again');
    assert.equal(ui.last(), '');
  } finally { await ui.unmount(); }
});

test('BG §3: out of range keeps the 1900-to-today rule, with the existing message', async () => {
  assert.equal(DATE_RANGE_ERROR, 'Periksa lagi tanggalnya. Katon menghitung kelahiran dari tahun 1900 sampai hari ini.');
  assert.equal(EARLIEST_BIRTH_DATE, '1900-01-01');
  const ui = await harness();
  try {
    const year = () => ui.q('#t-year');
    await ui.pick('day', '1'); await ui.pick('month', '1'); await ui.pick('year', '1899');
    assert.equal(ui.last(), '1899-01-01', 'a real date, stored, so the forms can say why it is refused');
    assert.equal(year().validationMessage, DATE_RANGE_ERROR, 'before 1900: refused with the existing message');
    assert.equal(year().checkValidity(), false);

    const next = String(Number(today().slice(0, 4)) + 1);
    await ui.pick('year', next);
    assert.equal(year().validationMessage, DATE_RANGE_ERROR, 'a future year: refused');

    await ui.pick('year', '1989');
    assert.equal(year().validationMessage, '', 'in range: accepted (the control)');
    assert.equal(year().checkValidity(), true);
  } finally { await ui.unmount(); }
});

test('BG §3: the front door and the compat form use the same three fields', async () => {
  const front = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    for (const part of ['day', 'month', 'year']) assert.ok(front.q(`#mirror-${part}`), `front door #mirror-${part}`);
    assert.ok(front.q('#mirror-date[data-date-group]'));
  } finally { await front.unmount(); }
  const compat = await mount(React.createElement(Pasangan, {}));
  try {
    for (const part of ['day', 'month', 'year']) assert.ok(compat.q(`#a-${part}`), `compat #a-${part}`);
  } finally { await compat.unmount(); }
  assert.equal(src('components/PasanganSteps.jsx').includes('bday-'), false, 'compat declares no date field of its own');
  assert.equal(src('components/Funnel.jsx').includes('bday-'), false, 'nor does the front door');
});

test('BG §3: H3 still prefills the date into the three fields, and the gender, and marks the hour', async () => {
  forgetBirth();
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  window.history.replaceState(null, '', '/?jam=tambah');
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    assert.equal(ui.q('#mirror-day').value, '13');
    assert.equal(ui.q('#mirror-month').value, '9');
    assert.equal(ui.q('#mirror-year').value, '1989');
    assert.equal(ui.q('#mirror-gender').value, 'female');
    assert.equal(ui.q('#mirror-time').hasAttribute('data-focus-target'), true, 'the hour field is still the target');
  } finally { await ui.unmount(); forgetBirth(); window.history.replaceState(null, '', '/'); }
});

// ── §4: FLOATING LABELS ──────────────────────────────────────

test('BG §4: every field has a real label inside a floating wrapper, filled state follows the value, no placeholders', async () => {
  const ui = await harness();
  try {
    for (const id of ['t-day', 't-month', 't-year', 't-time', 't-gender']) {
      const control = ui.q(`#${id}`);
      const wrap = control.closest('[data-float]');
      assert.ok(wrap, `#${id} sits in a floating-label wrapper`);
      const label = wrap.querySelector(`label[for="${id}"]`);
      assert.ok(label && label.textContent.trim(), `#${id} has a real <label>`);
      assert.equal(control.hasAttribute('placeholder'), false, `#${id} is not placeholder-labelled`);
      assert.equal(wrap.hasAttribute('data-filled'), false, `#${id} starts unfilled`);
    }
    assert.equal(ui.q('label[for="t-time"]').textContent, 'Jam lahir · opsional', '"· opsional" stays in the label');
    assert.equal(ui.q('label[for="t-gender"]').textContent, 'Jenis kelamin · opsional');
    const group = ui.q('#t-date');
    assert.equal(group.getAttribute('role'), 'group');
    assert.equal(ui.q(`#${group.getAttribute('aria-labelledby')}`).textContent, 'Tanggal lahir', 'the group is "Tanggal lahir" to a screen reader');

    await ui.pick('day', '13');
    assert.equal(ui.q('#t-day').closest('[data-float]').hasAttribute('data-filled'), true, 'filled floats the label');
    await ui.set('#t-time', '09:00');
    assert.equal(ui.q('#t-time').closest('[data-float]').hasAttribute('data-filled'), true);
    const hint = ui.q('#t-time').closest('[data-float]').nextElementSibling;
    assert.ok(hint?.hasAttribute('data-hour-hint'), 'H1 still sits directly under the hour field');
  } finally { await ui.unmount(); }
});

test('BG §4: both compat nickname fields float their labels too', async () => {
  const s = src('components/PasanganSteps.jsx');
  assert.match(s, /<FloatField id=\{`\$\{s\.side\}-nickname`\} label=\{PASANGAN_COPY\.nickname_label\}/u,
    'the nickname input, rendered once per side (A and B), is wrapped in FloatField');
});

test('BG §4: the floating rule floats on focus OR filled and adds no colour', () => {
  const css = src('app/globals.css');
  const start = css.indexOf('.k-float {');
  const block = css.slice(start, css.indexOf('.k-sr-only', start));
  assert.ok(start > -1, 'the .k-float rules exist');
  assert.match(block, /\.k-float:focus-within > label,\s*\.k-float\[data-filled\] > label \{/u);
  assert.equal(/#[0-9a-f]{3,8}\b|rgba?\(/iu.test(block), false, 'no new colour: only existing variables');
});
