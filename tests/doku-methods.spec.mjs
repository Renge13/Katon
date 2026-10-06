// ============================================================
// tests/doku-methods.spec.mjs — the payment methods Checkout is asked to show
// ============================================================
// Run: npm run test:doku-methods
//
// Prompt BG §1 (Reyner, 2026-10-06): QRIS stays; DANA, ShopeePay and OVO are added
// only once each is active on the DOKU account; nothing else is approved. The
// approved set is READ from lib/doku/methods.js, never retyped here, so a later
// ruling changes one file and this test follows it.
//
// The pin is on what is SENT, read off the request body createCheckout builds, not
// on the exported constant alone: a constant that nothing sends proves nothing.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { APPROVED_PAYMENT_METHODS, OFFERED_PAYMENT_METHODS } from '../lib/doku/methods.js';
import { createCheckout, PAYMENT_METHOD_TYPES } from '../lib/doku/client.js';

const ENV_KEYS = ['DOKU_SANDBOX', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY'];
let savedEnv;
let savedFetch;
let sent;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.DOKU_SANDBOX = '1';
  process.env.DOKU_CLIENT_ID = 'test-client';
  process.env.DOKU_SECRET_KEY = 'test-secret';
  savedFetch = globalThis.fetch;
  sent = null;
  globalThis.fetch = async (url, init) => {
    sent = { url: String(url), body: JSON.parse(init.body) };
    const body = { response: { payment: { url: 'https://sandbox.example/pay', token_id: 't' } } };
    return { status: 200, text: async () => JSON.stringify(body) };
  };
});

afterEach(() => {
  globalThis.fetch = savedFetch;
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k];
  }
});

/** The method list a real createCheckout call puts on the wire. */
async function sentMethods() {
  await createCheckout({
    invoiceNumber: 'inv-1', amount: 19000, callbackUrl: 'https://katon.app/r/x', callbackUrlResult: 'https://katon.app/r/x',
  });
  assert.ok(sent, 'createCheckout made no request');
  return sent.body.payment.payment_method_types;
}

/** The rule itself, separate from the data, so it can be shown failing on bad data. */
function assertOfferable(offered, approved) {
  assert.ok(offered.length >= 1, 'at least one method is offered');
  assert.equal(offered[0], 'QRIS', 'QRIS first');
  assert.equal(new Set(offered).size, offered.length, 'no method twice');
  for (const m of offered) assert.ok(approved.includes(m), `${m} is not in Reyner's approved set`);
}

test('BG §1: Checkout is sent the offered methods, QRIS first, every one approved', async () => {
  const methods = await sentMethods();
  assert.deepEqual(methods, [...OFFERED_PAYMENT_METHODS], 'the body carries the offered list');
  assert.equal(PAYMENT_METHOD_TYPES, OFFERED_PAYMENT_METHODS, 'the client exports the one list, not a copy');
  assertOfferable(methods, APPROVED_PAYMENT_METHODS);
});

test('BG §1: the approved set is QRIS first, and the rule refuses an unapproved method', () => {
  assert.equal(APPROVED_PAYMENT_METHODS[0], 'QRIS');
  // The control: the same rule, handed a list carrying a method Reyner did not approve
  // and one that drops QRIS from the front, must refuse both.
  assert.throws(() => assertOfferable(['QRIS', 'VIRTUAL_ACCOUNT_BNI'], APPROVED_PAYMENT_METHODS), /not in Reyner's approved set/u);
  assert.throws(() => assertOfferable(['EMONEY_DANA', 'QRIS'], APPROVED_PAYMENT_METHODS), /QRIS first/u);
});
