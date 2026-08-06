// ============================================================
// Stage 6 — STRUCTURE + LENGTH
// ============================================================
// renderer-prompt-notes §UI CONTRACT assigns the normalisation to Stage 6:
// "collapse 3+ newlines to 2, reject a lone \n, reject more than two breaks in
// one block".
//
// NORMALISE FIRST, THEN JUDGE, and return the normalised text so what gets
// cached is what got checked. A gate that validates one string and stores a
// different one has validated nothing.
// ============================================================

import { inspectParagraphs } from '../render/paragraphs.js';
import { sentences } from './text.js';

export const STRUCTURE_PARAMS = {
  /** renderer-prompt: "never more than two breaks in one block". */
  maxBreaksPerBlock: 2,

  /**
   * Length budget, in characters of rendered prose.
   *
   * UNFITTED AND DELIBERATELY GENEROUS. pipeline-spec asks for a "token/section
   * budget" and no document anywhere states a number, so this is a runaway
   * guard rather than an editorial target: it exists to catch a model that
   * ignored "let importance set the length" entirely, not to trim a long
   * reading. The harness reports the observed distribution, which is what a real
   * budget should be set from.
   *
   * For scale: the module-assembled floor on fixture chart 1 is ~4.5k
   * characters, and it is the terse version.
   */
  maxTotalChars: 12_000,

  /** A block with nothing in it is a defect the shape check cannot see. */
  minBlockChars: 40,

  /**
   * The wall-of-text rule, RULED BY REYNER 2026-08-05. A block must contain a
   * paragraph break once it exceeds this many SENTENCES.
   *
   * `maxBreaksPerBlock` above is the ceiling; this is the floor. Between them a
   * long block gets two or three paragraphs, which is what the UI contract wants.
   *
   * ── WHY SENTENCES AND NOT CHARACTERS ───────────────────────
   * The first version of this check used a 700-character floor, and characters
   * turned out to be the wrong unit twice over. It was set from the 32 gate-PASSED
   * samples of the 2026-08-02 pairs file (block length med 415 / p90 570 / max
   * 954), where 700 sat above p90. The first full run WITH the check measured the
   * real population as much longer - med 493, p90 748, max 1390 over 1310 blocks -
   * so 700 landed BELOW p90 and rejected 25.8% of gate evaluations, taking the
   * shipped rate from ~54-62% down to 43.8%. Fitting on passes alone is exactly as
   * biased as fitting on rejections alone.
   *
   * More importantly a character count cannot tell a WALL from a dense paragraph.
   * What makes the judging-set failure unreadable is 17 consecutive sentences, not
   * 954 characters; five long sentences at the same width read fine. Sentences
   * measure the thing the reader actually experiences.
   *
   * NOTE ON SCOPE, so nobody mistakes it for an oversight: the ruling is
   * BLOCK-level and one break satisfies it, so a 20-sentence block with a single
   * break passes. `maxBreaksPerBlock` caps a block at three paragraphs, so the
   * pathological case is 27 sentences in three paragraphs of nine - far outside the
   * observed range (block max 1390 chars). If that ever appears, it is a new ruling
   * for Reyner, not a bug to fix here.
   */
  maxSentencesUnbroken: 8,

  /**
   * Backstop to the sentence rule, same ruling: any block longer than this breaks
   * regardless of sentence count.
   *
   * It exists because sentence count alone can be gamed by length - eight
   * sentences of 200 characters each is a wall that the rule above would pass. Set
   * above the observed maximum (1390) is deliberately NOT the goal here; 1100 sits
   * just under it, so the single longest block in the measured population is caught
   * while the median block (493) has four times the headroom it needs.
   */
  maxCharsUnbroken: 1100,

  /**
   * Sentences shorter than this are exempt from the duplicate check.
   *
   * A long sentence repeated verbatim is always a defect. A short one can recur
   * legitimately, and the ledger's own history (33 of 133 rejections were the
   * gate, 2026-08-02) is the argument for preferring a pattern that misses over
   * one that rejects real readings. The observed duplicate was 45 characters.
   */
  minDuplicateSentenceChars: 30,
};

const finding = (check, message, where) => ({ check, severity: 'soft', message, where });

/** Does this block exceed either limb of Reyner's paragraph rule? */
function overLong(text) {
  return sentences(text).length > STRUCTURE_PARAMS.maxSentencesUnbroken
    || text.length > STRUCTURE_PARAMS.maxCharsUnbroken;
}

/**
 * Insert ONE paragraph break into an over-long block, at the sentence boundary
 * nearest its midpoint. Formatting only. Never words.
 *
 * ── WHY THE GATE REFORMATS INSTEAD OF REJECTING ────────────
 * APPROVED BY REYNER 2026-08-06, and the measurement is why it was asked for.
 * `structure.unparagraphed` was rejecting 30% of gate evaluations, then 73.9%
 * after renderer-prompt.txt was edited to demand the break explicitly. That edit
 * was reverted, because the diagnosis killed the whole instructional approach:
 *
 *   THE RENDERER NEVER EMITS A PARAGRAPH BREAK. Zero of 31 blocks measured off
 *   parsed provider output, including a 13-sentence 1112-character block carrying
 *   three facts, which even the pre-edit prompt explicitly permitted to break.
 *
 * The model does not produce that character in this JSON field, so no wording
 * makes the rule satisfiable by asking. A deterministic insert makes it satisfiable
 * by construction, and this file already normalises before it judges (it collapses
 * 3+ newlines), so reformatting is a thing it was always allowed to do.
 *
 * ── THE RULE-20 BOUNDARY, MECHANICALLY ─────────────────────
 * Exactly one whitespace RUN between two sentences is replaced by "\n\n". Nothing
 * else is touched, so every non-whitespace character survives byte for byte and no
 * Indonesian is authored. That is what keeps this inside "the gate may insert
 * paragraph breaks, never words" rather than merely claiming to be.
 *
 * Splitting is done by INDEX into the original string rather than by re-joining
 * sentences(): re-joining would normalise interior spacing and could silently
 * rewrite the very characters this promises not to touch.
 *
 * @returns {string} the block, broken if it needed it and could be broken
 */
function paragraphise(text, metrics) {
  if (text.includes('\n\n') || !overLong(text)) return text;

  // Every sentence boundary, as {index, length} of the whitespace run after a
  // terminator. The lookbehind is zero-width, so index is the whitespace itself.
  const boundaries = [];
  const re = /(?<=[.!?])(\s+)/g;
  let match = re.exec(text);
  while (match !== null) {
    boundaries.push({ index: match.index, length: match[1].length });
    match = re.exec(text);
  }
  // No boundary means one enormous sentence. Nothing to split; the check below
  // reports it as the genuine wall it is.
  if (boundaries.length === 0) return text;

  const mid = text.length / 2;
  let best = boundaries[0];
  for (const b of boundaries) {
    if (Math.abs(b.index - mid) < Math.abs(best.index - mid)) best = b;
  }

  if (metrics) metrics.paragraph_inserts = (metrics.paragraph_inserts || 0) + 1;
  return `${text.slice(0, best.index)}\n\n${text.slice(best.index + best.length)}`;
}

/**
 * @param {Object} rendered
 * @returns {{ findings: Array, normalized: Object }} the normalised copy is what
 *   the caller must go on to cache.
 */
export function structureGuard(rendered, metrics) {
  const out = [];
  const blocks = [];
  let total = 0;

  for (const block of rendered.blocks || []) {
    // Collapse 3+ newlines to exactly 2, THEN reformat, THEN judge the result.
    const collapsed = String(block.text ?? '').replace(/\n{3,}/g, '\n\n').trim();
    const text = paragraphise(collapsed, metrics);
    const shape = inspectParagraphs(text);

    if (shape.strayNewlines > 0) {
      out.push(finding('structure.stray_newline',
        `${shape.strayNewlines} lone newline(s); only \\n\\n is a valid break`,
        block.fact_ids));
    }
    if (shape.breakCount > STRUCTURE_PARAMS.maxBreaksPerBlock) {
      out.push(finding('structure.too_many_breaks',
        `${shape.breakCount} paragraph breaks in one block, max is `
        + `${STRUCTURE_PARAMS.maxBreaksPerBlock}`, block.fact_ids));
    }
    if (text.length < STRUCTURE_PARAMS.minBlockChars) {
      out.push(finding('structure.block_too_short',
        `a block of ${text.length} characters carries no reading`, block.fact_ids));
    }
    // The wall of text. OBSERVED in the 2026-08-02 blind-judging samples, which
    // were POST-gate: a 954-character block of 17 unbroken sentences passed. The
    // gate had a ceiling on breaks and no floor, so "zero breaks" was legal at
    // any length.
    //
    // Reyner's rule, 2026-08-05: break once past 8 sentences, with a 1100-character
    // backstop so eight very long sentences cannot pass as a paragraph.
    //
    // paragraphise() above has already inserted the break, so this only fires on a
    // block that could NOT be broken - one with no sentence boundary to split at.
    // That is a genuine wall and there is nothing formatting can do about it.
    if (shape.breakCount === 0 && overLong(text)) {
      out.push(finding('structure.unparagraphed',
        `${sentences(text).length} sentences / ${text.length} characters in one `
        + 'paragraph with no sentence boundary to break at; shorten it', block.fact_ids));
    }

    total += text.length;
    metrics?.block_chars.push(text.length);
    metrics?.breaks_per_block.push(shape.breakCount);
    blocks.push({ ...block, text });
  }

  const penutup = String(rendered.penutup ?? '').replace(/\n{3,}/g, '\n\n').trim();
  total += penutup.length;

  metrics?.total_chars.push(total);

  if (total > STRUCTURE_PARAMS.maxTotalChars) {
    out.push(finding('structure.length',
      `${total} characters, over the ${STRUCTURE_PARAMS.maxTotalChars} budget`, null));
  }

  out.push(...duplicateSentences(blocks, penutup));

  return { findings: out, normalized: { ...rendered, blocks, penutup } };
}

/**
 * The same sentence twice in one reading.
 *
 * OBSERVED in the 2026-08-02 blind-judging samples, which were POST-gate: chart 3
 * said "Baganmu berdiri di titik tengah yang stabil." twice, two sentences apart,
 * inside a single block. Nothing in the gate looked for repetition.
 *
 * Scoped to the WHOLE reading, not to one block. The braided-block structure means
 * two blocks can cash out related facts, and the failure this catches is the
 * renderer restating a sentence rather than advancing - which reads worse across
 * blocks than within one, not better.
 *
 * Comparison is on a normalised form (case, whitespace, terminal punctuation) so
 * "..stabil." and "Stabil" do not escape by punctuation alone. It is EXACT beyond
 * that, deliberately: a near-duplicate detector needs a similarity threshold, and
 * an unfitted threshold on a check nobody has measured is how false positives get
 * shipped.
 */
function duplicateSentences(blocks, penutup) {
  const strings = [...blocks.map((b) => b.text), penutup].filter(Boolean);
  const seen = new Map();

  for (const string of strings) {
    for (const raw of sentences(string)) {
      const key = raw.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim();
      if (key.length < STRUCTURE_PARAMS.minDuplicateSentenceChars) continue;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
  }

  const out = [];
  for (const [key, count] of seen) {
    if (count < 2) continue;
    out.push(finding('structure.duplicate_sentence',
      `"${key.slice(0, 70)}" appears ${count} times; say it once and move on`, null));
  }
  return out;
}
