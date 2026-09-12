// ============================================================
// The compat opening is the ENGINE's sentence, not the model's
// ============================================================
// Rule 14, applied to the one block of a compat reading that is fixed copy:
// `kompatibilitas.p0_opening` is a template Reyner ruled, filled with two
// archetype names the engine already owns (lib/semantic/pair.js). There is
// nothing in it for a model to choose, and a model asked to produce a fixed
// sentence produces a paraphrase of it.
//
// ── WHY THIS EXISTS, MEASURED RATHER THAN ASSUMED ──────────
// `docs/qa/2026-09-11-compat-three-pair-walk.md` (E2): the Y-1 round-1 reading
// opened "Bacaan ini menyoroti dinamika antara dua individu dengan arketipe
// Matahari dan Taman." The ruled sentence is "Ini adalah bacaan tentang dua
// individu: Matahari dan Taman". `pair.both_named` passed it - both names are
// present - which is the check doing exactly its job and the job not being the
// one that was needed. The ruling was about the SENTENCE, and the only check
// that can hold a ruled sentence is byte equality against the ruling.
//
// So the engine writes it and the gate then checks the engine's own text. That
// is not the gate marking its own homework: `checkBothNamed` is deliberately
// UNTOUCHED by this change, because the day someone edits the template into a
// sentence that names one person, the reading must still fail.
//
// ── THIS RUNS ON BOTH PATHS ────────────────────────────────
// Model and module-assembly floor. The floor already opened with this cell (it
// assembles every required point, and p0_opening is the first one), so on the
// floor this is a normalisation rather than a repair - and it is applied there
// anyway, because "the floor happens to order its blocks the way we need" is a
// property of `required_points` ordering that nothing asserts. After this, the
// opening is a property of the render layer on every path out of it.
//
// The text is composed by the FLOOR'S OWN `blockFor`, not by a second formatter
// here. One composer, so the floor's first block is byte-identical before and
// after this change - verified in tests/compat-p0-engine.spec.mjs rather than
// reasoned about, because "it only appends a full stop" is exactly the kind of
// detail that is true until a cell ends in a colon.
// ============================================================

import { blockFor } from './fallback.js';

/** The fact id the ruled opening arrives under. One spelling, in one place. */
export const OPENING_FACT_ID = 'p0_opening';

/**
 * The engine's opening block for a pair reading, or null when there isn't one.
 *
 * Null for `kind: "mirror"` before anything else is read, so the mirror pipeline
 * cannot be touched by this file. The mirror opens on the archetype and has its
 * own guard (lib/validate/opening.js); it has no ruled opening cell and must not
 * acquire one by accident.
 */
export function engineOpening(semanticJson) {
  if (semanticJson?.kind !== 'pair') return null;
  const fact = (semanticJson.facts || []).find((f) => f.id === OPENING_FACT_ID);
  if (!fact) return null;
  const text = blockFor(fact);
  if (text === '') return null;
  // `heading` is '' because `p0_opening` carries no `name_id` - the glossary
  // reserves that for badges, and an opening is not one. The floor has always
  // shipped this block heading-less; matching it is the point.
  return { fact_ids: [OPENING_FACT_ID], heading: fact.label || '', text };
}

/**
 * Put the engine's opening at the front of a rendering, and take out the model's.
 *
 * @returns {{ rendered: Object, hadOwnOpening: boolean }} `hadOwnOpening` is true
 *   when the input already claimed `p0_opening`. On the model path the caller
 *   records that as `p0_model_wrote_anyway`; on the floor path it is always true
 *   and means nothing, which is why this flag is named for what it observed
 *   rather than for what the model did.
 */
export function withEngineOpening(rendered, semanticJson) {
  const opening = engineOpening(semanticJson);
  if (!opening) return { rendered, hadOwnOpening: false };

  let hadOwnOpening = false;
  const blocks = [];
  for (const block of rendered?.blocks || []) {
    const ids = block.fact_ids || [];
    const kept = ids.filter((id) => id !== OPENING_FACT_ID);
    if (kept.length === ids.length) {
      blocks.push(block);
      continue;
    }
    hadOwnOpening = true;
    // A BLOCK THAT WAS ONLY THE OPENING IS DISCARDED. That is the ruled stop
    // condition: the engine's P0 stands and the model's is dropped.
    if (kept.length === 0) continue;
    // A BRAIDED BLOCK IS KEPT, MINUS THE CLAIM. The model put the opening in the
    // same block as P1; dropping it would drop P1 with it, and a reading missing
    // its first real fact is a worse outcome than one whose second block opens a
    // beat late. Recorded as a limit, not defended as a design: the counter is
    // what says how often this happens, and if it is ever common the answer is a
    // prompt that stops the braid, not a cleverer splitter here.
    blocks.push({ ...block, fact_ids: kept });
  }

  return { rendered: { ...rendered, blocks: [opening, ...blocks] }, hadOwnOpening };
}
