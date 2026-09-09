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
    // The PROPOSITION, not the expression: the report page hoists the call into
    // a local now that it derives two flags from it, and a test that fails on
    // that refactor is teaching people to stop reading it.
    const src = read(page);
    assert.match(src, /paymentsProvider\(\)/u, `${page} asks the server-side provider`);
    assert.match(src, /salesClosed=\{[^}]*'closed'/u, `${page} passes it down`);
  }
  // And the components render the ruled strings rather than composing a sentence.
  assert.match(read('components/Pasangan.jsx'), /sales_closed_title/u);
  assert.match(read('components/PasanganReport.jsx'), /sales_closed_body/u);
});

// ── THE WAIT AFTER PAYMENT (Y-1 section 3) ─────────────────

test('THE WEBHOOK WARMS THE CACHE, so the GET is not where the render happens', () => {
  // Reyner's pending page sat for MINUTES: the GET renders Gemini synchronously,
  // regeneration attempts included, so the first request after payment carried
  // the whole cost while a person watched. Measured locally 2026-09-08 at 2.7-5.4s
  // for one or two attempts, and the n=20 run saw draws needing six.
  const src = read('lib/pair/settle.js');
  assert.ok(src.includes('if (transitioned) await warmPairReading(pairId)'),
    'the warm render is awaited - a fire-and-forget would be frozen with the invocation');
  assert.ok(src.includes('catch (err)'), 'and a failed render must not fail the payment');

  // ONLY ON THE TRANSITION. A webhook retry must not start a second render.
  assert.ok(src.indexOf('if (transitioned) await warmPairReading') > src.indexOf('const transitioned'),
    'the warm follows the transition it is conditioned on');
});

test('THE POLL DOES NOT STACK REQUESTS', () => {
  // setInterval fires on the clock whether or not the last tick returned, and a
  // tick can call the reading endpoint, which renders synchronously. At 3s that
  // stacks request on request - and the production spend guard (three renders per
  // cache key per hour) then refuses them into the floor.
  // COMMENTS STRIPPED. The first version of this assertion failed on the comment
  // three lines above it, which explains why `setInterval` is wrong - the fourth
  // time in this repo that a detector has matched its own documentation.
  const src = read('components/PasanganReport.jsx')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/^\s*\/\/.*$/gmu, '');
  assert.equal(src.includes('setInterval'), false,
    'a self-scheduling timeout waits for the work; an interval does not');
  assert.ok(src.includes('timer = setTimeout(tick, POLL_MS)'));
});

test('EVERY WAITING STATE SHOWS THE REPORT SHAPE, never a blank page', () => {
  // "never a blank page or a dead end; a refresh during rendering lands on the
  // same skeleton" - the prompt's own words. Both waiting branches render it.
  const src = read('components/PasanganReport.jsx');
  assert.match(src, /function ReportSkeleton/u);
  // THREE BRANCHES SINCE Y-2 Addendum 2 item 3, and the third is the one that
  // made this file's own claim true. It was 2 - the just-paid branch and the
  // paid-but-not-rendered branch - while the FIRST FRAME still rendered `null`,
  // so "never a blank page" was false for exactly as long as the two fetches
  // took, immediately after a checkout redirect. The first frame carries it now.
  assert.equal(src.split('<ReportSkeleton />').length - 1, 3,
    'the first frame, the just-paid branch and the paid-but-not-rendered branch all show it');
  assert.match(src, /k-skel/u, 'and it reuses the mirror bars rather than inventing a spinner');
});
