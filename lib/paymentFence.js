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
//
// `doku` arrives in Prompt V and is ADDED to this set, not swapped for anything.
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
const PROVIDERS = new Set(['mock', 'closed']);

/** @returns {'mock'|'closed'} */
export function paymentsProvider() {
  const raw = (process.env.PAYMENTS_PROVIDER || '').trim().toLowerCase();
  const value = PROVIDERS.has(raw) ? raw : 'closed';

  // MOCK IS REFUSED IN PRODUCTION, structurally rather than by convention. It is
  // a free-unlock path, and the whole reason the fence below exists is that a
  // free-unlock path must be unreachable in production - this one arrives by env
  // var rather than by NODE_ENV, so it needs its own guard.
  if (value === 'mock' && process.env.VERCEL_ENV === 'production') return 'closed';
  return value;
}

/**
 * @returns {string|null} a refusal reason when the payment path must fail closed,
 *   or null when it may proceed.
 */
export function paymentFenceReason() {
  // TWO BRANCHES AND NO THIRD, and the absence of the third is the change. There
  // used to be a `NODE_ENV !== 'production'` dev bypass below these, followed by
  // two key-presence checks. Both went with the adapter: there are no keys left to
  // be absent, and a dev bypass for a provider that does not exist is a free-unlock
  // path guarding nothing.
  //
  // `closed` and `mock` are deliberate states, not broken ones, and the reason
  // string a caller surfaces says which - the client renders the sales-closed page
  // from `payment_closed`, so it must never be dressed as a misconfiguration.
  const provider = paymentsProvider();
  if (provider === 'closed') return 'payment_closed';
  return null;
}

/** Is the mock unlock door open? Never in production, whatever the env says. */
export function mockPaymentsAllowed() {
  return paymentsProvider() === 'mock';
}
