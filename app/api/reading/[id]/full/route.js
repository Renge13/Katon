import { getReading } from '@/lib/readingStore';
import { getPaidDomain, getTeaser } from '@/lib/content';
import { json, notFound, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// GET /api/reading/[id]/full
// The frontend asks; the SERVER decides. Paid copy is returned ONLY when
// row.paid === true (set exclusively by the verified Xendit webhook). Otherwise
// only the teaser is returned — the paid text never leaves the server.
export async function GET(_request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (!row.domain) return badRequest('this reading has no domain selected');

  if (row.paid === true) {
    const paidContent = getPaidDomain(row.day_master, row.domain);
    if (!paidContent) return notFound('paid_content_unavailable');
    return json({ token: id, paid: true, domain: row.domain, paidContent });
  }

  // Not paid → teaser only.
  const teaser = getTeaser(row.day_master, row.domain);
  return json({ token: id, paid: false, domain: row.domain, teaser });
}
