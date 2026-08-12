<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-06 by Cowork.
This is PROMPT J — the mirror route: the first consumer of the Stage 3-6 pipeline. Own session/PR.
PRECONDITION: MET — gate 1.8.0 measured 08-07 (first-pass 70.0%, shipped 88.5%, both real vs the
pooled baseline) and Reyner queued J as the next build (COWORK-BRIEF §6, 2026-08-07).
CRITICAL CONTEXT (updated 2026-08-12): Xendit verification is APPROVED and live keys are swapped —
promotion precondition 1 of task 5 is MET. QRIS ACTIVATED 2026-08-11, so the money path is live and
only the first self-purchase is outstanding (PROGRESS, THE INTERIM STATE). J is unaffected either
way. The legacy funnel stays untouched in J regardless: the fulfillment swap is its own
later build. Everything J builds ships FENCED (see task 5); promotion to the public funnel is a
separate, later, deliberate commit gated on three named conditions (1 of 3 now met).
-->

# Prompt J — the mirror route: birthdate in, gated pipeline reading out

## Read first, in order
1. `../../CLAUDE.md` — rules 14-19 (architecture), rule 19 especially: rate limiting is a
   PRECONDITION of any public exposure, not an enhancement.
2. `../PROGRESS.md` — THE INTERIM STATE section (Xendit go-live status, QRIS pending) and the
   gate 1.8.0 measurement rows (08-07, the current pipeline state).
3. `lib/render/index.js` — `renderReading`, `persistRendered`, `RenderRefused`. The chain already
   does cache-check, provider failover, gate, floor. J consumes it; J does not reimplement any of it.
4. `lib/semantic/index.js` — `buildSemanticJson`, `cacheKey`.
5. `app/api/reading/[id]/route.js` and `app/r/[token]` — the legacy flow J must NOT disturb.

## What J is
The first end-to-end serving path for the REAL product: birth data -> chart -> semantic JSON ->
result cache -> render -> gate -> store -> serve. The free mirror, complete and ungated BY DESIGN —
but shipped behind a preview fence until promotion conditions are met.

## Tasks, in commit order

### 1. The route pair
- `POST` endpoint: accepts birth date (+ optional hour, + optional gender), creates a reading row,
  computes chart + semantic JSON server-side, returns a non-enumerable token URL. Reuse the existing
  reading-row/token machinery if it fits (it already satisfies rule 19's non-enumerable requirement);
  add a `cache_key` column via migration 0007 if the row needs to reference `render_cache`. Migration
  file carries the run-before-deploy header like 0005/0006.
- `GET` serving path: token -> reading row -> cache_key -> `render_cache` hit = serve stored blocks;
  miss = `renderReading(semanticJson)` -> `persistRendered` -> serve. A cache hit makes ZERO provider
  calls (test asserts this with a stubbed provider that throws if touched).
- Serve shape: ordered `blocks[]` (heading + paragraphs split per `lib/render/paragraphs.js` — never
  raw `\n\n` to the client) + `penutup` + the chart display data (pillars WITH hanzi per rule 23's
  KEEP side — the chart is data, plus Indonesian animal/element pairing).

### 2. Boundary softness
Stage 3 carries `confidence` / `confidence_reasons` for solar-term-edge and 子-hour charts. The route
passes a `boundary: true` flag to the client when confidence is flagged, so the UI can read softly
(copy for that state is a later Reyner pass; J only exposes the flag).

### 3. Rate limiting (rule 19 — blocks promotion, so build it now)
Per-IP and per-session limits on the POST path. Simple fixed-window in Supabase or an in-memory
token bucket behind an interface — Code's choice, but: fail-closed on the abuse side (limit exceeded
= 429), no bulk endpoint, and the limiter has tests. The real risk is content harvesting of the
cached mirror space, not API cost.

### 4. Feedback hook (Stage 7 minimal)
One endpoint: thumbs up/down on a served reading -> flips `render_cache.status` to `flagged` on 👎
(keeps serving unless it failed hard checks — pipeline-spec Stage 7 rules). No UI work in J beyond
the endpoint; the funnel wiring comes with promotion.

### 5. THE FENCE — missing capability, not a switch (the STAGE6_VERSION pattern)
The new route mounts under a path that is linked from NOWHERE, and the GET requires a preview token:
`MIRROR_PREVIEW_TOKEN` set in env = QA access for Reyner; absent = the route 404s entirely. No
`NEXT_PUBLIC_*` flag, nothing client-readable. PROMOTION (wiring the funnel to this route, removing
the preview token requirement) is a SEPARATE future commit whose named preconditions are:
  1. Xendit verification approved + live keys swapped — MET 2026-08-07 (QRIS ACTIVATED 2026-08-11;
     the first real self-purchase is a separate ritual step, see INTERIM STATE),
  2. the fulfillment swap shipped (Complete Edition card + PDF exist, so the 19k upsell is real),
  3. Reyner has QA'd real readings through the preview.
Write these into the route file header AND the PROGRESS interim section, so no session promotes early.
NOTE, 2026-08-12: the list grew a FOURTH precondition after this prompt was written (the
`fact.relation_positions` NOT_A_SPAN fix). **PROGRESS and the route header are the live checklist;
this prompt is a build handover and is not.** Read them there.

## What J must NOT touch
- The legacy funnel, paywall, and `/full` unlock — the fulfillment swap is its own later build;
  J does not go near the paid path.
- Payments. Engine (`lib/bazi/*`, `lib/semantic/*` except consuming exports). The gate.
- The renderer prompt.

## Tests (route-level, all deterministic)
Cache hit = zero provider calls. Fence: no token = 404, wrong token = 404, correct token = 200.
Rate limit trips at the configured threshold. Non-enumerable: sequential token guesses fail.
Boundary flag surfaces for the known edge fixture chart. 👎 flips status to flagged; hard-fail
readings fall back immediately.

## Constraints
Each commit independently revertable; message describes everything staged. Stop and report on any
contradiction — docs win over this prompt, CLAUDE.md wins over docs.
