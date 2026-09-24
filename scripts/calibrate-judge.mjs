#!/usr/bin/env node
// ============================================================
// scripts/calibrate-judge.mjs — the voice-v2 judge, calibrated before anything is served
// ============================================================
//   node --conditions=react-server scripts/calibrate-judge.mjs [--runs 3] [--out file.json]
//
// SPENDS: the judge model (lib/validate/judge.js JUDGE_MODEL) once per case per run. Reads GEMINI_API_KEY
// from .env.local.
//
// Round 2 instruction (Reyner, 2026-09-24): "Judge calibration before anything is
// served: S1-S4 from worksheet §5 as the clean set, plus a seeded-bad set with one
// planted violation per class. Quote the catch table (all four classes caught) and
// every false positive with its grounding fields. The spec's worked example must
// pass. If calibration fails, stop and report."
//
// ── THE CLEAN SET IS READ FROM THE WORKSHEET, NOT RETYPED ──
// Each S-sample is the "**After:**" blockquote of its section in
// docs/content/voice-v2-worksheet-2026-09-24.md, parsed at run time. A `**Bold**`
// line opens a block; `**Penutup**` opens the penutup.
//
// ── ONE CALIBRATION CHOICE, STATED ─────────────────────────
// The S-samples are FRAGMENTS of a reading by construction (S4 says so outright).
// Judged against the chart's full required_points, J4 would fire on every point a
// fragment never set out to cover, and that would be a finding about the sample,
// not the judge. So each case passes the judge only the required points the sample
// claims to carry (its own worksheet grounding note). The planted J4 case drops the
// cost of a point THAT IS in its list, so coverage is still being tested.
//
// ── EVERY SEED MUST ACTUALLY PLANT ─────────────────────────
// A seed is a string edit on a clean sample; if the anchor text is not found the
// script throws. A seed that silently did nothing would score as "not caught" at
// best and as a clean pass at worst.
// ============================================================

import fs from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { scrubInternal } from '../lib/render/payload.js';
import { judgeRendering } from '../lib/validate/judge.js';

const ENV = '.env.local';
if (fs.existsSync(ENV)) {
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const RUNS = Number(arg('runs', 3));
const OUT = arg('out', null);

// ── the worksheet samples ──────────────────────────────────
const SHEET = fs.readFileSync('docs/content/voice-v2-worksheet-2026-09-24.md', 'utf8');
function sample(tag) {
  const start = SHEET.indexOf(`### ${tag}.`);
  if (start < 0) throw new Error(`worksheet: no section ${tag}`);
  const after = SHEET.indexOf('**After', start);
  const lines = SHEET.slice(after).split(/\r?\n/).slice(1);
  const quoted = [];
  let begun = false;
  for (const line of lines) {
    if (line.startsWith('>')) { begun = true; quoted.push(line.replace(/^>\s?/, '')); } else if (begun) break;
  }
  const blocks = [];
  let penutup = null;
  let current = null;
  for (const line of quoted) {
    const h = /^\*\*(.+)\*\*$/.exec(line.trim());
    if (h) {
      if (h[1] === 'Penutup') { penutup = ''; current = null; continue; }
      current = { heading: h[1], text: '' };
      blocks.push(current);
      continue;
    }
    if (penutup !== null && current === null) { penutup += `${line}\n`; continue; }
    if (current) current.text += `${line}\n`;
  }
  const tidy = (s) => s.replace(/\n{3,}/g, '\n\n').trim();
  return {
    blocks: blocks.map((b) => ({ heading: b.heading, text: tidy(b.text) })),
    penutup: penutup === null ? '' : tidy(penutup),
  };
}
function plant(rendered, from, to) {
  const all = JSON.stringify(rendered);
  if (!all.includes(JSON.stringify(from).slice(1, -1))) throw new Error(`seed anchor not found: ${from.slice(0, 60)}`);
  return {
    blocks: rendered.blocks.map((b) => ({ ...b, text: b.text.split(from).join(to) })),
    penutup: rendered.penutup.split(from).join(to),
  };
}

// ── the charts (worksheet §5: chart A, and S4's pair A + B) ──
const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' });
const mirror = scrubInternal(buildSemanticJson(A, { voice: 'v2' }));
const pair = scrubInternal(buildPairSemantic(A, B, { voice: 'v2' }));
const only = (payload, ids) => {
  const req = payload.required_points.filter((r) => ids.includes(r.fact_id));
  if (req.length !== ids.length) throw new Error(`required point missing: ${ids}`);
  return { ...payload, required_points: req };
};

const S1 = sample('S1'); const S2 = sample('S2'); const S3 = sample('S3'); const S4 = sample('S4');
const WORKED = 'Orang melihat ketenanganmu. Mereka jarang melihat berapa banyak yang kamu tahan untuk tetap terlihat tenang.';
if (!JSON.stringify(S3).includes(WORKED)) throw new Error('S3 no longer carries the spec worked example');

// ── the seeds, one per class ───────────────────────────────
const J1_TEXT = 'Di pilar yang sama juga ada Bintang Perantau (Travelling Horse), yang membuatmu gelisah kalau terlalu lama di satu kantor.';
const J2_TEXT = 'Bintang Penolong muncul di pilar ini karena Tanda Kekosongan membuat orang kasihan padamu.';
const J3_TEXT = 'Kamu tidak pernah bisa melepasnya, dalam keadaan apa pun.';
const J4_DROPPED = 'Orang sudah menganggapmu ahli, sementara kamu masih menunggu bukti berikutnya. Pujian datang, kamu mengucapkan terima kasih, lalu pujian itu lewat tanpa pernah menetap.';

const CASES = [
  { id: 'S1', set: 'clean', payload: only(mirror, ['void_stack_month']), rendered: S1 },
  { id: 'S2', set: 'clean', payload: only(mirror, ['day_master_Fire', 'strength_weak']), rendered: S2 },
  { id: 'S3', set: 'clean', payload: only(mirror, ['aspek_convergence_正官', 'spouse_palace']), rendered: S3 },
  { id: 'S4', set: 'clean', payload: only(pair, ['p2_day_pair', 'p2_palace_frame', 'p3_supply', 'p4_temperament', 'p5_pull_fit']), rendered: S4 },
  { id: 'WORKED', set: 'clean', payload: { ...mirror, required_points: [] }, rendered: { blocks: [{ heading: 'Contoh', text: WORKED }], penutup: '' } },
  {
    id: 'seed-J1', set: 'seeded', planted: 'J1', needle: 'Bintang Perantau', payload: only(mirror, ['void_stack_month']),
    rendered: plant(S1, 'yang membuat bantuan datang tepat saat jalanmu buntu.', `yang membuat bantuan datang tepat saat jalanmu buntu. ${J1_TEXT}`),
  },
  {
    id: 'seed-J2', set: 'seeded', planted: 'J2', needle: 'kasihan', payload: only(mirror, ['void_stack_month']),
    rendered: plant(S1, 'lalu pujian itu lewat tanpa pernah menetap.', `lalu pujian itu lewat tanpa pernah menetap. ${J2_TEXT}`),
  },
  {
    id: 'seed-J3', set: 'seeded', planted: 'J3', needle: 'dalam keadaan apa pun', payload: only(mirror, ['aspek_convergence_正官', 'spouse_palace']),
    rendered: plant(S3, 'Kamu jarang bisa.', J3_TEXT),
  },
  {
    id: 'seed-J4', set: 'seeded', planted: 'J4', needle: 'void_stack_month', payload: only(mirror, ['void_stack_month']),
    rendered: plant(plant(S1, ` ${J4_DROPPED}`, ''), ', dan usaha itu tidak pernah terasa cukup.', '.'),
  },
];
if (JSON.stringify(CASES.at(-1).rendered).includes('bukti berikutnya')) throw new Error('J4 seed did not drop the cost');

// Per 1M tokens, paid Standard tier, prompts <= 200k (ai.google.dev/gemini-api/docs/pricing,
// read 2026-09-24). Thought tokens bill as output.
const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25 / 1e6, out: 1.5 / 1e6 },
  'gemini-3.1-pro-preview': { in: 2.0 / 1e6, out: 12.0 / 1e6 },
};
/** Is this finding the planted violation? */
function hitsPlant(c, f) {
  if (f.class !== c.planted) return false;
  if (c.planted === 'J4') {
    return f.missing === 'cost'
      && (f.sentence.includes(c.needle) || f.grounding_considered.includes(c.needle));
  }
  return f.sentence.includes(c.needle);
}

const results = [];
let spend = 0;
for (const c of CASES) {
  for (let run = 1; run <= RUNS; run += 1) {
    const out = await judgeRendering(c.rendered, c.payload);
    const u = out.usage || {};
    const PRICE = PRICES[out.model];
    if (!PRICE) throw new Error(`no price for ${out.model}`);
    const cost = (u.promptTokenCount || 0) * PRICE.in + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * PRICE.out;
    spend += cost;
    const caught = c.planted ? out.findings.some((f) => hitsPlant(c, f)) : null;
    const falsePositives = out.findings.filter((f) => !(c.planted && hitsPlant(c, f)));
    const workedFlagged = out.findings.filter((f) => WORKED.split('. ').some((s) => f.sentence.includes(s.replace(/\.$/, ''))));
    results.push({ id: c.id, set: c.set, run, caught, findings: out.findings, false_positives: falsePositives, malformed: out.malformed, worked_flagged: workedFlagged, usage: u, cost_usd: cost });
    console.log(`${c.id.padEnd(8)} run ${run}: findings ${out.findings.length}, malformed ${out.malformed.length}${c.planted ? `, caught ${caught}` : ''}, fp ${falsePositives.length}, $${cost.toFixed(5)}`);
  }
}

const seeded = results.filter((r) => r.set === 'seeded');
const byClass = {};
for (const r of seeded) {
  const k = r.id.replace('seed-', '');
  byClass[k] = byClass[k] || { caught: 0, runs: 0 };
  byClass[k].runs += 1;
  if (r.caught) byClass[k].caught += 1;
}
console.log('\nCATCH TABLE');
for (const [k, v] of Object.entries(byClass)) console.log(`  ${k}: ${v.caught}/${v.runs}`);
const fps = results.flatMap((r) => r.false_positives.map((f) => ({ case: r.id, run: r.run, ...f })));
console.log(`\nFALSE POSITIVES: ${fps.length}`);
for (const f of fps) {
  console.log(`- [${f.case} run ${f.run}] ${f.class} (${f.severity})\n    sentence: ${f.sentence}\n    grounding_considered: ${JSON.stringify(f.grounding_considered)}\n    supported: ${f.supported}\n    unsupported: ${f.unsupported}${f.missing ? `\n    missing: ${f.missing}` : ''}`);
}
const workedFails = results.filter((r) => r.worked_flagged.length > 0);
console.log(`\nWORKED EXAMPLE flagged in ${workedFails.length} of ${results.filter((r) => r.id === 'WORKED' || r.id === 'S3').length} runs that carry it`);
console.log(`\nSPEND $${spend.toFixed(4)} over ${results.length} judge calls`);
const pass = Object.values(byClass).every((v) => v.caught === v.runs) && workedFails.length === 0;
console.log(`\nCALIBRATION ${pass ? 'PASS' : 'FAIL'}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ results, byClass, spend }, null, 2));
process.exitCode = pass ? 0 : 1;
