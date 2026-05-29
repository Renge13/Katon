// ============================================================
// Section composer — Pola di Hubungan (Relationship Patterns)
// ============================================================
// How this archetype gives, receives, and withholds in close
// relationships. Conditional inserts based on:
//   - day branch hidden stems (partner/spouse position cues)
//   - fire excess (intensity)
//   - water excess (emotional depth)
//   - doubled branches (clash energy in relating)
// ============================================================

import passages from '../passages/polaDiHubungan.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Pola di Hubungan'
const SECTION_KEY = 'polaDiHubungan'

const RULES = [
  (c) => F.branchStoresElement(c?.day?.branch, 'Metal') ? 'dayBranchMetal' : null,
  (c) => F.branchStoresElement(c?.day?.branch, 'Wood')  ? 'dayBranchWood'  : null,
  (c) => F.branchStoresElement(c?.day?.branch, 'Fire')  ? 'dayBranchFire'  : null,
  (c) => F.branchStoresElement(c?.day?.branch, 'Water') ? 'dayBranchWater' : null,
  (c) => F.hasFireExcess(c)  ? 'fireExcess'  : null,
  (c) => F.hasWaterExcess(c) ? 'waterExcess' : null,
  (c) => F.doubledBranches(c).length > 0 ? 'doubledEnergies' : null,
]

export function composePolaDiHubungan(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
