# compat voice — round2-fixed-draw1

pairs 10 | blocks measured 62 | floors 4/10
gate 1.24.0 | prompt 6e7b2997b97c40a3

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   11  ###########
  0.60-0.79   13  #############
  0.40-0.59   19  ###################
  <0.40        9  #########
  median 0.71 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        33  #################################
  0.80-0.99   14  ##############
  0.60-0.79    2  ##
  0.40-0.59   12  ############
  <0.40        1  #
  median 1.00

## absolute block words (comparable across runs; the ratio below is not)
  median 29 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.80 | min 0.25 | max 1.65

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 6  median 0.62
  p2_day_pair          n=10  median 0.52
  p2_palace_frame      n= 4  median 0.41
  p2_reframe           n= 1  median 0.46
  p3_same_imbalance    n= 1  median 0.36
  p3_supply            n=10  median 0.71
  p4_temperament       n=10  median 0.81
  p5_pull_fit          n=10  median 0.72

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      10
  style.essay_connectives            4
  style.tension_collapse             3
  style.hedge_construction           2
  pair.reframe_missing               1

## per pair: what happened, and why
  2x6          model  attempts 2
      rejected: style.hedge_construction, style.hedging
  1x2          model  attempts 1
  13x11        model  attempts 1
  12x6         FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedge_construction, style.hedging, style.tension_collapse
  1x12         model  attempts 2
      rejected: style.essay_connectives
  3x7          model  attempts 1
      flagged:  pair.direction_resolved
  1x3          FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, style.essay_connectives
  2x8          model  attempts 1
  1x101        FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.tension_collapse, style.hedging, style.essay_connectives
      flagged:  pair.direction_resolved
  Y-1 fixture  FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, pair.reframe_missing

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.direction_resolved            2
  readings carrying at least one flag  2/10
  p0_model_wrote_anyway (attempts)     0
