#!/usr/bin/env node
// ============================================================
// scripts/qa-voice-round6.mjs — Prompt AT, voice round 6: two arms, blinded
// ============================================================
//   node --conditions=react-server scripts/qa-voice-round6.mjs          (renders, SPENDS)
//   node scripts/qa-voice-round6.mjs --pdfs                              (PDFs + KEY, plain node)
//
// EXPERIMENT BRANCH (exp/voice-round6). Round 5's harness (scripts/qa-voice-depth-r5.mjs
// on exp/voice-depth-r5), cut to AT §3:
//
//   A  gemini-3.1-flash-lite  0.2  ROUND-6 prompt
//   B  gemini-3.1-flash-lite  0.9  ROUND-6 prompt
//
// THE PROMPT. docs/content/renderer-prompt-v2-round6.txt (built by
// scripts/build-round6-prompt.mjs from today's v2 prompt) replaces the v2 mirror prompt
// on the wire, and only that: the examples after it and any regeneration directive are
// what production sends. The rewrite is asserted on every call, and a miss exits the run
// rather than reading as a transport error and a floor. Both arms get it; the arms differ
// in temperature alone. Flash-lite spends 0 thinking tokens at its default (round 5's
// probe), so no thinking config is sent, as production.
//
// THE GATE is this branch's: main at 7b18613 plus #174 (AS §3), #175 (AS Amendment 1 §B)
// and the round-6 commits (relation English off the writer payload, a relation's English
// unsanctioned on v2, relation_positions read per sentence in a folded block). It stamps
// 1.59.0, which is NOT the same gate as #175's 1.59.0; each record carries the branch
// commit so the two cannot be confused.
//
// In memory: Supabase refused, the cache cleared before every reading, nothing written to
// render_cache. timeoutMs 120s, as round 5.
//
// BLIND: 10 readings, fixed-seed shuffle, r6-01..r6-10. PDFs and KEY.json go to
// reports/voice-v2/round6/; the records, which name the arm, go to round6-data/.
// ============================================================

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const OUT = 'reports/voice-v2/round6';
const DATA = 'reports/voice-v2/round6-data';
const PDF_MODE = process.argv.includes('--pdfs');
const ROUND6_FILE = 'docs/content/renderer-prompt-v2-round6.txt';

const ARMS = [
  { arm: 'A', model: 'gemini-3.1-flash-lite', temperature: 0.2 },
  { arm: 'B', model: 'gemini-3.1-flash-lite', temperature: 0.9 },
];
// AT §3. chart4 and chart7 are picked by the counts in the round-6 report (the most
// relation facts, 3, tied with chart8; the fewest facts, 8, tied with chart12; the lower
// id wins a tie). smew is production's smewTNtzNaoQmWysi6mYU, reconstructed and checked
// byte-identical against the production GET in round 5.
const SUBJECTS = [
  { id: 'chart1', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' } },
  { id: 'chart13', a: { birthDate: '1989-02-04', birthTime: '04:00', gender: 'male' } },
  { id: 'smewTNtzNaoQmWysi6mYU', a: { birthDate: '2001-02-14', birthTime: '13:00', gender: 'female' } },
  { id: 'chart4', a: { birthDate: '1995-06-01', birthTime: '06:00', gender: 'female' } },
  { id: 'chart7', a: { birthDate: '1993-06-12', birthTime: '23:30', gender: 'female' } },
];
const PRICE = { in: 0.25, out: 1.5 }; // flash-lite, per 1M, ai.google.dev pricing read 2026-09-28
const costOf = (u) => (u ? ((u.promptTokenCount || 0) * PRICE.in + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * PRICE.out) / 1e6 : 0);

function shuffled(xs, seed) {
  let t = seed >>> 0;
  const rnd = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const RUNS = shuffled(SUBJECTS.flatMap((s) => ARMS.map((a) => ({ subject: s, arm: a }))), 20260930)
  .map((r, i) => ({ ...r, id: `r6-${String(i + 1).padStart(2, '0')}` }));

if (!PDF_MODE) {
  for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !process.env[m[1]] && !m[1].startsWith('SUPABASE')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const { isSupabaseConfigured } = await import('../lib/supabase.js');
  if (isSupabaseConfigured()) throw new Error('refusing: Supabase is configured; this run must be in memory');
  const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
  const { buildSemanticJson } = await import('../lib/semantic/index.js');
  const { renderReading, __clearInFlight } = await import('../lib/render/index.js');
  const { __clearMemCache } = await import('../lib/render/cache.js');
  const { STAGE6_VERSION } = await import('../lib/validate/index.js');
  const { MASTER_PROMPTS_V2, V2_EXAMPLES_FOR } = await import('../lib/render/prompt.js');
  const { sentences } = await import('../lib/validate/text.js');
  const G = JSON.parse(fs.readFileSync('docs/content/glossary.json', 'utf8'));
  const BRANCH_COMMIT = execSync('git rev-parse --short HEAD').toString().trim();

  // Build check: the file on disk is what the builder makes from today's prompt.
  execSync('node scripts/build-round6-prompt.mjs --check', { stdio: 'inherit' });
  const ROUND6 = fs.readFileSync(ROUND6_FILE, 'utf8').replace(/\r\n/g, '\n');
  const V2_BASE = MASTER_PROMPTS_V2.mirror.slice(0, MASTER_PROMPTS_V2.mirror.length - V2_EXAMPLES_FOR.mirror.length - 1);
  if (`${V2_BASE}\n${V2_EXAMPLES_FOR.mirror}` !== MASTER_PROMPTS_V2.mirror) throw new Error('cannot split the v2 mirror prompt from its examples');
  if (V2_BASE === ROUND6) throw new Error('the round-6 prompt equals the v2 prompt');

  const BINTANG = new Set(Object.entries(G.bintang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v.name_id));
  const REL_KIND = new Set(['branch_relation', 'punishment']);
  const REL_EN = new Set(Object.entries(G.relasi_cabang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v.name_en));
  const ALL_EN = new Set();
  (function walk(n) { if (!n || typeof n !== 'object') return; for (const [k, v] of Object.entries(n)) { if (k === 'name_en' && typeof v === 'string') ALL_EN.add(v); else walk(v); } }(G));
  // Words that TEACH the mechanism: element cycles, seasons, derivation. Listed so the
  // sentences can be read; a hit is not a verdict.
  const MECHANISM = /(?<![\p{L}])(menguras|mengontrol|mengendalikan|dikontrol|dikendalikan|memberi makan|menyuburkan|melahirkan|menghasilkan|menopang unsur|musim|bulan kelahiran|cabang bulan|batang hari|elemen yang|unsur yang|siklus|berelemen|karena unsur|karena elemen|mesin|dihitung|perhitungan|rumus)(?![\p{L}])/iu;

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(DATA, { recursive: true });

  const fatal = (msg) => { console.error(`FATAL ${msg}`); process.exit(2); };
  let wire = []; let current = null;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    if (/:generateContent/.test(String(url)) && current) {
      const body = JSON.parse(opts.body);
      const sys = body.systemInstruction.parts[0].text;
      if (!sys.startsWith(`${V2_BASE}\n`)) fatal(`${current.id}: the v2 mirror prompt is not at the head of the system prompt`);
      body.systemInstruction.parts[0].text = ROUND6 + sys.slice(V2_BASE.length);
      if (body.generationConfig.temperature !== current.temperature) fatal(`${current.id}: temperature ${body.generationConfig.temperature} on the wire`);
      if (body.generationConfig.thinkingConfig) fatal(`${current.id}: a thinking config is on the wire`);
      // The writer payload must carry no relation English (the round-6 payload commit).
      const payload = JSON.parse(body.contents[0].parts[0].text);
      if ((payload.facts || []).some((f) => REL_KIND.has(f.provenance?.kind) && f.label_bracket)) fatal(`${current.id}: a relation label_bracket reached the writer`);
      opts = { ...opts, body: JSON.stringify(body) };
    }
    const t0 = Date.now();
    const res = await realFetch(url, opts);
    let usage = null; let draft = null;
    try {
      const j = await res.clone().json();
      usage = j.usageMetadata ?? null;
      const text = (j?.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p?.text || '').join('');
      try { draft = JSON.parse(text); } catch { draft = null; }
    } catch { /* non-JSON */ }
    wire.push({ status: res.status, ms: Date.now() - t0, usage, draft });
    return res;
  };

  const records = [];
  for (const run of RUNS) {
    const { subject: s, arm } = run;
    __clearMemCache(); __clearInFlight(); wire = [];
    current = { id: run.id, ...arm };
    const sj = buildSemanticJson(calculateBaziChart(s.a), { voice: 'v2' });
    const t0 = Date.now();
    const out = await renderReading(sj, {
      spendGuards: false, dedupeInFlight: false, captureProse: true,
      modelOverride: arm.model, generation: { temperature: arm.temperature, timeoutMs: 120_000 },
    });
    const ms = Date.now() - t0;
    current = null;

    const ok = wire.filter((w) => w.status === 200);
    const sum = (k) => ok.reduce((n, w) => n + (w.usage?.[k] || 0), 0);
    const blocks = out.blocks || [];
    const allText = [...blocks.map((b) => `${b.heading || ''}\n${b.text || ''}`), out.penutup || ''].join('\n');
    const prose = [...blocks.map((b) => b.text || ''), out.penutup || ''].join('\n');
    const allSentences = sentences(prose.replace(/\n+/g, ' '));
    const factById = new Map(sj.facts.map((f) => [f.id, f]));

    const bintang = sj.facts.filter((f) => BINTANG.has(f.label)).map((f) => ({ id: f.id, label: f.label, named: allText.includes(f.label) }));
    const relations = sj.facts.filter((f) => REL_KIND.has(f.provenance?.kind)).map((f) => {
      const own = blocks.filter((b) => (b.fact_ids || []).includes(f.id) && (b.fact_ids || []).filter((id) => REL_KIND.has(factById.get(id)?.provenance?.kind)).length === 1);
      const mentions = allSentences.filter((x) => x.includes(f.label));
      return { id: f.id, label: f.label, own_block: own.length > 0, heading_names_it: blocks.some((b) => (b.heading || '').includes(f.label)), sentences_naming_it: mentions.length };
    });
    const brackets = [...prose.matchAll(/\(([^()]{1,60})\)/gu)].map((m) => m[1].trim());
    const questions = allSentences.filter((x) => /\?\s*$/u.test(x));
    const costBlocks = blocks.map((b, i) => {
      const cited = (b.fact_ids || []).map((id) => factById.get(id)).filter(Boolean);
      if (!cited.some((f) => f.cost)) return null;
      const ss = sentences(b.text || '');
      return { block: i + 1, heading: b.heading, last: ss[ss.length - 1] || '' };
    }).filter(Boolean);
    const mechanism = allSentences.filter((x) => MECHANISM.test(x));
    const findings = out.findings || [];

    const record = {
      id: run.id, subject: s.id, kind: 'mirror', voice: 'v2', inputs: { a: s.a, b: null },
      arm: arm.arm, model: arm.model, temperature: arm.temperature, prompt: `ROUND-6 (${ROUND6_FILE})`,
      gate: `${out.stage6_version ?? STAGE6_VERSION} + exp/voice-round6 @ ${BRANCH_COMMIT}`, stage6_version: out.stage6_version ?? STAGE6_VERSION,
      source: out.source, floored: out.source === 'module_assembly', ms,
      words: allText.split(/\s+/u).filter(Boolean).length,
      regenerations: Math.max(0, ok.length - 1),
      findings_hard: findings.filter((f) => f.severity !== 'flag'),
      findings_logged: findings.filter((f) => f.severity === 'flag'),
      rejected_attempts: (out.attempts || []).filter((a) => a.ok === false).map((a) => ({ stage6: a.stage6 ?? [], error: a.error ?? a.reason ?? null, detail: a.stage6_detail ?? null })),
      bintang, relations,
      brackets: { total: brackets.length, on_relations: brackets.filter((b) => REL_EN.has(b)).length, list: brackets, glossary_english: brackets.filter((b) => ALL_EN.has(b)).length },
      questions, cost_blocks: costBlocks, mechanism_sentences: mechanism,
      tokens: { in: sum('promptTokenCount'), out: sum('candidatesTokenCount'), thinking: sum('thoughtsTokenCount') },
      cost_usd: wire.reduce((n, w) => n + costOf(w.usage), 0),
      calls: wire.map((w) => ({ status: w.status, ms: w.ms, usage: w.usage })),
      drafts: wire.map((w) => w.draft),
      rendered: { blocks: out.blocks, penutup: out.penutup, source: out.source, stage6_version: out.stage6_version ?? null },
    };
    records.push(record);
    fs.writeFileSync(`${DATA}/${run.id}-v2.json`, JSON.stringify(record, null, 2));
    console.log(`${run.id} ${s.id.padEnd(22)} ${arm.arm} ${record.source.padEnd(15)} words ${String(record.words).padStart(4)} regen ${record.regenerations} hard ${record.findings_hard.length} logged ${record.findings_logged.length} bintang ${bintang.filter((x) => x.named).length}/${bintang.length} relOwn ${relations.filter((r) => r.own_block).length}/${relations.length} relBr ${record.brackets.on_relations} q ${questions.length} mech ${mechanism.length} $${record.cost_usd.toFixed(4)} ${ms}ms`);
  }
  fs.writeFileSync(`${DATA}/summary.json`, JSON.stringify(records.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !['drafts', 'rendered', 'calls'].includes(k)))), null, 2));
  console.log(`TOTAL $${records.reduce((n, r) => n + r.cost_usd, 0).toFixed(4)}`);
} else {
  const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
  const { buildSemanticJson } = await import('../lib/semantic/index.js');
  const { buildCompleteEditionPdf } = await import('../lib/pdf/build.js');
  fs.mkdirSync(OUT, { recursive: true });
  const key = {};
  for (const run of RUNS) {
    const r = JSON.parse(fs.readFileSync(`${DATA}/${run.id}-v2.json`, 'utf8'));
    const chart = calculateBaziChart(r.inputs.a);
    const { buffer } = await buildCompleteEditionPdf({
      chart,
      semanticJson: buildSemanticJson(chart, { voice: 'v2' }),
      // No prompt_version, as round 5: the provenance line would read as a label.
      rendered: { blocks: r.rendered.blocks, penutup: r.rendered.penutup, stage6_version: r.stage6_version },
      gender: r.inputs.a.gender ?? null,
    });
    fs.writeFileSync(`${OUT}/${run.id}.pdf`, buffer);
    key[run.id] = { subject: r.subject, arm: r.arm, model: r.model, temperature: r.temperature, source: r.source };
    console.log(`${run.id}.pdf ${(buffer.length / 1024).toFixed(0)} KB${r.floored ? '  FLOOR' : ''}`);
  }
  fs.writeFileSync(`${OUT}/KEY.json`, `${JSON.stringify({ _read_me: 'Open only after judging the ten PDFs.', ...key }, null, 2)}\n`);
  console.log(`${OUT}/KEY.json`);
}
