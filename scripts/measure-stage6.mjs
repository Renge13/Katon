// ============================================================
// THE LAUNCH-GATING NUMBER
// ============================================================
// Prompt H: "A script (CI-runnable) that renders the provecell fixture N times
// per chart through the live chain and reports: Stage-6 pass rate per check per
// model, regeneration rate, fallback rate. This is the number that decides
// launch readiness - it does not exist yet anywhere."
//
//   npm run measure:stage6 -- --n 3
//   npm run measure:stage6 -- --n 3 --charts 1,9,13
//   npm run measure:stage6 -- --n 3 --rider gemini-2.5-flash-lite
//   npm run measure:stage6 -- --n 1 --dry           # plan only, zero API calls
//
// ── THE THREE NUMBERS, AND WHY THEY ARE DIFFERENT ──────────
// FIRST-PASS RATE tells you whether the PROMPT works. It is the honest quality
// signal and the one that should move when renderer-prompt.txt is edited.
// SHIPPED RATE tells you whether the PIPELINE works - first pass plus the one
// regeneration. It is what a user would experience.
// FALLBACK RATE is how often the product serves the floor. Accurate, always
// available, and noticeably less good; it is a cost, not a success.
//
// Reporting only the shipped rate would hide a prompt getting worse behind a
// regeneration that keeps rescuing it, until the day it stops.
//
// ── THE RIDER ──────────────────────────────────────────────
// Per the ledger note (PROGRESS, 2026-08-02): run a second model as a RIDER in
// the SAME batch, and emit anonymised pairs for Reyner to blind-judge. Switch
// the free tier only if the two are indistinguishable. Cost is NOT the driver.
// "Do not make the rider its own project" - hence one flag, one extra column,
// and a pairs file.
//
// ── WHAT THIS SCRIPT WILL NOT DO ───────────────────────────
// It never calls persistRendered, so a measurement run cannot put prose in the
// cache that a user later reads. Measuring and shipping are different acts.
// ============================================================

import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderReading } from '../lib/render/index.js';
import { PROMPT_VERSION } from '../lib/render/prompt.js';
import { modelFor, DEFAULT_TIER, geminiConfigured } from '../lib/render/config.js';
import { STAGE6_VERSION } from '../lib/validate/index.js';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';

// ── arguments ──────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const n = Number(flag('n', 3));
const dry = has('dry');
const outDir = flag('out', 'reports');
const chartFilter = flag('charts');
const primary = flag('model', modelFor(DEFAULT_TIER, 'gemini'));
const rider = flag('rider', 'gemini-2.5-flash-lite');
const noRider = has('no-rider');

const charts = VALIDATION_CHARTS.filter(
  (c) => !chartFilter || chartFilter.split(',').map(Number).includes(c.id),
);
const arms = noRider ? [primary] : [primary, rider];

if (!Number.isFinite(n) || n < 1) {
  console.error('--n must be a positive integer');
  process.exit(2);
}

const planned = charts.length * arms.length * n;
console.error(`charts ${charts.length}  arms ${arms.join(', ')}  n ${n}`);
console.error(`prompt ${PROMPT_VERSION}  gate ${STAGE6_VERSION}`);
console.error(`planned live calls: ${planned} (plus up to ${planned} regenerations)\n`);

if (dry) {
  console.error('--dry: nothing was called.');
  process.exit(0);
}
if (!geminiConfigured()) {
  // No silent degrade. A harness that "passed" by measuring the module floor
  // would be worse than no harness, because the number would look real.
  console.error('GEMINI_API_KEY is unset. This measurement needs live calls; refusing to');
  console.error('report a number produced by the module-assembled floor.');
  process.exit(2);
}

// ── the batch ──────────────────────────────────────────────

/** check -> how many runs it failed in. Per arm. */
const stats = new Map();
const rows = [];
const pairs = [];

function armStats(model) {
  if (!stats.has(model)) {
    stats.set(model, {
      runs: 0, firstPass: 0, shipped: 0, regenerated: 0, fallback: 0, hard: 0,
      errors: 0, checks: new Map(),
    });
  }
  return stats.get(model);
}

for (const testChart of charts) {
  const semantic = buildSemanticJson(calculateBaziChart({
    birthDate: testChart.date, birthTime: testChart.time,
  }));

  for (let run = 1; run <= n; run += 1) {
    const perArm = {};

    for (const model of arms) {
      const s = armStats(model);
      s.runs += 1;

      let result;
      try {
        result = await renderReading(semantic, {
          modelOverride: model,
          // A hit would return a previous run's prose and quietly count as a
          // pass, which is the one thing a measurement must not do.
          allowUnvalidatedCache: false,
        });
      } catch (err) {
        s.errors += 1;
        rows.push({ chart: testChart.id, run, model, outcome: 'error', error: err.message });
        continue;
      }

      const attempts = result.attempts || [];
      const firstStage6 = attempts.find((a) => a.stage6 || a.ok === true);
      const firstPass = Boolean(firstStage6?.ok);
      const regenerated = attempts.some((a) => a.regenerated);
      const fallback = result.source === 'module_assembly';

      if (firstPass) s.firstPass += 1;
      if (!fallback) s.shipped += 1;
      if (regenerated) s.regenerated += 1;
      if (fallback) s.fallback += 1;
      if (attempts.some((a) => a.hard)) s.hard += 1;

      for (const attempt of attempts) {
        for (const check of attempt.stage6 || []) {
          s.checks.set(check, (s.checks.get(check) || 0) + 1);
        }
      }

      rows.push({
        chart: testChart.id,
        run,
        model,
        outcome: fallback ? 'fallback' : 'served',
        first_pass: firstPass,
        regenerated,
        failed_checks: attempts.flatMap((a) => a.stage6 || []),
      });

      if (!fallback) perArm[model] = result;
    }

    // Anonymised A/B pair, one per chart per run, when both arms produced prose.
    if (arms.length === 2 && perArm[arms[0]] && perArm[arms[1]]) {
      const flip = Math.random() < 0.5;
      const [left, right] = flip ? [arms[1], arms[0]] : arms;
      pairs.push({
        id: randomUUID().slice(0, 8),
        chart: testChart.id,
        run,
        // The key is written to a SEPARATE file so the judging file can be read
        // without accidentally seeing which arm is which.
        A: readingText(perArm[left]),
        B: readingText(perArm[right]),
        _key: { A: left, B: right },
      });
    }
  }
}

// ── the report ─────────────────────────────────────────────

const pct = (a, b) => (b === 0 ? '  n/a' : `${((a / b) * 100).toFixed(1).padStart(5)}%`);

console.log('\nSTAGE 6 MEASUREMENT');
console.log(`prompt_version ${PROMPT_VERSION}   stage6_version ${STAGE6_VERSION}`);
console.log(`charts ${charts.map((c) => c.id).join(',')}   n=${n} per chart per arm\n`);

console.log('model                       runs  first-pass   shipped  regen  fallback  hard  err');
for (const [model, s] of stats) {
  console.log(
    `${model.padEnd(26)}${String(s.runs).padStart(5)}`
    + `${pct(s.firstPass, s.runs).padStart(12)}`
    + `${pct(s.shipped, s.runs).padStart(10)}`
    + `${pct(s.regenerated, s.runs).padStart(7)}`
    + `${pct(s.fallback, s.runs).padStart(10)}`
    + `${String(s.hard).padStart(6)}${String(s.errors).padStart(5)}`,
  );
}

console.log('\nFAILURES BY CHECK (count of attempts each check rejected)');
for (const [model, s] of stats) {
  console.log(`\n  ${model}`);
  const sorted = [...s.checks].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) console.log('    (none)');
  for (const [check, count] of sorted) {
    console.log(`    ${check.padEnd(34)} ${String(count).padStart(4)}`);
  }
}

mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const base = `${outDir}/stage6-${stamp}`;

writeFileSync(`${base}-runs.json`, `${JSON.stringify({
  prompt_version: PROMPT_VERSION,
  stage6_version: STAGE6_VERSION,
  n,
  arms,
  charts: charts.map((c) => c.id),
  summary: Object.fromEntries([...stats].map(([m, s]) => [m, {
    ...s, checks: Object.fromEntries(s.checks),
  }])),
  rows,
}, null, 2)}\n`);

if (pairs.length > 0) {
  // Judging file: no model names anywhere in it.
  writeFileSync(`${base}-pairs.json`, `${JSON.stringify(
    pairs.map(({ _key, ...rest }) => rest), null, 2,
  )}\n`);
  writeFileSync(`${base}-pairs-KEY.json`, `${JSON.stringify(
    pairs.map((p) => ({ id: p.id, ...p._key })), null, 2,
  )}\n`);
  console.log(`\nblind-judge pairs: ${base}-pairs.json`);
  console.log(`  the key is in ${base}-pairs-KEY.json - do not open it first.`);
  console.log('  Switch the free tier only if the two arms are indistinguishable.');
  console.log('  Cost is not the driver (PROGRESS, 2026-08-02).');
}
console.log(`\nfull run log: ${base}-runs.json`);

function readingText(result) {
  const body = (result.blocks || [])
    .map((b) => `${b.heading ? `## ${b.heading}\n` : ''}${b.text}`)
    .join('\n\n');
  return result.penutup ? `${body}\n\n${result.penutup}` : body;
}
