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

export const SKUS = {
  artifact: { list: 25000, launch: 19000 }, // Complete Edition card + PDF
  compat: { list: 45000, launch: 29000 },   // compatibility reading
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
 * `compat` is priced but NOT sellable: its checkout needs the pair-layer engine
 * (Prompt E) and there is nothing to deliver yet. Pricing a thing and selling a
 * thing are separate decisions, and taking money for an unbuilt product is the
 * failure this list exists to prevent.
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
