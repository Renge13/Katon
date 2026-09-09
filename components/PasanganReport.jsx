'use client';

// ============================================================
// /kompatibilitas/[id] — pending, and the report
// ============================================================
// The page a buyer lands on after Xendit redirects, and the URL that IS her
// access: there is no account and, in v1, nothing is emailed (ruled 2026-09-08,
// email is store-only).
//
// ── IT ASKS THE SERVER, ALWAYS ─────────────────────────────
// `?bayar=selesai` in the URL is a HINT ABOUT THE UI and never an entitlement.
// It opens the waiting state instead of the product block, because the redirect
// regularly beats the webhook by a few seconds. `paid` flips in the verified
// webhook alone (rule 18) and this page re-reads it from `GET /api/pair/<id>`.
//
// ── NO CARD, NO PDF, NO SHARE IN v1 ────────────────────────
// Not an oversight. A compat card would put two people's archetypes on a
// shareable image, and person B never consented to anything - the "person B gets
// nothing" ruling is about what B receives, and a share surface is about what B
// is put on. Out of scope until Reyner rules it.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProseBlocks } from './ProseBlocks.jsx';
import CopyLink from './CopyLink.jsx';
import { readableError } from '../lib/site/readableError.js';
import { Reveal, Eyebrow, Button, Icon } from './kit.jsx';
import { GENDER_WORDS } from './BirthFields.jsx';
import { pairLine } from '../lib/site/birthSummary.js';
import { CHROME_COPY, PASANGAN_COPY } from '../lib/site/copy.js';
import { formatIdr } from '../lib/site/format.js';
import { compatPairRoute } from '../lib/site/routes.js';
import { viewFor } from '../lib/pair/reportView.js';

const wrap = { maxWidth: 460, margin: '0 auto', padding: '0 22px 96px' };

/** A sentinel `load()` returns for a transport failure, distinct from a 404 body. */
const FAILED = Symbol('failed');

/** The page's own URL, which IS the access. */
function PageUrl({ id, withCopy = false }) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}${compatPairRoute(id)}` : '';
  return <CopyLink url={url} withCopy={withCopy} />;
}

/**
 * Back to the front door, from any state. A report is not a dead end.
 *
 * A PLAIN ANCHOR, NOT `next/link`, and there are two reasons that point the same
 * way. Leaving a paid report for the funnel should be a real navigation - fresh
 * state, nothing of the report retained - and a `Link` here would prefetch the
 * front door from every report view for a link most readers never take. It also
 * keeps this component mountable under `node --test`, where `next/link` does not
 * resolve; that is a convenience rather than the reason, and it would not have
 * been enough on its own.
 */
function HomeLink() {
  return (
    <div style={{ marginTop: 34 }}>
      <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--clay)', textDecoration: 'none' }}>
        {CHROME_COPY.home_link}
      </a>
    </div>
  );
}

/**
 * The report's own shape, greyed.
 *
 * ── A BLANK PAGE IS NOT A WAITING STATE ────────────────────
 * Reyner's pending page sat for minutes with an eyebrow on it and nothing else,
 * so there was no way to tell "still working" from "broken". Six blocks, because
 * a compat reading has six; mirror-styled, using the same `.k-skel` bars the
 * mirror's prose skeleton uses, so the two waits look like one product.
 *
 * It renders whenever the reading has not arrived yet - the first load, a poll
 * after payment, or a refresh mid-render - which is what "a refresh during
 * rendering lands on the same skeleton" means.
 */
function ReportSkeleton() {
  return (
    <div aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ marginTop: i ? 34 : 28, paddingTop: i ? 28 : 0, borderTop: i ? '1px solid var(--divider)' : 'none' }}>
          <div aria-hidden="true" className="k-skel" style={{ height: 10, width: '38%', marginBottom: 14 }} />
          {[92, 100, 76].map((w, j) => (
            <div key={j} aria-hidden="true" className="k-skel" style={{ height: 13, width: `${w}%`, marginTop: j ? 12 : 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Same cadence as the mirror's `Pending`: 3s, and it gives up rather than spin. */
const POLL_MS = 3000;
const POLL_LIMIT = 100;


/**
 * The extra label above a block, for the two blocks that carry a glossary NAME.
 *
 * THE NAMES ARE THE GLOSSARY'S. `facts.pattern` and `facts.quadrant` come off the
 * serve payload, which reads them from `kompatibilitas.p4_*.name_id` and
 * `p5_q*.name_id`. Nothing here composes a label - only the EYEBROW is a copy
 * slot, and the name beside it is engine content (rule 14).
 */
/**
 * Which chrome SECTION label sits over a block, by the block's primary fact.
 *
 * Keyed on the `pN_` prefix rather than on the full fact id, because the engine
 * chooses WHICH cell fires within a beat - `p1_produces` or `p1_controls`,
 * `p2_clash` or `p2_harmony`, one of four `p5_q*` - and a map of full ids here
 * would have to re-derive that choice and could disagree with it. The beat is
 * the thing the section label names; the cell is what the headline names.
 */
const SECTION_BY_BEAT = {
  p1: PASANGAN_COPY.section_core,
  p2: PASANGAN_COPY.section_seat,
  p3: PASANGAN_COPY.section_element,
  p4: PASANGAN_COPY.section_pattern,
  p5: PASANGAN_COPY.section_rhythm,
};

/**
 * The block's two-level heading: chrome section label over the glossary name.
 *
 * ── EVERY BLOCK, NOT TWO (Y-2 Addendum 2 item 2) ───────────
 * It used to label the P4 badge and the P5 quadrant only, and every other block
 * carried the MODEL's heading. That produced the stutter Reyner saw on the walk:
 * the model titles a block after its badge, so `Pola Kontras` appeared as the
 * eyebrow, the glossary name AND the heading within three lines. Now the engine
 * owns every heading on the page and `modelHeadings={false}` closes the door.
 *
 * ── THE PRIMARY FACT IS THE FIRST ONE, IN THE BLOCK'S OWN ORDER ──
 * A braided block lists its lead fact first, so `fact_ids[0]` is the block's
 * subject. Scanning for the lowest beat number instead would retitle a block
 * that braids a later beat into an earlier one, which is the model's own
 * ordering being overridden by an arithmetic accident.
 */
const labelFor = (facts, names) => (block) => {
  const ids = block.fact_ids || [];
  for (const id of ids) {
    const eyebrow = SECTION_BY_BEAT[String(id).slice(0, 2)];
    if (!eyebrow) continue;
    // `names` is the server's projection of every fact's glossary `name_id`.
    // `facts.pattern` / `.quadrant` are the same two names by their older route,
    // kept as the fallback so a payload from before this commit still labels the
    // two blocks it always labelled rather than losing them.
    const name = names?.[id]
      ?? (id === 'p4_temperament' ? facts?.pattern : null)
      ?? (id === 'p5_pull_fit' ? facts?.quadrant : null)
      ?? null;
    // ── THE SAME WORDS TWICE IS THE STUTTER, NOT A LAYOUT ─────
    // `section_element` is "Penyeimbang Unsur" and so is
    // `kompatibilitas.p3_supplies.name_id`, so P3 rendered the phrase as its
    // eyebrow AND as its headline, one line apart - which is a smaller version
    // of exactly what Addendum 2 item 2 removes. Found by reading the rendered
    // text out of a failing assertion, not by inspecting the strings.
    //
    // Suppressing the duplicate is a TECHNICALITY (rule 9): whichever words are
    // ruled, saying them twice in two type sizes is a defect. The repo has the
    // same precedent in `tests/stage5-render.spec.mjs`, "THE FLOOR DOES NOT SAY
    // THE LABEL TWICE". Whether the two should be DIFFERENT words is Reyner's,
    // and it is flagged in the PR rather than decided here.
    return { eyebrow, name: name === eyebrow ? null : name };
  }
  return null;
};

export default function PasanganReport({ id, salesClosed = false, mockPayments = false }) {
  const [pair, setPair] = useState(null);       // the GET /api/pair body
  const [reading, setReading] = useState(null); // the GET .../reading body
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  /** A transport failure or a non-2xx that is not a 404. Drives the `error` view. */
  const [failed, setFailed] = useState(false);
  /**
   * The poll ran out of tries.
   *
   * ── "NEVER A FROZEN PAGE" IS THE PROMPT'S OWN WORDING ──────
   * `POLL_LIMIT` was already here and already stopped the loop, but stopping was
   * all it did: the skeleton stayed on screen, animating, for as long as the tab
   * was open. That is worse than an error, because it keeps promising. Running
   * out is now a visible outcome with a retry in it.
   */
  const [exhausted, setExhausted] = useState(false);

  const bayar = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('bayar')
    : null;
  const justPaid = bayar === 'selesai';
  // `?bayar=mock` is the free walk (PAYMENTS_PROVIDER=mock). It behaves like
  // `selesai` for the waiting state, and additionally performs the unlock once -
  // see the effect below.
  const mockPay = bayar === 'mock';

  const load = useCallback(async () => {
    // ── A THROWN FETCH IS A STATE, NOT A NULL ──────────────────
    // `.catch(() => null)` made a dead network indistinguishable from a 404: the
    // body came back null, `pair?.error` was undefined, and the page fell
    // through to the unpaid product block - offering to sell a reading to
    // someone who already owned one. `failed` is what the `error` view keys on.
    // `r.ok === false` rather than `!r.ok`, and the difference is deliberate.
    // A real `Response` always carries a boolean `ok`, so for anything the
    // network produces these are identical. Test stubs return bare
    // `{ json }` objects where `ok` is UNDEFINED, and `!r.ok` would read every
    // one of them as a transport failure - turning five green suites red on a
    // change that altered nothing about real behaviour. Positive evidence of
    // failure only.
    const body = await fetch(`/api/pair/${id}`)
      .then((r) => (r.ok === false && r.status !== 404
        ? Promise.reject(new Error(String(r.status)))
        : r.json()))
      .catch(() => FAILED);
    if (body === FAILED) { setFailed(true); return null; }
    setFailed(false);
    setPair(body);
    if (body?.status !== 'paid') return body;
    const r = await fetch(`/api/pair/${id}/reading`).then((x) => x.json()).catch(() => null);
    if (r?.status === 'paid') setReading(r);
    else setError(readableError(r));
    return body;
  }, [id]);

  // ── THE MOCK UNLOCK, ONCE ─────────────────────────────────
  // Fires only for `?bayar=mock`, and the route it calls answers 503 unless
  // PAYMENTS_PROVIDER=mock - which `paymentsProvider()` refuses in production.
  // So this effect is inert on production even if the query string is typed by
  // hand, and the guard is the server's rather than this component's.
  //
  // The ref stops React's development double-invoke from posting twice. The
  // unlock is idempotent anyway (a false->true transition), so the ref is
  // politeness rather than correctness - said here so nobody removes it thinking
  // it is load-bearing, or trusts it thinking it is.
  const unlockedRef = useRef(false);
  useEffect(() => {
    if (!mockPay || unlockedRef.current) return;
    unlockedRef.current = true;
    fetch(`/api/mock-pay/${id}`, { method: 'POST' }).catch(() => {});
  }, [mockPay, id]);

  useEffect(() => {
    let live = true;
    // `void` rather than awaited-and-then-set: the lint rule reads a promise
    // chain ending in setState off an effect body as a cascading render, and it
    // is right that the FIRST paint must not depend on it. Nothing renders until
    // `loaded`, and `loaded` is set inside the async continuation below.
    (async () => {
      await load();
      if (live) setLoaded(true);
    })();
    return () => { live = false; };
  }, [load]);

  // POLLING ONLY WHILE THE REDIRECT SAYS A PAYMENT JUST HAPPENED and the server
  // still says unpaid. A page opened cold on an unpaid pair does not poll - it
  // shows the product block and its button, which is the retry.
  useEffect(() => {
    // KEEP POLLING WHILE THE PROSE IS MISSING, not only while unpaid. The old
    // condition stopped the moment the row flipped to paid - which is exactly
    // when the render begins - so a reader whose first reading fetch failed or
    // timed out sat on a skeleton forever with nothing coming back for it.
    if (!loaded) return undefined;
    if (!justPaid && !mockPay && reading) return undefined;
    if (pair?.status === 'paid' && reading) return undefined;
    // ── A CHAIN OF TIMEOUTS, NOT AN INTERVAL ──────────────────
    // `setInterval` fires on the clock regardless of whether the last tick has
    // returned, and `load()` can call the reading endpoint - which renders
    // Gemini synchronously and takes seconds. At a 3s interval that stacks
    // request on request, each one starting work the previous one is still
    // doing, and the production spend guard (three renders per cache key per
    // hour) then starts refusing them into the floor.
    //
    // A self-scheduling timeout waits for the work before counting the next
    // tick, so there is never more than one request in flight.
    let tries = 0;
    let stopped = false;
    let timer = null;
    const tick = async () => {
      if (stopped) return;
      tries += 1;
      const body = await load();
      if (stopped) return;
      if (body?.status === 'paid') return;
      if (tries >= POLL_LIMIT) { setExhausted(true); return; }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [justPaid, mockPay, loaded, pair?.status, reading, load]);

  /**
   * Flip `paid` through the mock door, then re-read.
   *
   * The route is fenced server-side (`mockPaymentsAllowed()`), so this is inert
   * anywhere mock is not the provider - the button simply is not rendered there,
   * and if it somehow were, the POST would answer 503.
   */
  async function unlockMock() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/mock-pay/${id}`, { method: 'POST' })
      .then((r) => r.json()).catch(() => null);
    if (!res?.ok) setError(readableError(res));
    await load();
    setBusy(false);
  }

  /**
   * The error view's way out. Clears BOTH failure flags before re-reading, so a
   * retry that succeeds actually leaves the error view - clearing only `failed`
   * would leave an exhausted poll stuck in it forever, which is the frozen page
   * again wearing an error's clothes.
   */
  async function retry() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setExhausted(false);
    setFailed(false);
    await load();
    setBusy(false);
  }

  async function reopenInvoice() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const paid = await fetch(`/api/pay/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: 'compat' }),
    }).then((r) => r.json()).catch(() => null);
    if (paid?.invoiceUrl) window.open(paid.invoiceUrl, '_blank', 'noopener');
    else setError(readableError(paid));
    setBusy(false);
  }

  /**
   * The free unlock, as a CONTROL rather than a side effect of a query string.
   *
   * ── WHY IT IS A BUTTON AND NOT ONLY AN EFFECT ──────────────
   * It was only an effect, firing on `?bayar=mock`. Reyner clicked through on
   * the preview and landed on a BARE `/kompatibilitas/<id>` - no query, unpaid,
   * nothing on screen but a pending title. The walk stopped there. A refresh
   * would have done the same thing to anyone who reached the page correctly,
   * because a refresh keeps the URL but there was nothing on the page to act on
   * if the effect had already run and failed.
   *
   * So: whenever the provider is mock and the pair is unpaid, the unlock is
   * reachable FROM THE VIEW. The query is an accelerator, never the only way in.
   *
   * ── THE LABEL IS ENGLISH, DELIBERATELY ────────────────────
   * This control cannot exist in production - `paymentsProvider()` downgrades
   * mock to closed whenever VERCEL_ENV is production, and the route it calls
   * answers 503 there. It is a test affordance for whoever is walking the flow,
   * so it is written in the language of the person walking it and is
   * unmistakably not product copy. Rule 20 governs what a READER sees; no reader
   * can see this.
   */
  const mockUnlock = mockPayments && pair?.status !== 'paid' ? (
    <Reveal delay={0.2} style={{ marginTop: 20 }}>
      <div style={{ border: '1px dashed var(--muted-warm)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted-warm)', marginBottom: 10 }}>
          Preview only
        </div>
        <Button onClick={unlockMock} disabled={busy}>
          {busy ? 'Working...' : 'Simulate payment (mock)'}
        </Button>
      </div>
    </Reveal>
  ) : null;

  if (!loaded) return null;

  const view = viewFor({ pair, reading, failed, justPaid, mockPay, exhausted });
  // Engine facts, formatted. Null when either date is missing, and the header
  // then renders the title alone rather than half a line.
  const pairNames = reading ? pairLine(reading.pair, { genderWords: GENDER_WORDS }) : null;

  // ── ERROR: NEVER A DEAD END ──────────────────────────────
  // Any non-2xx that is not a 404, a thrown fetch, or a poll that ran out. It
  // shows the page URL because that URL is the reader's ONLY access - there is
  // no account and nothing is emailed - so a reader who has to write to us must
  // be able to quote the one thing that finds her reading again.
  if (view === 'error') {
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal><Eyebrow>{CHROME_COPY.error_title}</Eyebrow></Reveal>
        <Reveal delay={0.08}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: '14px 0 0' }}>
            {CHROME_COPY.error_body}
          </p>
        </Reveal>
        <Reveal delay={0.14} style={{ marginTop: 20 }}>
          <Button onClick={retry} disabled={busy}>{busy ? 'Menyiapkan...' : CHROME_COPY.step_next}</Button>
        </Reveal>
        <Reveal delay={0.2} style={{ marginTop: 22 }}>
          <PageUrl id={id} />
        </Reveal>
        <HomeLink />
      </div>
    );
  }

  if (view === 'not_found') {
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal><Eyebrow>{PASANGAN_COPY.notfound_title}</Eyebrow></Reveal>
        <HomeLink />
      </div>
    );
  }

  // ── UNPAID ───────────────────────────────────────────────
  if (view === 'pending_payment' || view === 'unpaid') {
    // Waiting on the webhook: the redirect said the payment went through and the
    // server has not caught up yet.
    if (view === 'pending_payment') {
      return (
        <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
          <Reveal><Eyebrow>{PASANGAN_COPY.pending_title}</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: '14px 0 0' }}>
              {PASANGAN_COPY.pending_body}
            </p>
          </Reveal>
          {mockUnlock}
          <div style={{ marginTop: 30 }}><ReportSkeleton /></div>
        </div>
      );
    }
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 30, lineHeight: 1.16, color: 'var(--tinta)', margin: 0 }}>
            {PASANGAN_COPY.page_title}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '12px 0 0' }}>
            {PASANGAN_COPY.unpaid_resume}
          </p>
        </Reveal>
        {/* THE PRICE COMES OFF THE SERVE PAYLOAD, which reads `priceFor(sku)`
            for the sku stored on the row - so a pair created at the launch tier
            keeps that tier if the ladder moves. */}
        {Number.isFinite(pair?.price) && (
          <Reveal delay={0.12} style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--tinta)' }}>{formatIdr(pair.price)}</div>
          </Reveal>
        )}
        {/* ── NO RESUME BUTTON WHILE SALES ARE CLOSED ──────────────
            An unpaid pair from before the close still has its link, and the
            honest thing to show is why it cannot be completed - not a button
            that 503s. The paid ones are unaffected: closing sales is not
            revoking what somebody already bought, and that is the sentence the
            body carries. */}
        {salesClosed ? (
          <Reveal delay={0.16} style={{ marginTop: 20 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px' }}>
              <Eyebrow style={{ marginBottom: 10 }}>{PASANGAN_COPY.sales_closed_title}</Eyebrow>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: 0 }}>
                {PASANGAN_COPY.sales_closed_body}
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.16} style={{ marginTop: 20 }}>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <Button onClick={reopenInvoice} disabled={busy}>{busy ? 'Menyiapkan...' : PASANGAN_COPY.form_submit}</Button>
          </Reveal>
        )}
        {mockUnlock}
      </div>
    );
  }

  // ── PAID, STILL RENDERING ────────────────────────────────
  // The row says paid and the prose has not arrived. This is the state Reyner
  // sat in for minutes with nothing but an eyebrow on screen, and the state a
  // REFRESH mid-render lands in - so it shows the report's own shape rather than
  // a blank page, and it is never a dead end.
  //
  // IT HAS ITS OWN WORDS NOW. It used to render `pending_title` ("Menunggu
  // Konfirmasi Pembayaran"), which is a lie to a reader who has already paid and
  // whose row already says so: she is waiting on the RENDER, not on the payment.
  // Two different waits were wearing one label because two branches happened to
  // reach for the same slot.
  if (view === 'rendering') {
    return (
      <div className="k-fade" style={wrap}>
        <div style={{ paddingTop: 60 }}>
          <Reveal><Eyebrow>{CHROME_COPY.rendering_title}</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: '14px 0 0' }}>
              {CHROME_COPY.rendering_body}
            </p>
          </Reveal>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</div>}
          <ReportSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="k-fade" style={wrap}>
      <div style={{ paddingTop: 60 }}>
        {/* ── THE HEADER: A TITLE AND THE TWO PEOPLE (Addendum 2 item 1) ──
            `paid_title` ("Bacaan Kalian Sudah Siap") was dropped in #112: it
            announced the report to the one reader already looking at it. This is
            its replacement. The line under the title is ENGINE FACTS, never
            prose - she typed the second birth date herself, possibly days ago,
            and the top of a paid report is where she confirms it is about the
            right two people. No archetype names: `p0_opening` already does that
            inside the reading. */}
        <Reveal>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 30, lineHeight: 1.16, letterSpacing: '-.01em', color: 'var(--tinta)', margin: 0 }}>
            {PASANGAN_COPY.page_title}
          </h1>
        </Reveal>
        {pairNames && (
          <Reveal delay={0.08}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.6, color: 'var(--muted-warm)', margin: '10px 0 0' }}>
              {pairNames}
            </p>
          </Reveal>
        )}

        {/* ── THE FLOOR RENDERS IDENTICALLY, AND THAT IS THE DESIGN ──
            `served_from` is 'render', 'cache' or 'floor', and this page does not
            branch on it. The floor is assembled from Reyner's own ruled glossary
            cells - it is the product's words, not a degraded mode (rule 15) - so
            marking it would tell a reader she got something lesser when she got
            the sentences he wrote. It stays in the payload as the passive
            detector of a dead provider, which is a question for the operator. */}
        {/* EVERY BLOCK GETS THE SAME TWO-LEVEL HEADING, and none of them gets
            the model's (Addendum 2 item 2). `modelHeadings={false}` is what
            closes the door: without it a block with no section mapping would
            fall back to whatever the model titled it. */}
        <ProseBlocks
          reading={reading.reading}
          labelFor={labelFor(reading.facts, reading.names)}
          modelHeadings={false}
        />

        {/* THE LINK IS THE ACCESS. No account, and nothing is emailed in v1, so
            the URL on screen is the only way back - which is why it now has a
            COPY button beside it (ruling 2) rather than asking a reader on a
            phone to select a wrapped URL by hand. */}
        <div style={{ marginTop: 44, paddingTop: 28, borderTop: '1px solid var(--divider)' }}>
          <Reveal>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13, color: 'var(--muted-warm)', lineHeight: 1.6 }}>
              <Icon.lock size={13} />
              <span>{PASANGAN_COPY.link_keep}</span>
            </div>
            <PageUrl id={id} withCopy />
          </Reveal>
        </div>

        <HomeLink />
      </div>
    </div>
  );
}
