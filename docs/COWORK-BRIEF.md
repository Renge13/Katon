<!--
STATUS: LIVE. The entry point for a new Cowork (Claude chat) session on Katon. Created 2026-08-01.

WHY THIS FILE EXISTS SEPARATELY FROM NEXT.md:
  NEXT.md briefs CLAUDE CODE, the builder. This file briefs COWORK, the thinking partner.
  Different jobs, different context. Do not merge them.

DESIGN NOTE — the trap this file must avoid:
  `docs/NEXT.md` went stale twice by duplicating the task list from the prompt it pointed at.
  This file must not repeat that. It carries ONLY what lives nowhere else: how to work with Reyner,
  the error-calibration record, and the open decisions. It NEVER restates engine state, measurements,
  or locked rules. Those live in CLAUDE.md and PROGRESS.md and those files win.
-->

# Katon — Cowork session brief

Paste-at-the-top prompt for a new session is at the bottom of this file. Read the rest first.

---

## 1. READ THESE, IN THIS ORDER. THE REPO WINS.

1. `../CLAUDE.md` — 25 locked rules. It says "this file wins" and it means it.
2. `PROGRESS.md` — the ledger. `MEASUREMENTS` holds every current number, `RESOLVED` lists what to
   stop reopening, `SUPERSEDED` wins any conflict.
3. `NEXT.md` — what Claude Code is building right now.
4. This file.

**Do not brief yourself from memory or from a summary.** The single most expensive error class in this
project has been carrying a dead decision forward. Two examples, both real:

- The "old friend" voice survived in my working memory for a whole session after Reyner had killed it,
  and I invented a "they coexist" reconciliation that appears in no document.
- `CLAUDE.md` itself was, until 2026-08-01, telling every Claude Code session **"NO AI/LLM AT RUNTIME"**,
  a Rp 49.000 paid domain tier, and the casual voice. All three were reversed in reality. Every session
  opened by reading the opposite of the truth.

If your recollection and the repo disagree, **the repo is right and you are wrong.** Say so out loud
rather than reconciling silently.

---

## 2. THE STALE MIRROR — `D:\Work\Katon assets\Katon md\`

**Do not read anything from that folder.** It is a pre-repo snapshot and it is actively wrong:

- `KATON-glossary-naming.md` still lists the **rejected** Aspek names — Setara, Karya, Pijar, Peluang.
  The live locked names are Pendamping, Perajin, Pemijar, Peraih.
- Its `PROGRESS.md` has **no MEASUREMENTS, DECIDED or RESOLVED sections at all** — the three sections
  that carry every current number and every settled decision.
- Ten of its twelve other files are byte-identical duplicates of repo files, so it offers nothing.

**Verified 2026-08-01 by hashing every mirror file against `git HEAD`**, which is the only clean
baseline. Result: exactly one true orphan, `solar-term-oracle-diff.mjs` — and the rescue of it was
**REVERTED 2026-08-02**: `PROGRESS.md` RESOLVED had already ruled that file deliberately deleted
(`tests/solar-terms.spec.ts` supersedes it; two copies of one oracle is the documented bug). See
error 12 below. **Net content value of the mirror: zero.** Everything else was either byte-identical
to a repo file, or an older version where the repo copy is newer (`glossary-naming.md`,
`PROGRESS.md` — the two actively-wrong ones named above).

The real problem was not missing files, it was **31 dangling `KATON-*` cross-references across 10 repo
docs**, all now rewritten to repo-relative paths. Those pointers made present files look absent when
followed — which is how `product/compatibility-reading-spec.md` got misdiagnosed as missing during this
very cleanup. Every pointer in `docs/` now resolves. If you add a cross-reference, use a repo-relative
path and verify it resolves.

Reyner has not yet deleted the mirror. Until he does, treat a path containing `Katon assets\Katon md`
as a red flag, not a source. If Reyner attaches a file from there, say it is from the stale mirror and
name the repo equivalent before using it.

---

## 3. HOW REYNER WANTS THIS DONE

His standing instruction, near-verbatim and unchanged across the whole project:

> "Be my challenge-forward advisor as usual: push on assumptions, terse and direct, copy-pasteable
> Claude Code prompts and before/after comparisons rather than concepts."

And: **"Always put your question to the quality of the output."** When asking him to decide, frame the
choice in terms of what the reader experiences, not what is easier to build.

What that means concretely:

- **Push back before agreeing.** He has reversed his own decisions repeatedly when given a reason
  (the mirror-gate, CR-5, the card-first reset). Compliance is not useful to him.
- **Ship artifacts, not concepts.** A copy-pasteable prompt file beats a description of one. He builds
  through Claude Code, so the deliverable is usually a `docs/prompts/*.md` handover.
- **Do not deliver raw JSON as a review artifact.** He said so directly: *"I saw the JSON but I'm not
  sure what I suppose to write?"* Give him a markdown review table with a column to fill in.
- **He is the SOLE authority on Indonesian register.** Propose wording, flag it `[REYNER]`, never
  auto-decide. This is CLAUDE.md rule 20 and a repo convention.
- **Be fast.** He has called out slowness twice. Read the two or three files you actually need, not
  everything. Do not run exploratory sweeps when a targeted check answers the question.

### The topology, so you do not do the wrong job

| Who | Role |
|---|---|
| **Cowork (you)** | thinking partner, spec author, oracle-driver, verifier. **Writes prompts and docs. Does not write engine code, and does not commit.** |
| **Reyner** | decides, and is the courier: he pastes prompts from you to Code. Nothing reaches Code except through him. |
| **Claude Code** | the builder. **Holds the repo and push access** — every commit is Code's. Reads `NEXT.md` via `/next`, implements, pushes back. |
| **Gemini (AI Studio)** | the runtime renderer. Prompt is `content/renderer-prompt.txt`. |

Two consequences worth stating because they are easy to forget mid-flow. **A prompt is a deliverable,
not a description** — Reyner pastes it verbatim, so anything you leave implicit is lost in transit.
And **you cannot see the result of your own instruction** unless Reyner brings it back, which is why
a prompt names the check Code should run rather than trusting Code to pick one.

Claude Code is a good reviewer and has caught real spec errors. When it pushes back, **assume it is
right until you have checked.** It has been right every time so far.

### Working-style rules. 1-5 Reyner-ratified 2026-08-11. 6-8 added 2026-08-13. 9 added 2026-08-31. THE FOLD IS COMPLETE, AND IT COVERS 1-9.

**These are rules, not history.** 1 to 5 were ratified in a Cowork session and then lived only in that
session's handover file, which no Claude Code session can read — and the git rule below was then broken
by a session that had no way to know it existed. That is error 20's real cause and it is written up
under the ledger. **A rule not in the repo is not a rule** — which is now rule 8, generalised, so the
same parking cannot happen twice.

**CLOSED 2026-08-13.** The first fold (08-12) moved five rules across but flattened three of them:
rule 3 carried only the DATE check and dropped the mechanism-read and same-day-paired-runs checks,
and rule 4 carried the git prohibition without the write/review/commit division that explains it.
Reyner pasted the handover's remaining text this session — Claude Code cannot read the Claude project
— and rules 3 and 4 below are now the full versions. **Nothing from that handover is outstanding, and
error 20's gap is closed at the source rather than at the symptom.**

1. **EXEC SUMMARY FIRST, and it must be readable cold.** Open every substantial reply with the
   summary, not the reasoning that produced it. Gloss every piece of jargon on first use — engine
   field names, gate check names, hanzi, statistics. And **split the actions explicitly: what REYNER
   must decide or do, versus what CLAUDE CODE will build.** He is reading to find his own next move;
   a summary that mixes the two makes him extract it himself.
2. **Do everything you can do yourself. Ask only for PERMISSION, never for legwork.** Read the files,
   run the checks, plot the oracle charts, write the prompt. The only things worth interrupting him
   for are a register call (his, exclusively), a product decision, and permission to proceed with
   something irreversible. "Can you check X for me" is a question this brief exists to make
   unnecessary.
3. **EVERY CLAIM CARRIES ITS CHECK. Three kinds, three checks, and each one has an error behind it.**

   | Claim about | Verified with | Error it comes from |
   |---|---|---|
   | A DATE — when a commit landed, when a decision was made, when a measurement was taken | `git log --format="%h a:%ad c:%cd %s" --date=iso`. **Never the wall clock**, which describes the session and not the work. This chat spans days | **18**, which nearly propagated a wrong date into three files, each then "evidence" for the next |
   | A MECHANISM — what a component does, where a value lives, what a prompt says | **A READ OF THE ACTUAL FILE**, in this session, before writing the claim down. Not the architecture, not the spec, not a summary | **19**, where "the renderer follows JSON order" was written against a prompt section headed ARRANGEMENT IS FREE that says the opposite. Also 9, 15, 17 |
   | A HARNESS COMPARISON — arm A against arm B | **SAME-DAY PAIRED RUNS ONLY.** Both arms in one session, back to back, one variable between them. A batch compared against a number from another day is not a comparison | The extra-binomial variance recorded in PROGRESS: two identical batches once differed by 10.8 points on shipped, wider than the single-batch CI |

   The half-true form is the dangerous one. Error 19's first clause was correct, which is what carried
   the false second clause through.
4. **COWORK WRITES DOCS TO DISK UNCOMMITTED. CODE REVIEWS THEM AGAINST THE REPO AND COMMITS.**
   That is the whole division, and it is why the git rule is not merely a caution:

   **NEVER WRITE TO THE REPO WHILE A CODE SESSION IS MID-BUILD. File READS are fine; GIT COMMANDS ARE
   NOT.** Device git leaves an `index.lock` that the bridge cannot delete, and it blocks the builder's
   working tree until someone clears it by hand. This is the topology table above enforced from the
   other side: Cowork gains nothing from running git that a prompt to Claude Code would not also
   achieve, and the downside is that the builder stops. Error 20.

   The division is not bureaucracy — it is the review step. A doc Cowork writes has had no second
   reader; Code reads it against the code it describes, and has caught real errors that way (the
   ledger is mostly those). Writing the file and committing it in one motion removes the only check
   Cowork's own output ever gets.
5. **THE REGISTER FLOW, in order, and no step may be skipped or reordered:**

   | # | Who | Does what |
   |---|---|---|
   | 1 | Cowork | **proposes** wording. Never decides it. |
   | 2 | Reyner | **rewrites** it. His text is the text; this is CLAUDE.md rule 20. |
   | 3 | Cowork | **sweeps his rewrite against the ban list ONLY** — `lib/validate/blocklist.json`, banned typography, the slang list. Mechanical checks, nothing else. A gate hit is reported with the pattern that fired and the minimum bend that clears it, and the bend is his to accept. **Register is not re-opened at this step.** |
   | 4 | Cowork | writes the strings into a **rulings file** in `docs/content/`, on `main`, alone, before the PR that applies them. Decision state never lives on the branch it rules on (the #28 precedent). |
   | 5 | Claude Code | applies them **VERBATIM**, via `scripts/apply-rulings.mjs` with an `--expect` count. |

   The reason step 3 is fenced so narrowly: a sweep that also "improves" a phrase is Cowork deciding
   register with extra steps, and it is unreviewable because his text and the edit arrive together.

6. **VERIFY WHAT SHIPS BEFORE ADVISING ON THE PRODUCT. `CLAUDE.md` describes the TARGET; the code
   describes REALITY; they diverge.** Added 2026-08-13 after a session argued a business-model
   question for two rounds against a model that was already deployed. The answer is now one table:
   **`PROGRESS.md`, the LIVE STATE block at the very top.** Read it before any product argument, and
   if a claim in it disagrees with the code, the code wins and the block is the thing to fix.
   Corollary: a locked rule is not evidence about what a user experiences. Rule 20's one-voice
   requirement and rule 16's cache guarantee are both true and both describe surfaces that,
   as of 2026-08-13, no user has ever reached.

7. **A NUMBER ENTERING A DECISION TABLE CARRIES WHO GENERATED IT.** Revenue, signups, usage — if the
   answer is "us", it is a test result and it goes in the test column or nowhere. Error 23, where a
   self-purchase smoke test was scored as demand and pointed a model comparison at the wrong answer.
   A wrong fact in prose gets argued with; a wrong cell in a scoring table gets summed.

8. **RATIFY AND FOLD IN THE SAME TURN. THE HANDOVER FILE MAY CARRY SESSION STATE AND NOTHING ELSE.**
   This is error 20's durable lesson promoted to a rule, because the lesson is bigger than git.
   A rule agreed in a Cowork session and parked in `claude/KATON-session-state-*.md` — a file in the
   Claude project — **does not exist**, because `CLAUDE.md`, `docs/` and the locked tests are the only
   things a session reads. "Fold in at the next quiet moment" is how a rule dies; the five rules above
   sat under a header saying exactly that, and rule 4 was then broken by a session with no way to know
   it was a rule.

   The split, so it is operable rather than a sentiment:

   | Goes in the repo, same turn it is agreed | Stays in the Claude project |
   |---|---|
   | Anything phrased as always / never / must / the flow is | What I was mid-way through and where I stopped |
   | A decision, a ruling, a price, a name, a threshold | Which files I had open, what I was about to check next |
   | A working rule about how Cowork, Code and Reyner divide work | Draft text not yet proposed to Reyner |
   | A correction to something the repo currently asserts | Scratch reasoning, rejected options, chat context |

   **The test: could a Claude Code session break this by not knowing it?** If yes, it is a rule and it
   belongs in `docs/` or `CLAUDE.md` before the turn ends. If it only describes where one conversation
   got to, it is session state and it belongs in the handover, where going stale costs nothing.

9. **THE SPLIT: REYNER RULES UX, COWORK RULES TECHNICALITY.** (Reyner, 2026-08-31.) A choice a
   reader can SEE - wording, register, case, crop, hierarchy, what a card looks like in a feed - is
   his and must not be decided for him. A choice a reader cannot see - which command gates a build,
   which offset satisfies a ruled constraint, how an instrument is falsified, which assertion to
   rewrite - is Cowork's to settle and Code's to execute, and bringing it to him is the waste this
   rule was made to stop. **The test is not difficulty, it is visibility.** Rule 2 already said ask
   only for permission and never for legwork; this narrows what "permission" covers. **When a
   technical fact and a ruled UX decision collide, §3's other rule governs: surface once, state the
   consequence, preserve the ruling, adapt the implementation.**

### A RULED DECISION IS NOT REOPENED BY A TECHNICAL FACT (Reyner, 2026-08-29)

**Distinguish a ruled product or design decision from a technical implementation fact, and never let
the second silently overturn the first.**

When technical reality conflicts with a ruling: **surface the conflict once, state the
implementation consequence, and preserve the ruling** unless implementing it is genuinely impossible
or unsafe. Then adapt the implementation.

**An existing implementation constraint is not an argument for reversing a product decision.** The
code preferring the old shape is a cost, not a veto.

The worked example, from the day this was ruled:

| | |
|---|---|
| **Rule** | Card A is 1080x1350 |
| **Fact** | the capture code assumes 1080x1440, and four assertions in `tests/card.spec.mjs` encode the old geometry - one of them written specifically to make a 4:5 reversal fail |
| **Correct action** | adapt the capture, invert the assertion, record all three dates in its comment |
| **Wrong action** | reopen 1080x1350 because the current code prefers 1080x1440 |

**Surface it ONCE.** Raising the same constraint a second time, in new words, is reopening the
ruling by attrition. If it was answered, it is answered.

---

## 4. THE ERROR LEDGER — read this before you assert a BaZi fact

**Errors 1-23 are all mine.** Not listed to be self-flagellating; listed because
the pattern is predictive and knowing it changes what you do next. **Append here when a new one is
caught, and never trim the list — the pattern is the value, not the count.**
(Numbering corrected 2026-08-07: two appended rows reused 13 and 14, so the "fourteen" headline
undercounted a sixteen-row table — a counting error in the error ledger itself. The D2a pair is now
15 and 16; `CLAUDE.md` rule 20's cross-reference to "error 13" means the curly-quotes row, unchanged.)

**ROWS 24-34 ARE APPENDED UNATTRIBUTED, 2026-08-17. Reyner assigns them; nobody else.** They come
out of the 2026-08-14/15 cards session (`docs/handoff/2026-08-15-cards.md`, sections 5 and 5b) and
they break the "all of them were mine" invariant that held for the first twenty-three, which is
exactly why they cannot be folded in silently. Each row names **where** the error was found — a spec
section, or the build — because a location is a fact and an author is a judgement. Two of them (27,
28) were caught and fixed inside the same cycle; that loop worked and the rows are kept anyway,
because a caught error is still evidence about the pattern.

**What the eleven say as a group, which is the part worth reading.** Nine of the eleven are shapes
already in rows 1-23 arriving through a new door — the disproving evidence in hand (24, 30, 34), a
fact asserted where measuring was one call away (24, 26, 34), a prediction that tells the reader
what to expect and thereby what to disregard (24, 25). **The two genuinely new ones are 29 and 32**,
and they are the same shape as each other: *a check that cannot see the thing it is checking.* 29
froze a number that appears in prose as if it were the number in a comparison; 32 shipped a defect
past a full green suite because no test could observe the surface it broke. That shape has no row in
1-23 and it is the one to watch for next.

| # | Error | The pattern underneath |
|---|---|---|
| 1 | Named sxtwl as the calculator; no npm package exists | asserted an ecosystem fact without checking |
| 2 | Wrote timezone/IANA resolution into Prompt A, ranked tz-history as risk #1 | **my own passing test had already disproved it** and I did not notice |
| 3 | `子: 壬(100%)` hidden stem, should be 癸 | recalled a table instead of verifying; corrupted every Water god in six charts |
| 4 | Conflated 旺相休囚死 with 十二長生 | mixed two systems in one paragraph |
| 5 | Wrote "Expected: 0 hour-level" into Prompt B | contradicted data I had measured myself one message earlier |
| 6 | Predicted chart 1 would stay poor after sqrt | reasoned about a metric without checking what it was blind to |
| 7 | Listed 十二長生 as a next step in C6 | proposed work the data had already made unnecessary |
| 8 | Shipped 命宮 on n=1 | treated one data point on a multi-convention field as verified |
| 9 | D2 said the fact inventory was "already computed"; 5 of 8 badge anchors did not exist | asserted engine capability without grepping `lib/` |
| 10 | Added 華蓋 to the badge set; Joey's plotter never prints it | invented a mechanic and then looked for an oracle for it |
| 11 | Called two mirror files "orphans with no repo counterpart". **Both were already in the repo.** `KATON-master-prompt.md` was `content/renderer-prompt-notes.md`; the compat spec was already at `product/compatibility-reading-spec.md` | matched by FILENAME, then "confirmed" by a hash check I had **already invalidated by writing to the file first** |
| 12 | "Rescued" `solar-term-oracle-diff.mjs` from the mirror into `tests/tools/` — a file `PROGRESS.md` RESOLVED had already ruled deliberately deleted and not to be restored | verified the file WAS an orphan, never checked whether its absence was a DECISION. Same shape as 2/5/6: the disproving evidence was already in the ledger |
| 13 | CLAUDE.md rule 20 listed two "known violations" that were both FALSE (Sharecard em-dashes are all comments; the invoice description used a colon), and missed the one real violation (curly quotes, `Funnel.jsx:731`). Propagated into Prompt F unverified; caught by Claude Code | asserted a code fact from a doc without grepping the code — error 9's shape. A "known violation" note in a locked file must carry the grep that found it |
| 14 | Prompt H specced a slot-filling check ("block order matches JSON order AND importance non-monotonic") that is inert by construction — Stage 3 emits facts importance-sorted, so the two conditions are mutually exclusive. Caught by Claude Code, which implemented it as specced and pinned the sortedness in a test | specced a detector without checking what the upstream stage actually emits — asserting engine behavior from the spec instead of the code, error 9's shape again |
| 15 | D2a said 羊刃 and 空亡 "were already computed". **Neither existed anywhere in `lib/`.** | error 9 again, in the very document that corrected error 9. Fixed the five anchors I had checked and asserted the other two from memory of what the engine contained |
| 16 | D2a §1 reports the year-pillar alternative at 0/12, 0/12, 1/12. Two of the twelve charts (X2, X3) have year branch == day branch, so the conventions are the same computation there and cannot discriminate. True figures: **0/10, 0/10, 1/10** | quoted a discriminating-cases count against the full-sample denominator. Harmless here — stated correctly the ruling is stronger — but the same slip on a marginal result would manufacture significance |
| 17 | Prompt J task 2 said "Stage 3 carries `confidence` / `confidence_reasons` for solar-term-edge and 子-hour charts". It does not. `confidence` is `strength.ts` and measures a MARGINAL VERDICT (supportShare within 5 of a threshold, unrooted DM, a root pulled by 半合); the solar-term and 時辰 edge is `boundary_flag` in `pillars.ts`. Caught by Claude Code, which exposed both with the sources kept apart. Verified 08-07: `1989-02-04 04:00` is confidence-low with `boundary_flag` false, so a route built to the prompt would have softened the wrong charts | named the right RISK and the wrong FIELD. Error 9's shape once more: asserted where a value lives from memory of the architecture instead of grepping for it. `pillars.ts` even warns in a comment that its own either-or "cannot tell the two risks apart" |
| 18 | The 2026-08-10 QA-verdict session wrote that the 08-07 stamps on the rule-16 amendment note, the J-mirror-route header and the ledger-renumber note were wrong, and instructed every later session to "correct" them to 08-10. **The stamps were right.** `git log -6 --format="%h a:%ad c:%cd %s" --date=iso` puts `6ca09b6` and PRs #18-#20 at 2026-08-07 22:19-23:10 +0700, author and committer both, and `reports/mirror-qa-fresh-1996.md:5` independently says the reading was served on production 2026-08-07. Caught by Claude Code before the docs commit landed | applied the CURRENT session's wall clock to work done in an EARLIER one. The instruction was worse than the claim: it would have propagated the error into three more files, each of them then "evidence" for the next session. A date claim carries `git log`, never the clock — the same discipline CLAUDE.md already demands for a code fact |
| 19 | Prompt K's mechanism section asserted "Stage 3 emits facts importance-sorted and the renderer follows JSON order", and built the change's whole theory of action on the second clause. `docs/content/renderer-prompt.txt:22-26` is a section headed **ARRANGEMENT IS FREE** and says the opposite: "The order of facts[] in the input is NOT the order you must write. It is a ranking, not a sequence." The first clause is true, which is what made the second sound checked. Caught by Claude Code, which read the prompt file before editing | error 9's shape again: asserted a component's behavior from the architecture rather than from the file, and the file is a plain-text document that takes one minute to read. Half-true is the dangerous form — the true half carried the false half through |
| 20 | Ran a git command against the DEVICE REPO and left a `.git/index.lock` the bridge cannot delete, blocking the working tree until it was cleared by hand. Not a BaZi error and not a spec error - a ROLE error, which is why it belongs here anyway | the topology table in section 3 is the rule: **Cowork writes prompts and does not write engine code; Claude Code is the builder.** Operating the repo directly is the same boundary crossed from the other side. **CORRECTED 2026-08-12: this row said the failure was "foreseeable from the role split rather than prohibited outright". IT WAS PROHIBITED.** A Reyner-ratified rule already said so verbatim - see the correction note under the table - and it was invisible to every session that could only read the repo. The practical cost is asymmetric and that is still the argument: Cowork gains nothing from running git that a prompt to Claude Code would not also achieve, and a lock it cannot release stops the builder entirely |
| 21 | The tranche-2a prompt predicted commit 3 (element_dominant reading its own group) would move fact order on **8 of 13** charts, "because the fact finally carries an actionable and `hierarchy.actionability` stops being a promise it cannot pay". Since #34 actionability is **DECLARED, not inferred**: `actionabilityOf` reads `ACTIONABLE_KINDS[fact.provenance?.kind]` and nothing else (`lib/semantic/hierarchy.js:219-221`), `element_dominant: true` (`lib/semantic/facts.js:105`), and it pays 100 whether or not the prose exists. Measured on the commit itself (`ac24441`): **0 of 13** fact orders moved, importances byte-identical (41, 70, 64, 70, 41, 70, 61, 67 before and after); only the 8 cache keys moved, which is just the strings changing | errors 2/5/6 again - **the disproving evidence was in hand.** The prompt had read that exact block: the comment above `ACTIONABLE_KINDS` names the five tranche-1 `aspek` cells whose prose "still ships, it just no longer buys them rank", which is the same claim in the same file, and the prompt wrote the opposite anyway. **THE AGGRAVATING FACTOR, and why this is its own row rather than a footnote on 19:** the prediction also said *"Expected. NOT the re-coupling tripwire firing"* - it pre-authorised dismissing the very tripwire that would have caught it. A prediction that tells a reader what to DISREGARD must carry its grep. Being wrong costs a re-measurement; telling the builder to ignore a live alarm costs the alarm |
| 22 | The tranche-2b prompt told Code to bend a ruled string to satisfy `fact.relation_positions`, invoking **"THE SENTENCE BENDS, NOT THE CHECK"** (the `aspek.比肩` ruling, tranche 1). That ruling is for a string tripping a **LEGITIMATE** ban - `style.adverbial`, `style.hedging` - where an engine string carrying the banned form punishes the renderer for obedience. `fact.relation_positions` is a **known false positive with three prior fixes**, and round 3 explicitly refused to bend prose for it: `lib/validate/fact.js` calls the 2026-08-11 firing *"a HARD finding on ordinary Indonesian that says nothing about any pillar"*, and `7f289f0` says in capitals **THE PROSE IS NOT THE BUG AND IS NOT CHANGED**. Reversed 2026-08-12: the check was fixed and Reyner's words restored | **A RULING APPLIED OUTSIDE THE DOMAIN IT WAS RULED FOR.** Distinct from error 21, which was a fact left unchecked; this was a fact checked and then generalised past its scope. Same family - **the disproving evidence was in hand**, and here it was a comment in the very file the fix edits. The tell that should have stopped it: the ruling's own logic is "do not punish the renderer for obeying the prompt", which presupposes the check is RIGHT. Applied to a broken check it inverts into "punish the author for writing Indonesian". **AGGRAVATING, and the reason it is worth its own row: bending the glossary cannot fix the renderer's free prose.** The gate reads LLM output, the LLM writes `di kemudian hari` whenever it likes, and rule 15 puts it in that path by design. So the bend treated the only surface that was cheap to treat - 15 fixed strings - and left the real one exposed. A fix that cannot reach the general case is a symptom fix, and calling it a ruling made it look principled |
| 23 | The 2026-08-13 session scored a business-model comparison with a row reading **"Revenue to date: Rp 19.000 - it works"** against the alternative's "zero". That Rp 19.000 was **Reyner's own self-purchase test of the QRIS path** - the last step of the go-live ritual, n=1, his money through his own checkout. It is proof the MONEY PATH works: invoice created, QR scanned, webhook verified, `paid` flipped server-side. It is not one unit of demand. **Neither model has any market evidence**, and the honest row was "zero, zero" | **TREATED A SELF-TEST AS DEMAND EVIDENCE.** The number was real, the instrument was real, and the reading of it was still wrong: a payment-path smoke test measures the payment path. What makes this its own row rather than a footnote is WHERE it sat - **inside a comparison table built to decide a business model**, in the column that decides it, pointing at the wrong answer. A wrong fact in prose gets argued with; a wrong cell in a scoring table gets summed. **The tell that should have stopped it: the ledger itself records that purchase as a RITUAL STEP** (PROGRESS, THE INTERIM REGISTER - "Rp 19.000, own birthdate, own bank app"), so the disproving context was in the same file the table was built from. Errors 2/5/6/21/22 again: the evidence was in hand. **Rule: a revenue, signup or usage figure entering a decision table carries WHO GENERATED IT. If the answer is us, it is a test result, and it goes in the test column or nowhere** |
| 24 | **UNATTRIBUTED.** `card-polish-spec.md` §6.4 is headed *"Brass on text must be measured, not assumed"* and then asserts the outcome of the measurement it is ordering: brass *"should clear 4.5 comfortably"* on dark fields, with Taman named as the single risk. Measured, it failed on **five** of ten, three of them dark fields. Pale brass is a LIGHT metallic, so the brightest fields cannot carry it — Bambu's green and Matahari's orange fail alongside the light-field pair. Figures in `PROGRESS.md` MEASUREMENTS, 08-15 | **The disproving evidence was one function call away, in the paragraph that commissioned the call.** Errors 2/5/6/21/22's family. The aggravating half is the same as 21's: naming ONE risk tells the reader which four to stop looking at, so the prediction did not merely fail, it aimed attention away from where the failures were |
| 25 | **UNATTRIBUTED.** `card-polish-spec.md` §6.5 framed a feasibility question as a magnitude question — *"there may still be headroom, but the tripwire moves"*. The real answer was that **three badges stopped fitting at all**, on real glossary copy that was inside the ceiling | **A prompt that asks "how much did X move" pre-commits the reader to X still existing.** The question's shape carried a premise the measurement was supposed to be free to reject. Distinct from 24: nothing here was asserted, the assumption rode in the grammar |
| 26 | **UNATTRIBUTED.** `card-polish-spec.md` §6.8's table carried two hand-computed values that were wrong — accent 7.19 for 7.18, old brass 2.50 for 2.52. The section now says so itself | **Hand arithmetic where the function the tests read is one import away.** `CLAUDE.md`'s repo conventions already demand a code fact carry the command that produced it; a NUMBER is a code fact. Small, and listed because it recurred within the same session — see 34 |
| 27 | **UNATTRIBUTED.** `card-polish-spec.md` §2.6 contradicted itself: its opening said the watermark fill stays `accent` at the ruled 0.18 / 0.14, and a later paragraph still argued that *"the alpha drop from the ruled 18% to 11.5% is what actually lets the headline read over it"* and called it load-bearing. Flagged during implementation and fixed in the spec | **A revised section that keeps its old argument.** The correction landed in the paragraph that stated the value and not in the paragraph that justified it, so the doc read as a live disagreement with itself rather than as a settled ruling. **Caught and closed in the same cycle** |
| 28 | **UNATTRIBUTED.** `card-polish-spec.md` §3.5's predicate was inverted against its own examples: *"Suppress the deboss when `!inkIsDark(token)`"*, while the parenthetical named Taman, Permata and Embun — exactly the tokens where `inkIsDark` is **true**. The stated reason (a light field has no gradient for the dark half to sink into) matches the names, not the predicate. Implemented to the names; fixed in the spec after flagging | **The prose and the code line disagreed, and the prose was right.** Worth its own row because the resolution rule is not obvious: where a spec gives a predicate AND the set it is meant to select, the SET is the intent and the predicate is the typo. **Caught and closed in the same cycle** |
| 29 | **UNATTRIBUTED.** The 2026-08-15 ruling *"FREEZE THE FLOOR AT 3.31"* froze a **displayed** value rather than a measurement. 3.31 is the two-decimal presentation of 3.3075, rounded UP, so freezing the literal put the bar 0.0025 above 丙 Matahari — the token that DEFINES the floor — and the audit reported Matahari as failing its own floor. The constant is now computed from the frozen source hexes, with a test pinning `toFixed(2)` to `"3.31"` | **A number that appears in prose and a number that appears in a comparison are not the same object.** One of the two genuinely new shapes in this batch, and the general form is worse than the instance: any rounded figure quoted from a report becomes a false constant the moment it is used as a threshold. The fix is the pattern to copy — freeze the SOURCE, derive the number, and pin the presentation in a test |
| 30 | **UNATTRIBUTED.** `card-polish-spec.md` §1 cross-references "§5.4", which does not exist. The intended target is §6.5 | Minor, and kept because it is the cheapest possible instance of the family: **a pointer nobody followed.** A cross-reference is a claim about the document it sits in, and it is checkable by reading the table of contents |
| 31 | **UNATTRIBUTED (self-reported by Claude Code).** Built roughly a full pass of both cards from the design conversation `Katon Cards.dc.html` before `card-polish-spec.md` arrived, then reworked it. Cost a turn | **Did not ask whether a spec existed.** The failure is upstream of any fact: the source-of-truth chain was assumed rather than established, on a task where two candidate sources were both in the repo. Cheap here, and the same move on a locked file is error 12's shape |
| 32 | **UNATTRIBUTED (self-reported by Claude Code).** Introduced a **94px Card B overflow that no existing check could see.** Every test passed, the contrast audit passed, and the clipped text simply was not on the card. Fixed; the preview page now measures headroom per archetype after layout so it cannot recur silently | **A defect on a surface no instrument observed.** The second genuinely new shape in this batch, and the sibling of 29. A green suite is evidence about what the suite looks at, and `overflow: hidden` is the perfect crime: it removes the symptom along with the content. **The durable lesson is the fix, not the bug** — when a failure mode is invisible, the commit that repairs it must also add the eye that would have seen it |
| 33 | **UNATTRIBUTED (self-reported by Claude Code).** Wrote an export-probe assertion ("edge != field") that would have failed Card A **for being correct**, since Card A has no rim by ruling | **A check generalised past the case it was derived from.** Error 22's shape — a rule applied outside the domain it was ruled for — reached this time through a test rather than a ruling. A false alarm and a missed alarm cost differently, but both come from the same failure to ask which objects a check is about |
| 34 | **UNATTRIBUTED (self-reported by Claude Code).** Hand-wrote `10.03` for a `contrast()` value of `10.02` — **in the commit fixing error 26**, which is that exact defect | **The disproving evidence was not merely in hand, it was the subject of the commit.** Errors 2/5/6/21/22/24 again, at the shortest possible range. It says something the individual rows do not: knowing a pattern, and having just written it down, does not prevent it. Only reading the number out of the function does |
| 35 | **UNATTRIBUTED. Not a spec error and not anyone's claim — an EXTERNAL tool answering a request with less than was asked, silently.** Google Fonts' `text=` subsetter was asked for 65 glyphs and returned a subset declaring **63**, dropping 印 and 申. 申 is an EARTHLY BRANCH the card draws in a pillar cell, so the first build shipped a face that would render tofu on every 申 chart. Asked for on their own, both come back fine. Caught by comparing the server's declared `unicode-range` against the request instead of trusting the request | **THE SAME SHAPE AS AN AUDIT THAT PRINTS PASS ON A FAILING RUN** (the 2026-08-17 gate defect, two rows of this ledger's own subject matter apart). A component that silently returns less than it was asked for is indistinguishable from one that succeeded, unless something compares the answer to the question. **The generalisation is the value: whenever a boundary is crossed — a subsetter, a provider, a cache, a font service — the reply is DATA and must be checked against the request, never assumed to be the request fulfilled.** Recorded here rather than only in PROGRESS because it is a method lesson, not a measurement, and because the class it belongs to has now cost this project twice in one session |
| 36 | **COWORK (self-reported, 2026-08-18).** The gallery ruling classified 22 `style.hedging` findings as 10 perception / 5 world / 9 reader and **reported a count that contradicted its own section header** - the three classes sum to 24, the header says 22, and both numbers were in the same message. **The aggravating half: a first script in that same session printed 10/4/8, the correct split, and the second script's 24 was reported without reconciling the two.** Code reproduced 10/4/8 from the JSON before applying anything, which is the only reason the applied change was measured against the right denominator | **TWO NUMBERS PRODUCED IN ONE SESSION AND NEVER RECONCILED AGAINST EACH OTHER.** Errors 2/5/6/21/22/24/34 are all "the disproving evidence was in hand"; this is that family in its purest form, because the disproving evidence was **the session's own earlier output**. A second measurement that disagrees with the first is not a refinement, it is a defect in one of them, and shipping the later one because it is later is how a wrong denominator reaches a decision. **The rule: when two runs of your own disagree, neither is reportable until you know which is wrong.** |
| 37 | **COWORK (self-reported, 2026-08-18).** The counterfactual for the same ruling was to be scored at CLASS level (perception/world/reader), which would have over-credited the fix: a single finding can carry BOTH a false-positive `mungkin` and a correctly-fired `cenderung`, and suppressing the first does not stop that finding firing. Code scored it at FINDING level instead, which is the correct instrument, and separately excluded three of eight recoveries because they landed at attempt 2 - whose prompt carries `stricterDirective(attempt-1 findings)`, so changing attempt 1 changes attempt 2's generation and its pass cannot be assumed | **THE UNIT OF A COUNTERFACTUAL MUST BE THE UNIT THE GATE ACTS ON.** The gate rejects an ATTEMPT if any finding survives, so classes and tokens are the wrong granularity and only findings-per-attempt answers it. **The recorded result is a BAND, not a point: firm 19 -> 14 floors (48% -> 35%), upper bound 11 (28%).** The three excluded recoveries are the same conditioned-draws problem this ruling correctly raised about retry depth, arriving inside the ruling's own arithmetic - which is why it is worth a row rather than a footnote |

| 38 | **UNATTRIBUTED (self-reported by Claude Code, 2026-08-19).** The 08-17/18 gate fixes deleted `style.adverbial` and moved `mungkin` out of `blocklist.json` — a change to what Stage 6 REJECTS — and left `STAGE6_VERSION` at `1.9.0`. **Two materially different gates therefore both stamped `1.9.0`**, and the only thing separating them is file mtime. Caught while reconciling which of two probe artifacts belonged to which gate | **A CONSTANT WHOSE ONLY JOB IS PROVENANCE, LEFT STALE BY THE COMMIT IT EXISTS TO DESCRIBE.** `persistRendered` writes `stage6Version` onto every cached row deliberately — the version the reading ACTUALLY passed, not the version installed today — so leaving it stale removes the only handle on "which readings passed under the old rules". The cache happened to be clean (0 rows under either `1.9.0`), which is luck and not mitigation. **Same family as errors 32 and 35: a change that no instrument could see.** The fix is not the bump; the fix is that the rule now sits on the constant's docblock, in `blocklist.json#_rule`, and in CLAUDE.md's conventions — three places, because the person editing a regex does not open `lib/validate/index.js`, and a rule written only where the careful reader already is has not been written |

| 39 | **AN INSTANCE OF ROW 42 — read that one for the pattern.** **COWORK (2026-08-19). AN UNGREPPED PREMISE OVERRODE A CORRECT JUDGEMENT.** Code had shipped the brass-text fallback POOLED and argued for it. Cowork overrode that with *"Card A pays for Card B's finish"* — that 甲 丁 戊 壬 lost brass on the free card to solve a sheen problem the free card does not have — called Code's counter-argument one that "does not hold", and instructed the per-card split. **Card A draws no brass text at all.** All three roles reading `brassText` are Card B only, following from the 08-14 ruling that Card A carries NO FINISH, so the surface being "degraded" was never drawing the thing. Code implemented the instruction, found the premise false while writing the test meant to confirm it, said so, and rebuilt the argument | **THE SHAPE IS THE POINT, AND IT IS NOT "A WRONG FACT".** It is: **a confident premise about rendered output, never grepped, used to override a correct call — and the correction had to be carried by the side that was overruled.** CLAUDE.md already says a claim about the code without its grep is a memory rather than a fact; this was worse, because it was an inference from a COLOUR TABLE to a RENDERED SURFACE with both files open, and it arrived as an instruction rather than a question. One `grep -n "roleStyle('nameId'\|badgeLabelFoil\|pillarLabelDay"` settles it in a second. **The asymmetry is the cost:** overriding is cheap and verifying is cheap, but only one of them was done, and the session that had to spend the round discovering it was the one that had been right. **Nearest sibling is error 31** (Cowork's spec arriving after Code had built to the conversation) — same asymmetry, opposite direction. The split is KEPT, on a rebuilt argument: pooled was right by accident, per-card is right by construction, and a test now pins Card A's zero-brass fact so the guard cannot rot. The correction lives in the docblock, not only in a chat log |
| 40 | **COWORK (2026-08-19).** Called the 7.6s p50 render *"the biggest live product defect"* and *"now the biggest live product defect. SCOPE IT"*, ranking it above everything else in the round. **It is not live.** `/api/reading` imports `lib/content`, `lib/chart` and `lib/readingView` and no render function; the funnel's 2.5s pause is `Promise.all([season-check, delay(2500)])`, a designed beat and not a wait on work; the rendered path is `/api/mirror/[token]`, which 404s without `MIRROR_PREVIEW_TOKEN` — **unset even in `.env.local`** — and is linked from nowhere. Zero readers have ever waited on a render. Caught only because the instruction asked for the wait to be SCOPED, and scoping it meant reading the funnel | **ESCALATING A NON-LIVE COST MISALLOCATES THE SCARCE THING, WHICH IS ATTENTION** (Reyner's words, accepted in full). The measurement was real and useful — it is a genuine promotion cost and now sits in the register beside the floor rate — but "live defect" and "unpriced cost of a change nobody has made yet" compete for different budgets and rank against different alternatives. **Same family as error 36**, two rows up: a number produced correctly and then attached to the wrong claim. **The rule this yields: before ranking a defect by severity, establish that a user can reach it** — one grep for the route's own fence answers it, and the fence in this repo is deliberately a MISSING CAPABILITY rather than a flag precisely so that question has a cheap answer |

| 41 | **AN INSTANCE OF ROW 42 — read that one for the pattern.** **COWORK (2026-08-19).** Instructed *"Rename the branch to what it is"* **without checking for an open PR against it**, with PR #44 visible in the screenshot being worked from. Self-reported and reversed one round later: GitHub cannot change a PR's HEAD branch, so pushing under a new name means closing #44 and opening a new one. Code carried out the local half of the rename before the reversal arrived | **THE SAME UNCHECKED-PREMISE SHAPE AS ROW 39, one layer out: not a claim about the code, a claim about the REPOSITORY.** `gh pr view 44` answers it in one call. **And the reversal rested on a second unverified premise from the same message** — that renaming would cost *"its CI history and any review threads."* Measured 2026-08-19: PR #44 has **0 reviews, 1 comment, reviewDecision empty**. The thing the reversal protected is nearly empty, so both the instruction and its correction were argued without the one command that settles them. **The lesson is that it is ONE command for both**, which is what makes this cheap to have avoided rather than merely unlucky. **A third fact the same call surfaced, and the one that actually mattered:** the remote branch was **21 commits behind** local, holding only the 4-commit renderer track, so the pre-flight STOP in the push instruction fired on a commit list of 21 where 6 were expected. The name `feat/palace-domain-join` was ACCURATE for what had been pushed; it only becomes wrong after the push it was being renamed for. Recorded because "the branch is misnamed" and "the branch is unpushed" look identical from a screenshot and differ entirely in what to do about them |

| 42 | **COWORK (2026-08-19). THE PATTERN BEHIND 39 AND 41, AND IT SUPERSEDES FILING THEM SEPARATELY.** Four instances in ONE session, all the same shape: **a fact about the repository asserted from a PARTIAL ARTIFACT, treated as the whole record.** (a) a COLOUR TABLE read as a rendered surface — brass in `TEXT_ROLES` taken to mean brass on Card A, which draws none (row 39). (b) a SCREENSHOT read as branch state — a visible branch taken to mean a pushable branch, with PR #44 in the same image (row 41). (c) a LINE NUMBER read as a config section — *"`.git/config:43` still reads `merge = refs/heads/feat/palace-domain-join`"*; line 43 reads `feat/identity-first-order` and belongs to a different `[branch]` block, the correct mapping being line 46. The string was right, the section was not. (d) a PR's EXISTENCE read as a PR's CONTENTS — #44 assumed to carry the four tracks; it carried 4 commits of one, and the remote was 21 behind | **EVERY ONE WAS ONE COMMAND AWAY, AND FOR (b) AND (d) IT IS THE SAME COMMAND.** `gh pr view 44 --json commits,reviews` settles the original rename instruction, the reversal of it, AND the commit count in a single call. **THE RULE: before an instruction turns on a property of an artifact, run the command that reads that artifact WHOLE** — not the fragment already in view. A colour table is not a render, a screenshot is not a ref, a line is not a section, and a PR number is not a diff. **AND THE HARDEST HALF, which is why this is one row and not three:** the instruction AND its reversal were both wrong, in OPPOSITE directions, from the same missing call — first "rename it", then "do not rename it, you would lose the review history", when there were 0 reviews and the real reason was something neither instruction named. **A correction made without the check that was missing the first time is not a correction; it is a second guess with more confidence.** Rows 39 and 41 are instances of this row, not peers of it |

| 43 | **COWORK (2026-08-19). A READING FAILURE, NOT A VERIFICATION FAILURE, and the distinction is the whole row.** The command was RUN, and run correctly: `grep -rln "bazi-validation.fixture" tests/`. Its output was then restated in prose as *"returns nine specs"* and the nine were listed. It returns **13 files, eleven of them inside the 24 gates** — `stage3-facts.spec.mjs` and `time-convention.spec.ts` were dropped from the list, and the 13th, `tests/bazi-profile-experiment.mjs`, was run by no script at all. **The conclusion drawn from it was correct and in fact understated;** only the count was wrong | **THE FIFTH INSTANCE THIS SESSION, and the one that shows row 42 was filed one notch too narrow.** Row 42 said the failure was reading a PARTIAL artifact as the whole. This one had the whole artifact, on screen, correct — and lost accuracy in the retelling. The other four: 22-vs-24 hedging matches (row 36), `.git/config` line attribution, PR #44's contents, the colour table read as a rendered surface (row 39). **THE RULE: when a command answers the question, QUOTE ITS OUTPUT. Do not re-derive the answer in a sentence beside it.** A paraphrase of a command's output is a second measurement taken by hand, from memory, with none of the first one's guarantees — and it is the one that ends up in the doc. **Why it is cheap to obey:** the quote is shorter than the paraphrase. Every one of these five cost a round to unwind and none of them would have survived a paste |
| 44 | **COWORK (2026-08-31). A CORRECT QUALIFIER, ESTABLISHED AND THEN DROPPED — four instances in one session, and the first one is the tell.** `.git/HEAD` was read at session start and printed verbatim: `ref: refs/heads/feat/demand-test`. Four turns later the same session instructed Code to *"flip the two places that forbid it — `docs/NEXT.md:216` and `docs/handoff/2026-08-29-cowork-to-code.md:106`"*, as a statement about the repo. **`main`'s `NEXT.md` is an older 313-line copy that never mentions prompt R at all**; :216 exists only on the feature branch. Code caught it, and caught the consequence the instruction would have produced: adding a released-R paragraph to main's copy would have put two contradictory release states in one file, since that copy still says prompt Q is NOT RELEASED. The other three, same session, same shape: (a) instructed a **cherry-pick** of `e787bb0` to recover a QA doc — the commit is a Stage-6 gate change from a PR that was **closed, not merged**, so obeying it would have reinstated rule-23 enforcement on trunk; the doc's presence in the commit was read as the commit's contents. (b) built a blocklist sweep that compiled the `flags` field as a pattern and forced `'iu'` onto `style.code_leak.1` — whose own note records that case-insensitivity turns it into *"every word of two letters or more"* — and it reported **30 hits on all twelve candidate strings**; `lib/validate/style.js:63` is one line and says `new RegExp(entry.pattern, entry.flags || 'iu')`. (c) wrote into a RULED file that `npm run check:copy` *"must go from refusing a production build to passing"*; `check:copy` is the rule-20 typography walker and was **already green with no red state to leave**. The gate that refuses production is `check-unruled-copy.mjs --strict`. Code preserved the ruling, recorded both transitions, and correctly did not edit a ruled file to fix Cowork's error | **THE DISTINCTION FROM 42 AND 43, WHICH IS WHY THIS IS A PEER AND NOT AN INSTANCE.** Row 42 is a partial artifact read as the whole record. Row 43 is a whole artifact, correct on screen, lost in the retelling. **This is a qualifier that was correctly captured, correctly printed, and then decayed across the session** — so later claims inherited the authority of the early verified read without inheriting its scope. That is worse than never checking, because the check is in the transcript and reads as coverage. Instances (a) and (c) are the same failure aimed at a commit and at a script: **a name was read as a mechanism.** A path in a commit is not that commit's diff; a script's name is not what it gates; a colour table is not a render (row 39). **THE RULE, and it is one word longer than the habit it replaces: A REPO CLAIM CARRIES ITS REF.** `docs/NEXT.md:216` is not an address in this repository — `feat/demand-test:docs/NEXT.md:216` is. Three branches were live in this one session and the same path held different content on each. **AND THE HALF THAT MAKES IT NOT A COWORK ROW ONLY:** Claude Code made the identical error in the same session, self-reported — it landed `986c450` on `main`, ran the suite on `feat/demand-test`, and reported **35/35 green for a main-only change on a branch that did not contain the file**, which broke `check:qa` on trunk until `e7a0ae4`. Two different agents, one session, same shape, no shared cause but the repo's own branch topology. **So the countermeasure is not vigilance, it is notation:** every claim about a file states the ref it was read on, and a verification states the ref it ran on. Where those two differ, there is no evidence yet. **Cost: four rounds of Code's time, every one of them spent correcting an instruction rather than building.** The asymmetry of row 39 again — the side that was right paid for the side that was confident |
| 45 | **COWORK (2026-08-31). TWO MORE THE SAME DAY AS ROW 44, AND THE SECOND ONE HAPPENED WHILE WRITING ROW 44'S OWN CONCLUSION.** (a) **"Ships, therefore fits" is not an inference.** Ruling the `x 0.80` headline branch onto a real-fit gate, Cowork wrote that the gate would resolve statically because *"every single-word head already renders at full 139 against 763 today and ships, so at 936 they all fit by construction."* Code measured all ten in headless Chrome with the real Archivo face loaded: **戊 Gunung's `MOUNTAIN` measures 793.48px against the old 763 measure — it overflowed by 30.5px and was never reduced**, because the branch triggered on word COUNT and `MOUNTAIN` is one word. Meanwhile `MORNING` fit with 46px to spare and WAS reduced. **The proxy was backwards in both directions, and it is not even monotonic in width — `MOUNTAIN` is 8 characters, `MORNING` is 7.** With `overflow: hidden` on the object, 戊 has been losing the right edge of its headline **on the live free share card**, silently. The PAD ruling fixed it as a side effect; the ruling was made for 癸 Embun, and the chart it actually rescued was 戊 | **`overflow: hidden` MEANS SHIPPING IS NOT EVIDENCE OF FITTING — it removes the symptom along with the content.** This is **error 32's exact shape** (a defect on a surface no instrument observed) arriving as a PREMISE in a spec rather than as a bug in a build, which is worse: 32 shipped a defect, this one shipped a false construction-proof that a reader had no reason to re-measure. It is also **row 44's shape** — a name read as a mechanism, "ships" read as "fits". **The rule: a fit claim carries a measurement in the rendered face.** Not a character count, not a proxy, not the fact that nobody has complained. Code's measurement needed the real web font loaded to mean anything, and checked that it had loaded before trusting the numbers — that check is the reusable part |
| | **(b) RESTORED A CARRIER FILE THAT HAD ALREADY BEEN CONSUMED.** Cowork wrote `docs/handoff/2026-08-31-ledger-row-44.md` for Code to append and delete. Later, finding it absent from the working tree, Cowork concluded a branch operation had destroyed it — the failure mode the brief documents twice — and restored it from the Claude-project mirror, announcing the save. **It was absent because Code had appended row 44 and deleted the carrier, exactly as instructed.** The restore put a spent duplicate back on disk, which Code then had to flag and leave alone | **THE SAME ERROR AS 44, INSIDE THE TURN THAT FILED 44.** `[ -f ]` answered "is this file present" and was read as "was this file lost", when the question was whether it had LANDED — one `grep "^| 44 |" docs/COWORK-BRIEF.md` on the right ref settles it, and Cowork ran that grep only afterwards. **Error 34's shape** — the pattern was known, had just been written down, and did not prevent the instance. **The rule that generalises past carriers: a file's ABSENCE is not self-explaining. Before treating it as loss, check whether it is absence-by-completion** — a consumed carrier, a merged branch, a deleted-on-purpose artifact all look identical to a missing one. The mirror-everything habit is still right; announcing a rescue before checking what the absence meant is what was wrong |

### A CLASS, NOT AN INCIDENT: the instrument that describes itself instead of measuring

**Promoted from the rows on 2026-08-19, because it has now happened five times in three
different materials — code, an external service, and a guard written to catch it.** The rows
below stay where they are; this section is what they have in common, and it is predictive in a
way the individual rows are not.

**THE SHAPE.** An instrument is consulted, answers confidently, and what it actually reports is
its own declared intent rather than the state of the thing. It cannot fail loudly, because from
the outside a component that returns *less than it was asked for* is indistinguishable from one
that succeeded. The five:

| # | the instrument | what it reported | what was true |
|---|---|---|---|
| 1 | `TEXT_ROLES`, audited since it was written | every role's colour, cleanly | the table was **consumed by nothing** — the card set `color` once on its root. The audit read the intention and the card was never measured (fixed 2026-08-13) |
| 2 | `audit:card-contrast`, on Card B's sheen | `PASS`, exit 0 | *"UNDER AA IN THE CORNER"* sat twenty lines lower **in the same output**. The failures were computed and then dropped before the exit code (fixed 2026-08-17) |
| 3 | the accent and sheen exemption reports | the excused tokens as `clears` | they were failing at 3.68 and 3.61. The row was recorded inside the `!exempt` branch, so the exemption suppressed **the number it exists to keep visible** (`21d690a`, then again 2026-08-19) |
| 4 | Google Fonts' `text=` subsetter (row 35) | a subset, HTTP 200 | it declared **63 of the 65 glyphs requested**, dropping 申, which the card draws in a pillar cell |
| 5 | the orphan guard, `scripts/test-all.mjs` | `0 orphans` | the comment **naming the file the guard was built for** counted as a reference to it, so the guard was blinded by its own documentation (2026-08-19) |

**THE CHECK, and it is one sentence: compare the ANSWER to the QUESTION, never to itself.** Ask
what the instrument would print if the thing were broken, and if that is the same as what it
prints now, it is not an instrument. `domContrast.js`'s own header says the general form —
*"an assertion that reads the intent it is checking is not an assertion"* — and instance 1 is
that header's warning coming true in the file it warns in.

**A SIBLING TRAP, worth its own line because the fix is different.** #5 was first "verified" by a
run that began with `git stash` — which stashed **the guard along with the change under test**, so
the run exercised the previous version and reported a pass. **Any verification that stashes,
checks out, or reinstalls before running has to be asked whether it removed the instrument too.**
The cheap defence is to make the instrument runnable on its own in a second (`npm test -- --list`
now prints the orphan scan for exactly this reason); a guard nobody can exercise cheaply is a
guard nobody verifies.

### The correction to error 20, 2026-08-12. Read this one for WHERE the rule was, not for the lock.

The row originally said the git prohibition was "foreseeable rather than prohibited". It was
prohibited. Cowork's own session-state handover — a file in the Claude project,
`claude/KATON-session-state-2026-08-11.md`, under a header reading **"Working-style rules (fold into
COWORK-BRIEF section 3 at next quiet moment - Reyner ratified)"** — said verbatim:

> "Never write to the repo while a Code session is mid-build (file READS are fine; git commands are
> not - device git leaves index.lock the bridge cannot delete)."

**The grep that "found" the rule absent was correct and proves the real finding.** It searched `docs/`
and `CLAUDE.md`, and the rule is in neither, because it never got folded in. So a **Reyner-ratified
rule lived only where Claude Code cannot read it**, and the fold-in that its own header scheduled
never happened. The failure was not a missing rule; it was a rule parked outside the repo, and the
parking was the whole cause.

**That is the durable lesson, and it is bigger than git.** A rule ratified in a chat and stored in a
handover file does not exist. Only `CLAUDE.md`, `docs/` and the locked tests can constrain a session,
because they are the only things a session reads. "Fold in at the next quiet moment" is how a rule
dies: fold it into the repo in the SAME turn it is ratified, or accept that it is a preference nobody
will ever be bound by. **The five rules from that block are now in section 3, where they are readable.**

**AND THE FOLD ITSELF WAS PARTIAL FOR A DAY, which is the same failure one layer down.** The 08-12
pass moved five rule HEADINGS across and dropped detail from two of them: the mechanism-read check and
the same-day-paired-runs check fell out of rule 3, and rule 4 lost the write/review/commit division
that is the reason the git prohibition exists at all. Both were still only in the handover. Reyner
pasted the remainder on 2026-08-13 and section 3 now carries the full text. **A fold is done when the
repo says everything the handover said, not when the headings match** — and only the person holding
the handover can confirm that, because Claude Code cannot open it.

**Six of these (2, 5, 6, 21, 22, 23) are the same failure: I had the disproving evidence in hand and wrote the
claim anyway.** Before asserting anything, check whether something you already measured contradicts it.
**In 23 the evidence was in the very file the claim was built from** — the ledger records that
Rp 19.000 as a ritual step, in the section the table was summarising.

**Error 11 is the cheapest to prevent and the most embarrassing, so learn it once.** Two distinct
mistakes compounded:

1. **Compare by content, never by filename.** A name-similarity check produced a false positive and a
   false negative in the same pass.
2. **Hash against `git HEAD`, not the worktree.** I wrote a header into the file, *then* hashed it,
   found no match, and reported "content not in repo" — the mismatch was my own edit. A verification
   that your own action can invalidate is not a verification. `git status --porcelain` was the tell:
   the file showed ` M` (modified) not `??` (untracked), which means it was tracked all along.

```bash
# the check that is actually sound
git ls-tree -r HEAD --name-only | grep -E '\.(md|txt|json|mjs)$' > /tmp/f
: > /tmp/head.md5
while read f; do echo "$(git show "HEAD:$f" | md5sum | cut -d' ' -f1)  $f" >> /tmp/head.md5; done < /tmp/f
# then: md5sum < candidate | cut -d' ' -f1  |  grep -F in /tmp/head.md5
```

Real outcome once checked properly: **one** true orphan, not two.

**The operational rule that came out of this is CLAUDE.md rule 4, and it applies to you:**

> Never improvise a BaZi rule. **This applies to tables handed to you in a prompt as well.** Verify
> against a second source and stop if sources disagree. The `bazi-calculator` skill is NOT a valid
> source — its 藏干 table still carries the exact `子: 壬` error this repo corrected, and is very
> likely where that error came from.

The valid sources are: `docs/`, the repo's locked tests, and **Joey Yap's plotter as the oracle.**

### Driving Joey's plotter — the recipe, because it cost real time to find

`https://bazi.joeyyap.com` (Reyner's login persists). ASP.NET WebForms; the year and month selects have
`AutoPostBack`, which **silently clobbers day/hour/min if you set everything in one batch.** A plot that
returns the 1st of the month is this bug, not a calculation difference.

The working sequence, one `javascript_tool` call per step because each postback destroys page context:

```js
// 1. from a result page, get back to the form
document.getElementById('MainContent_btnPlot').click();
// 2. set year + month, fire the postback, and STOP. Do not set anything else yet.
const S=id=>document.getElementById('MainContent_'+id);
S('cbxYear').value='1989'; S('cbxMonth').value='3';
__doPostBack('ctl00$MainContent$cbxMonth','');
// 3. only now set the rest. txtName is REQUIRED or the form silently re-renders.
S('cbxDay').value='3'; S('ddlHour').value='0'; S('ddlMin').value='15';
S('ddlGender').value='1'; S('txtName').value='C6';
S('btnSubmit').click();
// 4. read: document.body.innerText, find 'Personal Chart Details'
```

Joey prints exactly **five** natal stars — 貴人, 文昌, 桃花, 驛馬, 孤辰 — plus 命宮 and 胎元. Anything
outside that set has no oracle and cannot be implemented. That is how error 10 happened.

**When you need a table verified, choose charts that exercise every row.** The 13-chart fixture cannot
reach a 辛 day master or a day branch in 巳酉丑, so four off-fixture charts were plotted purely to close
those rows. Partial coverage reported as verified is error 8 all over again.

---

## 5. WHAT IS SETTLED. Do not reopen without new evidence.

Detail is in `PROGRESS.md` under `RESOLVED` and `DECIDED`, and in `CLAUDE.md` rules 1 to 25. The
headlines, so you can recognise a re-litigation attempt:

- **Calculator, time convention, solar terms.** tyme4ts, 流派2, naive local wall-clock, no True Solar
  Time. Empirically settled, three oracles.
- **Strength engine.** Oracle 3 rho 0.874, Oracle 4 r 0.929. **No further calibration.** Thresholds
  stay at 40/60 until the pipeline exists.
- **命宮 is deliberately absent.** 胎元 stays.
- **Track A divergence from Joey is intended.** Do not chase 13/13.
- **Badge anchors** verified 60/60 with full row coverage. 華蓋 descoped.
- **Glossary** complete and Reyner-reviewed. 49 entries plus `salah_dikira` plus `arketipe_kandidat`.
- **Free mirror is ungated by design.** Paid is compatibility. The impulse card/PDF is an upsell
  offered after the reading, never a gate.
- **One composed voice everywhere.** No em-dash, no curly quotes, in user-facing strings only.

---

## 6. OPEN — what is actually next

Two lists. Keep them short; if either grows past a handful of items, something is being deferred that
should be decided.

**Session state as of 2026-08-07 (end of the long Cowork session), corrected 2026-08-13 where the
repo has since contradicted it. This block is a snapshot and ages; `PROGRESS.md` LIVE STATE is the
thing that is kept current.**

- Pipeline COMPLETE and measured honestly: gate 1.8.0, first-pass ~53%, shipped ~75%. Every
  gate false positive found and killed (the ledger rows tell the story). The house method, proven
  four times: READ THE FAILING OUTPUT before touching any lever; finding messages are evidence
  about the check, never about the text.
- `hedge_construction` pooled truth is 28.8% (25.9% was a low draw) and is the next quality
  target. The "bukan berarti" carve-out (Reyner ruling A) already landed in gate 1.8.0.
- ~~**Prompt J (mirror route) is WRITTEN and UNSTARTED**~~ — **SHIPPED 2026-08-07.** `/api/mirror`
  and `/api/mirror/[token]` exist, serve real Stage 3-6 readings, and are fenced behind
  `MIRROR_PREVIEW_TOKEN`. **It serves no user**; promotion is 2 of 4 preconditions and blocked.
  Corrected 2026-08-13 — this bullet said "unstarted" for six days after it merged, in the file a
  session reads to learn what is going on.
- Xendit: APPROVED, live keys swapped, **QRIS ACTIVATED 2026-08-11**, **first self-purchase reported
  by Reyner 2026-08-13** — the go-live ritual is complete. That Rp 19.000 is a payment-path smoke
  test and **not a unit of demand**; see error 23 before it enters any table. Full status:
  `PROGRESS.md`, THE INTERIM REGISTER.
- **Compat reading CONTENT session is QUEUED and is Cowork+Reyner work** (no code): author the
  ~5 element-relationship dynamics, the 4 affinity/fit quadrant blocks, the ~6 branch outcome
  blocks, and the P0 tease copy — the "low tens of cells" from the compat spec, every string
  register-reviewed. Can run any time; does not block on the mirror. This answers Reyner's
  standing question "when do we discuss what to write in the compatibility reading."
- ONE SESSION PER REPO at a time (two branch collisions taught this). Worktrees for true parallel.

**Blocked on Reyner. Nobody else can decide these.**

| Item | Where | Note |
|---|---|---|
| ~~Pick the 10 archetype names~~ | DONE 08-02 | `glossary.json` → `arketipe`, with EN pairs |
| ~~Write 30 fixed tags~~ | DONE 08-02 | `glossary.json` → `tag_arketipe`; `tags_en` pending, waits for card work |
| ~~Register-review the 刑 entry~~ | DONE 08-02 | Simpul confirmed, entry landed in `glossary.json` |
| Card visual system | `content/sharecard-spec.md` | Card B must differ **at thumbnail size**. Now also decides the ID vs EN name display variant (rule 23 amendment) |
| **Top up the Gemini billing** | PROGRESS, 2026-08-12 renderer pass | `RESOURCE_EXHAUSTED` - *"Your prepayment credits are depleted."* Every render now returns the module-assembly floor, so **promotion precondition 3 (Reyner's QA read) is blocked**, the palace-domain weave is measured but prose-unverified, and chart 5's `quietFloor` re-ask cannot be answered. The renderer pass itself is built and measured; only the read is blocked |
| ~~**The first real self-purchase**~~ | DONE, reported 2026-08-13 | Rp 19.000 through his own checkout. **The go-live ritual is complete** - verification 08-07, live keys swapped, QRIS activated 08-11, money path proven end to end. **It is a smoke test, n=1, and it is not demand** (error 23) |

**Engine and pipeline, in order.**

*(Corrected 2026-08-13: steps 1 to 3 are DONE — Stage 3 landed 08-02 in three phases, badge
frequencies were re-measured 08-02, and Stage 5 + Stage 6 are live at gate 1.9.0. The list is kept
whole because the ordering argument is still the record of why they were sequenced that way. The
live sequence is now the swap package: `PROGRESS.md`, THE DEFERRED REGISTER.)*

1. ~~**Stage 3**~~ **DONE 2026-08-02**, all three phases. `prompts/D2-stage3.md` + `prompts/D2a-stage3-anchors.md`.
2. **Re-measure badge frequencies** from the verified anchors. The 2.5-average and the Penolong 77%
   are both stale — measured with the descoped 華蓋 in the mix — and Stage 3's extremity term reads
   them, so a stale number silently mis-scores every badge.
3. **Stage 5** renderer wiring, then **Stage 6** post-validation. Separate prompts. Nothing reaches a
   user without passing Stage 6.
4. **Sharecard build.** Almost entirely engine-free; only the optional feed/drain line needs strength.
5. **Compatibility** — the v1 money engine. Price band to be **tested** at 25 to 45k, not assumed.

   **THE FLOW IS DECIDED. THIS ENTRY WAS STALE FOR TEN DAYS AND WAS BLOCKING A REAL DECISION.**
   Corrected 2026-08-12. It said `product/compatibility-reading-spec.md` was "still
   proposal-not-decision" and carried two open product questions. **That file's own header reads
   `RECONCILED 2026-08-02`** and lands every one of them:
   - **Funnel: tease-first, paywall between P0 and P1.** P0 free = both faces plus exactly ONE named
     relational fact with no explanation; the comparison card is shareable PRE-payment.
   - **(a) identity/login: DECIDED, and it went the way Cowork argued.** Account + email are created
     at the first compat CHECKOUT; **the mirror stays anonymous.** The brief recorded that as an
     unresolved "counter-position" for ten days after the spec had adopted it.
   - **(b) person-B consent: DECIDED — NO consent line.** P2's reframe copy carries the ethics.
   - **P6 Luck Pillar sync is DESCOPED from v1**, which also **retires this entry's own warning**
     that compat "may force female-set fixture charts earlier than planned". Luck-pillar direction is
     what depends on gender; with P6 out of v1, nothing in compat pulls the female-set charts
     forward.

   **WHAT IS ACTUALLY OPEN, and it is narrower and harder than a flow question:**
   - **THE CROSS-CHART ORACLE QUESTION.** Every relational fact needs a verification source, and the
     project's oracle is Joey's plotter, which is **single-chart**: it prints one person's pillars,
     five natal stars, 命宮 and 胎元. Nothing in the current oracle set can confirm a claim ABOUT A
     PAIR. Section 4's rule bites directly here — *anything outside what the oracle prints has no
     oracle and cannot be implemented* (that is how error 10 happened). So before compat can be
     specced as buildable, someone must answer: what verifies a cross-chart assertion? Note the spec
     mentions no oracle at all (`grep -n -i "oracle\|joey" docs/product/compatibility-reading-spec.md`
     → no match, 2026-08-12), so this is a gap in the spec, not a debate inside it.
   - **天干五合, the five stem combinations, are NOT IMPLEMENTED and are load-bearing for compat.**
     Two Day Masters combining is step 2 of the classical workflow the spec follows. Re-grepped
     2026-08-12 across `lib/ tests/ docs/`:
     `grep -rn "甲己\|乙庚\|丙辛\|丁壬\|戊癸" lib/ tests/ docs/` → **exactly one hit**,
     `docs/archive/calcdump-CxD.md:45`, and it is Indonesian prose in an archived dump
     (*"pasangan kombinasi batang klasik (戊癸合)"*), **not a table and not code.**
     **CAUTION ON THE SEARCH TERM:** `grep -rn "天干五合" lib/ tests/ docs/` returns **ZERO** — the
     phrase appears nowhere in the repo, so a session searching for it will wrongly conclude nothing
     exists to find. Search the five pairs, not the name. `lib/bazi/strength.ts` implements BRANCH
     combinations (三合 / 半合) and nothing implements stem combination.
     Rule 4 applies with full force: do not recall this table, and do not accept it from a prompt.
6. Rate limiting, and remove the `NEXT_PUBLIC_FREE_FULL_READING` flag.

---

## 7. THE PASTE-AT-THE-TOP PROMPT

Copy everything in the block into the first message of a new Cowork session.

```
Katon session. Repo is D:\claude-projects\katon.

Read these before responding, in order, and brief yourself only from them:
  1. CLAUDE.md              — 25 locked rules, it wins over anything you remember
  2. docs/PROGRESS.md       — LIVE STATE first, then MEASUREMENTS, RESOLVED, DECIDED, SUPERSEDED
  3. docs/NEXT.md           — what Claude Code is building
  4. docs/COWORK-BRIEF.md   — how I work, the error ledger, what is open

Before advising on the product, verify what actually ships. CLAUDE.md describes the target;
the code describes reality; they diverge. PROGRESS.md's LIVE STATE block is the one table that
answers "what does a real user get today", and it is the first thing to read.

Do NOT read anything in D:\Work\Katon assets\Katon md — it is a stale mirror with rejected
Aspek names still in it. Everything worth keeping was rescued into the repo.

Be my challenge-forward advisor as usual: push on assumptions, terse and direct, copy-pasteable
Claude Code prompts and before/after comparisons rather than concepts. Put your questions to the
quality of the output, not to what is easier to build. I am the sole authority on Indonesian
register: propose wording, flag it, never auto-decide.

Never improvise a BaZi rule, including tables I hand you. Verify against docs/, the repo's locked
tests, or Joey's plotter, and stop if sources disagree. Twenty-three spec errors are in the ledger and
all twenty-three were yours, so check before asserting. Section 3 carries the working-style rules,
including the one you must not break: no git commands against my repo, reads only. Anything we ratify
this session goes into the repo the same turn, not into a handover file.

Then tell me where we actually are and what you think the next move is. Do not write engine code.
```

---

## 8. MAINTAINING THIS FILE

It goes stale the same way `NEXT.md` did — by accumulating a copy of state that lives elsewhere.

- **Sections 3 and 4 are the durable core.** How Reyner works, and the error record. Append to the
  ledger when a new error is caught; never trim it, the pattern is the value.
- **Section 6 is the only part that should change often.** If you find yourself updating sections 1,
  2 or 5, ask whether the fact belongs in `PROGRESS.md` instead. It usually does.
- **Never put a measurement in this file.** Rule 8. Numbers go to `PROGRESS.md` with a date.
- **Never put "what ships" in this file either.** That is `PROGRESS.md`'s LIVE STATE block, kept
  current by rule: it is updated in the same commit as any funnel change. Section 6's session-state
  bullets are a snapshot and are allowed to age; a reader must never mistake them for reality, which
  is why the corrected 2026-08-13 entries are struck through rather than deleted. Two of them
  ("Prompt J is UNSTARTED", "Stage 3 — Claude Code is on it now") had been false for days.
- **A rule agreed in a session goes into the repo before the session ends.** Section 3 rule 8, with
  the split that decides what is a rule and what is session state. This file is where Cowork rules
  land; `CLAUDE.md` is where project-wide locks land.
- When the mirror is deleted, cut section 2 down to one line of history.
