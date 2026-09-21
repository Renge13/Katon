import 'server-only';
// ============================================================
// lib/doku/client.js — DOKU Checkout, outbound
// ============================================================
// Prompt V §2, with Amendment 1 §B applied. The signing rule is NOT here: it is
// `lib/doku/signature.js`, pure and importable by a probe script and a plain
// `node --test`, which is what keeps there being one copy of it. This file is the
// network and the env.
//
// ── EVERY FACT BELOW WAS CONFIRMED AGAINST THE SANDBOX 2026-09-21 ──
// Not against the docs, and not against the prompt. `docs/ops/doku-walk.md` Part 2
// carries the run. The three that changed what this file does:
//
// 1. THE SIGNATURE IS VERIFIED BEFORE THE BODY. A deliberately wrong secret gets
//    `{"error":{"code":"invalid_signature",...}}` where a right one gets a
//    business answer, so a business answer PROVES the signature was accepted. That
//    is what makes `signature.js` confirmed rather than merely tested.
// 2. THERE ARE TWO ERROR ENVELOPES, not one. Amendment B.4 says `error.message` is
//    a string; that is true of the AUTH envelope only. Business answers - success
//    AND validation failure - use `{"message":[...]}`, a top-level ARRAY with no
//    `error` key at all. `errorMessageOf` reads both, because a handler that knows
//    only one prints "undefined" on exactly the failures a human is trying to
//    diagnose.
// 3. `order.amount` COMES BACK AS A STRING (`"39000"`). `amountMatchesSku` takes a
//    number and returns false for a string, so anything reading an amount off DOKU
//    coerces first. See `lib/doku/notify.js`, where getting this wrong would have
//    meant a verified, paid, correct notification settling as `amount_mismatch`.
//
// ── THE TIMESTAMP IS GENERATED AT SEND TIME ───────────────
// Amendment B.3(a). DOKU rejects a `Request-Timestamp` more than 3600 seconds from
// now, checked BEFORE `Client-Id`. A timestamp built at module scope is correct for
// one hour after a cold start and then silently fails every call, so it is built
// inside the request and never cached. Same for `Request-Id`, which must be unique.
// ============================================================

import { randomUUID } from 'node:crypto';

import { digestOf, signComponents, signaturesMatch } from './signature.js';

/** The two bases. Chosen by `DOKU_SANDBOX` presence, never by an argument. */
const SANDBOX_BASE = 'https://api-sandbox.doku.com';
const PRODUCTION_BASE = 'https://api.doku.com';

export const CHECKOUT_TARGET = '/checkout/v1/payment';

/** QRIS, and the product does not offer a second method. */
export const PAYMENT_METHOD_TYPES = ['QRIS'];

/** The statuses that mean money arrived. */
export const PAID_STATUSES = ['SUCCESS'];

/**
 * Which DOKU. PRESENT `DOKU_SANDBOX` means sandbox; absent means production.
 *
 * The fence refuses `doku` + `DOKU_SANDBOX` under `VERCEL_ENV=production`, so this
 * cannot silently point a production deployment at the sandbox. It is read per call
 * rather than frozen at module load so a test can set it.
 */
export const dokuBase = () => (process.env.DOKU_SANDBOX ? SANDBOX_BASE : PRODUCTION_BASE);

const credentials = () => ({
  clientId: process.env.DOKU_CLIENT_ID,
  secret: process.env.DOKU_SECRET_KEY,
});

function requireCredentials() {
  const { clientId, secret } = credentials();
  if (!clientId || !secret) {
    const err = new Error('doku: DOKU_CLIENT_ID and DOKU_SECRET_KEY must both be set');
    err.code = 'not_configured';
    throw err;
  }
  return { clientId, secret };
}

/**
 * DOKU's message, from whichever envelope it used. Never the keys.
 *
 * @param {Object|null} body parsed response
 * @returns {string}
 */
export function errorMessageOf(body) {
  // The business envelope: `{"message":["PAYMENT CHANNEL IS INACTIVE"]}`.
  if (Array.isArray(body?.message)) return body.message.join('; ');
  if (typeof body?.message === 'string') return body.message;
  // The auth envelope: `{"error":{"code","message","type"}}`.
  const inner = body?.error?.message;
  if (Array.isArray(inner)) return inner.join('; ');
  if (typeof inner === 'string') return inner;
  return 'no message';
}

/**
 * One signed request to DOKU.
 *
 * @param {Object} args
 * @param {'GET'|'POST'} args.method
 * @param {string} args.target the PATH, which is also what is signed
 * @param {Object} [args.body] POST only
 * @returns {Promise<{status: number, json: Object|null, raw: string}>}
 */
async function send({ method, target, body }) {
  const { clientId, secret } = requireCredentials();
  // SERIALISE ONCE AND SEND THE SAME STRING. Signing one serialisation and sending
  // another is the failure `digestOf`'s docblock is about, and DOKU would answer
  // `invalid_signature` for a body that is correct in every other way.
  const raw = body === undefined ? null : JSON.stringify(body);
  const requestId = randomUUID();
  // No milliseconds: DOKU's own examples are second-precision and the format check
  // is strict (a space instead of `T` is refused outright).
  const timestamp = `${new Date().toISOString().slice(0, 19)}Z`;

  const response = await fetch(`${dokuBase()}${target}`, {
    method,
    headers: {
      ...(raw === null ? {} : { 'Content-Type': 'application/json' }),
      'Client-Id': clientId,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      // A GET omits the Digest LINE, not just its value - see `componentString`.
      Signature: signComponents({
        clientId, requestId, timestamp, target, digest: raw === null ? null : digestOf(raw),
      }, secret),
    },
    ...(raw === null ? {} : { body: raw }),
  });

  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { /* DOKU answered with something else */ }
  return { status: response.status, json: parsed, raw: text };
}

/**
 * Create a Checkout session.
 *
 * @param {Object} args
 * @param {string} args.invoiceNumber the merchant's unique key
 * @param {number} args.amount integer IDR
 * @param {string} args.callbackUrl absolute
 * @param {string} args.callbackUrlResult absolute
 * @param {string} [args.lineItemName] what the buyer sees on DOKU's page
 * @param {string|null} [args.email]
 * @returns {Promise<{paymentUrl: string, tokenId: string, expiredDate: string, raw: Object}>}
 * @throws {Error} `code` is `not_configured` or `checkout_failed`
 */
export async function createCheckout({
  invoiceNumber, amount, callbackUrl, callbackUrlResult, lineItemName, email = null,
}) {
  const order = {
    amount,
    invoice_number: invoiceNumber,
    callback_url: callbackUrl,
    callback_url_result: callbackUrlResult,
    // RULED BY REYNER (Amendment A.1): the buyer's last screen is Katon's, which is
    // the reason the redirect URLs were added in the first place.
    auto_redirect: true,
    ...(lineItemName ? { line_items: [{ name: lineItemName, price: amount, quantity: 1 }] } : {}),
  };

  const { status, json, raw } = await send({
    method: 'POST',
    target: CHECKOUT_TARGET,
    body: {
      order,
      payment: { payment_method_types: PAYMENT_METHOD_TYPES },
      // OMITTED UNLESS THERE IS AN EMAIL. The sandbox accepts a QRIS request with
      // no customer block at all (doku-walk.md 2.3), and the docs list customer as
      // required only for Jenius, Akulaku, Indodana and Kredivo.
      ...(email ? { customer: { email } } : {}),
    },
  });

  const paymentUrl = json?.response?.payment?.url;
  if (status >= 300 || !paymentUrl) {
    // THE MESSAGE, NEVER THE KEYS. `errorMessageOf` handles both envelopes, and the
    // status is carried because `PAYMENT CHANNEL IS INACTIVE` at 400 and a 500 are
    // very different conversations with DOKU.
    const err = new Error(`doku checkout failed (${status}): ${errorMessageOf(json)}`);
    err.code = 'checkout_failed';
    err.status = status;
    // The raw text is attached but NOT interpolated into the message, so a log line
    // stays one line and a caller that wants the body can still have it.
    err.raw = raw;
    throw err;
  }

  return {
    paymentUrl,
    tokenId: json.response.payment.token_id,
    expiredDate: json.response.payment.expired_date ?? null,
    raw: json,
  };
}

/**
 * Check one invoice's status. THE OPS SCRIPT'S, never a route's.
 *
 * No Digest: it is a GET. See §3's "why no check-status call on the hot path" - a
 * verified notification IS DOKU's record, and re-fetching inside a handler DOKU
 * retries would buy nothing the signature has not already given.
 *
 * @param {string} invoiceNumber
 * @returns {Promise<{status: string|null, amount: number|null, invoiceNumber: string|null, raw: Object|null}>}
 */
export async function checkStatus(invoiceNumber) {
  const { status, json } = await send({
    method: 'GET',
    target: `/orders/v1/status/${encodeURIComponent(invoiceNumber)}`,
  });
  if (status >= 300) {
    const err = new Error(`doku check-status failed (${status}): ${errorMessageOf(json)}`);
    err.code = 'check_status_failed';
    throw err;
  }
  return {
    status: json?.transaction?.status ?? null,
    amount: amountNumber(json?.order?.amount),
    invoiceNumber: json?.order?.invoice_number ?? null,
    raw: json,
  };
}

/**
 * Verify an inbound DOKU notification.
 *
 * ── `target` IS PASSED IN, NEVER DERIVED FROM THE REQUEST ──
 * §2's rule and it is the security-critical one: a proxy, a preview alias or a
 * rewrite can change what the incoming request thinks its own path is, and a
 * verifier that asks the request what to verify against is not a verifier. The
 * route hands over the literal `'/api/doku/notify'`.
 *
 * ── THE COMPARISON IS ON DECODED BYTES ────────────────────
 * Amendment B.2. DOKU's own samples disagree on base64 padding, so `signaturesMatch`
 * decodes both sides and length-checks before `timingSafeEqual`.
 *
 * @param {Object} args
 * @param {Headers} args.headers the incoming request's
 * @param {string} args.rawBody the exact bytes, before any parse
 * @param {string} args.target the literal notification path
 * @returns {{ok: boolean, reason: string|null}} `not_configured | missing_header | bad_signature`
 */
export function verifyNotification({ headers, rawBody, target }) {
  const { clientId, secret } = credentials();
  if (!clientId || !secret) return { ok: false, reason: 'not_configured' };

  const requestId = headers.get('request-id');
  const timestamp = headers.get('request-timestamp');
  const presented = headers.get('signature');
  if (!requestId || !timestamp || !presented) return { ok: false, reason: 'missing_header' };

  // THE CLIENT-ID IN THE COMPONENT IS OURS, NOT THE HEADER'S. Signing with a
  // Client-Id the caller supplied would let anyone who knows the shape pick the
  // value that makes their own signature verify. The header's Client-Id is not
  // trusted for anything here; the secret and the id are both ours.
  const expected = signComponents({
    clientId, requestId, timestamp, target, digest: digestOf(rawBody),
  }, secret);

  return signaturesMatch(expected, presented)
    ? { ok: true, reason: null }
    : { ok: false, reason: 'bad_signature' };
}

/**
 * DOKU's amount as a NUMBER.
 *
 * MEASURED, NOT ASSUMED: the sandbox returns `"39000"` (a string) on create, and
 * the docs' notification sample shows `20000.00` (a decimal). `amountMatchesSku`
 * takes a number and returns false for a string, so a verified notification for the
 * right money would settle as `amount_mismatch` without this. Exported because
 * `lib/doku/notify.js` needs exactly the same coercion and two of them would drift.
 *
 * @param {unknown} value
 * @returns {number|null} null when it is not a finite number
 */
export function amountNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
