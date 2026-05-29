import { getReading } from '@/lib/readingStore';
import { buildFreeView } from '@/lib/readingView';
import { json, notFound } from '@/lib/http';

export const runtime = 'nodejs';

// GET /api/reading/[id]
// Always safe: free content + matched bridge + teaser, recomputed server-side
// from the stored row. Reproduces the EXACT card on re-entry. No paid copy, and
// NO raw birth data, ever leaves the server.
export async function GET(_request, { params }) {
  const { id } = await params; // Next 15: params is async
  const row = await getReading(id);
  if (!row) return notFound();
  return json(buildFreeView(row));
}
