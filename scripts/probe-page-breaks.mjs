#!/usr/bin/env node
// ============================================================
// scripts/probe-page-breaks.mjs — where do PDF headings strand, and does a facts row stand alone?
// ============================================================
//   node scripts/probe-page-breaks.mjs
//
// Builds Complete Editions for every fixture chart (floor) and compat PDFs for floor pairs and
// for the real v2 readings of the 2c and 2d QA rounds (docs/qa/2026-10-0*-bc-*/round.json, the
// writer's own chapter headings), then reports, per document:
//   stranded  a page whose LAST content line is a heading (a block heading, an eyebrow, a
//             glossary group heading) - its body starts on the next page;
//   lone row  the compat facts table ending on a page that holds a single facts row.
// Report only. tests/pdf-page-breaks.spec.mjs holds the cases this found.
// ============================================================

import fs from 'node:fs';

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { assembleFallback } = await import('../lib/render/fallback.js');
const { buildCompleteEditionPdf, buildPairPdf, APPENDIX_HEADING } = await import('../lib/pdf/build.js');
const { buildAppendix } = await import('../lib/pdf/appendix.js');
const { buildPairAppendix } = await import('../lib/pdf/pairAppendix.js');
const { factRows } = await import('../lib/pdf/pairDocument.js');
const { pageTexts } = await import('../lib/pdf/inspect.js');
const { RENDER_COPY } = await import('../lib/render/copy.js');
const { PASANGAN_COPY } = await import('../lib/site/copy.js');
const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('../tests/bazi-validation.fixture.js');

const footerPart = (l) => RENDER_COPY.pdfFooter.includes(l);
const lines = (t) => t.split('\n').map((l) => l.trim()).filter((l) => l && !footerPart(l));

/** The heading strings a document can print, upper-cased too (eyebrows are uppercased by style). */
function headingSet({ rendered, appendix }) {
  const hs = new Set();
  const add = (h) => { if (h) { hs.add(h); hs.add(h.toUpperCase()); } };
  for (const b of rendered.blocks || []) add(b.heading);
  for (const g of appendix?.groups || []) add(g.group);
  for (const v of Object.values(RENDER_COPY)) if (typeof v === 'string' && v.length < 40) add(v);
  return hs;
}

export function strandedHeadings(texts, headings) {
  return texts.flatMap((t, i) => {
    const ls = lines(t);
    return headings.has(ls.at(-1)) ? [{ page: i + 1, heading: ls.at(-1) }] : [];
  });
}

/** Facts rows per page: the table's term names, counted on each page from its heading on. */
export function factsRowsPerPage(texts, semanticJson) {
  const terms = new Set(factRows(semanticJson).map((r) => r.term).filter(Boolean));
  const start = texts.findIndex((t) => t.includes(PASANGAN_COPY.pdf_facts_heading));
  const out = [];
  for (let i = start; i >= 0 && i < texts.length; i += 1) {
    // The glossary names the same terms: the table ends where it begins.
    if (i > start && (texts[i].includes(PASANGAN_COPY.pdf_facts_heading) || texts[i].includes(APPENDIX_HEADING))) break;
    const n = lines(texts[i]).filter((l) => terms.has(l)).length;
    if (i > start && n === 0) break;
    out.push({ page: i + 1, rows: n });
  }
  return out;
}

const floor = (sj) => ({ ...assembleFallback(sj), prompt_version: 'p', stage6_version: 'g' });
const report = [];

if (process.argv[1] && process.argv[1].endsWith('probe-page-breaks.mjs')) {
  for (const c of [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS]) {
    const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
    const sj = buildSemanticJson(chart);
    const rendered = floor(sj);
    const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered });
    const texts = pageTexts(buffer);
    const s = strandedHeadings(texts, headingSet({ rendered, appendix: buildAppendix({ chart, semanticJson: sj }) }));
    report.push({ doc: `CE chart ${c.id} ${c.date} ${c.time}`, pages: texts.length, stranded: s });
  }

  const pairs = [];
  for (const f of ['docs/qa/2026-10-04-bc-paragraphs-round/round.json', 'docs/qa/2026-10-06-bc-native-phrasing-round/round.json']) {
    for (const r of JSON.parse(fs.readFileSync(f, 'utf8')).records) pairs.push({ label: `${f.split('/')[2]} ${r.pair} #${r.render}`, record: r });
  }
  const PAIR_BIRTHS = {
    sample: [['2005-02-14', '07:00', 'female'], ['1999-07-07', '17:00', 'male']],
    rina: [['1992-11-23', '10:00', 'female'], ['1990-04-18', '21:00', 'male']],
    PZ0t: [['1989-09-13', '09:00', 'female'], ['1990-03-04', '14:00', 'male']],
    clash: [['1973-05-10', '00:00', 'female'], ['1971-08-07', '13:00', 'male']],
    nonames: [['1995-06-01', '06:00', 'female'], ['1988-12-05', '08:00', 'male']],
  };
  for (const { label, record } of pairs) {
    const [[ad, at, ag], [bd, bt, bg]] = PAIR_BIRTHS[record.pair];
    const chartA = calculateBaziChart({ birthDate: ad, birthTime: at });
    const chartB = calculateBaziChart({ birthDate: bd, birthTime: bt });
    const pj = buildPairSemantic(chartA, chartB, { voice: 'v2', status: record.status, nicknames: record.nicknames });
    const rendered = { blocks: record.reading.blocks, penutup: record.reading.penutup, prompt_version: 'p', stage6_version: 'g', chapter_headings: true };
    const { buffer } = await buildPairPdf({ chartA, chartB, semanticJson: pj, rendered, pair: { a: { date: ad, gender: ag }, b: { date: bd, gender: bg } } });
    const texts = pageTexts(buffer);
    report.push({
      doc: `compat ${label}`, pages: texts.length,
      stranded: strandedHeadings(texts, headingSet({ rendered, appendix: buildPairAppendix({ chartA, chartB, semanticJson: pj }) })),
      facts: factsRowsPerPage(texts, pj),
    });
  }
  for (const [x, y] of [[1, 2], [1, 6], [2, 6], [3, 7], [12, 6], [13, 11]]) {
    const cx = VALIDATION_CHARTS.find((c) => c.id === x);
    const cy = VALIDATION_CHARTS.find((c) => c.id === y);
    const chartA = calculateBaziChart({ birthDate: cx.date, birthTime: cx.time });
    const chartB = calculateBaziChart({ birthDate: cy.date, birthTime: cy.time });
    const pj = buildPairSemantic(chartA, chartB);
    const rendered = floor(pj);
    const { buffer } = await buildPairPdf({ chartA, chartB, semanticJson: pj, rendered, pair: { a: { date: cx.date, gender: 'female' }, b: { date: cy.date, gender: 'male' } } });
    const texts = pageTexts(buffer);
    report.push({
      doc: `compat floor ${x}x${y}`, pages: texts.length,
      stranded: strandedHeadings(texts, headingSet({ rendered, appendix: buildPairAppendix({ chartA, chartB, semanticJson: pj }) })),
      facts: factsRowsPerPage(texts, pj),
    });
  }
  for (const r of report) {
    const lone = (r.facts || []).filter((f, i) => i > 0 && f.rows === 1);
    if (r.stranded.length || lone.length) console.log(`${r.doc} (${r.pages}p): stranded ${JSON.stringify(r.stranded)} ${lone.length ? `lone facts row ${JSON.stringify(lone)}` : ''}`);
  }
  console.log(`${report.length} documents checked`);
}
