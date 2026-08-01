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
// NOTE ON SPEARMAN. Ruling E asks for a Spearman correlation "over all ten".
// That is not computable from this fixture: it records only Joey's top 3 (top 4
// for chart 13), not all ten of his bars. A correlation needs both full
// rankings. The nearest valid measure over the data we actually have is
// PAIRWISE CONCORDANCE across Joey's published gods, which is Kendall's tau
// numerator, is well defined at n=3, and handles ties by exclusion rather than
// by inventing a rank. If the remaining seven bars per chart are ever
// transcribed, full Spearman becomes available and should replace it.
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
