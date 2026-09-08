// Fail-closed payment fence. PURE env-presence logic — no secret VALUES, no network,
// no server-only deps — so it is safe to import anywhere and is unit-testable.
//
// The dev bypass (in-memory unlock without real Xendit) is a convenience for LOCAL
// dev only. In production the payment path MUST be fully configured (Xendit secret
// key + webhook callback token) or it REFUSES (503). This makes the dev bypass
// structurally unreachable at prod cutover: forgetting the secrets fails loudly
// instead of silently shipping a free-unlock path.

// ── PAYMENTS_PROVIDER, RULED 2026-09-08: KATON IS EXITING XENDIT ───
// Read in ONE place - here - and consumed by `POST /api/pay/[id]` and the
// webhook. Three values and nothing else:
//
//   'closed'  PRODUCTION. No new payments. `POST /api/pay` answers 503
//             `payment_closed`; the Home card still leads to /kompatibilitas,
//             which renders its sales-closed state. **Existing paid pairs and
//             paid mirror artifacts keep serving** - closing sales is not
//             revoking what somebody already bought.
//   'mock'    PREVIEW AND LOCAL ONLY, and REFUSED when VERCEL_ENV=production.
//             Exists so the paid flow can be walked for free: no Xendit test
//             keys are needed and none are set. Reyner pays nothing; the Gemini
//             spend of a real render is accepted.
//   'xendit'  the historical adapter, unchanged. Nothing about it is edited
//             here. Reyner handles the balance and unsets the keys later.
//
// DOKU is a later phase and is not in this file.
//
// ── WHY 'closed' IS THE DEFAULT AND NOT 'xendit' ───────────
// An unset variable must not mean "take money". A deploy that loses the env var
// - a new environment, a restored project, a typo - would otherwise silently
// reopen a sales channel Reyner has closed, and the failure would look exactly
// like normal operation. Fail-closed here means fail-CLOSED.
const PROVIDERS = new Set(['xendit', 'mock', 'closed']);

/** @returns {'xendit'|'mock'|'closed'} */
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
 *   or null when it may proceed (always null outside production).
 */
export function paymentFenceReason() {
  // THE PROVIDER IS ASKED FIRST, because the Xendit keys are about to be unset
  // and their absence must not then read as a misconfiguration. `closed` and
  // `mock` are deliberate states, not broken ones, and the reason string a
  // caller surfaces should say which.
  const provider = paymentsProvider();
  if (provider === 'closed') return 'payment_closed';
  if (provider === 'mock') return null;

  if (process.env.NODE_ENV !== 'production') return null; // dev bypass permitted
  if (!process.env.XENDIT_SECRET_KEY) return 'xendit_secret_key_unset';
  if (!process.env.XENDIT_WEBHOOK_TOKEN) return 'xendit_webhook_token_unset';
  return null;
}

/** Is the mock unlock door open? Never in production, whatever the env says. */
export function mockPaymentsAllowed() {
  return paymentsProvider() === 'mock';
}

/** The in-memory dev bypass is allowed ONLY outside production. */
export function devBypassAllowed() {
  return process.env.NODE_ENV !== 'production';
}
