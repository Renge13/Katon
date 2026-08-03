import { Spectral, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import SiteFooter from '@/components/SiteFooter.jsx';

// Root layout for the Katon Next.js App Router app.
// Fonts: Spectral (display/serif) + Hanken Grotesk (sans/UI), self-hosted via
// next/font (no runtime network). Exposed as CSS variables the tokens map onto.

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

export const metadata = {
  // Hyphen, not a middle dot. Rule 20 is keyboard characters only with zero
  // exceptions (Reyner, 2026-08-03); U+00B7 is now on the check-copy ban list.
  title: 'KATON - Refleksi personal dari waktu kelahiranmu',
  description:
    'Refleksi personal dari waktu kelahiranmu. Sebuah lensa untuk mengenali polamu, bukan ramalan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spectral.variable} ${hanken.variable}`}>
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
