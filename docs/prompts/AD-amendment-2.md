# Prompt AD, amendment 2 (Cowork, 2026-09-26)
Follows Code's Job B report (feat/voice-v2 head `e435877`; the judge side branch `feat/voice-v2-judge-rubric` `38a7a2c` failed calibration). Commit this file next to AD on `feat/voice-v2`.

## 0. Reyner's ruling: Gemini Flash-lite only, no Pro
- Every model call in this work uses the current Flash-lite model. That covers the writer, the judge (J1-J3) and calibration runs. **Quote the exact model ID the writer uses today** from config, and use that same ID. Do not guess a name.
- Switch the judge from Pro to that Flash-lite ID. Quote where the judge model is set.
- Consequence: the "stronger writer model" bake-off drops out of the launch sequence for now (docs edit in item 5).

## 1. J1/J2 overlap: accept your candidate fix (Cowork, technical)
Add to the judge rubric: "If the cause is itself a chart fact the supplied facts do not contain, it is J1, not J2. J2 is only for a link the engine does not make between supplied facts." This tightens J1.

## 2. Recalibration = round 2 of 2, on Flash-lite, two arms in the same run
The model change and the rubric change land together, so run both arms on Flash-lite with the same cases (old 15 + clean set + your 10 new scene cases x 3 repeats):
- **Arm A:** the rubric that currently sits on `feat/voice-v2` (the one that passed on Pro).
- **Arm B:** the side-branch rubric plus the item 1 sentence.

**Adopt Arm B on `feat/voice-v2`** only if it scores:
- 15/15 on the old seeded cases,
- 0 false positives on the clean set,
- 0 J1 on scene-pass,
- 100% J1 on both scene-fail groups (past events and invented chart facts).

Otherwise STOP. That is the decision checkpoint, and Reyner decides. Report the confusion matrix for both arms.

**Cost:** estimate it first. Report before running if the estimate is above USD 2.

## 3. `factGuard` on v2 (Cowork, technical)
Run on v2 as **hard**:
- `fact.day_master`
- `fact.strength_contradiction`
- `fact.badge_invented`
- `fact.condition_named`
- `fact.hour_known_contradiction`
- `fact.relation_positions`

Run as **flag**:
- `fact.palace_dropped`
- `fact.strength_same_breath`
- `fact.strength_bare_label`

**Why:**
- These are deterministic truth checks.
- Your replay found exactly one hit over round 3, and it was a real one (chart 1's "(Missing Wood)").
- The planted controls fired, so they don't overfire.
- With a Flash-lite judge, the deterministic layer matters more.

**Instruments:**
- Replay after the change: the one `condition_named` hit becomes a hard finding, and nothing else changes.
- Unit tests with a planted strength contradiction and a planted invented badge, each red before the change.
- `STAGE6_VERSION` bump.

## 4. Square-bracket English ("Kayu [Wood]", "Logam [Metal]"): remove the cause, no new gate
1. First report what the v1 path does with a writer-added bracket gloss: `insertBrackets`, the v2 typography normaliser, and which terms have a sanctioned gloss.
2. Then apply one deterministic post-processing rule on v2:
   - A square-bracketed English gloss becomes the sanctioned form, if that term has one.
   - It is removed, if the term has none.
3. Do not add a regeneration. Instrument: the served texts of round-3 chart 8 and chart 13 come out with zero square brackets, and a planted sanctioned term keeps its sanctioned gloss.

## 5. Docs (separate docs-only PR to main; Reyner approves the merge)
In `docs/content/voice-constraint-rulings-2026-09-26.md`:
- **STATUS launch sequence:** replace "model bake-off" with "Flash-lite only (Reyner, 2026-09-26; no Pro)".
- **Order of work:** replace "(4) test stronger writer models" with "(4) Flash-lite only for writer and judge (Reyner, 2026-09-26); a stronger model returns only as an option at the round-2 decision checkpoint".

## Unchanged
- `lib/voice.js:19` untouched.
- Nothing from `feat/voice-v2` merges to main.
- The v1 zero-diff proof.
- The prompt half still waits for Reyner's examples.
