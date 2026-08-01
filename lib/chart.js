import 'server-only';
// Server-side chart computation for reading creation.
//
// Runs the deterministic BaZi calculator (ported in lib/bazi/) and derives the
// two keys the content layer needs:
//   - dayMaster: the Day Master stem (甲乙丙丁戊己庚辛壬癸) → selects the content file
//   - state: the element-STATE (balanced/amplified/governed/overfueled/depleted)
//     → selects the content cell within the archetype
//
// Both are resolved HERE (server-side) and persisted on the reading row, per the
// locked architecture — they are never accepted from the client and so cannot be
// tampered with. State assignment is APP logic (SPEC §7); the bazi-calculator skill
// stays pure chart-math.

import { calculateBaziChart } from '@/lib/bazi';

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

// Five Elements cycles (per bazi-states-and-compatibility-v4).
const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }; // 生
const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };   // 克

// Element that GENERATES `el` (its resource/feeder), and element that CONTROLS `el`.
const feederOf = (el) => ELEMENTS.find((k) => GENERATES[k] === el);
const controllerOf = (el) => ELEMENTS.find((k) => CONTROLS[k] === el);

/**
 * Resolve the element-state from the chart (SPEC §7, asymmetric thresholds).
 * Priority when multiple qualify: Governed > Depleted > Amplified > Over-fueled >
 * Balanced. `avg` is the mean of the five element counts.
 *   - Amplified:   self-element     ≥ 2.0× avg
 *   - Governed:    controller-element ≥ 1.5× avg
 *   - Over-fueled: feeder-element   ≥ 1.5× avg
 *   - Depleted:    feeder-element   ≤ 0.15
 *   - else Balanced
 * Reyner's 丙 chart is Water-dominant (Water controls Fire) → 'governed'.
 */
export function resolveState(chart) {
  const b = chart.elementBalance || {};
  const self = chart.day.element;
  const avg = ELEMENTS.reduce((s, e) => s + (b[e] || 0), 0) / 5;
  const selfV = b[self] || 0;
  const feederV = b[feederOf(self)] || 0;
  const ctrlV = b[controllerOf(self)] || 0;

  if (ctrlV >= 1.5 * avg) return 'governed';
  if (feederV <= 0.15) return 'depleted';
  if (selfV >= 2.0 * avg) return 'amplified';
  if (feederV >= 1.5 * avg) return 'overfueled';
  return 'balanced';
}

export function computeChartInputs({ birthDate, birthTime = null, termSide = null }) {
  const chart = calculateBaziChart({ birthDate, birthTime, termSide });
  return {
    dayMaster: chart.day.stem,
    state: resolveState(chart),
    chart, // full chart, available for chart-derived free content + the paid reveal
  };
}
