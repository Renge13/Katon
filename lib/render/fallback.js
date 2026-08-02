// ============================================================
// Stage 5 — the module-assembled fallback (rule 17's floor)
// ============================================================
// The always-available zero-LLM path. Both providers down, or no keys in dev,
// and the product still returns an accurate reading.
//
// ── WHAT IT ASSEMBLES FROM ─────────────────────────────────
// G task 4 says "content/glossary.json four-field facts (label / label_meaning /
// gift_seed / cost_seed) ordered by the Stage 3 hierarchy. Same data the renderer
// gets, concatenated instead of woven."
//
// It reads those fields off `semanticJson.facts` rather than re-reading
// glossary.json, because that IS the same data: lib/semantic/glossary.js
// contentFrom() already resolved each fact's glossary entry into exactly those
// four fields, in hierarchy order, with the collapses applied. A second read
// path would be a second chance to drift from the renderer's input, and the one
// property this floor must have is that it says the same things.
//
// Note the G text says the SUPERSEDED "~78 blocks" wording in pipeline-spec is
// wrong; that is confirmed, the module set is the glossary.
//
// ── IT AUTHORS NOTHING ─────────────────────────────────────
// Every Indonesian word here comes from glossary.json, which Reyner reviewed on
// 2026-08-01 (and kekuatan on 08-02). This file contributes punctuation and
// ordering and no vocabulary. That is not a stylistic preference: CLAUDE.md makes
// Reyner the sole authority on Indonesian register, so a connective invented here
// would be unreviewed user-facing copy shipped under an engine commit.
//
// Two consequences are deliberate and are REPORTED rather than papered over:
//   - `penutup` comes back EMPTY. The prompt asks the renderer for a confident
//     closing verdict; no glossary entry contains one, so assembling it would
//     mean authoring it.
//   - `hour_known: false` is not stated in prose. renderer-prompt.txt wants it
//     said once, plainly; that sentence exists in no entry either. It is carried
//     on the result as structured data so the UI or Prompt H can surface it.
//
// ── RULE 21 IS STRUCTURAL HERE ─────────────────────────────
// "lemah"/"kuat" may never render bare; the explanation lands in the same breath
// (glossary kekuatan._note). The assembly puts `label_meaning` immediately after
// the label inside ONE text field, so the resolution cannot be separated from the
// label by a layout decision. This is also why the label is repeated in the text
// when it is already the heading: a heading is a separate visual element, and a
// reading that relies on one for its resolution has a bare label.
// ============================================================

/** Curly quotes and dashes rule 20 bans from user-facing strings. */
const BANNED_TYPOGRAPHY = /[—–‘’“”…]/;

/** Ends a fragment with a full stop unless it already carries terminal punctuation. */
function sentence(text) {
  const trimmed = String(text).trim();
  if (trimmed === '') return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * One fact -> one block of plain text.
 *
 * Order is fixed and follows the prompt's own beats: the name, what the name
 * means, then what it means for this person, gift before cost (golden rule 3).
 * `actionable` closes when the fact carries one.
 */
function blockFor(fact) {
  const parts = [];

  // A badge is something the person HAS, so it is named. A `label: null` fact is
  // a CONDITION (a missing element is not something you carry) and naming it is
  // the exact failure the prompt calls out. Preserved, never substituted.
  if (fact.label) {
    parts.push(fact.label_bracket
      // Rule 23: Indonesian name first, English term in brackets once.
      ? sentence(`${fact.label} (${fact.label_bracket})`)
      : sentence(fact.label));
  }

  for (const field of ['label_meaning', 'gift', 'cost', 'actionable']) {
    if (fact[field]) parts.push(sentence(fact[field]));
  }

  return parts.join(' ');
}

/**
 * Assemble a reading with no LLM.
 *
 * Covers exactly `required_points` — Stage 3's coverage contract, already in
 * descending importance. Facts below the coverage floor are cut on purpose: the
 * floor is a reading, and firing every fact in the inventory would produce the
 * "tour of the chart" the prompt spends a whole section forbidding.
 *
 * @param {Object} semanticJson Stage 3 output
 * @returns {{
 *   blocks: Array<{fact_ids: string[], heading: string, text: string}>,
 *   penutup: string,
 *   source: 'module_assembly',
 *   notes: { hour_known: boolean, quiet_chart: boolean, penutup_unavailable: true },
 * }}
 */
export function assembleFallback(semanticJson) {
  const byId = new Map((semanticJson.facts || []).map((f) => [f.id, f]));

  const blocks = [];
  for (const point of semanticJson.required_points || []) {
    const fact = byId.get(point.fact_id);
    // Stage 3 guarantees this join (tests/stage3-contract.spec.mjs asserts every
    // required point has a backing fact). Skipping rather than throwing keeps the
    // floor standing even if that guarantee is ever broken upstream - a floor
    // that can crash is not a floor.
    if (!fact) continue;

    const text = blockFor(fact);
    if (text === '') continue;

    if (BANNED_TYPOGRAPHY.test(text)) {
      // Not a runtime concern so much as a canary on glossary edits: these
      // strings bypass Stage 6 entirely, so this is the only place a stray
      // em-dash in engine content would ever be caught.
      throw new Error(`fallback: banned typography in glossary content for "${fact.id}"`);
    }

    blocks.push({ fact_ids: [fact.id], heading: fact.label || '', text });
  }

  return {
    blocks,
    // Empty by design. See the header: no glossary entry holds a closing verdict.
    penutup: '',
    source: 'module_assembly',
    notes: {
      hour_known: semanticJson.hour_known === true,
      quiet_chart: semanticJson.quiet_chart === true,
      penutup_unavailable: true,
    },
  };
}
