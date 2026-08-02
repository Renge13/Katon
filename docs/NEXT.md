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

## Current task (updated 2026-08-02 late — Stages 3, 5 and 6 are ALL DONE and on main)

**1. RUN THE HARNESS. It is the launch-gating number and it has never touched a live model.**
`npm run measure:stage6 -- --n 3` with `GEMINI_API_KEY` set. Reports first-pass / shipped /
fallback rates separately, per-check per-model failures, the 2.5-flash-lite rider, and the
threshold distributions for the stem-overlap proxies. Numbers go to `PROGRESS.md` MEASUREMENTS,
dated (rule 8). Reyner blind-judges the anonymised rider pairs.

**2. Fit the same-breath / coverage proxy thresholds FROM the harness distributions.** They ship
unfitted by design. One change, one measurement (rule 13) — never fit two in one pass.

**3. One sanctioned engine line:** `element_missing_*` lacks `internal_only: ['provenance.percent']`
while `element_dominant_*` has it, so a zero percent reaches the provider (H session finding,
reported not fixed).

**Historical note:** the AI Studio end-to-end WAS run (2026-08-02, 0/2 clean, see MEASUREMENTS
"Gate-check renders") and the strength_weak thinness prediction is VOID — `glossary.kekuatan`
landed and the fact is fully backed.

**Both former Reyner blockers are RESOLVED 2026-08-02:** the strength verdict has its
`glossary.kekuatan` section (Reyner-reviewed; H enforces label-never-bare), and provenance
verbalization is RULED — the renderer verbalises from the payload joins, and `renderer-prompt.txt`
now carries the join instruction (`f068352`). No template table.

**4. After the harness numbers land: the mirror ROUTE.** Stage 5's only entry point is a CLI by
design; the next build prompt (not yet written — Cowork writes it once thresholds are fitted) wires
funnel -> engine -> cache -> render -> gate -> serve. G and H are DONE and merged.

(`prompts/F-payments-pricing.md` — separate INFRA track — executed 2026-08-02, tasks 1-4 done.
Its task 5 was corrected: the real rule-20 fix is curly quotes at `components/Funnel.jsx:731`.)

## Done and not to be revisited

- Calculator, solar-term lock, season gate.
- Strength engine. Oracle 3 rho 0.874, Oracle 4 r 0.929. **No further calibration.** 十二長生 is
  deferred, thresholds stay at 40/60 until the pipeline exists.
- 刑, 胎元, gender field.
- **命宮 is deliberately absent.** See `prompts/D1b-remove-life-palace.md` and CLAUDE.md rule 4.
- Glossary: complete and Reyner-reviewed — including `kekuatan`, `arketipe` + EN pairs,
  `tag_arketipe`, the 刑 entry, and the 08-02 ban-sweep (zero banned tokens in user-facing strings).
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
