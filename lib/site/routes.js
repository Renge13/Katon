// ============================================================
// Reader-facing route paths, written down once
// ============================================================
// A path is not copy - a reader never reads it as a sentence - but it IS ruled,
// and it is referenced from four places that must agree: the front-door card,
// the page itself, the report page, and the redirect URLs a payment route builds
// for a provider. Four literals is three chances to typo one into a 404 that only
// shows up after a real payment. (The route builds none today - the adapter is
// deleted and Prompt V restores them with DOKU - so three of the four are live.)
//
// `/kompatibilitas` RULED BY REYNER 2026-09-08. The internal names stay
// `PASANGAN_COPY` / `pasangan_*`: identifiers a reader never sees.
// ============================================================

/** The compat product's pre-payment page. */
export const COMPAT_ROUTE = '/kompatibilitas';

/** A specific pair: pending, or the report once the webhook has flipped `paid`. */
export const compatPairRoute = (id) => `${COMPAT_ROUTE}/${id}`;
