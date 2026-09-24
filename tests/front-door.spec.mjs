// ============================================================
// tests/front-door.spec.mjs — the front door is one thing to do
// ============================================================
// Run: npm run test:front-door
//
// Prompt AA (released 2026-09-24). Reyner's direction, 2026-09-21: "simple and clean
// like the Google homepage; put all details on other pages." The two-card grid
// (Bacaan Diri / Kompatibilitas) above the form is DELETED; compat becomes ONE text
// link under the button's lock line, and - #127's ruling, restated for this link -
// it renders only while the payment fence is open (`salesOpen`).
//
// Both ways, every time: the link must be absent with the fence closed AND present
// with it open, so a link that was deleted, or one that ignored the fence, fails.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import Funnel from '../components/Funnel.jsx';
import { COMPAT_ROUTE } from '../lib/site/routes.js';

async function mountHome(salesOpen) {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(Funnel, { salesOpen })); });
  return {
    host,
    compatLinks: () => [...host.querySelectorAll('a')].filter((a) => a.getAttribute('href') === COMPAT_ROUTE),
    unmount: () => { act(() => root.unmount()); host.remove(); globalThis.fetch = prev; },
  };
}

// The four deleted slots' values as they stood on main (lib/site/copy.js 649-652,
// 2026-09-24). Literals ON PURPOSE: the slots are deleted, so there is nothing left
// to import, and "no element carries the deleted text" must be asked of the words.
const DELETED = [
  'Bacaan Diri',
  'Pahami polamu sendiri. Gratis.',
  'Dinamika dua orang, dibaca dari dua tanggal lahir.',
];

test('THE FRONT DOOR HAS EXACTLY ONE SUBMIT BUTTON and none of the deleted two-card copy', async () => {
  const ui = await mountHome(true);
  try {
    assert.equal(ui.host.querySelectorAll('button[type="submit"]').length, 1, 'one thing to do');
    for (const text of DELETED) {
      assert.equal(ui.host.textContent.includes(text), false, `the deleted card still renders "${text}"`);
    }
  } finally { ui.unmount(); }
});

test('FENCE OPEN: exactly ONE link to compat, and it sits AFTER the button', async () => {
  const ui = await mountHome(true);
  try {
    const links = ui.compatLinks();
    assert.equal(links.length, 1, 'one door to compat on the page');
    const button = ui.host.querySelector('button[type="submit"]');
    // DOCUMENT_POSITION_FOLLOWING: the link comes after the form's button, never
    // above the form (the mirror stays the first thing, ruled 2026-09-07).
    assert.ok(button.compareDocumentPosition(links[0]) & 4, 'the compat link is below the button');
  } finally { ui.unmount(); }
});

test('FENCE CLOSED: NO link to compat (the #127 ruling, applied to the new link)', async () => {
  const ui = await mountHome(false);
  try {
    assert.equal(ui.compatLinks().length, 0, 'no door to a paid product while payments are closed');
    assert.equal(ui.host.querySelectorAll('button[type="submit"]').length, 1, 'the free reading is still there');
  } finally { ui.unmount(); }
});
