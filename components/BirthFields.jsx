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

const pad = (n) => String(n).padStart(2, '0');

/** The engine's supported range starts here. */
export const EARLIEST_BIRTH_DATE = '1900-01-01';

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
 */
export function BirthFields({ value, onChange, idPrefix = 'birth', personLabel = '' }) {
  const set = (k) => (e) => onChange(k, e.target ? e.target.value : e);
  const aria = (base) => (personLabel ? `${base} ${personLabel}` : base);

  return (
    <>
      {/* NATIVE PICKERS. `min` keeps it inside the engine's supported range and
          `max` stops a birthdate in the future. */}
      <FieldLabel>Tanggal lahir</FieldLabel>
      <input
        id={`${idPrefix}-date`}
        type="date"
        value={value.date}
        onChange={set('date')}
        min={EARLIEST_BIRTH_DATE}
        max={today()}
        aria-label={aria('Tanggal lahir')}
      />

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
      <FieldLabel>Jam lahir · opsional</FieldLabel>
      <select
        id={`${idPrefix}-time`}
        value={value.time}
        onChange={set('time')}
        aria-label={aria('Jam lahir')}
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
      <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>Tanpa jam tetap akurat, pakai jam jauh lebih presisi.</div>

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
      <FieldLabel>Jenis kelamin · opsional</FieldLabel>
      <select
        id={`${idPrefix}-gender`}
        value={value.gender}
        onChange={set('gender')}
        aria-label={aria('Jenis kelamin')}
      >
        <option value=""></option>
        <option value="female">Perempuan</option>
        <option value="male">Laki-laki</option>
      </select>
    </>
  );
}
