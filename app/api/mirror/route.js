// ============================================================
// POST /api/mirror — create a mirror reading
// ============================================================
// PROMPT J. Birth data in, a reading row and a non-enumerable token out. It does
// NOT render; rendering happens on the GET.
//
// PROMOTED 2026-08-23. IT IS THE FRONT DOOR NOW. This header read "FENCED AND
// LINKED FROM NOWHERE - `MIRROR_PREVIEW_TOKEN` unset = 404" until then, and
// lib/mirror/fence.js is deleted with it: components/Funnel.jsx posts here, so a
// fence in front of this route is a fence in front of the site.
//
// THE LEGACY FUNNEL ROUTE IS GONE. `/api/reading` and the `contents/*.md` cells it
// read are both retired. A non-null `cache_key` used to be what distinguished a
// mirror row from a funnel row; nothing writes a null one any more, and the branch
// that still checks survives only for rows created before this commit.
//
// The handler lives in lib/ so `node --test` can load it — see that file's
// header for why.
// ============================================================

import { createMirrorReading } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function POST(request) {
  return createMirrorReading(request);
}
