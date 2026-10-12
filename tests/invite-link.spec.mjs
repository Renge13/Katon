// ============================================================
// tests/invite-link.spec.mjs — the free reading can bring the next reader
// ============================================================
// Run: npm run test:invite-link
//
// Prompt BP (Reyner, 2026-10-12). "Bagikan kartumu" shared the card IMAGE only:
// `shareOrSave` was called with no `text` at both call sites, so a shared card
// carried no tappable link and no attribution, and there was no way to send a
// friend a link to her own free reading. Funnel read 2026-10-08: 8 readings.
//
// THE PROPOSITIONS, each asserted on what the reader taps and what leaves the page:
//   1. the Bagikan section renders the invite button, with the ruled label,
//      under the card's own share control
//   2. with a share sheet: `navigator.share({ text })` with the ruled invite text;
//      `invite_shared` {via: 'share'} on resolve, NOTHING on AbortError
//   3. without one: the clipboard gets the ruled text, the button reads the
//      EXISTING `Tautan tersalin`, and `invite_shared` {via: 'copy'} fires
//   4. both card-share call sites hand `navigator.share` the ruled card text
//   5. the copy bank holds the three ruled strings byte for byte
//
// `navigator.share` is stubbed throughout, as in tests/share-sheet.spec.mjs: this
// asserts the branch taken and the payload, never that a real sheet opens.
//
// Red first: shown failing on main (`6e7fbf7`) before the change. The run is in
// the commit message.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { CHROME_COPY } from '../lib/site/copy.js';
import { Reading, ShareCardA } from '../components/Funnel.jsx';

// RULED 2026-10-12 (Reyner), verbatim from docs/prompts/BP-invite-and-card-link.md.
// The ONE copy of these bytes in tests; every behaviour test below reads it.
const RULED = {
  invite_label: 'Kirim tautan ke teman',
  invite_text: 'Aku baru membaca pola diriku di Katon. Coba lihat pola dirimu, gratis: https://katon.app/?k=ajak',
  card_share_text: 'Kartu pola diriku dari Katon. Lihat punyamu di https://katon.app/?k=kartu',
};
const COPIED = 'Tautan tersalin';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const semanticJson = buildSemanticJson(chart);
const DATA = buildCardData({ chart, semanticJson });

/** Every client event the page posts, with its body. */
function stubEvents() {
  const prev = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/event')) sent.push(JSON.parse(init.body));
    return { ok: true, status: 200, json: async () => ({}) };
  };
  return { sent, restore: () => { globalThis.fetch = prev; } };
}

/** A share sheet that files are allowed into, recording every payload. */
function stubShare(onShare) {
  const prev = { canShare: navigator.canShare, share: navigator.share };
  const shared = [];
  Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true, writable: true });
  Object.defineProperty(navigator, 'share', {
    value: async (payload) => { shared.push(payload); if (onShare) return onShare(payload); return undefined; },
    configurable: true, writable: true,
  });
  return {
    shared,
    restore: () => {
      Object.defineProperty(navigator, 'canShare', { value: prev.canShare, configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: prev.share, configurable: true, writable: true });
    },
  };
}

/** A desktop browser: no share API, a clipboard that records what it is given. */
function stubClipboardOnly() {
  const prev = { canShare: navigator.canShare, share: navigator.share, clipboard: navigator.clipboard };
  const written = [];
  delete navigator.canShare;
  delete navigator.share;
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async (t) => { written.push(t); } },
    configurable: true, writable: true,
  });
  return {
    written,
    restore: () => {
      Object.defineProperty(navigator, 'canShare', { value: prev.canShare, configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: prev.share, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clipboard', { value: prev.clipboard, configurable: true, writable: true });
    },
  };
}

async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return { host, unmount: () => act(() => root.unmount()) };
}

const buttons = (host) => [...host.querySelectorAll('button')];
const byText = (host, text) => buttons(host).find((b) => b.textContent.trim() === text);
const inviteButton = (host) => byText(host, RULED.invite_label);
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

// ── 5. THE RULED BYTES ──────────────────────────────────────

test('THE COPY BANK HOLDS THE THREE RULED STRINGS, BYTE FOR BYTE', () => {
  for (const [slot, text] of Object.entries(RULED)) {
    assert.equal(CHROME_COPY[slot], text, `CHROME_COPY.${slot}`);
  }
  // The confirmation is the EXISTING string, not a new one (Prompt BP §1).
  assert.equal(CHROME_COPY.copy_link_done, COPIED);
});

// ── 1. WHERE IT IS ──────────────────────────────────────────

test('THE BAGIKAN SECTION RENDERS THE INVITE BUTTON, UNDER THE CARD SHARE CONTROL', async () => {
  const ev = stubEvents();
  try {
    // A REAL CARD, or the section does not render at all (`cardData` is null without
    // one) and this test goes red on its fixture rather than on the missing button.
    const reading = { token: 't', chart: mirrorChartView(chart, semanticJson), blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }], penutup: '', pending: false, card: DATA };
    const view = await mount(React.createElement(Reading, { reading, onReset() {}, salesOpen: false }));
    const text = view.host.textContent;
    assert.ok(text.includes('Bagikan kartumu'), 'precondition: the Bagikan section is on the page');
    const invite = inviteButton(view.host);
    assert.ok(invite, `no button reads "${RULED.invite_label}" on the free reading`);
    const card = buttons(view.host).find((b) => /Bagikan Kartu|Simpan Gambar/u.test(b.textContent));
    assert.ok(card, 'precondition: the card share control is on the page');
    assert.ok(card.compareDocumentPosition(invite) & 4 /* DOCUMENT_POSITION_FOLLOWING */,
      'the invite button must come AFTER the card share control');
    await view.unmount();
  } finally { ev.restore(); }
});

// ── 2. WITH A SHARE SHEET ───────────────────────────────────

test('WITH A SHARE SHEET: navigator.share({ text: invite }) and invite_shared via share', async () => {
  const ev = stubEvents();
  const sh = stubShare();
  try {
    const view = await mount(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture: async () => PNG }));
    await act(async () => { inviteButton(view.host).click(); });
    await flush();
    const invites = sh.shared.filter((p) => !p.files);
    assert.deepEqual(invites, [{ text: RULED.invite_text }], `shared: ${JSON.stringify(sh.shared)}`);
    const fired = ev.sent.filter((b) => b.event === 'invite_shared');
    assert.deepEqual(fired, [{ event: 'invite_shared', via: 'share' }], `sent: ${JSON.stringify(ev.sent)}`);
    await view.unmount();
  } finally { sh.restore(); ev.restore(); }
});

test('A CANCELLED SHARE SHEET (AbortError) FIRES NOTHING', async () => {
  const ev = stubEvents();
  const sh = stubShare(() => { throw new DOMException('dismissed', 'AbortError'); });
  try {
    const view = await mount(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture: async () => PNG }));
    await act(async () => { inviteButton(view.host).click(); });
    await flush();
    assert.equal(sh.shared.filter((p) => !p.files).length, 1, 'precondition: the sheet was opened');
    assert.deepEqual(ev.sent.filter((b) => b.event === 'invite_shared'), [], `sent: ${JSON.stringify(ev.sent)}`);
    await view.unmount();
  } finally { sh.restore(); ev.restore(); }
});

// ── 3. WITHOUT ONE ──────────────────────────────────────────

test('WITHOUT A SHARE SHEET: the clipboard gets the invite, the button reads Tautan tersalin, via copy', async () => {
  const ev = stubEvents();
  const cb = stubClipboardOnly();
  try {
    const view = await mount(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture: async () => PNG }));
    const invite = inviteButton(view.host);
    await act(async () => { invite.click(); });
    await flush();
    assert.deepEqual(cb.written, [RULED.invite_text]);
    assert.equal(invite.textContent.trim(), COPIED, 'the button must confirm with the existing string');
    assert.deepEqual(ev.sent.filter((b) => b.event === 'invite_shared'), [{ event: 'invite_shared', via: 'copy' }]);
    await view.unmount();
  } finally { cb.restore(); ev.restore(); }
});

// ── 4. THE CARD CARRIES ITS LINK ────────────────────────────

test('CARD SHARE, EAGER FILE PATH: navigator.share gets the ruled card text', async () => {
  const ev = stubEvents();
  const sh = stubShare();
  try {
    const view = await mount(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture: async () => PNG }));
    await flush(); // the eager capture lands, so the tap takes the fresh-file branch
    await act(async () => { byText(view.host, 'Bagikan Kartu').click(); });
    await flush();
    const cards = sh.shared.filter((p) => p.files);
    assert.equal(cards.length, 1, `shared: ${JSON.stringify(sh.shared)}`);
    assert.equal(cards[0].text, RULED.card_share_text);
    await view.unmount();
  } finally { sh.restore(); ev.restore(); }
});

test('CARD SHARE, RE-CAPTURE PATH: navigator.share gets the ruled card text', async () => {
  const ev = stubEvents();
  const sh = stubShare();
  let calls = 0;
  // The eager capture fails, so the tap has no fresh file and re-captures.
  const capture = async () => { calls += 1; if (calls === 1) throw new Error('eager capture failed'); return PNG; };
  try {
    const view = await mount(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture }));
    await flush();
    await act(async () => { byText(view.host, 'Bagikan Kartu').click(); });
    await flush();
    assert.equal(calls, 2, 'precondition: the tap re-captured');
    const cards = sh.shared.filter((p) => p.files);
    assert.equal(cards.length, 1, `shared: ${JSON.stringify(sh.shared)}`);
    assert.equal(cards[0].text, RULED.card_share_text);
    await view.unmount();
  } finally { sh.restore(); ev.restore(); }
});
