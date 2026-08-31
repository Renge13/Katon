// ============================================================
// tests/unruled-copy.spec.mjs — the stub is allowed to exist, not to ship
// ============================================================
// Prompt Q commit 4. `UPCOMING_COPY` ships with every value stubbed because
// Reyner rules Indonesian register and had not ruled this block, and holding the
// commit would have blocked commits 5 and 6 behind a wording decision.
//
// ── WHAT THIS FILE IS ACTUALLY ASSERTING ──
// NOT "the copy is correct" - nobody can assert that until Reyner rules it. It
// asserts the three things that make shipping a stub safe rather than hopeful:
//
//   1. THE DETECTOR DETECTS. `scanUnruled` is exercised on synthetic input, both
//      directions, so it is not a function that has only ever been pointed at one
//      object and pronounced working.
//   2. THE GATE IS WIRED. `prebuild` invokes it, so a production build runs it
//      without anyone remembering to.
//   3. THE GATE'S VERDICT MATCHES REALITY. Strict mode refuses exactly when
//      placeholders remain, and passes exactly when they do not.
//
// ── IT STAYS GREEN THROUGH REYNER'S EDIT, DELIBERATELY ──
// Every assertion here holds in BOTH states - all-stubbed today, all-ruled after
// he fills the bank. A spec that went red the moment the ruling landed would
// punish the exact edit it exists to invite, and the person hitting that red
// would fix it by deleting the spec. The state change is enforced by the
// production gate, which is where a hold belongs; this file protects the gate.
//
// The one thing it does check about the CONTENT is that no price lives in the
// bank. Prices resolve from lib/pricing.js at render time, and a number typed
// into a copy bank is a second source of truth for what a thing costs.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { UPCOMING_COPY } from '../lib/site/copy.js';
import { scanUnruled, SENTINEL } from '../scripts/check-unruled-copy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The slots the block needs to render at all. Commit 4 builds the structure and
 * commits 5-6 depend on it existing, so a missing slot is a build break rather
 * than a wording question - which is why the SHAPE is asserted while the WORDS
 * are not.
 */
const REQUIRED = [
  'eyebrow', 'lead', 'availability', 'interestCta',
  'thanks', 'contactLabel', 'contactSubmit',
];

test('the detector finds a sentinel at any depth', () => {
  const found = scanUnruled({
    a: `${SENTINEL}: one@@`,
    b: { c: 'ruled and fine' },
    d: ['ruled', `${SENTINEL}: two@@`],
  }, 'X');
  assert.equal(found.length, 2, 'should find both, including the one inside the array');
  assert.deepEqual(found.map((f) => f.path).sort(), ['X.a', 'X.d[1]']);
});

test('the detector is silent on copy that carries no sentinel', () => {
  const found = scanUnruled({
    a: 'Kamu dan Satu Orang',
    b: { c: 'Kecocokan, dibaca dari dua tanggal lahir.' },
    d: ['Belum tersedia'],
  }, 'X');
  assert.deepEqual(found, [], 'a clean bank must produce no findings');
});

test('every required slot exists and is a non-empty string', () => {
  for (const slot of REQUIRED) {
    assert.equal(typeof UPCOMING_COPY[slot], 'string', `${slot} must be a string`);
    assert.ok(UPCOMING_COPY[slot].trim().length > 0, `${slot} must not be empty`);
  }
  for (const product of ['compat', 'annual']) {
    for (const slot of ['label', 'sub']) {
      const v = UPCOMING_COPY[product]?.[slot];
      assert.equal(typeof v, 'string', `${product}.${slot} must be a string`);
      assert.ok(v.trim().length > 0, `${product}.${slot} must not be empty`);
    }
  }
});

test('no price is hardcoded into the copy bank', () => {
  // Guards against 39.000 / 79.000 being typed in beside the words when the
  // wording is ruled. lib/pricing.js is the only source of a price.
  const seen = JSON.stringify(UPCOMING_COPY);
  assert.ok(!/\d{2}[.,]?\d{3}/.test(seen),
    'a price-shaped number is in UPCOMING_COPY; resolve it from lib/pricing.js instead');
});

test('the production gate is wired into prebuild', () => {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  // `prebuild` and not a CI step: npm runs it before `build` with nothing to
  // remember, and Vercel's build command is `npm run build`.
  assert.ok(pkg.scripts?.prebuild, 'package.json must define a prebuild script');
  assert.match(pkg.scripts.prebuild, /check-unruled-copy\.mjs/,
    'prebuild must invoke the unruled-copy gate');
});

/**
 * GROUND TRUTH, COMPUTED WITHOUT `scanUnruled`.
 *
 * This exists because the first version of the strict test asked the gate and the
 * expectation the SAME question through the SAME function - so neutering
 * `scanUnruled` made both sides agree on zero and the test stayed green while the
 * detector was dead. That is the "passes whether the feature exists or not" shape
 * the 2026-08-26 convention was written about, caught by running the neuter demo
 * the convention requires. A raw substring search over the serialised bank shares
 * no code with the detector it is checking.
 */
function pendingByRawSearch() {
  return JSON.stringify(UPCOMING_COPY).split(SENTINEL).length - 1;
}

test('strict mode refuses exactly when placeholders remain', () => {
  const pending = { length: pendingByRawSearch() };
  const run = spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'check-unruled-copy.mjs'), '--strict'],
    { cwd: ROOT, encoding: 'utf8' });

  if (pending.length > 0) {
    assert.equal(run.status, 1,
      'placeholders are present, so a production build must be refused');
    assert.match(run.stderr, /REFUSING/);
  } else {
    assert.equal(run.status, 0,
      'the bank is fully ruled, so a production build must be allowed');
  }
});

test('a production build is refused via VERCEL_ENV alone, with no flag', () => {
  const pending = { length: pendingByRawSearch() };
  const run = spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'check-unruled-copy.mjs')],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, VERCEL_ENV: 'production' } });
  assert.equal(run.status, pending.length > 0 ? 1 : 0);
});

test('a PREVIEW build is allowed through even while stubbed', () => {
  // Deliberate, and the reason is in the gate's header: Reyner cannot rule
  // wording he cannot see, and this block is the only part of prompt Q a reader
  // can look at. A gate that killed the preview would block its own review.
  const run = spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'check-unruled-copy.mjs')],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, VERCEL_ENV: 'preview' } });
  assert.equal(run.status, 0, 'a preview build must never be blocked by unruled copy');
});
