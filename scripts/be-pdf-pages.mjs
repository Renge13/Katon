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

for (const [name, buffer] of [['ce', ce.buffer], ['compat', compat.buffer]]) {
  fs.writeFileSync(path.join(out, `${name}.pdf`), buffer);
  const pages = await rasterPages(buffer, { dpi: 110 });
  for (const p of pages) fs.writeFileSync(path.join(out, `${name}-${String(p.page).padStart(2, '0')}.png`), p.png());
  console.log(`${name}: ${pages.length} pages`);
}
