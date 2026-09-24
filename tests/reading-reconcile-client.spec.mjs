// ============================================================
// tests/reading-reconcile-client.spec.mjs — /r/<token> asks ONCE, on load
// ============================================================
// Run: npm run test:reading-reconcile-client
//
// PAY-SAFETY-ALL-PURCHASES, the client half, the mirror's twin of
// tests/pair-reconcile-client.spec.mjs. The reading page must ask the server to
// reconcile an unpaid purchase exactly ONCE per load - never from the Offer's
// pending poll, which re-reads the delivery manifest every 3s - and open the
// delivery when the answer is paid.
//
// Both ways: a paid answer must reach the delivery; an unpaid one must not.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { ReadingByToken } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const SERVED = {
  token: 'tok1',
  chart: mirrorChartView(chart, buildSemanticJson(chart)),
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
};

function stub({ reconcileSays }) {
  const prev = globalThis.fetch;
  const calls = [];
  let settled = false;
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    const method = opts.method || 'GET';
    calls.push(`${method} ${u}`);
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (u.endsWith('/reconcile') && method === 'POST') {
      if (reconcileSays.paid) settled = true;
      return ok(reconcileSays);
    }
    if (u.startsWith('/api/mirror/')) return ok(SERVED);
    if (u === '/api/deliver/tok1') {
      return ok(settled
        ? { paid: true, items: [{ kind: 'card', ready: true }, { kind: 'pdf', ready: true }] }
        : { paid: false, items: [] });
    }
    return ok({});
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(ReadingByToken, { token: 'tok1', salesOpen: true })); });
  for (let i = 0; i < 4; i += 1) {
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

const reconciles = (calls) => calls.filter((c) => c === 'POST /api/deliver/tok1/reconcile');

test('AN UNPAID PURCHASE IS RECONCILED ONCE ON LOAD, and a paid answer opens the delivery', async () => {
  const net = stub({ reconcileSays: { paid: true } });
  const ui = await mount();
  try {
    assert.equal(reconciles(net.calls).length, 1, `exactly one reconcile; calls: ${JSON.stringify(net.calls)}`);
    // Delivery is what mounts in the `delivered` stage, and it asks for the card.
    assert.ok(net.calls.includes('GET /api/deliver/tok1/card'), 'the delivery opened');
    assert.equal(ui.host.textContent.includes('Ambil Complete Edition'), false, 'no offer to a buyer who paid');
  } finally { ui.unmount(); net.restore(); }
});

test('AN UNPAID ANSWER KEEPS THE OFFER, and nothing asks again', async () => {
  const net = stub({ reconcileSays: { paid: false } });
  const ui = await mount();
  try {
    assert.equal(reconciles(net.calls).length, 1, 'asked once');
    assert.equal(net.calls.includes('GET /api/deliver/tok1/card'), false, 'no delivery for an unpaid purchase');
    assert.ok(ui.host.textContent.includes('Ambil Complete Edition'), 'the offer is still there');
  } finally { ui.unmount(); net.restore(); }
});
