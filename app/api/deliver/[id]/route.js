import { serveDeliveryManifest } from '@/lib/deliver/handlers.js';

export const runtime = 'nodejs';

// GET /api/deliver/[id]
// What Rp 19.000 includes, and whether it is ready. Prompt M build step 6.
//
// The handler lives in lib/ so `node --test` can load it - the same arrangement as
// the mirror route, and that file's header explains why.
export async function GET(_request, { params }) {
  const { id } = await params; // Next 15: params is async
  return serveDeliveryManifest(id);
}
