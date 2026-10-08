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
import { PASANGAN_COPY, CHROME_COPY, SITE_COPY } from '../lib/site/copy.js';
import { COMPAT_ROUTE } from '../lib/site/routes.js';
import { priceFor } from '../lib/pricing.js';
import { formatIdr } from '../lib/site/format.js';
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
    const closed = await mount(React.createElement(Funnel, { salesOpen: false, compatOpen: false }));
    assert.equal(hasCompatLink(closed.host), false, 'closed fence: no door to a paid product');
    await closed.unmount();
    const open = await mount(React.createElement(Funnel, { salesOpen: true, compatOpen: true }));
    assert.equal(hasCompatLink(open.host), true, 'open fence: the compat card is back');
    await open.unmount();
  } finally { f.restore(); }
});

test('THE HEADER NAV DROPS COMPAT UNDER A CLOSED FENCE, and keeps it under an open one', () => {
  assert.deepEqual(navKeys({ compatOpen: false }), ['mirror']);
  assert.deepEqual(navKeys({ compatOpen: true }), ['mirror', 'compat']);
  const header = readFileSync(new URL('../components/SiteHeader.jsx', import.meta.url), 'utf8');
  assert.match(header, /navKeys\(/u, 'SiteHeader draws its links through navKeys');
});

// ── PROMPT AY §2: THE OFFER'S RULED BODY, AND THE COMPATIBILITY BLOCK ──
// REYNER-RULED 2026-10-01. Both read from the copy bank; the compat block sits
// directly after the offer and, like it, is not rendered under a closed fence.

test('AY §2: the offer carries the ruled headline and its three labelled lines, and not the old body', async () => {
  const f = stubFetch({});
  try {
    const open = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true }));
    const t = open.text();
    assert.ok(t.includes(CHROME_COPY.offer_headline), 'the ruled headline');
    assert.ok(t.includes(CHROME_COPY.offer_description), 'the AZ description under it');
    assert.ok(t.indexOf(CHROME_COPY.offer_headline) < t.indexOf(CHROME_COPY.offer_description), 'directly under the headline');
    assert.ok(t.includes('Kartu Edisi Lengkap') && !t.includes('Kartu Ringkasan Visual'), 'line 3 is AZ\'s');
    assert.ok(!t.includes('Melewatinya tidak mengurangi'), 'the line under the button is gone (AZ §4)');
    for (const item of CHROME_COPY.offer_items) {
      assert.ok(t.includes(item.label) && t.includes(item.text), `the line "${item.label}"`);
    }
    assert.ok(!t.includes('Kartu resolusi tinggi dan PDF dari bacaanmu'), 'the replaced body is gone from the offer');
    assert.ok(!/[—–]/u.test(t), 'no dash printed between a label and its text (rule 20)');
    await open.unmount();
  } finally { f.restore(); }
});

test('AY §2: THE COMPATIBILITY BLOCK renders after the offer under an open fence, and not at all under a closed one', async () => {
  const f = stubFetch({});
  try {
    const open = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true, compatOpen: true }));
    const t = open.text();
    assert.ok(t.includes(CHROME_COPY.compat_cta), 'open fence: the compat CTA renders');
    assert.ok(t.includes(CHROME_COPY.compat_eyebrow) && t.includes(CHROME_COPY.compat_headline));
    for (const item of CHROME_COPY.compat_items) assert.ok(t.includes(item.label) && t.includes(item.text), `the line "${item.label}"`);
    assert.ok(t.includes(formatIdr(priceFor('compat'))), 'the compat price, from lib/pricing.js');
    assert.ok(t.indexOf(OFFER_CTA) < t.indexOf(CHROME_COPY.compat_eyebrow), 'directly AFTER the Complete Edition offer');
    const link = [...open.host.querySelectorAll('a')].find((a) => a.textContent.includes(CHROME_COPY.compat_cta));
    assert.equal(link?.getAttribute('href'), COMPAT_ROUTE, 'the button goes to the compatibility page');
    await open.unmount();

    const closed = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: false }));
    assert.ok(!closed.text().includes(CHROME_COPY.compat_cta), 'closed fence: no compat CTA');
    assert.ok(!closed.text().includes(CHROME_COPY.compat_headline), 'closed fence: no compat block at all');
    assert.ok(!closed.text().includes(formatIdr(priceFor('compat'))), 'closed fence: no compat price');
    await closed.unmount();

    // A buyer inside HER purchase still sees her delivery, but not a new product.
    const bought = await mount(React.createElement(Reading, {
      reading: SERVED, onReset() {}, salesOpen: false, initialStage: 'delivered',
    }));
    assert.ok(!bought.text().includes(CHROME_COPY.compat_cta), 'closed fence + delivered: still no compat block');
    await bought.unmount();
  } finally { f.restore(); }
});

// ── compat_cta_seen IS "ON SCREEN", NOT "MOUNTED" (Prompt BM item 5, 2026-10-08) ──
// It fired on mount until BM, while offer_seen fired on viewport intersection (BG §2.3),
// so the two were not comparable. jsdom has no IntersectionObserver: this fake is driven
// by hand, the pattern of tests/offer-seen.spec.mjs, so the test decides what is on screen.
const observers = [];
class FakeIO {
  constructor(cb) { this.cb = cb; this.els = []; observers.push(this); }
  observe(el) { this.els.push(el); }
  unobserve() {}
  disconnect() { this.els = []; }
}
async function show(el, isIntersecting) {
  await act(async () => {
    for (const o of observers) if (o.els.includes(el)) o.cb([{ target: el, isIntersecting }]);
  });
}

test('AZ §4 + BM 5: compat_cta_seen fires when the block is ON SCREEN, once; compat_cta_click on its button; nothing when hidden', async () => {
  const prev = globalThis.fetch;
  const prevIO = globalThis.IntersectionObserver;
  observers.length = 0;
  window.IntersectionObserver = FakeIO;
  globalThis.IntersectionObserver = FakeIO;
  const sent = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/event')) sent.push(JSON.parse(init.body).event);
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const seen = () => sent.filter((e) => e === 'compat_cta_seen').length;
  try {
    const open = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: true, compatOpen: true }));
    const block = open.host.querySelector('[data-compat-offer]');
    assert.ok(block, 'precondition: the compat block is on the page');
    assert.equal(seen(), 0, `mounted but not scrolled to: no seen event (${sent.join(', ')})`);

    await show(block, false);
    assert.equal(seen(), 0, 'an observer report that it is OFF screen does not count');
    await show(block, true);
    assert.equal(seen(), 1, `on screen: seen fires (${sent.join(', ')})`);
    await show(block, false);
    await show(block, true);
    assert.equal(seen(), 1, 'a re-scroll does not fire it again');

    const link = [...open.host.querySelectorAll('a')].find((a) => a.textContent.includes(CHROME_COPY.compat_cta));
    // Stop jsdom navigating; the handler still runs.
    link.addEventListener('click', (e) => e.preventDefault());
    await act(async () => { link.click(); });
    assert.ok(sent.includes('compat_cta_click'), `clicked: ${sent.join(', ')}`);
    await open.unmount();

    sent.length = 0;
    const closed = await mount(React.createElement(Reading, { reading: SERVED, onReset() {}, salesOpen: false }));
    assert.ok(!sent.includes('compat_cta_seen'), 'hidden: no seen event');
    await closed.unmount();
  } finally {
    globalThis.fetch = prev;
    window.IntersectionObserver = prevIO;
    globalThis.IntersectionObserver = prevIO;
  }
});

test('AZ §4: /harga\'s Complete Edition body IS the offer\'s copy-bank entries, not a duplicate', () => {
  // A source guard: app/ pages are not rendered under node --test (the @/ alias). The
  // screenshots in docs/qa/2026-10-01-sales-blocks-az/ show the rendered page.
  const page = readFileSync(new URL('../app/harga/page.js', import.meta.url), 'utf8');
  // The headline and the three lines stay shared. The description is /harga's own
  // since BA §3 (below).
  for (const key of ['offer_headline', 'offer_items']) {
    assert.match(page, new RegExp(`CHROME_COPY\\.${key}`, 'u'), `/harga reads CHROME_COPY.${key}`);
  }
  assert.equal(SITE_COPY.harga.artifact.body, undefined, 'the duplicated /harga body string is gone');
});

test('BA §3: /harga has its own Complete Edition description, and the compat row is sellable copy behind the fence', () => {
  // REYNER-RULED 2026-10-01 (Prompt BA §3 and his amendment: "Agree on all 3 proposals
  // on copy"). A source guard plus the copy bank: app/ pages are not rendered under
  // node --test. The screenshots in docs/qa/2026-10-01-harga-ba/ show the page.
  const page = readFileSync(new URL('../app/harga/page.js', import.meta.url), 'utf8');
  const h = SITE_COPY.harga;
  assert.equal(h.artifact.description,
    'Satu refleksi lengkap tentang dirimu, disusun dari bagan lahirmu dan bisa kamu unduh sebagai PDF pribadi.');
  assert.match(page, /q\.artifact\.description/u, '/harga renders its own description');
  assert.doesNotMatch(page, /CHROME_COPY\.offer_description/u, '/harga no longer shows the "gratis di atas" line');
  assert.match(CHROME_COPY.offer_description, /gratis di atas/u, 'the result-page offer keeps AZ\'s description');

  assert.equal(h.compat.name, 'Bacaan Kompatibilitas');
  assert.equal(h.compat.body,
    'Lihat bagaimana pola kalian saling bertemu, apa yang terasa alami, dan di mana hubungan ini mungkin membutuhkan lebih banyak pengertian.');
  assert.equal(h.compat.link, 'Baca pola kalian berdua');
  assert.equal(h.compat.note, undefined, 'the "Belum bisa dibeli" note is retired');
  assert.doesNotMatch(JSON.stringify(h), /Belum bisa dibeli/u);
  // The link follows the compat answer exactly as the result page's compat block does
  // (the payment fence AND the COMPAT_SALES switch since K2, 2026-10-02).
  assert.match(page, /compatCheckoutOpen\(\)/u, '/harga reads the fence');
  assert.match(page, /COMPAT_ROUTE/u, 'the link goes to the compatibility page');
  assert.doesNotMatch(page, /Rp\s?\d/u, 'no typed price');
  // Kept: the CE row's purchase-path note and its closing guarantee.
  assert.match(h.artifact.noteAfter, /Melewatinya tidak mengurangi apa pun dari bacaan gratismu\.$/u);
});

// ── ONE SOURCE: THE FENCE, READ BY THE SERVER PAGES ────────

test('EVERY PAGE THAT CARRIES A PAID ENTRY POINT PASSES checkoutOpen() or compatCheckoutOpen(), and no component reads the env', () => {
  const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  // `checkoutOpen()` for the CE offer, `compatCheckoutOpen()` for compat's entry
  // points (K2, 2026-10-02). Both are the fence module's own exports; the second
  // contains the first, so either regex below matches the fence's word.
  for (const page of ['app/page.js', 'app/r/[token]/page.js', 'app/layout.js',
    'app/kompatibilitas/page.js', 'app/kompatibilitas/[id]/page.js', 'app/harga/page.js']) {
    assert.match(src(page), /(?:checkoutOpen|compatCheckoutOpen)\(\)/u, `${page} reads the fence's own export`);
    assert.doesNotMatch(src(page), /paymentsProvider\(\) === 'closed'/u,
      `${page} must not carry a second copy of the rule`);
  }
  for (const c of ['components/Funnel.jsx', 'components/SiteHeader.jsx',
    'components/Pasangan.jsx', 'components/PasanganReport.jsx']) {
    assert.doesNotMatch(src(c), /process\.env\.(?:PAYMENTS_PROVIDER|COMPAT_SALES)/u, `${c} reads no env`);
  }
});
