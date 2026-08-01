<!--
STATUS: LIVE POINTER. This file always describes the SINGLE next task for Claude Code.
Maintained by Claude (Cowork) between sessions. Reyner does not edit it.
Overwritten every time, never appended to — see DOC-STANDARD.md.
LAST SET: 2026-08-01
-->

# NEXT

## Read first
1. `../CLAUDE.md` — the locked rules. 25 of them, numbered, no collisions.
2. `PROGRESS.md` — the ledger. Its MEASUREMENTS table holds every current number.
3. `prompts/C6-sqrt-adopted-oracle4.md` — **the instruction for this task.**

## The task

**Prompt C, session 5.** Two steps, in this order, one measurement each.

### Step 1 — Oracle 4
Correlate the engine's `supportShare` against `engine/joey-implied-strength.json`, which holds the
same quantity derived from Joey's own element totals. Report **Pearson and Spearman** across the 13
charts.

**Do NOT touch the 40/60 thresholds.** Cutting them to make the distribution look right is fitting to
a prior on 13 charts with no ground truth for the labels. If the correlation is high, the underlying
number is sound and the cut points become a deliberate labelling choice made afterward. If it is low,
the thresholds are irrelevant because the number they cut is wrong.

Context you may not expect: **"0 strong" is not a regression.** Joey's own element totals imply
7 weak / 6 balanced / 0 strong under the same thresholds, max 55.3%. The engine's 5/8/0 is close to
his. The `sqrt` transform moved the verdict layer toward Joey, not away.

### Step 2 — 十二長生 for the 16% residual
Nine of 57 within-element pairs invert against presence, and that number is **transform-invariant**
under linear, sqrt and log1p. It needs a *mechanism*, not a reweighting.

Test 十二長生 (twelve life stages). It is a genuinely different mechanism rather than a reweighting, and
Joey prints a life-stage label on every luck pillar so he demonstrably computes them.

**Measure on within-element agreement (currently 48/57) as the primary signal** — that is the number
no transform can move, so it isolates the mechanism.

### Then stop
Thresholds come last and only if Oracle 4 says the underlying number is sound. Report and wait for a
ruling. **Rule 13: one change, one measurement.**

## Standing rules for every session

- Engine changes and calibration go in **separate commits**.
- Never improvise a BaZi rule (rule 4). If it is not written in `docs/`, ask.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- If you are running low on context mid-sequence, **stop and report** rather than half-landing a
  change. That has been the right call every time it has come up.
- Flag anything in the docs that contradicts what you find. Four spec errors have been caught that
  way so far, all of them mine.
