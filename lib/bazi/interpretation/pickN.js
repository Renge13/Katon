import { cyrb53 } from './hash.js'

// Deterministic pseudo-random selection from a pool.
// Returns N items from `pool`, where N items are chosen by sorting pool indices
// by hash(`${seed}:${i}`) and taking the first N. Output preserves the chosen
// items in the order their hashes sorted to — so two charts with the same seed
// always get the same items in the same order, but charts with different seeds
// get visibly different selections.
//
// If pool.length <= n, returns a copy of pool unchanged.

export function pickN(pool, n, seed) {
  if (!Array.isArray(pool) || pool.length === 0) return []
  if (pool.length <= n) return [...pool]
  return pool
    .map((item, i) => ({ item, h: cyrb53(`${seed}:${i}`) }))
    .sort((a, b) => a.h - b.h)
    .slice(0, n)
    .map((x) => x.item)
}
