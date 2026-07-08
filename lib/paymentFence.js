// Fail-closed payment fence. PURE env-presence logic — no secret VALUES, no network,
// no server-only deps — so it is safe to import anywhere and is unit-testable.
//
// The dev bypass (in-memory unlock without real Xendit) is a convenience for LOCAL
// dev only. In production the payment path MUST be fully configured (Xendit secret
// key + webhook callback token) or it REFUSES (503). This makes the dev bypass
// structurally unreachable at prod cutover: forgetting the secrets fails loudly
// instead of silently shipping a free-unlock path.

/**
 * @returns {string|null} a refusal reason when the payment path must fail closed,
 *   or null when it may proceed (always null outside production).
 */
export function paymentFenceReason() {
  if (process.env.NODE_ENV !== 'production') return null; // dev bypass permitted
  if (!process.env.XENDIT_SECRET_KEY) return 'xendit_secret_key_unset';
  if (!process.env.XENDIT_WEBHOOK_TOKEN) return 'xendit_webhook_token_unset';
  return null;
}

/** The in-memory dev bypass is allowed ONLY outside production. */
export function devBypassAllowed() {
  return process.env.NODE_ENV !== 'production';
}
