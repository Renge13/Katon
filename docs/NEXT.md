<!--
STATUS: LIVE POINTER. Maintained by Claude (Cowork). Reyner does not edit it.

DESIGN NOTE, 2026-08-01: this file went stale twice by duplicating the task list from the prompt it
points at. It is now a POINTER ONLY. It names the prompt and nothing else, so the only thing that can
go stale is which prompt it names. Do not re-add a task summary here.
-->

# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — the ledger. MEASUREMENTS holds every current number.
3. **`prompts/D2-stage3.md`** — the task.
4. **`prompts/D2a-stage3-anchors.md`** — the addendum. **It overrides D2 wherever they conflict.**
5. **`content/provecell-01-USER.json`** — the TARGET SHAPE. Read it before writing code.

## Current task

**`prompts/D2-stage3.md` plus `prompts/D2a-stage3-anchors.md`** — Stage 3. Hierarchy scoring and
semantic JSON emit. Three phases, three commits. The biggest unblock in the project.

D2a answers the three blockers raised 2026-08-01: the badge anchor tables are verified and supplied,
華蓋 is descoped, the 刑 glossary entry is drafted. It also corrects two things in D2's contract.
**Read both. D2a wins.**

Migration `0004_gender.sql` is **applied** (verified 2026-08-01, `gender | text` present). Reading
creation works. Not blocked.

## Done and not to be revisited

- Calculator, solar-term lock, season gate.
- Strength engine. Oracle 3 rho 0.874, Oracle 4 r 0.929. **No further calibration.** 十二長生 is
  deferred, thresholds stay at 40/60 until the pipeline exists.
- 刑, 胎元, gender field.
- **命宮 is deliberately absent.** See `prompts/D1b-remove-life-palace.md` and CLAUDE.md rule 4.
- Glossary: 49 entries plus `salah_dikira`, all Reyner-reviewed.

If a future version of this file sends you back into engine calibration before Stage 3 exists,
push back.

## Standing rules

- Engine changes and calibration in **separate commits**.
- Never improvise a BaZi rule (rule 4). That includes tables handed to you in a prompt.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- The commit message must describe everything staged.
- Low on context mid-sequence: **stop and report** rather than half-landing a change.
- Flag anything in the docs that contradicts what you find. Many spec errors have been caught that
  way, all of them mine.
