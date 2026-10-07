#!/usr/bin/env node
// ============================================================
// docs/qa/2026-10-07-bi-closing/shots.mjs — Prompt BI PR 1, the closing page of both PDFs
// ============================================================
//   node docs/qa/2026-10-07-bi-closing/shots.mjs
//
// Builds the Complete Edition and the compat PDF from the fixtures tests/pdf-closing.spec.mjs
// uses (A 1989-09-13 09:00, B 1990-03-04 14:00), with the FLOOR as the reading (no model, no
// spend), and rasterises each document's LAST page through lib/pdf/raster.js at 110 dpi.
// The closing page carries no reading prose, so floor or render makes no difference to it.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1'));
const ROOT = path.resolve(HERE, '..', '..', '..');
const lib = (p) => import(new URL(`file:///${ROOT.replace(/\\/gu, '/')}/${p}`).href);

const { calculateBaziChart } = await lib('lib/bazi/buildChart.js');
const { buildSemanticJson } = await lib('lib/semantic/index.js');
const { buildPairSemantic } = await lib('lib/semantic/pair.js');
const { assembleFallback } = await lib('lib/render/fallback.js');
const { buildCompleteEditionPdf, buildPairPdf } = await lib('lib/pdf/build.js');
const { rasterPages } = await lib('lib/pdf/raster.js');
const { pageTexts } = await lib('lib/pdf/inspect.js');

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const rendered = (sj) => ({ ...assembleFallback(sj), prompt_version: 'qa', stage6_version: 'qa' });

const chart = calculateBaziChart(A);
const sj = buildSemanticJson(chart);
const ce = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: rendered(sj), gender: 'female' });

const chartA = calculateBaziChart(A);
const chartB = calculateBaziChart(B);
const pj = buildPairSemantic(chartA, chartB);
const compat = await buildPairPdf({
  chartA, chartB, semanticJson: pj, rendered: rendered(pj),
  pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
});

for (const [name, buffer] of [['complete-edition', ce.buffer], ['compat', compat.buffer]]) {
  const n = pageTexts(buffer).length;
  const [img] = await rasterPages(buffer, { dpi: 110, pages: [n] });
  const out = path.join(HERE, `closing-${name}.png`);
  fs.writeFileSync(out, img.png());
  console.log(`${out}  page ${n} of ${n}  ${img.width}x${img.height}`);
}
