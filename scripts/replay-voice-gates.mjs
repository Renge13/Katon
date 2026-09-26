#!/usr/bin/env node
// ============================================================
// scripts/replay-voice-gates.mjs — the stored drafts through today's gates
// ============================================================
//   node --conditions=react-server scripts/replay-voice-gates.mjs --out <file.json>
//   node scripts/replay-voice-gates.mjs --diff <before.json> <after.json> [--gate v1|v2]
//
// SPENDS NOTHING. No writer, no judge: every draft is one the renders harness
// (scripts/qa-voice-v2-renders.mjs) already captured off the wire, and the gates
// here are the deterministic ones. Prompt AD Job B, amendment 1 (2026-09-26).
//
// For every stored render under reports/voice-v2/ (v1 and v2, round 2), its
// run1-stage6-1.29.0/ copy, and reports/voice-v2/round3/ (v2), every captured
// writer draft is put through exactly what the pipeline does before Stage 6
// (`withEngineOpening`, lib/render/index.js), then through:
//   v1   validateRendering   (lib/validate/index.js)
//   v2   validateRenderingV2 (lib/validate/v2.js), on a semantic JSON marked v2
//   fact factGuard over the v2 gate's normalized text (report only: amendment 1
//        item 4 - it does not run on v2 today)
// The semantic JSON is rebuilt from the stored births with TODAY'S engine, so a
// finding can move because the engine moved; the diff mode compares two runs of
// this script, which share the engine, and so isolates the gate.
//
// A finding is recorded as `severity check :: message`, the exact line the
// zero-diff proof compares.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};

// ── diff mode: plain node, no lib imports ──────────────────
if (arg('diff')) {
  const i = process.argv.indexOf('--diff');
  const [before, after] = [process.argv[i + 1], process.argv[i + 2]].map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  const gate = arg('gate', 'v1');
  let changed = 0;
  let compared = 0;
  for (const b of before.drafts) {
    const a = after.drafts.find((x) => x.key === b.key);
    if (!a) { console.log(`MISSING in after: ${b.key}`); changed += 1; continue; }
    compared += 1;
    const bs = JSON.stringify(b[gate]);
    const as = JSON.stringify(a[gate]);
    if (bs === as) continue;
    changed += 1;
    const gone = b[gate].filter((x) => !a[gate].includes(x));
    const added = a[gate].filter((x) => !b[gate].includes(x));
    console.log(`DIFF ${b.key}\n  - ${gone.join('\n  - ') || '(none)'}\n  + ${added.join('\n  + ') || '(none)'}`);
  }
  console.log(`${gate}: ${compared} drafts compared, ${changed} differ`);
  process.exitCode = changed === 0 ? 0 : 1;
  process.exit();
}

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'GEMINI_API_KEY']) delete process.env[k];

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { withEngineOpening } = await import('../lib/render/pairOpening.js');
const { validateRendering, STAGE6_VERSION } = await import('../lib/validate/index.js');
const { validateRenderingV2 } = await import('../lib/validate/v2.js');
const { factGuard } = await import('../lib/validate/fact.js');
const { renderedText } = await import('../lib/validate/text.js');

const DIRS = ['reports/voice-v2', 'reports/voice-v2/run1-stage6-1.29.0', 'reports/voice-v2/round3'];
const line = (f) => `${f.severity} ${f.check} :: ${f.message}`;
const metrics = () => ({
  same_breath: [], coverage: [], block_chars: [], breaks_per_block: [], total_chars: [],
  brackets: [], bracket_inserts: 0, bracket_normalised: 0, paragraph_inserts: 0,
});

const out = [];
for (const dir of DIRS) {
  for (const file of fs.readdirSync(dir).filter((f) => /-v[12]\.json$/u.test(f)).sort()) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const a = calculateBaziChart(rec.inputs.a);
    const semantic = (voice) => (rec.kind === 'pair'
      ? buildPairSemantic(a, calculateBaziChart(rec.inputs.b), { voice })
      : buildSemanticJson(a, { voice }));
    const s1 = semantic('v1');
    const s2 = semantic('v2');
    // Every captured draft, plus the SERVED text (run1-stage6-1.29.0 stored only
    // that). A served floor is the engine's own text and is replayed like any other.
    const inputs = [
      ...(rec.drafts || []).map((d, n) => [`draft${n + 1}`, d]),
      ...(rec.rendered ? [[rec.floored ? 'served-floor' : 'served', { blocks: rec.rendered.blocks, penutup: rec.rendered.penutup }]] : []),
    ];
    inputs.forEach(([label, draft]) => {
      const g1 = validateRendering(withEngineOpening(draft, s1).rendered, s1, { provider: 'gemini' });
      const g2 = validateRenderingV2(withEngineOpening(draft, s2).rendered, s2, { provider: 'gemini' });
      const fact = factGuard(g2.normalized, s2, renderedText(g2.normalized), metrics());
      out.push({
        key: `${dir}/${file}#${label}`,
        subject: rec.subject, kind: rec.kind, voice: rec.voice, draft: label,
        v1: g1.findings.map(line),
        v2: g2.findings.map(line),
        fact_on_v2: fact.map((f) => ({ check: f.check, severity: f.severity, message: f.message, where: f.where ?? f.fact_ids ?? null })),
      });
    });
  }
}

const OUT = arg('out');
const result = { stage6_version: STAGE6_VERSION, drafts: out };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(`STAGE6 ${STAGE6_VERSION}: ${out.length} drafts from ${DIRS.length} folders${OUT ? ` -> ${OUT}` : ''}`);
