import { getReading, markReadingPaid, claimWaSend, releaseWaSend } from '@/lib/readingStore';
import { verifyCallbackToken, getInvoice, PAID_STATUSES } from '@/lib/xendit';
import { PRICE_IDR } from '@/lib/pricing';
import { sendReadingLink } from '@/lib/wa';
import { json, badRequest, unauthorized, notConfigured } from '@/lib/http';
import { paymentFenceReason, devBypassAllowed } from '@/lib/paymentFence';

export const runtime = 'nodejs';

// POST /api/webhook/xendit
// THE ONLY path that may flip paid=true. Two-layer defense:
//   (1) constant-time x-callback-token verification BEFORE parsing the body, and
//   (2) re-fetch the invoice from Xendit by id and confirm status + amount
//       against our SKU price — NEVER trusting the callback body to grant access.
// (2) makes a leaked callback token useless on its own: a forged PAID event must
// still reference a real invoice that Xendit reports as paid for Rp 49.000.
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

  // Resolve the authoritative reading id + paid state.
  let readingId;
  let paidConfirmed;

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
    paidConfirmed = PAID_STATUSES.includes(invoice.status) && invoice.amount === PRICE_IDR;
  } else if (devBypassAllowed()) {
    // DEV (no Xendit key, non-production ONLY): trust the body after token
    // verification. The fence at step 0 makes this unreachable in production.
    readingId = payload?.external_id;
    paidConfirmed = PAID_STATUSES.includes(String(payload?.status || '').toUpperCase());
  } else {
    // Belt-and-suspenders: never trust the callback body in production.
    return notConfigured('payment_not_configured:xendit_secret_key_unset');
  }

  if (!readingId) return badRequest('missing external_id');

  if (paidConfirmed) {
    const row = await getReading(readingId);
    if (!row) return json({ received: true }); // unknown id — ack so Xendit stops retrying

    // 3. Idempotent flip (false→true only). 4. WA-send guarded by a claim that acts
    //    as a mutex: a genuine Xendit double-fire finds the slot already claimed and
    //    sends at most once. But the claim is only KEPT on a confirmed send — if the
    //    send fails, we release it and return non-2xx so Xendit retries and a later
    //    fire can re-claim + re-attempt. This prevents a transient WhatsApp failure
    //    from permanently losing the user's link.
    const transitioned = await markReadingPaid(readingId, new Date().toISOString());
    const paidNow = transitioned || row.paid === true;
    if (paidNow) {
      const claimed = await claimWaSend(readingId);
      if (claimed) {
        try {
          await sendReadingLink({ waNumber: row.wa_number, token: readingId });
        } catch (err) {
          // Send failed: release the claim so the send stays retryable, log it so the
          // failure is observable, and signal Xendit to retry via a non-2xx status.
          console.error(`[webhook/xendit] sendReadingLink failed for reading ${readingId}:`, err);
          await releaseWaSend(readingId).catch((e) =>
            console.error(`[webhook/xendit] releaseWaSend failed for reading ${readingId}:`, e),
          );
          return json({ error: 'wa_send_failed' }, 502);
        }
      }
    }
  }

  return json({ received: true });
}
