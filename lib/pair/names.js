// ============================================================
// The pair's nicknames and relationship status (Prompt BC §1)
// ============================================================
// Reyner, 2026-10-02 (F1, F2, F4; docs/product/compat-rulings-2026-10-02.md, "Prompt BC
// decisions"): each person may give a nickname, and the relationship status is
// REQUIRED - one tap, three options (PDKT / Pacaran / Menikah).
//
// ── THE SANITISER IS THE PROMPT-INJECTION GUARD ─────────────
// A nickname is handed to the writer as `core.a.nickname` / `core.b.nickname`, so it is
// text a stranger types that reaches an LLM. The allowed alphabet is therefore a NAME's:
// letters in any script (accented included, with combining marks), spaces, apostrophe
// and hyphen. No digits, no punctuation that ends a sentence, no brackets, no quotes,
// no newline - nothing an instruction can be written in beyond words, and 20 characters
// is too short to carry one. Trimmed, inner runs of spaces collapsed, the typographic
// apostrophe a phone keyboard inserts (U+2019) read as the keyboard one (rule 20).
//
// Pure, no dependencies: the server route uses it as the authority, and the form may
// use it for an early message.
// ============================================================

export const NICKNAME_MAX = 20;
export const PAIR_STATUSES = Object.freeze(['PDKT', 'Pacaran', 'Menikah']);

// Starts and ends with a letter; between them letters, combining marks, single spaces,
// apostrophes and hyphens.
const NICKNAME = /^\p{L}(?:[\p{L}\p{M}' -]*[\p{L}\p{M}])?$/u;

/**
 * @param {unknown} input what the client sent
 * @returns {{value: string|null, error: 'nickname_invalid'|null}} `value` null with no
 *   error means "no nickname given"
 */
export function sanitizeNickname(input) {
  if (input === undefined || input === null) return { value: null, error: null };
  if (typeof input !== 'string') return { value: null, error: 'nickname_invalid' };
  const value = input.replace(/\u2019/gu, "'").replace(/[ \t]+/gu, ' ').trim();
  if (value === '') return { value: null, error: null };
  if ([...value].length > NICKNAME_MAX || !NICKNAME.test(value)) return { value: null, error: 'nickname_invalid' };
  return { value, error: null };
}

/**
 * The semantic-JSON options a stored pair row carries (core.status, core.a/b.nickname).
 * One place, so the reading route and the PDF route cannot disagree about the key.
 */
export function pairInputs(row) {
  return {
    status: row?.status ?? null,
    nicknames: { a: row?.a_nickname ?? null, b: row?.b_nickname ?? null },
  };
}

/** @returns {'status_invalid'|null} */
export function statusError(input) {
  return PAIR_STATUSES.includes(input) ? null : 'status_invalid';
}
