// ============================================================
// BaZi Four Pillars Calculator
// ============================================================
// Converts a birth date/time into the complete Four Pillars chart.
// Always validates against known test cases before deploying.
//
// Test cases (verify these pass):
//   Oct 1, 2000 noon WIB → Year: 庚辰, Day: 壬辰
//   Feb 4, 2022 noon WIB → Year: 壬寅, Month: 甲寅
//   Feb 3, 2022 noon WIB → Year: 辛丑 (before 立春)
//   Jan 1, 1984 noon WIB → Year: 癸亥 (before 立春), Month: 子 (still in 1983 M11 大雪), Day: 甲午
// ============================================================

import { STEMS, BRANCHES, STEM_ELEMENTS, STEM_POLARITY, BRANCH_ELEMENTS,
         HIDDEN_STEMS, getHarmonyBranches, getClashBranches } from './stems.js';
import { SOLAR_TERMS_CST, getBaziMonth } from './solarTerms.js';

// ── Year Pillar ────────────────────────────────────────────

/**
 * BaZi year changes at 立春, not Jan 1 or Chinese New Year.
 * If birth is before 立春 of the Gregorian year, use previous year's stem/branch.
 */
function getYearPillar(birthDate) {
  // Get CST year and check if before 立春
  const utcMs = birthDate.getTime();
  const cstDate = new Date(utcMs + 8 * 60 * 60 * 1000);
  let year = cstDate.getUTCFullYear();

  // Get 立春 datetime for this year (index 0 in solar terms array)
  const terms = SOLAR_TERMS_CST[year];
  if (terms) {
    const lichunMs = new Date(terms[0].replace(' ', 'T') + ':00+08:00').getTime();
    if (utcMs < lichunMs) {
      year -= 1; // Before 立春 → use previous year
    }
  }

  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;

  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    element: STEM_ELEMENTS[STEMS[stemIndex]],
    polarity: STEM_POLARITY[STEMS[stemIndex]],
    baziYear: year,
  };
}

// ── Month Pillar ───────────────────────────────────────────

/**
 * Month stem formula: determined by year stem and month number.
 * Year stems cycle in groups of 5 (甲己, 乙庚, 丙辛, 丁壬, 戊癸).
 * Each group has a starting stem for 寅月 (Month 1).
 */
const MONTH_STEM_START = {
  0: 2,  // 甲/己 year → Month 1 (寅) stem = 丙 (index 2)
  1: 4,  // 乙/庚 year → 戊 (index 4)
  2: 6,  // 丙/辛 year → 庚 (index 6)
  3: 8,  // 丁/壬 year → 壬 (index 8)
  4: 0,  // 戊/癸 year → 甲 (index 0)
};

function getMonthPillar(birthDate, yearStemIndex) {
  const { monthIndex, branch } = getBaziMonth(birthDate);
  const groupIndex = yearStemIndex % 5;
  const startStem = MONTH_STEM_START[groupIndex];
  const stemIndex = (startStem + monthIndex) % 10;

  return {
    stem: STEMS[stemIndex],
    branch,
    element: STEM_ELEMENTS[STEMS[stemIndex]],
    polarity: STEM_POLARITY[STEMS[stemIndex]],
    baziMonth: monthIndex + 1,
  };
}

// ── Day Pillar ─────────────────────────────────────────────

// Anchor: Jan 1, 1900 = 甲戌日
// Stem index 0 (甲), Branch index 10 (戌)
const DAY_ANCHOR_MS = Date.UTC(1900, 0, 1); // Jan 1, 1900 00:00 UTC
const DAY_ANCHOR_STEM = 0;   // 甲
const DAY_ANCHOR_BRANCH = 10; // 戌

function getDayPillar(birthDate) {
  // Use CST date for day boundary (day changes at midnight CST)
  const utcMs = birthDate.getTime();
  const cstMidnightMs = utcMs + 8 * 60 * 60 * 1000;
  const cstDate = new Date(cstMidnightMs);

  // Get CST date as a pure date (no time component)
  const cstDateOnly = Date.UTC(
    cstDate.getUTCFullYear(),
    cstDate.getUTCMonth(),
    cstDate.getUTCDate()
  );

  const anchorDateOnly = Date.UTC(1900, 0, 1);
  const daysDiff = Math.round((cstDateOnly - anchorDateOnly) / (1000 * 60 * 60 * 24));

  const stemIndex = ((DAY_ANCHOR_STEM + daysDiff) % 10 + 10) % 10;
  const branchIndex = ((DAY_ANCHOR_BRANCH + daysDiff) % 12 + 12) % 12;

  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    element: STEM_ELEMENTS[STEMS[stemIndex]],
    polarity: STEM_POLARITY[STEMS[stemIndex]],
  };
}

// ── Hour Pillar ────────────────────────────────────────────

// Hour branch: 2-hour periods starting at odd hours (子时 = 23:00-00:59)
function getHourBranchIndex(cstHour) {
  // Normalize: 23:00 = start of 子时
  const normalized = (cstHour + 1) % 24;
  return Math.floor(normalized / 2);
}

const HOUR_STEM_START = {
  0: 0,  // 甲/己 day → 子时 starts at 甲 (index 0)
  1: 2,  // 乙/庚 day → 丙
  2: 4,  // 丙/辛 day → 戊
  3: 6,  // 丁/壬 day → 庚
  4: 8,  // 戊/癸 day → 壬
};

function getHourPillar(birthDate, dayStemIndex) {
  if (birthDate === null) return null; // Unknown birth time

  const utcMs = birthDate.getTime();
  const cstDate = new Date(utcMs + 8 * 60 * 60 * 1000);
  const cstHour = cstDate.getUTCHours();

  const branchIndex = getHourBranchIndex(cstHour);
  const groupIndex = dayStemIndex % 5;
  const startStem = HOUR_STEM_START[groupIndex];
  const stemIndex = (startStem + branchIndex) % 10;

  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    element: STEM_ELEMENTS[STEMS[stemIndex]],
    polarity: STEM_POLARITY[STEMS[stemIndex]],
    cstHour,
  };
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
 * @param {string} params.birthDate - ISO date string "YYYY-MM-DD"
 * @param {string} [params.birthTime] - "HH:MM" in WIB (UTC+7). Omit if unknown.
 * @param {string} [params.timezone] - Timezone offset string e.g. "+07:00". Defaults to WIB.
 * @returns {Object} Complete chart object
 *
 * @example
 * calculateBaziChart({ birthDate: '1990-03-15', birthTime: '14:30' })
 */
export function calculateBaziChart({ birthDate, birthTime = null, timezone = '+07:00' }) {
  // Parse birth datetime in WIB (UTC+7) by default
  const isoString = birthTime
    ? `${birthDate}T${birthTime}:00${timezone}`
    : `${birthDate}T12:00:00${timezone}`; // Noon default if no time (do NOT use for hour pillar)

  const birthDateObj = new Date(isoString);

  if (isNaN(birthDateObj.getTime())) {
    throw new Error(`Invalid birth date/time: ${isoString}`);
  }

  const yearPillar = getYearPillar(birthDateObj);
  const monthPillar = getMonthPillar(birthDateObj, STEMS.indexOf(yearPillar.stem));
  const dayPillar = getDayPillar(birthDateObj);
  const hourPillar = birthTime
    ? getHourPillar(birthDateObj, STEMS.indexOf(dayPillar.stem))
    : null;

  const chart = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  const elementBalance = countElements(chart);
  const dayMaster = {
    stem: dayPillar.stem,
    element: dayPillar.element,
    polarity: dayPillar.polarity,
  };

  const harmonyBranches = getHarmonyBranches(dayPillar.branch);
  const clashBranches = getClashBranches(dayPillar.branch);

  return {
    ...chart,
    dayMaster,
    elementBalance,
    harmonyBranches,
    clashBranches,
    birthDate,
    birthTime: birthTime ?? 'unknown',
    hasHourPillar: birthTime !== null,
  };
}

// ── Validation (run in dev to verify accuracy) ─────────────

export function runValidation() {
  const cases = [
    {
      label: 'Oct 1, 2000 noon WIB — year 庚辰, day 壬辰',
      input: { birthDate: '2000-10-01', birthTime: '12:00' },
      expect: { yearStem: '庚', yearBranch: '辰', dayMasterStem: '壬', dayBranch: '辰', monthBranch: '酉' },
    },
    {
      label: 'Feb 4, 2022 noon WIB (after 立春)',
      input: { birthDate: '2022-02-04', birthTime: '12:00' },
      expect: { yearStem: '壬', yearBranch: '寅', monthBranch: '寅' },
    },
    {
      label: 'Feb 3, 2022 noon WIB (before 立春)',
      input: { birthDate: '2022-02-03', birthTime: '12:00' },
      expect: { yearStem: '辛', yearBranch: '丑' },
    },
    {
      label: 'Jan 1, 1984 noon WIB — before 立春 (1983 BaZi year M11)',
      input: { birthDate: '1984-01-01', birthTime: '12:00' },
      expect: { yearStem: '癸', yearBranch: '亥', monthBranch: '子', dayMasterStem: '甲', dayBranch: '午' },
    },
  ];

  let passed = 0;
  for (const tc of cases) {
    const result = calculateBaziChart(tc.input);
    const checks = Object.entries(tc.expect);
    const ok = checks.every(([key, val]) => {
      const map = {
        dayMasterStem: result.dayMaster.stem,
        dayBranch: result.day.branch,
        yearStem: result.year.stem,
        yearBranch: result.year.branch,
        monthBranch: result.month.branch,
      };
      return map[key] === val;
    });
    console.log(`${ok ? '✓' : '✗'} ${tc.label}`);
    if (!ok) {
      console.log('  Expected:', tc.expect);
      console.log('  Got:', {
        yearStem: result.year.stem, yearBranch: result.year.branch,
        monthBranch: result.month.branch,
        dayMasterStem: result.dayMaster.stem, dayBranch: result.day.branch,
      });
    }
    if (ok) passed++;
  }
  console.log(`\n${passed}/${cases.length} validation cases passed`);
  return passed === cases.length;
}
