import { getPair } from '@/lib/pairStore';
import { getReading, markReadingPaid } from '@/lib/readingStore';
import { settlePair } from '@/lib/pair/settle';
import { json, notFound, notConfigured } from '@/lib/http';
import { mockPaymentsAllowed } from '@/lib/paymentFence';

export const runtime = 'nodejs';

// ============================================================
// POST /api/mock-pay/[id] — the free unlock, for walking the paid path
// ============================================================
// Exists because Katon is exiting Xendit (Reyner, 2026-09-08) and the paid flow
// still has to be walkable end to end - by Reyner on Preview, and locally - with
// no provider, no test keys and no money. Sales are CLOSED in production and
// there is to be no real Xendit transaction by anyone, including for testing.
//
// ── IT IS A FREE UNLOCK, SO READ THE GUARD FIRST ───────────
// `mockPaymentsAllowed()` is true only when PAYMENTS_PROVIDER=mock, and
// `paymentsProvider()` downgrades mock to 'closed' whenever VERCEL_ENV is
// production - so this route answers 503 there whatever else is set. The guard
// lives in `lib/paymentFence.js` with every other payment gate rather than being
// re-derived here, because a second opinion about what "production" means is
// exactly how a free-unlock path survives a cutover.
//
// ── IT USES THE SAME DOOR AS THE WEBHOOK ───────────────────
// `settlePair` for a pair, `markReadingPaid` for a mirror artifact. Rule 18 says
// `paid` flips in the verified webhook and nowhere else; this route is the
// deliberate, environment-fenced exception, and it earns that by going through
// the same functions rather than writing the column itself. Both are idempotent
// false->true transitions, so a double tap is a no-op and the response says
// `already_paid` rather than pretending something happened.
//
// `settlePair(id, row, true, null)` passes `null` for the settled amount, which
// its own amount check reads as "no amount to verify" - correct here, because
// there is no invoice and therefore nothing to verify against. The sku on the
// row is untouched, so the reading that gets served is the one that was bought.
// ============================================================

export async function POST(request, { params }) {
  if (!mockPaymentsAllowed()) return notConfigured('mock_payments_disabled');

  const { id } = await params;

  const pairRow = await getPair(id);
  if (pairRow) {
    const result = await settlePair(id, pairRow, true, null);
    return json({ ok: true, paid: true, transitioned: result.paid, reason: result.reason });
  }

  const row = await getReading(id);
  if (!row) return notFound();

  const transitioned = await markReadingPaid(id, new Date().toISOString());
  return json({ ok: true, paid: true, transitioned, reason: transitioned ? null : 'already_paid' });
}
