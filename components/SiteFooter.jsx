import Link from 'next/link';
import { ENTITY } from '@/lib/site/entity';
import { SITE_COPY } from '@/lib/site/copy';

// The site footer. A SERVER component with no 'use client' and no hooks, so the
// entity name, the registered address and the five legal links are in the HTML
// document itself. That is the whole point: the Xendit reviewer must be able to
// read the merchant identity from view-source, without executing JS.
//
// Mounted once in app/layout.js, so it renders on /, /harga, /tentang, the legal
// pages and the reading route /r/[token] alike.
//
// Visually quiet by instruction. The funnel is the product; this is compliance
// chrome. Small type, muted ink, one hairline above it, nothing that competes
// with the primary action.

const q = SITE_COPY.footer;

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--divider)',
        marginTop: 24,
        padding: '30px 22px 40px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 18px',
            marginBottom: 20,
          }}
        >
          {q.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: 'var(--tinta-soft)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--muted-warm)' }}>
          <div>
            {q.operatorLabel} <strong style={{ fontWeight: 600, color: 'var(--tinta-soft)' }}>{ENTITY.name}</strong>
          </div>
          <div style={{ marginTop: 8 }}>
            {q.addressLabel}: {ENTITY.address}
          </div>
          <div style={{ marginTop: 8 }}>
            {q.contactLabel}:{' '}
            <a href={`mailto:${ENTITY.email}`} style={{ color: 'var(--tinta-soft)' }}>
              {ENTITY.email}
            </a>
          </div>
          <div style={{ marginTop: 14, letterSpacing: '.18em', fontSize: 10.5, fontWeight: 600 }}>
            KATON.APP
          </div>
        </div>
      </div>
    </footer>
  );
}
