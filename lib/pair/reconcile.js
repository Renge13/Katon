// ============================================================
// lib/pair/reconcile.js — the compat purchase's on-load DOKU reconcile
// ============================================================
// Launch-cut item 4 (ruled 2026-09-22, built in #129). The guards moved to
// `lib/doku/reconcile.js` on 2026-09-23 when the Rp 19.000 mirror purchase got the
// same path (PAY-SAFETY-ALL-PURCHASES), so both products share ONE set of guards;
// this names the pair's store and its settle door (`settlePair`), nothing else.
// `tests/pair-reconcile.spec.mjs` is unchanged by the move and still green.
// ============================================================

import 'server-only';

import { getPair } from '../pairStore.js';
import { reconcileWithDoku } from '../doku/reconcile.js';
import { settlePair } from './settle.js';

/**
 * @param {string} id the pair's id
 * @returns {Promise<{checked: boolean, paid: boolean, reason: string|null}>}
 */
export const reconcilePair = (id) => reconcileWithDoku({
  id, kind: 'pair', load: getPair, settle: settlePair,
});
