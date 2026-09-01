<!--
STATUS: LIVE POINTER. Maintained by Claude (Cowork). Reyner does not edit it.

DESIGN NOTE, 2026-08-01: this file went stale twice by duplicating the task list from the prompt it
points at. It is now a POINTER ONLY. It names the prompt and nothing else, so the only thing that can
go stale is which prompt it names. Do not re-add a task summary here.

2026-08-07: it went stale a THIRD way — the pointer itself was not updated when Prompt J was written
(this file still described the 08-02 harness task five days after that work finished). Rule for
Cowork: updating this pointer is PART of writing or queueing a build prompt, not a separate task.

2026-08-19: a FOURTH way, and it is the one the 08-01 rule did not cover. No build prompt was written,
so nothing triggered the 08-07 rule — but the CURRENT WORK moved anyway. This file named tranche 2 as
current for seven days after tranche 2 merged (#38/#39/#40, 2026-08-12), and said "promotion is still
1 of 3" after preconditions 1, 2 and 4 were met. Rule, extended: this pointer is updated when the
CURRENT WORK changes, whether or not a prompt is involved. Content and QA work move it too.

2026-08-19, later the same day: went stale AGAIN, and this one was not a new way — it was the 08-07 rule
being broken. Prompt L was AMENDED (commit 0 added, exclusions extended) and this file was not touched,
so it still said "three ordered commits" and still listed the name_en ruling as NOT in prompt L when it
had become commit 0. Claude Code caught it, not Cowork. The 08-07 rule already covers this: updating this
pointer is PART of writing or queueing a build prompt, and AMENDING a prompt is writing one. No new rule
is needed. What is recorded here is that the rule was insufficient to make Cowork obey it, which is worth
more than another clause.

2026-08-26: refreshed after #74, #75, #76 and #77. Two items under OPEN AND OWNED BY REYNER were
still listed as open and were both closed - MIRROR_PREVIEW_TOKEN (deleted from Vercel that day) and the
Xendit LIVE keys (swapped 08-07, first self-purchase 08-13). Neither had a commit that could close it,
which is exactly why they sat: this file is where an owner-held item goes stale, because nothing in CI
ever reads it. The 08-19 rule already covers it - the pointer is updated when the CURRENT WORK changes -
and what is added here is that OWNER-HELD items need the same sweep, since a closed one still reading as
open sends the next session to do work that is already done.

2026-08-29: STALE A SIXTH TIME, and it is the 08-19 rule broken rather than a new way. CURRENT WORK
still read "2026-08-26 - THE CARD" three days after the card work merged and the work had moved to
`fix/floor-heading-stutter` (`4325051`..`d19ba69`). No prompt was involved, so the 08-07 rule never
fired; the 08-19 rule covers it exactly and was simply not applied. What is new is that this time the
staleness had a PAIR: `PROGRESS.md`'s LIVE STATE opened "THE PROMOTION IS WRITTEN AND NOT LANDED"
while this file's own heading said the promotion landed on 08-23, so the two live pointers
contradicted each other on the same branch and neither one was checked against the other. Rule,
extended once more: **when this pointer is refreshed, read LIVE STATE in the same pass.** They answer
the same question - what is true now - and a session that trusts whichever it opens first is reading
a coin flip.

2026-08-29, later the same day: prompt Q was written and queued, and this pointer was updated IN THE
SAME PASS rather than after it - the 08-07 rule applied on purpose for once, instead of recorded as
broken again. One thing is new and belongs here: **a queued prompt is not necessarily a RELEASED
one.** Q's commit 0 edits `CLAUDE.md` and needs Reyner's word, so the pointer has to carry the
release state and not just the name. A pointer that says only "prompt Q is next" invites a session to
start it. The heading says DO NOT START IT for that reason.

2026-08-29, third entry: prompt Q was RELEASED, and the pointer moved from QUEUED to CURRENT in the
same pass that started it - the 08-07 rule working as intended for once. Two things are new, and both
are about what a pointer must carry BEYOND a name. First, RELEASE STATE: "queued" and "released" are
different, and the previous heading said DO NOT START IT precisely because a name on its own invites
a start. Second, ORDERING AMONG APPROVED WORK: `M-tranche3.md` is approved, ruled and worthwhile, and
it is NOT next. An approved prompt with no stated position is exactly what a later session picks up
by default, so the chain it sits behind is now drawn explicitly rather than left to be inferred.
2026-08-31: prompt Q's commits 4, 5 and 6 landed on the branch, and this pointer moved in the SAME
pass as commit 6 rather than after it - the 08-07 rule applied on purpose again. LIVE STATE was read
in the same pass, per the 08-29 rule, and it was STALE IN A WAY THAT MATTERED: its Compatibility row
still read `priced (45.000/29.000)`, which was the pre-ruling ladder that commit 1 replaced on 08-29.
So the two live pointers disagreed about a PRICE for two days. It was corrected in commit 4, in the
same commit that changed what a reader sees, per LIVE STATE's own rule.

What is new and belongs here: **a pointer must carry what is OWED, not only what is DONE.** Q's six
commits are all written, which a reader could easily take as "Q is finished". It is not: eleven
Indonesian strings are unruled, a migration is unapplied, and one behaviour is unverified. A pointer
that says "all six commits landed" and stops is the exact shape that sends the next session to open a
PR on work that cannot ship. The three are listed under THE CURRENT WORK, separated by WHO owns each.

A second thing, smaller: a DANGLING CODE CITATION was corrected in the "Read, in order" block. It
named `tests/card-budget.spec.mjs`, which exists only on unmerged #77. The repo convention is that a
code-fact in a doc carries the command that produced it; a citation to a file that does not exist is
that rule failing quietly, and it survived because nothing in CI reads this file.
-->

# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — the "MIRROR QA VERDICT 2026-08-10" section (the current requirement and why),
   MEASUREMENTS (**read the 08-11 baseline row FIRST — a stored gate row is not a valid comparator
   for a later change**), and THE INTERIM STATE (Xendit go-live status — read it before touching
   anything near the paid path).
3. `prompts/Q-demand-test.md` — **RELEASED and IN PROGRESS; see THE CURRENT WORK below.**
   `prompts/M-tranche3.md` is behind it AND behind the whole Card A chain (commits 0 and 1
   docs-only, **commits 2 to 4 touch `glossary.json` and `facts.js`**, and those now also have to
   clear the card budget gate — Card B has 7px of slack and a glossary edit can spend it;
   `spouse_palace` and `kekuatan` do not reach the card, so tranche 3 as scoped is clear).
   **CITATION CORRECTED 2026-08-31:** this line named `tests/card-budget.spec.mjs`, which does not
   exist on `main` — it lives only on the unmerged `fix/card-budget-tripwire` (#77, PARKED), so the
   reference was dangling and would have sent a session looking for a file it could not find. The
   gate that DOES exist and does run is `scripts/audit-card-budget.mjs`, wired as `audit:card-budget`
   and inside `npm test`:

   ```
   $ ls tests/card-budget*            -> no such file
   $ grep -n audit:card-budget package.json
   56:    "audit:card-budget": "node scripts/audit-card-budget.mjs",
   ```
   (`prompts/P-card-frame.md` is CLOSED, not queued — it returns with the 1080x1350 design pass.)

# THE PROMOTION LANDED, 2026-08-23. THE PRODUCT IS LIVE.

`#71` and `#72` merged (`f9c1c83`, `a27053f`). **Free is the full mirror, served from the new
pipeline, and Rp 19.000 buys the hi-res Card B plus the Complete Edition PDF.** `contents/*.md`,
`lib/content/`, `lib/readingView.js`, every `/api/reading/*` route and `lib/mirror/fence.js` are
deleted. Smoke-tested on production the same day: the mirror serves ungated, the offer sits after the
reading, the delivery endpoints 402 unpaid, and all five static pages render.

**ALL FOUR PRECONDITIONS WERE MET.** 1 MET 08-07 · 2 MET 08-23 · 3a CLEARED 08-23 · 3b MET 08-23
(fresh-1996 SHIPS, chart 5 PROSE PASS) · 4 MET 08-12.

**3a WAS RULED OUT OF THE GATE. IT WAS NOT MEASURED INTO COMPLIANCE AND IT WAS NOT WIDENED.**
Reyner, 2026-08-23, verbatim:

> **Rule 3a Clearance:** The 10% floor rate threshold is officially removed as a launch blocker. The
> deterministic fallback floor (module assembly) renders ruled, production-grade glossary prose, is
> never cached, and self-heals on a simple reload. A 20% floor rate represents a safe, graceful
> degradation rather than a broken customer state. Precondition 3a is cleared for promotion.

**No number was edited. 10% was not changed to 20% anywhere in the codebase**, and a session that
finds it changed has found a defect rather than the ruling. The floor rate is still measured
(PROGRESS MEASUREMENTS, 08-23, ~20% at `REGENERATION_BUDGET 2`) and it is still the availability
budget - rule 15 leaves one provider, so an outage is a 100% floor. It simply no longer decides ship
or no-ship.

## THE CURRENT WORK, 2026-08-29 - THE FLOOR'S HEADINGS, ON A BRANCH

**`fix/floor-heading-stutter`, head `d19ba69`, NOT MERGED.** Check with `git log --oneline main..`
before trusting this line; if it returns nothing the branch has landed and this pointer is stale.

What it is, in one sentence: Reyner ruled on 2026-08-26 that **a heading directly above a meaning
paragraph satisfies rule 21's "same breath"**, and the floor was rebuilt on that reading - headings
stay, the bare label sentence goes from every cell. Read, in order:

- `PROGRESS.md` - the section headed `RULED 2026-08-26 — A HEADING SATISFIES RULE 21'S
  "SAME BREATH"`: the ruling, the ambiguity it closes, and the measurement against main
- `docs/qa/2026-08-27-floor-after-heading-ruling.md` - a real floor reading as a file, served
  through the real routes for zero dollars by using an invalid key
- `../CLAUDE.md` REPO CONVENTIONS - the new assertion-must-fail rule, whose worked example is the
  08-26 commit that merged `lib/render/fallback.js`'s comments and not its code (`4325051` restored it)

Two DEFERRED REGISTER rows were opened by this work and both are Reyner's: the render fence tests
that a key EXISTS and never that it WORKS, and preview verification now costs real renders. Neither
is a task waiting here.

## THE CURRENT WORK, 2026-08-31 - PROMPT Q, ALL SIX COMMITS WRITTEN, NOT MERGED

**`docs/prompts/Q-demand-test.md` is RELEASED** (Reyner, 2026-08-29) and all six commits are on
`feat/demand-test`, **unmerged and unreviewed**. Check with `git log --oneline main..feat/demand-test`
before trusting this line. Its commit 0 was the authorised `CLAUDE.md` edit - band 25-45k ->
**25-49k**, and rule 15 trading its stale status sentence for a pointer to the live register.

| | |
|---|---|
| `122bee9` | 0 - `CLAUDE.md`: band 25-49k, rule 15 -> register pointer |
| `cf9be7f` | 1 - the ladder; `annual` priced, **not** sellable |
| `e06c90e` | 2 - migration `0009` + `lib/analytics/events.js` |
| `9229da7` | 3 - the eight events fire |
| `7cec498` | 4 - the upcoming block, every string a visible placeholder |
| `f0f8b30` | 5 - the read-out, with the ruled fixture door |

`npm test` 35/35 (was 32 when the branch was picked up; +`test:unruled-copy`, +`test:interest`,
+`test:readout`).

### TWO THINGS ARE OWED BY REYNER BEFORE THIS SHIPS, and neither is a task waiting for a session

1. **THE ELEVEN INDONESIAN STRINGS IN THE UPCOMING BLOCK.** Every one is a visible
   `@@UNRULED: ...@@` placeholder in `lib/site/copy.js#UPCOMING_COPY`, in one named object so it is
   one file to fill. **A PRODUCTION BUILD IS REFUSED WHILE ANY OF THEM SURVIVES**
   (`scripts/check-unruled-copy.mjs`, wired as `prebuild`); preview and local builds pass on purpose,
   because the block has to be SEEN to be ruled. Cowork proposed seven of the eleven on 2026-08-29
   and those proposals are in the PR body, deliberately NOT in the slots they would occupy. Four
   slots - `eyebrow`, `lead`, `thanks`, `contactSubmit` - have no proposal at all.
2. **THE MIGRATION.** `supabase/migrations/0009_demand_test.sql` is applied by hand in the SQL editor
   and must run BEFORE the code that reads it deploys (repo convention). Nothing in CI checks this.

### THE UNVERIFIED ITEM IS CLOSED, 2026-08-31 - THE OBSERVER WAS OBSERVED

`upcoming_seen` fires on an IntersectionObserver rather than on mount, because prompt Q section 3
defines both interest rates as interest / `upcoming_seen` so that a reader who never scrolled to the
block stays out of the denominator. This entry previously said the firing half was **NOT proven** and
sent the reader to the preview, because the agent browser pane runs with
`document.visibilityState === "hidden"` and a hidden tab never delivers an IntersectionObserver
callback.

**It did not need the preview.** Driven through real headless Chromium over the DevTools Protocol -
no new dependency, Node 24 has a global `WebSocket` - at a 375x812 phone viewport, both halves land in
ONE run: absent at load with the block 4551px below the fold, present exactly once after the scroll,
and not again on re-entry. `offer_seen` firing in the same run is what makes the absence mean the
observer held back rather than the transport being broken.

- Harness: `scripts/verify-upcoming-seen.mjs` (`npm run verify:upcoming`, needs `npm run dev`)
- Measurement: `docs/qa/2026-08-31-upcoming-seen-observed.md`

**The harness was shown failing first and it caught a defect in itself:** its "fired exactly once
after scroll" check counted the total at the end, which is 1 whether the event fires on mount or on
scroll, so it PASSED on a deliberately mount-firing build. It now snapshots the count immediately
before the scroll. That is the 2026-08-26 shape appearing inside the very file written to catch it.

**Still not established, and it is smaller but not zero:** production. This ran against a dev server
on localhost, below a floored reading rather than a rendered one. Neither difference touches the
observer, and neither has been measured.

**It runs IN PARALLEL with the Card A design pass and does not wait on it.**

### THE ORDER OF EVERYTHING ELSE, so nothing is picked up out of turn

```
prompt Q (instrumentation)  ──┐
                              ├── both run now, neither blocks the other
Card A design pass  ──────────┘
        |
        v
   prompt R (Card A implementation + export)   <- RELEASED 2026-08-31, main 473aeb5
        |
        v
   export validation on the real social surfaces
        |
        v
   September traffic
```

**`docs/prompts/M-tranche3.md` SITS BEHIND ALL OF IT.** Approved and worthwhile, ruled 2026-08-22,
and **NOT September critical path.** It must not block, delay or interleave with prompt Q, the Card A
design pass, prompt R, export validation or traffic. **It is not the next thing** - a session looking
for work takes it only when the chain above is done or explicitly parked, and this paragraph exists
because a queued-and-approved prompt is exactly what a later session picks up by default.

**PROMPT R IS RELEASED, 2026-08-31.** ~~It does not exist and cannot be started; it is derived from the
APPROVED COMPOSITION, which does not exist until Reyner's design pass produces it.~~ The design pass
produced it. Reyner approved the composition and ruled section 0 in full on 2026-08-31, and
`docs/prompts/R-card-a-4x5.md` is on `main` alone in `473aeb5`, landed before its own commit 1 per its
header. **Nothing is owed on it.** Its input was `docs/content/card-a-4x5-worksheet.md`; its design
authority is `card-polish-spec.md` §10.

The struck sentence is kept because it was TRUE while it stood, and this file's whole design note is a
record of pointers going stale without anyone noticing. It went stale here in a SEVENTH way, and it is
a new one: **the pointer was right about the world and the world changed underneath it.** No rule was
broken - no prompt was amended, no current work moved, nobody forgot a pass. A prohibition whose
condition was "until Reyner produces X" simply had its condition met, and nothing in a repo fires when
a person finishes a design. Rule, extended: **a prohibition written against a condition carries the
condition in its own text**, so the next reader can check whether it still holds instead of obeying it
on faith. This one did carry it, which is exactly why it could be checked and flipped rather than
believed.

**R IS RELEASED, NOT STARTED.** Its commit 1 is a gate change on what the card IS and lands alone.

The product authority is `product/paid-product-map.md` `## RULED 2026-08-29`, committed in the same
`cf349ea`. **That section decides WHETHER; prompt Q is only HOW.** If they disagree, that one wins.

What Q is, in one sentence: the smallest thing that answers **which product people want** - Compat or
Annual - on September traffic that is about to be acquired anyway, **without building either
candidate**. Six commits: the `CLAUDE.md` band amendment, pricing data, storage, instrumentation,
the funnel order, the read-out, and its own pointer update.

Two things it deliberately does NOT do, recorded here because they are the ones a session invents:

- **The Compat build, the Annual build and 天干五合 are out of scope.** So is the ORACLE PROBE, which
  is Reyner's research task and runs in parallel. Demand risk and buildability risk are separate
  questions and no number of waitlist clicks retires the second one.
- **It does not decide the roadmap.** It produces five numbers with clean denominators; the October
  decision rule they feed is in the RULED section and restated in Q's own section 7.

## DONE 2026-08-26 - THE CARD, AND IT IS LIVE

**The free share button had been producing a blank rectangle since the promotion.** Fixed and on
production (`#74`), with the paid card's prose and its overflow fixed behind it (`#76`). Four
artifacts:

- `docs/qa/2026-08-26-card-capture-cause.md` ......... why the share card was blank
- `docs/qa/2026-08-26-card-capture-verification.md` .. the un-fix, and the page at both widths
- `docs/qa/2026-08-26-card-b-overflow.md` ............ the paid card's prose, 9 of 13 charts
- `docs/prompts/P-card-frame.md` .................... **CLOSED 2026-08-26, NOT PENDING.** Ruled: Card
  A keeps the mat, and the frame change batches with the 1080x1350 design pass so a reader
  experiences ONE layout shift instead of two. Commit 1 is not a small win to be picked up early -
  shipping it alone is what creates the second shift. It returns WITH the design pass or not at all,
  so it is not tracked here as work waiting to start. (When it does return: its `sed -n '689p'` is
  stale, the line is 740 after the card commits.)

`docs/prompts/M-tranche3.md` - the tranche-3 repetition variants, option C with B as the fallback
(ruled 08-22) - is queued behind prompt Q. Neither is the critical path; the critical path is done.

## OPEN AND OWNED BY REYNER, not by a commit

- ~~**UNSET `MIRROR_PREVIEW_TOKEN` in Vercel.**~~ **CLOSED 2026-08-26.** Reyner deleted the variable
  and redeployed before `#74` merged. `lib/mirror/fence.js` was already gone with the promotion, so
  nothing reads it in either direction now.
- ~~**Confirm the Xendit keys in Vercel are LIVE, not test.**~~ **CLOSED.** Swapped 2026-08-07;
  the interim register records QRIS activated 08-11 and Reyner's first self-purchase completed
  08-13, which is a live key exercised end to end rather than a dashboard read.
- **The Gemini balance alert. STILL OPEN, but it is NO LONGER "the only unmitigated single point of
  failure" - that phrase was true until 2026-08-26 and is not now.** Reyner turned Gemini
  **auto-reload ON** on 08-26. That is a MITIGATION, not a detector: it covers credit DEPLETION, the
  2026-08-12 incident and the case this row was opened for, and it does **nothing** for an invalid,
  revoked, expired or refused key - which produces the same silent 100% floor through the same
  passing fence, because presence is all the fence tests. **So the unmitigated failure moved rather
  than closed**, and the deferred register's fence-validity row is now the more important of the two.
  The trade Reyner accepted: auto-reload spends without asking, bounded by the billing tier cap
  (**IDR 4,518,125**) and the three 2026-08-22 spend guards (`dd25a97`, `4ae6e1a`, `3ed7b0c`).
  Interim register for both rows.
- **Whether a Gemini key may be reachable from PREVIEW deployments.** Added to the deferred register
  2026-08-26. `GEMINI_API_KEY` is Production-only, so a preview cannot render a reading at all - the
  fail-closed fence refuses first, correctly. **Until it is ruled, every pre-merge check of the
  reading, the card or the paid path is local and then production AFTER the merge, with no stage in
  between.** A verification plan that says "check it on the preview" cannot run.

## STILL UNRULED

- **Whether BREADTH becomes an explicit gate requirement.** Only 7 of 13 facts on chart 5 are
  required points, so a reading's fullness is a side effect of how much the model writes rather than
  something the gate guarantees. PROGRESS, RULED 2026-08-22 (evening), section 3.

---

## The prompt-L history below is kept as the record of how the read was closed

**Prompt L is DONE.** Its four commits landed and the read it answered is in
`docs/qa/2026-08-19-READ-VERDICT.md`.

Reyner read five readings across four charts on 2026-08-19 and ruled five items. The verdict, the
rulings and the measurements are in `docs/qa/2026-08-19-READ-VERDICT.md`. **That file lands on main,
alone, before any commit in prompt L** (the #28 ruling).

**The read did not pass clean.** 2 of 4 charts are unsellable at Rp 19.000, both on the first sentence,
and a third floored on the live run. Under the STRICT precondition-3 restatement Reyner ruled the same
day, **today is 1 of 4, not 2** — a floored chart fails regardless of what its stored prose reads like.

Prompt L is **four** ordered commits that close it — `The Morning Dew` in the glossary (commit 0,
content), the engine requiring the archetype name in the opening (commit 1), the rule-23 bracket check
(commit 2), two harness defects (commit 3). Each is measured on its own; do not bundle or reorder them.

## LAUNCH SCOPE, ruled 2026-08-19 by Reyner

**Compatibility does NOT gate launch.** Live = the free full mirror served from the new pipeline, plus
Rp 19.000 for the hi-res card and the Complete Edition PDF. That is the swap package ruled 2026-08-13,
unchanged. Compat stays priced-but-unbuilt (`compat` absent from `SELLABLE_SKUS`, checkout 400s) and
ships after there is real demand signal - `CLAUDE.md` says its price band is to be TESTED, and testing
needs traffic that does not exist yet. **`CLAUDE.md` calls compat "the money engine" and that stands as
a product statement; it is not a launch precondition.**

So the remaining critical path is exactly two things: prompt L (readings sellable, precondition 3) and
the PDF built (precondition 2's other half).

**PROMOTED TO NEXT, 2026-08-21: the n-renders QA harness. It is no longer queued behind anything.**

**AMENDED 2026-08-22: precondition 3's RENDER clause is a POOLED RATE, at or below 10% at n=10, and it
is MET** (pooled 4/40 on `docs/qa/2026-08-22-renders-n10-postfixes.md`). The absolute form below is
superseded - at a 10% per-run floor a clean 40-draw sweep has probability 1.5%, so it was a lottery
rather than a gate. The paragraph stands as the record of why the n-renders harness was built, which is
unchanged. Full reasoning: PROGRESS.md, RULED 2026-08-22. **The floor-rate work is closed at 10% pooled;
no further gate or prompt change is proposed against it.**

**RESOLVED 2026-08-23: 3a IS OUT OF THE GATE, AND THE THRESHOLD WAS NOT WIDENED.** The 4/40 = 10%
measurement was taken at `REGENERATION_BUDGET` 3; the 08-22 evening revert to 2 - *"depth 3 is thinner,
not tighter"* - returned the pooled floor to roughly 20% and un-met the threshold. Reyner resolved the
collision by **removing the threshold as a launch blocker**, verbatim:

> **Rule 3a Clearance:** The 10% floor rate threshold is officially removed as a launch blocker. The
> deterministic fallback floor (module assembly) renders ruled, production-grade glossary prose, is
> never cached, and self-heals on a simple reload. A 20% floor rate represents a safe, graceful
> degradation rather than a broken customer state. Precondition 3a is cleared for promotion.

**NO NUMBER WAS EDITED. 10% was not changed to 20% anywhere**, and a session that finds it changed has
found a defect rather than the ruling. The floor rate is still measured - it is still the availability
budget, and with one provider a Gemini outage is a 100% floor - it just no longer decides ship or
no-ship.

**Still open and unruled:** whether BREADTH becomes an explicit gate requirement, since only 7 of 13
facts on chart 5 are required points. PROGRESS.md, RULED 2026-08-22 (evening), section 3.

**AMENDED 2026-08-23: THE THRESHOLD REPLACED THE RENDER CLAUSE ONLY.** Precondition 3 has two
clauses and the paragraph below states both - *renders* AND *would be sold*. Clause **3a (render) is
MET**; clause **3b (sold) is NOT MET and is owed by Reyner, on the 08-22 artifact**. So promotion is
**2 of 4 whole plus 3a**, blocked on precondition 2 AND on 3b - the 08-22 wording of "MET" and "3 of 4"
over-counted a two-clause precondition as one. **Do not read "precondition 3 is met" anywhere as
covering sellability.** The clause table is in PROGRESS.md, RULED 2026-08-22.

Reason, and it is not a preference. Precondition 3 is ruled STRICT - every chart must RENDER and would
be sold. **That criterion cannot be evaluated at n=1, and three consecutive runs proved it:** the same
four charts returned floor rates of **0/4, 2/4 and 1/4** with the failing checks identical and
untouched between runs (`style.hedging`, `coverage.field_dropped`, `fact.strength_*`). It is the 08-17
"floor rate moves between identical batches" finding surfacing on a third metric.

So the launch gate Reyner set is currently **unmeasurable with the instrument we have**, and every
remaining ship/no-ship argument would be conducted on n=1 numbers. `qa:renders` runs each chart ONCE
by design and its own header explains why re-running to get a pass is not QA. The fix is n renders per
chart with the floor rate printed beside each verdict, which `probe-retry-depth` already does.

**Nothing else on the critical path can be decided honestly before this lands.** Per-attempt evidence
stays firm throughout - a rejection naming exactly one check is a fact. Only RATES are affected.

**One item is Reyner's and is NOT in prompt L:** the cross-chart repetition variants — content work,
drafted by Cowork and rewritten by him. Drafts and the ranked collision measurement are in
`docs/content/tranche3-repetition-worksheet.md`, and **one design fork there is unruled**: whether a
variant is keyed on a distinction the engine already makes, or is an interchangeable phrasing. Do not
draft the rest of that queue before it is ruled.

(`arketipe.name_en` was on this list until Reyner ruled it `The Morning Dew` on 2026-08-19. It is now
commit 0 of prompt L. This line is kept rather than deleted because the pointer said "NOT in prompt L"
for a while after it was in it, and Claude Code caught the contradiction — see the design note at the
top of this file.)

**The content revision pass is CLOSED.** Tranche 1 passed; tranche 2a merged as #38/#39 and 2b as #40,
all 2026-08-12, applied by `scripts/apply-rulings.mjs --expect`. Fact order moved on ZERO charts, as
predicted. **If a content tranche ever re-ranks a chart again, something has re-coupled prose to
ranking and that is the bug.**

**Unblocked by tranche 2 landing, and waiting on the read rather than on a threshold argument:**
the small renderer-prompt pass (the pillar-domain gloss on first palace mention, and a breath phrase
when two facts stack in one pillar — details in the tranche-1 verdict section), and the chart-5
re-render that settles whether `quietFloor` needs re-fitting. The read produces that chart-5 answer as
a by-product; see `PROGRESS.md:477` for the ruling that deferred it and what each answer costs.

**Fix-plan step 3, transitions / narrative roles, is CANCELLED — not deferred, and never built.**
Thematic headers plus grounded action endings closed the seams; the reader does not miss connectives.
Do not revive it without new evidence from a real read.

(Prompt J is DONE — merged as PR #18-#20 on 2026-08-07, live and fenced on production. The carried
`element_missing` item landed with it as PR #20. Prompt K is DONE — merged as PR #21 on 2026-08-11;
Reyner's re-read passed it: *"meeting yourself first completely fixes the upside-down feeling."*
PR #45, `feat/pre-promotion-four-tracks`, is open with CI green — card contrast, the floor-rate fix,
the hanzi subset and `npm test`. PR #44 was closed as superseded and its branch deliberately kept.)

## Before the next measured change — READ THIS
The 08-11 control run showed the exact gate-`1.8.0` configuration scoring 88.5% and 94.6% shipped
on two different days, with one fact check firing 15 times and once. **Measuring a change against a
stored row measures the day.** Run the arms back to back in one session, prefer metrics with
thousands of samples (blocks per reading replicated to the decimal; the headline rates did not),
and read rejected prose before believing a per-check delta — the `hour_known_contradiction` spike
that looked like a K regression turned out to be the 08-06 penutup failure, unchanged.

## Standing rules
- Engine changes and calibration in **separate commits**.
- Never improvise a BaZi rule (rule 4). That includes tables handed to you in a prompt.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- The commit message must describe everything staged.
- Low on context mid-sequence: **stop and report** rather than half-landing a change.
- If this file sends you back into engine calibration, push back — that work is closed
  (`PROGRESS.md` RESOLVED).
- Flag anything in the docs that contradicts what you find. Twenty spec errors have been caught
  that way, all of them Cowork's.
