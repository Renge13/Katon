// ============================================================
// Track B — whole-chart Ten God tally (the SINGLE scoring)
// ============================================================
// ONE weighted tally of every Ten God across all 8 characters. It serves two
// consumers (bars ranking + loud-alternative detection) — never compute a
// second scoring elsewhere.
//
// ── Weights (documented, and the calibration knobs) ──
//   VISIBLE STEM ....... 1.0   (heaviest single contributor)
//   branch main-qi 本气 . its HIDDEN_STEMS weight (≈0.6; 1.0 for pure 子卯酉; 0.6 for 午亥)
//   branch middle-qi 中气 its HIDDEN_STEMS weight (≈0.3; 0.4 for 午亥)
//   branch residual 余气  its HIDDEN_STEMS weight (≈0.1)
// The hidden-stem qi weights come straight from stems.js HIDDEN_STEMS so
// "stem heaviest > main-qi > middle > residual" holds by construction.
//
//   INCLUDE_DAY_MASTER_STEM = true — the DM stem is one of the 8 characters, so
//   it is counted (as 比肩). This inflates 比肩 by one stem-weight; it is a
//   deliberate, tunable choice (flip to false to treat the DM as reference-only).
//
// Scores are normalized to PERCENT of the total weighted tally, so the
// loud-alternative MARGIN is expressed in percentage points and is easy to
// hand-tune. (This is OUR normalization — we are NOT matching Joey's
// proprietary constants; only Track-B RANK ORDER is asserted, not the numbers.)
// ============================================================

import { HIDDEN_STEMS } from './stems.js';
import { tenGod, TEN_GOD_LABEL } from './tenGods.js';

export const VISIBLE_STEM_WEIGHT = 1.0;
export const INCLUDE_DAY_MASTER_STEM = true;

// Loud-alternative margin, in PERCENTAGE POINTS. Single named constant — tune here.
export const LOUD_MARGIN = 5;

// Canonical Ten God order — used as a deterministic tie-break in ranking.
const TEN_GOD_ORDER = ['比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '七殺', '正印', '偏印'];

/**
 * Build the single weighted Ten God tally for a chart.
 * @returns {{
 *   raw: Record<hanzi, number>,       // raw weighted score
 *   percent: Record<hanzi, number>,   // score as % of total (0–100)
 *   ranked: Array<{hanzi,label,score,percent}>, // all 10, score desc, deterministic ties
 *   total: number,
 * }}
 */
export function tenGodTally(chart) {
  const dm = chart.day.stem;
  const raw = Object.fromEntries(TEN_GOD_ORDER.map((g) => [g, 0]));

  const pillars = [
    ['year', chart.year],
    ['month', chart.month],
    ['day', chart.day],
  ];
  if (chart.hour) pillars.push(['hour', chart.hour]);

  for (const [pos, pillar] of pillars) {
    // Visible Heavenly Stem
    if (pos === 'day') {
      if (INCLUDE_DAY_MASTER_STEM) raw['比肩'] += VISIBLE_STEM_WEIGHT; // DM self = 比肩
    } else {
      raw[tenGod(dm, pillar.stem).hanzi] += VISIBLE_STEM_WEIGHT;
    }
    // Branch hidden stems, weighted by their qi share
    for (const { stem, weight } of HIDDEN_STEMS[pillar.branch] || []) {
      raw[tenGod(dm, stem).hanzi] += weight;
    }
  }

  const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
  const percent = Object.fromEntries(
    TEN_GOD_ORDER.map((g) => [g, (raw[g] / total) * 100]),
  );

  const ranked = TEN_GOD_ORDER
    .map((g) => ({ hanzi: g, label: TEN_GOD_LABEL[g], score: raw[g], percent: percent[g] }))
    .sort((a, b) =>
      b.score - a.score ||
      TEN_GOD_ORDER.indexOf(a.hanzi) - TEN_GOD_ORDER.indexOf(b.hanzi),
    );

  return { raw, percent, ranked, total };
}

/**
 * Loud alternatives (CR-2): every NON-profile Ten God whose tally score is
 * within `margin` percentage points of the Track-A Profile's OWN score in this
 * same tally.
 * @param {ReturnType<typeof tenGodTally>} tally
 * @param {string} profileHanzi - Track A profile hanzi
 * @param {number} [margin=LOUD_MARGIN]
 * @returns {{ profilePercent, alternatives: Array<{hanzi,label,percent,gap}> }}
 */
export function loudAlternatives(tally, profileHanzi, margin = LOUD_MARGIN) {
  const profilePercent = tally.percent[profileHanzi] ?? 0;
  const alternatives = tally.ranked
    .filter((r) => r.hanzi !== profileHanzi)
    .map((r) => ({ hanzi: r.hanzi, label: r.label, percent: r.percent, gap: profilePercent - r.percent }))
    .filter((r) => Math.abs(r.gap) <= margin)
    .sort((a, b) => b.percent - a.percent);
  return { profilePercent, alternatives };
}
