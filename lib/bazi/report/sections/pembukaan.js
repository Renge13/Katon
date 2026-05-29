// ============================================================
// Section composer — Pembukaan (Opening)
// ============================================================
// Sets the reflective frame. Naming the archetype as metaphor.
// Few conditional inserts here — opening should read consistent
// across charts of the same archetype.
// ============================================================

import passages from '../passages/pembukaan.js'
import { sectionFromPassage } from './_helpers.js'

const TITLE = 'Pola Dasar'
const SECTION_KEY = 'pembukaan'

// Opening rarely branches on chart features. Keep rules empty
// unless a future archetype needs a chart-specific framing line.
const RULES = []

export function composePembukaan(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
