// ============================================================
// Stage 5 — render a chart, from the terminal
// ============================================================
// THE ONLY ENTRY POINT STAGE 5 HAS, on purpose. G says nothing renders to a real
// user until Prompt H's gate exists, so this commit adds no route: a CLI cannot
// be reached by a user, and an /api handler behind a flag can. Prompt H adds the
// route when there is a gate for it to sit behind.
//
// It is also the shape H's pass-rate harness needs — render N charts, inspect
// the output — so building it now is not scaffolding that gets thrown away.
//
//   npm run render:reading -- 1989-09-13 09:00
//   npm run render:reading -- 1989-09-13 09:00 --fallback     # no LLM at all
//   npm run render:reading -- 1989-09-13 09:00 --json         # machine-readable
//
// With no GEMINI_API_KEY set this lands on the module-assembled floor and says
// so. That is the correct local behaviour: the key fence only bites in
// production.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderReading } from '../lib/render/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { PROMPT_VERSION } from '../lib/render/prompt.js';
import { serveFenceReason } from '../lib/render/fence.js';
import { splitParagraphs } from '../lib/render/paragraphs.js';

const [date, time, ...flags] = process.argv.slice(2);
if (!date) {
  console.error('usage: npm run render:reading -- YYYY-MM-DD [HH:MM] [--fallback] [--json]');
  process.exit(2);
}

const asJson = flags.includes('--json');
const fallbackOnly = flags.includes('--fallback');

const chart = calculateBaziChart({ birthDate: date, birthTime: time || null });
const semantic = buildSemanticJson(chart);

// allowUnvalidatedCache: this is a QA surface, so a previous run's row counts as
// a hit and a repeated invocation does not re-buy the same reading. A serve path
// may never pass this.
const result = fallbackOnly
  ? { ...assembleFallback(semantic), model: null, prompt_version: null, cached: false, attempts: [] }
  // spendGuards off: a dev script re-rendering one chart should not be silently
  // floored by the per-key cap after the third run of an hour.
  : await renderReading(semantic, { allowUnvalidatedCache: true, spendGuards: false });

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error(`chart        ${semantic.chart.year} ${semantic.chart.month} `
  + `${semantic.chart.day} ${semantic.chart.hour ?? '-'}`);
console.error(`source       ${result.source}${result.cached ? ' (cached)' : ''}`);
console.error(`model        ${result.model ?? '-'}`);
console.error(`prompt       ${result.prompt_version ?? '-'} (loaded: ${PROMPT_VERSION})`);
console.error(`facts        ${semantic.facts.length}, required ${semantic.required_points.length}`);
for (const a of result.attempts) {
  console.error(`attempt      ${a.provider} ${a.ok ? 'ok' : `failed: ${a.error}`}`);
}
// Said out loud every run, so nobody mistakes a good-looking render for
// something that is allowed to reach a person.
console.error(`serve fence  ${serveFenceReason() ?? 'open'}\n`);

for (const block of result.blocks) {
  if (block.heading) console.log(`## ${block.heading}`);
  for (const paragraph of splitParagraphs(block.text)) console.log(`${paragraph}\n`);
}
if (result.penutup) console.log(result.penutup);
else console.error('(no penutup: the module floor has no closing verdict to assemble)');
