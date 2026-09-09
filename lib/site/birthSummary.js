// ============================================================
// lib/site/birthSummary.js — one completed step, in one line
// ============================================================
// The stepper collapses a finished step to a summary the reader can check at a
// glance before paying: "13 Sep 1989, 09.00, Laki-laki". Y-2 commit 2.
//
// PURE, AND IN lib/ RATHER THAN IN THE COMPONENT, for the same reason
// `lib/site/nav.js` is: it can then be CALLED by a test over a table of cases
// instead of being inspected through rendered markup, and the cases that matter
// here are the absent ones - no hour, no gender, neither.
//
// IT FORMATS AND DECIDES NOTHING. The words come from the two places that
// already own them: `GENDER_WORDS` is exported by `components/BirthFields.jsx`,
// which is the select the reader actually saw, and the no-hour phrase is
// `CHROME_COPY.summary_time_unknown`, passed in. Neither is typed here, because
// a summary that says "Laki-laki" while the select says something else is a
// product disagreeing with itself one screen apart.

/**
 * Indonesian month abbreviations, January first.
 *
 * NOT `toLocaleDateString('id-ID')`. That depends on the ICU data compiled into
 * whichever runtime renders - Node builds ship with small-icu, browsers vary -
 * so the same birth could summarise differently on the server and in the
 * browser, which is a hydration mismatch that only some readers ever see. Twelve
 * strings are cheaper than that class of bug.
 */
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * `YYYY-MM-DD` -> `13 Sep 1989`. Parsed by SPLITTING, never with `new Date()`:
 * `new Date('1989-09-13')` is UTC midnight, which in any timezone west of
 * Greenwich prints as the 12th. The birth date is a wall-clock calendar fact
 * with no instant behind it (CLAUDE.md rule 3), and reading it through a Date is
 * how it acquires one.
 */
export function formatBirthDateId(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(date || '');
  if (!m) return null;
  const month = MONTHS_ID[Number(m[2]) - 1];
  if (!month) return null;
  return `${Number(m[3])} ${month} ${Number(m[1])}`;
}

/** `09:00` -> `09.00`, the Indonesian convention. Display only, never stored. */
export function formatHourId(time) {
  const m = /^(\d{2}):(\d{2})$/u.exec(time || '');
  return m ? `${m[1]}.${m[2]}` : null;
}

/**
 * One completed step, as one line.
 *
 * @param {Object} value          { date, time, gender } straight from the form
 * @param {Object} opts
 * @param {string} opts.timeUnknown  CHROME_COPY.summary_time_unknown
 * @param {Object} opts.genderWords  BirthFields' own GENDER_WORDS
 * @returns {string} e.g. `13 Sep 1989, 09.00, Laki-laki`
 *
 * ── THE ABSENT CASES ARE THE POINT ─────────────────────────
 * Hour and gender are both optional, and they fail differently on purpose:
 *
 *   no hour    SAYS SO - `jam tidak diisi`. The hour is the fourth pillar, and a
 *              summary that just omitted it would let a reader pay without ever
 *              noticing she skipped the one optional field that changes what she
 *              gets. The ruled string exists for exactly this slot.
 *   no gender  IS SILENT. Gender changes nothing the reading renders - it feeds
 *              the card footer only (`computePillars` voids it) - so naming its
 *              absence would give a field weight the product does not give it.
 *
 * The date is not optional and has no absent case; a step cannot be completed
 * without one, which is what the stepper's own validation enforces.
 */
export function birthSummary(value, { timeUnknown, genderWords }) {
  const date = formatBirthDateId(value?.date);
  if (!date) return null;

  const parts = [date, formatHourId(value?.time) || timeUnknown];
  const gender = genderWords?.[value?.gender];
  if (gender) parts.push(gender);
  return parts.join(', ');
}
