// ============================================================
// tests/mock-walk.spec.mjs — the free walk must never strand the walker
// ============================================================
// Reyner clicked "Lanjut ke pembayaran" on the preview with
// PAYMENTS_PROVIDER=mock and landed on `/kompatibilitas/<id>` - bare, no query -
// showing MENUNGGU KONFIRMASI PEMBAYARAN, no unlock control, no link, nothing to
// do. The walk stopped there.
//
// ── THE PAY CALL WAS FINE. THE CLIENT WAS NOT. ─────────────
// Measured against the preview before anything was changed:
//
//   POST /api/pay/UZ-HaCnzzi9mRX60Ekqyb
//     {"ok":true,"pending":true,"invoiceUrl":".../?bayar=mock","mock":true}  200
//
// So the Preview env var reaches the function and the build is current. Two
// client defects put him there:
//
//   1. `Pasangan.checkout` called `history.pushState` and then `setStage`. The
//      comment beside it read "the report page does the unlock; here it just
//      navigates" - and pushState does NOT navigate. The report route never
//      mounted; `Pasangan` rendered its OWN pending view, whose only affordance
//      is an invoice link that mock never sets.
//   2. `PasanganReport` unlocked only on `?bayar=mock`. Even had he reached it,
//      a refresh - which drops nothing but is the first thing anyone does when a
//      page looks stuck - would have left him on a bare URL with no way forward.
//
// **THE RULE THIS FILE ENFORCES: whenever the provider is mock and the pair is
// unpaid, the unlock is reachable FROM THE VIEW, not from a query hint.**
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import PasanganReport from '../components/PasanganReport.jsx';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');

/** Stub fetch with a pair that is NOT paid, and record what was called. */
function stubFetch({ paid = false } = {}) {
  const calls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    calls.push({ url: u, method: opts?.method || 'GET' });
    if (u.endsWith('/reading')) {
      return { json: async () => ({ status: 'paid', served_from: 'floor', facts: {}, reading: { blocks: [], penutup: '' } }) };
    }
    if (u.startsWith('/api/mock-pay/')) return { json: async () => ({ ok: true, paid: true }) };
    return { json: async () => (paid ? { status: 'paid' } : { status: 'not_paid', sku: 'compat', price: 39000 }) };
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount(props) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(PasanganReport, props)); });
  await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

const buttons = (host) => [...host.querySelectorAll('button')].map((b) => b.textContent.trim());

test('THE BARE URL OFFERS THE UNLOCK when the provider is mock', async () => {
  // ── THE EXACT SCREEN REYNER WAS STRANDED ON ────────────────
  // `/kompatibilitas/<id>`, no query, unpaid, mock. Before this commit it showed
  // a pending title and nothing actionable.
  const f = stubFetch();
  const ui = await mount({ id: 'p1', mockPayments: true });
  try {
    const labels = buttons(ui.host);
    assert.ok(labels.some((l) => /mock/iu.test(l)),
      `no unlock control on the bare URL; buttons were ${JSON.stringify(labels)}`);
  } finally { ui.unmount(); f.restore(); }
});

test('A REFRESH DOES NOT STRAND: the control does not depend on the query', async () => {
  // Same page, same state, no `?bayar=`. The query is an accelerator, never the
  // only way in - which is what "a refresh must never strand the walker" means.
  const f = stubFetch();
  const ui = await mount({ id: 'p2', mockPayments: true });
  try {
    assert.equal(typeof window !== 'undefined' && window.location.search, '');
    assert.ok(buttons(ui.host).some((l) => /mock/iu.test(l)));
  } finally { ui.unmount(); f.restore(); }
});

test('THE CONTROL POSTS TO mock-pay, the webhook door', async () => {
  const f = stubFetch();
  const ui = await mount({ id: 'p3', mockPayments: true });
  try {
    const btn = [...ui.host.querySelectorAll('button')].find((b) => /mock/iu.test(b.textContent));
    assert.ok(btn, 'precondition: the control is there');
    await act(async () => { btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); });
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    assert.ok(f.calls.some((c) => c.url === '/api/mock-pay/p3' && c.method === 'POST'),
      `mock-pay was not called; calls were ${JSON.stringify(f.calls.map((c) => c.url))}`);
  } finally { ui.unmount(); f.restore(); }
});

test('IT IS ABSENT WHEN THE PROVIDER IS NOT MOCK', async () => {
  // The whole point of the fence: a free unlock must not be offered anywhere it
  // could work. `mockPayments` is resolved on the server from `paymentsProvider()`,
  // which returns 'closed' for mock whenever VERCEL_ENV=production.
  const f = stubFetch();
  const ui = await mount({ id: 'p4', mockPayments: false });
  try {
    assert.equal(buttons(ui.host).some((l) => /mock/iu.test(l)), false);
  } finally { ui.unmount(); f.restore(); }
});

test('THE CHECKOUT REALLY NAVIGATES FOR MOCK, rather than pushState-and-stay', () => {
  // The defect in one line: the comment said "here it just navigates" and the
  // code called `history.pushState`, which changes the URL and mounts nothing.
  // The report route never loaded, so `Pasangan` rendered its own pending view -
  // whose only affordance is an invoice link mock never sets.
  const src = code('components/Pasangan.jsx');
  const mockBranch = /if \(paid\.mock\)[^\n]*\n?[^\n]*/u.exec(src)?.[0] || '';
  assert.match(mockBranch, /location\.assign/u,
    'mock must perform a real navigation so the report route mounts');
  assert.ok(src.indexOf('location.assign') < src.indexOf('history.pushState'),
    'and it must return BEFORE the pushState that is for the Xendit path');
});

test('THE MOCK URL IS SAME-ORIGIN, not an absolute URL on another alias', () => {
  // `pairUrl` builds an absolute URL from NEXT_PUBLIC_BASE_URL, and on the
  // preview that pointed at a DIFFERENT alias - the pay call answered
  // `https://katon-eta.vercel.app/...` to a request made against
  // `katon-git-fix-link-keep-...`. For a real provider an absolute URL is
  // required, because Xendit redirects a browser to it. For mock it is a link
  // back to the page the walker is already on, so it must be relative or the
  // walk hops hosts mid-flow.
  const src = code('app/api/pay/[id]/route.js');
  const mock = src.slice(src.indexOf("paymentsProvider() === 'mock'"), src.indexOf('createQrisInvoice({'));
  assert.equal(/pairUrl\(|readingUrl\(/u.test(mock), false,
    'the mock branch must not build an absolute URL');
  assert.match(mock, /compatPairRoute\(/u);
});

test('THE REPORT PAGE RESOLVES mockPayments ON THE SERVER', () => {
  // ASSERTED ON THE PROPOSITION, NOT THE EXPRESSION. A first version pinned the
  // literal `paymentsProvider() === 'mock'`, and hoisting that call into a local
  // broke it while the page stayed correct - a test that fails on a refactor
  // teaches people to stop reading it.
  const src = code('app/kompatibilitas/[id]/page.js');
  assert.match(src, /paymentsProvider\(\)/u, 'the page asks the server-side provider');
  assert.match(src, /mockPayments=\{[^}]*'mock'/u, 'and passes the mock flag down');
  assert.match(src, /salesClosed=\{[^}]*'closed'/u, 'alongside the closed one');
});
