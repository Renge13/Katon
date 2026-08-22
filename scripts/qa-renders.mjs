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
// The regeneration budget, imported rather than described in prose. The artifact's own
// sentence about "one initial plus N regenerations" is generated from this.
import { REGENERATION_BUDGET } from '../lib/render/config.js';
// The threshold this artifact exists to make fittable. Imported rather than retyped so
// the printed number cannot drift from the one the gate actually used.
import { COVERAGE_PARAMS, STAGE6_VERSION } from '../lib/validate/index.js';

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

// ── IT REFUSES TO OVERWRITE AN ARTIFACT. ───────────────────
// Added 2026-08-21 because the default path DESTROYED a committed measurement. The
// default is `docs/qa/<today>-renders.md`, commit 1's n=1 artifact was already at
// that path from earlier the same day, and the n=10 run silently replaced it. It was
// recovered from git, but only because it had been committed - an uncommitted probe
// result would simply be gone.
//
// An artifact is EVIDENCE. This repo's standing rule is that evidence is never
// edited after the fact, and a same-day rerun is the one way to edit it by accident.
// So the harness refuses and names the file. `--force` exists for the case where
// overwriting is the actual intent, and is deliberately not the default.
if (!ESTIMATE && fs.existsSync(OUT) && !process.argv.includes('--force')) {
  console.error(`\nREFUSING: ${path.relative(ROOT, OUT)} already exists.`);
  console.error('An artifact is evidence and is never edited after the fact. This is what a');
  console.error('same-day rerun does by accident - it destroyed a committed measurement once.');
  console.error('\nPass --out <FILE> to write elsewhere, or --force to overwrite deliberately.');
  process.exit(2);
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
//              transport retry separate from the regeneration budget, so a
//              truncated run means Gemini failed its transport budget outright.
//              (This comment said "fails over to OpenAI, so a truncated run means
//              BOTH providers failed" until 2026-08-22. There is no secondary any
//              more - #63 deleted it - and it had never once executed.)
const results = [];
for (const c of CHARTS) {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  const runs = [];

  for (let run = 1; run <= N; run++) {
    process.stderr.write(`${c.label} run ${run}/${N} ... `);
    // allowUnvalidatedCache is a QA affordance and it is reported, never hidden:
    // a cache hit is a previous run's prose, not this one's.
    const r = await renderReading(semantic, {
      allowUnvalidatedCache: true,
      // Banks every attempt's prose for the sidecar trace. See the TRACE block at
      // the end of this file for why a rate without its prose keeps costing money.
      captureProse: true,
      // SPEND GUARDS OFF. Not a convenience - guard (a) caps renders per cache key
      // at 3/hour, and this renders ONE chart n times in a few minutes, so runs 4+
      // would be refused into the floor and the artifact would report a floor rate
      // that is the guard's own doing. A measurement instrument must not be subject
      // to the thing it measures.
      spendGuards: false,
    });
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

// TWO DIFFERENT THINGS, AND CONFLATING THEM WAS A DEFECT I SHIPPED FOR ONE RUN.
// `everFloored` is "this chart floored at least once across n runs" - a property of
// the RATE. `printedFloors` is "the reading printed below is a floor" - a property of
// RUN 1, which is the only run whose prose this file shows. At n=1 they were the same
// number and the banner was correct by accident. At n=10 the 08-21 artifact said
// "3 of 4 ARE THE FLOOR" above four readings that were all `gemini`, which is the
// harness-disagrees-with-its-own-artifact defect this file was corrected for once
// already.
const everFloored = results.filter((x) => x.stats.floored > 0);
const printedFloors = results.filter((x) => x.r.source !== 'gemini');
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
// ── THE COVERAGE DISTRIBUTION, WHICH IS WHY fieldOverlap CAN BE FITTED ──
// Added 2026-08-21, BEFORE the verification run rather than after it, because item 3 of
// the floor-cause fix list cannot be worked without it and a run that omits it has to be
// paid for twice.
//
// `COVERAGE_PARAMS.fieldOverlap` is UNFITTED by its own docblock, which says "the harness
// reports the distribution". coverage.js has been RECORDING it - every check, pass or
// fail - and nothing was writing it out. A threshold set from rejections alone cannot
// tell "nothing came near the line" from "half the corpus sits one stem above it", which
// is the whole argument for collecting passes too.
//
// THE CHECK IS A CONJUNCTION, so a one-dimensional histogram would mislead: a field fails
// only when `ratio < fieldOverlap` AND `hits < fieldMinHits`. An entry under the ratio
// line that carries 2+ hits is RESCUED, and counting it as a near-miss would overstate
// how much moving the threshold would buy. Both are reported.
const covEntries = results.flatMap((x) => x.runs.flatMap((run) => [
  ...((run.r.stage6_metrics?.coverage) || []),
  ...((run.r.attempts || []).flatMap((a) => (a.stage6_metrics?.coverage) || [])),
]));

if (covEntries.length) {
  const T = COVERAGE_PARAMS.fieldOverlap;
  const MIN_HITS = COVERAGE_PARAMS.fieldMinHits;
  lines.push('## COVERAGE DISTRIBUTION, so `fieldOverlap` can be fitted from data');
  lines.push('');
  lines.push(`\`fieldOverlap\` = **${T}**, \`fieldMinHits\` = **${MIN_HITS}**. A field fails only when`);
  lines.push('ratio is under the threshold AND hits are under the minimum, so the two columns are not');
  lines.push('interchangeable. Every observation is here, passing and failing both - a threshold fitted');
  lines.push('from rejections alone cannot tell "nothing came near the line" from "half the corpus sits');
  lines.push('one stem above it".');
  lines.push('');
  lines.push('| ratio bucket | observations | of which hits >= ' + MIN_HITS + ' (rescued) | would FAIL |');
  lines.push('|---|---|---|---|');
  const BUCKETS = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.6, 1.01];
  for (let i = 0; i < BUCKETS.length - 1; i++) {
    const lo = BUCKETS[i];
    const hi = BUCKETS[i + 1];
    const inB = covEntries.filter((e) => e.ratio >= lo && e.ratio < hi);
    if (!inB.length) continue;
    const rescued = inB.filter((e) => e.hits >= MIN_HITS).length;
    const failing = inB.filter((e) => e.ratio < T && e.hits < MIN_HITS).length;
    const mark = hi <= T ? ' **(under threshold)**' : '';
    lines.push(`| ${lo.toFixed(2)} - ${hi >= 1 ? '1.00' : hi.toFixed(2)}${mark} `
      + `| ${inB.length} | ${rescued} | ${failing} |`);
  }
  const failing = covEntries.filter((e) => e.ratio < T && e.hits < MIN_HITS);
  lines.push(`| **TOTAL** | **${covEntries.length}** | `
    + `**${covEntries.filter((e) => e.hits >= MIN_HITS).length}** | **${failing.length}** |`);
  lines.push('');
  lines.push(`${failing.length} of ${covEntries.length} observations would fail `
    + `(${Math.round((failing.length / covEntries.length) * 100)}%).`);
  lines.push('');

  // Which FIELDS fail, because "coverage" is four different demands wearing one name.
  const byField = {};
  for (const e of failing) byField[e.field] = (byField[e.field] || 0) + 1;
  const ranked = Object.entries(byField).sort((a, b) => b[1] - a[1]);
  if (ranked.length) {
    lines.push('Failing observations by FIELD - `coverage` is four different demands under one name:');
    lines.push('');
    lines.push('| field | failing |');
    lines.push('|---|---|');
    for (const [f, n] of ranked) lines.push(`| \`${f}\` | ${n} |`);
    lines.push('');
  }
}

// ── FLAG RATES ACROSS ALL n RUNS, NOT JUST THE PRINTED ONE ──
// Added after the 08-21 n=10 run could not answer the question it was run for. Flags
// are the repo's "count it before you gate it" mechanism - `opening.element_fused`
// exists precisely so the fusion can be measured before anyone trades a floor rate
// for it - and this file was recording findings for RUN 1 ONLY. So a 40-run
// measurement produced a 4-run flag denominator, which is not the instrument the
// decision is waiting on.
//
// THE DENOMINATOR IS RENDERED RUNS, NOT ALL RUNS, and that is not a technicality: a
// floored run has no model opening to judge, so counting it would dilute the rate with
// runs that could not have exhibited the thing being counted.
const flagNames = [...new Set(results.flatMap((x) => x.runs
  .flatMap((run) => (run.r.findings || [])
    .filter((f) => f.severity === 'flag')
    .map((f) => f.check))))].sort();

if (flagNames.length) {
  lines.push(`## FLAG RATES across all ${N} run(s) per chart`);
  lines.push('');
  lines.push(`| Chart | rendered runs | ${flagNames.join(' | ')} |`);
  lines.push(`|---|---|${flagNames.map(() => '---').join('|')}|`);
  const totals = Object.fromEntries(flagNames.map((n) => [n, 0]));
  let renderedTotal = 0;
  for (const x of results) {
    const rendered = x.runs.filter((run) => run.r.source === 'gemini');
    renderedTotal += rendered.length;
    const cells = flagNames.map((name) => {
      const hits = rendered.filter((run) => (run.r.findings || [])
        .some((f) => f.check === name)).length;
      totals[name] += hits;
      return rendered.length ? `${hits}/${rendered.length}` : 'n/a';
    });
    lines.push(`| ${x.label} | ${rendered.length} | ${cells.join(' | ')} |`);
  }
  lines.push(`| **POOLED** | **${renderedTotal}** | `
    + `${flagNames.map((n) => `**${totals[n]}/${renderedTotal}**`).join(' | ')} |`);
  lines.push('');
  lines.push('A flag never rejects. The DENOMINATOR IS RENDERED RUNS: a floored run has no model');
  lines.push('output to judge, so including it would dilute the rate with runs that could not have');
  lines.push('exhibited the thing being counted.');
  lines.push('');
}

if (printedFloors.length) {
  lines.push(`## ⚠ ${printedFloors.length} of ${results.length} READINGS BELOW ARE THE FLOOR, NOT A READING`);
  lines.push('');
  lines.push('`source: module_assembly` means Stage 6 rejected the model on every attempt in its');
  lines.push('budget - one initial plus two regenerations since 2026-08-19, so THREE, not the two');
  lines.push('this banner used to claim - and the reader was served');
  lines.push('**module assembly** — the deterministic floor, which renders glossary strings Reyner already');
  lines.push('ruled. It is fluent Indonesian and it is indistinguishable from a reading by eye. A register');
  lines.push('or quality verdict formed on one of these is a verdict on the glossary, not on the renderer.');
  lines.push('');
  // NAMES THE PRINTED RUN AND NOTHING ELSE. This bullet used to say "failed twice
  // on: <checks>" using RUN 1's attempts for any chart that floored at ALL, so on the
  // 08-21 n=10 artifact it labelled three rendered runs as floors and printed their
  // non-final rejections as floor reasons - one line came out empty because that
  // chart's run 1 passed at attempt one. Floor reasons now live in their own section,
  // covering every floored run rather than one.
  for (const f of printedFloors) {
    lines.push(`- **${f.label}** (${f.date} ${f.time}) — the reading printed below is `
      + `\`${f.r.source}\`, from run 1 of ${N}.`);
  }
  lines.push('');
  lines.push('**They are included below anyway, labelled**, because what the floor produces is worth');
  lines.push('seeing next to what the model produces. Read the banner before the prose, every time.');
  lines.push('');
}

lines.push('---');
lines.push('');

// ── EVERY FLOORED RUN, WITH ITS REJECTION LIST ─────────────
// Added 2026-08-21 after the n=10 run could not answer the question it was paid for.
// This file was recording per-attempt detail for RUN 1 ONLY, so a 40-run measurement
// produced a floor RATE with no floor REASONS behind it - the eight floored runs'
// rejection lists were never written down and the money is spent.
//
// Worse, the old banner printed run 1's attempts under the heading "failed twice on"
// for any chart that floored at all. Run 1 had RENDERED on all four charts, so the
// artifact labelled rendered runs as floors and listed their non-final rejections as
// floor reasons. One chart's line came out empty because its run 1 passed at attempt
// one. That is the third instance in this file of a summary disagreeing with the runs
// underneath it.
const flooredRuns = results.flatMap((x) => x.runs
  .map((run, i) => ({ chart: x.label, run: i + 1, ...run }))
  .filter((run) => run.r.source !== 'gemini' && !run.truncated));

if (flooredRuns.length) {
  lines.push(`## THE ${flooredRuns.length} FLOORED RUN(S), AND WHY EACH ONE FLOORED`);
  lines.push('');
  lines.push('Every floored run across all runs, not only the printed one. A run floors when Stage 6');
  lines.push(`rejected every attempt in the regeneration budget - one initial plus ${REGENERATION_BUDGET} `
    + 'regeneration(s). THE NUMBER IS READ FROM `lib/render/config.js`, never written here: this '
    + 'sentence said "plus two regenerations" as a literal until 2026-08-22, which would have '
    + 'described the wrong gate the moment the budget moved.');
  lines.push('Transport-truncated runs are NOT here: they are listed separately and were never');
  lines.push('floored by the gate.');
  lines.push('');
  lines.push('| Chart | run | attempt | rejected on |');
  lines.push('|---|---|---|---|');
  for (const f of flooredRuns) {
    const attempts = f.r.attempts || [];
    if (!attempts.length) {
      lines.push(`| ${f.chart} | ${f.run} | — | *(no attempts recorded)* |`);
      continue;
    }
    for (const [i, a] of attempts.entries()) {
      const checks = (a.stage6 || []).join(', ') || a.error || '*(none recorded)*';
      lines.push(`| ${i === 0 ? f.chart : ''} | ${i === 0 ? f.run : ''} | ${i + 1} `
        + `| ${checks}${a.hard ? ' **(HARD)**' : ''} |`);
    }
  }
  lines.push('');

  // The tally, so a fix list can be ranked without counting table rows by hand.
  const tally = {};
  for (const f of flooredRuns) {
    for (const a of f.r.attempts || []) {
      for (const c of a.stage6 || []) tally[c] = (tally[c] || 0) + 1;
    }
  }
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (ranked.length) {
    lines.push('Checks by how often they fired inside a floored run:');
    lines.push('');
    lines.push('| check | fired |');
    lines.push('|---|---|');
    for (const [c, n] of ranked) lines.push(`| \`${c}\` | ${n} |`);
    lines.push('');
  }
}

// ── THE REJECTION MESSAGES, FOR EVERY REJECTED ATTEMPT ─────
// Added 2026-08-22, and it is the same lesson one level deeper. The 08-21 run
// produced a floor RATE with no floor REASONS. The fix recorded the check NAMES.
// This run then made `fact.condition_named` the leading floor cause at 16 firings
// and the names could not say WHICH OF ITS TWO PASSES fired - the fact's own
// `label_bracket` surfacing, or any name-with-bracket construction inside a
// conditions-only block. Those are a prompt gap and an over-broad check
// respectively, they call for opposite fixes, and the prose that would have
// separated them is gone the moment the process exits.
//
// So: the MESSAGE for every rejecting finding of every rejected attempt, in every
// run, floored or not. A check name is an index; the message is the evidence, and
// it is the message that carries the matched text.
//
// NOT ONLY FLOORED RUNS. A run that passes at attempt 2 still rejected at attempt
// 1, and that rejection is a real observation of the gate that the floored-run
// table above throws away by construction.
const rejectedAttempts = results.flatMap((x) => x.runs.flatMap((run, i) => (run.r.attempts || [])
  .map((a, j) => ({ chart: x.label, run: i + 1, attempt: j + 1, a, run_r: run.r, truncated: run.truncated }))
  .filter(({ a }) => (a.stage6 || []).length > 0)));

if (rejectedAttempts.length) {
  lines.push(`## EVERY REJECTED ATTEMPT, WITH THE FINDING'S OWN MESSAGE (${rejectedAttempts.length})`);
  lines.push('');
  lines.push('Across ALL runs, not only floored ones. `outcome` says what became of the run this');
  lines.push('attempt belongs to, so a rejection that a later attempt fixed is not read as a floor.');
  lines.push('');
  for (const { chart, run, attempt, a, run_r: rr, truncated } of rejectedAttempts) {
    const outcome = truncated ? 'transport-truncated'
      : (rr.source === 'gemini' ? 'run RENDERED' : 'run FLOORED');
    lines.push(`**${chart}, run ${run}, attempt ${attempt}** — ${outcome}`
      + `${a.hard ? ' — **HARD**' : ''}`);
    lines.push('');
    const detail = a.stage6_detail || (a.stage6 || []).map((c) => ({ check: c, message: null }));
    for (const d of detail) {
      const msg = (d.message || '*(no message recorded - attempt predates stage6_detail)*')
        .replace(/\s+/g, ' ').slice(0, 400);
      lines.push(`- \`${d.check}\` — ${msg}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('');
}

// ── RETRY EROSION: WHAT THE STRICTER DIRECTIVE BREAKS ──────
// `stricterDirective` names the failed checks to the model, and the 08-19 erosion
// probe measured what that costs the PROSE at depth 2. This measures a different
// cost that no probe has ever reported: whether a regeneration introduces checks
// the previous attempt had PASSED. That is the mechanism behind the chase the
// archetype demotion was ruled on - a bracket finding at attempt N followed by an
// opening finding at N+1 - and it is the thing that decides whether a DEEPER
// budget buys floors or just trades findings for findings.
//
// FIXED means present at attempt N and gone at N+1. NEW means absent at N and
// present at N+1. A step that is all-fixed is the budget working; a step with NEW
// findings is the directive breaking something to satisfy something else.
const steps = [];
for (const x of results) {
  for (const [i, run] of x.runs.entries()) {
    const atts = (run.r.attempts || []).filter((a) => (a.stage6 || []).length > 0 || a.ok);
    for (let j = 0; j + 1 < atts.length; j++) {
      const before = new Set(atts[j].stage6 || []);
      const after = new Set(atts[j + 1].stage6 || []);
      steps.push({
        chart: x.label,
        run: i + 1,
        step: `${j + 1} -> ${j + 2}`,
        depth: j + 1,
        fixed: [...before].filter((c) => !after.has(c)),
        kept: [...before].filter((c) => after.has(c)),
        added: [...after].filter((c) => !before.has(c)),
      });
    }
  }
}

if (steps.length) {
  const byDepth = {};
  for (const s of steps) {
    const d = (byDepth[s.depth] ||= { steps: 0, withNew: 0, newCount: 0, keptCount: 0 });
    d.steps += 1;
    if (s.added.length) d.withNew += 1;
    d.newCount += s.added.length;
    d.keptCount += s.kept.length;
  }
  lines.push('## RETRY EROSION IN FINDINGS — does a regeneration break what it had passed?');
  lines.push('');
  lines.push('| step | regeneration steps | steps introducing a NEW check | new checks | checks that SURVIVED the directive |');
  lines.push('|---|---|---|---|---|');
  for (const d of Object.keys(byDepth).sort()) {
    const v = byDepth[d];
    lines.push(`| attempt ${d} -> ${Number(d) + 1} | ${v.steps} | ${v.withNew} `
      + `(${Math.round((v.withNew / v.steps) * 100)}%) | ${v.newCount} | ${v.keptCount} |`);
  }
  lines.push('');
  lines.push('A check in the SURVIVED column was named to the model by `stricterDirective` and fired');
  lines.push('again anyway. A check that survives every step of the budget is not short of chances.');
  lines.push('');
  lines.push('| Chart | run | step | fixed | survived | NEW |');
  lines.push('|---|---|---|---|---|---|');
  for (const s of steps) {
    lines.push(`| ${s.chart} | ${s.run} | ${s.step} | ${s.fixed.join(', ') || '—'} `
      + `| ${s.kept.join(', ') || '—'} | ${s.added.join(', ') || '—'} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
}

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
  // THE DEPTH THIS READING WAS SERVED AT. Absent until 2026-08-22, and its absence
  // was why the budget-3 artifact could not supply a depth-1 reading for the
  // erosion read: run 1 landed at depth 3, 2, 4 and 3 on the four charts and the
  // file never said so, so nobody could tell that the pair was missing.
  lines.push(`| served at attempt | ${(r.attempts || []).findIndex((a) => a.ok) + 1 || '— (floor)'} `
    + `of ${(r.attempts || []).length || '—'} |`);
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

// ── THE SIDECAR TRACE: EVERY ATTEMPT'S PROSE, BANKED ───────
// Added 2026-08-22. The .md is what a human reads and it prints ONE reading per
// chart, always run 1, because choosing a nicer run is sampling until the answer
// is pretty. That rule is right and it has a cost: the prose of the other 90-odd
// attempts is destroyed when the process exits, and twice now a question has come
// back that the prose would have answered for free.
//
//   1. the 08-22 verify run made `fact.condition_named` the leading floor cause
//      and could not say which of its two passes fired;
//   2. the budget-3 run measured findings-erosion at depth 3 and could not supply
//      a depth-1 reading beside a depth-3 one, because run 1 was never depth 1.
//
// `probe-retry-depth` solved this on 08-18 by writing a sidecar JSON, and that one
// file has since answered four separate questions at zero cost - including both of
// the above, at the wrong vintage. So this writes one too. It is EVIDENCE, in the
// same sense the .md is: generated, verbatim, not edited.
//
// The .md is still the artifact. This is the tape.
const TRACE = OUT.replace(/\.md$/, '.json');
fs.writeFileSync(TRACE, `${JSON.stringify({
  generated: today,
  prompt: PROMPT_VERSION,
  gate: STAGE6_VERSION,
  regeneration_budget: REGENERATION_BUDGET,
  n: N,
  runs: results.flatMap((x) => x.runs.map((run, i) => ({
    chart: x.label,
    run: i + 1,
    source: run.r.source,
    truncated: run.truncated,
    cached: run.r.cached,
    servedAt: (run.r.attempts || []).findIndex((a) => a.ok) + 1 || null,
    attempts: (run.r.attempts || []).map((a) => ({
      provider: a.provider,
      ok: Boolean(a.ok),
      checks: a.stage6 || [],
      detail: a.stage6_detail || [],
      error: a.error,
      // The prose of a REJECTED attempt is the thing nothing else keeps. A passing
      // attempt's prose is the served reading and is recoverable from the row.
      prose: a.prose ?? null,
    })),
  }))),
}, null, 2)}\n`);

console.error(`\nwrote ${path.relative(ROOT, OUT)}`);
console.error(`wrote ${path.relative(ROOT, TRACE)} (the tape: every attempt, verbatim)`);
console.error(`printed readings: ${results.length - printedFloors.length} real render(s), `
  + `${printedFloors.length} floor(s).`);
if (printedFloors.length) {
  console.error(`PRINTED FLOOR: ${printedFloors.map((f) => f.label).join(', ')} `
    + '— these are not readings.');
}
if (N > 1) {
  console.error(`floored at least once across ${N} runs: `
    + `${everFloored.length} of ${results.length} chart(s)`);
}
