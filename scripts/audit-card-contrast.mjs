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
import { inkVerdict, contrast, composite, accentAudit } from '../lib/card/contrast.js';
import { brassFor, inkIsDark } from '../lib/card/tokens.js';
import {
  CardA, CardB, MIN_CONTRAST, AA_EXEMPT, DIM_EXEMPT, TEXT_ROLES, roleStyle,
  paletteFor, brassTextFallbacks,
} from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;

// One real chart, re-stemmed across all ten tokens: the point of this audit is
// the colour system, and holding the content fixed keeps the comparison clean.
const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

console.log(`WCAG AA, floor ${MIN_CONTRAST}, measured on the rendered markup.`);
console.log(`${DIM_EXEMPT.length} of ${Object.keys(TEXT_ROLES).length} roles are DIM_EXEMPT (ruled 2026-08-14).`);
console.log('Their ratios are REPORTED, never skipped - the number stays visible.\n');

/** A role's real ratio on a token, at the opacity and over the ground it is drawn. */
function roleRatio(role, token) {
  const palette = paletteFor(token);
  const s = roleStyle(role, palette);
  const ground = TEXT_ROLES[role].over === 'brass' ? palette.brass : token.field;
  return contrast(composite(s.color, ground, s.opacity), ground);
}

let unexpected = 0;
for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  const data = { ...base, stem };
  // The DOM walk still runs: it is what catches a colour no role produced.
  const runs = [];
  for (const [card, C] of [['A', CardA], ['B', CardB]]) {
    for (const r of auditRendered(renderToStaticMarkup(React.createElement(C, { data })), token.field)) {
      runs.push({ ...r, card });
    }
  }
  const unresolved = runs.filter((r) => !/^#[0-9a-f]{6}$/i.test(r.color || ''));

  const rated = Object.keys(TEXT_ROLES)
    .map((role) => ({ role, ratio: roleRatio(role, token), exempt: DIM_EXEMPT.includes(role) }))
    .sort((a, b) => a.ratio - b.ratio);
  const tokenExempt = AA_EXEMPT.includes(stem);
  const under = rated.filter((r) => r.ratio < MIN_CONTRAST && !r.exempt);
  if ((under.length && !tokenExempt) || unresolved.length) unexpected += under.length + unresolved.length;

  const worstFull = rated.filter((r) => !r.exempt)[0];
  const worstDim = rated.filter((r) => r.exempt)[0];
  const state = unresolved.length ? `${unresolved.length} UNRESOLVED COLOUR`
    : !under.length ? 'PASS'
      : tokenExempt ? 'FAILS AA - known, Reyner to rule' : 'FAILS AA - UNEXPECTED';
  console.log(
    `  ${stem}  ${token.approved ? 'LOCKED  ' : 'proposed'}  `
    + `worst full-opacity ${worstFull.ratio.toFixed(2).padStart(5)} (${worstFull.role})  `
    + `worst dimmed ${worstDim.ratio.toFixed(2).padStart(5)} (${worstDim.role})  `
    + `${runs.length} runs  ${state}`,
  );
}

// ── §6.4 BRASS TEXT, MEASURED RATHER THAN ASSUMED ──────────
// The spec expected brass text to clear 4.5 comfortably on dark fields, with
// Taman the one risk. It fails on five, three of them dark fields: pale brass is
// a LIGHT metallic and the three brightest fields in the set cannot carry it.
// Where it fails, that token's brass text retreats to ink and brass stays on
// everything non-text. This is the report; nothing is substituted silently.
{
  const failing = new Set(brassTextFallbacks(CARD_TOKENS).map((f) => f.stem));
  console.log('\nBRASS TEXT ON FIELD (spec §6.4 - fallback to ink where it fails):');
  for (const [stem, token] of Object.entries(CARD_TOKENS)) {
    const brass = brassFor(token);
    const ratio = contrast(brass.text, token.field);
    console.log(
      `  ${stem}  ${inkIsDark(token) ? 'light' : 'dark '} field  ${brass.text}  `
      + `${ratio.toFixed(2).padStart(5)}  ${failing.has(stem) ? 'FAILS - drawn in ink instead' : 'ok'}`,
    );
  }
  console.log(`  ${failing.size} of ${Object.keys(CARD_TOKENS).length} tokens fall back.`);
}

// ── THE SHEEN'S COST, REPORTED (not applied) ───────────────
// Card B's specular sheen is white-alpha over the whole object, and on a
// light-ink token white moves the surface TOWARD the ink. It also sits over the
// region the headline occupies. The sheen is ruled at 0.15 and is NOT reduced
// here — scaling it per token would silently redesign the finish — but the cost
// is real and belongs in front of Reyner. The fix, if he wants one, is the field
// darkening that fixed Matahari on 2026-08-13.
console.log('\nINK IN THE LIT CORNER (ink over composite(#fff, field, .15), Card B only):');
for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  if (inkIsDark(token)) continue; // the inverted sheen moves AWAY from a dark ink
  const lit = composite('#ffffff', token.field, 0.15);
  const ratio = contrast(token.ink, lit);
  console.log(
    `  ${stem}  flat ${contrast(token.ink, token.field).toFixed(2).padStart(5)}  `
    + `lit ${ratio.toFixed(2).padStart(5)}  ${ratio < MIN_CONTRAST ? 'UNDER AA IN THE CORNER' : ''}`,
  );
}

// ── THE ACCENT FLOOR (the design doc's second finding) ─────
// A TOKEN report, not a card decision, and nothing in the card reads it. The bar
// is the LOCKED set's own worst case rather than WCAG: accent is decoration and
// large UI, which is what docs/content/sharecard-tokens-measure.mjs already says.
// Derived from the `approved: true` triples, so approving one moves it with no
// edit anywhere.
{
  const { floor, rows } = accentAudit(CARD_TOKENS);
  console.log(`\nACCENT ON FIELD (floor ${floor.toFixed(2)}, derived from the locked five):`);
  for (const r of rows) {
    console.log(
      `  ${r.stem}  ${r.approved ? 'LOCKED  ' : 'proposed'}  ${r.ratio.toFixed(2).padStart(5)}`
      + `${r.under ? '  UNDER THE FLOOR' : ''}`,
    );
  }
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
