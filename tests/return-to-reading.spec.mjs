// ============================================================
// tests/return-to-reading.spec.mjs — coming back to your reading (Prompt BF)
// ============================================================
// Run: npm run test:return-to-reading
//
// Reyner's walk on the #199 preview, 2026-10-06: after a free reading at
// /r/<token> he opened /harga, then pressed the browser's back button or the
// header's "Bacaan Diri". Both landed on the empty birth-date form.
//
// THE BACK BUTTON. The funnel creates the reading on `/` and swaps the address to
// /r/<token> with `history.pushState` so the reading is bookmarkable without
// remounting. Next 15 patches pushState (node_modules/next/dist/client/components/
// app-router.js, `copyNextJsInternalHistoryState`) and copies the CURRENT entry's
// router tree into the new one, so the /r/<token> entry carries the tree of `/`.
// Back from /harga restores that tree: the home page mounts fresh at /r/<token>,
// `phase` starts at 'input', and she sees the form. The fix: the funnel reads the
// address it mounts at, and a fresh mount at /r/<token> opens that reading.
//
// Every "absent" assertion here is paired with a "present" one, so a page that lost
// the whole block cannot pass (CLAUDE.md, 2026-08-26).
// ============================================================

import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import Funnel, { Reading } from '../components/Funnel.jsx';
import { BirthFields } from '../components/BirthFields.jsx';
import Pasangan from '../components/Pasangan.jsx';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { CHROME_COPY } from '../lib/site/copy.js';
import { COMPAT_ROUTE } from '../lib/site/routes.js';
import { rememberReading, recallReading, forgetReading, LAST_READING_KEY } from '../lib/site/lastReading.js';
import { recallBirth, forgetBirth, rememberBirth } from '../lib/site/carryBirth.js';
import GLOSSARY from '../docs/content/glossary.json' with { type: 'json' };
import { makeSetField } from './helpers/setField.mjs';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, CHART_HEADING } from '../lib/pdf/build.js';
import { pageTexts } from '../lib/pdf/inspect.js';
import hooksContext from 'next/dist/shared/lib/hooks-client-context.shared-runtime.js';

const { PathnameContext } = hooksContext;

// ── §4, VERBATIM AS REYNER CONFIRMED THEM ──────────────────
const RULED = {
  resume_line: 'Bacaanmu masih tersimpan di perangkat ini.', // R1
  resume_open: 'Buka bacaanku', // R2
  resume_new: 'Mulai bacaan baru', // R3
  next_other_date: 'Baca tanggal lain', // R4
  bagan_intro: 'Empat pilar dari tanggal lahirmu. Pilar yang bertanda Inti Diri adalah intinya.', // K1
  hour_hint: 'Tidak tahu? Lewati saja.', // H1
  hour_missing: 'Jam lahir belum diisi, jadi Pilar Arah belum dihitung.', // H2
  hour_add: 'Tambahkan jam lahir', // H3
};
const OLD_BAGAN_INTRO = 'Empat lapisan energi dari tanggal lahirmu. Yang di tengah adalah intinya.';
const KONSEPSI_MEANING = GLOSSARY.pilar.conception.label_meaning;

const withHour = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const noHour = calculateBaziChart({ birthDate: '1989-09-13', birthTime: null });
const viewOf = (c) => mirrorChartView(c, buildSemanticJson(c));
const served = (chart, extra = {}) => ({
  token: 'tok123abc',
  chart,
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
  ...extra,
});
const SERVED = served(viewOf(withHour));
const TITLE = SERVED.chart.archetype.name_en;

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flush = () => act(async () => { for (let i = 0; i < 6; i += 1) await new Promise((r) => setTimeout(r, 0)); });

/** `routes` maps a URL substring to a response; the first match wins. */
function stubFetch(routes = {}) {
  const prev = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    calls.push({ url: u, method: opts?.method || 'GET' });
    const hit = Object.keys(routes).find((k) => u.includes(k));
    const r = hit ? routes[hit] : { status: 200, body: {} };
    return { ok: r.status < 400, status: r.status, json: async () => r.body };
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return {
    host,
    text: () => host.textContent || '',
    links: () => [...host.querySelectorAll('a')],
    unmount: async () => { await act(async () => root.unmount()); host.remove(); },
  };
}

beforeEach(() => {
  forgetReading();
  forgetBirth();
  window.history.replaceState(null, '', '/');
});

// ── §4: THE STRINGS ────────────────────────────────────────

test('§4: every new string is in CHROME_COPY verbatim, and the old Bagan line is gone', () => {
  for (const [key, value] of Object.entries(RULED)) {
    assert.equal(CHROME_COPY[key], value, `CHROME_COPY.${key}`);
  }
  assert.ok(!Object.values(CHROME_COPY).includes(OLD_BAGAN_INTRO), 'the "yang di tengah" line is replaced');
});

// ── §1a: THE BACK BUTTON ───────────────────────────────────

test('§1a: a fresh funnel mount AT /r/<token> opens that reading, not the form', async () => {
  window.history.replaceState(null, '', '/r/tok123abc');
  const f = stubFetch({
    '/api/mirror/tok123abc': { status: 200, body: SERVED },
    '/api/deliver/tok123abc': { status: 200, body: { paid: false, items: [] } },
  });
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.equal(ui.host.querySelector('form') === null, true, 'the birth-date form must not be what she sees');
    assert.ok(ui.text().includes(TITLE), 'her reading, by its archetype title');
    assert.ok(f.calls.some((c) => c.url.includes('/api/mirror/tok123abc')), 'the reading is fetched by its token');
  } finally { await ui.unmount(); f.restore(); }
});

// ── §1d: THE HEADER'S "Bacaan Diri" AFTER A RESTORE ─────────
// Found by the browser walk, not by the first version of this file: a restored funnel
// is the `/` page's component, so a client navigation to `/` keeps the instance, and
// it went on showing the reading at `/`. `usePathname` is Next's PathnameContext; the
// test provides it so the navigation can be expressed.
test('§1d: a navigation from /r/<token> to / shows the front door with the resume card', async () => {
  rememberReading({ token: 'tok123abc', title: TITLE });
  window.history.replaceState(null, '', '/r/tok123abc');
  const f = stubFetch({
    '/api/mirror/tok123abc': { status: 200, body: SERVED },
    '/api/deliver/tok123abc': { status: 200, body: { paid: false, items: [] } },
  });
  const at = (pathname) => React.createElement(PathnameContext.Provider, { value: pathname },
    React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => { root.render(at('/r/tok123abc')); });
    await flush();
    assert.equal(host.querySelector('form') === null, true, 'restored: the reading, not the form');
    assert.ok(host.textContent.includes(TITLE));

    window.history.replaceState(null, '', '/');
    await act(async () => { root.render(at('/')); });
    await flush();
    assert.ok(host.querySelector('form'), 'at / the front door shows');
    assert.ok(host.querySelector('[data-resume-card]'), 'with the resume card for the reading just left');

    window.history.replaceState(null, '', '/r/tok123abc');
    await act(async () => { root.render(at('/r/tok123abc')); });
    await flush();
    assert.equal(host.querySelector('form') === null, true, 'forward again: the reading');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    f.restore();
  }
});

// The second half of the walk's finding: Next renders the new tree BEFORE it writes the
// address, so a FRESH funnel mounted by a client navigation to `/` still finds
// /r/<token> in `window.location`. The router's pathname is the truth.
test('§1d: a fresh mount where the router says / and the window still says /r/<token> shows the form', async () => {
  window.history.replaceState(null, '', '/r/tok123abc');
  const f = stubFetch({ '/api/mirror/tok123abc': { status: 200, body: SERVED } });
  const ui = await mount(React.createElement(PathnameContext.Provider, { value: '/' },
    React.createElement(Funnel, { salesOpen: false, compatOpen: false })));
  try {
    await flush();
    assert.ok(ui.host.querySelector('form'), 'the front door, as the router says');
    assert.ok(!f.calls.some((c) => c.url.includes('/api/mirror/tok123abc')), 'the reading is not opened');
  } finally { await ui.unmount(); f.restore(); }
});

test('§1a: a funnel mount at / still shows the form (the control for the case above)', async () => {
  const f = stubFetch();
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.ok(ui.host.querySelector('form'), 'the front door');
  } finally { await ui.unmount(); f.restore(); }
});

// ── §1b: THE MEMORY ────────────────────────────────────────

test('§1b: the memory holds the token and the title, never a birth date, and survives storage throwing', () => {
  assert.equal(rememberReading({ token: 'tok123abc', title: TITLE, birthDate: '1989-09-13', date: '1989-09-13' }), true);
  const raw = window.localStorage.getItem(LAST_READING_KEY);
  assert.deepEqual(JSON.parse(raw), { token: 'tok123abc', title: TITLE });
  assert.ok(!/\d{4}-\d{2}-\d{2}/u.test(raw), 'no date-shaped value is stored');
  assert.deepEqual(recallReading(), { token: 'tok123abc', title: TITLE });
  forgetReading();
  assert.equal(recallReading(), null);

  const desc = Object.getOwnPropertyDescriptor(window, 'localStorage');
  Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    assert.equal(rememberReading({ token: 'tok123abc', title: TITLE }), false);
    assert.equal(recallReading(), null);
    assert.doesNotThrow(() => forgetReading());
  } finally { Object.defineProperty(window, 'localStorage', desc); }
});

test('§1b: creating a reading remembers its token and title on this device', async () => {
  const f = stubFetch({
    '/api/season-check': { status: 200, body: { needsHour: false } },
    '/api/mirror/newtok999': { status: 200, body: { ...SERVED, token: 'newtok999' } },
    '/api/mirror': { status: 201, body: { token: 'newtok999', chart: SERVED.chart } },
  });
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    const setField = makeSetField(ui.host, act, window);
    setField('#mirror-date', '1989-09-13');
    await act(async () => {
      ui.host.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush();
    assert.deepEqual(recallReading(), { token: 'newtok999', title: TITLE });
  } finally { await ui.unmount(); f.restore(); }
});

// ── §1c: THE RESUME CARD ───────────────────────────────────

test('§1c: with a remembered reading, the front door shows the resume card above the form', async () => {
  rememberReading({ token: 'tok123abc', title: TITLE });
  const f = stubFetch({ '/api/deliver/tok123abc': { status: 200, body: { paid: false, items: [] } } });
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    const card = ui.host.querySelector('[data-resume-card]');
    assert.ok(card, 'the resume card renders');
    assert.ok(card.textContent.includes(TITLE), 'it names the archetype');
    assert.ok(card.textContent.includes(RULED.resume_line), 'R1');
    const open = [...card.querySelectorAll('a')].find((a) => a.textContent.includes(RULED.resume_open));
    assert.ok(open, 'R2');
    assert.equal(open.getAttribute('href'), '/r/tok123abc');
    const form = ui.host.querySelector('form');
    assert.ok(form, 'the form is still there');
    assert.ok(card.compareDocumentPosition(form) & window.Node.DOCUMENT_POSITION_FOLLOWING, 'the card sits ABOVE the form');

    const fresh = [...card.querySelectorAll('button, a')].find((el) => el.textContent.includes(RULED.resume_new));
    assert.ok(fresh, 'R3');
    await act(async () => { fresh.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); });
    assert.equal(ui.host.querySelector('[data-resume-card]') === null, true, 'R3 hides the card');
    assert.equal(recallReading(), null, 'R3 clears the memory');
    assert.ok(ui.host.querySelector('form'), 'and the plain form remains');
  } finally { await ui.unmount(); f.restore(); }
});

test('§1c: a remembered token that no longer resolves is cleared silently', async () => {
  rememberReading({ token: 'gonetok77', title: TITLE });
  const f = stubFetch({ '/api/deliver/gonetok77': { status: 404, body: { error: 'not_found' } } });
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.equal(ui.host.querySelector('[data-resume-card]') === null, true);
    assert.equal(recallReading(), null);
    assert.ok(ui.host.querySelector('form'));
    assert.ok(!ui.text().includes(RULED.resume_line));
  } finally { await ui.unmount(); f.restore(); }
});

test('§1c: nothing remembered, no resume card', async () => {
  const f = stubFetch();
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.equal(ui.host.querySelector('[data-resume-card]') === null, true);
    assert.ok(!f.calls.some((c) => c.url.includes('/api/deliver/')), 'no lookup without a memory');
  } finally { await ui.unmount(); f.restore(); }
});

// ── §2: THE END OF THE FREE READING ────────────────────────

// AMENDMENT 1 §2 (Reyner, 2026-10-06): ONE next action. The block is R4 only, whatever
// COMPAT_SALES says; the compat card elsewhere on the page is unchanged, and the
// compat-open render below proves it is still there, so "absent" here cannot pass on a
// page that lost every compat surface.
test('§2: the next block is R4 only, after the offer, with compat closed AND open', async () => {
  const f = stubFetch();
  try {
    for (const compatOpen of [false, true]) {
      const ui = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true, compatOpen }));
      const state = compatOpen ? 'compat open' : 'compat closed';
      const block = ui.host.querySelector('[data-next-block]');
      assert.ok(block, `${state}: the next block renders`);
      const links = [...block.querySelectorAll('a')];
      assert.equal(links.length, 1, `${state}: one next action`);
      assert.ok(links[0].textContent.includes(RULED.next_other_date), `${state}: it is R4`);
      assert.equal(links[0].getAttribute('href'), '/');
      assert.equal(links.some((a) => a.getAttribute('href') === COMPAT_ROUTE), false, `${state}: no compat link in the block`);
      assert.ok(!block.textContent.includes(CHROME_COPY.compat_cta), `${state}: no compat CTA in the block`);
      const text = ui.text();
      assert.ok(text.indexOf('Ambil Complete Edition') > -1 && text.indexOf('Ambil Complete Edition') < text.indexOf(RULED.next_other_date), 'after the CE offer');
      // The control: the compat card itself follows the switch, untouched.
      assert.equal(text.includes(CHROME_COPY.compat_headline), compatOpen, `${state}: the compat card is unchanged`);
      await ui.unmount();
    }
  } finally { f.restore(); }
});

// ── §3: BAGAN KELAHIRAN ────────────────────────────────────

// AMENDMENT 2 §2 (Reyner, 2026-10-06): "Pilar Konsepsi off the web reading; stays in the
// PDF chart page and glossary." The card and its BF §3 caption confused the reader and
// nothing in the reading uses them (胎元 is display only, never in the semantic JSON).
// The view model is SHARED with the PDF, so it still carries the cell; only the web
// render drops it. The absent half is paired with the CE chart page printing it, so a
// change that dropped 胎元 everywhere cannot pass.
test('§3 + amendment 2 §2: K1 renders; no Pilar Konsepsi and no caption on the web reading; the CE chart page still prints it', async () => {
  const cp = SERVED.chart.conception_pillar;
  assert.equal(cp.label, GLOSSARY.pilar.conception.name_id, 'the shared view still carries the cell (the PDF reads it)');
  assert.equal(SERVED.chart.pillars.some((p) => p.hanzi === cp.hanzi), false, 'precondition: no pillar shares 胎元\'s characters');
  const f = stubFetch();
  const ui = await mount(React.createElement(Reading, { reading: SERVED, onReset() {} }));
  try {
    const text = ui.text();
    assert.ok(text.includes(RULED.bagan_intro), 'K1 renders (the Bagan section is there)');
    assert.ok(!text.includes(OLD_BAGAN_INTRO), 'the old line does not');
    for (const p of SERVED.chart.pillars) assert.ok(text.includes(p.palace), `control: ${p.palace} renders`);
    assert.ok(!/pilar konsepsi/iu.test(text), 'no Pilar Konsepsi on the web reading');
    assert.ok(!text.includes(cp.hanzi), 'no 胎元 cell');
    assert.equal(ui.host.querySelector('[data-conception-caption]') === null, true, 'no caption element');
    assert.ok(!text.includes(KONSEPSI_MEANING), 'no caption text');
  } finally { await ui.unmount(); f.restore(); }
  for (const file of ['components/Funnel.jsx', 'lib/mirror/view.js', 'lib/site/copy.js']) {
    assert.ok(!src(file).includes('Dihitung dari perkiraan masa pembuahan'), `${file} retypes the glossary sentence`);
  }

  // THE PRESENT HALF, on the chart page itself. "Pilar Konsepsi" also prints in the
  // glossary appendix, so a whole-document match would pass with the chart cell gone.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
  const semanticJson = buildSemanticJson(chart);
  const rendered = { ...assembleFallback(semanticJson), prompt_version: 'testprompt00', stage6_version: '1.17.0' };
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const pages = pageTexts(buffer);
  const chartPage = pages.find((t) => t.includes(CHART_HEADING) && t.includes(RULED.bagan_intro));
  assert.ok(chartPage, 'the CE has its chart page');
  assert.match(chartPage, /pilar konsepsi/iu, 'the CE chart page prints Pilar Konsepsi');
  assert.ok(chartPage.includes(cp.hanzi), 'with its 胎元 characters');
  assert.ok(pages.some((t) => t !== chartPage && t.includes(KONSEPSI_MEANING.slice(0, 30))), 'and the glossary entry stays');
});

// ── §3b: THE BIRTH HOUR ────────────────────────────────────

// AMENDMENT 1 §1 (Reyner, 2026-10-06): ONE hint under every hour field. The old accuracy
// line goes from BOTH forms, and H1 takes its place on the compat form too.
const OLD_HOUR_LINE = 'Tanpa jam tetap akurat, pakai jam jauh lebih presisi.';
function assertOneHintPerHourField(host, where) {
  const text = host.textContent || '';
  assert.ok(text.includes('Jam lahir · opsional'), `${where}: the label is unchanged (and the fields rendered)`);
  assert.ok(!text.includes(OLD_HOUR_LINE), `${where}: the old accuracy line is gone`);
  const hourFields = [...host.querySelectorAll('select[id$="-time"]')];
  assert.ok(hourFields.length >= 1, `${where}: an hour field renders`);
  assert.equal(text.split(RULED.hour_hint).length - 1, hourFields.length, `${where}: H1 exactly once per hour field`);
  for (const select of hourFields) {
    // The hint sits under the FIELD, which since Prompt BG §4 is the floating-label
    // wrapper around the select.
    const next = select.closest('[data-float]').nextElementSibling;
    assert.ok(next?.hasAttribute('data-hour-hint'), `${where}: H1 sits directly under #${select.id}`);
    assert.equal(next.textContent, RULED.hour_hint);
  }
}

test('§3b + amendment 1 §1: H1 is the only hint under the hour field, on the front door and the compat form', async () => {
  const f = stubFetch();
  try {
    const front = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
    assertOneHintPerHourField(front.host, 'front door');
    await front.unmount();

    const shared = await mount(React.createElement(BirthFields, { value: { date: '', time: '', gender: '' }, onChange() {}, idPrefix: 'a' }));
    assertOneHintPerHourField(shared.host, 'BirthFields as compat mounts it');
    await shared.unmount();

    const compat = await mount(React.createElement(Pasangan, {}));
    assertOneHintPerHourField(compat.host, 'compat form');
    await compat.unmount();
  } finally { f.restore(); }
});

// ── AMENDMENT 1 §3: THE HOUR FIELD IS VISIBLY THE TARGET ─────
// Measured on #200's preview build in headless Chrome: after the H3 arrival
// `document.activeElement` IS #mirror-time, but the window has no focus, Chrome does
// not match `:focus` in an unfocused document, and the rule never paints. iOS Safari
// ignores a programmatic focus() outright. So the field carries a mark that the same
// CSS rule styles, independent of whether focus() was honoured.
const TARGET = 'data-focus-target';

test('amendment 1 §3: after the H3 arrival the hour field carries the target mark; picking an hour removes it', async () => {
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  window.history.replaceState(null, '', '/?jam=tambah');
  const f = stubFetch();
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    const select = () => ui.host.querySelector('#mirror-time');
    assert.equal(select().hasAttribute(TARGET), true, 'marked after the H3 arrival');
    makeSetField(ui.host, act, window)('#mirror-time', '09:00');
    assert.equal(select().hasAttribute(TARGET), false, 'the mark goes once an hour is picked');
    makeSetField(ui.host, act, window)('#mirror-time', '');
    assert.equal(select().hasAttribute(TARGET), false, 'and does not come back');
  } finally { await ui.unmount(); f.restore(); }
});

test('amendment 1 §3: a normal front door has no target mark', async () => {
  const f = stubFetch();
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    const select = ui.host.querySelector('#mirror-time');
    assert.ok(select, 'the hour field renders (control)');
    assert.equal(select.hasAttribute(TARGET), false);
    assert.equal(ui.host.querySelectorAll(`[${TARGET}]`).length, 0);
  } finally { await ui.unmount(); f.restore(); }
});

test('amendment 1 §3: the target selector shares the select:focus rule in app/globals.css (source, not computed)', () => {
  const css = src('app/globals.css');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)].map((m) => ({
    selectors: m[1].replace(/\/\*[\s\S]*?\*\//gu, '').split(',').map((s) => s.trim()).filter(Boolean),
    body: m[2],
  }));
  const focusRule = rules.find((r) => r.selectors.includes('select:focus'));
  assert.ok(focusRule, 'the select:focus rule exists');
  assert.ok(/box-shadow:\s*0 0 0 3px var\(--emas-dim\)/u.test(focusRule.body), 'it is the gold ring rule');
  assert.ok(focusRule.selectors.includes(`select[${TARGET}]`), `select[${TARGET}] is in the same rule`);
  assert.equal(rules.filter((r) => r.selectors.some((s) => s.includes(TARGET))).length, 1, 'and in no other rule: no new treatment');
});

// ── AMENDMENT 2 §1: ARRIVING FROM H3, NO RESUME CARD ────────
// Cowork's walk of the #200 preview at 375x812: after H3 the front door led with the
// resume card, "Buka bacaanku" the dominant button and the marked hour field below the
// fold. On that arrival only, the card is not rendered; the memory is not cleared.
test('amendment 2 §1: the H3 arrival shows no resume card and keeps the memory; a plain visit to / shows the card', async () => {
  rememberReading({ token: 'tok123abc', title: TITLE });
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  window.history.replaceState(null, '', '/?jam=tambah');
  const f = stubFetch({ '/api/deliver/tok123abc': { status: 200, body: { paid: false, items: [] } } });
  const mounted = [];
  try {
    const arrival = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
    mounted.push(arrival);
    await flush();
    // The arrival happened (control): prefilled and marked, as before.
    assert.equal(arrival.host.querySelector('#mirror-date').getAttribute('data-value'), '1989-09-13', 'date prefilled');
    assert.equal(arrival.host.querySelector('#mirror-gender').value, 'female', 'gender prefilled');
    assert.equal(arrival.host.querySelector('#mirror-time').hasAttribute(TARGET), true, 'hour field marked');
    assert.equal(arrival.host.querySelector('[data-resume-card]') === null, true, 'no resume card on the H3 arrival');
    assert.ok(!arrival.text().includes(RULED.resume_open), 'no "Buka bacaanku"');
    assert.equal(recallReading()?.token, 'tok123abc', 'the remembered reading is NOT cleared');
    await mounted.pop().unmount();

    // The address is back to `/`; a later visit is a plain front door.
    assert.equal(window.location.pathname + window.location.search, '/');
    const later = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
    mounted.push(later);
    await flush();
    assert.ok(later.host.querySelector('[data-resume-card]'), 'a plain visit to / shows the card');
    assert.ok(later.text().includes(RULED.resume_open), 'with R2');
  } finally {
    for (const ui of mounted) await ui.unmount();
    f.restore();
  }
});

// The header's "Bacaan Diri" is a client <Link>, so a later visit to `/` can be the SAME
// funnel instance. The card must come back there too, not only on a fresh mount.
test('amendment 2 §1: the same instance shows the card again once the address moves away and back to /', async () => {
  rememberReading({ token: 'tok123abc', title: TITLE });
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  window.history.replaceState(null, '', '/?jam=tambah');
  const f = stubFetch({
    '/api/mirror/tok123abc': { status: 200, body: SERVED },
    '/api/deliver/tok123abc': { status: 200, body: { paid: false, items: [] } },
  });
  const at = (pathname) => React.createElement(PathnameContext.Provider, { value: pathname },
    React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => { root.render(at('/')); });
    await flush();
    assert.ok(host.querySelector('form'), 'the arrival front door');
    assert.equal(host.querySelector('[data-resume-card]') === null, true, 'no card on the arrival');

    window.history.replaceState(null, '', '/r/tok123abc');
    await act(async () => { root.render(at('/r/tok123abc')); });
    await flush();
    assert.equal(host.querySelector('form') === null, true, 'at /r/<token>: the reading');

    window.history.replaceState(null, '', '/');
    await act(async () => { root.render(at('/')); });
    await flush();
    assert.ok(host.querySelector('form'), 'back at / the front door');
    assert.ok(host.querySelector('[data-resume-card]'), 'and the card is back');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    f.restore();
  }
});

test('§3b: no hour given, H2 and H3 under the Bagan cards; hour given, nothing extra', async () => {
  const f = stubFetch();
  try {
    const reading = served(viewOf(noHour), { birthDate: '1989-09-13', gender: 'female' });
    assert.equal(reading.chart.hour_known, false);
    const without = await mount(React.createElement(Reading, { reading, onReset() {} }));
    const line = without.host.querySelector('[data-hour-missing]');
    assert.ok(line, 'H2 renders');
    assert.ok(line.textContent.includes(RULED.hour_missing));
    const add = [...line.querySelectorAll('a')].find((a) => a.textContent.includes(RULED.hour_add));
    assert.ok(add, 'H3 renders');
    const href = add.getAttribute('href');
    assert.ok(href.startsWith('/'), 'to the front door');
    assert.ok(!href.includes('1989'), 'no birth date in the address');
    // Carried in this tab, the way lib/site/carryBirth.js already carries it to compat.
    await act(async () => { add.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); });
    assert.deepEqual(recallBirth(), { date: '1989-09-13', time: '', gender: 'female' });
    await without.unmount();

    const withH = await mount(React.createElement(Reading, { reading: SERVED, onReset() {} }));
    assert.equal(SERVED.chart.hour_known, true);
    assert.equal(withH.host.querySelector('[data-hour-missing]') === null, true, 'hour given: nothing extra');
    assert.ok(!withH.text().includes(RULED.hour_missing));
    await withH.unmount();
  } finally { f.restore(); }
});

test('§3b: H3 lands on the front door with the date and gender prefilled and the hour field focused', async () => {
  const f = stubFetch();
  // The address H3 actually links to, read off the rendered reading.
  const page = await mount(React.createElement(Reading, { reading: served(viewOf(noHour), { birthDate: '1989-09-13', gender: 'female' }), onReset() {} }));
  const add = [...page.host.querySelectorAll('[data-hour-missing] a')].find((a) => a.textContent.includes(RULED.hour_add));
  assert.ok(add, 'H3 renders');
  await act(async () => { add.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); });
  const h3 = add.getAttribute('href');
  await page.unmount();
  window.history.replaceState(null, '', h3);
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.equal(ui.host.querySelector('#mirror-date').getAttribute('data-value'), '1989-09-13', 'date prefilled');
    assert.equal(ui.host.querySelector('#mirror-gender').value, 'female', 'gender prefilled');
    assert.equal(document.activeElement?.id, 'mirror-time', 'the hour field is focused');
    assert.equal(window.location.pathname + window.location.search, '/', 'the address is cleaned');
  } finally { await ui.unmount(); f.restore(); }
});

test('§3b: a plain front door visit does not prefill from the carry', async () => {
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  const f = stubFetch();
  const ui = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
  try {
    await flush();
    assert.equal(ui.host.querySelector('#mirror-date').getAttribute('data-value'), '', 'a fresh visit starts empty');
  } finally { await ui.unmount(); f.restore(); }
});
