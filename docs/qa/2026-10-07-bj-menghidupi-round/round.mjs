#!/usr/bin/env node
// ============================================================
// docs/qa/2026-10-07-bj-menghidupi-round/round.mjs — Prompt BJ §2 item 4
// ============================================================
//   node --conditions=react-server docs/qa/2026-10-07-bj-menghidupi-round/round.mjs
//
// BI's round (docs/qa/2026-10-07-bi-direction-round/round.mjs), copied, re-run after
// Inti Menghidupi's seeds were rewritten (care, not initiative), for the FOUR
// produces/generates pairs only: reyner first, then sample-19, sample-44, sample-50.
// The pair selection below is BI's, unchanged, so the pairs, names and statuses are
// BI's; the four are filtered out of it after it runs. Everything else is as BI's.
//
// SPENDS: four v2 pair renders (BI's eight are selected, four rendered) through production's own path (renderReading), in
// memory: Supabase refused, the cache cleared before each render, nothing written. The
// wire is ASSERTED as the BD1 round does: the v2 pair prompt at the head of the system
// prompt and production's temperature. No model judge.
//
// The pairs: P1 and P4 point in OPPOSITE directions, which is the shape of the defect in
// Reyner's paid reading FpzdJClI11-giquyEpZBA. Four produces/generates (Reyner's pair
// plus the first three in the BD1 harness sample), four controls/controls (the first four
// in the sample). The sample is scripts/compat-base-rates.mjs drawSample, seed 20260907.
// None is the compat example's charts (2005-02-14 x 1999-07-07). Every pair's facts are
// ASSERTED from the engine before any money is spent.
// Writes round.json and ../2026-10-07-bj-menghidupi-round.md.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
process.env.VOICE = 'v2';
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1'));
const ROOT = path.resolve(HERE, '..', '..', '..');
const envLocal = ['.env.local', path.join('..', '..', '..', '.env.local')]
  .map((p) => path.resolve(ROOT, p)).find((p) => fs.existsSync(p));
if (!process.env.GEMINI_API_KEY && envLocal) {
  const m = /^GEMINI_API_KEY=(.+)$/mu.exec(fs.readFileSync(envLocal, 'utf8'));
  if (m) process.env.GEMINI_API_KEY = m[1].trim();
}
if (!process.env.GEMINI_API_KEY) { console.error('FATAL no GEMINI_API_KEY'); process.exit(2); }

const lib = (p) => import(new URL(`file:///${ROOT.replace(/\\/gu, '/')}/${p}`).href);
const { calculateBaziChart } = await lib('lib/bazi/buildChart.js');
const { buildPairSemantic } = await lib('lib/semantic/pair.js');
const { renderReading, __clearInFlight } = await lib('lib/render/index.js');
const { __clearMemCache } = await lib('lib/render/cache.js');
const { STAGE6_VERSION } = await lib('lib/validate/index.js');
const { MASTER_PROMPTS_V2, promptVersionFor } = await lib('lib/render/prompt.js');
const { V2_PAIR_TEMPERATURE } = await lib('lib/render/config.js');
const { drawSample } = await lib('scripts/compat-base-rates.mjs');

// Gemini list price per token, as scripts/qa-voice-v2-renders.mjs:66-69 records it.
const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25 / 1e6, out: 1.5 / 1e6 },
  'gemini-3.1-pro-preview': { in: 2.0 / 1e6, out: 12.0 / 1e6 },
};
const fatal = (m) => { console.error(`FATAL ${m}`); process.exit(2); };

const giverOf = (id) => (id?.startsWith('a_') ? 'a' : id?.startsWith('b_') ? 'b' : null);
const kindOf = (sj) => {
  const p1 = sj.facts.find((f) => f.id === 'p1_stem_relation').provenance;
  const p4 = sj.facts.find((f) => f.id === 'p4_temperament').provenance;
  if (p1.variant === 'p1_combination') return null;
  const g1 = giverOf(p1.cycle);
  const g4 = giverOf(p4.pattern);
  if (!g1 || !g4 || g1 === g4) return null;
  if (p1.variant === 'p1_produces' && /generates/u.test(p4.pattern)) return 'produces/generates';
  if (p1.variant === 'p1_controls' && /controls/u.test(p4.pattern)) return 'controls/controls';
  return null;
};

// ── the eight pairs ──
const NAMES = [['Laras', 'Bagus'], ['Sinta', 'Arif'], ['Dewi', 'Yoga'], ['Maya', 'Rizky'], ['Putri', 'Bima'], ['Ayu', 'Raka'], ['Nadya', 'Fajar']];
const STATUSES = ['PDKT', 'Pacaran', 'Menikah', 'Pacaran', 'PDKT', 'Menikah', 'Pacaran'];
const EXAMPLE = new Set(['2005-02-14', '1999-07-07']);

const pairs = [{
  id: 'reyner', note: 'Reyner\'s paid pair FpzdJClI11-giquyEpZBA, status as stored (Menikah, from Reyner 2026-10-07)',
  status: 'Menikah', nicknames: { a: 'Rey', b: 'Eta' },
  a: { birthDate: '1989-09-13', birthTime: null, gender: 'male' },
  b: { birthDate: '1997-09-14', birthTime: null, gender: 'female' },
}];
const { built, pairIdx } = drawSample({ charts: 2000, pairs: 5000, seed: 20260907 });
const want = { 'produces/generates': 3, 'controls/controls': 4 };
let k = 0;
for (const [n, [i, j]] of pairIdx.entries()) {
  if (!want['produces/generates'] && !want['controls/controls']) break;
  const A = built[i].birth;
  const B = built[j].birth;
  if (EXAMPLE.has(A.birthDate) || EXAMPLE.has(B.birthDate)) continue;
  const probe = buildPairSemantic(built[i].chart, built[j].chart, { voice: 'v2', status: 'Pacaran', nicknames: { a: 'x', b: 'y' } });
  const kind = kindOf(probe);
  if (!kind || !want[kind]) continue;
  want[kind] -= 1;
  pairs.push({
    id: `sample-${n}`, note: `BD1 harness sample pair #${n} (seed 20260907)`,
    status: STATUSES[k], nicknames: { a: NAMES[k][0], b: NAMES[k][1] },
    a: { ...A, gender: 'female' }, b: { ...B, gender: 'male' },
  });
  k += 1;
}
if (pairs.length !== 8) fatal(`found ${pairs.length} pairs, want 8`);

const builtPairs = pairs.map((p) => {
  const sj = buildPairSemantic(calculateBaziChart(p.a), calculateBaziChart(p.b), { voice: 'v2', status: p.status, nicknames: p.nicknames });
  const kind = kindOf(sj);
  if (!kind) fatal(`${p.id}: P1 and P4 do not point in opposite directions`);
  const p1 = sj.facts.find((f) => f.id === 'p1_stem_relation');
  const p4 = sj.facts.find((f) => f.id === 'p4_temperament');
  if (!p1.provenance.direction || !p4.provenance.direction) fatal(`${p.id}: a directed fact carries no direction`);
  return { ...p, sj, kind, p1, p4 };
});
const kinds = builtPairs.map((p) => p.kind);
if (kinds.filter((x) => x === 'produces/generates').length !== 4 || kinds.filter((x) => x === 'controls/controls').length !== 4) {
  fatal(`kinds ${kinds.join(', ')}`);
}
if (builtPairs[0].p1.provenance.direction.from !== 'Rey' || builtPairs[0].p4.provenance.direction.from !== 'Eta') {
  fatal('Reyner\'s pair does not carry the defect\'s directions');
}
// ── BJ: the four produces/generates pairs only, in this order ──
const ONLY = ['reyner', 'sample-19', 'sample-44', 'sample-50'];
const selected = ONLY.map((id) => builtPairs.find((p) => p.id === id));
if (selected.some((p) => !p || p.kind !== 'produces/generates')) fatal('the four produces/generates pairs are not the ones BI rendered');
const p1Cell = builtPairs[0].sj.facts.find((f) => f.id === 'p1_stem_relation');
if (!/Kepedulian dan dukungan/u.test(JSON.stringify(p1Cell))) fatal('p1_produces does not carry the new seeds');

let wire = [];
let armed = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const isGen = /:generateContent/u.test(String(url));
  if (isGen && armed) {
    const body = JSON.parse(opts.body);
    if (!body.systemInstruction.parts[0].text.startsWith(MASTER_PROMPTS_V2.pair)) fatal('the v2 pair prompt is not at the head of the system prompt');
    if (body.generationConfig.temperature !== V2_PAIR_TEMPERATURE) fatal(`temperature ${body.generationConfig.temperature} on the wire`);
  }
  const res = await realFetch(url, opts);
  if (isGen) {
    const model = /models\/([^:/]+):generateContent/u.exec(String(url))?.[1] ?? null;
    let usage = null;
    try { usage = (await res.clone().json()).usageMetadata ?? null; } catch { /* non-JSON */ }
    const price = PRICES[model];
    const cost = price && usage
      ? (usage.promptTokenCount || 0) * price.in + ((usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0)) * price.out
      : null;
    wire.push({ model, status: res.status, usage, cost_usd: cost });
  }
  return res;
};

const records = [];
for (const p of selected) {
  __clearMemCache(); __clearInFlight(); wire = []; armed = true;
  const out = await renderReading(p.sj, { spendGuards: false, dedupeInFlight: false, captureProse: true });
  armed = false;
  const blocks = out.blocks || [];
  const floor = out.source === 'module_assembly';
  const factView = (f) => ({
    id: f.id, variant: f.provenance.variant ?? f.provenance.pattern, cycle: f.provenance.cycle ?? null,
    label: f.label ?? null, direction: f.provenance.direction,
  });
  records.push({
    id: p.id, note: p.note, kind: p.kind, status: p.status, nicknames: p.nicknames, births: { a: p.a, b: p.b },
    facts: [factView(p.p1), factView(p.p4)],
    source: out.source, floor, floor_reason: floor ? (out.floor_reason ?? out.qa_flag ?? null) : null,
    attempts: (out.attempts || []).map((a, i) => ({ attempt: i + 1, ok: a.ok ?? null, error: a.error ?? null, rejecting: a.stage6_detail ?? null })),
    blocks_mentioning: blocks
      .filter((b) => (b.fact_ids || []).some((id) => id === 'p1_stem_relation' || id === 'p4_temperament'))
      .map((b) => ({ heading: b.heading ?? null, fact_ids: b.fact_ids, text: b.text })),
    calls: wire,
    cost_usd: wire.reduce((n, w) => n + (w.cost_usd ?? 0), 0),
    reading: { blocks: blocks.map((b) => ({ heading: b.heading, fact_ids: b.fact_ids, text: b.text })), penutup: out.penutup },
  });
  const r = records.at(-1);
  console.log(`${r.id.padEnd(12)} ${r.kind.padEnd(19)} ${r.source.padEnd(16)} blocks ${r.blocks_mentioning.length}  attempts ${r.attempts.length}  $${r.cost_usd.toFixed(5)}`);
}

const meta = {
  date: '2026-10-07', stage6: STAGE6_VERSION, prompt_pair: promptVersionFor('pair', 'v2'),
  temperature: V2_PAIR_TEMPERATURE, models: [...new Set(records.flatMap((r) => r.calls.map((c) => c.model)))],
};
fs.writeFileSync(path.join(HERE, 'round.json'), `${JSON.stringify({ meta, records }, null, 2)}\n`);

// ── the QA doc, generated so every block is verbatim ──
const total = records.reduce((n, r) => n + r.cost_usd, 0);
const dir = (d) => (d ? `${d.from} -> ${d.to}` : 'none');
const md = [];
md.push('<!--');
md.push('STATUS: REPORT (Prompt BJ §2 item 4), not a judged round. Claude Code, 2026-10-07. On fix/inti-menghidupi-seeds,');
md.push(`STAGE6 ${meta.stage6}, pair prompt ${meta.prompt_pair}, temperature ${meta.temperature}, model ${meta.models.join(', ')}.`);
md.push('Four v2 pair renders, production\'s path, in memory, nothing written. No model judge. Generated by round.mjs;');
md.push('every block below is the served text, verbatim.');
md.push('-->');
md.push('');
md.push('# BJ round: Inti Menghidupi rewritten, the four produces/generates pairs again');
md.push('');
md.push('```');
md.push('node --conditions=react-server docs/qa/2026-10-07-bj-menghidupi-round/round.mjs');
md.push('```');
md.push('');
md.push('BI\'s four produces/generates pairs (same births, names and statuses; see docs/qa/2026-10-07-bi-direction-round.md), re-rendered after Reyner\'s 2026-10-07 ruling: Inti Menghidupi (`p1_produces`) owns care, support and safety, Pola Menyalakan owns ideas and initiative (docs/content/compat-p1-produces-rulings-2026-10-07.md). P1 and P4 still point in OPPOSITE directions. A is the reader. Judge nothing here: Cowork reads each block for direction and for the two facts saying different things. "floor" beside a render means the module-assembly floor (cell text), not a render.');
md.push('');
md.push('| pair | kind | status | A / B | P1 (direction) | P4 (direction) | served | attempts | rejecting checks | cost (USD) |');
md.push('|---|---|---|---|---|---|---|---|---|---|');
for (const r of records) {
  const rejecting = r.attempts.filter((a) => a.rejecting).map((a) => `#${a.attempt}: ${JSON.stringify(a.rejecting)}`).join('; ') || '-';
  md.push(`| ${r.id} | ${r.kind} | ${r.status} | ${r.nicknames.a} / ${r.nicknames.b} | ${r.facts[0].label}, \`${r.facts[0].cycle}\` (${dir(r.facts[0].direction)}) | ${r.facts[1].label}, \`${r.facts[1].variant}\` (${dir(r.facts[1].direction)}) | ${r.floor ? 'floor' : 'writer'} | ${r.attempts.length} | ${rejecting} | ${r.cost_usd.toFixed(5)} |`);
}
md.push('');
md.push(`Total provider cost: USD ${total.toFixed(5)} (${records.flatMap((r) => r.calls).length} calls; list price per token from scripts/qa-voice-v2-renders.mjs).`);
for (const r of records) {
  md.push('');
  md.push(`## ${r.id}: ${r.nicknames.a} (A) and ${r.nicknames.b} (B), ${r.status}, ${r.kind}${r.floor ? ' - floor' : ''}`);
  md.push('');
  md.push(`${r.note}. Births: A ${r.births.a.birthDate} ${r.births.a.birthTime ?? '(no hour)'}, B ${r.births.b.birthDate} ${r.births.b.birthTime ?? '(no hour)'}.`);
  md.push('');
  md.push(`- P1 ${r.facts[0].label} (\`${r.facts[0].cycle}\`): direction ${dir(r.facts[0].direction)}`);
  md.push(`- P4 ${r.facts[1].label} (\`${r.facts[1].variant}\`): direction ${dir(r.facts[1].direction)}`);
  md.push(`- Stage 6: ${r.floor ? `floor (${r.floor_reason ?? 'no reason recorded'})` : `served by the writer after ${r.attempts.length} attempt(s)`}. Cost USD ${r.cost_usd.toFixed(5)}.`);
  if (r.blocks_mentioning.length === 0) md.push('', 'No block lists `p1_stem_relation` or `p4_temperament` in its fact_ids.');
  for (const b of r.blocks_mentioning) {
    md.push('', `fact_ids: ${b.fact_ids.join(', ')}`, '');
    if (b.heading) md.push(`### ${b.heading}`, '');
    md.push(b.text);
  }
}
md.push('');
fs.writeFileSync(path.join(HERE, '..', '2026-10-07-bj-menghidupi-round.md'), md.join('\n'));
console.log(JSON.stringify({ ...meta, total_usd: total }));
