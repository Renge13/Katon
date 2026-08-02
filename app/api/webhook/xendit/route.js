import { getReading, markReadingPaid, claimWaSend, releaseWaSend } from '@/lib/readingStore';
import { verifyCallbackToken, getInvoice, PAID_STATUSES } from '@/lib/xendit';
import { amountMatchesSku } from '@/lib/pricing';
import { sendReadingLink, decideWaOutcome } from '@/lib/wa';
import { json, badRequest, unauthorized, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed } from '@/lib/paymentFence';

export const runtime = 'nodejs';

// POST /api/webhook/xendit
// THE ONLY path that may flip paid=true. Two-layer defense:
//   (1) constant-time x-callback-token verification BEFORE parsing the body, and
//   (2) re-fetch the invoice from Xendit by id and confirm status + amount
//       against the price of the SKU WE STORED at payment intent — NEVER
//       trusting the callback body to grant access.
// (2) makes a leaked callback token useless on its own: a forged PAID event must
// still reference a real invoice that Xendit reports as paid, for exactly what
// that reading's own product currently costs.
//
// PER-SKU, not per-constant. With one global price, "the amount is one of our
// prices" and "the amount is THIS product's price" were the same question. With
// two SKUs at four price points they are not, and the weaker check would let a
// 19000 artifact payment unlock a 29000 compat reading.
export async function POST(request) {
  // 0. Fail-closed: in production the payment path must be fully configured, or refuse.
  //    This makes the DEV body-trust branch below structurally unreachable in prod.
  const fence = paymentFenceReason();
  if (fence) return notConfigured(`payment_not_configured:${fence}`);

  // 1. VERIFY FIRST — constant-time token compare.
  const presented = request.headers.get('x-callback-token');
  const v = verifyCallbackToken(presented);
  if (!v.ok) {
    if (v.reason === 'not_configured') return notConfigured('webhook not configured');
    return unauthorized('invalid callback token');
  }

  // 2. Parse the body only to learn WHICH invoice to look up — not to trust it.
  let payload;
  try {
    payload = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  // Resolve the authoritative reading id + settled state. The AMOUNT check is
  // deferred until the row is loaded, because verifying it needs the SKU that was
  // stored at payment intent.
  let readingId;
  let statusPaid;      // Xendit says the money arrived
  let settledAmount;   // null in dev, where there is no invoice to re-fetch

  if (process.env.XENDIT_SECRET_KEY) {
    // PROD: re-fetch the invoice and trust ONLY Xendit's own record.
    const invoiceId = payload?.id; // the invoice id Xendit assigned
    if (!invoiceId) return badRequest('missing invoice id');
    let invoice;
    try {
      invoice = await getInvoice(invoiceId);
    } catch {
      return json({ error: 'invoice_lookup_failed' }, 502);
    }
    readingId = invoice.externalId; // authoritative — external_id was set to the reading id
    statusPaid = PAID_STATUSES.includes(invoice.status);
    settledAmount = invoice.amount;
  } else if (devBypassAllowed()) {
    // DEV (no Xendit key, non-production ONLY): trust the body after token
    // verification. The fence at step 0 makes this unreachable in production.
    readingId = payload?.external_id;
    statusPaid = PAID_STATUSES.includes(String(payload?.status || '').toUpperCase());
    settledAmount = null; // no invoice exists, so there is no amount to verify
  } else {
    // Belt-and-suspenders: never trust the callback body in production.
    return notConfigured('payment_not_configured:xendit_secret_key_unset');
  }

  if (!readingId) return badRequest('missing external_id');

  const row = await getReading(readingId);
  if (!row) return json({ received: true }); // unknown id — ack so Xendit stops retrying

  // Amount verification, per SKU, FAIL-CLOSED. A null or unknown row.sku does not
  // unlock: a row whose product we cannot identify must never be treated as paid
  // for. No real money has moved yet, so there are no legitimate in-flight
  // invoices this strands (see supabase/migrations/0005_sku.sql).
  const amountOk = settledAmount === null ? true : amountMatchesSku(settledAmount, row.sku);
  if (statusPaid && !amountOk) {
    console.error(
      `[webhook/xendit] amount rejected for reading ${readingId}: sku=${row.sku ?? 'null'}`,
    );
  }
  const paidConfirmed = statusPaid && amountOk;

  if (paidConfirmed) {
    // 3. Idempotent flip (false→true only). 4. WA-send guarded by a claim that acts
    //    as a mutex: a genuine Xendit double-fire finds the slot already claimed and
    //    sends at most once. But the claim is only KEPT on a CONFIRMED delivery — so
    //    wa_sent means "actually delivered", not "attempted". Failure is signalled two
    //    ways and BOTH must behave identically: sendReadingLink may THROW, or it may
    //    RETURN a falsy result / { sent: false } (see lib/wa.js). On either, we release
    //    the claim (keeping the send retryable) and return non-2xx so Xendit retries.
    //    The one exception is the expected MVP state — no WA provider wired
    //    (reason 'no_provider'): that is NOT a failure, so we release the claim to keep
    //    wa_sent an honest false (nothing was delivered; content still unlocks via the
    //    in-session poll) but return 200 so Xendit does NOT retry-loop every payment.
    const transitioned = await markReadingPaid(readingId, new Date().toISOString());
    const paidNow = transitioned || row.paid === true;
    if (paidNow) {
      const claimed = await claimWaSend(readingId);
      if (claimed) {
        let result;
        let threw = false;
        try {
          result = await sendReadingLink({ waNumber: row.wa_number, token: readingId });
        } catch (err) {
          threw = true;
          console.error(`[webhook/xendit] sendReadingLink threw for reading ${readingId}:`, err);
        }

        // Pure decision (see lib/wa.js#decideWaOutcome) → execute the action.
        const outcome = decideWaOutcome(result, threw);
        if (outcome === 'skip_no_provider') {
          // Expected pilot state: nothing to deliver. Release so wa_sent stays false
          // (accurate), and fall through to 200 — no retry loop.
          await releaseWaSend(readingId).catch((e) =>
            console.error(`[webhook/xendit] releaseWaSend failed for reading ${readingId}:`, e),
          );
        } else if (outcome === 'retry') {
          // Real failure: release the claim so the send stays retryable, log it (no PII),
          // and signal Xendit to retry via non-2xx.
          if (!threw) {
            console.error(
              `[webhook/xendit] sendReadingLink failed for reading ${readingId}: ${result?.reason || 'unknown'}`,
            );
          }
          await releaseWaSend(readingId).catch((e) =>
            console.error(`[webhook/xendit] releaseWaSend failed for reading ${readingId}:`, e),
          );
          return json({ error: 'wa_send_failed' }, 502);
        }
        // else outcome === 'sent' → delivered, claim stays, fall through to 200.
      }
    }
  }

  return json({ received: true });
}
