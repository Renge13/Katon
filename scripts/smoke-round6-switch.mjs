#!/usr/bin/env node
// ============================================================
// scripts/smoke-round6-switch.mjs — Prompt AV §3: the switch's smoke check
// ============================================================
//   node --conditions=react-server scripts/smoke-round6-switch.mjs [--out <file.json>]
//
// SPENDS (five flash-lite renders, about $0.015 at round 6's cost). NOT a judged round:
// one render each of chart1, chart4, chart7, chart13 and smewTN on the FINAL §2
// configuration, which is production's own path with no override: no model, prompt or
// temperature is set here. The wire is ASSERTED instead: the v2 mirror prompt at the
// head of the system prompt, temperature 0.9, no relation label_bracket in the payload.
// A miss exits rather than reading as a result.
//
// In memory: Supabase refused, the cache cleared before every reading, nothing written.
// Reports per reading: served or floor and the floor reason; words; relation English
// after the strip (target 0); badges named in the prose (information only); questions
// to her (target 0); the full final sentence of the penutup. No model judge.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const OUT = (() => { const i = process.argv.indexOf('--out'); return i > -1 ? process.argv[i + 1] : null; })();
const SUBJECTS = [
  // The same births as round 6 (scripts/qa-voice-round6.mjs on exp/voice-round6).
  { id: 'chart1', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' } },
  { id: 'chart4', a: { birthDate: '1995-06-01', birthTime: '06:00', gender: 'female' } },
  { id: 'chart7', a: { birthDate: '1993-06-12', birthTime: '23:30', gender: 'female' } },
  { id: 'chart13', a: { birthDate: '1989-02-04', birthTime: '04:00', gender: 'male' } },
  { id: 'smewTNtzNaoQmWysi6mYU', a: { birthDate: '2001-02-14', birthTime: '13:00', gender: 'female' } },
  // Prompt BA §4, Reyner 2026-10-01: "render at least one pair reading in the smoke and
  // report its final sentences." PZ0t, the births of every stored v2 pair round.
  { id: 'PZ0t_B3YDnzdXc2LWV38D', kind: 'pair', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }, b: { birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' } },
];
const PRICE = { in: 0.25, out: 1.5 }; // flash-lite per 1M, as round 6
const costOf = (u) => (u ? ((u.promptTokenCount || 0) * PRICE.in + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * PRICE.out) / 1e6 : 0);

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]] && !m[1].startsWith('SUPABASE')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
process.env.VOICE = 'v2';

const { isSupabaseConfigured } = await import('../lib/supabase.js');
if (isSupabaseConfigured()) throw new Error('refusing: Supabase is configured; this run must be in memory');
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { renderReading, __clearInFlight, floorReason } = await import('../lib/render/index.js');
const { __clearMemCache } = await import('../lib/render/cache.js');
const { STAGE6_VERSION } = await import('../lib/validate/index.js');
const { MASTER_PROMPTS_V2, promptVersionFor } = await import('../lib/render/prompt.js');
const { V2_MIRROR_TEMPERATURE, GENERATION } = await import('../lib/render/config.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { sentences } = await import('../lib/validate/text.js');
// The element glosses, read from where they live on this branch (a client component
// Node cannot import); #186 moves them to lib/site/elements.js. Parsed, not copied.
const ELEMENT_GLOSS = Object.fromEntries([...fs.readFileSync('components/Funnel.jsx', 'utf8')
  .slice(0, 20000).matchAll(/^\s+(Kayu|Api|Tanah|Logam|Air): '([^']+)',$/gmu)].map((m) => [m[1], m[2]]));
if (Object.keys(ELEMENT_GLOSS).length !== 5) throw new Error(`element glosses not found (${Object.keys(ELEMENT_GLOSS).length})`);
const G = JSON.parse(fs.readFileSync('docs/content/glossary.json', 'utf8'));

const REL_KIND = new Set(['branch_relation', 'punishment']);
const REL = Object.entries(G.relasi_cabang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v);
const REL_EN = new Set(REL.map((v) => v.name_en.toLowerCase()));
const BINTANG = new Set(Object.entries(G.bintang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v.name_id));

const fatal = (msg) => { console.error(`FATAL ${msg}`); process.exit(2); };
let wire = [];
let current = null;
let currentKind = 'mirror';
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (/:generateContent/.test(String(url)) && current) {
    const body = JSON.parse(opts.body);
    if (!body.systemInstruction.parts[0].text.startsWith(MASTER_PROMPTS_V2[currentKind])) fatal(`${current}: the v2 ${currentKind} prompt is not at the head of the system prompt`);
    // The v2 pair keeps GENERATION.temperature (lib/render/config.js V2_MIRROR_TEMPERATURE note).
    const wantT = currentKind === 'mirror' ? V2_MIRROR_TEMPERATURE : GENERATION.temperature;
    if (body.generationConfig.temperature !== wantT) fatal(`${current}: temperature ${body.generationConfig.temperature} on the wire`);
    const payload = JSON.parse(body.contents[0].parts[0].text);
    if (currentKind === 'mirror' && (payload.facts || []).some((f) => REL_KIND.has(f.provenance?.kind) && f.label_bracket)) fatal(`${current}: a relation label_bracket reached the writer`);
  }
  const res = await realFetch(url, opts);
  let usage = null;
  try { usage = (await res.clone().json()).usageMetadata ?? null; } catch { /* non-JSON */ }
  wire.push({ status: res.status, usage });
  return res;
};

const records = [];
for (const s of SUBJECTS) {
  __clearMemCache(); __clearInFlight(); wire = []; current = s.id; currentKind = s.kind || 'mirror';
  const sj = currentKind === 'pair'
    ? buildPairSemantic(calculateBaziChart(s.a), calculateBaziChart(s.b), { voice: 'v2' })
    : buildSemanticJson(calculateBaziChart(s.a), { voice: 'v2' });
  const out = await renderReading(sj, { spendGuards: false, dedupeInFlight: false, captureProse: true });
  current = null;
  const blocks = out.blocks || [];
  const allText = [...blocks.map((b) => `${b.heading || ''}\n${b.text || ''}`), out.penutup || ''].join('\n');
  const prose = [...blocks.map((b) => b.text || ''), out.penutup || ''].join('\n');
  const relationEnglish = [
    ...REL.flatMap((r) => {
      const hits = []; let at = prose.indexOf(r.name_id);
      while (at !== -1) {
        const m = /^\s*\(([^()]{1,60})\)/u.exec(prose.slice(at + r.name_id.length));
        if (m) hits.push(`${r.name_id} (${m[1]})`);
        at = prose.indexOf(r.name_id, at + 1);
      }
      return hits;
    }),
    ...[...prose.matchAll(/\(([^()]{1,60})\)/gu)].map((m) => m[1].trim()).filter((b) => REL_EN.has(b.toLowerCase()) || /\b(trine|clash|harm|punishment|combination)\b/iu.test(b)).map((b) => `(${b})`),
  ];
  const penutupSentences = sentences(out.penutup || '');
  // ── AX §3's two reads (a list for a person, not a gate) ──
  // Imperatives and reminders addressed to her: the three Reyner named, "harus" in a
  // sentence about her, and AX's "pastikan" / "cobalah".
  const IMPERATIVE = /(?<![\p{L}])(ingatlah|jangan lupa|kamu harus|pastikan|cobalah)(?![\p{L}])|(?<![\p{L}])harus(?![\p{L}])/iu;
  const ABOUT_HER = /(?<![\p{L}])(kamu|dirimu)(?![\p{L}])|\p{L}+mu(?![\p{L}])/iu;
  const allSent = sentences(prose.replace(/\n+/g, ' '));
  const imperatives = allSent.filter((x) => {
    const m = IMPERATIVE.exec(x);
    return m && (m[1] || ABOUT_HER.test(x));
  });
  // Restating the page: five or more consecutive words shared with a badge's
  // label_meaning, the element glosses, or the presence note.
  const wordsOf = (t) => t.toLowerCase().replace(/[^\p{L}\s-]/gu, ' ').split(/\s+/u).filter(Boolean);
  const grams = (t, n = 5) => { const w = wordsOf(t); return new Set(w.slice(0, Math.max(0, w.length - n + 1)).map((_, i) => w.slice(i, i + n).join(' '))); };
  const pageTexts = [
    ...sj.facts.filter((f) => BINTANG.has(f.label)).map((f) => [`badge ${f.label}`, f.label_meaning || '']),
    ...Object.entries(ELEMENT_GLOSS).map(([k, v]) => [`bar ${k}`, `${k} ${v}`]),
    ['presence note', sj.chart?.element_presence_note || ''],
  ];
  const restated = allSent.flatMap((x) => {
    const g = grams(x);
    return pageTexts.filter(([, t]) => [...grams(t)].some((y) => g.has(y))).map(([what]) => `${what} :: ${x}`);
  });
  // ── BA §4's epilogue read aids (a list for a person, not a gate) ──
  // Which blocks the penutup draws on: content words (5+ letters) it shares with each
  // block. Advice-shaped and verdict-shaped words in the penutup, for the stop read.
  const content = (t) => new Set(wordsOf(t).filter((w) => w.length >= 5));
  const penutupWords = content(out.penutup || '');
  const threads = blocks.map((b, i) => ({ block: i + 1, heading: b.heading || '', shared: [...content(`${b.heading || ''} ${b.text || ''}`)].filter((w) => penutupWords.has(w)) }))
    .filter((t) => t.shared.length >= 2);
  const ADVICE = /(?<![\p{L}])(bisa|cobalah|coba|sebaiknya|perlu|jangan|mulailah|luangkan|berikan|biarkan|izinkan)(?![\p{L}])/iu;
  const VERDICT = /(?<![\p{L}])(cocok|tidak cocok|pasangan yang|skor|nilai)(?![\p{L}])|\d+\s*%/iu;
  const rec = {
    id: s.id, kind: currentKind, source: out.source, floored: out.source === 'module_assembly', floor: out.source === 'module_assembly' ? floorReason(out) : null,
    words: allText.split(/\s+/u).filter(Boolean).length,
    relation_english: [...new Set(relationEnglish)],
    badges_named: sj.facts.filter((f) => BINTANG.has(f.label)).map((f) => `${f.label}${allText.includes(f.label) ? '' : ' (not named)'}`),
    questions: sentences(prose.replace(/\n+/g, ' ')).filter((x) => /\?\s*$/u.test(x)),
    final_sentence: penutupSentences.at(-1) || '',
    epilogue_sentences: penutupSentences.length,
    epilogue_threads: threads,
    epilogue_advice_words: penutupSentences.filter((x) => ADVICE.test(x)),
    epilogue_verdict_words: penutupSentences.filter((x) => VERDICT.test(x)),
    imperatives,
    restated,
    penutup: out.penutup || '',
    stage6_version: out.stage6_version ?? STAGE6_VERSION,
    prompt_version: out.prompt_version ?? promptVersionFor(currentKind, 'v2'),
    regenerations: Math.max(0, wire.filter((w) => w.status === 200).length - 1),
    findings_logged: (out.findings || []).filter((f) => f.severity === 'flag').map((f) => f.check),
    cost_usd: wire.reduce((n, w) => n + costOf(w.usage), 0),
    rendered: { blocks: out.blocks, penutup: out.penutup },
  };
  records.push(rec);
  console.log(`${s.id.padEnd(22)} ${rec.source.padEnd(15)} words ${String(rec.words).padStart(4)} regen ${rec.regenerations} relEN ${rec.relation_english.length} q ${rec.questions.length} $${rec.cost_usd.toFixed(4)}${rec.floor ? ` FLOOR ${JSON.stringify(rec.floor)}` : ''}`);
  console.log(`  final: ${rec.final_sentence}`);
  console.log(`  epilogue: ${rec.epilogue_sentences} sentences; draws on blocks ${rec.epilogue_threads.map((t) => t.block).join(",") || "none"}`);
  for (const x of rec.epilogue_advice_words) console.log(`  EPILOGUE ADVICE WORD: ${x}`);
  for (const x of rec.epilogue_verdict_words) console.log(`  EPILOGUE VERDICT WORD: ${x}`);
  for (const x of rec.imperatives) console.log(`  IMPERATIVE: ${x}`);
  for (const x of rec.restated) console.log(`  RESTATES: ${x}`);
}
console.log(`TOTAL $${records.reduce((n, r) => n + r.cost_usd, 0).toFixed(4)}  prompt mirror ${promptVersionFor('mirror', 'v2')} pair ${promptVersionFor('pair', 'v2')}  stage6 ${STAGE6_VERSION}  temperature ${V2_MIRROR_TEMPERATURE}`);
// The directory is gitignored and absent in a fresh worktree: smoke-3 (2026-09-30) paid
// for five renders and lost its record to ENOENT here, after the console had printed.
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(records, null, 2)}\n`);
}
