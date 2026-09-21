#!/usr/bin/env node
// Forge / fail-closed tests. Light by design (SPEC §7 4a): the core paywall gate
// (/full gated on paid===true) already holds and prod is not near. The REQUIRED
// assertion here is that the payment path fails CLOSED — an unset or stale
// PAYMENTS_PROVIDER must never mean "take money".
//
//   npm run report:forge                   # fence + store unit tests (no server needed)
//   npm run report:forge -- --live           # + live checks vs http://localhost:3000
//
// NOTE: run with `node --conditions=react-server` (the npm script does this). The
// store tests import lib/readingStore.js, whose `server-only` guard resolves to an
// empty stub under that condition — the same way Next's RSC bundle resolves it.
import assert from 'node:assert';
import { paymentFenceReason } from '../lib/paymentFence.js';
import { createReading, claimWaSend, releaseWaSend } from '../lib/readingStore.js';
import { decideWaOutcome } from '../lib/wa.js';
import {
  SKUS, LAUNCH_PRICING, SELLABLE_SKUS, DEFAULT_SKU,
  priceFor, isSellable, amountMatchesSku,
} from '../lib/pricing.js';

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log(`  ✓ ${name}`); };
const bad = (name, e) => { fail++; console.log(`  ✗ ${name} — ${e?.message || e}`); };
function t(name, fn) { try { fn(); ok(name); } catch (e) { bad(name, e); } }

function withEnv(env, fn) {
  // PAYMENTS_PROVIDER and VERCEL_ENV are cleared and restored like the rest: a
  // case that set one and did not name it in the next case's env would leak, and
  // these two decide the answer on their own now that no keys are consulted.
  for (const k of ['PAYMENTS_PROVIDER', 'VERCEL_ENV', 'DOKU_CLIENT_ID', 'DOKU_SECRET_KEY', 'DOKU_SANDBOX']) {
    if (!(k in env)) env[k] = undefined;
  }
  const saved = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k];
  }
  try { return fn(); } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

console.log('\nFENCE (fail-closed) — REQUIRED');

// ── THE FOUR KEY-PRESENCE CASES ARE DELETED, 2026-09-18 ──
// Four cases here asserted the adapter fence: production with no secret,
// production with no webhook token, production fully configured, and development
// falling through the dev bypass. All four named `PAYMENTS_PROVIDER=xendit`, and
// Prompt V-0 deletes the provider, both key checks and the bypass. Their premise
// is gone by ruling (Reyner, 2026-09-18, TERMINATE), not by refactor.
//
// THEY DID THEIR JOB ON THE WAY OUT, and that is worth recording, because `npm
// test` does not run this file - only `npm run report:forge` does. They went red
// on the first run of this PR, naming the exact export that had vanished, and
// they are the reason `devBypassAllowed` was found to have a fourth caller at all:
// the prompt's own grep was scoped to `lib app components tests` and missed
// `scripts/`. A forge file allowed to drift would have said nothing.
//
// WHAT REPLACES THEM IS NOT A NARROWER VERSION OF THEM. There is no payment
// configuration left to get wrong, so the only fence question this file can still
// ask is the one that protects revenue: is anything SELLING.

// THE required forge-test: an unset variable must mean CLOSED. A lost env var must
// not silently reopen a channel Reyner shut on 2026-09-08 and left on 2026-09-18.
t('no PAYMENTS_PROVIDER → sales are CLOSED', () => {
  withEnv({ PAYMENTS_PROVIDER: undefined, NODE_ENV: 'production' }, () => {
    assert.strictEqual(paymentFenceReason(), 'payment_closed');
  });
});

// A STALE VALUE IS NOT A THIRD STATE. The word is still typed into environments
// nobody has reopened, and it must land where an unset variable lands.
t('a stale PAYMENTS_PROVIDER=xendit → still CLOSED', () => {
  withEnv({ PAYMENTS_PROVIDER: 'xendit', NODE_ENV: 'production' }, () => {
    assert.strictEqual(paymentFenceReason(), 'payment_closed',
      'the deleted adapter buys nothing, whatever the environment still says');
  });
});

// DOKU WITH NO KEYS NAMES THE MISSING ONE. Prompt V's fence case: `doku` is a
// recognised value now, so "unrecognised reads as closed" no longer covers it, and
// the failure this guards is a deploy that selects DOKU and forgets a key - which
// must be a named misconfiguration, never a silent open shop.
t('PAYMENTS_PROVIDER=doku with no keys → doku_client_id_unset', () => {
  withEnv({ PAYMENTS_PROVIDER: 'doku', NODE_ENV: 'production' }, () => {
    assert.strictEqual(paymentFenceReason(), 'doku_client_id_unset');
  });
});

// AND A SANDBOX KEY IN PRODUCTION IS CLOSED. The subtler free unlock: the checkout
// page looks real, the buyer pays, DOKU sends a genuine signed notification, `paid`
// flips, and no money has moved.
t('PAYMENTS_PROVIDER=doku + DOKU_SANDBOX in production → CLOSED', () => {
  withEnv({
    PAYMENTS_PROVIDER: 'doku', DOKU_SANDBOX: '1', VERCEL_ENV: 'production',
    NODE_ENV: 'production', DOKU_CLIENT_ID: 'BRN-x', DOKU_SECRET_KEY: 'SK-x',
  }, () => {
    assert.strictEqual(paymentFenceReason(), 'payment_closed',
      'a sandbox key in production is "pretend to take money"');
  });
});

t('PAYMENTS_PROVIDER=mock is refused in production', () => {
  withEnv({ PAYMENTS_PROVIDER: 'mock', VERCEL_ENV: 'production', NODE_ENV: 'production' }, () => {
    assert.strictEqual(paymentFenceReason(), 'payment_closed', 'a free unlock must not exist in production');
  });
});

// AND THE DEV BYPASS IS GONE, which is a real behaviour change rather than a
// tidy-up: development with no provider used to fall through to null. It refuses
// now, and `mock` is the supported way to walk the flow.
t('development + no provider → still CLOSED, no bypass survives', () => {
  withEnv({ PAYMENTS_PROVIDER: undefined, NODE_ENV: 'development' }, () => {
    assert.strictEqual(paymentFenceReason(), 'payment_closed');
  });
});

// STORE (WA claim/release transition semantics) — REQUIRED.
// No DB/server needed: with no Supabase env the store uses its process-local
// in-memory Map. This locks the mutex + retryability contract the webhook relies on.
console.log('\nSTORE (WA claim/release) — REQUIRED');
const at = async (name, fn) => { try { await fn(); ok(name); } catch (e) { bad(name, e); } };

// (1) mutex: claim transitions once; a second claim (provider double-fire) is refused.
await at('claimWaSend → true first, false second (mutex holds vs double-fire)', async () => {
  const id = 'wa-mutex-' + Date.now();
  await createReading({ id, day_master: '丙', domain: 'hubungan' });
  assert.strictEqual(await claimWaSend(id), true, 'first claim should transition false→true');
  assert.strictEqual(await claimWaSend(id), false, 'second claim must NOT re-fire the send');
});

// (2) retryable: after a release, the same id can be claimed again (failed-send recovery).
await at('releaseWaSend then claimWaSend → succeeds again (released claim is retryable)', async () => {
  const id = 'wa-retry-' + Date.now();
  await createReading({ id, day_master: '丙', domain: 'hubungan' });
  assert.strictEqual(await claimWaSend(id), true, 'initial claim');
  assert.strictEqual(await releaseWaSend(id), true, 'release should transition true→false');
  assert.strictEqual(await claimWaSend(id), true, 're-claim after release must succeed');
});

// (3) safe no-op: releasing an unclaimed/already-false id flips nothing.
await at('releaseWaSend on unclaimed id → no-op, nothing corrupted', async () => {
  const id = 'wa-noop-' + Date.now();
  await createReading({ id, day_master: '丙', domain: 'hubungan' });
  assert.strictEqual(await releaseWaSend(id), false, 'release on already-false must be a no-op');
  assert.strictEqual(await claimWaSend(id), true, 'a fresh claim is still available after no-op release');
  assert.strictEqual(await releaseWaSend(id), true, 'now-claimed slot releases once');
  assert.strictEqual(await releaseWaSend(id), false, 'double release is a no-op');
});

// DECISION (decideWaOutcome — pure) — REQUIRED. The webhook's WA branching extracted
// so it is testable without a running server. Must fail toward 'retry', never toward a
// silently-kept claim.
console.log('\nDECISION (decideWaOutcome) — REQUIRED');

t("{ sent: true } → 'sent' (delivered: keep claim, 200)", () => {
  assert.strictEqual(decideWaOutcome({ sent: true }), 'sent');
});
t("{ sent: false, reason: 'no_provider' } → 'skip_no_provider' (release, 200, no retry)", () => {
  assert.strictEqual(decideWaOutcome({ sent: false, reason: 'no_provider' }), 'skip_no_provider');
});
t("{ sent: false, reason: 'provider_error' } → 'retry' (release, 502)", () => {
  assert.strictEqual(decideWaOutcome({ sent: false, reason: 'provider_error' }), 'retry');
});
t("thrown error (threw=true) → 'retry'", () => {
  assert.strictEqual(decideWaOutcome(null, true), 'retry');
});
t("falsy / malformed result → 'retry' (fail toward retry, not silent claim)", () => {
  assert.strictEqual(decideWaOutcome(null), 'retry');
  assert.strictEqual(decideWaOutcome(undefined), 'retry');
  assert.strictEqual(decideWaOutcome('nope'), 'retry');
  assert.strictEqual(decideWaOutcome({}), 'retry'); // no sent, no reason
  assert.strictEqual(decideWaOutcome({ sent: false }), 'retry'); // sent:false, no reason
});

// PRICING (the SKU table) — REQUIRED. Structural properties of the price
// architecture, so a future price edit that breaks the ladder fails here rather
// than on a checkout page.
console.log('\nPRICING (SKU table) — REQUIRED');

t('every SKU has launch <= list (the discount only ever moves down)', () => {
  for (const [sku, tiers] of Object.entries(SKUS)) {
    assert.ok(Number.isInteger(tiers.list) && tiers.list > 0, `${sku}.list`);
    assert.ok(Number.isInteger(tiers.launch) && tiers.launch > 0, `${sku}.launch`);
    assert.ok(tiers.launch <= tiers.list, `${sku}: launch ${tiers.launch} > list ${tiers.list}`);
  }
});

t('compat > artifact at BOTH tiers (compat stays clearly the premium product)', () => {
  assert.ok(SKUS.compat.list > SKUS.artifact.list, 'list ladder');
  assert.ok(SKUS.compat.launch > SKUS.artifact.launch, 'launch ladder');
});

// THE LADDER IS READ FROM `SKUS`, NEVER RETYPED HERE.
//
// This test used to hardcode `artifact` at 25000 and `compat` at 29000/45000, and
// it went red the moment the RULED ladder landed - docs/product/paid-product-map.md
// `## RULED 2026-08-29`, applied in cf9be7f, on main from 622d926 (PR #84). The
// code was right and the test was carrying a superseded second copy.
//
// Funnel.jsx already states the rule one layer up: "Resolved from lib/pricing.js,
// never hardcoded: the offer must show exactly what the invoice charges." A test
// with its own copy of the ladder is that same defect one layer down, and merely
// correcting the constants would re-arm it for the next price change.
//
// SO THE PROPOSITION CHANGED, NOT JUST THE NUMBERS. What `priceFor` owes anyone is
// TIER ROUTING - the bare call follows LAUNCH_PRICING, and each override reaches
// the tier it names. Those are facts about the function; the amounts are facts
// about the table, and the two tests above already guard the table's shape. This
// now covers `annual` too, which the hardcoded version silently skipped.
t('priceFor returns the live tier, and the override reaches the other one', () => {
  for (const [sku, tiers] of Object.entries(SKUS)) {
    assert.strictEqual(priceFor(sku), LAUNCH_PRICING ? tiers.launch : tiers.list, `${sku}: live tier`);
    assert.strictEqual(priceFor(sku, { launch: true }), tiers.launch, `${sku}: launch override`);
    assert.strictEqual(priceFor(sku, { launch: false }), tiers.list, `${sku}: list override`);
  }
  assert.throws(() => priceFor('nope'), /Unknown SKU/);
});

// ── THIS TEST HELD ITS OWN COPY OF THE LIST AND WENT STALE, 2026-09-08 ──
// It asserted `SELLABLE_SKUS === ['artifact']` and read "NOT sellable until
// Prompt E ships its fulfillment". X-b1 shipped that fulfillment - `a530d56`,
// 2026-09-07, "Compat becomes sellable" - and CI went red on main for a day
// while the branch suite stayed green, because `npm test` does not run this
// file: only `npm run report:forge` does, in the accuracy workflow.
//
// The irony is worth keeping. `290b236` (2026-09-02) is titled "Read the price
// ladder from lib/pricing.js instead of keeping a second copy" and fixed exactly
// this defect one field over, leaving the sellable list hardcoded three lines
// below the comment explaining why hardcoding is the defect.
//
// SO THE PROPOSITION CHANGED RATHER THAN THE LITERAL. What this test owes anyone
// is that `isSellable` is the list and nothing else, and that the DEFAULT is
// sellable - the invariant that actually protects a customer, since `DEFAULT_SKU`
// is what an invoice falls back to. Which products are on the list is a product
// decision (docs/product/paid-product-map.md), not this file's to restate.
t('isSellable IS the list, and the default is on it', () => {
  for (const sku of SELLABLE_SKUS) {
    assert.strictEqual(isSellable(sku), true, `${sku} is sellable`);
  }
  assert.strictEqual(isSellable('anything-else'), false);
  assert.strictEqual(isSellable(undefined), false);
  assert.ok(SELLABLE_SKUS.length > 0, 'something is for sale');
  assert.ok(isSellable(DEFAULT_SKU), 'the default must itself be sellable');
  // Every sellable SKU must be priced, or checkout would ask for an amount the
  // ladder cannot supply. That is the join the two tables owe each other.
  for (const sku of SELLABLE_SKUS) {
    assert.ok(Number.isFinite(priceFor(sku)), `${sku} has a live price`);
  }
});

// WEBHOOK AMOUNT GATE (amountMatchesSku — pure) — REQUIRED.
// This is the regression that protects rule 18 when prices change. The webhook
// unlocks on this boolean and nothing else, so it must fail CLOSED on every way
// an amount can be wrong: wrong tier, wrong SKU, unknown SKU, missing SKU.
console.log('\nWEBHOOK AMOUNT GATE (amountMatchesSku) — REQUIRED');

t('the live tier for the right SKU unlocks', () => {
  assert.strictEqual(amountMatchesSku(priceFor('artifact'), 'artifact'), true);
});

t('the WRONG TIER does not unlock (list paid while launch pricing is active)', () => {
  const wrongTier = LAUNCH_PRICING ? SKUS.artifact.list : SKUS.artifact.launch;
  assert.strictEqual(amountMatchesSku(wrongTier, 'artifact'), false);
});

t('the WRONG SKU price does not unlock (a compat amount on an artifact row)', () => {
  assert.strictEqual(amountMatchesSku(priceFor('compat'), 'artifact'), false);
  assert.strictEqual(amountMatchesSku(priceFor('artifact'), 'compat'), false);
});

t('a missing or unknown sku FAILS CLOSED (rows predating the sku column)', () => {
  assert.strictEqual(amountMatchesSku(19000, null), false);
  assert.strictEqual(amountMatchesSku(19000, undefined), false);
  assert.strictEqual(amountMatchesSku(19000, 'ghost'), false);
});

t('the retired Rp 49.000 pre-pivot price unlocks nothing', () => {
  for (const sku of Object.keys(SKUS)) {
    assert.strictEqual(amountMatchesSku(49000, sku), false, `49000 must not unlock ${sku}`);
  }
});

t('a non-numeric or malformed amount fails closed', () => {
  assert.strictEqual(amountMatchesSku('19000', 'artifact'), false, 'a string is not an amount');
  assert.strictEqual(amountMatchesSku(NaN, 'artifact'), false);
  assert.strictEqual(amountMatchesSku(undefined, 'artifact'), false);
  assert.strictEqual(amountMatchesSku(0, 'artifact'), false);
});

// Light live checks (opt-in): the core gate + webhook rejects unauthenticated POST.
if (process.argv.includes('--live')) {
  // OVERRIDABLE 2026-09-21, because the thing most worth forging against is a
  // DEPLOYED route. `/api/doku/notify` refuses correctly on localhost and on a
  // Vercel lambda for different reasons - the keys come from a different place and
  // the path is served by a different runtime - so a check that can only ever reach
  // localhost proves the weaker of the two. Default unchanged.
  const BASE = process.env.FORGE_BASE_URL || 'http://localhost:3000';
  console.log('\nLIVE (vs ' + BASE + ')');
  const live = async (name, fn) => { try { await fn(); ok(name); } catch (e) { bad(name, e); } };

  await live('unpaid /full returns teaser only (no paidContent)', async () => {
    const create = await fetch(`${BASE}/api/reading`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate: '1989-09-13', birthTime: null, domain: 'hubungan' }),
    }).then((r) => r.json());
    assert.ok(create.token, 'reading created');
    const full = await fetch(`${BASE}/api/reading/${create.token}/full`).then((r) => r.json());
    assert.strictEqual(full.paid, false, 'unpaid');
    assert.ok(!full.paidContent, 'no paid content leaks pre-payment');
    assert.ok(full.teaser, 'teaser present');
  });

  // ── THE TWO WEBHOOK FORGERY CHECKS ARE DELETED, 2026-09-18 ──
  // They POSTed a forged `{external_id, status: 'PAID'}` at `/api/webhook/xendit`
  // with no token and with a wrong one, and asserted 401. The route is deleted, so
  // both would now get a 404 - and the first would have PASSED it as a `503`-shaped
  // refusal had the accepted set been one value wider. A check that green-lights a
  // missing route is not a check that an endpoint rejects forgeries.
  //
  // NOTHING IS LEFT UNGUARDED. There is no notification endpoint to forge against
  // until Prompt V builds one, and when it does the token verification is its
  // adapter's own first commit. The gate that matters meanwhile is the one above:
  // an unpaid `/full` leaks no paid content, and that runs on every `--live`.
  //
  // PROMPT V RESTORES THEM POINTED AT DOKU, and it must: a notification endpoint
  // that trusts its body is how a free unlock ships.
  //
  // ── RESTORED 2026-09-21, AND THEY ASSERT 401 EXACTLY ──────
  // The note above is its own instruction, and the lesson in it is the accepted
  // SET: the deleted check would have passed a 503-shaped refusal, and a check
  // that green-lights a missing route is not a check that an endpoint rejects
  // forgeries. So these compare to 401 and to nothing else - a 404 (route gone),
  // a 503 (keys unset) and a 200 (it believed the body) each fail here, loudly,
  // and the message says which one came back.
  await live('a forged DOKU notification with NO headers is rejected', async () => {
    const res = await fetch(`${BASE}/api/doku/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { invoice_number: 'forged', amount: 39000 }, transaction: { status: 'SUCCESS' } }),
    });
    assert.strictEqual(res.status, 401,
      `unsigned notification must be 401, got ${res.status}`);
  });

  await live('a forged DOKU notification with a WRONG signature is rejected', async () => {
    // Syntactically perfect: every header present, the right shape, a real-looking
    // base64 MAC. Only the secret is wrong, which is the only thing that can be.
    const res = await fetch(`${BASE}/api/doku/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'BRN-0001-FORGED',
        'Request-Id': '11111111-2222-3333-4444-555555555555',
        'Request-Timestamp': `${new Date().toISOString().slice(0, 19)}Z`,
        Signature: 'HMACSHA256=Juf12uy34E0KEYHfwG6kAR3RVtqSrdGz9KPHvRcsL6M=',
      },
      body: JSON.stringify({ order: { invoice_number: 'forged', amount: 39000 }, transaction: { status: 'SUCCESS' } }),
    });
    assert.strictEqual(res.status, 401,
      `wrongly signed notification must be 401, got ${res.status}`);
  });
}

console.log(`\n${fail === 0 ? 'PASS' : 'FAIL'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
