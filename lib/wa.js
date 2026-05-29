import 'server-only';
// SERVER ONLY. WhatsApp dispatch of the reading link (katon.app/r/<token>).
//
// Provider-gated stub for MVP: actual sending needs a WA provider (e.g. Fonnte /
// WhatsApp Business API). Until one is wired, this no-ops and reports false.
// The once-only guarantee lives in the caller (claimWaSend); this just sends.

export async function sendReadingLink({ waNumber, token }) {
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
