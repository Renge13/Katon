import { markReadingPaid } from '@/lib/readingStore';
import { json, badRequest, unauthorized, notConfigured } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/webhook/xendit
// THE ONLY path that may flip paid=true — and only AFTER verifying the Xendit
// callback token. An unverified webhook is a forgeable unlock, so verification
// happens FIRST, before the payload is trusted at all.
export async function POST(request) {
  // 1. VERIFY FIRST. Xendit sends the dashboard callback token in this header.
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected) return notConfigured('webhook not configured');

  const presented = request.headers.get('x-callback-token');
  if (!presented || presented !== expected) {
    return unauthorized('invalid callback token');
  }

  // 2. Only now parse + trust the payload.
  let payload;
  try {
    payload = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  // We set external_id = reading id when creating the invoice (Phase 4a), so the
  // callback carries our reading id back.
  const readingId = payload?.external_id;
  const status = String(payload?.status || '').toUpperCase();
  if (!readingId) return badRequest('missing external_id');

  const PAID_STATUSES = ['PAID', 'SETTLED', 'SUCCEEDED', 'COMPLETED'];
  if (PAID_STATUSES.includes(status)) {
    // Idempotent: markReadingPaid returns true only on the false→true transition.
    const transitioned = await markReadingPaid(readingId);
    if (transitioned) {
      // TODO(Phase 4a): send the WhatsApp message ONCE (katon.app/r/<id>).
      // Guarded by `transitioned` so a double-fired webhook does not re-send.
    }
  }

  // Always 200 on a verified call so Xendit stops retrying.
  return json({ received: true });
}
