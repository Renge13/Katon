// ============================================================
// lib/deliver/reconcile.js — the Rp 19.000 purchase's on-load DOKU reconcile
// ============================================================
// PAY-SAFETY-ALL-PURCHASES (Reyner, 2026-09-23), a production-flip gate. The
// guards are in `lib/doku/reconcile.js`, shared with the pair; this names the
// mirror's store and its settle door (`settleReading`), nothing else.
// ============================================================

import 'server-only';

import { getReading } from '../readingStore.js';
import { reconcileWithDoku } from '../doku/reconcile.js';
import { settleReading } from './settle.js';

/**
 * @param {string} id the reading's bearer-token id
 * @returns {Promise<{checked: boolean, paid: boolean, reason: string|null}>}
 */
export const reconcileReading = (id) => reconcileWithDoku({
  id, kind: 'reading', load: getReading, settle: settleReading,
});
