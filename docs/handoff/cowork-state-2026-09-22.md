# Katon state — END OF 2026-09-22. LAUNCH CUT IN FORCE. PR #126 (paid-product defects) open/merged - CONFIRM. PR 2 (layout) half done on `feat/ab-paid-layout` @ `3859cc9`. Blocked on DOKU for launch.

READ THIS FIRST in the next session. Supersedes `KATON-state-2026-09-21.md` (keep it for 09-21 detail). Cite the
katon skill's four checks before acting. **Before writing any Next list or status, open the OWNING SOURCE below
and quote it - never carry the status forward from this doc.**

## 0. DECISIONS IN FORCE — RE-READ THE SOURCE, NEVER CARRY THE STATUS
| Decision | Status 2026-09-22 night | OWNING SOURCE (open it) |
|---|---|---|
| **THE LAUNCH CUT (ruled 09-21/22)** | Launch = FREE + PAID TOGETHER, gated on DOKU. Ships with launch: (1) DOKU flip, (2) front door AA, (3) paid-product fix-up AB (PDFs + report), (4) pay-without-notification safety + `pending_body` contact line. Everything else PARKED. Token cap and capture-flow DROPPED. | repo `docs/handoff/launch-cut-2026-09-21.md` (committed `docs/launch-cut` branch); project `KATON-launch-cut-2026-09-21.md` |
| Xendit | TERMINATE. Adapter deleted (#122). **OPEN: written closure confirmation, deadline before 1 Oct** (USD 50/month dormant fee). | `docs/PROGRESS.md` INTERIM REGISTER "XENDIT PRICING CHANGES 2026-10-01" |
| Payments provider | DOKU adapter merged (#124). Production untouched (no keys, `PAYMENTS_PROVIDER` unset = closed). Preview: `PAYMENTS_PROVIDER=mock` since 09-22 for walks (DOKU vars still present, inert). | `lib/paymentFence.js`; `docs/ops/doku-walk.md` |
| DOKU blockers (ticket 1149053) | (1) QRIS inactive on sandbox Checkout - activation asked via Settings -> Payment Settings (sandbox + production); (2) HTTP Notification never delivered - asked whether enabled. **Escalate by phone if silent 2 working days.** | `docs/ops/doku-walk.md`; DEFERRED REGISTER rows |
| Production-flip gate | a) QRIS active for production; b) one DELIVERED notification captured; c) prod keys + `PAYMENTS_PROVIDER=doku`, no `DOKU_SANDBOX`; d) notify URL on QRIS channel in PRODUCTION Back Office. Then Reyner's Rp 39.000 walk. | `KATON-state-2026-09-21.md` §0; `docs/ops/doku-walk.md` |
| Pay-without-notification safety (item 4, ruled 09-22) | (a) report load with invoice + unpaid -> ONE DOKU check-status, settle via `settlePair` on SUCCESS; (b) `pending_body` += Reyner's ruled sentence (below). NOT BUILT YET - own small PR after AB. | launch-cut §3 item 4 |
| `pending_body` contact line | **RULED 09-22, verbatim:** `Halaman ini otomatis diperbarui setelah pembayaran diterima. Jika sudah membayar tetapi belum berubah dalam 5 menit, kirim tautan halaman ini ke hello@katon.app.` Swept: 0 blocklist hits, control fired 3. | this doc (ruling); `lib/site/copy.js` once applied |
| Front door (Prompt AA) | DRAFT, NOT RELEASED. Waits for AB round 1 review. Reyner owes: sub-line (keep/new), `home_compat_link` text, "Gratis" placement. | `docs/prompts/AA-front-door.md` |
| Paid product (Prompt AB) | RELEASED. §3 defects DONE in PR #126 (`24718d1` + `6e0b099`, 78/78). §4 layout IN PROGRESS. | `docs/prompts/AB-paid-passable.md`; `docs/handoff/p2-markup-2026-09-22.md` (all rows ok) |
| AB rulings 09-22 | Cover eyebrows `Edisi Lengkap` / `Bacaan Kompatibilitas`; element labels `Tanpa [Elemen]` / `Dominan [Elemen]`; A3 Indonesian archetype as title; A2 birthSummary format; `p2_reframe` OPTION B (facts table under seat rows, hard seat only, out of legend, no new string); C2 frame sentence once as group lead line. | p2-markup + PR #126 commits |
| Accounts | Supabase FREE tier (pauses after 7 idle days); Gemini PREPAID (zero balance = 100% floor). Reyner: set low-balance alert; top up before launch week. | Reyner's dashboards |
| Hosting | Vercel Hobby until first promotion BEYOND own network; then Render (Prompt U). Commercial-use risk RECORDED. | PROGRESS INTERIM REGISTER "NON-COMMERCIAL PLAN" (line ~268) |
| Working model | one Cowork + one Code + Reyner. Cowork writes prompts INTO THE REPO TREE (`device_commit_files`) AND the project; Code commits alone. | COWORK-BRIEF §3/§4 |

## 1. Done 2026-09-22
- #125 `?dari` merged `762058d` (09-21 late). `69cea31` LIVE STATE corrections (compat PDF reachable; previews CAN render - `GEMINI_API_KEY` on Preview since 09-18).
- Code answered launch-cut §5 crosscheck (all 9): cache chart-keyed (`canonicalize` + sha256 with engine_version); NO automatic check-status reconcile (manual `doku:status` only) -> item 4; Gemini failure after payment lands on `floor` with ruled prose; 8 funnel events incl. `purchase_confirmed`; `error_body` has hello@katon.app, `pending_body` did not -> ruled sentence; Hobby risk recorded.
- Cowork read both paid PDFs page by page -> `p2-markup-2026-09-22.md`; Reyner marked ALL ok.
- **PR #126 `feat/ab-paid-passable`** (CI green, MERGEABLE): six red-first assertions `tests/pdf-passable.spec.mjs` (A4 penutup inherits body; A5/A9 orphans/widows 3; A6 Tanpa/Dominan from `fact.provenance.element`; A7 empty rows+groups dropped; C1 title first; C2 frame sentence once; reframe Option B). Four superseded suites rewritten with supersession recorded; byte fixture re-pinned after page-by-page diff (page 7 `Pilar Konsepsi Pilar Konsepsi` was the A7 bug preserved). **MERGE STATUS: Reyner was asked to merge - CONFIRM ON MAIN (`git log` via Code) before assuming.**
- **PR 2 `feat/ab-paid-layout` @ `3859cc9`**: Spectral 400/600 fetched (`scripts/build-spectral-ttf.mjs`, sibling of the Han fetcher), registered as two faces, traced (`outputFileTracingIncludes`), guard test walks `SERIF_TTF_RELATIVE` (shown red by deleting an entry). `FAMILY_SERIF` exported from `lib/pdf/fonts.js`, imported in `document.js`. **Layout NOT started.**

## 2. Live env (Vercel)
Preview: `PAYMENTS_PROVIDER=mock`, DOKU sandbox vars present (inert), `DOKU_CAPTURE=1`, `GEMINI_API_KEY`. Production: no `PAYMENTS_PROVIDER` (Reyner removed the mistaken row - CONFIRM), no DOKU vars. Preview alias for #126 walk: `katon-git-docs-launch-cut-renge13s-projects.vercel.app` (report `/kompatibilitas/PZ0t_B3YDnzdXc2LWV38D`).

## 3. NEXT (in order; re-read sources first)
1. **Reyner:** confirm #126 merged; after the production deploy, download the PDF of his own paid pair on katon.app (proves tracing in the lambda, no empty Pilar Konsepsi row). Chase DOKU (phone if silent). Chase Xendit closure before 1 Oct. Gemini low-balance alert. Front-door copy cells (AA §4) when convenient.
2. **Code (fresh session OK):** PR 2 layout on `feat/ab-paid-layout` from `3859cc9`: A1 cover, A8 appendix table, A10 element bars, A11/C5 merged chart pages, A12 measure ~70ch + `FAMILY_SERIF` headings, B2 running footer, C3 facts rows, C4 verdict row - per AB §4. **Last commit = proof: fetch BOTH PDF routes on the preview deploy** (local green says nothing about tracing). Send Reyner both rebuilt PDFs + 390-wide report screenshot. Also: the two screen defects (paragraph gap; eyebrow-without-heading rule) in `ProseBlocks.jsx` are AB §3 rows NOT yet confirmed done - check PR #126 diff; if absent, they ride in PR 2.
3. **Reyner:** phone read of PR 2 artifacts -> marks -> Code round 2 -> STOP (two-round cap). PDFs done for launch.
4. **Code:** item 4 (check-status reconcile + ruled `pending_body` sentence) as its own small PR. Red-first: a paid-but-unnotified fixture row settles on load.
5. **Reyner + Cowork:** release AA once copy cells are in; Code builds AA (one small PR).
6. DOKU flip when the four-item gate is met -> Rp 39.000 walk -> SALES REOPENED row. Then distribution.

## 4. Cowork errors today (Code owns COWORK-BRIEF rows; listed so none is lost)
Launch cut written only into the project (third project-only instance) -> fixed by committing to `docs/handoff/`. Named prompt letter E "free" from a directory listing; E reserved at `F-payments-pricing.md:4` -> renamed AA/AB. p2-markup C2 cause mis-diagnosed from architecture (frame rows are by Reyner's 09-14 ruling, not a lost key). AB §2 generalised one nameless cell's behaviour to two (`p2_reframe` had zero table rows; old test caught it). Proposed an "abuse rate limit" that already existed (`lib/ratelimit.js`) - corrected same turn.

## 5. Parked (unchanged from 09-21 + launch cut)
Design pass beyond front door + paid product; Z2 all items; forge-tests cherry-pick `349939e`; pending-poll copy; Prompt U (trigger unchanged); H1-H5; inbound Request-Timestamp window; Xendit-history line on /privasi (no).
