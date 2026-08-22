// ============================================================
// Stage 6 — the deterministic gate
// ============================================================
// Rule 17: nothing reaches a user without passing this. LLM output is guilty
// until validated.
//
// THIS GATE IS LOAD-BEARING, NOT BELT-AND-BRACES. The evidence is in the ledger:
// the banned "bukan X melainkan Y" construction has now escaped an explicit
// prompt ban THREE times (renderer-prompt-notes run 5, twice; PROGRESS
// gate-check run 2, in the penutup). No prompt edit has ever fixed it. A regex
// plus one regeneration is the only thing that has.
//
// NO LLM JUDGES AN LLM HERE. Every check is deterministic, which is what makes a
// pass reproducible and a failure explainable to Reyner in one line.
//
// ── SEVERITY IS AN ETHICS LINE, NOT A CONFIDENCE LINE ──────
//   hard  fact contradiction, forbidden content. Rule 25 and rule 14. An already
//         cached reading that fails one of these falls back IMMEDIATELY
//         (pipeline-spec Stage 7); it does not keep serving while queued.
//   soft  style, coverage, structure. Fail once -> regenerate with a stricter
//         directive. Fail twice -> module-assembled floor + flag for QA.
//   flag  does not fail the gate. Queues a human look.
// ============================================================

import { factGuard } from './fact.js';
import { coverageGuard } from './coverage.js';
import { openingGuard } from './opening.js';
import { bracketGuard, insertBrackets } from './brackets.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { structureGuard } from './structure.js';
import { renderedText, renderedProse } from './text.js';

/**
 * The gate's own version, stamped onto every row it passes.
 *
 * ── THE RULE, AND IT IS NOT ADVISORY ───────────────────────
 * **A change to what this gate ACCEPTS OR REJECTS bumps this constant IN THE SAME
 * COMMIT.** A new check, a deleted check, a threshold move, a blocklist entry
 * added or removed, a token ban replaced by a structural one. If a reading that
 * used to pass now fails, or the reverse, the number moves. There is no size
 * threshold below which it does not: deleting one blocklist pattern is exactly
 * the change this constant exists to record.
 *
 * WHY IT MATTERS, in one sentence: `persistRendered` writes `stage6Version` onto
 * every cached row on purpose - it is the version the reading ACTUALLY passed, not
 * the version installed today - so "which readings were validated under the old
 * rules" has to stay answerable, and a stale constant is the one thing that can
 * make it unanswerable.
 *
 * ── 1.9.0 WAS AMBIGUOUS FOR ONE DAY. THIS IS THAT FIX ──────
 * On 2026-08-17/18, `style.adverbial` was DELETED and `style.hedging`'s `mungkin`
 * was moved out of the blocklist into `hedgeAboutReader()` - a change that stops
 * rejecting readings that used to fail, which is the textbook case for a bump. The
 * constant stayed at 1.9.0, so two materially different gates both stamped
 * `1.9.0` and every row and artifact written under either is indistinguishable
 * from the other by its own label.
 *
 * The two probe artifacts caught in that window are reconciled in
 * `docs/PROGRESS.md` BY FILE MTIME, which is the only evidence that separates
 * them. Their headers are deliberately NOT re-stamped: they were produced by code
 * that self-reported 1.9.0, and editing an artifact's provenance after the fact is
 * the failure this repo keeps finding, not the fix for it.
 *
 * ── 1.11.0: THE OPENING MUST NAME THE ARCHETYPE ────────────
 * 2026-08-21. `opening.archetype_missing` (soft) is a NEW WAY TO FAIL, so the
 * constant moves. Reyner ruled on 2026-08-19 that a reading opening on the element
 * or on an Aspek is unsellable at Rp 19.000; two of four charts in that read failed
 * on exactly that sentence. The obligation is engine-side - `must_cover` gains
 * 'archetype' in lib/semantic/index.js - and lib/validate/opening.js checks it.
 *
 * `brackets.*` shipped in the SAME commit and did NOT move the accept boundary,
 * which is why one bump covered both: every bracket finding was `severity: 'flag'`,
 * and `failing` below excludes flags, so no reading's verdict could differ because
 * of it. It was a reporter.
 *
 * ── 1.12.0 IS SPENT AND WAS NEVER SHIPPED. DO NOT REUSE IT. ─
 * It identifies the gate that ENFORCED rule 23 by rejecting the model - built as
 * ruled on 2026-08-21, then measured: floor rate 0/4 -> 2/4. Under the STRICT
 * precondition 3 ruled the same day a floored chart FAILS, so it was refused and
 * never merged. The branch `feat/rule23-enforced` is kept undeleted, and
 * `docs/qa/2026-08-21-renders-rule23-enforced.md` on it is a real artifact that
 * self-reports `1.12.0` four times. That is exactly the provenance this constant
 * exists to preserve, so the number is burned rather than recycled: a version that
 * names two different gates is the defect the 1.9.0 note above describes.
 *
 * ── 1.13.0: RULE 23 IS APPLIED BY THE PIPELINE ─────────────
 * 2026-08-21. `insertBrackets` runs before every check and puts `(English)` on the
 * first prose mention of each bound term, so the gate now validates - and caches -
 * text that already complies. `brackets.unbracketed` and `brackets.mismatch` stay
 * `flag` and mean "the insertion is broken", never "the model forgot"; a new
 * `brackets.inserted` flag carries each insertion with its surrounding context,
 * because whether a correct insertion READS well is the one thing no assertion can
 * judge.
 *
 * The constant moves because the text being validated is no longer the text the
 * model returned. Rule 14 the right way round: the LLM chooses words, the engine
 * owns names, and putting one engine string after another is formatting.
 *
 * ── 1.14.0: VERDICT WORDS ARE READ AS VERDICTS ─────────────
 * 2026-08-21. Two false positives removed, both reproduced from paid prose, so readings
 * that used to be rejected now pass and the constant moves.
 *
 * `yang kuat` is an ADJECTIVE. The one `fact.strength_same_breath` in the 77-attempt
 * trace fired on "Aspek Pelindung (Direct Resource) yang kuat", where the word modifies
 * the Aspek and claims no verdict - a token ban where the defect is a construction, the
 * same shape as the `mungkin` fix. `verdictUse` skips adjectival hits and SCANS ON, so
 * an early adjectival use cannot mask a bare label later in the block.
 *
 * AN ELEMENT IS NOT A SUBJECT. The verdict-claim pattern was
 * `\b(kamu|<element>)\s+<wrong>\b`, so on fresh-1996 - element Air, verdict strong -
 * "Unsur Air seimbang dengan Logam" read as claiming the verdict is Seimbang. Rules 9
 * and 10 say the bars are a display distribution and NEVER a strength score, so that
 * check was making the conflation the engine forbids. The subject list is reader words.
 *
 * NOT CHANGED, and recorded as a limit: the second pass still fires on any wrong verdict
 * word inside the block that CITES the strength fact, whatever the subject. No false
 * positive has been observed against it, and widening a check on a hypothesis is what
 * this repo keeps paying for.
 */
export const STAGE6_VERSION = '1.17.0';

/**
 * Run the gate.
 *
 * @param {Object} rendered parsed blocks[] contract
 * @param {Object} semanticJson Stage 3 output. The FULL object, never the
 *   scrubbed provider view: the gate checks against what is TRUE, and the
 *   internal_only fields are part of that.
 * @param {Object} [options]
 * @param {string} [options.provider='gemini'] tightens the style thresholds
 * @returns {{
 *   ok: boolean, hard: boolean, findings: Array, normalized: Object,
 *   stage6_version: string,
 * }} `hard` is true when any hard finding fired - the caller uses it to decide
 *   between "regenerate" and "fall back immediately".
 */
export function validateRendering(rendered, semanticJson, { provider = 'gemini' } = {}) {
  // Every UNFITTED threshold's observed value, recorded whether it passed or
  // failed. The harness fits the thresholds from these, and it cannot do that
  // from rejections alone: a set of failures cannot distinguish "nothing came
  // near the line" from "half the corpus sits one stem above it".
  const metrics = {
    same_breath: [], coverage: [], block_chars: [], breaks_per_block: [], total_chars: [],
    // Rule 23 bracket verdicts, one per scoped term actually mentioned - recorded
    // whether it passed or failed, because the fitting harness needs both. Since
    // 1.13.0 the pipeline INSERTS the bracket, so a non-bracketed verdict here means
    // insertBrackets is broken. See lib/validate/brackets.js.
    brackets: [],
    // How many brackets the pipeline had to insert. A COUNT, not a rejection - the
    // same treatment paragraph_inserts gets below, and for the same reason: a silent
    // deterministic fix must not look like a failure and must not be invisible.
    bracket_inserts: 0,
    // Brackets the model got WRONG and the pipeline corrected. Louder than an
    // insertion: the model was given the value and paraphrased it anyway.
    bracket_normalised: 0,
    // A COUNT, not a rejection. Deterministic reformatting is a silent fix, so it
    // must not look like a failure - but it must not be invisible either, or the
    // gate would be quietly rewriting every reading with nothing to show for it.
    // The harness reports it beside the rejection table (Reyner, 2026-08-06).
    paragraph_inserts: 0,
  };

  // Structure first: it normalises, and every later check should read the text
  // that will actually be stored rather than the raw one.
  const { findings: structural, normalized: structured } = structureGuard(rendered, metrics);

  // RULE 23 IS APPLIED, NOT ASKED FOR. Deterministic insertion of (English) on the
  // first prose mention of each bound term, before anything is judged - so the text
  // the gate checks is the text that gets cached and served (it is spread into the
  // result as `...gate.normalized`). Asking the model to remember it cost 2 of 4
  // charts their reading when it was a gate; see lib/validate/brackets.js.
  const { rendered: normalized, inserts, normalised: fixed } = insertBrackets(structured, semanticJson);
  metrics.bracket_inserts = inserts.length;
  metrics.bracket_normalised = fixed.length;
  const text = renderedText(normalized);

  const findings = [
    ...factGuard(normalized, semanticJson, text, metrics),
    ...forbiddenGuard(text),
    ...coverageGuard(normalized, semanticJson, metrics),
    ...openingGuard(normalized, semanticJson),
    // PROSE ONLY, never headings - see renderedProse. A bare label in a heading is
    // not a first mention, and treating it as one rejects the floor on every chart.
    ...bracketGuard(semanticJson, renderedProse(normalized), metrics, inserts, fixed),
    ...styleGuard(normalized, text, provider),
    ...structural,
  ];

  const hard = findings.some((f) => f.severity === 'hard');
  const failing = findings.filter((f) => f.severity !== 'flag');

  return {
    ok: failing.length === 0,
    hard,
    findings,
    metrics,
    normalized,
    stage6_version: STAGE6_VERSION,
  };
}

// MOVED to ./directive.js on 2026-08-22, and re-exported so no call site changes.
// The docblock that stood here went with it, minus two claims that had gone stale:
// "the ONE regeneration" (the budget is 3) and "the prompt is the cacheable prefix
// and the thing prompt_version identifies" (prompt_version now covers the
// directive too, which is the whole point of the move).
// The directive is appended to MASTER_PROMPT, so from the model's side it IS
// prompt text - and it had no version stamp at all. Reyner ruled it part of
// `PROMPT_VERSION`, which means `lib/render/prompt.js` has to read its template;
// leaving the constant in this file would have made prompt.js import the whole
// validator and close an import cycle. See that file's header for what is stamped
// and what still is not.
export { stricterDirective, DIRECTIVE_TEMPLATE } from './directive.js';

export { FACT_PARAMS } from './fact.js';
export { COVERAGE_PARAMS } from './coverage.js';
export { STYLE_PARAMS, CATEGORIES } from './style.js';
export { STRUCTURE_PARAMS } from './structure.js';
