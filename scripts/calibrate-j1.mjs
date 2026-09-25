#!/usr/bin/env node
// ============================================================
// scripts/calibrate-j1.mjs — J1 alone, calibrated as a HARD gate candidate
// ============================================================
//   node --conditions=react-server scripts/calibrate-j1.mjs [--runs 3] [--out file.json]
//
// SPENDS: the judge model (lib/validate/judge.js JUDGE_MODEL) once per case per run.
//
// Round 3 (Reyner, 2026-09-24, docs/prompts/AC-qris-walk-voice-round3.md §B):
//   "Calibrate J1 BEFORE any round-3 render. Seeded set = S1-S4 seeded invented-fact
//   violations, plus the real g4WH4 round-2 sentence as a seeded fixture. Clean set =
//   S1-S4 as written. Run the full calibration 3 times. J1 passes only if it catches
//   EVERY seeded invented-fact violation in all 3 runs AND produces ZERO J1 false
//   positives on the clean set across all 3 runs."
//
// The judge is called exactly as the render pipeline calls it (same prompt, same
// model, all four classes in one call). Only J1 is SCORED here, because only J1 is a
// gate candidate; every other finding is recorded and printed, never counted.
//
// ── THE FOUR SEEDS, AND WHY EACH IS AN INVENTION ───────────
// Each was checked against the payload it is judged with (2026-09-25, buildSemanticJson
// / buildPairSemantic on the worksheet's charts). A seed that happened to be TRUE of
// the chart would score the judge as missing a violation that was never there.
//   S1  Bintang Perantau at her Pilar Kerja   - A carries no 驛馬 badge (B does, not A)
//   S2  her day and year branches clash        - A day 子, year 巳: no relation fact
//   S3  Kayu is the most plentiful element     - A has element_missing_Wood (0%)
//   S4  their two Pilar Akar bind each other   - A year 巳, B year 午: no pair fact
//                                                (p2 covers hits on day seats only)
// S2-S4 avoid glossary term names on purpose. D1 already catches an invented NAME;
// the invention only J1 can catch is one written in plain words, which is exactly
// the shape of the real g4WH4 error.
//
// ── THE FIXTURE IS REAL MODEL OUTPUT ───────────────────────
// tests/fixtures/voice-v2-g4WH4-round2.json is the served round-2 reading, whole,
// judged against its own pair payload with every required point. It is the one
// violation here nobody planted.
//
// ── CLEAN SET: EVERY REQUIRED POINT THE SAMPLE CLAIMS ──────
// As calibrate-judge.mjs does, each S-sample is judged with the required points its
// worksheet grounding note claims. J4 is not scored here, so this only keeps the
// call identical to the round-2 calibration.
// ============================================================

import fs from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { scrubInternal } from '../lib/render/payload.js';
import { judgeRendering } from '../lib/validate/judge.js';
import { sample, plant, loadEnvLocal, PRICES } from './voice-v2-samples.mjs';

loadEnvLocal();
const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const RUNS = Number(arg('runs', 3));
const OUT = arg('out', null);

// ── payloads ───────────────────────────────────────────────
const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' });
const mirror = scrubInternal(buildSemanticJson(A, { voice: 'v2' }));
const pair = scrubInternal(buildPairSemantic(A, B, { voice: 'v2' }));
const only = (payload, ids) => {
  const req = payload.required_points.filter((r) => ids.includes(r.fact_id));
  if (req.length !== ids.length) throw new Error(`required point missing: ${ids}`);
  return { ...payload, required_points: req };
};

const FIXTURE = JSON.parse(fs.readFileSync('tests/fixtures/voice-v2-g4WH4-round2.json', 'utf8'));
const g4 = scrubInternal(buildPairSemantic(
  calculateBaziChart(FIXTURE.inputs.a), calculateBaziChart(FIXTURE.inputs.b), { voice: 'v2' },
));

// ── the premises the seeds rest on, asserted rather than trusted ──
const factIds = (p) => new Set([...(p.facts || []), ...(p.mirror?.a?.facts || []), ...(p.mirror?.b?.facts || [])].map((f) => f.id));
const premise = (ok, what) => { if (!ok) throw new Error(`seed premise false: ${what}`); };
premise(!factIds(mirror).has('badge_驛馬'), 'S1: A has no 驛馬');
premise(A.day.branch === '子' && A.year.branch === '巳', 'S2: A day 子, year 巳');
premise(![...factIds(mirror)].some((id) => /^relation_.*(子.*巳|巳.*子)/u.test(id)), 'S2: no 子-巳 relation fact');
premise(factIds(mirror).has('element_missing_Wood'), 'S3: A is missing Wood');
premise(A.year.branch === '巳' && B.year.branch === '午', 'S4: years 巳 / 午');
{
  const frame = pair.facts.find((f) => f.id === 'p2_palace_frame').provenance;
  const hits = [...frame.a_hits_b, ...frame.b_hits_a];
  premise(hits.length > 0 && hits.every((h) => h.to.position === 'day'), 'S4: every cross-chart hit lands on a day seat');
  premise(pair.facts.find((f) => f.id === 'p2_day_pair').provenance.relations.length === 0, 'S4: the day pair has no relation');
}
const g4Supply = g4.facts.find((f) => f.id === 'p3_supply').provenance.supplies.find((s) => s.from === 'b');
premise(g4Supply.element === 'Wood', 'g4WH4: B supplies Wood to A');
premise(factIds({ facts: g4.mirror.a.facts }).has('element_dominant_Water'), 'g4WH4: Water is A dominant');

// ── cases ──────────────────────────────────────────────────
const S1 = sample('S1'); const S2 = sample('S2'); const S3 = sample('S3'); const S4 = sample('S4');
const P1 = only(mirror, ['void_stack_month']);
const P2 = only(mirror, ['day_master_Fire', 'strength_weak']);
const P3 = only(mirror, ['aspek_convergence_正官', 'spouse_palace']);
const P4 = only(pair, ['p2_day_pair', 'p2_palace_frame', 'p3_supply', 'p4_temperament', 'p5_pull_fit']);

const SEEDS = {
  S1: 'Di pilar yang sama juga ada Bintang Perantau (Travelling Horse), yang membuatmu gelisah kalau terlalu lama di satu kantor.',
  S2: 'Cabang di Pilar Dirimu juga berbenturan dengan cabang di Pilar Akarmu.',
  S3: 'Di baganmu, Kayu adalah unsur yang paling banyak.',
  S4: 'Pilar Akarmu dan Pilar Akar-nya juga saling mengikat.',
};
const CASES = [
  { id: 'S1', set: 'clean', payload: P1, rendered: S1 },
  { id: 'S2', set: 'clean', payload: P2, rendered: S2 },
  { id: 'S3', set: 'clean', payload: P3, rendered: S3 },
  { id: 'S4', set: 'clean', payload: P4, rendered: S4 },
  {
    id: 'seed-S1', set: 'seeded', needle: 'Bintang Perantau', payload: P1,
    rendered: plant(S1, 'yang membuat bantuan datang tepat saat jalanmu buntu.', `yang membuat bantuan datang tepat saat jalanmu buntu. ${SEEDS.S1}`),
  },
  {
    id: 'seed-S2', set: 'seeded', needle: 'berbenturan dengan cabang di Pilar Akarmu', payload: P2,
    rendered: plant(S2, 'Lemah di sini bicara soal cadangan, bukan soal kemampuan.', `Lemah di sini bicara soal cadangan, bukan soal kemampuan. ${SEEDS.S2}`),
  },
  {
    id: 'seed-S3', set: 'seeded', needle: 'Kayu adalah unsur yang paling banyak', payload: P3,
    rendered: plant(S3, 'Bahkan ke rumah.', `Bahkan ke rumah. ${SEEDS.S3}`),
  },
  {
    id: 'seed-S4', set: 'seeded', needle: 'Pilar Akar-nya juga saling mengikat', payload: P4,
    rendered: plant(S4, 'Dari arah sebaliknya, Pilar Kerja-mu terikat dengan kursi pasangannya.', `Dari arah sebaliknya, Pilar Kerja-mu terikat dengan kursi pasangannya. ${SEEDS.S4}`),
  },
  { id: 'fixture-g4WH4', set: 'seeded', needle: 'tidak dominan di baganmu', payload: g4, rendered: FIXTURE.rendered },
];

/** A J1 finding that quotes the seeded sentence. */
const catches = (c, f) => f.class === 'J1' && String(f.sentence).includes(c.needle);

// ── SHOWN FAILING BEFORE IT IS TRUSTED ─────────────────────
// Every needle must be IN its seeded text and ABSENT from the clean sample it was
// planted on, or "caught" could be satisfied by a clean sentence. And the scorer
// must say no to a finding of the wrong class and to one quoting other text.
for (const c of CASES.filter((x) => x.set === 'seeded')) {
  if (!JSON.stringify(c.rendered).includes(c.needle)) throw new Error(`${c.id}: needle not in seeded text`);
  const clean = c.id.startsWith('seed-') ? CASES.find((x) => x.id === c.id.slice('seed-'.length)) : null;
  if (clean && JSON.stringify(clean.rendered).includes(c.needle)) throw new Error(`${c.id}: needle already in the clean sample`);
}
const probe = CASES.find((c) => c.id === 'seed-S3');
if (!catches(probe, { class: 'J1', sentence: `x ${probe.needle} y` })) throw new Error('scorer cannot see a J1 on the needle');
if (catches(probe, { class: 'J2', sentence: probe.needle })) throw new Error('scorer accepts a J2 as a J1 catch');
if (catches(probe, { class: 'J1', sentence: 'Kamu adalah Matahari.' })) throw new Error('scorer accepts a J1 on other text');
if (arg('dry', false)) { console.log(`dry: ${CASES.length} cases, premises and scorer checks pass, nothing spent`); process.exit(0); }

// ── run ────────────────────────────────────────────────────
const results = [];
let spend = 0;
for (let run = 1; run <= RUNS; run += 1) {
  for (const c of CASES) {
    const out = await judgeRendering(c.rendered, c.payload);
    const u = out.usage || {};
    const PRICE = PRICES[out.model];
    if (!PRICE) throw new Error(`no price for ${out.model}`);
    const cost = (u.promptTokenCount || 0) * PRICE.in + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * PRICE.out;
    spend += cost;
    const j1 = out.findings.filter((f) => f.class === 'J1');
    const caught = c.set === 'seeded' ? out.findings.some((f) => catches(c, f)) : null;
    // A J1 on the clean set is a false positive. On a seeded case, a J1 that does not
    // quote the seed is recorded too (it would regenerate a real reading), but the
    // round's rule counts false positives on the CLEAN set.
    const j1Other = out.findings.filter((f) => f.class === 'J1' && !(c.set === 'seeded' && catches(c, f)));
    results.push({
      id: c.id, set: c.set, run, caught, j1, j1_other: j1Other,
      other_findings: out.findings.filter((f) => f.class !== 'J1'),
      malformed: out.malformed, usage: u, cost_usd: cost, model: out.model,
    });
    console.log(`run ${run} ${c.id.padEnd(14)} J1 ${j1.length}${c.set === 'seeded' ? ` caught ${caught}` : ''} other-J1 ${j1Other.length} (J2-J4 ${out.findings.length - j1.length}, malformed ${out.malformed.length}) $${cost.toFixed(5)}`);
  }
}

// ── report ─────────────────────────────────────────────────
console.log('\nJ1 CALIBRATION TABLE');
console.log('| case | run 1 | run 2 | run 3 |');
for (const c of CASES) {
  const cells = [1, 2, 3].slice(0, RUNS).map((run) => {
    const r = results.find((x) => x.id === c.id && x.run === run);
    return c.set === 'seeded' ? (r.caught ? 'caught' : 'MISSED') : (r.j1.length ? `FP x${r.j1.length}` : 'clean');
  });
  console.log(`| ${c.id} | ${cells.join(' | ')} |`);
}
const misses = results.filter((r) => r.set === 'seeded' && !r.caught);
const fps = results.filter((r) => r.set === 'clean').flatMap((r) => r.j1.map((f) => ({ case: r.id, run: r.run, ...f })));
const quote = (f) => `    sentence: ${f.sentence}\n    grounding_considered: ${JSON.stringify(f.grounding_considered)}\n    supported: ${f.supported}\n    unsupported: ${f.unsupported}`;
console.log(`\nMISSES: ${misses.length}`);
for (const m of misses) {
  const c = CASES.find((x) => x.id === m.id);
  console.log(`- [${m.id} run ${m.run}] needle "${c.needle}"; the judge returned: ${m.j1.length + m.other_findings.length} finding(s)`);
  for (const f of [...m.j1, ...m.other_findings]) console.log(`  ${f.class}\n${quote(f)}`);
}
console.log(`\nJ1 FALSE POSITIVES (clean set): ${fps.length}`);
for (const f of fps) console.log(`- [${f.case} run ${f.run}]\n${quote(f)}`);
const seededOther = results.filter((r) => r.set === 'seeded').flatMap((r) => r.j1_other.map((f) => ({ case: r.id, run: r.run, ...f })));
console.log(`\nOTHER J1 ON SEEDED CASES (not the seed; not scored): ${seededOther.length}`);
for (const f of seededOther) console.log(`- [${f.case} run ${f.run}]\n${quote(f)}`);

const seededCount = results.filter((r) => r.set === 'seeded').length;
console.log(`\nSEEDED CAUGHT ${seededCount - misses.length}/${seededCount}; CLEAN J1 FALSE POSITIVES ${fps.length}`);
console.log(`SPEND $${spend.toFixed(4)} over ${results.length} judge calls`);
const pass = misses.length === 0 && fps.length === 0 && RUNS >= 3;
console.log(`\nJ1 CALIBRATION ${pass ? 'PASS' : 'FAIL'}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ cases: CASES.map(({ id, set, needle }) => ({ id, set, needle })), results, spend, pass }, null, 2));
process.exitCode = pass ? 0 : 1;
