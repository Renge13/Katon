#!/usr/bin/env node
// Forge / fail-closed tests. Light by design (SPEC §7 4a): the core paywall gate
// (/full gated on paid===true) already holds and prod is not near. The REQUIRED
// assertion here is that the payment path fails CLOSED in production when the Xendit
// secrets are unset — so the dev bypass can't silently ship at cutover.
//
//   node scripts/forge-tests.mjs           # fence unit tests (no server needed)
//   node scripts/forge-tests.mjs --live    # + live checks vs http://localhost:3000
import assert from 'node:assert';
import { paymentFenceReason, devBypassAllowed } from '../lib/paymentFence.js';

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
