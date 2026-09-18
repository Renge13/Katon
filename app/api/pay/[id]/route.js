import { getReading, setInvoice } from '@/lib/readingStore';
import { getPair, setPairInvoice } from '@/lib/pairStore';
import { COMPAT_COPY } from '@/lib/site/copy';
import { compatEmail, resolveCheckoutTarget } from '@/lib/pair/checkout';
import { isSellable, DEFAULT_SKU, SELLABLE_SKUS } from '@/lib/pricing';
import { recordEvent } from '@/lib/analytics/events';
import { json, notFound, badRequest, notConfigured } from '@/lib/http';
import { paymentFenceReason, paymentsProvider } from '@/lib/paymentFence';
import { compatPairRoute } from '@/lib/site/routes';

export const runtime = 'nodejs';

// REYNER-APPROVED 2026-08-05. This string is on the provider's checkout page and
// on the bank/e-wallet statement line, so it is user-facing chrome and rule 20
// applies: keyboard characters only, one composed voice.
//
// IT SURVIVES THE EXIT DELIBERATELY. Prompt V-0 deletes the adapter, not this
// block: there is no provider to put the string in front of a buyer today, and
// DOKU's checkout page will carry it unchanged in Prompt V. The `compat`
// `@@UNRULED@@` sentinel below is part of what survives - the build refusal it
// arms is about Reyner ruling the words, and that is not a payments question.
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
// ── IT IS UNREFERENCED TODAY, AND THAT IS THE POINT ───────
// Its only reader was `createQrisInvoice({ description: ... })`, which V-0 deletes,
// so `no-unused-vars` fires. The exemption is written here rather than the const
// being deleted, because the history above is the argument: three supersessions of
// this exact surface, two for reasons a fresh guess would have repeated. Deleting
// it would hand Prompt V a blank line where a ruled string used to be, and the
// block's own sentence is that guessing here has a measured track record of being
// wrong. `scripts/check-unruled-copy.mjs` does not protect it either - that gate
// scans the registered COPY_BANKS, so the `compat` sentinel is caught through
// `COMPAT_COPY`, not through this object.
// eslint-disable-next-line no-unused-vars -- held for the DOKU adapter, Prompt V
const INVOICE_DESCRIPTION = {
  artifact: 'Katon - Complete Edition',
  compat: COMPAT_COPY.invoiceDesc,
};


// POST /api/pay/[id]   body: { sku?, wa_number? }
// Records a checkout intent. There is no provider to create an invoice with:
// sales are closed and the mock branch is the only path that returns a URL.
// NEVER sets paid=true — only the verified provider notification can.
//
// THE CLIENT MAY NAME A SKU. IT MAY NEVER NAME A PRICE. The name is checked
// against SELLABLE_SKUS server-side, so the request body cannot unlock a product
// that has no fulfillment yet. The route no longer resolves the sku to a NUMBER -
// `priceFor()` was called to fill the invoice amount and the invoice is gone - but
// the rule outlives the call: settlement still verifies the amount against the sku
// stored at intent (`amountMatchesSku`), never against anything a client sent.
export async function POST(request, { params }) {
  // ── SALES ARE CLOSED IN PRODUCTION, RULED 2026-09-08 ──────
  // `payment_closed` is a DELIBERATE state and gets its own body rather than being
  // dressed as a misconfiguration: the client renders the sales-closed page from
  // it, and a reader must not be told to try again.
  //
  // It is checked before everything, including the body parse, because there is
  // no request shape that makes a closed shop open.
  //
  // ONE REASON STRING, NOT TWO. A generic `payment_not_configured:${fence}` line
  // used to follow this one, for the key-presence refusals. Those are deleted with
  // the adapter, so the fence now answers `payment_closed` or null and nothing
  // else - and a branch that reads like a mitigation and can never execute is
  // worse than no branch, because it gets counted in reasoning about this route
  // (CLAUDE.md rule 15, on the OpenAI secondary that never ran). When Prompt V
  // gives the fence a third answer, the branch comes back WITH the answer.
  const fence = paymentFenceReason();
  if (fence === 'payment_closed') return notConfigured('payment_closed');

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
    // ── MOCK: NO PROVIDER, NO MONEY, NO NETWORK ───────────────
    // Preview and local only - `paymentsProvider()` returns 'closed' for mock
    // whenever VERCEL_ENV=production, so this branch cannot exist there.
    //
    // It returns a LOCAL url in the same field a real adapter would use, so every
    // caller and every redirect works unchanged: the client opens it, and the
    // page it lands on flips `paid` through `POST /api/mock-pay/<id>`, which
    // goes through the SAME `settlePair` / `markReadingPaid` door the verified
    // provider notification uses. Nothing gets a second way to become paid.
    if (paymentsProvider() === 'mock') {
      // RELATIVE, NOT ABSOLUTE, and the difference stranded a walk. `pairUrl`
      // builds from NEXT_PUBLIC_BASE_URL, and on a preview that pointed at a
      // DIFFERENT alias - a request to katon-git-fix-... was answered
      // `https://katon-eta.vercel.app/...`. A real provider NEEDS the absolute
      // form, because it redirects a browser back from its own domain. Mock is a
      // link back to the page the walker is already on, so an absolute URL only
      // hops hosts mid-flow.
      const mockUrl = `${isCompat ? compatPairRoute(id) : `/r/${id}`}?bayar=mock`;
      if (isCompat) await setPairInvoice(id, { invoiceId: `mock_${id}`, invoiceUrl: mockUrl, sku, email });
      else await setInvoice(id, { invoiceId: `mock_${id}`, waNumber, sku });
      await recordEvent(id, 'checkout_started', { sku, provider: 'mock' });
      return json({ ok: true, pending: true, invoiceUrl: mockUrl, mock: true });
    }

    // ── THERE IS NO PROVIDER BRANCH ANY MORE ──────────────────
    // What stood here built a QRIS invoice, stored it, counted `checkout_started`
    // and returned its URL. The adapter is deleted (Prompt V-0, Reyner's exit
    // ruling of 2026-09-18) and the branch went with it, along with the
    // redirect-URL block and the `catch` that fell back to a dev pending state
    // on `not_configured`.
    //
    // DEFENSIVE, AND IT SHOULD BE UNREACHABLE. The fence at the top of this
    // handler already answered `payment_closed` for every provider except `mock`,
    // and `mock` returned above. Reaching this line means `paymentsProvider()`
    // grew a value the fence does not refuse and this route does not serve, which
    // is a bug - so it refuses rather than falling through to a 200 with no
    // invoice in it.
    //
    // DOKU SLOTS IN ABOVE THIS LINE, not in place of it: Prompt V adds a branch
    // and leaves the floor.
    return notConfigured('payment_closed');
  } catch {
    return json({ error: 'invoice_failed' }, 502);
  }
}
