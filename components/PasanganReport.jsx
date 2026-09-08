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

import { useCallback, useEffect, useState } from 'react';
import { ProseBlocks } from './ProseBlocks.jsx';
import { readableError } from '../lib/site/readableError.js';
import { Reveal, Eyebrow, Button, Icon } from './kit.jsx';
import { PASANGAN_COPY } from '../lib/site/copy.js';
import { formatIdr } from '../lib/site/format.js';
import { compatPairRoute } from '../lib/site/routes.js';

const wrap = { maxWidth: 460, margin: '0 auto', padding: '0 22px 96px' };

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
const labelFor = (facts) => (block) => {
  const ids = block.fact_ids || [];
  if (ids.includes('p4_temperament') && facts?.pattern) {
    return { eyebrow: PASANGAN_COPY.report_badge_eyebrow, name: facts.pattern };
  }
  if (ids.includes('p5_pull_fit') && facts?.quadrant) {
    return { eyebrow: PASANGAN_COPY.report_quadrant_eyebrow, name: facts.quadrant };
  }
  return null;
};

export default function PasanganReport({ id }) {
  const [pair, setPair] = useState(null);       // the GET /api/pair body
  const [reading, setReading] = useState(null); // the GET .../reading body
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const justPaid = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('bayar') === 'selesai';

  const load = useCallback(async () => {
    const body = await fetch(`/api/pair/${id}`).then((r) => r.json()).catch(() => null);
    setPair(body);
    if (body?.status !== 'paid') return body;
    const r = await fetch(`/api/pair/${id}/reading`).then((x) => x.json()).catch(() => null);
    if (r?.status === 'paid') setReading(r);
    else setError(readableError(r));
    return body;
  }, [id]);

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
    if (!justPaid || !loaded) return undefined;
    if (pair?.status === 'paid') return undefined;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const body = await load();
      if (body?.status === 'paid' || tries >= POLL_LIMIT) clearInterval(timer);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [justPaid, loaded, pair?.status, load]);

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

  if (!loaded) return null;

  if (pair?.error === 'not_found') {
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal><Eyebrow>{PASANGAN_COPY.notfound_title}</Eyebrow></Reveal>
      </div>
    );
  }

  // ── UNPAID ───────────────────────────────────────────────
  if (pair?.status !== 'paid') {
    // Waiting on the webhook: the redirect said the payment went through and the
    // server has not caught up yet.
    if (justPaid) {
      return (
        <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
          <Reveal><Eyebrow>{PASANGAN_COPY.pending_title}</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: '14px 0 0' }}>
              {PASANGAN_COPY.pending_body}
            </p>
          </Reveal>
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
        <Reveal delay={0.16} style={{ marginTop: 20 }}>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Button onClick={reopenInvoice} disabled={busy}>{busy ? 'Menyiapkan...' : PASANGAN_COPY.form_submit}</Button>
        </Reveal>
      </div>
    );
  }

  // ── PAID ─────────────────────────────────────────────────
  if (!reading) {
    return (
      <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
        <Reveal><Eyebrow>{PASANGAN_COPY.pending_title}</Eyebrow></Reveal>
        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="k-fade" style={wrap}>
      <div style={{ paddingTop: 60 }}>
        <Reveal><Eyebrow>{PASANGAN_COPY.paid_title}</Eyebrow></Reveal>

        {/* ── THE FLOOR RENDERS IDENTICALLY, AND THAT IS THE DESIGN ──
            `served_from` is 'render', 'cache' or 'floor', and this page does not
            branch on it. The floor is assembled from Reyner's own ruled glossary
            cells - it is the product's words, not a degraded mode (rule 15) - so
            marking it would tell a reader she got something lesser when she got
            the sentences he wrote. It stays in the payload as the passive
            detector of a dead provider, which is a question for the operator. */}
        <ProseBlocks reading={reading.reading} labelFor={labelFor(reading.facts)} />

        {/* THE LINK IS THE ACCESS. No account, and nothing is emailed in v1, so
            the URL on screen is the only way back. */}
        <div style={{ marginTop: 44, paddingTop: 28, borderTop: '1px solid var(--divider)' }}>
          <Reveal>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13, color: 'var(--muted-warm)', lineHeight: 1.6 }}>
              <Icon.lock size={13} />
              <span>{PASANGAN_COPY.link_keep}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--tinta-soft)', marginTop: 8, wordBreak: 'break-all' }}>
              {typeof window !== 'undefined' ? `${window.location.origin}${compatPairRoute(id)}` : ''}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
