import Link from 'next/link';
import StaticPage, { Card, P } from '@/components/StaticPage.jsx';
import { SITE_COPY } from '@/lib/site/copy';
import { SKUS, priceFor, isSellable } from '@/lib/pricing';
import { formatIdr } from '@/lib/site/format';

// /harga — the product catalogue. Xendit's review asks for products with
// descriptions and prices reachable BEFORE checkout; this is that page.
//
// NO RUPIAH FIGURE IS WRITTEN HERE. Every number comes from lib/pricing.js, so
// flipping LAUNCH_PRICING changes this page with no edit and no chance of the
// catalogue advertising one price while the invoice charges another.
//
// THE BUY PATH IS GATED ON isSellable(), not on copy. `compat` is priced and not
// sellable (SELLABLE_SKUS in lib/pricing.js), so it renders with the `segera`
// label and no action. When Prompt E ships and compat enters that list, this page
// follows on its own.
//
// The free row is first and says "Gratis" in the same slot the paid rows put a
// price. A reader arriving from the footer must not be able to mistake the
// reading itself for a paid product.

const q = SITE_COPY.harga;

export const metadata = {
  title: 'Harga · KATON',
  description:
    'Bacaan Katon gratis dan lengkap. Complete Edition dan Bacaan Kompatibilitas adalah tambahan opsional.',
};

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

function Row({ name, price, badge, badgeTone, anchor, body, note }) {
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

      <P style={{ margin: '12px 0 0' }}>{body}</P>
      {note && (
        <P style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--muted-warm)' }}>{note}</P>
      )}
    </Card>
  );
}

// One paid row, driven entirely by the SKU table.
function PaidRow({ sku, copy }) {
  const price = priceFor(sku);
  const list = SKUS[sku].list;
  const sellable = isSellable(sku);
  // Show the anchor only while the launch price is actually below list. With
  // LAUNCH_PRICING off there is no discount to anchor and no cohort to label.
  const discounted = price < list;

  return (
    <Row
      name={copy.name}
      price={formatIdr(price)}
      badge={sellable ? (discounted ? q.launchLabel : null) : q.soonLabel}
      badgeTone={sellable ? 'accent' : 'quiet'}
      anchor={discounted ? formatIdr(list) : null}
      body={copy.body}
      note={copy.note}
    />
  );
}

export default function HargaPage() {
  return (
    <StaticPage title={q.title} lead={q.lead}>
      <Row name={q.free.name} price={q.free.price} body={q.free.body} />
      <PaidRow sku="artifact" copy={q.artifact} />
      <PaidRow sku="compat" copy={q.compat} />

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
