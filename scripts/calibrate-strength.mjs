// ============================================================
// STRENGTH_PARAMS calibration harness
// ============================================================
// Grid-searches the five 得令 seasonal multipliers against Oracle 2 (Joey's bar
// rank order) and reports the best achievable score, plus two structural
// diagnostics that say WHY the ceiling is where it is.
//
// Run: npm run calibrate:strength
//
// WHAT THIS ESTABLISHED (2026-08-01, 25,000 combinations)
// The ceiling is 2/13 exact top-3 rank order. The target is 11/13. The five
// seasonal multipliers CANNOT reach it at any setting, so the remaining gap is
// a model-shape problem, not a tuning problem. Do not keep turning these knobs
// expecting 11/13 — see the two diagnostics below for where the shape is wrong.
//
// This script mutates STRENGTH_PARAMS in memory only. It writes nothing.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeStrength, STRENGTH_PARAMS } from '../lib/bazi/strength.ts';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';
import { STEM_ELEMENTS } from '../lib/bazi/stems.js';

const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };
const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

/** The element a Ten God stands for, relative to a Day Master element. */
function godElement(dm, god) {
  const resource = ELEMENTS.find((e) => GENERATES[e] === dm);
  const officer = ELEMENTS.find((e) => CONTROLS[e] === dm);
  return {
    比肩: dm, 劫財: dm,
    食神: GENERATES[dm], 傷官: GENERATES[dm],
    正財: CONTROLS[dm], 偏財: CONTROLS[dm],
    正官: officer, 七殺: officer,
    正印: resource, 偏印: resource,
  }[god];
}

const CHARTS = VALIDATION_CHARTS.map((tc) => ({
  tc,
  chart: calculateBaziChart({ birthDate: tc.date, birthTime: tc.time }),
  expected: tc.expect.topThreeBars.map((b) => b.god),
}));

const top3Of = (s) => Object.entries(s.tenGodStrength).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);

function score() {
  let exact = 0;
  let overlap = 0;
  for (const { chart, expected } of CHARTS) {
    const top3 = top3Of(computeStrength(chart));
    if (top3.every((g, i) => g === expected[i])) exact++;
    overlap += top3.filter((g) => expected.includes(g)).length;
  }
  return { exact, overlap };
}

// ── 1. Grid search ─────────────────────────────────────────

const baseline = score();
const original = { ...STRENGTH_PARAMS.season };

const SWEEP = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
let best = { exact: -1, overlap: -1 };
let evaluated = 0;

for (const prosperous of [1.4, 1.6, 1.8, 2.0, 2.4]) {
  for (const supported of SWEEP) {
    for (const resting of SWEEP) {
      for (const trapped of SWEEP) {
        for (const dead of [0.05, 0.1, 0.2, 0.4, 0.6]) {
          Object.assign(STRENGTH_PARAMS.season, { prosperous, supported, resting, trapped, dead });
          const r = score();
          evaluated++;
          if (r.exact > best.exact || (r.exact === best.exact && r.overlap > best.overlap)) {
            best = { ...r, params: { prosperous, supported, resting, trapped, dead } };
          }
        }
      }
    }
  }
}
Object.assign(STRENGTH_PARAMS.season, original);

console.log(`\n══ GRID SEARCH — ${evaluated} combinations of the five seasonal multipliers ══`);
console.log(`  baseline (spec defaults) : ${baseline.exact}/13 exact · ${baseline.overlap}/39 overlap`);
console.log(`  best achievable          : ${best.exact}/13 exact · ${best.overlap}/39 overlap`);
console.log(`  at                       : ${JSON.stringify(best.params)}`);
console.log(`  target                   : 11/13`);
if (best.exact < 11) {
  console.log('\n  => The knobs cannot reach the target. The gap is MODEL SHAPE, not tuning.');
}

// ── 2. Structural diagnostics ──────────────────────────────

let pairInTop3 = 0;
let topElementHit = 0;
const engineTopElementCount = {};
const joeyTopElementCount = {};

console.log('\n══ DIAGNOSTIC A — does Joey pair the yin/yang gods of one element? ══');
for (const { tc, chart } of CHARTS) {
  const dm = STEM_ELEMENTS[chart.day.stem];
  const els = tc.expect.topThreeBars.map((b) => godElement(dm, b.god));
  const paired = new Set(els).size < els.length;
  if (paired) pairInTop3++;
  const s = computeStrength(chart);
  const engineRank = Object.entries(s.elementStrength).sort((a, b) => b[1] - a[1]);
  if (els[0] === engineRank[0][0]) topElementHit++;
  engineTopElementCount[engineRank[0][0]] = (engineTopElementCount[engineRank[0][0]] ?? 0) + 1;
  joeyTopElementCount[els[0]] = (joeyTopElementCount[els[0]] ?? 0) + 1;
  console.log(
    `  #${String(tc.id).padStart(2)} ${paired ? 'PAIRED  ' : '        '} Joey ` +
    tc.expect.topThreeBars.map((b, i) => `${b.god}/${els[i]}${b.score}`).join(' '),
  );
}
console.log(`\n  Joey's top-3 contains BOTH gods of one element: ${pairInTop3}/13`);
console.log('  => The engine assigns an element\'s whole mass to one god by the CONTRIBUTOR\'s');
console.log('     polarity, so the pair splits unevenly and one half falls out of the top 3.');

console.log('\n══ DIAGNOSTIC B — element ranking agreement ══');
console.log(`  Joey's #1 bar element == engine's #1 element: ${topElementHit}/13`);
console.log(`  engine #1 element frequency: ${JSON.stringify(engineTopElementCount)}`);
console.log(`  Joey   #1 element frequency: ${JSON.stringify(joeyTopElementCount)}`);
console.log('  => Watch Earth. It is a hidden stem in eight of the twelve branches, so it');
console.log('     accumulates mass structurally. Classical 旺相休囚死 gives Earth special');
console.log('     treatment (prosperous only in the tail of each season, not as a full');
console.log('     season ruler); this model treats 辰未戌丑 as ordinary Earth months.');
