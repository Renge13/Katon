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
import { forbiddenGuard, styleGuard } from './style.js';
import { structureGuard } from './structure.js';
import { renderedText } from './text.js';

/**
 * The gate's own version, stamped onto every row it passes.
 *
 * Bump it when what PASSES changes - a new check, a threshold move, a blocklist
 * entry that starts rejecting readings that used to be fine. A cached reading
 * records the gate that let it through, so "which readings were validated under
 * the old rules" stays an answerable question after a tightening.
 */
export const STAGE6_VERSION = '1.6.0';

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
