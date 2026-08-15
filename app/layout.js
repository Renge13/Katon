import { Spectral, Hanken_Grotesk, Archivo } from 'next/font/google';
import './globals.css';
import SiteFooter from '@/components/SiteFooter.jsx';

// Root layout for the Katon Next.js App Router app.
// Fonts: Spectral (display/serif) + Hanken Grotesk (sans/UI), self-hosted via
// next/font (no runtime network). Exposed as CSS variables the tokens map onto.
//
// ARCHIVO IS THE CARD'S FAMILY, and it is a THIRD system rather than part of the
// reading's type pair. `components/cards/Card.js` sets every size in
// `var(--font-archivo)`, so without this the first route that renders a card
// renders it in the system sans — silently, and looking almost right, because a
// fallback stack always resolves to something.
//
// That gap was carried as spec §9's "standing dependency" from 2026-08-13 to
// 2026-08-15: the preview and probe scripts linked Archivo from Google Fonts for
// their own pages and the app never did. It is closed here, self-hosted through
// next/font like the other two, so there is still no runtime network call.
//
// `tests/app-fonts.spec.mjs` asserts the variable is declared on the html element,
// because "the card looks slightly off" is not a failure anyone reports.

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});

// The card uses 400 through 800 and italic (the Aspek line). Requested as a
// variable-weight range rather than a fixed list, which is what the card's
// intermediate weights - 440 on the hook, 480 on the Aspek, 640 on badge labels -
// need to render as authored instead of snapping to the nearest static cut.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata = {
  // Hyphen, not a middle dot. Rule 20 is keyboard characters only with zero
  // exceptions (Reyner, 2026-08-03); U+00B7 is now on the check-copy ban list.
  title: 'KATON - Refleksi personal dari waktu kelahiranmu',
  description:
    'Refleksi personal dari waktu kelahiranmu. Sebuah lensa untuk mengenali polamu, bukan ramalan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spectral.variable} ${hanken.variable} ${archivo.variable}`}>
      {/* The footer is mounted in the LAYOUT, not per page, so merchant identity
          and the legal links exist on every route including the reading itself.
          Flex column with the children flexed keeps it at the bottom of short
          pages without position: fixed. */}
      <body style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '1 0 auto' }}>{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
