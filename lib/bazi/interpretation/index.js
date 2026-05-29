// ============================================================
// Interpretation composer — chart → InterpretationJSON
// ============================================================
// Pure, synchronous, deterministic. Same chart → same output.
// No network. No API key. No randomness.
//
// The composer reads four axes from the chart:
//   1. Day Master (chart.day.stem)       → 10 archetypes
//   2. Day Branch (chart.day.branch)     → harmony/clash narrative
//   3. Dominant element (max count)      → element flavor
//   4. Missing element (count === 0)     → vulnerability framing
//
// For "pick N from pool" slots (traits, identityPills, sifatPills),
// selection is seeded by `${stem}${branch}:${birthDate}:${birthTime}`.
// Charts with different seeds → different selections.
// Same chart → same selection.
//
// Output supports two surfaces:
//   1. Reading page below the card — heroDescription, identityPills,
//      personalityTraits, elementNote, compatibleDescription, etc.
//   2. The 7-zone BaziCard (watercolor canvas) — taglineCard, the
//      three descriptor arrays, sifatPills, selarasArchetypes,
//      pemicuArchetypes.
//
// Empty bank entries return '' or []. Card and reading components
// must hide their respective sections gracefully on empty content.
// ============================================================

import { DAY_MASTERS } from './dayMasters.js'
import { DAY_BRANCHES } from './dayBranches.js'
import { DOMINANT_ELEMENT, MISSING_ELEMENT } from './elementImpact.js'
import { PAID_HOOK_TEMPLATE } from './paidHooks.js'
import { pickN } from './pickN.js'
import { STEM_ELEMENTS, STEM_POLARITY } from '../stems.js'
import { getSelarasPemicuStems } from '../elementCycle.js'

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
const TRAITS_TO_SHOW = 6
const PILLS_TO_SHOW = 4
const SIFAT_TO_SHOW = 2

function getDominantElement(balance) {
  let dom = null
  let max = 0
  for (const el of ELEMENTS) {
    const v = balance[el] || 0
    if (v > max) {
      max = v
      dom = el
    }
  }
  return dom
}

function getMissingElement(balance) {
  for (const el of ELEMENTS) {
    if ((balance[el] || 0) === 0) return el
  }
  return null
}

function interpolate(template, vars) {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

/**
 * Maps an array of stem characters to { stem, name } objects using
 * DAY_MASTERS for the Indonesian archetype name lookup. Used for
 * Selaras / Pemicu archetype rendering on the SHARECARD (driven
 * by the stem-element generation/control cycle).
 */
function stemsToArchetypes(stems) {
  return stems.map((stem) => ({
    stem,
    name: DAY_MASTERS[stem]?.name || stem,
  }))
}

/**
 * Maps an Earthly Branch to the archetype most strongly associated
 * with it — typically the branch's primary hidden stem.
 *
 * Used for the READING PAGE's Relasi Cabang section, where chips
 * + descriptions are about 六合/六冲 branch dynamics (different
 * relationship than the sharecard's stem-element cycle).
 *
 * Notes:
 * - 丑 and 未 both map to 己 Ladang (both Earth Yin primary stem)
 * - 辰 and 戌 both map to 戊 Gunung (both Earth Yang primary stem)
 * - This is per BaZi tradition; same archetype showing up twice
 *   is structurally correct (the seasonal Earth branches share a
 *   primary stem).
 */
const BRANCH_PRIMARY_STEM = {
  '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
  '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
  '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬',
}

function branchesToArchetypes(branches) {
  return branches.map((branch) => {
    const primaryStem = BRANCH_PRIMARY_STEM[branch] || ''
    return {
      branch,
      stem: primaryStem,
      name: DAY_MASTERS[primaryStem]?.name || branch,
    }
  })
}

export function getInterpretation(chart) {
  const stem = chart.day.stem
  const branch = chart.day.branch
  const dm = DAY_MASTERS[stem] || {}
  const db = DAY_BRANCHES[branch] || {}

  const dominant = getDominantElement(chart.elementBalance)
  const missing = getMissingElement(chart.elementBalance)

  const seed = `${stem}${branch}:${chart.birthDate}:${chart.birthTime ?? ''}`

  const traits = pickN(dm.traits || [], TRAITS_TO_SHOW, seed + ':traits')
  const identityPills = pickN(dm.identityPills || [], PILLS_TO_SHOW, seed + ':pills')
  const sifatPills = pickN(dm.sifatPills || [], SIFAT_TO_SHOW, seed + ':sifat')

  // Missing element takes priority over dominant — the skill prefers
  // surfacing one vulnerability over one strength.
  const elementNote =
    (missing && MISSING_ELEMENT[missing]) ||
    (dominant && DOMINANT_ELEMENT[dominant]) ||
    ''

  const paidHook = interpolate(PAID_HOOK_TEMPLATE, {
    dayMasterName: dm.name || '',
    dominantElement: dominant || '',
    missingElement: missing || '',
  })

  // Selaras / Pemicu archetypes for the SHARECARD (5-element cycle).
  const dayElement = STEM_ELEMENTS[stem] || null
  const { selarasStems, pemicuStems, selarasElement, pemicuElement } = getSelarasPemicuStems(dayElement)
  const selarasArchetypes = stemsToArchetypes(selarasStems)
  const pemicuArchetypes  = stemsToArchetypes(pemicuStems)

  // Branch-archetype chips for the READING PAGE's Relasi Cabang
  // section (六合/六冲 branch dynamics — different relationship from
  // the sharecard's stem-cycle harmony/clash).
  const compatibleBranchArchetypes = branchesToArchetypes(chart.harmonyBranches || [])
  const clashBranchArchetypes      = branchesToArchetypes(chart.clashBranches || [])

  return {
    // Shared
    dayMasterName: dm.name || '',
    dayMasterChinese: dm.chinese || `${stem}${dayElement || ''}`,
    dayMasterElement: dayElement,
    dayMasterPolarity: STEM_POLARITY[stem] || null,

    // Reading-page fields (canonical first-person voice OK)
    shareTagline: dm.tagline || '',
    heroDescription: dm.hero || '',
    identityPills,
    personalityTraits: traits,
    elementNote,
    dominantElement: dominant,
    missingElement: missing,
    compatibleBranches: chart.harmonyBranches,
    clashBranches: chart.clashBranches,
    compatibleBranchArchetypes,
    clashBranchArchetypes,
    compatibleDescription: db.harmony || '',
    clashDescription: db.clash || '',
    paidHook,

    // Card-surface fields (no subject pronoun, watercolor canvas)
    subtitle: dm.subtitle || '',
    taglineCard: dm.taglineCard || '',
    kekuatanDescriptors: dm.kekuatanDescriptors || [],
    bayanganDescriptors: dm.bayanganDescriptors || [],
    dampakDescriptors: dm.dampakDescriptors || [],
    sifatPills,
    selarasArchetypes,
    pemicuArchetypes,
    selarasElement,
    pemicuElement,
  }
}
