import Link from 'next/link';

// Shell + prose atoms for the five static compliance pages (/harga, /tentang,
// /privasi, /syarat, /pengembalian).
//
// SERVER components, deliberately. No 'use client', no hooks, no state: every
// word ships inside the HTML document so the Xendit reviewer sees real content in
// view-source without executing JS. components/kit.jsx cannot be reused for this
// because it is a client module and importing it would push these pages back
// behind hydration for no benefit.
//
// The wordmark is re-declared here rather than imported from Funnel.jsx for the
// same reason. Four lines of markup is a cheaper price than a client boundary.
// It is a Link home, because the funnel is the product and a reader who arrives
// on /syarat first needs a way in.

const WRAP = { maxWidth: 460, margin: '0 auto', padding: '0 22px 40px' };

export default function StaticPage({ title, lead, children }) {
  return (
    <div style={WRAP}>
      <div style={{ paddingTop: 44 }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
        >
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--clay)' }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              letterSpacing: '.28em',
              fontSize: 13,
              color: '#3c3226',
            }}
          >
            KATON
          </span>
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.14,
            letterSpacing: '-.01em',
            color: 'var(--tinta)',
            margin: '36px 0 0',
          }}
        >
          {title}
        </h1>

        {lead && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15.5,
              lineHeight: 1.7,
              color: 'var(--tinta-soft)',
              margin: '14px 0 0',
            }}
          >
            {lead}
          </p>
        )}

        <div style={{ marginTop: 34 }}>{children}</div>
      </div>
    </div>
  );
}

// `id` is optional and exists so a section can be linked directly (/tentang#kontak).
export function H2({ children, id }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--clay)',
        margin: '34px 0 12px',
      }}
    >
      {children}
    </h2>
  );
}

export function P({ children, style }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        lineHeight: 1.75,
        color: 'var(--tinta-soft)',
        margin: '0 0 14px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function Bullets({ items }) {
  return (
    <ul
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        lineHeight: 1.7,
        color: 'var(--tinta-soft)',
        margin: '0 0 14px',
        paddingLeft: 20,
      }}
    >
      {items.map((item) => (
        <li key={item} style={{ marginBottom: 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Card({ children }) {
  return (
    <div
      style={{
        background: 'var(--kertas-2)',
        border: '1px solid var(--divider)',
        borderRadius: 20,
        padding: '20px 20px 22px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}
