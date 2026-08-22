#!/usr/bin/env node
// ============================================================
// scripts/qa-depth-pairs.mjs — served readings at depth 1 beside depth 3
// ============================================================
//   npm run qa:depth-pairs        writes docs/qa/<today>-depth-1-vs-3-readings.md
//
// SPENDS NOTHING. Every word here was already paid for: it is lifted verbatim out
// of docs/qa/2026-08-18-retry-depth.json, which stored the prose of all 77
// attempts of a 40-run trace.
//
// ── WHY THIS FILE EXISTS ───────────────────────────────────
// The 2026-08-22 budget-3 run measured erosion in FINDINGS for the first time -
// 45% / 65% / 33% of regeneration steps introduce a check the previous attempt had
// passed. Reyner ruled that the depth trade is not settled on that figure:
//
//   "Reyner rules the erosion trade by reading them, the way he ruled depth 2,
//    not off the 45/65/33 figure."
//
// Depth 2 was ruled that way in docs/qa/2026-08-19-retry-erosion.md, on prose. A
// findings rate says the directive is busy. It cannot say whether the reader gets
// a worse reading, and that is the only question the trade turns on.
//
// ── WHY THE SOURCE IS 08-18 AND NOT THE BUDGET-3 RUN ───────
// The budget-3 artifact prints ONE reading per chart and it is always run 1, by a
// deliberate rule in qa-renders.mjs: choosing a nicer run is sampling until the
// answer is pretty. Run 1 landed at depth 3, 2, 4 and 3 on the four charts, so
// that artifact contains NO depth-1 served reading and cannot make this pair. The
// harness now labels the depth it printed, so the next paid run can.
//
// The 08-18 trace can, because it stored every attempt. Its terms, stated so the
// reading is judged on what it is: gate 1.9.0, prompt 2ff1a546fb7e6e53. The prose
// is a different vintage from today's gate. What is NOT a different vintage is
// `stricterDirective`, which is the thing under judgement here and has not been
// touched since - so the question "what does a regeneration do to the writing" is
// being asked of the same code that answers it today.
//
// SAME CHART ON BOTH SIDES, deliberately. A depth-1 reading of chart 5 against a
// depth-3 reading of chart 1 would confound the depth with the chart, and the
// charts differ in fact count, strength verdict and archetype. Each pair below is
// one chart at two depths.
//
// NOTHING IS SELECTED FOR QUALITY. The pair is the FIRST depth-1 run and the
// FIRST depth-3 run of each chart in run order, and the code says so below. That
// is the same rule qa-renders.mjs follows and for the same reason.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Imported so the vintage line states the CURRENT versions rather than asserting
// "not today's gate", which stops being true the moment this reads a fresh trace.
import { PROMPT_VERSION } from '../lib/render/prompt.js';
import { STAGE6_VERSION } from '../lib/validate/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// `--from FILE` reads any trace with the same shape. Defaults to the 08-18 probe
// because until 2026-08-22 that was the only one that existed; `qa:renders` now
// writes a sidecar trace beside its artifact, so the next paid run can be pointed
// at here and the pair comes from the CURRENT gate instead of a historical one.
const fromFlag = process.argv.indexOf('--from');
const SRC = fromFlag > -1 && process.argv[fromFlag + 1]
  ? path.resolve(process.argv[fromFlag + 1])
  : path.join(ROOT, 'docs', 'qa', '2026-08-18-retry-depth.json');
const today = new Date().toISOString().slice(0, 10);
const outFlag = process.argv.indexOf('--out');
const OUT = outFlag > -1 && process.argv[outFlag + 1]
  ? path.resolve(process.argv[outFlag + 1])
  : path.join(ROOT, 'docs', 'qa', `${today}-depth-1-vs-3-readings.md`);

// The refuse-to-overwrite guard, same as qa-renders.mjs. An artifact is evidence
// and a committed one is not this script's to replace.
if (fs.existsSync(OUT)) {
  console.error(`REFUSING: ${path.relative(ROOT, OUT)} already exists.\n`
    + 'An artifact is evidence. Pass --out with a new path, or delete it deliberately.');
  process.exit(1);
}

const trace = JSON.parse(fs.readFileSync(SRC, 'utf8'));

/** Served depth = the index of the attempt that PASSED. null if the run floored. */
const servedDepth = (run) => {
  const i = run.attempts.findIndex((a) => a.ok);
  return i === -1 ? null : i + 1;
};

// Two charts that have BOTH a depth-1 and a depth-3 run in this trace. Read from
// the data rather than hardcoded, so a regenerated trace cannot leave this file
// naming runs that are no longer there.
const charts = [...new Set(trace.runs.map((r) => r.chart))];
const pairs = [];
for (const chart of charts) {
  const runs = trace.runs.filter((r) => r.chart === chart);
  const one = runs.find((r) => servedDepth(r) === 1);
  const three = runs.find((r) => servedDepth(r) === 3);
  if (one && three) pairs.push({ chart, one, three });
  if (pairs.length === 2) break;
}

if (pairs.length < 2) {
  console.error('REFUSING: fewer than two charts in the trace have both a depth-1 '
    + 'and a depth-3 served reading. Nothing to compare.');
  process.exit(1);
}

const served = (run) => run.attempts[servedDepth(run) - 1];

const lines = [
  '<!--',
  'STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -',
  'it is evidence, and an edited reading is not one. Regenerate with npm run qa:depth-pairs.',
  '-->',
  '',
  `# Served readings, depth 1 beside depth 3 — ${today}`,
  '',
  'Two charts, each at two depths. **Zero cost:** every word is lifted verbatim from',
  '`docs/qa/2026-08-18-retry-depth.json`, which stored the prose of all 77 attempts of a',
  '40-run trace already paid for.',
  '',
  'The question is the one the 45% / 65% / 33% findings-erosion figure cannot answer:',
  'does a reader who waited for two extra regenerations get a worse reading. Depth 2 was',
  'ruled on prose in `docs/qa/2026-08-19-retry-erosion.md`; this is the same kind of',
  'evidence for depth 3.',
  '',
  '## Read this first, because it bounds the verdict',
  '',
  `- **Vintage.** Gate \`${trace.gate}\`, prompt \`${trace.prompt}\`.`
  + (trace.gate === STAGE6_VERSION && trace.prompt === PROMPT_VERSION
    ? ' **Both current.**'
    : ` Today's are \`${STAGE6_VERSION}\` and \`${PROMPT_VERSION}\`, so this is a`
      + ' historical vintage. What has NOT changed is `stricterDirective` itself,'
      + ' which is the thing under judgement, so the question is still being asked'
      + ' of the code that answers it today.'),
  '- **Same chart on both sides.** A depth-1 reading of one chart against a depth-3',
  '  reading of another would confound the depth with the chart.',
  '- **Nothing is selected for quality.** Each side is the FIRST run of that chart at',
  '  that depth in run order. Picking the nicer one is sampling until the answer is',
  '  pretty, which is the rule `qa-renders.mjs` already refuses to break.',
  '- **A depth-3 reading passed the same gate as a depth-1 reading.** Both are',
  '  servable. The question is not correctness, it is whether the writing is worth',
  '  the wait.',
  '',
];

for (const { chart, one, three } of pairs) {
  const a1 = served(one);
  const a3 = served(three);
  lines.push('---');
  lines.push('');
  lines.push(`# ${chart}`);
  lines.push('');
  lines.push('| | depth 1 | depth 3 |');
  lines.push('|---|---|---|');
  lines.push(`| run | ${one.run} | ${three.run} |`);
  lines.push(`| regenerations spent | 0 | 2 |`);
  lines.push(`| characters | ${a1.prose.length} | ${a3.prose.length} |`);
  lines.push(`| paragraphs | ${a1.prose.split(/\n{2,}/).filter((p) => p.trim() && !p.trim().startsWith('#')).length} `
    + `| ${a3.prose.split(/\n{2,}/).filter((p) => p.trim() && !p.trim().startsWith('#')).length} |`);
  lines.push(`| rejected on the way | — | ${three.attempts.slice(0, 2)
    .map((a) => (a.checks || []).join(', ') || '—').join(' then ')} |`);
  lines.push('');
  lines.push(`## ${chart} — DEPTH 1 (passed on the first attempt, no directive)`);
  lines.push('');
  lines.push(a1.prose.trimEnd());
  lines.push('');
  lines.push(`## ${chart} — DEPTH 3 (passed on the third attempt, after two directives)`);
  lines.push('');
  lines.push(a3.prose.trimEnd());
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## What is NOT in this file');
lines.push('');
lines.push('No verdict, and no counted differences beyond the two neutral ones in each table.');
lines.push('The register call is Reyner\'s and a summary written above the prose would frame the');
lines.push('read before he has done it - the same reason `qa-renders.mjs` prints its readings');
lines.push('unedited under a source banner and stops there.');
lines.push('');

fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`pairs: ${pairs.map((p) => `${p.chart} (run ${p.one.run} vs run ${p.three.run})`).join(', ')}`);
