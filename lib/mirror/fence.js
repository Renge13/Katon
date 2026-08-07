// ============================================================
// The mirror preview fence
// ============================================================
// Prompt J task 5, built on the STAGE6_VERSION pattern: a fence is a MISSING
// CAPABILITY, not a switch. `MIRROR_PREVIEW_TOKEN` unset means the route has no
// way to admit anyone, so it 404s — there is no code path that serves a mirror
// reading without a matching token, and no value of any other env var opens one.
//
// ── WHY 404 AND NOT 401 ────────────────────────────────────
// Rule 19's named risk is content harvesting. A 401 confirms the route exists
// and is worth coming back to; a 404 says nothing. Absent token, wrong token and
// unknown reading all return the SAME 404 body for the same reason.
//
// ── WHY A HEADER AND NOT A QUERY PARAM ─────────────────────
// A token in the URL lands in access logs, in `Referer` on any outbound link,
// and in whatever Reyner pastes into a chat window. A header does none of that.
// QA is a curl:
//
//   curl -H "x-mirror-preview-token: $MIRROR_PREVIEW_TOKEN" \
//        https://katon.app/api/mirror/<token>
//
// ── PURE ENV-PRESENCE LOGIC ────────────────────────────────
// No `server-only`, no network, no secret VALUES leave this module — same shape
// as lib/paymentFence.js, and unit-testable for the same reason.
// ============================================================

import { createHash, timingSafeEqual } from 'node:crypto';

/** The header QA sends the preview token in. */
export const PREVIEW_HEADER = 'x-mirror-preview-token';

/**
 * @returns {string|null} refusal reason, or null when the route may admit a
 *   correctly-tokened request. Mirrors paymentFenceReason()/serveFenceReason().
 */
export function previewFenceReason() {
  if (!process.env.MIRROR_PREVIEW_TOKEN) return 'mirror_preview_token_unset';
  return null;
}

/**
 * Is this request carrying the preview token?
 *
 * Compared over sha256 digests rather than the raw strings so the comparison is
 * both constant-time AND fixed-length: timingSafeEqual throws on a length
 * mismatch, and pre-checking the length would leak it.
 *
 * @param {Request} request
 * @returns {boolean} false whenever the fence is closed, for any reason.
 */
export function previewTokenAccepted(request) {
  const expected = process.env.MIRROR_PREVIEW_TOKEN;
  if (!expected) return false;

  const offered = request?.headers?.get?.(PREVIEW_HEADER);
  if (typeof offered !== 'string' || offered.length === 0) return false;

  const digest = (value) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(offered), digest(expected));
}

/** Convenience for call sites that only need "may this request proceed". */
export function previewAllowed(request) {
  return previewFenceReason() === null && previewTokenAccepted(request);
}
