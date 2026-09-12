# compat voice — round2-draw3

pairs 10 | blocks measured 62 | floors 4/10
gate 1.24.0 | prompt 0bab7b55609aa60f

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   12  ############
  0.60-0.79   13  #############
  0.40-0.59   17  #################
  <0.40       10  ##########
  median 0.69 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        32  ################################
  0.80-0.99   14  ##############
  0.60-0.79    4  ####
  0.40-0.59   10  ##########
  <0.40        2  ##
  median 1.00

## absolute block words (comparable across runs; the ratio below is not)
  median 20 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.80 | min 0.27 | max 1.59

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 6  median 0.64
  p2_day_pair          n=10  median 0.48
  p2_palace_frame      n= 3  median 0.41
  p2_reframe           n= 2  median 0.46
  p3_same_imbalance    n= 1  median 0.36
  p3_supply            n=10  median 0.67
  p4_temperament       n=10  median 0.77
  p5_pull_fit          n=10  median 0.74

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      9
  style.tension_collapse             5
  style.essay_connectives            3
  style.raw_pillar                   1
  style.unsanctioned_bracket         1
  style.hedge_construction           1

## per pair: what happened, and why
  2x6          model  attempts 2
      rejected: style.hedging
      flagged:  coverage.slot_filling
  1x2          model  attempts 1
  13x11        model  attempts 2
      rejected: style.tension_collapse
      flagged:  pair.direction_resolved
  12x6         model  attempts 2
      rejected: style.tension_collapse, style.hedging
  1x12         FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, style.essay_connectives
  3x7          model  attempts 1
  1x3          FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, style.raw_pillar
  2x8          model  attempts 1
  1x101        FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.tension_collapse, style.hedging, style.essay_connectives
  Y-1 fixture  FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedging, style.unsanctioned_bracket, style.hedge_construction

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  coverage.slot_filling              1
  pair.direction_resolved            1
  readings carrying at least one flag  2/10
  p0_model_wrote_anyway (attempts)     0
