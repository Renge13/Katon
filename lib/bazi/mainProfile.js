// ============================================================
// Main Profile — Method A: month-branch rooting (NOT a % tally)
// ============================================================
// 1. Take the Month Branch's hidden stems in qi order (main → middle →
//    residual).
// 2. For each, check if it is "revealed": that stem, or another stem of the
//    same ELEMENT, appears among the OTHER Heavenly Stems (year, month, and
//    hour if present).
// 3. The first revealed hidden stem → its Ten God is the Main Profile.
// 4. If NONE is revealed → fall back to the main-qi hidden stem's Ten God, and
//    log a 'PROFILE_FALLBACK' warning so the case can be caught.
//
// ── Revelation set: YEAR + MONTH stems only ──
// The spec says "revealed in the 4 Heavenly Stems", but the Main Profile MUST be
// hour-independent (Task 6 asserts it is identical with/without the hour) AND the
// Day Master stem is the self (it doesn't "reveal" the month's qi). So the
// revelation set is the two always-present, non-self, non-hour structural stems:
// the YEAR and MONTH stems. This is the only choice consistent with Task 6:
//   - Including the HOUR stem breaks stability on charts 7 & 12 (the hour stem
//     swings which qi is transparent).
//   - Including the DAY MASTER stem breaks stability on chart 9 (its own element
//     reveals the residual and flips 正財 → 劫財 in the no-hour case).
// With Year+Month only, chart 9 (甲 DM, 未 month) resolves to 正財 via the main-qi
// fallback both with and without the hour. See tests/bazi-engine.report.mjs.
// ============================================================

import { STEM_ELEMENTS, HIDDEN_STEMS } from './stems.js';
import { tenGod } from './tenGods.js';

export const PROFILE_FALLBACK_WARNING = 'PROFILE_FALLBACK: no revealed month-branch stem';

/**
 * Resolve the Main Profile via month-branch rooting.
 * @param {Object} chart - output of calculateBaziChart
 * @param {Object} [opts]
 * @param {boolean} [opts.silent=false] - suppress the console.warn on fallback
 * @returns {{ hanzi, label, stem, element, polarity, rootStem, rootQi, revealed, fallback, warning? }}
 */
export function mainProfile(chart, { silent = false } = {}) {
  const dm = chart.day.stem;
  const monthBranch = chart.month.branch;
  const hiddenList = HIDDEN_STEMS[monthBranch] || [];

  if (hiddenList.length === 0) {
    throw new Error(`No hidden stems for month branch "${monthBranch}"`);
  }

  // Revelation set: Year + Month stems only (non-self, non-hour → hour-stable).
  const revealStems = [chart.year.stem, chart.month.stem];
  const revealElements = new Set(revealStems.map((s) => STEM_ELEMENTS[s]));

  const qiName = ['main', 'middle', 'residual'];

  for (let i = 0; i < hiddenList.length; i++) {
    const h = hiddenList[i];
    if (revealElements.has(STEM_ELEMENTS[h.stem])) {
      return {
        ...tenGod(dm, h.stem),
        rootStem: h.stem,
        rootQi: qiName[i] || `h${i}`,
        revealed: true,
        fallback: false,
      };
    }
  }

  // None revealed → fall back to the main-qi hidden stem.
  const mainQi = hiddenList[0];
  if (!silent) console.warn(`${PROFILE_FALLBACK_WARNING} (month ${monthBranch}, DM ${dm})`);
  return {
    ...tenGod(dm, mainQi.stem),
    rootStem: mainQi.stem,
    rootQi: 'main',
    revealed: false,
    fallback: true,
    warning: PROFILE_FALLBACK_WARNING,
  };
}
