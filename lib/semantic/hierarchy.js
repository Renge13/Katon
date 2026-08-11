// ============================================================
// Stage 3, PHASE 2 — hierarchy scoring
// ============================================================
// Scores every fact 0 to 100 and sorts. The renderer respects the ranking and
// does not re-rank, so this file decides what every reading is ABOUT.
//
// Every constant lives in HIERARCHY_PARAMS. Same discipline as STRENGTH_PARAMS,
// same reason: a magic number buried in scoring code cannot be calibrated, and a
// chart-specific branch in scoring code is a bug rather than a calibration.
//
// NOTHING IN HERE IS FITTED. Rule 13 — one change, one measurement — means the
// scoring logic and the constants that tune it cannot land together. These are
// reasoned defaults chosen to make the axes mean what D2 says they mean. The
// first fitting pass is a separate commit with a separate measurement.
//
// ── THE FOUR AXES, AND THE FIFTH TERM D2 DOES NOT HAVE ─────
// D2 names four axes: extremity, convergence, actionability, tension. They rank
// FINDINGS well and they cannot rank the SPINE at all, because the four facts
// that are always present — Day Master, strength verdict, main profile, spouse
// palace — are by construction not extreme, not convergent and not paradoxical.
// Scored on the four axes alone they sink to the bottom of every chart, and a
// reading whose lowest-ranked fact is the Day Master is not a reading.
//
// So there is a fifth term, and it is a BASE rather than an axis: `role`. Spine
// facts start high and the axes move them; findings start low and must earn
// their place. This is an addition to D2 and it is flagged as one. The hand-
// written target file does the same thing implicitly — it scores the Day Master
// at 68 with no axis to justify it.
// ============================================================

import { ACTIONABLE_KINDS } from './facts.js';

export const HIERARCHY_PARAMS = {
  /**
   * Starting score by structural role. Not an axis — see the header.
   *
   * `spine` is the four always-present facts plus the CR-1 tension, which
   * supersedes the main profile and inherits its standing.
   */
  base: {
    spine: 55,
    finding: 25,
  },

  /** Axis weights. A fact can exceed 100 before clamping; that is intended. */
  weight: {
    convergence: 45,   // D2: the strongest signal, and it should dominate
    extremity: 35,
    tension: 30,
    actionability: 10, // binary bonus, deliberately small
  },

  /**
   * Below this, a fact is not worth room. A chart with nothing above it is a
   * quiet chart and the renderer is told to say less rather than manufacture
   * drama.
   */
  quietFloor: 70,

  extremity: {
    /** An element at exactly 0 is the maximum distance from normal. */
    elementAbsent: 100,
    /** Dominance ramps from the firing gate to here, where it saturates. */
    elementDominantGate: 35,
    elementDominantSaturates: 50,
  },

  convergence: {
    /** By number of distinct positions the same Aspek occupies. */
    positions: { 2: 70, 3: 100, 4: 100 },
    /**
     * Presence gate. Two positions of a 0.1-weight residual hidden stem is a
     * convergence by the letter of the rule and almost nothing in fact — chart 1
     * converges 食神 on 戊 x2 at qi 0.1. Scaling by total qi weight, saturating
     * at two full stems, is what separates that from 正官 on three full 癸.
     */
    presenceSaturates: 2.0,
    /** By how many notable things a void branch carries. */
    voidStack: { 2: 70, 3: 100, 4: 100 },
    /** Branch relations, by how much of a trine they actually complete. */
    relation: { 三合: 100, 半合: 50, 六合: 35 },
  },

  /**
   * Tension is GRADED, not binary. D2 says "a real paradox" gets the bonus, and
   * a CR-1 contradiction between the profile and the verdict is a different
   * animal from a 害's persistent low friction. Flattening them would let six
   * minor frictions outrank the one real paradox.
   */
  tension: {
    coherence_rule: 100,
    void_stack: 90,
    punishment: 70,   // 刑 — the only self-authored one
    clash: 60,        // 冲
    spouse_palace: 50,
    harm: 45,         // 害
    other: 40,
  },

  /**
   * MEASURED badge frequencies over the 13-chart fixture, 2026-08-02, from the
   * verified anchors. Rarity is 1 - frequency, so 孤辰 at 1/13 is near-maximum
   * extremity and 天乙貴人 at 10/13 is near-minimum.
   *
   * These are OBSERVATIONS with a date, not constants. n=13 is small and these
   * will move when the fixture grows; `tests/badge-anchors.spec.mjs` is the
   * source and asserts every one of them. Re-derive from it, never hand-edit.
   */
  badgeFrequency: {
    天乙貴人: 10 / 13, 文昌: 5 / 13, 驛馬: 4 / 13, 空亡: 4 / 13,
    桃花: 2 / 13, 羊刃: 2 / 13, 孤辰: 1 / 13,
  },

  /** MEASURED relation frequencies over the same fixture, same date, same caveat. */
  relationFrequency: {
    半合: 5 / 13, 冲: 4 / 13, 害: 4 / 13, 刑: 4 / 13, 六合: 3 / 13, 三合: 1 / 13,
  },
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const clamp100 = (n) => Math.max(0, Math.min(100, n));

/** The four always-present facts, plus the CR-1 tension that supersedes one of them. */
function roleOf(fact) {
  if (fact.id === 'profile_vs_favorable') return 'spine';
  if (fact.id === 'main_profile' || fact.id === 'spouse_palace') return 'spine';
  if (fact.id.startsWith('day_master_') || fact.id.startsWith('strength_')) return 'spine';
  return 'finding';
}

/** EXTREMITY — distance from normal. */
function extremityOf(fact, params) {
  const p = params.extremity;
  const kind = fact.provenance.kind;

  if (kind === 'element_absent') return p.elementAbsent;

  if (kind === 'element_dominant') {
    const span = p.elementDominantSaturates - p.elementDominantGate;
    return clamp01((fact.provenance.percent - p.elementDominantGate) / span) * 100;
  }

  if (kind === 'badge_anchor') {
    const frequency = params.badgeFrequency[fact.provenance.badge];
    // An unmeasured badge scores as if common. Silently treating it as rare
    // would let a new badge headline every chart it appears in.
    return frequency == null ? 0 : (1 - frequency) * 100;
  }

  if (kind === 'branch_relation') {
    const frequency = params.relationFrequency[fact.provenance.relation];
    return frequency == null ? 0 : (1 - frequency) * 100;
  }

  if (kind === 'punishment') {
    const frequency = params.relationFrequency['刑'];
    return frequency == null ? 0 : (1 - frequency) * 100;
  }

  if (kind === 'strength') {
    // How far the chart sits from the middle. A decisive verdict is extreme by
    // definition; a balanced one lands near 50 and scores near 0 on its own.
    // Read off support_share, which never reaches prose (renderer prompt bans
    // surfacing any number) but is exactly the right quantity here.
    return clamp01(Math.abs(fact.support_share - 50) / 50) * 100;
  }

  // Day Master, main profile, spouse palace, Aspek convergence, void stack.
  // Everyone has the first three; the last two are convergences, scored there.
  return 0;
}

/** CONVERGENCE — the same theme across multiple pillars. Dominates by design. */
function convergenceOf(fact, params) {
  const p = params.convergence;
  const kind = fact.provenance.kind;

  if (kind === 'aspek_convergence') {
    const positionScore = p.positions[Math.min(fact.provenance.positions.length, 4)] ?? 0;
    return positionScore * clamp01(fact.presence / p.presenceSaturates);
  }

  if (kind === 'void_stack') {
    return p.voidStack[Math.min(fact.stack_size, 4)] ?? 0;
  }

  if (kind === 'branch_relation') {
    return p.relation[fact.provenance.relation] ?? 0;
  }

  return 0;
}

/** TENSION — a real paradox, graded by what kind. */
function tensionOf(fact, params) {
  const p = params.tension;
  if (fact.provenance.kind === 'coherence_rule') return p.coherence_rule;
  if (fact.provenance.kind === 'void_stack') return p.void_stack;
  if (fact.provenance.kind === 'punishment') return p.punishment;
  if (fact.provenance.relation === '冲') return p.clash;
  if (fact.provenance.relation === '害') return p.harm;
  if (fact.id === 'spouse_palace') return fact.type === 'tension' ? p.spouse_palace : 0;
  return fact.type === 'tension' ? p.other : 0;
}

/**
 * ACTIONABILITY — binary. Does the fact give the reader something to do.
 *
 * Reads the ENGINE'S DECLARATION, never the prose. `fact.actionable` is the
 * `actionable_seed` string, so scoring on it meant a fact became more important
 * the moment someone wrote its sentence — authoring re-ranked charts. Ruled out
 * 2026-08-11: order is a function of the chart (rule 14).
 *
 * The declaration lives with fact emission in facts.js#ACTIONABLE_KINDS, because
 * what a fact IS is a Phase 1 question; this file only decides what it is WORTH.
 * An unlisted kind scores 0, so a new fact kind has to say so to be promoted —
 * silence cannot promote anything.
 */
function actionabilityOf(fact) {
  return ACTIONABLE_KINDS[fact.provenance?.kind] ? 100 : 0;
}

/**
 * Score and rank a fact inventory.
 *
 * Returns NEW fact objects; the inventory is not mutated. Ties break on the
 * inventory's own emission order, which is deterministic, so two runs of the
 * same chart always produce the same ordering — a hard requirement, because the
 * cache key is a hash of the serialised result.
 *
 * @param {Object[]} facts output of buildFactInventory
 * @param {Object} [params]
 * @returns {{ facts: Object[], quiet_chart: boolean }}
 */
export function scoreFacts(facts, params = HIERARCHY_PARAMS) {
  const scored = facts.map((fact, index) => {
    const axes = {
      extremity: clamp100(extremityOf(fact, params)),
      convergence: clamp100(convergenceOf(fact, params)),
      tension: clamp100(tensionOf(fact, params)),
      actionability: actionabilityOf(fact),
    };
    const role = roleOf(fact);
    const weighted = Object.entries(axes)
      .reduce((sum, [axis, value]) => sum + (params.weight[axis] * value) / 100, 0);

    return {
      ...fact,
      importance: Math.round(clamp100(params.base[role] + weighted)),
      // Inspectable by design. Calibration depends on seeing WHICH axis carried a
      // fact, exactly as computeStrength exposes its four factors.
      hierarchy: { role, ...axes },
      _order: index,
    };
  });

  scored.sort((a, b) => b.importance - a.importance || a._order - b._order);
  for (const fact of scored) delete fact._order;

  return {
    facts: scored,
    quiet_chart: !scored.some((f) => f.importance >= params.quietFloor),
  };
}
