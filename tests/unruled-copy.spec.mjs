// ============================================================
// tests/unruled-copy.spec.mjs — the stub is allowed to exist, not to ship
// ============================================================
// Prompt Q commit 4 shipped `UPCOMING_COPY` with every value stubbed, because
// Reyner rules Indonesian register and had not ruled this block, and holding the
// commit would have blocked commits 5 and 6 behind a wording decision.
//
// HE RULED ALL ELEVEN ON 2026-08-31 AND EVERY ASSERTION HERE STAYED GREEN, which
// is what the section below predicted and the reason it was built that way. The
// file did not need editing to survive the event it exists for; one test was ADDED
// (PENDING still stamps a catchable sentinel), because passing is exactly the
// state in which a gate gets deleted as dead scaffolding.
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

import { UPCOMING_COPY, COMPAT_COPY, PENDING, COPY_BANKS } from '../lib/site/copy.js';
import * as copyModule from '../lib/site/copy.js';
import { UNRULED_SOURCES } from '../lib/site/unruledScan.js';
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
  // `thanks` was replaced and SPLIT into these two on 2026-09-01 - one receipt for
  // the tap, one for the contact submit. Both are required: a missing one is a
  // moment that confirms nothing, which is the defect the split exists to fix.
  'interestNoted', 'contactSent', 'contactLabel', 'contactSubmit',
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

test('PENDING still produces a sentinel the detector catches', () => {
  // THE GATE MUST SURVIVE ITS OWN SUCCESS. With all eleven slots ruled, nothing
  // calls PENDING and the strict gate passes - which is exactly the state in which
  // someone deletes both as dead scaffolding. The ruling's step 5 forbids that:
  // they are the gate for the NEXT unruled string. A green gate that no longer
  // works is indistinguishable from a green gate that does, so this asserts the
  // mechanism end to end rather than trusting the silence.
  const stub = PENDING('a future unruled slot');
  assert.ok(stub.includes(SENTINEL), 'PENDING must still stamp the sentinel');
  const found = scanUnruled({ someFutureBank: { slot: stub } }, 'X');
  assert.deepEqual(found.map((f) => f.path), ['X.someFutureBank.slot']);
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
  // `compat` LEFT THIS BLOCK 2026-09-08: it is for sale now, and `Upcoming`
  // advertises what is not. Its two ruled strings were deleted rather than moved
  // to the front-door card - they were ruled for a not-for-sale teaser, and
  // whether they fit a card that sells is Reyner's call.
  for (const product of ['annual']) {
    for (const slot of ['label', 'sub']) {
      const v = UPCOMING_COPY[product]?.[slot];
      assert.equal(typeof v, 'string', `${product}.${slot} must be a string`);
      assert.ok(v.trim().length > 0, `${product}.${slot} must not be empty`);
    }
  }
});

test('COMPAT_COPY carries its one slot, and it is RULED', () => {
  // INVERTED 2026-09-08, which is what the previous version of this test told the
  // next session to do: it asserted the slot must STAY a sentinel until Reyner
  // ruled it, and said "when he does, this assertion is the one to invert, and
  // the gate tests below will follow it". He ruled it. They did.
  //
  // The compat invoice description is the Xendit checkout line AND the buyer's
  // bank statement line, so rule 20 makes it chrome: keyboard characters only,
  // one composed voice. Same form as the artifact's approved `Katon - Complete
  // Edition`, so the two read alike on a statement.
  assert.equal(COMPAT_COPY.invoiceDesc, 'Katon - Compatibility Reading');
  assert.ok(!COMPAT_COPY.invoiceDesc.includes(SENTINEL), 'no sentinel survives');

  // Rule 20 on the string itself, not on the promise that someone checked it.
  assert.ok(!/[—–‘’“”…]/u.test(COMPAT_COPY.invoiceDesc),
    'keyboard characters only: no em-dash, en-dash, curly quote or ellipsis');
});

test('no price is hardcoded into the compat copy bank either', () => {
  // Same reason as UPCOMING_COPY's: a price typed into a copy bank is a second
  // source of truth for what a thing costs, and lib/pricing.js is the first.
  assert.ok(!/\d{2}[.,]?\d{3}/.test(JSON.stringify(COMPAT_COPY)),
    'a price-shaped number is in COMPAT_COPY; resolve it from lib/pricing.js instead');
});

test('no price is hardcoded into the copy bank', () => {
  // Guards against 39.000 / 79.000 being typed in beside the words when the
  // wording is ruled. lib/pricing.js is the only source of a price.
  const seen = JSON.stringify(UPCOMING_COPY);
  assert.ok(!/\d{2}[.,]?\d{3}/.test(seen),
    'a price-shaped number is in UPCOMING_COPY; resolve it from lib/pricing.js instead');
});

test('the production gate is wired into prebuild AND VERCEL ACTUALLY INVOKES IT', () => {
  // ── THIS TEST WAS WRONG FROM 2026-08-29 TO 2026-09-08 ─────
  // It asserted only that `package.json` defines a `prebuild` script, and stated
  // the other half in a COMMENT as though it were a checked fact: *"Vercel's
  // build command is `npm run build`"*. **It was not.** `vercel.json` has said
  // `"buildCommand": "next build"` since `8953008` (2026-07-07), which predates
  // this gate entirely - and `prebuild` is an npm LIFECYCLE hook. It runs before
  // `npm run build`. It does not run before `next build`.
  //
  // So the gate never executed on a single Vercel deploy, and this test stayed
  // green throughout, because it checked THAT THE SCRIPT EXISTED rather than THAT
  // THE PLATFORM INVOKED IT. Found 2026-09-08, when a production deploy that
  // should have been refused succeeded and served a live `@@UNRULED@@` invoice
  // description.
  //
  // The lesson is not "add a line". A guard's wiring has TWO ends, and the end
  // this repo can see - its own package.json - is not the end that decides
  // whether the guard runs.
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts?.prebuild, 'package.json must define a prebuild script');
  assert.match(pkg.scripts.prebuild, /check-unruled-copy\.mjs/,
    'prebuild must invoke the unruled-copy gate');

  // THE HALF THAT WAS MISSING. `next build` skips every npm lifecycle hook, so
  // the build command must go through npm for `prebuild` to fire at all.
  const vercel = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal(
    vercel.buildCommand, 'npm run build',
    'vercel.json buildCommand must be exactly "npm run build": `next build` skips '
    + 'npm lifecycle hooks, so `prebuild` - and therefore the unruled-copy gate - '
    + 'never runs. That was true on every deploy from 2026-08-29 to 2026-09-08.',
  );
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
  // EVERY BANK THE GATE SCANS. This serialised UPCOMING_COPY alone until
  // 2026-09-07, and COMPAT_COPY was added when it acquired a sentinel;
  // `GLOSSARY.kompatibilitas` joined on 2026-09-08. Each time, the oracle
  // computed 0 while the gate found placeholders, and the conditional below
  // asserted "must be allowed" against a refused build - loudly, which is the
  // only reason each was a two-line fix rather than a hole.
  //
  // ── AND IT DROPS METADATA KEYS, INDEPENDENTLY OF THE DETECTOR ──
  // The glossary's `_README` EXPLAINS the sentinel, so it contains the literal
  // string. `scanUnruled` skips `_`-prefixed keys for that reason. If this oracle
  // did not, it would agree with the gate today (both non-zero) and DISAGREE the
  // day every real string is ruled: the gate would allow the build and this would
  // still count 1 and demand a refusal.
  //
  // The replacer below is written here rather than imported, so this stays an
  // independent count. It shares the RULE with scanUnruled - skip `_` keys - and
  // none of its code, which is the property this function exists for.
  // ── IT NO LONGER NAMES THE BANKS EITHER, 2026-09-08 ──────
  // This list was widened twice for exactly the reason the GATE's list was, and
  // an oracle that has to be remembered is the same defect as a gate that has to
  // be remembered. It now enumerates `UNRULED_SOURCES` - the same registry the
  // gate reads - so the two cannot disagree about WHICH banks exist. They still
  // disagree about HOW to count, which is the whole point of the oracle: the
  // gate walks with `scanUnruled`, this serialises and substring-searches, and
  // they share no code.
  const stripped = JSON.stringify(
    Object.values(UNRULED_SOURCES),
    (key, value) => (key.startsWith('_') ? undefined : value),
  );
  return stripped.split(SENTINEL).length - 1;
}


test('EVERY *_COPY EXPORT IS REGISTERED, so the next bank cannot be invisible', () => {
  // ── THE ASSERTION THAT MAKES THE INVERSION STRUCTURAL ──────
  // Without it, `COPY_BANKS` is just a fourth hand-written list that happens to
  // live in a different file. This reflects over the module: anything exported
  // as `*_COPY` must be in the registry, so a bank added without registering it
  // fails here rather than being discovered by a placeholder reaching production.
  //
  // Three times in three days a new bank was invisible to the gate
  // (COMPAT_COPY 09-07, GLOSSARY.kompatibilitas 09-08, and the gate itself never
  // running on Vercel before that - COWORK-BRIEF row 46). This is the check that
  // ends the sequence.
  const exported = Object.keys(copyModule).filter((k) => k.endsWith('_COPY'));
  assert.ok(exported.length >= 3, `found ${exported.length} copy banks`);

  for (const name of exported) {
    assert.ok(name in COPY_BANKS, `${name} is exported but never register()ed`);
    assert.equal(COPY_BANKS[name], copyModule[name], `${name} registered the same object`);
  }

  // And nothing is registered that is not a bank.
  for (const name of Object.keys(COPY_BANKS)) {
    assert.ok(exported.includes(name), `${name} is registered but not exported as a bank`);
  }

  // The gate reads the registry plus the glossary, and nothing else.
  assert.deepEqual(
    Object.keys(UNRULED_SOURCES).sort(),
    [...exported, 'GLOSSARY.kompatibilitas'].sort(),
  );
});

test('SITE_COPY IS SCANNED NOW, and it was not before', () => {
  // A consequence worth asserting rather than discovering: the old hand list
  // never included the largest bank in the repo. It carries no sentinel today,
  // and if one is ever added to it the gate now refuses the build.
  assert.ok('SITE_COPY' in UNRULED_SOURCES);
  assert.ok(Object.keys(UNRULED_SOURCES).length >= 4);
});

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
