// ============================================================
// POST /api/mirror — create a mirror reading
// ============================================================
// PROMPT J. Birth data in, a reading row and a non-enumerable token out. It does
// NOT render; rendering happens on the GET.
//
// FENCED AND LINKED FROM NOWHERE. `MIRROR_PREVIEW_TOKEN` unset = 404, wrong
// token = 404. See lib/mirror/fence.js, and the promotion preconditions in
// app/api/mirror/[token]/route.js.
//
// This is NOT the legacy funnel (`/api/reading`), which is untouched and stays
// live. The two share the `reading` table and its CSPRNG token machinery on
// purpose; a mirror row is the one carrying a non-null `cache_key`.
//
// The handler lives in lib/ so `node --test` can load it — see that file's
// header for why.
// ============================================================

import { createMirrorReading } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return createMirrorReading(request);
}
