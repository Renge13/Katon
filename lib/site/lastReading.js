// ============================================================
// lib/site/lastReading.js — the last reading made on this device
// ============================================================
// Prompt BF §1b (Reyner, 2026-10-06). After a free reading, a reader who opened
// /harga and came back - by the header's "Bacaan Diri" or by typing the address -
// landed on an empty birth-date form, and her reading was reachable only by the
// URL she may not have saved. The front door now offers it back (the resume card
// in components/Funnel.jsx), and this file is the memory behind that card.
//
// ── THE TOKEN AND THE TITLE. NEVER THE BIRTH DATE. ─────────
// The prompt's own line: "Never store the birth date itself." The token is the
// reading's address and the title is the archetype's English name, which the card
// shows so she knows which reading it is. Neither is a birth: an archetype is one
// of ten and says nothing about a date. `clean()` keeps only these two fields, so
// a caller that passes more cannot store more.
//
// ── localStorage, NOT sessionStorage, AND WHY THAT IS ALLOWED HERE ──
// lib/site/carryBirth.js chose sessionStorage on purpose: a birth date should not
// outlive the tab. This is the opposite case. The whole point is that she comes
// back tomorrow, and what survives is a link she already holds, not a birth.
//
// ── EVERY ACCESS IS WRAPPED ────────────────────────────────
// `window.localStorage` THROWS in a private window, with site data blocked, and in
// some in-app webviews. Each function fails silently to "nothing remembered",
// which is the front door every reader had before this file existed.
//
// ── WRITTEN WHEN A READING IS CREATED, NOT WHEN ONE IS OPENED ──
// A /r/<token> link can be someone else's reading, sent to her. Remembering it
// would put "Bacaanmu masih tersimpan" above her friend's archetype. So only the
// funnel's create path writes here.
// ============================================================

/** Versioned, so a shape change is a miss rather than a half-understood object. */
const KEY = 'katon.last-reading.v1';

/** The reading id alphabet (nanoid), with a length bound. */
const TOKEN = /^[A-Za-z0-9_-]{6,64}$/u;

/**
 * Coerce a stored value into `{ token, title }`, or null.
 * @param {unknown} raw
 * @returns {{token: string, title: string}|null}
 */
function clean(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.token !== 'string' || !TOKEN.test(raw.token)) return null;
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 80) : '';
  return { token: raw.token, title };
}

// ── A SUBSCRIBABLE STORE, FOR `useSyncExternalStore` ────────
// The front door renders on the server, where there is no storage. Reading it in a
// useState initialiser would hydrate a card the server never sent; reading it in an
// effect and copying it into state is the cascade the react-hooks lint rejects. An
// external store is what React provides for exactly this: the server snapshot is
// null, the client snapshot is read after hydration, and writes here notify.
const listeners = new Set();
const notify = () => { for (const l of listeners) l(); };

/** @param {() => void} onChange @returns {() => void} unsubscribe */
export function subscribeLastReading(onChange) {
  listeners.add(onChange);
  const onStorage = (e) => { if (e.key === null || e.key === KEY) onChange(); };
  try { window.addEventListener('storage', onStorage); } catch { /* no window */ }
  return () => {
    listeners.delete(onChange);
    try { window.removeEventListener('storage', onStorage); } catch { /* no window */ }
  };
}

/**
 * The stored value as its raw string, or null. A STRING because a snapshot must be
 * equal between two reads of an unchanged store; parse it with `parseLastReading`.
 */
export function lastReadingSnapshot() {
  try { return window.localStorage.getItem(KEY); } catch { return null; }
}

/** @param {string|null} raw @returns {{token: string, title: string}|null} */
export function parseLastReading(raw) {
  try { return raw ? clean(JSON.parse(raw)) : null; } catch { return null; }
}

/**
 * Remember the reading just created on this device.
 * @param {{token: string, title?: string}} reading
 * @returns {boolean} whether it was stored
 */
export function rememberReading(reading) {
  const value = clean({ token: reading?.token, title: reading?.title });
  if (!value) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    return false;
  }
  notify();
  return true;
}

/**
 * The reading remembered on this device, or null.
 * @returns {{token: string, title: string}|null}
 */
export function recallReading() {
  return parseLastReading(lastReadingSnapshot());
}

/** R3 ("Mulai bacaan baru"), and the silent clear when a token no longer resolves. */
export function forgetReading() {
  try { window.localStorage.removeItem(KEY); } catch { /* nothing to forget */ }
  notify();
}

export const LAST_READING_KEY = KEY;
