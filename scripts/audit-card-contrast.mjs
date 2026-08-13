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

import { auditContrast } from '../lib/card/contrast.js';
import { CARD_TOKENS } from '../lib/card/tokens.js';
import { TEXT_ROLES, BAND_TINT, MIN_CONTRAST } from '../components/cards/Card.js';

const rows = auditContrast(TEXT_ROLES, CARD_TOKENS, BAND_TINT);
const failing = rows.filter((r) => r.ratio < MIN_CONTRAST);

console.log(`floor ${MIN_CONTRAST} (the locked set's own worst case, not a WCAG target)`);
console.log(`${rows.length} role x token pairs, worst 20:\n`);
for (const r of rows.slice(0, 20)) {
  const lock = CARD_TOKENS[r.stem].approved ? 'LOCKED  ' : 'proposed';
  const mark = r.ratio < MIN_CONTRAST ? ' <-- UNDER FLOOR' : '';
  console.log(`  ${r.stem}  ${lock}  ${r.role.padEnd(13)} ${r.ratio.toFixed(2)}${mark}`);
}

const byToken = {};
for (const r of rows) if (!byToken[r.stem] || r.ratio < byToken[r.stem].ratio) byToken[r.stem] = r;
console.log('\nworst role per token:');
for (const [stem, r] of Object.entries(byToken).sort((a, b) => a[1].ratio - b[1].ratio)) {
  console.log(`  ${stem}  ${r.ratio.toFixed(2)}  ${r.role}${CARD_TOKENS[stem].approved ? '  (LOCKED)' : ''}`);
}

console.log(`\n${failing.length} pair(s) under the floor.`);
process.exitCode = failing.length ? 1 : 0;
