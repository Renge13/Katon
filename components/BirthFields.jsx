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
          `step=3600` asks the browser for whole hours; the submit handler snaps
          regardless, because a browser that ignores step must not turn into
          stored precision. */}
      <FieldLabel>Jam lahir · opsional</FieldLabel>
      <input
        id={`${idPrefix}-time`}
        type="time"
        step="3600"
        value={value.time}
        onChange={set('time')}
        aria-label={aria('Jam lahir')}
      />
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
