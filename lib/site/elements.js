// ============================================================
// lib/site/elements.js — the element palette, glosses and bars, for the web AND the PDF
// ============================================================
// Prompt AW §2 (2026-09-30) ports the result page's chart into the Complete Edition
// PDF "using the same tokens". These three lived in components/kit.jsx and
// components/Funnel.jsx, client files the PDF cannot import; a second copy in
// lib/pdf would be two palettes that drift, so they moved here, unchanged, and both
// surfaces read them. Pure data and pure functions: no React, no server-only.
// ============================================================

/**
 * Per element: `deep` for the stem and headings, `mid` for the branch, borders and
 * the bar, `wash` for the day-master card. `bar`, `glow` and `bg` are the web's own
 * (CSS variables and gradients) and the PDF does not read them.
 */
export const EL = {
  water: { deep: '#173039', mid: '#3C6C7A', wash: '#CFE1E8', bar: 'var(--senja)', glow: '#6FA0AE', label: 'Air',   bg: 'radial-gradient(120% 85% at 50% -10%, #2C545F 0%, #16333B 46%, #0A161A 100%)' },
  fire:  { deep: '#8B3A1A', mid: '#C4622A', wash: '#FADEC2', bar: 'var(--clay)',  glow: '#E08A54', label: 'Api',   bg: 'radial-gradient(120% 85% at 50% -10%, #7A3218 0%, #3A1A0D 46%, #160B06 100%)' },
  wood:  { deep: '#2E5C2E', mid: '#5A8F4E', wash: '#D6EACD', bar: 'var(--sage)',  glow: '#8DBE80', label: 'Kayu',  bg: 'radial-gradient(120% 85% at 50% -10%, #2C5730 0%, #16301A 46%, #0A140C 100%)' },
  earth: { deep: '#5A4E3A', mid: '#8A7A5E', wash: '#EAE1D1', bar: 'var(--emas)',  glow: '#C6AC7E', label: 'Bumi',  bg: 'radial-gradient(120% 85% at 50% -10%, #5A4D38 0%, #302818 46%, #14100A 100%)' },
  metal: { deep: '#454A52', mid: '#7C808A', wash: '#DEE2E8', bar: '#9DA1A8',      glow: '#AEB2BB', label: 'Logam', bg: 'radial-gradient(120% 85% at 50% -10%, #4A4E56 0%, #26282E 46%, #101114 100%)' },
};

function elKey(name) {
  const n = (name || '').toLowerCase();
  if (/(water|air)/.test(n)) return 'water';
  if (/(fire|api)/.test(n)) return 'fire';
  if (/(wood|kayu)/.test(n)) return 'wood';
  if (/(earth|bumi|tanah)/.test(n)) return 'earth';
  if (/(metal|logam)/.test(n)) return 'metal';
  return 'earth';
}

/** The palette entry for an element name, English or Indonesian. */
export const elColor = (name) => EL[elKey(name)];

/**
 * Neutral, generic element glosses: they describe the ELEMENT, not the person.
 *
 * KEYED ON THE GLOSSARY'S NAMES. This map used to say `Bumi` while
 * `element_presence` says `Tanah`; lib/semantic/glossary.js flags that exact drift in
 * its own header, and the glossary is the only source of an element's Indonesian name.
 */
export const ELEMENT_GLOSS = {
  Kayu: 'tumbuh dan menjangkau',
  Api: 'menyala dan menghangatkan',
  Tanah: 'menopang dan menampung',
  Logam: 'memadat dan menajam',
  Air: 'mengalir dan meresap',
};

/**
 * `element_presence` as bars: each value as a share of the WIDEST, so the largest
 * fills its track, and which bars are tagged "Paling banyak" and "Paling sedikit".
 *
 * A TIE TAGS EVERY TIED BAR (Reyner, 2026-09-30, Prompt AX: "On ties, tag every tied
 * element"). It tagged the FIRST only, in element_presence order, so smewTN's Tanah
 * and Logam, both 36,3, showed Tanah alone as the most. `most` is every bar holding
 * the highest value and `least` every bar holding the lowest; a bar that is both (all
 * values equal) is tagged most only. Display only (rule 9): this is the display
 * normalisation, never a strength score.
 *
 * @param {Object<string, number>} presence
 * @returns {{bars: Array<{label: string, element: string, value: number, pct: number}>, most: number[], least: number[]}}
 */
export function presenceBars(presence) {
  const entries = Object.entries(presence || {});
  const max = Math.max(1, ...entries.map(([, v]) => Number(v) || 0));
  const bars = entries.map(([label, value]) => ({
    label,
    element: label,
    value: Number(value) || 0,
    pct: Math.round(((Number(value) || 0) / max) * 100),
  }));
  if (!bars.length) return { bars, most: [], least: [] };
  const hi = Math.max(...bars.map((b) => b.value));
  const lo = Math.min(...bars.map((b) => b.value));
  const most = bars.map((b, i) => (b.value === hi ? i : -1)).filter((i) => i > -1);
  const least = bars.map((b, i) => (b.value === lo && hi !== lo ? i : -1)).filter((i) => i > -1);
  return { bars, most, least };
}
