// Shell + prose atoms for the five static compliance pages (/harga, /tentang,
// /privasi, /syarat, /pengembalian).
//
// SERVER components, deliberately. No 'use client', no hooks, no state: every
// word ships inside the HTML document so the Xendit reviewer sees real content in
// view-source without executing JS. components/kit.jsx cannot be reused for this
// because it is a client module and importing it would push these pages back
// behind hydration for no benefit.
//
// NO LOGOMARK HERE (Prompt BE §1a, Reyner 2026-10-06: "One logo."). This shell used
// to draw its own dot + KATON, a Link home, above the title. The site header is on
// every route and carries the mark and the way home, so the in-page one was a second.

const WRAP = { maxWidth: 460, margin: '0 auto', padding: '0 22px 40px' };

export default function StaticPage({ title, lead, children }) {
  return (
    <div style={WRAP}>
      <div style={{ paddingTop: 44 }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.14,
            letterSpacing: '-.01em',
            color: 'var(--tinta)',
            margin: 0,
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
