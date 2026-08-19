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
import { readFileSync } from 'node:fs';
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
process.exitCode = failed.length ? 1 : 0;
