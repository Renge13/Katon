// ============================================================
// Chart-level branch relations (六合 三合 半合 冲 害)
// ============================================================
// getHarmonyBranches / getClashBranches in stems.js answer "what harmonises with
// THIS branch". Stage 3 needs the different question: which relations are
// actually PRESENT among the chart's own four branches, and in which positions.
// A relation with no position is not a fact a reading can use — CR-6 reads every
// marker through its palace.
//
// 刑 is deliberately not here. It is already computed by branchPunishments and
// hangs off chart.punishments; a second entry point would be a second source of
// truth for the same table.
//
// ── ON THE TWO TABLES DEFINED IN THIS FILE ─────────────────
// SIX_HARMS (六害) is not in stems.js. It is the standard table and it is written
// down in docs/content/glossary.json under relasi_cabang.害.pairs, which is the
// Reyner-reviewed content file: 子未 丑午 寅巳 卯辰 申亥 酉戌. The spec test asserts
// this file and the glossary agree, so the two cannot drift.
//
// TRINE_SETS duplicates the members of the private TRINES const in strength.ts.
// That duplication is deliberate and guarded rather than removed: strength.ts is
// closed (D2 "do not touch the strength engine"), so instead of reaching into it,
// tests/relations.spec.mjs asserts the two tables agree member-for-member. If
// strength.ts is ever opened for other reasons, collapse these into one export.
// ============================================================

import { SIX_HARMONIES, SIX_CLASHES } from './stems.js';

/** 六害 — persistent small friction, not a head-on collision. */
export const SIX_HARMS = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'],
  ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

/**
 * 三合 trines. `peak` is the cardinal member; a two-branch subset counts as 半合
 * only when it includes the peak, which is the same rule strength.ts applies to
 * rooting risk.
 */
export const TRINE_SETS = [
  { members: ['申', '子', '辰'], peak: '子', element: 'Water', key: '申子辰' },
  { members: ['寅', '午', '戌'], peak: '午', element: 'Fire', key: '寅午戌' },
  { members: ['巳', '酉', '丑'], peak: '酉', element: 'Metal', key: '巳酉丑' },
  { members: ['亥', '卯', '未'], peak: '卯', element: 'Wood', key: '亥卯未' },
];

/** Positions of a chart, in reading order, hour omitted when unknown. */
function positionsOf(chart) {
  const out = [['year', chart.year], ['month', chart.month], ['day', chart.day]];
  if (chart.hour) out.push(['hour', chart.hour]);
  return out;
}

/** Every position holding `branch`. */
function positionsHolding(positions, branch) {
  return positions.filter(([, p]) => p.branch === branch).map(([pos]) => pos);
}

/**
 * Branch relations present in a chart.
 *
 * One entry per distinct relation instance. A pair relation between two branches
 * is reported once no matter how many positions hold each branch; the positions
 * are all listed, because a 冲 that touches three pillars is a bigger fact than
 * one that touches two and the hierarchy layer needs to see that.
 *
 * @param {Object} chart output of calculateBaziChart
 * @returns {{ type: '六合'|'三合'|'半合'|'冲'|'害',
 *             branches: string[], positions: string[], element?: string }[]}
 */
export function branchRelations(chart) {
  const positions = positionsOf(chart);
  const present = new Set(positions.map(([, p]) => p.branch));
  const out = [];

  const addPair = (type, pairs) => {
    for (const [a, b] of pairs) {
      if (!present.has(a) || !present.has(b)) continue;
      out.push({
        type,
        branches: [a, b],
        positions: [...positionsHolding(positions, a), ...positionsHolding(positions, b)],
      });
    }
  };

  addPair('六合', SIX_HARMONIES);
  addPair('冲', SIX_CLASHES);
  addPair('害', SIX_HARMS);

  for (const trine of TRINE_SETS) {
    const hits = trine.members.filter((m) => present.has(m));
    const full = hits.length === 3;
    // 半合 needs the peak. Two non-peak members pull toward nothing in particular.
    const half = hits.length === 2 && hits.includes(trine.peak);
    if (!full && !half) continue;
    out.push({
      type: full ? '三合' : '半合',
      branches: hits,
      positions: hits.flatMap((b) => positionsHolding(positions, b)),
      element: trine.element,
      trine: trine.key,
    });
  }

  return out;
}
