# compat voice — after (42 seeds + prompt fcdd1dd9)

pairs 10 | blocks measured 61 | floors 3/10
gate 1.23.0 | prompt fcdd1dd95968be52

## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)
  1.00         8  ########
  0.80-0.99   18  ##################
  0.60-0.79   19  ###################
  0.40-0.59    8  ########
  <0.40        8  ########
  median 0.75 | verbatim blocks 1

## cell-stem overlap against `label_meaning` ONLY — the comparable one
   (the full-cell ratio above changed denominator when the seeds landed; this did not)
  1.00        24  ########################
  0.80-0.99   10  ##########
  0.60-0.79   11  ###########
  0.40-0.59    8  ########
  <0.40        8  ########
  median 0.83

## absolute block words (comparable across runs; the ratio below is not)
  median 38 words

## block words / cell words (1.0 = the block is as long as its input)
  median 0.81 | min 0.25 | max 4.00

## per fact id (median overlap across the ten pairs)
  p0_opening           n=10  median 1.00
  p1_stem_relation     n= 7  median 0.71
  p2_day_pair          n=10  median 0.64
  p2_palace_frame      n= 3  median 0.41
  p3_same_imbalance    n= 1  median 0.36
  p3_supply            n=10  median 0.77
  p4_temperament       n=10  median 0.81
  p5_pull_fit          n=10  median 0.69

## Stage 6 findings by check (rejections across all attempts)
  style.hedging                      10
  style.raw_pillar                   3
  style.essay_connectives            3
  style.tension_collapse             3
  style.hedge_construction           2
