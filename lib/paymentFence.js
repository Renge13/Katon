// Fail-closed payment fence. PURE env-presence logic — no secret VALUES, no network,
// no server-only deps — so it is safe to import anywhere and is unit-testable.

// ── PAYMENTS_PROVIDER, RULED 2026-09-08: KATON IS EXITING ──
// Read in ONE place - here - and consumed by `POST /api/pay/[id]`. Two values and
// nothing else:
//
//   'closed'  PRODUCTION. No new payments. `POST /api/pay` answers 503
//             `payment_closed`; the Home card still leads to /kompatibilitas,
//             which renders its sales-closed state. **Existing paid pairs and
//             paid mirror artifacts keep serving** - closing sales is not
//             revoking what somebody already bought.
//   'mock'    PREVIEW AND LOCAL ONLY, and REFUSED when VERCEL_ENV=production.
//             Exists so the paid flow can be walked for free: no provider test
//             keys are needed and none are set. Reyner pays nothing; the Gemini
//             spend of a real render is accepted.
//   'doku'    THE REAL PROVIDER (Prompt V). DOKU Checkout, QRIS. Requires BOTH
//             `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY`; without either it answers a
//             named misconfiguration rather than pretending to be open.
//             `DOKU_SANDBOX` is REFUSED in production for the same reason `mock`
//             is - a sandbox key in production is not "take money", it is
//             "pretend to", and the buyer's page would look identical.
//
// It was ADDED here in Prompt V, not swapped for anything, exactly as the line
// this paragraph replaced said it would be.
//
// ── IT WAS THREE VALUES UNTIL 2026-09-18 ──────────────────
// The third was the historical adapter, kept selectable so the 2026-09-08 sales
// closure stayed reversible. Reyner ruled the exit outright on 2026-09-18 and the
// adapter is deleted, so the value is gone with it - and an environment that still
// has it typed in lands on `closed` by the same route any unrecognised value does.
// That is asserted, because a stale variable pointing at a terminated account is
// the one failure this deletion exists to make impossible.
//
// ── WHY 'closed' IS THE DEFAULT ───────────────────────────
// An unset variable must not mean "take money". A deploy that loses the env var
// - a new environment, a restored project, a typo - would otherwise silently
// reopen a sales channel Reyner has closed, and the failure would look exactly
// like normal operation. Fail-closed here means fail-CLOSED.
const PROVIDERS = new Set(['doku', 'mock', 'closed']);

/** @returns {'doku'|'mock'|'closed'} */
export function paymentsProvider() {
  const raw = (process.env.PAYMENTS_PROVIDER || '').trim().toLowerCase();
  const value = PROVIDERS.has(raw) ? raw : 'closed';

  // MOCK IS REFUSED IN PRODUCTION, structurally rather than by convention. It is
  // a free-unlock path, and the whole reason the fence below exists is that a
  // free-unlock path must be unreachable in production - this one arrives by env
  // var rather than by NODE_ENV, so it needs its own guard.
  if (value === 'mock' && process.env.VERCEL_ENV === 'production') return 'closed';

  // AND SANDBOX DOKU IS REFUSED THERE TOO, for the same reason in different
  // clothes. `mock` is obviously a free unlock; a SANDBOX key is a subtler one -
  // the checkout page looks real, the buyer "pays", DOKU sends a genuine signed
  // notification, `paid` flips, and no money has moved. Every guard downstream
  // passes, because every one of them is working correctly on a test transaction.
  // Nothing but this line can tell the difference.
  if (value === 'doku' && process.env.DOKU_SANDBOX && process.env.VERCEL_ENV === 'production') {
    return 'closed';
  }
  return value;
}

/**
 * @returns {string|null} a refusal reason when the payment path must fail closed,
 *   or null when it may proceed.
 */
export function paymentFenceReason() {
  // THE THIRD BRANCH IS BACK, AND IT CAME BACK WITH ITS ANSWER. The pay route's
  // own note said a `payment_not_configured:${fence}` line "comes back WITH the
  // answer" when Prompt V gives the fence a third value, because a branch that
  // reads like a mitigation and can never execute is worse than no branch
  // (CLAUDE.md rule 15). `doku` is that value and these are those reasons.
  //
  // `closed` and `mock` are deliberate states, not broken ones, and the reason
  // string a caller surfaces says which - the client renders the sales-closed page
  // from `payment_closed`, so it must never be dressed as a misconfiguration.
  const provider = paymentsProvider();
  if (provider === 'closed') return 'payment_closed';

  // NAMED SEPARATELY, not collapsed into one `doku_not_configured`. These are two
  // different mistakes in two different Vercel fields, and the person reading the
  // 503 is the person who has to fix one of them. A shared reason would make them
  // check both.
  if (provider === 'doku') {
    if (!process.env.DOKU_CLIENT_ID) return 'doku_client_id_unset';
    if (!process.env.DOKU_SECRET_KEY) return 'doku_secret_key_unset';
  }
  return null;
}

/** Is the mock unlock door open? Never in production, whatever the env says. */
export function mockPaymentsAllowed() {
  return paymentsProvider() === 'mock';
}

/**
 * Both DOKU keys present?
 *
 * THE NOTIFY ROUTE'S QUESTION, and it is deliberately NOT `paymentsProvider() ===
 * 'doku'`. A notification can arrive for a payment started before someone flipped
 * `PAYMENTS_PROVIDER` back to `closed`, and it must still be verifiable and still
 * settle - closing sales is not refusing money that has already moved. What the
 * route needs is "can I verify this signature", which is exactly key presence.
 *
 * It lives here so "what does a deployment require" has one home.
 *
 * @returns {boolean}
 */
export function dokuConfigured() {
  return Boolean(process.env.DOKU_CLIENT_ID && process.env.DOKU_SECRET_KEY);
}
