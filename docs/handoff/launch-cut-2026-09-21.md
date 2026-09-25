# Katon — THE LAUNCH CUT (Cowork draft, 2026-09-21 night, amended twice same night). STATUS: DRAFT FOR REYNER'S RULING.

**Code: commit this file yourself, alone, as `docs/handoff/launch-cut-2026-09-21.md`.** It was first written
only into the Claude project, which Code cannot read - the recorded failure (COWORK-BRIEF §4), third
instance. Companion prompt: `docs/prompts/AA-front-door.md` (drafted as "E"; E is reserved at
`F-payments-pricing.md:4`, so renamed).

Once Reyner says yes, this replaces §3 of the project state doc `KATON-state-2026-09-21.md` as the plan in
force, and `AA-front-door.md` plus the paid-product prompt below are the only build prompts before launch.
Until then nothing here is a ruling.

Checks applied (katon skill §0): CHECK 1 - every repo claim below was read from the device tree on `main`
(`.git/HEAD` = `ref: refs/heads/main`), LIVE STATE quoted from `docs/PROGRESS.md`; CHECK 3 - no new gate is
proposed, one proposed gate (the free-reading token cap) is REMOVED because its cause is already handled;
CHECK 4 - every item states what it buys a customer.

## 0. Reyner's rulings this turn (chat, 2026-09-21)
- Launch is FREE + PAID TOGETHER. "Distribution without sales to follow is useless." So the launch date is
  DOKU's date; nothing Code builds can move it.
- Front door: "simple and clean like the Google homepage"; details live on other pages.
- The PDFs cannot be cut: "it's the product that people pay for. Need at least passable design and layout
  there." Then: "Fix all the paid product defects." - so the on-screen compat report's known layout
  defects (paragraph gap; PETA DINAMIKA eyebrow with no heading) ride in the same pass. Ruled, not open.
- Everything else parks behind launch. Distribution is the next thinking job.

## 0b. Reyner's rulings, 2026-09-23 (chat), VERBATIM

Recorded here because the repo is the source (REPO-IS-SOURCE, below). Item 4 and its ruled sentence
had existed only in the Claude project and on a branch copy of a Cowork state doc until Code found them
there on 2026-09-23.

- **`PAY-SAFETY-ALL-PURCHASES`**: Payment-without-notification safety applies to every paid purchase.
  Both Rp 19.000 mirror purchases and pair purchases must have an on-load DOKU reconciliation path, so
  a customer's payment can still settle when the provider's confirmation was not received. Mirror
  reconcile is a production-flip gate.
- **`PENDING-BODY-REPLACE`**: `pending_body` is replaced by the ruled sentence (as already in #129,
  plain `hello@katon.app`). "Tidak perlu memuat ulang." is not retained. The auto-update sentence
  covers it, and the five-minute instruction is the recovery path.
- **`REPO-IS-SOURCE`**: launch-cut item 4 and PAY-SAFETY-ALL-PURCHASES must exist in main's
  handoff/ops docs, not only in the Claude project or on branch copies.
- **`RECLOSE-DEFERRED`**: a payment started just before the fence closes is not reconciled while the
  fence stays closed. This doesn't affect launch. It goes in the DEFERRED REGISTER until payments can be
  safely reconciled while closed.

Merge authority, same day: Code merges #129, #130 and the mirror-reconcile PR once CI is green and the
proofs are quoted; #128 waits for Reyner's round-1 marks. Recorded in `docs/COWORK-BRIEF.md` section 3.

## 0c. Reyner's rulings, 2026-09-25

- **`GATE-B-AMENDED`**. §3 item 1's gate b was "one DELIVERED notification captured". It is now:
  **"reconcile-on-load proven on a real sandbox Checkout QRIS payment (DONE 2026-09-25, invoice
  eJm6p6PjG8f_0eridE39x.muglimjz, log 13:55:18 WIB `[reconcile] ... status=SUCCESS paid=true
  reason=ok`) AND re-proven on both production purchases (Rp 19.000 mirror + Rp 39.000 compat)."**
  The notification question stays open with DOKU (ticket 1149053) and **no longer blocks launch**.
  **Residual risk, accepted:** a buyer who pays and never returns to her page stays unpaid until she does.
  `auto_redirect` (`lib/doku/client.js#createCheckout`) and the `pending_body` contact line (§0b) mitigate
  it. Evidence: four sandbox payments DOKU recorded as SUCCESS with zero notification attempts. For the
  fourth, Reyner read the Runtime Logs of all deployments: the only `/api/doku/notify` requests were
  Code's own probes (`docs/ops/doku-walk.md` § WALK 4).
- **`VOICE-V2-PARKED`**. Launch on v1. `feat/voice-v2` stays unmerged and is not deleted; migration 0011 is
  not applied. The DEFERRED REGISTER row in `docs/PROGRESS.md` carries what the branch holds, why, and the
  reopen trigger.

## 1. Why it took this long (Cowork's honest account, for the record)
Three causes, in order of cost. (a) Payments built twice: Xendit integrated (Prompt F/I, live keys 08-07),
Xendit repriced, adapter torn out (#122) and DOKU built (#124); DOKU is now blocked on the ACCOUNT (QRIS
channel inactive; HTTP notification never delivered), not on code. (b) v2 scope before v1 launched: compat
product, two PDFs, appendix, sharecard rebuild, gate to 1.25.0, prose harness. (c) Cowork's working model
applied register-grade ceremony (worksheets, rulings files, amendments) to visible-but-cheap choices, making
Reyner the approval bottleneck on things rule 9 already let Cowork or him settle in a sentence. (c) is
Cowork's error and is what this cut corrects.

## 2. What is TRUE today (LIVE STATE, `docs/PROGRESS.md`, read on main)
Free mirror reading live and whole; Card A free; Complete Edition 19k and Compat 39k behind `row.paid`,
flipped only in a verified provider notification; `PAYMENTS_PROVIDER` unset in production = CLOSED;
DOKU adapter merged, production untouched; rate limiting is BUILT and fails closed (`lib/ratelimit.js`:
`mirror_create` 10/session/h, 60/IP/h; `pair_create` same; serve buckets 120/300); render cache keyed on
`sha256(canonical semantic JSON)` (`lib/render/cache.js:9`), i.e. on the CHART, not the raw input string.
PDF state: Y-4 (#121) shipped R6-R8 (cross-references gone, compact two-column Kamus Ringkas, cells whole);
#123 fixed the font-in-lambda 500. `grep -n "PENDING(" lib/site/copy.js` on main shows NO live `PENDING()`
call, so the compat PDF's five copy slots are ruled and the LIVE STATE row still saying "NOT YET REACHABLE
IN PRODUCTION - four of its five copy slots are unruled" is STALE (Code corrects it). The typography/layout
pass was explicitly excluded from Y-4 and is the one PDF item still open.

## 3. THE CUT

### Ships with launch (gated on DOKU only)
1. **DOKU production flip** - the four-item gate (project state doc §0; `docs/ops/doku-walk.md`), unchanged,
   nothing added: a) QRIS active on Checkout for production; b) ~~one DELIVERED notification captured~~
   **AMENDED 2026-09-25 (§0c): reconcile-on-load proven on a real sandbox Checkout QRIS payment (DONE) AND
   re-proven on both production purchases**; c) production keys + `PAYMENTS_PROVIDER=doku`, no `DOKU_SANDBOX`; d) notify URL on the QRIS channel in
   the PRODUCTION Back Office. Reyner's Rp 39.000 walk is acceptance. Critical path = DOKU ticket 1149053;
   escalate by phone/sales contact if silent two more working days.
2. **Front door simplification** - Prompt AA (one small PR). Headline, one sentence, the birth form, ONE
   button, compat as a single text link under the button. The two-card row (`Funnel.jsx` 468-496) goes.
   Copy: Reyner writes the sub-line and the compat link text; everything else is unchanged ruled copy.
   Adaptive layout PARKED (a centred narrow column IS the Google-homepage shape; header width is a
   one-line question inside AA).
3. **PAID-PRODUCT FIX-UP ("P2" - a label only; the second PDF prompt after Prompt M).** Covers everything
   a BUYER receives: the Complete Edition PDF, the compat PDF, and the on-screen compat report. What a
   customer gets: the thing she paid Rp 19.000 or 39.000 for looks finished on her phone.
   Scope is LAYOUT AND TYPE - type scale and leading, margins and measure, cover, chart-page composition,
   facts table density, appendix table rhythm, paragraph spacing, page breaks (no orphan headings), running
   footer; on screen, the paragraph gap and the eyebrow-without-heading rule (one component rule, not
   per-instance). NOT in scope: prose, structure, new sections, new copy strings (any new visible string is
   a `PENDING()` sentinel and blocks the production build until ruled).
   Method (CHECK 2): Code builds both PDFs from a MODEL-RENDERED fixture (Reyner judged a FLOOR PDF on
   09-14 and part of his verdict was the floor wearing the reading's clothes - say which it is before he
   reads) and puts the matching report on the preview; Reyner reads on his phone and marks up in ONE pass
   (page + what is not passable); Cowork turns the markup into the P2 prompt; two rounds, then ship.
   Acceptance = Reyner's "passable", not a metric. Page count is a consequence, never a target (Y-4 rule).
4. **PAY-WITHOUT-NOTIFICATION SAFETY + the `pending_body` contact line** (ruled 2026-09-22; widened to
   every purchase by PAY-SAFETY-ALL-PURCHASES, 2026-09-23). DOKU's HTTP Notification has never been
   delivered to Katon (ticket 1149053), so a buyer can pay and her row stay unpaid.
   (a) A report page that loads on an UNPAID purchase with a DOKU invoice makes ONE DOKU check-status
   call and settles on SUCCESS for its own invoice at the right amount - pairs through `settlePair`
   (**#129, merged `91a21e8`**), the Rp 19.000 mirror purchase through `settleReading` (the
   mirror-reconcile PR). Never from a poll; no DOKU call when the fence is closed or mocked.
   (b) `pending_body` is REPLACED by Reyner's ruled sentence, verbatim:
   `Halaman ini otomatis diperbarui setelah pembayaran diterima. Jika sudah membayar tetapi belum berubah dalam 5 menit, kirim tautan halaman ini ke hello@katon.app.`
   (#129, `769337a`; amendment j in `docs/content/pasangan-copy-rulings.md`).
   Source of the 09-22 ruling: the Cowork state doc of 2026-09-22 §0 (branch copy
   `docs/handoff/cowork-state-2026-09-22.md` on `feat/ab-paid-layout`); this entry is now its home
   on main.

### REMOVED from the plan (not parked - dropped)
- Free-reading token cap ("3 then wait or pay"). Cause already handled: `mirror_create` is limited to 10 per
  session per hour and 60 per IP per hour, failing closed; the cache is chart-keyed so popular charts cost
  nothing on repeat. A cap would tax the reader-for-others behaviour that spreads Katon and never touch the
  buyer. Revisit only with traffic data.
- `scripts/capture-flow.mjs` (design-pass inputs). It fed a design pass that no longer precedes launch.

### PARKED behind launch (DEFERRED REGISTER rows where not already there; Code writes them)
Design pass beyond the front door and the paid product (report adaptive two-column, /harga adaptive) · Z2
all items incl. item 1 (renderer worked-example anchoring; ship, read the first ten real paid reports, then
decide) · forge-tests rebase (Code cherry-picks `349939e` when convenient) · pending-poll dead-end copy ·
`?dari` step-2 question (built as step-1-visible; stays) · Prompt U Render move (trigger unchanged: first
promotion BEYOND own network) · journey hypotheses H1-H5 (instrument first, post-launch).

## 4. CEO / product-owner view (Cowork's assessment; §5 asks Code to falsify it)
**Moat.** Not the calculation (public arithmetic). Defensible: (i) the Indonesian voice - ruled glossary,
Reyner's register, Stage 6 refusing generic prose, engine-owned headings; (ii) trust mechanics a reader can
feel - deterministic half on screen in 4.3s, no teaser, no gate, one link as memory; (iii) later, the corpus
(`render_cache` + flags). Weakness: CONTENT + BRAND compounds only with distribution.
**Robustness.** Strong where money moves: paid flips only on a verified notification, amount checked as a
number, settle idempotent, fence fails closed, unset provider = closed, rate limiter fails closed, production
copy gate on the real build command, CI runs forge. Weak spots (none a gate): (a) buyer whose notification
never arrives - automatic reconcile or manual `doku:status` only? (b) buyer who loses the link - email
collected, no sender (ruling C); (c) Gemini failure after payment - confirm the paid reader sees the ruled
floor, not an error; (d) Vercel Hobby forbids commercial use; first sales happen on Hobby by the ruled
Render trigger. Recorded, not re-argued.
**Guardrails.** In place: rules 18, 19, production copy gate, `DOKU_SANDBOX`/`mock` refused in production,
no enumerable URLs, `private, no-store` on paid PDFs. Missing and cheap: visible support contact on
pending/error states; funnel events confirmed recorded.

## 5. CROSSCHECK - Code answers by grep + output, one line each, no build
1. Confirm `lib/semantic/index.js#cacheKey` normalises before hashing (so `1989-09-13 09:00` and the same
   chart typed differently hit one row). Quote the canonicalisation lines.
2. Buyer with a delivered payment but NO notification: does any path call check-status automatically
   (report load, poll, cron), or is `scripts/doku-status.mjs` the only reconcile? If manual, what does the
   reader see after the 60-try poll ends, verbatim?
3. Paid reader when Gemini fails: which of the seven states does she land in, and is the prose the ruled
   floor or an error string? Quote `reportView.js#viewFor` for that branch.
4. Which funnel events are actually persisted today (table + event names)? Is `pay_opened`/`paid` among them?
5. Does any pending/error state show a support contact? Grep the copy bank for an email address.
6. Supabase and Gemini quotas at, say, 500 readings/day: which tier are we on, what breaks first?
7. Hobby-plan commercial-use clause: one line confirming the risk is recorded in PROGRESS (INTERIM REGISTER
   "NON-COMMERCIAL PLAN") so it is a known decision, not a surprise.
8. Anything in the deferred register that a CEO would call a launch blocker that Cowork has not listed
   here. Name it or say none.
9. Paid product: confirm no live `PENDING()` call remains in `lib/site/copy.js` (quote the grep) and correct
   the LIVE STATE compat-PDF row. Then build BOTH PDFs from a MODEL-RENDERED reading (not the floor - say
   which fixture and that it is a render) into `reports/pdf-passable/`, and name the preview URL of the
   matching on-screen compat report, so Reyner can mark all three up. No other change.

## 6. Split
**Reyner:** rule this cut (yes / edits); write the front-door sub-line and compat link text; when the two
PDFs and the report link arrive, one markup pass on the phone; chase DOKU (both asks, then phone); chase
Xendit closure confirmation before 1 Oct; remove Production `PAYMENTS_PROVIDER` row, set Preview to `mock`,
redeploy the preview for the walk.
**Code:** commit this file and `AA-front-door.md`; answer §5 (§5.9 includes the two rendered PDFs + report
link); on Reyner's yes, build AA; write the deferred rows; cherry-pick the forge branch when convenient;
P2 when Cowork hands it over. Do NOT start AA before Reyner's yes.
**Cowork:** on yes, mark this the plan in force; turn Reyner's markup into the P2 prompt (two rounds, type
and layout only); next session opens with distribution, not a build.
