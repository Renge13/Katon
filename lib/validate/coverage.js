// ============================================================
// Stage 6 — COVERAGE, never structural conformance
// ============================================================
// The carried principle, from renderer-prompt-notes run 1: a fixed output shape
// became a template, and THE TEMPLATE BEAT THE INSTRUCTION. The renderer was
// told to choose its own arrangement and obeyed the schema instead.
//
// So this file checks that the content ARRIVED and never that it arrived in a
// particular shape or order. renderer-prompt says it out loud to the model, and
// the gate has to keep that promise: "The validator downstream checks content
// coverage, never structure. You will never be penalised for an unusual order.
// You will be rejected for a missing fact or an invented one."
// ============================================================

import { stemOverlap } from './text.js';

export const COVERAGE_PARAMS = {
  /**
   * Share of an engine string's distinctive stems that must survive into the
   * block. UNFITTED - see lib/validate/text.js for why a verbatim check is wrong
   * and why this is a proxy. The harness reports the distribution.
   *
   * Lower than instinct suggests. A good rewrite legitimately drops most of the
   * original wording; what it cannot do is drop the whole idea.
   */
  fieldOverlap: 0.2,
  fieldMinHits: 2,
};

/** Fields a required point can demand, and how each is verified. */
// 'archetype' is an OBJECT ({name_id, name_en}) and its rule is POSITIONAL, so
// stem overlap is the wrong instrument twice over. opening.js owns it, and this
// file's contract - content arrived, never in what order - stays true.
const EXACT_FIELDS = new Set(['palace', 'archetype']); // fact.js / opening.js own these

const finding = (check, severity, message, where) => ({ check, severity, message, where });

/**
 * @param {Object} rendered
 * @param {Object} semantic
 * @returns {Array} findings. Missing coverage is 'soft' - it is a regeneration,
 *   not an ethics failure, and the same prose with one more clause usually fixes
 *   it. Slot-filling is 'flag': it does not fail the gate, it queues QA.
 */
export function coverageGuard(rendered, semantic, metrics) {
  const out = [];
  const blocks = rendered.blocks || [];
  const cited = new Set(blocks.flatMap((b) => b.fact_ids || []));
  const factsById = new Map((semantic.facts || []).map((f) => [f.id, f]));

  for (const point of semantic.required_points || []) {
    const fact = factsById.get(point.fact_id);
    if (!fact) continue;

    if (!cited.has(point.fact_id)) {
      out.push(finding('coverage.missing_point', 'soft',
        `required point ${point.fact_id} (importance ${point.importance}) is in no block`,
        [point.fact_id]));
      continue;
    }

    const text = blocks
      .filter((b) => (b.fact_ids || []).includes(point.fact_id))
      .map((b) => `${b.heading} ${b.text}`)
      .join(' ');

    for (const field of point.must_cover || []) {
      if (EXACT_FIELDS.has(field)) continue;
      const source = fact[field];
      if (!source) continue;

      const overlap = stemOverlap(source, text);
      // Recorded pass or fail. fieldOverlap is UNFITTED and the harness fits it
      // from the distribution, which needs the passing values too.
      metrics?.coverage.push({
        fact_id: point.fact_id, field, ratio: overlap.ratio,
        hits: overlap.hits, total: overlap.total,
      });
      if (overlap.ratio < COVERAGE_PARAMS.fieldOverlap
          && overlap.hits < COVERAGE_PARAMS.fieldMinHits) {
        // `cost` gets its own check name. Gift-without-cost is the ethics
        // failure mode: rule 25's "never rank a state as good or bad" has teeth
        // only if the costs survive, and a reading that keeps every gift and
        // drops every cost is a horoscope.
        const check = field === 'cost' ? 'coverage.cost_dropped' : 'coverage.field_dropped';
        out.push(finding(check, 'soft',
          `${point.fact_id}: "${field}" did not survive into the prose `
          + `(${overlap.hits}/${overlap.total} stems)`, [point.fact_id]));
      }
    }
  }

  return out;
}
