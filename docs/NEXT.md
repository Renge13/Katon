<!--
STATUS: LIVE POINTER. Maintained by Claude (Cowork). Reyner does not edit it.

DESIGN NOTE, 2026-08-01: this file went stale twice by duplicating the task list from the prompt it
points at. It is now a POINTER ONLY. It names the prompt and nothing else, so the only thing that can
go stale is which prompt it names. Do not re-add a task summary here.

2026-08-07: it went stale a THIRD way — the pointer itself was not updated when Prompt J was written
(this file still described the 08-02 harness task five days after that work finished). Rule for
Cowork: updating this pointer is PART of writing or queueing a build prompt, not a separate task.
-->

# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — MEASUREMENTS (the gate `1.8.0` rows, 08-07, are the current pipeline state) and
   THE INTERIM STATE (Xendit go-live status — read it before touching anything near the paid path).
3. **`prompts/J-mirror-route.md` — THE CURRENT BUILD.** Fresh session, own PR. The prompt file is
   self-contained; brief yourself from it, not from this one.

## Carried item — separate commit, NOT part of J
One sanctioned engine line: `element_missing_*` lacks `internal_only: ['provenance.percent']` while
`element_dominant_*` has it, so a zero percent reaches the provider (H session finding). Verified
still open 2026-08-07: `grep -n "internal_only" lib/semantic/facts.js` shows the dominant fact
carrying it (~line 259) and the missing-element block (~225–237) without it. J's own rules forbid
touching `lib/semantic/*`, so this is its own one-line commit — and check first whether adding it
changes the semantic JSON and therefore every cache key; that consequence has not been verified.

## Standing rules
- Engine changes and calibration in **separate commits**.
- Never improvise a BaZi rule (rule 4). That includes tables handed to you in a prompt.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- The commit message must describe everything staged.
- Low on context mid-sequence: **stop and report** rather than half-landing a change.
- If this file sends you back into engine calibration, push back — that work is closed
  (`PROGRESS.md` RESOLVED).
- Flag anything in the docs that contradicts what you find. Seventeen spec errors have been caught
  that way, all of them Cowork's.
