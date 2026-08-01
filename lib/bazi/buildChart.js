// ============================================================
// BaZi chart assembly
// ============================================================
// Takes the Four Pillars from pillars.ts and decorates them into the chart
// object the rest of Katon consumes (element/polarity per pillar, element
// balance, Day Master, harmony/clash branches).
//
// This file contains NO calendar math. Every stem and branch comes from
// computePillars (tyme4ts / 寿星天文历). The hand-rolled calculator that used to
// live here — its own 立春 comparison, day-anchor arithmetic and 五鼠遁 hour
// table — is gone on purpose; see the header of pillars.ts for why.
//
// The exported shape is unchanged from the old calculateBaziChart, so
// lib/chart.js, lib/readingView.js, lib/bazi/report/*, tenGods.js, mainProfile.js
// and tenGodTally.js all keep working untouched.
// ============================================================

import {
  STEMS, BRANCHES, STEM_ELEMENTS, STEM_POLARITY,
  HIDDEN_STEMS, getHarmonyBranches, getClashBranches, branchPunishments,
} from './stems.js';
import { computePillars } from './pillars.ts';
import { BRANCH_ZODIAC_ID } from '../zodiac.js';

/** Decorate a bare { stem, branch } with its element and polarity. */
function decorate(pillar) {
  if (!pillar) return null;
  return {
    stem: pillar.stem,
    branch: pillar.branch,
    element: STEM_ELEMENTS[pillar.stem],
    polarity: STEM_POLARITY[pillar.stem],
  };
}

/**
 * The Gregorian year of the 立春-anchored BaZi year, recovered from its
 * sexagenary stem/branch. The BaZi year either matches the civil year or is one
 * behind it (a birth before 立春), so two candidates suffice — no term math.
 */
function baziYearFromPillar({ stem, branch }, civilYear) {
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  for (const candidate of [civilYear, civilYear - 1]) {
    if (((candidate - 4) % 10 + 10) % 10 === stemIndex &&
        ((candidate - 4) % 12 + 12) % 12 === branchIndex) {
      return candidate;
    }
  }
  return civilYear; // unreachable for any date tyme4ts accepts
}

/**
 * Decorate a palace for DISPLAY ONLY (命宮 / 胎元).
 *
 * Shaped like the four pillars — stem, branch, element, animal — because D1 asks
 * for it to print "the way the four pillars already are". It carries NO
 * interpretation: no Ten God, no polarity role, no hierarchy score, no reading
 * fact. Those would make it a fifth and sixth pillar and open a whole surface
 * that modern practice barely uses.
 */
function decoratePalace(palace) {
  if (!palace) return null;
  return {
    stem: palace.stem,
    branch: palace.branch,
    element: STEM_ELEMENTS[palace.stem],
    animal: BRANCH_ZODIAC_ID[palace.branch],
  };
}

/** BaZi month number, 1 = 寅月 (the month 立春 opens). */
function baziMonthFromBranch(branch) {
  return ((BRANCHES.indexOf(branch) - 2 + 12) % 12) + 1;
}

// ── Element Balance ────────────────────────────────────────

function countElements(chart) {
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

  const pillars = [chart.year, chart.month, chart.day];
  if (chart.hour) pillars.push(chart.hour);

  for (const pillar of pillars) {
    // Stem element
    counts[pillar.element] = (counts[pillar.element] || 0) + 1;

    // Branch hidden stems
    const hidden = HIDDEN_STEMS[pillar.branch] || [];
    for (const { stem, weight } of hidden) {
      const el = STEM_ELEMENTS[stem];
      counts[el] = (counts[el] || 0) + weight;
    }
  }

  // Round to 1 decimal
  for (const k of Object.keys(counts)) {
    counts[k] = Math.round(counts[k] * 10) / 10;
  }

  return counts;
}

// ── Main Export ────────────────────────────────────────────

/**
 * Calculate the complete BaZi chart from a birth date.
 *
 * @param {Object} params
 * @param {string} params.birthDate - ISO date string "YYYY-MM-DD" (local civil date)
 * @param {string} [params.birthTime] - "HH:MM" local wall clock. Omit if unknown.
 * @param {string} [params.timezone] - Persisted, NOT applied. The entered time is
 *   used as-is; see the time-convention note in pillars.ts.
 * @param {'before'|'after'|null} [params.termSide] - Which side of the in-day 節
 *   the birth falls on, when the time is unknown. Resolves the MONTH pillar only;
 *   the hour pillar stays absent. See PillarsInput.termSide.
 * @returns {Object} Complete chart object
 *
 * @example
 * calculateBaziChart({ birthDate: '1990-03-15', birthTime: '14:30' })
 */
export function calculateBaziChart({ birthDate, birthTime = null, timezone = null, termSide = null }) {
  const pillars = computePillars({ date: birthDate, time: birthTime, tz: timezone, termSide });

  const yearPillar = decorate(pillars.year);
  const monthPillar = decorate(pillars.month);
  const dayPillar = decorate(pillars.day);
  const hourPillar = decorate(pillars.hour);

  const civilYear = Number(birthDate.slice(0, 4));
  yearPillar.baziYear = baziYearFromPillar(pillars.year, civilYear);
  monthPillar.baziMonth = baziMonthFromBranch(pillars.month.branch);

  if (hourPillar) {
    hourPillar.localHour = Number(birthTime.split(':')[0]);
    hourPillar.lateZi = hourPillar.localHour === 23;
  }

  const chart = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  return {
    ...chart,
    dayMaster: {
      stem: dayPillar.stem,
      element: dayPillar.element,
      polarity: dayPillar.polarity,
    },
    elementBalance: countElements(chart),
    harmonyBranches: getHarmonyBranches(dayPillar.branch),
    clashBranches: getClashBranches(dayPillar.branch),
    // 命宮 / 胎元 — DISPLAY ONLY. lifePalace is null without a birth hour.
    lifePalace: decoratePalace(pillars.lifePalace),
    conceptionPalace: decoratePalace(pillars.conceptionPalace),
    // 刑 — chart-level, unlike harmony/clash which are day-branch-relative.
    // 自刑 needs a branch repeated and 三刑 needs all three present, so both are
    // properties of the whole set of branches, not of one pillar.
    punishments: branchPunishments(
      [chart.year, chart.month, chart.day, chart.hour].filter(Boolean).map((p) => p.branch),
    ),
    birthDate,
    birthTime: birthTime ?? 'unknown',
    hasHourPillar: hourPillar !== null,
    // boundary splits the two risks (節 → month pillar, 時辰 → hour pillar);
    // boundaryFlag is the derived either-or. See pillars.ts.
    boundary: pillars.boundary,
    boundaryFlag: pillars.boundaryFlag,
    boundaryReason: pillars.boundaryReason,
  };
}
