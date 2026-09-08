# Compat renders, 20 draws pooled - THE BASELINE

**10 pairs x 2 draw(s) each.** The 2026-09-08 n=10 run was these same ten
pairs at one draw each, so this is the same coverage at twice the sample.

```
$ node --conditions=react-server scripts/qa-pair-renders.mjs --n 2
```

gate `1.23.0` | pair prompt `ceb898d80f52471c` | model `gemini-3.1-flash-lite`

```
2 x 6     q1  reframe=true  floor  0/2  attempts 2
1 x 2     q2  reframe=false floor  0/2  attempts 3
13 x 11   q2  reframe=false floor  0/2  attempts 4
12 x 6    q2  reframe=false floor  0/2  attempts 4
1 x 12    q2  reframe=true  floor  1/2  attempts 6
3 x 7     q3  reframe=false floor  0/2  attempts 2
1 x 3     q4  reframe=false floor  0/2  attempts 4
2 x 8     q4  reframe=true  floor  0/2  attempts 3
1 x 101   q4  reframe=false floor  0/2  attempts 4
9 x 11    q4  reframe=true  floor  0/2  attempts 4
```

```

POOLED FLOOR RATE  1/20 = 5.0%

REJECTIONS BY CHECK
    13  style.tension_collapse
     3  style.hedge_construction
     3  structure.duplicate_sentence
     3  style.hedging

REJECTIONS BY PLACE (check :: the excerpt the finding names)
     2  style.tension_collapse :: rian agar selaras dengan tar
     2  style.tension_collapse :: berjalan selaras. Hubungan i
     2  style.tension_collapse :: uan untuk saling melengkapi 
     2  style.tension_collapse :: itme agar selaras dengan keb
     1  style.hedge_construction :: atmu. Ini bukan tanda ketida
     1  style.tension_collapse :: rian agar selaras dengan keb
     1  style.tension_collapse :: dup tetap selaras. Hubungan 
     1  style.hedge_construction :: angan ini bukan penentu kega
     1  style.tension_collapse :: gar lebih selaras dengan keb
     1  style.hedge_construction :: sekan ini bukan tanda ketida
     1  style.hedging :: na kalian cenderung mengingi
     1  style.hedging :: rian yang mungkin terasa ber
     1  style.tension_collapse :: -masing. Saling Melengkapi d
     1  style.tension_collapse :: ih luas. Saling Melengkapi d
     1  style.hedging :: Kamu mungkin merasakan tekan

VERDICT FLAGS, PER PATTERN (flag severity: these rejected nothing)
     0  \b(tidak |kurang |sangat )?cocok\b
     0  \bberjodoh\b|\bjodoh\b
     0  \bpasangan (ideal|sempurna|tepat)\b
     0  \b(layak|pantas) (dipertahankan|dilanjutkan|ditinggalkan)\b
     0  \b(harus|sebaiknya) (putus|pisah|bertahan)\b
```

## WHAT THIS IS THE BASELINE FOR

**POOLED FLOOR RATE 1/20 = 5.0%. The mirror's ruled bar is 10% pooled. This run is BELOW it.**

**X-b3's floor-rate precondition is MET.** It was not met at the n=10 run (2/10 = 20%), and Reyner
released X-b3 on the three Stage 6 rulings rather than on the rate. The rate has now followed.

Nothing was loosened to reach it that Reyner did not rule. Four gate changes and one prompt change
landed between the two runs, each isolated, each with its own version bump:

| | | |
|---|---|---|
| `1.19.0` | `32d4bd6` | `tension_collapse` scoped per block by fact kind |
| `1.20.0` | `435505e` | `p0_opening` ruled; `both_named`'s floor exemption removed |
| `1.21.0` | `e5b0677` | the penutup scoped by whether the reading carries a tension |
| `1.22.0` | `91a07aa` | the five verdict patterns, at `flag` severity |
| `1.23.0` | `399d336` | the negation carve-out: `tidak`/`belum`/`kurang` before a token |

and the pair prompt went `9109d65d14b74e46` -> `ceb898d80f52471c`, which stopped the penutup being
ASKED for the summarising sentence that reached for `saling melengkapi`.

## DO NOT SUBTRACT THIS FROM THE n=10 RUN

**Two of those changes make the two runs non-comparable on REGENERATION BEHAVIOUR, and that is
stated here rather than left for a reader to notice:**

1. `91a07aa` changed the pair guard's finding shape from `code` to `check`. Both places that
   ATTRIBUTE a finding read `check`, so before it the regeneration directive told the model
   `- [undefined] the opening block must name both people`. **The model is now given a different
   instruction on any pair regeneration carrying a pair finding.**
2. The prompt changed. A floor rate across a prompt change is a different system.

The FLOOR RATE is still a fair before/after - it is the question "how often does a reader get module
assembly" and both runs answer it - but "attempts per draw" and "rejections per draw" are not, and
they are not compared here.

## WHAT STILL REJECTS, AND IT NO LONGER FLOORS READINGS

    style.tension_collapse      13 of 22 rejections (59%)
    style.hedge_construction     3
    structure.duplicate_sentence 3
    style.hedging                3

`tension_collapse` is still the leading cause, and **that is not the same finding as the n=10 run's
89%.** What changed is that it stops readings on the way rather than at the end: 22 rejections
across 20 draws produced exactly ONE floor. The regeneration budget is absorbing it.

The remaining hits are spread over six distinct excerpts with no dominant place, and most are one
construction:

    agar selaras dengan target ...          "so that it is in harmony WITH X"
    ritme agar selaras dengan kebutuhan
    agar lebih selaras dengan kebutuhan

`selaras dengan` is COMPARATIVE - it says one thing should align with another - where the banned
sense is a tension dissolving into harmony. **Not ruled on and not touched.** It is the same shape as
the `tidak selaras` finding that produced `1.23.0`, one step out, and the honest thing to say is
that this check has now needed two carve-outs and may need a third. That is a question about whether
the pattern is aimed at the right object, not a request for another lookbehind.

**A LIMIT OF THIS RUN, STATED:** the harness records the finding's own excerpt, not the BLOCK the
excerpt sits in, so "which surface" cannot be read off this table the way it could be off the n=4
cause check. If the next ruling needs that, the harness needs one more field.

## THE VERDICT PATTERNS FIRED ZERO TIMES

    0  \b(tidak |kurang |sangat )?cocok\b
    0  \bberjodoh\b|\bjodoh\b
    0  \bpasangan (ideal|sempurna|tepat)\b
    0  \b(layak|pantas) (dipertahankan|dilanjutkan|ditinggalkan)\b
    0  \b(harus|sebaiknya) (putus|pisah|bertahan)\b

**All five, across all 20 served readings.** They ship at `flag` severity precisely so this count
could be taken before any of them rejects anything, and the count is zero.

**WHAT ZERO DOES AND DOES NOT SUPPORT.** It says the model is not currently writing verdicts into a
compat reading - the prompt's own WHAT THIS READING MUST NEVER DO names `cocok` explicitly, and it
is being obeyed. It does NOT establish that escalating to `reject` is free: 20 draws is a small
sample for an event that may be rare rather than absent, and the cost of a false positive is a
regeneration on a reading that said nothing wrong. **Reyner decides the escalation** (NEXT.md, OWED
ON THE n=20 RE-MEASURE); this run supplies the number it asked for.

## WHAT THIS RUN DOES NOT ESTABLISH

**20 draws.** 1/20 has a binomial 95% interval of roughly **0.1% to 24.9%** - it does not establish
that compat is below the mirror's bar, only that this sample is. The mirror's own 10% was measured
over forty. A 40-draw replicate would narrow it, and it is not obviously worth buying: the rate moved
from 20% to 5% on ruled changes with named causes, and the next thing likely to move it is the
`selaras dengan` question above rather than sampling.

**Ten fixed pairs, not a random sample of readers.** Chosen for coverage - all four quadrants, four
raising `p2_reframe_required` - and the harness REFUSES if that coverage is not present, so the two
runs are the same population. It is not the population of real buyers, of whom there are none yet.

**One pair carried the only floor:** 1 x 12, q2, reframe required, 6 attempts across 2 draws. The
worst pair in the n=10 run was also a reframe pair. That is a direction, not a finding, at n=2 per
pair.
