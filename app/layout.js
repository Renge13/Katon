import { Spectral, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

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
  title: 'KATON · Refleksi personal dari waktu kelahiranmu',
  description:
    'Refleksi personal dari waktu kelahiranmu. Sebuah lensa untuk mengenali polamu, bukan ramalan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spectral.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
