#!/usr/bin/env node
// ============================================================
// scripts/be-pdf-pages.mjs — Prompt BE §5d, every page of both PDFs as images
// ============================================================
//   node scripts/be-pdf-pages.mjs <out-dir>
//
// Builds the Complete Edition (chart 1989-09-13 09:00, female) and the Compatibility PDF
// (that chart + 1990-03-04 14:00, male) from the deterministic FLOOR (assembleFallback):
// the same inputs as tests/pdf-passable.spec.mjs, so the pages are reproducible. These
// are FLOOR readings, not renders - the reading pages carry Reyner's glossary prose, not a
// writer's. Rasterised at 110 dpi by lib/pdf/raster.js, the renderer the PDF tests use.
//
// Since 2026-10-06 (#199 page breaks) it also builds compat-clash / ce-clash, the two documents
// that stranded a heading; those are the 2c round's REAL v2 prose, not floors.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { assembleFallback } = await import('../lib/render/fallback.js');
const { buildCompleteEditionPdf, buildPairPdf } = await import('../lib/pdf/build.js');
const { rasterPages } = await import('../lib/pdf/raster.js');

const out = process.argv[2];
if (!out) { console.error('usage: node scripts/be-pdf-pages.mjs <out-dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const rendered = (sj) => ({ ...assembleFallback(sj), prompt_version: 'floor', stage6_version: 'floor' });

const chart = calculateBaziChart(A);
const sj = buildSemanticJson(chart);
const ce = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: rendered(sj), gender: 'female' });

const chartB = calculateBaziChart(B);
const pj = buildPairSemantic(chart, chartB);
const compat = await buildPairPdf({
  chartA: chart, chartB, semanticJson: pj, rendered: rendered(pj),
  pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
});

// The two documents that stranded a heading before the page-break fix (Reyner 2026-10-06, on
// #199): the 2c round's clash #1 compat reading (the writer's own prose and chapter headings),
// and that same prose as a Complete Edition. These are RENDERS, not floors.
const CLASH = JSON.parse(fs.readFileSync('docs/qa/2026-10-04-bc-paragraphs-round/round.json', 'utf8'))
  .records.find((r) => r.pair === 'clash' && r.render === 1);
const clashA = calculateBaziChart({ birthDate: '1973-05-10', birthTime: '00:00' });
const clashB = calculateBaziChart({ birthDate: '1971-08-07', birthTime: '13:00' });
const prose = { blocks: CLASH.reading.blocks, penutup: CLASH.reading.penutup, prompt_version: 'p', stage6_version: 'g' };
const clashPj = buildPairSemantic(clashA, clashB, { voice: 'v2', status: CLASH.status, nicknames: CLASH.nicknames });
const compatClash = await buildPairPdf({
  chartA: clashA, chartB: clashB, semanticJson: clashPj, rendered: { ...prose, chapter_headings: true },
  pair: { a: { date: '1973-05-10', gender: 'female' }, b: { date: '1971-08-07', gender: 'male' } },
});
const ceClash = await buildCompleteEditionPdf({ chart: clashA, semanticJson: buildSemanticJson(clashA), rendered: prose, gender: 'female' });

for (const [name, buffer] of [['ce', ce.buffer], ['compat', compat.buffer], ['compat-clash', compatClash.buffer], ['ce-clash', ceClash.buffer]]) {
  fs.writeFileSync(path.join(out, `${name}.pdf`), buffer);
  const pages = await rasterPages(buffer, { dpi: 110 });
  for (const p of pages) fs.writeFileSync(path.join(out, `${name}-${String(p.page).padStart(2, '0')}.png`), p.png());
  console.log(`${name}: ${pages.length} pages`);
}
