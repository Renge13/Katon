#!/usr/bin/env node
// ============================================================
// scripts/bc-round.mjs — Prompt BC §3's representative round
// ============================================================
//   node --conditions=react-server scripts/bc-round.mjs --out <file.json>
//
// SPENDS: eight v2 pair renders (four pairs x temperature 0.7 and 0.9) through
// production's own path, in memory: Supabase refused, the cache cleared before every
// render, nothing written. The wire is ASSERTED, as smoke-round6-switch.mjs does: the
// v2 pair prompt at the head of the system prompt and the arm's temperature, so a miss
// exits rather than reading as a result. No model judge.
//
// Per render: served or floor (and why), words, every gate finding the attempts
// recorded, token usage, and the full reading. The reads Reyner asked for (direction
// against provenance, verdicts, dates, fixed outcomes, money or health lines, advice in
// the penutup, the archetype not written as its English title) are listed as
// candidates for a person to read, never as a verdict.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
process.env.VOICE = 'v2';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1')), '..');
const envLocal = path.join(ROOT, '.env.local');
if (!process.env.GEMINI_API_KEY && fs.existsSync(envLocal)) {
  const m = /^GEMINI_API_KEY=(.+)$/mu.exec(fs.readFileSync(envLocal, 'utf8'));
  if (m) process.env.GEMINI_API_KEY = m[1].trim();
}
if (!process.env.GEMINI_API_KEY) { console.error('FATAL no GEMINI_API_KEY'); process.exit(2); }

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { renderReading, __clearInFlight } = await import('../lib/render/index.js');
const { __clearMemCache } = await import('../lib/render/cache.js');
const { STAGE6_VERSION } = await import('../lib/validate/index.js');
const { MASTER_PROMPTS_V2, promptVersionFor } = await import('../lib/render/prompt.js');
const { sentences } = await import('../lib/validate/text.js');
const { GLOSSARY } = await import('../lib/semantic/glossary.js');

const PAIRS = [
  { id: 'sample', status: 'Menikah', nicknames: { a: 'Nadia', b: 'Bima' },
    a: { birthDate: '2005-02-14', birthTime: '07:00', gender: 'female' }, b: { birthDate: '1999-07-07', birthTime: '17:00', gender: 'male' } },
  { id: 'PZ0t', status: 'Pacaran', nicknames: { a: 'Sari', b: 'Dimas' },
    a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }, b: { birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' } },
  // Base-rate harness draw 15 (seed 20260907): a clashed day pair and non-day frame hits
  // both ways; whole hours, as the form takes them (same hour pillars as the draw).
  { id: 'clash', status: 'PDKT', nicknames: { a: 'Ayu', b: 'Raka' }, needClash: true,
    a: { birthDate: '1973-05-10', birthTime: '00:00', gender: 'female' }, b: { birthDate: '1971-08-07', birthTime: '13:00', gender: 'male' } },
  { id: 'nonames', status: 'Menikah', nicknames: {},
    a: { birthDate: '1995-06-01', birthTime: '06:00', gender: 'female' }, b: { birthDate: '1988-12-05', birthTime: '08:00', gender: 'male' } },
];
const TEMPS = [0.7, 0.9];

const fatal = (m) => { console.error(`FATAL ${m}`); process.exit(2); };
let wire = [];
let want = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (/:generateContent/.test(String(url)) && want) {
    const body = JSON.parse(opts.body);
    if (!body.systemInstruction.parts[0].text.startsWith(MASTER_PROMPTS_V2.pair)) fatal('the v2 pair prompt is not at the head of the system prompt');
    if (body.generationConfig.temperature !== want.temperature) fatal(`temperature ${body.generationConfig.temperature} on the wire, want ${want.temperature}`);
  }
  const res = await realFetch(url, opts);
  let usage = null;
  try { usage = (await res.clone().json()).usageMetadata ?? null; } catch { /* non-JSON */ }
  wire.push({ status: res.status, usage });
  return res;
};

const nonDay = (xs) => (xs || []).filter((h) => !(h.from.position === 'day' && h.to.position === 'day'));
const words = (t) => (t.match(/\p{L}[\p{L}'-]*/gu) || []).length;
const INDONESIAN_TITLES = Object.values(GLOSSARY.arketipe).map((e) => e?.name_id).filter(Boolean);
const READS = {
  verdict: /(?<![\p{L}])(cocok|tidak cocok|serasi|jodoh|pasangan sempurna|skor|persen|%)(?![\p{L}])/iu,
  fixed: /(?<![\p{L}])(pasti akan|ditakdirkan|takdir|selamanya|tidak akan pernah|20\d\d|19\d\d)(?![\p{L}])/iu,
  money_health: /(?<![\p{L}])(uang|keuangan|investasi|kaya|rezeki|harta|sakit|penyakit|depresi|cemas|kesehatan|obat)(?![\p{L}])/iu,
  advice: /(?<![\p{L}])(sebaiknya|cobalah|ingatlah|jangan lupa|harus|perlu|pastikan|bisa mencoba|coba)(?![\p{L}])/iu,
};

const records = [];
for (const p of PAIRS) {
  const sj = buildPairSemantic(calculateBaziChart(p.a), calculateBaziChart(p.b), { voice: 'v2', status: p.status, nicknames: p.nicknames });
  if (p.needClash) {
    const day = sj.facts.find((f) => f.id === 'p2_day_pair');
    const frame = sj.facts.find((f) => f.id === 'p2_palace_frame');
    if (day?.provenance?.variant !== 'p2_clash' || !nonDay(frame?.provenance?.a_hits_b).length || !nonDay(frame?.provenance?.b_hits_a).length) fatal(`${p.id}: not a clashed pair with frame hits both ways`);
  }
  for (const temperature of TEMPS) {
    __clearMemCache(); __clearInFlight(); wire = []; want = { temperature };
    const out = await renderReading(sj, { spendGuards: false, dedupeInFlight: false, captureProse: true, generation: { temperature } });
    want = null;
    const blocks = out.blocks || [];
    const prose = [...blocks.map((b) => b.text || ''), out.penutup || ''].join('\n');
    const all = sentences(prose.replace(/\n+/gu, ' '));
    const penutupSentences = sentences(out.penutup || '');
    const usage = wire.map((w) => w.usage).filter(Boolean);
    records.push({
      pair: p.id, status: p.status, nicknames: p.nicknames, temperature,
      titles: { a: sj.core.a.archetype_name_en, b: sj.core.b.archetype_name_en },
      source: out.source, floor: out.source === 'module_assembly' ? (out.floor_reason ?? out.qa_flag ?? null) : null,
      words: words(prose), regenerations: Math.max(0, (out.attempts || []).length - 1),
      // Every attempt: the rejecting checks WITH their messages, and the draft it judged.
      findings: (out.attempts || []).map((a, i) => ({ attempt: i + 1, ok: a.ok ?? null, error: a.error ?? null, rejecting: a.stage6_detail ?? null, draft: a.prose ?? null })),
      output_tokens: usage.map((u) => u.candidatesTokenCount ?? null),
      reads: {
        verdict: all.filter((s) => READS.verdict.test(s)),
        fixed: all.filter((s) => READS.fixed.test(s)),
        money_health: all.filter((s) => READS.money_health.test(s)),
        penutup_advice: penutupSentences.filter((s) => READS.advice.test(s)),
        indonesian_title: all.filter((s) => INDONESIAN_TITLES.some((n) => new RegExp(`(?<![\\p{L}])${n}(?![\\p{L}])`, 'u').test(s))),
        bracketed_title: all.filter((s) => /\(The [A-Z]/u.test(s)),
      },
      reading: { blocks: blocks.map((b) => ({ heading: b.heading, fact_ids: b.fact_ids, text: b.text })), penutup: out.penutup },
    });
    const r = records.at(-1);
    console.log(`${p.id.padEnd(8)} t=${temperature}  ${r.source.padEnd(16)} words ${String(r.words).padStart(4)}  regen ${r.regenerations}  out_tokens ${r.output_tokens.join('/')}`);
  }
}
const meta = { stage6: STAGE6_VERSION, prompt_pair: promptVersionFor('pair', 'v2'), prompt_mirror: promptVersionFor('mirror', 'v2') };
console.log(JSON.stringify(meta));
const i = process.argv.indexOf('--out');
if (i > -1) fs.writeFileSync(process.argv[i + 1], JSON.stringify({ meta, records }, null, 2));
