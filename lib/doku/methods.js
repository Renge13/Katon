// ============================================================
// lib/doku/methods.js — which DOKU Checkout methods Katon offers
// ============================================================
// Pure data, no `server-only`: lib/doku/client.js sends it, scripts/doku-probe.mjs
// probes it and tests/doku-methods.spec.mjs pins it. ONE copy of the approved set,
// because a test or a probe that retypes a ruled list is the second source of truth
// that goes stale on the next ruling (CLAUDE.md, the forge-test price ladder).
//
// ── TWO LISTS, AND THE SECOND IS NEVER WIDER THAN THE FIRST ──
// APPROVED is Reyner's ruling (Prompt BG §1, 2026-10-06): QRIS, plus DANA, ShopeePay
// and OVO "only once each is active on the account". Virtual accounts, convenience
// stores, Akulaku and DOKU e-Wallet are NOT approved (fee or reach), and are absent
// here rather than commented out.
//
// OFFERED is what Checkout is actually asked to show, QRIS first. A method moves from
// APPROVED into OFFERED only after DOKU has been seen accepting it on the PRODUCTION
// account. DOKU answers an inactive channel with a business error
// (`PAYMENT CHANNEL IS INACTIVE`, docs/PROGRESS.md 2026-09-21), and an offered method
// that is inactive breaks the checkout for every reader, not only the ones who would
// pick it.
//
// 2026-10-06: the e-wallets are not active yet (Reyner is applying through "Tambah
// Layanan"), so OFFERED is QRIS alone and adding one later is a one-line change here.
// ============================================================

/** Reyner's approved methods, DOKU enum strings, QRIS first. */
export const APPROVED_PAYMENT_METHODS = Object.freeze([
  'QRIS',
  'EMONEY_DANA',
  'EMONEY_SHOPEE_PAY',
  'EMONEY_OVO',
]);

/** The methods sent to DOKU Checkout. Approved AND seen active on production. */
export const OFFERED_PAYMENT_METHODS = Object.freeze(['QRIS']);
