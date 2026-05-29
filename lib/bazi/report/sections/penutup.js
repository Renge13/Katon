// ============================================================
// Section composer — Penutup (Closing)
// ============================================================
// Names the central tension of this archetype (the strength
// that's also the trap), leaves an open invitation. Few
// branching rules — closer should read steady across charts
// of the same archetype.
// ============================================================

import passages from '../passages/penutup.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Refleksi Akhir'
const SECTION_KEY = 'penutup'

const RULES = [
  // Optional: surface a single dominant or missing element note
  (c) => F.missingElement(c) ? `missing_${F.missingElement(c)}` : null,
]

export function composePenutup(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
