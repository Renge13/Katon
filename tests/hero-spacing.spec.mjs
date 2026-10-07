// ============================================================
// tests/hero-spacing.spec.mjs — a tighter hero and a shorter desktop footer
// ============================================================
// Run: npm run test:hero-spacing
//
// Prompt BK (Reyner ruled 2026-10-07, option B). Layout only: no copy, no order.
//   1. Header bottom to the headline's top: ~48px at >=768px, ~40px on phones, on
//      the home hero and the /kompatibilitas landing. The old spacer was
//      `paddingTop: 60` (+ a 44px marginTop on the home headline), left behind when
//      the hero logomark moved into SiteHeader (Y-2b).
//   2. Home only: ~48px from the last hero element to the footer's top border.
//   3. Desktop footer: operator and contact on ONE line, tighter spacing. Phones
//      keep today's footer exactly.
//
// WHAT THIS CAN AND CANNOT SEE. jsdom does no layout, so this asserts the rendered
// MARKUP and the stylesheet rules that markup is wired to. The pixel evidence is
// the browser walk (`scripts/hero-spacing-walk.mjs`, table and PNGs under
// docs/qa/2026-10-07-bk-spacing/). Each class assertion is paired with the inline
// style it replaced being ABSENT, because an inline style beats a class and a class
// that is present but overridden would pass a presence check alone.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';

import Funnel from '../components/Funnel.jsx';
import Pasangan from '../components/Pasangan.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { ENTITY } from '../lib/site/entity.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const CSS = readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');

// ── the stylesheet, split into top-level rules and @media blocks ──
// Brace-matched rather than regexed: a rule inside a media block must not be read
// as a top-level rule, which is the whole distinction being tested.
function blocks(css) {
  const out = [];
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1) break;
    const selector = src.slice(i, open).trim();
    let depth = 1; let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth += 1;
      else if (src[j] === '}') depth -= 1;
      j += 1;
    }
    out.push({ selector, body: src.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}
function decl(body, selector, prop) {
  const rule = blocks(body).find((b) => b.selector.split(',').map((s) => s.trim()).includes(selector));
  if (!rule) return undefined;
  const m = rule.body.match(new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : undefined;
}
const TOP = blocks(CSS).filter((b) => !b.selector.startsWith('@')).map((b) => `${b.selector}{${b.body}}`).join('\n');
const DESKTOP = blocks(CSS).filter((b) => /^@media\s*\(min-width:\s*768px\)$/.test(b.selector)).map((b) => b.body).join('\n');

async function mountHome() {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(Funnel, { salesOpen: true, compatOpen: true })); });
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); globalThis.fetch = prev; } };
}
function parse(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
}
// Every element from `el` up to (not including) `stop`.
// An inline value that adds no space: absent, or the h1's own `margin: 0` expanded.
const noSpace = (v) => v === '' || v === '0' || v === '0px';
function ancestors(el, stop) {
  const out = [];
  for (let n = el; n && n !== stop; n = n.parentElement) out.push(n);
  return out;
}

test('THE STYLESHEET: the hero spacer is 40px on phones and 48px from 768px up', () => {
  assert.equal(decl(TOP, '.k-hero-top', 'padding-top'), '40px', 'phones: header to headline ~40px');
  assert.ok(DESKTOP, 'a @media (min-width: 768px) block exists');
  assert.equal(decl(DESKTOP, '.k-hero-top', 'padding-top'), '48px', 'desktop: header to headline ~48px');
});

test('HOME: the headline sits under the k-hero-top spacer and nothing else pads it', async () => {
  const ui = await mountHome();
  try {
    const h1 = ui.host.querySelector('h1');
    assert.ok(h1 && /Ada pola/.test(h1.textContent), 'precondition: the home headline rendered');
    const chain = ancestors(h1, ui.host);
    assert.ok(chain.some((n) => n.classList.contains('k-hero-top')), 'the headline is inside .k-hero-top');
    for (const n of chain) {
      assert.ok(noSpace(n.style.paddingTop), `no inline paddingTop between header and headline (found ${n.style.paddingTop} on <${n.tagName.toLowerCase()} class="${n.className}">)`);
      assert.ok(noSpace(n.style.marginTop), `no inline marginTop between header and headline (found ${n.style.marginTop})`);
    }
  } finally { ui.unmount(); }
});

test('HOME: 24px of its own bottom padding, which with the footer marginTop is ~48px', async () => {
  const ui = await mountHome();
  try {
    const wrap = ui.host.querySelector('h1').closest('[style*="max-width"]');
    assert.ok(wrap, 'precondition: the home column rendered');
    assert.equal(wrap.style.paddingBottom, '24px', 'home column bottom padding');
    assert.equal(decl(TOP, '.k-footer', 'margin-top'), '24px', 'the footer keeps its 24px marginTop');
  } finally { ui.unmount(); }
});

test('/kompatibilitas: both landing states use the same spacer, and no paddingTop 60', () => {
  for (const salesClosed of [false, true]) {
    const host = parse(renderToStaticMarkup(React.createElement(Pasangan, { salesClosed })));
    const h1 = host.querySelector('h1');
    assert.ok(h1, `precondition: the landing headline rendered (salesClosed=${salesClosed})`);
    const chain = ancestors(h1, host);
    assert.ok(chain.some((n) => n.classList.contains('k-hero-top')), `headline inside .k-hero-top (salesClosed=${salesClosed})`);
    for (const n of chain) assert.ok(noSpace(n.style.paddingTop), `no inline paddingTop above the headline (salesClosed=${salesClosed})`);
  }
});

test('FOOTER, PHONES: today\'s numbers, exactly', () => {
  // The values as they stood on main (components/SiteFooter.jsx, b8e9ba8), now
  // carried by classes so the desktop block can override them.
  assert.equal(decl(TOP, '.k-footer', 'padding'), '30px 22px 40px');
  assert.equal(decl(TOP, '.k-footer-nav', 'margin-bottom'), '20px');
  assert.equal(decl(TOP, '.k-footer-contact', 'margin-top'), '8px');
  assert.equal(decl(TOP, '.k-footer-mark', 'margin-top'), '14px');
});

test('FOOTER, DESKTOP: operator and contact share one row, and the spacing is tighter', () => {
  const host = parse(renderToStaticMarkup(React.createElement(SiteFooter)));
  const footer = host.querySelector('footer');
  assert.ok(footer.classList.contains('k-footer'));
  assert.equal(footer.style.padding, '', 'no inline padding to beat the class');
  assert.equal(footer.style.marginTop, '', 'no inline marginTop to beat the class');

  const row = footer.querySelector('.k-footer-ids');
  assert.ok(row, 'the operator and contact lines have one shared parent');
  const kids = [...row.children];
  assert.equal(kids.length, 2, 'exactly two items in the row');
  assert.match(kids[0].textContent, new RegExp(`Dioperasikan oleh\\s+${ENTITY.name}`), 'operator first, unchanged');
  assert.ok(kids[1].classList.contains('k-footer-contact'));
  assert.equal(kids[1].style.marginTop, '', 'no inline marginTop on the contact line');
  assert.ok(kids[1].querySelector(`a[href="mailto:${ENTITY.email}"]`), 'contact link unchanged');
  // NO MIDDLE DOT, NO GLYPH: rule 20 bans U+00B7 (scripts/check-copy.js). The row is
  // separated by gap, the way the nav right above it separates its links.
  assert.ok(!footer.textContent.includes('·'), 'no middle dot in the footer');

  assert.equal(decl(DESKTOP, '.k-footer-ids', 'display'), 'flex', 'desktop: one row');
  assert.equal(decl(DESKTOP, '.k-footer-ids', 'flex-wrap'), 'nowrap', 'desktop: never wraps');
  assert.equal(decl(DESKTOP, '.k-footer-contact', 'margin-top'), '0', 'desktop: no stacked gap');
  for (const [sel, prop] of [['.k-footer', 'padding'], ['.k-footer-nav', 'margin-bottom'], ['.k-footer-mark', 'margin-top']]) {
    assert.ok(decl(DESKTOP, sel, prop), `desktop overrides ${sel} ${prop}`);
    assert.notEqual(decl(DESKTOP, sel, prop), decl(TOP, sel, prop), `desktop ${sel} ${prop} is tighter than phones`);
  }
});
