#!/usr/bin/env node
// ============================================================
// scripts/qa-voice-v2-renders.mjs — voice v1 vs v2, same charts, real Gemini
// ============================================================
//   node --conditions=react-server scripts/qa-voice-v2-renders.mjs [--only id]
//   node scripts/qa-voice-v2-pdfs.mjs          (step 2: the PDFs, plain node)
//
// SPENDS: the writer (lib/render/config.js) for every draft, and the judge
// (lib/validate/judge.js JUDGE_MODEL) once per v2 draft that passes D1-D4.
//
// Round 2, step 7 (Reyner, 2026-09-24): 5 fixture charts plus 2 pairs, each under
// v1 and v2, with the judge ADVISORY (STAGE6 >= 1.29.0: it runs and is stored,
// never rejects). "Run locally, in memory, so migration 0011 isn't needed yet."
//
// ── IN MEMORY, AND THAT IS ENFORCED, NOT ASSUMED ───────────
// The Supabase variables are deleted before any lib module loads, and the script
// refuses if `isSupabaseConfigured()` still says yes. A run that quietly wrote a v2
// row (or read a cached v1 row) into the real render_cache would be a different
// experiment from the one reported.
//
// ── WHAT IT RECORDS PER READING ────────────────────────────
// words, every D finding (served and rejected drafts), every judge finding with
// its quoted sentence, regenerations, whether it floored, and spend from Gemini's
// own usageMetadata. Every WRITER DRAFT is captured off the wire, so a verdict
// pattern hit can be quoted from the draft it fired on, including drafts that were
// rejected - the gate's own finding carries the pattern and not the text.
// Output: reports/voice-v2/<subject>-<voice>.json and reports/voice-v2/summary.json.
// ============================================================

import fs from 'node:fs';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
const ENV = '.env.local';
if (fs.existsSync(ENV)) {
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]] && !m[1].startsWith('SUPABASE')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { isSupabaseConfigured } = await import('../lib/supabase.js');
if (isSupabaseConfigured()) throw new Error('refusing: Supabase is configured; this run must be in memory');
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { renderReading, __clearInFlight } = await import('../lib/render/index.js');
const { __clearMemCache } = await import('../lib/render/cache.js');
const { STAGE6_VERSION } = await import('../lib/validate/index.js');
const { JUDGE_MODEL } = await import('../lib/validate/judge.js');
const { VALIDATION_CHARTS } = await import('../tests/bazi-validation.fixture.js');
const BLOCKLIST = JSON.parse(fs.readFileSync('lib/validate/blocklist.json', 'utf8'));

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const ONLY = arg('only', null);
// Round 3 (2026-09-25): `--out reports/voice-v2/round3 --voices v2` re-renders v2
// alone into its own folder, leaving round 2's files where they are.
const OUT_DIR = arg('out', 'reports/voice-v2');
const VOICES = String(arg('voices', 'v1,v2')).split(',');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Per 1M tokens, paid Standard tier, prompts <= 200k (ai.google.dev/gemini-api/docs/pricing,
// read 2026-09-24). Thought tokens bill as output.
const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25 / 1e6, out: 1.5 / 1e6 },
  'gemini-3.1-pro-preview': { in: 2.0 / 1e6, out: 12.0 / 1e6 },
};

// ── subjects ───────────────────────────────────────────────
const GENDER = { M: 'male', F: 'female' };
const FIXTURE_IDS = [1, 4, 6, 8, 13];
const SUBJECTS = [
  ...FIXTURE_IDS.map((id) => {
    const c = VALIDATION_CHARTS.find((x) => x.id === id);
    return { id: `chart${id}`, kind: 'mirror', a: { birthDate: c.date, birthTime: c.time, gender: GENDER[c.gender] } };
  }),
  // Birth data confirmed 2026-09-24 against each pair's GET /api/pair/<id>: all five
  // compat modules (branchRelations, complementarity, stemRelation, temperament,
  // pullFit) reproduce byte-for-byte from these inputs.
  { id: 'PZ0t_B3YDnzdXc2LWV38D', kind: 'pair', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' }, b: { birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' } },
  { id: 'g4WH4_9QbCrCj3Gha934q', kind: 'pair', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' }, b: { birthDate: '1997-09-14', birthTime: '13:00', gender: 'female' } },
];

// ── the verdict quote finder, compiled exactly as the gate compiles it ──
const VERDICT = (BLOCKLIST.verdict?.patterns ?? []).filter((e) => e?.pattern)
  .map((e) => ({ source: e.pattern, re: new RegExp(e.pattern, e.flags || 'iu') }));
function sentencesOf(draft) {
  const text = [...(draft.blocks || []).flatMap((b) => [b.heading || '', b.text || '']), draft.penutup || ''].join('\n');
  return text.split(/(?<=[.!?])\s+|\n+/u).map((s) => s.trim()).filter(Boolean);
}
function verdictQuotes(draft) {
  const out = [];
  for (const s of sentencesOf(draft)) for (const v of VERDICT) if (v.re.test(s)) out.push({ pattern: v.source, sentence: s });
  return out;
}
// Shown failing before trusted: it must find the sentence the gate's own spec plants.
if (verdictQuotes({ blocks: [{ heading: 'x', text: 'Kalian sangat cocok.' }], penutup: '' }).length === 0) {
  throw new Error('verdict quote finder cannot see "Kalian sangat cocok."');
}
const words = (r) => sentencesOf(r).join(' ').split(/\s+/u).filter(Boolean).length;

// ── the wire: every Gemini call, its model, usage, and (writer) draft ──
let wire = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const res = await realFetch(url, opts);
  const model = /models\/([^:]+):/.exec(String(url))?.[1] ?? 'unknown';
  const body = JSON.parse(opts.body);
  const isJudge = /factual reviewer/.test(body.systemInstruction?.parts?.[0]?.text || '');
  const clone = res.clone();
  let usage = null; let text = null;
  try {
    const j = await clone.json();
    usage = j.usageMetadata ?? null;
    text = (j?.candidates?.[0]?.content?.parts || []).map((p) => p?.text || '').join('');
  } catch { /* a non-JSON error body */ }
  const price = PRICES[model];
  const cost = price && usage
    ? (usage.promptTokenCount || 0) * price.in + ((usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0)) * price.out
    : null;
  let draft = null;
  if (!isJudge && text) { try { draft = JSON.parse(text); } catch { draft = null; } }
  wire.push({ role: isJudge ? 'judge' : 'writer', model, status: res.status, usage, cost_usd: cost, draft });
  return res;
};

const summary = [];
for (const s of SUBJECTS) {
  if (ONLY && s.id !== ONLY) continue;
  for (const voice of VOICES) {
    __clearMemCache(); __clearInFlight(); wire = [];
    const a = calculateBaziChart(s.a);
    const sj = s.kind === 'pair'
      ? buildPairSemantic(a, calculateBaziChart(s.b), { voice })
      : buildSemanticJson(a, { voice });
    const t0 = Date.now();
    const out = await renderReading(sj, { spendGuards: false, dedupeInFlight: false });
    const ms = Date.now() - t0;
    const writerCalls = wire.filter((w) => w.role === 'writer');
    const judgeCalls = wire.filter((w) => w.role === 'judge');
    const spend = (ws) => ws.reduce((n, w) => n + (w.cost_usd ?? 0), 0);
    const rejected = (out.attempts || []).filter((at) => at.ok === false);
    const record = {
      subject: s.id, kind: s.kind, voice, inputs: { a: s.a, b: s.b ?? null },
      stage6_version: out.stage6_version ?? STAGE6_VERSION,
      source: out.source, floored: out.source === 'module_assembly',
      model: out.model, prompt_version: out.prompt_version, ms,
      words: words(out),
      writer_drafts: writerCalls.length,
      regenerations: Math.max(0, writerCalls.filter((w) => w.status === 200).length - 1),
      d_findings_served: (out.findings || []).filter((f) => !String(f.check).startsWith('v2.judge_')),
      d_findings_rejected: rejected.map((at) => ({ reason: at.error ?? at.reason ?? null, detail: at.stage6_detail ?? null })),
      judge_findings: out.review?.judge ?? [],
      judge_malformed: out.review?.judge_malformed ?? [],
      // Since STAGE6 1.33.0 a J1 rejects, so the judge's verdict on EVERY attempt is
      // kept, served or not: a regeneration or a floor caused by J1 is quoted from
      // the attempt it fired on, and a floor (which carries no `review`) still has it.
      judge_by_attempt: (out.attempts || []).map((at, i) => ({
        attempt: i + 1, ok: at.ok ?? null, stage6: at.stage6 ?? [], judge: at.judge ?? null,
      })),
      j1_rejections: (out.attempts || []).filter((at) => (at.stage6 || []).includes('v2.judge_j1')).length,
      verdict_hits: writerCalls.flatMap((w, i) => (w.draft ? verdictQuotes(w.draft).map((q) => ({ draft: i + 1, ...q })) : [])),
      spend_usd: { writer: spend(writerCalls), judge: spend(judgeCalls), total: spend(wire) },
      tokens: wire.map((w) => ({ role: w.role, model: w.model, status: w.status, usage: w.usage, cost_usd: w.cost_usd })),
      judge_model: voice === 'v2' ? JUDGE_MODEL : null,
      // Every writer draft as it came off the wire, served or rejected, so a rejection
      // can be quoted from the text it fired on.
      drafts: writerCalls.map((w) => w.draft),
      rendered: { blocks: out.blocks, penutup: out.penutup, source: out.source, model: out.model, prompt_version: out.prompt_version, stage6_version: out.stage6_version ?? null },
    };
    fs.writeFileSync(`${OUT_DIR}/${s.id}-${voice}.json`, JSON.stringify(record, null, 2));
    summary.push({
      subject: s.id, voice, source: record.source, words: record.words, regenerations: record.regenerations,
      d_served: record.d_findings_served.filter((f) => f.severity !== 'flag').length,
      d_rejected: record.d_findings_rejected.length, judge: record.judge_findings.length, j1_rejections: record.j1_rejections,
      verdict_hits: record.verdict_hits.length, spend: record.spend_usd.total,
    });
    console.log(`${s.id.padEnd(24)} ${voice} ${record.source.padEnd(16)} words ${String(record.words).padStart(5)} regen ${record.regenerations} j1-rej ${record.j1_rejections} judge ${record.judge_findings.length} verdict ${record.verdict_hits.length} $${record.spend_usd.total.toFixed(4)} ${ms}ms`);
  }
}
fs.writeFileSync(`${OUT_DIR}/summary.json`, JSON.stringify(summary, null, 2));
console.log(`TOTAL $${summary.reduce((n, r) => n + r.spend, 0).toFixed(4)}`);
