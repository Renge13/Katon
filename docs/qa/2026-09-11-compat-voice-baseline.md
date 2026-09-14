# compat voice — baseline (current cells + current prompt)

pairs 10 | blocks measured 60 | floors 1/10
gate 1.23.0 | prompt ceb898d80f52471c

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00        43  ###########################################
  0.80-0.99   12  ############
  0.60-0.79    3  ###
  0.40-0.59    2  ##
  <0.40        0  
  median 1.00 | verbatim blocks 9

## block words / cell words (1.0 = the block is as long as its input)
  median 1.72 | min 0.85 | max 3.95

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 9  median 0.78
  p2_day_pair          n=10  median 1.00
  p2_palace_frame      n= 1  median 1.00
  p3_supply            n=10  median 1.00
  p4_temperament       n=10  median 1.00
  p5_pull_fit          n=10  median 1.00

## Stage 6 findings by check (rejections across all attempts)
  style.tension_collapse             7
  style.hedge_construction           3
  style.meta                         1
  style.hedging                      1
