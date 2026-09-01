// ============================================================
// POST /api/mirror/[token]/event — the client-fired funnel counters
// ============================================================
// Prompt Q commit 3. Four of the eight events happen in the browser and nowhere
// else - the free card download, the offer block appearing, and the upcoming
// block and its taps - so there is no server request at those moments to attach
// them to.
//
// IT ACCEPTS A CLOSED SUBSET. The server-fired four (reading_created,
// mirror_served, checkout_started, purchase_confirmed) are REFUSED here. Those
// are facts the server establishes, and a client that could assert them could
// forge a conversion. purchase_confirmed is webhook-only, which is rule 18's
// shape applied to counters: paid state and the record of paid state come from
// the same place or neither can be trusted.
//
// Same rate limit and the same 404-on-unknown-token as the rest of this route.
// ============================================================

import { recordMirrorEvent } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { token } = await params; // Next 15: params is async
  return recordMirrorEvent(request, token);
}
