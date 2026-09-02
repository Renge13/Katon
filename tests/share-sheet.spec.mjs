// ============================================================
// tests/share-sheet.spec.mjs — the fallback IS the safety property
// ============================================================
// Prompt S. The card goes to the native share sheet where one exists and to the
// existing download everywhere else.
//
// ── WHAT THIS FILE CANNOT DO, SAID PLAINLY ─────────────────
// **NOTHING HERE TESTS A REAL SHARE SHEET.** No assertion in this repo will ever
// open one on an iPhone. `navigator.share` is stubbed throughout; what is asserted
// is which branch is taken and what reaches the reader, never that iOS behaves.
// Reyner tests the sheet itself on his own phones, iOS and Android, and until he
// has, this suite being green means the FALLBACK is sound and nothing more.
//
// ── WHY THE UNSUPPORTED PATHS ARE THE POINT ────────────────
// Prompt S: "a test that only exercises the supported path is worse than none,
// because the fallback IS the safety property." A suite that proves sharing works
// where sharing works, and says nothing about where it does not, is green on the
// day this breaks for everyone on a laptop. So the three required propositions are
// all failure paths:
//
//   1. the fallback fires when canShare returns false
//   2. AbortError does not surface the error state
//   3. a stale File is rejected rather than shared
//
// ── SHOWN RED BEFORE THE CHANGE ────────────────────────────
// Against `main` at e95006c, where no share code exists at all:
//
//     ✖ ... SyntaxError: The requested module './cards/exportCards.js' does not
//       provide an export named 'canShareFile'
//     ℹ tests 0  fail 1
//
// That is a real red but a WEAK one - it fails on absence, which any new export
// would satisfy. The load-bearing red is the second run, with the module present
// and `ShareCardA` still calling `downloadCard` unconditionally: 4 of 9 failing,
// including all three propositions above. Both runs are in the commit message.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { ShareCardA } from '../components/Funnel.jsx';
import {
  canShareFile, dataUrlToFile, shareOrSave,
  SHARE_SHARED, SHARE_CANCELLED, SHARE_SAVED,
} from '../components/cards/exportCards.js';

// A 1x1 PNG. Real bytes, so `dataUrlToFile` is decoding something rather than
// being handed a string that happens to survive.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const OTHER_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// REAL CARD DATA, from the engine, because `CardA` actually renders here.
//
// A hand-written stub was tried first and every component test went red with
// `No card token for Day Master stem "undefined"` — a real failure for the wrong
// proposition, which would have been recorded as "the behaviour is missing" when
// what was missing was the fixture. Exactly the trap COWORK-BRIEF §4 records; it
// is named here because the cheap version of this file re-introduces it.
//
// DATA_A and DATA_B differ ONLY in the footer's birth date, which is precisely the
// late client-side merge the staleness assertion exists for.
const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const semanticJson = buildSemanticJson(chart);
const DATA_A = buildCardData({ chart, semanticJson });
const DATA_B = buildCardData({ chart, semanticJson, birthDate: '1989-09-13' });

/** Install a share-sheet stub for one test. Returns what it recorded. */
function stubShare({ canShare = true, onShare } = {}) {
  const rec = { canShareCalls: [], shared: [], downloads: [] };
  const prev = { canShare: navigator.canShare, share: navigator.share, create: document.createElement };

  Object.defineProperty(navigator, 'canShare', {
    value: (payload) => { rec.canShareCalls.push(payload); return canShare; },
    configurable: true, writable: true,
  });
  Object.defineProperty(navigator, 'share', {
    value: async (payload) => { rec.shared.push(payload); if (onShare) return onShare(payload); return undefined; },
    configurable: true, writable: true,
  });

  // `saveDataUrl` builds an <a download> and clicks it. jsdom will not navigate,
  // so the click is intercepted here to record that the FALLBACK RAN.
  document.createElement = function (tag, ...rest) {
    const el = prev.create.call(document, tag, ...rest);
    if (tag === 'a') el.click = () => rec.downloads.push({ download: el.download, href: el.href });
    return el;
  };

  rec.restore = () => {
    Object.defineProperty(navigator, 'canShare', { value: prev.canShare, configurable: true, writable: true });
    Object.defineProperty(navigator, 'share', { value: prev.share, configurable: true, writable: true });
    document.createElement = prev.create;
  };
  return rec;
}

/** Remove the share API entirely — a desktop browser that has never had it. */
function stubNoShareApi() {
  const prev = { canShare: navigator.canShare, share: navigator.share, create: document.createElement };
  const rec = { downloads: [] };
  delete navigator.canShare;
  delete navigator.share;
  document.createElement = function (tag, ...rest) {
    const el = prev.create.call(document, tag, ...rest);
    if (tag === 'a') el.click = () => rec.downloads.push({ download: el.download });
    return el;
  };
  rec.restore = () => {
    Object.defineProperty(navigator, 'canShare', { value: prev.canShare, configurable: true, writable: true });
    Object.defineProperty(navigator, 'share', { value: prev.share, configurable: true, writable: true });
    document.createElement = prev.create;
  };
  return rec;
}

/**
 * Mount ShareCardA with the PIXEL CAPTURE injected.
 *
 * `captureCard` needs fonts, layout and a real 1080px node; jsdom has none of the
 * three. Everything this file asserts - branch taken, staleness, what the reader
 * sees - is the component's own logic, so only the capture is replaced.
 *
 * IT CANNOT ROT INTO A NO-OP: if `ShareCardA` stopped honouring the prop and called
 * the real `captureCard`, that throws in jsdom and every test here goes red rather
 * than silently passing.
 */
function mount(data, capture) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const render = (d) => act(() => root.render(React.createElement(ShareCardA, { data: d, token: 'tok', capture })));
  render(data);
  return {
    host, render,
    rerender: (d) => render(d),
    text: () => host.textContent,
    button: () => host.querySelector('button'),
    click: () => act(() => { host.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true })); }),
    settle: async () => { await act(async () => { await new Promise((r) => setTimeout(r, 5)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

const captureOk = async () => PNG;

// ── THE PURE HALF: detection and the destination switch ─────

test('canShareFile detects on the FILES, so `share` alone is not enough', () => {
  const file = dataUrlToFile(PNG, 'k.png');
  const s = stubShare({ canShare: false });
  try {
    // A browser that HAS navigator.share but refuses file payloads. Detecting on
    // `share` alone would call this supported and the share would throw.
    assert.equal(canShareFile(file), false);
    assert.equal(s.canShareCalls.length, 1, 'it must actually ask about the files');
    assert.deepEqual(Object.keys(s.canShareCalls[0]), ['files']);
  } finally { s.restore(); }
});

test('canShareFile is false when the API is absent, and never throws', () => {
  const file = dataUrlToFile(PNG, 'k.png');
  const s = stubNoShareApi();
  try { assert.equal(canShareFile(file), false); } finally { s.restore(); }
});

test('a canShare that THROWS reads as unsupported, not as a broken card', () => {
  const file = dataUrlToFile(PNG, 'k.png');
  const prev = navigator.canShare;
  Object.defineProperty(navigator, 'canShare', {
    value: () => { throw new TypeError('nope'); }, configurable: true, writable: true,
  });
  try { assert.equal(canShareFile(file), false); } finally {
    Object.defineProperty(navigator, 'canShare', { value: prev, configurable: true, writable: true });
  }
});

test('shareOrSave SAVES when canShare is false — the fallback, in isolation', async () => {
  const s = stubShare({ canShare: false });
  try {
    const r = await shareOrSave({ file: dataUrlToFile(PNG, 'k.png'), dataUrl: PNG, filename: 'k.png' });
    assert.equal(r, SHARE_SAVED);
    assert.equal(s.shared.length, 0, 'it must not call share() on an unsupported browser');
    assert.equal(s.downloads.length, 1, 'today\'s download path must run');
    assert.equal(s.downloads[0].download, 'k.png');
  } finally { s.restore(); }
});

test('shareOrSave SHARES when supported, and does not also save', async () => {
  const s = stubShare({ canShare: true });
  try {
    const file = dataUrlToFile(PNG, 'k.png');
    const r = await shareOrSave({ file, dataUrl: PNG, filename: 'k.png' });
    assert.equal(r, SHARE_SHARED);
    assert.equal(s.shared.length, 1);
    assert.equal(s.shared[0].files[0].name, 'k.png', 'the FILE is the payload, not a url');
    assert.equal(s.downloads.length, 0, 'a shared card must not also land in downloads');
  } finally { s.restore(); }
});

test('shareOrSave treats AbortError as CANCELLED — no save, no error', async () => {
  const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' });
  const s = stubShare({ canShare: true, onShare: () => { throw abort; } });
  try {
    const r = await shareOrSave({ file: dataUrlToFile(PNG, 'k.png'), dataUrl: PNG, filename: 'k.png' });
    assert.equal(r, SHARE_CANCELLED);
    assert.equal(s.downloads.length, 0,
      'she closed the sheet; putting a file in her downloads is not what she asked for');
  } finally { s.restore(); }
});

test('shareOrSave SAVES on a non-Abort share failure — degrade, never nothing', async () => {
  // NotAllowedError is the consumed-user-activation case on iOS, which is the exact
  // failure the eager capture exists to avoid. She must still get her card.
  const denied = Object.assign(new Error('activation'), { name: 'NotAllowedError' });
  const s = stubShare({ canShare: true, onShare: () => { throw denied; } });
  try {
    const r = await shareOrSave({ file: dataUrlToFile(PNG, 'k.png'), dataUrl: PNG, filename: 'k.png' });
    assert.equal(r, SHARE_SAVED);
    assert.equal(s.downloads.length, 1);
  } finally { s.restore(); }
});

// ── PROPOSITION 1: THE FALLBACK FIRES, IN THE REAL COMPONENT ─

test('THE FALLBACK FIRES WHEN canShare RETURNS FALSE', async () => {
  const s = stubShare({ canShare: false });
  const ui = mount(DATA_A, captureOk);
  try {
    await ui.settle();                       // let the eager capture land
    assert.equal(ui.button().textContent.trim(), 'Simpan Gambar',
      'an unsupported browser must read the save label, not the share one');
    ui.click();
    await ui.settle();
    assert.equal(s.shared.length, 0, 'share() must not be called');
    assert.equal(s.downloads.length, 1, 'the reader still gets her card');
    assert.ok(!ui.text().includes('Gambarnya gagal dibuat'), 'a fallback is not a failure');
  } finally { ui.unmount(); s.restore(); }
});

test('the share label appears ONLY where files are actually shareable', async () => {
  const s = stubShare({ canShare: true });
  const ui = mount(DATA_A, captureOk);
  try {
    await ui.settle();
    assert.equal(ui.button().textContent.trim(), 'Bagikan Kartu');
    ui.click();
    await ui.settle();
    assert.equal(s.shared.length, 1);
    assert.equal(s.downloads.length, 0, 'a successful share must not also download');
    assert.equal(s.shared[0].files.length, 1);
  } finally { ui.unmount(); s.restore(); }
});

// ── PROPOSITION 2: CANCEL IS NOT AN ERROR ───────────────────

test('AbortError DOES NOT SURFACE THE ERROR STATE', async () => {
  const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' });
  const s = stubShare({ canShare: true, onShare: () => { throw abort; } });
  const ui = mount(DATA_A, captureOk);
  try {
    await ui.settle();
    ui.click();
    await ui.settle();
    assert.ok(!ui.text().includes('Gambarnya gagal dibuat. Coba lagi.'),
      'dismissing a share sheet is the most likely outcome and must look like nothing happened');
    assert.equal(s.downloads.length, 0);
  } finally { ui.unmount(); s.restore(); }
});

// ── PROPOSITION 3: A STALE FILE IS REJECTED ─────────────────

test('A STALE FILE IS REJECTED RATHER THAN SHARED', async () => {
  // The footer merges the birth date AFTER mount. This is that: capture settles
  // against DATA_A, the data becomes DATA_B, and the tap must not ship the old one.
  const captured = [];
  const capture = async () => { const url = captured.length ? OTHER_PNG : PNG; captured.push(url); return url; };
  const s = stubShare({ canShare: true });
  const ui = mount(DATA_A, capture);
  try {
    await ui.settle();
    assert.equal(captured.length, 1, 'the eager capture ran against the first data');

    ui.rerender(DATA_B);          // the late footer merge
    ui.click();
    await ui.settle();

    assert.equal(s.shared.length, 1, 'it still shares');
    const sharedName = s.shared[0].files[0].name;
    assert.ok(sharedName, 'a File was shared');
    assert.ok(captured.length >= 2,
      'the stale File must be discarded and a fresh capture taken, not reused');
    assert.equal(captured[captured.length - 1], OTHER_PNG,
      'what is shared must come from the capture taken against the CURRENT data');
  } finally { ui.unmount(); s.restore(); }
});

test('a fresh File is reused — the eager capture is not pointless', async () => {
  // The complement, so "reject the stale one" cannot be satisfied by always
  // re-capturing, which would reintroduce the iOS activation bug.
  let calls = 0;
  const capture = async () => { calls++; return PNG; };
  const s = stubShare({ canShare: true });
  const ui = mount(DATA_A, capture);
  try {
    await ui.settle();
    assert.equal(calls, 1);
    ui.click();
    await ui.settle();
    assert.equal(calls, 1, 'unchanged data must reuse the eager File, never re-capture');
    assert.equal(s.shared.length, 1);
  } finally { ui.unmount(); s.restore(); }
});

test('a failing eager capture never shows a reader an error she did not ask for', async () => {
  const s = stubShare({ canShare: false });
  const ui = mount(DATA_A, async () => { throw new Error('fonts'); });
  try {
    await ui.settle();
    assert.ok(!ui.text().includes('Gambarnya gagal dibuat'),
      'she has tapped nothing; the eager capture must fail silently');
    assert.ok(ui.button(), 'and the button is still there to tap');
  } finally { ui.unmount(); s.restore(); }
});
