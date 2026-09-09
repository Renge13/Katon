// ============================================================
// lib/pair/reportView.js — which of the report's seven states is on screen
// ============================================================
// Y-2 commit 3, ruling 4: "Report page has exactly seven states: not found,
// unpaid/resume, pending payment, rendering (skeleton), ready, floor-served,
// error. None removed."
//
// ── WHY A DERIVED VIEW AND NOT SIX `if`s IN THE COMPONENT ──
// They were spread across five early returns and two nested conditions, so
// "which state am I in" was answerable only by re-walking the render - and two
// of them, `rendering` and `pending_payment`, reached for the SAME copy slot
// from different branches. That is how `pending_title` ("Menunggu Konfirmasi
// Pembayaran") came to stand over a reader who had already paid and was waiting
// on prose. One expression makes the set enumerable and makes an eighth state
// hard to add by accident.
//
// ── AND WHY IT IS IN lib/ ──────────────────────────────────
// Same reason as `lib/site/nav.js` and `lib/site/birthSummary.js`: it can be
// CALLED by a test over a table of inputs instead of being reached by mounting
// the component seven times. `components/PasanganReport.jsx` imports React and
// `./kit.jsx`, and a spec that runs with `--conditions=react-server` cannot even
// load it - which is how the first version of this failed, from a test that was
// trying to assert something true.

/**
 * @param {Object} s
 * @param {Object|null} s.pair      the `GET /api/pair/<id>` body
 * @param {Object|null} s.reading   the `GET .../reading` body
 * @param {boolean} s.failed        a transport failure or a non-2xx that is not 404
 * @param {boolean} s.exhausted     the poll ran out of tries
 * @param {boolean} s.justPaid      `?bayar=selesai`
 * @param {boolean} s.mockPay       `?bayar=mock`
 * @returns {'error'|'not_found'|'unpaid'|'pending_payment'|'rendering'|'ready'|'floor'}
 *
 * ORDER IS PRIORITY, and the first two are first for a reason.
 *
 *   `error` outranks everything, because a failed fetch leaves `pair` null and
 *   a null `pair` otherwise falls through to `unpaid` - which offered to SELL a
 *   reading to someone who already owned one, on nothing worse than a dropped
 *   connection.
 *
 *   `not_found` is a real 404 body, never an absence of data.
 */
export function viewFor({ pair, reading, failed, justPaid, mockPay, exhausted }) {
  if (failed || exhausted) return 'error';
  if (pair?.error === 'not_found') return 'not_found';
  if (pair?.status !== 'paid') {
    return (justPaid || mockPay) ? 'pending_payment' : 'unpaid';
  }
  if (!reading) return 'rendering';
  // ── `floor` IS A DISTINCT NAME AND AN IDENTICAL RENDER ─────
  // The prompt asks for seven states with floor among them, AND that floor
  // render identically to ready. Both hold: the name exists so the set is
  // complete and so a test can assert the two take one branch, and the component
  // has no `floor` case because there is nothing different to do.
  //
  // Rule 15 - the floor is Reyner's own ruled glossary prose, the second half of
  // the design and not a degraded mode - so marking it would tell a reader she
  // got something lesser when she got the sentences he wrote. `served_from`
  // stays in the payload as the passive detector of a dead provider, which is an
  // operator's question and not a reader's.
  return reading.served_from === 'floor' ? 'floor' : 'ready';
}

/** The two views that render the report itself. Both, one branch. */
export const READY_VIEWS = new Set(['ready', 'floor']);

/** Every state, for a test that wants to assert the set is exactly seven. */
export const VIEWS = [
  'not_found', 'unpaid', 'pending_payment', 'rendering', 'ready', 'floor', 'error',
];
