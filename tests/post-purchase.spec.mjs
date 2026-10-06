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

test('§3b G1 IS UNDER THE DOWNLOAD BUTTONS, AFTER PAID, verbatim', async () => {
  const restore = stub({ paid: true });
  const ui = await mount();
  try {
    const text = ui.host.textContent;
    assert.ok(text.includes(G1), 'the guide line is shown');
    assert.ok(text.indexOf('Unduh PDF') > -1 && text.indexOf('Unduh PDF') < text.indexOf(G1), 'under the download buttons');
  } finally { ui.unmount(); restore(); }
});

test('§3b G1 IS NOT SHOWN BEFORE PAID', async () => {
  const restore = stub({ paid: false });
  const ui = await mount();
  try {
    assert.equal(ui.host.textContent.includes(G1), false);
  } finally { ui.unmount(); restore(); }
});
