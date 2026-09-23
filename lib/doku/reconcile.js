// ============================================================
// lib/doku/reconcile.js — ask DOKU once, when nobody told us
// ============================================================
// Launch-cut item 4 (2026-09-22) and PAY-SAFETY-ALL-PURCHASES (Reyner, 2026-09-23):
// every paid purchase - the Rp 19.000 mirror artifact and the compat pair - has an
// on-load DOKU reconciliation path, because DOKU's HTTP Notification has never been
// delivered to Katon (ticket 1149053). Before #129 the only reconcile was
// `npm run doku:status` by hand.
//
// ONE CORE, TWO DOORS. The guards below are identical for both products, so they
// live here once; `lib/pair/reconcile.js` and `lib/deliver/reconcile.js` supply
// only the store to read and the settle door to go through (`settlePair` /
// `settleReading`). A guard added to one product and not the other is the drift
// this shape exists to prevent.
//
// ── WHEN IT DOES NOT ASK, and each one is a guard, not an optimisation ──
//   the fence is not DOKU   closed or mock, it makes NO call (ruled with item 4).
//                           Unlike `notify.js`, which settles on key presence alone:
//                           a notification is DOKU telling us, this is us asking,
//                           and asking is a sales-path action. RECLOSE-DEFERRED
//                           (DEFERRED REGISTER) records what that leaves unguarded.
//   already paid            nothing to reconcile.
//   no DOKU invoice         `invoice_id` must be `${id}.<suffix>`, the shape the pay
//                           route's DOKU branch writes. `mock_<id>` or empty is not
//                           an invoice DOKU knows.
//   DOKU names another      the echoed `order.invoice_number` must equal the one
//   invoice                 asked - the one wrong answer that looks right.
//
// ONCE PER PAGE LOAD is the CLIENT's half, in each product's page: a ref-guarded
// call on mount, never from a poll.
// ============================================================

import 'server-only';

import { paymentsProvider, dokuConfigured } from '../paymentFence.js';
import { recordEvent } from '../analytics/events.js';
import { checkStatus, PAID_STATUSES } from './client.js';

/**
 * @param {Object} args
 * @param {string} args.id the row id (the invoice number's prefix)
 * @param {string} args.kind 'pair' | 'reading', for the log only
 * @param {(id: string) => Promise<Object|null>} args.load the store read
 * @param {(id, row, statusPaid, amount) => Promise<{paid, reason}>} args.settle the
 *   product's settle door
 * @returns {Promise<{checked: boolean, paid: boolean, reason: string|null}>}
 *   `checked` says whether DOKU was asked at all.
 */
export async function reconcileWithDoku({ id, kind, load, settle }) {
  if (paymentsProvider() !== 'doku' || !dokuConfigured()) {
    return { checked: false, paid: false, reason: 'provider_not_doku' };
  }
  const row = await load(id);
  if (!row) return { checked: false, paid: false, reason: 'not_found' };
  if (row.paid === true) return { checked: false, paid: true, reason: 'already_paid' };

  const invoice = typeof row.invoice_id === 'string' ? row.invoice_id : '';
  if (!invoice.startsWith(`${id}.`)) return { checked: false, paid: false, reason: 'no_doku_invoice' };

  let answer;
  try {
    answer = await checkStatus(invoice);
  } catch (err) {
    // A failed ask is not an answer: the page stays pending and her next load asks
    // again. The message is DOKU's and never carries the keys (client.js).
    console.error(`[reconcile] ${kind} ${id}: ${err?.message}`);
    return { checked: true, paid: false, reason: 'check_failed' };
  }
  if (answer.invoiceNumber !== invoice) {
    console.error(`[reconcile] ${kind} ${id}: DOKU answered about ${answer.invoiceNumber ?? 'nothing'}`);
    return { checked: true, paid: false, reason: 'invoice_mismatch' };
  }

  const statusPaid = PAID_STATUSES.includes(answer.status);
  const result = await settle(id, row, statusPaid, answer.amount);
  // THE SAME EVENT THE NOTIFICATION RECORDS, so a purchase settled here counts
  // exactly like one DOKU told us about. `via` says which door it came through.
  if (result.paid) await recordEvent(id, 'purchase_confirmed', { sku: row.sku ?? null, via: 'reconcile' });
  console.log(`[reconcile] ${kind} ${id}: status=${answer.status ?? 'none'} paid=${result.paid} reason=${result.reason ?? 'ok'}`);
  return { checked: true, paid: result.paid, reason: result.reason };
}
