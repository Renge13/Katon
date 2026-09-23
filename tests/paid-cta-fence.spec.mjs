// ============================================================
// tests/paid-cta-fence.spec.mjs — no paid CTA while the fence is closed
// ============================================================
// Run: npm run test:paid-cta-fence
//
// RULED 2026-09-23 (Reyner), PROGRESS INTERIM REGISTER "PAID CTA HIDDEN WHILE
// FENCE CLOSED". Production had PAYMENTS_PROVIDER resolving to `closed`, the pay
// route answered `503 {"error":"payment_closed"}`, and the Rp 19.000 offer went to
// its pending spinner anyway - forever. The ruling: while the fence is closed, no
// paid entry point renders at all.
//
// ── EVERY ASSERTION HERE CAN FAIL BOTH WAYS ─────────────────
// Each closed-fence case is paired with the same render under an OPEN fence that
// must show the CTA. A test that only asserted absence would pass on a component
// that had lost its offer entirely, which is a test that passes whether the
// feature exists or not (CLAUDE.md, 2026-08-26).
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
import { checkoutOpen } from '../lib/paymentFence.js';
import { navKeys } from '../lib/site/nav.js';
import { PASANGAN_COPY } from '../lib/site/copy.js';
import Funnel, { Reading } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));
const SERVED = {
  token: 't',
  chart: CHART_VIEW,
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
};

// The words a reader sees on the offer. Matched on TEXT, not on markup, because the
// proposition is what she can tap.
const OFFER_CTA = 'Ambil Complete Edition';

/** fetch, answering the pay route with `payBody` and everything else with {}. */
function stubFetch(payBody, payStatus = 503) {
  const prev = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    const isPay = String(url).startsWith('/api/pay/');
    const body = isPay ? payBody : {};
    return {
      ok: isPay ? payStatus < 400 : true,
      status: isPay ? payStatus : 200,
      json: async () => body,
    };
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return {
    host,
    text: () => host.textContent || '',
    unmount: () => act(() => root.unmount()),
  };
}

const withEnv = (vars, fn) => {
  const keys = ['PAYMENTS_PROVIDER', 'VERCEL_ENV', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY', 'DOKU_SANDBOX'];
  const prev = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, vars);
  try { return fn(); } finally {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
};

// ── THE ONE RULE, IN THE FENCE MODULE ──────────────────────

test('checkoutOpen IS THE FENCE: false when unset, true only where the pay route would proceed', () => {
  assert.equal(withEnv({}, checkoutOpen), false, 'unset is closed - production today');
  assert.equal(withEnv({ PAYMENTS_PROVIDER: 'closed' }, checkoutOpen), false);
  assert.equal(withEnv({ PAYMENTS_PROVIDER: 'xendit' }, checkoutOpen), false, 'a stale value is closed');
  assert.equal(withEnv({ PAYMENTS_PROVIDER: 'mock' }, checkoutOpen), true, 'preview walks the paid flow');
  assert.equal(withEnv({ PAYMENTS_PROVIDER: 'mock', VERCEL_ENV: 'production' }, checkoutOpen), false);
  // A misconfigured DOKU answers 503 from the pay route too, so the CTA would hang
  // exactly as it did today. Hidden, by the same rule.
  assert.equal(withEnv({ PAYMENTS_PROVIDER: 'doku' }, checkoutOpen), false);
  assert.equal(withEnv({
    PAYMENTS_PROVIDER: 'doku', DOKU_CLIENT_ID: 'x', DOKU_SECRET_KEY: 'y',
  }, checkoutOpen), true, 'the DOKU flip brings it back with no code change');
});

// ── THE RP 19.000 OFFER ────────────────────────────────────

test('THE OFFER IS NOT RENDERED UNDER A CLOSED FENCE, and is under an open one', async () => {
  const f = stubFetch({});
  try {
    const closed = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: false }));
    assert.ok(!closed.text().includes(OFFER_CTA), 'closed fence: the Rp 19.000 CTA must not render');
    assert.ok(!closed.text().includes('Rp 19.000'), 'closed fence: no price for a thing she cannot buy');
    await closed.unmount();

    const open = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true }));
    assert.ok(open.text().includes(OFFER_CTA), 'open fence: the CTA is back');
    await open.unmount();
  } finally { f.restore(); }
});

test('A BUYER WHO ALREADY PAID STILL GETS HER DELIVERY under a closed fence', async () => {
  // Closing sales is not revoking a purchase (paymentFence.js). `delivered` opens
  // the offer component straight into Delivery, which must survive the hiding.
  const f = stubFetch({});
  try {
    const m = await mount(React.createElement(Reading, {
      reading: SERVED, onReset() {}, salesOpen: false, initialStage: 'delivered',
    }));
    assert.ok(!m.text().includes(OFFER_CTA));
    assert.ok(f.calls.some((u) => u.startsWith('/api/deliver/')),
      'the delivery component mounted and asked for her artifacts');
    await m.unmount();
  } finally { f.restore(); }
});

test('A CLOSED ANSWER FROM THE PAY ROUTE RENDERS A MESSAGE, NEVER A SPINNER', async () => {
  // The back-button case: a page rendered while the fence was open, tapped after
  // it closed. This is today's production bug, reproduced in the component.
  const f = stubFetch({ error: 'payment_closed' }, 503);
  try {
    const m = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true }));
    const button = [...m.host.querySelectorAll('button')].find((b) => b.textContent.includes(OFFER_CTA));
    assert.ok(button, 'the CTA exists to tap');
    await act(async () => { button.click(); await new Promise((r) => setTimeout(r, 0)); });
    assert.equal(m.host.querySelectorAll('.k-spin').length, 0, 'no spinner after a closed answer');
    assert.ok(m.text().includes(PASANGAN_COPY.sales_closed_body), 'the ruled closed message renders');
    await m.unmount();
  } finally { f.restore(); }
});

// ── THE COMPAT ENTRY POINTS ────────────────────────────────

test('THE HOME COMPAT CARD IS NOT RENDERED UNDER A CLOSED FENCE, and is under an open one', async () => {
  const f = stubFetch({});
  try {
    const hasCompatLink = (host) => [...host.querySelectorAll('a')]
      .some((a) => a.getAttribute('href') === '/kompatibilitas');
    const closed = await mount(React.createElement(Funnel, { salesOpen: false }));
    assert.equal(hasCompatLink(closed.host), false, 'closed fence: no door to a paid product');
    await closed.unmount();
    const open = await mount(React.createElement(Funnel, { salesOpen: true }));
    assert.equal(hasCompatLink(open.host), true, 'open fence: the compat card is back');
    await open.unmount();
  } finally { f.restore(); }
});

test('THE HEADER NAV DROPS COMPAT UNDER A CLOSED FENCE, and keeps it under an open one', () => {
  assert.deepEqual(navKeys({ salesOpen: false }), ['mirror']);
  assert.deepEqual(navKeys({ salesOpen: true }), ['mirror', 'compat']);
  const header = readFileSync(new URL('../components/SiteHeader.jsx', import.meta.url), 'utf8');
  assert.match(header, /navKeys\(/u, 'SiteHeader draws its links through navKeys');
});

// ── ONE SOURCE: THE FENCE, READ BY THE SERVER PAGES ────────

test('EVERY PAGE THAT CARRIES A PAID ENTRY POINT PASSES checkoutOpen(), and no component reads the env', () => {
  const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  for (const page of ['app/page.js', 'app/r/[token]/page.js', 'app/layout.js',
    'app/kompatibilitas/page.js', 'app/kompatibilitas/[id]/page.js']) {
    assert.match(src(page), /checkoutOpen\(\)/u, `${page} reads the fence's own export`);
    assert.doesNotMatch(src(page), /paymentsProvider\(\) === 'closed'/u,
      `${page} must not carry a second copy of the rule`);
  }
  for (const c of ['components/Funnel.jsx', 'components/SiteHeader.jsx',
    'components/Pasangan.jsx', 'components/PasanganReport.jsx']) {
    assert.doesNotMatch(src(c), /process\.env\.PAYMENTS_PROVIDER/u, `${c} reads no env`);
  }
});
