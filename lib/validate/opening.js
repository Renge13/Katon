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
// ── IT WAS SOFT. IT IS A FLAG NOW, AND THAT REVERSES A GATE COWORK RECOMMENDED. ──
// Ruled by Reyner 2026-08-22, on the n=10 measurement. The reasoning that made it soft
// was: "a missing archetype is one clause short, which is exactly what a regeneration
// fixes." That was wrong in the only way that matters - it assumed the regeneration
// would fix it, and the data says it does not.
//
// MEASURED, docs/qa/2026-08-22-renders-n10-postfix.md, gate 1.14.0:
//   `opening.archetype_missing` fired 20 times inside floored runs - the LEADING cause
//   of floors. It appears in 13 of the 14 floored runs, and at ATTEMPT 1 in 9 of them.
//
// AND THE GATE DEFEATED ITS OWN PURPOSE. This check exists so the reader meets her
// archetype in sentence one. A floored reader is served module assembly - and while the
// floor does name the archetype by construction, the check's own effect was to convert
// readings that named it imperfectly into readings the MODEL never wrote at all. It was
// spending the entire regeneration budget on the opening and then handing over a
// different document.
//
// THE CHASE IS VISIBLE IN THE SEQUENCES, not inferred. Five of the fourteen floored runs
// show a bracket finding at attempt N followed by this check at attempt N+1, and the
// pattern `O -> B -> O` occurs four times: the model fixes the opening, breaks a
// bracket, then breaks the opening again. Two checks trading one sentence between them,
// with the budget paying for the exchange.
//
// SO THE OBLIGATION STAYS AND THE REJECTION GOES. The prompt still requires the
// archetype in the opening, `must_cover` still carries 'archetype' so the requirement is
// still engine-owned (rule 14), and the floor still names it by construction. What
// changes is that failing to do so is now COUNTED rather than punished, and the rate is
// reported per run by the harness. `opening.element_fused` beside it has been a flag
// from the start for the same reason, so the two now read consistently.
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
    const fact = factsById.get(point.fact_id);
    const name = fact?.archetype?.name_id;
    if (!name) continue;
    if (!opening.includes(name)) {
      out.push({
        check: 'opening.archetype_missing',
        severity: 'flag',
        message: `the reading's first sentence does not name the archetype "${name}" `
          + `(${point.fact_id}); it opens: "${opening.slice(0, 120)}"`,
        where: [point.fact_id],
      });
      continue; // the element-fused case below only makes sense once the name is there
    }

    // ── THE FUSED OPENING. A FLAG, AND DELIBERATELY ONLY A FLAG. ──
    // `Kamu adalah Api Matahari` puts the ELEMENT in front of the image, which is the
    // shape Reyner rejected on chart 13 as identity behind taxonomy. The ruled sentence
    // is archetype ALONE, element in the next breath:
    //
    //     Kamu adalah Api Matahari yang Lemah.        <- this
    //     Kamu adalah Matahari (The Sun) yang Lemah.  <- ruled, 2026-08-21
    //
    // IT IS NOT CLOSED AND IT DOES NOT GET A GATE YET, ruled 2026-08-21. Two reasons,
    // and the second is the load-bearing one:
    //
    //   1. Rule 23's bracket insertion was mistaken for a fix. It is a FORMATTING rule
    //      applied after the fact; this is a POSITIONAL one about what the sentence
    //      says first. Inserting `(The Sun)` into a fused opening produces
    //      `Kamu adalah Api Matahari (The Sun).` - compliant and still fused. The two
    //      were conflated because rejecting-for-brackets happened to catch both.
    //   2. A rejecting gate here is the same shape as the one that measured 0/4 -> 2/4
    //      floors and was refused, and it would be measured with the SAME n=1
    //      instrument that returned 0/4, 2/4 and 1/4 on identical code. Flagging it
    //      first is what lets the n-renders harness say how often the fusion actually
    //      happens, before anyone trades a floor rate for it.
    //
    // So this counts, and cannot reject. `failing` in lib/validate/index.js excludes
    // flags, so no reading's verdict can differ because of it - which is also why this
    // commit does not move STAGE6_VERSION.
    const element = fact.label;
    if (element && new RegExp(`${element}\\s+${name}`).test(opening)) {
      out.push({
        check: 'opening.element_fused',
        severity: 'flag',
        message: `the opening fuses the element into the image - "${element} ${name}" `
          + 'where the ruled pattern is the archetype alone, element in the next breath. '
          + `It opens: "${opening.slice(0, 120)}"`,
        where: [point.fact_id],
      });
    }
  }
  return out;
}
