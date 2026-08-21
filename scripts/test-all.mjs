#!/usr/bin/env node
// ============================================================
// scripts/test-all.mjs — everything that is pass/fail, in one command
// ============================================================
//   npm test
//   npm test -- --list        print what would run, run nothing
//
// ── THE DEFECT THIS EXISTS FOR ─────────────────────────────
// There was no aggregate command, so a pre-flight "full suite" run on 2026-08-19
// executed FOUR of twenty checks and reported green. Nothing was wrong with the
// four; the problem is that a suite you have to assemble by hand is a suite that
// gets assembled wrong, quietly, by whoever is in a hurry.
//
// ── WHY IT READS package.json INSTEAD OF LISTING FILES ─────
// A hard-coded list here would be a SECOND source of truth for which tests exist,
// and it would drift the first time someone adds `test:something` and forgets this
// file. That is the same class of defect as the one above, one layer down. So the
// selector is `^test:` over the scripts block: **adding a `test:*` script enrols it
// in `npm test` automatically, and there is no list to forget to update.**
//
// ── THE EXCLUSION, VERIFIED RATHER THAN ASSERTED (2026-08-19) ──
// "These two are only reports" is a claim a future session will re-litigate, so the
// command that settles it lives here with its output:
//
//     grep -rln "bazi-validation.fixture" tests/     -> 13 files
//
// Eleven of the thirteen are inside the 24 gates: badge-anchors (test:badges),
// card, joey-bars, palaces, punishment, stage3-contract, stage3-facts (test:stage3),
// stage3-hierarchy, stage5-render, stage6-validation, time-convention
// (test:pillars). So **excluding report:engine removes a PRINTOUT, not the
// fixture's safety net** - the 13-chart fixture is still asserted against by eleven
// gated specs, and a regression in it fails `npm test` eleven different ways.
//
// TWO CORRECTIONS TO THE APPROVED VERSION OF THIS CLAIM, kept because a rounded
// number is how a verified fact turns back into a remembered one:
//   - it is 13 files and ELEVEN gated specs, not nine. `stage3-facts.spec.mjs` and
//     `time-convention.spec.ts` were missing from the list. The conclusion is
//     stronger than it was stated, not weaker.
//   - `tests/bazi-profile-experiment.mjs` consumes the fixture and is run by NO
//     npm script at all (checked against every `scripts` entry, not just `test:*`).
//     It is the 13th file and it is neither a gate nor a report. Left alone here;
//     it wants its own decision - delete it, or give it a `report:` name.
//
// THAT IS WHY THE `report:` PREFIX IS LOAD-BEARING, not cosmetic.
// `tests/bazi-engine.report.mjs` and `scripts/forge-tests.mjs` print findings for a
// human and do not gate. While they were called `test:engine` and `test:forge` they
// sat in the namespace this selector reads, so excluding them would have meant a
// hard-coded exception list — a comment explaining why two entries are skipped,
// which is exactly the kind of note that stops being true. Renamed to `report:*`,
// the distinction is in the NAME and the selector needs no exception at all.
//
// ── WHY THE AUDITS RUN INSIDE THIS AND NOT BESIDE IT ───────
// Ruled 2026-08-19. They gate on colour rulings rather than on behaviour, which is
// a real difference and an argument for separating them. It loses to a simpler
// fact: of two commands, the one that gets forgotten is always the second. A token
// edit that breaks contrast SHOULD fail the build, and that is the audit doing its
// job rather than a category error.
// ============================================================

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};

/**
 * The non-`test:` gates, named explicitly because there is no prefix that groups
 * them. Each one FAILS on a real defect rather than printing an observation:
 * `lint` and `typecheck` are self-evident, `check:copy` enforces rule 20's
 * keyboard-characters-only line on the copy banks, and the two audits enforce the
 * card's contrast rulings and its content budget.
 */
const EXTRA_GATES = ['lint', 'typecheck', 'check:copy', 'audit:card-contrast', 'audit:card-budget'];

// `^test:` and nothing cleverer. `test` itself does not match, so this cannot
// recurse; `report:*` does not match, which is the whole point of that prefix.
const suites = Object.keys(scripts).filter((s) => s.startsWith('test:')).sort();
const missing = EXTRA_GATES.filter((g) => !scripts[g]);
if (missing.length) {
  console.error(`test-all: package.json has no script named ${missing.join(', ')}.`);
  console.error('Either it was renamed and this list was not, or it was deleted. Fix one of the two.');
  process.exit(2);
}

const plan = [...suites, ...EXTRA_GATES];

if (process.argv.includes('--list')) {
  console.log(`${plan.length} gates:\n${plan.map((s) => `  ${s}`).join('\n')}`);
  // The orphan scan runs here too, so it can be checked in a second instead of by
  // sitting through 24 gates. That is not a convenience: a guard nobody can exercise
  // cheaply is a guard nobody verifies, and this one was first "verified" by a run
  // that had stashed the guard itself along with the change under test.
  const { orphans, scanned } = orphanTestFiles();
  console.log(`\norphan scan: ${orphans.length} of ${scanned} code files in tests/ are unreferenced`
    + `${orphans.length ? `\n${orphans.map((o) => `  tests/${o}`).join('\n')}` : ''}`);
  process.exit(0);
}

// A guard against this file silently becoming a no-op. If the selector ever stops
// matching - a renamed prefix, a restructured scripts block - `npm test` would
// print "0 failed" and exit 0, which is the worst possible failure for this file
// in particular: it is the thing everything else is checked by.
if (suites.length < 15) {
  console.error(`test-all: only ${suites.length} test:* scripts matched, which is too few to be right.`);
  console.error('The selector has stopped seeing the suites. Refusing to report a green run.');
  process.exit(2);
}

/**
 * ── THE ORPHAN SCAN: a file in tests/ that nothing calls ────
 *
 * Added 2026-08-19, after `tests/bazi-profile-experiment.mjs` was found by hand:
 * 140 lines, zero assertions, run by no script, sitting in `tests/` for weeks.
 * **A file nothing calls is the same defect class as a selector that stopped
 * matching** — both report coverage that does not exist — so it belongs in the same
 * runner as the `suites.length < 15` guard above.
 *
 * THREE WAYS A FILE IS LEGITIMATELY REACHED, and all three count:
 *   1. a package.json script names it (a gate, or a `report:`)
 *   2. another file imports it (a fixture or a helper — `bazi-validation.fixture.js`
 *      is imported by twelve specs and run by nothing, which is correct)
 *   3. it is a non-code file (fixture JSON and the like)
 * Anything else is an orphan.
 *
 * IT REPORTS AND DOES NOT FAIL, which is a deliberate line rather than a soft
 * option. Failing would break `npm test` in the window between creating a spec and
 * wiring its script — a window every new test passes through — and a guard that
 * fires during normal work is a guard people delete. It prints LAST, after the
 * summary, so it is the final thing on screen; and it prints nothing at all when
 * there are none, so it cannot become background noise. Making it fatal is a
 * one-line change if that trade ever looks wrong.
 */
function orphanTestFiles() {
  const testsDir = path.join(ROOT, 'tests');
  const CODE = /\.(mjs|js|ts|jsx|tsx)$/;
  let entries;
  try {
    entries = readdirSync(testsDir, { withFileTypes: true });
  } catch {
    return { orphans: [], scanned: 0 };
  }
  const files = entries.filter((e) => e.isFile() && CODE.test(e.name)).map((e) => e.name);

  // Everything any script command mentions, by basename.
  const scriptText = Object.values(scripts).join('\n');

  // Everything the code tree imports, by basename. Deliberately a text scan over
  // the source rather than a module-graph walk: a real import cannot hide from it,
  // and it costs milliseconds. It over-forgives (a basename in a comment counts as
  // a reference) and never over-accuses, which is the right direction for a guard
  // that must not fire during normal work.
  const CODE_DIRS = ['tests', 'scripts', 'lib', 'app', 'components'];
  // THIS FILE IS EXCLUDED FROM ITS OWN CORPUS, and finding out why cost a round.
  // The comment above names `bazi-profile-experiment.mjs` as the file this guard was
  // built for - so on the first run the guard read its own documentation as a
  // reference and forgave the orphan. A guard that is blinded by the note explaining
  // it is worse than no guard. The runner invokes suites through npm scripts and
  // never by path, so it has no legitimate reference to lose by this.
  const SELF = path.join(ROOT, 'scripts', 'test-all.mjs');
  let corpus = '';
  const walk = (dir) => {
    let items;
    try { items = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      if (it.name === 'node_modules' || it.name.startsWith('.')) continue;
      const full = path.join(dir, it.name);
      if (full === SELF) continue;
      if (it.isDirectory()) walk(full);
      else if (CODE.test(it.name) || it.name.endsWith('.json') || it.name.endsWith('.yml')) {
        try { corpus += `\n<<${full}>>\n${readFileSync(full, 'utf8')}`; } catch { /* unreadable */ }
      }
    }
  };
  for (const d of CODE_DIRS) walk(path.join(ROOT, d));
  walk(path.join(ROOT, '.github'));

  const orphans = [];
  for (const name of files) {
    if (scriptText.includes(name)) continue;
    // Strip THIS file's own text before asking whether anything references it,
    // or every file trivially references itself.
    const self = `<<${path.join(ROOT, 'tests', name)}>>`;
    const at = corpus.indexOf(self);
    let others = corpus;
    if (at !== -1) {
      const end = corpus.indexOf('\n<<', at + self.length);
      others = corpus.slice(0, at) + (end === -1 ? '' : corpus.slice(end));
    }
    if (!others.includes(name)) orphans.push(name);
  }
  return { orphans, scanned: files.length };
}

console.log(`Running ${plan.length} gates (${suites.length} suites + ${EXTRA_GATES.length} other).\n`);

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const results = [];
for (const name of plan) {
  const started = Date.now();
  // `stdio: inherit` on purpose: a failing gate's own output is the thing the
  // reader needs, and capturing it to re-print a summary line loses the diff.
  // ── ONE COMMAND STRING, WITH A SHELL. Both halves are deliberate. ──
  // `shell: true` is required: `npm.cmd` is a batch file and spawning it without a
  // shell fails outright on Windows - measured, every gate returning in 0ms with a
  // spawn error, which is a 24-for-24 FAIL that looks nothing like a test failure.
  // But `shell: true` PLUS an args array earns DEP0190, a deprecation warning
  // printed after every run of the command every other check is trusted through.
  // The string form is the documented shape for a shell and warns about nothing.
  //
  // Interpolating `name` is safe here and not by luck: it comes from this repo's own
  // package.json, matched by `^test:`, and never from an argument or the network.
  const run = spawnSync(`${npm} run --silent ${name}`, { cwd: ROOT, stdio: 'inherit', shell: true });
  const code = run.status === null ? 1 : run.status;
  results.push({ name, code, ms: Date.now() - started });
  if (code !== 0) console.log(`\n>>> ${name} FAILED (exit ${code})\n`);
}

const failed = results.filter((r) => r.code !== 0);
const total = results.reduce((s, r) => s + r.ms, 0);

console.log(`\n${'='.repeat(60)}`);
for (const r of results) {
  console.log(`  ${r.code === 0 ? 'pass' : 'FAIL'}  ${String(r.ms).padStart(6)}ms  ${r.name}`);
}
console.log(`${'='.repeat(60)}`);
console.log(`${results.length - failed.length}/${results.length} passed in ${(total / 1000).toFixed(1)}s`);
if (failed.length) console.log(`FAILED: ${failed.map((r) => r.name).join(', ')}`);

// LAST, so it is the final thing on screen, and silent when there is nothing to say.
const { orphans, scanned } = orphanTestFiles();
if (orphans.length) {
  console.log(`\nORPHANS IN tests/ — ${orphans.length} of ${scanned} code files are run by no`);
  console.log('script and imported by nothing. An unrun file in tests/ reads as coverage that');
  console.log('does not exist. Wire it to a script, give it a report: name, or delete it.');
  for (const o of orphans) console.log(`  tests/${o}`);
  console.log('This does NOT fail the build - see orphanTestFiles() for why.');
}

process.exitCode = failed.length ? 1 : 0;
