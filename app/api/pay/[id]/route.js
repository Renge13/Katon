import { getReading, setInvoice } from '@/lib/readingStore';
import { createQrisInvoice } from '@/lib/xendit';
import { PRICE_IDR } from '@/lib/pricing';
import { json, notFound, badRequest, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed } from '@/lib/paymentFence';

export const runtime = 'nodejs';

// POST /api/pay/[id]   body: { wa_number }
// Captures the WhatsApp number and creates the Xendit QRIS invoice
// (external_id = reading id). NEVER sets paid=true — only the verified webhook can.
export async function POST(request, { params }) {
  // Fail-closed: in production the payment path must be fully configured, or refuse.
  const fence = paymentFenceReason();
  if (fence) return notConfigured(`payment_not_configured:${fence}`);

  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (!row.domain) return badRequest('this reading has no domain selected');

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }
  const waNumber = body?.wa_number;
  if (!waNumber || typeof waNumber !== 'string') {
    return badRequest('wa_number is required');
  }

  try {
    const { invoiceId, invoiceUrl } = await createQrisInvoice({
      readingId: id,
      amount: PRICE_IDR,
      description: `Katon — Bacaan Mendalam (${row.domain})`,
    });
    await setInvoice(id, { invoiceId, waNumber });
    return json({ ok: true, pending: true, invoiceUrl });
  } catch (e) {
    if (e.code === 'not_configured' && devBypassAllowed()) {
      // Dev fallback (no Xendit keys, non-production ONLY): store the WA number and
      // report pending so the funnel shows the pending state. Unlock still requires
      // the verified webhook (triggered manually in dev). Structurally unreachable in
      // production — the fence above already refused before we got here.
      await setInvoice(id, { waNumber });
      return json({ ok: true, pending: true, invoiceUrl: null, dev: true });
    }
    return json({ error: 'invoice_failed' }, 502);
  }
}
