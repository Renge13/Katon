// ============================================================
// THE REJECTION GALLERY — what the gate threw away, in full
// ============================================================
// Every other artifact in this repo reports rejections as COUNTS. A count cannot
// answer the only question that matters about a style ban: is it killing prose
// Reyner would actually want?
//
// So this saves complete REJECTED readings, verbatim, with the exact phrase each
// check matched. Reyner reads them AS A READER and rules on the bans.
//
//   npm run gallery:rejections
//   npm run gallery:rejections -- --n 3 --out reports/rejection-gallery.md
//
// ── THE READING COMES FIRST, THE FLAGS COME AFTER ──────────
// Deliberate. If the flags are at the top he reads hunting for them, which is
// exactly the reader he is not. The reading is printed whole and unannotated, then
// the objections follow it.
//
// ── IT NEVER PERSISTS ──────────────────────────────────────
// Like the measurement harness, this calls renderReading and never
// persistRendered, so a gallery run cannot put prose in the cache.
// ============================================================

import { mkdirSync, writeFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderWithGemini } from '../lib/render/providers/gemini.js';
import { parseRenderResponse } from '../lib/render/schema.js';
import { MASTER_PROMPT, PROMPT_VERSION } from '../lib/render/prompt.js';
import { GENERATION, modelFor, DEFAULT_TIER, geminiConfigured } from '../lib/render/config.js';
import { scrubInternal } from '../lib/render/payload.js';
import { validateRendering, STAGE6_VERSION } from '../lib/validate/index.js';
import { sentences } from '../lib/validate/text.js';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const perChart = Number(flag('n', 2));
const wanted = Number(flag('count', 5));
const outPath = flag('out', 'reports/rejection-gallery.md');
/** Guaranteed a slot: it is the largest rejection cause and the least understood. */
const PRIORITY = 'style.hedge_construction';

if (!geminiConfigured()) {
  console.error('GEMINI_API_KEY is unset; this needs live calls.');
  process.exit(2);
}

/** The excerpt a style finding reports, pulled back out of its message. */
function excerptOf(message) {
  const m = /at "([^"]+)"/.exec(message);
  return m ? m[1] : null;
}

/**
 * The whole sentence an excerpt sits in.
 *
 * A 50-character excerpt is enough to locate a match and not enough to judge it.
 * Reyner is ruling on whether the ban kills prose he wants, so he needs the
 * sentence the reader would have read.
 */
function sentenceAround(text, excerpt) {
  if (!excerpt) return null;
  const needle = excerpt.replace(/\s+/g, ' ').trim().slice(0, 24);
  for (const s of sentences(text.replace(/\s+/g, ' '))) {
    if (s.includes(needle)) return s;
  }
  return null;
}

const readingText = (parsed) => [
  ...parsed.blocks.map((b) => `${b.heading ? `### ${b.heading}\n\n` : ''}${b.text}`),
  parsed.penutup ? `_${parsed.penutup}_` : '',
].filter(Boolean).join('\n\n');

// ── collect ────────────────────────────────────────────────

const rejected = [];
for (const tc of VALIDATION_CHARTS) {
  const semantic = buildSemanticJson(calculateBaziChart({
    birthDate: tc.date, birthTime: tc.time,
  }));
  const payload = scrubInternal(semantic);
  const knownFactIds = semantic.facts.map((f) => f.id);

  for (let run = 1; run <= perChart; run += 1) {
    let parsed;
    try {
      const raw = await renderWithGemini(MASTER_PROMPT, payload, {
        ...GENERATION, model: modelFor(DEFAULT_TIER, 'gemini'),
      });
      parsed = parseRenderResponse(raw.text, { knownFactIds });
    } catch (err) {
      console.error(`chart ${tc.id} run ${run}: ${err.message.slice(0, 60)}`);
      continue;
    }

    const gate = validateRendering(parsed, semantic);
    const failing = gate.findings.filter((f) => f.severity !== 'flag');
    if (failing.length === 0) continue;

    // The NORMALIZED text, because that is what the reader would have seen - it
    // carries any paragraph break the gate inserted.
    const text = readingText(gate.normalized);
    rejected.push({
      chart: tc.id, run, text,
      checks: [...new Set(failing.map((f) => f.check))],
      findings: failing.map((f) => ({
        check: f.check,
        message: f.message,
        phrase: excerptOf(f.message),
        sentence: sentenceAround(text, excerptOf(f.message)),
      })),
    });
    console.error(`chart ${tc.id} run ${run}: ${failing.map((f) => f.check).join(', ')}`);
  }
}

// ── select for CHECK DIVERSITY, not for the first five found ──
// Five readings that all failed the same check would answer one question and
// waste four slots.

const picked = [];
const covered = new Set();

const priorityFirst = rejected.filter((r) => r.checks.includes(PRIORITY));
if (priorityFirst.length > 0) {
  picked.push(priorityFirst[0]);
  for (const c of priorityFirst[0].checks) covered.add(c);
}

// Then whichever rejection adds the most checks nobody has seen yet.
while (picked.length < wanted) {
  let best = null;
  let bestNew = -1;
  for (const r of rejected) {
    if (picked.includes(r)) continue;
    const gained = r.checks.filter((c) => !covered.has(c)).length;
    if (gained > bestNew) { best = r; bestNew = gained; }
  }
  if (!best) break;
  picked.push(best);
  for (const c of best.checks) covered.add(c);
}

// ── emit ───────────────────────────────────────────────────

const lines = [
  '# Rejection gallery',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} · prompt \`${PROMPT_VERSION}\` · `
  + `gate \`${STAGE6_VERSION}\` · model \`${modelFor(DEFAULT_TIER, 'gemini')}\``,
  '',
  `${picked.length} complete readings the gate REJECTED, drawn from ${rejected.length} `
  + `rejections across ${VALIDATION_CHARTS.length} charts and picked for check variety.`,
  '',
  '**Read each reading first, as a reader.** The gate\'s objections come after it, on',
  'purpose: if the flags are at the top you read hunting for them, which is exactly',
  'the reader you are not.',
  '',
  'The question to rule on: **is any of these bans killing prose you would actually',
  'want?** A ban that only ever catches bad writing should stay. A ban that catches a',
  'sentence you would happily have shipped is costing more than it saves, and the',
  'number it improves is not worth it.',
  '',
  'Nothing here was served to anyone. This script never writes to the cache.',
  '',
  '---',
  '',
];

picked.forEach((r, i) => {
  lines.push(`## ${i + 1}. Chart ${r.chart}`, '', r.text, '', '---', '',
    '**What the gate objected to**', '');
  for (const f of r.findings) {
    lines.push(`- \`${f.check}\``);
    if (f.sentence) lines.push(`  - the sentence: "${f.sentence}"`);
    else if (f.phrase) lines.push(`  - matched: "${f.phrase}"`);
    if (!f.sentence) lines.push(`  - ${f.message}`);
  }
  lines.push('', '---', '');
});

const byCheck = {};
for (const r of rejected) for (const c of r.checks) byCheck[c] = (byCheck[c] || 0) + 1;
lines.push('## For context: every check that fired in this sample', '',
  `${rejected.length} rejected readings.`, '');
for (const [c, n] of Object.entries(byCheck).sort((a, b) => b[1] - a[1])) {
  lines.push(`- \`${c}\` — ${n}`);
}
lines.push('');

mkdirSync(outPath.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(outPath, `${lines.join('\n')}\n`);
console.error(`\nwrote ${picked.length} readings to ${outPath}`);
