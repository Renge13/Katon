// ============================================================
// tests/helpers/pdfRows.mjs — glossary rows that break across a page
// ============================================================
// P2 round-1 markup R1 (2026-09-24): on the round-1 compat PDF the glossary term
// `Lemah` sat alone at the foot of p7 and its meaning began p8. The #126 widow and
// orphan test measured PROSE paragraphs and could not see a two-column table row,
// so it passed on exactly this document.
//
// Read off `textBoxes`, on the appendix pages only (from the page carrying
// `Istilah dalam Bacaanmu`). A body run left of `SPLIT_X` is a TERM, right of it a
// MEANING; the running footer (8pt) and the page title are ignored. Three ways a
// row can break, each reported with its page:
//
//   orphan-term        a page's LAST term has no meaning run on its line
//   continued-meaning  a page's FIRST body run is a meaning with no term on its line
//   stranded-heading   a page's LAST run is a group heading (its rows are overleaf)
// ============================================================

import { pageTexts, textBoxes } from '../../lib/pdf/inspect.js';

const SPLIT_X = 150; // between the term column (x ~64) and the meaning column (x ~214)
const BODY = 10;
const HEADING = 13.5;
const sameLine = (a, b) => Math.abs(a.y - b.y) < 1;

/**
 * @param {Buffer} buffer
 * @param {string} [appendixHeading]
 * @returns {Array<{page: number, kind: string, text: string}>}
 */
export function glossarySplits(buffer, appendixHeading = 'Istilah dalam Bacaanmu') {
  const texts = pageTexts(buffer);
  const start = texts.findIndex((t) => t.includes(appendixHeading));
  if (start < 0) throw new Error(`glossarySplits: no page carries "${appendixHeading}"`);
  const out = [];
  textBoxes(buffer).forEach((runs, i) => {
    if (i < start) return;
    const page = i + 1;
    const body = runs.filter((r) => r.size === BODY).sort((a, b) => a.y - b.y || a.x - b.x);
    const terms = body.filter((r) => r.x < SPLIT_X);
    const meanings = body.filter((r) => r.x >= SPLIT_X);
    const lastTerm = terms.at(-1);
    if (lastTerm && !meanings.some((m) => sameLine(m, lastTerm))) {
      out.push({ page, kind: 'orphan-term', text: lastTerm.text.trim() });
    }
    const first = body[0];
    if (i > start && first && first.x >= SPLIT_X && !terms.some((t) => sameLine(t, first))) {
      out.push({ page, kind: 'continued-meaning', text: first.text.trim().slice(0, 40) });
    }
    const content = runs.filter((r) => r.size > 8).sort((a, b) => a.y - b.y);
    const last = content.at(-1);
    if (last && last.size === HEADING) out.push({ page, kind: 'stranded-heading', text: last.text.trim() });
  });
  return out;
}
