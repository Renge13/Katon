// ============================================================
// tests/offer-seen.spec.mjs — `offer_seen` fires when the offer is on her screen
// ============================================================
// Run: npm run test:offer-seen
//
// Prompt BG §2.3 (Reyner, 2026-10-06): the client reports `offer_seen` when the
// Complete Edition offer panel first enters the viewport, reusing the observer the
// sticky pay bar already runs. It used to fire on mount, which counted every reader who
// opened the page, including those who never scrolled to the offer. The server half
// (one row per reading, nothing on a paid reading or with payments closed) is
// tests/offer-seen-route.spec.mjs.
//
// jsdom has no IntersectionObserver. The fake below is driven by hand, the pattern of
// tests/post-purchase.spec.mjs, so the test decides what is "on screen".
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { Reading } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const SERVED = {
  token: 'tok1',
  chart: mirrorChartView(chart, buildSemanticJson(chart)),
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
};

const observers = [];
class FakeIO {
  constructor(cb) { this.cb = cb; this.els = []; observers.push(this); }
  observe(el) { this.els.push(el); }
  unobserve() {}
  disconnect() { this.els = []; }
}

/** Every `/event` post the page makes, by event name. */
function stubFetch() {
  const prev = globalThis.fetch;
  const events = [];
  globalThis.fetch = async (url, opts) => {
    if (String(url).endsWith('/event')) events.push(JSON.parse(opts.body).event);
    return { ok: true, status: 200, json: async () => ({}) };
  };
  return { events, restore: () => { globalThis.fetch = prev; } };
}

async function mount(props) {
  const prevIO = window.IntersectionObserver;
  observers.length = 0;
  window.IntersectionObserver = FakeIO;
  globalThis.IntersectionObserver = FakeIO;
  try { window.localStorage.clear(); } catch { /* none */ }
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(Reading, { reading: SERVED, onReset() {}, ...props })); });
  return {
    host,
    panel: () => host.querySelector('[data-offer-panel]'),
    unmount: async () => {
      await act(async () => root.unmount());
      host.remove();
      window.IntersectionObserver = prevIO;
      globalThis.IntersectionObserver = prevIO;
    },
  };
}

async function show(el, isIntersecting) {
  await act(async () => {
    for (const o of observers) if (o.els.includes(el)) o.cb([{ target: el, isIntersecting }]);
  });
}

const flush = () => act(async () => { for (let i = 0; i < 4; i += 1) await new Promise((r) => setTimeout(r, 0)); });
const count = (events, name) => events.filter((e) => e === name).length;

test('BG §2.3: offer_seen does not fire on mount, fires once when the panel enters the viewport, and not again', async () => {
  const f = stubFetch();
  const ui = await mount({ salesOpen: true });
  try {
    await flush();
    assert.ok(ui.panel(), 'precondition: the offer panel is on the page');
    assert.equal(count(f.events, 'offer_seen'), 0, 'not on mount: she has not reached the offer');

    await show(ui.panel(), true);
    await flush();
    assert.equal(count(f.events, 'offer_seen'), 1, 'once the panel is on her screen');

    await show(ui.panel(), false);
    await show(ui.panel(), true);
    await flush();
    assert.equal(count(f.events, 'offer_seen'), 1, 'a re-scroll does not fire it again');
  } finally { await ui.unmount(); f.restore(); }
});

test('BG §2.3: a buyer back on a delivered reading is not counted as seeing the offer', async () => {
  const f = stubFetch();
  const ui = await mount({ salesOpen: true, initialStage: 'delivered' });
  try {
    await flush();
    const panel = ui.panel();
    if (panel) await show(panel, true);
    await flush();
    assert.equal(count(f.events, 'offer_seen'), 0);
  } finally { await ui.unmount(); f.restore(); }
});

test('BG §2.3: payments closed, no offer on the page and no offer_seen', async () => {
  const f = stubFetch();
  const ui = await mount({ salesOpen: false });
  try {
    await flush();
    assert.equal(ui.panel() === null, true, 'no offer panel while the fence is closed');
    assert.equal(count(f.events, 'offer_seen'), 0);
  } finally { await ui.unmount(); f.restore(); }
});
