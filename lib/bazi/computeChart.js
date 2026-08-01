// ============================================================
// computeChart — engine entry point (pillars + Ten Gods + two profile tracks)
// ============================================================
// Wraps calculateBaziChart (pillars from computePillars / tyme4ts — see
// pillars.ts) and attaches the derived layers this phase adds:
//   - tenGods         : every visible + hidden stem → its Ten God (Task 3)
//   - mainProfile      : Track A, canonical month-branch structural profile (Task 4)
//   - tally            : Track B, the SINGLE whole-chart Ten God tally (Task 5)
//   - bars             : Track B ranked (all 10 Ten Gods, score desc)
//   - loudAlternatives : Track B non-profile gods within LOUD_MARGIN of the
//                        Track-A profile's own tally score (CR-2)
//
// Graceful no-hour degradation: when `time` is null, only Year/Month/Day pillars
// are computed (6 characters). Day Master + Track-A mainProfile are guaranteed
// identical to the with-hour result (see mainProfile.js for why the revelation
// set excludes the Day Master stem). Track B bars WILL shift without the hour —
// that is expected.
//
// Pure, synchronous, deterministic. No network, no LLM, no randomness.
// ============================================================

import { calculateBaziChart } from './buildChart.js';
import { tenGodsForChart } from './tenGods.js';
import { mainProfile } from './mainProfile.js';
import { tenGodTally, loudAlternatives } from './tenGodTally.js';

/**
 * @param {string} date - 'YYYY-MM-DD' (local / WIB civil date)
 * @param {string|null} [time] - 'HH:MM' (local / WIB civil time). null = unknown.
 * @param {Object} [opts] - forwarded to mainProfile (e.g. { silent: true })
 * @returns {{ chart, dayMaster, dayMasterElement, hasHour, tenGods,
 *             mainProfile, tally, bars, loudAlternatives }}
 */
export function computeChart(date, time = null, opts = {}) {
  const chart = calculateBaziChart({ birthDate: date, birthTime: time });

  const profile = mainProfile(chart, opts);
  const tally = tenGodTally(chart);

  return {
    chart,
    dayMaster: chart.day.stem,
    dayMasterElement: chart.day.element,
    hasHour: chart.hasHourPillar,
    tenGods: tenGodsForChart(chart),
    mainProfile: profile,          // Track A
    tally,                         // Track B — the single scoring
    bars: tally.ranked,            // Track B — ranked view
    loudAlternatives: loudAlternatives(tally, profile.hanzi), // CR-2
  };
}
