// ============================================================
// Joey's published bars — full-ten helpers
// ============================================================
// Joey's PDF prints all TEN profiles with natal percentages on page 2 under
// "10 PROFILES STRENGTH CHART". The fixture originally captured only the top 3,
// because that is what was transcribed — not what Joey publishes.
//
// WHY THE FULL TEN MATTER (docs/prompts/C3-ruling-B.md)
// Ten bars carry exactly five elements' worth of information: each element maps
// to two gods, one yin one yang, so summing a god pair recovers that element's
// strength. The full ten therefore expose JOEY'S ELEMENT DISTRIBUTION directly —
// five known values per chart, 65 across the fixture — instead of forcing an
// element model to be inferred through a three-bar aperture.
//
// Session 2 established that the element ranking is the defect and that it can
// host Joey's top-3 in only 6/13 charts. Fitting that through the top 3 was the
// keyhole. This is the widened one.
//
// STATUS: shape only. Chart 13 is transcribed; the other twelve are pending.
// ============================================================

import { tenGodElement, ALL_TEN_GODS, ELEMENTS } from '../lib/bazi/strength.ts';

/**
 * Sum Joey's ten bars into his five element strengths.
 *
 * @param {Record<string, number>} allBars every Ten God -> Joey's natal percentage
 * @param {string} dmElement the chart's Day Master element
 */
export function elementBarsFrom(allBars, dmElement) {
  const out = {};
  for (const el of ELEMENTS) out[el] = 0;
  for (const god of ALL_TEN_GODS) {
    const v = allBars[god];
    if (typeof v !== 'number') throw new Error(`allBars is missing ${god}`);
    out[tenGodElement(dmElement, god)] += v;
  }
  return out;
}

/** Ranking of elements by Joey's strength, strongest first. Ties keep table order. */
export function elementRankFrom(allBars, dmElement) {
  return Object.entries(elementBarsFrom(allBars, dmElement))
    .sort((a, b) => b[1] - a[1])
    .map(([el]) => el);
}

/** True when a fixture row carries the full ten bars rather than just the top 3. */
export function hasFullBars(row) {
  return row?.expect?.allBars != null;
}

/**
 * Cross-check a row's `allBars` against its independently transcribed
 * `topThreeBars`. Both come from the same PDF page, so they must agree; a
 * mismatch is a transcription error in one of them, caught the moment the
 * remaining twelve charts land rather than after a model has been fitted to it.
 *
 * Returns a list of problem strings — empty means consistent.
 */
export function crossCheckBars(row) {
  const problems = [];
  const { allBars, topThreeBars } = row.expect;
  if (allBars == null) return problems;

  for (const god of ALL_TEN_GODS) {
    if (typeof allBars[god] !== 'number') problems.push(`allBars missing ${god}`);
  }
  if (problems.length) return problems;

  // Every published top-3 score must match allBars exactly.
  for (const b of topThreeBars) {
    if (b.score == null) continue;
    if (allBars[b.god] !== b.score) {
      problems.push(`${b.god}: topThreeBars ${b.score} vs allBars ${allBars[b.god]}`);
    }
  }

  // The top-3 gods must actually be a valid top-3 of allBars, allowing ties.
  const sorted = Object.entries(allBars).sort((a, b) => b[1] - a[1]);
  const thirdBest = sorted[2][1];
  for (const b of topThreeBars) {
    if (allBars[b.god] < thirdBest) {
      problems.push(`${b.god} (${allBars[b.god]}) is not in allBars' top 3 (cut ${thirdBest})`);
    }
  }
  return problems;
}
