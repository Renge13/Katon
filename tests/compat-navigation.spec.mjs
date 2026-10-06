// ============================================================
// tests/compat-navigation.spec.mjs — compat in the header and on /harga, open and closed
// ============================================================
// Run: npm run test:compat-navigation
//
// Prompt BG §6 (Reyner, 2026-10-06). Closed: /harga marks Bacaan Kompatibilitas with the
// strings /kompatibilitas uses when closed, and nothing on that card looks buyable. Open
// (COMPAT_SALES=open with payments open): the header's second item is "Kompatibilitas",
// linking /kompatibilitas; closed, it is absent. Both states asserted on the RENDERED
// header and the RENDERED page (scripts/alias-register.mjs resolves their `@/` imports),
// each "absent" paired with a "present".
// ============================================================

import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import SiteHeader from '../components/SiteHeader.jsx';
import HargaPage from '../app/harga/page.js';
import { PASANGAN_COPY, CHROME_COPY, SITE_COPY } from '../lib/site/copy.js';
import { COMPAT_ROUTE } from '../lib/site/routes.js';
import { compatCheckoutOpen } from '../lib/paymentFence.js';

const ENV = ['PAYMENTS_PROVIDER', 'COMPAT_SALES', 'VERCEL_ENV'];
const saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
afterEach(() => { for (const k of ENV) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

function setCompat(open) {
  delete process.env.VERCEL_ENV;
  if (open) { process.env.PAYMENTS_PROVIDER = 'mock'; process.env.COMPAT_SALES = 'open'; }
  else { delete process.env.PAYMENTS_PROVIDER; delete process.env.COMPAT_SALES; }
  assert.equal(compatCheckoutOpen(), open, `precondition: compat is ${open ? 'open' : 'closed'}`);
}

/** The /harga markup, and the compat card's slice of it (from its name to the next card). */
function harga() {
  const html = renderToStaticMarkup(React.createElement(HargaPage));
  const start = html.indexOf(SITE_COPY.harga.compat.name);
  assert.ok(start > -1, 'the compat card renders');
  const end = html.indexOf(SITE_COPY.harga.payment, start);
  return { html, card: html.slice(start, end > -1 ? end : undefined) };
}

const navLinks = (html) => [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)</gu)]
  .map((m) => ({ href: m[1], text: m[2] }))
  .filter((l) => l.text === CHROME_COPY.nav_mirror || l.text === CHROME_COPY.nav_compat);

test('BG §6 CLOSED: /harga marks compat with /kompatibilitas\'s closed strings, and nothing on the card looks buyable', () => {
  setCompat(false);
  const { card } = harga();
  assert.ok(card.includes(PASANGAN_COPY.sales_closed_title), 'the closed title, "Belum Tersedia"');
  assert.ok(card.includes(PASANGAN_COPY.sales_closed_body), 'the closed body');
  assert.equal(card.includes(`href="${COMPAT_ROUTE}"`), false, 'no link to the compat form');
  assert.equal(card.includes(SITE_COPY.harga.compat.link), false, 'no "Baca pola kalian berdua"');
  assert.equal(card.includes(SITE_COPY.harga.launchLabel), false, 'no launch-price badge');
  assert.equal(card.includes('<s>'), false, 'no struck-through list price');
  assert.ok(card.includes(SITE_COPY.harga.compat.body), 'the catalogue still describes it');
});

test('BG §6 OPEN: /harga\'s compat card links the form and carries no closed string', () => {
  setCompat(true);
  const { card } = harga();
  assert.ok(card.includes(`href="${COMPAT_ROUTE}"`), 'the link to the compat form');
  assert.ok(card.includes(SITE_COPY.harga.compat.link));
  assert.equal(card.includes(PASANGAN_COPY.sales_closed_title), false);
  assert.equal(card.includes(PASANGAN_COPY.sales_closed_body), false);
});

test('BG §6: the header\'s second item is Kompatibilitas while compat is open, and absent while closed', () => {
  const open = navLinks(renderToStaticMarkup(React.createElement(SiteHeader, { compatOpen: true })));
  assert.deepEqual(open, [
    { href: '/', text: CHROME_COPY.nav_mirror },
    { href: COMPAT_ROUTE, text: CHROME_COPY.nav_compat },
  ], 'open: Bacaan Diri, then Kompatibilitas to /kompatibilitas');
  const closed = navLinks(renderToStaticMarkup(React.createElement(SiteHeader, { compatOpen: false })));
  assert.deepEqual(closed, [{ href: '/', text: CHROME_COPY.nav_mirror }], 'closed: Bacaan Diri only');
});

test('BG §6: the layout passes the compat answer, not the payment fence alone, to the header', async () => {
  const { readFileSync } = await import('node:fs');
  const layout = readFileSync(new URL('../app/layout.js', import.meta.url), 'utf8');
  assert.match(layout, /<SiteHeader compatOpen=\{compatCheckoutOpen\(\)\} \/>/u);
});
