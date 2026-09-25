#!/usr/bin/env node
// ============================================================
// scripts/qa-voice-v2-pdfs.mjs — the v1 / v2 PDFs, side by side
// ============================================================
//   node scripts/qa-voice-v2-pdfs.mjs
//
// SPENDS NOTHING. Step 2 of scripts/qa-voice-v2-renders.mjs: reads each
// reports/voice-v2/<subject>-<voice>.json that step wrote and builds the PDF through
// the production doors (buildCompleteEditionPdf / buildPairPdf), with the recorded
// render VERBATIM as the cache row. Plain node, not react-server: @react-pdf needs
// the client React build (the split is explained in scripts/build-pdf.mjs).
//
// Writes <subject>-<voice>.pdf beside each JSON and index.html, which puts each
// subject's v1 and v2 PDFs next to each other. A floored render is LABELLED there:
// a floor PDF reads like a reading and is not one.
// ============================================================

import fs from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildCompleteEditionPdf, buildPairPdf } from '../lib/pdf/build.js';

// `--dir reports/voice-v2/round3` for round 3's v2-only run (2026-09-25). With one
// voice present the index shows one column and says so.
const dirAt = process.argv.indexOf('--dir');
const DIR = dirAt > -1 ? process.argv[dirAt + 1] : 'reports/voice-v2';
const records = fs.readdirSync(DIR).filter((f) => /-(v1|v2)\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')));
if (records.length === 0) throw new Error(`no renders in ${DIR}; run qa-voice-v2-renders.mjs first`);

for (const r of records) {
  const chartA = calculateBaziChart(r.inputs.a);
  let built;
  if (r.kind === 'pair') {
    const chartB = calculateBaziChart(r.inputs.b);
    built = await buildPairPdf({
      chartA, chartB,
      semanticJson: buildPairSemantic(chartA, chartB, { voice: r.voice }),
      rendered: r.rendered,
      pair: {
        a: { date: r.inputs.a.birthDate, gender: r.inputs.a.gender ?? null },
        b: { date: r.inputs.b.birthDate, gender: r.inputs.b.gender ?? null },
      },
    });
  } else {
    built = await buildCompleteEditionPdf({
      chart: chartA,
      semanticJson: buildSemanticJson(chartA, { voice: r.voice }),
      rendered: r.rendered,
      gender: r.inputs.a.gender ?? null,
    });
  }
  fs.writeFileSync(`${DIR}/${r.subject}-${r.voice}.pdf`, built.buffer);
  console.log(`${r.subject}-${r.voice}.pdf ${(built.buffer.length / 1024).toFixed(0)} KB${r.floored ? '  FLOOR' : ''}`);
}

const subjects = [...new Set(records.map((r) => r.subject))];
const voices = [...new Set(records.map((r) => r.voice))].sort();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cell = (r) => (r
  ? `<div class="col"><h3>${esc(r.voice)} ${r.floored ? '<span class="floor">FLOOR (module assembly, not a reading)</span>' : ''}</h3>
<p class="meta">${r.words} words, ${r.regenerations} regeneration(s)${r.j1_rejections ? `, ${r.j1_rejections} J1 rejection(s)` : ''}, judge findings ${r.judge_findings.length}, $${r.spend_usd.total.toFixed(4)}</p>
<iframe src="${esc(r.subject)}-${esc(r.voice)}.pdf"></iframe></div>`
  : '<div class="col"><h3>missing</h3></div>');
const title = voices.length === 1 ? `Voice ${voices[0]} renders` : 'Voice v1 vs v2';
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{--bg:#faf8f4;--fg:#1d1b18;--muted:#6b655c;--line:#ddd6cb;--warn:#a33a1f}
@media (prefers-color-scheme:dark){:root{--bg:#161412;--fg:#ece7df;--muted:#a39b8f;--line:#3a352f;--warn:#e07a5f}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
section{border-top:1px solid var(--line);padding:12px 0}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width:900px){.row{grid-template-columns:1fr}}
iframe{width:100%;height:80vh;border:1px solid var(--line);background:#fff}
.meta{color:var(--muted);margin:0 0 8px}.floor{color:var(--warn);font-size:13px}
</style></head><body>
<h1>${title}</h1>
<p class="meta">Same engine facts per row. STAGE6 ${esc(records[0].stage6_version)}. Rendered in memory, not from render_cache.</p>
${subjects.map((s) => `<section><h2>${esc(s)}</h2><div class="row"${voices.length === 1 ? ' style="grid-template-columns:1fr"' : ''}>${voices.map((v) => cell(records.find((r) => r.subject === s && r.voice === v))).join('')}</div></section>`).join('\n')}
</body></html>`;
fs.writeFileSync(`${DIR}/index.html`, html);
console.log(`${DIR}/index.html`);
