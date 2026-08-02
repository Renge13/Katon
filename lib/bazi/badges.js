// ============================================================
// Bintang (symbolic stars) — anchor tables and detection
// ============================================================
// A badge is a fixed ANCHOR BRANCH computed from the day pillar. The badge FIRES
// when that anchor branch appears among the chart's branches, and it carries the
// palace of every position it lands in. Anchor and firing are two different
// things: every chart has all seven anchors, most charts fire two or three.
//
// ── PROVENANCE OF THE FIVE JOEY-VERIFIED TABLES ────────────
// NOBLEMAN / INTELLIGENCE / PEACH_BLOSSOM / SKY_HORSE / SOLITARY are transcribed
// from docs/prompts/D2a-stage3-anchors.md, where 12 charts were driven through
// Joey Yap's plotter and all 60 printed values matched, with every row of every
// table exercised at least once. The year-pillar alternative scores 0/12 on Peach
// Blossom and Sky Horse. tests/badge-anchors.spec.mjs holds those 60 values.
// THE TABLE IS EVIDENCE. If a change makes that test fail, the change is wrong.
//
// All five key off the DAY pillar as buildChart already produces it. Chart 7 is
// the load-bearing case: born 23:30, so under 流派2 its day pillar is 甲子 rather
// than 癸亥, and Joey's stars match the 流派2 pillar. No separate day-boundary
// convention is needed here.
//
// ── THE TWO WITHOUT A JOEY ORACLE ──────────────────────────
// Joey's plotter prints exactly five natal stars, so YANG_BLADE and the Void have
// no oracle in the sense the five above do. They are NOT in the same position as
// 華蓋, which was descoped (see below):
//   - 羊刃 is written down twice in docs/ (engine/engine-session-state.md line 92,
//     engine/bazi-blueprint.md line 223) with the same table, and it is
//     independently corroborated inside this repo by DI_WANG_BRANCH in strength.ts
//     (甲→卯, 丙→午, 戊→午, 庚→酉, 壬→子 — 羊刃 IS the yang stem's 帝旺 branch).
//   - 空亡 is not a lookup table at all. It falls out of the structure of the
//     sexagenary cycle: a 旬 covers ten of the twelve branches, and the two it
//     misses are void. There is nothing to get wrong except the arithmetic, and
//     the derivation is checked against a known value in the spec test.
// 華蓋 had neither: no docs/ table, no repo corroboration, no oracle. It is
// DESCOPED and deliberately absent from this file (D2a §2).
// ============================================================

import { STEMS, BRANCHES, STEM_POLARITY } from './stems.js';

/** 天乙貴人 Nobleman. Key: day stem. Value: TWO branches, so it can fire twice. */
export const NOBLEMAN = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['寅', '午'],
};

/** 文昌 Intelligence. Key: day stem. Value: ONE branch. */
export const INTELLIGENCE = {
  甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};

/** The 三合 trine group containing a branch. Keys 桃花 and 驛馬. */
export const TRINE_GROUPS = ['申子辰', '巳酉丑', '寅午戌', '亥卯未'];

/** 桃花 Peach Blossom. Key: the trine group containing the DAY BRANCH. */
export const PEACH_BLOSSOM = {
  申子辰: '酉', 巳酉丑: '午', 寅午戌: '卯', 亥卯未: '子',
};

/** 驛馬 Sky Horse. Key: the trine group containing the DAY BRANCH. */
export const SKY_HORSE = {
  申子辰: '寅', 巳酉丑: '亥', 寅午戌: '申', 亥卯未: '巳',
};

/**
 * 孤辰 Solitary. Key: the SEASON group containing the DAY BRANCH.
 * A DIFFERENT grouping from the trines above — 亥子丑 is winter, not a trine.
 * Do not reuse TRINE_GROUPS here.
 */
export const SEASON_GROUPS = ['亥子丑', '寅卯辰', '巳午未', '申酉戌'];
export const SOLITARY = {
  亥子丑: '寅', 寅卯辰: '巳', 巳午未: '申', 申酉戌: '亥',
};

/**
 * 羊刃 Yang Blade. Yang day stems ONLY — the five yin stems (乙丁己辛癸) never
 * carry it, and checking it universally fails on half of all charts.
 */
export const YANG_BLADE = { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' };

/** The group in `groups` that contains `branch`. */
function groupOf(groups, branch) {
  return groups.find((g) => g.includes(branch));
}

/**
 * 空亡 — the two branches missing from the day pillar's 旬 (ten-day cycle).
 *
 * A 旬 starts at a 甲 stem and runs ten sexagenary positions, so it covers ten of
 * the twelve branches. The two it never reaches are void. Worked example, the one
 * asserted in the spec: 丙子 is position 12, its 旬 opens at position 10 (甲戌), so
 * the decade runs 戌亥子丑寅卯辰巳午未 and 申酉 are void.
 *
 * @param {string} dayStem
 * @param {string} dayBranch
 * @returns {string[]} the two void branches, in branch order within the cycle
 */
export function voidBranches(dayStem, dayBranch) {
  const stemIndex = STEMS.indexOf(dayStem);
  const branchIndex = BRANCHES.indexOf(dayBranch);
  if (stemIndex < 0 || branchIndex < 0) {
    throw new Error(`Not a sexagenary day pillar: "${dayStem}${dayBranch}"`);
  }
  // Branch the 旬 opens on. Equivalently (position - position % 10) % 12.
  const xunHead = (branchIndex - stemIndex + 12) % 12;
  return [BRANCHES[(xunHead + 10) % 12], BRANCHES[(xunHead + 11) % 12]];
}

/**
 * Every badge's anchor branch(es) for a chart, whether or not it fires.
 *
 * Separate from firing so the anchors stay directly comparable against Joey's
 * printed `Personal Chart Details`, which lists the anchor, not the hit.
 *
 * @param {{ stem: string, branch: string }} dayPillar
 * @returns {Record<string, string[]>} badge key -> anchor branches
 */
export function badgeAnchors(dayPillar) {
  const { stem, branch } = dayPillar;
  const trine = groupOf(TRINE_GROUPS, branch);
  const season = groupOf(SEASON_GROUPS, branch);
  if (!trine || !season) throw new Error(`Unknown day branch "${branch}"`);

  return {
    天乙貴人: [...NOBLEMAN[stem]],
    文昌: [INTELLIGENCE[stem]],
    桃花: [PEACH_BLOSSOM[trine]],
    驛馬: [SKY_HORSE[trine]],
    孤辰: [SOLITARY[season]],
    // Yin day masters have no 羊刃 at all. An empty anchor list, never a null
    // entry, so every consumer can iterate the same shape.
    羊刃: STEM_POLARITY[stem] === 'Yang' ? [YANG_BLADE[stem]] : [],
    空亡: voidBranches(stem, branch),
  };
}

/** The seven detectable badge keys, in a stable order. 華蓋 is descoped (D2a §2). */
export const BADGE_KEYS = ['天乙貴人', '文昌', '桃花', '驛馬', '孤辰', '羊刃', '空亡'];

/**
 * Badges present in a chart, with the positions each one lands in.
 *
 * Nobleman has two anchor branches and both can be present, so `hits` is a list
 * and must not be collapsed to a boolean — roughly one chart in thirteen carries
 * two Bintang Penolong, and that is a real distinction on the sharecard.
 *
 * @param {Object} chart output of calculateBaziChart
 * @returns {{ key: string, anchors: string[],
 *             hits: { position: 'year'|'month'|'day'|'hour', branch: string }[] }[]}
 */
export function computeBadges(chart) {
  const anchors = badgeAnchors(chart.day);
  const positions = [['year', chart.year], ['month', chart.month], ['day', chart.day]];
  if (chart.hour) positions.push(['hour', chart.hour]);

  const out = [];
  for (const key of BADGE_KEYS) {
    const anchorBranches = anchors[key];
    const hits = [];
    for (const [position, pillar] of positions) {
      if (anchorBranches.includes(pillar.branch)) hits.push({ position, branch: pillar.branch });
    }
    if (hits.length > 0) out.push({ key, anchors: anchorBranches, hits });
  }
  return out;
}
