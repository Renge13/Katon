import { getReading, setInvoice } from '@/lib/readingStore';
import { createQrisInvoice } from '@/lib/xendit';
import { priceFor, isSellable, DEFAULT_SKU, SELLABLE_SKUS } from '@/lib/pricing';
import { json, notFound, badRequest, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed } from '@/lib/paymentFence';

export const runtime = 'nodejs';

// [REYNER] REGISTER REVIEW. This string is on the Xendit checkout page and on the
// bank/e-wallet statement line, so it is user-facing chrome and rule 20 applies:
// keyboard characters only, one composed voice. Proposal, not approved.
//
// It replaces `Katon: Bacaan Mendalam (${row.domain})`, which sold the pre-pivot
// domain reading — a product that no longer exists.
const INVOICE_DESCRIPTION = {
  artifact: 'Katon - Complete Edition (kartu resolusi tinggi + PDF)',
};

// POST /api/pay/[id]   body: { wa_number, sku? }
// Captures the WhatsApp number and creates the Xendit QRIS invoice
// (external_id = reading id). NEVER sets paid=true — only the verified webhook can.
//
// THE CLIENT MAY NAME A SKU. IT MAY NEVER NAME A PRICE. The name is checked
// against SELLABLE_SKUS and resolved to a number by priceFor(), both server-side,
// so the request body cannot influence what is charged or unlock a product that
// has no fulfillment yet.
export async function POST(request, { params }) {
  // Fail-closed: in production the payment path must be fully configured, or refuse.
  const fence = paymentFenceReason();
  if (fence) return notConfigured(`payment_not_configured:${fence}`);

  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  // The `row.domain` requirement is GONE. It gated checkout on the pre-pivot
  // domain reading; paid is no longer a domain reading, and the mirror is
  // ungated by design, so a reading with no domain is the normal case now.

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

  const sku = body?.sku ?? DEFAULT_SKU;
  if (!isSellable(sku)) {
    // `compat` lands here on purpose until Prompt E ships its pair-layer engine:
    // it is priced but has nothing to deliver.
    return badRequest(`sku must be one of: ${SELLABLE_SKUS.join(', ')}`);
  }

  try {
    const { invoiceId, invoiceUrl } = await createQrisInvoice({
      readingId: id,
      amount: priceFor(sku),
      description: INVOICE_DESCRIPTION[sku],
    });
    // The sku is stored with the invoice so the webhook can verify the settled
    // amount against THIS product's price rather than against any known price.
    await setInvoice(id, { invoiceId, waNumber, sku });
    return json({ ok: true, pending: true, invoiceUrl });
  } catch (e) {
    if (e.code === 'not_configured' && devBypassAllowed()) {
      // Dev fallback (no Xendit keys, non-production ONLY): store the WA number and
      // report pending so the funnel shows the pending state. Unlock still requires
      // the verified webhook (triggered manually in dev). Structurally unreachable in
      // production — the fence above already refused before we got here.
      await setInvoice(id, { waNumber, sku });
      return json({ ok: true, pending: true, invoiceUrl: null, dev: true });
    }
    return json({ error: 'invoice_failed' }, 502);
  }
}
