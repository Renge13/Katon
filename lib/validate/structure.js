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
};

const finding = (check, message, where) => ({ check, severity: 'soft', message, where });

/**
 * @param {Object} rendered
 * @returns {{ findings: Array, normalized: Object }} the normalised copy is what
 *   the caller must go on to cache.
 */
export function structureGuard(rendered) {
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

    total += text.length;
    blocks.push({ ...block, text });
  }

  const penutup = String(rendered.penutup ?? '').replace(/\n{3,}/g, '\n\n').trim();
  total += penutup.length;

  if (total > STRUCTURE_PARAMS.maxTotalChars) {
    out.push(finding('structure.length',
      `${total} characters, over the ${STRUCTURE_PARAMS.maxTotalChars} budget`, null));
  }

  return { findings: out, normalized: { ...rendered, blocks, penutup } };
}
