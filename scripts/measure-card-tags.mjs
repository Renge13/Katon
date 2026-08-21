#!/usr/bin/env node
// ============================================================
// scripts/measure-card-tags.mjs — do the three dynamic tags differentiate?
// ============================================================
//   npm run measure:card-tags
//
// The card carries 3 fixed tags per archetype and 3 dynamic ones drawn from the
// chart's own Aspek and Bintang (ruled 2026-08-01). The fixed three exist so
// every Matahari card has family resemblance; the DYNAMIC three exist so no two
// cards are identical. That second job is a claim, and this measures it.
//
// Two numbers, and they answer different questions:
//
//   DISTINCT TAG SETS   how many of the fixture's charts produce a different
//                       dynamic triple. If this collapses, the card has ~10
//                       states and a user finds a stranger with her card inside
//                       a week — the exact failure the hybrid rule was chosen to
//                       avoid (sharecard-spec, decision 2).
//
//   PENOLONG IN TOP 3   Bintang Penolong is in 77% of charts and was the obvious
//                       way differentiation could quietly fail. **This is now 0 BY
//                       CONSTRUCTION**, since the 08-13 dedupe removed every
//                       Bintang from the tag row, so it has stopped being evidence
//                       about the hierarchy. Kept as a regression guard: if it
//                       ever fires again, the dedupe has broken.
//
//   FEWER THAN 3 TAGS   the cost of that dedupe, and the row to watch. It went
//                       1 -> 2 of 13 when Bintang left the pool, because two of
//                       chart 12's three tags had been Bintang. The ruling says
//                       three; the card renders what exists rather than inventing
//                       one (rule 14). If this climbs as the fixture grows, the
//                       ruled "3 dynamic" is what is under pressure.
//
// A fall in the first number is the signal that the dedupe cost more than it
// bought. None of the three is a gate.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { dynamicTags, allBadges } from '../lib/card/cardData.js';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';

const PENOLONG = 'Bintang Penolong';

const rows = VALIDATION_CHARTS.map((c) => {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const sj = buildSemanticJson(chart);
  const tags = dynamicTags(sj.facts, allBadges(sj.facts));
  return { id: c.id, date: c.date, tags };
});

const sets = new Set(rows.map((r) => r.tags.join(' + ')));
const penolong = rows.filter((r) => r.tags.includes(PENOLONG));
const short = rows.filter((r) => r.tags.length < 3);

console.log('chart | dynamic tags');
for (const r of rows) console.log(`${String(r.id).padStart(5)} | ${r.tags.join(', ') || '(none)'}`);

console.log('');
console.log(`DISTINCT TAG SETS   ${sets.size} of ${rows.length}`);
console.log(`PENOLONG IN TOP 3   ${penolong.length} of ${rows.length}${penolong.length ? `  (charts ${penolong.map((r) => r.id).join(', ')})` : ''}`);
console.log(`FEWER THAN 3 TAGS   ${short.length} of ${rows.length}${short.length ? `  (charts ${short.map((r) => r.id).join(', ')})` : ''}`);
