#!/usr/bin/env node
// ============================================================
// scripts/audit-card-contrast.mjs — every text run, on every token
// ============================================================
//   npm run audit:card-contrast
//
// ── WHAT THIS AUDIT ACTUALLY DOES, corrected 2026-08-17 ────
// It gates on THREE measurements, and the distinction is the whole design:
//
//   1. FLAT ROLE COLOURS come from the roles table. `roleStyle()` is the only
//      source of text colour in `Card.js`, so the table IS consumed and reading
//      it is reading the card. It covers every declared role, including ones the
//      fixture chart's content happens not to render.
//   2. FLAT RENDERED TEXT comes from the DOM walk (`lib/card/domContrast.js`),
//      composited over the surface each run is actually drawn on. This is what
//      the table cannot do: a role's ground is `token.field` in the table, and on
//      the card the day-pillar cell paints a lighter solid over it.
//   3. COMPOSITED OVERLAYS — today, Card B's sheen — come from the measured
//      composite of `sheenGrounds()` under each rendered run.
//
// ALL THREE GATE THE EXIT CODE. Until 2026-08-17 only (1) did, and (3) printed
// its failures without counting them, so a token could print PASS on its summary
// line while "UNDER AA IN THE CORNER" sat twenty lines below in the same output
// and the process exited 0. **A comment describing a fix the file no longer
// performs is the same class of defect as that gate**, which is why the paragraph
// this replaced is gone: it claimed the roles-table version had been retired on
// 2026-08-13 and that `TEXT_ROLES` was consumed by nothing. Both were false.
//
// WHY (1) AND (2) BOTH RUN rather than one replacing the other: the table covers
// roles the content does not exercise, the DOM covers grounds the table cannot
// represent, and neither is a superset. `DIM_EXEMPT` is pinned by
// tests/card.spec.mjs to EXACTLY the roles with opacity < 1, which is what lets
// the DOM side apply the same exemption with `opacity === 1` and no role lookup.
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
  CardA, CardB, MIN_CONTRAST, AA_EXEMPT, DIM_EXEMPT, SHEEN_EXEMPT, TEXT_ROLES, roleStyle,
  paletteFor, brassTextFallbacks, brassTextWorst, sheenGrounds,
} from '../components/cards/Card.js';

/** What the INK holds on the same lit ground - the fallback's actual payoff. */
const inkWorstLit = (token) => Math.min(
  contrast(token.ink, token.field),
  ...sheenGrounds(token).map((g) => contrast(token.ink, g.ground)),
);

const { renderToStaticMarkup } = ReactDOMServer;

// One real chart, re-stemmed across all ten tokens: the point of this audit is
// the colour system, and holding the content fixed keeps the comparison clean.
const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

console.log(`WCAG AA, floor ${MIN_CONTRAST}. Three gates: flat roles, flat rendered text, sheen.`);
console.log(`${DIM_EXEMPT.length} of ${Object.keys(TEXT_ROLES).length} roles are DIM_EXEMPT (ruled 2026-08-14).`);
console.log('Their ratios are REPORTED, never skipped - the number stays visible.\n');

/**
 * A role's real ratio on a token, at the opacity and over the ground it is drawn.
 *
 * TAKES A CARD SURFACE since 2026-08-19, because `brassText` now differs between
 * them (Card A judges on the flat field, Card B on the sheen ground) and three
 * roles read it. Measuring one surface would leave the other's brass unaudited by
 * gate 1 entirely; `roleWorst` below runs both and keeps the worse.
 */
function roleRatio(role, token, card) {
  const palette = paletteFor(token, card);
  const s = roleStyle(role, palette);
  const ground = TEXT_ROLES[role].over === 'brass' ? palette.brass : token.field;
  return contrast(composite(s.color, ground, s.opacity), ground);
}

/** The worse of the two surfaces, so gate 1 cannot pass a role only one card draws well. */
function roleWorst(role, token) {
  const a = roleRatio(role, token, 'A');
  const b = roleRatio(role, token, 'B');
  return a <= b ? { ratio: a, card: 'A' } : { ratio: b, card: 'B' };
}

/**
 * A rendered run's WORST ratio once the sheen is under it.
 *
 * Takes the minimum across every stop rather than the largest alpha — see
 * `sheenGrounds`. The run's own ground wins where it has one: text on the
 * INTI DIRI pill or the day cell sits on a fill painted ABOVE the sheen, so the
 * wash cannot reach it and its flat ratio is the honest one.
 */
function sheenWorst(run, token) {
  if (run.ground !== token.field) return { ratio: run.ratio, alpha: 0 };
  let worst = { ratio: Infinity, alpha: 0 };
  for (const g of sheenGrounds(token)) {
    const ratio = contrast(composite(run.color, g.ground, run.opacity), g.ground);
    if (ratio < worst.ratio) worst = { ratio, alpha: g.alpha };
  }
  return worst;
}

let unexpected = 0;   // gate 1 - flat role colours, from the roles table
let renderedBad = 0;  // gate 2 - flat rendered text, from the DOM walk
let sheenBad = 0;     // gate 3 - the same text with Card B's sheen under it
const sheenReport = [];
const renderedReport = [];

for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  const data = { ...base, stem };
  // The DOM walk is not just a colour-resolution check: its RATIOS gate too.
  // `opacity === 1` is exactly "not DIM_EXEMPT" - pinned in tests/card.spec.mjs.
  const runs = [];
  for (const [card, C] of [['A', CardA], ['B', CardB]]) {
    for (const r of auditRendered(renderToStaticMarkup(React.createElement(C, { data })), token.field)) {
      runs.push({ ...r, card });
    }
  }
  const unresolved = runs.filter((r) => !/^#[0-9a-f]{6}$/i.test(r.color || ''));
  const full = runs.filter((r) => r.opacity === 1 && !unresolved.includes(r));

  const rated = Object.keys(TEXT_ROLES)
    .map((role) => ({ role, ...roleWorst(role, token), exempt: DIM_EXEMPT.includes(role) }))
    .sort((a, b) => a.ratio - b.ratio);
  const tokenExempt = AA_EXEMPT.includes(stem);
  const under = rated.filter((r) => r.ratio < MIN_CONTRAST && !r.exempt);
  if ((under.length && !tokenExempt) || unresolved.length) unexpected += under.length + unresolved.length;

  // GATE 2. Flat, no overlay, measured over the surface each run is drawn on.
  const flatUnder = full.filter((r) => r.ratio < MIN_CONTRAST);
  if (flatUnder.length && !tokenExempt) {
    renderedBad += flatUnder.length;
    for (const r of flatUnder) renderedReport.push({ stem, ...r });
  }

  // GATE 3. The sheen is CARD B ONLY, so only Card B runs are scored here.
  //
  // ── IT COUNTS TOKENS, NOT RUNS, AND THAT IS NOT ROUNDING ───
  // This script has no layout engine, so it applies the sheen's PEAK stop to
  // every run. That is a sound upper bound and a bad run count: the peak occurs
  // at one edge, and a pillar stem in the bottom third sits at alpha 0 in
  // reality. Counting runs would report 30 findings where the positional
  // measurement finds 6, and a gate that fires on text the overlay never reaches
  // is the `fact.relation_positions` failure wearing a different hat.
  //
  // At TOKEN granularity the cheap model and the positional one AGREE EXACTLY —
  // both name 甲 乙 丙 丁 戊 壬 and clear 己 庚 辛 癸 (probe run 2026-08-17). So the
  // token is the granularity this instrument has earned. `npm run probe:sheen`
  // is the positional instrument and it is where a per-run number comes from.
  const litUnder = full.filter((r) => r.card === 'B')
    .map((r) => ({ ...r, ...sheenWorst(r, token) }))
    .filter((r) => r.ratio < MIN_CONTRAST);
  // THE ROW IS RECORDED WHETHER OR NOT THE TOKEN IS EXEMPT; only the COUNT is
  // conditional. This is the same fix as 21d690a on the accent report, caught
  // again here on 2026-08-19 the moment SHEEN_EXEMPT stopped being empty: with
  // the push inside the `!exempt` branch, 乙 and 丙 printed "clears" in the sheen
  // section — a token that fails at 3.68 described as clearing, in the same run
  // whose summary line said it was exempt. An exemption suppresses the FAILURE,
  // never the NUMBER.
  if (litUnder.length) {
    sheenReport.push({ stem, runs: litUnder });
    if (!SHEEN_EXEMPT.includes(stem)) sheenBad += 1;
  }

  const worstFull = rated.filter((r) => !r.exempt)[0];
  const worstDim = rated.filter((r) => r.exempt)[0];
  // A TOKEN MAY NOT PRINT "PASS" WHILE ANY GATE HOLDS A FAILURE FOR IT. That was
  // the defect: the summary line answered only gate 1.
  const flags = [];
  if (unresolved.length) flags.push(`${unresolved.length} UNRESOLVED COLOUR`);
  if (under.length) flags.push(tokenExempt ? 'FAILS AA - known, Reyner to rule' : 'FAILS AA - role');
  if (flatUnder.length && !tokenExempt) flags.push(`FAILS AA - rendered x${flatUnder.length}`);
  // No run count here on purpose - see GATE 3. The count would be the peak-alpha
  // model's, and only the token is a claim this script can defend.
  if (litUnder.length) {
    flags.push(SHEEN_EXEMPT.includes(stem)
      ? 'sheen under AA - exempt, see SHEEN_EXEMPT'
      : 'FAILS AA - sheen');
  }
  console.log(
    `  ${stem}  ${token.approved ? 'LOCKED  ' : 'proposed'}  `
    + `worst full-opacity ${worstFull.ratio.toFixed(2).padStart(5)} (${worstFull.role})  `
    + `worst dimmed ${worstDim.ratio.toFixed(2).padStart(5)} (${worstDim.role})  `
    + `${runs.length} runs  ${flags.length ? flags.join(' | ') : 'PASS'}`,
  );
}

// ── §6.4 BRASS TEXT, MEASURED RATHER THAN ASSUMED ──────────
// The spec expected brass text to clear 4.5 comfortably on dark fields, with
// Taman the one risk. Where it fails, that token's brass text retreats to ink and
// brass stays on everything non-text. This is the report; nothing is substituted
// silently.
//
// ONE COLUMN PER CARD SINCE 2026-08-19, because the decision is now per card.
// `flat` is brass on the bare field and it is CARD A's whole test. `lit` is the
// worst of the field and every `sheenGrounds()` stop, and it is CARD B's. Four
// tokens pass A and fail B, which is exactly the split Reyner ruled: Card A is the
// free shareable card and it keeps its brass name.
//
// PRINTING BOTH IS THE POINT. A2 first shipped as one pooled answer, and a single
// column is what made "Card A pays for Card B's finish" invisible in this report.
{
  const failA = new Set(brassTextFallbacks(CARD_TOKENS, 'A').map((f) => f.stem));
  const failB = new Set(brassTextFallbacks(CARD_TOKENS, 'B').map((f) => f.stem));
  console.log('\nBRASS TEXT (spec §6.4 - per CARD, fallback to ink where it fails):');
  console.log('  Card A judges the flat field. Card B judges min(field, every sheen stop).');
  for (const [stem, token] of Object.entries(CARD_TOKENS)) {
    const brass = brassFor(token);
    const a = brassTextWorst(token, 'A');
    const b = brassTextWorst(token, 'B');
    const verdict = (fails, r) => (fails ? `INK (${r.toFixed(2)})` : `brass (${r.toFixed(2)})`).padEnd(13);
    console.log(
      `  ${stem}  ${inkIsDark(token) ? 'light' : 'dark '} field  ${brass.text}  `
      + `A ${verdict(failA.has(stem), a)}  B ${verdict(failB.has(stem), b)}  `
      + `${failB.has(stem) && !failA.has(stem) ? `SPLIT - brass on A, ink on B (ink holds ${inkWorstLit(token).toFixed(2)} lit)` : ''}`,
    );
  }
  const n = Object.keys(CARD_TOKENS).length;
  console.log(`  Card A: ${failA.size} of ${n} fall back.  Card B: ${failB.size} of ${n}.  `
    + `Split on ${[...failB].filter((s) => !failA.has(s)).join(' ') || 'none'}.`);
}

// ── THE SHEEN'S COST — MEASURED, GATED, AND STILL NOT APPLIED ──
// The sheen is ruled at 0.15 and nothing here changes it. What changed on
// 2026-08-17 is that its failures now COUNT.
//
// THREE THINGS THIS BLOCK USED TO GET WRONG, all of them the same shape — it
// modelled the sheen instead of reading it:
//   - it measured `token.ink`, but the text sitting in the lit band on a dark
//     field is the BRASS `nameId`, which starts far lower. Six tokens fail, not
//     two.
//   - it skipped every light-field token on the reasoning that white moves away
//     from a dark ink. True of the white stops, and the light branch also carries
//     a 7% BLACK stop at the far corner that nothing was measuring.
//   - it hard-coded `.15` as a second copy of a value that lives in `Card.js`.
//
// It now runs over the RENDERED runs and reads `sheenGrounds()`, so it measures
// the colours the card draws on the surfaces the sheen makes.
console.log('\nTHE SHEEN, CARD B (peak stop under full-opacity text - an UPPER BOUND):');
console.log('  positional truth is npm run probe:sheen; the two agree on WHICH tokens fail.');
for (const [stem, token] of Object.entries(CARD_TOKENS)) {
  const row = sheenReport.find((r) => r.stem === stem);
  const flat = contrast(token.ink, token.field);
  const head = `  ${stem}  ${inkIsDark(token) ? 'light' : 'dark '} field  ink flat ${flat.toFixed(2).padStart(5)}  `;
  if (!row) {
    console.log(`${head}clears`);
    continue;
  }
  const worst = row.runs.reduce((a, b) => (a.ratio < b.ratio ? a : b));
  console.log(
    `${head}UNDER AA, worst ${worst.ratio.toFixed(2)} `
    + `(${worst.color} at alpha ${worst.alpha}, "${worst.text.slice(0, 18)}")`
    + `${SHEEN_EXEMPT.includes(stem) ? '  - exempt, see SHEEN_EXEMPT' : ''}`,
  );
}

// ── FLAT RENDERED TEXT, where the ground is NOT the field ──
// The roles table cannot represent this: it grounds every non-brass role on
// `token.field`, and the day-pillar cell paints a lighter solid over it.
if (renderedReport.length) {
  console.log('\nFLAT RENDERED TEXT UNDER AA (no overlay - the ground is the defect):');
  for (const r of renderedReport) {
    console.log(
      `  ${r.stem}  Card ${r.card}  "${r.text.slice(0, 22)}"  ${r.color} on ${r.ground}  `
      + `= ${r.ratio.toFixed(2)}`,
    );
  }
}

// ── THE ACCENT FLOOR (the design doc's second finding) ─────
// A TOKEN report, not a card decision, and nothing in the card reads it. The bar
// is the LOCKED set's own worst case rather than WCAG: accent is decoration and
// large UI, which is what docs/content/sharecard-tokens-measure.mjs already says.
// Derived from the `approved: true` triples, so approving one moves it with no
// edit anywhere.
{
  const { floor, rows, under, below } = accentAudit(CARD_TOKENS);
  console.log(`\nACCENT ON FIELD (floor ${floor.toFixed(2)}, frozen at the 2026-08-13 measurement):`);
  for (const r of rows) {
    // BELOW and EXEMPT are printed separately on purpose. An exemption suppresses
    // the FAILURE, never the NUMBER or the fact — printing an excused token as if
    // it were clean is how a known problem stops being known.
    const state = r.below
      ? (r.exempt ? '  UNDER THE FLOOR - exempt, see ACCENT_EXEMPT' : '  UNDER THE FLOOR')
      : '';
    console.log(
      `  ${r.stem}  ${r.approved ? 'approved' : 'proposed'}  ${r.ratio.toFixed(2).padStart(5)}${state}`,
    );
  }
  console.log(`  ${below.length} below the floor, ${under.length} of them unexcused.`);
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

// ── THE VERDICT. EVERY GATE REACHES THE EXIT CODE ──────────
// The bug this replaces: `sheenBad`'s failures were printed and then dropped, so
// the process exited 0 on a card that fails AA. Any counter that prints a failure
// and does not appear on this line is the same bug again.
console.log('\nVERDICT');
console.log(`  roles      ${unexpected} under AA outside AA_EXEMPT (${AA_EXEMPT.join(', ') || 'none'})`);
console.log(`  rendered   ${renderedBad} full-opacity run(s) under AA on their real ground`);
console.log(`  sheen      ${sheenBad} token(s) with full-opacity text under AA outside SHEEN_EXEMPT (${SHEEN_EXEMPT.join(', ') || 'none'})`);
const failed = unexpected + renderedBad + sheenBad;
console.log(`  ${failed ? `FAIL - ${failed} finding(s)` : 'PASS'}`);
process.exitCode = failed ? 1 : 0;
