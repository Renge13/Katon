// ============================================================
// GET /api/mirror/[token] — serve a mirror reading
// ============================================================
// PROMPT J. token -> reading row -> cache check -> render if missed -> gate ->
// store -> serve. Every one of those steps already exists in
// lib/render/index.js#renderReading; this route CONSUMES that chain and
// reimplements none of it.
//
// A cache hit makes ZERO provider calls. That is the economics of the free
// mirror (rules 16 and 19) and tests/mirror-route.spec.mjs asserts it with a
// provider stub that throws if it is touched.
//
// ── THE FENCE (Prompt J task 5) ────────────────────────────
// `MIRROR_PREVIEW_TOKEN` unset = this route 404s entirely. Wrong token = 404.
// The path is linked from NOWHERE. There is no `NEXT_PUBLIC_*` flag and nothing
// client-readable, because a fence you can flip is a fence someone flips by
// accident (the STAGE6_VERSION pattern, and the NEXT_PUBLIC_FREE_FULL_READING
// lesson recorded in .env.example).
//
// PROMOTION — wiring the funnel to this route and removing the preview-token
// requirement — is a SEPARATE, LATER, DELIBERATE commit. Do not do it from a
// session that merely touched this file. Its four named preconditions:
//
//   1. Xendit verification approved + live keys swapped.
//      MET 2026-08-07. (QRIS ACTIVATED 2026-08-11. The first real self-purchase
//      has not happened. Neither is part of THIS condition; both are tracked in
//      PROGRESS.md, THE INTERIM STATE.)
//   2. The fulfillment swap shipped — Complete Edition card + PDF actually
//      exist, so the Rp 19.000 upsell is a real thing to buy. NOT MET.
//   3. Reyner has QA'd real readings through this preview. NOT MET.
//   4. fact.relation_positions no longer reads a temporal `hari` as a pillar —
//      the NOT_A_SPAN fix for `kemudian hari` / `suatu hari` / `hari ini`.
//      NOT MET, added 2026-08-12. A hard finding drops the reading to the floor
//      and floorRefusalReason answers a hard-rejected floor with a 503. Behind
//      this fence that is a curiosity; on a public mirror it is a 503 generator,
//      because Indonesian uses `hari` temporally more than positionally and the
//      renderer writes free prose. Fourth time this check has cost work; the
//      history is in PROGRESS.md under the 08-12 tranche-2b section.
//
// 1 of 4. Promotion is blocked.
//
// The handler lives in lib/ so `node --test` can load it — see that file's
// header for why.
// ============================================================

import { serveMirrorReading } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { token } = await params; // Next 15: params is async
  return serveMirrorReading(request, token);
}
