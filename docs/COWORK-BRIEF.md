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

---

## 4. THE ERROR LEDGER — read this before you assert a BaZi fact

**Twenty spec errors so far. All twenty were mine.** Not listed to be self-flagellating; listed because
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
| 20 | Ran a git command against the DEVICE REPO and left a `.git/index.lock` the bridge cannot delete, blocking the working tree until it was cleared by hand. Not a BaZi error and not a spec error - a ROLE error, which is why it belongs here anyway | the topology table in section 3 is the rule: **Cowork writes prompts and does not write engine code; Claude Code is the builder.** Operating the repo directly is the same boundary crossed from the other side. Worth being precise, though: no working rule NAMED git or lockfiles before this row, so the failure was foreseeable from the role split rather than prohibited outright. It is prohibited now. The practical cost is asymmetric and that is the argument - Cowork gains nothing from running git that a prompt to Claude Code would not also achieve, and a lock it cannot release stops the builder entirely |

**Three of these (2, 5, 6) are the same failure: I had the disproving evidence in hand and wrote the
claim anyway.** Before asserting anything, check whether something you already measured contradicts it.

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

**Session state as of 2026-08-07 (end of the long Cowork session):**

- Pipeline COMPLETE and measured honestly: gate 1.8.0, first-pass ~53%, shipped ~75%. Every
  gate false positive found and killed (the ledger rows tell the story). The house method, proven
  four times: READ THE FAILING OUTPUT before touching any lever; finding messages are evidence
  about the check, never about the text.
- `hedge_construction` pooled truth is 28.8% (25.9% was a low draw) and is the next quality
  target. The "bukan berarti" carve-out (Reyner ruling A) already landed in gate 1.8.0.
- **Prompt J (mirror route) is WRITTEN and UNSTARTED** — `docs/prompts/J-mirror-route.md`. It is
  the next build: fenced preview route, rate limiting, promotion conditions baked in. Starts in a
  FRESH Code session. After J: card component, then the fulfillment swap (retires the interim
  funnel), then promotion.
- Xendit: APPROVED, live keys swapped, QRIS activation in progress — see PROGRESS INTERIM STATE
  for the full go-live status. Self-purchase test pending QRIS.
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
| ~~Xendit verification~~ | DONE 08-07 | approved, live keys swapped; QRIS activation + self-purchase test still pending, see PROGRESS INTERIM STATE |

**Engine and pipeline, in order.**

1. **Stage 3** — Claude Code is on it now. `prompts/D2-stage3.md` + `prompts/D2a-stage3-anchors.md`.
2. **Re-measure badge frequencies** from the verified anchors. The 2.5-average and the Penolong 77%
   are both stale — measured with the descoped 華蓋 in the mix — and Stage 3's extremity term reads
   them, so a stale number silently mis-scores every badge.
3. **Stage 5** renderer wiring, then **Stage 6** post-validation. Separate prompts. Nothing reaches a
   user without passing Stage 6.
4. **Sharecard build.** Almost entirely engine-free; only the optional feed/drain line needs strength.
5. **Compatibility** — the v1 money engine. Price band to be **tested** at 25 to 45k, not assumed.
   **BACKLOGGED 08-02: the flow reconciliation.** `product/compatibility-reading-spec.md` is still
   proposal-not-decision; before build, one Cowork session must produce the input→output flow with
   contradictions vs the naming lock marked and every BaZi assertion oracle-checked. Carries two open
   product questions: (a) identity/login — Reyner floated email-login before any reading (Joey's
   model) + paywalling non-own birthdates; Cowork counter-position recorded in session 08-02: keep
   the mirror anon (locked email-after-reading decision stands), require email at compat CHECKOUT
   where it is transactionally natural; note any non-own-date gate is unenforceable while the mirror
   reads any date by design. (b) person-B consent UX belongs to the compat spec, not to a login wall.
   Also: Luck Pillar sync in compat may force female-set fixture charts earlier than planned.
6. Rate limiting, and remove the `NEXT_PUBLIC_FREE_FULL_READING` flag.

---

## 7. THE PASTE-AT-THE-TOP PROMPT

Copy everything in the block into the first message of a new Cowork session.

```
Katon session. Repo is D:\claude-projects\katon.

Read these before responding, in order, and brief yourself only from them:
  1. CLAUDE.md              — 25 locked rules, it wins over anything you remember
  2. docs/PROGRESS.md       — MEASUREMENTS, RESOLVED, DECIDED, SUPERSEDED
  3. docs/NEXT.md           — what Claude Code is building
  4. docs/COWORK-BRIEF.md   — how I work, the error ledger, what is open

Do NOT read anything in D:\Work\Katon assets\Katon md — it is a stale mirror with rejected
Aspek names still in it. Everything worth keeping was rescued into the repo.

Be my challenge-forward advisor as usual: push on assumptions, terse and direct, copy-pasteable
Claude Code prompts and before/after comparisons rather than concepts. Put your questions to the
quality of the output, not to what is easier to build. I am the sole authority on Indonesian
register: propose wording, flag it, never auto-decide.

Never improvise a BaZi rule, including tables I hand you. Verify against docs/, the repo's locked
tests, or Joey's plotter, and stop if sources disagree. Twenty spec errors are in the ledger and
all twenty were yours, so check before asserting.

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
- When the mirror is deleted, cut section 2 down to one line of history.
