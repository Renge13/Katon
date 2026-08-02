// ============================================================
// The Stage 6 fence
// ============================================================
// CLAUDE.md rule 17: "Nothing reaches a user without passing Stage-6
// post-validation. LLM output is guilty until validated."
//
// The fence was never a switch - it was a MISSING CAPABILITY. Prompt G left
// STAGE6_VERSION null because no gate existed, and no env var could open it,
// because a switch is a thing someone can flip by accident and an absent
// capability is not.
//
// PROMPT H BUILT THE GATE (2026-08-02). This module no longer defines the
// version; it re-exports the real one from lib/validate, which is the code that
// does the validating. That is the point of doing it this way: the fence opens
// if and only if the gate exists, there is one definition of "which gate", and a
// cached row's stage6_version therefore always names code that actually ran.
//
// Rows written while the fence was closed carry a null stage6_version and stay
// unservable forever - lib/render/cache.js discriminates on the column, not on a
// status this commit would have overwritten.
//
// WHAT IS STILL CLOSED: there is no serving ROUTE. Neither G nor H asked for
// one and none is added here. The gate existing means a validated reading may
// now be STORED as servable; the user-facing surface is separate work.
// ============================================================

import { STAGE6_VERSION as GATE_VERSION } from '../validate/index.js';

/**
 * The Stage 6 gate's version. Written onto every cached row the gate passes, so
 * that after a tightening "which readings were validated under the old rules"
 * stays an answerable question.
 */
export const STAGE6_VERSION = GATE_VERSION;

/**
 * @returns {string|null} refusal reason, or null when a validated reading may be
 *   served. Mirrors paymentFenceReason()'s shape so the two fences read alike.
 */
export function serveFenceReason() {
  if (!STAGE6_VERSION) return 'stage6_gate_absent';
  return null;
}

/** Convenience for call sites that only need the boolean. */
export function serveAllowed() {
  return serveFenceReason() === null;
}
