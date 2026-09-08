<!--
STATUS: RELEASED 2026-09-08 by Reyner (five UX rulings below). Start only after Y-1 is merged and
Reyner has walked the paid path on Preview with PAYMENTS_PROVIDER=mock. Cowork wrote this into the
tree; Claude Code commits it FIRST, alone, on `feat/site-chrome-ux`.
-->

# Prompt Y-2 - Site chrome and the Compatibility flow, made to make sense

Reyner's brief (2026-09-08): "UX, navigations, must be professional, doesn't need to be beautiful, but
makes sense and modern." No new visual language: reuse the existing tokens, type, cards, eyebrows and
`Reveal`. This prompt adds STRUCTURE (navigation, steps, states) and removes dead ends.

Strings: every new reader-facing string is in `docs/content/pasangan-copy-rulings.md` under "Y-2
strings" and ships under the 2026-09-08 chrome process ruling (Cowork swept drafts, Reyner amends in
place). Bank `CHROME_COPY` (registered), ids `chrome_*`. No other Indonesian anywhere.

## RULINGS (Reyner, 2026-09-08)
1. Persistent header on EVERY page, whole site: Katon wordmark links home; two links, Bacaan Diri and
   Kompatibilitas. One shared component for mirror and compat.
2. Copy-link button on the paid compat report. NO PDF in this prompt (Y-3).
3. Two-person form as a numbered stepper: 1 Kamu, 2 Dia, 3 Email; distinct card treatment per step;
   one-line summary of each completed step.
4. Report page has exactly seven states: not found, unpaid/resume, pending payment, rendering
   (skeleton), ready, floor-served, error. None removed.
5. Chrome applies to the whole site.

## Commit 0 - this file, alone

## Commit 1 - `components/SiteHeader.jsx`, on every route
Wordmark (existing `KATON.APP` mark or wordmark asset) -> `/`. Links: `chrome_nav_mirror` -> `/`,
`chrome_nav_compat` -> `/kompatibilitas`. Current route marked (aria-current). Sticky is Reyner's call
on the preview; ship non-sticky. Render from `app/layout.js` so no page can omit it; the existing footer
moves into a `SiteFooter.jsx` in the same layout. Mirror funnel specs stay green; Home snapshot changes
only by the header. Test: every `app/**/page.js` renders the header (walk the route table, not a list).

## Commit 2 - the stepper on `/kompatibilitas`
`components/PasanganSteps.jsx`. Product block stays above. Then three cards in sequence; only the
active step is expanded. Step 1 `chrome_step_1` (Kamu): `BirthFields`; `chrome_step_next` collapses it
to a one-line summary "13 Sep 1989, 09.00, Laki-laki" (time absent -> `chrome_summary_time_unknown`),
with `chrome_step_edit`. Step 2 `chrome_step_2` (Dia) opens; same. Step 3 `chrome_step_3` (Email):
the email field + `form_email_help` + the submit `form_submit`. Distinct treatment: step number badge,
step 1 and 2 cards differ by accent (A = the existing warm accent, B = the existing secondary accent),
completed cards flatten. Validation per step, not on submit. The season gate appears inside the step it
belongs to, `season_gate_b_intro` for step 2. Submit path unchanged from X-b3 (season check both ->
POST /api/pair -> POST /api/pay -> provider URL or mock). `?dari=<token>` prefills step 1 and starts on
step 2. Tests red first: step order, summary line, edit reopens, B gate copy, `?dari` prefill.

## Commit 3 - `/kompatibilitas/[id]`: the seven states, one component per state
`PasanganReport.jsx` becomes a switch over a single `view` derived from `GET /api/pair/<id>` (+ `/reading`):
- `not_found` -> `notfound_title`, link home.
- `unpaid` -> product block + `unpaid_resume` + button to `invoice_url` (or the mock pay URL); when
  `PAYMENTS_PROVIDER=closed`, `sales_closed_title/body` instead of the button.
- `pending_payment` (`?bayar=selesai|mock`, unpaid) -> `pending_title/body`, polling as today, with a
  visible fallback after POLL_LIMIT: `error` view, never a frozen page.
- `rendering` (paid, reading not yet cached; from Y-1 section 3) -> `chrome_rendering_title/body` +
  the SKELETON: six eyebrow bars + three grey paragraph bars each, in the report's exact layout, polling
  `/reading`. A refresh lands here again.
- `ready` -> the report. Header: `paid_title`; the URL box with `link_keep` and the COPY button
  (`chrome_copy_link` -> `chrome_copy_link_done` for 2s; `navigator.clipboard` with a select-all
  fallback). Badge + quadrant eyebrows over their blocks with the glossary names (Y-1 fix). Blocks with
  paragraphs. Penutup. Footer link back to `/kompatibilitas` (`chrome_home_link` -> `/`).
- `floor` -> IDENTICAL to ready (the floor is the product's own words); `served_from` is telemetry only.
  A test asserts the two views are the same component with the same props.
- `error` (any non-2xx other than 404, or a thrown fetch) -> `chrome_error_title/body`, a retry button,
  the page URL shown so the reader can quote it.
Tests: one fixture per state from the REAL response shapes (Y-1's captured production response for
`ready`); each state renders its strings and never another state's; no state renders B's birth.

## Commit 4 - the mirror gets the same courtesy
Nothing structural. The mirror's reading page shows the header (commit 1) and a copy-link button on the
`/r/<token>` page using the same component as commit 3. Nothing else in the funnel changes; specs green.

## Commit 5 - ledger
LIVE STATE, NEXT.md (owed: Reyner's phone walk on Preview with mock; Y-3 PDF for compat; DOKU phase;
Render before promotion), COWORK-BRIEF row if anything in this prompt was found stale.

## Not to do
No PDF. No pricing or payment-provider work beyond reading `PAYMENTS_PROVIDER`. No Stage 6 change. No
new visual language, no new fonts or colours. No Indonesian outside the rulings file. Open the PR with the
Preview URL; Reyner walks it on a phone with `PAYMENTS_PROVIDER=mock` set for Preview.
