import { PasanganFromQuery } from '@/components/Pasangan.jsx';

// `/kompatibilitas` — RULED BY REYNER 2026-09-08. The path is the reader-facing
// name; the internal identifiers stay `PASANGAN_COPY` / `pasangan_*`.
//
// The pre-payment page: product block, price, inclusions, two births, an email,
// and a checkout. Nothing computed about either person is shown before payment.
export default function KompatibilitasPage() {
  return <PasanganFromQuery />;
}
