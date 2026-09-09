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
import { readableError } from '../lib/site/readableError.js';
import { Reveal, Eyebrow, Icon } from './kit.jsx';
import PasanganSteps from './PasanganSteps.jsx';
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

export default function Pasangan({ initialA = null, salesClosed = false }) {
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
   * Which step is open: 1 Kamu, 2 Dia, 3 Email.
   *
   * IT STARTS AT 1 EVEN WITH `?dari`, and that is a correction to the prompt
   * rather than a shortcut. Y-2 commit 2 says "`?dari=<token>` prefills step 1
   * and starts on step 2" - but the mirror's serve payload carries NO birth
   * data at all (the free card is built with `birthDate: null` so nothing about
   * a birth leaves the server on that path), which `PasanganFromQuery` below
   * says in its own comment. There is nothing to prefill. Starting on step 2
   * would show a COMPLETED step 1 summarising an empty birth, which is worse
   * than starting at the beginning. `?dari` keeps its only real effect: the
   * `a_reading_id` reference on the pair.
   */
  const [step, setStep] = useState(1);

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
      // REOPEN THAT SIDE'S STEP, not just the gate. Since Y-2 commit 2 the gate
      // renders inside a step, so setting it while step 3 is open would render
      // nothing at all - the reader would sit on the email card with a silent
      // failed checkout. `a` is step 1 and `b` is step 2.
      setStep(side === 'a' ? 1 : 2);
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

    // ── MOCK REALLY NAVIGATES, AND THE OLD COMMENT LIED ───────
    // This block used to `pushState` and then `setStage('pending')`, under a
    // comment reading "the report page does the unlock; here it just navigates".
    // **pushState does not navigate.** It swaps the URL and mounts nothing, so
    // the report route never loaded and this component rendered its OWN pending
    // view - whose only affordance is an invoice link that mock never sets.
    // Reyner's walk stopped on that screen: bare URL, no query, nothing to do.
    //
    // `location.assign` is a real navigation, so `/kompatibilitas/<id>` mounts
    // and does the unlock. It is deliberately NOT the pushState below: that one
    // exists for the Xendit path, where the invoice link lives in this
    // component's state and must survive.
    if (paid.mock) {
      window.location.assign(`${compatPairRoute(created.id)}?bayar=mock`);
      return;
    }

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

  /**
   * The last step's submit. It no longer runs the gates.
   *
   * ── THE GATES MOVED, AND WITH THEM A REAL DEFECT ───────────
   * This used to ask `/api/season-check` for A and then for B at CHECKOUT, and
   * whichever one needed answering took over the whole page. So a reader could
   * fill six fields, tap Lanjut ke Pembayaran, and be shown an unfamiliar
   * question about a solar term with her form nowhere in sight - and if BOTH
   * births were boundary births she answered two of them back to back, with no
   * way to tell which person each was about beyond one intro sentence.
   *
   * The stepper asks each side's gate when THAT side's step advances, so the
   * question arrives beside the birth it is about, and it can only ever be one
   * at a time by construction rather than by sequencing.
   */
  async function onSubmit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await checkout(resolved);
    } catch {
      setError(readableError(null));
    } finally {
      setBusy(false);
    }
  }

  /**
   * A gate answered inside a step. Records it and advances that step; it never
   * goes to checkout, because a gate now belongs to step 1 or step 2 and step 3
   * is the only thing that buys anything.
   */
  function onGateAnswer(side, resolution) {
    setResolved((prev) => ({ ...prev, [side]: resolution }));
    setGate(null);
    setStep((n) => n + 1);
  }

  // ── SALES CLOSED: THE FORM IS NOT SHOWN AT ALL ────────────
  // Decided on the server (app/kompatibilitas/page.js) and passed in, because
  // PAYMENTS_PROVIDER is a server variable. Rendering the form and refusing at
  // submit is the shape of the defect this hotfix exists to fix, one level up: a
  // reader must not be invited into a path that cannot complete.
  //
  // The product block STAYS - title, lead, inclusions - so the page still says
  // what the thing is. What goes is the price, the form and the button, because
  // those are the parts that promise a purchase.
  if (salesClosed) {
    return (
      <div className="k-fade" style={wrap}>
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

          <Reveal delay={0.2} style={{ marginTop: 26 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px' }}>
              <Eyebrow style={{ marginBottom: 10 }}>{PASANGAN_COPY.sales_closed_title}</Eyebrow>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: 0 }}>
                {PASANGAN_COPY.sales_closed_body}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  // THE FULL-PAGE GATE IS GONE. It renders inside its own step now
  // (components/PasanganSteps.jsx); see `onSubmit` above for why.

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

        {/* THE THREE CARDS BECAME A STEPPER (Y-2 commit 2). The product block
            above is unchanged and still comes first: she reads what the thing is
            and what it costs before she is asked for anything. */}
        <PasanganSteps
          value={{ a, b, email }}
          onChange={(key, next) => {
            if (key === 'a') setA(next);
            else if (key === 'b') setB(next);
            else setEmail(next);
          }}
          onGate={gateFor}
          onAnswer={onGateAnswer}
          onSubmit={onSubmit}
          busy={busy}
          error={error}
          step={step}
          setStep={setStep}
          gate={gate}
          setGate={setGate}
        />
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
export function PasanganFromQuery({ salesClosed = false }) {
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
  return <Pasangan initialA={initialA} salesClosed={salesClosed} />;
}
