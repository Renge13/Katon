// ============================================================
// lib/site/carryBirth.js — her birth, from the mirror to the compat form
// ============================================================
// Closes the DEFERRED REGISTER row `?dari=<token> DOES NOT PREFILL COMPAT STEP 1`
// (docs/PROGRESS.md, 2026-09-09) with the remedy that row prescribes, and with no
// more than that:
//
//   "A CLIENT-SIDE `sessionStorage` WRITE at funnel submit, read on step 1 mount.
//    No payload change, no server change, no birth data crossing a network
//    boundary it does not already cross."
//
// ── WHY NOT THE `?dari` PAYLOAD, WHICH WOULD BE SIMPLER ───
// Because the payload is empty ON PURPOSE. `GET /api/mirror/<token>` carries no
// birth data at all - the free card is built with `birthDate: null` so nothing
// about a birth leaves the server on the free path - and putting it back to save
// the reader some typing would spend a privacy property to buy convenience. This
// never leaves her browser, which is the whole reason it is allowed to exist.
//
// ── sessionStorage, NOT localStorage, AND THAT IS THE POINT ──
// It dies with the tab. A birth date is not a preference and should not outlive
// the visit that produced it: the next person to open this browser is not
// necessarily her, and a compat form that helpfully remembers a birth date from
// last week is a small privacy failure wearing a convenience's clothes. The whole
// carry is worth one tab session and no more.
//
// ── EVERY ACCESS IS WRAPPED, AND THAT IS NOT DEFENSIVE HABIT ──
// `window.sessionStorage` THROWS - not returns null - in a private window, with
// site data blocked, and in some embedded webviews. An unguarded read takes the
// compat form down entirely, and it does it only for the readers whose browsers
// are least ordinary, which is the worst possible sample to break. Both functions
// fail silently to "no carry", which is the behaviour every reader had before
// this file existed.
// ============================================================

/**
 * The one key. Versioned, so a shape change is a MISS rather than a
 * half-understood object: an old `v1` value simply stops being found.
 */
const KEY = 'katon.carry-birth.v1';

/** `1989-09-13`. */
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
/** `09:00`. The form snaps to the hour, but the shape check does not care. */
const TIME = /^\d{2}:\d{2}$/u;
/** Matches the two `<option>` values in `components/BirthFields.jsx`. */
const GENDERS = ['female', 'male'];

/**
 * Coerce whatever was stored into the exact shape the forms hold, or null.
 *
 * VALIDATED FIELD BY FIELD, AND A BAD FIELD IS DROPPED RATHER THAN FAILING THE
 * WHOLE READ. What is in a reader's own session store is not something a form
 * should trust into an input: a half-written value, a shape from an older
 * release, another tab's junk under a colliding key. The failure this prevents is
 * a date input rendering garbage and a submit sending it.
 *
 * @param {unknown} raw parsed JSON
 * @returns {{date: string, time: string, gender: string}|null}
 */
function clean(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const date = DATE.test(raw.date) ? raw.date : '';
  const time = TIME.test(raw.time) ? raw.time : '';
  const gender = GENDERS.includes(raw.gender) ? raw.gender : '';
  // A carry with no DATE is not a carry. The date is the only field the compat
  // step actually requires, so a stored object that lost it would prefill an hour
  // and a gender onto an empty date - which reads as a half-filled form she does
  // not remember filling.
  return date ? { date, time, gender } : null;
}

/**
 * Remember the birth that just produced a mirror reading.
 *
 * Called AFTER the reading exists, never at form-fill: a birth that was typed and
 * abandoned is not something to carry forward, and writing on keystroke would
 * store every half-typed year the reader passed through.
 *
 * @param {{date: string, time: string|null, gender: string|null}} birth
 * @returns {boolean} whether it was stored
 */
export function rememberBirth(birth) {
  const value = clean({
    date: birth?.date,
    time: birth?.time ?? '',
    gender: birth?.gender ?? '',
  });
  if (!value) return false;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    // Private window, blocked site data, quota. She types it again; nothing else
    // about the reading is affected, so this must never surface as an error.
    return false;
  }
}

/**
 * The birth carried from this tab's mirror reading, or null.
 *
 * @returns {{date: string, time: string, gender: string}|null}
 */
export function recallBirth() {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    return stored ? clean(JSON.parse(stored)) : null;
  } catch {
    // Includes a JSON.parse throw on a truncated write, which is why the parse is
    // inside the same try rather than guarded separately.
    return null;
  }
}

/** Test seam, and the one a later "start over" control would call. */
export function forgetBirth() {
  try { window.sessionStorage.removeItem(KEY); } catch { /* nothing to forget */ }
}
