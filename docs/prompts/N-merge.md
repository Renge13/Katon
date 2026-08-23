<!--
STATUS: MERGE PROMPT. Written by Cowork 2026-08-23 after Reyner cleared precondition 3b.
DO NOT RUN THE MERGE UNTIL SECTION 0 IS FILLED IN. It has a blank in it on purpose.

This prompt lands the promotion. It is the launch. Read section 0 before anything else.
-->

# Prompt N - land the promotion

## 0. THE ONE PRECONDITION STILL OPEN, AND THIS PROMPT DOES NOT ANSWER IT

Per the branch's own header, `app/api/mirror/[token]/route.js` lines 161-170:

```
// 3 OF 4 WHOLE. Preconditions 1, 2 and 4 are met - 2 closed in THIS commit, both its clauses.
// PRECONDITION 3 IS NOT MET, and neither clause of it is:
//   3a  threshold UN-MET. ... returns the pooled floor to roughly 20%. Whether the threshold
//       MOVES is his open question and must not be answered by widening it.
//   3b  NOT MET. 2 of 4 sell.
```

**3b cleared 2026-08-23.** Reyner re-judged fresh-1996 on the unflagged run 2 (SHIPS) and judged
chart 5 on a live render for the first time (PROSE PASS). Both verdicts are recorded in commit A.

**3a was the only precondition standing. RULED BY REYNER, 2026-08-23, verbatim:**

> **Rule 3a Clearance:** The 10% floor rate threshold is officially removed as a launch blocker.
> The deterministic fallback floor (module assembly) renders ruled, production-grade glossary
> prose, is never cached, and self-heals on a simple reload. A 20% floor rate represents a safe,
> graceful degradation rather than a broken customer state. Precondition 3a is cleared for
> promotion.

**READ WHAT THIS RULING IS AND IS NOT, because the difference is the whole record.** The
threshold was **removed as a gate**, not widened to fit the measurement. Nobody edited 10% to
20%. The floor rate remains a real quality metric and a real availability metric - with one
provider, a Gemini outage is a 100% floor - and it keeps being measured. What changed is that it
no longer decides ship or no-ship. A later session that finds a 20% floor here has found the
ruled state, not a regression; a later session that finds the number 10% edited to 20% anywhere
has found the thing this paragraph exists to prevent.

**ALL FOUR PRECONDITIONS ARE NOW MET. The merge is authorised.**

---

## COMMIT A - record 3b, and record what it was cleared ON (docs only, safe to land now)

Three places carry the precondition table and they drift when only one is edited. Change all
three in this one commit:

1. `app/api/mirror/[token]/route.js` - the precondition-3 block.
2. `docs/PROGRESS.md` - the clause table under `RULED 2026-08-22`.
3. `docs/NEXT.md` - the `AMENDED 2026-08-23` paragraph.

Record it as: **3b MET 2026-08-23.** fresh-1996 SHIPS, chart 5 PROSE PASS.

**AND RECORD THE CAVEAT IN THE SAME BREATH, because leaving it out is how a row goes stale
in the direction nobody checks.** The artifact those verdicts were formed on states its own
configuration:

```
$ sed -n '9,11p' docs/qa/2026-08-22-owed-samples.md
Source: ... regeneration budget `3` at the time of the run · n=10
**THE BUDGET HAS SINCE CHANGED.** These runs were produced at `REGENERATION_BUDGET 3`.
Reyner reverted it to 2 ... so this prose is what depth 3 produced.
```

So **3b is cleared on depth-3 prose while the shipping configuration is depth 2**
(`lib/render/config.js:163`). Cowork's read, and it is why this is a caveat rather than a
re-open: Reyner's own depth-pair ruling was that *depth 3 is thinner, not tighter* - it dropped
Aspek Perajin and Aspek Pelindung from chart 5 - so a buyer at depth 2 gets a **fuller** reading
than the one he passed. The clearance is conservative, not optimistic. But the row must say
which bytes it was formed on, so a later session cannot read "3b MET" as "met on what ships."

No behaviour change. No `STAGE6_VERSION` bump.

---

## COMMIT B - the flagged copy clauses. RULED 2026-08-23 (content, user-facing)

Both were marked `FLAGGED FOR REYNER` in `lib/site/copy.js`. Precondition 2 was met regardless -
these are register, not a gate. Reyner has now ruled both.

### B1 - `/syarat`, `syarat.paid[2]`: SHIP AS WRITTEN

His words: *"The language on download links and accountless access is clear, accurate, and
aligns with refund policies."* No edit. Delete the `FLAGGED FOR REYNER` comment above it and
replace it with `REYNER-APPROVED 2026-08-23`, so the next grep for flagged copy returns nothing
stale.

### B2 - `/tentang`, last entry of `tentang.paragraphs`: REVISED

**The Compatibility sentence is struck entirely.** His reason, and it becomes the rule rather
than a one-off edit: *never promise unbuilt features on a merchant compliance page where
checkout returns a 400.* `compat` is priced at 45.000/29.000 in `lib/pricing.js:32` and absent
from `SELLABLE_SKUS` (`lib/pricing.js:59`, `['artifact']`), so its checkout 400s.

Approved text, byte-identical, swept CLEAN against 65 blocklist patterns and rule 20 on
2026-08-23 (self-test fired 5 findings on a deliberately bad input):

```
Cara pakainya sederhana. Isi tanggal lahir, tambahkan jam lahir kalau kamu mengingatnya. Bacaanmu muncul gratis dan lengkap. Complete Edition berbayar, kartu resolusi tinggi dan PDF dari bacaanmu, bisa kamu ambil atau lewati.
```

Mark it `REYNER-APPROVED 2026-08-23` and keep Code's existing note about how the paid clause was
composed - it is the provenance of the surviving half.

### B3 - THE SAME CLAIM SURVIVES ON A SURFACE REYNER DID NOT SEE. His ruling to make.

His B2 reason is a rule about merchant-compliance surfaces, and one more string on `/harga`
falls under it. Found by grep after the ruling, not before it:

```
$ grep -n "Compatibility" lib/site/copy.js
90:        'Bacaan Katon gratis dan lengkap. Complete Edition dan Compatibility Reading adalah tambahan opsional.',
```

That is `harga.meta.description` - the browser-tab description and the search-result snippet,
which the file's own docblock calls *"the one user-facing string a reviewer can reach without
loading the page."* It calls Compatibility an **optional add-on**, which reads as purchasable -
a stronger claim than the *"sedang disiapkan"* he just struck. It was deliberately restored in
the promotion commit (`copy.js:86`), so it is not an oversight; it predates the rule.

**The `/harga` compat ROW is a different case and Cowork's recommendation is to leave it.**
`app/harga/page.js:144` renders it with the `segera` badge and no buy action, gated on
`isSellable()` rather than on copy - a catalogue entry whose unavailability is visible on the
page. That is honest, and it is what a merchant reviewer should see.

**RULED 2026-08-23. Strike Compatibility Reading from line 90.** Approved text, byte-identical,
swept CLEAN on 2026-08-23 (self-test fired 5 findings on a deliberately bad input):

```
Bacaan Katon gratis dan lengkap. Complete Edition adalah tambahan opsional.
```

**USE THOSE BYTES, NOT THE LABEL.** Reyner wrote *"Change to Option A"* and then quoted a string
that is NOT Cowork's option A - his is 75 chars and drops the contents clause; option A was
`'... Complete Edition berbayar berisi kartu resolusi tinggi dan PDF dari bacaanmu.'` at 110.
The quoted string is his register and it wins; the label is a slip. Recorded rather than
silently reconciled, because a label that does not match its bytes is the tranche-1 corruption
class and it has cost this project a real mistake before.

Mark it `REYNER-APPROVED 2026-08-23` and update Code's note at `copy.js:86` - the one explaining
why `Compatibility Reading` was restored - to record that the restore is now reversed and why.
The `/harga` compat ROW stays exactly as it is, on his ruling: `segera` badge, no buy action,
gated on `isSellable()`, unavailability visible on the page.

**Verify after applying, and paste the output into the PR body:**

```
$ grep -n "Compatibility" lib/site/copy.js
```

Expect: comment lines only. Any surviving user-facing string naming Compatibility is a miss.

---

## 1. MERGE ORDER

`#71` is the base of `#72`. Merge `#71` first, confirm `#72` retargets cleanly to `main`, then
merge `#72`. Do not rebase `#72` onto `main` by hand if the retarget is clean - both branches
touch `PROGRESS.md` and that file is the one that must not drift.

**BEFORE EITHER MERGE, three checks, and paste each one's output into the PR body:**

1. **Migrations.** Repo convention: applied manually in the Supabase SQL editor, always BEFORE
   deploying code that depends on them. `ls supabase/migrations/` and confirm every migration
   the promotion depends on is already applied per `PROGRESS.md`. If any is not, **stop and tell
   Reyner** - he runs it, you do not.
2. **Suite green on the merge result, not on the branch tip.** `npm test`. A green branch and a
   green merge are different facts.
3. **`git status` before the merge commit message is written**, per the repo convention that a
   commit message describes everything staged.

---

## 2. AFTER THE MERGE - what is Reyner's, not yours

Hand him this list; do not attempt any of it.

- **UNSET `MIRROR_PREVIEW_TOKEN` in Vercel.** `CLAUDE.md` SUPERSEDED names this explicitly:
  `lib/mirror/fence.js` is deleted, the variable is inert, and a stale secret left in a deploy is
  exactly how a test flag became architecture once already.
- **Confirm the Xendit keys in Vercel are LIVE, not test.** Precondition 1 is recorded MET; a
  recorded fact about a dashboard is still worth re-reading on the day money can move.
- **The Gemini balance alert still does not exist.** It is in the interim register with him as
  owner and an end condition requiring the alert to have fired once. With one provider, an
  exhausted balance is a 100% floor rate, and after this merge that reaches real customers rather
  than a preview.

## 3. AFTER THE MERGE - the smoke test, and it is not a QA run

On production, in this order. Report what you see, do not fix anything you find without asking:

1. Create a reading from the funnel front door. Confirm the **full mirror serves free, ungated** -
   no teaser, no `LockedLines`, no blurred placeholder.
2. Confirm Card A downloads as a PNG.
3. Confirm the Complete Edition is offered **after** the reading, never in front of it.
4. Confirm `/harga` `/tentang` `/privasi` `/syarat` `/pengembalian` and the footer all render.
5. Do **not** buy anything to test the paid path. Reyner's own transaction is not demand and it
   is not evidence; if the paid path needs a live check, that is his call and his card.

## 4. AND UPDATE `docs/NEXT.md`

Cowork's obligation, discharged here rather than left: after the merge, `NEXT.md` points at
`docs/prompts/M-tranche3.md` and records that the promotion landed, which preconditions were met
and on what date, and that **3a was ruled OUT OF THE GATE rather than measured or widened into
compliance** - with Reyner's own words from section 0, quoted verbatim.

**AND ADD ONE LINE TO `docs/PROGRESS.md` MEASUREMENTS**, as a dated observation and not a locked
constant: the pooled floor rate is ~20% at `REGENERATION_BUDGET 2`, it is no longer a release
gate as of 2026-08-23, and it is still measured. A number that stops being a gate and also stops
being recorded is how a regression becomes invisible.
