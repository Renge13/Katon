import Link from 'next/link';
import StaticPage, { Card, P } from '@/components/StaticPage.jsx';
import { SITE_COPY, CHROME_COPY, PASANGAN_COPY } from '@/lib/site/copy';
import { SKUS, priceFor, isSellable } from '@/lib/pricing';
import { formatIdr } from '@/lib/site/format';
import { compatCheckoutOpen } from '@/lib/paymentFence';
import { COMPAT_ROUTE } from '@/lib/site/routes';

// /harga — the product catalogue. Xendit's review asks for products with
// descriptions and prices reachable BEFORE checkout; this is that page.
//
// NO RUPIAH FIGURE IS WRITTEN HERE. Every number comes from lib/pricing.js, so
// flipping LAUNCH_PRICING changes this page with no edit and no chance of the
// catalogue advertising one price while the invoice charges another.
//
// THE BUY PATH IS GATED ON isSellable(), not on copy. A SKU outside SELLABLE_SKUS
// (lib/pricing.js) renders with the `segera` label and no action. Both rows are
// sellable today.
//
// THE COMPAT LINK FOLLOWS THE PAYMENT FENCE (Prompt BA §3), exactly as the result
// page's compat block does: checkoutOpen() is read here, on the server, and while
// payments are fenced the row shows its name, body and price with no link.
//
// The free row is first and says "Gratis" in the same slot the paid rows put a
// price. A reader arriving from the footer must not be able to mistake the
// reading itself for a paid product.

const q = SITE_COPY.harga;

export const metadata = q.meta;

function Badge({ children, tone }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: tone === 'quiet' ? 'var(--muted-warm)' : 'var(--clay)',
        background: tone === 'quiet' ? 'var(--kertas-3)' : 'var(--clay-wash)',
        borderRadius: 999,
        padding: '4px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function Row({ name, price, badge, badgeTone, anchor, body, note, action }) {
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 20,
            color: 'var(--tinta)',
            margin: 0,
          }}
        >
          {name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              color: 'var(--kayu)',
            }}
          >
            {price}
          </span>
          {badge && <Badge tone={badgeTone}>{badge}</Badge>}
        </div>
      </div>

      {anchor && (
        <div style={{ fontSize: 12.5, color: 'var(--muted-warm)', marginTop: 6 }}>
          <s>{anchor}</s> {q.listLabel}
        </div>
      )}

      {typeof body === 'string' ? <P style={{ margin: '12px 0 0' }}>{body}</P> : body}
      {note && (
        <P style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--muted-warm)' }}>{note}</P>
      )}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </Card>
  );
}

// A row's note is either a plain sentence or a sentence with the funnel linked
// inside it. The paid row (Bacaan Mendalam since 2026-08-05, Complete Edition
// before it) takes the linked form because it is the only product with a live
// purchase path and that path is not a button on this page - the offer lives at
// the end of the free reading, so the steps have to be readable here.
function noteNode(copy) {
  if (!copy.noteLink) return copy.note ?? null;
  return (
    <>
      {copy.noteBefore}
      <Link href="/" style={{ color: 'var(--clay)', fontWeight: 600 }}>
        {copy.noteLink}
      </Link>
      {copy.noteAfter}
    </>
  );
}

// ── THE COMPLETE EDITION BODY IS THE OFFER'S (Reyner, 2026-10-01, Prompt AZ §4) ──
// "the Complete Edition body becomes the same headline, description and three lines,
// from the same copy-bank entries (not duplicated strings)". So it is READ from
// CHROME_COPY, the entries components/Funnel.jsx's Offer renders, and the catalogue
// cannot drift from the offer. EXCEPT THE DESCRIPTION (Reyner, 2026-10-01, Prompt BA
// §3): the offer's says "gratis di atas", which is false on this page, so /harga
// renders its own entry, `harga.artifact.description`.
function ArtifactBody() {
  return (
    <div style={{ marginTop: 12 }}>
      <P style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.45, color: 'var(--tinta)' }}>
        {CHROME_COPY.offer_headline}
      </P>
      <P style={{ margin: '8px 0 0' }}>{q.artifact.description}</P>
      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {CHROME_COPY.offer_items.map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--tinta)' }}>{item.label}</div>
            <P style={{ margin: '3px 0 0', fontSize: 14 }}>{item.text}</P>
          </div>
        ))}
      </div>
    </div>
  );
}

// One paid row, driven entirely by the SKU table.
function PaidRow({ sku, copy, salesOpen }) {
  const price = priceFor(sku);
  const list = SKUS[sku].list;
  const sellable = isSellable(sku);
  // Show the anchor only while the launch price is actually below list. With
  // LAUNCH_PRICING off there is no discount to anchor and no cohort to label.
  const discounted = price < list;
  // ── COMPAT CLOSED, MARKED AS /kompatibilitas MARKS IT (Prompt BG §6, 2026-10-06) ──
  // While compat is off sale the row says so in the compat page's own closed strings,
  // READ from PASANGAN_COPY (never copied into this bank, lib/site/copy.js says why),
  // and nothing on it looks buyable: no launch badge, no struck-through list price, no
  // link. The name, body and price stay, because this page is the catalogue.
  const closed = sku === 'compat' && !salesOpen;

  return (
    <Row
      name={copy.name}
      price={formatIdr(price)}
      badge={closed ? PASANGAN_COPY.sales_closed_title : sellable ? (discounted ? q.launchLabel : null) : q.soonLabel}
      badgeTone={sellable && !closed ? 'accent' : 'quiet'}
      anchor={discounted && !closed ? formatIdr(list) : null}
      body={sku === 'artifact' ? <ArtifactBody /> : copy.body}
      note={closed ? PASANGAN_COPY.sales_closed_body : noteNode(copy)}
      action={copy.link && salesOpen ? (
        <Link
          href={COMPAT_ROUTE}
          style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--clay)', textDecoration: 'none' }}
        >
          {copy.link}
        </Link>
      ) : null}
    />
  );
}

export default function HargaPage() {
  // Read once, on the server. The compat row's link is the only paid CTA on this page,
  // so it reads the compat answer (K2, 2026-10-02): payments open AND COMPAT_SALES=open.
  const compatOpen = compatCheckoutOpen();
  return (
    <StaticPage title={q.title} lead={q.lead}>
      <Row name={q.free.name} price={q.free.price} body={q.free.body} />
      <PaidRow sku="artifact" copy={q.artifact} />
      <PaidRow sku="compat" copy={q.compat} salesOpen={compatOpen} />

      <P style={{ marginTop: 24, fontSize: 13.5 }}>{q.payment}</P>

      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--clay)',
          textDecoration: 'none',
        }}
      >
        {q.cta}
      </Link>
    </StaticPage>
  );
}
