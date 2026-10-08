// ============================================================
// lib/site/linkSource.js — where a reader came from: the link code (?k=)
// ============================================================
// Prompt BM (Reyner, 2026-10-08). Katon had no source attribution: funnel_event knew
// the steps but not the door, and Vercel Web Analytics drops the query
// (lib/site/analyticsUrl.js), so UTM tags never arrived. Each tracked post carries its
// own `?k=<code>`; Reyner keeps the code ledger by hand in docs/ops/link-codes.md.
//
// ISOMORPHIC, ON PURPOSE. The client captures with these validators and the server
// (lib/mirror/handlers.js, lib/pair/handlers.js) re-validates with the SAME ones,
// because the client is never trusted and two copies of a rule drift.
//
// ── THE DATE CLAUSE IS WHY THE VALIDATORS ARE STRICT ──
// `assertNoPii` (lib/analytics/events.js) throws on any \d{4}-\d{2}-\d{2} run in
// `detail`, and `recordEvent` swallows the throw, so a code like `th-2026-10-08` would
// silently DROP the whole `reading_created` row. A bad value costs the value, never the
// event: anything that fails here is stored as null. The same clause is applied to `ref`
// for the same reason (a hostname can carry a date run too).
//
// ── FIRST TOUCH, THIS TAB, NO COOKIE ──
// sessionStorage only; `/privasi` promises "tanpa cookie". First write wins, so the
// door a reader came in by is not replaced by a later link in the same tab. If storage
// is blocked, the value lives in this module for the current page load and nothing
// throws.
// ============================================================

export const SOURCE_KEY = 'katon:src';

/** The first path segment of the landing URL, mapped. Never a token. */
export const LANDINGS = Object.freeze(['home', 'kompatibilitas', 'r', 'harga', 'tentang', 'privasi', 'other']);

const CODE_RE = /^[a-z0-9][a-z0-9-]{0,23}$/;
const HOST_RE = /^[a-z0-9.-]{1,64}$/;
// The same run assertNoPii refuses. Kept as its own constant so the reason is legible.
const DATE_RUN = /\d{4}-\d{2}-\d{2}/;

/** This site's own hosts: a referrer from here is not a source. */
const isOwnHost = (host) => host === 'katon.app' || host === 'www.katon.app' || host.endsWith('.vercel.app');

/** A link code, or null. Lowercase only: `TH` is refused, not lowercased. */
export function cleanCode(v) {
  if (typeof v !== 'string' || !CODE_RE.test(v) || DATE_RUN.test(v)) return null;
  return v;
}

/** A referrer hostname, lowercased, or null. Never a path or a query. */
export function cleanRef(v) {
  if (typeof v !== 'string') return null;
  const host = v.toLowerCase();
  if (!HOST_RE.test(host) || DATE_RUN.test(host) || isOwnHost(host)) return null;
  return host;
}

/** One of LANDINGS, or null. */
export function cleanLanding(v) {
  return typeof v === 'string' && LANDINGS.includes(v) ? v : null;
}

/** The server's re-validation of a client `src`. Always the three keys, never throws. */
export function cleanSource(src) {
  const s = src && typeof src === 'object' && !Array.isArray(src) ? src : {};
  return { k: cleanCode(s.k), ref: cleanRef(s.ref), landing: cleanLanding(s.landing) };
}

/** `document.referrer` to a hostname, or null. */
export function refFromReferrer(referrer) {
  if (!referrer) return null;
  try { return cleanRef(new URL(referrer).hostname); } catch { return null; }
}

/** A pathname's first segment, mapped to LANDINGS. */
export function landingOf(pathname) {
  const seg = String(pathname || '').split('/')[1] || '';
  if (seg === '') return 'home';
  return LANDINGS.includes(seg) && seg !== 'home' && seg !== 'other' ? seg : 'other';
}

// ── the client half ──

// The fallback when storage is blocked: this page load only.
let memo = null;

/** Every param but `k`, byte for byte, so `?bayar=selesai` and friends survive. */
function searchWithoutK(search) {
  const kept = search.replace(/^\?/, '').split('&').filter((part) => {
    if (!part) return false;
    let name = part.split('=')[0];
    try { name = decodeURIComponent(name.replace(/\+/g, ' ')); } catch { /* keep raw */ }
    return name !== 'k';
  });
  return kept.length ? `?${kept.join('&')}` : '';
}

/**
 * Called once per page load (components/SourceCapture.jsx). Records the first touch of
 * this tab session, then takes `k` out of the address bar so a copied URL does not
 * credit a reshare to the original post (`ref` covers that visit instead).
 */
export function captureSource(win = globalThis.window) {
  if (!win?.location) return;
  let url;
  try { url = new URL(win.location.href); } catch { return; }

  const fresh = {
    k: cleanCode(url.searchParams.get('k')),
    ref: refFromReferrer(win.document?.referrer),
    landing: landingOf(url.pathname),
  };
  if (!memo) memo = fresh;
  try {
    const store = win.sessionStorage;
    if (store.getItem(SOURCE_KEY) === null) store.setItem(SOURCE_KEY, JSON.stringify(fresh));
  } catch { /* storage blocked: `memo` carries it for this page load */ }

  if (url.searchParams.has('k')) {
    try {
      win.history.replaceState(win.history.state, '', `${url.pathname}${searchWithoutK(url.search)}${url.hash}`);
    } catch { /* a refused replaceState leaves the URL; the capture already happened */ }
  }
}

/** What the creates send as `src`: the stored first touch, re-validated, or null. */
export function readSource(win = globalThis.window) {
  try {
    const raw = win?.sessionStorage?.getItem(SOURCE_KEY);
    if (raw) return cleanSource(JSON.parse(raw));
  } catch { /* blocked or unparseable: fall through */ }
  return memo;
}

/** TEST ONLY: a fresh page load. */
export function __resetLinkSourceForTest() {
  memo = null;
}
