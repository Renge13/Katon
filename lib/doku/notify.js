import 'server-only';
// ============================================================
// lib/doku/notify.js — POST /api/doku/notify
// ============================================================
// Prompt V §3. One of the TWO callers that flip `paid` for a real payment (CLAUDE.md
// rule 18) - the other is the on-load reconcile (`lib/doku/reconcile.js`, item 4 and
// PAY-SAFETY-ALL-PURCHASES) - and BOTH go through the same settle doors,
// `settlePair` / `settleReading`, which the mock walk uses too. Nothing here is a
// second way to become paid.
//
// The logic lives in `lib/` rather than in the route file for the repo's stated
// reason: `node --test` cannot resolve Next's `@/` alias, so a handler in
// `app/api/**` is a handler no spec can reach.
//
// ── THE ORDER OF OPERATIONS IS THE SECURITY ───────────────
// 1. keys, 2. RAW bytes, 3. verify, 4. only then parse. Parsing before verifying
// would run a JSON parser over unauthenticated input and, worse, invite someone to
// read a field off it "just to log" - at which point the body is trusted.
//
// ── WHY NO CHECK-STATUS CALL ──────────────────────────────
// The old Xendit webhook re-fetched the invoice because its callback carried only a
// shared token, so the body could not be trusted. DOKU's notification is HMAC'd with
// the secret over the exact body: a body that verifies IS DOKU's record. Re-fetching
// would add a network call inside a handler DOKU retries on failure, for a guarantee
// the signature already gives. `checkStatus` exists for the ops script and, since
// 2026-09-23, for the on-load reconcile - the path for a notification that never came.
//
// ── EVERY VERIFIED NOTIFICATION IS A 2xx ──────────────────
// Including `FAILED` and `amount_mismatch`. DOKU retries a non-2xx nine times over
// seven days, and retrying a notification we understood perfectly well and declined
// to act on is nine pointless invocations. Only a signature failure or a server
// error is non-2xx.
// ============================================================

import { getPair } from '../pairStore.js';
import { getReading } from '../readingStore.js';
import { settleReading } from '../deliver/settle.js';
import { settlePair } from '../pair/settle.js';
import { recordEvent } from '../analytics/events.js';
import { dokuConfigured } from '../paymentFence.js';
import { verifyNotification, amountNumber, PAID_STATUSES } from './client.js';

// PLAIN `Response`, NOT `lib/http.js`. That module imports `next/server`, which does
// not resolve under `node --test` - so using it here would put this handler back
// behind the exact barrier moving it out of `app/api/**` was meant to remove. Every
// other handler in `lib/` declares its own `reply` for the same reason
// (`lib/pair/serve.js:56`, `lib/pair/serveReading.js:53`, `lib/deliver/handlers.js:73`).
const reply = (body, status = 200) => Response.json(body, { status });
const json = (body) => reply(body, 200);
const badRequest = (message) => reply({ error: message }, 400);
const unauthorized = (message) => reply({ error: message }, 401);
const notConfigured = (message) => reply({ error: message }, 503);

/** The literal path DOKU is configured to POST to, and what the signature is over. */
export const NOTIFY_TARGET = '/api/doku/notify';

/**
 * Handle one DOKU notification.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handleDokuNotification(request) {
  // ── 1. NO KEYS, NO VERIFICATION POSSIBLE ──────────────────
  // Refuse before reading anything. `dokuConfigured` rather than
  // `paymentsProvider() === 'doku'` on purpose: a notification can arrive for a
  // payment started before sales were closed, and it must still settle. Closing
  // sales is not refusing money that has already moved.
  if (!dokuConfigured()) return notConfigured('doku_not_configured');

  // ── 2. THE RAW BYTES ──────────────────────────────────────
  // The digest is over these. `request.json()` must not appear above this line -
  // a re-serialised body has a different digest and would never verify.
  const rawBody = await request.text();

  // ── 3. VERIFY ─────────────────────────────────────────────
  const { ok, reason } = verifyNotification({
    headers: request.headers, rawBody, target: NOTIFY_TARGET,
  });
  if (!ok) {
    // THE REASON, NEVER THE BODY. An unverified body is attacker-controlled and a
    // log is somewhere it would be read later by a human who trusts it.
    console.error(`[doku] notification rejected: ${reason}`);
    return unauthorized('invalid signature');
  }

  // ── 3a. THE CAPTURE, AND IT IS FENCED THREE WAYS ──────────
  // V-doku.md §5 asks for the RAW notification "from the function log", and there is
  // nothing in the log to read unless something puts it there. This is that, and it
  // is the only exception to the line three comments above.
  //
  // THE EXCEPTION IS NARROW AND THE REASON IS THE ORDER. That rule is about an
  // UNVERIFIED body, which is attacker-controlled; this runs only after the HMAC has
  // passed, so what it prints is DOKU's own bytes and nobody else's. A capture above
  // the verify would be the rule's exact violation.
  //
  // Three fences, because a debug path on the payment route is worth being paranoid
  // about: an explicit flag, never in production, and after verification. `capture`
  // reads the env per call so a test can set it.
  //
  // WHAT IT PRINTS AND WHY THAT IS SAFE: the four headers and the body. The Signature
  // is an HMAC of the body under the secret - it does not reveal the secret - and the
  // Client-Id is an identifier, not a credential. The SECRET is never touched here.
  //
  // IT IS TEMPORARY. It exists to capture the §4 fixture once; the deferred register
  // carries the row that removes it.
  if (process.env.DOKU_CAPTURE && process.env.VERCEL_ENV !== 'production') {
    console.log(`[doku][capture] headers ${JSON.stringify({
      'client-id': request.headers.get('client-id'),
      'request-id': request.headers.get('request-id'),
      'request-timestamp': request.headers.get('request-timestamp'),
      signature: request.headers.get('signature'),
    })}`);
    console.log(`[doku][capture] body ${rawBody}`);
  }

  // ── 4. NOW IT MAY BE PARSED ───────────────────────────────
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    // Signed by us and still not JSON is a DOKU bug, not an attack. 400 so it shows
    // up as an error rather than being absorbed into the 2xx pile.
    return badRequest('invalid JSON body');
  }

  const invoiceNumber = body?.order?.invoice_number;
  if (typeof invoiceNumber !== 'string' || !invoiceNumber) {
    return badRequest('missing order.invoice_number');
  }

  // MEASURED 2026-09-21: DOKU sends the amount as a STRING (`"39000"`), and the
  // docs' sample shows a decimal (`20000.00`). `amountMatchesSku` takes a number
  // and returns false for a string, so without this coercion a verified, correct,
  // fully paid notification would settle as `amount_mismatch` and the buyer would
  // never get the thing she paid for. See lib/doku/client.js#amountNumber.
  const settledAmount = amountNumber(body?.order?.amount);
  const statusPaid = PAID_STATUSES.includes(body?.transaction?.status);

  // ── THE ROW ID IS THE INVOICE NUMBER'S FIRST SEGMENT ──────
  // `POST /api/pay/[id]` writes `${id}.${base36 time}` so a buyer who abandons a
  // session and clicks Buy again gets a second invoice_number for the same row. The
  // nanoid alphabet has no `.`, so this split is unambiguous - and a bare id (no
  // suffix) survives it unchanged, which is what makes the two forms interchangeable.
  const rowId = invoiceNumber.split('.')[0];

  // PAIR FIRST. The old webhook's order and its reason: a pair hit is unambiguous,
  // and the two id namespaces are separate tables.
  const pairRow = await getPair(rowId);
  if (pairRow) {
    // `settlePair` owns the per-sku amount check, the idempotent flip and the warm
    // render. NOTHING is added to it here - one settle policy, one place.
    const result = await settlePair(rowId, pairRow, statusPaid, settledAmount);
    if (result.paid) await recordEvent(rowId, 'purchase_confirmed', { sku: pairRow.sku ?? null });
    console.log(`[doku] pair ${rowId}: paid=${result.paid} reason=${result.reason ?? 'ok'}`);
    return json({ received: true });
  }

  const row = await getReading(rowId);
  if (!row) {
    // UNKNOWN ID IS A 2xx, so DOKU stops retrying. There is nothing to settle and
    // nine more attempts will not find one.
    console.error(`[doku] no pair or reading for ${rowId}`);
    return json({ received: true });
  }

  // ~~The reading branch has no `settleReading`, so the amount check is inline~~ -
  // it has one now, and the amount check moved into it UNCHANGED, fail-closed on a
  // null sku: a row with no sku has no price to check against, and "no price" must
  // not mean "any price".
  // THE MIRROR'S SETTLE DOOR, EXTRACTED 2026-09-23 (`lib/deliver/settle.js`), so the
  // on-load reconcile settles a Rp 19.000 purchase through the SAME function as this
  // notification - exactly as `settlePair` does for pairs. Behaviour unchanged:
  // wrong amount on a SUCCESS is refused, a non-SUCCESS settles nothing.
  const result = await settleReading(rowId, row, statusPaid, settledAmount);
  if (result.paid) await recordEvent(rowId, 'purchase_confirmed', { sku: row.sku ?? null });
  console.log(`[doku] reading ${rowId}: paid=${result.paid} reason=${result.reason ?? 'ok'}`);
  return json({ received: true });
}
