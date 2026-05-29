import { getReading } from '@/lib/readingStore';
import { getFreeContent, getTeaser } from '@/lib/content';
import { json, notFound } from '@/lib/http';

export const runtime = 'nodejs';

// GET /api/reading/[id]
// Always safe: free content + the matched bridge + the paywall teaser. No paid
// copy is ever returned here. The id is the bearer key (knowing it = access).
export async function GET(_request, { params }) {
  const { id } = await params; // Next 15: params is async
  const row = await getReading(id);
  if (!row) return notFound();

  const freeContent = getFreeContent(row.day_master, row.element_variant, row.domain);
  const teaser = row.domain ? getTeaser(row.day_master, row.domain) : null;

  return json({
    token: id,
    domain: row.domain,
    paid: row.paid === true,
    freeContent,
    teaser,
  });
}
