#!/usr/bin/env node
// ============================================================
// scripts/qa-voice-depth-r5.mjs — Prompt AR, voice depth round 5: four arms, blinded
// ============================================================
//   node --conditions=react-server scripts/qa-voice-depth-r5.mjs            (renders, SPENDS)
//   node scripts/qa-voice-depth-r5.mjs --pdfs                                (PDFs + KEY, plain node)
//
// A MEASURED EXPERIMENT, NOT A PRODUCTION CHANGE. Nothing under lib/ is edited. The four
// arms differ only in what this script puts on the wire:
//
//   A  gemini-3.1-flash-lite  0.2  today's v2 prompt (control)
//   B  gemini-3.1-flash-lite  0.9  DEPTH prompt
//   C  gemini-3.8-flash       0.9  DEPTH prompt
//   D  gemini-3.1-pro-preview 0.9  DEPTH prompt (ceiling reference, not a launch candidate)
//
// Model through `renderReading`'s existing `modelOverride`, temperature through its
// existing `generation`. The DEPTH text and the thinking level are applied to the
// outgoing Gemini request body, and each rewrite is ASSERTED to have landed (the base
// paragraph is found exactly once, or the call throws) so an arm cannot silently run the
// control prompt.
//
// ── THINKING (measured 2026-09-28 with a one-word probe per model and level) ──
// flash-lite spends 0 thinking tokens by default (`minimal` is its default), so A and B
// send no thinkingConfig, exactly as production. 3.8 Flash and 3.1 Pro spend thinking
// tokens by default and refuse MINIMAL ("Thinking level MINIMAL is not supported for
// this model"), so C and D run at `low`, their lowest setting.
//
// ── SAME GATE, IN MEMORY ───────────────────────────────────
// STAGE6 as on main (1.57.0 when written), no model-based judge (there is none in the
// render path), Supabase refused, the in-memory cache cleared before every reading. The
// one transport change: timeoutMs 120s for every arm, so a slow thinking model is
// measured rather than floored by the 45s production socket guard. Latency is reported
// and any reading slower than 45s is flagged.
//
// ── BLIND ──────────────────────────────────────────────────
// The 12 readings are shuffled with a fixed seed and written as r5-01..r5-12. The PDFs
// and KEY.json go to reports/voice-v2/round5/; the per-reading records (which name the
// arm) go to reports/voice-v2/round5-data/, outside the folder Reyner reads. The PDF's
// provenance line prints the prompt version, so the rendered row handed to the PDF
// carries none: it would be the same string for all four arms (the pipeline stamps its
// own v2 hash, it cannot see the wire rewrite) and it would read as a label.
// ============================================================

import fs from 'node:fs';

const OUT = 'reports/voice-v2/round5';
const DATA = 'reports/voice-v2/round5-data';
const PDF_MODE = process.argv.includes('--pdfs');

// ── the arms and the subjects ──────────────────────────────
const ARMS = [
  { arm: 'A', model: 'gemini-3.1-flash-lite', temperature: 0.2, depth: false, thinking: null },
  { arm: 'B', model: 'gemini-3.1-flash-lite', temperature: 0.9, depth: true, thinking: null },
  { arm: 'C', model: 'gemini-3.8-flash', temperature: 0.9, depth: true, thinking: 'low' },
  { arm: 'D', model: 'gemini-3.1-pro-preview', temperature: 0.9, depth: true, thinking: 'low' },
];
// chart1 and chart13 from tests/bazi-validation.fixture.js (gender as the fixture has it).
// smew: production reading smewTNtzNaoQmWysi6mYU, RECONSTRUCTED. Its served chart reads
// 辛巳 庚寅 戊申 己未 and "PEREMPUAN | 14 FEB 2001"; 2001-02-14 is the only 戊申 day in the
// 庚寅 month of 2001, and any hour 13:00-14:59 gives 己未. The chart view built from these
// inputs was compared with the production GET before the run (see the report).
const SUBJECTS = [
  { id: 'chart1', a: { birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' } },
  { id: 'chart13', a: { birthDate: '1989-02-04', birthTime: '04:00', gender: 'male' } },
  { id: 'smewTNtzNaoQmWysi6mYU', a: { birthDate: '2001-02-14', birthTime: '13:00', gender: 'female' } },
];

// Per 1M tokens, Standard paid tier, prompts <= 200k (ai.google.dev/gemini-api/docs/pricing,
// read 2026-09-28). Thinking tokens bill as output.
const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25, out: 1.5 },
  'gemini-3.8-flash': { in: 0.75, out: 3.75 }, // "through December 31, 2026"
  'gemini-3.1-pro-preview': { in: 2.0, out: 12.0 },
};
const PRICE_2027 = { 'gemini-3.8-flash': { in: 1.5, out: 7.5 } }; // "starting January 1, 2027"
const costOf = (p, u) => (p && u
  ? ((u.promptTokenCount || 0) * p.in + ((u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)) * p.out) / 1e6
  : null);

// A fixed-seed shuffle (mulberry32), so the blind order is reproducible from this file.
function shuffled(xs, seed) {
  let t = seed >>> 0;
  const rnd = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const RUNS = shuffled(SUBJECTS.flatMap((s) => ARMS.map((a) => ({ subject: s, arm: a }))), 20260928)
  .map((r, i) => ({ ...r, id: `r5-${String(i + 1).padStart(2, '0')}` }));

// ── THE DEPTH PROMPT: today's v2 prompt with exactly AR §1's three changes ──
// The one sentence REPLACED is the breadth instruction the depth instruction supersedes
// ("After those, choose the facts that make the strongest reading."). Everything else,
// every "Do not invent" line, the form rules, the JSON shape and the examples, is
// byte-identical, because the rewrite swaps one paragraph and inserts one.
export const BASE_PARAGRAPH = 'Must be in it: begin with her Day Master, her strength and her main profile (the first three facts).\n'
  + 'After those, choose the facts that make the strongest reading. `required_points` shows what the engine\n'
  + 'ranks highest; beyond the first three it is guidance, not a checklist.';
export const DEPTH_PARAGRAPH = 'Must be in it: begin with her Day Master, her strength and her main profile (the first three facts).\n'
  + 'Choose the three or four facts that matter most for her (the first three are required, as today). Give each one room: what it is in plain everyday words and why the engine says it (from `provenance`); how it shows up in her daily life, with one concrete scene; what it costs her; and, when the fact carries a cost, what helps, from its `actionable`. Write each as a short story, not a definition.\n'
  + 'Every `bintang` fact appears, at least as one or two sentences each. `required_points` shows what the engine\n'
  + 'ranks highest; beyond the first three it is guidance, not a checklist.\n\n'
  + 'A full reading is roughly 700-1000 words. The examples show the voice, not the length.';

if (!PDF_MODE) {
  for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) delete process.env[k];
  const ENV = '.env.local';
  if (fs.existsSync(ENV)) {
    for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !process.env[m[1]] && !m[1].startsWith('SUPABASE')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  process.env.VOICE = 'v2';
  const { isSupabaseConfigured } = await import('../lib/supabase.js');
  if (isSupabaseConfigured()) throw new Error('refusing: Supabase is configured; this run must be in memory');
  const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
  const { buildSemanticJson } = await import('../lib/semantic/index.js');
  const { renderReading, __clearInFlight } = await import('../lib/render/index.js');
  const { __clearMemCache } = await import('../lib/render/cache.js');
  const { STAGE6_VERSION } = await import('../lib/validate/index.js');
  const { MASTER_PROMPTS_V2, PROMPT_VERSIONS_V2 } = await import('../lib/render/prompt.js');
  const { sentences } = await import('../lib/validate/text.js');
  const G = JSON.parse(fs.readFileSync('docs/content/glossary.json', 'utf8'));

  // The rewrite's precondition, checked against the prompt production actually sends.
  const base = MASTER_PROMPTS_V2.mirror;
  if (base.split(BASE_PARAGRAPH).length !== 2) throw new Error('the v2 mirror prompt no longer carries the base paragraph exactly once');
  const depthPrompt = base.replace(BASE_PARAGRAPH, DEPTH_PARAGRAPH);
  const { createHash } = await import('node:crypto');
  const DEPTH_HASH = createHash('sha256').update(depthPrompt).digest('hex').slice(0, 16);

  const BINTANG = new Set(Object.entries(G.bintang).filter(([k]) => !k.startsWith('_')).map(([, v]) => v.name_id));
  const ADVICE = /^(Coba|Cobalah|Mulai|Mulailah|Sediakan|Sisihkan|Tentukan|Luangkan|Beri|Berikan|Jangan|Biarkan|Pilih|Catat|Tulis|Tuliskan|Perhatikan|Ingat|Latih|Tanyakan|Tanya|Buat|Susun|Atur|Batasi|Ambil|Minta|Mintalah|Kenali|Belajar|Belajarlah|Izinkan|Bagi|Bagikan|Simpan|Tetapkan|Jadwalkan|Rencanakan|Hubungi|Datangi|Ajak|Carilah|Cari|Lepaskan|Kurangi|Pastikan|Gunakan|Manfaatkan|Terima|Akui|Hargai|Rawat|Jaga|Istirahat|Berhenti|Tunda|Kalau|Jika|Saat|Ketika|Yang membantu|Cara)\b/u;
  const trigrams = (t) => {
    const w = String(t || '').toLowerCase().replace(/[^\p{L}\s]/gu, ' ').split(/\s+/u).filter(Boolean);
    const out = new Set();
    for (let i = 0; i + 2 < w.length; i += 1) out.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
    return out;
  };

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(DATA, { recursive: true });

  let wire = [];
  let current = null;
  const realFetch = globalThis.fetch;
  // A failed rewrite must STOP the run. Thrown inside fetch it would read as a transport
  // error, be retried, and end as a floor that looks like a measurement.
  const fatal = (msg) => { console.error(`FATAL ${msg}`); process.exit(2); };
  globalThis.fetch = async (url, opts) => {
    const isGen = /:generateContent/.test(String(url));
    if (isGen && current) {
      const body = JSON.parse(opts.body);
      const sys = body.systemInstruction.parts[0].text;
      if (current.depth) {
        if (sys.split(BASE_PARAGRAPH).length !== 2) fatal(`${current.id}: base paragraph not found on the wire`);
        body.systemInstruction.parts[0].text = sys.replace(BASE_PARAGRAPH, DEPTH_PARAGRAPH);
      } else if (sys.includes('The examples show the voice, not the length.')) {
        fatal(`${current.id}: control arm carries the DEPTH text`);
      }
      if (current.thinking) body.generationConfig.thinkingConfig = { thinkingLevel: current.thinking };
      if (body.generationConfig.temperature !== current.temperature) fatal(`${current.id}: temperature ${body.generationConfig.temperature} on the wire`);
      opts = { ...opts, body: JSON.stringify(body) };
    }
    const t0 = Date.now();
    const res = await realFetch(url, opts);
    const model = /models\/([^:]+):/.exec(String(url))?.[1] ?? 'unknown';
    const clone = res.clone();
    let usage = null; let draft = null;
    try {
      const j = await clone.json();
      usage = j.usageMetadata ?? null;
      const text = (j?.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p?.text || '').join('');
      try { draft = JSON.parse(text); } catch { draft = null; }
    } catch { /* a non-JSON error body */ }
    wire.push({ model, status: res.status, ms: Date.now() - t0, usage, draft });
    return res;
  };

  const records = [];
  for (const run of RUNS) {
    const { subject: s, arm } = run;
    __clearMemCache(); __clearInFlight(); wire = [];
    current = { id: run.id, ...arm };
    const chart = calculateBaziChart(s.a);
    const sj = buildSemanticJson(chart, { voice: 'v2' });
    const t0 = Date.now();
    const out = await renderReading(sj, {
      spendGuards: false, dedupeInFlight: false, captureProse: true,
      modelOverride: arm.model,
      generation: { temperature: arm.temperature, timeoutMs: 120_000 },
    });
    const ms = Date.now() - t0;
    current = null;

    const writer = wire.filter((w) => w.status === 200);
    const sum = (k) => writer.reduce((n, w) => n + (w.usage?.[k] || 0), 0);
    const tokens = { in: sum('promptTokenCount'), out: sum('candidatesTokenCount'), thinking: sum('thoughtsTokenCount') };
    const usageTotal = { promptTokenCount: tokens.in, candidatesTokenCount: tokens.out, thoughtsTokenCount: tokens.thinking };
    const allCalls = wire.reduce((n, w) => n + (costOf(PRICES[w.model], w.usage) || 0), 0);

    // bintang facts: in the payload, and whether the served reading cites or names each.
    const factById = new Map(sj.facts.map((f) => [f.id, f]));
    const bintangFacts = sj.facts.filter((f) => BINTANG.has(f.label));
    const blocks = out.blocks || [];
    const allText = [...blocks.map((b) => `${b.heading || ''}\n${b.text || ''}`), out.penutup || ''].join('\n');
    const bintang = bintangFacts.map((f) => ({
      id: f.id, label: f.label,
      cited: blocks.some((b) => (b.fact_ids || []).includes(f.id)),
      named: allText.includes(f.label),
    }));

    // Each cost-bearing block: its last sentence, and whether it reads as "what helps".
    // HEURISTIC, stated as one: an advice-shaped opening, or a word trigram shared with a
    // cited fact's `actionable`. Every last sentence is printed so it can be read.
    const costBlocks = blocks.map((b, i) => {
      const cited = (b.fact_ids || []).map((id) => factById.get(id)).filter(Boolean);
      const costly = cited.filter((f) => f.cost);
      if (costly.length === 0) return null;
      const ss = sentences(b.text || '');
      const last = ss[ss.length - 1] || '';
      const act = new Set(cited.flatMap((f) => [...trigrams(f.actionable)]));
      const shared = [...trigrams(last)].filter((t) => act.has(t));
      return { block: i + 1, heading: b.heading, last, advice_opening: ADVICE.test(last), actionable_trigrams: shared.length, helps: ADVICE.test(last) || shared.length > 0 };
    }).filter(Boolean);

    const findings = out.findings || [];
    const record = {
      id: run.id, subject: s.id, kind: 'mirror', voice: 'v2', inputs: { a: s.a, b: null },
      arm: arm.arm, model: arm.model, temperature: arm.temperature, thinking_level: arm.thinking ?? 'default (0 thinking tokens)',
      prompt: arm.depth ? `DEPTH ${DEPTH_HASH}` : `v2 ${PROMPT_VERSIONS_V2?.mirror ?? out.prompt_version}`,
      stage6_version: out.stage6_version ?? STAGE6_VERSION,
      source: out.source, floored: out.source === 'module_assembly', ms, over_45s: ms > 45_000,
      words: allText.split(/\s+/u).filter(Boolean).length,
      writer_calls: wire.length, regenerations: Math.max(0, writer.length - 1),
      findings_hard: findings.filter((f) => f.severity !== 'flag'),
      findings_logged: findings.filter((f) => f.severity === 'flag'),
      rejected_attempts: (out.attempts || []).filter((a) => a.ok === false).map((a) => ({ stage6: a.stage6 ?? [], error: a.error ?? a.reason ?? null, detail: a.stage6_detail ?? null })),
      bintang, cost_blocks: costBlocks,
      tokens, calls: wire.map((w) => ({ model: w.model, status: w.status, ms: w.ms, usage: w.usage })),
      cost_usd: allCalls,
      cost_usd_2027: PRICE_2027[arm.model] ? wire.reduce((n, w) => n + (costOf(PRICE_2027[w.model], w.usage) || 0), 0) : null,
      cost_usd_served_tokens: costOf(PRICES[arm.model], usageTotal),
      drafts: wire.map((w) => w.draft),
      rendered: { blocks: out.blocks, penutup: out.penutup, source: out.source, stage6_version: out.stage6_version ?? null },
    };
    records.push(record);
    fs.writeFileSync(`${DATA}/${run.id}-v2.json`, JSON.stringify(record, null, 2));
    console.log(`${run.id} ${s.id.padEnd(22)} ${arm.arm} ${record.source.padEnd(15)} words ${String(record.words).padStart(5)} regen ${record.regenerations} hard ${record.findings_hard.length} logged ${record.findings_logged.length} bintang ${bintang.filter((x) => x.cited || x.named).length}/${bintang.length} think ${tokens.thinking} $${record.cost_usd.toFixed(4)} ${ms}ms`);
  }
  fs.writeFileSync(`${DATA}/summary.json`, JSON.stringify(records.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !['drafts', 'rendered', 'calls'].includes(k)))), null, 2));
  console.log(`TOTAL $${records.reduce((n, r) => n + r.cost_usd, 0).toFixed(4)}`);
} else {
  // ── step 2: blinded PDFs and the key ─────────────────────
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
      // No prompt_version: see the header. stage6 is the same for all twelve.
      rendered: { blocks: r.rendered.blocks, penutup: r.rendered.penutup, stage6_version: r.stage6_version },
      gender: r.inputs.a.gender ?? null,
    });
    fs.writeFileSync(`${OUT}/${run.id}.pdf`, buffer);
    key[run.id] = { subject: r.subject, arm: r.arm, model: r.model, temperature: r.temperature, thinking: r.thinking_level, source: r.source };
    console.log(`${run.id}.pdf ${(buffer.length / 1024).toFixed(0)} KB`);
  }
  fs.writeFileSync(`${OUT}/KEY.json`, `${JSON.stringify({ _read_me: 'Open only after judging the twelve PDFs.', ...key }, null, 2)}\n`);
  console.log(`${OUT}/KEY.json`);
}
