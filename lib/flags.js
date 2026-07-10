// Render-time feature flags. Safe to import from BOTH server and client (no
// server-only deps, no secrets) — NEXT_PUBLIC_ values are inlined client-side.

/**
 * TEST-UNGATE flag. When ON, the full reading (mirror + deep-read) is RENDERED for
 * every reading without payment — for a stranger/cafe test where testers must read
 * everything for free.
 *
 * SECURITY FENCE (see CLAUDE.md decision #5): this unlocks the VIEW only. It NEVER
 * writes paid=true (or any paid state), NEVER fakes/bypasses the Xendit flow or
 * webhook, and NEVER changes what is stored in Supabase. The /full route serves the
 * already-computed content for display under this flag; the DB row stays paid=false.
 *
 * Default OFF (unset/empty) → normal paywall behavior, unchanged. Cleanly reversible
 * via the env var alone: set NEXT_PUBLIC_FREE_FULL_READING=1 (then redeploy so the
 * client bundle re-inlines it) to enable; unset to re-gate.
 */
export function freeFullReadingEnabled() {
  return ['1', 'true', 'yes', 'on'].includes(
    String(process.env.NEXT_PUBLIC_FREE_FULL_READING || '').toLowerCase(),
  );
}
