import { getReading, setWaNumber } from '@/lib/readingStore';
import { json, notFound, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/pay/[id]   body: { wa_number }
// Captures the WhatsApp number and (Phase 4a) creates the Xendit QRIS invoice.
// This route NEVER sets paid=true — only the verified webhook can.
export async function POST(request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();
  if (!row.domain) return badRequest('this reading has no domain selected');

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }
  const waNumber = body?.wa_number;
  if (!waNumber || typeof waNumber !== 'string') {
    return badRequest('wa_number is required');
  }

  await setWaNumber(id, waNumber);

  // TODO(Phase 4a): create a Xendit QRIS invoice with external_id = id (so the
  // webhook can correlate the callback back to this reading), then return the QR
  // string / checkout payload. Until then, the WA number is stored and the
  // client should show the "menunggu konfirmasi pembayaran" pending state.
  return json({
    ok: true,
    pending: true,
    invoice: null,
    note: 'Xendit QRIS invoice creation lands in Phase 4a.',
  });
}
