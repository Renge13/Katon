// ============================================================
// tests/post-purchase.spec.mjs — after the first real purchase (Prompt BE, 2026-10-06)
// ============================================================
// Run: npm run test:post-purchase
//
// Reyner, after the first real Rp 19.000 purchase:
//   §3a  back from checkout, the page lands on the card and download section - by an
//        anchor id, and ONLY once the page has confirmed paid, never on the marker alone;
//   §3b  under the download buttons, his guide line G1, shown only after paid;
//   §4   a slim pay bar fixed to the bottom, shown only AFTER the offer has been seen
//        once, hidden while the offer itself is on screen, gone for good once paid.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { buildCardData } from '../lib/card/cardData.js';
import { ReadingByToken } from '../components/Funnel.jsx';

const G1 = 'Pembayaran berhasil. Ketuk tombol unduh di bawah untuk menyimpan PDF dan kartu ke perangkatmu. File akan tersimpan otomatis di aplikasi Files (folder Downloads) pada iPhone, atau aplikasi File Manager (folder Unduhan) pada Android.';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const semanticJson = buildSemanticJson(chart);
const SERVED = {
  token: 'tok1',
  chart: mirrorChartView(chart, semanticJson),
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
  meta: { cached: false, source: 'gemini' },
};

function stub({ paid }) {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (u === '/api/deliver/tok1/card') return ok({ token: 'tok1', card: buildCardData({ chart, semanticJson, birthDate: '1989-09-13', gender: 'female' }) });
    if (u.endsWith('/reconcile') && (opts.method || 'GET') === 'POST') return ok({ paid });
    if (u === '/api/deliver/tok1') {
      return ok(paid
        ? { paid: true, items: [{ item: 'card', ready: true }, { item: 'pdf', ready: true }] }
        : { paid: false, items: [] });
    }
    if (u.startsWith('/api/mirror/')) return ok(SERVED);
    return ok({});
  };
  return () => { globalThis.fetch = prev; };
}

/** Records every scrollIntoView call by the element's id. jsdom has none of its own. */
function recordScrolls() {
  const calls = [];
  const prev = window.Element.prototype.scrollIntoView;
  window.Element.prototype.scrollIntoView = function scrollIntoView() { calls.push(this.id || this.tagName); };
  return { calls, restore: () => { window.Element.prototype.scrollIntoView = prev; } };
}

async function mount({ query = '' } = {}) {
  window.history.replaceState({}, '', `/r/tok1${query}`);
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(ReadingByToken, { token: 'tok1', salesOpen: true })); });
  for (let i = 0; i < 8; i += 1) {
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  return {
    host,
    unmount: () => { act(() => root.unmount()); host.remove(); window.history.replaceState({}, '', '/'); },
  };
}

// ── §3a ──────────────────────────────────────────────────────

test('§3a BACK FROM CHECKOUT AND PAID: the page lands on the card and download section (#unduh)', async () => {
  const restore = stub({ paid: true });
  const scrolls = recordScrolls();
  const ui = await mount({ query: '?bayar=selesai' });
  try {
    assert.ok(ui.host.querySelector('#unduh'), 'the delivery section carries the anchor id');
    assert.ok(scrolls.calls.includes('unduh'), `scrolled to #unduh; calls: ${JSON.stringify(scrolls.calls)}`);
  } finally { ui.unmount(); scrolls.restore(); restore(); }
});

test('§3a THE MARKER ALONE NEVER SCROLLS: back from checkout but not paid stays where it is', async () => {
  const restore = stub({ paid: false });
  const scrolls = recordScrolls();
  const ui = await mount({ query: '?bayar=selesai' });
  try {
    assert.equal(ui.host.querySelector('#unduh'), null, 'no delivery section while unpaid');
    assert.equal(scrolls.calls.includes('unduh'), false, 'no scroll on the marker alone');
  } finally { ui.unmount(); scrolls.restore(); restore(); }
});

test('§3a A PAID READING REOPENED WITHOUT THE MARKER does not jump to the download section', async () => {
  const restore = stub({ paid: true });
  const scrolls = recordScrolls();
  const ui = await mount();
  try {
    assert.ok(ui.host.querySelector('#unduh'), 'precondition: the delivery is open');
    assert.equal(scrolls.calls.includes('unduh'), false);
  } finally { ui.unmount(); scrolls.restore(); restore(); }
});

// ── §3b ──────────────────────────────────────────────────────

// G1 IS REPLACED (Reyner, 2026-10-06, on #199): no standing paragraph. After the buyer taps
// "Unduh PDF" or "Simpan Kartu", one line appears directly under the tapped button, and
// nothing shows before a tap.
const STARTED = 'Unduhan dimulai. Filenya biasanya ada di aplikasi Files, folder Downloads (iPhone), atau aplikasi File Manager, folder Unduhan (Android).';
const buttonNamed = (host, label) => [...host.querySelectorAll('button')].find((b) => b.textContent.includes(label));
/** The element right after the tapped control in its grid (the PDF button sits inside a link). */
const nextAfter = (el) => (el.closest('a') || el).nextElementSibling;

test('§3b G1 IS GONE, AND NOTHING SHOWS BEFORE A TAP', async () => {
  const restore = stub({ paid: true });
  const ui = await mount();
  try {
    assert.ok(buttonNamed(ui.host, 'Unduh PDF') && buttonNamed(ui.host, 'Simpan Kartu'), 'precondition: both download buttons');
    assert.equal(ui.host.textContent.includes(G1), false, 'the G1 paragraph is gone');
    assert.equal(ui.host.textContent.includes(STARTED), false, 'nothing before a tap');
  } finally { ui.unmount(); restore(); }
});

test('§3b TAPPING "Simpan Kartu" SHOWS THE LINE DIRECTLY UNDER IT, and only there', async () => {
  const restore = stub({ paid: true });
  const ui = await mount();
  try {
    await act(async () => { buttonNamed(ui.host, 'Simpan Kartu').click(); });
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    const after = nextAfter(buttonNamed(ui.host, 'Simpan Kartu'));
    assert.equal(after?.textContent, STARTED, 'the line is the element right after the card button');
    assert.equal(ui.host.textContent.split(STARTED).length - 1, 1, 'once, not under the PDF button too');
  } finally { ui.unmount(); restore(); }
});

test('§3b TAPPING "Unduh PDF" SHOWS THE LINE DIRECTLY UNDER IT, and only there', async () => {
  const restore = stub({ paid: true });
  const ui = await mount();
  try {
    const link = buttonNamed(ui.host, 'Unduh PDF').closest('a');
    // jsdom cannot navigate; the click still reaches React's handler.
    link.addEventListener('click', (e) => e.preventDefault());
    await act(async () => { buttonNamed(ui.host, 'Unduh PDF').click(); });
    const after = nextAfter(buttonNamed(ui.host, 'Unduh PDF'));
    assert.equal(after?.textContent, STARTED, 'the line is the element right after the PDF link');
    assert.equal(ui.host.textContent.split(STARTED).length - 1, 1, 'once');
  } finally { ui.unmount(); restore(); }
});

test('§3b NOTHING IS SHOWN BEFORE PAID', async () => {
  const restore = stub({ paid: false });
  const ui = await mount();
  try {
    assert.equal(ui.host.textContent.includes(G1), false);
    assert.equal(ui.host.textContent.includes(STARTED), false);
  } finally { ui.unmount(); restore(); }
});

// ── §4 THE PAY BAR, AFTER THE OFFER HAS BEEN SEEN ────────────
// The ruled rule is that the offer comes "AFTER the free reading lands. Never a gate"
// (CLAUDE.md PRODUCT). So the bar appears only after the reader's viewport has reached the
// offer once (on this device, for this reading), hides while the offer or the footer is on
// screen, and is gone for good once paid. jsdom has no IntersectionObserver; this fake is
// driven by hand, so the test decides what is "on screen".
const observers = [];
class FakeIO {
  constructor(cb) { this.cb = cb; this.els = []; observers.push(this); }
  observe(el) { this.els.push(el); }
  unobserve() {}
  disconnect() { this.els = []; }
}
function installIO() {
  const prev = window.IntersectionObserver;
  observers.length = 0;
  window.IntersectionObserver = FakeIO;
  globalThis.IntersectionObserver = FakeIO;
  return () => { window.IntersectionObserver = prev; globalThis.IntersectionObserver = prev; };
}
/** Report `el` as on or off screen to every observer watching it. */
async function show(el, isIntersecting) {
  await act(async () => {
    for (const o of observers) if (o.els.includes(el)) o.cb([{ target: el, isIntersecting }]);
  });
}
const bar = () => document.querySelector('[data-pay-bar]');
const offerPanel = (host) => host.querySelector('[data-offer-panel]');
const clearSeen = () => { try { window.localStorage.clear(); } catch { /* none */ } };

test('§4 NO BAR BEFORE THE OFFER HAS BEEN SEEN', async () => {
  clearSeen();
  const unIO = installIO();
  const restore = stub({ paid: false });
  const ui = await mount();
  try {
    assert.ok(offerPanel(ui.host), 'precondition: the offer is on the page');
    assert.equal(bar(), null, 'the bar must not appear before the offer was reached');
  } finally { ui.unmount(); restore(); unIO(); }
});

test('§4 AFTER THE OFFER WAS SEEN, scrolling away shows the bar (price + the existing button label); the offer on screen hides it', async () => {
  clearSeen();
  const unIO = installIO();
  const restore = stub({ paid: false });
  const ui = await mount();
  try {
    const panel = offerPanel(ui.host);
    await show(panel, true);
    assert.equal(bar(), null, 'hidden while the offer itself is on screen');
    await show(panel, false);
    const b = bar();
    assert.ok(b, 'shown once the offer has been seen and is off screen');
    assert.ok(b.textContent.includes('Rp 19.000'), 'the price');
    assert.ok(b.textContent.includes('Ambil Complete Edition'), 'the existing buy button label');
    // It is portalled to document.body, outside the reading root that sets the theme
    // variables; without its own copy its background resolves to nothing (2026-10-06).
    assert.ok(b.style.getPropertyValue('--el-sanctuary'), 'the bar carries the theme variables');
    const footer = document.createElement('footer');
    document.body.appendChild(footer);
    // The footer is only observed if it exists when the observer is set up; this one
    // is added later, so it is driven through the panel's observer list directly.
    for (const o of observers) if (o.els.includes(panel)) o.els.push(footer);
    await show(footer, true);
    assert.equal(bar(), null, 'hidden while the footer is on screen (it must not cover the footer links)');
    footer.remove();
  } finally { ui.unmount(); restore(); unIO(); }
});

test('§4 SEEN ONCE, REMEMBERED: a reload scrolled to the top shows the bar for that reading', async () => {
  clearSeen();
  const unIO = installIO();
  const restore = stub({ paid: false });
  let ui = await mount();
  try {
    await show(offerPanel(ui.host), true);
  } finally { ui.unmount(); }
  ui = await mount();
  try {
    await show(offerPanel(ui.host), false);
    assert.ok(bar(), 'the reading remembered the offer was seen on this device');
  } finally { ui.unmount(); restore(); unIO(); }
});

test('§4 GONE FOR GOOD ONCE PAID', async () => {
  clearSeen();
  try { window.localStorage.setItem('katon:offer-seen:tok1', '1'); } catch { /* none */ }
  const unIO = installIO();
  const restore = stub({ paid: true });
  const ui = await mount();
  try {
    assert.ok(ui.host.querySelector('#unduh'), 'precondition: paid, the delivery is open');
    assert.equal(bar(), null);
  } finally { ui.unmount(); restore(); unIO(); clearSeen(); }
});
