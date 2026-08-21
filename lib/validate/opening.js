// ============================================================
// Stage 6 — THE OPENING NAMES THE ARCHETYPE
// ============================================================
// Reyner's ruling, 2026-08-19 (docs/qa/2026-08-19-READ-VERDICT.md section 2):
//
//   "The archetype image is the main draw of the product, and skipping it ruins
//    the initial impact. It establishes identity before taxonomy. `Kamu adalah
//    Kayu (Wood)` reads like a spreadsheet header, and fresh-1996 opening on an
//    Aspek completely buries the lead."
//
// Two of four charts in the 08-19 read were ruled UNSELLABLE at Rp 19.000 and
// both failed on the same sentence. Measured over the 77 stored attempt proses in
// docs/qa/2026-08-18-retry-depth.json, the archetype name appeared in the first
// 250 characters on 41 of 77 attempts and 16 of 39 PASSING attempts - so the gate
// was passing readings that open on taxonomy roughly three times in five.
//
// ── WHY THIS IS ITS OWN FILE AND NOT A LINE IN coverage.js ──
// coverage.js opens by declaring what it will never do: "this file checks that
// the content ARRIVED and never that it arrived in a particular shape or order."
// That is a promise the renderer prompt repeats to the model in so many words.
// This rule is POSITIONAL - the archetype must be in sentence one, not merely
// somewhere - so putting it in coverage.js would falsify that file's own contract
// and quietly break the promise the prompt makes.
//
// The repo has already paid for that mistake once in the other direction:
// fact.js's checkPalaces docblock records a CONTRACT BUG where "the prompt BANS in
// one section and ENCOURAGES in another", so the sentence the prompt asked for
// could not satisfy the check written for it. A positional rule hidden inside a
// file that swears it has no positional rules is the same defect with a different
// address.
//
// ── WHY THE ENGINE, NOT THE PROMPT ──
// Rule 14: the engine owns the fact AND its obligation; the LLM only chooses
// words. `core.archetype_name_id` was in the payload for every chart already, and
// it still went missing, because `core` is CONTEXT and obligation lives in
// `required_points`. The day-master point's `must_cover` listed label_meaning,
// gift and cost - and that fact's `label` is the ELEMENT ("Kayu"), never the
// archetype. So nothing obliged the renderer to name it and this gate had nothing
// to check. Where it survived, it survived because "Api Matahari" is idiomatic
// Indonesian and "Kayu Bambu" is not.
//
// The fix is therefore `must_cover` gaining 'archetype' (lib/semantic/index.js)
// plus this check. A line in renderer-prompt.txt is explicitly NOT the fix: the
// measurement above is over prose the current prompt already produced.
//
// SEVERITY IS SOFT, on purpose. A missing archetype is not a fact contradiction
// and not an ethics failure - it is one clause short, which is exactly what a
// regeneration fixes. fact.js hardcodes `severity: 'hard'` for contradictions, so
// this rule could not live there without misfiling what kind of failure it is.
// ============================================================

import { sentences } from './text.js';

/**
 * The reading's first sentence must name the archetype.
 *
 * @param {Object} rendered normalised blocks[] contract
 * @param {Object} semanticJson Stage 3 output, full (not the scrubbed view)
 * @returns {Array} findings
 */
export function openingGuard(rendered, semanticJson) {
  const out = [];
  const points = (semanticJson.required_points || [])
    .filter((p) => (p.must_cover || []).includes('archetype'));
  if (points.length === 0) return out;

  const factsById = new Map((semanticJson.facts || []).map((f) => [f.id, f]));
  const first = (rendered.blocks || [])[0];
  // The HEADING is deliberately not part of the haystack. "Bambu" as a section
  // title is not the reader meeting themselves in a sentence, and a heading would
  // let the rule pass on a label while the prose still opens on taxonomy.
  const opening = sentences(first?.text || '')[0] || '';

  for (const point of points) {
    const name = factsById.get(point.fact_id)?.archetype?.name_id;
    if (!name) continue;
    if (!opening.includes(name)) {
      out.push({
        check: 'opening.archetype_missing',
        severity: 'soft',
        message: `the reading's first sentence does not name the archetype "${name}" `
          + `(${point.fact_id}); it opens: "${opening.slice(0, 120)}"`,
        where: [point.fact_id],
      });
    }
  }
  return out;
}
