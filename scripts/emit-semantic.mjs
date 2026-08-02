// ============================================================
// Emit Stage 3's semantic JSON for a chart
// ============================================================
// The paste-into-AI-Studio path, and the regenerator for
// docs/content/provecell-01-ENGINE.json.
//
//   node scripts/emit-semantic.mjs 1989-09-13 09:00
//   node scripts/emit-semantic.mjs 1989-09-13 09:00 --write
//
// --write refreshes the checked-in chart-1 artifact and refuses to run for any
// other chart, so the file cannot be quietly replaced with someone else's.
// ============================================================

import { writeFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';

const [date, time, ...flags] = process.argv.slice(2);
if (!date) {
  console.error('usage: node scripts/emit-semantic.mjs YYYY-MM-DD [HH:MM] [--write]');
  process.exit(2);
}

const write = flags.includes('--write');
const chart = calculateBaziChart({ birthDate: date, birthTime: time || null });
const json = buildSemanticJson(chart);
const key = cacheKey(json);

if (!write) {
  console.log(JSON.stringify(json, null, 2));
  console.error(`\ncache key: ${key}`);
  console.error(`facts: ${json.facts.length}  required_points: ${json.required_points.length}`);
  process.exit(0);
}

const ARTIFACT = 'docs/content/provecell-01-ENGINE.json';
if (date !== '1989-09-13' || time !== '09:00') {
  console.error(`--write only regenerates ${ARTIFACT}, which is fixture chart 1 (1989-09-13 09:00).`);
  process.exit(2);
}

writeFileSync(ARTIFACT, `${JSON.stringify({
  _README: {
    status: 'GENERATED, do not hand-edit. Regenerate with scripts/emit-semantic.mjs --write.',
    what: 'Stage 3 output for fixture chart 1 (1989-09-13 09:00), the same chart docs/content/provecell-01-USER.json was hand-authored for. Diff the two to see what the engine does and does not reproduce.',
    the_gate: 'D2 asks for this to be pasted into AI Studio with content/renderer-prompt.txt and the reading compared against run 5. THAT HAS NOT BEEN RUN - it needs an LLM call. The JSON is paste-ready.',
    closed_gap: 'CLOSED 2026-08-02 in 3b5685e. strength_weak previously carried no label, label_meaning, gift or cost because glossary.json had no kekuatan section; it now has one (weak/balanced/strong, Reyner-reviewed) and the fact is fully backed. Every fact type in this artifact now has Reyner-reviewed content behind it. Stage 6 owes the same-breath check: the verdict label never renders without its label_meaning (rule 21, glossary kekuatan._note).',
    provenance_is_structured: 'Every fact carries provenance as DATA, not as the finished Indonesian sentence the hand-written file uses. A deliberate deferral, not an omission - see the header of lib/semantic/facts.js.',
    cache_key: key,
  },
  ...json,
}, null, 2)}\n`);

console.error(`wrote ${ARTIFACT}\ncache key: ${key}`);
