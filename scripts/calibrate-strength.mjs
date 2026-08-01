// ============================================================
// STRENGTH_PARAMS calibration + attribution harness
// ============================================================
// Run: npm run calibrate:strength
//
// Uses the SHARED Oracle 2 metric (tests/oracle2-metric.mjs). It must not carry
// its own copy: a calibration run and a validation run that score differently is
// how you tune against the wrong target.
//
// WHAT THIS HAS ESTABLISHED SO FAR
//
// Session 1 — the five 得令 seasonal multipliers cannot reach the target at any
// setting (25,000 combinations, ceiling 2/13 on the old exact-order metric).
// The gap is model shape, not tuning.
//
// Session 2 — ruling A (pair distribution) is numerically a WASH, and the reason
// is diagnostic 1 below: the within-element split was already almost right
// (5/6 correct pairs), so redistributing inside the pair had nothing to fix.
// The failure is CROSS-element ordering (15/31, near chance).
//
// Diagnostic 2 is the finding that matters: the engine's ELEMENT ranking can
// host Joey's top-3 in only 6/13 charts. That is a hard ceiling for ANY Ten God
// projection, so no projection scheme can pass the 11/13 target. The element
// strength computation is the defect.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeStrength, STRENGTH_PARAMS, ELEMENTS } from '../lib/bazi/strength.ts';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';
import { scoreBars, aggregate, formatAggregate } from '../tests/oracle2-metric.mjs';
import { STEM_ELEMENTS } from '../lib/bazi/stems.js';

const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };

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
  dm: STEM_ELEMENTS[calculateBaziChart({ birthDate: tc.date, birthTime: tc.time }).day.stem],
}));

const measure = () => aggregate(CHARTS.map(({ tc, chart }) =>
  scoreBars(computeStrength(chart).tenGodStrength, tc.expect.topThreeBars)));

const line = (label, a) =>
  `${label.padEnd(34)} set ${String(a.setMatch).padStart(2)}/${a.n}  concord ${String(a.concordant).padStart(2)}/${a.comparable} = ${(a.concordance * 100).toFixed(1)}%  exact ${a.exactOrder}/${a.n}`;

const snapshot = () => ({
  season: { ...STRENGTH_PARAMS.season },
  projection: STRENGTH_PARAMS.tenGodProjection,
  lambda: STRENGTH_PARAMS.pairPresenceWeight,
  polarity: STRENGTH_PARAMS.pairPolarityWeight,
});
const restore = (s) => {
  Object.assign(STRENGTH_PARAMS.season, s.season);
  STRENGTH_PARAMS.tenGodProjection = s.projection;
  STRENGTH_PARAMS.pairPresenceWeight = s.lambda;
  STRENGTH_PARAMS.pairPolarityWeight = s.polarity;
};
const ORIGINAL = snapshot();

console.log('\n══ CURRENT CONFIGURATION ══');
console.log(`  projection ${STRENGTH_PARAMS.tenGodProjection} (lambda ${STRENGTH_PARAMS.pairPresenceWeight})`);
console.log(formatAggregate(measure()));

// ── Projection-mode comparison ─────────────────────────────

console.log('\n══ PROJECTION MODES ══');
STRENGTH_PARAMS.tenGodProjection = 'contributor-polarity';
console.log(line('contributor-polarity (session 1)', measure()));
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
for (const [mode, lambda] of [['contributor-polarity', null], ['pair-presence', 1.0], ['pair-presence', 0.0]]) {
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
console.log('  => Earth over-tops. It is a hidden stem in eight of the twelve branches, so it');
console.log('     accumulates mass structurally. This is ruling B (土旺於四季), still open.');

// ── Seasonal grid search, now scored on the primary metric ──

const SWEEP = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
let best = { setMatch: -1, concordance: -1 };
let evaluated = 0;
for (const prosperous of [1.4, 1.6, 1.8, 2.0, 2.4]) {
  for (const supported of SWEEP) {
    for (const resting of SWEEP) {
      for (const trapped of SWEEP) {
        for (const dead of [0.05, 0.1, 0.2, 0.4, 0.6]) {
          Object.assign(STRENGTH_PARAMS.season, { prosperous, supported, resting, trapped, dead });
          const a = measure();
          evaluated++;
          if (a.setMatch > best.setMatch || (a.setMatch === best.setMatch && a.concordance > best.concordance)) {
            best = { ...a, params: { prosperous, supported, resting, trapped, dead } };
          }
        }
      }
    }
  }
}
restore(ORIGINAL);

console.log(`\n══ SEASONAL GRID SEARCH — ${evaluated} combinations, scored on top-3 set match ══`);
console.log(`  best: set ${best.setMatch}/${best.n}  concord ${(best.concordance * 100).toFixed(1)}%`);
console.log(`  at  : ${JSON.stringify(best.params)}`);
console.log(`  target: 11/${best.n}`);
if (best.setMatch < 11) {
  console.log('\n  => Still unreachable by tuning. Consistent with diagnostic 2: the ceiling is');
  console.log('     set by which ELEMENTS rank top, and these knobs barely move that ordering.');
}
