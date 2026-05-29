// ============================================================
// Report composer — chart → full reflective report
// ============================================================
// Orchestrates 7 section composers, attaches per-section prompts,
// filters out empty sections, and emits a uniform object that
// the Report.jsx renderer consumes.
//
// Pure and deterministic: same chart in → same report out. No
// network, no AI, no randomness.
//
// Phase 4a behavior: all passages are empty, so every section
// composer returns null. getReport returns:
//   { archetype: 'Gunung', chinese: '戊土', sections: [] }
// Phase 4b/c: as passage banks fill, `sections` populates.
// ============================================================

import { DAY_MASTERS } from '../interpretation/dayMasters.js'
import { PROMPTS } from './prompts.js'

import { composePembukaan }            from './sections/pembukaan.js'
import { composeCaraKamuHadir }        from './sections/caraKamuHadir.js'
import { composePolaDiPekerjaan }      from './sections/polaDiPekerjaan.js'
import { composePolaDiHubungan }       from './sections/polaDiHubungan.js'
import { composePolaDiTubuh }          from './sections/polaDiTubuh.js'
import { composeHubunganDenganRezeki } from './sections/hubunganDenganRezeki.js'
import { composePenutup }              from './sections/penutup.js'

/**
 * Build the full reflective report for a chart.
 *
 * @param {object} chart  From calculateBaziChart
 * @returns {object}      { archetype, chinese, dayStem, sections[] }
 */
export function getReport(chart) {
  const stem = chart?.day?.stem
  const dm = DAY_MASTERS[stem] || {}
  const prompts = PROMPTS[stem] || {}

  // Order = narrative arc: orient → personal → relational →
  // practical → material → embodied → close. Each section composer
  // returns a section object, or null if its bank is empty.
  const candidates = [
    composePembukaan(chart,            prompts.pembukaan),            // Bab 1
    composeCaraKamuHadir(chart,        prompts.caraKamuHadir),        // Bab 2
    composePolaDiHubungan(chart,       prompts.polaDiHubungan),       // Bab 3
    composePolaDiPekerjaan(chart,      prompts.polaDiPekerjaan),      // Bab 4
    composeHubunganDenganRezeki(chart, prompts.hubunganDenganRezeki), // Bab 5
    composePolaDiTubuh(chart,          prompts.polaDiTubuh),          // Bab 6
    composePenutup(chart,              prompts.penutup),              // Bab 7
  ]

  const sections = candidates.filter(Boolean)

  return {
    archetype: dm.name || '',
    chinese:   dm.chinese || '',
    dayStem:   stem || null,
    sections,
  }
}
