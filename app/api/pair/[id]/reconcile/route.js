import { reconcilePair } from '@/lib/pair/reconcile.js';
import { consume, clientIp } from '@/lib/ratelimit.js';

export const runtime = 'nodejs';

// POST /api/pair/[id]/reconcile — launch-cut item 4.
//
// The report page calls this ONCE when it loads on an unpaid pair. It may ask DOKU
// whether this pair's invoice was paid and settle it through `settlePair`; every
// guard (fence, invoice shape, echoed invoice number, amount) is in
// `lib/pair/reconcile.js`, so this file is only the door and the rate limit.
//
// It answers `{ paid }` and nothing more: the reason codes are for the log, and a
// client has no decision to make with them - it re-reads the pair either way.
export async function POST(request, { params }) {
  const { id } = await params;
  const gate = await consume('pair_reconcile', { ip: clientIp(request) });
  if (!gate.allowed) {
    return Response.json({ error: 'rate_limited', retry_after: gate.retryAfter }, { status: 429 });
  }
  const { paid } = await reconcilePair(id);
  return Response.json({ paid });
}
