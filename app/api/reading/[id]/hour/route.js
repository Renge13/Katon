import { getReading, setBirthTime } from '@/lib/readingStore';
import { buildFullView } from '@/lib/readingView';
import { json, notFound, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/reading/[id]/hour   body: { birthTime: "HH:MM" }
// POST-PAY hour-enrichment door. Adds/updates the birth time, recomputes the
// chart server-side, and returns the fuller full-view. Gated on paid===true so
// it reads as a gift to someone who already bought — never a second paywall.
export async function POST(request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (row.paid !== true) return json({ error: 'not_paid' }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }
  const birthTime = body?.birthTime;
  if (!/^\d{1,2}:\d{2}$/.test(birthTime || '')) {
    return badRequest('birthTime "HH:MM" required');
  }

  await setBirthTime(id, birthTime);
  const updated = await getReading(id);
  return json(buildFullView(updated)); // recomputed with the hour pillar
}
