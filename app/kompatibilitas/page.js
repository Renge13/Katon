import { PasanganFromQuery } from '@/components/Pasangan.jsx';
import { paymentsProvider } from '@/lib/paymentFence';

// `/kompatibilitas` — RULED BY REYNER 2026-09-08. The path is the reader-facing
// name; the internal identifiers stay `PASANGAN_COPY` / `pasangan_*`.
//
// The pre-payment page: product block, price, inclusions, two births, an email,
// and a checkout. Nothing computed about either person is shown before payment.
//
// ── THE SALES STATE IS DECIDED ON THE SERVER ───────────────
// `PAYMENTS_PROVIDER` is a server variable and the client must not guess at it.
// Reading it here - in the server component - and passing a boolean means the
// page RENDERS closed rather than rendering a form that turns out to 503 on
// submit. That distinction is the whole defect this hotfix is about at one level
// up: a reader must not be invited into a path that cannot complete.
//
// The card on Home still points here, per the ruling. A closed shop with its
// door still on the map is honest; a card that vanishes looks like a bug.
export default function KompatibilitasPage() {
  return <PasanganFromQuery salesClosed={paymentsProvider() === 'closed'} />;
}
