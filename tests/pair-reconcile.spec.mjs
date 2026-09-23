// ============================================================
// tests/pair-reconcile.spec.mjs — a paid-but-unnotified pair settles on load
// ============================================================
// Run: npm run test:pair-reconcile
//
// Launch-cut item 4 (ruled 2026-09-22). DOKU's HTTP Notification has never once
// been delivered to Katon (ticket 1149053), so a buyer can pay and the row stays
// `paid: false` with nothing to flip it: before this, the only reconcile was
// `npm run doku:status` by hand. `reconcilePair` asks DOKU ONCE, when the report
// page loads on an unpaid row with an invoice, and settles through `settlePair` -
// the same single door the notification uses (CLAUDE.md rule 18).
//
// EVERY CASE CAN FAIL BOTH WAYS. A SUCCESS row must settle AND a PENDING row must
// stay unpaid; a DOKU fence must call DOKU AND a closed or mock fence must not.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { createPair, getPair, setPairInvoice } from '../lib/pairStore.js';
import { reconcilePair } from '../lib/pair/reconcile.js';
import { priceFor } from '../lib/pricing.js';

const pairMem = (globalThis.__katonPairMem ??= new Map());
const ENV = ['PAYMENTS_PROVIDER', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY', 'DOKU_SANDBOX', 'VERCEL_ENV'];
let saved;

beforeEach(() => {
  pairMem.clear();
  saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  for (const k of ENV) delete process.env[k];
  // The DOKU fence, fully configured: the only state in which DOKU may be asked.
  process.env.PAYMENTS_PROVIDER = 'doku';
  process.env.DOKU_CLIENT_ID = 'BRN-0001-TEST';
  process.env.DOKU_SECRET_KEY = 'SK-test-secret-0001';
});
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

/**
 * Stub the network. DOKU's check-status answers with `status` for whatever invoice
 * it is asked about (or `echo` if given); anything else - the warm render that
 * `settlePair` starts - fails, which that code already treats as non-fatal.
 */
function stubDoku({ status = 'SUCCESS', amount = String(priceFor('compat')), echo = null } = {}) {
  const prev = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('/orders/v1/status/')) {
      calls.push(u);
      const asked = decodeURIComponent(u.split('/orders/v1/status/')[1]);
      const body = { order: { invoice_number: echo ?? asked, amount }, transaction: { status } };
      return new Response(JSON.stringify(body), { status: 200 });
    }
    throw new Error(`no network in this test: ${u}`);
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

const newPair = async ({ invoice = true } = {}) => {
  const id = `pair${Math.random().toString(36).slice(2, 10)}`;
  await createPair({
    id,
    a_birth_date: '1989-09-13', a_birth_time: '09:00', a_gender: null, a_term_side: null,
    b_birth_date: '1990-03-04', b_birth_time: '14:00', b_gender: null, b_term_side: null,
    sku: 'compat', paid: false, email: null,
  });
  // The invoice number the DOKU pay branch writes: `${id}.${suffix}`.
  if (invoice) await setPairInvoice(id, { invoiceId: `${id}.m1abc`, invoiceUrl: 'https://checkout', sku: 'compat' });
  return id;
};

test('A PAID-BUT-NEVER-NOTIFIED PAIR SETTLES ON LOAD, with ONE DOKU call', async () => {
  const id = await newPair();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    const out = await reconcilePair(id);
    assert.equal(net.calls.length, 1, 'exactly one check-status call');
    assert.ok(net.calls[0].endsWith(`/orders/v1/status/${encodeURIComponent(`${id}.m1abc`)}`),
      'asked about THIS pair\'s invoice number');
    assert.equal(out.paid, true);
    assert.equal((await getPair(id)).paid, true, 'the row flipped, through settlePair');
  } finally { net.restore(); }
});

test('A GENUINELY UNPAID PAIR STAYS PENDING', async () => {
  const id = await newPair();
  const net = stubDoku({ status: 'PENDING' });
  try {
    const out = await reconcilePair(id);
    assert.equal(net.calls.length, 1, 'DOKU was asked');
    assert.equal(out.paid, false);
    assert.equal((await getPair(id)).paid, false, 'an unpaid answer flips nothing');
  } finally { net.restore(); }
});

test('A SUCCESS FOR THE WRONG AMOUNT DOES NOT SETTLE (settlePair\'s own check)', async () => {
  const id = await newPair();
  const net = stubDoku({ status: 'SUCCESS', amount: '1000' });
  try {
    await reconcilePair(id);
    assert.equal((await getPair(id)).paid, false);
  } finally { net.restore(); }
});

test('AN ANSWER ABOUT A DIFFERENT INVOICE DOES NOT SETTLE', async () => {
  // The one wrong answer that looks exactly like a right one (scripts/doku-status.mjs).
  const id = await newPair();
  const net = stubDoku({ status: 'SUCCESS', echo: 'someoneelse.zzz' });
  try {
    const out = await reconcilePair(id);
    assert.equal(out.paid, false);
    assert.equal(out.reason, 'invoice_mismatch');
    assert.equal((await getPair(id)).paid, false);
  } finally { net.restore(); }
});

test('FENCE CLOSED: DOKU IS NOT CALLED, even for a row DOKU would call paid', async () => {
  delete process.env.PAYMENTS_PROVIDER; // unset = closed, production today
  const id = await newPair();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    const out = await reconcilePair(id);
    assert.equal(net.calls.length, 0, 'a closed fence makes no DOKU call');
    assert.equal(out.checked, false);
    assert.equal((await getPair(id)).paid, false);
  } finally { net.restore(); }
});

test('PROVIDER MOCKED: DOKU IS NOT CALLED', async () => {
  process.env.PAYMENTS_PROVIDER = 'mock';
  const id = await newPair();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    await reconcilePair(id);
    assert.equal(net.calls.length, 0, 'mock never reaches DOKU');
    assert.equal((await getPair(id)).paid, false);
  } finally { net.restore(); }
});

test('NO INVOICE, OR ALREADY PAID: NO CALL', async () => {
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    const bare = await newPair({ invoice: false });
    await reconcilePair(bare);
    // A mock-era invoice id is not this pair's DOKU invoice number either.
    const mocked = await newPair({ invoice: false });
    await setPairInvoice(mocked, { invoiceId: `mock_${mocked}`, invoiceUrl: '/x', sku: 'compat' });
    await reconcilePair(mocked);
    const paid = await newPair();
    await reconcilePair(paid); // settles: one call
    await reconcilePair(paid); // already paid: no second call
    assert.equal(net.calls.length, 1, `calls: ${JSON.stringify(net.calls)}`);
  } finally { net.restore(); }
});
