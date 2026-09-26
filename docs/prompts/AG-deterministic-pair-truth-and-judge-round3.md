# Prompt AG: deterministic pair-truth checks + no semantic judge in the render path (Cowork, 2026-09-26)
**RULED:** Reyner, 2026-09-26: the MVP render path is engine → Flash-lite writer → deterministic checks → serve. There is no semantic judge in production and no writer bake-off (this replaces option D and the judge round 3). The full ruling is in `docs/product/product-boundary-rulings-2026-09-26.md`, which sits untracked in the working tree. Evidence: `reports/architecture-cost-2026-09-26.md` (Prompt AF).

## 0. Docs first (a docs-only PR to main; Reyner approves the merge)
- Commit `docs/product/product-boundary-rulings-2026-09-26.md` exactly as it is.
- In `docs/PROGRESS.md`, correct every stale "VOICE V2 PARKED; LAUNCH ON v1" / "launch on v1" line (for example near V:363). Point each one to the rulings file and to `voice-constraint-rulings-2026-09-26.md`, which superseded it on 2026-09-26.
- In `docs/content/voice-constraint-rulings-2026-09-26.md` (after PR #152 if it is merged; otherwise apply both):
  - **STATUS launch sequence:** replace it with "frame-hit truth fix -> Reyner's examples -> simplify constraints -> deterministic validation updates -> representative test -> Reyner's acceptance -> launch (the DOKU production gate is independent; no model bake-off, no semantic-judge checkpoint; Reyner 2026-09-26, MVP)".
  - **Add to STATUS:** "Judges J1-J4 (rows C3-C6) are development/QA tools for sampled calibration only, never in the production render path (Reyner 2026-09-26, MVP)."
  - **Order of work item (4):** replace it with "(4) Flash-lite writer; no production judge; a stronger writer or a production judge only on post-launch evidence that it affects customers or revenue (Reyner 2026-09-26, MVP)".
- Quote every line you change.
**Branches:**
- Items 1-2 are truth fixes, so they go to BOTH voices, via a PR to `main` that Reyner approves, then a rebase of `feat/voice-v2`.
- Items 3 and 4 go on `feat/voice-v2` only.

Each gate change ships alone, with its own version bump and a unit test shown red first.

## 1. Deterministic pair-truth checks, hard, v1 and v2 (the AF Q8 class (b) cases)
- **Direction and supplier.** A block citing `p1_stem_relation` or `p3_supply` must not state the reverse direction, or name an element that isn't the supplied one for that direction. Compare against `provenance.cycle` / `from` / `to` and `supplies[]`.
  - Fixtures: the real g4WH4 inversion draft, and a planted "dia menghidupi kamu" where the engine says the reverse. Both must fire. The correct g4WH4 text must pass.
- **Cross-chart relations only land on day seats.** A relation verb or noun between two non-day pillars of the two charts is invented by construction. Compare against `p2_palace_frame.a_hits_b` / `b_hits_a[].from.position` and `p2_day_pair.relations`.
  - Fixtures: seed-S4 and fail-monthclash must fire. B's year 午 clashing A's seat 子 (true, in PZ0t) must pass.
- **Element dominance agrees with the engine.** An element named with a dominance word ("paling banyak", "dominan", "mendominasi") must match `element_dominant_*` / `chart.element_presence`, and never contradict `element_missing_*`.
  - Fixture: seed-S3 fires. A true dominance sentence passes.
- **Instruments:**
  - The v1 zero-diff replay over the 64 stored inputs. Any new finding on a stored text must be a real error: quote each one.
  - Run the new checks over the stored v1 production-path renders and report whether v1 makes the g4WH4-type error.

## 2. Pair relation between named pillars (seed-S2): report only
- Sketch the check, and measure false positives on the stored pair texts.
- Do NOT enable it: AF calls it brittle to paraphrase. Cowork decides after seeing the numbers.

## 3. Remove the semantic judge from the v2 render path (Reyner, MVP)
- `lib/render/index.js` makes no judge call on any path. Remove the J1 gate and `v2.judge_unavailable`.
- `lib/validate/judge.js` and `scripts/calibrate-j1.mjs` stay as QA tools that can be run by hand on samples. Leave the side branches (`feat/voice-v2-judge-arm-b`, `feat/voice-v2-judge-rubric`) as they are, for reference.
- The judge ceiling (old item 5) is dropped: there is no judge spend in production.
- **Instrument:** a unit test with a provider stub that counts calls. A v2 render makes zero judge calls, shown red on the current head first.
- Bump `STAGE6_VERSION` alone for this change.
- AE item 4 (the representative test) then reports gate findings with no J1 column.

## 4. Defects found by AF (v2), fix before any v2 launch
- A cached v2 reading is re-checked with the v1 validator. Validate with the voice that wrote it.
- `fact.badge_invented` rejects a badge that was actually supplied on v2 pairs.
- **Cache identity:**
  - Confirm, with a test, whether switching voice can serve prose written by the other voice.
  - If it can, add voice and prompt identity to the key.
  - Report what that costs: every returning reader re-renders once.

## Report
- Per item: commits, red-first proof, and replay results.
- `lib/voice.js:19` stays untouched.
