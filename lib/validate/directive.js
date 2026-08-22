// ============================================================
// Stage 6 — THE REGENERATION DIRECTIVE, AND WHY IT IS PART OF THE PROMPT
// ============================================================
// `stricterDirective` is appended to MASTER_PROMPT on every regeneration, so from
// the model's side it IS prompt text. It had no version stamp of any kind: it
// moved neither `STAGE6_VERSION` (which is about what the gate ACCEPTS, and this
// accepts nothing) nor `PROMPT_VERSION` (which hashed only
// docs/content/renderer-prompt.txt). An edit here changed the model's input on
// every regenerated reading and left no trace on the row.
//
// That gap was surfaced by the 2026-08-22 budget-3 run, where the erosion ladder
// showed `stricterDirective` trading findings rather than converging, and the
// obvious next question - "did the directive's wording cause that" - had no
// version to ask it against.
//
// RULED BY REYNER, 2026-08-22: it needs one, and it is part of `PROMPT_VERSION`,
// because that is what it functionally is. So the fixed scaffolding lives here as
// a constant and `lib/render/prompt.js` hashes it alongside the prompt file.
//
// ── THIS MODULE IMPORTS NOTHING, ON PURPOSE ────────────────
// `lib/render/prompt.js` has to read the template, and `lib/render/index.js`
// already imports `lib/validate/index.js`. Putting the constant in
// `lib/validate/index.js` would make prompt.js import the whole validator and
// close a cycle. A leaf module with no imports cannot.
//
// ── WHAT IS STILL NOT STAMPED, STATED PLAINLY ──────────────
// The SCAFFOLDING is stamped. The individual finding MESSAGES are not: they are
// produced by code across lib/validate/*.js and interpolated into `{findings}` at
// runtime, so rewording one still changes the model's input without moving any
// version. That is a real residual gap and it is bigger than it looks - the
// `fact.condition_named` message quotes the very string it forbids ("Missing
// Metal" is a condition, not a badge, and must not be named), which is prompt
// content by any reading. Stamping it would mean hashing the message-producing
// code of every check, and no mechanism for that has been proposed or ruled.
// Recorded here so the next person does not mistake a stamped scaffold for a
// stamped directive.
// ============================================================

/**
 * The directive's fixed text. `{findings}` is the only substitution.
 *
 * KEEP THIS A PLAIN CONSTANT. A template assembled from smaller pieces at call
 * time would hash to something that depends on the call, which is the one thing a
 * version stamp cannot tolerate.
 */
export const DIRECTIVE_TEMPLATE = [
  '',
  '## REGENERATION - YOUR PREVIOUS OUTPUT WAS REJECTED',
  '',
  'A deterministic validator rejected your last attempt for the reasons below.',
  'Fix exactly these. Do not rewrite the parts that were not named.',
  '',
  '{findings}',
  '',
  'Re-read the rule each item cites before you write. Return the same JSON shape.',
].join('\n');

/**
 * Build the regeneration directive for a set of Stage 6 findings.
 *
 * Names the specific failures rather than repeating the whole rulebook. The
 * rulebook is already in the prompt and was already ignored; what had not been
 * tried is telling the model which sentence of its own output was wrong.
 *
 * Appended AFTER the master prompt, never merged into it: the prompt is the
 * cacheable prefix, and a directive spliced into it would change the prefix on
 * every regeneration.
 *
 * Flags are excluded for the same reason they cannot reject: a finding that does
 * not fail the reading is not something to spend a regeneration on.
 *
 * @param {Array} findings Stage 6 findings from the rejected attempt
 * @returns {string} text appended to MASTER_PROMPT for the next call
 */
export function stricterDirective(findings) {
  const items = findings
    .filter((f) => f.severity !== 'flag')
    .map((f) => `- [${f.check}] ${f.message}`)
    .join('\n');
  return DIRECTIVE_TEMPLATE.replace('{findings}', items);
}
