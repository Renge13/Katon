import { PasanganFromQuery } from '@/components/Pasangan.jsx';
import { checkoutOpen } from '@/lib/paymentFence';

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
// ~~The card on Home still points here, per the ruling.~~ SUPERSEDED 2026-09-23:
// Reyner ruled that while the fence is closed EVERY paid entry point is hidden,
// the Home card and the header link included (PROGRESS INTERIM REGISTER, "PAID
// CTA HIDDEN WHILE FENCE CLOSED"). This page still answers an old link with its
// closed state, which is the honest reply to someone who already has the URL.
export default function KompatibilitasPage() {
  return <PasanganFromQuery salesClosed={!checkoutOpen()} />;
}
