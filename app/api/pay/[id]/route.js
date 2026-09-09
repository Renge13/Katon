import { getReading, setInvoice } from '@/lib/readingStore';
import { getPair, setPairInvoice } from '@/lib/pairStore';
import { COMPAT_COPY } from '@/lib/site/copy';
import { compatEmail, resolveCheckoutTarget } from '@/lib/pair/checkout';
import { createQrisInvoice } from '@/lib/xendit';
import { priceFor, isSellable, DEFAULT_SKU, SELLABLE_SKUS } from '@/lib/pricing';
import { recordEvent } from '@/lib/analytics/events';
import { json, notFound, badRequest, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed, paymentsProvider } from '@/lib/paymentFence';
import { readingUrl, pairUrl } from '@/lib/site/baseUrl';
import { compatPairRoute } from '@/lib/site/routes';

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
//
// ── `compat` IS UNRULED AND THAT IS DELIBERATE, 2026-09-07 ──
// It comes from `COMPAT_COPY.invoiceDesc` as an `@@UNRULED@@` sentinel, so
// `scripts/check-unruled-copy.mjs` (wired as `prebuild`) REFUSES a production
// build until Reyner rules it. Preview and local builds pass on purpose - he has
// to see it in context to rule it.
//
// WHY NOT GUESS ONE. The history above is three supersessions of this exact
// surface, two of them for reasons a guess would have repeated: English on an
// Indonesian buyer's bank statement, and borrowing the free product's own word.
// Guessing here has a measured track record of being wrong, and the alternative
// to a sentinel was holding the whole payment path on one string.
const INVOICE_DESCRIPTION = {
  artifact: 'Katon - Complete Edition',
  compat: COMPAT_COPY.invoiceDesc,
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
  // ── SALES ARE CLOSED IN PRODUCTION, RULED 2026-09-08 ──────
  // Katon is exiting Xendit. `payment_closed` is a DELIBERATE state and gets its
  // own body rather than being dressed as a misconfiguration: the client renders
  // the sales-closed page from it, and a reader must not be told to try again.
  //
  // It is checked before everything, including the body parse, because there is
  // no request shape that makes a closed shop open.
  const fence = paymentFenceReason();
  if (fence === 'payment_closed') return notConfigured('payment_closed');
  if (fence) return notConfigured(`payment_not_configured:${fence}`);

  const { id } = await params;
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
    // `annual` lands here on purpose: it is priced (the ladder ruled 2026-08-29)
    // and not built, so it has nothing to deliver. September's demand test SHOWS
    // both prices and records interest; showing a price must never create a
    // checkout. `compat` became sellable 2026-09-07 - see lib/pricing.js.
    return badRequest(`sku must be one of: ${SELLABLE_SKUS.join(', ')}`);
  }

  // ── WHICH OBJECT IS BEING BOUGHT ──────────────────────────
  // `compat` buys a PAIR; everything else buys a reading. The id namespaces are
  // separate tables, so the sku decides which one to resolve rather than trying
  // both and taking whatever answers - a reading id presented with `sku=compat`
  // is a caller error and is refused, not silently resolved as a reading.
  const isCompat = sku === 'compat';

  // The decision is in lib/pair/checkout.js so it is testable - no spec here
  // imports an app/api route, because Next's `@/` alias does not resolve under
  // `node --test`. The READING branch is unchanged: `getReading` is still the
  // only lookup for every other sku.
  const target = resolveCheckoutTarget(
    sku,
    isCompat ? await getPair(id) : null,
    await getReading(id),
  );
  if (target.kind === 'error') {
    return target.status === 404 ? notFound() : badRequest(target.error);
  }
  // The row itself is not needed past this point - it never was. Before compat,
  // `getReading` was called purely to 404 an unknown id, and the pre-pivot
  // `row.domain` gate that used it was removed at the promotion. The resolution
  // above is the existence check.

  // Ruling C: email-only identity, collected AT checkout and nowhere else.
  let email = null;
  if (isCompat) {
    const checked = compatEmail(body?.email);
    if (checked.error) return badRequest(checked.error);
    email = checked.email;
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
    // ── MOCK: NO PROVIDER, NO MONEY, NO NETWORK ───────────────
    // Preview and local only - `paymentsProvider()` returns 'closed' for mock
    // whenever VERCEL_ENV=production, so this branch cannot exist there.
    //
    // It returns a LOCAL url in the same field the real adapter uses, so every
    // caller and every redirect works unchanged: the client opens it, and the
    // page it lands on flips `paid` through `POST /api/mock-pay/<id>`, which
    // goes through the SAME `settlePair` / `markReadingPaid` door the verified
    // webhook uses. Nothing gets a second way to become paid.
    if (paymentsProvider() === 'mock') {
      // RELATIVE, NOT ABSOLUTE, and the difference stranded a walk. `pairUrl`
      // builds from NEXT_PUBLIC_BASE_URL, and on a preview that pointed at a
      // DIFFERENT alias - a request to katon-git-fix-... was answered
      // `https://katon-eta.vercel.app/...`. A real provider NEEDS the absolute
      // form, because Xendit redirects a browser to it from its own domain. Mock
      // is a link back to the page the walker is already on, so an absolute URL
      // only hops hosts mid-flow.
      const mockUrl = `${isCompat ? compatPairRoute(id) : `/r/${id}`}?bayar=mock`;
      if (isCompat) await setPairInvoice(id, { invoiceId: `mock_${id}`, invoiceUrl: mockUrl, sku, email });
      else await setInvoice(id, { invoiceId: `mock_${id}`, waNumber, sku });
      await recordEvent(id, 'checkout_started', { sku, provider: 'mock' });
      return json({ ok: true, pending: true, invoiceUrl: mockUrl, mock: true });
    }

    const { invoiceId, invoiceUrl } = await createQrisInvoice({
      readingId: id,
      amount: priceFor(sku),
      description: INVOICE_DESCRIPTION[sku],
      // ── THE COMPAT REGRESSION IS CLOSED, 2026-09-08 ───────────
      // X-b1 shipped compat checkout with NO redirect URLs and said so: the
      // destination is the report page, the page did not exist, and `readingUrl`
      // builds `/r/<token>` - handing it a PAIR id would send the buyer to a
      // reading URL for an object that is not a reading, which is the exact
      // confusion the "person B is never a reading row" ruling exists to prevent.
      // Rather than guess a route name Reyner had not chosen, both were omitted
      // and the buyer's last screen stayed on Xendit.
      //
      // He ruled `/kompatibilitas` on 2026-09-08 and X-b3 builds the page, so a
      // pair now gets the same treatment a reading always had - through
      // `pairUrl`, which is a different builder rather than `readingUrl` with a
      // different argument.
      //
      // `?bayar=selesai` IS A HINT ABOUT THE UI, NEVER AN ENTITLEMENT, on this
      // path exactly as on the other: it opens the waiting state instead of the
      // product block, because the redirect regularly beats the webhook. `paid`
      // still flips in the verified webhook alone and the page re-reads it from
      // the server. Failure goes to the same page with no marker, so the product
      // block and its button are already on screen - that is the retry.
      ...(isCompat ? {
        successRedirectUrl: pairUrl(id, '?bayar=selesai'),
        failureRedirectUrl: pairUrl(id),
      } : {
        successRedirectUrl: readingUrl(id, '?bayar=selesai'),
        failureRedirectUrl: readingUrl(id),
      }),
    });
    // The sku is stored with the invoice so the webhook can verify the settled
    // amount against THIS product's price rather than against any known price.
    if (isCompat) await setPairInvoice(id, { invoiceId, invoiceUrl, sku, email });
    else await setInvoice(id, { invoiceId, waNumber, sku });

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
      if (isCompat) await setPairInvoice(id, { sku, email });
      else await setInvoice(id, { waNumber, sku });
      return json({ ok: true, pending: true, invoiceUrl: null, dev: true });
    }
    return json({ error: 'invoice_failed' }, 502);
  }
}
