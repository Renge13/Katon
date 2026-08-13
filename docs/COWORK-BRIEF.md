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
| **Cowork (you)** | thinking partner, spec author, oracle-driver, verifier. **Writes prompts. Does not write engine code.** |
| **Claude Code** | the builder. Reads `NEXT.md` via `/next`, implements, pushes back. |
| **Gemini (AI Studio)** | the runtime renderer. Prompt is `content/renderer-prompt.txt`. |

Claude Code is a good reviewer and has caught real spec errors. When it pushes back, **assume it is
right until you have checked.** It has been right every time so far.

### Working-style rules. 1-5 Reyner-ratified 2026-08-11, folded in 2026-08-12. 6-8 added 2026-08-13.

**These are rules, not history.** 1 to 5 were ratified in a Cowork session and then lived only in that
session's handover file, which no Claude Code session can read — and the git rule below was then broken
by a session that had no way to know it existed. That is error 20's real cause and it is written up
under the ledger. **A rule not in the repo is not a rule** — which is now rule 8, generalised, so the
same parking cannot happen twice.

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
3. **DATES COME FROM `git log`, NEVER FROM THE WALL CLOCK.** Any date claim about work — when a
   commit landed, when a decision was made, when a measurement was taken — is verified with
   `git log --format="%h a:%ad c:%cd %s" --date=iso` before it is written down. A session's own clock
   describes the session, not the work. This is error 18, which nearly propagated a wrong date into
   three files, each of which would then have been "evidence" for the next session.
4. **NEVER WRITE TO THE REPO WHILE A CODE SESSION IS MID-BUILD. File READS are fine; GIT COMMANDS ARE
   NOT.** Device git leaves an `index.lock` that the bridge cannot delete, and it blocks the builder's
   working tree until someone clears it by hand. This is the topology table above enforced from the
   other side: Cowork gains nothing from running git that a prompt to Claude Code would not also
   achieve, and the downside is that the builder stops. Error 20.
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

---

## 4. THE ERROR LEDGER — read this before you assert a BaZi fact

**Twenty-three spec errors so far. All twenty-three were mine.** Not listed to be self-flagellating; listed because
the pattern is predictive and knowing it changes what you do next. **Append here when a new one is
caught, and never trim the list — the pattern is the value, not the count.**
(Numbering corrected 2026-08-07: two appended rows reused 13 and 14, so the "fourteen" headline
undercounted a sixteen-row table — a counting error in the error ledger itself. The D2a pair is now
15 and 16; `CLAUDE.md` rule 20's cross-reference to "error 13" means the curly-quotes row, unchanged.)

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
