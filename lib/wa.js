import 'server-only';
// SERVER ONLY. WhatsApp dispatch of the reading link (katon.app/r/<token>).
//
// Provider-gated stub for MVP: actual sending needs a WA provider (e.g. Fonnte /
// WhatsApp Business API). Until one is wired, this no-ops and reports false.
// The once-only guarantee lives in the caller (claimWaSend); this just sends.

/**
 * PURE decision: how should the webhook treat a sendReadingLink outcome? No I/O, no
 * deps — unit-testable in isolation. Interprets the contract sendReadingLink returns
 * (below). Pass the resolved `result`; pass `threw = true` when the call itself threw.
 *
 *   'sent'             → delivered. Keep the wa_sent claim, return 200. (wa_sent === true
 *                        means ACTUALLY delivered.)
 *   'skip_no_provider' → expected MVP state (no WA provider wired). Release the claim so
 *                        wa_sent stays an honest false; return 200, no retry.
 *   'retry'            → real failure (threw, a falsy/malformed result, or sent:false for
 *                        any reason other than no_provider). Release + 502 so Xendit
 *                        retries. Fail toward retry — NEVER toward a silently-kept claim.
 *
 * @param {{ sent?: boolean, reason?: string }|null|undefined} result
 * @param {boolean} [threw]
 * @returns {'sent'|'skip_no_provider'|'retry'}
 */
export function decideWaOutcome(result, threw = false) {
  if (threw) return 'retry';
  if (!result || typeof result !== 'object') return 'retry';
  if (result.sent === true) return 'sent';
  if (result.reason === 'no_provider') return 'skip_no_provider';
  return 'retry';
}

export async function sendReadingLink({ waNumber: _waNumber, token }) {
  // _waNumber will be the send target once a WA provider is wired (see below).
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://katon.app';
  const link = `${base}/r/${token}`;

  const provider = process.env.WA_PROVIDER_TOKEN; // unset in MVP
  if (!provider) {
    // No provider configured — do not log PII (waNumber). No-op.
    return { sent: false, reason: 'no_provider', link };
  }

  // TODO(provider): POST to the WA provider with `waNumber` + a message that
  // includes `link`. Kept out until the owner picks a provider.
  return { sent: false, reason: 'provider_not_implemented', link };
}
