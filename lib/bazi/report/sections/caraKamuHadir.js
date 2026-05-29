// ============================================================
// Section composer — Cara Kamu Hadir (How You Show Up)
// ============================================================
// Personality patterns. Conditional inserts personalize the
// archetype's core observation based on:
//   - doubled branches (amplified energies)
//   - water at month pillar (intuition layer)
//   - hidden metal in chart (decisiveness undercurrent)
//   - fire or earth excess
// ============================================================

import passages from '../passages/caraKamuHadir.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Cara Kamu Hadir'
const SECTION_KEY = 'caraKamuHadir'

const RULES = [
  (c) => F.hasDoubleBranch(c, '巳') ? 'doubleBranch_巳' : null,
  (c) => F.hasDoubleBranch(c, '午') ? 'doubleBranch_午' : null,
  (c) => F.hasDoubleBranch(c, '子') ? 'doubleBranch_子' : null,
  (c) => F.stemElementAtPillar(c, 'month', 'Water') ? 'waterAtMonth' : null,
  (c) => F.chartStoresElement(c, 'Metal') ? 'metalHidden' : null,
  (c) => F.hasFireExcess(c)  ? 'fireExcess'  : null,
  (c) => F.hasEarthExcess(c) ? 'earthExcess' : null,
]

export function composeCaraKamuHadir(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
