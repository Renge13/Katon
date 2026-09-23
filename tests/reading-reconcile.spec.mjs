// ============================================================
// tests/reading-reconcile.spec.mjs — a paid-but-unnotified MIRROR purchase settles
// ============================================================
// Run: npm run test:reading-reconcile
//
// PAY-SAFETY-ALL-PURCHASES (Reyner, 2026-09-23): the on-load DOKU reconciliation
// #129 built for pairs applies to the Rp 19.000 mirror purchase too, and is a
// production-flip gate. `reconcileReading` asks DOKU ONCE for an unpaid reading
// with its own DOKU invoice and settles through `settleReading` - the mirror's
// settle path, EXTRACTED from `lib/doku/notify.js` in this commit so the
// notification and the reconcile go through one door, as pairs do via
// `settlePair`.
//
// Both ways, everywhere: SUCCESS settles and PENDING stays unpaid; a DOKU fence
// asks and a closed or mock fence makes no call.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { createReading, getReading, setInvoice } from '../lib/readingStore.js';
import { reconcileReading } from '../lib/deliver/reconcile.js';
import { handleDokuNotification, NOTIFY_TARGET } from '../lib/doku/notify.js';
import { digestOf, signComponents } from '../lib/doku/signature.js';
import { priceFor } from '../lib/pricing.js';

const readingMem = (globalThis.__katonReadingMem ??= new Map());
const ENV = ['PAYMENTS_PROVIDER', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY', 'DOKU_SANDBOX', 'VERCEL_ENV'];
const CLIENT_ID = 'BRN-0001-TEST';
const SECRET = 'SK-test-secret-0001';
let saved;

beforeEach(() => {
  readingMem.clear();
  saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  for (const k of ENV) delete process.env[k];
  process.env.PAYMENTS_PROVIDER = 'doku';
  process.env.DOKU_CLIENT_ID = CLIENT_ID;
  process.env.DOKU_SECRET_KEY = SECRET;
});
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

/** DOKU check-status stub; any other network call fails the test loudly. */
function stubDoku({ status = 'SUCCESS', amount = String(priceFor('artifact')), echo = null } = {}) {
  const prev = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('/orders/v1/status/')) {
      calls.push(u);
      const asked = decodeURIComponent(u.split('/orders/v1/status/')[1]);
      return new Response(JSON.stringify({
        order: { invoice_number: echo ?? asked, amount }, transaction: { status },
      }), { status: 200 });
    }
    throw new Error(`no network in this test: ${u}`);
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

const newReading = async ({ invoice = true } = {}) => {
  const id = `rd${Math.random().toString(36).slice(2, 12)}`;
  await createReading({ id, day_master: '丙', paid: false, sku: 'artifact' });
  // The shape the pay route's DOKU branch writes for a mirror purchase.
  if (invoice) await setInvoice(id, { invoiceId: `${id}.m1abc`, sku: 'artifact' });
  return id;
};

test('A PAID-BUT-NEVER-NOTIFIED MIRROR PURCHASE SETTLES, with ONE DOKU call', async () => {
  const id = await newReading();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    const out = await reconcileReading(id);
    assert.equal(net.calls.length, 1, 'exactly one check-status call');
    assert.ok(net.calls[0].endsWith(`/orders/v1/status/${encodeURIComponent(`${id}.m1abc`)}`));
    assert.equal(out.paid, true);
    assert.equal((await getReading(id)).paid, true);
  } finally { net.restore(); }
});

test('A GENUINELY UNPAID MIRROR PURCHASE STAYS PENDING', async () => {
  const id = await newReading();
  const net = stubDoku({ status: 'PENDING' });
  try {
    const out = await reconcileReading(id);
    assert.equal(net.calls.length, 1, 'DOKU was asked');
    assert.equal(out.paid, false);
    assert.equal((await getReading(id)).paid, false);
  } finally { net.restore(); }
});

test('THE WRONG AMOUNT, OR AN ANSWER ABOUT ANOTHER INVOICE, DOES NOT SETTLE', async () => {
  const a = await newReading();
  const b = await newReading();
  let net = stubDoku({ status: 'SUCCESS', amount: '39000' }); // the compat price, not 19.000
  try { await reconcileReading(a); } finally { net.restore(); }
  net = stubDoku({ status: 'SUCCESS', echo: 'someoneelse.zzz' });
  try { assert.equal((await reconcileReading(b)).reason, 'invoice_mismatch'); } finally { net.restore(); }
  assert.equal((await getReading(a)).paid, false, 'wrong amount');
  assert.equal((await getReading(b)).paid, false, 'wrong invoice');
});

test('FENCE CLOSED: DOKU IS NOT CALLED', async () => {
  delete process.env.PAYMENTS_PROVIDER;
  const id = await newReading();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    const out = await reconcileReading(id);
    assert.equal(net.calls.length, 0, 'a closed fence makes no DOKU call');
    assert.equal(out.checked, false);
    assert.equal((await getReading(id)).paid, false);
  } finally { net.restore(); }
});

test('PROVIDER MOCKED: DOKU IS NOT CALLED', async () => {
  process.env.PAYMENTS_PROVIDER = 'mock';
  const id = await newReading();
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    await reconcileReading(id);
    assert.equal(net.calls.length, 0, 'mock never reaches DOKU');
    assert.equal((await getReading(id)).paid, false);
  } finally { net.restore(); }
});

test('NO INVOICE, A mock_ INVOICE, OR ALREADY PAID: NO CALL', async () => {
  const net = stubDoku({ status: 'SUCCESS' });
  try {
    await reconcileReading(await newReading({ invoice: false }));
    const mocked = await newReading({ invoice: false });
    await setInvoice(mocked, { invoiceId: `mock_${mocked}` });
    await reconcileReading(mocked);
    const paid = await newReading();
    await reconcileReading(paid); // settles: one call
    await reconcileReading(paid); // already paid: none
    assert.equal(net.calls.length, 1, JSON.stringify(net.calls));
  } finally { net.restore(); }
});

// ── THE EXTRACTION IS BEHAVIOUR-NEUTRAL FOR THE NOTIFICATION ──
// `settleReading` is the notify handler's mirror branch, moved. doku.spec.mjs only
// exercises that handler with PAIRS, so the mirror branch gets its own proof here:
// a signed SUCCESS still settles, a wrong amount still does not.

function signed(body) {
  const raw = JSON.stringify(body);
  const requestId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const timestamp = '2026-09-23T03:00:00Z';
  return new Request(`http://localhost${NOTIFY_TARGET}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'client-id': CLIENT_ID,
      'request-id': requestId,
      'request-timestamp': timestamp,
      signature: signComponents({
        clientId: CLIENT_ID, requestId, timestamp, target: NOTIFY_TARGET, digest: digestOf(raw),
      }, SECRET),
    },
    body: raw,
  });
}

test('THE NOTIFICATION STILL SETTLES A MIRROR PURCHASE through settleReading', async () => {
  const ok = await newReading();
  const bad = await newReading();
  const note = (id, amount) => signed({
    order: { invoice_number: `${id}.m1abc`, amount }, transaction: { status: 'SUCCESS' },
  });
  assert.equal((await handleDokuNotification(note(ok, String(priceFor('artifact'))))).status, 200);
  assert.equal((await handleDokuNotification(note(bad, '1000'))).status, 200);
  assert.equal((await getReading(ok)).paid, true, 'a verified SUCCESS at the right amount settles');
  assert.equal((await getReading(bad)).paid, false, 'a wrong amount does not');
});
