// ============================================================
// tests/pair-reconcile-client.spec.mjs — the report asks ONCE, on load
// ============================================================
// Run: npm run test:pair-reconcile-client
//
// Launch-cut item 4, the client half. The report page must ask the server to
// reconcile an unpaid pair exactly ONCE per load - never per poll tick, because the
// poll re-reads `/api/pair/<id>` every 3s up to 100 times and each reconcile is a
// DOKU call - and must re-read the pair when the answer is "paid".
//
// Both ways: a reconcile that answers paid must end on the reading; one that
// answers unpaid must leave the unpaid page where it was.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import PasanganReport from '../components/PasanganReport.jsx';
import { PASANGAN_COPY } from '../lib/site/copy.js';

const READING = {
  status: 'paid',
  served_from: 'render',
  pair: { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1990-03-04', gender: 'female' } },
  facts: { a: {}, b: {}, pattern: 'Pola Kontras', quadrant: 'Tarikan Tenang, Ritme Bergesek' },
  names: {},
  reading: {
    blocks: [{ fact_ids: ['p0_opening'], heading: 'X', text: 'Paragraf pembuka yang sudah dibayar.' }],
    penutup: '',
  },
};

/**
 * `reconcileSays` is what POST /reconcile answers. After a `paid: true` answer the
 * pair GET turns paid, exactly as the settled row would.
 */
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
    if (u.endsWith('/reading')) return ok(READING);
    return ok(settled ? { status: 'paid' } : { status: 'not_paid', sku: 'compat', price: 39000 });
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount(props) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(PasanganReport, props)); });
  for (let i = 0; i < 4; i += 1) {
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

const reconciles = (calls) => calls.filter((c) => c.startsWith('POST ') && c.endsWith('/reconcile'));

test('AN UNPAID PAIR IS RECONCILED ONCE ON LOAD, and a paid answer opens the reading', async () => {
  const net = stub({ reconcileSays: { paid: true } });
  const ui = await mount({ id: 'p1' });
  try {
    assert.deepEqual(reconciles(net.calls), ['POST /api/pair/p1/reconcile'], 'exactly one reconcile');
    assert.ok(ui.host.textContent.includes('Paragraf pembuka yang sudah dibayar.'),
      'the settled pair re-read and rendered its reading');
  } finally { ui.unmount(); net.restore(); }
});

test('AN UNPAID ANSWER LEAVES THE UNPAID PAGE, and nothing asks again', async () => {
  const net = stub({ reconcileSays: { paid: false } });
  const ui = await mount({ id: 'p2' });
  try {
    assert.equal(reconciles(net.calls).length, 1, 'asked once');
    assert.equal(ui.host.textContent.includes('Paragraf pembuka yang sudah dibayar.'), false,
      'an unpaid pair must not show the reading');
    assert.ok(ui.host.textContent.includes(PASANGAN_COPY.unpaid_resume), 'still the unpaid page');
  } finally { ui.unmount(); net.restore(); }
});

test('THE PENDING PAGE SAYS WHAT TO DO IF PAYMENT DOES NOT ARRIVE (ruled 2026-09-22)', () => {
  // Reyner's sentence, verbatim, from the launch-cut state doc §0.
  assert.equal(PASANGAN_COPY.pending_body,
    'Halaman ini otomatis diperbarui setelah pembayaran diterima. Jika sudah membayar tetapi belum berubah dalam 5 menit, kirim tautan halaman ini ke hello@katon.app.');
});
