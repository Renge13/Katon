import { reconcileReading } from '@/lib/deliver/reconcile.js';
import { consume, clientIp } from '@/lib/ratelimit.js';

export const runtime = 'nodejs';

// POST /api/deliver/[id]/reconcile — PAY-SAFETY-ALL-PURCHASES (2026-09-23).
//
// The mirror reading page calls this ONCE when it loads on an unpaid purchase. It
// may ask DOKU whether this reading's invoice was paid and settle it through
// `settleReading`; every guard is in `lib/doku/reconcile.js`, shared with the
// pair's route, so this file is only the door and the rate limit. Answers
// `{ paid }`: the reason codes are for the log.
export async function POST(request, { params }) {
  const { id } = await params;
  const gate = await consume('reading_reconcile', { ip: clientIp(request) });
  if (!gate.allowed) {
    return Response.json({ error: 'rate_limited', retry_after: gate.retryAfter }, { status: 429 });
  }
  const { paid } = await reconcileReading(id);
  return Response.json({ paid });
}
