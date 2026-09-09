// ============================================================
// lib/site/nav.js — which nav link is the current one
// ============================================================
// Pure, and in `lib/` rather than inside `components/SiteHeader.jsx`, for one
// practical reason: the component imports `next/link` and `next/navigation`,
// which the plain `node --test` runner cannot resolve, so a rule living in the
// component can only ever be tested by grepping its source. That is the weakest
// kind of check - it asserts the code LOOKS right. Here it is called.

/** The two products, in the order Home lists them. Labels come from CHROME_COPY. */
export const NAV_HREFS = { mirror: '/', compat: '/kompatibilitas' };

/**
 * Is `href` the nav entry for the route at `pathname`?
 *
 * ── THE TRAILING SLASH IS THE WHOLE RULE. DO NOT "SIMPLIFY" IT. ──
 * `pathname.startsWith(href)` is the obvious form and it is wrong twice over.
 * For `href = '/'` it is true of EVERY path on the site, so both links mark
 * themselves on every page - a nav that lies about where you are, wearing the
 * costume of a styling glitch. And for `/kompatibilitas` it would also match a
 * future `/kompatibilitas-lain`.
 *
 * Comparing against `${href}/` fixes both at once: `'/kompatibilitas'` becomes
 * `'//'` for the root, which no real path starts with, and it forces a segment
 * boundary everywhere else. That is why there is no special case for `/` here -
 * one was written, and removing it changed no result, so it was a branch that
 * looked like the protection while the string concatenation did the work.
 *
 * The prefix half is deliberate rather than incidental: `/kompatibilitas/<id>`
 * is the paid report, a route a reader can sit on for a long time, and it should
 * still say which product she is inside.
 */
export function isCurrent(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
