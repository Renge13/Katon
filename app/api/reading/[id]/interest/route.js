import { getReading, setInterest } from '@/lib/readingStore';
import { json, notFound, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/reading/[id]/interest   body: { domain, wa_number }
// Demand-capture for a "segera" domain (Karier / Uang). Stores the WhatsApp number
// + which domain was wanted, against the reading row. CAPTURE ONLY — never sends a
// message, never grants any paid content. The phase-2 prioritization signal.
const SEGERA_DOMAINS = ['karier', 'uang'];

export async function POST(request, { params }) {
  const { id } = await params;
  const row = await getReading(id);
  if (!row) return notFound();

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  const { domain, wa_number: waNumber } = body || {};
  if (!SEGERA_DOMAINS.includes(domain)) {
    return badRequest(`domain must be one of ${SEGERA_DOMAINS.join(', ')}`);
  }
  if (!waNumber || typeof waNumber !== 'string') {
    return badRequest('wa_number is required');
  }

  await setInterest(id, { domain, wa: waNumber });
  return json({ ok: true });
}
