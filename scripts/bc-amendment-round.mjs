#!/usr/bin/env node
// ============================================================
// scripts/bc-amendment-round.mjs — BC amendment 1 item 8, the re-run
// ============================================================
//   node --conditions=react-server scripts/bc-amendment-round.mjs --out <file.json>
//
// SPENDS: eight v2 pair renders (BC §3's four pairs x two renders, both at the ruled
// 0.7) through production's own path, in memory: Supabase refused, the cache cleared
// before every render, nothing written. The wire is ASSERTED, as bc-round.mjs does: the
// v2 pair prompt at the head of the system prompt and temperature 0.7, so a miss exits
// rather than reading as a result. No model judge.
//
// Per render, BC §3's report: served or floor (and why), words, every gate finding the
// attempts recorded, token usage, and the full reading. Plus the amendment's own
// countables, as candidates for a person to read, never as a verdict: chapters and
// paragraphs per chapter (asked: six to eight, two or three each), whether the first
// chapter names both English titles, and the clinical words the voice line names.
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
const { V2_PAIR_TEMPERATURE } = await import('../lib/render/config.js');
const { sentences } = await import('../lib/validate/text.js');
const { GLOSSARY } = await import('../lib/semantic/glossary.js');

// BC §3's four pairs, unchanged (scripts/bc-round.mjs).
const PAIRS = [
  { id: 'sample', status: 'Menikah', nicknames: { a: 'Nadia', b: 'Bima' },
    a: { birthDate: '2005-02-14', birthTime: '07:00', gender: 'female' }, b: { birthDate: '1999-07-07', birthTime: '17:00', gender: 'male' } },
  { id: 'PZ0t', status: 'Pacaran', nicknames: { a: 'Sari', b: 'Dimas' },
    a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }, b: { birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' } },
  { id: 'clash', status: 'PDKT', nicknames: { a: 'Ayu', b: 'Raka' },
    a: { birthDate: '1973-05-10', birthTime: '00:00', gender: 'female' }, b: { birthDate: '1971-08-07', birthTime: '13:00', gender: 'male' } },
  { id: 'nonames', status: 'Menikah', nicknames: {},
    a: { birthDate: '1995-06-01', birthTime: '06:00', gender: 'female' }, b: { birthDate: '1988-12-05', birthTime: '08:00', gender: 'male' } },
];
const RENDERS = 2;
const TEMPERATURE = 0.7;
if (V2_PAIR_TEMPERATURE !== TEMPERATURE) { console.error(`FATAL V2_PAIR_TEMPERATURE is ${V2_PAIR_TEMPERATURE}, not the ruled 0.7`); process.exit(2); }

const fatal = (m) => { console.error(`FATAL ${m}`); process.exit(2); };
let wire = [];
let armed = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (/:generateContent/u.test(String(url)) && armed) {
    const body = JSON.parse(opts.body);
    if (!body.systemInstruction.parts[0].text.startsWith(MASTER_PROMPTS_V2.pair)) fatal('the v2 pair prompt is not at the head of the system prompt');
    if (body.generationConfig.temperature !== TEMPERATURE) fatal(`temperature ${body.generationConfig.temperature} on the wire, want ${TEMPERATURE}`);
  }
  const res = await realFetch(url, opts);
  let usage = null;
  try { usage = (await res.clone().json()).usageMetadata ?? null; } catch { /* non-JSON */ }
  wire.push({ status: res.status, usage });
  return res;
};

const words = (t) => (t.match(/\p{L}[\p{L}'-]*/gu) || []).length;
const paragraphs = (t) => String(t || '').split(/\n\s*\n/u).map((p) => p.trim()).filter(Boolean).length;
const INDONESIAN_TITLES = Object.values(GLOSSARY.arketipe).map((e) => e?.name_id).filter(Boolean);
const READS = {
  verdict: /(?<![\p{L}])(cocok|tidak cocok|serasi|jodoh|pasangan sempurna|skor|persen|%)(?![\p{L}])/iu,
  fixed: /(?<![\p{L}])(pasti akan|ditakdirkan|takdir|selamanya|tidak akan pernah|20\d\d|19\d\d)(?![\p{L}])/iu,
  money_health: /(?<![\p{L}])(uang|keuangan|investasi|kaya|rezeki|harta|sakit|penyakit|depresi|cemas|kesehatan|obat)(?![\p{L}])/iu,
  advice: /(?<![\p{L}])(sebaiknya|cobalah|ingatlah|jangan lupa|harus|perlu|pastikan|bisa mencoba|coba)(?![\p{L}])/iu,
  // The three words the amended voice line names.
  clinical: /(?<![\p{L}])(dinamika|menopang|ruang personal)(?![\p{L}])/iu,
};

const records = [];
for (const p of PAIRS) {
  const sj = buildPairSemantic(calculateBaziChart(p.a), calculateBaziChart(p.b), { voice: 'v2', status: p.status, nicknames: p.nicknames });
  const titles = { a: sj.core.a.archetype_name_en, b: sj.core.b.archetype_name_en };
  for (let r = 1; r <= RENDERS; r += 1) {
    __clearMemCache(); __clearInFlight(); wire = []; armed = true;
    // No `generation` override: production's own choice (V2_PAIR_TEMPERATURE) sets the
    // temperature, and the wire assertion above proves it is 0.7.
    const out = await renderReading(sj, { spendGuards: false, dedupeInFlight: false, captureProse: true });
    armed = false;
    const blocks = out.blocks || [];
    const prose = [...blocks.map((b) => b.text || ''), out.penutup || ''].join('\n');
    const all = sentences(prose.replace(/\n+/gu, ' '));
    const penutupSentences = sentences(out.penutup || '');
    const usage = wire.map((w) => w.usage).filter(Boolean);
    const first = blocks[0] ? `${blocks[0].heading || ''}\n${blocks[0].text || ''}` : '';
    records.push({
      pair: p.id, render: r, status: p.status, nicknames: p.nicknames, temperature: TEMPERATURE, titles,
      source: out.source, floor: out.source === 'module_assembly' ? (out.floor_reason ?? out.qa_flag ?? null) : null,
      words: words(prose), regenerations: Math.max(0, (out.attempts || []).length - 1),
      chapters: blocks.length,
      paragraphs_per_chapter: blocks.map((b) => paragraphs(b.text)),
      first_chapter_titles: { a: first.includes(titles.a), b: first.includes(titles.b) },
      findings: (out.attempts || []).map((a, i) => ({ attempt: i + 1, ok: a.ok ?? null, error: a.error ?? null, rejecting: a.stage6_detail ?? null, draft: a.prose ?? null })),
      output_tokens: usage.map((u) => u.candidatesTokenCount ?? null),
      reads: {
        verdict: all.filter((s) => READS.verdict.test(s)),
        fixed: all.filter((s) => READS.fixed.test(s)),
        money_health: all.filter((s) => READS.money_health.test(s)),
        clinical: all.filter((s) => READS.clinical.test(s)),
        penutup_advice: penutupSentences.filter((s) => READS.advice.test(s)),
        indonesian_title: all.filter((s) => INDONESIAN_TITLES.some((n) => new RegExp(`(?<![\\p{L}])${n}(?![\\p{L}])`, 'u').test(s))),
        bracketed_title: all.filter((s) => /\(The [A-Z]/u.test(s)),
      },
      reading: { blocks: blocks.map((b) => ({ heading: b.heading, fact_ids: b.fact_ids, text: b.text })), penutup: out.penutup },
    });
    const x = records.at(-1);
    console.log(`${p.id.padEnd(8)} #${r}  ${x.source.padEnd(16)} words ${String(x.words).padStart(4)}  chapters ${x.chapters}  paras ${x.paragraphs_per_chapter.join('/')}  regen ${x.regenerations}  out_tokens ${x.output_tokens.join('/')}`);
  }
}
const meta = { stage6: STAGE6_VERSION, prompt_pair: promptVersionFor('pair', 'v2'), prompt_mirror: promptVersionFor('mirror', 'v2'), temperature: TEMPERATURE };
console.log(JSON.stringify(meta));
const i = process.argv.indexOf('--out');
if (i > -1) fs.writeFileSync(process.argv[i + 1], JSON.stringify({ meta, records }, null, 2));
