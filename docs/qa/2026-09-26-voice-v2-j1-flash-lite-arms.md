# Voice v2 J1 on Flash-lite, two arms, 2026-09-26: BOTH FAIL (decision checkpoint)

Prompt AD amendment 2, items 0-2 (Reyner: Flash-lite only, no Pro; Cowork: the J1 precedence line;
round 2 of 2). One run, both arms judged on every case, interleaved, model forced to
`gemini-3.1-flash-lite` (the writer's id, `lib/render/config.js:30`).

```
node --conditions=react-server scripts/calibrate-j1.mjs --runs 3 \
  --arm A=lib/validate/judge.js                       # feat/voice-v2 335d09d (STAGE6 1.38.0)
  --arm B=<worktree>/lib/validate/judge.js            # feat/voice-v2-judge-arm-b 06d5fda (1.39.0)
```

- **Arm A**: the rubric on `feat/voice-v2` (the one that passed on Pro, `docs/qa/2026-09-25-voice-v2-j1-calibration.md`), prompt sha256 `56f1bb0d8d06...`.
- **Arm B**: the side-branch rubric (`38a7a2c`) plus amendment 2 item 1's sentence, prompt `4086d305db34...`.

**The adoption rule** (amendment 2 item 2): 15/15 old seeded, 0 clean false positives, 0 J1 on
scene-pass, 100% J1 on both scene-fail groups. Otherwise STOP; Reyner decides.

## Result: A FAIL, B FAIL. Arm B is NOT adopted. Stopped.

Per judge call, 3 runs:

| | Arm A | Arm B |
|---|---|---|
| old seeded, caught | **9/15** | **9/15** |
| clean, J1 false positives | 2/12 | 2/12 |
| scene-pass, J1 false positives | **6/15** | 0/15 |
| scene-fail past events, caught | 9/9 | 9/9 |
| scene-fail invented chart facts, caught | 6/6 | 6/6 |
| spend | $0.1285 (57 calls) | $0.1201 (57 calls) |

Total **$0.2486** for 114 calls (estimate was $0.53).

| case | set | A r1 / r2 / r3 | B r1 / r2 / r3 |
|---|---|---|---|
| S1, S2, S3 | clean | clean | clean |
| S4 | clean | clean / FP / FP | clean / FP x2 / FP x2 |
| seed-S1, seed-S2, seed-S3 | seeded | caught | caught |
| **seed-S4** | seeded | MISSED x3 | MISSED x3 |
| **fixture-g4WH4** | seeded | **MISSED x3, no finding at all** | **MISSED x3, no finding at all** |
| pass-noble, pass-void, pass-duty | scene-pass | clean | clean |
| pass-weak | scene-pass | FP x3 | clean |
| pass-pair | scene-pass | FP x3 (3 each) | clean |
| fail-* (all five) | scene-fail | caught x3 | caught x3 |

## What failed, quoted

**The real invention is not seen.** `fixture-g4WH4` is the served round-2 reading with "dia membawa
elemen Air yang tidak dominan di baganmu" where the payload says B supplies Wood and Water is A's
dominant element. Pro caught it 3/3 on 2026-09-25 and again at 1.35.0. On Flash-lite **neither arm
returned any finding on it in any run.**

**seed-S4** ("Pilar Akarmu dan Pilar Akar-nya juga saling mengikat", no such relation): not caught.
Instead both arms filed a J1 on a TRUE sentence of the same sample, "Pilar Akar-nya berbenturan dengan
Fondasi Pasanganmu" (B's year 午 does clash A's seat 子, `p2_palace_frame`), with unsupported text
that misreads the provenance, e.g. A: "the provenance ... lists the 'Pilar Kerja' (Month Pillar) and
'Pilar Arah' (Hour Pillar) as the ones hitting the spouse seat". That same misreading is Arm A's S4
false positive (runs 2, 3) and its pass-pair false positives.

**Arm B's clean S4 false positives** (runs 2, 3): "Di Pilar Akar-nya, tempat asal-usul dan keluarganya
dibaca, ada Mata Pisau ..." and "Pilar Akar yang sama juga membawa Mata Pisau-nya.", unsupported "the
provenance for badge_羊刃 shows it is anchored on the day pillar and hits the year pillar ..., not
that it is 'in' the Pilar Akar". The badge does fall on the year pillar (`hits`); the judge reads
`anchored_on` as location.

**Arm A's pass-weak false positive** (3/3): J1 on "Api menyala dari kayu." as "a specific causal
mechanism (Fire needing Wood as fuel)" - worksheet S2's own line, the same sentence Pro once flagged as
J2 (`docs/qa/2026-09-24-voice-v2-judge-calibration.md`).

## What Arm B did do

The scene boundary and the precedence line both work on Flash-lite: 15/15 scene-pass with no J1 (A:
9/15), and 15/15 scene-fail caught in both groups, including the two invented-chart-fact causes that
Pro filed as J2 at 1.35.0. Its failures are the old seeded pair cases and the provenance misreading,
which Arm A shares.

## State of the branches, stated plainly

- `feat/voice-v2` carries **1.38.0: J1 gates on Flash-lite with Arm A's rubric**, per the ruling. On
  this measurement that gate misses the real g4WH4 inversion 3/3 and raises J1 on true sentences, which
  regenerates and then floors a v2 reading. Production serves v1 (`lib/voice.js:19`), so no customer
  sees this.
- `feat/voice-v2-judge-arm-b` (`06d5fda`, 1.39.0) holds Arm B, unmerged.

## Not decided here

This is round 2 of 2 and the decision checkpoint. Reyner decides. The measurement bears on: keeping
J1 as a hard gate on Flash-lite; the "stronger model returns only as an option at the round-2
checkpoint" clause of item 5; and whether the pair provenance (`from` / `to`, `anchored_on` / `hits`)
needs plainer glossing for this model.

## The instrument was shown able to fail before it ran

`--dry` passes and throws on a broken needle or a false premise (shown on `38a7a2c`, same code);
`--runs 0` loaded both arms and resolved the model before any spend; the scorer refuses a J2 as a
catch. Raw output: `reports/voice-v2/round3/j1-flash-lite-arms-2026-09-26.{json,log}` (gitignored).
