# compat voice — round2-draw2

pairs 10 | blocks measured 62 | floors 5/10
gate 1.24.0 | prompt 0bab7b55609aa60f

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   11  ###########
  0.60-0.79    8  ########
  0.40-0.59   20  ####################
  <0.40       13  #############
  median 0.55 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        39  #######################################
  0.80-0.99    8  ########
  0.60-0.79    4  ####
  0.40-0.59   10  ##########
  <0.40        1  #
  median 1.00

## absolute block words (comparable across runs; the ratio below is not)
  median 18 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.75 | min 0.25 | max 1.47

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 5  median 0.54
  p2_day_pair          n=10  median 0.45
  p2_palace_frame      n= 4  median 0.41
  p2_reframe           n= 2  median 0.46
  p3_same_imbalance    n= 1  median 0.36
  p3_supply            n=10  median 0.56
  p4_temperament       n=10  median 0.69
  p5_pull_fit          n=10  median 0.60

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      10
  style.unsanctioned_bracket         5
  style.essay_connectives            5
  style.hedge_construction           2
  style.tension_collapse             2

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.direction_resolved            3
  readings carrying at least one flag  3/10
  p0_model_wrote_anyway (attempts)     0
