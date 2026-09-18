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
import { readFileSync, readdirSync, existsSync } from 'node:fs';
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

test('A STALE PAYMENTS_PROVIDER=xendit MEANS CLOSED', () => {
  // REPLACES `XENDIT IS UNCHANGED, which is what makes this reversible`, whose
  // premise is gone by ruling: Reyner took the TERMINATE branch on 2026-09-18 and
  // the adapter is deleted, so there is no longer anything to be reversible to.
  //
  // WHAT THIS GUARDS IS THE STALE VARIABLE. The value `xendit` is still typed into
  // some environment somewhere - a Preview project, a restored deploy, a `.env.local`
  // nobody reopened - and an unrecognised value must land in the same place an unset
  // one does. Fully configured with both keys present is the strongest form of the
  // case: even then the answer is CLOSED, because the account behind those keys is
  // being terminated and a key that still parses is not an account that still works.
  withEnv({
    PAYMENTS_PROVIDER: 'xendit',
    NODE_ENV: 'production',
    XENDIT_SECRET_KEY: 'k',
    XENDIT_WEBHOOK_TOKEN: 't',
  }, () => {
    assert.equal(paymentsProvider(), 'closed');
    assert.equal(paymentFenceReason(), 'payment_closed');
  });
});

// ── THE FILE WALKER, shared by the two source assertions ───
// THE FILE LIST COMES FROM `fs`, NOT FROM A SHELL GREP. A spec that shells out
// measures the developer's PATH as much as the repo, and this suite runs on
// Windows and on CI. It is written so it CAN fail: it reports file, line and the
// offending text, so a red says what to delete rather than only that something is
// wrong.
const EXT = new Set(['.js', '.jsx', '.mjs']);
function scan(roots, re) {
  const hits = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!EXT.has(path.extname(entry.name))) continue;
      readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
        if (re.test(line)) {
          hits.push(`${path.relative(ROOT, full).replace(/\\/gu, '/')}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  };
  for (const r of roots) walk(path.join(ROOT, r));
  return hits.sort();
}

test('NO XENDIT IN THE PAYMENT PATH', () => {
  // The source assertion that makes the deletion durable rather than a one-time
  // edit. A later session restoring the adapter to "just test something" reddens
  // here.
  //
  // ── WHY THIS IS SCOPED AND NOT A REPO-WIDE SWEEP ──────────
  // A repo-wide `xendit` ban would have to carry an exclusion list seven files
  // long, and a check that is mostly exclusions is a check written from the
  // requirement it documents rather than from the defect it catches. The mentions
  // that survive this PR are in two categories, both deliberate and neither on the
  // payment path: DATED HISTORY (why /tentang exists, why the footer is a server
  // component, the X-b1 regression record) which records what was true when
  // written, and READER-VISIBLE INDONESIAN in `lib/site/copy.js` - the privacy
  // policy and terms naming the processor that actually handled those payments.
  // Copy is Reyner's alone (rule 20) and its replacement has to name DOKU, which
  // does not exist yet. Both are Prompt V's business, not this PR's.
  //
  // So the proposition here is the one that is unambiguous and worth guarding:
  // the files that DECIDE OR RECORD A PAYMENT carry no trace of the adapter.
  const PAYMENT_PATH = [
    'lib/paymentFence.js',
    'lib/pricing.js',
    'lib/pairStore.js',
    'lib/readingStore.js',
    'lib/pair/settle.js',
    'lib/pair/serve.js',
    'lib/deliver/handlers.js',
    'app/api/pay/[id]/route.js',
    'app/api/mock-pay/[id]/route.js',
  ];
  const offenders = [];
  for (const rel of PAYMENT_PATH) {
    const full = path.join(ROOT, rel);
    assert.ok(existsSync(full), `${rel} exists - a renamed file must not silently drop out of this list`);
    readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
      if (/xendit/iu.test(line)) offenders.push(`${rel}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, [], 'no file that decides or records a payment may name the adapter');
});

test('THE ADAPTER AND ITS WEBHOOK ARE GONE, and nothing imports them', () => {
  // Deletion and de-referencing are two different propositions and both matter: a
  // deleted file with a surviving import is a build break, and a surviving file
  // with no imports is a dead adapter someone will wire back up.
  assert.equal(existsSync(path.join(ROOT, 'lib/xendit.js')), false,
    'the adapter is deleted, not merely unreferenced');
  assert.equal(existsSync(path.join(ROOT, 'app/api/webhook')), false,
    'the whole webhook directory goes - xendit was the only route in it');

  // Any reference to the MODULE, however it is spelled: `@/lib/xendit`,
  // `../xendit.js`, a dynamic import. Repo-wide, because unlike a prose mention
  // there is no legitimate reason for one of these to survive anywhere.
  assert.deepEqual(scan(['lib', 'app', 'components'], /['"][^'"]*\/xendit(\.js)?['"]/u), [],
    'nothing imports the deleted module');
});

test('THE PAY ROUTE ANSWERS payment_closed, not a misconfiguration', () => {
  // The body is what the client branches on, so the two states must not collapse
  // into one string. Asserted on the source: the route is a Next handler and
  // exercising it needs the whole request pipeline, while what can go wrong here
  // is a one-word edit.
  const src = read('app/api/pay/[id]/route.js');
  assert.match(src, /if \(fence === 'payment_closed'\) return notConfigured\('payment_closed'\)/u);
  assert.match(src, /paymentsProvider\(\) === 'mock'/u, 'the mock branch exists');
  // It used to assert that the mock branch came BEFORE `createQrisInvoice({`, so a
  // closed shop would not call out. There is no call to order it against any more:
  // the adapter is deleted and the route's real-provider branch went with it. The
  // proposition that replaces "mock is first" is "there is nothing else to reach".
  assert.equal(src.includes('createQrisInvoice'), false,
    'no provider call survives in the route - the mock branch is the only one');
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
