# Voice v2 judge calibration, 2026-09-24: FAILS

Branch `feat/voice-v2` at `ae7b63e` (judge J1-J4, STAGE6 1.27.0). Instrument: `scripts/calibrate-judge.mjs`.
Model `gemini-3.1-flash-lite`, temperature 0, judge prompt from spec §4b as committed.

```
node --conditions=react-server scripts/calibrate-judge.mjs --runs 3
```

Clean set: S1-S4 parsed from `docs/content/voice-v2-worksheet-2026-09-24.md` §5 at run time, plus the spec's
worked example on its own. Seeded set: one planted violation per class on a clean sample. Each case is
judged against only the required points the sample claims to carry (fragments, see the script header).

**Per Reyner's instruction ("If calibration fails, stop and report"), renders (step 7) were NOT run.**

## Catch table (3 runs each)

| Class | Seed | Caught |
|---|---|---|
| J1 invention | S1 + "Bintang Perantau (Travelling Horse)" at Pilar Kerja (chart A has no 驛馬) | 3/3 |
| J2 causality | S1 + "Bintang Penolong muncul di pilar ini karena Tanda Kekosongan membuat orang kasihan padamu." | 3/3 |
| J3 certainty | S3, "Kamu jarang bisa." -> "Kamu tidak pernah bisa melepasnya, dalam keadaan apa pun." | **0/3** |
| J4 dropped cost | S1 with the void's cost sentences removed | 3/3 |

J3 diagnostic (not part of the pass verdict, scratchpad script): a second seed aimed at a meaning that is
itself hedged, the 正官 cost "Kamu jarang memberi izin ... bersikap longgar" rewritten as "kamu sama sekali
tidak mampu bersikap longgar, bahkan sehari pun". **0/3, no findings at all.** The miss is the judge's, not
a weak seed.

## False positives (16 over 27 calls)

| Case | Class, severity | Runs | What |
|---|---|---|---|
| S2 | J2 hard | 3/3 | "Api menyala dari kayu." The input carried `element_missing_Wood.provenance.relation_to_day_master: "feeds"`; the judge says the link is "not explicitly stated in the provided meanings". |
| S4 | J2 hard x2 | 2/3 | "Pilar Akar-nya berbenturan dengan Fondasi Pasanganmu." and "Pilar Arah-nya ... bergesekan dengannya." Both grounded in `p2_palace_frame.b_hits_a`; the judge's own `unsupported` text concedes it ("which is indeed the Arah pillar"). Run 1 passed the same text. |
| WORKED alone | J4 hard x2 | 3/3 | Both worked-example sentences flagged J4 "missing cost" for 正官, with `required_points: []`. A J4 against an empty list. |
| seed-J1 | J4 soft | 3/3 | A J4 with `missing: "none"`, `unsupported: "None"`: a non-finding reported as one. |

Every one of these would have been acted on: the S2 and S4 J2 findings are hard, so a clean worksheet
sample floors or burns its only regeneration.

## The worked example

Inside S3: passed 3/3 (no finding on either sentence). Alone: flagged 3/3, but only by J4 coverage against an
empty required-points list, never by J1-J3. Recorded as FAIL because the instrument was written that way
before the run, not re-scored after it.

## What is the judge's and what is the implementation's

- **Implementation (mine, `lib/validate/judge.js`):** `wellFormed` accepts `unsupported: "None"` and
  `missing: "none"`. The `none` enum value invites the non-finding. Also, a J4 with no required points to
  cover should be impossible to act on.
- **Judge prompt / model:** J3 blind (0/6 over two seeds); J2 fires on relations the input supplies in
  provenance fields; non-deterministic at temperature 0 (S4 run 1 clean, runs 2-3 not).

Nothing was tuned. The prompt, the severities and the instrument are exactly as committed before the run.

Spend: $0.0437 over 27 judge calls (usageMetadata x $0.25 / $1.50 per M), plus $0.0048 for the J3 diagnostic.
