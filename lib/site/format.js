// ============================================================
// Rupiah formatting for display
// ============================================================
// Deliberately NOT Intl.NumberFormat. The id-ID currency formatter emits a
// NO-BREAK SPACE (U+00A0) between "Rp" and the digits on some ICU builds, and
// the grouping character can differ between the Node version that renders on
// the server and the browser that hydrates. Rule 20 wants keyboard characters
// only, and a hydration mismatch on a price is worse than a hand-rolled regex.
//
// One digit group separator, one space, deterministic everywhere.
// ============================================================

/**
 * An IDR amount as Katon displays it: `19000` -> `Rp 19.000`.
 *
 * @param {number} amount whole rupiah, as stored in lib/pricing.js
 */
export function formatIdr(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new Error(`formatIdr expects a finite number, got ${amount}`);
  }
  const digits = String(Math.round(Math.abs(amount)));
  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * A decimal as Indonesian readers write it: `27.5` -> `27,5`, `15` -> `15`.
 *
 * Round-1 markup R4 (Cowork, delegated by Reyner 2026-09-24): the PDF's element
 * values printed with a decimal POINT. Hand-rolled for `formatIdr`'s reason above -
 * one output on every runtime, no ICU in the path. The value is printed as the
 * engine gave it (no rounding here); only the separator changes.
 *
 * @param {number} value
 * @returns {string}
 */
export function formatDecimalId(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
  return String(value).replace('.', ',');
}
