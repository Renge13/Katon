<!--
STATUS: LIVE POINTER. Maintained by Claude (Cowork). Reyner does not edit it.

DESIGN NOTE, 2026-08-01: this file went stale twice by duplicating the task list from the prompt it
points at. It is now a POINTER ONLY. It names the prompt and nothing else, so the only thing that can
go stale is which prompt it names. Do not re-add a task summary here.
-->

# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — the ledger. MEASUREMENTS holds every current number, and its three
   `DECIDED 2026-08-02 — Stage 3 PHASE n` sections describe what was just built.
3. **`content/provecell-01-ENGINE.json`** — Stage 3's real output for fixture chart 1.
4. **`content/renderer-prompt.txt`** — the Stage-5 system prompt. Single source of truth.

## Current task

**Stage 3 is DONE, all three phases** (`prompts/D2-stage3.md` + `D2a`). What is left is the thing
Stage 3 cannot do for itself.

**1. Run D2's end-to-end gate. It has NOT been run.** Paste
`content/provecell-01-ENGINE.json` into AI Studio with `content/renderer-prompt.txt` and compare the
reading against run 5. This needs a real LLM call, which is why it is still open. **Predict before
running:** the reading should be thin exactly where `strength_weak` sits, because that fact is top-3
and has no `label_meaning`, `gift` or `cost`. Thinness anywhere else means the JSON is wrong, and
diffing against `provecell-01-USER.json` will say where.

**2. Two things need Reyner before anything downstream is real.** Both are content, not code:
- **The strength verdict has NO glossary entry.** `glossary.json` has no `kekuatan` section, so
  `weak` / `balanced` / `strong` carry no label, no `label_meaning`, no gift and no cost. It is the
  top-ranked fact on most charts and the single most delicate string in the product — CR-5 permits
  "lemah" only when the explanation lands in the same breath.
- **`provenance` and `required_points` ship as STRUCTURED DATA, not Indonesian sentences.** That was
  a deliberate deferral, not an omission — the sentences exist in no glossary entry, so writing them
  is Stage 3 authoring user-facing copy. Decide whether the renderer verbalises from the data (rule
  14 says it should) or whether an engine-owned template table is wanted. If templates: they are new
  user-facing copy and need a register pass. Note `renderer-prompt.txt` bans "dihitung dari", which
  the hand-written provenance strings use.

**3. Then the pipeline, prompts now written (2026-08-02):** `prompts/G-stage5-render.md` (Stage 5
renderer wiring + Stage 4 cache consumption — `cacheKey()` exists and is tested, nothing consumes it
yet), then `prompts/H-stage6-validation.md` (the Stage 6 gate + the pass-rate measurement harness).
Own session/PR each. Nothing user-facing ships from G until H exists. Note G/H were written before
Stage 3 completed — if the semantic JSON shape they assume contradicts what PHASE 3 actually emits,
the code and `provecell-01-ENGINE.json` win; report the mismatch.

(`prompts/F-payments-pricing.md` — separate INFRA track — executed 2026-08-02, tasks 1-4 done.
Its task 5 was corrected: the real rule-20 fix is curly quotes at `components/Funnel.jsx:731`.)

## Done and not to be revisited

- Calculator, solar-term lock, season gate.
- Strength engine. Oracle 3 rho 0.874, Oracle 4 r 0.929. **No further calibration.** 十二長生 is
  deferred, thresholds stay at 40/60 until the pipeline exists.
- 刑, 胎元, gender field.
- **命宮 is deliberately absent.** See `prompts/D1b-remove-life-palace.md` and CLAUDE.md rule 4.
- Glossary: 49 entries plus `salah_dikira`, all Reyner-reviewed. The one hole is the strength verdict.
- **Badge anchors: 60/60, locked in `tests/badge-anchors.spec.mjs`.** Seven detectable badges. Do not
  re-derive the tables and do not re-add 華蓋.
- **Stage 3 hierarchy params are UNFITTED on purpose** (rule 13). A fitting pass is its own commit with
  its own measurement. The first two targets are named at the end of the PHASE 2 section in
  `PROGRESS.md`.

If a future version of this file sends you back into engine calibration, push back.

Migration `0004_gender.sql` is **applied** (verified 2026-08-01). Reading creation works. Not blocked.

## Standing rules

- Engine changes and calibration in **separate commits**.
- Never improvise a BaZi rule (rule 4). That includes tables handed to you in a prompt.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- The commit message must describe everything staged.
- Low on context mid-sequence: **stop and report** rather than half-landing a change.
- Flag anything in the docs that contradicts what you find. Many spec errors have been caught that
  way, all of them mine.
