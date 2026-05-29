// Single source of truth for the SKU price. The webhook validates the re-fetched
// Xendit invoice amount against THIS constant (never against the request body),
// so a forged callback with a wrong/arbitrary amount cannot unlock.
export const PRICE_IDR = 49000; // Rp 49.000 — locked
