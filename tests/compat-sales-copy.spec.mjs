// ============================================================
// tests/compat-sales-copy.spec.mjs — the /kompatibilitas sales copy, as RENDERED
// ============================================================
// Run: npm run test:compat-sales-copy
//
// Prompt BH (Reyner ruled 2026-10-07, amendment l of docs/content/pasangan-copy-rulings.md).
// Compat went on sale with a page still promising "Pola hubungan: Cermin, Serumpun, atau
// Kontras", and Kontras was retired by #206. This renders the real page component, open and
// closed, and asserts what a buyer reads: no "Kontras", the ruled lead, and exactly four
// inclusion items, each a BOLD label, a space, then its text, in the ruled order.
//
// The expected strings are PARSED from the rulings file's "## The compat page" table, never
// retyped here: a third copy of a ruled string is the thing that drifts.
//
// Its own file rather than tests/compat-surface.spec.mjs: that spec runs under
// `--conditions=react-server`, where react-dom/server does not load (measured 2026-10-07),
// and it says in its header that it does not render React.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Pasangan from '../components/Pasangan.jsx';

const ROOT = path.resolve(import.meta.dirname, '..');
const MD = readFileSync(path.join(ROOT, 'docs', 'content', 'pasangan-copy-rulings.md'), 'utf8');

/** slot -> ruled string, from "## The compat page". */
function ruled() {
  const part = MD.split(/^## /mu).find((p) => p.startsWith('The compat page'));
  assert.ok(part, 'the rulings file has a "## The compat page" section');
  const out = {};
  for (const line of part.split(/\r?\n/u)) {
    const m = /^\|\s*PASANGAN_COPY\s*\|\s*`([a-z0-9_]+)`\s*\|\s*`(.*)`\s*\|$/u.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const R = ruled();
const ITEMS = [1, 2, 3, 4].map((n) => ({ label: R[`includes_${n}_label`], text: R[`includes_${n}_text`] }));

test('precondition: the rulings table has the lead and four label + text items', () => {
  assert.equal(Object.keys(R).length, 9);
  assert.equal(typeof R.page_lead, 'string');
  for (const [i, it] of ITEMS.entries()) {
    assert.ok(it.label && it.text, `item ${i + 1} has both halves`);
  }
});

for (const salesClosed of [false, true]) {
  const html = renderToStaticMarkup(React.createElement(Pasangan, { salesClosed }));
  const state = salesClosed ? 'closed' : 'open';

  test(`${state}: no "Kontras" anywhere on the page`, () => {
    assert.ok(html.includes('Bacaan Kompatibilitas'), 'precondition: the page rendered its title');
    assert.equal(/kontras/iu.test(html), false, 'the retired pattern is not promised');
  });

  test(`${state}: the lead is the ruled string`, () => {
    assert.ok(html.includes(`>${R.page_lead}<`), 'the ruled page_lead is rendered as a whole element');
  });

  test(`${state}: exactly four inclusions, each a bold label, a space, then its text, in order`, () => {
    const ul = /<ul\b[^>]*>([\s\S]*?)<\/ul>/u.exec(html);
    assert.ok(ul, 'the inclusion list rendered');
    const items = [...ul[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gu)].map((m) => m[1]);
    assert.equal(items.length, 4, `four items, not ${items.length}`);
    items.forEach((li, i) => {
      // THE CHECK ICON MUST NOT SHRINK. Every ruled item wraps at phone width, and a
      // flex child shrinks by default: measured 2026-10-07 at 375px, the 13px icon
      // rendered 5.8 to 7.8px wide, a different size on each line.
      assert.match(li, /<svg\b[^>]*style="[^"]*flex-shrink:0/u, `item ${i + 1}: the check icon does not shrink`);
      const m = /<strong\b[^>]*>([^<]*)<\/strong> ([^<]*)</u.exec(li);
      assert.ok(m, `item ${i + 1} has a <strong> label followed by a space and text: ${li.slice(0, 160)}`);
      assert.equal(m[1], ITEMS[i].label, `item ${i + 1} label`);
      assert.equal(m[2], ITEMS[i].text, `item ${i + 1} text`);
    });
  });
}
