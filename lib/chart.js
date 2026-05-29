import 'server-only';
// Server-side chart computation for reading creation.
//
// Runs the deterministic BaZi calculator (ported in lib/bazi/) and derives the
// two keys the content layer needs:
//   - dayMaster: the Day Master stem (甲乙丙丁戊己庚辛壬癸) → selects the content file
//   - elementVariant: resolved missing/dominant element key (e.g. 'missing_wood')
//     → selects which `elementNote` variant applies
//
// Both are resolved HERE (server-side) and persisted on the reading row, per the
// locked architecture — they are never accepted from the client and so cannot be
// tampered with.

import { calculateBaziChart } from '@/lib/bazi';

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

// Mirrors lib/bazi/interpretation/index.js: dominant = highest count; missing =
// first element (canonical order) with count 0.
function dominantElement(balance) {
  let dom = null;
  let max = 0;
  for (const el of ELEMENTS) {
    const v = balance[el] || 0;
    if (v > max) { max = v; dom = el; }
  }
  return dom;
}
function missingElement(balance) {
  for (const el of ELEMENTS) {
    if ((balance[el] || 0) === 0) return el;
  }
  return null;
}

/**
 * Resolve the element_variant key. Missing element takes precedence (sharpest
 * personalization — e.g. 丙 with no Wood has no fuel), then dominant, else
 * 'balanced'. Content files provide whichever variants they wrote, with
 * 'balanced' as the guaranteed fallback in getFreeContent.
 *   Reyner's 丙子 chart (Wood:0, Water:3) → 'missing_wood'.
 */
export function resolveElementVariant(chart) {
  const balance = chart.elementBalance || {};
  const missing = missingElement(balance);
  if (missing) return `missing_${missing.toLowerCase()}`;
  const dom = dominantElement(balance);
  if (dom) return `dominant_${dom.toLowerCase()}`;
  return 'balanced';
}

export function computeChartInputs({ birthDate, birthTime = null }) {
  const chart = calculateBaziChart({ birthDate, birthTime });
  return {
    dayMaster: chart.day.stem,
    elementVariant: resolveElementVariant(chart),
    chart, // full chart, available for chart-specific free content (Phase 3)
  };
}
