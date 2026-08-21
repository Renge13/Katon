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
//      MET 2026-08-07. (QRIS ACTIVATED 2026-08-11; first self-purchase reported
//      by Reyner 2026-08-13. Neither is part of THIS condition; both are tracked
//      in PROGRESS.md, THE INTERIM REGISTER.)
//
//   2. RE-RULED 2026-08-13 (Reyner). The 7-beat Bacaan Mendalam is RETIRED and
//      the locked free-full-mirror model is restored, so the old wording —
//      "the fulfillment swap shipped, so the Rp 19.000 upsell is a real thing to
//      buy" — described the swap as a thing that could happen BESIDE promotion.
//      It cannot.
//
//      RETIRING THE GATE AND REPLACING THE UNVALIDATED PROSE ARE THE SAME ACT.
//      The paid beats and the free prose come from ONE source: the ten cells in
//      `contents/*hubungan*.md`, sliced by `scripts/build-content.mjs` into the
//      3 FREE + 7 PAID sections of `lib/content/<archetype>.js`. Promoting this
//      route replaces the FREE half with Stage 3-6 output. The same commit
//      therefore orphans the PAID half, which is the only thing Rp 19.000 buys
//      today. There is no ordering in which one lands without the other.
//
//      And that prose was never signed off: `grep -l "pending founder"
//      contents/*.md` returns 16 of 20 (2026-08-13), three more are stamped
//      SCAFFOLD/pre-validation and one carries no STATUS at all. So the act also
//      removes unvalidated cells from a paying customer's hands.
//
//      SO PRECONDITION 2 IS NOW: the Rp 19.000 has a deliverable that is NOT the
//      free mirror — the card + PDF exist and ship — AND `/harga`, `/syarat` and
//      INVOICE_DESCRIPTION describe that, not the deep read. Otherwise promotion
//      leaves a live SKU selling something the same commit just gave away.
//      NOT MET. The full package is PROGRESS.md, THE DEFERRED REGISTER.
//
//   3. Reyner has QA'd real readings through this preview. NOT MET, and BLOCKED:
//      the Gemini prepayment credits are depleted, so every render returns the
//      module-assembly floor. Nothing to read until billing is topped up.
//
//   4. fact.relation_positions no longer reads a temporal `hari` as a pillar —
//      the NOT_A_SPAN fix for `kemudian hari` / `suatu hari` / `hari ini`.
//      **MET 2026-08-12**, gate 1.9.0 (`NOT_A_SPAN`, lib/validate/fact.js:133).
//      Kept in the list rather than deleted: it is the record of why a gate fix
//      was a release gate at all. A hard finding drops the reading to the floor
//      and floorRefusalReason answers a hard-rejected floor with a 503 — behind
//      this fence a curiosity, on a public mirror a 503 generator, because
//      Indonesian uses `hari` temporally more than positionally and the renderer
//      writes free prose. History: PROGRESS.md, the 08-12 tranche-2b section.
//
// 2 of 4. Promotion is blocked.
//
// (This header read "1 of 4" and "4. NOT MET" until 2026-08-13, while
// PROGRESS.md had condition 4 MET since 08-12. A checklist kept in two places
// drifts in exactly this direction, which is the risk the ledger names. If you
// change a row here, change it there in the same commit.)
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
