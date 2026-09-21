// ============================================================
// scripts/doku-probe.mjs — the three §2 questions the docs cannot answer
// ============================================================
// Run: npm run probe:doku
//
// Prompt V §2 lists four things that "MUST COME FROM THE SANDBOX". One of them -
// the `Request-Timestamp` tolerance - was answered with no credentials at all and is
// recorded in `docs/ops/doku-walk.md` §1.3. The fourth (the QRIS notification body)
// needs a payment and a public URL, so it belongs to the §5 preview walk. The three
// in between need one authenticated call each, and that is this script.
//
//   2.1  Is QRIS enabled as a Checkout method on the SANDBOX account?
//   2.2  What does DOKU do with a repeated `invoice_number`?
//   2.3  Is a `customer` block required for QRIS?
//
// ── SANDBOX ONLY, BY CONSTRUCTION ─────────────────────────
// Reyner ruled production off limits to this session: no production credential, no
// production env var, no production Back Office. So the base URL is a CONSTANT with
// no override - not a default, not an env var, nothing a typo or a copied command
// line can move. `api.doku.com` does not appear in this file. A flag that could point
// it at production is a flag that eventually does.
//
// It also refuses outright under `VERCEL_ENV=production`, which is the same
// structural guard `paymentsProvider()` puts on `mock`.
//
// ── IT PRINTS NO SECRET ───────────────────────────────────
// The Secret Key is never printed, and the Client-Id is redacted to its last four
// characters. The whole point of the run is an artifact pasted into a doc or a chat.
// ============================================================

import { randomUUID } from 'node:crypto';

import { digestOf, signComponents } from '../lib/doku/signature.js';

/** SANDBOX. Not configurable. See the header. */
const BASE = 'https://api-sandbox.doku.com';
const TARGET = '/checkout/v1/payment';

const clientId = process.env.DOKU_CLIENT_ID;
const secret = process.env.DOKU_SECRET_KEY;

const redact = (value) => (value ? `...${value.slice(-4)}` : '(unset)');

function refuse(message) {
  console.error(`\ndoku-probe: ${message}\n`);
  process.exit(1);
}

if (process.env.VERCEL_ENV === 'production') {
  refuse('refusing to run with VERCEL_ENV=production. This script talks to the sandbox '
    + 'only, and a production environment has no business running it.');
}
if (!clientId || !secret) {
  refuse('DOKU_CLIENT_ID and DOKU_SECRET_KEY must both be set (the SANDBOX pair).\n'
    + `  DOKU_CLIENT_ID  ${clientId ? 'set' : 'MISSING'}\n`
    + `  DOKU_SECRET_KEY ${secret ? 'set' : 'MISSING'}\n`
    + '  Put them in .env.local. They are read with --env-file-if-exists, as the other\n'
    + '  scripts in this directory read theirs. Preview-scope variables in Vercel are\n'
    + '  not visible to this machine.');
}

/**
 * One signed POST to Checkout.
 *
 * @param {string} label what the call is testing, for the printout
 * @param {Object} body the request body
 * @returns {Promise<{status: number, json: Object|null, raw: string}>}
 */
async function createCheckout(label, body) {
  // THE BYTES THAT ARE SIGNED ARE THE BYTES THAT ARE SENT. Serialise once and send
  // the same string: signing a re-serialised copy is the failure `digestOf`'s own
  // docblock is about, and it would be invisible until DOKU rejected it.
  const raw = JSON.stringify(body);
  const requestId = randomUUID();
  // Generated at send time, never hoisted: DOKU rejects a timestamp more than 3600
  // seconds from now (doku-walk.md 1.3), so a cached one breaks on a slow run.
  const timestamp = `${new Date().toISOString().slice(0, 19)}Z`;

  const response = await fetch(`${BASE}${TARGET}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      Signature: signComponents({
        clientId, requestId, timestamp, target: TARGET, digest: digestOf(raw),
      }, secret),
    },
    body: raw,
  });

  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* DOKU answered with something else */ }

  console.log(`\n── ${label} ────────────────────────────────`);
  console.log(`request-id  ${requestId}`);
  console.log(`timestamp   ${timestamp}`);
  console.log(`status      ${response.status}`);
  console.log(`body        ${text.slice(0, 1200)}`);
  return { status: response.status, json, raw: text };
}

const orderBase = (invoiceNumber) => ({
  order: {
    amount: 39000,
    invoice_number: invoiceNumber,
    callback_url: 'https://katon.app/kompatibilitas/probe?bayar=selesai',
    callback_url_result: 'https://katon.app/kompatibilitas/probe?bayar=selesai',
  },
  payment: { payment_method_types: ['QRIS'] },
});

const stamp = Date.now().toString(36);
const repeated = `probe-${stamp}-repeat`;

console.log('doku-probe — SANDBOX ONLY');
console.log(`base        ${BASE}`);
console.log(`client-id   ${redact(clientId)}`);
console.log(`secret      ${secret ? 'set (never printed)' : '(unset)'}`);

// ── 2.1 and 2.3 ──
// No `customer` block at all. If QRIS is enabled and customer is genuinely optional,
// this returns a `payment.url`. If it fails, the message says WHICH of the two it was
// - an unavailable payment method and a missing required field are different errors.
const first = await createCheckout(
  '2.1 + 2.3  QRIS, no customer block',
  orderBase(`probe-${stamp}-nocust`),
);

// ── 2.3, the other side ──
// Only worth sending if the one above failed: if it succeeded, customer is optional
// and there is nothing left to learn. Asked rather than assumed.
if (first.status >= 300) {
  await createCheckout('2.3       QRIS, WITH a customer block', {
    ...orderBase(`probe-${stamp}-cust`),
    customer: { id: `probe-${stamp}`, name: 'Probe', email: 'probe@katon.app' },
  });
}

// ── 2.2 ──
// The same invoice_number twice. Three outcomes are possible and they lead to
// different code: rejected (keep §3's `.timestamp` suffix), a NEW session (keep the
// suffix, DOKU tolerates it), or the EXISTING session returned (drop the suffix and
// use the bare id, which §3 says to do if this is what happens).
const repeatA = await createCheckout('2.2       first use of an invoice_number', orderBase(repeated));
const repeatB = await createCheckout('2.2       SAME invoice_number again', orderBase(repeated));

const tokenOf = (r) => r.json?.response?.payment?.token_id ?? null;
console.log('\n── 2.2 verdict ────────────────────────────');
if (repeatB.status >= 300) {
  console.log('REJECTED. Keep the `.${Date.now().toString(36)}` suffix in §3.');
} else if (tokenOf(repeatA) && tokenOf(repeatA) === tokenOf(repeatB)) {
  console.log('SAME SESSION RETURNED. §3 says drop the suffix and use the bare id.');
} else {
  console.log('A SECOND SESSION WAS CREATED. Keep the suffix - two live sessions for one');
  console.log('pair is exactly what it exists to keep apart.');
}

console.log('\nPaste this run into docs/ops/doku-walk.md Part 2, with the date.');
