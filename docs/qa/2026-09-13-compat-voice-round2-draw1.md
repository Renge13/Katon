# compat voice — round2-draw1

pairs 10 | blocks measured 62 | floors 1/10
gate 1.24.0 | prompt 0bab7b55609aa60f

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        10  ##########
  0.80-0.99   17  #################
  0.60-0.79   23  #######################
  0.40-0.59    9  #########
  <0.40        3  ###
  median 0.77 | verbatim blocks 0

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        18  ##################
  0.80-0.99   17  #################
  0.60-0.79    8  ########
  0.40-0.59   14  ##############
  <0.40        5  #####
  median 0.82

## absolute block words (comparable across runs; the ratio below is not)
  median 47 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.92 | min 0.30 | max 1.66

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 9  median 0.71
  p2_day_pair          n=10  median 0.70
  p2_palace_frame      n= 2  median 0.57
  p2_reframe           n= 1  median 0.46
  p3_supply            n=10  median 0.71
  p4_temperament       n=10  median 0.91
  p5_pull_fit          n=10  median 0.76

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      6
  style.unsanctioned_bracket         3
  style.tension_collapse             2
  style.essay_connectives            2
  style.raw_pillar                   1
  style.hedge_construction           1

## LOG-ONLY flags on the SERVED reading (denominator 10 readings)
   these reject nothing; a count here is a reading a reader would have received
  pair.direction_resolved            1
  readings carrying at least one flag  1/10
  p0_model_wrote_anyway (attempts)     0
