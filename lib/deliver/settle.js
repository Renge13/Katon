// ============================================================
// lib/deliver/settle.js — the mirror purchase's one settle door
// ============================================================
// EXTRACTED 2026-09-23 from `lib/doku/notify.js`'s mirror branch, unchanged in
// behaviour, so the notification and the on-load reconcile (PAY-SAFETY-ALL-
// PURCHASES) flip a Rp 19.000 purchase through ONE function - the mirror's twin of
// `lib/pair/settle.js#settlePair`, and the same signature on purpose.
//
// The amount is verified against the SKU STORED AT INTENT, never against anything
// the caller claims. `markReadingPaid` is still the only line that sets `paid`
// (rule 18); this decides whether it may be called.
// ============================================================

import 'server-only';

import { markReadingPaid } from '../readingStore.js';
import { amountMatchesSku } from '../pricing.js';

/**
 * @param {string} readingId
 * @param {Object} row the reading row (for its stored `sku`)
 * @param {boolean} statusPaid the provider said SUCCESS
 * @param {number|null} settledAmount the provider's amount, or null if it sent none
 * @returns {Promise<{paid: boolean, reason: string|null}>} `paid` is true only on
 *   the false -> true transition.
 */
export async function settleReading(readingId, row, statusPaid, settledAmount) {
  const amountOk = settledAmount === null ? true : amountMatchesSku(settledAmount, row.sku);
  if (statusPaid && !amountOk) {
    console.error(`[settle] amount rejected for reading ${readingId}: sku=${row.sku ?? 'null'}`);
    return { paid: false, reason: 'amount_mismatch' };
  }
  if (!statusPaid) return { paid: false, reason: 'not_paid' };

  const transitioned = await markReadingPaid(readingId, new Date().toISOString());
  return { paid: transitioned, reason: transitioned ? null : 'already_paid' };
}
