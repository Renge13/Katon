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

2026-08-31: prompt R landed commits 1 to 4 and this pointer moved in the SAME PASS as commit 4 - the
08-07 rule applied on purpose, following prompt Q's commit 6 precedent. LIVE STATE was read in the
same pass per the 08-29 rule, and it was stale in exactly the way that rule predicts: its shareable
row still read "1080x1440 share capture", which commit 3 made false. It was corrected in commit 3
itself rather than here, because that is the commit that changed what a reader gets.

What is new and belongs here: **a pointer must say what a later session must NOT redo.** R's own
handover had to spend a paragraph telling this session not to re-sweep a settled watermark offset and
not to invent replacement spacing values - both already measured and ruled, and neither written
anywhere a session would look. So THE CURRENT WORK now carries an explicit "must not redo" block. A
pointer that lists only what is DONE invites the next session to re-derive what is SETTLED, which
costs a round and can quietly move a ruled number.

A second thing, smaller: the dangling citation corrected in "Read, in order" was corrected ON THIS REF
and says so. It names line 51 of `package.json` on `feat/card-a-4x5`; the same entry is line 56 on
`feat/demand-test`. That is ledger row 44 in one line - a repo claim carries its ref, and a line
number without one is a claim about a file that may not be the file being read.

2026-09-03: STALE A SEVENTH TIME, and this is the 08-19 rule broken rather than a new way. TWO
headings both read "THE CURRENT WORK" and both said their branch was unmerged: prompt R for three
days after `c8cee93`, prompt Q for three days after `622d926`. Reyner caught R. Q was found while
fixing R and has the sharper shape: **this file already said "Q - DONE. Merged as #84." forty lines
above the heading that said "unmerged and unreviewed", so the document contradicted itself about one
branch.** That is the 08-29 failure - two live pointers disagreeing, neither checked against the
other - reproduced INSIDE a single file, where it is even easier to miss because a reader who has
read the top feels no need to re-check the middle.

What is new and belongs here, and it is uncomfortable: **both stale headings carried their own
verification command.** R's said "Check with `git log --oneline main..feat/card-a-4x5` before trusting
this line", and running it returns nothing. The command was correct, sitting directly under the false
sentence, for three days. **A pointer that carries its own check still goes stale, because the reader
who believes the sentence never runs the command.** The conclusion is NOT to drop the commands - they
turned this into a thirty-second correction - but that a command is a remedy for the session that
already doubts the line, and nothing in a document creates that doubt. Only a heading being wrong
often enough does, which is what this design note is now for.

A third thing: **an owner-held row was NOT closed, on purpose.** Q's migration `0009` is applied by
hand in the Supabase editor and nothing in the repo can report whether it has been. The other owed
row was closed with its grep. Recording the asymmetry because the 08-26 entry above predicts exactly
this - an owner-held item nothing will ever mark done - and the temptation is to tidy it away on the
strength of the migration FILE existing, which says nothing about whether it ran.

> **AMENDED. THE ROW CLOSED LATER THE SAME DAY, and this note went stale inside the very PR that
> documented that shape.** Reyner had applied `0009` against the production project on 2026-09-02 and
> verified it with a REAL SUBMIT rather than by the tables existing - `funnel_event` took all five
> event names and `product_interest` stored a contact. The closure is under **TWO THINGS WERE OWED BY
> REYNER**, item 2, below.
>
> **THE REASONING ABOVE STANDS AND IS NOT STRUCK:** nothing in the repo could report whether a
> hand-run migration had run, which is exactly why the row was owner-held and why closing it on the
> file existing would have been wrong. What went stale is the STATUS, not the argument - and the
> status was only ever closable by evidence from outside the repo, which is the argument's own point.
>
> **THE GENERAL RULE, and it is the reason this recurred here of all places: A NOTE THAT RECORDS AN
> ITEM'S STATUS BECOMES A SECOND SOURCE OF TRUTH FOR THAT STATUS.** This entry existed to explain a
> DECISION - why an owner-held row is left open - and it carried the row's state along for
> illustration. The decision cannot go stale; the state did, within hours, and nothing pointed back
> here when it moved. **A design note may record what was decided and why. The moment it also records
> where something STANDS, it has to be swept every time that thing moves** - which is the failure this
> file already logs seven times, arriving one level up, in the notes about the failure.

2026-09-07, later the same day: **compat tranche 1 merged as #95 (`db9e74c`) and this pointer moved
in the SAME PASS as the merge** - the 08-07 rule applied on purpose rather than recorded as broken
again, and `Read, in order` item 3 was swept with the heading instead of being left to contradict it,
which is the 09-03 failure. LIVE STATE was read in the same pass per the 08-29 rule and was
**deliberately NOT edited**: every line in tranche 1 is engine facts with no reader-facing surface, so
its Compatibility row - not purchasable, absent from `SELLABLE_SKUS`, `/api/pay` 400s - is still true
after the merge. Editing it would have described the target instead of what ships, which is the one
thing that block exists to refuse. **The heading now carries the distinction explicitly, because
"MERGED" invites exactly the reading LIVE STATE forbids: merged is not shipped.**

2026-09-07: **STALE AN EIGHTH TIME, and it is the 08-19 rule broken rather than a new way** - THE
CURRENT WORK still read "PR #91, OPEN" for four days after #91 merged (2026-09-03), while #92, #93
and #94 merged behind it and `gh pr list --state open` returned empty on 2026-09-07; no new rule is
added, because the 09-03 entry above already predicts exactly this (the heading carried its own
`gh pr view 91 --json state` check two lines down and the reader who believed the sentence never ran
it).

A fourth, about scope: **LIVE STATE was read in the same pass, per the 08-29 rule, and deliberately
NOT edited.** PR #91 changes what a reader sees while a reading loads, and LIVE STATE describes what
SHIPS. Writing #91's behaviour into it while #91 is open would recreate the exact 2026-08-23 trap
that block spends four paragraphs on: a description written on a branch, merged with it, false from
the moment it lands. LIVE STATE moves when #91 does, in the commit that changes what a reader gets.-->


# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — the "MIRROR QA VERDICT 2026-08-10" section (the current requirement and why),
   MEASUREMENTS (**read the 08-11 baseline row FIRST — a stored gate row is not a valid comparator
   for a later change**), and THE INTERIM STATE (Xendit go-live status — read it before touching
   anything near the paid path).
3. `prompts/R-card-a-4x5.md` — **DONE. Merged as #85 (`c8cee93`).** It said "THE CURRENT WORK" here
   for three days after it landed; the section below carries the correction and what must not be
   redone. **Superseded 2026-09-07: the loading transitions merged as #91, and `prompts/W-compat-1.md` -
compat tranche 1 - merged the same day as #95 (`db9e74c`). THERE IS NO CURRENT BUILD WORK: tranche 2
(prompt X) is NOT WRITTEN. See THE CURRENT WORK below for what it is owed and by whom.**
4. `prompts/Q-demand-test.md` — **DONE. Merged as #84, AND IT OWES NOTHING ANY MORE.** All six commits
   plus the ruled copy. Both open items closed on Reyner's production walk of 2026-09-02: migration
   `0009` is applied, and `upcoming_seen` fired there alongside the other four events. This entry read
   *"still OWES ... `upcoming_seen` proven on localhost and not yet on production"* until 2026-09-03 -
   the same stale-status shape the design note at the top now generalises, in the block a new session
   reads FIRST.
   `prompts/M-tranche3.md` is queued behind BOTH (commits 0 and 1 docs-only, **commits 2 to 4 touch
   `glossary.json` and `facts.js`**, and those now also have to clear the card budget gate — Card B
   has 7px of slack and a glossary edit can spend it; `spouse_palace` and `kekuatan` do not reach the
   card, so tranche 3 as scoped is clear).
   **THE CITATION RESOLVES AGAIN, 2026-09-01.** This line named `tests/card-budget.spec.mjs`, which
   existed only on the unmerged `fix/card-budget-tripwire`, so it was dangling and was corrected on
   2026-08-31 to point at `audit:card-budget` instead. **#77 merged as `96bfca6` and the file is now
   on `main`**, so the original citation is live and BOTH gates exist:

   ```
   $ ls tests/card-budget.spec.mjs                    # ref main, post-#77
   tests/card-budget.spec.mjs
   $ grep -n '"test:card-budget"\|"audit:card-budget"' package.json
   54:    "test:card-budget": "node --test tests/card-budget.spec.mjs",
   62:    "audit:card-budget": "node scripts/audit-card-budget.mjs",
   ```

   The 08-31 correction is kept in this file's design note rather than deleted: it was true for six
   days, and a citation that was dangling and is now live is exactly the state a later reader needs
   to be able to tell from one that was never checked.
   (`prompts/P-card-frame.md` is CLOSED, not queued — it returned WITH the design pass, as prompt R.)

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

## THE CURRENT WORK, 2026-09-09 - PROMPT Y-2, SITE CHROME AND THE COMPAT FLOW

**`docs/prompts/Y-ui-2.md`, RELEASED 2026-09-08, plus both addenda.** Reyner's brief: "UX,
navigations, must be professional, doesn't need to be beautiful, but makes sense and modern." It adds
STRUCTURE and removes dead ends; no new visual language.

| | |
|---|---|
| A1 | `npm test` runs everything CI runs, or refuses (Addendum 1) |
| 1 | `SiteHeader` on every route, and the `CHROME_COPY` bank |
| A2.4 | the hour picker, and the season-gate sentence ruled with it |
| 2 | `PasanganSteps` - 1 Kamu, 2 Dia, 3 Email, with the gate inside its step |
| 3 | the report's seven states, one heading system, a way out of each (A2.1, A2.2) |
| 4 | the mirror gets the same copy-link control |
| A2.3 | the report's first frame is the skeleton, not a blank page |
| 5 | the ledger |

**THE COPY PR LANDED FIRST AND SEPARATELY, as Addendum 2 item 5 required.** #112, merged
2026-09-09 (`a66d735`): `page_lead`, `form_email_help` and `privasi_email` amended, `paid_title`
dropped, the two report eyebrows renamed to `section_pattern`/`section_rhythm`, four new section
slots added, and two shared JSX strings changed in both products. Y-2 therefore contains no copy
ruling of its own except the one Reyner made after it (below).

**WHAT IS OWED, AND BY WHOM**

1. **REYNER WALKS THE PREVIEW ON A PHONE** with `PAYMENTS_PROVIDER=mock` set for the Preview scope.
   That is the only place the stepper, the report header and the section headings can be judged;
   jsdom has no layout, so nothing in the suite says any of it LOOKS right.
2. **THREE COPY QUESTIONS, all in the PR body and none of them blocking a merge.**
   - `section_element` and `kompatibilitas.p3_supplies.name_id` are BOTH "Penyeimbang Unsur". The
     duplicate is suppressed in code, which is a technicality; whether they should be DIFFERENT words
     is Reyner's.
   - the mirror's copy-link box carries NO sentence, because `link_keep` says "bacaan **kalian**" -
     the couple's - and the mirror's reading is hers alone. A singular version is his to write.
   - the hour picker's label stayed `Jam lahir · opsional`. Addendum 2 item 4 says "Jam lahir"; the
     rulings file confirms the longer form UNCHANGED on the same walk, and dropping "· opsional"
     removes the only signal that the field can be skipped.
3. **`?dari=<token>` CANNOT PREFILL, and the prompt's sentence saying it does is wrong.**
   `GET /api/mirror/<token>` returns no birth data by design. The stepper starts on step 1 and a test
   pins that, so the sentence cannot be implemented later without meeting it.
4. **THE DELETION PATH STILL DOES NOT REACH A PAIR** - unchanged by Y-2, see its own section below.
   `privasi_second_person` promises B's data is deleted with the reading, which the code cannot keep.
5. **PROMPT Z, THE READING VOICE, IS AFTER Y-2 MERGES** (Addendum 2 item 9). Not started.
6. **THE PDF FOR COMPAT IS Y-3 and is a RELEASE precondition** (Addendum 2 item 8).

**SALES REMAIN CLOSED UNTIL DOKU.** Y-2 changes nothing about that: no reopen step, and no real
Xendit transaction by anyone.

### PROMPT Y-1 IS MERGED, 2026-09-08, and is not current work any more

**The compat report hotfix.** A paying customer received a blank report; the two defects that caused
it shipped in #105 and are fixed. Sales closed the same day. Its "what is owed" list is superseded by
the one above, except items 3 (the Vercel function duration, still Reyner's to read from the
dashboard) and 4 (the deletion path), which are unchanged and still open.

## SUPERSEDED - THE CURRENT WORK, 2026-09-08 - PROMPT Y-1, THE COMPAT REPORT HOTFIX

**`docs/prompts/Y-compat-hotfix-1.md`, RELEASED 2026-09-08. A HOTFIX: a paying customer received a
blank report.** Reyner paid Rp 39.000 on production for pair `g4WH4_9QbCrCj3Gha934q`.

| | |
|---|---|
| 0 | `PAYMENTS_PROVIDER` = xendit / mock / closed. Production CLOSED |
| 1 | the blank report - `ProseBlocks` derives paragraphs from `text` |
| 2 | the raw keys - names resolved on the server from the glossary |
| 3 | the wait - the webhook warms the render, and every wait shows a skeleton |
| 4 | `docs/ops/paid-flow-walk.md` - the free walk |
| 5 | the ledger |

**SALES ARE CLOSED AND STAY CLOSED UNTIL DOKU.** No reopen step, and **no real Xendit transaction by
anyone, including for testing.** An unset `PAYMENTS_PROVIDER` means `closed`, so a lost env var
cannot reopen a channel Reyner shut.

**WHAT IS OWED, AND BY WHOM**

1. **REYNER SETS `PAYMENTS_PROVIDER=mock` FOR THE PREVIEW SCOPE** in Vercel, then walks the paid path.
   Production stays `closed`; unset is already `closed`. `docs/ops/paid-flow-walk.md` has the steps.
   **Y-2 does not start until that walk is done.**
2. **THE 28 RULED COPY STRINGS - ITS OWN PR, after Y-1 merges.** The file is on main; the bank still
   holds the drafts. `tests/pasangan-copy.spec.mjs` reads the file's STATUS, so the applying commit
   flips `RULED` to `APPLIED` and the byte-identity check arms itself.
3. **THE VERCEL FUNCTION DURATION FOR THE PRODUCTION INVOCATION - REYNER, from the dashboard.** I could
   not read it: no Vercel CLI or token here, and a preview answers 302 to an SSO login. Measured
   LOCALLY instead, 2026-09-08: a cold pair render is **2.7-5.4s** at one or two attempts, and the n=20
   run saw draws needing six. **So a plain platform timeout is NOT the obvious cause and I did not
   assume it was.** The fixes shipped are the ones that hold either way - warm on settle, a skeleton in
   every wait, and a poll that no longer stacks requests. If the dashboard shows a timeout, the
   remaining move is `maxDuration` or a status-based render, and that is a decision with the number in
   hand.
4. **THE DELETION PATH STILL DOES NOT REACH A PAIR** - see its own section below. `privasi_second_person`
   in the ruled copy promises B's data is deleted with the reading, which the code cannot keep today.

### PROMPT X-b3 IS MERGED, 2026-09-08, and is not current work any more

**Merged as #105 (`e2bfc3f`).** The surface shipped and **two of its defects reached a paying
customer within the hour** - COWORK-BRIEF row 48. The suite was 58 green at the time.

## SUPERSEDED - THE CURRENT WORK, 2026-09-08 - PROMPT X-b3, THE SURFACE, `feat/compat-2b3`

**`docs/prompts/X-compat-2b3.md`, RELEASED 2026-09-08 by Reyner. Eight ordered commits.**
**A PERSON CAN NOW FIND COMPATIBILITY ON THE FRONT DOOR, ENTER TWO BIRTH DATES, PAY, AND READ THE
REPORT** - with every reader-facing string a `PENDING()` slot, which is why a production build
refuses and a preview build passes.

| | |
|---|---|
| 0 | the prompt file alone |
| 1 | the copy gate stops naming its subjects - banks `register()` into `COPY_BANKS` |
| 2 | `PASANGAN_COPY`, 22 slots, plus four `home_*`; the Upcoming compat row deleted |
| 3 | Home's two paths; the demand tap deleted |
| 4 | `/kompatibilitas`, `BirthFields` extracted, and X-b1's redirect regression closed |
| 5 | `/kompatibilitas/[id]`, and the mirror's prose renderer becomes shared |
| 6 | `/privasi` discloses the email and the second person (ruling C, come due) |
| 7 | the ledger |

**WHAT IS OWED, AND BY WHOM**

1. ~~**THE `PASANGAN_COPY` RULINGS**~~ **DONE 2026-09-08.** All 28 applied by hand, verbatim, from
   `docs/content/pasangan-copy-rulings.md`; `tests/pasangan-copy.spec.mjs` compares every row to the
   live bank because there is no `--expect` for a copy bank. **`VERCEL_ENV=production npm run build`
   now PASSES.** A PROCESS RULING came with them: Compatibility UI CHROME ships from Cowork's swept
   drafts and is amended in place by Reyner; the full ruling process stays for READING words - the
   glossary, the renderer prompt, the floor. Rule 20 is unchanged for readings.
2. **REYNER WALKS THE PREVIEW ON A PHONE.** The two-card row on Home, the order of the two paths and
   the shape of the pre-payment page are technicalities Cowork settled (rule 9) and he may reorder
   any of them. The preview URL is in the PR.
3. **THE n=20 FLOOR RE-MEASURE - REYNER DECIDES WHETHER TO SPEND IT.** Not run. Four pairs were
   re-rendered after the penutup ruling and first-attempt Stage 6 passes went **0/4 -> 3/4**
   (`docs/qa/2026-09-08-compat-penutup-cause.md`). That is a cause check, not a rate.
4. **THE VERDICT CATEGORY BECOMES A REJECT** - see OWED ON THE n=20 RE-MEASURE below.

**FOUR STAGE 6 CHANGES LANDED THE SAME DAY, EACH ISOLATED, EACH WITH ONE VERSION BUMP:**

| | | |
|---|---|---|
| `1.19.0` | #101 `32d4bd6` | `tension_collapse` scoped per block by fact kind for a pair |
| `1.20.0` | #102 `435505e` | `p0_opening` ruled; the floor names both people; `both_named`'s floor exemption removed |
| `1.21.0` | #103 `e5b0677` | the penutup scoped by whether the READING carries any tension |
| `1.22.0` | #104 `91a07aa` | the five ruled verdict patterns, at `flag` severity |

`e5b0677` also changed the compat PROMPT (`9109d65d14b74e46` -> `ceb898d80f52471c`): the penutup
instruction asked for "what this pairing IS ... it describes the dynamic between them", which is a
request for the summarising sentence that reaches for `saling melengkapi`. **The gate scope alone
moved nothing on the four measured pairs; removing the cause moved three of four.**

**TWO THINGS THE NEXT SESSION MUST NOT READ AS DEFECTS**

- **`style.tension_collapse` rejects `tidak selaras`** - "NOT in harmony", a sentence that names
  the friction. A token ban firing on a construction. **Not fixed:** a negation carve-out changes
  what Stage 6 accepts and is Reyner's. The shape is `hedge_construction`'s `bukan berarti`
  lookahead, applied to `tidak ` / `belum ` / `kurang `.
- **The pair guard's finding shape changed** (`code` -> `check`) in `91a07aa`. It fixed real
  invisibility - a pair rejection was recorded in the QA tape as `undefined` and the regeneration
  directive said `- [undefined] ...` - and it CHANGES THE DIRECTIVE TEXT for any pair carrying a pair
  finding. **The n=20 is therefore not comparable to the n=10 on regeneration behaviour.**

### PROMPT X-b2 IS MERGED, 2026-09-08, and is not current work any more

**Merged as #100 (`a5648a6`).** Eight commits: the pair semantic JSON, the compat prompt composed
from the mirror's own bytes, the paid reading endpoint, the variant-key correction, Reyner's 24
`kompatibilitas` cells, the first two pair Stage 6 checks, and the n=10 run. Its floor-rate
precondition for X-b3 was NOT met at the time (2/10 = 20%); Reyner released X-b3 anyway, on the
three Stage 6 rulings rather than on the rate, and the prompt's own STATUS line says so.

## SUPERSEDED - THE CURRENT WORK, 2026-09-08 - PROMPT X-b2, THE PROSE PIPELINE, `feat/compat-2b2`

**`docs/prompts/X-compat-2b2.md`, RELEASED 2026-09-08 by Reyner. Six commits; FOUR landed.**
The compat report enters the SAME pipeline the mirror uses, as a second instance of one contract.

| | |
|---|---|
| 0 | `722f5fe` the prompt file alone |
| 1 | `363f091` `lib/semantic/pair.js` + the `kompatibilitas` glossary section (placeholders only) |
| 2 | `e4d4b08` the compat renderer prompt, selected by `kind` |
| 3 | compat Stage 6 - `both_named` + `reframe_present`, `STAGE6_VERSION` 1.18.0. **UNBLOCKED 2026-09-08**: each shown red on a REAL Gemini render |
| 4 | `GET /api/pair/[id]/reading` |
| 5 | n=10 floor rate - `docs/qa/2026-09-08-compat-renders-n10.md` |

**ALL SIX COMMITS LANDED, PLUS TWO CORRECTIONS.** The glossary was re-keyed by VARIANT rather than
by fact id (Cowork's error: the floor picks text by relation, so one cell per fact would have made a
clashed seat and a harmonised seat read identically), and Reyner's 24 cells were applied with
`--expect 46`, clean on the first run.

**X-b3'S FLOOR-RATE PRECONDITION IS NOT MET: 2/10 = 20% against the mirror's ruled 10%.** Nothing
was loosened to move it. The cause is one check - `style.tension_collapse` is 16 of 18 rejections -
and it is a DOMAIN COLLISION rather than a model failure: it bans `selaras`, `saling melengkapi`,
`menyatu`, which are the ordinary Indonesian for what P3 states as a fact. **Three options are put
to Reyner in the QA doc and none was taken.**

**TWO OPEN GAPS FROM THIS TRANCHE, both owed:**
1. **THE FLOOR NAMES NEITHER PERSON.** No ruled cell opens a pair reading, and
   `RENDER_COPY.floorIdentity` is a single-subject sentence; naming both needs a connective, which
   is Reyner's. `both_named` is therefore exempt on the floor - measured, because a HARD check
   there made every pair 503 the moment the provider failed. One ruled opening cell closes both.
2. **`blocklist.json#verdict` is EMPTY.** `no_verdict` logs and rejects nothing until Reyner rules
   the Indonesian constructions. Adding a rejecting pattern bumps `STAGE6_VERSION` again, alone.

**COMMIT 3 IS BLOCKED AND WAS NOT STUBBED.** Its three Stage 6 checks - `both_named`,
`no_verdict`, `reframe_present` - may not be cited as protection until each has been shown red
on a REAL Gemini render, which is prompt X-b2's own condition and PR A's lesson. No key is
available locally (`.env.example` only, no `.env.local`, no Vercel CLI), so the commit did not
land at all rather than landing unverified.

**THE CONSEQUENCE, PLAINLY: nothing currently enforces that both people are named in the opening,
or that the P2 reframe appears when the flag is raised.** Both are ruled requirements. There is no
UI for the endpoint, which is what makes that tolerable rather than a live defect.

**TWO THINGS BLOCK A PRODUCTION DEPLOY AND BOTH ARE INTENDED:**
1. `check-unruled-copy.mjs` now scans `GLOSSARY.kompatibilitas` and refuses while its 58
   placeholders survive. `VERCEL_ENV=production npm run build` exits 1.
2. A paid pair reading answers **503 `unruled_content_in_reading`**, because the floor is built
   from those placeholders. **The mirror's floor gate does NOT catch this** - both findings on a
   pair floor are SOFT - so `serveReading.js` carries a second serve-boundary refusal. Without it
   a paying customer would have received a page of `@@UNRULED@@` at HTTP 200.

Both clear when the glossary is ruled. Neither needs a code change.

### PROMPT X-b1 IS MERGED, 2026-09-08, and is not current work any more

**Merged as #97 (`90d301b`).** Migration `0010_pair.sql` is applied; production serves
`GET /api/pair/<nonexistent>` as `404 {"error":"not_found"}`, which is the handler's own body and
therefore proof the table exists.

## SUPERSEDED - THE CURRENT WORK, 2026-09-07 - PROMPT X-b1, COMPAT TRANCHE 2b1, `feat/compat-2b1`

**`docs/prompts/X-compat-2b1.md`, RELEASED 2026-09-07 (night) by Reyner. Five ordered commits.**
The standalone paid product's spine: a `pair` object, checkout, the paid flip, and a gated facts
endpoint. **Server-verifiable end to end with curl before any UI exists** - there is no page, no
Funnel change and no Home change in it.

**THE THREE RULINGS THAT SHAPE IT** are verbatim in the prompt and in `PROGRESS.md`'s
`RULED 2026-09-07 (night)`: person B gets nothing, compat is a first-class entry point, and there
is no free compat result. The first is a DATA-MODEL constraint - a `reading` row is a reachable
`/r/<token>` URL, so **person B must never become one**, and the pair stores both birth inputs
itself.

| | |
|---|---|
| 0 | the prompt file alone |
| 1 | the model lands in the docs, nothing else changes |
| 2 | `supabase/migrations/0010_pair.sql`, `lib/pairStore.js`, `POST /api/pair` |
| 3 | checkout and the paid flip - `compat` becomes sellable |
| 4 | `GET /api/pair/[id]`, the gated facts endpoint X-b2 renders through |

**MIGRATION `0010_pair.sql` IS APPLIED BY HAND BY REYNER IN THE SUPABASE SQL EDITOR, BEFORE THE
CODE DEPLOYS.** Migrations here have no CLI tracking (CLAUDE.md, REPO CONVENTIONS), so nothing in
the repo can report whether it has run. An owner-held row of exactly the shape this file's design
notes warn about: it will not be closed by a commit.

**TWO STRINGS SHIP AS `@@UNRULED@@` AND ONE OF THEM FAILS A PRODUCTION BUILD ON PURPOSE.**
`compat_invoice_desc` is a statement line, so rule 20 makes it user-facing and Reyner's;
`scripts/check-unruled-copy.mjs` runs as `prebuild` and refuses a production build while it is
live. Preview and local builds pass deliberately - the string has to be seen to be ruled.

### PROMPT X-a IS MERGED, 2026-09-07, and is not current work any more

**Merged as #96 (`a25ccf5`).** Two base-rate runs followed on `main` (`526b947`, `ead53d4`) and
they are measurement only - no rule moved. Their findings are the input to the V6 ruling owed below.



**`docs/prompts/X-compat-2a.md`, RELEASED 2026-09-07 (evening) by Reyner. Four ordered commits on
`feat/compat-2a`.** P4 temperament facts and P5 pull/fit facts, under the evening rulings: P4 gets
a Katon-owned badge layer (matching / related / contrasting), P5 is accepted as written, the spouse
star is deferred as a high-value v1 candidate, and the PRODUCT PRINCIPLE is folded into
`CLAUDE.md`. All four are verbatim in the prompt and in `PROGRESS.md`'s
`RULED 2026-09-07 (evening)`.

**THE RULE THE ENGINE IMPLEMENTS IS `docs/product/compat-p4-p5-rules.md`**, not this pointer and
not the prompt. `lib/compat/pullFit.js` cites its section numbers and its spec quotes each clause
it asserts, so a change to that doc is a behaviour change and ships with a red test.

| | |
|---|---|
| 0 | the prompt file alone |
| 1 | the rulings, the rule doc, the `CLAUDE.md` principle line, this pointer |
| 2 | `lib/compat/temperament.js` - P4, same_god / same_group / different_group |
| 3 | `lib/compat/pullFit.js` - P5, pull / fit / quadrant |

**TRANCHE 2b IS PROMPT X-b AND IS NOT WRITTEN.** UI, P0 comparison card, email-only checkout and
the `/privasi` wording, the relational renderer prompt, the Stage 6 gate, and content in Reyner's
register. Nothing in X-a reaches a reader.

### COMPAT TRANCHE 1 IS MERGED, and it is not current work any more

**The owed list is as in `8db0f24`.**

```
$ git log -1 --format='%h %s' db9e74c              # 2026-09-07
db9e74c Merge pull request #95 from Renge13/feat/compat-1
$ gh pr view 95 --json state,mergedAt
{"mergedAt":"2026-09-07T05:34:34Z","state":"MERGED"}
```

```
$ git log -1 --format='%h %s'                       # 2026-09-07
db9e74c Merge pull request #95 from Renge13/feat/compat-1
$ gh pr view 95 --json state,mergedAt
{"mergedAt":"2026-09-07T05:34:34Z","state":"MERGED"}
```

**`feat/compat-1` IS DELETED, locally and on origin.** A later session that goes looking for it
has found this line, not a lost branch. Merged as a MERGE COMMIT rather than a squash, on Reyner's
instruction, because the six commits are individually revertable and each engine commit's message
carries the red run that preceded it - a squash would have collapsed all six into one message and
made `git revert` all-or-nothing.

| | landed as |
|---|---|
| 0 | `10fdd1d` the prompt file alone |
| 1 | `7f1550e` the rulings land in the ledger, nothing else changes |
| 2 | `72c0868` `lib/compat/branchRelations.js` - cross-chart 六合 / 冲 / 害 / 刑 (P2 facts) |
| 3 | `516704e` `lib/compat/complementarity.js` - cross-chart element complementarity (P3 facts) |
| 4 | `3eb346b` `docs/engine/stem-combinations.{md,json}` + `lib/compat/stemRelation.js` - Day Master pair, sourced 五合 (P1 facts) |
| + | `8db0f24` the three gaps tranche 1 found, listed below |

**`docs/prompts/W-compat-1.md` is the prompt; the three rulings of 2026-09-07 are verbatim there
and in `PROGRESS.md`'s `RULED 2026-09-07`** (A cross-chart branch relations, B sourced 天干五合 as
detection + metadata, C email identity).

**MERGED IS NOT SHIPPED, AND THIS HEADING SAYS SO ON PURPOSE.** Everything in tranche 1 is engine
facts with no reader-facing surface, so nothing a user can see changed when `db9e74c` landed. Do
not read "MERGED" here as "compat is live" - `compat` is still absent from `SELLABLE_SKUS` and its
checkout still 400s. What DID change is that compat now GATES LAUNCH (ruled 2026-09-07, superseding
the 2026-08-19 LAUNCH SCOPE below), so the remaining critical path runs through prompt X.

**NOTHING IN PROMPT W REACHES A READER, WHICH IS STILL TRUE AFTER THE MERGE.** No UI, no route, no migration, no pricing change (`compat`
stays absent from `SELLABLE_SKUS`), no `STAGE6_VERSION` bump, no Indonesian strings, and no
interpretation strings of any kind in `lib/compat/`. It was not shippable on its own and was not
meant to be; merging it did not change that.

**WHAT TRANCHE 2 (PROMPT X) IS OWED, AND BY WHOM:**

| Owed | Owner |
|---|---|
| P4/P5 deterministic rules - not yet written, so they are out of prompt W | Cowork drafts, Reyner rules |
| `/privasi` wording, and whether the Rp 19.000 checkout gains an email field | **Reyner** - ruling C is about the COMPAT checkout only |
| Second-person input, P0 comparison card, email checkout, relational renderer prompt + Stage 6 | Claude Code, **prompt X-b, not written** |
| **SEVEN INDONESIAN STRINGS, unruled 2026-09-07.** Three P4 badge names (`p4_matching`, `p4_related`, `p4_contrasting`) and four P5 quadrant labels (`p5_q1`..`p5_q4`). They live as `@@UNRULED@@` slots in `docs/product/compat-p4-p5-rules.md`; **nothing in `lib/compat/` carries a placeholder**, because the engine emits ids and the content layer holds the words. `scripts/check-unruled-copy.mjs` refuses a production build while any placeholder is live in `lib/site/copy.js` - these are NOT there yet and will not be caught by it until X-b puts them on a surface | **Reyner** |
| **SPOUSE-STAR SOURCES.** Ruled a high-value v1 candidate 2026-09-07 and still unsourced. Two authorities needed, the same bar as 天干五合. Joey Yap HYDB was checked 2026-09-07 and does NOT state it, so this needs two sources FOUND, not one confirmation added | Cowork |
| **THE P5 V6 RULING.** The two base-rate runs (`docs/qa/2026-09-07-compat-base-rates.md`) put six rule sets on one sample and refuted the first run's own suggested fix: tightening 2.2.a does not rescue it. **This is a product decision on what the four quadrants should mean, and it is its own PR** - amend `docs/product/compat-p4-p5-rules.md`, change `pullFit.js` red-first, then re-run `compat-base-rates.mjs` once as verification and append it as run 3. **No rule change rode in X-b1** | **Reyner** |
| **THE EMAIL SENDER.** Ruling C stores an email at compat checkout and **Katon has no sender**. v1 shows the report link on screen after payment and the email is the recovery record. Whether anything is ever sent, and by what, is X-b3's decision | **Reyner** |
| **`compat_invoice_desc`.** The Xendit statement line for compat. Rule 20 makes a statement line chrome, so it is Reyner's. It is live as `@@UNRULED@@` and a production build REFUSES while it is | **Reyner** |
| **X-b2 (prose) and X-b3 (surface)**, outlined at the end of `X-compat-2b1.md`. **X-b2 is unblocked by this prompt** - `GET /api/pair/[id]` is the seam it hangs the renderer off | Cowork to write |
| **X-b3 MUST SET THE COMPAT REDIRECT URLS.** A compat checkout currently sets NEITHER `successRedirectUrl` NOR `failureRedirectUrl`, so a buyer's last screen would be Xendit's. `readingUrl` builds `/r/<token>` and a PAIR id there is a reading URL for a non-reading; the right destination is the report page, which does not exist and whose route name is Reyner's. Accepted only because no reader can reach a compat checkout yet | Claude Code, prompt X-b3 |
| **MIGRATION `0010_pair.sql` APPLIED BY HAND.** Nothing in the repo can report whether it has run, so no commit can close this row - the same owner-held shape this file's design notes log for `0009` | **Reyner** |

**THREE GAPS FOUND WHILE BUILDING TRANCHE 1, recorded here because a gap named only
in a commit message is a gap nobody reads.** None is a defect in what landed; each is
something the next tranche either closes or deliberately leaves open.

1. **CROSS-CHART 三刑 IS NOT DETECTED, by specification rather than by omission.** A
   punishment trine needs three branches (寅巳申, 丑戌未) and every fact in
   `lib/compat/branchRelations.js` is pairwise - one branch from each chart, the pillar
   named - so `branchPunishments` is never handed more than two. Ruling A lists exactly
   六合 / 冲 / 害 / 刑, and the pairwise-detectable part of 刑 is self-punishment and the
   子卯 pair. Closing it needs a FACT SHAPE that names two pillars on one side, which is
   a design decision, not a bug fix. Owner: Cowork to spec, Reyner to rule whether it is
   worth a reader's attention at all.
2. **THE 13-CHART FIXTURE CANNOT REACH TWO COMPAT CASES**, so both are asserted with
   stipulated inputs and both say so in the spec: no two DISTINCT fixture charts share an
   absent element (`sameImbalance` uses charts 5 and 105, one birth date with and without
   a birth time), and no chart lacks enough elements to make a supplier come back null
   (asserted with an injected `{ favorable: ['Wood'] }`). A fixture gap, not a module gap.
   Owner: Claude Code, whenever the fixture grows for another reason.
3. **ALL FOUR P5 QUADRANTS ARE REACHABLE from real fixture pairs** - swept over every
   ordered pair of the 16 fixture charts on 2026-09-07, not inferred from four samples, and the
   sweep is in `tests/compat-pull-fit.spec.mjs`. **So there is no unreachable quadrant to
   record.** What IS unreachable is one CLAUSE: **2.2.a can never FAIL** from the fixture, because
   no chart lacks enough elements for both suppliers to come back null - which is gap 2 above,
   arriving one layer up. Its failing branch is asserted with a stipulated complementarity object
   and the spec says so where it is used. Owner: Claude Code, whenever the fixture grows.
4. **THE FIXTURE COVERS 7 OF 10 DAY MASTER STEMS** - 己, 丁 and 辛 never appear - so the
   100-ordering 五合 enumeration runs on synthetic `{ day: { stem } }` objects, with real
   charts exercising the genuine path separately. Owner: same as 2.

**THERE IS NO ORACLE FOR A PAIR CLAIM** (Joey's plotter is single-chart, probed 2026-08-12). Every
test in prompt W asserts internal consistency against the repo's locked tables and says so in its
header. A later session must not go looking for a pair oracle; ruling A settles what that costs.

## PROMPT W's PREDECESSOR IS MERGED, 2026-09-03. NOT CURRENT WORK ANY MORE.

**`fix/loading-transitions` MERGED as #91 on 2026-09-03.** So are #92, #93 and #94.

```
$ gh pr list --state open        # 2026-09-07
(empty)
$ gh pr view 91 --json state
{"state":"MERGED"}
```

**This heading read "PR #91, OPEN" for four days** and told the reader to run that exact
`gh pr view` command before trusting it. That is the eighth staleness of this pointer and the
design-note history at the top of this file carries it. No prompt file: Reyner ruled these directly
on 2026-09-02 and 2026-09-03 after walking the funnel himself.

| | |
|---|---|
| `0f26a11` | 1 - the anticipation takeover becomes a busy submit button |
| `307686c` | 2 - the prose skeleton cross-fades into the prose |
| `b708641` | 3 - `delay(2500)` deleted; submit-to-chart measured for the first time |

**TWO MEASUREMENTS BACK IT AND BOTH ARE ARTIFACTS**, not numbers in a commit message:
`docs/qa/2026-09-03-skeleton-to-prose-gap.md` and `docs/qa/2026-09-03-submit-to-chart.md`.

**IT IS WAITING ON REYNER, AND ON SOMETHING NO SESSION CAN DO.** The pane the agent browses in
freezes CSS animation timelines, so motion cannot be filmed or judged from it - every screenshot of
an in-flight state sits at its first frame. **The feel is a phone test on the Vercel preview.** A
session that finds this PR open should not assume it stalled.

### WHAT A LATER SESSION MUST NOT REDO

- **`delay(2500)` IS DELETED AND MUST NOT COME BACK AS A PROCESSING DELAY.** It was never work; two
  places in this repo say so in their own words and both are quoted in `b708641`. Reyner's ruling
  carries the replacement principle: if the result feels too immediate, the answer is a new
  anticipation treatment that EARNS the time, not a silent pause restored.
- **The skeleton-to-prose gap is DIAGNOSED.** The cause is `.k-rise`'s `fill: both`; the magnitude is
  one blank paint and ~100ms under half opacity, NOT the "close to a second" the brief assumed. Do
  not re-derive it.

## PROMPT R IS MERGED, 2026-08-31. NOT CURRENT WORK ANY MORE.

**`feat/card-a-4x5` MERGED as `c8cee93` (PR #85).** This heading read *"COMMITS 1 TO 4, ON A BRANCH"*
and *"`feat/card-a-4x5`, NOT MERGED"* for three days after it landed. It is corrected here with the
commit that ends it, per LIVE STATE's own rule that a not-yet-live warning must cite the thing that
closes it rather than leaving a reader to infer it.

**The check this section already named is what settles it, and it was run rather than remembered:**

```
$ git log --oneline main..feat/card-a-4x5     # ref main, f24242d
                                              # (empty: nothing on the branch is missing from main)
$ git log --oneline -1 c8cee93
c8cee93 Merge pull request #85 from Renge13/feat/card-a-4x5
```

**The line telling you to run it was there the whole time.** Nobody did, which is the durable point:
a pointer that carries its own verification command still goes stale, because the reader who trusts
the sentence never reaches the command. That is an argument for the command, not against it - it is
what made this a thirty-second correction instead of an investigation.

`docs/prompts/R-card-a-4x5.md` is the build and is on `main` at `473aeb5`. **The WHAT A LATER SESSION
MUST NOT REDO block below still stands** - merging the work did not settle the watermark offset any
less.

**CARD A IS THE EXPORT.** 1080x1350 (4:5), full-bleed, fully opaque, square corners, no mat, no rim,
no shadow, one export asset instead of two. `PADDING` held absolute at 72, so the inner measure went
763 -> 936: frame +19.1%, measure +22.7%.

| | |
|---|---|
| `892f5e0` | 1 - geometry; seven dying assertions, not the five R listed |
| `7100f1a` | 2 - recomposition; the real-fit gate and the watermark re-derived |
| `99482f2` | a defect from commit 1: the free reading page threw. See below |
| `a4dc5e7` | 3 - the export collapses to one asset; LIVE STATE corrected |
| *this one* | 4 - instruments, doc banners, this pointer |

**TWO MEASUREMENTS BACK IT AND BOTH ARE ARTIFACTS**, not numbers in a commit message:
`docs/qa/2026-08-31-head-fit.md` and `docs/qa/2026-08-31-watermark-fit.md`.

### WHAT A LATER SESSION MUST NOT REDO

- **The watermark offset is SETTLED at `{ top: -128, right: -144 }`.** Re-derived across all ten
  glyphs on the new frame; the legal band is `(-186, -128]` and the bound is set by 癸 alone, whose
  tag row moved 404 -> 529 in commit 2 itself. **Do not sweep it again.** If the crop reads weak on a
  real social surface after export validation, that is a UX observation for Reyner.
- **The kicker (14) and Aspek (25) gaps stay.** They are relative spacing between adjacent elements,
  the approved composition supplies no replacements, and inventing numbers there is composing.
- **`0.815` must not come back.** The measure is 936 because it is `1080 - 2 x 72`. It was previously
  the denominator of a ratio off a different card. Same number, no relationship.

### THE DEFECT WORTH READING, because the instrument that missed it is still the instrument

Commit 1 removed `CARD_A.canvas`. `components/Funnel.jsx`'s `<ScaledCard>` read `spec.canvas.w`
through an alias, so **no grep for `CARD_A.canvas` reached it**, and it threw on the FREE READING PAGE
while `npm test` reported 30/30 - that file is JSX behind `'use client'` and the suite cannot render
it. Fixed in `99482f2` by routing every consumer through `exportSize(spec)` and guarding the direct
read in `tests/card.spec.mjs`. **The lesson is that the prescribed grep could not have worked**, not
that someone forgot to run it.

### STILL OPEN AFTER R

- **`scripts/probe-card-export.mjs` REFUSES CARD A** and says so when run. Its Card A assertions test
  the field margin, the object inset and alpha corners - all statements about the mat. Card B is
  still probed. Reworking Card A's rows against the new model is real work and is not R's.
- **Export validation on the REAL social surfaces** is the next thing, and it is what the chain below
  says it is.

## SUPERSEDED - THE CURRENT WORK, 2026-08-29 - THE FLOOR'S HEADINGS, ON A BRANCH

**~~`fix/floor-heading-stutter`, head `d19ba69`, NOT MERGED.~~ IT LANDED - `d19ba69` IS ON `main`**
(`git merge-base --is-ancestor d19ba69 main` succeeds, ref `f24242d`). Corrected 2026-09-03 in the
same sweep as the R and Q headings; already under a SUPERSEDED banner, so nothing should have acted
on it, but a false fact left inside a history section is still a false fact.

**AND ITS PRESCRIBED CHECK NOW RETURNS THE WRONG ANSWER, which is the part worth keeping.** The line
said to run `git log --oneline main..` and treat an empty result as "landed". Run today it returns
**three commits** - `e08f1bc`, `768653f`, `ace69cc`, all card docs - because the local branch was
reused after its merge and drifted past it. A reader following the instruction would conclude the
floor work is unlanded. **`main..<branch>` answers "is this branch fully merged", not "did this
commit land"**; only the second question was ever being asked, and `git merge-base --is-ancestor
<sha> main` is what asks it. A branch name is not a stable handle for a commit.

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

## PROMPT Q IS MERGED, 2026-08-31. NOT CURRENT WORK ANY MORE.

**`docs/prompts/Q-demand-test.md` is RELEASED** (Reyner, 2026-08-29) and **`feat/demand-test` MERGED
as `622d926` (PR #84)**. Its commit 0 was the authorised `CLAUDE.md` edit - band 25-45k -> **25-49k**,
and rule 15 trading its stale status sentence for a pointer to the live register.

**FOUND WHILE CORRECTING THE R HEADING ABOVE, AND IT IS THE SAME DEFECT.** This heading said *"ALL
SIX COMMITS WRITTEN, NOT MERGED"* and *"unmerged and unreviewed"*, while the `Read, in order` block
forty lines up already said **"DONE. Merged as #84."** So the same file contradicted itself about the
same branch, which is the failure the 2026-08-29 entry recorded between this file and LIVE STATE -
one layer smaller, and inside a single document. Corrected in the same pass because a sweep that
fixes the heading it was sent to fix and walks past its neighbour is how the next one survives.

```
$ git log --oneline main..feat/demand-test    # ref main, f24242d
                                              # (empty)
$ git log --oneline -1 622d926
622d926 Merge pull request #84 from Renge13/feat/demand-test
```

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

### TWO THINGS WERE OWED BY REYNER. BOTH ARE NOW CLOSED - ONE FROM THE REPO, ONE ONLY FROM OUTSIDE IT.

**This heading said "ONE IS CLOSED; ONE CANNOT BE CLOSED FROM THE REPO" while item 2 beneath it read
CLOSED.** Same defect as the two it was written to correct, one line above its own subject. The true
half is kept because it is the useful half: item 1 was closable by a grep, item 2 never was, and that
difference is why one sat open for days.

1. **~~THE ELEVEN INDONESIAN STRINGS IN THE UPCOMING BLOCK.~~ CLOSED.** Reyner ruled all eleven
   (`docs/content/upcoming-copy-rulings.md`, plus its two amendments) and they are applied. The
   sentinels are gone:

   ```
   $ grep -n "@@UNRULED" lib/site/copy.js          # ref main, f24242d
   588:// `PENDING()` wraps an unruled value in `@@UNRULED: ...@@`, deliberately
   649:export const PENDING = (slot) => `@@UNRULED: ${slot}@@`;
   ```

   **Both hits are the MECHANISM, not a live sentinel** - the explanatory comment and the helper
   itself. That distinction is why the grep is quoted in full rather than as a count: a bare
   `grep -c` returns `2` here and reads as two unruled slots. `PENDING` and
   `scripts/check-unruled-copy.mjs` stay on purpose, as the rulings file instructs - they are the
   gate for the next unruled string, not scaffolding for this one.

2. **~~THE MIGRATION.~~ CLOSED 2026-09-02 BY REYNER, ON THE PRODUCTION PROJECT.**
   `supabase/migrations/0009_demand_test.sql` was applied by hand in the Supabase SQL editor.

   **AND IT WAS VERIFIED BY A REAL SUBMIT, NOT BY THE TABLES EXISTING** - which is the whole reason
   this row could not be closed from the repo. He walked the funnel on production and watched the
   WRITE PATH run: `funnel_event` took `reading_created`, `offer_seen`, `mirror_served`,
   `upcoming_seen` and `interest_registered`, and `product_interest` stored a contact.

   **The distinction is the point and it is why this row was left open on 2026-09-03 rather than
   tidied away.** A migration file in the repo, a table present in the dashboard, and a schema that
   accepts the app's writes are three different claims, and only the third is what the demand test
   depends on. A session that had closed this on the file existing would have been right by accident;
   a session that closed it on the tables existing would still not have known whether
   `recordMirrorEvent` could write. Five event names and one contact row landing is the evidence.

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

## ~~THE DELETION PATH DOES NOT REACH A PAIR~~ CLOSED 2026-09-08 by `docs/ops/deletion.md`

**The procedure now covers `pair` rows, and that is what makes `privasi_second_person` true** - the
ruled string promising person B's birth data is deleted with the reading. Identification is the
`/kompatibilitas/<id>` link OR the stored email, because a front-door buyer has no reading link at
all; a birth date is explicitly NOT an identifier, since two people born the same day both match and
the asker has proved she is neither.

Two traps the SQL had to respect and both are written down: `funnel_event` rows are keyed by the PAIR
id (`recordEvent` is called with it at checkout) and no cascade removes them; and
`pair.a_reading_id` is a foreign key, so deleting a reading a pair points at is refused until the
pair goes first or the reference is nulled.

**Still true, and not a defect this closes:** there is no deletion CODE for any table, by design -
it is a manual procedure with a 14-working-day commitment. What was broken was that the procedure did
not know the `pair` table existed.

## SUPERSEDED - THE DELETION PATH DOES NOT REACH A PAIR - OPEN, AND OWNED BY REYNER, 2026-09-08

**Asked and answered on 2026-09-08. Recorded here because it is a DISCLOSURE defect, not a bug: the
code is doing what it always did and the page now describes it wrongly.**

**THERE IS NO DELETION CODE AT ALL, for any table.** Deletion is a manual request:

    $ ls scripts/ | grep -iE 'delete|erase|gdpr|purge'   -> nothing
    $ grep -rniE 'delete from|\.delete\(' lib/ app/api/ supabase/migrations/
        -> only 0008_rate_limit.sql's window sweep, and Map#delete in unrelated code

That was fine while every request could be located, and `/privasi` says how:
*"Sertakan tautan bacaanmu, karena Katon tidak memakai akun dan tautan itulah satu-satunya cara kami
menemukan datamu."* **Include your reading link, because it is the only way we can find your data.**

**THAT SENTENCE IS NOW FALSE IN TWO DIRECTIONS**, both created by X-b3 shipping the compat surface:

1. **A compat buyer's data is not under a reading link.** It is a `pair` row, a different table
   (`supabase/migrations/0010_pair.sql`), found by a `/kompatibilitas/<id>` link. A reader who
   follows the instruction exactly hands over something that does not locate her record.
2. **She may have no reading link to send.** Mirror and Compatibility are two front-door paths and
   neither is a prerequisite for the other (ruled 2026-09-07), so a buyer who arrived straight at
   `/kompatibilitas` has no mirror reading at all.

**AND THE THIRD PERSON HAS NO PATH AT ALL.** `pair.b_birth_date` and `b_birth_time` are person B's,
and B never visited the site, has no link, and does not know the row exists. `/privasi` addresses
"kamu" throughout, which is A. This is not solvable by a copy change alone and is the reason it is
recorded as a ruling rather than as a wording fix.

**WHAT WOULD CLOSE IT.** Three parts, and only the first two are code:
  1. The instruction says which link to send - reading OR compat - so a request can be located.
  2. A manual deletion, when one arrives, deletes the `pair` row and not only the `reading` row.
     Today nothing written down says the second table exists, so a careful person doing it by hand
     would miss it.
  3. **Reyner rules what B is owed**, if anything. The product model says B gets nothing; that is
     about what B RECEIVES and says nothing about B's data.

**NOT FIXED HERE, AND NOT DRAFTED.** Both parts that touch `/privasi` are user-facing Indonesian and
Reyner's alone (rule 20), and the two `privasi_*` slots already shipped as unruled placeholders in
the same PR - so the page he is about to rule is the page this belongs on.

## OWED ON THE n=20 RE-MEASURE, 2026-09-08

**One item, and it is OWED rather than deferred: it has a decider, a trigger and a shape.**

- **THE VERDICT CATEGORY BECOMES A REJECT FOR PAIRS.** Reyner's five patterns landed at
  `STAGE6_VERSION 1.22.0` at `flag` severity, which cannot fail a reading - deliberately, so the
  n=20 run measures them instead of being confounded by them.
  - **Decided on:** the n=20 per-pattern flag count. **The n=20 report MUST carry it**, broken out
    per pattern rather than pooled: a category count cannot tell you whether `cocok` is firing
    forty times and the other four never.
  - **Shape:** an isolated gate change with its own `STAGE6_VERSION` bump, carrying nothing else.
  - **Reyner rules it.** The patterns are Indonesian constructions (rule 20) and so is the question
    of which of them a reading may never contain.
  - **The known collision is already pinned rather than open:** `cocok` also means "suitable", and
    two ruled MIRROR strings use it that way (`bintang.華蓋.gift_seed`,
    `elemen_hilang.木.cost_seed`). Unreachable, because the check is pair-scoped - 240 fixture pair
    floors swept clean - and `tests/compat-stage6-pair.spec.mjs` holds both strings so widening the
    scope goes red first. **Escalating to reject does not touch that; widening the scope would.**

**AND TWO THINGS THE n=20 RUN IS NOT ALLOWED TO DO QUIETLY.** `style.tension_collapse` rejects
`tidak selaras` - "NOT in harmony", a sentence that names the friction - because it bans a TOKEN
where the defect is a CONSTRUCTION (`docs/qa/2026-09-08-compat-penutup-cause.md`). A negation
carve-out is Reyner's and is not taken. And the finding-shape fix in the same commit as the patterns
changes the regeneration DIRECTIVE for any pair carrying a pair finding, so the n=20 is not
comparable to the n=10 on regeneration behaviour and must say so.

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

## LAUNCH SCOPE, ruled 2026-08-19 by Reyner — **THE COMPAT CLAUSE IS SUPERSEDED 2026-09-07**

> **LAUNCH SCOPE, Reyner 2026-09-07: promotion happens when the MVP is ready END TO END, compat
> included.**

**COMPAT NOW GATES LAUNCH.** The 2026-08-19 reasoning below is kept rather than deleted: it is the
record of why compat was parked for nineteen days, and everything in this section that is NOT about
compat - the 10% floor rate no longer being a launch blocker, precondition 3's pooled form, the
n-renders harness - is untouched and still live. Read the sentence directly below as history.

**Compatibility does NOT gate launch.** ~~(2026-08-19. Superseded 2026-09-07.)~~ Live = the free full mirror served from the new pipeline, plus
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
