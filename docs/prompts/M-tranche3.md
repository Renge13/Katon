<!--
STATUS: BUILD PROMPT. Written by Cowork 2026-08-23, for Claude Code.
Ruled by Reyner 2026-08-23 (three answers, recorded in commit 3's body).

SEQUENCING, AND IT IS NOT A PREFERENCE. #71 and #72 are open, stacked and unmerged, and both
touch PROGRESS.md. Commits 0 and 1 below are docs-only and conflict-free against any base.
COMMITS 2 TO 4 TOUCH glossary.json AND facts.js AND MUST NOT BECOME A THIRD STACKED BRANCH.
Hold them until #71 and #72 merge. Promotion is the critical path; this tranche is not.

NO GATE CHANGE ANYWHERE IN THIS PROMPT. Nothing here changes what Stage 6 accepts or rejects,
so STAGE6_VERSION does NOT move. Commit 4 lands a check that fires and logs and rejects
nothing, which the GATE CHANGES SHIP ISOLATED rule explicitly permits to travel for exactly
this reason: it cannot move the floor.
-->

# Prompt M - tranche 3, cross-chart repetition variants

Five ordered commits. Each is independently reviewable and revertable. Do not bundle.

---

## COMMIT 0 - the four checks into COWORK-BRIEF (docs only, was item 13, never sent)

Append to `docs/COWORK-BRIEF.md` section 3, under a new heading
`THE FOUR CHECKS (ruled 2026-08-22)`, the four checks as they stand in the account-level Katon
skill's section 0. Verified absent today:

```
$ grep -n "FOUR CHECKS" docs/COWORK-BRIEF.md
(no hits; the only matches anywhere in docs/ are two unrelated lines in PROGRESS.md about the
four GATE checks added 2026-08-04)
```

**The reason goes in the commit body:** a rule that lives only in an account-level skill is one
account change away from gone, and it is a rule about how Cowork reads this repo, so the repo is
where it belongs. Record it as a RECORD item. No behaviour changes. No `STAGE6_VERSION` bump.

---

## COMMIT 1 - the rulings file, on main, alone (docs only)

Author `docs/content/tranche3-rulings.md` from the file Cowork delivered, byte-identically. It
is Reyner's register and a transcription slip is invisible.

Verify before committing, and paste the output into the PR body:

```
$ node scripts/apply-rulings.mjs docs/content/tranche3-rulings.md --expect 7 --dry
```

Expect: `REFUSING: no glossary node for spouse_palace.same (line 76)`. **That refusal is the
correct result at this commit** and is the whole reason commit 2 exists. Cowork has already run
the repo's own `parseRulings` over the file - 7 assignments, 0 problems, and the parser
demonstrably reports a malformed line when given one - so the parse is not in question; the
missing node is.

---

## COMMIT 2 - scaffold `glossary.spouse_palace`, behaviour-neutral (engine)

Today the Fondasi Pasangan frame sentence is one string in one place:

```
$ python3 -c "import json;g=json.load(open('docs/content/glossary.json'));print(g['pilar']['day']['branch_label_meaning'])"
Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.
```

`lib/semantic/facts.js` block 9 mounts it as the fact's `entry.label_meaning`. It reaches 13 of
13 fixture charts, so 100% of customers read the same sentence.

**Do:**

1. Add a top-level `spouse_palace` section to `docs/content/glossary.json` with exactly five
   keys - `same`, `feeds`, `drains`, `is_controlled`, `controls` - each an object whose
   `label_meaning` is **today's shared sentence, verbatim**. Add a `_note` in the
   `elemen_dominan._note` style recording that it is keyed by
   `provenance.relation_to_day_master`.
2. In `facts.js` block 9, select `GLOSSARY.spouse_palace[relation].label_meaning` when
   `relation_to_day_master` is non-null. **Keep `dayEntry.branch_label_meaning` as the fallback
   for the null case** - `mainHidden` can be null, and a branch with no hidden stem must not
   crash or emit an empty frame. Keep `name_id` / `name_en` from `dayEntry` unchanged.
3. Add `label_meaning_resilience` and `label_meaning_agency` to `kekuatan.balanced`, both seeded
   with the existing `label_meaning` **verbatim**, and hand all three phrasings to the renderer
   as interchangeable, with the renderer picking exactly one. This is Option B and rule 14 is
   the reason it is the renderer's pick and not the engine's: the three say the same thing, so
   the choice is a choice of words. **Cowork's technical call, noted rather than escalated:**
   field names carry no digits because `apply-rulings.mjs` parses field names as `[a-z_]+` and a
   `_v2` suffix would be reported as a malformed line, not applied.

**This commit changes no prose.** Assert it: every one of the 13 fixture charts must emit a
`spouse_palace` fact whose `entry.label_meaning` is byte-identical to what it emitted before,
and `kekuatan.balanced` likewise. If any chart's semantic JSON differs in any field other than
the added ones, stop and report rather than adjusting the assertion.

**Expected side effect, name it in the commit body so nobody reads it as a defect:** the
semantic JSON gains fields, so `hash(semantic_JSON + engine_version)` moves and existing
`render_cache` rows are orphaned. That is what a content change costs and it is correct.

---

## COMMIT 3 - apply the rulings (content)

```
$ node scripts/apply-rulings.mjs docs/content/tranche3-rulings.md --expect 7 --dry
$ node scripts/apply-rulings.mjs docs/content/tranche3-rulings.md --expect 7
```

Seven assignments, no more, no fewer. **`--expect 7` is the guard; do not adjust it to match a
parse.** If it refuses, the file or the scaffold is wrong, not the number.

Put Reyner's three rulings of 2026-08-23 in the commit body verbatim:

1. **`cenderung` deleted from `is_controlled`.** `style.hedging` bans it, it is live in
   `blocklist.json`, and `tests/stage6-validation.spec.mjs` runs every style pattern over the
   whole glossary - so the string as first written would have failed `npm test`, not merely read
   worse. He chose the deletion over un-banning the word; un-banning would have been a gate
   change needing its own isolated commit and a `STAGE6_VERSION` bump, which is disproportionate
   to one word with a clean removal.
2. **`kekuatan.balanced` variant 1 rewritten by him.** The draft Cowork put in front of him
   shared 9 three-grams with the cell's existing `label_meaning` - it was that sentence with two
   words swapped, so it could not have broken a 62% collision. His replacement shares 0.
3. **The double-mount defect gets a log-only check, not a suppression** - commit 4.

---

## COMMIT 4 - the double-mount check, log-only, rejects nothing (infra)

`spouse_palace` embeds a full copy of the aspek cell under `extra.seat_content`, and that same
aspek can arrive again as its own `aspek_convergence_*` fact in the same reading. One glossary
cell, two mount points, one reader.

**Reyner ruled a log-only check rather than the Stage 4 suppression he first proposed.** The
reasoning is on the record and belongs in the commit body: the worksheet measured **zero**
sentences repeated to their own reader across all five judged readings, and chart 13 merged the
two into a single block titled `Aspek Peraih dan Fondasi Pasangan`. So the defect is not
currently firing, and suppressing the standalone card would delete a content block from the
reading while the open question is whether readings are too **thin** - 7 of 13 facts on chart 5.
A positional check earns a rejection only after the harness has priced it.

**Do:** detect, per reading, when the aspek in `spouse_palace.extra.seat_god` also appears as a
standalone `aspek_convergence_*` fact. Log it with the chart and the aspek. Reject nothing,
regenerate nothing, change no verdict. Print the rate beside the floor rate in `qa:renders` so
the next n=10 run prices it for free.

---

## AFTER COMMIT 4 - two measurements, both free, neither a new run

1. **Did the collision actually move?** Re-run the 13-chart collision measurement from worksheet
   section 1 and report `spouse_palace` per relation instead of 100%. If the fixture's 13 charts
   concentrate in two relations, the real improvement is smaller than five-way and Reyner should
   be told the number rather than the mechanism.
2. **Does Option B converge?** Over the next n=10 artifact, count how many of the 40 runs picked
   each of the three `kekuatan.balanced` phrasings. **The worksheet records this risk as open and
   unmeasured** - the model cannot see what other readers received, so it may settle on one
   phrasing and the collision returns. If one phrasing takes more than ~60%, B did not work for
   this cell and that is a finding, not a failure.

---

## AND UPDATE `docs/NEXT.md` IN THE SAME COMMIT AS COMMIT 1

Cowork's file, Cowork's obligation, and it has gone stale five times - the 2026-08-07 rule is
that updating the pointer is part of writing a build prompt, not a separate task. Point it at
`docs/prompts/M-tranche3.md`, record that tranche 3's section 3 was ruled 2026-08-23, and keep
the launch-scope and precondition paragraphs untouched: **3a is un-met after the budget revert,
3b is owed by Reyner, and nothing in this prompt touches either.**
