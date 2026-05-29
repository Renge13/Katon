// ============================================================
// Section composer — Pola di Tubuh & Energi (Body & Energy)
// ============================================================
// Body / energy patterns as REFLECTION, not advice.
// "What your body might be telling you about how you live."
// Conditional inserts based on element imbalances.
// ============================================================

import passages from '../passages/polaDiTubuh.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Tubuh & Energi'
const SECTION_KEY = 'polaDiTubuh'

const RULES = [
  (c) => F.hasFireExcess(c)  ? 'fireExcess'  : null,
  (c) => F.hasWaterExcess(c) ? 'waterExcess' : null,
  (c) => F.hasEarthExcess(c) ? 'earthExcess' : null,
  (c) => F.missingElement(c) === 'Wood'  ? 'missingWood'  : null,
  (c) => F.missingElement(c) === 'Water' ? 'missingWater' : null,
  (c) => F.missingElement(c) === 'Fire'  ? 'missingFire'  : null,
]

export function composePolaDiTubuh(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
