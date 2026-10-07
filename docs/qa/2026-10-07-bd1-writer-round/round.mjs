#!/usr/bin/env node
// ============================================================
// docs/qa/2026-10-07-bd1-writer-round/round.mjs — Prompt BD1 §4.2
// ============================================================
//   node --conditions=react-server docs/qa/2026-10-07-bd1-writer-round/round.mjs
//
// SPENDS: four v2 pair renders, one per new P4 cell, through production's own path
// (renderReading), in memory: Supabase refused, the cache cleared before each render,
// nothing written. The wire is ASSERTED as scripts/bc-amendment-round.mjs does: the v2
// pair prompt at the head of the system prompt and production's temperature. No model
// judge. Writes round.json and ../2026-10-07-bd1-writer-round.md beside this folder.
//
// Pairs: fixture charts, female A (the reader) x male B, one per directed pattern, eight
// distinct charts, none of them the compat example's (2005-02-14 x 1999-07-07). Each
// pattern is ASSERTED from the engine before any money is spent.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
process.env.VOICE = 'v2';
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1'));
const ROOT = path.resolve(HERE, '..', '..', '..');
const envLocal = path.join(ROOT, '.env.local');
if (!process.env.GEMINI_API_KEY && fs.existsSync(envLocal)) {
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
const { VALIDATION_CHARTS } = await lib('tests/bazi-validation.fixture.js');

// Gemini list price per token, as scripts/qa-voice-v2-renders.mjs:66-69 records it.
const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25 / 1e6, out: 1.5 / 1e6 },
  'gemini-3.1-pro-preview': { in: 2.0 / 1e6, out: 12.0 / 1e6 },
};

const PAIRS = [
  { want: 'a_generates_b', a: 5, b: 1, status: 'Pacaran', nicknames: { a: 'Laras', b: 'Bagus' } },
  { want: 'a_controls_b', a: 7, b: 3, status: 'Menikah', nicknames: { a: 'Sinta', b: 'Arif' } },
  { want: 'b_controls_a', a: 4, b: 6, status: 'PDKT', nicknames: { a: 'Dewi', b: 'Yoga' } },
  { want: 'b_generates_a', a: 12, b: 8, status: 'Pacaran', nicknames: { a: 'Maya', b: 'Rizky' } },
];
const chartOf = (id) => {
  const row = VALIDATION_CHARTS.find((c) => c.id === id);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time, gender: row.gender === 'F' ? 'female' : 'male' });
};

const fatal = (m) => { console.error(`FATAL ${m}`); process.exit(2); };
const built = PAIRS.map((p) => {
  const sj = buildPairSemantic(chartOf(p.a), chartOf(p.b), { voice: 'v2', status: p.status, nicknames: p.nicknames });
  if (sj.core.pattern !== p.want) fatal(`${p.a}x${p.b} is ${sj.core.pattern}, not ${p.want}`);
  return { ...p, sj };
});

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
for (const p of built) {
  __clearMemCache(); __clearInFlight(); wire = []; armed = true;
  const out = await renderReading(p.sj, { spendGuards: false, dedupeInFlight: false, captureProse: true });
  armed = false;
  const blocks = out.blocks || [];
  const floor = out.source === 'module_assembly';
  records.push({
    pattern: p.want,
    pair: `${p.a}x${p.b}`,
    status: p.status,
    nicknames: p.nicknames,
    titles: { a: p.sj.core.a.archetype_name_en, b: p.sj.core.b.archetype_name_en },
    cell: p.sj.facts.find((f) => f.id === 'p4_temperament')?.label ?? null,
    source: out.source,
    floor,
    floor_reason: floor ? (out.floor_reason ?? out.qa_flag ?? null) : null,
    attempts: (out.attempts || []).map((a, i) => ({ attempt: i + 1, ok: a.ok ?? null, error: a.error ?? null, rejecting: a.stage6_detail ?? null })),
    p4_blocks: blocks.filter((b) => (b.fact_ids || []).includes('p4_temperament'))
      .map((b) => ({ heading: b.heading ?? null, fact_ids: b.fact_ids, text: b.text })),
    calls: wire,
    cost_usd: wire.reduce((n, w) => n + (w.cost_usd ?? 0), 0),
    reading: { blocks: blocks.map((b) => ({ heading: b.heading, fact_ids: b.fact_ids, text: b.text })), penutup: out.penutup },
  });
  const r = records.at(-1);
  console.log(`${r.pattern.padEnd(14)} ${r.pair.padEnd(5)} ${r.source.padEnd(16)} p4 blocks ${r.p4_blocks.length}  attempts ${r.attempts.length}  $${r.cost_usd.toFixed(5)}`);
}

const meta = {
  date: '2026-10-07',
  stage6: STAGE6_VERSION,
  prompt_pair: promptVersionFor('pair', 'v2'),
  temperature: V2_PAIR_TEMPERATURE,
  models: [...new Set(records.flatMap((r) => r.calls.map((c) => c.model)))],
};
fs.writeFileSync(path.join(HERE, 'round.json'), `${JSON.stringify({ meta, records }, null, 2)}\n`);

// ── the QA doc, generated so the four blocks are verbatim, never retyped ──
const total = records.reduce((n, r) => n + r.cost_usd, 0);
const md = [];
md.push('<!--');
md.push(`STATUS: REPORT (Prompt BD1 §4.2), not a judged round. Claude Code, 2026-10-07. On feat/compat-p4-option-e,`);
md.push(`STAGE6 ${meta.stage6}, pair prompt ${meta.prompt_pair}, temperature ${meta.temperature}, model ${meta.models.join(', ')}.`);
md.push('Four v2 pair renders, one per new P4 cell, production\'s path, in memory, nothing written. No model judge.');
md.push('Generated by round.mjs from round.json; the P4 blocks are the served text, verbatim.');
md.push('-->');
md.push('');
md.push('# BD1 writer round: one render per directed P4 cell');
md.push('');
md.push('```');
md.push('node --conditions=react-server docs/qa/2026-10-07-bd1-writer-round/round.mjs');
md.push('```');
md.push('');
md.push('A is the reader ("kamu"), B the partner ("ia"). Judge nothing here: Cowork reads each block for direction, i.e. whether the block gives the step to the right person. A block with "floor" beside it is the module-assembly floor (the cell text), not a render.');
md.push('');
md.push('| pattern | fixture pair | status | A / B | cell (name_id) | served | attempts | rejecting checks | cost (USD) |');
md.push('|---|---|---|---|---|---|---|---|---|');
for (const r of records) {
  const rejecting = r.attempts.filter((a) => a.rejecting).map((a) => `#${a.attempt}: ${JSON.stringify(a.rejecting)}`).join('; ') || '-';
  md.push(`| \`${r.pattern}\` | ${r.pair} | ${r.status} | ${r.nicknames.a} / ${r.nicknames.b} | ${r.cell} | ${r.floor ? 'floor' : 'writer'} | ${r.attempts.length} | ${rejecting} | ${r.cost_usd.toFixed(5)} |`);
}
md.push('');
md.push(`Total provider cost: USD ${total.toFixed(5)} (${records.flatMap((r) => r.calls).length} calls; list price per token from scripts/qa-voice-v2-renders.mjs).`);
for (const r of records) {
  md.push('');
  md.push(`## \`${r.pattern}\`: ${r.nicknames.a} (A, kamu) and ${r.nicknames.b} (B, ia)${r.floor ? ' - floor' : ''}`);
  md.push('');
  md.push(`Fixture ${r.pair}, ${r.status}. Titles: A ${r.titles.a}, B ${r.titles.b}. Cell: ${r.cell}. Stage 6: ${r.floor ? `floor (${r.floor_reason ?? 'no reason recorded'})` : `served by the writer after ${r.attempts.length} attempt(s)`}.`);
  if (r.p4_blocks.length === 0) {
    md.push('');
    md.push('No block carries `p4_temperament` in its fact_ids.');
  }
  for (const b of r.p4_blocks) {
    md.push('');
    md.push(`fact_ids: ${b.fact_ids.join(', ')}`);
    md.push('');
    if (b.heading) md.push(`### ${b.heading}`, '');
    md.push(b.text);
  }
}
md.push('');
fs.writeFileSync(path.join(HERE, '..', '2026-10-07-bd1-writer-round.md'), md.join('\n'));
console.log(JSON.stringify({ ...meta, total_usd: total }));
