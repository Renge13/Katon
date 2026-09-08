#!/usr/bin/env node
// ============================================================
// scripts/check-unruled-copy.mjs — an unruled string may not reach production
// ============================================================
// Prompt Q commit 4. `UPCOMING_COPY` ships with every value stubbed, because
// Reyner is the sole authority on Indonesian register and had not ruled the
// wording, and holding the commit would have blocked commits 5 and 6 on it.
//
// This is the thing that makes a stub safe to ship. Without it, "we will fill
// those in later" is a sentence in a PR body, and a sentence in a PR body has
// never once stopped a deploy.
//
//   npm run check:unruled           report, exit 0    (the hold is legitimate)
//   npm run check:unruled -- --strict   refuse, exit 1
//
// ── WHERE THE LINE IS, AND WHY IT IS NOT "EVERY BUILD" ──
// Strict fires on a PRODUCTION build only: `--strict`, or `VERCEL_ENV=production`.
// PREVIEW AND LOCAL BUILDS PASS ON PURPOSE. Reyner cannot rule wording he cannot
// see, and this block is the only part of prompt Q a reader can look at; a gate
// that killed the preview build would block the exact review it exists to force,
// and the predictable result is that someone deletes the gate to get a link.
// Production is the line that matters - that is where a reader who is not Reyner
// would meet a placeholder.
//
// ── WHY IT IS NOT FOLDED INTO check-copy.js ──
// That script enforces rule 20 (keyboard characters only) over every copy bank
// and fails `npm test`. This one must NOT fail `npm test`, because the stub is a
// legitimate state of the branch for as long as the ruling is outstanding. Same
// shape, different verdict, so it is a different instrument.
// ============================================================

import { UNRULED_SOURCES } from '../lib/site/unruledScan.js';

// ── THIS SCRIPT NO LONGER NAMES A SINGLE BANK, 2026-09-08 ──
// It kept its own hand-written list, and that list was wrong three times in
// three days: COMPAT_COPY arrived with a sentinel and the gate reported
// `OK No unruled copy in 1 bank(s)` beside it; GLOSSARY.kompatibilitas arrived
// with 59 placeholders and it reported `OK ... 2 bank(s)` and exited 0; and
// before either, the gate had never executed on Vercel at all (COWORK-BRIEF row
// 46). Every fix widened the list and left the defect: **a gate that enumerates
// its subjects by name is blind to the next subject**, silently, in a way that
// reads as a pass.
//
// INVERTED. The banks register into `COPY_BANKS` at their definition sites and
// `lib/site/unruledScan.js` is the one place a scannable source is named. A new
// `*_COPY` export is scanned because it exists, and a spec fails if one is not
// registered. Adding a bank to this file is no longer possible, which is the
// point.

/** The marker `lib/site/copy.js`'s PENDING() stamps into every unruled value. */
export const SENTINEL = '@@UNRULED';

/**
 * Walk any structure and return every string still carrying the sentinel.
 * Exported so `tests/unruled-copy.spec.mjs` can exercise it on synthetic input
 * rather than only on the live bank - a detector that has only ever been pointed
 * at one object has not been shown to detect anything.
 *
 * @returns {Array<{path: string, value: string}>}
 */
export function scanUnruled(node, path = 'UPCOMING_COPY', found = []) {
  if (typeof node === 'string') {
    if (node.includes(SENTINEL)) found.push({ path, value: node });
    return found;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => scanUnruled(item, `${path}[${i}]`, found));
    return found;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      // ── UNDERSCORE KEYS ARE METADATA AND ARE SKIPPED, 2026-09-08 ──
      // `_README`, `_note` and `_rule` document the bank; they are never rendered
      // to anyone. The glossary's own `_README` EXPLAINS the sentinel and so
      // contains the literal `@@UNRULED@@`, which this scanner counted as an
      // unruled string - a detector matching its own documentation, and 1 of the
      // 59 it first reported.
      //
      // It is a real false positive rather than a cosmetic one: it would have
      // kept refusing production after every genuine string was ruled, and the
      // obvious fix at that point is to edit the README rather than to notice the
      // scanner is wrong.
      if (k.startsWith('_')) continue;
      scanUnruled(v, `${path}.${k}`, found);
    }
  }
  return found;
}

// ── CLI ──
// `import.meta.main` is not available on the Node versions this repo targets, so
// the check is the documented argv[1] comparison instead.
const invoked = process.argv[1] && process.argv[1].endsWith('check-unruled-copy.mjs');
if (invoked) {
  const strict = process.argv.includes('--strict') || process.env.VERCEL_ENV === 'production';
  const pending = Object.entries(UNRULED_SOURCES)
    .flatMap(([name, bank]) => scanUnruled(bank, name));

  if (pending.length === 0) {
    console.log(`OK No unruled copy in ${Object.keys(UNRULED_SOURCES).length} bank(s): ${Object.keys(UNRULED_SOURCES).join(', ')}.`);
    process.exit(0);
  }

  const how = strict ? 'REFUSING' : 'PENDING';
  console[strict ? 'error' : 'log'](
    `${how}: ${pending.length} string(s) are still unruled.\n`);
  for (const p of pending) console[strict ? 'error' : 'log'](`  ${p.path}\n    "${p.value}"`);

  if (strict) {
    console.error('\nReyner is the sole authority on Indonesian register (CLAUDE.md rule 20).');
    console.error('Replace every value listed above with his ruled wording, then rebuild.');
    console.error('This gate is production-only; preview and local builds are unaffected.');
    process.exit(1);
  }
  console.log('\nNot a failure: the block is deliberately stubbed while the ruling is open.');
  console.log('A production build refuses this (VERCEL_ENV=production, or --strict).');
}
