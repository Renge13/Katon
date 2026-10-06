// ============================================================
// lib/site/analyticsUrl.js — what a page view may tell Vercel Web Analytics
// ============================================================
// Prompt BG §2.4 (2026-10-06). Vercel Web Analytics records the URL of every page
// view. Two of Katon's URLs are BEARER LINKS: `/r/<token>` opens a reading, whose
// header carries the birth date, and `/kompatibilitas/<id>` opens a pair reading. A
// token in a third-party dashboard is a reading anyone with dashboard access can open,
// and rule 19 says no enumerable reading URLs. So the id is replaced by the route's
// own placeholder before the event leaves the browser, and the query string is dropped
// (`?bayar=selesai`, `?jam=tambah` carry nothing a page count needs, and Hobby has no
// UTM reporting).
//
// Pure, so tests/page-analytics.spec.mjs can pin it without a browser.
// ============================================================

/** Dynamic routes, by their first segment, and the placeholder that replaces the id. */
const DYNAMIC = [
  { prefix: '/r/', placeholder: '/r/[token]' },
  { prefix: '/kompatibilitas/', placeholder: '/kompatibilitas/[id]' },
];

/**
 * The URL a page view is reported with: same origin, no query, no hash, and no id.
 *
 * @param {string} url absolute URL of the page view
 * @returns {string}
 */
export function analyticsUrl(url) {
  let u;
  try { u = new URL(url); } catch { return url; }
  let path = u.pathname;
  for (const { prefix, placeholder } of DYNAMIC) {
    if (path.startsWith(prefix) && path.length > prefix.length) { path = placeholder; break; }
  }
  return `${u.origin}${path}`;
}
