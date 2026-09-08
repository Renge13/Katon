// ============================================================
// tests/payments-provider.spec.mjs — sales are closed, and mock is fenced
// ============================================================
// Reyner ruled on 2026-09-08 that Katon is exiting Xendit. Sales CLOSE and stay
// closed until DOKU, and there is to be no real Xendit transaction by anyone -
// including for testing. `PAYMENTS_PROVIDER=mock` is how the paid path is walked
// for free, which makes it a FREE UNLOCK PATH, which makes its fence the most
// important assertion in this file.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { paymentsProvider, paymentFenceReason, mockPaymentsAllowed } from '../lib/paymentFence.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

/** Run `fn` with exactly this payment env and nothing inherited. */
function withEnv(env, fn) {
  const KEYS = ['PAYMENTS_PROVIDER', 'VERCEL_ENV', 'NODE_ENV', 'XENDIT_SECRET_KEY', 'XENDIT_WEBHOOK_TOKEN'];
  const saved = {};
  for (const k of KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
  Object.assign(process.env, env);
  try { return fn(); } finally {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

test('AN UNSET VARIABLE MEANS CLOSED, never xendit', () => {
  // The assertion that matters most and is easiest to get backwards. A deploy
  // that loses the env var - a new environment, a restored project, a typo -
  // must not silently reopen a sales channel Reyner has closed, and that failure
  // would look exactly like normal operation.
  withEnv({}, () => {
    assert.equal(paymentsProvider(), 'closed');
    assert.equal(paymentFenceReason(), 'payment_closed');
  });
  // An unrecognised value is not a third state either.
  withEnv({ PAYMENTS_PROVIDER: 'doku' }, () => assert.equal(paymentsProvider(), 'closed'));
  withEnv({ PAYMENTS_PROVIDER: '' }, () => assert.equal(paymentsProvider(), 'closed'));
});

test('MOCK IS REFUSED IN PRODUCTION, whatever the variable says', () => {
  // A free unlock reachable in production would be worse than the paywall not
  // existing. The refusal is structural - `paymentsProvider()` downgrades it -
  // so every consumer inherits it without knowing about it.
  withEnv({ PAYMENTS_PROVIDER: 'mock', VERCEL_ENV: 'production' }, () => {
    assert.equal(paymentsProvider(), 'closed');
    assert.equal(mockPaymentsAllowed(), false);
    assert.equal(paymentFenceReason(), 'payment_closed');
  });
  // And it IS available where it is meant to be, or the walk cannot happen.
  for (const VERCEL_ENV of ['preview', 'development', undefined]) {
    withEnv({ PAYMENTS_PROVIDER: 'mock', ...(VERCEL_ENV ? { VERCEL_ENV } : {}) }, () => {
      assert.equal(paymentsProvider(), 'mock', `mock is allowed on ${VERCEL_ENV ?? 'no VERCEL_ENV'}`);
      assert.equal(mockPaymentsAllowed(), true);
      assert.equal(paymentFenceReason(), null);
    });
  }
});

test('CLOSED REFUSES BEFORE THE XENDIT KEYS ARE EVEN CONSULTED', () => {
  // The keys are about to be unset. Their absence must not then read as a
  // misconfiguration - `closed` is a deliberate state and says so in its reason
  // string, which is what the client renders the sales-closed page from.
  withEnv({ PAYMENTS_PROVIDER: 'closed', NODE_ENV: 'production' }, () => {
    assert.equal(paymentFenceReason(), 'payment_closed');
  });
  withEnv({ PAYMENTS_PROVIDER: 'closed', NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k', XENDIT_WEBHOOK_TOKEN: 't' }, () => {
    assert.equal(paymentFenceReason(), 'payment_closed', 'fully configured and still closed');
  });
});

test('XENDIT IS UNCHANGED, which is what makes this reversible', () => {
  // Nothing about the adapter is edited by this ruling; the provider simply is
  // not selected. If `xendit` is chosen the old fence applies exactly as before.
  withEnv({ PAYMENTS_PROVIDER: 'xendit', NODE_ENV: 'production' }, () => {
    assert.equal(paymentFenceReason(), 'xendit_secret_key_unset');
  });
  withEnv({ PAYMENTS_PROVIDER: 'xendit', NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k' }, () => {
    assert.equal(paymentFenceReason(), 'xendit_webhook_token_unset');
  });
  withEnv({ PAYMENTS_PROVIDER: 'xendit', NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k', XENDIT_WEBHOOK_TOKEN: 't' }, () => {
    assert.equal(paymentFenceReason(), null);
  });
});

test('THE PAY ROUTE ANSWERS payment_closed, not a misconfiguration', () => {
  // The body is what the client branches on, so the two states must not collapse
  // into one string. Asserted on the source: the route is a Next handler and
  // exercising it needs the whole request pipeline, while what can go wrong here
  // is a one-word edit.
  const src = read('app/api/pay/[id]/route.js');
  assert.match(src, /if \(fence === 'payment_closed'\) return notConfigured\('payment_closed'\)/u);
  assert.match(src, /paymentsProvider\(\) === 'mock'/u, 'the mock branch exists');
  // And it is BEFORE the Xendit adapter, or a closed shop would still call out.
  assert.ok(src.indexOf("paymentsProvider() === 'mock'") < src.indexOf('createQrisInvoice({'),
    'the mock branch must short-circuit before the provider is called');
});

test('THE MOCK UNLOCK GOES THROUGH THE WEBHOOK\'S OWN DOOR', () => {
  // Rule 18: `paid` flips in the verified webhook and nowhere else. This route is
  // the deliberate, environment-fenced exception, and it earns that by calling
  // the same functions rather than writing the column itself - so there is one
  // place that knows how a purchase becomes paid, not two.
  const src = read('app/api/mock-pay/[id]/route.js');
  assert.match(src, /mockPaymentsAllowed\(\)/u, 'it is fenced');
  assert.match(src, /settlePair\(/u, 'pairs go through settlePair');
  assert.match(src, /markReadingPaid\(/u, 'artifacts go through markReadingPaid');
  assert.equal(/\.update\(|from\(['"]pair/u.test(src), false,
    'it must not write the paid column itself');

  // The guard is the FIRST thing, before the id is even read.
  const guardAt = src.indexOf('mockPaymentsAllowed()');
  assert.ok(guardAt > -1 && guardAt < src.indexOf('await params'),
    'the fence must precede any work');
});

test('THE SALES-CLOSED STATE IS DECIDED ON THE SERVER', () => {
  // A client cannot read PAYMENTS_PROVIDER, and a form that renders and then
  // 503s on submit is the shape of the defect this whole hotfix is about. Both
  // pages resolve it in their server component and pass a boolean down.
  for (const page of ['app/kompatibilitas/page.js', 'app/kompatibilitas/[id]/page.js']) {
    const src = read(page);
    assert.match(src, /paymentsProvider\(\) === 'closed'/u, `${page} decides on the server`);
    assert.match(src, /salesClosed=/u, `${page} passes it down`);
  }
  // And the components render the ruled strings rather than composing a sentence.
  assert.match(read('components/Pasangan.jsx'), /sales_closed_title/u);
  assert.match(read('components/PasanganReport.jsx'), /sales_closed_body/u);
});
