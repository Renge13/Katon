<!--
STATUS: HANDOVER — Prompt C session 4. Created 2026-08-01 after 107e7c3 / d39ad23.
Ruling: 土旺於四季 ADOPTED and locked. Grid winner correctly declined. One new diagnostic
that constrains what the concave transform can possibly fix.
-->

# C5 — Earth ruling adopted. And a falsifiable prediction before you test the transform.

## RULING: 土旺於四季 IS ADOPTED AND LOCKED

The evidence is as clean as this kind of evidence gets:

```
                        earth   season-tail
O3 mean Spearman        0.682      0.782
O3 pair concordance     79.8%      84.5%
O3 exact rank            2/13       3/13
```

What makes it conclusive is not the aggregate, it is the attribution:

- **All nine non-Earth-month charts are bit-identical.** Not a global reshuffle that happens to score
  better.
- **Four of five Earth-month charts improve.** The fifth was already at rho 1.00 and could not.
- **Nothing regresses.** Chart 9 goes rho 0.20 to 0.90.

Combined with the classical grounding (土旺於四季 — Earth rules the tail of each season, not a season
of its own), that is both empirically and doctrinally supported. It goes into `CLAUDE.md` as a locked
calculation rule.

**One caveat, recorded honestly:** five Earth-month charts is a small sample. The direction is not in
doubt; the magnitude is fitted on five charts. Re-check if the fixture ever grows.

## RULING: you were right to decline the grid winner

`{2.4, 1.2, 0.8, 0.6, 0.4}` at rho 0.863 is tempting and you left it on the table. Correct.

Your reasoning — that banking a 71% increase in 旺 before testing the concave transform would be
fitting a parameter to a missing model feature — is exactly right, and here is the sharper version:
**a steepened 旺 and a concave presence transform are confounded.** Both compress the spread and
amplify the top. Whichever you fit first will absorb the other's explanatory work, and you will never
learn which was real. Test the principled one first, then re-fit 旺 against whatever residual is left.

Also worth stating: the *shape* recovering to a monotone ladder is the real signal, more than the
distance halving. Session 2's winner flattened 相/休/囚/死 to a single value, which is an optimiser
routing around a broken assumption. A proper monotone ladder is a model that is nearly right.

## NEW DIAGNOSTIC — what the concave transform CANNOT fix

I checked whether higher stem presence always means a higher bar, **within a single element** (where
the seasonal multiplier is identical and therefore cancels out).

```
comparable within-element pairs:  57
inversions:                        9   (16%)
```

**A monotone transform preserves order. It cannot fix a single one of these nine.**

Every inversion:

```
ch1  Earth  DM丙   戊(pres 0.2, bar 50) BEAT 己(pres 1.0, bar 42)
ch4  Metal  DM癸   庚(pres 0.3, bar 29) BEAT 辛(pres 1.0, bar 20)
ch5  Wood   DM丙   乙(pres 0.4, bar 64) BEAT 甲(pres 1.0, bar 61)
ch6  Earth  DM壬   戊(pres 0.8, bar 63) BEAT 己(pres 1.0, bar 20)
ch7  Fire   DM甲   丁(pres 0.6, bar 83) BEAT 丙(pres 1.0, bar 76)
ch7  Earth  DM甲   己(pres 0.4, bar 60) BEAT 戊(pres 1.0, bar 48)
ch9  Wood   DM甲   乙(pres 0.4, bar 64) BEAT 甲(pres 1.0, bar 42)
ch10 Metal  DM甲   辛(pres 0.4, bar 38) BEAT 庚(pres 1.0, bar 29)
ch11 Metal  DM庚   辛(pres 0.1, bar 55) BEAT 庚(pres 2.0, bar 52)
```

**Polarity does not explain it.** The winner shares the Day Master's polarity in only 2 of 9 — near
chance. The pair-polarity mode you already measured as worse is not the missing term either.

Note ch11: 庚 carries presence 2.0 (year stem plus the Day Master itself) and still loses to 辛 at 0.1.
And ch9: the Day Master's own stem 甲 at 1.0 loses to 乙 at 0.4. So it is not a visible-versus-hidden
weighting, and not a Day Master bonus.

### THE PREDICTION — write it down before you run the test

**The concave transform should improve cross-element compression and leave all nine of these pairs
inverted. Chart 1 should stay poor (currently rho 0.30).**

If the transform appears to fix chart 1, the implementation is wrong — most likely it has stopped being
monotone, or it is being applied after the seasonal multiplier rather than to presence itself. A test
that "succeeds" against this prediction is a bug, not a result.

### CANDIDATE EXPLANATIONS for the 16% residual — do not improvise, test

Listed without endorsement. `CLAUDE.md` rule 4 applies: none of these gets implemented on a hunch.

1. **Different qi shares.** Joey may not use 60/30/10. Our shares are conventional but not universal.
2. **Branch-position weighting.** The month branch may carry more weight than year/day/hour.
3. **Twelve life stages (十二長生).** Joey may score each stem by its life stage in the month branch
   rather than by accumulated presence. This is a genuinely different mechanism and would naturally
   produce order inversions.
4. **Combination and clash transformation.** A branch pulled into a 三合 or 半合 may contribute its
   transformed element rather than its literal hidden stems.

(3) is the most interesting because it is a different mechanism rather than a reweighting, and Joey's
own output prints a life-stage label per luck pillar, so he clearly computes them.

## SEQUENCE FOR SESSION 4

1. Test the concave transform on presence. Report O3 before/after **and** whether the nine inversions
   moved. State the prediction in the report so it is falsifiable.
2. Re-fit 旺 against the residual only after the transform is settled.
3. Then, if the 16% residual persists, take the candidate list above one at a time — measured, not
   blended.

**Do not blend two candidates in one measurement.** That is the mistake ruling B was written to
prevent and it applies just as much here.

## ONE THING WORTH CARRYING FORWARD

Your note that session 2's "2/13" read as near-total failure when the full distribution was
Spearman 0.78 is the most transferable lesson in this build. **A hard threshold on a noisy tail hid a
model that was substantially right.** Design the metric to see the whole distribution before
concluding anything is broken.
