#!/usr/bin/env node
// ============================================================
// scripts/qa-renders.mjs — the QA charts, rendered and dumped verbatim
// ============================================================
//   npm run qa:renders                writes docs/qa/<today>-renders.md
//   npm run qa:renders -- --out FILE  writes somewhere else
//
// The four charts precondition 3 is read on: 1, 5, 13 and the fresh 1996
// birthdate. Renders each through the REAL chain and writes every block's prose
// verbatim, unedited, with `source`, `model` and `prompt_version` at the top of
// each reading.
//
// ── WHY THE HEADER MATTERS MORE THAN THE PROSE ─────────────
// `assembleFallback` renders every string of every fact from the glossary, so a
// FLOOR result is fluent Indonesian and reads exactly like a reading. On
// 2026-08-17 ONE of these four came back `module_assembly` - CHART 1 - and the
// prose was indistinguishable by eye.
//
// CORRECTED 2026-08-21. This comment said "two of these four" and named no run, so
// it could not be checked against anything. It disagreed with its own artifact in
// two ways at once:
//
//   $ awk 'BEGIN{c=""} /^## (chart|fresh)/{c=$0} /\| `source` \|/{print c" -> "$0}' \
//       docs/qa/2026-08-17-renders.md
//   chart 5 -> gemini | chart 13 -> gemini | chart 1 -> module_assembly | fresh-1996 -> gemini
//
// One floor, not two, and the floored chart was 1 while chart 5 - the one this
// file's own run-to-run note is about - RENDERED in that run. No recorded 08-17
// run had two of four floor: PROGRESS ("THE FLOOR RATE MOVES BETWEEN IDENTICAL
// BATCHES", 08-17) logs three invocations in which chart 5 went floor, then
// `gemini`, then 4/10, and the artifact here is the one where it rendered. The
// point the comment was making survives the correction intact - one floor is
// enough to make the banner load-bearing.
//
// Anyone reading this file for register or for QA is
// reading the MODEL's work only where `source: gemini` — everywhere else they are
// reading the glossary, which Reyner already ruled, and a verdict formed on it
// says nothing about the renderer. So the source banner is not metadata here, it
// is the thing that makes the file safe to read.
//
// ── IT DOES NOT RETRY TO GET A PASS ────────────────────────
// `renderReading` already regenerates once on a Stage 6 rejection; that is the
// product's own behaviour and it is what a real reader would get. This script
// runs each chart ONCE and reports what came back. Re-running a floor until it
// renders is not QA, it is sampling until the answer is nice — and PROGRESS
// records the run-to-run spread that would make it work.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderReading } from '../lib/render/index.js';
import { PROMPT_VERSION } from '../lib/render/prompt.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The four in the ledger's precondition-3 line, in the order it names them.
const CHARTS = [
  { label: 'chart 5', date: '1988-07-10', time: '22:00', note: 'the quietFloor re-ask — padding confirmed by Reyner 2026-08-11, attributed to unwritten cells' },
  { label: 'chart 13', date: '1989-02-04', time: '04:00', note: 'the 立春 boundary chart, and the one Track A is expected to miss' },
  { label: 'chart 1', date: '1989-09-13', time: '09:00', note: 'the reference chart for every card and contrast measurement' },
  { label: 'fresh-1996', date: '1996-10-02', time: '19:20', note: 'the Samudra opening that ranked 9th of 14 before Prompt K' },
];

const outFlag = process.argv.indexOf('--out');
const today = new Date().toISOString().slice(0, 10);
const OUT = outFlag > -1 && process.argv[outFlag + 1]
  ? path.resolve(process.argv[outFlag + 1])
  : path.join(ROOT, 'docs', 'qa', `${today}-renders.md`);

const results = [];
for (const c of CHARTS) {
  process.stderr.write(`rendering ${c.label} (${c.date} ${c.time}) ... `);
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  // allowUnvalidatedCache is a QA affordance and it is reported, never hidden:
  // a cache hit is a previous run's prose, not this one's.
  const r = await renderReading(semantic, { allowUnvalidatedCache: true });
  process.stderr.write(`${r.source}${r.cached ? ' (cached)' : ''}\n`);
  results.push({ ...c, semantic, r });
}

const floors = results.filter((x) => x.r.source !== 'gemini');

const esc = (s) => String(s ?? '').trim();
const lines = [];

lines.push('<!--');
lines.push('STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -');
lines.push('it is evidence, and an edited render is not one. Regenerate with npm run qa:renders.');
lines.push('-->');
lines.push('');
lines.push(`# QA renders — ${today}`);
lines.push('');
lines.push('Charts 5, 13, 1 and fresh-1996 through the real chain. **Prose is verbatim and nothing');
lines.push('below a rule is edited.** Nobody has judged these; that is Reyner\'s, after Cowork annotates.');
lines.push('');

if (floors.length) {
  lines.push(`## ⚠ ${floors.length} of ${results.length} ARE THE FLOOR, NOT A READING`);
  lines.push('');
  lines.push('`source: module_assembly` means Stage 6 rejected the model twice and the reader was served');
  lines.push('**module assembly** — the deterministic floor, which renders glossary strings Reyner already');
  lines.push('ruled. It is fluent Indonesian and it is indistinguishable from a reading by eye. A register');
  lines.push('or quality verdict formed on one of these is a verdict on the glossary, not on the renderer.');
  lines.push('');
  for (const f of floors) {
    const checks = (f.r.attempts || []).map((a) => (a.stage6 || []).join(', ') || a.error).join(' | ');
    lines.push(`- **${f.label}** (${f.date} ${f.time}) — \`${f.r.source}\`, failed twice on: ${checks}`);
  }
  lines.push('');
  lines.push('**They are included below anyway, labelled**, because what the floor produces is worth');
  lines.push('seeing next to what the model produces. Read the banner before the prose, every time.');
  lines.push('');
}

lines.push('---');
lines.push('');

for (const { label, date, time, note, semantic, r } of results) {
  const isFloor = r.source !== 'gemini';
  lines.push(`## ${label} — ${date} ${time}`);
  lines.push('');
  lines.push(`> ${note}`);
  lines.push('');
  lines.push(isFloor
    ? '### ⚠ THIS IS THE FLOOR. It is not the renderer\'s output and must not be read as one.'
    : '### Real render');
  lines.push('');
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push(`| \`source\` | **${r.source}** |`);
  lines.push(`| \`model\` | ${r.model ?? '— (no model output was served)'} |`);
  lines.push(`| \`prompt_version\` | ${r.prompt_version ?? '— (floor renders no prompt)'} |`);
  lines.push(`| loaded prompt | ${PROMPT_VERSION} |`);
  lines.push(`| \`stage6_version\` | ${r.stage6_version ?? '—'} |`);
  lines.push(`| \`qa_flag\` | ${r.qa_flag ?? '—'} |`);
  lines.push(`| \`cached\` | ${r.cached} |`);
  lines.push(`| pillars | ${semantic.chart.year} ${semantic.chart.month} ${semantic.chart.day} ${semantic.chart.hour ?? '—'} |`);
  lines.push(`| facts / required | ${semantic.facts.length} / ${semantic.required_points.length} |`);
  lines.push('');
  if ((r.attempts || []).length) {
    lines.push('Attempts, in order:');
    lines.push('');
    for (const [i, a] of r.attempts.entries()) {
      const detail = a.ok ? 'passed Stage 6'
        : `rejected — ${(a.stage6 || []).join(', ') || a.error}${a.hard ? ' **(HARD)**' : ''}`;
      lines.push(`${i + 1}. \`${a.provider}\` ${detail}`);
    }
    lines.push('');
  }
  if ((r.findings || []).length) {
    lines.push('Findings recorded on the served result:');
    lines.push('');
    for (const f of r.findings) lines.push(`- \`${f.check}\` (${f.severity}) — ${f.message}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  for (const b of r.blocks) {
    // A HEADING-LESS BLOCK IS LEGITIMATE, AND THIS USED TO PRINT A BARE "### ".
    // The floor gives a null-label fact no heading on purpose - a missing element
    // is a CONDITION, described and never named, which is the failure the prompt
    // calls out and which tests/stage5-render.spec.mjs pins as
    // `assert.equal(missing.heading, '')`. So the empty string is correct DATA and
    // the defect was here, in the renderer that printed a heading marker for it.
    // Reproducible in docs/qa/2026-08-17-renders.md, chart 1's floored render,
    // between "Setengah Gabungan" and "Aspek Pengatur". That artifact is evidence
    // and is deliberately NOT rewritten.
    if (esc(b.heading) !== '') lines.push(`### ${esc(b.heading)}`);
    else lines.push('<!-- no heading: a null-label condition, described not named -->');
    lines.push('');
    lines.push(esc(b.text));
    lines.push('');
  }
  if (esc(r.penutup)) {
    lines.push('### Penutup');
    lines.push('');
    lines.push(esc(r.penutup));
    lines.push('');
  } else {
    lines.push('### Penutup');
    lines.push('');
    lines.push('*(empty — `notes.penutup_unavailable` is '
      + `${r.notes?.penutup_unavailable ?? 'unset'})*`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
console.error(`\nwrote ${path.relative(ROOT, OUT)}`);
console.error(`${results.length - floors.length} real render(s), ${floors.length} floor(s).`);
if (floors.length) console.error(`FLOOR: ${floors.map((f) => f.label).join(', ')} — these are not readings.`);
