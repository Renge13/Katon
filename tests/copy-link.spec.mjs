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
    text: () => host.textContent || '',
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
    assert.ok(bare.text().includes(URL_), 'the URL is the access; it is never hidden behind a button');
    assert.equal(bare.button(), null, 'no button unless asked for one');
  } finally { bare.unmount(); }

  const withBtn = mount({ url: URL_, withCopy: true });
  try {
    assert.ok(withBtn.text().includes(URL_));
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
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link_done);

    // It reverts, so the button is usable twice. The prompt says 2s.
    assert.equal(COPIED_MS, 2000);
    await ui.settle(COPIED_MS + 50);
    assert.equal(ui.button().textContent.trim(), CHROME_COPY.copy_link);
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
    assert.equal(String(window.getSelection()), URL_,
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
    assert.equal(String(window.getSelection()), URL_);
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
