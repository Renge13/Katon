// Root layout for the Katon Next.js App Router app.
// Phase 3 brings the watercolor global styling; this is the minimal shell.

export const metadata = {
  title: 'KATON — Refleksi personal dari waktu kelahiranmu',
  description:
    'Refleksi personal dari waktu kelahiranmu. Sebuah lensa untuk mengenali polamu, bukan ramalan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
