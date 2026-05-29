// ============================================================
// Reflection prompt library — per archetype × per section
// ============================================================
// Each section closes with one open question. The prompt is the
// ritual hook — what the reader screenshots, journals about,
// comes back to. Short (15–25 words). Genuine open question, not
// rhetorical.
//
// Section keys must match the keys used by composer.js when
// passing prompts down to section composers.
//
// Phase 4a ships empty. Phase 4b fills 戊 prompts to validate
// voice. Phase 4c scales to other 9 archetypes.
// ============================================================

const EMPTY_SECTIONS = {
  pembukaan:             '',
  caraKamuHadir:         '',
  polaDiPekerjaan:       '',
  polaDiHubungan:        '',
  polaDiTubuh:           '',
  hubunganDenganRezeki:  '',
  penutup:               '',
}

export const PROMPTS = {
  '甲': { ...EMPTY_SECTIONS },
  '乙': { ...EMPTY_SECTIONS },
  '丙': { ...EMPTY_SECTIONS },
  '丁': { ...EMPTY_SECTIONS },
  '戊': { ...EMPTY_SECTIONS },
  '己': { ...EMPTY_SECTIONS },
  '庚': { ...EMPTY_SECTIONS },
  '辛': { ...EMPTY_SECTIONS },
  '壬': { ...EMPTY_SECTIONS },
  '癸': { ...EMPTY_SECTIONS },
}

/** Returns the prompt for (stem, section), or '' if not yet written. */
export function getPrompt(stem, section) {
  return PROMPTS[stem]?.[section] || ''
}
