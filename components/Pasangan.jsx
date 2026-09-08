'use client';

// ============================================================
// /kompatibilitas — the pre-payment page
// ============================================================
// The first surface a buyer of the paid product can see. Ruled 2026-09-07:
// Mirror and Compatibility are two front-door paths and neither is a
// prerequisite for the other, so this page assumes no reading and no account.
//
// ── NOTHING COMPUTED IS SHOWN BEFORE PAYMENT ───────────────
// No chart, no archetype, no relation, no quadrant, no tease. The only thing
// this page computes about a birth is the SEASON GATE, and that is a public
// calendar fact about a DATE - whether a 節 falls inside it - not a fact about a
// person. It is asked before payment because a boundary birth changes the month
// pillar, and a buyer must not pay for a reading of the wrong chart.
//
// ── THE SLOTS ARE HOLES ON PURPOSE ─────────────────────────
// Every reader-facing string is `PASANGAN_COPY.*`, and every one of them is a
// `PENDING()` sentinel until Reyner rules it. The production build REFUSES while
// any survives; the preview build passes, which is what lets him walk this page
// on a phone in order to rule them.
// ============================================================

import { useEffect, useState } from 'react';
import { BirthFields, FieldLabel } from './BirthFields.jsx';
import { SeasonGate, readableError } from './Funnel.jsx';
import { Reveal, Eyebrow, Button, Icon } from './kit.jsx';
import { PASANGAN_COPY } from '../lib/site/copy.js';
import { compatPairRoute } from '../lib/site/routes.js';
import { priceFor } from '../lib/pricing.js';
import { formatIdr } from '../lib/site/format.js';

const wrap = { maxWidth: 460, margin: '0 auto', padding: '0 22px 96px' };
const EMPTY = { date: '', time: '', gender: '' };

/** The five inclusions, in the reading's own P1..P5 journey order. */
const INCLUDES = [
  PASANGAN_COPY.includes_1, PASANGAN_COPY.includes_2, PASANGAN_COPY.includes_3,
  PASANGAN_COPY.includes_4, PASANGAN_COPY.includes_5,
];

/**
 * One person's birth, in the shape `POST /api/pair` validates.
 *
 * The hour is SNAPPED to the whole hour here as well as being asked for with
 * `step=3600`, because a browser that ignores step must not turn into stored
 * precision - the same reason the mirror snaps at its own submit.
 */
function birthBody(form, extra = {}) {
  const time = form.time ? `${form.time.slice(0, 2)}:00` : null;
  return {
    birthDate: form.date,
    birthTime: time,
    gender: form.gender || null,
    ...extra,
  };
}

export default function Pasangan({ initialA = null }) {
  const [a, setA] = useState(initialA ? { ...EMPTY, ...initialA } : EMPTY);
  const [b, setB] = useState(EMPTY);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // A season answer per side, once given. `{}` means "not sure", which is a real
  // answer and is why the value is an object rather than a string.
  const [resolved, setResolved] = useState({});
  // Which side is being asked right now, with the term it is being asked about.
  const [gate, setGate] = useState(null);
  const [stage, setStage] = useState('form');
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  /**
   * Does this side still need the gate? Same predicate the mirror uses at
   * `Funnel.jsx`'s submit: a turn inside the day is only ambiguous if no hour was
   * given, or if the hour given is the one CONTAINING the turn.
   */
  async function gateFor(side, form) {
    if (resolved[side]) return null;
    const turn = await fetch('/api/season-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate: form.date }),
    }).then((r) => r.json()).catch(() => null);
    if (!turn?.needsHour) return null;
    const birthHour = form.time ? Number(form.time.slice(0, 2)) : null;
    if (birthHour !== null && birthHour !== turn.hour) return null;
    return { side, birthDate: form.date, term: turn.term, at: turn.at, birthHour };
  }

  async function checkout(answers) {
    const created = await fetch('/api/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        a: birthBody(a, answers.a || {}),
        b: birthBody(b, answers.b || {}),
        a_reading_id: initialA?.readingId || null,
      }),
    }).then((r) => r.json()).catch(() => null);

    // THE SERVER IS THE AUTHORITY ON THE GATE, and this branch is not dead code
    // even though the client asks first: `needsTermSide` runs against the engine's
    // own solar-term table, and a client that skipped the question - a stale tab,
    // a race, a future refactor - must be sent back rather than sold a reading of
    // the wrong month pillar. It is the same 409 the handler documents.
    if (created?.error === 'needs_term_side') {
      const side = created.needs_term_side[0];
      const term = created.terms?.[side] || {};
      const form = side === 'a' ? a : b;
      setGate({
        side,
        birthDate: form.date,
        term: term.term,
        at: term.at,
        birthHour: form.time ? Number(form.time.slice(0, 2)) : null,
      });
      return;
    }
    if (!created?.id) { setError(readableError(created)); return; }

    const paid = await fetch(`/api/pay/${created.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: 'compat', email }),
    }).then((r) => r.json()).catch(() => null);

    if (!paid?.ok) { setError(readableError(paid)); return; }

    // Bookmarkable without remounting, exactly as the mirror does it: pushState
    // swaps the URL and keeps this component's state, where router.push would
    // mount the report route and discard the invoice link she may still need.
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', compatPairRoute(created.id));
    }
    // Opened from the click gesture so it is not popup-blocked; the link is also
    // rendered in the pending state, which is the fallback when it is.
    if (paid.invoiceUrl) {
      setInvoiceUrl(paid.invoiceUrl);
      window.open(paid.invoiceUrl, '_blank', 'noopener');
    }
    setStage('pending');
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      // A before B, one at a time: two gates on one screen would ask the reader
      // two versions of the same unfamiliar question at once.
      const next = (await gateFor('a', a)) || (await gateFor('b', b));
      if (next) { setGate(next); return; }
      await checkout(resolved);
    } catch {
      setError(readableError(null));
    } finally {
      setBusy(false);
    }
  }

  async function onGateAnswer(resolution) {
    const side = gate.side;
    const answers = { ...resolved, [side]: resolution };
    setResolved(answers);
    setGate(null);
    setBusy(true);
    setError(null);
    try {
      // The OTHER side may still need asking; only then does it go to checkout.
      const other = side === 'a' ? 'b' : 'a';
      const form = other === 'a' ? a : b;
      const next = answers[other] ? null : await gateFor(other, form);
      if (next) { setGate(next); return; }
      await checkout(answers);
    } catch {
      setError(readableError(null));
    } finally {
      setBusy(false);
    }
  }

  if (gate) {
    return (
      <SeasonGate
        season={gate}
        onAnswer={onGateAnswer}
        intro={gate.side === 'b' ? PASANGAN_COPY.season_gate_b_intro : null}
      />
    );
  }

  if (stage === 'pending') {
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal><Eyebrow>{PASANGAN_COPY.pending_title}</Eyebrow></Reveal>
        <Reveal delay={0.08}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: '14px 0 0' }}>
            {PASANGAN_COPY.pending_body}
          </p>
        </Reveal>
        {invoiceUrl && (
          <Reveal delay={0.14} style={{ marginTop: 22 }}>
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--clay)' }}>
              {invoiceUrl}
            </a>
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ paddingTop: 60 }}>
        <Reveal>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 32, lineHeight: 1.14, letterSpacing: '-.01em', color: 'var(--tinta)', margin: 0 }}>
            {PASANGAN_COPY.page_title}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '12px 0 0' }}>
            {PASANGAN_COPY.page_lead}
          </p>
        </Reveal>

        <Reveal delay={0.14} style={{ marginTop: 24 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {INCLUDES.map((line) => (
              <li key={line} style={{ display: 'flex', gap: 9, alignItems: 'baseline', fontSize: 14, lineHeight: 1.55, color: 'var(--tinta-soft)' }}>
                <Icon.check size={13} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* THE PRICE IS NOT A STRING. It resolves from lib/pricing.js at render
            time; `price_note` is the sentence around it. A price typed into a
            copy bank is a second source of truth for what a thing costs, and the
            launch/list tier is decided in one place. */}
        <Reveal delay={0.18} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--tinta)' }}>{formatIdr(priceFor('compat'))}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-warm)', marginTop: 4, lineHeight: 1.55 }}>{PASANGAN_COPY.price_note}</div>
        </Reveal>

        <form onSubmit={onSubmit}>
          <Reveal delay={0.24} style={{ marginTop: 26 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <Eyebrow style={{ marginBottom: 14 }}>{PASANGAN_COPY.form_a_legend}</Eyebrow>
              <BirthFields value={a} onChange={(k, v) => setA((f) => ({ ...f, [k]: v }))} idPrefix="a" personLabel="A" />
            </div>
          </Reveal>

          <Reveal delay={0.28} style={{ marginTop: 14 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <Eyebrow style={{ marginBottom: 14 }}>{PASANGAN_COPY.form_b_legend}</Eyebrow>
              <BirthFields value={b} onChange={(k, v) => setB((f) => ({ ...f, [k]: v }))} idPrefix="b" personLabel="B" />
            </div>
          </Reveal>

          <Reveal delay={0.32} style={{ marginTop: 14 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <FieldLabel>{PASANGAN_COPY.form_email_label}</FieldLabel>
              <input
                id="pair-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label={PASANGAN_COPY.form_email_label}
                required
              />
              {/* STORE-ONLY FOR v1, ruled 2026-09-08: the email is kept for access
                  and recovery and NOTHING is sent. The help slot must stay true to
                  that - a promise of delivery would be the product saying
                  something untrue about itself. */}
              <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>{PASANGAN_COPY.form_email_help}</div>
            </div>
          </Reveal>

          <Reveal delay={0.36} style={{ marginTop: 22 }}>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {/* `Menyiapkan...` IS REUSED, not newly ruled. Reyner approved it for
                exactly this moment on the checkout button (2026-08-23) and rule 20
                is one voice everywhere, so a second word for the same moment would
                be a second register. See the same reasoning at Funnel.jsx's submit. */}
            <Button type="submit" disabled={busy}>{busy ? 'Menyiapkan...' : PASANGAN_COPY.form_submit}</Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted-warm)', marginTop: 14 }}>
              <Icon.lock size={13} /> Bersifat pribadi. Hanya untukmu.
            </div>
          </Reveal>
        </form>
      </div>
    </div>
  );
}

/**
 * Reads `?dari=<token>` and prefills A from that reading.
 *
 * A REFERENCE, NEVER A CREDENTIAL. `a_reading_id` is stored on the pair so a
 * later session can tell where the purchase came from; nothing about the pair is
 * gated on it, and an absent or bogus token simply means an empty form.
 */
export function PasanganFromQuery() {
  const [initialA, setInitialA] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const token = new URLSearchParams(window.location.search).get('dari');
    // Deferred rather than set synchronously: a setState in an effect's own body
    // triggers a cascading render, which the lint rule catches and which would
    // paint the empty form once before painting it again identical.
    if (!token) {
      queueMicrotask(() => { if (live) setReady(true); });
      return () => { live = false; };
    }
    fetch(`/api/mirror/${token}`)
      .then((r) => r.json())
      .then((served) => {
        // The mirror's serve payload deliberately carries NO birth data - the free
        // card is built with `birthDate: null` so nothing about a birth leaves the
        // server on that path. So there is nothing to prefill from it, and the
        // link's only durable effect is the `a_reading_id` reference below.
        if (live) setInitialA(served?.token ? { readingId: served.token } : null);
      })
      .catch(() => {})
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  if (!ready) return null;
  return <Pasangan initialA={initialA} />;
}
