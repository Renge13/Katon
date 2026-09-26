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
// worksheet grounding note claims. Since STAGE6 1.35.0 the judge no longer receives
// required_points at all (J4 is removed), so this narrowing is inert and kept only
// so the payloads stay the ones round 3 calibrated on.
//
// ── B9, THE SCENE BOUNDARY (added 2026-09-26, Prompt AD Job B + amendment 1) ──
// Ten more cases on the same four samples, one planted sentence each:
//   scene-pass  an illustration framed as possible or typical on a TRUE supplied
//               pattern ("Misalnya, ketika ...", "Dalam keseharian, ini bisa terasa
//               seperti ..."). Must draw NO J1 in any run.
//   scene-fail  a past event claimed as real, or a chart fact the engine did not
//               give, dressed as a scene. Must draw a J1 on the needle in every run.
// The pass rule is the round-3 rule plus these two: the old seeded cases 15/15, zero
// clean false positives, zero scene-fail misses, zero scene-pass J1s.
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
const CASES_BASE = {
  S1: { payload: P1, rendered: S1 }, S2: { payload: P2, rendered: S2 },
  S3: { payload: P3, rendered: S3 }, S4: { payload: P4, rendered: S4 },
};
const A_NOBLE = 'yang membuat bantuan datang tepat saat jalanmu buntu.';
const A_VOID = 'Dari dalam, ia terasa kosong.';
const A_WEAK = 'Lemah di sini bicara soal cadangan, bukan soal kemampuan.';
const A_HOME = 'Bahkan ke rumah.';
const A_SEAT = 'Dari arah sebaliknya, Pilar Kerja-mu terikat dengan kursi pasangannya.';
const A_PLANS = 'Hampir selalu kamu yang membuka pembicaraan soal rencana baru.';
const A_GROUND = 'Dia menyambut, lalu menjalankannya dengan tenang, karena bagannya memang dibuat untuk menjadi pijakan.';
// [id, set, sample, anchor, planted sentence, needle (scene-fail only)]
const SCENES = [
  // Grounded in badge_天乙貴人 (help arrives when the way is blocked).
  ['pass-noble', 'scene-pass', 'S1', A_NOBLE, 'Misalnya, ketika sebuah proyek sedang macet, biasanya justru ada satu orang yang tiba-tiba menawarkan jalan keluar.', null],
  // Grounded in void_stack_month (full from outside, empty from inside).
  ['pass-void', 'scene-pass', 'S1', A_VOID, 'Dalam keseharian, ini bisa terasa seperti menerima pujian atas presentasi yang berjalan baik, lalu pulang dengan perasaan belum cukup.', null],
  // Grounded in strength_weak + element_missing_Wood (reserve, fuel from outside).
  ['pass-weak', 'scene-pass', 'S2', A_WEAK, 'Dalam keseharian, ini bisa terasa seperti hari kerja yang lancar di kantor, lalu tenagamu habis begitu sampai di rumah.', null],
  // Grounded in aspek_convergence_正官 (responsibility follows her home).
  ['pass-duty', 'scene-pass', 'S3', A_HOME, 'Misalnya, ketika rencana liburan keluarga mulai berantakan, biasanya kamu yang akhirnya memegang daftar dan menghubungi semua orang.', null],
  // Grounded in p1_stem_relation a_produces_b and p4 (she opens, he carries it out).
  ['pass-pair', 'scene-pass', 'S4', A_GROUND, 'Misalnya, ketika kamu melempar ide pindah rumah di meja makan, biasanya dia diam sebentar, lalu besoknya sudah membandingkan beberapa pilihan.', null],
  // A past event claimed as real.
  ['fail-lastyear', 'scene-fail', 'S1', A_NOBLE, 'Misalnya, tahun lalu kamu kehilangan pekerjaan karena atasanmu tidak menyukaimu.', 'tahun lalu kamu kehilangan pekerjaan'],
  // An invented chart fact in a scene: A has no Wood at all (element_missing_Wood).
  ['fail-hourwood', 'scene-fail', 'S2', A_WEAK, 'Dalam keseharian, ini bisa terasa di pagi hari, karena Pilar Arah-mu dipenuhi unsur Kayu.', 'Pilar Arah-mu dipenuhi unsur Kayu'],
  // A past event claimed as real, framed as a scene.
  ['fail-college', 'scene-fail', 'S3', A_HOME, 'Dalam keseharian, ini bisa terasa seperti yang terjadi waktu kamu kuliah: kamu ditunjuk menjadi ketua angkatan, lalu mengundurkan diri di semester ketiga.', 'mengundurkan diri di semester ketiga'],
  // An invented pair relation in a scene: A month 酉, B month 寅, and every
  // cross-chart hit in the payload lands on a day seat (premise S4 above).
  ['fail-monthclash', 'scene-fail', 'S4', A_SEAT, 'Misalnya, ketika kalian berdebat soal uang, biasanya itu karena Pilar Kerja kalian berdua saling berbenturan.', 'Pilar Kerja kalian berdua saling berbenturan'],
  // A past event about the OTHER person, claimed as real.
  ['fail-lastmonth', 'scene-fail', 'S4', A_PLANS, 'Misalnya, bulan lalu dia sempat menyembunyikan masalah keluarganya darimu selama berminggu-minggu.', 'bulan lalu dia sempat menyembunyikan'],
];
// The grounding the pass-scenes rest on, asserted like the seeds' premises.
premise(factIds(mirror).has('badge_天乙貴人'), 'pass-noble: A carries 天乙貴人');
premise(factIds(mirror).has('void_stack_month'), 'pass-void: A carries the month Void');
premise(factIds(mirror).has('strength_weak'), 'pass-weak: A is weak');
premise(factIds(mirror).has('aspek_convergence_正官'), 'pass-duty: A has the 正官 convergence');
premise(pair.facts.find((f) => f.id === 'p1_stem_relation')?.provenance?.cycle === 'a_produces_b', 'pass-pair: A Fire produces B Earth');
premise(A.hour && ![A.hour.stem, A.hour.branch].some((c) => '甲乙寅卯'.includes(c)), 'fail-hourwood: no Wood in A hour pillar');
premise(A.month.branch === '酉' && B.month.branch === '寅', 'fail-monthclash: months 酉 / 寅');

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
  // ── B9, THE SCENE BOUNDARY (Prompt AD Job B + amendment 1 item 5, 2026-09-26) ──
  // scene-pass: an illustration framed as possible or typical, on a TRUE supplied
  // pattern. Must draw NO J1. scene-fail: a claimed past event, or a chart fact the
  // engine did not give, dressed as a scene. Must draw a J1 quoting the needle.
  ...SCENES.map(([id, set, sampleCase, anchor, sentence, needle]) => {
    const base = CASES_BASE[sampleCase];
    return {
      id, set, needle, payload: base.payload,
      rendered: plant(base.rendered, anchor, `${anchor} ${sentence}`),
      planted: sentence,
    };
  }),
];

/** A J1 finding that quotes the seeded sentence. */
const catches = (c, f) => f.class === 'J1' && String(f.sentence).includes(c.needle);

// ── SHOWN FAILING BEFORE IT IS TRUSTED ─────────────────────
// Every needle must be IN its seeded text and ABSENT from the clean sample it was
// planted on, or "caught" could be satisfied by a clean sentence. And the scorer
// must say no to a finding of the wrong class and to one quoting other text.
// Needled sets are scored on catching the needle; the others (clean, scene-pass)
// on drawing no J1 at all.
const NEEDLED = new Set(['seeded', 'scene-fail']);
for (const c of CASES.filter((x) => NEEDLED.has(x.set))) {
  if (!JSON.stringify(c.rendered).includes(c.needle)) throw new Error(`${c.id}: needle not in seeded text`);
  const clean = c.id.startsWith('seed-') ? CASES.find((x) => x.id === c.id.slice('seed-'.length)).rendered
    : c.set === 'scene-fail' ? CASES_BASE[SCENES.find((s) => s[0] === c.id)[2]].rendered : null;
  if (clean && JSON.stringify(clean).includes(c.needle)) throw new Error(`${c.id}: needle already in the clean sample`);
}
// A scene case must differ from its base by exactly its planted sentence.
for (const c of CASES.filter((x) => x.planted)) {
  if (!JSON.stringify(c.rendered).includes(c.planted)) throw new Error(`${c.id}: planted sentence missing`);
}
const probe = CASES.find((c) => c.id === 'seed-S3');
if (!catches(probe, { class: 'J1', sentence: `x ${probe.needle} y` })) throw new Error('scorer cannot see a J1 on the needle');
if (catches(probe, { class: 'J2', sentence: probe.needle })) throw new Error('scorer accepts a J2 as a J1 catch');
if (catches(probe, { class: 'J1', sentence: 'Kamu adalah Matahari.' })) throw new Error('scorer accepts a J1 on other text');
const sceneProbe = CASES.find((c) => c.id === 'fail-hourwood');
if (catches(sceneProbe, { class: 'J2', sentence: sceneProbe.needle })) throw new Error('scorer accepts a J2 as a scene-fail catch');
if (arg('dry', false)) {
  const by = (s) => CASES.filter((c) => c.set === s).length;
  console.log(`dry: ${CASES.length} cases (clean ${by('clean')}, seeded ${by('seeded')}, scene-pass ${by('scene-pass')}, scene-fail ${by('scene-fail')}), premises and scorer checks pass, nothing spent`);
  process.exit(0);
}

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
    const caught = NEEDLED.has(c.set) ? out.findings.some((f) => catches(c, f)) : null;
    // A J1 on the clean or scene-pass set is a false positive. On a needled case, a
    // J1 that does not quote the needle is recorded too (it would regenerate a real
    // reading), but only the unneedled sets count false positives.
    const j1Other = out.findings.filter((f) => f.class === 'J1' && !(NEEDLED.has(c.set) && catches(c, f)));
    results.push({
      id: c.id, set: c.set, run, caught, j1, j1_other: j1Other,
      other_findings: out.findings.filter((f) => f.class !== 'J1'),
      malformed: out.malformed, usage: u, cost_usd: cost, model: out.model,
    });
    console.log(`run ${run} ${c.id.padEnd(16)} J1 ${j1.length}${NEEDLED.has(c.set) ? ` caught ${caught}` : ''} other-J1 ${j1Other.length} (J2-J3 ${out.findings.length - j1.length}, malformed ${out.malformed.length}) $${cost.toFixed(5)}`);
  }
}

// ── report ─────────────────────────────────────────────────
console.log('\nJ1 CALIBRATION TABLE');
console.log(`| case | set | ${[1, 2, 3].slice(0, RUNS).map((r) => `run ${r}`).join(' | ')} |`);
for (const c of CASES) {
  const cells = [1, 2, 3].slice(0, RUNS).map((run) => {
    const r = results.find((x) => x.id === c.id && x.run === run);
    return NEEDLED.has(c.set) ? (r.caught ? 'caught' : 'MISSED') : (r.j1.length ? `FP x${r.j1.length}` : 'clean');
  });
  console.log(`| ${c.id} | ${c.set} | ${cells.join(' | ')} |`);
}
const quote = (f) => `    sentence: ${f.sentence}\n    grounding_considered: ${JSON.stringify(f.grounding_considered)}\n    supported: ${f.supported}\n    unsupported: ${f.unsupported}`;
const missesIn = (set) => results.filter((r) => r.set === set && !r.caught);
const fpsIn = (set) => results.filter((r) => r.set === set).flatMap((r) => r.j1.map((f) => ({ case: r.id, run: r.run, ...f })));
const misses = [...missesIn('seeded'), ...missesIn('scene-fail')];
const fps = [...fpsIn('clean'), ...fpsIn('scene-pass')];
console.log(`\nMISSES (false negatives): ${misses.length}`);
for (const m of misses) {
  const c = CASES.find((x) => x.id === m.id);
  console.log(`- [${m.id} run ${m.run}] needle "${c.needle}"; the judge returned: ${m.j1.length + m.other_findings.length} finding(s)`);
  for (const f of [...m.j1, ...m.other_findings]) console.log(`  ${f.class}\n${quote(f)}`);
}
console.log(`\nJ1 FALSE POSITIVES (clean + scene-pass): ${fps.length}`);
for (const f of fps) console.log(`- [${f.case} run ${f.run}]\n${quote(f)}`);
const needledOther = results.filter((r) => NEEDLED.has(r.set)).flatMap((r) => r.j1_other.map((f) => ({ case: r.id, run: r.run, ...f })));
console.log(`\nOTHER J1 ON NEEDLED CASES (not the needle; not scored): ${needledOther.length}`);
for (const f of needledOther) console.log(`- [${f.case} run ${f.run}]\n${quote(f)}`);
console.log('\nJ2 / J3 FINDINGS (advisory, not scored):');
for (const r of results) for (const f of r.other_findings) console.log(`- [${r.id} run ${r.run}] ${f.class}\n${quote(f)}`);

const count = (set) => results.filter((r) => r.set === set).length;
const tp = count('scene-fail') - missesIn('scene-fail').length;
const fpScene = results.filter((r) => r.set === 'scene-pass' && r.j1.length > 0).length;
console.log('\nCONFUSION MATRIX, new B9 cases (per judge call):');
console.log(`| | J1 fired on the needle | no J1 on the needle |`);
console.log(`| scene-fail (must FAIL) | TP ${tp} | FN ${missesIn('scene-fail').length} |`);
console.log(`| | any J1 | no J1 |`);
console.log(`| scene-pass (must PASS) | FP ${fpScene} | TN ${count('scene-pass') - fpScene} |`);
console.log(`\nOLD SEEDED CAUGHT ${count('seeded') - missesIn('seeded').length}/${count('seeded')}; CLEAN J1 FALSE POSITIVES ${fpsIn('clean').length}`);
console.log(`NEW SCENE-FAIL CAUGHT ${tp}/${count('scene-fail')}; SCENE-PASS J1 FALSE POSITIVES ${fpsIn('scene-pass').length}`);
console.log(`SPEND $${spend.toFixed(4)} over ${results.length} judge calls`);
const pass = misses.length === 0 && fps.length === 0 && RUNS >= 3;
console.log(`\nJ1 CALIBRATION ${pass ? 'PASS' : 'FAIL'}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ cases: CASES.map(({ id, set, needle, planted }) => ({ id, set, needle, planted })), results, spend, pass }, null, 2));
process.exitCode = pass ? 0 : 1;
