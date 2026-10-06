#!/usr/bin/env node
// ============================================================
// scripts/frame-harmony-base-rates.mjs — BC amendment 1 item 5, REPORT ONLY
// ============================================================
//   node scripts/frame-harmony-base-rates.mjs
//
// How often the palace frame gets the harmony text, the pressure text, or both side by
// side, on the base-rate sample of scripts/compat-base-rates.mjs (seed 20260907, 2000
// charts, 5000 ordered pairs, drawn in the same order). Changes nothing.
//
// THE CONTROL: the same sample must first reproduce E13's recorded direction split
// (commit 326b573: a_only 23.7%, b_only 23.1%, both 40.0%, day pair only 3.7%, frame
// present 90.4%). If it does not, the sample is not the base-rate sample and the script
// exits before printing a number.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic, p2FrameKey, p2FrameKeys } from '../lib/semantic/pair.js';

const CHARTS = 2000;
const PAIRS = 5000;
// SEED is overridable only to show the control failing on a different sample.
const SEED = Number(process.env.SEED || 20260907);

// Copied from scripts/compat-base-rates.mjs (not exported there); the control below
// is what proves the copy draws the same sample.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const FIRST_DAY = Date.UTC(1960, 0, 1) / 86400000;
const LAST_DAY = Date.UTC(2005, 11, 31) / 86400000;
const SPAN = LAST_DAY - FIRST_DAY + 1;
const pad = (n) => String(n).padStart(2, '0');
function randomBirth(rand) {
  const d = new Date((FIRST_DAY + Math.floor(rand() * SPAN)) * 86400000);
  return {
    birthDate: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    birthTime: `${pad(Math.floor(rand() * 24))}:${pad(Math.floor(rand() * 60))}`,
  };
}

const rand = mulberry32(SEED);
const charts = [];
for (let i = 0; i < CHARTS; i += 1) charts.push(calculateBaziChart(randomBirth(rand)));

const isDayDay = (h) => h.from?.position === 'day' && h.to?.position === 'day';
const nonDay = (xs) => (xs || []).filter((h) => !isDayDay(h));
const HARMONY = '六合';
const classes = (hits) => ({ h: hits.some((x) => x.relation === HARMONY), p: hits.some((x) => x.relation !== HARMONY) });

const n = {
  frame: 0, a_only: 0, b_only: 0, both: 0, day_only: 0,
  harmony_only: 0, pressure_only: 0, side_by_side: 0,
  any_direction_mixed: 0, unchosen_harmony_only: 0,
};
for (let k = 0; k < PAIRS; k += 1) {
  const i = Math.floor(rand() * charts.length);
  let j = Math.floor(rand() * charts.length);
  while (j === i) j = Math.floor(rand() * charts.length);
  const sj = buildPairSemantic(charts[i], charts[j], { voice: 'v1' });
  const frame = sj.facts.find((f) => f.id === 'p2_palace_frame');
  if (!frame) continue;
  n.frame += 1;
  const p = frame.provenance;
  const aN = nonDay(p.a_hits_b).length > 0;
  const bN = nonDay(p.b_hits_a).length > 0;
  if (aN && bN) n.both += 1; else if (aN) n.a_only += 1; else if (bN) n.b_only += 1; else n.day_only += 1;

  const keys = p2FrameKeys(p);
  const harm = keys.some((x) => x.endsWith('_harmony'));
  if (keys.length > 1) {
    n.side_by_side += 1;
  } else if (harm) n.harmony_only += 1; else n.pressure_only += 1;

  const ca = classes(nonDay(p.a_hits_b));
  const cb = classes(nonDay(p.b_hits_a));
  if ((ca.h && ca.p) || (cb.h && cb.p)) n.any_direction_mixed += 1;
  // A 六合 in the direction E13 did NOT choose (A->B when B->A exists) gets no text of its own.
  const chosenIsB = p2FrameKey(p) === 'p2_palace_frame' && bN;
  if (chosenIsB && ca.h && !cb.h) n.unchosen_harmony_only += 1;
}

const pct = (x) => `${(100 * x / PAIRS).toFixed(1)}%`;
const want = { frame: '90.4%', a_only: '23.7%', b_only: '23.1%', both: '40.0%', day_only: '3.7%' };
const got = Object.fromEntries(Object.keys(want).map((k) => [k, pct(n[k])]));
console.log(`control, E13's split on the same sample: ${JSON.stringify(got)}`);
if (JSON.stringify(got) !== JSON.stringify(want)) {
  console.error(`CONTROL FAILED: want ${JSON.stringify(want)}`);
  process.exit(2);
}
console.log(`seed ${SEED}, ${CHARTS} charts, ${PAIRS} pairs; frame present ${n.frame} (${pct(n.frame)})`);
for (const k of ['pressure_only', 'harmony_only', 'side_by_side', 'any_direction_mixed', 'unchosen_harmony_only']) {
  console.log(`  ${k.padEnd(22)} ${String(n[k]).padStart(5)}  ${pct(n[k])}`);
}
