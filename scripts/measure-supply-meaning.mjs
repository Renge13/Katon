#!/usr/bin/env node
// ============================================================
// scripts/measure-supply-meaning.mjs — AK §2, REPORT ONLY (Reyner's ruling 3)
// ============================================================
//   node --conditions=react-server scripts/measure-supply-meaning.mjs
//
// Measures a CANDIDATE meaning for Penyeimbang Unsur against today's engine, with
// no change to either. Today (`supplyFor`, lib/compat/complementarity.js): X brings
// B the first element of B's favourable list (scarcest first) that X holds ANY of.
// Candidate: the same walk, but X brings E only when X holds MORE of E than B does;
// an element X holds less of or equal to is skipped.
//
// The amounts are the ones `supplyFor` reads, `elementPresence` (lib/semantic/
// facts.js). The PDF's "Sebaran Unsur" is `chart.element_presence`, built from the
// same `elementPresence` (lib/semantic/index.js), and the script asserts the two
// are identical per chart rather than assuming it.
//
// Pairs: every pair in tests/fixtures/pair-frame-hits.fixture.json (g4WH4, PZ0t,
// rVe4ca - also the stored pair readings under reports/), plus the 11 pairs the
// compat QA harness renders (tests/compat-p0-engine.spec.mjs PAIRS: ten fixture-chart
// pairs and the Y-1 fixture). No code, glossary or check changes.
// ============================================================

import fs from 'node:fs';

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { computeStrength } = await import('../lib/bazi/strength.ts');
const { elementPresence } = await import('../lib/semantic/facts.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { compatComplementarity } = await import('../lib/compat/complementarity.js');
const { elementId } = await import('../lib/semantic/glossary.js');
const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('../tests/bazi-validation.fixture.js');

const FIX = JSON.parse(fs.readFileSync('tests/fixtures/pair-frame-hits.fixture.json', 'utf8'));
const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const byId = (id) => { const r = ALL.find((c) => c.id === id); return { birthDate: r.date, birthTime: r.time }; };
const PAIRS = [
  ...FIX.pairs.map((p) => ({ id: p.id, a: p.a, b: p.b })),
  ...[[2, 6], [1, 2], [13, 11], [12, 6], [1, 12], [3, 7], [1, 3], [2, 8], [1, 101], [9, 11]]
    .map(([x, y]) => ({ id: `${x} x ${y}`, a: byId(x), b: byId(y) })),
  { id: 'Y-1 fixture', a: { birthDate: '1989-09-13', birthTime: '09:00' }, b: { birthDate: '1997-09-14', birthTime: null } },
];

/** The candidate: today's walk, skipping an element the supplier holds <= the receiver. */
function candidate(receiverFavourable, supplierP, receiverP) {
  for (const e of receiverFavourable) {
    if ((supplierP[e] ?? 0) > (receiverP[e] ?? 0)) return e;
  }
  return null;
}
const name = (e) => (e ? `${elementId(e)} (${e})` : 'none');
const pct = (p) => Object.entries(p).map(([k, v]) => `${elementId(k)} ${v}`).join(', ');

let changed = 0; let lost = 0; let lostBoth = 0; let mismatch = 0;
const rows = [];
for (const p of PAIRS) {
  const a = calculateBaziChart(p.a); const b = calculateBaziChart(p.b);
  const sa = computeStrength(a); const sb = computeStrength(b);
  const pa = elementPresence(a); const pb = elementPresence(b);
  // The PDF's Sebaran Unsur, per person, keyed by Indonesian name.
  for (const [chart, pr] of [[a, pa], [b, pb]]) {
    const shown = buildSemanticJson(chart).chart.element_presence;
    for (const [k, v] of Object.entries(pr)) if (shown[elementId(k)] !== v) mismatch += 1;
  }
  const today = compatComplementarity(a, b, sa, sb);
  const tA = today.aSupplies?.element ?? null; const tB = today.bSupplies?.element ?? null;
  const cA = candidate(sb.favorable, pa, pb); const cB = candidate(sa.favorable, pb, pa);
  const moved = tA !== cA || tB !== cB;
  const lostA = tA && !cA; const lostB = tB && !cB;
  if (moved) changed += 1;
  if (lostA || lostB) lost += 1;
  if (lostA && lostB) lostBoth += 1;
  rows.push({ id: p.id, tA, cA, tB, cB, moved, lostA, lostB, pa, pb, favA: sa.favorable, favB: sb.favorable });
}

for (const r of rows) {
  console.log(`\n${r.id}${r.moved ? '   <- CHANGES' : ''}`);
  console.log(`  Sebaran Unsur A: ${pct(r.pa)} | favourable ${JSON.stringify(r.favA)}`);
  console.log(`  Sebaran Unsur B: ${pct(r.pb)} | favourable ${JSON.stringify(r.favB)}`);
  console.log(`  A brings B: today ${name(r.tA)} -> candidate ${name(r.cA)}${r.lostA ? '  (FACT LOST)' : ''}`);
  console.log(`  B brings A: today ${name(r.tB)} -> candidate ${name(r.cB)}${r.lostB ? '  (FACT LOST)' : ''}`);
}
console.log(`\n${PAIRS.length} pairs. Sebaran Unsur vs supplyFor amounts: ${mismatch} mismatches.`);
console.log(`Candidate changes ${changed} pair(s); ${lost} lose the fact in at least one direction, ${lostBoth} in both.`);
