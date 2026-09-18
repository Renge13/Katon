// ============================================================
// tests/pair-checkout.spec.mjs — compat checkout and the paid flip
// ============================================================
// THE TWO THINGS THIS FILE EXISTS TO REFUSE:
//   1. a compat checkout that takes money without an email (ruling C), and
//   2. **a compat invoice flipping a `reading.paid`**, or the reverse.
//
// Rule 18: `paid` flips only in the verified provider notification, never from a client
// path. Compat adds a SECOND payable object, so the failure mode is new - one
// product's settled invoice granting access to another's. The amount check is
// per-SKU for exactly that reason, and the webhook's own header says a 19000
// artifact payment must not unlock a 39000 compat report.
//
// ── WHY THIS TESTS lib/pair/*, NOT THE ROUTE FILES ────────
// No spec in this repo imports an `app/api/**` route: Next's `@/` alias does not
// resolve under `node --test`, and every other handler lives in `lib/` with the
// route as a thin wrapper. The FIRST version of this spec tried to import both
// routes with a `.catch(() => ({ POST: null }))` fallback, which turned an
// unresolvable import into `pay is not a function` - a test that fails for the
// wrong reason is barely better than one that passes for the wrong reason. So the
// compat-specific logic was extracted to `lib/pair/checkout.js` and
// `lib/pair/settle.js`, which are importable, and the reading halves of both
// routes were left untouched.
//
// The cross-product invariant is still asserted for real, not by proxy:
// `settlePair` is called with a genuine pair row while a genuine reading row sits
// in the store, and the reading is checked afterwards. Plus a SOURCE-LEVEL guard
// that `markPairPaid` has exactly one call site, so no other path can flip a pair.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { SELLABLE_SKUS, isSellable, priceFor, SKUS } from '../lib/pricing.js';
import { COMPAT_COPY } from '../lib/site/copy.js';
import { compatEmail, resolveCheckoutTarget } from '../lib/pair/checkout.js';
import { settlePair } from '../lib/pair/settle.js';
import { createPair, getPair } from '../lib/pairStore.js';
import { createReading, getReading } from '../lib/readingStore.js';

const readingMem = (globalThis.__katonReadingMem ??= new Map());
const pairMem = (globalThis.__katonPairMem ??= new Map());

const ROOT = path.resolve(import.meta.dirname, '..');

beforeEach(() => {
  readingMem.clear();
  pairMem.clear();
});

const newPair = async (over = {}) => {
  const id = `pair-${Math.random().toString(36).slice(2, 10)}`;
  await createPair({
    id,
    a_birth_date: '1989-09-13', a_birth_time: '09:00',
    b_birth_date: '1990-03-04', b_birth_time: '14:00',
    sku: 'compat', paid: false, email: null, ...over,
  });
  return id;
};

test('compat is sellable, annual is not, and both are priced', () => {
  assert.deepEqual(SELLABLE_SKUS, ['artifact', 'compat']);
  assert.equal(isSellable('compat'), true);
  assert.equal(isSellable('annual'), false, 'annual is not built: nothing to deliver');
  assert.ok(SKUS.annual, 'and it is still PRICED - that is the whole point of the pair');
  assert.ok(priceFor('compat') > 0);
});

test('the compat invoice description is RULED, and rule 20 holds on it', () => {
  // Rule 20: a bank statement line is chrome, so it is Reyner's. This shipped as
  // an `@@UNRULED@@` sentinel on 2026-09-07 rather than as a guess - the
  // artifact's own description took three supersessions, two of them on exactly
  // this surface - and he ruled it on 2026-09-08.
  assert.equal(COMPAT_COPY.invoiceDesc, 'Katon - Compatibility Reading');

  // Keyboard characters only, asserted on the string rather than promised in a
  // comment. This is the value that reaches a real bank statement.
  assert.ok(!/[—–‘’“”…]/u.test(COMPAT_COPY.invoiceDesc),
    'no em-dash, en-dash, curly quote or ellipsis');

  // Same form as the artifact's approved line, so the two read alike.
  assert.match(COMPAT_COPY.invoiceDesc, /^Katon - /u);
});

// ── ruling C: the email ──

test('a compat checkout without a usable email is refused', () => {
  for (const raw of [undefined, null, '', '   ', 'nope', 'a@b', 'a@b.', '@example.com', 42, {}]) {
    const checked = compatEmail(raw);
    assert.equal(checked.error, 'email_required', JSON.stringify(raw));
    assert.equal(checked.email, null);
  }
});

test('a usable email is trimmed and stored, and never treated as a credential', () => {
  const checked = compatEmail('  buyer@example.com  ');
  assert.equal(checked.error, null);
  assert.equal(checked.email, 'buyer@example.com');

  // Ruling C is email-only IDENTITY: no password, no session, no login. The pair
  // id stays the bearer token, exactly as a reading id is. Nothing in the compat
  // modules imports a session or hashes anything.
  // CODE ONLY. The comments in those files QUOTE ruling C - "No passwords, login,
  // reset-password or sessions" - so a raw substring scan matches the very words
  // the rule is stated in. That is the "detector measuring its own vocabulary"
  // shape, and it fired here on the first run.
  const source = ['lib/pair/checkout.js', 'lib/pair/settle.js', 'lib/pairStore.js']
    .map((f) => readFileSync(path.join(ROOT, f), 'utf8'))
    .join('\n')
    .replace(/^\s*\/\/.*$/gmu, '')
    .replace(/\/\*[\s\S]*?\*\//gu, '');
  for (const forbidden of ['password', 'bcrypt', 'argon', 'createHash', 'session']) {
    assert.ok(!source.includes(forbidden), `no ${forbidden} in the pair's CODE`);
  }
});

// ── which object is being bought ──

test('a READING id presented as compat is refused, not resolved as a reading', () => {
  // The malformed-request case. A silent resolution is how a buyer ends up paying
  // the compat price against an artifact object.
  const target = resolveCheckoutTarget('compat', null, { id: 'r1', sku: 'artifact' });
  assert.equal(target.kind, 'error');
  assert.equal(target.error, 'compat_requires_pair');
  assert.equal(target.status, 400, 'a 400, not a 404: the request is wrong, not empty');
});

test('compat resolves the pair; every other sku resolves the reading', () => {
  const pairRow = { id: 'p1', sku: 'compat' };
  const readingRow = { id: 'r1', sku: 'artifact' };

  assert.deepEqual(resolveCheckoutTarget('compat', pairRow, null), { kind: 'pair', row: pairRow });
  assert.deepEqual(resolveCheckoutTarget('artifact', null, readingRow), { kind: 'reading', row: readingRow });

  // A pair id presented as an artifact does NOT resolve the pair - the sku
  // decides which table is read, so the pair is invisible to a non-compat sku.
  assert.equal(resolveCheckoutTarget('artifact', pairRow, null).kind, 'error');
  assert.equal(resolveCheckoutTarget('artifact', pairRow, null).status, 404);

  // Nothing anywhere resolves to 200 without a row.
  assert.equal(resolveCheckoutTarget('compat', null, null).status, 404);
});

// ── the paid flip ──

test('a verified paid callback flips pair.paid, once', async () => {
  const id = await newPair();
  const row = await getPair(id);
  assert.equal(row.paid, false);

  const first = await settlePair(id, row, true, priceFor('compat'));
  assert.deepEqual(first, { paid: true, reason: null });
  assert.equal((await getPair(id)).paid, true);
  assert.ok((await getPair(id)).paid_at, 'stamped');

  // Idempotent: a genuine provider double-fire reports false the second time, so a
  // once-only side effect could only ever run once.
  const second = await settlePair(id, await getPair(id), true, priceFor('compat'));
  assert.deepEqual(second, { paid: false, reason: 'already_paid' });
});

test('an unpaid status does not flip pair.paid', async () => {
  const id = await newPair();
  const out = await settlePair(id, await getPair(id), false, priceFor('compat'));
  assert.deepEqual(out, { paid: false, reason: 'not_paid' });
  assert.equal((await getPair(id)).paid, false);
});

test('THE WRONG AMOUNT DOES NOT UNLOCK, per SKU', async () => {
  const id = await newPair();
  // The artifact's price against a compat pair. This is the exact case the
  // webhook's header names: a 19000 artifact payment must not unlock compat.
  const out = await settlePair(id, await getPair(id), true, priceFor('artifact'));
  assert.deepEqual(out, { paid: false, reason: 'amount_mismatch' });
  assert.equal((await getPair(id)).paid, false);
});

test('FAIL-CLOSED: a null or unknown sku does not unlock', async () => {
  for (const sku of [null, undefined, 'nonsense']) {
    const id = await newPair({ sku });
    const out = await settlePair(id, await getPair(id), true, priceFor('compat'));
    assert.equal(out.paid, false, `sku=${sku} must not unlock`);
    assert.equal((await getPair(id)).paid, false);
  }
});

// ── the cross-product unlock, both directions ──

test('A COMPAT SETTLEMENT NEVER TOUCHES A reading.paid', async () => {
  await createReading({ id: 'some-reading', day_master: '丙', paid: false, sku: 'artifact' });
  const id = await newPair();

  await settlePair(id, await getPair(id), true, priceFor('compat'));

  assert.equal((await getPair(id)).paid, true, 'the pair settled');
  assert.equal((await getReading('some-reading')).paid, false, 'no reading was touched');
});

test('AND markPairPaid HAS EXACTLY ONE CALL SITE, so nothing else can flip a pair', () => {
  // The mirror of the above, and it is a source-level guard on purpose: the
  // reading webhook branch is a long function this spec cannot import, so rather
  // than proxy it, this asserts the only thing that actually matters - that the
  // pair's paid flip has one caller and it is lib/pair/settle.js.
  //
  // Rule 18's shape: `paid` flips in one place. With two payable objects there
  // are two such places, and each must still be exactly one.
  const hits = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!/\.(js|jsx|ts|mjs)$/u.test(entry)) continue;
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      if (rel.startsWith('tests/')) continue;
      const src = readFileSync(full, 'utf8');
      if (/\bmarkPairPaid\s*\(/u.test(src)) hits.push(rel);
    }
  };
  for (const dir of ['lib', 'app', 'components', 'scripts']) walk(path.join(ROOT, dir));

  assert.deepEqual(
    hits.sort(),
    ['lib/pair/settle.js', 'lib/pairStore.js'],
    'markPairPaid may be DEFINED in pairStore and CALLED from settle.js, nowhere else',
  );
});
