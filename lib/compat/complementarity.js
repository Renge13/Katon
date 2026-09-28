// ============================================================
// lib/compat/complementarity.js — CROSS-CHART element complementarity (P3 facts)
// ============================================================
// FACTS ONLY. No prose, no score, no interpretation string. Rule 14: the engine
// owns all facts, hierarchy and structure; the LLM chooses only words.
//
// The question, per prompt W: for each direction, does the other chart carry
// presence in the element this chart's favourable-element logic names?
//
// ── WHAT IS REUSED, AND WHY THESE TWO AND NOT OTHERS ───────
//   computeStrength(chart).favorable   lib/bazi/strength.ts, returned at :660
//       Already ordered by scarcity: `byScarcity` (:629) sorts ascending on
//       elementTotals, so favorable[0] is the scarcest and therefore the most
//       needed. THIS MODULE DOES NOT RE-RANK THAT LIST. It walks the engine's own
//       priority order and takes the first element the other chart can actually
//       supply, which is why an emitted fact carries its rank: rank 1 means the
//       first choice was unavailable, and that is a different fact from rank 0.
//   elementPresence(chart)             lib/semantic/facts.js:121
//       Presence as percent of the chart's total weight, computed over
//       `chart.elementBalance` = countElements() at lib/bazi/buildChart.js:80.
//
// NO STRENGTH IS RECOMPUTED HERE. `computeStrength` is called only when the caller
// does not already hold its output, and nothing in this file reimplements any part
// of it. Rule 7's closed files - lib/bazi/tenGods.js and lib/bazi/mainProfile.js -
// are not imported, and the spec asserts the import list.
//
// PRESENCE IS NOT STRENGTH, AND CONFLATING THEM IS THE LIVE FORM OF RULE 9.
// `strength.elementStrength` is a seasonal strength DISTRIBUTION;
// `elementPresence` counts what the chart actually holds. A supplier can only
// supply what it HOLDS, so presence is the right input and `elementStrength` is
// never read. Rule 9's named function, `buildElementBars`, lived in
// lib/readingView.js and was deleted at the 2026-08-23 promotion
// (`grep -rn "buildElementBars" lib/` -> comments in strength.ts only), so it
// cannot be reached; the spec keeps the assertion anyway, against its return.
//
// ABSENCE MEANS EXACTLY ZERO, AND THAT THRESHOLD IS NOT INVENTED HERE.
// lib/semantic/facts.js:297 fires its `element_absent` fact on `if (pct > 0)
// continue`, so absent is presence === 0. `sameImbalance` uses the same test, so a
// gap this module reports is the same gap the reading already calls missing.
//
// ── ENGLISH ELEMENT KEYS, DELIBERATELY ────────────────────
// Elements stay as the engine's own 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water'.
// `elementId()` (lib/semantic/glossary.js:35) returns an Indonesian display name,
// and prompt W bars any Indonesian string from lib/compat/. Mapping to Indonesian
// is the semantic layer's job when tranche 2 builds reading facts out of these.
//
// ── WHAT THIS DOES NOT SAY ────────────────────────────────
// Nothing here means "compatible". Ruling A (Reyner, 2026-09-07) keeps
// cross-chart MEANING in the content layer: that one chart holds an element the
// other's strength verdict favours is a FACT, and what it is worth to a
// relationship is not the engine's to decide.
// ============================================================

import { computeStrength } from '../bazi/strength.ts';
import { elementPresence } from '../semantic/facts.js';

/**
 * The first element the receiver favours that the supplier holds MORE of than the
 * receiver does.
 *
 * Walks `receiverFavourable` in its given order - the strength engine's scarcity
 * order - and stops at the first element the supplier holds more of than the
 * receiver. Null when there is none.
 *
 * ── MORE THAN THE RECEIVER, NOT MERELY ANY (Reyner's ruling 2, 2026-09-28) ──
 * docs/product/ah-protection-rulings-2026-09-28.md, third set; measured in AK §2
 * (scripts/measure-supply-meaning.mjs). "X membawa elemen E" read as X bringing
 * something the receiver lacks, and the old walk named E whenever X held any of it:
 * rVe4ca's A was said to bring B Water while holding 1.3 against B's 5. An element
 * the supplier holds less of, or the same amount of, is now skipped; zero is the
 * special case of that and needs no branch of its own.
 */
function supplyFor(receiverFavourable, supplierPresence, receiverPresence, supplierId, receiverId) {
  for (const [rank, element] of receiverFavourable.entries()) {
    const percent = supplierPresence[element] ?? 0;
    if (percent <= (receiverPresence[element] ?? 0)) continue;
    return {
      kind: 'compat_complementarity',
      element,
      supplier: supplierId,
      receiver: receiverId,
      // Which of the receiver's favourable elements this is. Rank 1 means the
      // scarcer first choice was unavailable; the renderer is entitled to know
      // that the match was the second-best one.
      receiver_favourable_rank: rank,
      supplier_presence_percent: percent,
    };
  }
  return null;
}

/**
 * Cross-chart element complementarity between two charts (P3 facts).
 *
 * @param {Object} a Person A's chart, output of calculateBaziChart
 * @param {Object} b Person B's chart, output of calculateBaziChart
 * @param {Object} [strengthA] output of computeStrength(a); computed when omitted
 * @param {Object} [strengthB] output of computeStrength(b); computed when omitted
 * @returns {{
 *   aSupplies: Object|null,
 *   bSupplies: Object|null,
 *   sameImbalance: string[],
 * }} facts only. `aSupplies` is what A gives B, drawn from B's favourable list,
 *    and `bSupplies` the mirror. `sameImbalance` is every element absent from
 *    BOTH charts, in the presence object's own key order; empty when there is none.
 */
export function compatComplementarity(
  a,
  b,
  strengthA = computeStrength(a),
  strengthB = computeStrength(b),
) {
  const presenceA = elementPresence(a);
  const presenceB = elementPresence(b);

  // Both charts lacking the same element. Not a supply in either direction, and
  // the one shape here that is symmetric rather than directional.
  const sameImbalance = Object.keys(presenceA)
    .filter((element) => presenceA[element] === 0 && presenceB[element] === 0);

  return {
    aSupplies: supplyFor(strengthB.favorable, presenceA, presenceB, 'A', 'B'),
    bSupplies: supplyFor(strengthA.favorable, presenceB, presenceA, 'B', 'A'),
    sameImbalance,
  };
}
