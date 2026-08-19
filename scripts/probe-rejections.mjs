#!/usr/bin/env node
// ============================================================
// scripts/probe-rejections.mjs — every rejection, with its sentence
// ============================================================
//   npm run probe:rejections            10 runs x 4 charts
//   npm run probe:rejections -- --n 3
//
// ── WHY THIS EXISTS BESIDE gallery:rejections ──────────────
// `scripts/rejection-gallery.mjs` saves a FEW COMPLETE READINGS so Reyner can
// read them as a reader. This saves EVERY FINDING from a batch, grouped by
// check, so the question "which checks are firing correctly" can be answered
// across the whole population rather than from five samples. Different artifact,
// same principle: a count cannot tell you whether a ban is killing prose the
// product needs.
//
// ── WHY IT DOES NOT CALL renderReading ─────────────────────
// It cannot. `lib/render/index.js` records a rejected attempt as
// `stage6: [check ids]` and drops both `gate.findings` and the parsed prose, so
// the 40-run floor-rate batch physically has no sentences in it. Rather than add
// prose to the production return value, this mirrors the chain the way
// rejection-gallery.mjs already does - one provider call, parse, validate, then
// ONE regeneration with the real `stricterDirective` - so the attempt sequence
// matches production even though the plumbing is local.
//
// THE CONSEQUENCE, AND IT MATTERS FOR READING THE NUMBERS: these are NEW runs.
// They are not the 2026-08-17 batch annotated after the fact, because that batch
// kept no sentences. Run-to-run spread on this pipeline is large and documented,
// so treat the counts here as a second sample rather than a decomposition of the
// first.
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
const stamp = new Date().toISOString().slice(0, 10);
const OUT = flag('out', `docs/qa/${stamp}-rejections.md`);

if (!geminiConfigured(DEFAULT_TIER)) throw new Error('no GEMINI key: this probe needs the real provider');

const CHARTS = [
  { label: 'chart 5', date: '1988-07-10', time: '22:00' },
  { label: 'chart 13', date: '1989-02-04', time: '04:00' },
  { label: 'chart 1', date: '1989-09-13', time: '09:00' },
  { label: 'fresh-1996', date: '1996-10-02', time: '19:20' },
];

/** The excerpt a finding reports, pulled back out of its message. */
const excerptOf = (m) => { const x = /at "([^"]+)"/.exec(String(m || '')); return x ? x[1] : null; };

/** ~15 words either side of `phrase` in `text`, so a ruling has context. */
function context(text, phrase) {
  if (!phrase) return null;
  const flat = String(text).replace(/\s+/g, ' ');
  const at = flat.indexOf(phrase);
  if (at < 0) return null;
  const before = flat.slice(0, at).split(' ').slice(-15).join(' ');
  const after = flat.slice(at + phrase.length).split(' ').slice(0, 16).join(' ');
  return { before, phrase, after };
}

const allText = (parsed) => (parsed.blocks || []).map((b) => `${b.heading || ''}. ${b.text || ''}`)
  .concat(parsed.penutup ? [parsed.penutup] : []).join('\n\n');

const rows = [];
const runs = [];

for (const c of CHARTS) {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  const payload = scrubInternal(semantic);
  const hourKnown = semantic.notes?.hour_known ?? semantic.chart?.hour != null;

  for (let run = 1; run <= N; run++) {
    let directive = '';
    let outcome = 'floored';
    const pending = [];
    for (let attempt = 1; attempt <= 2; attempt++) {
      let parsed;
      try {
        const raw = await renderWithGemini(MASTER_PROMPT + directive, payload, {
          ...GENERATION, model: modelFor(DEFAULT_TIER, 'gemini'),
        });
        parsed = parseRenderResponse(raw.text, {
          knownFactIds: new Set((semantic.facts || []).map((f) => f.id)),
        });
      } catch (err) {
        pending.push({ attempt, transport: err.message.slice(0, 160), findings: [] });
        break;
      }
      const gate = validateRendering(parsed, semantic, { provider: 'gemini' });
      if (gate.ok) { outcome = attempt === 1 ? 'passed first' : 'passed on retry'; break; }
      pending.push({
        attempt,
        hard: gate.hard,
        findings: gate.findings.filter((f) => f.severity !== 'flag').map((f) => {
          const phrase = excerptOf(f.message);
          return {
            check: f.check, severity: f.severity, message: f.message,
            ctx: context(allText(parsed), phrase), phrase,
          };
        }),
      });
      if (attempt === 1) directive = stricterDirective(gate.findings);
    }
    for (const p of pending) {
      for (const f of p.findings) {
        rows.push({ chart: c.label, hourKnown, run, attempt: p.attempt, hard: p.hard, outcome, ...f });
      }
    }
    runs.push({
      chart: c.label, run, outcome, hourKnown,
      checksByAttempt: pending.map((p) => p.findings.map((f) => f.check)),
    });
    process.stderr.write(`  ${c.label} ${String(run).padStart(2)}/${N}  ${outcome}\n`);
  }
}

// ── the markdown, grouped by check ─────────────────────────
const byCheck = {};
for (const r of rows) (byCheck[r.check] ??= []).push(r);
const order = Object.entries(byCheck).sort((a, b) => b[1].length - a[1].length);

const L = [];
L.push('<!--');
L.push('STATUS: RAW EVIDENCE. Generated by npm run probe:rejections - do not edit the sentences.');
L.push('Nobody has judged these. Which checks fired CORRECTLY is a register call, and Reyner rules it.');
L.push('-->');
L.push('');
L.push(`# Gate rejections — ${stamp}`);
L.push('');
L.push(`Prompt \`${PROMPT_VERSION}\`, gate \`${STAGE6_VERSION}\`, ${CHARTS.length} charts x ${N} runs.`);
L.push('');
L.push('**These are NEW runs.** The 2026-08-17 floor-rate batch recorded check ids only —');
L.push('`lib/render/index.js` drops `gate.findings` and the prose from a rejected attempt — so its');
L.push('rejections cannot be annotated after the fact. Run-to-run spread on this pipeline is large and');
L.push('documented, so read these counts as a second sample, not as a decomposition of the first.');
L.push('');
L.push('| check | findings | runs that floored | runs that passed on retry |');
L.push('|---|---|---|---|');
for (const [check, rs] of order) {
  const fl = new Set(rs.filter((r) => r.outcome === 'floored').map((r) => r.chart + r.run)).size;
  const pr = new Set(rs.filter((r) => r.outcome === 'passed on retry').map((r) => r.chart + r.run)).size;
  L.push(`| \`${check}\` | ${rs.length} | ${fl} | ${pr} |`);
}
L.push('');
L.push('---');
L.push('');
for (const [check, rs] of order) {
  L.push(`## \`${check}\` — ${rs.length} finding(s)`);
  L.push('');
  for (const r of rs) {
    L.push(`**${r.chart}, run ${r.run}, attempt ${r.attempt}** — ${r.severity}`
      + `${r.hard ? ' **HARD**' : ''} — run ${r.outcome}`);
    L.push('');
    if (r.ctx) {
      L.push(`> ...${r.ctx.before} **${r.ctx.phrase}** ${r.ctx.after}...`);
    } else {
      L.push(`> (no sentence located) \`${r.message}\``);
    }
    L.push('');
  }
  L.push('---');
  L.push('');
}

mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(OUT, L.join('\n') + '\n');
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ rows, runs }, null, 1));
console.error(`\nwrote ${OUT} (${rows.length} findings over ${runs.length} runs)`);
