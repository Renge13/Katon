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
    // Collapse 3+ newlines to exactly 2, then judge the result.
    const text = String(block.text ?? '').replace(/\n{3,}/g, '\n\n').trim();
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
    if (shape.breakCount === 0) {
      const sentenceCount = sentences(text).length;
      const tooMany = sentenceCount > STRUCTURE_PARAMS.maxSentencesUnbroken;
      const tooLong = text.length > STRUCTURE_PARAMS.maxCharsUnbroken;
      if (tooMany || tooLong) {
        out.push(finding('structure.unparagraphed',
          `${sentenceCount} sentences / ${text.length} characters in one unbroken `
          + `paragraph (limit ${STRUCTURE_PARAMS.maxSentencesUnbroken} sentences, `
          + `${STRUCTURE_PARAMS.maxCharsUnbroken} characters); split it with a blank line`,
          block.fact_ids));
      }
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
