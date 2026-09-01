// ============================================================
// SKU price table — the single source of truth for what anything costs
// ============================================================
// Prices: docs/product/launch-decisions.md §"Price architecture" (CONFIRMED by
// Reyner 2026-08-02, numbers and mechanic both).
//
// THE MECHANIC. List is the public anchor and NEVER rises; the launch price
// (harga peluncuran) is the only test variable. Two asymmetries drive it:
// raising a list price later is nearly impossible and discounting is free, so
// the list anchors at the top and the discount moves. And the discount is
// VISIBLE and cohort-wide, never a silent A/B — a discount is a story people
// accept, while a silent price difference screenshotted between friends reads
// as cheating.
//
// SECURITY. The webhook validates the RE-FETCHED Xendit invoice amount against
// this table (never against the callback body), so a forged callback with an
// arbitrary amount cannot unlock. No client path supplies a price, and no client
// path supplies a SKU-to-price mapping — a client may name a SKU, and the name
// is resolved to a number here, on the server.
//
// PRICE_IDR (Rp 49.000) is GONE. It was the pre-pivot domain-reading price,
// superseded in CLAUDE.md's SUPERSEDED list, and nothing else in the repo knew.
// Both of its consumers moved to priceFor() in the same commit, so no shim.
// ============================================================

/**
 * THE LADDER, ruled by Reyner 2026-08-29.
 *
 * Authority is `docs/product/paid-product-map.md` `## RULED 2026-08-29`. This
 * table implements it; it does not decide it.
 *
 *   launch   19 -> 39 -> 79        mature   29 -> 49 -> 99
 *
 * FOUR PRODUCTS, FOUR DIFFERENT JOBS, and the ladder is not depth:
 *   artifact  OWNERSHIP    "I want to keep this."   NOT a deeper reading -
 *                          nothing is withheld from the free mirror to make it.
 *   compat    CURIOSITY    "What about me and them?"
 *   annual    ORIENTATION  "What kind of year is this?"
 * (The free mirror is RECOGNITION and is not a SKU.)
 *
 * WHY artifact STAYS AT 19.000 while its list rises to 29.000: its job is not
 * ARPU, it is converting a free reader into a paying customer at all. 19k is an
 * impulse "why not"; at 29k she justifies the purchase consciously, which is the
 * wrong mental motion for a keepsake.
 *
 * WHY compat IS 39.000 AND NOT 29.000: 29k reads as a cheap digital curiosity.
 * Another person is involved and the emotional stake is higher than a keepsake's.
 *
 * WHY annual IS 79.000 AND NOT 49.000: at 49k it reads as an inexpensive digital
 * reading; 79k reads as "my personal reading for the year" while staying under
 * the psychologically loaded 100.000 line. THE PRESENTATION CARRIES THIS PRICE,
 * NOT THE PAGE COUNT.
 *
 * NEITHER compat NOR annual IS ASSUMED TO BE THE MONEY PRODUCT. September's
 * demand test decides, and no code, comment or copy may encode the assumption in
 * either direction. CLAUDE.md calls compat "the money engine" as a PRODUCT
 * statement; it is not a measurement and it is not a launch precondition.
 */
export const SKUS = {
  // Key is stable; the DISPLAY NAME is interim. Sold as `Bacaan Mendalam` since
  // 2026-08-05 (lib/site/copy.js harga.artifact) because that is what the paid path
  // delivers. Named the Complete Edition card + PDF before, and will again after the
  // fulfillment swap. The key never moves - the webhook validates against it.
  artifact: { list: 29000, launch: 19000 },
  compat: { list: 49000, launch: 39000 },   // compatibility reading — you + one other person
  annual: { list: 99000, launch: 79000 },   // the year ahead — orientation, not prophecy (rule 25)
};

/** Flip to false to charge list. The single lever for ending the launch cohort. */
export const LAUNCH_PRICING = true;

/**
 * What a SKU costs right now, in IDR.
 *
 * @param {keyof SKUS} sku
 * @param {{ launch?: boolean }} [opts] override the tier. For tests and for a
 *   future cohort split; production callers pass nothing and get the live tier.
 */
export function priceFor(sku, { launch = LAUNCH_PRICING } = {}) {
  const entry = SKUS[sku];
  if (!entry) throw new Error(`Unknown SKU "${sku}"`);
  return entry[launch ? 'launch' : 'list'];
}

/**
 * SKUs a checkout may actually create an invoice for TODAY.
 *
 * `compat` AND `annual` are priced but NOT sellable: neither is built and there is
 * nothing to deliver. Pricing a thing and selling a thing are separate decisions,
 * and taking money for an unbuilt product is the failure this list exists to
 * prevent.
 *
 * THIS LIST IS THE FENCE, and 2026-08-29 is when it started carrying two products
 * instead of one. `annual` was added to SKUS in the same commit that left it off
 * this list, deliberately: September's demand test shows both products at their
 * launch prices and records interest, and a price has to exist to be shown. A
 * commit that makes either reachable from `/api/pay` is wrong, and the checkout
 * route test asserts the 400.
 */
export const SELLABLE_SKUS = ['artifact'];

/** The SKU a checkout defaults to when none is named. */
export const DEFAULT_SKU = 'artifact';

export const isSellable = (sku) => SELLABLE_SKUS.includes(sku);

/**
 * Does a paid invoice amount match what this SKU costs RIGHT NOW?
 *
 * FAIL-CLOSED, and that is the point (rule 18). Four things return false and
 * therefore do not unlock: an unknown SKU, a missing SKU (a row predating SKU
 * storage), an amount belonging to a different SKU, and an amount from the
 * wrong TIER — list while launch pricing is active, or the reverse.
 *
 * The strict single-tier check is deliberate and is what the per-SKU rewrite
 * buys over the old global constant. OPERATIONAL CONSEQUENCE, stated so it is
 * not discovered during a flip: an invoice created before a LAUNCH_PRICING
 * change and settled after it will NOT unlock. Drain in-flight invoices before
 * flipping the lever. Widening this to accept both tiers would remove the
 * regression the webhook test exists to catch.
 */
export function amountMatchesSku(amount, sku) {
  if (!SKUS[sku]) return false;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return false;
  return amount === priceFor(sku);
}
