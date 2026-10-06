# Prompt BG: the journey pass (Reyner ruled 2026-10-06)
Goes in the working tree as `docs/prompts/BG-journey-pass.md`. Untracked until you commit it: commit it as the first commit of PR 1.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md` first, then `docs/prompts/BF-return-to-reading.md` and its two amendments (#200 must be merged before you start; confirm on GitHub). Read `.git/HEAD`. Branch off `main`.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No engine, writer-prompt or Stage 6 change (STAGE6 stays 1.73.0; assert both prompt versions unchanged). Red first wherever behaviour changes. Never set `PAYMENTS_PROVIDER=mock` on any Preview (shared database); mock is local only. **Do not merge either PR.**

## Goal and limits (Reyner, verbatim in substance)
Make Katon contemporary, clean and easy to use without sacrificing function or journey. Priorities for this pass: 1. navigation, 2. revenue journey, 3. mobile/form friction, 4. measurement. Visual polish is secondary. Sequence: fix the journey, launch mirror + compat, read the data, then optimise and distribute.
**This is not a broad redesign.** Remove obvious friction, repair navigation, make the missing-hour state coherent, instrument the funnel, improve payment choice. Do not touch the reading voice, reading structure, offer model, offer copy or share-card order unless a ruling below requires it. No speculative improvements.

## Two PRs, measurement first
- **PR 1 `feat/funnel-measurement`:** §2 (instrumentation) and §1 (payment methods). Ship it first so a baseline exists before the forms change.
- **PR 2 `feat/journey-forms`:** §3 to §6. Branch off `main` after PR 1 is merged, or off PR 1 if Reyner has not merged it yet (say which).

## §0. Before coding: the implementation map
Inspect and report, briefly, with file and line: relevant routes and components; the birth-date form (`components/BirthFields.jsx`, `components/Funnel.jsx`, `components/PasanganSteps.jsx`); pillar rendering on the reading (`lib/mirror/view.js` and the component that draws the Bagan); header navigation; DOKU configuration (`lib/doku/client.js:47` `PAYMENT_METHOD_TYPES`); event infrastructure (`lib/analytics/events.js`). Then list which files change and why. **Do not wait for approval after the map; proceed.**

## §1. Payment methods (PR 1)
Facts Cowork gathered 2026-10-06 (verify, do not trust):
- **Active on the merchant account** (Reyner's DOKU dashboard screenshots, "Layanan"): QRIS, DOKU e-Wallet, Akulaku, Alfa Group, Indomaret, Virtual Account (Multiple Banks) and VA for BJB, BNC, BNI, BRI, BSI, BSS, BTN, CIMB, DOKU, Danamon, Maybank, Permata, Sinarmas. **Not active:** OVO, DANA, ShopeePay, LinkAja, BCA VA, Mandiri VA, cards.
- **Enum strings** (developers.doku.com, DOKU Checkout "Supported payment methods"): `QRIS`, `EMONEY_DANA`, `EMONEY_SHOPEE_PAY`, `EMONEY_OVO`, `EMONEY_DOKU`, `EMONEY_LINKAJA`, `VIRTUAL_ACCOUNT_*`, `ONLINE_TO_OFFLINE_ALFA`, `ONLINE_TO_OFFLINE_INDOMARET`, `PEER_TO_PEER_AKULAKU`.
- **Public fees** (doku.com/pricing, excluding VAT): QRIS 0.7%, 0% for IDR 0-100,000; DOKU e-Wallet and DANA 1.5%; OVO 2-3.18%; ShopeePay 2-4%; VA IDR 4,000; Alfa IDR 5,000; Indomaret IDR 6,500; Akulaku 1.5% + IDR 2,000.

**Reyner's approved list for this pass:** keep `QRIS`; add `EMONEY_DANA`, `EMONEY_SHOPEE_PAY`, `EMONEY_OVO` **only once each is active on the account** (Reyner is applying via "Tambah Layanan"). VA, convenience stores, Akulaku and DOKU e-Wallet are NOT added (fee or reach; Reyner may rule otherwise later).
1. Confirm which approved methods the account actually accepts, with the existing probe pattern (`npm run probe:doku`, PROGRESS 2026-09-21), extended to take a method list. Report the exact response per method. Creating an unpaid, expiring checkout is acceptable; paying is not.
2. Add to `PAYMENT_METHOD_TYPES` only the approved methods the probe shows active, QRIS first. If none is active yet, change nothing in the list and say so; the change is then one line in a follow-up.
3. Red first: a test pinning the list against the approved set (read the approved set from one module, never retype it in the test, CLAUDE.md lesson on second copies). Existing QRIS behaviour, notify and reconcile tests stay green.
4. Report any DOKU activation, fee or account prerequisite you find. Do not claim a method works on a phone unless you saw its DOKU page offer it.

## §2. Instrument the funnel (PR 1)
Target funnel: `reading_created -> reading_viewed -> offer_seen -> checkout_started -> purchase_confirmed`. **No other new events.**
1. `reading_viewed`: do NOT add an event if `mirror_served` already means "this reading was shown". Confirm its semantics from the code and say which existing event serves as `reading_viewed` (distinct readings with at least one).
2. `hour_known` (boolean) on the `reading_created` detail: whether the reading was created with a birth hour. Respect `lib/analytics/events.js` detail rules (no dates, no birth data).
3. `offer_seen`: server-recorded, **once per reading**. The client reports when the Complete Edition offer panel first enters the viewport (reuse the IntersectionObserver the sticky pay bar uses); the server records it idempotently per reading, so reloads, repeat scrolls and a second device do not add rows. Never fires on a paid reading, never when payments are closed.
4. Page views: Vercel Web Analytics (`@vercel/analytics`, cookieless). Reyner enables Web Analytics in the Vercel project; report the Hobby plan's quota as Vercel's dashboard or docs state it. If `/privasi` must mention it, draft one sentence and **stop for Reyner's wording before PR 1 merges**; no other copy changes.
5. A query Reyner can run in the Supabase SQL editor (`docs/ops/funnel.sql`): counts per step for a date range, excluding the test rows listed in `docs/PROGRESS.md`, plus the same funnel split by `hour_known`.
6. **Verify firing, not definitions:** locally (mock payments), walk one reading from creation to `purchase_confirmed` and show the rows: `reading_created` with `hour_known`, the viewed event, exactly one `offer_seen` after reload and re-scroll, `checkout_started`, `purchase_confirmed`. Show `offer_seen` failing first.

## §3. Birth date: three fields (PR 2)
1. Replace the native date picker with **Tanggal / Bulan / Tahun** in the shared `BirthFields`, used by the front door and the compat form (one component, no duplicated logic). Day: select 1-31. Month: select with Indonesian month names. Year: typed 4-digit field (`inputmode="numeric"`), the fastest for a known year such as 1989. Use `autocomplete` `bday-day` / `bday-month` / `bday-year`.
2. The stored value stays `YYYY-MM-DD`; everything downstream is unchanged. Keep every current rule (`EARLIEST_BIRTH_DATE`, no future date) and block impossible dates (31 Februari, 29 Februari outside leap years). Reuse existing error strings; if a new one is unavoidable, propose it and stop for Reyner's wording.
3. The BF H3 arrival still prefills the date (now into three fields) and gender, and still marks the hour field.
4. Red first: valid date round-trips; impossible and out-of-range dates blocked; both forms use the same component; H3 prefill works.

## §4. Floating labels (PR 2, same pass as §3)
Labels sit inside the field and move to the top-left, smaller, when the field is focused or filled. Applies to every `BirthFields` field and the two compat nickname fields. A real `<label>` always (never placeholder-only); the three date fields sit in a group labelled "Tanggal lahir" for screen readers. The existing hint (H1) stays under the hour field. Keep "· opsional" legible at its floated size. No new colours. 375 px screenshots of empty, focused and filled states; Reyner checks on a real iPhone and Android before merge.

## §5. Missing hour: an empty fourth Pilar Arah slot (PR 2)
Cowork's keyed reading of Reyner's ruling (Reyner may correct before pasting):
- No hour: the row shows four cells; the fourth is an empty Pilar Arah cell (its label "PILAR ARAH" as the other cards carry theirs, no hanzi), visibly a missing piece of the chart, not an error. "Tambahkan jam lahir" (H3, existing string) sits inside it.
- H2 "Jam lahir belum diisi, jadi Pilar Arah belum dihitung." stays one line directly under the row, as the row's note.
- Hour known: unchanged. No modals, no tap-to-open cards. Inti Diri stays on Pilar Diri.
- Red first: four cells with and without an hour; H3 inside the empty cell; H2 under the row; reading text and order otherwise unchanged. 375 px and desktop screenshots.

## §6. Compat navigation (PR 2)
- **Closed:** on `/harga`, mark Bacaan Kompatibilitas with the same closed strings `/kompatibilitas` uses (reuse them, no new copy); nothing on the card looks buyable.
- **Open (`COMPAT_SALES` open):** the header gets "Kompatibilitas" as its second item, linking `/kompatibilitas`. Closed: absent.
- Assert both states. No bottom tab bar, no app-style navigation.

## Deferred, do NOT build
Post-purchase email link; moving the share card; any offer rewrite or reorder; desktop layout; PWA, accounts, reading lists, gestures.

## Validation and report (each PR)
Full suite green, lint clean, local production build, CI and the Vercel deployment of the head commit green. Walk the key flows at 375 px and desktop (headless is acceptable; say so; real-phone checks are Reyner's). Report:
1. What changed.
2. What was intentionally left unchanged.
3. Tests and checks performed, with commands.
4. Any DOKU activation or account dependency still needing Reyner.
5. Anything that stopped an approved ruling from being completed.
**Do not claim something is verified that you could not verify.** Do not merge.
