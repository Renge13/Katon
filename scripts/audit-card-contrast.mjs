#!/usr/bin/env node
// ============================================================
// scripts/audit-card-contrast.mjs — every text run, on every token
// ============================================================
//   npm run audit:card-contrast
//
// MEASURES THE RENDERED MARKUP, not the roles table. Until 2026-08-13 this read
// `TEXT_ROLES` — a table the component did not consume — so it was checking the
// intent beside the card rather than the card. The first run of the DOM version
// found two things the table could not represent: the pillar branch drawn at an
// undeclared `opacity: 0.85`, and the INTI DIRI pill drawn as field-on-accent,
// which is the one pair that structurally cannot reach AA.
//
// Prints worst-first per token, so the answer is not just "does it pass" but
// "which text is the binding constraint" — the second is what says what to fix.
// ============================================================

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CARD_TOKENS } from '../lib/card/tokens.js';
import { auditRendered } from '../lib/card/domContrast.js';
import { inkVerdict } from '../lib/card/contrast.js';
import { CardA, CardB, MIN_CONTRAST, AA_EXEMPT } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;

// One real chart, re-stemmed across all ten tokens: the point of this audit is
// the colour system, and holding the content fixed keeps the comparison clean.
const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

console.log(`WCAG AA, floor ${MIN_CONTRAST}, measured on the rendered markup.\n`);

let unexpected = 0;
for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  const data = { ...base, stem };
  const runs = [];
  for (const [card, C] of [['A', CardA], ['B', CardB]]) {
    for (const r of auditRendered(renderToStaticMarkup(React.createElement(C, { data })), token.field)) {
      runs.push({ ...r, card });
    }
  }
  runs.sort((a, b) => a.ratio - b.ratio);

  const under = runs.filter((r) => r.ratio < MIN_CONTRAST);
  const exempt = AA_EXEMPT.includes(stem);
  if (under.length && !exempt) unexpected += under.length;

  const w = runs[0];
  const state = !under.length ? 'PASS'
    : exempt ? 'FAILS AA - known, Reyner to rule' : 'FAILS AA - UNEXPECTED';
  console.log(
    `  ${stem}  ${token.approved ? 'LOCKED  ' : 'proposed'}  ${w.ratio.toFixed(2).padStart(5)}  `
    + `${runs.length} runs, ${under.length} under  ${JSON.stringify(w.text.slice(0, 22))} on ${w.ground}  ${state}`,
  );
}

// THE INK-POLE GUARD. Reports which pole a failing field could carry; never
// applies it. Code choosing the ink would let a token edit silently repaint every
// word on the card and still pass the audit.
console.log('\nINK VERDICTS (the declared ink is the authority; nothing here is applied):');
for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  const v = inkVerdict(stem, token, MIN_CONTRAST);
  if (v.ok) continue;
  console.log(`  ${v.message}`);
}

console.log(`\n${unexpected} run(s) under AA outside the known list (${AA_EXEMPT.join(', ') || 'none'}).`);
process.exitCode = unexpected ? 1 : 0;
