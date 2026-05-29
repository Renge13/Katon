// ============================================================
// Element watercolor palette + icon config
// ============================================================
// Drives the BaziCard visual treatment per Day Master element.
// Colors lean toward natural pigment tones (deep/mid/wash) to
// suit the watercolor canvas direction (Unlimited Saga / Legend
// of Mana). Icon names are kept abstract so the card component
// maps them to actual Tabler React components.
// ============================================================

export const ELEMENT_CONFIG = {
  Fire: {
    deep:        '#8B3A1A',
    mid:         '#C4622A',
    wash:        '#FDDCB0',
    icon:        'flame',
    emoji:       '🔥',
    chineseYang: '丙',
    chineseYin:  '丁',
    label:       'API',
  },
  Wood: {
    deep:        '#2E5C2E',
    mid:         '#5A8F4E',
    wash:        '#D4EACB',
    icon:        'leaf',
    emoji:       '🌿',
    chineseYang: '甲',
    chineseYin:  '乙',
    label:       'KAYU',
  },
  Water: {
    deep:        '#2A4E5C',
    mid:         '#5A8898',
    wash:        '#CBE0EA',
    icon:        'droplet',
    emoji:       '🌊',
    chineseYang: '壬',
    chineseYin:  '癸',
    label:       'AIR',
  },
  Earth: {
    deep:        '#5A4E3A',
    mid:         '#8A7A5E',
    wash:        '#E8E0D0',
    icon:        'mountain',
    emoji:       '⛰️',
    chineseYang: '戊',
    chineseYin:  '己',
    label:       'TANAH',
  },
  Metal: {
    deep:        '#4A4E56',
    mid:         '#787A82',
    wash:        '#DCE0E8',
    icon:        'sword',
    emoji:       '⚔️',
    chineseYang: '庚',
    chineseYin:  '辛',
    label:       'LOGAM',
  },
}

/* ── Per-archetype emoji ─────────────────────────────────────
   Used by sharecard ENERGI MENYOKONG / ENERGI MENGUJI chips and
   the Relasi Cabang section on the reading page. Pictographic
   recall — reader recognizes the archetype without reading.
   ============================================================ */
export const ARCHETYPE_EMOJI = {
  '甲': '🌳', // Pohon Oak
  '乙': '🌱', // Tanaman Rambat
  '丙': '☀️', // Matahari
  '丁': '🕯️', // Lilin
  '戊': '⛰️', // Gunung
  '己': '🌾', // Ladang
  '庚': '⚔️', // Pedang
  '辛': '💎', // Permata
  '壬': '🌊', // Samudra
  '癸': '🌧️', // Hujan
}
