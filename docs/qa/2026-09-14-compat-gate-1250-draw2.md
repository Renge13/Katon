# compat voice — Z-close gate 1.25.0, draw 2

pairs 10 | blocks measured 63 | floors 1/10
gate 1.25.0 | prompt 6e7b2997b97c40a3

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   13  #############
  0.60-0.79   29  #############################
  0.40-0.59    7  #######
  <0.40        4  ####
  median 0.74 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        16  ################
  0.80-0.99   20  ####################
  0.60-0.79    5  #####
  0.40-0.59   17  #################
  <0.40        5  #####
  median 0.82

## absolute block words (comparable across runs; the ratio below is not)
  median 46 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.87 | min 0.30 | max 1.90

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 9  median 0.71
  p2_day_pair          n=10  median 0.77
  p2_palace_frame      n= 3  median 0.66
  p2_reframe           n= 1  median 0.46
  p3_supply            n=10  median 0.69
  p4_temperament       n=10  median 0.93
  p5_pull_fit          n=10  median 0.72

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      6
  style.essay_connectives            2
  style.tension_collapse             2
  style.raw_pillar                   1

## FLOOR RATE, WITH FIXED DENOMINATORS (Z-close section 3)
   the second row is the number R2 is meant to move: pairs the compat prompt
   MANDATES the p2_reframe move for (clash / harm / punishment)
  overall                       1/10
  pairs carrying p2_reframe     1/4   [2x6:p2_clash 1x12:p2_punishment 2x8:p2_punishment Y-1 fixture:p2_harm]
  pairs without it              0/6

## REJECTING LITERALS, and whether the model wrote them or transcribed them
   the source column is the (fact, seed field) whose text shares the most
   distinctive stems with the SENTENCE that carried the literal, by the same
   stemOverlap the gate uses. It is a CONTENT match, not a positional one:
   the model writes one block as two paragraphs, so a prose chunk index is
   not a block index (probed 2026-09-13, 8 chunks against 6 served blocks).
  style.essay_connectives  (2)
      2x6          p5_pull_fit.daily_seed 0.25
          "ra alami. Hal ini membuat hubungan kalian jarang d"
      2x6          p5_pull_fit.meaning_seed 0.57
          "seiring. Hal ini menciptakan hubungan yang terasa"
  style.hedging  (6)
      2x6          p2_reframe.daily_seed 1.00
          ", gesekan cenderung dipendam sampai menjadi percik"
      2x6          p2_reframe.daily_seed 1.00
          ", gesekan cenderung dipendam sampai menjadi percik"
      3x7          not found in this attempt
          "lian yang cenderung berjalan sendiri. Manfaatkan k"
      1x3          p1_stem_relation.daily_seed 0.57
          "k, kalian cenderung memakai strategi bertahan yang"
      1x101        p1_stem_relation.daily_seed 0.50
          "k, kalian cenderung menggunakan strategi bertahan"
      Y-1 fixture  p2_reframe.daily_seed 0.60
          ", gesekan cenderung dipendam sampai menjadi percik"
  style.raw_pillar  (1)
      3x7          not found in this attempt
          "n di luar pilar hari. Kalian bisa berada di ruang"
  style.tension_collapse  (2)
      1x3          p5_pull_fit.meaning_seed 0.17
          "ian tetap selaras."
      1x101        not found in this attempt
          "ri sangat selaras. Namun, hal yang paling mengesal"

## per pair: what happened, and why
  2x6          FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, style.essay_connectives
      flagged:  pair.penutup_register
  1x2          model  attempts 1
  13x11        model  attempts 1
  12x6         model  attempts 1
  1x12         model  attempts 1
  3x7          model  attempts 2
      rejected: style.hedging, style.raw_pillar
      flagged:  pair.direction_resolved
  1x3          model  attempts 2
      rejected: style.tension_collapse, style.hedging
      flagged:  pair.penutup_register
  2x8          model  attempts 1
  1x101        model  attempts 2
      rejected: style.tension_collapse, style.hedging
      flagged:  pair.penutup_register
  Y-1 fixture  model  attempts 2
      rejected: style.hedging

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.penutup_register              3
  pair.direction_resolved            1
  readings carrying at least one flag  4/10
  p0_model_wrote_anyway (attempts)     0
