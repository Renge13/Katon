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
import { bracketReport } from './brackets.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { structureGuard } from './structure.js';
import { renderedText } from './text.js';

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
 * `brackets.*` ships in the SAME commit and does NOT move the accept boundary,
 * which is why one bump covers both: every bracket finding is `severity: 'flag'`,
 * and `failing` below excludes flags, so no reading's verdict can differ because
 * of it. It is a reporter whose enforcement is a later commit with its own bump.
 */
export const STAGE6_VERSION = '1.11.0';

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
    // Rule 23 bracket verdicts, one per scoped term actually mentioned. Reported,
    // never rejected - see lib/validate/brackets.js.
    brackets: [],
    // A COUNT, not a rejection. Deterministic reformatting is a silent fix, so it
    // must not look like a failure - but it must not be invisible either, or the
    // gate would be quietly rewriting every reading with nothing to show for it.
    // The harness reports it beside the rejection table (Reyner, 2026-08-06).
    paragraph_inserts: 0,
  };

  // Structure first: it normalises, and every later check should read the text
  // that will actually be stored rather than the raw one.
  const { findings: structural, normalized } = structureGuard(rendered, metrics);
  const text = renderedText(normalized);

  const findings = [
    ...factGuard(normalized, semanticJson, text, metrics),
    ...forbiddenGuard(text),
    ...coverageGuard(normalized, semanticJson, metrics),
    ...openingGuard(normalized, semanticJson),
    ...bracketReport(semanticJson, text, metrics),
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

/**
 * The stricter directive appended to the master prompt on the ONE regeneration.
 *
 * Names the specific failures rather than repeating the whole rulebook. The
 * rulebook is already in the prompt and was already ignored; what has not been
 * tried is telling the model which sentence of its own output was wrong.
 *
 * Appended AFTER the master prompt, never merged into it - the prompt is the
 * cacheable prefix and the thing prompt_version identifies.
 *
 * @param {Array} findings from a failed pass
 * @returns {string}
 */
export function stricterDirective(findings) {
  const lines = [
    '',
    '## REGENERATION - YOUR PREVIOUS OUTPUT WAS REJECTED',
    '',
    'A deterministic validator rejected your last attempt for the reasons below.',
    'Fix exactly these. Do not rewrite the parts that were not named.',
    '',
  ];
  for (const f of findings.filter((x) => x.severity !== 'flag')) {
    lines.push(`- [${f.check}] ${f.message}`);
  }
  lines.push('');
  lines.push('Re-read the rule each item cites before you write. Return the same JSON shape.');
  return lines.join('\n');
}

export { FACT_PARAMS } from './fact.js';
export { COVERAGE_PARAMS } from './coverage.js';
export { STYLE_PARAMS, CATEGORIES } from './style.js';
export { STRUCTURE_PARAMS } from './structure.js';
