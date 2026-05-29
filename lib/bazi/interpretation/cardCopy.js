/* cardCopy.js — image-overlay sharecard data model.
   Houses (a) per-archetype card-surface copy + visual config, (b) the
   chartToCardData adapter that produces the cardData object BaziCardImage
   consumes, and (c) small pure helpers.

   Pilot: only 丙 (Matahari) is filled. For other archetypes, chartToCardData
   returns null and App.jsx falls back to the legacy code-rendered BaziCard. */

/* ──────────────────────────────────────────────────────────────────────── */
/* Per-archetype card copy + visual config.
   Add an entry per archetype as templates and copy land. */
/* ──────────────────────────────────────────────────────────────────────── */

export const ARCHETYPE_CARD_COPY = {
  '丙': {
    archetypeId:  'matahari',
    elementLabel: '丙火 · YANG FIRE',
    colors:       { deep: '#8B3A1A', mid: '#C4622A' },

    /* Tagline + KBD sentences — sharecard-specific full sentences (different
       register from the reading-page taglineCard noun phrase). */
    taglineCard: 'Hadir untuk menerangi, bukan untuk bersinar sendirian.',
    kekuatanCard: 'Masuk ke ruangan dan suasana berubah, bahkan sebelum bicara.',
    bayanganCard: 'Butuh diakui lebih dari yang mau diakui sendiri.',
    dampakCard:   'Yang bertemu sering pergi dengan keyakinan yang tidak mereka miliki sebelumnya.',

    /* Universal-per-archetype harmonis / konflik (element-family signal,
       NOT chart-specific branch harmony/clash). For 丙 Fire: Water archetypes
       support, Earth archetypes drain. */
    harmonis: {
      names: ['Samudra', 'Hujan'],
      note:  'Air memberi kedalaman pada cahaya yang ingin menyebar.',
    },
    konflik: {
      names: ['Gunung', 'Ladang'],
      note:  'Bumi menyerap energi, bisa menguras jika tidak dijaga.',
    },

    templateSrc: '/cards/matahari-template.png',

    /* Transitional flag. The current Matahari template has section labels
       (KEKUATAN/BAYANGAN/DAMPAK/HARMONIS/KONFLIK), decorative hairlines, and
       a baked `katon.app` footer baked into the image. New 9 archetype
       templates will use a stripped design (background + illustration +
       title + 5 element icons only) — code renders everything else uniformly.
       Set this to false when the Matahari template is regenerated to match. */
    bakedLabels: true,

    /* Element-note variants keyed by chart shape.
       Selection rule (see pickElementNote below):
         - If home element (Fire for 丙) is missing → missingFire
         - Else by dominantElement → dominant{Fire|Wood|Water|Earth|Metal}
       Approved: dominantFire, missingFire.
       The four below are first drafts in 丙's voice register based on BaZi
       5-element semantics. Review and revise. */
    elementNotes: {
      // Approved
      dominantFire: 'Didominasi Api · intensitas yang sering melampaui situasi.',
      missingFire:  'Rendah Api · kehangatan yang lebih terjaga, lebih sulit diakses.',
      // TODO: review — Wood feeds Fire (constant fuel, restless burning)
      dominantWood:  'Banyak Kayu · bara yang terus diberi bahan bakar, sulit melambat.',
      // TODO: review — Water controls Fire (suppressed light, restrained heat)
      dominantWater: 'Banyak Air · cahaya yang sering tertahan, panas yang sulit keluar.',
      // TODO: review — Earth drained by Fire (light absorbed in giving)
      dominantEarth: 'Banyak Bumi · cahaya yang diserap, mudah lupa diri saat memberi.',
      // TODO: review — Metal controlled/refined by Fire (lots to manage)
      dominantMetal: 'Banyak Logam · banyak yang harus diolah, kelelahan yang sering tersembunyi.',
    },
  },

  /* 9 more archetypes added in a future content round. */
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Pure helpers */
/* ──────────────────────────────────────────────────────────────────────── */

const MONTH_ABBR_UPPER = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

/* "1989-09-13" → "13 SEP 1989". Drops leading zero on day. */
export function formatBirthDate(iso) {
  if (typeof iso !== 'string') return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${d} ${MONTH_ABBR_UPPER[m - 1]} ${y}`
}

/* Raw decimal counts → lowercase percentages summing to ~100. */
export function toPercentages(balance) {
  const total =
    (balance.Wood  || 0) +
    (balance.Fire  || 0) +
    (balance.Earth || 0) +
    (balance.Metal || 0) +
    (balance.Water || 0)
  if (total === 0) {
    return { fire: 0, wood: 0, water: 0, earth: 0, metal: 0 }
  }
  const pct = (v) => Math.round(((v || 0) / total) * 100)
  return {
    fire:  pct(balance.Fire),
    wood:  pct(balance.Wood),
    water: pct(balance.Water),
    earth: pct(balance.Earth),
    metal: pct(balance.Metal),
  }
}

/* Selects an element-note variant from `notes` based on chart shape.
   Generalizable across archetypes: pass the archetype's home element
   (e.g. 'Fire' for 丙) so we can prioritize the missing-home case. */
export function pickElementNote(notes, dominantElement, missingElement, homeElement) {
  if (!notes) return ''
  if (missingElement === homeElement) {
    const key = `missing${homeElement}`
    if (notes[key]) return notes[key]
  }
  const domKey = `dominant${dominantElement}`
  return notes[domKey] || ''
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Adapter: chart + interpretation → cardData (or null for unsupported) */
/* ──────────────────────────────────────────────────────────────────────── */

export function chartToCardData(chart, interpretation) {
  if (!chart || !interpretation) return null
  const stem = chart.dayMaster && chart.dayMaster.stem
  const copy = ARCHETYPE_CARD_COPY[stem]
  if (!copy) return null

  const homeElement = chart.dayMaster.element

  return {
    archetypeId:   copy.archetypeId,
    archetypeName: (interpretation.dayMasterName || '').toUpperCase(),
    elementLabel:  copy.elementLabel,
    colors:        copy.colors,
    tagline:       copy.taglineCard,
    kekuatan:      copy.kekuatanCard,
    bayangan:      copy.bayanganCard,
    dampak:        copy.dampakCard,
    harmonis:      copy.harmonis,
    konflik:       copy.konflik,
    templateSrc:   copy.templateSrc,

    /* Per-chart dynamic fields */
    birthDate:      formatBirthDate(chart.birthDate),
    elementBalance: toPercentages(chart.elementBalance),
    elementNote:    pickElementNote(
      copy.elementNotes,
      interpretation.dominantElement,
      interpretation.missingElement,
      homeElement,
    ),
  }
}
