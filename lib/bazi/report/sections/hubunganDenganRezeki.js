// ============================================================
// Section composer — Hubunganmu dengan Rezeki (Resources)
// ============================================================
// Relationship-with-money patterns. NOT financial advice.
// In BaZi tradition, an element's "wealth" is the element it
// controls (e.g. for Earth DM, Water = wealth). The element
// that generates it is "resource". Conditional inserts pivot
// off these positional relations.
// ============================================================

import passages from '../passages/hubunganDenganRezeki.js'
import { sectionFromPassage } from './_helpers.js'
import * as F from '../features.js'

const TITLE = 'Hubunganmu dengan Rezeki'
const SECTION_KEY = 'hubunganDenganRezeki'

const RULES = [
  // For Earth DM (戊己): Water is wealth — chart having Water shows up here
  (c) => F.chartStoresElement(c, 'Water') && F.isOwnElement(c, 'Earth') ? 'earthMeetsWater' : null,
  // For Fire DM (丙丁): Metal is wealth
  (c) => F.chartStoresElement(c, 'Metal') && F.isOwnElement(c, 'Fire') ? 'fireMeetsMetal' : null,
  // For Wood DM (甲乙): Earth is wealth
  (c) => F.chartStoresElement(c, 'Earth') && F.isOwnElement(c, 'Wood') ? 'woodMeetsEarth' : null,
  // For Metal DM (庚辛): Wood is wealth
  (c) => F.chartStoresElement(c, 'Wood') && F.isOwnElement(c, 'Metal') ? 'metalMeetsWood' : null,
  // For Water DM (壬癸): Fire is wealth
  (c) => F.chartStoresElement(c, 'Fire') && F.isOwnElement(c, 'Water') ? 'waterMeetsFire' : null,
  // Conservative / abundant patterns from balance
  (c) => F.dominantElement(c) === 'Earth' ? 'earthDominantSavings' : null,
  (c) => F.hasWaterExcess(c) ? 'waterFlow' : null,
]

export function composeHubunganDenganRezeki(chart, prompt) {
  return sectionFromPassage({
    title:      TITLE,
    sectionKey: SECTION_KEY,
    passage:    passages[chart?.day?.stem],
    chart,
    rules:      RULES,
    prompt,
  })
}
