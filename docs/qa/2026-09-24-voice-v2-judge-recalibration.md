# Voice v2 judge after the fix round, 2026-09-24: PASSES the instrument, still advisory

Branch `feat/voice-v2` at `5e62077` (fix round a-e), STAGE6 `1.29.0` (judge advisory). Instrument unchanged
from the first calibration (`docs/qa/2026-09-24-voice-v2-judge-calibration.md`) except its price table:
`scripts/calibrate-judge.mjs`, 3 runs, the same clean set (S1-S4 parsed from the worksheet, the worked
example alone) and the same four seeds.

```
node --conditions=react-server scripts/calibrate-judge.mjs --runs 3
```

What changed in the judge (Reyner's fix round, grounding and implementation only, classes untouched):
(a) provenance relation fields are grounding, every emitted value glossed from its defining code;
(b) J3 described concretely, absolute words as illustrations only, one invented pass and one invented fail
example; (c) J4 only over the render's own required points; (d) non-findings rejected, `none` removed;
(e) judge on `gemini-3.1-pro-preview` (what `gemini-pro-latest` resolved to), writer unchanged.

**The judge stays ADVISORY whatever this says** (Reyner's clarification, 2026-09-24). D1-D4 alone gate v2.

## Catch table (3 runs each)

| Class | Seed | Caught | The finding (run 1) |
|---|---|---|---|
| J1 | "Bintang Perantau (Travelling Horse)" at Pilar Kerja | 3/3 | grounding `void_stack_month, badge_桃花, badge_天乙貴人`; "not in the supplied facts" |
| J2 | "Bintang Penolong muncul di pilar ini karena Tanda Kekosongan membuat orang kasihan padamu." | 3/3 | grounding `badge_天乙貴人, void_stack_month`; "Tidak ada relasi kausalitas atau makna yang mendukung" |
| J3 | "Kamu tidak pernah bisa melepasnya, dalam keadaan apa pun." (was "Kamu jarang bisa.") | **3/3** (0/3 before) | grounding `aspek_convergence_正官`; "stronger than the hedged grounding 'jarang memberi izin'" |
| J4 | S1 with the Void's cost removed | 3/3 | `void_stack_month`, missing `cost` |

Worked example: flagged in **0 of 6** runs that carry it (3 alone, 3 inside S3). Before: 3 of 6.

## False positives: 12 over 27 calls (16 before)

| Case | Class, spec severity | Runs | Sentence and grounding |
|---|---|---|---|
| S1 | J2 hard | **2/3** | "Justru karena itu, kamu tahu persis berapa usaha di baliknya, dan usaha itu tidak pernah terasa cukup." grounding `void_stack_month`; supported "hard work (gift) ... never enough (cost)"; unsupported "the causal link ("Justru karena itu")". This is the worksheet's OWN interpretive move ("connects the void's gift to its cost"), so it is a false positive by the spec's grounding note. |
| S3 | J4 soft (`other`) | 3/3 (2, 2, 1 findings) | `aspek_convergence_正官`: "misses the core label_meaning ... does what is right even when unseen"; `spouse_palace`: "fails to include ... a relationship texture that feels normal to the reader". |
| seed-J3 | J4 soft (`other`) | 3/3 (2, 2, 1) | the same two, on S3's text with the J3 seed planted. |

**The ten J4 findings are contestable rather than plainly wrong.** S3 is a fragment and its worksheet note
claims `label_meaning` "interpretation" for 正官; the judge reads the label meaning itself as absent, and
for `spouse_palace` S3 names the palace without its meaning. Counted as false positives because the
instrument scores every clean-set finding that way; flagged for Cowork rather than decided.

Gone since the first run: the hard J2 on S2 "Api menyala dari kayu." (3/3 before, 0/3 now: fix a), both
hard J2s on S4's palace hits (2/3 before, 0/3), the J4-with-empty-list on the worked example (3/3 before,
0/3: fix c), and the `missing: none` non-findings (3/3 before, 0/3: fix d).

## Stability

Catches are 3/3 on every class. Clean S2, S4 and the worked example are 0/3 in all runs. The unstable ones:
S1's J2 (runs 1 and 3, not 2) and the S3 J4 count (2, 2, 1). Temperature is 0; Pro still varies, so a single
run of any judge verdict is one draw.

## Cost

$1.0862 over 27 calls: $0.018 (worked example alone) to $0.064 (S3) per call, about 6,000 prompt tokens and
1,000-4,000 thought tokens each ($2 / $12 per M, Standard, <= 200k prompts, ai.google.dev pricing read
2026-09-24). Thought tokens are most of it. The cost per real chart is in the render record
(`reports/voice-v2/`, and the round's summary), because a full reading's payload is larger than a fragment's.
