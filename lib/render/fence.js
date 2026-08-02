// ============================================================
// The Stage 6 fence — nothing rendered reaches a user until Prompt H
// ============================================================
// CLAUDE.md rule 17: "Nothing reaches a user without passing Stage-6
// post-validation. LLM output is guilty until validated." G repeats it as a
// constraint: "Nothing renders to a real user until Prompt H's gate exists. Keep
// it fenced."
//
// The fence is a MISSING CAPABILITY, not a switch. There is no env var and no
// dev override, because a switch is a thing someone can flip by accident and a
// capability that does not exist is not. STAGE6_VERSION stays null until Prompt
// H implements the gate and sets it; every serve path reads it through
// serveFenceReason() and refuses while it is null.
//
// This is also the value written into render_cache.stage6_version, so the fence
// and the row-level discriminator can never disagree: whatever H sets here is
// what appears on the rows it validates, and everything written before then
// carries null and stays unservable forever.
//
// WHAT IS NOT FENCED: rendering itself, the cache, and the module-assembled
// floor. They are callable from scripts and tests today. Only SERVING is closed.
// ============================================================

/**
 * The Stage 6 gate's version, or null when no gate exists.
 *
 * PROMPT H SETS THIS. Until then it is null and no reading can be served.
 * Version it rather than making it a boolean: a Stage 6 change that alters what
 * passes needs to be attributable on the rows it let through, the same way
 * prompt_version is.
 */
export const STAGE6_VERSION = null;

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
