// ============================================================
// The UI contract — paragraph breaks
// ============================================================
// renderer-prompt-notes.md §UI CONTRACT, implemented as G task 5.
//
// A block's `text` may carry EXACTLY TWO newlines as a paragraph separator. If
// that text is dropped into a single element, HTML collapses the whitespace and
// the break is SILENTLY LOST: a braided block becomes one run-on wall that still
// reads, so the failure never announces itself. That is why this is a contract
// and not a styling preference.
//
//   splitParagraphs(text) -> render each part as its own <p>
//
// DO NOT reach for `white-space: pre-wrap` instead. It would also preserve the
// stray single newlines the validator is meant to REJECT, converting a defect
// the gate would have caught into a visible artefact the gate now cannot see.
//
// Pure and DOM-free on purpose: Prompt H's validator needs the same reading of
// the same text as the UI, and two implementations of "where do the paragraphs
// fall" would eventually disagree.
// ============================================================

/**
 * Split a block's text into paragraphs.
 *
 * Tolerant on purpose: 3+ newlines collapse to one break rather than producing
 * an empty paragraph, matching the normalisation renderer-prompt-notes assigns
 * to Stage 6. Tolerance here is for RENDERING only - see inspectParagraphs for
 * the strict view, which is the one a gate should read.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function splitParagraphs(text) {
  if (typeof text !== 'string') return [];
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

/**
 * The strict view, for Prompt H. Reports, never repairs.
 *
 * `strayNewlines` counts lone `\n` characters, which the prompt calls never
 * valid: the reader-facing app splits on the double break, so a single newline
 * survives into the paragraph text and renders as a space at best.
 *
 * @param {string} text
 * @returns {{ paragraphs: string[], breakCount: number, strayNewlines: number }}
 */
export function inspectParagraphs(text) {
  const source = typeof text === 'string' ? text : '';
  return {
    paragraphs: splitParagraphs(source),
    breakCount: (source.match(/\n{2,}/g) || []).length,
    // A newline with no newline on either side of it.
    strayNewlines: (source.match(/(?<!\n)\n(?!\n)/g) || []).length,
  };
}
