// ============================================================
// Chart-feature detectors — pure functions on chart
// ============================================================
// These predicates power the deterministic report composer.
// Each detector inspects a chart and returns a boolean or scalar
// describing a specific structural feature (e.g. doubled branch,
// hidden Metal, dominant Earth). Section composers chain these
// to decide which conditional inserts to add to a passage.
//
// All detectors are pure, fast, and side-effect free. Same chart
// always returns the same feature set.
// ============================================================

import { STEM_ELEMENTS, HIDDEN_STEMS } from '../stems.js'

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
const PILLAR_KEYS = ['year', 'month', 'day', 'hour']

/* ── Branch presence ─────────────────────────────────────── */

/** True if `branch` appears in any of the 4 pillars' branches. */
export function hasBranchInChart(chart, branch) {
  return PILLAR_KEYS.some((k) => chart?.[k]?.branch === branch)
}

/** Count of pillars whose branch equals `branch`. */
export function countBranch(chart, branch) {
  return PILLAR_KEYS.reduce((n, k) => n + (chart?.[k]?.branch === branch ? 1 : 0), 0)
}

/** True if `branch` appears in ≥ 2 pillars. */
export function hasDoubleBranch(chart, branch) {
  return countBranch(chart, branch) >= 2
}

/** Returns all branches that appear ≥ 2 times in the chart. */
export function doubledBranches(chart) {
  const counts = {}
  for (const k of PILLAR_KEYS) {
    const b = chart?.[k]?.branch
    if (b) counts[b] = (counts[b] || 0) + 1
  }
  return Object.keys(counts).filter((b) => counts[b] >= 2)
}

/* ── Hidden stems (藏干) — what a branch stores ───────────── */

/** True if `branch` stores any stem of `element` (any hidden weight). */
export function branchStoresElement(branch, element) {
  const hidden = HIDDEN_STEMS[branch] || []
  return hidden.some((h) => STEM_ELEMENTS[h.stem] === element)
}

/** True if any branch in the chart stores `element` via hidden stems. */
export function chartStoresElement(chart, element) {
  return PILLAR_KEYS.some((k) => {
    const b = chart?.[k]?.branch
    return b && branchStoresElement(b, element)
  })
}

/** Pillars that store `element` via hidden stems (e.g. ['month', 'day']). */
export function pillarsStoringElement(chart, element) {
  return PILLAR_KEYS.filter((k) => {
    const b = chart?.[k]?.branch
    return b && branchStoresElement(b, element)
  })
}

/* ── Pillar-level element checks ─────────────────────────── */

/**
 * True if a specific pillar's STEM element equals `element`.
 * e.g. elementAtPillar(chart, 'month', 'Water') checks chart.month.stem.
 */
export function stemElementAtPillar(chart, pillar, element) {
  const stem = chart?.[pillar]?.stem
  return stem ? STEM_ELEMENTS[stem] === element : false
}

/** True if a specific pillar's BRANCH element equals `element`. */
export function branchElementAtPillar(chart, pillar, element) {
  return chart?.[pillar]?.element === element
}

/* ── Element balance ──────────────────────────────────────── */

/** Returns the element with the highest weighted count, or null. */
export function dominantElement(chart) {
  const b = chart?.elementBalance || {}
  let dom = null
  let max = 0
  for (const el of ELEMENTS) {
    const v = b[el] || 0
    if (v > max) { max = v; dom = el }
  }
  return dom
}

/** Returns the first element with count 0, or null. */
export function missingElement(chart) {
  const b = chart?.elementBalance || {}
  for (const el of ELEMENTS) {
    if ((b[el] || 0) === 0) return el
  }
  return null
}

/** True if `element` weighted count exceeds `threshold` (default 2.5). */
export function hasElementExcess(chart, element, threshold = 2.5) {
  const b = chart?.elementBalance || {}
  return (b[element] || 0) > threshold
}

/** True if `element` is the Day Master's own element. */
export function isOwnElement(chart, element) {
  return chart?.dayMaster?.element === element
}

/* ── Day master relations to other elements ──────────────── */

/** Generation cycle: Wood → Fire → Earth → Metal → Water → Wood */
const GENERATES = {
  Wood:  'Fire',
  Fire:  'Earth',
  Earth: 'Metal',
  Metal: 'Water',
  Water: 'Wood',
}

/** Control cycle: Wood⟶Earth, Earth⟶Water, Water⟶Fire, Fire⟶Metal, Metal⟶Wood */
const CONTROLS = {
  Wood:  'Earth',
  Earth: 'Water',
  Water: 'Fire',
  Fire:  'Metal',
  Metal: 'Wood',
}

/**
 * Returns the relation between the Day Master element and `other`:
 *   'self'         — same element
 *   'generates'    — DM generates other (DM is parent / output)
 *   'generated-by' — other generates DM (DM is child / resource)
 *   'controls'     — DM controls other (DM is officer / wealth)
 *   'controlled-by'— other controls DM (DM is subordinate / threat)
 */
export function dayMasterRelation(chart, other) {
  const dm = chart?.dayMaster?.element
  if (!dm || !other) return null
  if (dm === other) return 'self'
  if (GENERATES[dm] === other) return 'generates'
  if (GENERATES[other] === dm) return 'generated-by'
  if (CONTROLS[dm] === other) return 'controls'
  if (CONTROLS[other] === dm) return 'controlled-by'
  return null
}

/* ── Convenience predicates for common patterns ──────────── */

/** True if the chart has Fire excess (own + hidden weights). */
export const hasFireExcess  = (chart) => hasElementExcess(chart, 'Fire')
export const hasWaterExcess = (chart) => hasElementExcess(chart, 'Water')
export const hasEarthExcess = (chart) => hasElementExcess(chart, 'Earth')
export const hasMetalExcess = (chart) => hasElementExcess(chart, 'Metal')
export const hasWoodExcess  = (chart) => hasElementExcess(chart, 'Wood')

/** True if Day Master is at the named pillar position (always 'day' but kept for clarity). */
export const isDayPillar = (pillar) => pillar === 'day'
