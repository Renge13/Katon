# compat voice — Z-close gate 1.25.0, draw 1

pairs 10 | blocks measured 62 | floors 1/10
gate 1.25.0 | prompt 6e7b2997b97c40a3

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   16  ################
  0.60-0.79   21  #####################
  0.40-0.59   13  #############
  <0.40        2  ##
  median 0.77 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        18  ##################
  0.80-0.99   18  ##################
  0.60-0.79    7  #######
  0.40-0.59   13  #############
  <0.40        6  ######
  median 0.82

## absolute block words (comparable across runs; the ratio below is not)
  median 47 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.92 | min 0.27 | max 1.63

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 9  median 0.68
  p2_day_pair          n=10  median 0.55
  p2_palace_frame      n= 2  median 0.66
  p3_same_imbalance    n= 1  median 0.36
  p3_supply            n=10  median 0.75
  p4_temperament       n=10  median 0.91
  p5_pull_fit          n=10  median 0.78

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      4
  style.tension_collapse             2
  style.essay_connectives            2
  style.raw_pillar                   1

## FLOOR RATE, WITH FIXED DENOMINATORS (Z-close section 3)
   the second row is the number R2 is meant to move: pairs the compat prompt
   MANDATES the p2_reframe move for (clash / harm / punishment)
  overall                       1/10
  pairs carrying p2_reframe     0/4   [2x6:p2_clash 1x12:p2_punishment 2x8:p2_punishment Y-1 fixture:p2_harm]
  pairs without it              1/6

## REJECTING LITERALS, and whether the model wrote them or transcribed them
   the source column is the (fact, seed field) whose text shares the most
   distinctive stems with the SENTENCE that carried the literal, by the same
   stemOverlap the gate uses. It is a CONTENT match, not a positional one:
   the model writes one block as two paragraphs, so a prose chunk index is
   not a block index (probed 2026-09-13, 8 chunks against 6 served blocks).
  style.essay_connectives  (2)
      1x101        p3_same_imbalance.label_meaning 0.10
          "identik. Hal ini membuat cara pandang kalian terh"
      1x101        p3_same_imbalance.label_meaning 0.10
          "identik. Hal ini membuat cara pandang kalian sama"
  style.hedging  (4)
      2x6          p2_reframe.daily_seed 1.00
          ", gesekan cenderung dipendam sampai menjadi percik"
      1x3          p1_stem_relation.daily_seed 0.57
          "k, kalian cenderung memakai strategi bertahan yang"
      1x101        p1_stem_relation.daily_seed 0.57
          "k, kalian cenderung memakai strategi bertahan yang"
      1x101        p1_stem_relation.daily_seed 1.00
          "k, kalian cenderung memakai strategi bertahan yang"
  style.raw_pillar  (1)
      3x7          not found in this attempt
          "n di luar pilar hari. Kalian bisa berada di ruang"
  style.tension_collapse  (2)
      1x101        not found in this attempt
          "i menjadi selaras. Namun, hal yang paling mengesal"
      1x101        not found in this attempt
          "il sangat selaras. Namun, hal yang paling mengesal"

## per pair: what happened, and why
  2x6          model  attempts 2
      rejected: style.hedging
  1x2          model  attempts 1
  13x11        model  attempts 1
  12x6         model  attempts 1
  1x12         model  attempts 1
  3x7          model  attempts 2
      rejected: style.raw_pillar
  1x3          model  attempts 2
      rejected: style.hedging
      flagged:  pair.penutup_register
  2x8          model  attempts 1
  1x101        FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.tension_collapse, style.hedging, style.essay_connectives
  Y-1 fixture  model  attempts 1

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.penutup_register              1
  readings carrying at least one flag  1/10
  p0_model_wrote_anyway (attempts)     0
