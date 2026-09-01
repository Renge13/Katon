<!--
STATUS: HANDOVER. Written by Cowork 2026-08-29, end of session. Paste-ready for the next Code session.
IT LIVES IN THE REPO ON PURPOSE. The 2026-08-26 handover lived only in the Claude project, where Code
could not read it, and a session was spent discovering that. Session state goes to the project; a
document Code must READ goes here.
-->

# Code handover — 2026-08-29, end of session

Read `CLAUDE.md`, `docs/NEXT.md` and `docs/PROGRESS.md`'s three registers as normal. This file carries
only what a fresh session cannot recover by reading them.

---

## WHERE THINGS STAND

`main` carries today's merges: **#81** floor headings (`b2ec81c`), **#80** chart-early (`0c5677e`),
**#78** diagnose (`f57ab20`), **#82** the rulings docs, and `5162c16` (the COWORK-BRIEF rule, the Card A
worksheet, the seal corrections, the #53 close record).

**#53 is CLOSED. #77 is PARKED** - its CI never went green and the pattern is runner availability, not
a red test. Do not poll or re-run it. When someone cares, check the repo's Actions quota and
concurrency settings, not the PR.

**Free readers now get pillars, bars, 胎元 and archetype name at ~4.3s instead of ~22.4s.**

## PROMPT Q - IN PROGRESS, COMMITS 0-3 OF 6

Branch `feat/demand-test`, pushed, `npm test` 32/32.

| | |
|---|---|
| `122bee9` | `CLAUDE.md`: band 25-49k, rule 15 -> register pointer |
| `cf9be7f` | the ladder; `annual` priced, **not** sellable |
| `e06c90e` | migration `0009` + `lib/analytics/events.js` |
| `9229da7` | the eight events fire |

**Remaining: commits 4, 5, 6** - the funnel upcoming block, the read-out script, Q's own NEXT.md
commit. `docs/prompts/Q-demand-test.md` is the spec and it has not changed.

### COMMIT 4 - build it with the strings STUBBED, do not hold

Reyner is the sole authority on Indonesian register and has not ruled the wording. **Build the block
structurally complete with obvious, non-shippable placeholders**, so commits 5 and 6 are not blocked.

**Put every reader-facing string for this block in ONE place** (`lib/site/copy.js`, one named object),
so Reyner fills one file rather than hunting a component tree. **Add a test that FAILS if a placeholder
token survives into the build** - a stub that can reach production is worse than a hold, and this repo's
own convention says an instrument that cannot fail is not a check. Show it failing before trusting it.

**Cowork's PROPOSED wording, swept and UNRULED. Reyner decides; do not ship it on Cowork's say-so:**

| Slot | Proposal |
|---|---|
| Compat label | `Kamu dan Satu Orang` |
| Compat sub | `Kecocokan, dibaca dari dua tanggal lahir.` |
| Annual label | `Setahun ke Depan` |
| Annual sub | `Peta cuaca untuk tahun yang kamu masuki.` |
| Availability marker | `Belum tersedia` **or** `Sedang disiapkan` - Reyner has an opinion on this one already |
| Interest CTA | `Beri tahu saya kalau sudah siap` |
| Contact field | `Email atau nomor WhatsApp, boleh dikosongkan` |

All ten strings swept against the live `lib/validate/blocklist.json` (65 patterns) plus a rule-20
keyboard-character check: **zero hits.** The sweep was falsified first on three deliberately bad inputs
(`ramalan tahun 2027`, `kamu ngerasa capek`, `bukan lemah tapi kuat`) and fired on all three.

**The word `ramalan` is banned by `forbidden_content.fatalism` and must not appear even to be negated.**
The annual product is *cuaca*, and the copy says so without naming the banned token.

### COMMIT 5 - the read-out has a verification gap, and Code's fix is the right one

In dev-fallback mode the events live in the Next server's memory, not the read-out script's process, so
"run `demand-readout.mjs` and check the rates by hand" cannot work locally without Supabase.
**RULED APPROACH: have the read-out accept a fixture file.** It keeps the local walkthrough honest at
zero cost and it is the same door the adversarial seeded-fixture test already needs. Requiring Supabase
locally for one check is the alternative and it is worse.

---

## TWO EVIDENCE ITEMS FOUND BY CODE'S AUDIT - both need doing

1. **`docs/content/tranche3-rulings.md` has been uncommitted for six days.** Its header says
   **RULED, Reyner, 2026-08-23** and *"lands on main ALONE, before the PR that applies it."* `main` has
   `tranche1-`, `tranche2a-` and `tranche2b-rulings.md` and no tranche3. **Commit it alone, on main, per
   its own instruction.** A ruling that exists only in a working tree is one branch operation from gone.
2. **`docs/qa/2026-08-21-renders-rule23-enforced.md` (325 lines) exists only on the closed
   `feat/rule23-enforced` branch.** `main` has the `-inserted` variant, not `-enforced`. It is the
   measurement of what rule-23 enforcement did to the renders - and #53's reopen condition is a
   comparison **against exactly that baseline**. Closing the PR left the evidence behind the question.
   **Cherry-pick it onto `main`.** One commit; do it before the branch is pruned.

**Three other uncommitted Cowork files** - `docs/prompts/O-amend-card.md`, `docs/prompts/O-postlaunch.md`,
`docs/qa/2026-08-19-THE-READ-worksheet.md` - look superseded by shipped work. **That is Reyner's call,
not Code's and not Cowork's.** Ask before deleting or committing.

**One dangling reference:** `docs/NEXT.md` on `main` cites `tests/card-budget.spec.mjs`, which exists
only on unmerged #77.

---

## WHAT IS NOT YOURS

- **The Card A design pass.** Reyner's, in progress. Card A is ruled **1080x1350, 4:5, full-bleed,
  fully opaque, square corners, no mat, no rim, no shadow, NO SEAL**, gradient retained as surface and
  materiality. **Card B untouched.** `docs/content/card-polish-spec.md` §10 is the authority.
- ~~**Prompt R does not exist** and must not be started. It is derived from the approved composition.
  **Do not implement anything from §10 before it exists.**~~ **SUPERSEDED 2026-08-31: THE APPROVED
  COMPOSITION EXISTS AND R IS RELEASED.** Reyner approved the composition and ruled section 0 in full
  on 2026-08-31; Cowork wrote `docs/prompts/R-card-a-4x5.md` from it the same day, and this commit
  lands that file. Nothing is owed on it. The line is struck rather than deleted because it was
  CORRECT for as long as it stood - it is the record of a prohibition being discharged rather than
  ignored, and a session that finds R in `docs/prompts/` needs to see why the document that forbade
  it no longer does. **What has NOT changed: R is HOW, never WHETHER**, and its commits 1 to 4 are
  not started by this commit.
- The Gemini billing alert, the preview key provisioning, the compat oracle probe: all Reyner's.
- `docs/prompts/M-tranche3.md` stays behind the Card A work. Not September critical path.

## THE RULE THAT WAS ADDED TODAY, AND IT APPLIES TO YOU FIRST

`docs/COWORK-BRIEF.md` §3: **a ruled decision is not reopened by a technical fact.** Surface the
conflict once, state the implementation consequence, preserve the ruling, adapt the implementation. An
existing implementation constraint is not an argument for reversing a product decision, and raising the
same constraint twice in new words is reopening by attrition.
