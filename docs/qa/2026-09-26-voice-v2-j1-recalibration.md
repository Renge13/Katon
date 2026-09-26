# Voice v2 J1 recalibration, 2026-09-26: FAIL on invented chart causes filed as J2

Prompt AD Job B, amendment 1 item 5 (Cowork, on Reyner's B9, C4, C5, C6). Branch
`feat/voice-v2-judge-rubric` (off `feat/voice-v2` at `e435877`), STAGE6 `1.35.0`, judge
`gemini-3.1-pro-preview` (unchanged), judge prompt as edited in the same commit as this record.

```
node --conditions=react-server scripts/calibrate-j1.mjs --dry     # premises + scorer checks, spends nothing
node --conditions=react-server scripts/calibrate-j1.mjs --runs 3 --out reports/voice-v2/round3/j1-recalibration-2026-09-26.json
```

**The pass rule** (AD Job B, "J1 must learn the scene boundary"; amendment 1 item 5): the old
cases still 15/15 with zero clean false positives, and the new cases with **0 false negatives**;
scene-pass cases must pass. "If that isn't reachable, STOP and report the failing cases instead
of loosening the rubric."

## What changed in the judge prompt (one shared call)

- J1 gains the scene boundary: an illustration framed as possible or typical ("Misalnya, ketika
  ...", "Dalam keseharian, ini bisa terasa seperti ...", "biasanya ...") is not invention when the
  pattern is grounded. Still J1 inside a scene: a claim that something actually happened, and a
  chart fact the supplied facts do not give.
- J2 becomes "invented chart causality": only a CHART cause the engine did not supply. "Karena
  pola ini, ..." interpretation passes.
- J3 is narrowed to rule 25: a certain future event, health, money or fate.
- J4 is removed (prompt, schema, `missing`, and `required_points` from the judge's input).

## Result: FAIL. Stopped here; the rubric was not loosened.

| case | set | run 1 | run 2 | run 3 |
|---|---|---|---|---|
| S1-S4 | clean | clean | clean | clean |
| seed-S1..S4, fixture-g4WH4 | seeded (old) | caught x5 | caught x5 | caught x5 |
| pass-noble, pass-void, pass-weak, pass-duty, pass-pair | scene-pass | clean x5 | clean x5 | clean x5 |
| fail-lastyear | scene-fail | caught | caught | caught |
| **fail-hourwood** | scene-fail | **MISSED (J2)** | **MISSED (J2)** | **MISSED (J2)** |
| fail-college | scene-fail | caught | caught | caught |
| **fail-monthclash** | scene-fail | **MISSED (J2)** | **MISSED (J2)** | **MISSED (J2)** |
| fail-lastmonth | scene-fail | caught | caught | caught |

**Old seeded 15/15, clean false positives 0.** New cases, per judge call:

| | J1 on the needle | no J1 on the needle |
|---|---|---|
| scene-fail (must FAIL) | TP 9 | **FN 6** |
| | any J1 | no J1 |
| scene-pass (must PASS) | FP 0 | TN 15 |

Spend **$2.1375** over 57 judge calls.

## The six misses are one case shape, and the judge SAW every one

Both missed cases are an invented chart fact used as a CAUSE:

- `fail-hourwood`: "Dalam keseharian, ini bisa terasa di pagi hari, karena Pilar Arah-mu dipenuhi
  unsur Kayu." Chart A has no Wood (`element_missing_Wood`; hour pillar 癸巳). All three runs: J2,
  unsupported "The causal claim that Pilar Arah is filled with Wood, when the chart explicitly
  states Wood is missing (0) and the hour pillar is Water/Fire (癸巳)."
- `fail-monthclash`: "Misalnya, ketika kalian berdebat soal uang, biasanya itu karena Pilar Kerja
  kalian berdua saling berbenturan." Months 酉 / 寅; every cross-chart hit in the payload lands on
  a day seat. All three runs: J2, unsupported "... an invented chart relationship used as a cause"
  (run 2 in Indonesian, same claim).

The invention is caught; it is filed under the ADVISORY class. The cause is the rubric, not the
model: the new J2 text ("a CHART cause the engine did not supply ... the supplied facts do not
contain that chart fact") describes these sentences exactly, and so does J1's ("a chart fact
... the supplied facts do not give"). Two classes claim the same sentence and the model picks the
one whose name says "cause". AD's own C4 example ("because your month pillar is Fire" when it is
not) is this shape.

The two cases that avoid "karena" (past events) were caught 9/9, and every scene-pass passed 15/15:
the scene boundary itself works.

## Not decided here (Cowork's call)

The candidate fix is a precedence line, not a looser rubric: "If the cause is itself a chart fact,
star, pillar, position or relationship the supplied facts do not contain, it is J1, not J2. J2 is
only for a link the engine does not make between SUPPLIED facts." It moves these six into the gate.
One more calibration run is about $2.14 (this run's spend). It would be round 2 of this experiment.

## The instrument was shown able to fail before it ran

`scripts/calibrate-j1.mjs --dry` throws before spending on a needle absent from its planted text
(run with `fail-hourwood`'s needle changed: "fail-hourwood: needle not in seeded text") and on a
false premise (months changed: "seed premise false: fail-monthclash: months 酉 / 寅"), and its
scorer refuses a J2 as a scene-fail catch. Raw output: `reports/voice-v2/round3/j1-recalibration-2026-09-26.{json,log}`
(gitignored).
