#!/usr/bin/env node
// ============================================================
// scripts/qa-samples.mjs - print stored readings Reyner is owed, from an n-runs artifact
// ============================================================
//   node --conditions=react-server scripts/qa-samples.mjs \
//     --json docs/qa/2026-08-22-renders-n10-postfixes.json \
//     --out  docs/qa/2026-08-22-owed-samples.md
//
// SPENDS NOTHING. Every word it prints was already paid for: `qa:renders --n` stores
// all attempts of every run, and this reads that file. No provider, no cache, no
// engine render.
//
// ── WHY THIS EXISTS, AND IT IS AN INSTRUMENT FAILURE RATHER THAN A GAP ──
// `qa:renders` prints ONE run per chart into its markdown artifact while storing all
// of them in the JSON beside it. That is fine for a floor RATE - the rate is computed
// over every run - and it is actively misleading for a SELL/NO-SELL READ, because the
// read is performed on the one run that got printed:
//
//   fresh-1996  the printed run carries the `opening.archetype_missing` flag, which
//               fires on 2 of its 10 rendered runs. So a REJECT formed on it may be a
//               verdict on a 1-in-5 sample rather than on the chart.
//   chart 5     the printed run was `module_assembly` - the FLOOR. That chart has
//               never been judged on a live render at all, and the artifact's own
//               banner says a verdict formed on a floor is a verdict on the glossary.
//
// Both are recoverable from the stored JSON, which is why this is a script rather
// than a re-run.
//
// ── THE SELECTION RULE IS "FIRST", AND IT IS STATED BECAUSE IT MATTERS ──
// The lowest run number that satisfies the criterion. NOT the longest, not the one
// that reads best, not the one with the fewest attempts. Reyner's instruction is
// explicit - "do not pick the nicest one" - and any quality-ordered pick would make
// the sample an argument instead of evidence. `--pick <n>` overrides it for a
// deliberate second look, and the banner always names which run and which attempt.
//
// ── THE FLAG IS RECOMPUTED, NOT READ ──────────────────────
// The JSON records the checks that REJECTED an attempt. A flag never rejects, so
// `opening.archetype_missing` appears in that file ZERO times
// (`grep -c archetype_missing docs/qa/2026-08-22-renders-n10-postfixes.json`), and
// the 2/10 rate lives only in the prose of the markdown. So this runs the real
// `openingGuard` over the stored prose instead of trusting either. Same instrument
// the gate uses, on the same bytes the reader was served.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { openingGuard } from '../lib/validate/opening.js';
import { splitParagraphs } from '../lib/render/paragraphs.js';

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : null;
};

const JSON_PATH = flag('json') || 'docs/qa/2026-08-22-renders-n10-postfixes.json';
const OUT = flag('out');

/**
 * The charts this is asked for, and WHY each one is owed. The reason is printed into
 * the artifact: a sample with no stated reason is a sample somebody has to guess at.
 */
const WANTED = {
  'fresh-1996': {
    need: 'no-opening-flag',
    why: 'The printed run carries `opening.archetype_missing`. A REJECT formed on it may '
      + 'be a verdict on an unlucky sample rather than on the chart, so a run WITHOUT the '
      + 'flag is what the verdict needs to be re-formed on.',
  },
  'chart 5': {
    need: 'rendered',
    why: 'The printed run was `module_assembly` - the FLOOR. This chart has never been '
      + 'judged on a live render, so its verdict is NOT JUDGED rather than a rejection.',
  },
};

/** Birthdates, so the semantic JSON the guard needs can be rebuilt. */
const BIRTH = {
  'chart 1': { birthDate: '1989-09-13', birthTime: '09:00' },
  'chart 13': { birthDate: '1989-02-04', birthTime: '04:00' },
  'chart 5': { birthDate: '1988-07-10', birthTime: '22:00' },
  'fresh-1996': { birthDate: '1996-10-02', birthTime: '19:20' },
};

const artifact = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

/** The attempt a reader was actually served: the accepted one, or none. */
const servedAttempt = (run) => {
  const idx = run.attempts.findIndex((a) => a.ok === true);
  return idx < 0 ? null : { index: idx + 1, ...run.attempts[idx] };
};

/**
 * Blocks from the stored prose. `qa:renders` stores the raw model text, and the
 * opening guard reads `blocks[0].text`, so the same split the serve path uses has to
 * be applied here or the guard would judge a heading as the first sentence.
 */
function blocksFrom(prose) {
  const parts = String(prose || '').split(/\n(?=### )/);
  return parts.map((part) => {
    const m = /^### (.*)\n?([\s\S]*)$/.exec(part);
    return m
      ? { heading: m[1].trim(), text: m[2].trim() }
      : { heading: '', text: part.trim() };
  }).filter((b) => b.text);
}

const report = [];

for (const [chart, spec] of Object.entries(WANTED)) {
  const runs = artifact.runs.filter((r) => r.chart === chart).sort((a, b) => a.run - b.run);
  if (runs.length === 0) throw new Error(`no runs for "${chart}" in ${JSON_PATH}`);

  const birth = BIRTH[chart];
  if (!birth) throw new Error(`no birthdate recorded for "${chart}"`);
  const semanticJson = buildSemanticJson(calculateBaziChart(birth));

  // Every run, judged. The table goes in the artifact so the pick can be checked
  // rather than taken on trust.
  const judged = runs.map((run) => {
    const served = servedAttempt(run);
    const blocks = served ? blocksFrom(served.prose) : [];
    const findings = served ? openingGuard({ blocks }, semanticJson) : [];
    return {
      run: run.run,
      source: run.source,
      attempts: run.attempts.length,
      servedAttempt: served?.index ?? null,
      blocks,
      openingFlags: findings.map((f) => f.check),
      served,
    };
  });

  const eligible = judged.filter((j) => {
    if (j.source !== 'gemini' || !j.served) return false;
    if (spec.need === 'no-opening-flag') return !j.openingFlags.includes('opening.archetype_missing');
    return true;
  });
  if (eligible.length === 0) throw new Error(`no eligible run for "${chart}" (${spec.need})`);

  const override = flag('pick');
  const chosen = override
    ? eligible.find((j) => j.run === Number(override))
    : eligible[0]; // FIRST. See the selection-rule note in the header.
  if (!chosen) throw new Error(`--pick ${override} is not eligible for "${chart}"`);

  const rendered = judged.filter((j) => j.source === 'gemini');
  const flagged = rendered.filter((j) => j.openingFlags.includes('opening.archetype_missing'));

  report.push({
    chart, spec, judged, chosen, birth, rendered: rendered.length, flagged: flagged.length,
  });
}

// ── the artifact ──

const lines = [];
lines.push('<!--');
lines.push('STATUS: EVIDENCE. Generated, never hand-edited. Regenerate with:');
lines.push(`  node --conditions=react-server scripts/qa-samples.mjs --json ${JSON_PATH}`);
lines.push('Every word of prose below was stored by an earlier paid run. This script spends nothing.');
lines.push('-->');
lines.push('');
lines.push('# The two readings Reyner is owed');
lines.push('');
lines.push(`Source: \`${path.basename(JSON_PATH)}\` · prompt \`${artifact.prompt}\` · `
  + `gate \`${artifact.gate}\` · regeneration budget \`${artifact.regeneration_budget}\` at the time of the run · n=${artifact.n}`);
lines.push('');
lines.push('**THE BUDGET HAS SINCE CHANGED.** These runs were produced at '
  + `\`REGENERATION_BUDGET ${artifact.regeneration_budget}\`. Reyner reverted it to 2 on 2026-08-22 `
  + '("depth 3 is thinner, not tighter"), so this prose is what depth '
  + `${artifact.regeneration_budget} produced. It is still the right thing to read - it is what the `
  + 'sell/no-sell verdicts were formed on - but a verdict given here is a verdict on '
  + 'that gate and that depth, and the artifact records both rather than leaving it to be inferred.');
lines.push('');
lines.push('**HOW THE SAMPLE WAS PICKED: THE LOWEST ELIGIBLE RUN NUMBER.** Not the longest, not the '
  + 'best-reading, not the fewest attempts. Any quality-ordered pick would make the sample an '
  + 'argument instead of evidence. The full per-run table is printed above each reading so the '
  + 'choice can be checked.');
lines.push('');
lines.push('**THE OPENING FLAG IS RECOMPUTED, NOT COPIED.** `opening.archetype_missing` never '
  + 'rejects, so it is absent from the stored JSON entirely (`grep -c archetype_missing` on that '
  + 'file returns 0). The rate below comes from running `lib/validate/opening.js#openingGuard` over '
  + 'the stored prose - the same instrument the gate uses, on the same bytes the reader was served.');
lines.push('');

for (const r of report) {
  lines.push('---');
  lines.push('');
  lines.push(`## ${r.chart} - ${r.birth.birthDate} ${r.birth.birthTime}`);
  lines.push('');
  lines.push(`**WHY THIS SAMPLE IS OWED.** ${r.spec.why}`);
  lines.push('');
  lines.push(`**\`opening.archetype_missing\`: ${r.flagged} of ${r.rendered} rendered runs.** `
    + 'The denominator is RENDERED runs: a floored run has no model output to judge, so counting '
    + 'it would dilute the rate with runs that could not have exhibited the thing being counted.');
  lines.push('');
  lines.push('| run | source | attempts | served on attempt | opening flag | eligible | printed here |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const j of r.judged) {
    const elig = j.source === 'gemini' && j.served
      && (r.spec.need !== 'no-opening-flag' || !j.openingFlags.includes('opening.archetype_missing'));
    lines.push(`| ${j.run} | \`${j.source}\` | ${j.attempts} | ${j.servedAttempt ?? '-'} `
      + `| ${j.openingFlags.length ? j.openingFlags.join(', ') : '-'} `
      + `| ${elig ? 'yes' : 'no'} | ${j.run === r.chosen.run ? '**YES**' : ''} |`);
  }
  lines.push('');
  lines.push(`### ⚑ BANNER - read this before the prose`);
  lines.push('');
  lines.push(`**Run ${r.chosen.run} of ${r.judged.length}, served on attempt ${r.chosen.servedAttempt} `
    + `of ${r.chosen.attempts}. Source \`${r.chosen.source}\` - a real render, not the floor.** `
    + `Opening flag: ${r.chosen.openingFlags.length ? r.chosen.openingFlags.join(', ') : 'none'}.`);
  if (r.chosen.attempts > 1) {
    lines.push('');
    lines.push(`**IT TOOK ${r.chosen.attempts} ATTEMPTS.** The earlier ones were rejected by Stage 6 and `
      + 'regenerated under a stricter directive, so this prose is post-regeneration. That is the '
      + 'normal path and not a defect - but it is also the mechanism Reyner ruled against at depth 3, '
      + 'so a reading that needed regenerations is the one most likely to show the thinning.');
  }
  lines.push('');
  for (const b of r.chosen.blocks) {
    if (b.heading) lines.push(`#### ${b.heading}`);
    lines.push('');
    for (const para of splitParagraphs(b.text)) {
      lines.push(para);
      lines.push('');
    }
  }
}

const out = `${lines.join('\n')}\n`;
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // NEVER OVERWRITE EVIDENCE. Same guard as the harness: an artifact that can be
  // silently replaced is an artifact nobody can cite.
  if (fs.existsSync(OUT)) {
    console.error(`refusing to overwrite ${OUT} - evidence is not regenerated in place`);
    process.exit(1);
  }
  fs.writeFileSync(OUT, out);
  console.error(`wrote ${OUT}`);
  for (const r of report) {
    console.error(`  ${r.chart}: run ${r.chosen.run}, attempt ${r.chosen.servedAttempt}, `
      + `flag rate ${r.flagged}/${r.rendered}`);
  }
} else {
  process.stdout.write(out);
}
