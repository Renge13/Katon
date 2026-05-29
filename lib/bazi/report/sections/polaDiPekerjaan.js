// ============================================================
// Section composer — Pola di Pekerjaan (Work Patterns)
// ============================================================
// Work patterns. NOT career advice. Conditional inserts based on:
//   - metal in chart (finishing / execution energy)
//   - water excess (strategy / depth)
//   - fire excess (performer / visibility energy)
//   - day branch stores metal (hands-on completion)
//   - wood excess (vision / building energy)
// ============================================================

import passages from '../passages/polaDiPekerjaan.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Pola di Pekerjaan'
const SECTION_KEY = 'polaDiPekerjaan'

const RULES = [
  (c) => F.chartStoresElement(c, 'Metal') ? 'metalInChart' : null,
  (c) => F.hasWaterExcess(c) ? 'waterExcess' : null,
  (c) => F.hasFireExcess(c)  ? 'fireExcess'  : null,
  (c) => F.hasWoodExcess(c)  ? 'woodExcess'  : null,
  (c) => F.branchStoresElement(c?.day?.branch, 'Metal') ? 'metalAtDay' : null,
  (c) => F.dominantElement(c) === 'Earth' ? 'earthDominant' : null,
]

export function composePolaDiPekerjaan(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
