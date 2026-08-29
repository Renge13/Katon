import { getReading, setInvoice } from '@/lib/readingStore';
import { createQrisInvoice } from '@/lib/xendit';
import { priceFor, isSellable, DEFAULT_SKU, SELLABLE_SKUS } from '@/lib/pricing';
import { recordEvent } from '@/lib/analytics/events';
import { json, notFound, badRequest, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed } from '@/lib/paymentFence';
import { readingUrl } from '@/lib/site/baseUrl';

export const runtime = 'nodejs';

// REYNER-APPROVED 2026-08-05. This string is on the Xendit checkout page and on
// the bank/e-wallet statement line, so it is user-facing chrome and rule 20
// applies: keyboard characters only, one composed voice.
//
// INTERIM, and it describes what the buyer ACTUALLY RECEIVES. It names the same
// product the funnel names — `Bacaan Mendalam`, the string already on the paywall
// at components/Funnel.jsx:587 and :712 — so the checkout page, the statement line
// and the offer the buyer accepted all read alike.
//
// TWO SUPERSESSIONS, both this interim. `Katon - CE card + PDF reading` described
// the intended Complete Edition, while the paid path delivers the 7-beat unlock
// with no PDF and no hi-res card in it: charging for one thing and delivering
// another is a merchant-compliance problem in its own right. Its replacement
// `Katon - Bacaan lengkap` fixed the delivery mismatch and introduced a copy one —
// `lengkap` is the free reading's own claim on /harga, so the paid line borrowed
// the word that is supposed to distinguish the free product. Superseded by Reyner
// 2026-08-05 for that collision. See the 2026-08-05 interim section in
// docs/PROGRESS.md; when paid really is card + PDF, this string names them again.
//
// The pre-pivot `Katon: Bacaan Mendalam (${row.domain})` is still dead: it sold a
// per-domain reading, and the domain is not a product. The product name returning
// here is not that string returning — there is no domain in it.
// SWAPPED 2026-08-23 WITH THE PROMOTION, and the note above is its own instruction:
// "when paid really is card + PDF, this string names them again." It does now.
//
// NOT THE OLD STRING BACK. `Katon - CE card + PDF reading` was the pre-08-05 value
// and it is NOT restored, because the delivery mismatch was only half of what was
// wrong with it: it is English on an Indonesian buyer's bank statement, and `CE` is
// an internal abbreviation for a product page that spells the name out. Rule 20 is
// one composed voice EVERYWHERE INCLUDING CHROME, and a statement line is chrome.
//
// So this reuses the two strings that already carry Reyner's approval -
// `SITE_COPY.harga.artifact.name` and the funnel's own offer heading, both
// `Complete Edition` - and adds nothing. Keyboard characters only, no em-dash.
//
// APPROVED BY REYNER, 2026-08-22. He had approved `Complete Edition` as a product NAME
// on 2026-08-03 (the EN tier layer) and had not seen it as a statement line; it was
// flagged here for exactly that reason, and the flag is now closed. The wording is his.
const INVOICE_DESCRIPTION = {
  artifact: 'Katon - Complete Edition',
};

// POST /api/pay/[id]   body: { sku?, wa_number? }
// Creates the Xendit QRIS invoice (external_id = reading id).
// NEVER sets paid=true — only the verified webhook can.
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
  // `wa_number` IS OPTIONAL. It used to be required and this was a hard 400, which
  // made a WhatsApp number mandatory to buy — for a delivery promise nothing behind
  // this route could keep (no sender was ever built; `wa_sent` guards a send that
  // does not exist). The checkout no longer asks for one, so the normal case is
  // absent. The parameter stays accepted, and the column stays, so a WA channel can
  // be wired later without another migration; anything else is ignored rather than
  // stored under a name that claims to be a phone number.
  const waNumber = typeof body?.wa_number === 'string' && body.wa_number ? body.wa_number : undefined;

  const sku = body?.sku ?? DEFAULT_SKU;
  if (!isSellable(sku)) {
    // `compat` AND `annual` land here on purpose: both are priced (the ladder
    // ruled 2026-08-29) and neither is built, so neither has anything to deliver.
    // September's demand test SHOWS both prices and records interest; showing a
    // price must never create a checkout. See lib/pricing.js SELLABLE_SKUS.
    return badRequest(`sku must be one of: ${SELLABLE_SKUS.join(', ')}`);
  }

  try {
    // WHERE THE XENDIT TAB ENDS UP. Without these the buyer's last screen is a
    // Xendit page with no link back to the reading she just paid for.
    //
    // SUCCESS carries `?bayar=selesai`, and it is a HINT ABOUT THE UI, never an
    // entitlement: the funnel reads it only to open the paywall in its waiting
    // state instead of showing the offer again, because the redirect regularly
    // beats the webhook by a few seconds. `paid` still flips in the verified
    // webhook alone, and the page it lands on re-reads that from the server.
    //
    // FAILURE goes to the same reading with NO marker, so the paywall renders
    // normally and the price and the button are already on screen. That is the
    // retry; a failed payment needs no separate state.
    const { invoiceId, invoiceUrl } = await createQrisInvoice({
      readingId: id,
      amount: priceFor(sku),
      description: INVOICE_DESCRIPTION[sku],
      successRedirectUrl: readingUrl(id, '?bayar=selesai'),
      failureRedirectUrl: readingUrl(id),
    });
    // The sku is stored with the invoice so the webhook can verify the settled
    // amount against THIS product's price rather than against any known price.
    await setInvoice(id, { invoiceId, waNumber, sku });

    // COUNTED AFTER THE INVOICE EXISTS, never before. An attempt that failed to
    // create an invoice is not a started checkout, and counting one would inflate
    // the "started but not confirmed" gap with events that never reached Xendit.
    // `sku` only - no amount, because the amount is derivable from the sku and the
    // tier, and a second copy of a price is a second thing to keep in sync.
    await recordEvent(id, 'checkout_started', { sku });

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
