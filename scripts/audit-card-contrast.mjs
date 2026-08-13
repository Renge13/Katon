#!/usr/bin/env node
// ============================================================
// scripts/audit-card-contrast.mjs — every text role against every token
// ============================================================
//   npm run audit:card-contrast
//
// Prints the whole grid worst-first, so the answer is not just "does it pass" but
// "which role is the binding constraint on which token" — the second question is
// the one that says what to change.
//
// `tests/card.spec.mjs` asserts the same numbers from the same module. This
// script exists because a failing assertion says one row and a colour decision
// needs the shape of the whole thing.
// ============================================================

import { auditContrast, contrast } from '../lib/card/contrast.js';
import { CARD_TOKENS } from '../lib/card/tokens.js';
import { TEXT_ROLES, BAND_TINT, MIN_CONTRAST, AA_EXEMPT } from '../components/cards/Card.js';

const rows = auditContrast(TEXT_ROLES, CARD_TOKENS, BAND_TINT);
const under = rows.filter((r) => r.ratio < MIN_CONTRAST);
const unexpected = under.filter((r) => !AA_EXEMPT.includes(r.stem));

console.log(`WCAG AA, floor ${MIN_CONTRAST}. ${rows.length} role x token pairs.\n`);

const byToken = {};
for (const r of rows) if (!byToken[r.stem] || r.ratio < byToken[r.stem].ratio) byToken[r.stem] = r;

console.log('worst role per token:');
for (const [stem, r] of Object.entries(byToken).sort((a, b) => a[1].ratio - b[1].ratio)) {
  const lock = CARD_TOKENS[stem].approved ? 'LOCKED  ' : 'proposed';
  const state = r.ratio >= MIN_CONTRAST ? 'PASS'
    : AA_EXEMPT.includes(stem) ? 'FAILS AA - known, Reyner to rule' : 'FAILS AA - UNEXPECTED';
  console.log(`  ${stem}  ${lock}  ${r.ratio.toFixed(2).padStart(5)}  ${r.role.padEnd(13)} ${state}`);
}

// THE ESCALATION. These two cannot reach AA at any opacity, so the fix is a token
// change and the token is not this file's to make. Both minimums were solved
// numerically: the smallest edit on the existing hue that reaches 4.5.
console.log('\nCANNOT REACH AA AT ANY OPACITY - this is the decision, not a bug:');
for (const stem of AA_EXEMPT) {
  const t = CARD_TOKENS[stem];
  console.log(`  ${stem}  ${CARD_TOKENS[stem].approved ? 'LOCKED' : 'proposed'}  field ${t.field}  ink ${t.ink}  =  ${contrast(t.ink, t.field).toFixed(2)}`);
}
console.log('  minimum changes measured 2026-08-13:');
console.log('    丙 Matahari  darken field to #CC3F0E, keep ink       -> 4.53');
console.log('    丙 Matahari  OR keep field, flip to dark ink #4A1705 -> 4.51');
console.log('    戊 Gunung    darken field to #896B3D, keep ink       -> 4.53');

console.log(`\n${under.length} pair(s) under AA; ${unexpected.length} outside the known list.`);
if (unexpected.length) {
  for (const r of unexpected) console.log(`  UNEXPECTED  ${r.stem} ${r.role} ${r.ratio.toFixed(2)}`);
}
process.exitCode = unexpected.length ? 1 : 0;
