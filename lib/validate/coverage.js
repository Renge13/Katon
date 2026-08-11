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
const EXACT_FIELDS = new Set(['palace']); // fact.js owns palace; skipped here

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

  out.push(...slotFillingFlag(rendered, semantic));
  return out;
}

/**
 * Schema-order slot-filling detection, as Prompt H specifies it: block order
 * exactly matches JSON input order AND importance is non-monotonic in that
 * order.
 *
 * ── THIS CHECK IS INERT BY CONSTRUCTION, AND THAT IS REPORTED, NOT HIDDEN ──
 * Stage 3 emits facts[] already sorted by descending importance, so "matches
 * JSON order" and "importance is monotonic" are the same statement, and the
 * second condition can never hold when the first does. The check therefore
 * cannot fire against today's Stage 3.
 *
 * It is implemented exactly as specced rather than reinterpreted, because the
 * alternative - flagging any reading whose order matches the ranking - would
 * penalise the behaviour renderer-prompt explicitly asks for ("Lead with the
 * highest-importance fact"). H was written before Stage 3 shipped; the mismatch
 * is real and belongs in a report, not in a quietly redefined check.
 *
 * The harness counts how often it fires. Zero is the expected number.
 *
 * ── THE OPENING IS SKIPPED (2026-08-11, Prompt K) ──────────
 * Stage 3 now lifts the identity spine to the front of facts[], so facts[] is no
 * longer monotonic and the two conditions stopped being mutually exclusive. Left
 * alone, this check fired on EVERY well-formed reading: following the engine's
 * mandated opening is the behaviour K exists to produce, and reading it as
 * slot-filling inverts the check. Measured before the fix - the floor reading on
 * chart 1 raised coverage.slot_filling.
 *
 * So the leading spine run is dropped before the test. This is not a redefinition
 * and not a loosening: obeying an order the engine COMMANDED was never evidence
 * that the model walked the array instead of composing, which is the only thing
 * this check was ever looking for. Past the opening, importance still descends,
 * so the check is inert by construction exactly as before - zero is still the
 * expected number, and the test above still proves it.
 */
function slotFillingFlag(rendered, semantic) {
  const facts = semantic.facts || [];
  // The engine's mandated opening: the leading run of spine facts. Derived from
  // the payload rather than counted, so a spine that grows or shrinks does not
  // leave a stale 3 buried in the gate.
  let opening = 0;
  while (opening < facts.length && facts[opening].hierarchy?.role === 'spine') opening += 1;

  const factOrder = facts.map((f) => f.id);
  const leadIds = (rendered.blocks || [])
    .map((b) => (b.fact_ids || [])[0])
    .filter(Boolean)
    .filter((id) => factOrder.indexOf(id) >= opening);
  if (leadIds.length < 2) return [];

  const inJsonOrder = leadIds.every((id, i) => {
    if (i === 0) return true;
    return factOrder.indexOf(id) > factOrder.indexOf(leadIds[i - 1]);
  });
  if (!inJsonOrder) return [];

  const importances = leadIds.map(
    (id) => (semantic.facts || []).find((f) => f.id === id)?.importance ?? 0,
  );
  const monotonic = importances.every((v, i) => i === 0 || v <= importances[i - 1]);
  if (monotonic) return [];

  return [finding('coverage.slot_filling', 'flag',
    'block order follows the JSON array while importance does not descend', null)];
}
