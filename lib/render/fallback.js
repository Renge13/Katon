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
// ── IT AUTHORS NOTHING, AND SINCE 2026-08-21 THAT NEEDS ONE FOOTNOTE ──
// Every Indonesian word here comes from glossary.json, which Reyner reviewed on
// 2026-08-01 (and kekuatan on 08-02). This file contributes punctuation and
// ordering and no vocabulary. That is not a stylistic preference: CLAUDE.md makes
// Reyner the sole authority on Indonesian register, so a connective invented here
// would be unreviewed user-facing copy shipped under an engine commit.
//
// THE FOOTNOTE: the identity clause below uses TWO connective words that are in no
// glossary entry - `RENDER_COPY.floorIdentity`, marked PROPOSED, NOT RULED. They are
// there because the floor's opening was two bare noun-phrases with no verb
// ("Matahari (The Sun)." "Api (Fire).") and Reyner ruled that shape unsellable, and
// joining them into a clause is not something punctuation alone can do. The words
// live in the audited bank `scripts/check-copy.js` walks rather than inline here,
// which is the difference between copy a reviewer can find and copy nobody re-reads.
// The contract is unchanged in spirit: this file still invents nothing. It borrows,
// and it says where from.
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

// Imported from the GATE rather than re-implemented, so the floor counts sentences
// the way the check that judges it counts them. A private copy of the splitter here
// would be a second source of truth for "what is a sentence", and the two drifting
// is precisely how a floor stops passing its own gate. lib/validate/text.js imports
// nothing, so this introduces no cycle.
import { sentences } from '../validate/text.js';
// The floor's one connective lives in the audited copy bank, not inline. See the
// identity clause in blockFor and RENDER_COPY.floorIdentity's own note.
import { RENDER_COPY } from './copy.js';
import { STRUCTURE_PARAMS } from '../validate/structure.js';

const SENTENCE_LIMIT = STRUCTURE_PARAMS.maxSentencesUnbroken;
const CHAR_LIMIT = STRUCTURE_PARAMS.maxCharsUnbroken;

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
  // Index in `parts` where the "what it means FOR YOU" half starts. The block is
  // broken here, and only here, when it would otherwise be a wall - see the join
  // at the end of this function.
  let giftAt = null;

  // The palace, first, when the fact sits in one.
  //
  // Added 2026-08-02 because Stage 6 caught the floor failing its own contract:
  // `must_cover` demands `palace` on five of chart 1's nine required points and
  // the assembly never said one, so the always-available floor could not pass
  // the gate every other output has to pass. Rule 17 calls this the floor
  // beneath both providers; a floor that fails validation is not one.
  //
  // Still authors nothing - the palace name is a glossary string like the rest.
  // Placing it first also happens to be the prompt's own beat order, provenance
  // before the name.
  //
  // A BRANCH RELATION HAS NO `palace`, AND SAID NOTHING AT ALL UNTIL 2026-08-12.
  // Its span lives in `provenance.positions_id` because a relation sits in two or
  // more places, so the line above skipped it and every floor relation block said
  // WHAT the relation is and never WHERE it sits. Found while measuring the
  // relation_positions fix (round 4): the gate had been blind to it because the
  // check skips a block that names no position, so four rounds of that bug never
  // surfaced here.
  //
  // Same shape and same argument as the 2026-08-02 fix above, one line, and it
  // authors nothing either - `positions_id` is pre-verbalised by palacePhrase()
  // from the same Reyner-reviewed palace names. NOT a gate failure; a quality gap
  // on the path that serves a reader when the provider fails.
  if (fact.palace) parts.push(sentence(fact.palace));
  else if (fact.provenance?.positions_id) parts.push(sentence(fact.provenance.positions_id));

  // ── THE ARCHETYPE COMES BEFORE THE ELEMENT ──────────────
  // Reyner's ruling 2026-08-19 (docs/qa/2026-08-19-READ-VERDICT.md section 2):
  // "It establishes identity before taxonomy. `Kamu adalah Kayu (Wood)` reads
  // like a spreadsheet header." Two of four charts in that read were ruled
  // UNSELLABLE at Rp 19.000 and both failed on this one sentence.
  //
  // THE FLOOR WAS WRITING EXACTLY THE REJECTED SENTENCE. Its opening was the
  // element label - "Api (Fire)." - because only `fact.label` was emitted, and a
  // day-master fact's label IS the element. The floor is not a probe artifact: a
  // soft finding on it KEEPS SERVING by the 2026-08-11 ruling (issue #23), so
  // this is the first sentence a real reader gets whenever a provider fails.
  //
  // ── ONE CLAUSE, NOT TWO LABEL-SENTENCES ─────────────────
  // CORRECTED 2026-08-21. Ordering the archetype first was necessary and was not
  // sufficient. The floor then opened:
  //
  //     "Matahari (The Sun)."  "Api (Fire)."
  //
  // Two bare noun-phrases, no verb - a data dump with the right words in the right
  // order. **Reyner ruled that shape UNSELLABLE as-is**, and it is exactly why
  // `opening.archetype_missing` is recorded in PROGRESS as too weak: the NAME is
  // present, so the check passes, and no check in the repo can see that nothing is
  // being said.
  //
  // THE CONTRACT IS NOT BROKEN, IT IS NAMED. This file authors nothing, and joining
  // two labels needs a CONNECTIVE, which is new user-facing Indonesian and therefore
  // Reyner's alone (rule 20). So the two connective strings live in
  // `RENDER_COPY.floorIdentity` - the audited bank `scripts/check-copy.js` walks -
  // and are marked PROPOSED, NOT RULED there. This file still contributes only
  // ordering and punctuation; the words it now uses are ones a reviewer can find.
  //
  // THE ELEMENT LOSES ITS BRACKET, and that is the same edit rather than a second
  // one. Rule 23's ruled scope binds Aspek, Bintang and Arketipe and explicitly NOT
  // Elemen - Reyner: "Pilar and Elemen should remain unbracketed to avoid visual
  // clutter" - and the floor had been bracketing it. Every other fact keeps its
  // `label_bracket` below, because Aspek and Bintang ARE bound.
  if (fact.archetype?.name_id) {
    const image = fact.archetype.name_en
      ? `${fact.archetype.name_id} (${fact.archetype.name_en})`
      : fact.archetype.name_id;
    const { lead, join } = RENDER_COPY.floorIdentity;
    parts.push(sentence(fact.label
      ? `${lead} ${image} ${join} ${fact.label}`
      : `${lead} ${image}`));
  }

  // A badge is something the person HAS, so it is named. A `label: null` fact is
  // a CONDITION (a missing element is not something you carry) and naming it is
  // the exact failure the prompt calls out. Preserved, never substituted.
  //
  // SKIPPED for a fact that carries an archetype: its label is the ELEMENT and the
  // identity clause above already said it. Emitting both is how the floor came to
  // open with two label-sentences in the first place.
  if (fact.label && !fact.archetype?.name_id) {
    parts.push(fact.label_bracket
      // Rule 23: Indonesian name first, English term in brackets once.
      ? sentence(`${fact.label} (${fact.label_bracket})`)
      : sentence(fact.label));
  }

  for (const field of ['label_meaning', 'gift', 'cost', 'actionable']) {
    if (!fact[field]) continue;
    if (field === 'gift') giftAt = parts.length;
    parts.push(sentence(fact[field]));
  }

  // ── THE FLOOR PARAGRAPHS ITSELF WHEN IT WOULD BE A WALL ──
  // Reyner's rule (2026-08-05) makes a block of more than 8 sentences, or over 1100
  // characters, a defect. Concatenating four or five glossary strings crosses 8 on
  // 3 of the 77 fixture floor blocks (chart 1 twice, at 11 and 10 sentences, and
  // chart 7 at 10), so without this the always-available floor fails the gate every
  // other output has to pass - the same way it failed on palaces until the fix at
  // the top of this function. Rule 17 calls this the floor beneath both providers;
  // a floor that fails validation is not one.
  //
  // The seam is the gift boundary, which is where the block turns from what the name
  // MEANS to what it means FOR THIS PERSON. That is the prompt's own beat order, so
  // the break lands where a writer would put it.
  //
  // CONDITIONAL on purpose. Breaking every block would rewrite all 77 rather than
  // the 3 that are defective, and this file's contract is that it contributes
  // punctuation and ordering only - the narrowest change that satisfies the rule is
  // the one that keeps that promise honest.
  const flat = parts.join(' ');
  const needsBreak = giftAt !== null
    && (sentences(flat).length > SENTENCE_LIMIT || flat.length > CHAR_LIMIT);
  if (!needsBreak) return flat;

  return `${parts.slice(0, giftAt).join(' ')}\n\n${parts.slice(giftAt).join(' ')}`;
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
