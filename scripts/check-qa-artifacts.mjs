#!/usr/bin/env node
// ============================================================
// scripts/check-qa-artifacts.mjs — the docs/qa naming rule and the index guard
// ============================================================
//   npm run check:qa
//
// TWO CHECKS, both of which failed in practice before they existed.
//
// ── 1. NO TWO ARTIFACTS MAY DIFFER ONLY BY A PLURAL, A SUFFIX LETTER OR A VERSION DIGIT ──
// Ruled by Reyner 2026-08-22, and the reason is not tidiness:
//
//   docs/qa/2026-08-22-renders-n10-postfix.md
//   docs/qa/2026-08-22-renders-n10-postfixes.md
//
// One `s`. Two different traces, two different floor rates, and it sent him to the
// WRONG FILE while forming a sell/no-sell verdict. An artifact nobody can name
// unambiguously is an artifact nobody can cite, and a citation that resolves to the
// wrong evidence is worse than a missing one - the argument still completes.
//
// ── WHY IT IS ENFORCED HERE AND NOT IN A CONVENTION DOC ──
// Same reason the harness refuses to overwrite evidence rather than documenting that
// it should not: a naming convention in a doc is a naming convention nobody reads at
// the moment they are choosing a filename. This runs in `npm test`.
//
// It does NOT rename anything. The existing collision is grandfathered by an explicit
// allowlist with its reason, because renaming a cited artifact breaks the citations
// that make it evidence - and the whole point of the rule is that citations resolve.
//
// ── 2. EVERY ARTIFACT APPEARS IN docs/qa/README.md ──
// A hand-written index is the only kind that can say what question an artifact
// answers, and a hand-written index goes stale the first time somebody adds a file.
// So the CONTENT is written by a person and the COVERAGE is checked by this.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA = path.join(ROOT, 'docs', 'qa');
const INDEX = path.join(QA, 'README.md');

/**
 * Collisions that predate the rule and are KEPT.
 *
 * Each entry needs a reason, and "it is annoying to rename" is not one. The only
 * accepted reason is that renaming would break existing citations, which is the
 * property the rule exists to protect.
 */
const GRANDFATHERED = [
  {
    // STEMS, not filenames: the singular .md collides with BOTH the plural .md and
    // its .json sibling, and one ruling should not need two rows.
    stems: ['2026-08-22-renders-n10-postfix', '2026-08-22-renders-n10-postfixes'],
    why: 'THE PAIR THAT CAUSED THE RULE. Both are cited from PROGRESS and from the '
      + 'route header; renaming either breaks a citation in a ledger that is itself the '
      + 'record of why the rule exists. The README disambiguates them by question, which '
      + 'is the repair that does not cost a citation.',
  },
];

/** Extension off, lowercased. The .md and .json of one artifact share this. */
const stemOf = (name) => name.toLowerCase().replace(/\.(md|json)$/, '');

/**
 * Do these two names differ ONLY by a plural, a suffix letter, or a version digit?
 *
 * ── PAIRWISE, NOT BY NORMAL FORM, AND THE FIRST CUT GOT THIS WRONG ──
 * The obvious implementation normalises each name by stripping all three things and
 * buckets the matches. It produced a FALSE POSITIVE immediately:
 *
 *   2026-08-21-renders.md   and   2026-08-21-renders-n10.md
 *
 * both normalise to `...render` once you strip a trailing digit run, then the
 * trailing `-n`, then the plural. But `-n10` is the SAMPLE SIZE - the single most
 * important thing about that artifact, and the difference between a measurement that
 * could be made and one that could not. Flagging it would have taught whoever hit the
 * check that the rule is noise.
 *
 * Reyner's wording is "differ ONLY by", which is a statement about a PAIR. So the
 * pair is compared: strip one suffix from the longer name and ask whether the two
 * become equal. Nothing is stripped from both, and nothing is stripped twice.
 */
export function collides(a, b) {
  const [short, long] = stemOf(a).length <= stemOf(b).length
    ? [stemOf(a), stemOf(b)] : [stemOf(b), stemOf(a)];
  if (short === long) return null;

  // A plural: `postfix` vs `postfixes`, or `render` vs `renders`.
  if (long === `${short}s` || long === `${short}es`) return 'a plural';
  // A version suffix: `-v2`, `-v10`, or a bare trailing digit run behind a separator.
  if (new RegExp(`^${escape(short)}[-_]?v?\\d+$`).test(long)) return 'a version digit';
  // A single trailing letter behind a separator: `-a`, `_b`.
  if (new RegExp(`^${escape(short)}[-_][a-z]$`).test(long)) return 'a suffix letter';
  return null;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The check itself.
 *
 * ── IT IS A FUNCTION BECAUSE `collides` IS IMPORTED BY THE HARNESS ──
 * `scripts/qa-renders.mjs` imports `collides` so the write-time guard and this
 * build-time check cannot disagree about what a collision IS. Importing from a script
 * whose body runs at module scope would have run this whole check - and its
 * `process.exit(1)` - as a side effect of starting a render run. One implementation,
 * two callers, and only one of them executes.
 */
function main() {
  const files = fs.readdirSync(QA)
    .filter((f) => /\.(md|json)$/.test(f) && f !== 'README.md')
    .sort();

  const problems = [];

  // ── 1. the naming rule ──
  const allowed = new Set(GRANDFATHERED.map((g) => [...g.stems].sort().join('|')));
  const seen = new Set();

  for (const a of files) {
    for (const b of files) {
      if (a >= b) continue;
      // A .md and its .json sibling are ONE artifact in two forms, not two artifacts.
      // Sharing a stem is what makes the pair findable, so it is never a collision.
      if (stemOf(a) === stemOf(b)) continue;

      const how = collides(a, b);
      if (!how) continue;

      const signature = [stemOf(a), stemOf(b)].sort().join('|');
      if (allowed.has(signature) || seen.has(signature)) continue;
      seen.add(signature);

      problems.push(`NAMING: ${a} and ${b} differ only by ${how}.\n`
        + '        Ruled 2026-08-22: name an artifact for what it MEASURES, not for which\n'
        + '        attempt it was. `postfix` vs `postfixes` sent Reyner to the wrong file.\n'
        + '        If renaming would break a citation, add the pair to GRANDFATHERED with\n'
        + '        that reason - a citation that cannot resolve is the thing this protects.');
    }
  }

  // ── 2. the index ──
  if (!fs.existsSync(INDEX)) {
    problems.push(`INDEX: docs/qa/README.md does not exist. Every artifact needs a row saying what `
      + 'question it answers, the prompt and gate it was made under, and what supersedes it.');
  } else {
    const index = fs.readFileSync(INDEX, 'utf8');
    const missing = files.filter((f) => !index.includes(f));
    if (missing.length) {
      problems.push(`INDEX: ${missing.length} artifact(s) are not in docs/qa/README.md:\n`
        + missing.map((f) => `          ${f}`).join('\n')
        + '\n        Add a row: what question it answers, its prompt and gate, and SUPERSEDED BY '
        + 'if a successor exists.');
    }
    // And the reverse: a row for a file that is gone is a citation that cannot resolve.
    const listed = [...index.matchAll(/`?(2026-\d\d-\d\d-[A-Za-z0-9._-]+\.(?:md|json))`?/g)]
      .map((m) => m[1]);
    const orphaned = [...new Set(listed)].filter((f) => !files.includes(f)
      && !fs.existsSync(path.join(QA, 'superseded', f)));
    if (orphaned.length) {
      problems.push(`INDEX: ${orphaned.length} row(s) name a file that is in neither docs/qa/ nor `
        + `docs/qa/superseded/:\n${orphaned.map((f) => `          ${f}`).join('\n')}`);
    }
  }

  if (problems.length) {
    console.error(`docs/qa: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  - ${p}\n`);
    process.exit(1);
  }

  const supersededCount = fs.existsSync(path.join(QA, 'superseded'))
    ? fs.readdirSync(path.join(QA, 'superseded')).filter((f) => /\.(md|json)$/.test(f)).length
    : 0;
  console.log(`OK ${files.length} artifact(s) indexed, ${supersededCount} superseded, `
    + `${GRANDFATHERED.length} grandfathered name collision(s).`);
}

// Run only when invoked directly, never on import.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
