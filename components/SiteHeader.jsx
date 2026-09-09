'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHROME_COPY } from '@/lib/site/copy';
import { NAV_HREFS, isCurrent } from '@/lib/site/nav';

// The persistent site header (Y-2 ruling 1, Reyner 2026-09-08): the wordmark
// links home, and two links name the two products. Mounted once in
// `app/layout.js` beside `SiteFooter`, so no page can omit it - the same
// reasoning the footer already carries, and the reason `app/` has exactly one
// layout.
//
// ── WHY THIS ONE IS A CLIENT COMPONENT AND THE FOOTER IS NOT ──
// `usePathname`. The current route has to be marked, and marking it is the whole
// difference between a nav bar and two links. The footer stays a server
// component because merchant identity must be readable from view-source without
// executing JS; nothing here is compliance chrome, so the cost is a few bytes of
// hydration on routes that already hydrate a funnel.
//
// ── NOT STICKY, AND THAT IS THE PROMPT'S INSTRUCTION ───────
// "Sticky is Reyner's call on the preview; ship non-sticky." A sticky header on
// a phone eats vertical space on exactly the surface - the reading - where the
// product is the text. It is one property to change if he wants it.
//
// ── NO NEW VISUAL LANGUAGE ─────────────────────────────────
// Existing tokens only: the footer's own hairline, `--tinta-soft` for links,
// `--muted-warm` for the resting state, and the letterspaced `KATON.APP`
// treatment the footer already renders. The brief was "professional, doesn't
// need to be beautiful, makes sense and modern", so this adds structure and
// invents nothing.

// The hrefs and the current-route rule live in `lib/site/nav.js` so they can be
// CALLED by a test rather than grepped for - this file imports `next/link`, which
// the plain node test runner cannot resolve. The labels come from CHROME_COPY;
// neither is typed here.
const NAV = [
  { href: NAV_HREFS.mirror, label: CHROME_COPY.nav_mirror },
  { href: NAV_HREFS.compat, label: CHROME_COPY.nav_compat },
];

export default function SiteHeader() {
  const pathname = usePathname() || '/';

  return (
    <header
      style={{
        borderBottom: '1px solid var(--divider)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          maxWidth: 460,
          margin: '0 auto',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link
          href="/"
          aria-label="Katon"
          style={{
            letterSpacing: '.18em',
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--tinta-soft)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          KATON.APP
        </Link>

        <nav style={{ display: 'flex', gap: 16 }}>
          {NAV.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                // `aria-current="page"` is the accessible half and the styling is
                // the visible half. Both, because a screen reader gets nothing
                // from a colour and a sighted reader gets nothing from the
                // attribute.
                aria-current={current ? 'page' : undefined}
                style={{
                  fontSize: 12.5,
                  fontWeight: current ? 600 : 500,
                  color: current ? 'var(--tinta-soft)' : 'var(--muted-warm)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
