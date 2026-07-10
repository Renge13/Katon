import { getReading } from '@/lib/readingStore';
import { buildFullView, buildFreeView } from '@/lib/readingView';
import { json, notFound, badRequest } from '@/lib/http';
import { freeFullReadingEnabled } from '@/lib/flags';

export const runtime = 'nodejs';

// GET /api/reading/[id]/full
// The frontend asks; the SERVER decides. Paid copy + the full Four Pillars
// legitimacy reveal are returned ONLY when row.paid === true (set exclusively by
// the verified Xendit webhook). Otherwise only the teaser. Paid text and full
// pillar contents never leave the server pre-payment.
//
// TEST-UNGATE: NEXT_PUBLIC_FREE_FULL_READING also opens this gate (VIEW ONLY). It
// returns the already-computed content for display without payment; it does NOT
// write paid state, does NOT touch the webhook/Xendit, does NOT change the DB row
// (still paid=false). Default off. See lib/flags.js.
export async function GET(_request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (!row.domain) return badRequest('this reading has no domain selected');

  if (row.paid === true || freeFullReadingEnabled()) {
    const view = buildFullView(row);
    if (!view.paidContent) return notFound('paid_content_unavailable');
    return json(view);
  }

  // Not paid → teaser only (recomputed deterministically; no paid copy).
  const { teaser } = buildFreeView(row);
  return json({ token: id, paid: false, domain: row.domain, teaser });
}
