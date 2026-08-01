// ============================================================
// Ten Gods (十神) derivation
// ============================================================
// Maps any Heavenly Stem to its Ten God relative to a Day Master, by the
// (five-element relation × yin/yang polarity) rule. Deterministic, pure.
//
//   relation of target element to Day Master element:
//     same element        → companion (比劫)
//     DM generates target  → output    (食傷)
//     DM controls target   → wealth    (財)
//     target controls DM   → officer   (官殺)
//     target generates DM  → resource  (印)
//
//   polarity: 正 (proper) = OPPOSITE polarity, 偏 (indirect) = SAME polarity.
// ============================================================

import { STEM_ELEMENTS, STEM_POLARITY, HIDDEN_STEMS } from './stems.js';

// Five Element cycles
const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }; // 生
const CONTROLS  = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };   // 克

// Ten God hanzi → Katon English label.
export const TEN_GOD_LABEL = {
  '比肩': 'The Self-Reliant',
  '劫財': 'The Mover',
  '食神': 'The Creator',
  '傷官': 'The Dazzler',
  '正財': 'The Steward',
  '偏財': 'The Trailblazer',
  '正官': 'The Keeper',
  '七殺': 'The Fighter',
  '正印': 'The Learner',
  '偏印': 'The Thinker',
};

// Qi-order labels for a branch's hidden stems (main → middle → residual).
const QI_ORDER = ['main', 'middle', 'residual'];

/**
 * Ten God of `target` stem relative to `dayMaster` stem (both hanzi).
 * @returns {{ hanzi, label, stem, element, polarity }}
 */
export function tenGod(dayMaster, target) {
  const dmEl = STEM_ELEMENTS[dayMaster];
  const tEl = STEM_ELEMENTS[target];
  const samePolarity = STEM_POLARITY[dayMaster] === STEM_POLARITY[target];

  let hanzi;
  if (tEl === dmEl)                  hanzi = samePolarity ? '比肩' : '劫財'; // companion
  else if (GENERATES[dmEl] === tEl)  hanzi = samePolarity ? '食神' : '傷官'; // output
  else if (CONTROLS[dmEl] === tEl)   hanzi = samePolarity ? '偏財' : '正財'; // wealth
  else if (CONTROLS[tEl] === dmEl)   hanzi = samePolarity ? '七殺' : '正官'; // officer
  else                               hanzi = samePolarity ? '偏印' : '正印'; // resource

  return {
    hanzi,
    label: TEN_GOD_LABEL[hanzi],
    stem: target,
    element: tEl,
    polarity: STEM_POLARITY[target],
  };
}

/**
 * All Ten God assignments for a chart: every visible Heavenly Stem AND every
 * hidden stem, each mapped to its Ten God relative to the Day Master. The Day
 * Master's own stem is marked (it is the self, always 比肩 by definition).
 *
 * @param {Object} chart - output of calculateBaziChart
 * @returns {{ dayMaster, stems: Array, hidden: Array }}
 */
export function tenGodsForChart(chart) {
  const dm = chart.day.stem;

  const pillars = [
    ['year', chart.year],
    ['month', chart.month],
    ['day', chart.day],
  ];
  if (chart.hour) pillars.push(['hour', chart.hour]);

  const stems = [];
  const hidden = [];

  for (const [pos, pillar] of pillars) {
    if (pos === 'day') {
      stems.push({ pos, stem: pillar.stem, isDayMaster: true, hanzi: '比肩', label: TEN_GOD_LABEL['比肩'] });
    } else {
      stems.push({ pos, ...tenGod(dm, pillar.stem) });
    }

    const hs = HIDDEN_STEMS[pillar.branch] || [];
    hs.forEach((h, i) => {
      hidden.push({
        pos,
        branch: pillar.branch,
        qi: QI_ORDER[i] || `h${i}`,
        weight: h.weight,
        ...tenGod(dm, h.stem),
      });
    });
  }

  return { dayMaster: dm, stems, hidden };
}
