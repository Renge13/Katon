// ============================================================
// lib/pair/reconcile.js — ask DOKU once, when nobody told us
// ============================================================
// Launch-cut item 4, ruled 2026-09-22. DOKU's HTTP Notification has never been
// delivered to Katon (ticket 1149053, `docs/ops/doku-walk.md`), so a buyer can pay
// and her row stays `paid: false` with nothing in the system to flip it. Until this
// the only reconcile was `npm run doku:status` by hand (launch-cut §5 crosscheck 2).
//
// WHAT IT DOES: when the report page loads on an UNPAID pair that has a DOKU
// invoice, ask DOKU's check-status ONCE and, on SUCCESS, settle through
// `settlePair` - the same single door the verified notification uses (CLAUDE.md
// rule 18). The amount check is `settlePair`'s own; nothing here decides "paid"
// except DOKU's answer about THIS invoice.
//
// ── WHEN IT DOES NOT ASK, and each one is a guard, not an optimisation ──
//   the fence is not DOKU   closed or mock, it makes NO call (ruled with this item).
//                           Note the difference from `notify.js`, which settles on
//                           key presence alone: a notification is DOKU telling us,
//                           this is us asking, and asking is a sales-path action.
//   already paid            nothing to reconcile.
//   no DOKU invoice         `invoice_id` must be `${id}.<suffix>`, the shape the pay
//                           route's DOKU branch writes. A mock-era `mock_<id>` or an
//                           empty column is not an invoice DOKU knows.
//   DOKU names another      the echoed `order.invoice_number` must equal the one
//   invoice                 asked - a status for the wrong invoice is the one wrong
//                           answer that looks exactly like a right one.
//
// ONCE PER PAGE LOAD is the CLIENT's half: `PasanganReport` calls the route on
// mount, guarded by a ref, and never from the poll - the poll re-reads the pair
// every 3s up to 100 times and each of those would be a DOKU call.
// ============================================================

import 'server-only';

import { getPair } from '../pairStore.js';
import { paymentsProvider, dokuConfigured } from '../paymentFence.js';
import { checkStatus, PAID_STATUSES } from '../doku/client.js';
import { recordEvent } from '../analytics/events.js';
import { settlePair } from './settle.js';

/**
 * @param {string} id the pair's id
 * @returns {Promise<{checked: boolean, paid: boolean, reason: string|null}>}
 *   `checked` says whether DOKU was asked at all.
 */
export async function reconcilePair(id) {
  if (paymentsProvider() !== 'doku' || !dokuConfigured()) {
    return { checked: false, paid: false, reason: 'provider_not_doku' };
  }
  const row = await getPair(id);
  if (!row) return { checked: false, paid: false, reason: 'not_found' };
  if (row.paid === true) return { checked: false, paid: true, reason: 'already_paid' };

  const invoice = typeof row.invoice_id === 'string' ? row.invoice_id : '';
  if (!invoice.startsWith(`${id}.`)) return { checked: false, paid: false, reason: 'no_doku_invoice' };

  let answer;
  try {
    answer = await checkStatus(invoice);
  } catch (err) {
    // A failed ask is not an answer. The page stays pending and her next load
    // asks again; the message is DOKU's and never carries the keys (client.js).
    console.error(`[reconcile] pair ${id}: ${err?.message}`);
    return { checked: true, paid: false, reason: 'check_failed' };
  }
  if (answer.invoiceNumber !== invoice) {
    console.error(`[reconcile] pair ${id}: DOKU answered about ${answer.invoiceNumber ?? 'nothing'}`);
    return { checked: true, paid: false, reason: 'invoice_mismatch' };
  }

  const statusPaid = PAID_STATUSES.includes(answer.status);
  const result = await settlePair(id, row, statusPaid, answer.amount);
  // THE SAME EVENT THE NOTIFICATION RECORDS, so a purchase settled here counts
  // exactly like one DOKU told us about. `via` says which door it came through.
  if (result.paid) await recordEvent(id, 'purchase_confirmed', { sku: row.sku ?? null, via: 'reconcile' });
  console.log(`[reconcile] pair ${id}: status=${answer.status ?? 'none'} paid=${result.paid} reason=${result.reason ?? 'ok'}`);
  return { checked: true, paid: result.paid, reason: result.reason };
}
