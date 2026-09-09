'use client';

// ============================================================
// components/PasanganSteps.jsx — 1 Kamu, 2 Dia, 3 Email
// ============================================================
// Y-2 commit 2, from ruling 3: "Two-person form as a numbered stepper; distinct
// card treatment per step; one-line summary of each completed step."
//
// ── WHAT THE STEPPER IS ACTUALLY FOR ───────────────────────
// The old page put three identical cards on one screen and asked the reader to
// fill six fields for two different people before anything acknowledged her.
// The two birth cards were distinguishable only by a small eyebrow, so "which
// one is mine" was a question the layout kept asking. One open step at a time
// answers it structurally, and the collapsed summary is the receipt: before
// paying she can see, in one line each, exactly which two people she is buying a
// reading about.
//
// ── NO NEW VISUAL LANGUAGE ─────────────────────────────────
// Existing tokens only. The step badge takes `--emas` for A (the warm accent)
// and `--senja` for B (the secondary one). `--clay` is deliberately NOT used:
// globals.css calls it "the single action accent", and spending it on a step
// number would put it in competition with the submit button one card below.
//
// ── VALIDATION IS PER STEP, WHICH IS WHERE THE GATE MOVED ──
// Ruling 3 says validation per step, not on submit, and Addendum 1 puts the
// season gate "inside the step it belongs to". Those are the same change: a step
// cannot be completed until its birth is both VALID and, on a solar-term day,
// RESOLVED. So `/api/season-check` is now asked when a step advances rather than
// at checkout, and the gate renders inside that step's card instead of replacing
// the page.
//
// The 409 `needs_term_side` path in `Pasangan.jsx#checkout` is untouched and is
// still not dead code: the server is the authority, and a stale tab or a race
// must be sent back rather than sold a reading of the wrong month pillar. It
// reopens the step whose side the server named.

import { useState } from 'react';

import { BirthFields, FieldLabel, GENDER_WORDS } from './BirthFields.jsx';
import { SeasonGate } from './Funnel.jsx';
import { Reveal, Eyebrow, Button, Icon } from './kit.jsx';
import { CHROME_COPY, PASANGAN_COPY } from '../lib/site/copy.js';
import { birthSummary } from '../lib/site/birthSummary.js';

/** The three steps, in order. `side` is null for the one that is not a person. */
export const STEPS = [
  { n: 1, side: 'a', label: CHROME_COPY.step_1, accent: 'var(--emas)' },
  { n: 2, side: 'b', label: CHROME_COPY.step_2, accent: 'var(--senja)' },
  { n: 3, side: null, label: CHROME_COPY.step_3, accent: 'var(--tinta-soft)' },
];

/**
 * Can this step be left?
 *
 * DELIBERATELY THINNER THAN `lib/birthInput.js`, and that is not a second
 * opinion about validity. The server still runs the real validator on every
 * `POST /api/pair`; this only answers "has she filled the one required field",
 * which is what a Lanjut button needs to know. The date input is native and
 * range-limited, so anything it yields is already a plausible date.
 */
export function stepComplete(step, { a, b, email }) {
  if (step === 1) return Boolean(a.date);
  if (step === 2) return Boolean(b.date);
  return Boolean(email);
}

const card = (active) => ({
  background: 'var(--kertas-2)',
  border: '1px solid var(--divider)',
  borderRadius: 20,
  padding: '18px 18px 20px',
  // COMPLETED CARDS FLATTEN (ruling 3, "distinct card treatment"). The lift is
  // what says "this is where you are"; a stack of three lifted cards says it
  // three times and therefore not at all.
  boxShadow: active ? 'var(--shadow-card)' : 'none',
  marginTop: 14,
});

function StepBadge({ n, accent, done }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, borderRadius: 999, marginRight: 10,
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)',
        background: done ? accent : 'transparent',
        color: done ? 'var(--kertas-2)' : accent,
        border: `1px solid ${accent}`,
      }}
    >
      {n}
    </span>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.value      { a, b, email }
 * @param {Function} props.onChange (key, value) => void, key of 'a' | 'b' | 'email'
 * @param {Function} props.onGate   (side, form) => Promise<gate|null>
 * @param {Function} props.onAnswer (side, resolution) => void
 * @param {Function} props.onSubmit () => void
 */
export default function PasanganSteps({
  value, onChange, onGate, onAnswer, onSubmit, busy = false, error = null,
  step, setStep, gate, setGate,
}) {
  const [checking, setChecking] = useState(false);

  /**
   * Leave a step. On 1 and 2 this may open the season gate INSIDE the step,
   * which is the whole reason advancing is async.
   */
  async function advance(n) {
    const s = STEPS[n - 1];
    if (!stepComplete(n, value) || checking) return;
    if (!s.side) { onSubmit(); return; }
    setChecking(true);
    try {
      const needed = await onGate(s.side, value[s.side]);
      if (needed) { setGate(needed); return; }
      setStep(n + 1);
    } finally {
      setChecking(false);
    }
  }

  const summaryFor = (side) => birthSummary(value[side], {
    timeUnknown: CHROME_COPY.summary_time_unknown,
    genderWords: GENDER_WORDS,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); advance(step); }}>
      {STEPS.map((s) => {
        const active = step === s.n;
        const done = step > s.n;
        const openGate = active && gate && gate.side === s.side;

        return (
          <Reveal key={s.n} delay={0.24 + s.n * 0.04}>
            <div style={card(active)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StepBadge n={s.n} accent={s.accent} done={done} />
                  <Eyebrow style={{ margin: 0 }}>{s.label}</Eyebrow>
                </div>
                {done && (
                  // `type="button"`: inside a <form>, a button with no type
                  // submits it, so Ubah would have advanced the step it was
                  // trying to reopen.
                  <button
                    type="button"
                    onClick={() => { setGate(null); setStep(s.n); }}
                    disabled={busy || checking}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--clay)',
                    }}
                  >
                    {CHROME_COPY.step_edit}
                  </button>
                )}
              </div>

              {/* ── COMPLETED: ONE LINE, WHICH IS THE RECEIPT ──────── */}
              {done && s.side && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--tinta-soft)', marginTop: 10 }}>
                  {summaryFor(s.side)}
                </div>
              )}
              {done && !s.side && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--tinta-soft)', marginTop: 10 }}>
                  {value.email}
                </div>
              )}

              {/* ── ACTIVE ────────────────────────────────────────── */}
              {active && (
                <div style={{ marginTop: 14 }}>
                  {openGate ? (
                    // THE GATE, INSIDE THE STEP IT BELONGS TO. `season_gate_b_intro`
                    // is a different sentence for B, not a pronoun swap: for A it
                    // is a question about herself, for B about someone else.
                    <SeasonGate
                      season={gate}
                      onAnswer={(resolution) => { onAnswer(s.side, resolution); }}
                      intro={s.side === 'b' ? PASANGAN_COPY.season_gate_b_intro : null}
                    />
                  ) : s.side ? (
                    <BirthFields
                      value={value[s.side]}
                      onChange={(k, v) => onChange(s.side, { ...value[s.side], [k]: v })}
                      idPrefix={s.side}
                      personLabel={s.side.toUpperCase()}
                    />
                  ) : (
                    <>
                      <FieldLabel>{PASANGAN_COPY.form_email_label}</FieldLabel>
                      <input
                        id="pair-email"
                        type="email"
                        value={value.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        aria-label={PASANGAN_COPY.form_email_label}
                        required
                      />
                      <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>
                        {PASANGAN_COPY.form_email_help}
                      </div>
                    </>
                  )}

                  {!openGate && (
                    <div style={{ marginTop: 18 }}>
                      {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
                      <Button type="submit" disabled={busy || checking || !stepComplete(s.n, value)}>
                        {/* `Menyiapkan...` IS REUSED on the LAST step only, and it
                            is Reyner-approved for exactly that moment (2026-08-23).
                            Steps 1 and 2 say `Lanjut` even while the season check
                            is in flight: that request is a calendar lookup about a
                            DATE, it is fast, and calling it "Menyiapkan" would
                            promise a purchase two steps early. */}
                        {s.side ? CHROME_COPY.step_next
                          : (busy ? 'Menyiapkan...' : PASANGAN_COPY.form_submit)}
                      </Button>
                      {!s.side && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted-warm)', marginTop: 14 }}>
                          <Icon.lock size={13} /> Privat. Hanya bisa diakses via tautanmu.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </form>
  );
}
