# Voice v2 J1 calibration, 2026-09-25: PASS, and J1 becomes a hard gate

Round 3, step 1 (Reyner, 2026-09-24, `docs/prompts/AC-qris-walk-voice-round3.md` §B). Branch `feat/voice-v2` at
`6fa2a8f` (STAGE6 `1.32.0`), judge `gemini-3.1-pro-preview` (unchanged), judge prompt unchanged since `5e62077`.
Run before any round-3 render.

```
node --conditions=react-server scripts/calibrate-j1.mjs --dry                 # premises + scorer checks, spends nothing
node --conditions=react-server scripts/calibrate-j1.mjs --runs 3 --out reports/voice-v2/round3/j1-calibration-1.json
```

**The pass rule, verbatim from the ruling:** "J1 passes only if it catches EVERY seeded invented-fact violation in
all 3 runs AND produces ZERO J1 false positives on the clean set across all 3 runs."

## Result: PASS on the first calibration. No fix round was used.

| case | what it is | run 1 | run 2 | run 3 |
|---|---|---|---|---|
| S1 | clean, worksheet as written | clean | clean | clean |
| S2 | clean | clean | clean | clean |
| S3 | clean | clean | clean | clean |
| S4 | clean (pair) | clean | clean | clean |
| seed-S1 | Bintang Perantau at her Pilar Kerja | caught | caught | caught |
| seed-S2 | her day and year branches clash | caught | caught | caught |
| seed-S3 | Kayu is her most plentiful element | caught | caught | caught |
| seed-S4 | the two Pilar Akar bind each other | caught | caught | caught |
| fixture-g4WH4 | the real round-2 reading, whole | caught | caught | caught |

**Seeded caught 15/15. J1 false positives on the clean set: 0.** No J1 on any seeded case other than the seed.
Spend **$1.3206** over 27 judge calls ($0.025-$0.080 per call).

## The seeds, and why each is an invention

Each was checked against the payload it is judged with. The script asserts these premises before it spends
anything, so a seed that happened to be true of the chart stops the run.

| seed | planted sentence | the payload says |
|---|---|---|
| S1 | "Di pilar yang sama juga ada Bintang Perantau (Travelling Horse), yang membuatmu gelisah kalau terlalu lama di satu kantor." | chart A carries no `badge_驛馬` (chart B does) |
| S2 | "Cabang di Pilar Dirimu juga berbenturan dengan cabang di Pilar Akarmu." | A day 子, year 巳; no relation fact joins them |
| S3 | "Di baganmu, Kayu adalah unsur yang paling banyak." | `element_missing_Wood` (0%); Water is dominant |
| S4 | "Pilar Akarmu dan Pilar Akar-nya juga saling mengikat." | A year 巳, B year 午; every cross-chart hit in `p2_palace_frame` lands on a day seat |
| g4WH4 | the served round-2 v2 reading, unedited (`tests/fixtures/voice-v2-g4WH4-round2.json`) | `p3_supply`: B supplies **Wood** to A; `mirror.a` has `element_dominant_Water` |

S2-S4 avoid glossary term names on purpose. D1 already catches an invented NAME. The invention only J1 can
catch is one written in plain words, which is the shape of the real g4WH4 error.

## Every catch, with its grounding (run 1; runs 2 and 3 name the same claim)

- **seed-S1**: grounding `void_stack_month, badge_桃花, badge_天乙貴人`; supported "Pilar Kerja memang memiliki
  beberapa bintang atau tanda yang berkumpul di sana"; unsupported "Kehadiran Bintang Perantau (Travelling Horse)
  ... sama sekali tidak ada dalam fakta yang diberikan."
- **seed-S2**: grounding `chart, spouse_palace, relation_半合_巳酉`; unsupported "Klaim bahwa cabang di Pilar Diri
  berbenturan dengan cabang di Pilar Akar memperkenalkan fakta relasi (benturan/clash) yang tidak ada dalam data".
- **seed-S3**: grounding `element_presence, element_missing_Wood`; unsupported "The claim that Wood is the most
  abundant element, which directly contradicts the chart facts stating that Wood is 0 and is the missing element."
- **seed-S4**: grounding `p2_palace_frame` (run 2 also the three branch relations); unsupported "Klaim bahwa Pilar
  Akar A dan Pilar Akar B saling mengikat tidak didukung oleh fakta relasi mana pun yang diberikan."
- **fixture-g4WH4**: sentence "Namun, di sinilah letak kekuatannya: dia membawa elemen Air yang tidak dominan di
  baganmu, memberikan keseimbangan yang menenangkan di area yang tadinya rawan rapuh."; grounding `p3_supply,
  element_dominant_Water`; unsupported "Klaim bahwa dia (B) membawa elemen Air untuk A dan bahwa Air tidak dominan
  di bagan A. Fakta menunjukkan B membawa Kayu untuk A, dan elemen Air justru dominan di bagan A."

## What else the judge said (NOT scored: J2-J4 stay advisory)

- S1 run 3: J2 on "Justru karena itu, kamu tahu persis berapa usaha di baliknya, dan usaha itu tidak pernah terasa
  cukup." The same clean-set J2 as in the recalibration (2 of 3 there, 1 of 3 here).
- S3, all three runs: J4 `spouse_palace` (other), "misses the core meaning that its contents show the texture of
  relationships that feels normal to the reader". The same contestable J4 as in the recalibration.
- seed-S3 runs 2-3 also J4 `aspek_convergence_正官` (other). fixture-g4WH4, all runs: J4 `p4_temperament` (other).

## The instrument was shown able to fail before it ran

`scripts/calibrate-j1.mjs` throws before spending if: a seed's anchor is not found (`plant`); a needle is absent from
its seeded text or already present in the clean sample; the scorer accepts a J2 as a J1 catch, or a J1 quoting
other text, or refuses a J1 on the needle. Its first dry run DID throw: the fixture looked itself up as its own
clean sample ("needle already in the clean sample"). That was a lookup bug in the check, fixed before any spend.

## What follows (the ruling's step 4)

J1 is a hard gate from STAGE6 `1.33.0`: a J1 finding regenerates once with the quoted finding fed back, and a
second J1 serves the floor. J2-J4 stay advisory: logged, stored with the render, never blocking. No writer
constraint was added from any judge finding.
