// ============================================================
// scripts/gate-plan.mjs — what `npm test` runs, and what CI runs
// ============================================================
// One module because these two sets must be comparable, and they were not: they
// were computed in two places that never met, so nothing could notice when they
// drifted apart. `scripts/test-all.mjs` builds its plan from here and
// `tests/ci-parity.spec.mjs` asserts the relationship from here, which is the
// only reason the assertion means anything.
//
// ── THE DEFECT, MEASURED 2026-09-09 ────────────────────────
// Addendum 1 of `docs/prompts/Y-ui-2.md` asked for this after a second local
// green was followed by a CI red in two days. The cause:
//
//   $ npm test          61 gates, all test:* plus seven named others
//   $ .github/workflows/bazi-accuracy.yml
//                       runs `npm run report:forge`, which `npm test` does not
//
// `report:*` is excluded from `npm test` ON PURPOSE - the prefix is what tells a
// printout from a gate, and that decision is sound. But CI does not care about
// the prefix: `scripts/forge-tests.mjs` ends `process.exit(fail === 0 ? 0 : 1)`,
// so a forge failure BLOCKS THE MERGE while `npm test` says 61/61. The prefix
// describes an intent; the exit code decides what happens. **CI is the authority
// on what blocks a merge, so anything CI runs is a gate by definition**, and the
// plan below takes the union rather than arguing with the naming.
//
// ── AND ONE CI STEP CANNOT FAIL AT ALL ─────────────────────
// `report:engine` (`tests/bazi-engine.report.mjs`) has no `process.exit` and no
// `exitCode` anywhere in it, so it returns 0 whatever it prints:
//
//   $ grep -n "exitCode\|process.exit" tests/bazi-engine.report.mjs   -> no match
//
// It is a printout CI runs in a step named "Engine validation report", and a
// green there means the file ran, not that the engine is right. That is not
// fixed here - making it fatal is an engine decision with its own blast radius,
// and this module's job is parity, not policy. It is asserted below as a KNOWN
// no-op so the claim is checked rather than remembered, and so that the day
// someone gives it an exit code, this tells them the step became real.
// ============================================================

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * The non-`test:` gates, named explicitly because there is no prefix that groups
 * them. Each one FAILS on a real defect rather than printing an observation:
 * `lint` and `typecheck` are self-evident, `check:copy` enforces rule 20's
 * keyboard-characters-only line on the copy banks, `check:bytes` rejects stray
 * control bytes in tracked source, and the two audits enforce the card's
 * contrast rulings and its content budget.
 */
export const EXTRA_GATES = [
  'lint', 'typecheck', 'check:copy', 'check:bytes', 'check:qa',
  'audit:card-contrast', 'audit:card-budget',
];

/** `tests/bazi-engine.report.mjs` prints and never fails. Asserted, not assumed. */
export const KNOWN_NON_FAILING = ['report:engine'];

/**
 * Every npm script the CI workflows invoke.
 *
 * ── IT REFUSES RATHER THAN UNDER-REPORTING ─────────────────
 * A `run: |` block would leave this regex holding the literal `|` and silently
 * reporting fewer CI steps than there are - which is the exact shape of failure
 * this whole module exists to stop, one level down. So a block scalar throws.
 * Widen the parser when one appears; do not let it read as "CI runs nothing new".
 */
export function ciScripts(root) {
  const dir = path.join(root, '.github', 'workflows');
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  } catch {
    throw new Error('gate-plan: no .github/workflows directory. CI parity cannot be checked.');
  }
  if (!files.length) throw new Error('gate-plan: .github/workflows holds no workflow files.');

  const found = new Set();
  for (const file of files) {
    const text = readFileSync(path.join(dir, file), 'utf8');
    for (const m of text.matchAll(/^\s*(?:-\s*)?run:\s*(.+?)\s*$/gmu)) {
      const cmd = m[1];
      if (cmd === '|' || cmd === '>' || cmd.startsWith('|') || cmd.startsWith('>')) {
        throw new Error(
          `gate-plan: ${file} uses a block scalar for a \`run:\` step. This parser reads `
          + 'single-line commands only and would silently miss it. Widen the parser.',
        );
      }
      for (const s of cmd.matchAll(/npm run ([\w:.-]+)/gu)) found.add(s[1]);
      // `npx eslint` is the `lint` script by another name, and CI writes it the
      // long way. Mapped rather than special-cased at the call site.
      if (/npx eslint/u.test(cmd)) found.add('lint');
    }
  }
  return [...found].sort();
}

/**
 * What `npm test` runs: every `test:*` script, the named extra gates, and
 * ANYTHING CI RUNS THAT NEITHER GROUP ALREADY COVERS.
 *
 * The third term is the fix. `^test:` and nothing cleverer is still the selector
 * for the first - adding a `test:*` script enrols it automatically and there is
 * no list to forget - but a set built only from this repo's naming cannot see a
 * gate that CI added under a different prefix.
 */
export function buildPlan(root, scripts) {
  const suites = Object.keys(scripts).filter((s) => s.startsWith('test:')).sort();
  const missing = EXTRA_GATES.filter((g) => !scripts[g]);
  const ci = ciScripts(root).filter((s) => scripts[s]);
  const fromCi = ci.filter((s) => !s.startsWith('test:') && !EXTRA_GATES.includes(s));
  return { suites, extra: EXTRA_GATES, fromCi, missing, plan: [...suites, ...EXTRA_GATES, ...fromCi] };
}
