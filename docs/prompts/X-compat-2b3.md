<!--
STATUS: RELEASED 2026-09-08 by Reyner (route `/kompatibilitas`; email store-only v1). Start only after
PR #100 (merged a5648a6) AND the three Stage 6 PRs (tension_collapse scope, p0_opening, verdict) are merged. Cowork wrote this into the working tree; Claude Code
commits it FIRST, alone, on `feat/compat-2b3`.
-->

# Prompt X-b3 — Compat tranche 2b3: the surface (the first prompt a buyer can see)

Branch `feat/compat-2b3`. Eight ordered commits. After this, a person can find Compatibility on the
front door, enter two birth dates, pay, and read the report. Every reader-facing string ships as a
`PENDING()` slot; the production gate refuses until Reyner rules them; preview builds pass so the
surface can be seen in order to be ruled.

Read `CLAUDE.md`, `docs/NEXT.md`, `docs/prompts/X-compat-2b1.md` and `X-compat-2b2.md`, LIVE STATE in
`docs/PROGRESS.md`, `components/Funnel.jsx` (Home :428, SeasonGate :551, Reading :760, Offer :1226,
Upcoming :1387, Pending :1586, ReadingByToken :1712), `app/page.js`, `app/r/[token]/page.js`,
`lib/site/copy.js` (SITE_COPY, COMPAT_COPY, UPCOMING_COPY, `PENDING`), `scripts/check-unruled-copy.mjs`,
`lib/pair/*`, `app/api/pay/[id]/route.js`, `docs/content/upcoming-copy-rulings.md` (the shape rulings
take).

## 0. RULINGS THIS PROMPT DEPENDS ON (both made 2026-09-08)
- **The route path: RULED `/kompatibilitas`** (Reyner, 2026-09-08). Bank name stays `PASANGAN_COPY`
  and slot prefix `pasangan_` as internal identifiers; the reader sees only the URL and ruled strings.
- **Email sending: RULED store-only for v1** (Reyner, 2026-09-08). Store the email, show the report
  link on screen after payment, send nothing.
- Everything else reader-facing is a `PENDING()` slot and is ruled AFTER Reyner sees the preview.

## THE PRODUCT MODEL THIS IMPLEMENTS (ruled 2026-09-07, verbatim in X-b1)
Two front-door paths: Mirror (understand yourself, free) and Compatibility (the dynamic between two
people, paid). Neither is a prerequisite for the other. Person B gets nothing. No free compat result,
no tease, no Gemini before payment. Pre-payment is static: product block, price, inclusions, the form.

## Commit 0 — this file, alone

## Commit 1 — the copy gate stops enumerating banks by name (the structural fix)
Three times in three days a new string bank arrived invisible to `check-unruled-copy.mjs` because it
lists banks by hand (`BANKS = { UPCOMING_COPY, COMPAT_COPY, 'GLOSSARY.kompatibilitas' }`). Replace the
hand list with a registry the banks register INTO:
- `lib/site/copy.js` exports `COPY_BANKS`, an object every `*_COPY` export is added to at its
  definition site (`register('SITE_COPY', SITE_COPY)`), and `lib/site/unruledScan.js` exports
  `UNRULED_SOURCES = { ...COPY_BANKS, 'GLOSSARY.kompatibilitas': GLOSSARY.kompatibilitas }` as the ONE
  place a scannable source is named.
- `scripts/check-unruled-copy.mjs` and `tests/unruled-copy.spec.mjs` import `UNRULED_SOURCES` and
  enumerate it; neither names a bank.
- The spec gains the guard that makes this structural: it reflects over `import * as copy from
  '../lib/site/copy.js'`, and asserts every export whose name ends in `_COPY` is present in
  `COPY_BANKS`. Shown red first by adding a throwaway `TEST_COPY` export without registering it.
- `docs/COWORK-BRIEF.md` section 4 row: "a gate that enumerates its subjects by name is blind to the
  next subject; three instances 2026-09-05..08; fixed by inversion (subjects register into the gate)."

## Commit 2 — the strings, as slots
New bank `PASANGAN_COPY` in `lib/site/copy.js` (registered), every value `PENDING('pasangan_<slot>')`:
`home_mirror_label`, `home_mirror_sub`, `home_compat_label`, `home_compat_sub` (the two front-door
paths; `SITE_COPY` gets these four so Home reads from one bank), `page_title`, `page_lead` (Reyner's
structural brief: "A personalized reading of how your two patterns meet - attraction, tension,
elemental complementarity, day-to-day fit, and the overall dynamic between you"), `includes_1..5`
(P1 cores, P2 seats, P3 elements, P4 pattern badge, P5 quadrant + P7 map), `price_note` (the price
itself comes from `lib/pricing.js#priceFor('compat')`, never a string), `form_a_legend`,
`form_b_legend`, `form_email_label`, `form_email_help` (why: access + recovery, nothing sent),
`form_submit`, `season_gate_b_intro` (the season gate asks about the OTHER person's birth),
`pending_title`, `pending_body`, `paid_title`, `link_keep` (keep this link; it is your access),
`unpaid_resume` (return to an unpaid pair), `report_badge_eyebrow`, `report_quadrant_eyebrow`,
`notfound_title`. `/privasi` additions: `privasi_email`, `privasi_second_person`. Also delete
`UPCOMING_COPY.compat.*` slots and the `Upcoming` compat row (annual stays; its "Belum tersedia"
ruling still applies). Production build refuses; preview passes. Assert both.

## Commit 3 — Home: two paths
`components/Funnel.jsx#Home` gains the second path ABOVE the mirror form or beside it (technicality:
Cowork rules a two-card choice row above the existing form, mirror first, compat second, both
reading from `SITE_COPY.home_*`; Reyner judges it on the preview and may reorder). Compat card links
to the ruled route. Mirror flow byte-identical otherwise (assert the existing funnel specs green and
the Home snapshot unchanged except the new row). `Upcoming` compat tap deleted; `product_interest`
POST for `compat` removed with it; the DEFERRED REGISTER row that cited the tap as the demand
instrument is updated: demand is now measured by purchases.

## Commit 4 — `/kompatibilitas` (route name per Reyner): the pre-payment page
`app/kompatibilitas/page.js` → `components/Pasangan.jsx`. Extract `BirthFields` from `Home` (date, time
step 3600, gender) into a shared component used by both, so validation and behaviour are one
implementation. The page: product block (title, lead, includes, price from `priceFor`), form with
`BirthFields` twice (legends A and B), email field, submit. Submit: run the season check for BOTH
(reuse the existing `/api/season-check` call from `Funnel.jsx:329`; when either is on a boundary,
show `SeasonGate` for that person with `season_gate_b_intro` for B); then `POST /api/pair`; then
`POST /api/pay/<pairId>` with `{ sku: 'compat', email }`; open `invoice_url` like the Offer does
(`Funnel.jsx:1256`); push `/kompatibilitas/<id>` into history like the mirror does (`:269`). **No chart,
archetype, relation or any computed fact is shown before payment.** `a_reading_id` is set when the
page was reached from a mirror reading (`?dari=<token>`), prefilling A's fields; otherwise null.
Fix the X-b1 regression: `app/api/pay/[id]/route.js` sets `success_redirect_url` /
`failure_redirect_url` for pairs to `/kompatibilitas/<id>?bayar=selesai|gagal`. Tests red first.

## Commit 5 — `/kompatibilitas/[id]`: pending and the report
`app/kompatibilitas/[id]/page.js` → `components/PasanganReport.jsx`. Reads `GET /api/pair/<id>`:
`not_paid` → product block again + `unpaid_resume` + reopen `invoice_url` if the pair has one;
`paid` → `GET /api/pair/<id>/reading` → the prose blocks rendered with the SAME block renderer the
mirror's `Reading` uses (extract it if it is not already a component; do not fork it), with the P4
badge (`kompatibilitas.p4_*.name_id`) and P5 quadrant (`p5_q*.name_id`) as eyebrow'd labels above
the P4 and P5 blocks, and `link_keep` + the URL shown on screen. `served_from: 'floor'` renders
identically (the floor is the product's own words). Polling while `?bayar=selesai` and unpaid,
same cadence as `Pending`. No card, no PDF, no share button in v1. Tests red first, including: B's
birth data never appears in any response the page consumes (grep the fixture responses).

## Commit 6 — `/privasi` and the legacy comment
`SITE_COPY.privasi` gains the two slots; `lib/site/copy.js:293`'s "no email is captured anywhere
today" comment is replaced with the dated truth. Nothing else on the static pages changes.

## Commit 7 — the ledger
LIVE STATE: Compatibility row rewritten to what a reader gets (route, static pre-payment page,
email-only identity, report after webhook, floor identical in presentation), "not purchasable"
struck with the commit; Upcoming row updated (annual only). `NEXT.md`: owed = the `PASANGAN_COPY`
rulings (Reyner, worksheet from Cowork), the two `/privasi` strings, Reyner's phone walk of the
preview, the n=20 floor re-measure result from `fix/compat-stage6-scope`. `docs/product/
compatibility-reading-spec.md`: header notes P0/comparison card superseded and the surface shipped.

## Not to do
No Indonesian text anywhere but `PENDING()`; no card or PDF for compat; no email sending; no change
to the mirror funnel beyond Home's new row and the `BirthFields` extraction (assert the mirror
specs and `tests/mirror-route.spec.mjs` unchanged-green); no Stage 6 change; no pricing change.
Preview deploy passes; production refuses until every `pasangan_*` and `privasi_*` slot is ruled.
Open the PR with the preview URL in the description so Reyner can walk it on a phone.

## Parallel, Cowork: `PASANGAN_COPY` worksheet
Every slot above with the English gloss and a draft in Reyner's syntax, swept before he sees it,
patterned on `docs/content/upcoming-copy-rulings.md`. Applied by hand verbatim (no script targets the
copy bank), `npm run check:copy` as the proof.
