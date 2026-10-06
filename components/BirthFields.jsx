// ============================================================
// The three birth inputs, one implementation
// ============================================================
// Extracted from `components/Funnel.jsx#Home` on 2026-09-08, when the compat
// page needed the same three fields TWICE on one screen. Three copies of a date
// input is three places for `min`, `max`, `step` or an aria-label to drift, and
// the comments below are the reasons those attributes are what they are - they
// would have been copied and then edited on one copy only.
//
// IT IS PRESENTATION ONLY. Validation lives in `lib/birthInput.js`, which the
// mirror route and the pair handler already share; this component must not grow
// a second opinion about what a valid birth date is.
// ============================================================

import { useEffect, useRef, useState } from 'react';

import { GENDER_WORDS, MONTHS_ID_LONG } from '../lib/site/birthSummary.js';
import { CHROME_COPY } from '../lib/site/copy.js';

const pad = (n) => String(n).padStart(2, '0');

/** The engine's supported range starts here. */
export const EARLIEST_BIRTH_DATE = '1900-01-01';

/**
 * The out-of-range message, ONE copy. It was a literal in Funnel.jsx's submit handler;
 * since the date became three fields (Prompt BG §3) the year field also carries it, as
 * its native validity message, so it lives here with the rule it explains.
 */
export const DATE_RANGE_ERROR = 'Periksa lagi tanggalnya. Katon menghitung kelahiran dari tahun 1900 sampai hari ini.';

// ── THE DATE AS THREE FIELDS (Prompt BG §3, Reyner 2026-10-06) ──
// Tanggal / Bulan / Tahun instead of the native picker. The STORED value is unchanged,
// `YYYY-MM-DD`, so nothing downstream moves. These helpers are pure and exported so a
// test pins the calendar rather than a rendered option count.

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * Days in a month. Before the year is known, Februari allows 29, so a 29 Februari
 * birth can be entered in any order; the year then decides.
 *
 * @param {string|number} month 1-12, or '' when unchosen
 * @param {string} year 4 digits, or anything shorter while being typed
 */
export function daysInMonth(month, year) {
  const m = Number(month);
  if (!m) return 31;
  if (m === 2) return /^\d{4}$/.test(String(year)) ? (isLeap(Number(year)) ? 29 : 28) : 29;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

/** `YYYY-MM-DD` -> { day, month, year } as the fields hold them; empty when malformed. */
export function splitDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  if (!m) return { day: '', month: '', year: '' };
  const parts = { day: String(Number(m[3])), month: String(Number(m[2])), year: m[1] };
  return composeDate(parts) ? parts : { day: '', month: '', year: '' };
}

/**
 * The fields -> `YYYY-MM-DD`, or '' while incomplete or impossible (31 Februari,
 * 29 Februari outside a leap year). Range is NOT checked here: an out-of-range date is a
 * real date, and the year field's validity and the submit handlers say so.
 */
export function composeDate({ day, month, year }) {
  if (!day || !month || !/^\d{4}$/.test(year)) return '';
  if (Number(day) > daysInMonth(month, year)) return '';
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Inside the engine's range, from 1900 to today. */
export const dateInRange = (date) => date >= EARLIEST_BIRTH_DATE && date <= today();

/**
 * A field whose label sits inside it and floats to the top-left when the field is
 * focused or filled (Prompt BG §4). A real `<label>` always, never a placeholder; the
 * styling is `.k-float` in app/globals.css, existing colours only.
 */
export function FloatField({ id, label, filled, children }) {
  return (
    <div className="k-float" data-float data-filled={filled ? '' : undefined}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

/**
 * 00 through 23. The hour picker's options, and the ONLY hour values the form
 * can produce - exported so a test can assert the list rather than count
 * `<option>` tags in a source grep.
 *
 * Displayed as `09.00`, the Indonesian convention, and stored as `09:00`, which
 * is what `lib/birthInput.js` and both submit handlers already parse with
 * `slice(0, 2)`. The display form is never stored and the stored form is never
 * shown; keeping them apart is why this is a list of numbers and not of strings.
 */
export const HOURS = Array.from({ length: 24 }, (_, h) => h);

/**
 * The two gender words, keyed by the value that is stored.
 *
 * EXPORTED so the compat stepper's summary line can say back exactly what the
 * select said, rather than carrying its own copy. Reyner confirmed both words
 * unchanged on the 2026-09-09 walk; they were literals in the `<option>`s below
 * and are now read from here, which is the same slot in one place instead of
 * two. Not a copy BANK: they are the option labels of one control, and a bank
 * for two words is more machinery than the words are worth (the same call the
 * rulings file makes for the two shared JSX strings).
 */
// MOVED to lib/site/birthSummary.js (2026-09-23) so the PDF cover can read it
// under plain node. Re-exported so every existing import keeps working.
export { GENDER_WORDS };

/** Today, in the browser's own local calendar - the same day the reader means. */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-warm)', margin: '0 0 10px' }}>{children}</div>;
}

/**
 * Date, hour and gender for ONE person.
 *
 * @param {Object} value    { date, time, gender }
 * @param {Function} onChange (key, value) => void
 * @param {string} [idPrefix] distinguishes two instances on one page, for labels
 * @param {string} [personLabel] appended to each aria-label so a screen reader can
 *   tell the two people apart. The compat form has two of these and "Tanggal
 *   lahir" twice is unusable.
 * @param {boolean} [hourTarget] marks the hour field as where the reader was sent
 *   (`data-focus-target`, styled by the `select:focus` rule in app/globals.css). The
 *   front door sets it after H3's arrival, until an hour is picked (Prompt BF
 *   amendment 1 §3).
 */
export function BirthFields({ value, onChange, idPrefix = 'birth', personLabel = '', hourTarget = false }) {
  const set = (k) => (e) => onChange(k, e.target ? e.target.value : e);
  const aria = (base) => (personLabel ? `${base} ${personLabel}` : base);

  // ── THE THREE DATE FIELDS HOLD THEIR OWN PARTS ──
  // A half-entered date is not a `YYYY-MM-DD` yet, so the parts live here and the
  // parent only ever receives a whole, real date or ''. When the parent's date changes
  // from outside (H3's prefill, a reset), the parts are re-read from it, during render,
  // the pattern `armed` uses in Funnel.jsx's <Reading>.
  const [parts, setParts] = useState(() => splitDate(value.date));
  const [seen, setSeen] = useState(value.date);
  if (value.date !== seen) {
    setSeen(value.date);
    if (composeDate(parts) !== value.date) setParts(splitDate(value.date));
  }
  const setPart = (k) => (e) => {
    const raw = e.target.value;
    const next = { ...parts, [k]: k === 'year' ? raw.replace(/\D/gu, '').slice(0, 4) : raw };
    // A day the month or year has just made impossible (31 then Februari, 29 Februari
    // then a common year) is CLEARED, never clamped: a silently moved birth date is a
    // wrong chart nobody notices, an empty field is asked for again.
    if (next.day && Number(next.day) > daysInMonth(next.month, next.year)) next.day = '';
    setParts(next);
    const date = composeDate(next);
    setSeen(date);
    if (date !== value.date) onChange('date', date);
  };
  // THE RANGE RULE, AS THE NATIVE PICKER ENFORCED IT. Its `min`/`max` made the browser
  // refuse to submit a date outside 1900-today, on both forms (neither sets noValidate).
  // The year field now carries that refusal, with the existing message.
  const yearRef = useRef(null);
  useEffect(() => {
    yearRef.current?.setCustomValidity(value.date && !dateInRange(value.date) ? DATE_RANGE_ERROR : '');
  }, [value.date]);
  const maxDay = daysInMonth(parts.month, parts.year);

  return (
    <>
      {/* ONE GROUP, "Tanggal lahir", for a screen reader; the three labels inside the
          fields say which part is which. `data-value` is the composed date, for tests. */}
      <div id={`${idPrefix}-date`} role="group" aria-labelledby={`${idPrefix}-date-label`} data-date-group data-value={value.date}>
        <span id={`${idPrefix}-date-label`} className="k-sr-only">{aria('Tanggal lahir')}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.65fr 1.15fr', gap: 8 }}>
          <FloatField id={`${idPrefix}-day`} label="Tanggal" filled={Boolean(parts.day)}>
            <select id={`${idPrefix}-day`} value={parts.day} onChange={setPart('day')} autoComplete="bday-day">
              <option value=""></option>
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => <option key={d} value={String(d)}>{d}</option>)}
            </select>
          </FloatField>
          <FloatField id={`${idPrefix}-month`} label="Bulan" filled={Boolean(parts.month)}>
            <select id={`${idPrefix}-month`} value={parts.month} onChange={setPart('month')} autoComplete="bday-month">
              <option value=""></option>
              {MONTHS_ID_LONG.map((name, i) => <option key={name} value={String(i + 1)}>{name}</option>)}
            </select>
          </FloatField>
          <FloatField id={`${idPrefix}-year`} label="Tahun" filled={Boolean(parts.year)}>
            {/* TYPED, NOT PICKED: four keystrokes for a known year such as 1989, against
                a scroll through 127 options. */}
            <input
              ref={yearRef}
              id={`${idPrefix}-year`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              autoComplete="bday-year"
              value={parts.year}
              onChange={setPart('year')}
            />
          </FloatField>
        </div>
      </div>

      <div style={{ height: 16 }} />
      {/* HOUR, NOT HOUR AND MINUTE. Measured 2026-08-12 against
          calculateBaziChart: over 5,664 minute values on four ordinary dates,
          ZERO changed a pillar. Every 時辰 boundary sits on an exact odd hour
          (14:59 and 15:00 differ; 14:00 through 14:59 do not), so a minute field
          collects precision that cannot be used. The one place it CAN matter is a
          solar-term day, where the season gate asks for it and explains why.

          ── IT IS A SELECT NOW, NOT `type="time" step="3600"` (Addendum 2 item 4) ──
          `step` is a VALIDATION hint, not an input mode: browsers still render a
          minute field beside it and simply mark 09:30 invalid, so the control
          offered precision the product then threw away at submit. A reader who
          types a minute and watches it vanish learns the form is lying to her
          about what it wants. Twenty-four options say what is actually being
          asked. The submit handlers in Funnel.jsx and Pasangan.jsx still snap
          with `slice(0, 2)`, deliberately: this is presentation, and an API
          caller posting `09:47` must not become stored precision either.

          THE STORED VALUE IS UNCHANGED - `HH:00`, the same shape `type="time"`
          produced - so nothing downstream of the form moves. Verified against the
          13-chart Joey fixture: truncating every fixture minute to the hour
          changes 0 of 13 charts (charts 6 and 7 are the only ones carrying
          minutes at all, 00:15 and 23:30, and both are IDENTICAL truncated).

          ONE FLAG GOES DEAD FROM THE FUNNEL, and it is recorded rather than
          mourned: `checkHourEdge` in lib/bazi/pillars.ts is suppressed when
          `mi === 0 || mi === 30`, so with every input at `:00` it can no longer
          fire on anything the form submits. That is correct - we no longer know
          how close to an edge the birth was, so we cannot claim it is near one -
          and the SOLAR-TERM flag, which is the one that can move a month pillar,
          is untouched and still fires. */}
      <FloatField id={`${idPrefix}-time`} label="Jam lahir · opsional" filled={Boolean(value.time)}>
      <select
        id={`${idPrefix}-time`}
        value={value.time}
        onChange={set('time')}
        aria-label={personLabel ? aria('Jam lahir') : undefined}
        data-focus-target={hourTarget ? '' : undefined}
      >
        {/* Empty first, carrying no label, for the same reason the gender select
            does (ruled 2026-09-03): the fields around it are pickers with no
            placeholder, and a control that narrates its own empty state is the
            odd one out. `value=""` keeps `form.time ? ... : null` resolving an
            unanswered field to null at both submit paths. */}
        <option value=""></option>
        {HOURS.map((h) => (
          <option key={h} value={`${pad(h)}:00`}>{`${pad(h)}.00`}</option>
        ))}
      </select>
      </FloatField>
      {/* ONE HINT, ON EVERY FORM (Prompt BF amendment 1 §1, Reyner 2026-10-06): H1 in
          the place and style of the accuracy line it replaced (ruled in
          docs/content/pasangan-copy-rulings.md, the "helper under Jam lahir" row), here
          and on the compat form alike, so no form carries the accuracy claim. */}
      <div data-hour-hint style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>{CHROME_COPY.hour_hint}</div>

      <div style={{ height: 16 }} />
      {/* GENDER CHANGES NOTHING THE READING RENDERS - `computePillars` `void`s it
          (lib/bazi/pillars.ts) because it touches luck-pillar direction only and
          no luck pillars exist. What it feeds is the CARD FOOTER, where the
          2026-08-03 ruling puts PEREMPUAN / LAKI-LAKI on both cards.

          OPTIONAL, and the null case is first-class rather than degraded:
          `buildFooter` renders date + source with no placeholder and no gap where
          a word would be. Same 08-03 ruling.

          THE EMPTY OPTION CARRIES NO LABEL, ruled 2026-09-03: the two fields
          above are native pickers with no placeholder, and `Tidak diisi` made
          this the one control in the card that narrated its own empty state.
          `value=""` is unchanged, so `gender || null` at every call site still
          resolves an unanswered field to null. */}
      <FloatField id={`${idPrefix}-gender`} label="Jenis kelamin · opsional" filled={Boolean(value.gender)}>
      <select
        id={`${idPrefix}-gender`}
        value={value.gender}
        onChange={set('gender')}
        aria-label={personLabel ? aria('Jenis kelamin') : undefined}
      >
        <option value=""></option>
        <option value="female">{GENDER_WORDS.female}</option>
        <option value="male">{GENDER_WORDS.male}</option>
      </select>
      </FloatField>
    </>
  );
}
