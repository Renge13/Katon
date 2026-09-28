// ============================================================
// The two sentences a failed request is allowed to say
// ============================================================
// Extracted from `components/Funnel.jsx` on 2026-09-08. It is a pure function
// over an error body and it was only in a component because that is where the
// first caller was - which made it unreachable from any test running under
// `--conditions=react-server`, since React's server build exports no hooks and
// importing the funnel pulls the whole component tree in.
//
// Both strings are Reyner's. Rule 20 is one voice everywhere, so a second
// wording for "something went wrong" on a second page would be a second
// register - which is the reason this is shared rather than re-written per
// surface.
//
// ── IT CANNOT TELL A CONFIG REFUSAL FROM A TRANSIENT ONE ───
// Everything except a rate limit gets "coba lagi sebentar" - try again shortly.
// For a fail-closed configuration refusal (`payment_not_configured:...`) that is
// FALSE: retrying cannot succeed until an env var is set. Reyner hit exactly
// that on #105's preview on 2026-09-08 and had to ask what had broken.
//
// NOT FIXED HERE, and the reason is not inertia: the fix is a different
// sentence, a sentence is user-facing Indonesian, and that is Reyner's alone.
// Adding a `PENDING()` slot was considered and not taken - it would ask him to
// rule copy for a state that should never reach a reader in production.
// `tests/compat-surface.spec.mjs` pins the current behaviour so changing it is a
// decision someone makes on purpose, with his wording.
// ============================================================

/**
 * @param {Object|null} res a parsed error body, or null for a network failure
 * @returns {string} Indonesian, ruled by Reyner
 */
export function readableError(res) {
  // The mirror route's 429 is the one refusal worth naming: it is recoverable by
  // waiting, and "something went wrong" would send her to retry immediately.
  //
  // THE LIMITER'S OWN REASONS (Prompt AK §3.2, 2026-09-28). consume() refuses with
  // `rate_limited_${dimension}` - 'rate_limited_ip', 'rate_limited_session' - and
  // until then only the three older spellings were matched, so a real rate-limit
  // refusal fell through to the generic sentence and the ruled line below never
  // reached a reader. Routing only: both sentences are unchanged.
  if (res?.error === 'rate_limited' || res?.error === 'session' || res?.error === 'ip'
    || /^rate_limited_/u.test(res?.error ?? '')) {
    return 'Terlalu banyak bacaan dari perangkat ini. Coba lagi nanti.';
  }
  return 'Ada yang salah. Coba lagi sebentar.';
}
