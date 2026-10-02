#!/usr/bin/env node
// ============================================================
// scripts/qa-pdf-design.mjs — Prompt AW's proof set: the same inputs, before and after
// ============================================================
//   node scripts/qa-pdf-design.mjs <label>     e.g. before | after
//
// SPENDS NOTHING. Builds, into reports/pdf-design/<label>/ (gitignored):
//   ce-smewTN.pdf   Complete Edition, 2001-02-14 13:00 female, from the AV §3 smoke
//   ce-chart1.pdf   Complete Edition, 1989-09-13 09:00 male, from the AV §3 smoke
//                   (reports/voice-v2/round6-switch/smoke-1.json; the FLOOR if absent,
//                   and the console says so)
//   compat-smewTN-chart1.pdf   Compatibility, smewTN + chart1: THE FLOOR, always.
//                   No pair render exists for this pair; the floor is fluent and reads
//                   like a reading, so it is labelled here rather than left to look real.
// and for each: every page as a PNG (lib/pdf/raster.js), plus pages.json (page texts
// through lib/pdf/inspect.js, which is what the reading-text diff compares).
// Runs under plain node: @react-pdf/renderer needs the client React build.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf } from '../lib/pdf/build.js';
import { pageTexts } from '../lib/pdf/inspect.js';
import { rasterPages } from '../lib/pdf/raster.js';

const label = process.argv[2];
if (!label) { console.error('usage: qa-pdf-design.mjs <label>'); process.exit(2); }
const OUT = path.join('reports', 'pdf-design', label);
fs.mkdirSync(OUT, { recursive: true });

const SMOKE = 'reports/voice-v2/round6-switch/smoke-1.json';
const smoke = fs.existsSync(SMOKE) ? JSON.parse(fs.readFileSync(SMOKE, 'utf8')) : [];
const SUBJECTS = {
  smewTN: { id: 'smewTNtzNaoQmWysi6mYU', birthDate: '2001-02-14', birthTime: '13:00', gender: 'female' },
  chart1: { id: 'chart1', birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' },
};

async function emit(name, buffer) {
  const file = path.join(OUT, `${name}.pdf`);
  fs.writeFileSync(file, buffer);
  const texts = pageTexts(buffer);
  fs.writeFileSync(path.join(OUT, `${name}.pages.json`), `${JSON.stringify(texts, null, 2)}\n`);
  for (const p of await rasterPages(buffer, { dpi: 110 })) {
    fs.writeFileSync(path.join(OUT, `${name}-p${String(p.page).padStart(2, '0')}.png`), p.png());
  }
  console.log(`${file}: ${texts.length} pages`);
}

for (const [name, s] of Object.entries(SUBJECTS)) {
  const chart = calculateBaziChart({ birthDate: s.birthDate, birthTime: s.birthTime });
  const semanticJson = buildSemanticJson(chart, { voice: 'v2' });
  const rec = smoke.find((r) => r.id === s.id);
  const rendered = rec
    ? { blocks: rec.rendered.blocks, penutup: rec.rendered.penutup, prompt_version: rec.prompt_version, stage6_version: rec.stage6_version }
    : { ...assembleFallback(semanticJson), prompt_version: null, stage6_version: null };
  if (!rec) console.log(`${name}: THE FLOOR (no smoke record at ${SMOKE})`);
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered, gender: s.gender });
  await emit(`ce-${name}`, buffer);
}

{
  const a = calculateBaziChart({ birthDate: SUBJECTS.smewTN.birthDate, birthTime: SUBJECTS.smewTN.birthTime });
  const b = calculateBaziChart({ birthDate: SUBJECTS.chart1.birthDate, birthTime: SUBJECTS.chart1.birthTime });
  const semanticJson = buildPairSemantic(a, b);
  const rendered = { ...assembleFallback(semanticJson), prompt_version: null, stage6_version: null };
  const pair = { a: { date: SUBJECTS.smewTN.birthDate, gender: 'female' }, b: { date: SUBJECTS.chart1.birthDate, gender: 'male' } };
  console.log('compat: THE FLOOR (no pair render; labelled, not a reading)');
  const { buffer } = await buildPairPdf({ chartA: a, chartB: b, semanticJson, rendered, pair });
  await emit('compat-smewTN-chart1', buffer);
}
