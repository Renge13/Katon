# compat voice — round2-fixed-draw2

pairs 10 | blocks measured 63 | floors 1/10
gate 1.24.0 | prompt 6e7b2997b97c40a3

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   16  ################
  0.60-0.79   24  ########################
  0.40-0.59   11  ###########
  <0.40        2  ##
  median 0.76 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        18  ##################
  0.80-0.99   17  #################
  0.60-0.79    8  ########
  0.40-0.59   15  ###############
  <0.40        5  #####
  median 0.82

## absolute block words (comparable across runs; the ratio below is not)
  median 44 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.85 | min 0.30 | max 1.68

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 9  median 0.68
  p2_day_pair          n=10  median 0.71
  p2_palace_frame      n= 3  median 0.69
  p2_reframe           n= 1  median 0.46
  p3_supply            n=10  median 0.69
  p4_temperament       n=10  median 0.93
  p5_pull_fit          n=10  median 0.74

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      5
  style.hedge_construction           3
  style.tension_collapse             1

## per pair: what happened, and why
  2x6          model  attempts 2
      rejected: style.hedge_construction, style.hedging
  1x2          model  attempts 1
  13x11        model  attempts 1
  12x6         model  attempts 1
  1x12         model  attempts 1
  3x7          model  attempts 1
      flagged:  pair.direction_resolved
  1x3          model  attempts 2
      rejected: style.hedging
      flagged:  pair.penutup_register
  2x8          model  attempts 1
  1x101        model  attempts 2
      rejected: style.tension_collapse, style.hedging
      flagged:  pair.penutup_register
  Y-1 fixture  FLOOR  attempts 3  [stage6_budget_spent]
      rejected: style.hedge_construction, style.hedging

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.penutup_register              2
  pair.direction_resolved            1
  readings carrying at least one flag  3/10
  p0_model_wrote_anyway (attempts)     0
