// ============================================================
// Oracle 2 metric — bar agreement against Joey's published bars
// ============================================================
// ONE implementation, shared by tests/bazi-engine.report.mjs and
// scripts/calibrate-strength.mjs. Two copies of a scoring metric is how you get
// a calibration run and a validation run that disagree.
//
// WHY THE ORIGINAL METRIC WAS REPLACED (ruling E, docs/prompts/C2-rulings.md)
// "Exact top-3 rank order, target 11/13" is unreachable as specified, because
// Joey publishes TIES: chart 9 is 食神 98 / 傷官 98, chart 13 is 比肩 80 / 偏印 80.
// On a tied pair there is no assertable order, so a correct model fails those
// charts. Every metric here is tie-tolerant on BOTH sides — Joey's ties make an
// ordering unassertable, and the engine's own ties make its top-3 membership
// ambiguous at the boundary.
//
// SPEARMAN IS NOW COMPUTABLE (C4 step 4). All ten bars exist for all 13 charts,
// so `rankAgreement` below does real Spearman with tied ranks averaged. Pairwise
// concordance is kept alongside it because it answers a different question —
// Spearman measures whole-shape agreement, concordance counts how many ordered
// pairs are right — and because it is what the session-2 numbers were reported
// in, so the series stays comparable.
//
// ORACLE 3 (element rank order) is the PRIMARY GATE as of C4 step 3. It is five
// values instead of ten, it is where the defect actually lives, and it is far
// less noisy than the Ten God projection layered on top of it. Both oracles run
// through the same `rankAgreement`, just over different projections.
// ============================================================

/**
 * Score one chart's engine bars against Joey's published bars.
 *
 * @param {Record<string, number>} engineScores every Ten God -> its bar value
 * @param {{god: string, score: number|null}[]} published Joey's top bars, in his order
 */
export function scoreBars(engineScores, published) {
  const ranked = Object.entries(engineScores).sort((a, b) => b[1] - a[1]);
  const engineTop3 = ranked.slice(0, 3).map(([g]) => g);
  const scoreOf = (g) => engineScores[g] ?? 0;

  // ── Metric 1: top-3 SET match, tie-tolerant ──────────────
  // Joey's three gods must all sit at or above the engine's third-best score.
  // The ">=" is what tolerates an engine tie straddling the third slot; without
  // it, an arbitrary tiebreak decides a pass.
  const thirdBest = ranked.length >= 3 ? ranked[2][1] : -Infinity;
  const setMatch = published.every((p) => scoreOf(p.god) >= thirdBest);
  // How many gods the engine actually ties at or above that cut. 3 means no
  // boundary tie; more means the set match was granted some slack, and that
  // slack should be visible rather than hidden.
  const tiedTopSize = ranked.filter(([, v]) => v >= thirdBest).length;

  // ── Metric 2: pairwise concordance over Joey's gods ──────
  // Only pairs Joey actually separates are comparable. A pair he ties carries
  // no information about order and is excluded, not scored.
  let comparable = 0;
  let concordant = 0;
  let engineTies = 0;
  for (let i = 0; i < published.length; i++) {
    for (let j = i + 1; j < published.length; j++) {
      const a = published[i];
      const b = published[j];
      if (a.score == null || b.score == null || a.score === b.score) continue;
      comparable++;
      const joeyHigher = a.score > b.score ? a.god : b.god;
      const joeyLower = a.score > b.score ? b.god : a.god;
      if (scoreOf(joeyHigher) === scoreOf(joeyLower)) engineTies++;
      else if (scoreOf(joeyHigher) > scoreOf(joeyLower)) concordant++;
    }
  }

  // ── Metric 3: exact order, tie-tolerant. INFORMATIONAL ONLY ──
  // The same three gods, and every pair Joey separates ordered the same way.
  // Pairs Joey ties may appear in either order.
  const exactOrder = setMatch && comparable === concordant;

  return {
    engineTop3,
    setMatch,
    tiedTopSize,
    comparable,
    concordant,
    engineTies,
    exactOrder,
    /** Set overlap 0..3, kept for continuity with the session-1 numbers. */
    overlap: published.filter((p) => engineTop3.includes(p.god)).length,
  };
}

// ── Generic rank agreement ─────────────────────────────────
// Used for BOTH oracles: Oracle 3 over the five elements (primary gate) and
// Oracle 2 over the ten Ten Gods. One implementation, two projections.

/** Competition-free ranks with ties averaged, which is what Spearman requires. */
function tiedRanks(values) {
  const sorted = [...values].map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const ranks = new Array(values.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].v === sorted[i].v) j++;
    const avg = (i + j) / 2 + 1; // 1-based, averaged across the tied block
    for (let k = i; k <= j; k++) ranks[sorted[k].i] = avg;
    i = j + 1;
  }
  return ranks;
}

function pearson(a, b) {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  // Zero variance means every value is tied; there is no ordering to correlate.
  if (da === 0 || db === 0) return null;
  return num / Math.sqrt(da * db);
}

/**
 * Compare an engine distribution against Joey's over the same keys.
 *
 * @param {Record<string, number>} engine
 * @param {Record<string, number>} joey
 */
export function rankAgreement(engine, joey) {
  const keys = Object.keys(joey);
  const e = keys.map((k) => engine[k] ?? 0);
  const j = keys.map((k) => joey[k]);

  const spearman = pearson(tiedRanks(e), tiedRanks(j));

  // Pair concordance: only pairs Joey actually separates carry order information.
  let comparable = 0;
  let concordant = 0;
  for (let a = 0; a < keys.length; a++) {
    for (let b = a + 1; b < keys.length; b++) {
      if (j[a] === j[b]) continue;
      comparable++;
      const joeyHigherIsA = j[a] > j[b];
      if (e[a] === e[b]) continue; // engine tie -> not concordant
      if ((e[a] > e[b]) === joeyHigherIsA) concordant++;
    }
  }

  // Exact order, tie-tolerant: every pair Joey separates must be ordered right.
  const exactOrder = comparable > 0 && concordant === comparable;

  // Top-1 agreement, tie-tolerant on Joey's side.
  const joeyMax = Math.max(...j);
  const engineMax = Math.max(...e);
  const joeyTop = keys.filter((k, i) => j[i] === joeyMax);
  const engineTop = keys.filter((k, i) => e[i] === engineMax);
  const top1 = engineTop.some((k) => joeyTop.includes(k));

  return { spearman, comparable, concordant, exactOrder, top1, keys };
}

/** Aggregate rank-agreement results across charts. */
export function aggregateRanks(results) {
  const usable = results.filter((r) => r.spearman != null);
  const comparable = results.reduce((s, r) => s + r.comparable, 0);
  const concordant = results.reduce((s, r) => s + r.concordant, 0);
  return {
    n: results.length,
    exactOrder: results.filter((r) => r.exactOrder).length,
    top1: results.filter((r) => r.top1).length,
    comparable,
    concordant,
    concordance: comparable === 0 ? 0 : concordant / comparable,
    /** Mean Spearman across charts where it is defined. */
    spearman: usable.length === 0 ? null : usable.reduce((s, r) => s + r.spearman, 0) / usable.length,
    spearmanCharts: usable.length,
  };
}

export function formatRanks(label, agg) {
  const sp = agg.spearman == null ? 'n/a' : agg.spearman.toFixed(3);
  return [
    `  ${label}`,
    `    exact order (tie-tolerant)  ${agg.exactOrder}/${agg.n}`,
    `    top-1 element/god correct   ${agg.top1}/${agg.n}`,
    `    mean Spearman               ${sp}   (over ${agg.spearmanCharts} charts)`,
    `    pair concordance            ${agg.concordant}/${agg.comparable} = ${(agg.concordance * 100).toFixed(1)}%`,
  ].join('\n');
}

/** Aggregate per-chart results into the three headline numbers. */
export function aggregate(results) {
  const n = results.length;
  const comparable = results.reduce((s, r) => s + r.comparable, 0);
  const concordant = results.reduce((s, r) => s + r.concordant, 0);
  return {
    n,
    setMatch: results.filter((r) => r.setMatch).length,
    exactOrder: results.filter((r) => r.exactOrder).length,
    comparable,
    concordant,
    /** Kendall-style agreement over every pair Joey separates, 0..1. */
    concordance: comparable === 0 ? 0 : concordant / comparable,
    overlap: results.reduce((s, r) => s + r.overlap, 0),
  };
}

/** The three headline numbers, formatted identically wherever they are printed. */
export function formatAggregate(agg) {
  const pct = (agg.concordance * 100).toFixed(1);
  return [
    `  1. top-3 SET match      ${agg.setMatch}/${agg.n}   (primary; target 11)`,
    `  2. pair concordance     ${agg.concordant}/${agg.comparable} = ${pct}%   (rank shape, ties excluded)`,
    `  3. exact order          ${agg.exactOrder}/${agg.n}   (informational, never a gate)`,
    `     set overlap          ${agg.overlap}/${agg.n * 3}`,
  ].join('\n');
}
