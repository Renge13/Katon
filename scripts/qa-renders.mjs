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
// ── IT RUNS EACH CHART n TIMES, AND THAT REPLACES A RULE ───
// PROMOTED AHEAD OF THE PDF, 2026-08-21. This file used to run each chart ONCE and
// said so as a principle: "Re-running a floor until it renders is not QA, it is
// sampling until the answer is nice." THAT PRINCIPLE IS INTACT AND THIS IS NOT A
// REVERSAL. Re-running until the answer is nice is still forbidden - what changed is
// that a SINGLE run turned out not to measure anything either.
//
// Three consecutive runs of these same four charts returned floor rates of 0/4, 2/4
// and 1/4, with the failing checks identical and untouched between runs
// (`style.hedging`, `coverage.field_dropped`, `fact.strength_*`). Precondition 3 is
// ruled STRICT - every chart must RENDER and would be sold - so the launch gate was
// being argued from an instrument that cannot read it. That is the 08-17 "floor rate
// moves between identical batches" finding surfacing on a third metric.
//
// So: n runs per chart, the floor rate printed BESIDE each verdict, per-chart and
// pooled. What is NOT allowed is picking which run to show - the prose printed under
// each chart is ALWAYS RUN 1, labelled as one of n, because a cold cache is what a
// real reader meets and choosing a nicer run is the thing the old principle forbids.
//
// ── THE 503 EXCLUSION, CARRIED OVER DELIBERATELY ───────────
// `probe-retry-depth` learned this on 2026-08-19 and it is the same trap here: a run
// whose chain was cut short by a provider transport error has NOT been floored by the
// gate, and counting it as a floor is how a 3% floor was once reported where the gate
// had floored 0 of 39. Transport-truncated runs are EXCLUDED from the scored
// denominator and printed in their own column, so the rate always says what it
// measured.
//
// ── A CACHE HIT WOULD MAKE THIS A LIE, SO IT IS CHECKED ────
// `renderReading` READS the cache and only `persistRendered` writes, so n calls
// normally mean n real renders. But if a row already exists for a chart's key, every
// run returns the same stored prose and the "floor rate" becomes one sample repeated
// n times. Any cached run therefore invalidates that chart's rate loudly rather than
// quietly, and `--n 1` keeps the old single-render behaviour for comparability with
// every artifact already in docs/qa/.
//
// ── COST IS REPORTED BEFORE IT IS SPENT ────────────────────
//   npm run qa:renders -- --n 10 --estimate    prints the projection, spends nothing
//
// The projection is computed from the ledger's own measured figures rather than from
// a guess, and the constants name their source below.
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

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : null;
};
const N = Math.max(1, Number(flag('n') ?? 1) || 1);
const ESTIMATE = process.argv.includes('--estimate');

// ── THE COST MODEL, FROM THE LEDGER AND NOT FROM A GUESS ───
// Every constant here is a measured figure with its source, so a projection can be
// checked rather than trusted. Update them when the ledger moves, never by feel.
const COST = {
  // probe-retry-depth, 08-18: 4 charts x 10 runs = 78 attempts for ~Rp 6,200.
  rupiahPerAttempt: 6200 / 78,
  // PROGRESS "THE REGENERATION BUDGET IS 2": 1.88 provider calls per reading at
  // depth 2, computed off the 08-18 trace by truncation.
  attemptsPerRun: 1.88,
  // PROGRESS "RETRY DEPTH, MEASURED": one call p50 7.6s, p90 15.4s, n=77.
  secondsPerAttemptP50: 7.6,
  secondsPerAttemptP90: 15.4,
};

const plannedAttempts = CHARTS.length * N * COST.attemptsPerRun;
const projection = {
  runs: CHARTS.length * N,
  attempts: Math.round(plannedAttempts),
  rupiah: Math.round(plannedAttempts * COST.rupiahPerAttempt),
  minutesP50: (plannedAttempts * COST.secondsPerAttemptP50) / 60,
  minutesP90: (plannedAttempts * COST.secondsPerAttemptP90) / 60,
};

const projectionLines = [
  `n = ${N} per chart x ${CHARTS.length} charts = ${projection.runs} runs`,
  `expected provider attempts   ~${projection.attempts}   (${COST.attemptsPerRun} per run, measured 08-19)`,
  `expected spend               ~Rp ${projection.rupiah.toLocaleString('en-US')}`
    + `   (Rp ${COST.rupiahPerAttempt.toFixed(0)}/attempt, from probe-retry-depth 08-18)`,
  `expected wall clock          ~${projection.minutesP50.toFixed(1)} min p50, `
    + `~${projection.minutesP90.toFixed(1)} min p90, sequential`,
];

if (ESTIMATE) {
  process.stderr.write('\nqa:renders COST PROJECTION (nothing spent, nothing written)\n\n');
  for (const l of projectionLines) process.stderr.write('  ' + l + '\n');
  process.stderr.write('\nRun again without --estimate to spend it.\n');
  process.exit(0);
}

// ── the runs ───────────────────────────────────────────────
// A run is classified three ways, and the distinction is the whole point:
//   served     the reader would get the model's prose
//   floored    Stage 6 rejected it to exhaustion -> module assembly
//   truncated  a provider transport error ended the chain. NOT a gate floor, and
//              EXCLUDED from the rate - probe-retry-depth learned that on 08-19,
//              where one 503 was the whole difference between a reported 3% floor
//              and a real 0 of 39. IT IS RARER HERE THAN IN THAT PROBE, and worse
//              when it happens: this runs the PRODUCTION chain, which keeps the
//              transport retry separate from the regeneration budget and fails
//              over to OpenAI, so a truncated run means BOTH providers failed.
const results = [];
for (const c of CHARTS) {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  const runs = [];

  for (let run = 1; run <= N; run++) {
    process.stderr.write(`${c.label} run ${run}/${N} ... `);
    // allowUnvalidatedCache is a QA affordance and it is reported, never hidden:
    // a cache hit is a previous run's prose, not this one's.
    const r = await renderReading(semantic, { allowUnvalidatedCache: true });
    const truncated = r.source !== 'gemini'
      && (r.attempts || []).some((a) => a.error && !(a.stage6 || []).length);
    runs.push({ r, truncated });
    process.stderr.write(`${r.source}${r.cached ? ' (CACHED)' : ''}`
      + `${truncated ? ' (transport-truncated)' : ''}\n`);
  }

  const cached = runs.filter((x) => x.r.cached).length;
  const truncated = runs.filter((x) => x.truncated).length;
  const scored = runs.length - truncated;
  const floored = runs.filter((x) => x.r.source !== 'gemini' && !x.truncated).length;
  results.push({
    ...c,
    semantic,
    // RUN 1, ALWAYS. Never a chosen run - see the header.
    r: runs[0].r,
    runs,
    stats: {
      n: runs.length,
      scored,
      floored,
      truncated,
      cached,
      floorPct: scored ? Math.round((floored / scored) * 100) : null,
    },
  });
}

const floors = results.filter((x) => x.stats.floored > 0);
const pooled = results.reduce((a, x) => ({
  n: a.n + x.stats.n,
  scored: a.scored + x.stats.scored,
  floored: a.floored + x.stats.floored,
  truncated: a.truncated + x.stats.truncated,
  cached: a.cached + x.stats.cached,
}), { n: 0, scored: 0, floored: 0, truncated: 0, cached: 0 });
const pooledPct = pooled.scored ? Math.round((pooled.floored / pooled.scored) * 100) : null;

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

// ── THE FLOOR RATE, BESIDE THE VERDICT AND POOLED ──────────
// The reason this file runs n times at all. A single render cannot read precondition
// 3: three consecutive n=1 runs of these four charts gave 0/4, 2/4 and 1/4 with the
// failing checks identical.
lines.push(`## FLOOR RATE, n = ${N} per chart`);
lines.push('');
lines.push('| Chart | runs | scored | floored | floor rate | transport-truncated | cached |');
lines.push('|---|---|---|---|---|---|---|');
for (const x of results) {
  const s = x.stats;
  lines.push(`| ${x.label} | ${s.n} | ${s.scored} | ${s.floored} | `
    + `**${s.floorPct === null ? 'n/a' : `${s.floorPct}%`}** | ${s.truncated} | ${s.cached} |`);
}
lines.push(`| **POOLED** | **${pooled.n}** | **${pooled.scored}** | **${pooled.floored}** | `
  + `**${pooledPct === null ? 'n/a' : `${pooledPct}%`}** | **${pooled.truncated}** | **${pooled.cached}** |`);
lines.push('');
lines.push('`scored` is the denominator the rate uses. A run whose chain was cut short by a provider');
lines.push('transport error is EXCLUDED, because the gate did not floor it - the trap');
lines.push('`probe-retry-depth` hit on 2026-08-19, where one 503 was the whole difference between a');
lines.push('reported 3% floor and a real 0 of 39.');
lines.push('');
if (pooled.cached) {
  lines.push(`## ⚠ ${pooled.cached} RUN(S) CAME FROM THE CACHE. THE RATES ABOVE ARE NOT VALID.`);
  lines.push('');
  lines.push('A cached run is a previous run\'s prose, so n calls stopped being n renders and the rate');
  lines.push('is one sample repeated. Clear the row for the affected chart, or run with a moved');
  lines.push('`ENGINE_VERSION`, and measure again.');
  lines.push('');
}
if (N === 1) {
  lines.push('**n = 1, SO THERE IS NO RATE HERE, only an observation.** Precondition 3 cannot be read');
  lines.push('off a single render: three consecutive n=1 runs of these four charts returned 0/4, 2/4');
  lines.push('and 1/4 with identical failing checks. Use `--n 10` to measure.');
  lines.push('');
}
if (floors.length) {
  lines.push(`## ⚠ ${floors.length} of ${results.length} ARE THE FLOOR, NOT A READING`);
  lines.push('');
  lines.push('`source: module_assembly` means Stage 6 rejected the model on every attempt in its');
  lines.push('budget - one initial plus two regenerations since 2026-08-19, so THREE, not the two');
  lines.push('this banner used to claim - and the reader was served');
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
