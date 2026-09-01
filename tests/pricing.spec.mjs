// ============================================================
// tests/pricing.spec.mjs — the ladder, and the fence in front of it
// ============================================================
// Added 2026-08-29 with prompt Q commit 1. There was NO test file for
// `lib/pricing.js` before this, which is why `annual` could be added without
// anything failing: the SKU table is read by the checkout route and by the
// Xendit webhook, and both of those are security surfaces (rule 18).
//
// WHAT THIS FILE IS ACTUALLY GUARDING, and it is not the numbers. The numbers are
// Reyner's and they will change again - the launch tier is explicitly the test
// variable. What must NEVER drift is the relationship between three things:
//
//   1. a SKU having a PRICE                 (SKUS)
//   2. a SKU being SELLABLE                 (SELLABLE_SKUS)
//   3. an amount UNLOCKING a reading        (amountMatchesSku)
//
// Adding a price must not add a checkout, and adding a checkout must not widen
// what any other SKU's invoice accepts. Those two sentences are the whole file.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SKUS, LAUNCH_PRICING, SELLABLE_SKUS, DEFAULT_SKU,
  priceFor, isSellable, amountMatchesSku,
} from '../lib/pricing.js';

// ── THE LADDER, ruled 2026-08-29 ────────────────────────────
// docs/product/paid-product-map.md `## RULED 2026-08-29` is the authority.
// These assertions fail if a later pass "rounds" a price back to a pre-ruling
// value - the 49.000 case is called out in CLAUDE.md for exactly that reason.

test('the launch ladder is 19 / 39 / 79', () => {
  assert.equal(priceFor('artifact'), 19000);
  assert.equal(priceFor('compat'), 39000);
  assert.equal(priceFor('annual'), 79000);
});

test('the mature ladder is 29 / 49 / 99', () => {
  assert.equal(priceFor('artifact', { launch: false }), 29000);
  assert.equal(priceFor('compat', { launch: false }), 49000);
  assert.equal(priceFor('annual', { launch: false }), 99000);
});

test('LAUNCH_PRICING is the single lever, and it is still on', () => {
  // It does not move in September. If this fails, someone ended the launch
  // cohort, which is a pricing decision and not a refactor.
  assert.equal(LAUNCH_PRICING, true);
  // And the lever actually levers: every SKU reads differently under it.
  for (const sku of Object.keys(SKUS)) {
    assert.notEqual(
      priceFor(sku, { launch: true }),
      priceFor(sku, { launch: false }),
      `${sku} must have a real launch discount, or the lever is decorative`,
    );
  }
});

test('list is the anchor and never below launch', () => {
  // The mechanic in the file header: list anchors at the top and NEVER rises,
  // the discount moves. A launch price above list would invert the whole story.
  for (const [sku, entry] of Object.entries(SKUS)) {
    assert.ok(
      entry.launch < entry.list,
      `${sku}: launch ${entry.launch} must sit below list ${entry.list}`,
    );
  }
});

// ── THE FENCE ───────────────────────────────────────────────

test('PRICING A THING IS NOT SELLING IT — compat and annual are priced and unsellable', () => {
  // THE ASSERTION THAT FAILS WITHOUT COMMIT 1's RESTRAINT. `annual` was added to
  // SKUS and deliberately left off SELLABLE_SKUS, because September's demand test
  // must SHOW both prices without either becoming purchasable.
  assert.ok(SKUS.compat, 'compat must be priced');
  assert.ok(SKUS.annual, 'annual must be priced');
  assert.equal(isSellable('compat'), false);
  assert.equal(isSellable('annual'), false);
});

test('exactly one SKU is sellable, and it is the artifact', () => {
  // Written as an EQUALITY, not a `.includes`, so adding a sellable SKU has to
  // be a deliberate edit to this line. `/api/pay` 400s on anything not in this
  // list (route.js: `if (!isSellable(sku)) return badRequest(...)`), so widening
  // it silently is how an unbuilt product starts taking money.
  assert.deepEqual(SELLABLE_SKUS, ['artifact']);
  assert.equal(isSellable('artifact'), true);
  assert.equal(DEFAULT_SKU, 'artifact');
  assert.ok(isSellable(DEFAULT_SKU), 'the default SKU must itself be sellable');
});

test('an unknown SKU is not sellable and has no price', () => {
  assert.equal(isSellable('household'), false);
  assert.equal(isSellable(''), false);
  assert.equal(isSellable(undefined), false);
  assert.throws(() => priceFor('household'), /Unknown SKU/);
});

// ── THE UNLOCK, and it must not widen ───────────────────────

test('ADDING SKUs DOES NOT WIDEN WHAT ANY ONE SKU ACCEPTS', () => {
  // Rule 18: the webhook validates the re-fetched invoice amount against this
  // table. Three prices now sit in one object, so the risk this commit
  // introduces is CROSS-SKU acceptance - an artifact unlocking because 39.000 or
  // 79.000 is "a valid Katon price". Every wrong pairing must be false.
  const skus = Object.keys(SKUS);
  for (const paid of skus) {
    for (const claimed of skus) {
      const ok = amountMatchesSku(priceFor(paid), claimed);
      if (paid === claimed) {
        assert.equal(ok, true, `${claimed} must accept its own price`);
      } else {
        assert.equal(
          ok, false,
          `${claimed} must REJECT ${paid}'s price (${priceFor(paid)})`,
        );
      }
    }
  }
});

test('the unlock fails closed on everything that is not a live price', () => {
  assert.equal(amountMatchesSku(19000, 'household'), false, 'unknown SKU');
  assert.equal(amountMatchesSku(undefined, 'artifact'), false, 'missing amount');
  assert.equal(amountMatchesSku('19000', 'artifact'), false, 'string amount');
  assert.equal(amountMatchesSku(NaN, 'artifact'), false, 'NaN');
  assert.equal(amountMatchesSku(Infinity, 'artifact'), false, 'Infinity');
  // The MATURE price must not unlock while the LAUNCH tier is live. A reader who
  // somehow paid 29.000 today did not pay today's price, and fail-closed means
  // the mismatch is investigated rather than silently honoured.
  assert.equal(amountMatchesSku(29000, 'artifact'), false, 'list price under launch tier');
});
