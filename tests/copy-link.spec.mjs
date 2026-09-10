// ============================================================
// tests/copy-link.spec.mjs — the copy button, and its fallback
// ============================================================
// Y-2 ruling 2 (compat report) and commit 4 (the mirror's reading page). ONE
// component on both surfaces, so this is where its behaviour is pinned.
//
// ── THE FALLBACK IS THE REASON THIS FILE EXISTS ────────────
// `navigator.clipboard` is undefined on any page not served over HTTPS or
// localhost, and it REJECTS rather than throws when the document is not focused.
// Katon's reader is on a phone, often on a link opened inside a chat app's
// in-app browser, so both are live. A button that silently does nothing is worse
// than no button - she believes she has the link.
//
// jsdom has no clipboard at all, which makes it the right harness for exactly
// this: the unhappy path is the default here and the happy path is the one that
// has to be stubbed in.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import CopyLink, { COPIED_MS } from '../components/CopyLink.jsx';
import { CHROME_COPY } from '../lib/site/copy.js';

const URL_ = 'https://katon.app/kompatibilitas/abc123';

function mount(props) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(CopyLink, props)));
  return {
    host,
    // ── THREE READERS, BECAUSE Y-2c MOVED ALL THREE THINGS ────
    // `text()` used to answer every question in this file. It cannot any more,
    // and each reason is a deliberate change rather than a wobble:
    //   - the URL is an <input> VALUE now, not text content (item 1)
    //   - the toast is PORTALLED to document.body, outside this host (item 5)
    //   - the selection is an INPUT selection, so `window.getSelection()` is
    //     empty even while the whole URL is highlighted
    // Reading the old places would have left several of these assertions green
    // against the wrong nodes, which is the failure this file has already had
    // once.
    text: () => host.textContent || '',
    /** The URL as the reader sees it: the field's value. */
    fieldValue: () => host.querySelector('input')?.value ?? null,
    /** The toast, wherever it is portalled to. */
    toastText: () => document.querySelector('[role="status"]')?.textContent ?? '',
    /** What is highlighted INSIDE the field. */
    selected: () => {
      const i = host.querySelector('input');
      if (!i) return '';
      return String(i.value).slice(i.selectionStart ?? 0, i.selectionEnd ?? 0);
    },
    button: () => host.querySelector('button'),
    click: (el) => act(() => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))),
    settle: async (ms = 5) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

/** Replace `navigator.clipboard` for one test. jsdom defines none. */
function withClipboard(impl) {
  const had = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { value: impl, configurable: true });
  return () => {
    if (had) Object.defineProperty(navigator, 'clipboard', had);
    else delete navigator.clipboard;
  };
}

test('THE URL IS ALWAYS SHOWN, WITH OR WITHOUT THE BUTTON', () => {
  const bare = mount({ url: URL_ });
  try {
    assert.equal(bare.fieldValue(), URL_, 'the URL is the access; it is never hidden behind a button');
    assert.equal(bare.button(), null, 'no button unless asked for one');
  } finally { bare.unmount(); }

  const withBtn = mount({ url: URL_, withCopy: true });
  try {
    assert.equal(withBtn.fieldValue(), URL_);
    assert.equal(withBtn.button().textContent.trim(), CHROME_COPY.copy_link);
    // `type="button"`: both callers render this inside or near a form, and a
    // submit button that copies a link is a submit nobody asked for.
    assert.equal(withBtn.button().type, 'button');
  } finally { withBtn.unmount(); }
});

test('A SUCCESSFUL COPY SAYS SO, AND SAYS IT FOR A WHILE', async () => {
  const written = [];
  const restore = withClipboard({ writeText: async (t) => { written.push(t); } });
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.deepEqual(written, [URL_], 'the URL on screen is the URL copied');

    // ── THIS ASSERTED A BUTTON RELABEL UNTIL 2026-09-09 ────────
    // Reyner ruled the confirmation a TOAST instead, so the assertion moved with
    // the behaviour rather than being deleted: the button keeps its own label
    // and the toast carries the message.
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link);
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_done));

    // It clears, so a second tap is a fresh confirmation. The prompt says ~2s.
    assert.equal(COPIED_MS, 2000);
    await ui.settle(COPIED_MS + 50);
    assert.equal(ui.toastText().includes(CHROME_COPY.copy_link_done), false,
      'the toast clears itself');
  } finally { ui.unmount(); restore(); }
});

test('A REJECTED CLIPBOARD LEAVES THE URL SELECTED, NOT A LIE', async () => {
  // ── THE CASE THAT ACTUALLY HAPPENS ─────────────────────────
  // An unfocused document rejects. The button must NOT claim success, and the
  // reader must be left able to copy it herself - which is the selection.
  const restore = withClipboard({ writeText: async () => { throw new Error('not focused'); } });
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link,
      'a failed copy must not say "Tautan tersalin"');
    assert.equal(ui.selected(), URL_,
      'the URL is selected, so she can copy it herself');
  } finally { ui.unmount(); restore(); }
});

test('NO CLIPBOARD API AT ALL IS NOT A CRASH', async () => {
  // Undefined, not rejecting: any page off HTTPS. `navigator.clipboard.writeText`
  // throws a TypeError synchronously inside the async function, which the same
  // catch has to absorb.
  const restore = withClipboard(undefined);
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link);
    assert.equal(ui.selected(), URL_);
  } finally { ui.unmount(); restore(); }
});

test('THE MIRROR RENDERS IT, AND CARRIES NO PLURAL SENTENCE WITH IT', async () => {
  // Y-2 commit 4. The compat report puts `link_keep` above its URL; that string
  // says "bacaan KALIAN" - the couple's - and the mirror's reading is hers
  // alone. So the mirror gets the control and no sentence, rather than a plural
  // that is wrong about the product. Asserted so neither half drifts: the button
  // must be there, and that string must not.
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../components/Funnel.jsx', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');

  assert.match(src, /<CopyLink/u, 'the mirror renders the shared copy control');
  assert.match(src, /\/r\/\$\{reading\.token\}/u, 'and it copies the reading URL');
  assert.equal(src.includes('PASANGAN_COPY.link_keep'), false,
    'the compat report\'s plural sentence must not be reused on the mirror');
});

// ── THE TAP ITSELF (Y-2b item 2) ───────────────────────────

test('A SUCCESSFUL TAP MAKES NO SELECTION, AND TOASTS', async () => {
  // ── WHAT REYNER SAW, AND WHY THE OLD TEST DID NOT ──────────
  // Tapping `Salin tautan` HIGHLIGHTED the URL. That was `copy()` doing what its
  // own comment said - "SELECT FIRST, ALWAYS", a range selection BEFORE
  // `writeText`. On a phone the selection is the visible outcome, and it reads
  // as "it blocked the link instead of copying it".
  //
  // The existing suite passed throughout, because it asserted the selection on
  // the REJECTION branch and never checked the happy path for one. A test that
  // only exercises the fallback cannot see the fallback firing when it should
  // not.
  const written = [];
  const restore = withClipboard({ writeText: async (t) => { written.push(t); } });
  window.getSelection().removeAllRanges();
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.deepEqual(written, [URL_], 'it copied');
    assert.equal(ui.selected(), '',
      'a successful copy must not highlight the URL; the selection IS the bug');

    // The confirmation is a TOAST over content, not a relabelled button.
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link,
      'the button keeps its label');
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_done), 'the toast says it copied');
    assert.ok(document.querySelector('[role="status"]'),
      'and it is announced, not just drawn - portalled to body since Y-2c item 5');
  } finally { ui.unmount(); restore(); }
});

test('A REJECTED TAP SELECTS, AND SAYS SO IN ITS OWN WORDS', async () => {
  // The fallback survives and gains a voice: selecting text with no message
  // looks like nothing happened, which is the same complaint one layer down.
  const restore = withClipboard({ writeText: async () => { throw new Error('not focused'); } });
  window.getSelection().removeAllRanges();
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.equal(ui.selected(), URL_, 'the fallback selection');
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_fallback),
      'the fallback toast tells her what to do with it');
    assert.equal(ui.toastText().includes(CHROME_COPY.copy_link_done), false,
      'and never claims success');
  } finally { ui.unmount(); restore(); }
});

test('link_keep IS ONE SENTENCE IN CHROME_COPY, ON BOTH SURFACES', async () => {
  // Amendment g. It was PASANGAN_COPY's and said "bacaan kalian", so the mirror
  // shipped its box wordless in #113. One sentence with no plural now serves
  // both, and the slot MOVES rather than being aliased.
  assert.equal(CHROME_COPY.link_keep, 'Simpan tautan ini untuk membaca kembali.');
  const { PASANGAN_COPY: P } = await import('../lib/site/copy.js');
  assert.equal('link_keep' in P, false, 'the old slot is removed, not aliased');

  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  for (const f of ['../components/PasanganReport.jsx', '../components/Funnel.jsx']) {
    const src = strip(readFileSync(new URL(f, import.meta.url), 'utf8'));
    assert.match(src, /CHROME_COPY\.link_keep/u, `${f} reads the shared sentence`);
  }
});

// ── THREE RUNGS (Y-2c) ─────────────────────────────────────
// Reyner's PC is Brave, and Brave rejects `writeText` under a stricter
// user-gesture rule than Chrome's. So the async API is not a floor - it is the
// FIRST rung, and there has to be another under it that works inside a click
// handler. `execCommand('copy')` on a selected input is that rung: deprecated,
// universally supported, and the point is that the reader gets the URL.

/** Replace `document.execCommand` for one test. jsdom defines none. */
function withExec(impl) {
  const had = Object.getOwnPropertyDescriptor(document, 'execCommand');
  if (impl === undefined) delete document.execCommand;
  else Object.defineProperty(document, 'execCommand', { value: impl, configurable: true, writable: true });
  return () => {
    if (had) Object.defineProperty(document, 'execCommand', had);
    else delete document.execCommand;
  };
}

test('RUNG 1: writeText RESOLVES - toast, no execCommand, no selection', async () => {
  const calls = [];
  const rc = withClipboard({ writeText: async (t) => { calls.push(t); } });
  const re = withExec(() => { calls.push('execCommand'); return true; });
  window.getSelection().removeAllRanges();
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.deepEqual(calls, [URL_], 'the async API alone; rung 2 must not run when rung 1 worked');
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_done));
    assert.equal(ui.selected(), '', 'nothing is highlighted on the happy path');
  } finally { ui.unmount(); re(); rc(); }
});

test('RUNG 2: writeText REJECTS and execCommand SUCCEEDS - it still says copied', async () => {
  // ── THE NEW BEHAVIOUR, AND REYNER'S ACTUAL BUG ─────────────
  // On the merged code this went straight to the fallback toast: he got
  // "Tautan sudah ditandai" and a highlight, on a machine where the URL could
  // have been copied. The selection is not the bug - the selection is how rung 2
  // works - so it STAYS here and is asserted. What changes is that the copy
  // actually happened and the toast says so.
  const order = [];
  const rc = withClipboard({ writeText: async () => { order.push('writeText'); throw new Error('NotAllowedError'); } });
  const re = withExec((cmd) => { order.push(`exec:${cmd}`); return true; });
  window.getSelection().removeAllRanges();
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.deepEqual(order, ['writeText', 'exec:copy'], 'rung 1 is tried first, then rung 2');
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_done),
      'a successful execCommand copy must say COPIED, not "sudah ditandai"');
    assert.equal(ui.toastText().includes(CHROME_COPY.copy_link_fallback), false);
    assert.equal(ui.selected(), URL_, 'the selection is how rung 2 copies; it stays, harmlessly');
  } finally { ui.unmount(); re(); rc(); }
});

test('RUNG 3: both refuse - the fallback toast, and this time it IS the outcome', async () => {
  const rc = withClipboard({ writeText: async () => { throw new Error('NotAllowedError'); } });
  const re = withExec(() => false);
  window.getSelection().removeAllRanges();
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_fallback));
    assert.equal(ui.toastText().includes(CHROME_COPY.copy_link_done), false, 'it must not claim success');
    assert.equal(ui.selected(), URL_, 'she can still copy it by hand');
  } finally { ui.unmount(); re(); rc(); }
});

test('RUNG 3 ALSO COVERS execCommand BEING ABSENT ENTIRELY', async () => {
  // Not the same case as returning false: `document.execCommand` is undefined in
  // some webviews, and calling it would throw INSIDE the catch that is already
  // handling rung 1's rejection.
  const rc = withClipboard({ writeText: async () => { throw new Error('NotAllowedError'); } });
  const re = withExec(undefined);
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    assert.ok(ui.toastText().includes(CHROME_COPY.copy_link_fallback));
  } finally { ui.unmount(); re(); rc(); }
});

test('THE URL IS A READ-ONLY FIELD, AND TAPPING IT HANDS OVER THE WHOLE URL', async () => {
  // Reyner's ruling: loose text "looks buggy". A field is the site's own idiom
  // and it also gives rung 2 the element it needs to select.
  const ui = mount({ url: URL_, withCopy: true });
  try {
    const input = ui.host.querySelector('input');
    assert.ok(input, 'the URL renders in an input');
    assert.equal(input.readOnly, true, 'read-only: it is a display of the URL, not an edit of it');
    assert.equal(input.value, URL_);
    assert.equal(input.getAttribute('aria-label'), CHROME_COPY.copy_link_field_label);

    // A field a reader taps should hand her the URL, not put a caret in the
    // middle of it.
    input.focus();
    await ui.settle();
    assert.equal(input.selectionStart, 0);
    assert.equal(input.selectionEnd, URL_.length);
  } finally { ui.unmount(); }
});

test('BOTH SURFACES RENDER THE FIELD, because they render one component', () => {
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  for (const f of ['../components/PasanganReport.jsx', '../components/Funnel.jsx']) {
    const src = strip(readFileSync(new URL(f, import.meta.url), 'utf8'));
    assert.match(src, /<CopyLink/u, `${f} renders the shared control`);
  }
  // And neither builds its own URL display: the field lives in CopyLink alone,
  // so "the URL is a field" cannot be true on one surface and not the other.
  const copyLink = readFileSync(new URL('../components/CopyLink.jsx', import.meta.url), 'utf8');
  assert.match(copyLink, /readOnly/u);
});

// ── THE TOAST MUST ESCAPE ITS ANCESTORS (Y-2c item 5) ──────

test('THE TOAST IS PORTALLED TO document.body', async () => {
  // ── WHY, MEASURED ON THE MERGED PREVIEW BEFORE THE FIX ─────
  // Reyner: the toast appears mid-screen over the URL, not at the bottom.
  // `position: fixed` resolves against the nearest ancestor carrying a
  // transform, filter, perspective or will-change - that ancestor becomes the
  // containing block and `fixed` degrades to `absolute` inside it. Walking the
  // toast's ancestors on the #114 preview:
  //
  //   div.k-rise  transform: matrix(1, 0, 0, 1, 0, 0)
  //   div.k-fade  transform: matrix(1, 0, 0, 1, 0, 0)
  //   toast top 1814 / bottom 1871, viewport 1226  -> 645px below the fold
  //
  // TWO ancestors, and both transforms are the IDENTITY matrix: the reveal has
  // finished and the transform is a no-op, and it still creates a containing
  // block. Nothing about waiting for the animation would have fixed it.
  //
  // So the toast is portalled out rather than the stagger being un-transformed.
  // `Reveal`'s transform is the site's motion language and is used everywhere;
  // the toast is the thing that must not care where it is mounted.
  const rc = withClipboard({ writeText: async () => {} });
  const ui = mount({ url: URL_, withCopy: true });
  try {
    ui.click(ui.button());
    await ui.settle();
    const toast = document.querySelector('[role="status"]');
    assert.ok(toast, 'the toast rendered');
    assert.equal(toast.parentElement, document.body,
      'a transformed ancestor captures position:fixed; the toast must not be inside one');
    assert.equal(ui.host.contains(toast), false, 'and it is out of the component subtree entirely');
  } finally { ui.unmount(); rc(); }
});

test('THE PORTAL IS CLEANED UP WITH THE COMPONENT', async () => {
  // A portal renders outside the host, so unmount is the only thing that removes
  // it. Left behind, a stale toast would sit over an unrelated page.
  const rc = withClipboard({ writeText: async () => {} });
  const ui = mount({ url: URL_, withCopy: true });
  ui.click(ui.button());
  await ui.settle();
  assert.ok(document.querySelector('[role="status"]'));
  ui.unmount();
  rc();
  assert.equal(document.querySelector('[role="status"]'), null,
    'the toast goes with the component');
});
