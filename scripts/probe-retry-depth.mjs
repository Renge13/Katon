#!/usr/bin/env node
// ============================================================
// scripts/probe-retry-depth.mjs — ONE deep chain, every depth read off it
// ============================================================
//   npm run probe:retry-depth              40 runs, max depth 6
//   npm run probe:retry-depth -- --n 2 --depth 3
//
// ── WHY ONE RUN AT DEPTH 6 AND NOT FOUR RUNS AT FOUR DEPTHS ──
// Reyner's redesign, 2026-08-18, and it is strictly better. A depth-4 sweep
// re-renders work a depth-6 chain already performs, so four separate sweeps buy
// nothing except four times the spend. Run the chain ONCE to its maximum and read
// depth 1..6 off the same trace by TRUNCATING it: a run that passed at attempt 3
// has floored at depth 1 and passed at every depth from 2 up.
//
// It is also the more honest instrument. Every attempt here is a real link in one
// conditioned chain - `stricterDirective` is recomputed from the previous
// attempt's findings each time, exactly as production does it - rather than a
// synthetic restart that pretends retries are independent draws. They are not:
// measured 2026-08-18, attempt 1 passed 18% and attempt 2 passed 42% of the runs
// that reached it.
//
// ── THE SURVIVORSHIP CAVEAT, WHICH THE OUTPUT REPEATS ──────
// Per-attempt pass rate BY ATTEMPT NUMBER is conditioned on having failed
// everything before it. The runs reaching attempt 5 are the hard ones by
// construction, so a decline at depth is NOT evidence the directive is hurting -
// it can be selection alone. Read it with the denominators, which are printed.
//
// ── WALL CLOCK IS THE POINT, NOT THE COST ──────────────────
// Nobody has measured what a retry costs a READER. The funnel's anticipation beat
// is 2.5s; four sequential provider calls is tens of seconds of blank screen. So
// every attempt is timed and the cumulative wait is reported p50/p90 per depth.
//
// It never calls persistRendered, so nothing here can reach a reader.
// ============================================================

import { mkdirSync, writeFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderWithGemini } from '../lib/render/providers/gemini.js';
import { parseRenderResponse } from '../lib/render/schema.js';
import { MASTER_PROMPT, PROMPT_VERSION } from '../lib/render/prompt.js';
import { GENERATION, modelFor, DEFAULT_TIER, geminiConfigured } from '../lib/render/config.js';
import { scrubInternal } from '../lib/render/payload.js';
import { validateRendering, stricterDirective, STAGE6_VERSION } from '../lib/validate/index.js';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const N = Number(flag('n', 10));
const MAX_DEPTH = Number(flag('depth', 6));
const MAX_ATTEMPTS = MAX_DEPTH + 1;
const stamp = new Date().toISOString().slice(0, 10);
const OUT = flag('out', `docs/qa/${stamp}-retry-depth.md`);

if (!geminiConfigured(DEFAULT_TIER)) throw new Error('no GEMINI key: this probe needs the real provider');

const CHARTS = [
  { label: 'chart 5', date: '1988-07-10', time: '22:00' },
  { label: 'chart 13', date: '1989-02-04', time: '04:00' },
  { label: 'chart 1', date: '1989-09-13', time: '09:00' },
  { label: 'fresh-1996', date: '1996-10-02', time: '19:20' },
];

const proseOf = (p) => (p.blocks || [])
  .map((b) => `### ${b.heading || ''}\n\n${b.text || ''}`)
  .concat(p.penutup ? [`### Penutup\n\n${p.penutup}`] : []).join('\n\n');

const runs = [];
for (const c of CHARTS) {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  const payload = scrubInternal(semantic);
  const knownFactIds = new Set((semantic.facts || []).map((f) => f.id));

  for (let run = 1; run <= N; run++) {
    let directive = '';
    const attempts = [];
    for (let a = 1; a <= MAX_ATTEMPTS; a++) {
      const t0 = Date.now();
      let parsed; let transport = null;
      try {
        const raw = await renderWithGemini(MASTER_PROMPT + directive, payload, {
          ...GENERATION, model: modelFor(DEFAULT_TIER, 'gemini'),
        });
        parsed = parseRenderResponse(raw.text, { knownFactIds });
      } catch (err) {
        transport = err.message.slice(0, 160);
      }
      if (transport) {
        attempts.push({ n: a, ok: false, transport, checks: [], ms: Date.now() - t0, prose: null });
        break;
      }
      const gate = validateRendering(parsed, semantic, { provider: 'gemini' });
      const ms = Date.now() - t0;
      attempts.push({
        n: a,
        ok: gate.ok,
        hard: gate.hard,
        checks: gate.findings.filter((f) => f.severity !== 'flag').map((f) => f.check),
        ms,
        prose: proseOf(parsed),
      });
      if (gate.ok) break;
      directive = stricterDirective(gate.findings);
    }
    const passedAt = attempts.find((a) => a.ok)?.n ?? null;
    runs.push({ chart: c.label, run, passedAt, attempts });
    process.stderr.write(`  ${c.label} ${String(run).padStart(2)}/${N}  `
      + (passedAt ? `passed at attempt ${passedAt}` : `NEVER PASSED in ${attempts.length}`)
      + `  [${attempts.map((a) => a.ms).join(' ')}]ms\n`);
  }
}

// ── read every depth off the one trace ─────────────────────
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const quant = (arr, q) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))];
};

// ── A TRANSPORT FAILURE IS NOT A GATE FLOOR ────────────────
// Added 2026-08-19, after reading the 08-18 trace. This loop `break`s on a 503,
// so that run ends with its depth budget unspent - and the first version counted
// it in `floored` like any other. On the 08-18 run that single 503 WAS the entire
// residual floor at depths 5 and 6, so the table read "3% floor" where the gate
// had floored nothing at all in 40 runs.
//
// PRODUCTION DOES NOT BEHAVE THIS WAY, which is what makes the conflation a lie
// rather than a simplification: `lib/render/index.js` keeps a transport retry
// SEPARATE from the regeneration budget (`continue` on a retryable error) and
// fails over to OpenAI besides. So a 503 here describes this probe's chain, never
// the product's floor rate.
//
// Kept as a `break` rather than retried: adding a transport retry changes what
// this probe costs and what it measures, which is its own change and its own
// measurement (rule 13). The fix is to REPORT the two separately, with both
// denominators visible.
const isTruncated = (r) => r.passedAt === null && r.attempts.some((a) => a.transport);

const depths = [];
for (let d = 1; d <= MAX_DEPTH; d++) {
  const cap = d + 1;
  let gateFloored = 0; let truncated = 0; const waits = [];
  for (const r of runs) {
    const passed = r.passedAt !== null && r.passedAt <= cap;
    if (!passed) {
      if (isTruncated(r)) truncated += 1;
      else gateFloored += 1;
    }
    // What the reader waits: every attempt up to the pass, or up to the cap.
    const upto = passed ? r.passedAt : Math.min(cap, r.attempts.length);
    waits.push(r.attempts.slice(0, upto).reduce((s, a) => s + a.ms, 0));
  }
  const scored = runs.length - truncated;
  depths.push({
    depth: d, cap, gateFloored, truncated, scored,
    floored: gateFloored + truncated,
    floorPct: pct(gateFloored, scored),
    p50: quant(waits, 0.5), p90: quant(waits, 0.9),
  });
}

const byAttempt = [];
for (let a = 1; a <= MAX_ATTEMPTS; a++) {
  const reached = runs.filter((r) => r.attempts.length >= a);
  const passed = reached.filter((r) => r.attempts[a - 1]?.ok).length;
  if (!reached.length) break;
  byAttempt.push({ n: a, reached: reached.length, passed, pct: pct(passed, reached.length) });
}

const allChecks = {};
for (const r of runs) for (const a of r.attempts) for (const c of a.checks) allChecks[c] = (allChecks[c] || 0) + 1;

// ── the side-by-side: the LATEST pass we observed ──────────
const deep = runs.filter((r) => r.passedAt && r.passedAt >= 3).sort((a, b) => b.passedAt - a.passedAt)[0]
  || runs.filter((r) => r.passedAt && r.passedAt >= 2).sort((a, b) => b.passedAt - a.passedAt)[0];

const L = [];
L.push('<!--');
L.push('STATUS: RAW EVIDENCE. npm run probe:retry-depth. Prose is verbatim; do not edit it.');
L.push('Nobody has judged the prose. Whether a deep retry reads FLAT is a register call, Reyner rules it.');
L.push('-->');
L.push('');
L.push(`# Retry depth — ${stamp}`);
L.push('');
L.push(`Prompt \`${PROMPT_VERSION}\`, gate \`${STAGE6_VERSION}\`, ${CHARTS.length} charts x ${N} runs,`);
L.push(`ONE chain per run to a maximum of ${MAX_ATTEMPTS} attempts (depth ${MAX_DEPTH}).`);
L.push(`Total attempts spent: **${runs.reduce((s, r) => s + r.attempts.length, 0)}**.`);
L.push('');
L.push('Every depth below is read off this one trace by truncation, so no depth cost an extra render.');
L.push('');
L.push('## 1. Floor rate by truncation depth');
L.push('');
L.push('`n` is the scored denominator: runs whose chain was cut short by a provider 503 are');
L.push('EXCLUDED, because this probe breaks on transport and production does not. They are counted');
L.push('in their own column so the exclusion is visible rather than quiet.');
L.push('');
L.push('| depth | attempts allowed | gate-floored | n scored | floor rate | 503-truncated |');
L.push('|---|---|---|---|---|---|');
for (const d of depths) {
  L.push(`| ${d.depth} | ${d.cap} | ${d.gateFloored} | ${d.scored} | **${d.floorPct}%** | ${d.truncated} |`);
}
L.push('');
L.push('## 2. Pass rate BY ATTEMPT NUMBER');
L.push('');
L.push('**Read this with the denominators.** Attempt 5 is only reached by runs that failed four times,');
L.push('so a falling rate can be selection rather than the directive hurting.');
L.push('');
L.push('**A rate on n <= 3 is an ANECDOTE, not a rate**, and the table says so per row rather than');
L.push('leaving it to the reader to notice the denominator.');
L.push('');
L.push('| attempt | runs that reached it | passed | rate |');
L.push('|---|---|---|---|');
for (const a of byAttempt) {
  L.push(`| ${a.n} | ${a.reached} | ${a.passed} | **${a.pct}%**${a.reached <= 3 ? ' — ANECDOTE, n=' + a.reached : ''} |`);
}
L.push('');
L.push('## 3. Cumulative wall clock the READER waits');
L.push('');
L.push("The funnel's anticipation beat is 2.5s. These are milliseconds of provider time only.");
L.push('');
{
  // ONE ATTEMPT, which is the primitive every depth is built from. Transport
  // failures are excluded: a 503 that returns in 568ms is not a fast render, and
  // averaging it in makes the provider look quicker than it is.
  const one = runs.flatMap((r) => r.attempts).filter((a) => !a.transport).map((a) => a.ms);
  L.push(`A SINGLE attempt, n=${one.length} completed calls: `
    + `**p50 ${(quant(one, 0.5) / 1000).toFixed(1)}s · p90 ${(quant(one, 0.9) / 1000).toFixed(1)}s** `
    + `(min ${(Math.min(...one) / 1000).toFixed(1)}s, max ${(Math.max(...one) / 1000).toFixed(1)}s).`);
  L.push('');
}
L.push('| depth | p50 | p90 |');
L.push('|---|---|---|');
for (const d of depths) L.push(`| ${d.depth} | ${(d.p50 / 1000).toFixed(1)}s | ${(d.p90 / 1000).toFixed(1)}s |`);
L.push('');
L.push('## Rejections by check, all attempts');
L.push('');
for (const [c, n] of Object.entries(allChecks).sort((a, b) => b[1] - a[1])) L.push(`- \`${c}\` — ${n}`);
L.push('');
L.push('---');
L.push('');
L.push('## 4. Attempt 1 vs the deepest attempt that passed');
L.push('');
if (!deep) {
  L.push('No run passed later than attempt 1, so there is no deep/shallow pair to compare.');
} else {
  L.push(`**${deep.chart}, run ${deep.run}** — attempt 1 rejected for`);
  L.push(`\`${deep.attempts[0].checks.join('`, `') || 'nothing recorded'}\`; attempt ${deep.passedAt} passed.`);
  L.push('');
  L.push('Nothing below is edited. Read them as a reader, not as a checker.');
  L.push('');
  L.push(`### ATTEMPT 1 — REJECTED (${deep.attempts[0].ms}ms)`);
  L.push('');
  L.push(deep.attempts[0].prose || '(no prose captured)');
  L.push('');
  L.push('---');
  L.push('');
  L.push(`### ATTEMPT ${deep.passedAt} — PASSED (${deep.attempts[deep.passedAt - 1].ms}ms)`);
  L.push('');
  L.push(deep.attempts[deep.passedAt - 1].prose || '(no prose captured)');
  L.push('');
}

mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(OUT, L.join('\n') + '\n');
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ prompt: PROMPT_VERSION, gate: STAGE6_VERSION, runs, depths, byAttempt }, null, 1));
console.error(`\nwrote ${OUT}`);
console.error(`attempts spent: ${runs.reduce((s, r) => s + r.attempts.length, 0)}`);
for (const d of depths) {
  console.error(`  depth ${d.depth}: gate floor ${d.gateFloored}/${d.scored} (${d.floorPct}%)`
    + `${d.truncated ? `  +${d.truncated} 503-truncated, excluded` : ''}`
    + `  p50 ${(d.p50 / 1000).toFixed(1)}s  p90 ${(d.p90 / 1000).toFixed(1)}s`);
}
