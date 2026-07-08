#!/usr/bin/env node
// Forge / fail-closed tests. Light by design (SPEC §7 4a): the core paywall gate
// (/full gated on paid===true) already holds and prod is not near. The REQUIRED
// assertion here is that the payment path fails CLOSED in production when the Xendit
// secrets are unset — so the dev bypass can't silently ship at cutover.
//
//   npm run test:forge                     # fence + store unit tests (no server needed)
//   npm run test:forge -- --live           # + live checks vs http://localhost:3000
//
// NOTE: run with `node --conditions=react-server` (the npm script does this). The
// store tests import lib/readingStore.js, whose `server-only` guard resolves to an
// empty stub under that condition — the same way Next's RSC bundle resolves it.
import assert from 'node:assert';
import { paymentFenceReason, devBypassAllowed } from '../lib/paymentFence.js';
import { createReading, claimWaSend, releaseWaSend } from '../lib/readingStore.js';
import { decideWaOutcome } from '../lib/wa.js';

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log(`  ✓ ${name}`); };
const bad = (name, e) => { fail++; console.log(`  ✗ ${name} — ${e?.message || e}`); };
function t(name, fn) { try { fn(); ok(name); } catch (e) { bad(name, e); } }

function withEnv(env, fn) {
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

// THE required forge-test: production with no Xendit secret must REFUSE, and the
// dev bypass must be off.
t('prod + no XENDIT_SECRET_KEY → refuses (fence reason set)', () => {
  withEnv({ NODE_ENV: 'production', XENDIT_SECRET_KEY: undefined, XENDIT_WEBHOOK_TOKEN: 'x' }, () => {
    assert.strictEqual(paymentFenceReason(), 'xendit_secret_key_unset');
    assert.strictEqual(devBypassAllowed(), false, 'dev bypass must be OFF in production');
  });
});

t('prod + secret but no XENDIT_WEBHOOK_TOKEN → refuses', () => {
  withEnv({ NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k', XENDIT_WEBHOOK_TOKEN: undefined }, () => {
    assert.strictEqual(paymentFenceReason(), 'xendit_webhook_token_unset');
  });
});

t('prod + both secrets set → allowed (fence null), bypass still off', () => {
  withEnv({ NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k', XENDIT_WEBHOOK_TOKEN: 'x' }, () => {
    assert.strictEqual(paymentFenceReason(), null);
    assert.strictEqual(devBypassAllowed(), false);
  });
});

t('development + no secret → allowed (dev bypass on)', () => {
  withEnv({ NODE_ENV: 'development', XENDIT_SECRET_KEY: undefined, XENDIT_WEBHOOK_TOKEN: undefined }, () => {
    assert.strictEqual(paymentFenceReason(), null);
    assert.strictEqual(devBypassAllowed(), true);
  });
});

// STORE (WA claim/release transition semantics) — REQUIRED.
// No DB/server needed: with no Supabase env the store uses its process-local
// in-memory Map. This locks the mutex + retryability contract the webhook relies on.
console.log('\nSTORE (WA claim/release) — REQUIRED');
const at = async (name, fn) => { try { await fn(); ok(name); } catch (e) { bad(name, e); } };

// (1) mutex: claim transitions once; a second claim (Xendit double-fire) is refused.
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

// Light live checks (opt-in): the core gate + webhook rejects unauthenticated POST.
if (process.argv.includes('--live')) {
  const BASE = 'http://localhost:3000';
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

  await live('webhook with NO x-callback-token → rejected (401/503)', async () => {
    const r = await fetch(`${BASE}/api/webhook/xendit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ external_id: 'forged', status: 'PAID' }),
    });
    assert.ok([401, 503].includes(r.status), `expected 401/503, got ${r.status}`);
  });

  await live('webhook with WRONG token → rejected (401)', async () => {
    const r = await fetch(`${BASE}/api/webhook/xendit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-callback-token': 'definitely-wrong' },
      body: JSON.stringify({ external_id: 'forged', status: 'PAID' }),
    });
    assert.strictEqual(r.status, 401, `expected 401, got ${r.status}`);
  });
}

console.log(`\n${fail === 0 ? 'PASS' : 'FAIL'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
