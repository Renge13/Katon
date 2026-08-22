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
// ── THE LEAK IN THE LOOP, CLOSED 2026-08-22 ────────────────
// `fact.condition_named`'s message quoted the very string the check forbids, and
// this function passed messages through verbatim, so the retry instruction for a
// chart that named its condition CONTAINED the condition's English label. The
// gate rejected the model for writing that label and the next prompt handed it
// straight back, inside an instruction to stop writing it.
//
// Measured before fixing, on the 08-22 budget-3 tape: 48 of 56 firings were pass
// (a), the literal reaching the page, and every one of those produced a directive
// carrying its own literal. Pass (b) leaked it a second way, inside the quoted
// construction it reports.
//
// WHAT IT DOES NOT EXPLAIN, checked rather than assumed (PROGRESS, 08-22): in 0
// of the 15 steps where the check appeared NEW did the preceding directive carry
// any condition label. So this is not the cause of the introductions, and fixing
// it should not be expected to move that rate. It is the RECURRENCE path, and a
// retry instruction that quotes the banned string is wrong whether or not the
// wrongness is measurable.
//
// RULED BY REYNER: fix the loop, not the versioning. The scrub lives here rather
// than at each message site because the unsafe set is a property of the CHART -
// every condition label is unsafe to echo, not only the one that happened to
// fire - so one pass over the assembled messages closes both passes at once, and
// closes any future check whose message quotes the model's offending text.
//
// THE TAPE IS NOT SCRUBBED, ON PURPOSE. `lib/render/index.js` records the RAW
// message in `stage6_detail`. Diagnosis needs the literal; the model must not be
// handed it. Those are two different consumers and only one of them is a prompt.
//
// ── WHAT IS STILL NOT STAMPED, STATED PLAINLY ──────────────
// The SCAFFOLDING is stamped. The individual finding MESSAGES are not: they are
// produced by code across lib/validate/*.js and interpolated into `{findings}` at
// runtime, so rewording one still changes the model's input without moving any
// version.
//
// THAT INCLUDES THIS FIX, AND IT IS THE HONEST COST OF IT. The scrub changes the
// model's input on every regeneration of a chart carrying a condition fact, and
// `PROMPT_VERSION` does not move, because what is hashed is DIRECTIVE_TEMPLATE
// and the template is untouched. A row rendered before this commit and a row
// rendered after it carry the same `prompt_version` and were given different
// instructions. That is a real hole in the attribution and this commit widens it.
//
// IT IS ACCEPTED RATHER THAN CLOSED, for the reason it was accepted before:
// stamping messages means hashing the message-producing code of every check
// across six modules (`grep -c "finding(\|check: '" lib/validate/*.js`, 08-22:
// fact 11, style 8, structure 6, coverage 3, brackets 2, opening 2), and no
// mechanism for that has been proposed or ruled.
// Reyner ruled explicitly against building one here - the leak is a live defect
// on the retry path and the stamp is bookkeeping, so the defect goes first rather
// than queueing behind it. THE CONSEQUENCE, so nobody has to rediscover it: for
// this change the COMMIT is the only version, and a floor-rate comparison across
// it must cite the commit and not `prompt_version`. Carried in docs/PROGRESS.md
// as a known limitation with this reasoning.
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
export function stricterDirective(findings, forbidden = []) {
  const items = findings
    .filter((f) => f.severity !== 'flag')
    .map((f) => `- [${f.check}] ${scrubForbidden(f.message, forbidden)}`)
    .join('\n');
  return DIRECTIVE_TEMPLATE.replace('{findings}', items);
}

/**
 * Every literal that must never appear in the model's input for this chart.
 *
 * A condition fact carries `label: null` because a missing or dominant element is
 * not something you HAVE, so there is no Indonesian name for the prose to cite -
 * which is exactly why its English `label_bracket` can only ever surface as a
 * name, and why `fact.condition_named` HARD-rejects it.
 *
 * Derived from the CHART, not from the findings: a chart's other condition label
 * is just as unsafe to echo as the one that fired, and taking the set from the
 * payload means a message quoting a literal the check did not name is scrubbed
 * too.
 *
 * @param {Object} semantic Stage 3 semantic JSON
 * @returns {string[]} literals to strip from any directive built for this chart
 */
export function forbiddenLiterals(semantic) {
  return (semantic?.facts || [])
    .filter((f) => f.label === null && f.label_bracket)
    .map((f) => f.label_bracket);
}

/** What is left where a forbidden literal was. */
const REDACTED = 'the English label you wrote';

/**
 * Strip forbidden literals from one finding message.
 *
 * TWO PASSES, AND THE PARENTHESISED ONE HAS TO GO FIRST. Pass (b) of
 * `checkConditionNamed` quotes the model's own construction, and replacing only
 * the literal inside the parens would leave a name still followed by a bracket -
 * which MATCHES that same check's name-with-bracket regex. The directive would
 * then demonstrate the rejected shape in the act of forbidding it, which is this
 * very defect one layer out. So a literal sitting alone inside parens takes the
 * parens with it: enough is left to point at the sentence, and what is left is no
 * longer an example of the failure.
 *
 * Plain `split`/`join` rather than a built regex: these are engine-authored
 * strings, and one containing a regex metacharacter would otherwise change what
 * gets matched.
 */
function scrubForbidden(message, forbidden) {
  let out = String(message);
  for (const literal of forbidden) {
    if (!literal) continue;
    out = out.split(` (${literal})`).join('');
    out = out.split(`(${literal})`).join(REDACTED);
    out = out.split(literal).join(REDACTED);
  }
  return out;
}
