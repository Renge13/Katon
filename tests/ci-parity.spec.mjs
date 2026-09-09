// ============================================================
// tests/ci-parity.spec.mjs — a local green must mean CI is green
// ============================================================
// Addendum 1 of `docs/prompts/Y-ui-2.md`: "`npm test` must run the same set CI
// runs, or fail loudly when it cannot (second bite in two days)."
//
// This is the "fail loudly" half. `scripts/gate-plan.mjs` is the "same set"
// half, and both read ONE definition of the plan - a check that recomputed the
// plan its own way would be comparing two guesses and passing whenever they
// happened to agree.
//
// ── WHAT IT DOES NOT ASSERT, ON PURPOSE ────────────────────
// NOT that the two sets are equal. `npm test` is a strict superset and should
// be: it runs 54 suites CI never sees, and it gates `lint` that CI runs with
// `continue-on-error: true`. Being stricter locally costs a developer seconds
// and costs a merge nothing. The direction that hurts is the other one - CI
// running something `npm test` does not - because that is a green you acted on.
// So the assertion is one-directional and says so.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { buildPlan, ciScripts, KNOWN_NON_FAILING } from '../scripts/gate-plan.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};

test('CI RUNS NOTHING `npm test` DOES NOT', () => {
  const { plan } = buildPlan(ROOT, scripts);
  const ci = ciScripts(ROOT);

  // A CI step naming a script that does not exist is its own defect: the job
  // fails on every push and the name in the workflow is the only clue.
  const unknown = ci.filter((s) => !scripts[s]);
  assert.deepEqual(unknown, [],
    `the CI workflow runs npm scripts that package.json does not define: ${unknown.join(', ')}`);

  const uncovered = ci.filter((s) => !plan.includes(s));
  assert.deepEqual(uncovered, [],
    'CI gates on these and `npm test` does not run them, so a local green can sit in front of a '
    + `red merge: ${uncovered.join(', ')}`);
});

test('THE FORGE GATE IS IN THE PLAN, AND IT IS THERE BECAUSE CI RUNS IT', () => {
  // The concrete case that prompted all of this, pinned by name so a refactor
  // that drops the union term fails with the story rather than with a set diff.
  // `report:forge` is excluded by the `report:` prefix rule and included anyway,
  // because `scripts/forge-tests.mjs` ends `process.exit(fail === 0 ? 0 : 1)` -
  // it BLOCKS THE MERGE, whatever its name says about itself.
  const { plan, fromCi } = buildPlan(ROOT, scripts);
  assert.ok(ciScripts(ROOT).includes('report:forge'), 'CI still runs report:forge');
  assert.ok(plan.includes('report:forge'), '`npm test` runs report:forge');
  assert.ok(fromCi.includes('report:forge'),
    'and it is in the plan via the CI union, not by having been renamed into a gate prefix');

  assert.match(readFileSync(path.join(ROOT, 'scripts', 'forge-tests.mjs'), 'utf8'),
    /process\.exit\(/u, 'report:forge can actually fail; if it cannot, this whole test is theatre');
});

test('THE ENGINE REPORT STILL CANNOT FAIL, AND CI STILL TREATS IT AS A STEP', () => {
  // ── A KNOWN NO-OP, ASSERTED SO IT STAYS KNOWN ──────────────
  // `tests/bazi-engine.report.mjs` has no exit code, so CI's step named "Engine
  // validation report" is green whatever the engine prints. That is NOT fixed
  // here - giving it one is an engine decision with its own blast radius, and it
  // is not what this prompt asked for. It is pinned instead, in both directions:
  // if someone gives it an exit code, this goes red and tells them the step just
  // became a real gate that `npm test` must then run for the same reason
  // report:forge does.
  for (const name of KNOWN_NON_FAILING) {
    const file = scripts[name].match(/([\w./-]+\.mjs)/u)[1];
    const src = readFileSync(path.join(ROOT, file), 'utf8');
    assert.equal(/process\.exit|process\.exitCode/u.test(src), false,
      `${name} (${file}) now has an exit code, so it can fail. CI runs it as a step, which makes `
      + 'it a gate: add it to the plan and delete it from KNOWN_NON_FAILING.');
  }
});

test('THE WORKFLOW PARSER REFUSES WHAT IT CANNOT READ', () => {
  // ── THIS GUARD'S OWN FALSIFIER, WIRED IN ───────────────────
  // The parser reads single-line `run:` steps. A `run: |` block would leave it
  // holding a literal `|`, find no `npm run` in it, and report FEWER CI steps
  // than exist - which reads as "CI runs nothing new" and is the precise failure
  // this file exists to prevent, one level down. Exercised here against a
  // synthetic workflow rather than trusted, because a refusal nobody has seen
  // refuse is a refusal nobody knows is wired up.
  const fake = path.join(ROOT, 'tests', 'fixtures', 'ci-parity');
  assert.throws(() => ciScripts(fake), /block scalar/u,
    'a `run: |` step must throw, not silently parse to nothing');

  // And the happy path over the same fixture directory's sibling, so the throw
  // above is not just "this directory is broken in some way".
  assert.deepEqual(ciScripts(path.join(ROOT, 'tests', 'fixtures', 'ci-parity-ok')),
    ['lint', 'test:pillars']);
});
