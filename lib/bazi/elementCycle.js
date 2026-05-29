// ============================================================
// Five Element Cycle — Selaras / Pemicu derivation
// ============================================================
// Two BaZi cycles drive the card's social mechanic:
//   Generation (相生): Wood → Fire → Earth → Metal → Water → Wood
//   Control    (相克): Wood→Earth, Earth→Water, Water→Fire,
//                     Fire→Metal,  Metal→Wood
//
// For a given Day Master element:
//   Selaras = archetypes whose element GENERATES the DM element
//   Pemicu  = archetypes whose element CONTROLS the DM element
//
// Example: Wood DM (甲乙)
//   Selaras = Water archetypes (壬 Samudra, 癸 Hujan)
//   Pemicu  = Metal archetypes (庚 Pedang, 辛 Permata)
//
// Pure data, no copy required.
// ============================================================

const GENERATED_BY = {
  Wood:  'Water',
  Fire:  'Wood',
  Earth: 'Fire',
  Metal: 'Earth',
  Water: 'Metal',
}

const CONTROLLED_BY = {
  Wood:  'Metal',
  Fire:  'Water',
  Earth: 'Wood',
  Metal: 'Fire',
  Water: 'Earth',
}

// Element → its two Heavenly Stem archetypes ([Yang stem, Yin stem])
export const ELEMENT_STEMS = {
  Wood:  ['甲', '乙'],
  Fire:  ['丙', '丁'],
  Earth: ['戊', '己'],
  Metal: ['庚', '辛'],
  Water: ['壬', '癸'],
}

/**
 * @param {string} dayElement One of Wood/Fire/Earth/Metal/Water
 * @returns {{ selarasStems: string[], pemicuStems: string[],
 *            selarasElement: string|undefined, pemicuElement: string|undefined }}
 */
export function getSelarasPemicuStems(dayElement) {
  const selarasElement = GENERATED_BY[dayElement]
  const pemicuElement  = CONTROLLED_BY[dayElement]
  return {
    selarasStems:   ELEMENT_STEMS[selarasElement]  || [],
    pemicuStems:    ELEMENT_STEMS[pemicuElement]   || [],
    selarasElement,
    pemicuElement,
  }
}
