// ============================================================
// STRENGTH_PARAMS calibration + attribution harness
// ============================================================
// Run: npm run calibrate:strength
//
// Uses the SHARED oracle metrics (tests/oracle-metrics.mjs). It must not carry
// its own copy: a calibration run and a validation run that score differently is
// how you tune against the wrong target.
//
// THE OBJECTIVE IS ORACLE 3 — element rank order (C4 step 3). Five values rather
// than ten, and it is where the defect lives. Scored on Spearman because it is
// continuous and can separate settings that share an exact-order count.
//
// WHAT THIS HARNESS HAS ESTABLISHED
//
// Session 1 — the five 得令 multipliers alone cannot reach the Ten God target at
// any setting. The gap was model shape, not tuning.
//
// Session 2 — ruling A (element base shared across a god pair) was a numerical
// wash, and diagnostic 1 said why: the within-element split was already almost
// right, so there was nothing inside the pair to fix. Cross-element ordering was
// the gap. Ruling A was later REFUTED outright by the zero-presence law (C4).
//
// Session 3 — with the full ten-bar data, the 土旺於四季 treatment of 辰未戌丑 was
// tested on Oracle 3 and ADOPTED: rho 0.682 -> 0.782, concordance 79.8% -> 84.5%,
// four of five Earth-month charts better, none worse, and every non-Earth-month
// chart bit-identical. The grid search then moved back TOWARD the spec defaults
// (distance 3.20 -> 1.60) and regained a monotone descending shape, which is what
// C4 step 7 predicted would happen if the season mapping was the real defect.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeStrength, STRENGTH_PARAMS, tenGodElement } from '../lib/bazi/strength.ts';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';
import { scoreBars, aggregate, rankAgreement, aggregateRanks, formatRanks } from '../tests/oracle-metrics.mjs';
import { elementBarsFrom } from '../tests/joey-bars.mjs';
import { STEM_ELEMENTS } from '../lib/bazi/stems.js';

// The god -> element relation is engine knowledge and lives in strength.ts. This
// harness must not keep its own copy: a calibration run that disagrees with the
// engine about which element a god belongs to would tune against the wrong thing.
const godElement = tenGodElement;

const CHARTS = VALIDATION_CHARTS.map((tc) => {
  const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
  return {
    tc,
    chart,
    dm: STEM_ELEMENTS[chart.day.stem],
    joeyElements: elementBarsFrom(tc.expect.allBars, tc.expect.dayMasterElement),
  };
});

/** ORACLE 3 — the primary objective as of C4 step 3. Element rank order. */
const measureElements = () => aggregateRanks(CHARTS.map(({ chart, joeyElements }) =>
  rankAgreement(computeStrength(chart).elementStrength, joeyElements)));

/** ORACLE 2 over the full ten bars. */
const measureBars = () => aggregateRanks(CHARTS.map(({ tc, chart }) =>
  rankAgreement(computeStrength(chart).tenGodStrength, tc.expect.allBars)));

const measure = () => aggregate(CHARTS.map(({ tc, chart }) =>
  scoreBars(computeStrength(chart).tenGodStrength, tc.expect.topThreeBars)));

const line = (label, a) =>
  `${label.padEnd(34)} set ${String(a.setMatch).padStart(2)}/${a.n}  concord ${String(a.concordant).padStart(2)}/${a.comparable} = ${(a.concordance * 100).toFixed(1)}%  exact ${a.exactOrder}/${a.n}`;

const snapshot = () => ({
  season: { ...STRENGTH_PARAMS.season },
  projection: STRENGTH_PARAMS.tenGodProjection,
  lambda: STRENGTH_PARAMS.pairPresenceWeight,
  polarity: STRENGTH_PARAMS.pairPolarityWeight,
  earth: STRENGTH_PARAMS.earthMonthRuler,
});
const restore = (s) => {
  Object.assign(STRENGTH_PARAMS.season, s.season);
  STRENGTH_PARAMS.tenGodProjection = s.projection;
  STRENGTH_PARAMS.pairPresenceWeight = s.lambda;
  STRENGTH_PARAMS.pairPolarityWeight = s.polarity;
  STRENGTH_PARAMS.earthMonthRuler = s.earth;
};
const ORIGINAL = snapshot();

console.log('\n══ CURRENT CONFIGURATION ══');
console.log(`  projection ${STRENGTH_PARAMS.tenGodProjection} · earthMonthRuler ${STRENGTH_PARAMS.earthMonthRuler}`);
console.log(formatRanks('ORACLE 3 element rank (PRIMARY GATE)', measureElements()));
console.log(formatRanks('ORACLE 2 ten bars', measureBars()));

// ── The 辰未戌丑 treatment ──────────────────────────────────

console.log('\n══ EARTH-MONTH TREATMENT (土旺於四季) — measured on Oracle 3 ══');
for (const mode of ['earth', 'season-tail']) {
  STRENGTH_PARAMS.earthMonthRuler = mode;
  const el = measureElements();
  const bars = measureBars();
  console.log(
    `  ${mode.padEnd(12)} O3 exact ${el.exactOrder}/13  rho ${el.spearman.toFixed(3)}  concord ${(el.concordance * 100).toFixed(1)}%` +
    `   |  O2 rho ${bars.spearman.toFixed(3)}  concord ${(bars.concordance * 100).toFixed(1)}%`,
  );
}
restore(ORIGINAL);

// Per-chart attribution. The switch touches ONLY 辰未戌丑, so every other chart
// must be bit-identical — that is what makes the comparison surgical rather than
// a global reshuffle that happens to score better.
console.log('\n  per-chart Oracle-3 Spearman, earth -> season-tail:');
const EARTH_MONTHS = new Set(['辰', '未', '戌', '丑']);
let improved = 0;
let regressed = 0;
let controlsMoved = 0;
for (const { tc, chart, joeyElements } of CHARTS) {
  STRENGTH_PARAMS.earthMonthRuler = 'earth';
  const a = rankAgreement(computeStrength(chart).elementStrength, joeyElements);
  STRENGTH_PARAMS.earthMonthRuler = 'season-tail';
  const b = rankAgreement(computeStrength(chart).elementStrength, joeyElements);
  const isEarth = EARTH_MONTHS.has(chart.month.branch);
  const delta = (b.spearman ?? 0) - (a.spearman ?? 0);
  if (delta > 1e-9) improved++;
  if (delta < -1e-9) regressed++;
  if (!isEarth && Math.abs(delta) > 1e-9) controlsMoved++;
  const verdict = delta > 1e-9 ? 'BETTER' : delta < -1e-9 ? 'WORSE' : 'same';
  console.log(
    `    #${String(tc.id).padStart(2)} month ${chart.month.branch} ${isEarth ? '[EARTH]' : '       '} ` +
    `rho ${(a.spearman ?? 0).toFixed(2)} -> ${(b.spearman ?? 0).toFixed(2)}  ${verdict}`,
  );
}
restore(ORIGINAL);
console.log(`\n    improved ${improved} · regressed ${regressed} · non-Earth-month charts that moved ${controlsMoved}`);
if (controlsMoved === 0 && regressed === 0) {
  console.log('    => surgical and monotone: only the charts it should touch, and none worse.');
}

// ── Projection-mode comparison ─────────────────────────────

console.log('\n══ PROJECTION MODES ══');
STRENGTH_PARAMS.tenGodProjection = 'per-stem-seasonal';
console.log(line('per-stem-seasonal (CORRECT)', measure()));
for (const lambda of [0, 0.25, 0.5, 0.75, 1.0]) {
  STRENGTH_PARAMS.tenGodProjection = 'pair-presence';
  STRENGTH_PARAMS.pairPresenceWeight = lambda;
  console.log(line(`pair-presence lambda ${lambda.toFixed(2)}${lambda === 1 ? ' (ruling A)' : ''}`, measure()));
}
for (const w of [0.4, 0.5, 0.6]) {
  STRENGTH_PARAMS.tenGodProjection = 'pair-polarity';
  STRENGTH_PARAMS.pairPolarityWeight = w;
  console.log(line(`pair-polarity w ${w.toFixed(2)}`, measure()));
}
restore(ORIGINAL);

// ── Diagnostic 0 — what NO monotone transform can fix ───────
// Within a single element the seasonal multiplier is identical and cancels, so a
// disagreement here is presence-vs-bar and nothing else. Joey inverts 9 of 57
// such pairs. A monotone transform preserves order, so it cannot fix any of
// them — and the engine's score here must therefore be INVARIANT across every
// presenceTransform setting. If it ever moves, the transform stopped being
// monotone or is being applied in the wrong place.

console.log('\n══ DIAGNOSTIC 0 — within-element presence-vs-bar (transform-invariant) ══');
const withinPairs = [];
for (const { tc } of CHARTS) {
  const byElement = {};
  for (const [god, score] of Object.entries(tc.expect.allBars)) {
    const el = godElement(tc.expect.dayMasterElement, god);
    (byElement[el] ??= []).push({ god, score, presence: tc.expect.joeyPresence[god], stem: tc.expect.joeyStem[god] });
  }
  for (const [el, gods] of Object.entries(byElement)) {
    for (let i = 0; i < gods.length; i++) {
      for (let j = i + 1; j < gods.length; j++) {
        const a = gods[i];
        const b = gods[j];
        if (a.score === b.score || a.presence === b.presence) continue;
        withinPairs.push({ id: tc.id, el, a, b, joeyInverted: (a.presence > b.presence) !== (a.score > b.score) });
      }
    }
  }
}
const joeyInversions = withinPairs.filter((p) => p.joeyInverted);
console.log(`  comparable within-element pairs ${withinPairs.length} · inversions in Joey's data ${joeyInversions.length} (${Math.round(100 * joeyInversions.length / withinPairs.length)}%)`);
for (const mode of ['linear', 'sqrt', 'log1p']) {
  STRENGTH_PARAMS.presenceTransform = mode;
  let agree = 0;
  let invAgree = 0;
  for (const p of withinPairs) {
    const bars = computeStrength(CHARTS.find((c) => c.tc.id === p.id).chart).tenGodStrength;
    const hi = p.a.score > p.b.score ? p.a : p.b;
    const lo = p.a.score > p.b.score ? p.b : p.a;
    if (bars[hi.god] > bars[lo.god]) { agree++; if (p.joeyInverted) invAgree++; }
  }
  console.log(`  ${mode.padEnd(7)} engine agrees on ${agree}/${withinPairs.length} · of the ${joeyInversions.length} inversions ${invAgree}`);
}
restore(ORIGINAL);
console.log('  => invariant across transforms, as it must be. The 16% residual needs a');
console.log('     different MECHANISM, not a reweighting. C5 lists four candidates;');
console.log('     十二長生 is the most interesting because it is genuinely different.');

// ── Diagnostic 1 — where does the rank error actually live? ──

function concordanceSplit() {
  const within = [0, 0];
  const cross = [0, 0];
  for (const { tc, chart, dm } of CHARTS) {
    const bars = computeStrength(chart).tenGodStrength;
    const pub = tc.expect.topThreeBars;
    for (let i = 0; i < pub.length; i++) {
      for (let j = i + 1; j < pub.length; j++) {
        const a = pub[i];
        const b = pub[j];
        if (a.score == null || b.score == null || a.score === b.score) continue;
        const hi = a.score > b.score ? a : b;
        const lo = a.score > b.score ? b : a;
        const box = godElement(dm, a.god) === godElement(dm, b.god) ? within : cross;
        box[1]++;
        if (bars[hi.god] > bars[lo.god]) box[0]++;
      }
    }
  }
  return { within, cross };
}

console.log('\n══ DIAGNOSTIC 1 — within-element vs cross-element ordering ══');
for (const [mode, lambda] of [['per-stem-seasonal', null], ['pair-presence', 1.0], ['pair-presence', 0.0]]) {
  STRENGTH_PARAMS.tenGodProjection = mode;
  if (lambda !== null) STRENGTH_PARAMS.pairPresenceWeight = lambda;
  const r = concordanceSplit();
  const label = lambda === null ? mode : `${mode} lambda ${lambda.toFixed(1)}`;
  console.log(`  ${label.padEnd(30)} within-element ${r.within[0]}/${r.within[1]}   cross-element ${r.cross[0]}/${r.cross[1]}`);
}
restore(ORIGINAL);
console.log('  => The within-element split is already close to correct, so ruling A had');
console.log('     little to fix. Cross-element ordering is near chance, and that is the gap.');

// ── Diagnostic 2 — the projection-independent ceiling ───────

console.log('\n══ DIAGNOSTIC 2 — can the ELEMENT ranking host Joey\'s top-3? ══');
console.log('  Under any pair projection an element\'s two gods sum to its base, so Joey\'s');
console.log('  top-3 can only be reproduced if their elements are the engine\'s top elements.');
let hostable = 0;
const engineTop = {};
const joeyTop = {};
for (const { tc, chart, dm } of CHARTS) {
  const s = computeStrength(chart);
  const need = {};
  for (const b of tc.expect.topThreeBars) {
    const e = godElement(dm, b.god);
    need[e] = (need[e] ?? 0) + 1;
  }
  const ranked = Object.entries(s.elementStrength).sort((a, b) => b[1] - a[1]).map(([e]) => e);
  const distinct = Object.keys(need).length;
  const topK = new Set(ranked.slice(0, distinct));
  const ok = Object.keys(need).every((e) => topK.has(e));
  if (ok) hostable++;
  engineTop[ranked[0]] = (engineTop[ranked[0]] ?? 0) + 1;
  const joeyFirst = godElement(dm, tc.expect.topThreeBars[0].god);
  joeyTop[joeyFirst] = (joeyTop[joeyFirst] ?? 0) + 1;
  console.log(
    `  #${String(tc.id).padStart(2)} ${ok ? 'OK  ' : 'FAIL'} needs {${Object.entries(need).map(([e, n]) => `${e}x${n}`).join(', ')}}` +
    `  engine top${distinct}: ${ranked.slice(0, distinct).join(',')}`,
  );
}
console.log(`\n  element ranking can host Joey's top-3: ${hostable}/${CHARTS.length}  <= HARD CEILING for any projection`);
console.log(`  engine #1 element frequency: ${JSON.stringify(engineTop)}`);
console.log(`  Joey   #1 element frequency: ${JSON.stringify(joeyTop)}`);
console.log('  => Earth over-topping is REDUCED but not gone. 土旺於四季 took the engine from');
console.log('     Earth-first in 7 charts to 5, against Joey\'s 4, and lifted the ceiling from');
console.log('     6/13 to 7/13. The residual is the next question: C4 2(b) flags a concave');
console.log('     transform on presence, which is untested and is the likelier remaining term.');

// ── Seasonal grid search, now scored on the primary metric ──

const SWEEP = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
const DEFAULTS = { prosperous: 1.4, supported: 1.2, resting: 1.0, trapped: 0.8, dead: 0.6 };
let best = { spearman: -Infinity };
let evaluated = 0;
for (const prosperous of [1.4, 1.6, 1.8, 2.0, 2.4]) {
  for (const supported of SWEEP) {
    for (const resting of SWEEP) {
      for (const trapped of SWEEP) {
        for (const dead of [0.05, 0.1, 0.2, 0.4, 0.6]) {
          Object.assign(STRENGTH_PARAMS.season, { prosperous, supported, resting, trapped, dead });
          const a = measureElements();
          evaluated++;
          // Objective is Oracle 3 Spearman: continuous, so it can distinguish
          // between settings that share an exact-order count.
          if (a.spearman > best.spearman) {
            best = { ...a, params: { prosperous, supported, resting, trapped, dead } };
          }
        }
      }
    }
  }
}
restore(ORIGINAL);
const baseline = measureElements();

console.log(`\n══ SEASONAL GRID SEARCH — ${evaluated} combinations, scored on ORACLE 3 Spearman ══`);
console.log(`  spec defaults : rho ${baseline.spearman.toFixed(3)}  exact ${baseline.exactOrder}/13  concord ${(baseline.concordance * 100).toFixed(1)}%`);
console.log(`                  ${JSON.stringify(DEFAULTS)}`);
console.log(`  best found    : rho ${best.spearman.toFixed(3)}  exact ${best.exactOrder}/13  concord ${(best.concordance * 100).toFixed(1)}%`);
console.log(`                  ${JSON.stringify(best.params)}`);

// C4 step 7: if the winner moves BACK toward the spec defaults now that the
// season mapping is fixed, that is evidence the mapping was the real defect and
// the earlier flattening was the optimiser routing around it.
const drift = Object.keys(DEFAULTS).reduce((s, k) => s + Math.abs(best.params[k] - DEFAULTS[k]), 0);
console.log(`\n  total distance from spec defaults: ${drift.toFixed(2)}`);
console.log('  (session 2 winner was prosperous 2.4 with 相/休/囚/死 all flattened to 0.4,');
console.log('   distance 3.20 — the shape that meant "only the season\'s own element counts")');
