import { serveDeliveryCard } from '@/lib/deliver/handlers.js';

export const runtime = 'nodejs';

// GET /api/deliver/[id]/card
// The hi-res card's data, gated on `row.paid === true`. The client draws and
// captures it (components/cards/exportCards.js); what this endpoint guarantees is
// that the data does not leave the server before payment.
export async function GET(_request, { params }) {
  const { id } = await params;
  return serveDeliveryCard(id);
}
