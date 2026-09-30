#!/usr/bin/env node
// ============================================================
// scripts/walk-card-b-heaviest.mjs — which real charts carry Card B's heaviest prose?
// ============================================================
//   npm run walk:card-b-heaviest > real.txt      about 20 minutes
//   CARD_OVERFLOW_REAL="$(cat real.txt)" npm run audit:card-budget -- --overflow
//
// THE REAL ROWS OF THE 86-CASE SWEEP. `docs/qa/2026-09-30-card-b-headline.md` measured
// Card B's fit on 86 cases: 13 fixture charts, 10 MAX rows, and 63 real charts
// picked by this walk. The 63 were passed to the probe through CARD_OVERFLOW_REAL
// and were not recorded anywhere, so the sweep could not be reproduced; the list is
// now committed at docs/qa/2026-09-30-card-b-headline/real-charts.txt and this is
// the walk that produced it. It was a scratch script in the #187 session and is
// committed here as it ran; only the imports were made repo-relative.
//
// WHAT IT WALKS. Every day 1950-01-01 to 2005-12-31 at thirteen times: the twelve
// two-hour branches, with 子 sampled twice (early 00:30, late 23:30). Each chart is
// reduced to what Card B SHOWS: its first CARD_B_BADGE_LIMIT badges and its fixed +
// dynamic tags. Charts that show the same thing are one combination, represented by
// the FIRST date and time that produced it.
//
// "HEAVIEST PER STEM" IS A HEURISTIC, and a known-blind one. Per stem it takes the
// union of (a) the six combinations with the most tag characters among those within
// 15 characters of that stem's longest badge meaning, and (b) the three with the
// most tag characters overall. Tag CHARACTER COUNT stands in for tag ROWS; the
// browser measures the real wrap. The blind spot is in the QA doc: tag ORDER, not
// count, decides whether six tags take two rows or three, so a chart this walk
// ranks lower can still be the one that clips. Treat its output as a sample of the
// heavy corner, not as the worst case.
//
// THE OUTPUT DEPENDS ON THE ENGINE AND THE GLOSSARY. A change to badges, tags or
// `label_meaning` changes which combinations exist and which date comes first, so
// the committed list is a record of the tree it was taken on, not a constant.
// stdout is the list; stderr is the per-stem chart count, which is where the
// "208 of 26,585" 癸 denominator comes from.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CARD_B_BADGE_LIMIT } from '../components/cards/Card.js';

const hours = ['00:30', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:30'];
const byStem = new Map();
const charts = new Map();
for (let t = Date.UTC(1950, 0, 1); t < Date.UTC(2006, 0, 1); t += 86400000) {
  const d = new Date(t).toISOString().slice(0, 10);
  for (const h of hours) {
    const chart = calculateBaziChart({ birthDate: d, birthTime: h });
    const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart), birthDate: d });
    const shown = data.badges.slice(0, CARD_B_BADGE_LIMIT);
    const key = shown.map((b) => b.label).join('+') + ' | ' + [...data.tags.fixed, ...data.tags.dynamic].join(',');
    const meaning = shown.reduce((a, b) => a + (b.meaning || '').length, 0);
    const tagChars = [...data.tags.fixed, ...data.tags.dynamic].join('').length;
    const m = byStem.get(data.stem) || new Map();
    if (!m.has(key)) m.set(key, { at: `${d}T${h}`, meaning, tagChars });
    byStem.set(data.stem, m);
    charts.set(data.stem, (charts.get(data.stem) || 0) + 1);
  }
}
const pick = [];
for (const [stem, m] of byStem) {
  const rows = [...m.values()];
  const maxMeaning = Math.max(...rows.map((r) => r.meaning));
  const heavy = rows.filter((r) => r.meaning >= maxMeaning - 15).sort((a, b) => b.tagChars - a.tagChars).slice(0, 6);
  const wideTags = rows.slice().sort((a, b) => b.tagChars - a.tagChars || b.meaning - a.meaning).slice(0, 3);
  const picked = [...new Set([...heavy, ...wideTags].map((r) => r.at))];
  pick.push(...picked);
  console.error(`${stem}  ${charts.get(stem)} charts  ${m.size} combinations  ${picked.length} picked`);
}
console.log(pick.join(','));
