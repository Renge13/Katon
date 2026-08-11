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
2. `PROGRESS.md` — the "MIRROR QA VERDICT 2026-08-10" section (the current requirement and why),
   MEASUREMENTS (gate `1.8.0` rows are the current pipeline state), and THE INTERIM STATE
   (Xendit go-live status — read it before touching anything near the paid path).
3. **`prompts/K-identity-first.md` — THE CURRENT BUILD.** Fresh session, own PR. The prompt file
   is self-contained; brief yourself from it, not from this one.

(Prompt J is DONE — merged as PR #18-#20 on 2026-08-07, live and fenced on production. The carried
`element_missing` item landed with it as PR #20. Promotion is 1 of 3: condition 2 is the
fulfillment swap, condition 3 failed QA — the verdict section explains what K is for.)

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
