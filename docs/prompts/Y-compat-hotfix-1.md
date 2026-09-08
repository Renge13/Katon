<!--
STATUS: RELEASED 2026-09-08 by Reyner. HOTFIX. Cowork wrote this into the tree; Claude Code commits it
first, alone, on `fix/compat-report-hotfix`. Ships before anything else: a paying customer currently
receives a blank report. Sales close in commit 0 and STAY closed until DOKU (Reyner, 2026-09-08).
-->

# Prompt Y-1 - Compat report hotfix

Reyner paid Rp 39.000 on production for pair `g4WH4_9QbCrCj3Gha934q`. The pending page sat for minutes;
after a refresh the report showed six headings, no paragraphs, the raw keys `contrasting` and `q4` as
text, and only the penutup as prose. Screenshots are with Cowork. Every claim below carries its grep,
dated 2026-09-08, on main.

## 0. Sales CLOSED (Reyner, 2026-09-08: Katon is exiting Xendit; no new real payments)
Introduce `PAYMENTS_PROVIDER` = `xendit` | `mock` | `closed`, read in ONE place (`lib/paymentFence.js` or
beside it) and consumed by `POST /api/pay/[id]` and the webhook route. Production is set to `closed`:
the Home Compatibility card stays but leads to `/kompatibilitas` in its sales-closed state
(`sales_closed_title/body`, strings in the rulings file); `POST /api/pay` returns 503
`payment_closed`; existing paid pairs and paid mirror artifacts keep serving. `mock` is REFUSED when
`VERCEL_ENV=production` (test asserts it), and exists so the paid flow can be walked for free on Preview
and locally: `POST /api/pay` with mock returns a local `/kompatibilitas/<id>?bayar=mock` URL and a
`POST /api/mock-pay/<id>` (non-production only) flips paid through the SAME `markPairPaid` /
`markArtifactPaid` door the webhook uses. Nothing else about the Xendit adapter changes; Reyner
handles the Xendit balance and later unsets its keys. DOKU is a later phase, not this prompt.
This replaces the earlier "reopen sales" plan: commit 5 no longer reverts anything.

## 1. The blank report (confirmed)
`components/ProseBlocks.jsx:69` reads `b.paragraphs`, `:78` reads `b.heading`. The render contract at
`lib/render/schema.js:77` is `{fact_ids, heading, text}` and `lib/pair/serveReading.js:165` sends
`reading.blocks` in that shape. Find where the mirror turns `text` into `paragraphs` before it reaches
`ProseBlocks` (grep `paragraphs` in `components/Funnel.jsx`) and put the SAME adapter in front of
`PasanganReport`, or move the adapter into `ProseBlocks` so neither caller can skip it. Prefer the latter.
Test: capture the REAL production response for pair `g4WH4_9QbCrCj3Gha934q` via `GET /api/pair/<id>/reading`
(server-side, with the service key; B's birth is not in it) and commit it as the fixture. Assert every
block renders at least one paragraph. Shown red on the current component first.

## 2. Raw keys where names belong (confirmed)
`lib/pair/serveReading.js:165-166` sends `semanticJson.core.pattern` / `.quadrant` (`contrasting`, `q4`).
`components/PasanganReport.jsx:40-51` believes they are `kompatibilitas.p4_*.name_id` / `p5_q*.name_id`.
Resolve on the SERVER: `facts.pattern = GLOSSARY.kompatibilitas['p4_' + pattern].name_id`, same for
`p5_` + quadrant. Never send the raw key to a client. Test asserts the served string equals the glossary
name_id and that no value in `facts` matches `/^(matching|related|contrasting|q[1-4])$/`. Red first.

## 3. The wait after payment (measure, then fix the cause)
`serveReading` renders Gemini synchronously inside the GET, regeneration attempts included; no
`maxDuration` in the repo (`grep -rn maxDuration app lib vercel.json` = 0). Read the Vercel function
duration and status for the production invocation(s) of `/api/pair/g4WH4_9QbCrCj3Gha934q/reading`
around 20:09-20:11 WIB (Reyner opens the dashboard if you cannot). Then:
- If the function timed out or exceeded the platform limit: kick off the render from the webhook
  (`markPairPaid` -> render -> persist), so the GET serves cache or a `rendering` status; the client
  polls `rendering` the same way it polls `not_paid`. No second Gemini call for the same pair
  (idempotent on `cache_key`).
- Either way: `PasanganReport` gets a `rendering` state that shows the block skeleton (six eyebrow
  placeholders and grey paragraph bars, mirror-styled) and never a blank page or a dead end; a refresh
  during rendering lands on the same skeleton.
- The Xendit checkout tab: after payment, `success_redirect_url` must land on `/kompatibilitas/<id>?bayar=selesai`
  and that page must move on its own. Assert the redirect URL and the poll on the real webhook payload
  shape (fixture from Xendit's docs, signed with the test token).

## 4. Free walk
Document in `docs/ops/paid-flow-walk.md`: Preview + local run with `PAYMENTS_PROVIDER=mock`; Reyner walks
the full paid flow on the preview URL, pays nothing, Gemini spend accepted. Xendit test keys are NOT
needed and are not set.

## 5. Ledger
Ledger: LIVE STATE row, COWORK-BRIEF section 4 new row - "a UI test against a fixture
the data source never produces, and a browser check that stopped at the paywall, both green while a paid
page was blank; fourth instance of row 47's shape". NEXT.md CURRENT WORK.

## Not to do
No real Xendit transaction by anyone. No UX redesign here (that is Y-2, Reyner rules the spec first). No copy changes beyond none. No Stage 6
change. No PDF.
