// ============================================================
// tests/pdf-page-breaks.spec.mjs — no heading ends a page; the facts table's last row and the
// glossary's last group never stand alone
// ============================================================
// Run: npm run test:pdf-page-breaks
//
// Reyner, 2026-10-06 (on #199): "a heading never sits at the bottom of a page apart from its
// body: it moves to the next page with at least the first lines of its paragraph" and "the
// compat facts table's last row never sits alone on a page". Both editions.
//
// The cases are real, found by scripts/probe-page-breaks.mjs on the build before the fix:
//   - the 2c round's clash #1 compat reading (docs/qa/2026-10-04-bc-paragraphs-round/round.json,
//     the writer's own prose and chapter headings): "ALUR YANG MENGHIDUPKAN" ended page 2 and
//     its paragraph began page 3. The same prose as a Complete Edition is the mirror's case.
//   - the floor compat PDF for fixture charts 1 x 2: the facts table's last row (the P5
//     quadrant) alone on page 5 - the page Reyner saw in the #199 PDFs.
//   - amendment 1 (Reyner 2026-10-06): the glossary's last group never sits alone on a page.
//     The clash prose's Complete Edition put "Shio (tahun lahirmu)" and its one row alone on
//     page 8. The probe found the compat case: the floor PDF for fixture charts 12 x 6 put
//     "Shio" and its rows alone on page 7.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf, APPENDIX_HEADING } from '../lib/pdf/build.js';
import { factRows } from '../lib/pdf/pairDocument.js';
import { pageTexts } from '../lib/pdf/inspect.js';
import { RENDER_COPY } from '../lib/render/copy.js';
import { PASANGAN_COPY } from '../lib/site/copy.js';

const footerPart = (l) => RENDER_COPY.pdfFooter.includes(l);
const contentLines = (t) => t.split('\n').map((l) => l.trim()).filter((l) => l && !footerPart(l));

const CLASH = JSON.parse(readFileSync(new URL('../docs/qa/2026-10-04-bc-paragraphs-round/round.json', import.meta.url), 'utf8'))
  .records.find((r) => r.pair === 'clash' && r.render === 1);
const clashA = calculateBaziChart({ birthDate: '1973-05-10', birthTime: '00:00' });
const clashB = calculateBaziChart({ birthDate: '1971-08-07', birthTime: '13:00' });
const writerProse = { blocks: CLASH.reading.blocks, penutup: CLASH.reading.penutup, prompt_version: 'p', stage6_version: 'g' };

/** Every page whose last content line is one of `headings` (eyebrows print upper-cased). */
function stranded(texts, headings) {
  const hs = new Set(headings.flatMap((h) => [h, h.toUpperCase()]));
  return texts.flatMap((t, i) => {
    const last = contentLines(t).at(-1);
    return hs.has(last) ? [`page ${i + 1}: "${last}"`] : [];
  });
}

test('NO HEADING ENDS A PAGE: compat, the writer\'s prose (2c clash #1)', async () => {
  const pj = buildPairSemantic(clashA, clashB, { voice: 'v2', status: CLASH.status, nicknames: CLASH.nicknames });
  const { buffer } = await buildPairPdf({
    chartA: clashA, chartB: clashB, semanticJson: pj, rendered: { ...writerProse, chapter_headings: true },
    pair: { a: { date: '1973-05-10', gender: 'female' }, b: { date: '1971-08-07', gender: 'male' } },
  });
  const headings = CLASH.reading.blocks.map((b) => b.heading).filter(Boolean);
  assert.ok(headings.includes('Alur yang Menghidupkan'), 'precondition: the heading that stranded');
  assert.deepEqual(stranded(pageTexts(buffer), headings), [], 'a heading ends a page and its paragraph starts the next');
});

test('NO HEADING ENDS A PAGE: the Complete Edition, the same writer prose', async () => {
  const chart = clashA;
  const sj = buildSemanticJson(chart);
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: writerProse, gender: 'female' });
  const headings = CLASH.reading.blocks.map((b) => b.heading).filter(Boolean);
  assert.deepEqual(stranded(pageTexts(buffer), headings), [], 'a heading ends a page and its paragraph starts the next');
});

test('THE COMPAT FACTS TABLE\'S LAST ROW NEVER STANDS ALONE ON A PAGE (floor 1 x 2)', async () => {
  const chartA = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const chartB = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });
  const pj = buildPairSemantic(chartA, chartB);
  const { buffer } = await buildPairPdf({
    chartA, chartB, semanticJson: pj, rendered: { ...assembleFallback(pj), prompt_version: 'p', stage6_version: 'g' },
    pair: { a: { date: '1989-09-13', gender: 'female' }, b: { date: '1990-03-04', gender: 'male' } },
  });
  const texts = pageTexts(buffer);
  const terms = new Set(factRows(pj).map((r) => r.term).filter(Boolean));
  const start = texts.findIndex((t) => t.includes(PASANGAN_COPY.pdf_facts_heading));
  assert.ok(start > 0, 'precondition: the facts page');
  const perPage = [];
  for (let i = start; i < texts.length; i += 1) {
    // THE GLOSSARY IS NOT THE TABLE. It names the same terms, so counting on into it made
    // this pass on the defective build (its first draft did exactly that).
    if (i > start && texts[i].includes(APPENDIX_HEADING)) break;
    const n = contentLines(texts[i]).filter((l) => terms.has(l)).length;
    if (i > start && n === 0) break;
    perPage.push(n);
  }
  const last = perPage.at(-1);
  assert.ok(perPage.length === 1 || last >= 2,
    `the table's last page holds ${last} row(s); rows per page: ${JSON.stringify(perPage)}`);
});

/**
 * The glossary's pages: from its heading up to, not including, the closing page (which
 * follows the glossary and is not glossary). Returns the LAST glossary page's content lines.
 */
function lastGlossaryPage(texts) {
  const start = texts.findIndex((t) => t.includes(APPENDIX_HEADING));
  const closing = texts.findIndex((t, i) => i > start && t.includes(RENDER_COPY.pdfClosingSections[0].label));
  assert.ok(start > 0 && closing > start, `precondition: glossary at ${start}, closing page at ${closing}`);
  return { page: closing, lines: contentLines(texts[closing - 1]) };
}

// Reyner, 2026-10-06 (amendment 1 to BE, on #199): "the glossary's last group never sits alone
// on a page; it moves together with the group before it". The case: this Complete Edition, page
// 8 held only "Shio (tahun lahirmu)" and its one row "Kerbau" (docs/qa/2026-10-06-be-pdf-page-
// breaks/ce-clash-08.png). A last glossary page that OPENS with the last group's heading holds
// nothing of the group before it.
test('THE GLOSSARY\'S LAST GROUP NEVER SITS ALONE ON A PAGE (Complete Edition, clash prose)', async () => {
  const sj = buildSemanticJson(clashA);
  const { buffer } = await buildCompleteEditionPdf({ chart: clashA, semanticJson: sj, rendered: writerProse, gender: 'female' });
  const { page, lines } = lastGlossaryPage(pageTexts(buffer));
  assert.ok(lines.includes(RENDER_COPY.pdfShioGroupMirror), 'precondition: the last group is Shio');
  assert.notEqual(lines[0], RENDER_COPY.pdfShioGroupMirror,
    `glossary page ${page} opens with its last group and holds nothing else: ${JSON.stringify(lines)}`);
});

test('THE GLOSSARY\'S LAST GROUP NEVER SITS ALONE ON A PAGE (compat, floor 12 x 6)', async () => {
  const chartA = calculateBaziChart({ birthDate: '1990-06-07', birthTime: '12:00' });
  const chartB = calculateBaziChart({ birthDate: '1989-03-03', birthTime: '00:15' });
  const pj = buildPairSemantic(chartA, chartB);
  const { buffer } = await buildPairPdf({
    chartA, chartB, semanticJson: pj, rendered: { ...assembleFallback(pj), prompt_version: 'p', stage6_version: 'g' },
    pair: { a: { date: '1990-06-07', gender: 'female' }, b: { date: '1989-03-03', gender: 'male' } },
  });
  const { page, lines } = lastGlossaryPage(pageTexts(buffer));
  assert.ok(lines.includes('Shio'), 'precondition: the last group is Shio');
  assert.notEqual(lines[0], 'Shio', `glossary page ${page} opens with its last group: ${JSON.stringify(lines)}`);
});
