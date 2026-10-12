// ============================================================
// The site's own origin, for links Katon hands to somebody else
// ============================================================
// Anything Katon builds for an EXTERNAL consumer needs an absolute URL: a
// payment provider redirecting a buyer back, a message carrying a reading link.
// In-app navigation must keep using relative paths - this is not for that.
//
// One source, because the fallback literal is a promise about where the site
// lives and two copies of it drift. It read `https://katon.app` in lib/wa.js
// only until 2026-08-13.
//
// NEXT_PUBLIC_BASE_URL is the deployment's own origin and MUST be set per
// environment. On a preview deployment that is not set, the fallback sends a
// buyer to production - the reading id would be a miss there, so the
// failure is a not-found page rather than a wrong reading, but set the variable.

import { compatPairRoute } from './routes.js';

/**
 * The PRODUCTION origin, fixed. Two consumers, two different needs:
 *
 *   - `baseUrl()` falls back to it when NEXT_PUBLIC_BASE_URL is unset.
 *   - Text a reader SENDS to somebody else (the invite and card share strings,
 *     Prompt BP, in lib/site/copy.js) is built from it directly, NOT from
 *     `baseUrl()`. That text leaves the site, so its link must be the production
 *     site on every deployment - a preview's origin in a friend's WhatsApp is a
 *     login wall - and it must be the bytes Reyner ruled, which name this origin.
 *     `katon.app` 308s to `www.katon.app` with the query kept (measured
 *     2026-10-12: `/?k=ajak` -> `https://www.katon.app/?k=ajak`), so `?k=` survives.
 */
export const SITE_ORIGIN = 'https://katon.app';

/** The site origin, with no trailing slash. */
export function baseUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || SITE_ORIGIN;
  return raw.replace(/\/+$/, '');
}

/** Absolute, externally-linkable URL of a reading. `search` is appended verbatim. */
export function readingUrl(token, search = '') {
  return `${baseUrl()}/r/${encodeURIComponent(token)}${search}`;
}

/**
 * Absolute, externally-linkable URL of a PAIR.
 *
 * A pair is not a reading and must never be handed `readingUrl`: `/r/<pairId>`
 * is a reading URL for an object that is not one, which is the confusion the
 * "person B is never a reading row" ruling exists to prevent. The path comes
 * from `lib/site/routes.js`, the one place `/kompatibilitas` is written down.
 */
export function pairUrl(id, search = '') {
  return `${baseUrl()}${compatPairRoute(encodeURIComponent(id))}${search}`;
}
