import { getReading } from '@/lib/readingStore';
import { buildFullView, buildFreeView } from '@/lib/readingView';
import { json, notFound, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// GET /api/reading/[id]/full
// The frontend asks; the SERVER decides. Paid copy + the full Four Pillars
// legitimacy reveal are returned ONLY when row.paid === true (set exclusively by
// the verified Xendit webhook). Otherwise only the teaser. Paid text and full
// pillar contents never leave the server pre-payment.
//
// `row.paid === true` is now the ONLY thing that opens this gate. The
// NEXT_PUBLIC_FREE_FULL_READING test-ungate flag that used to open it too is gone
// (CLAUDE.md SUPERSEDED: "do not let a test flag become the architecture"). It was
// set in Vercel, so production served the full deep-read to everyone and the
// paywall never rendered — which is what Xendit rejected the site for.
export async function GET(_request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (!row.domain) return badRequest('this reading has no domain selected');

  if (row.paid === true) {
    const view = buildFullView(row);
    if (!view.paidContent) return notFound('paid_content_unavailable');
    return json(view);
  }

  // Not paid → teaser only (recomputed deterministically; no paid copy).
  const { teaser } = buildFreeView(row);
  return json({ token: id, paid: false, domain: row.domain, teaser });
}
