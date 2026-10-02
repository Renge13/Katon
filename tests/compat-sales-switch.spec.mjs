// ============================================================
// tests/compat-sales-switch.spec.mjs — compat can be off sale while the CE sells
// ============================================================
// Run: npm run test:compat-sales-switch
//
// RULED 2026-10-02 (Reyner, K2; docs/product/compat-rulings-2026-10-02.md): "build
// the compat-only payment toggle", so the Complete Edition can sell while compat is
// reworked (Prompt BC). Before this, one fence (`checkoutOpen()`) answered every paid
// CTA, so opening payments for the CE opened compat with it.
//
// THE SWITCH IS `COMPAT_SALES`, read in ONE place: `compatSalesSwitch()` in
// lib/paymentFence.js. Only the value `open` turns it on; unset, empty or anything
// else is OFF, for the same reason PAYMENTS_PROVIDER fails closed. Compat is on sale
// only when BOTH the payment fence is open AND the switch is on
// (`compatCheckoutOpen()`).
//
// ── EVERY ASSERTION HERE CAN FAIL BOTH WAYS ─────────────────
// Each "compat off" case is paired with the same render with compat ON, where the
// compat surface must be present, and with the CE offer, which must stay present
// with compat off. A test that only asserted absence would pass on a page that had
// lost every CTA (CLAUDE.md, 2026-08-26).
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import {
  checkoutOpen, compatCheckoutOpen, compatFenceReason, compatSalesSwitch,
} from '../lib/paymentFence.js';
import { navKeys } from '../lib/site/nav.js';
import { CHROME_COPY } from '../lib/site/copy.js';
import { COMPAT_ROUTE } from '../lib/site/routes.js';
import Funnel, { Reading } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const SERVED = {
  token: 't',
  chart: mirrorChartView(chart, buildSemanticJson(chart)),
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
};
const OFFER_CTA = 'Ambil Complete Edition';

const KEYS = ['PAYMENTS_PROVIDER', 'VERCEL_ENV', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY', 'DOKU_SANDBOX', 'COMPAT_SALES'];
const withEnv = (vars, fn) => {
  const prev = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, vars);
  try { return fn(); } finally {
    for (const k of KEYS) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
};
// Payments OPEN, the real provider configured: the state the CE launches in.
const OPEN = { PAYMENTS_PROVIDER: 'doku', DOKU_CLIENT_ID: 'x', DOKU_SECRET_KEY: 'y' };

function stubFetch() {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  return () => { globalThis.fetch = prev; };
}
async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return { host, text: () => host.textContent || '', unmount: () => act(() => root.unmount()) };
}
const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

// ── THE SWITCH, IN THE FENCE MODULE ────────────────────────

test('K2: WITH PAYMENTS OPEN AND THE COMPAT SWITCH OFF, the CE sells and compat does not', () => {
  withEnv(OPEN, () => {
    assert.equal(checkoutOpen(), true, 'the CE checkout is open');
    assert.equal(compatSalesSwitch(), false, 'unset is OFF - the default');
    assert.equal(compatCheckoutOpen(), false, 'compat is off sale');
    assert.equal(compatFenceReason(), 'payment_closed', 'a compat checkout refuses as closed');
  });
  for (const v of ['', 'closed', 'true', '1', 'yes']) {
    withEnv({ ...OPEN, COMPAT_SALES: v }, () => assert.equal(compatCheckoutOpen(), false, `COMPAT_SALES=${JSON.stringify(v)} is off`));
  }
});

test('K2: compat sells ONLY when payments are open AND COMPAT_SALES=open', () => {
  withEnv({ ...OPEN, COMPAT_SALES: 'open' }, () => {
    assert.equal(compatCheckoutOpen(), true);
    assert.equal(compatFenceReason(), null);
  });
  withEnv({ ...OPEN, COMPAT_SALES: ' Open ' }, () => assert.equal(compatCheckoutOpen(), true, 'trimmed, case-insensitive like PAYMENTS_PROVIDER'));
  // The switch cannot open what the payment fence has closed.
  withEnv({ COMPAT_SALES: 'open' }, () => {
    assert.equal(compatCheckoutOpen(), false, 'payments unset: closed whatever the switch says');
    assert.equal(compatFenceReason(), 'payment_closed');
  });
  withEnv({ PAYMENTS_PROVIDER: 'doku', COMPAT_SALES: 'open' }, () => {
    assert.equal(compatFenceReason(), 'doku_client_id_unset', 'the payment fence\'s own reason wins');
  });
});

// ── THE SURFACES ───────────────────────────────────────────

test('K2: THE RESULT PAGE with compat off shows the CE offer and NO compat block; with compat on, both', async () => {
  const restore = stubFetch();
  try {
    const off = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true, compatOpen: false }));
    assert.ok(off.text().includes(OFFER_CTA), 'compat off: the CE offer still renders');
    assert.ok(!off.text().includes(CHROME_COPY.compat_cta), 'compat off: no compat CTA');
    assert.ok(!off.text().includes(CHROME_COPY.compat_headline), 'compat off: no compat block');
    await off.unmount();

    const on = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true, compatOpen: true }));
    assert.ok(on.text().includes(OFFER_CTA));
    assert.ok(on.text().includes(CHROME_COPY.compat_cta), 'compat on: the compat CTA renders');
    await on.unmount();
  } finally { restore(); }
});

test('K2: THE HOME PAGE compat link follows the compat switch, not the payment fence', async () => {
  const restore = stubFetch();
  const hasCompatLink = (host) => [...host.querySelectorAll('a')].some((a) => a.getAttribute('href') === COMPAT_ROUTE);
  try {
    const off = await mount(React.createElement(Funnel, { salesOpen: true, compatOpen: false }));
    assert.equal(hasCompatLink(off.host), false, 'compat off: no door to compat');
    await off.unmount();
    const on = await mount(React.createElement(Funnel, { salesOpen: true, compatOpen: true }));
    assert.equal(hasCompatLink(on.host), true, 'compat on: the door is back');
    await on.unmount();
  } finally { restore(); }
});

test('K2: THE HEADER NAV draws compat only while compat is on sale', () => {
  assert.deepEqual(navKeys({ compatOpen: false }), ['mirror']);
  assert.deepEqual(navKeys({ compatOpen: true }), ['mirror', 'compat']);
  assert.match(src('app/layout.js'), /<SiteHeader compatOpen=\{compatCheckoutOpen\(\)\} \/>/u);
});

test('K2: EVERY COMPAT ENTRY POINT and the pay route read compatCheckoutOpen / compatFenceReason', () => {
  // app/ pages and routes are not importable under node --test (the @/ alias), so
  // these are source guards; the behaviour they wire is asserted above.
  assert.match(src('app/page.js'), /compatOpen=\{compatCheckoutOpen\(\)\}/u, 'home');
  assert.match(src('app/r/[token]/page.js'), /compatOpen=\{compatCheckoutOpen\(\)\}/u, 'result page');
  assert.match(src('app/harga/page.js'), /sku="compat"[^\n]*salesOpen=\{compatOpen\}/u, '/harga compat row');
  assert.match(src('app/harga/page.js'), /const compatOpen = compatCheckoutOpen\(\)/u);
  assert.match(src('app/kompatibilitas/page.js'), /salesClosed=\{!compatCheckoutOpen\(\)\}/u, '/kompatibilitas form');
  assert.match(src('app/kompatibilitas/[id]/page.js'), /salesClosed=\{!compatCheckoutOpen\(\)\}/u, 'compat report page');

  const pay = src('app/api/pay/[id]/route.js');
  const at = pay.indexOf('compatFenceReason()');
  assert.ok(at > 0, 'the pay route asks the compat fence');
  assert.ok(at < pay.indexOf('createCheckout('), 'before any checkout is created');
  assert.ok(at < pay.indexOf("paymentsProvider() === 'mock'"), 'before the mock branch too');
  assert.match(src('app/api/mock-pay/[id]/route.js'), /compatCheckoutOpen\(\)/u, 'the free unlock refuses a pair while compat is off');
});
