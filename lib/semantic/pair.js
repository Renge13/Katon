// ============================================================
// lib/semantic/pair.js — the pair reading's semantic JSON
// ============================================================
// THE SAME CONTRACT AS THE MIRROR'S, NOT A PARALLEL PIPELINE. `renderReading`,
// `validateRendering`, `assembleFallback`, `computeCacheKey` and `persistRendered`
// consume this unchanged. Every difference is CONTENT; the shape is
// `buildSemanticJson`'s.
//
// That is why the two helpers here are imported rather than reimplemented:
// `fact()` from facts.js builds each fact with the glossary content merged in and
// the gap made visible, and `requiredPoints()` from index.js derives coverage
// from what a fact actually carries. A second definition of either would be a
// second definition of the contract.
//
// ══ `kind` IS THE ONE FIELD EVERY CONSUMER BRANCHES ON ══════
// Added to both builders in the same commit. `renderOnce` picks the prompt by it,
// `validateRendering` activates the pair-only checks by it, and the CACHE KEY
// hashes it - which is what keeps the two key spaces from colliding.
//
// ══ NO BIRTH DATA. NO PERSON B ANYWHERE BUT AS DERIVED FACTS ══
// Ruled 2026-09-07: person B gets no mirror, no reading, no link. Nothing here
// carries a birth date or time for either person - only what the five
// `lib/compat/*` modules derived. The spec asserts it by scanning the serialised
// output for the literal values.
//
// ══ THE GLOSSARY IS KEYED BY VARIANT, NOT BY FACT ID ═══════
// CORRECTED 2026-09-08. The first shape gave each FACT one cell - `p2_day_pair`
// had a single `label_meaning` - and that cannot work, because
// `lib/render/fallback.js` picks the floor's text straight out of the cell. One
// cell per fact means one sentence for every day-branch relation, so a clashed
// seat and a harmonised seat would read identically. **The floor picks text by
// RELATION, so the glossary has to be keyed by relation.**
//
// So each fact resolves a VARIANT KEY from what the engine actually found, and
// the shape is the rulings file's: docs/content/compat-glossary-rulings.md, 24
// cells. `p0_names` resolves none - both names come from `arketipe`, which is
// already ruled, and inventing a cell for it would be inventing a string nobody
// ruled.
// ============================================================

import { voiceVersion } from '../voice.js';
import { GLOSSARY, elementId, fillPairTemplate } from './glossary.js';
import { fact } from './facts.js';
import { mainProfile } from '../bazi/mainProfile.js';
import { ENGINE_VERSION, requiredPoints, markVoice } from './index.js';

import { compatBranchRelations } from '../compat/branchRelations.js';
import { compatComplementarity } from '../compat/complementarity.js';
import { compatStemRelation } from '../compat/stemRelation.js';
import { compatTemperament } from '../compat/temperament.js';
import { compatPullFit } from '../compat/pullFit.js';

/**
 * The pair's safety flags. The mirror's four, plus three the pair needs.
 *
 * `no_verdict` - rule doc 2.4: no overall pass/fail and no score, ever.
 * `two_people` - rule 25 applies to BOTH people, and the reading must not advise
 *   either of them to leave or to stay. A mirror has one subject; this has two,
 *   and the failure mode a single-subject reading cannot have is taking a side.
 * `p2_reframe_required` - added conditionally, not here. See below.
 */
const PAIR_SAFETY_FLAGS = [
  'no_fatalism', 'no_medical', 'no_financial', 'no_god_ranking',
  'no_verdict', 'two_people',
];

/** The relations on the day pair that make the P2 reframe mandatory. */
const REFRAME_RELATIONS = new Set(['冲', '害', '刑']);

/**
 * Relation -> its glossary cell. The floor picks text by relation.
 *
 * EXPORTED 2026-09-14 for `lib/pdf/pairDocument.js`, which builds the facts table
 * and has to name a PALACE-FRAME relation (Reyner ruling 1 of that date). A second
 * copy of this table in the PDF layer is the exact shape this repo keeps paying for
 * - a mapping that drifts from the engine and disagrees only on the rows nobody
 * checks. Read it, never retype it.
 */
export const P2_BY_RELATION = {
  '六合': 'p2_harmony',
  '冲': 'p2_clash',
  '害': 'p2_harm',
  '刑': 'p2_punishment',
};

/**
 * Five-element cycle -> its glossary cell. `p1_produces` and `p1_controls` are
 * DIRECTION-NEUTRAL by ruling, so both directions of each map to one cell and the
 * renderer names who from provenance.
 */
const P1_BY_CYCLE = {
  same: 'p1_same',
  a_produces_b: 'p1_produces',
  b_produces_a: 'p1_produces',
  a_controls_b: 'p1_controls',
  b_controls_a: 'p1_controls',
};

/**
 * The glossary cells a built fact was keyed by. **DERIVED FROM PROVENANCE, and
 * the spec asserts it agrees with the cell `buildPairSemantic` actually used.**
 *
 * ── WHY THIS EXISTS AND WHY IT IS NOT A SECOND TABLE ───────
 * Stage 6 scopes `style.tension_collapse` by what a block is ABOUT (ruled
 * 2026-09-08), and "what it is about" is the variant key - `p3_supplies` is a
 * complementarity statement, `p2_clash` is a tension. The gate has the block's
 * `fact_ids` and needs the keys.
 *
 * It could have been a field on the fact. It is NOT, deliberately: the semantic
 * JSON is what the renderer is sent, so adding a key changes the model's input
 * and would have confounded the very floor-rate move this scoping is measured
 * by. A derivation changes nothing that ships to the model.
 *
 * The risk a derivation carries is drift from the construction above - the shape
 * CLAUDE.md's own "a test holding its own copy of a ruled value IS the cause"
 * warns about. `tests/pair-semantic.spec.mjs` closes it by asserting, for every
 * fact of every fixture pair, that one of these keys names the glossary object
 * the fact actually carries.
 *
 * @param {Object} fact one entry of `semanticJson.facts`
 * @returns {string[]} zero or more `GLOSSARY.kompatibilitas` keys
 */
export function variantKeysFor(fact) {
  const p = fact?.provenance || {};
  switch (fact?.id) {
    case 'p0_opening': return ['p0_opening'];
    case 'p2_day_pair': return p.variant ? [p.variant] : [];
    case 'p2_reframe': return ['p2_reframe'];
    // The frame plus every relation found. A palace carrying 害 is a tension
    // block even though the frame itself is neutral.
    case 'p2_palace_frame': return ['p2_palace_frame', ...(p.variants || [])];
    case 'p3_supply': return [(p.supplies || []).length > 0 ? 'p3_supplies' : 'p3_no_supply'];
    case 'p3_same_imbalance': return ['p3_same_imbalance'];
    case 'p1_stem_relation': return p.variant ? [p.variant] : [];
    case 'p4_temperament': return p.pattern ? [`p4_${p.pattern}`] : [];
    case 'p5_pull_fit': return p.quadrant ? [`p5_${p.quadrant}`] : [];
    default: return [];
  }
}

/** One person's identity block. Field names copied from the mirror's `core`. */
function coreFor(chart) {
  const dm = chart.day.stem;
  const profile = mainProfile(chart, { silent: true });
  return {
    day_master: dm,
    element: elementId(chart.day.element),
    archetype_key: GLOSSARY.arketipe[dm]?.name_id
      ? GLOSSARY.arketipe[dm].name_id.toLowerCase().replace(/\s+/gu, '_')
      : null,
    archetype_name_id: GLOSSARY.arketipe[dm]?.name_id ?? null,
    archetype_name_en: GLOSSARY.arketipe[dm]?.name_en ?? null,
    main_profile: profile.hanzi,
    main_profile_display: GLOSSARY.aspek[profile.hanzi].name_id,
    main_profile_bracket: GLOSSARY.aspek[profile.hanzi].name_en,
    hour_known: chart.hasHourPillar,
  };
}

/**
 * Roles per the prompt's table. `spine` facts are always required; `high` and
 * `normal` map to importances either side of CONTRACT_PARAMS.coverageFloor (65),
 * so `requiredPoints` includes the high ones and leaves the normal one optional.
 *
 * THESE ARE ASSIGNED, NOT SCORED. The mirror ranks its facts with `scoreFacts`
 * over axes fitted to a single chart - rarity against a population, palace
 * weight, verdict interaction. None of those axes is defined for a pair, and
 * inventing a scoring model to produce a ranking nobody has validated would be
 * exactly the improvisation rule 4 forbids in its own domain. The journey order
 * is the compat spec's (P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P7) and it is a
 * RULED order, so the facts carry it directly.
 */
const ROLE_IMPORTANCE = { spine: 100, high: 80, normal: 50 };

const pairFact = ({ id, role, type, provenance, entry, extra = {} }) => ({
  ...fact({ id, type, provenance, entry, extra }),
  hierarchy: { role },
  importance: ROLE_IMPORTANCE[role],
});

/**
 * Build the semantic JSON for a pair.
 *
 * @param {Object} chartA output of calculateBaziChart for person A
 * @param {Object} chartB the same for person B
 * @param {Object} [options]
 * @param {string} [options.engineVersion]
 * @returns {Object} the renderer's only input, same contract as the mirror's
 */
export function buildPairSemantic(chartA, chartB, options = {}) {
  const { voice = voiceVersion(), ...rest } = options;
  return markVoice(buildPairSemanticV1(chartA, chartB, rest), voice);
}

function buildPairSemanticV1(chartA, chartB, { engineVersion = ENGINE_VERSION } = {}) {
  const branches = compatBranchRelations(chartA, chartB);
  const complementarity = compatComplementarity(chartA, chartB);
  const stems = compatStemRelation(chartA, chartB);
  const temperament = compatTemperament(chartA, chartB);
  const pullFit = compatPullFit(branches, complementarity, stems);

  const a = coreFor(chartA);
  const b = coreFor(chartB);
  const K = GLOSSARY.kompatibilitas;

  /**
   * A cell, or a loud failure. `fact()` treats a missing entry as a
   * `glossary_gap`, which is right for the mirror - where a gap is content
   * Reyner has yet to write - and wrong here, where every variant is ruled and a
   * miss means the mapping named a key that does not exist. That would surface
   * as a silently empty floor block rather than as an error.
   */
  const cell = (key) => {
    const entry = K[key];
    if (!entry) throw new Error(`no kompatibilitas cell "${key}"`);
    return entry;
  };

  const facts = [];

  // ── P0. THE OPENING, AND IT NAMES BOTH PEOPLE. ──
  // ── THIS FACT DID NOT EXIST UNTIL 2026-09-08, AND THE REASON IS THE RECORD ──
  // The first shape of this file had a `p0_names` fact with `entry: null`, because
  // the 24-cell rulings file had no opening cell. A fact with no cell has
  // `label: null`, which the glossary reserves for CONDITIONS, and `blockFor` then
  // wrote "Kamu adalah Matahari (The Sun)." into the floor - a name-with-bracket on
  // a condition, which `fact.condition_named` HARD rejects. It was the one finding
  // standing between the applied rulings and a servable floor, so the fact was
  // DROPPED rather than papered over with an invented connective (rule 20).
  //
  // The consequence was recorded as an open gap in three places: the floor named
  // NEITHER person, and `both_named` had to be exempt on `module_assembly` or every
  // pair would 503 the moment the provider failed.
  //
  // **REYNER RULED THE CELL AND THE GAP CLOSES.** `p0_opening` is a TEMPLATE - the
  // sentence is his, the two names are the engine's - so the floor now opens by
  // naming both people, and the exemption goes with it.
  facts.push(pairFact({
    id: 'p0_opening',
    role: 'spine',
    type: 'core',
    provenance: { kind: 'compat_opening', a: a.archetype_name_id, b: b.archetype_name_id },
    // FILLED HERE, once, at fact-build time. Everything downstream - the floor,
    // the prompt payload, Stage 6, the cache key - sees the finished sentence and
    // never the braces.
    entry: {
      ...cell('p0_opening'),
      label_meaning: fillPairTemplate(
        cell('p0_opening').label_meaning, a.archetype_name_id, b.archetype_name_id,
      ),
    },
  }));

  // ── P2. The day pair - the seat the spec reads as the spouse palace. ──
  // THE VARIANT IS THE RELATION. A clashed seat and a harmonised seat are the
  // same fact and two different things to say, which is the whole reason this
  // section is keyed by variant.
  //
  // ORDER MATTERS when a pair carries more than one: 刑 then 害 then 冲 then 六合,
  // most severe first, so the cell named is the one the reframe is about. A pair
  // can carry a self-punishment and a harmony at once.
  const dayRelations = branches.dayBranchPair.map((e) => e.relation);
  const dayVariant = ['刑', '害', '冲', '六合']
    .map((r) => (dayRelations.includes(r) ? P2_BY_RELATION[r] : null))
    .find(Boolean) ?? 'p2_none';

  facts.push(pairFact({
    id: 'p2_day_pair',
    role: 'spine',
    type: dayRelations.some((r) => REFRAME_RELATIONS.has(r)) ? 'tension' : 'core',
    provenance: {
      kind: 'compat_day_pair',
      variant: dayVariant,
      relations: branches.dayBranchPair,
      a_branch: chartA.day.branch,
      b_branch: chartB.day.branch,
    },
    entry: cell(dayVariant),
  }));

  // ── P2. THE REFRAME, as its own required fact when the seat is difficult. ──
  // A `safety_flag` tells the renderer a reframe is needed; it does not put the
  // ruled words anywhere the floor can reach. As a FACT it becomes a required
  // point with its own block, so the floor carries the reframe too - and the
  // spec's ethical spine is not something only the LLM path honours.
  if (dayVariant !== 'p2_harmony' && dayVariant !== 'p2_none') {
    facts.push(pairFact({
      id: 'p2_reframe',
      role: 'spine',
      type: 'core',
      provenance: { kind: 'compat_reframe', for_variant: dayVariant },
      entry: cell('p2_reframe'),
    }));
  }

  // ── P2. The palace scans. ──
  // ONE FRAME FOR BOTH DIRECTIONS, plus the relation's own cell. The rulings
  // file's `p2_palace_frame` is a frame: "the renderer names the pillar and
  // reuses p2_* names for the relation". So a palace hit needs no cell of its
  // own, and the relations it found ride in provenance for the renderer to name.
  const palace = [...branches.bHitsASpousePalace, ...branches.aHitsBSpousePalace];
  if (palace.length > 0) {
    facts.push(pairFact({
      id: 'p2_palace_frame',
      role: 'high',
      type: 'core',
      provenance: {
        kind: 'compat_palace_scan',
        b_hits_a: branches.bHitsASpousePalace,
        a_hits_b: branches.aHitsBSpousePalace,
        // The variant cell for each relation present, so the renderer and the
        // floor both have a name for what they are describing.
        variants: [...new Set(palace.map((e) => P2_BY_RELATION[e.relation]).filter(Boolean))],
      },
      entry: cell('p2_palace_frame'),
    }));
  }

  // ── P3. Complementarity. ──
  // ONE CELL FOR BOTH DIRECTIONS: `p3_supplies` is direction-neutral per the
  // rulings file, and the renderer names who supplies whom from provenance. Two
  // cells would have been two ways to say the same thing.
  const supplies = [
    complementarity.aSupplies && { from: 'a', to: 'b', ...complementarity.aSupplies },
    complementarity.bSupplies && { from: 'b', to: 'a', ...complementarity.bSupplies },
  ].filter(Boolean);

  facts.push(pairFact({
    id: 'p3_supply',
    role: 'high',
    type: 'core',
    provenance: { kind: 'compat_supply', supplies },
    // `p3_no_supply` is ruled precisely so the floor is never silent on P3. It is
    // unreachable from the 13-chart fixture - base-rates run 1 measured the old
    // 2.2.a holding on 100.0% of 5000 pairs - and it exists for the pair that
    // eventually does.
    entry: cell(supplies.length > 0 ? 'p3_supplies' : 'p3_no_supply'),
  }));

  if (complementarity.sameImbalance.length > 0) {
    facts.push(pairFact({
      id: 'p3_same_imbalance',
      role: 'high',
      type: 'extremity',
      provenance: { kind: 'compat_same_imbalance', elements: complementarity.sameImbalance },
      entry: cell('p3_same_imbalance'),
    }));
  }

  // ── P1. The two Day Masters on the five-element cycle. ──
  facts.push(pairFact({
    id: 'p1_stem_relation',
    role: 'normal',
    type: 'core',
    provenance: {
      kind: 'compat_stem_relation',
      // `p1_produces` and `p1_controls` are direction-neutral cells; the
      // direction stays here so the renderer can name who does which.
      variant: stems.combination ? 'p1_combination' : P1_BY_CYCLE[stems.cycle],
      cycle: stems.cycle,
      a: stems.a,
      b: stems.b,
      // Present only when the two stems ARE a 天干五合 pair. `transformTarget` is
      // metadata and nothing applies it - ruling B, 2026-09-07.
      ...(stems.combination ? { combination: stems.combination } : {}),
    },
    entry: cell(stems.combination ? 'p1_combination' : P1_BY_CYCLE[stems.cycle]),
  }));

  // ── P4. The temperament badge. ──
  facts.push(pairFact({
    id: 'p4_temperament',
    role: 'high',
    type: 'core',
    provenance: {
      kind: 'compat_temperament',
      pattern: temperament.pattern,
      relation: temperament.relation,
      a: temperament.a,
      b: temperament.b,
      // The badge NAME is the glossary's, never the model's.
      // The badge IS the cell's name_id now - `pattern.*` folded into `p4_*`.
      pattern_name_id: K[`p4_${temperament.pattern}`]?.name_id ?? null,
    },
    entry: cell(`p4_${temperament.pattern}`),
  }));

  // ── P5. The quadrant. ──
  facts.push(pairFact({
    id: 'p5_pull_fit',
    role: 'spine',
    type: 'core',
    provenance: {
      kind: 'compat_pull_fit',
      quadrant: pullFit.quadrant,
      pull: pullFit.pull,
      fit: pullFit.fit,
      // 2.5: the renderer explains the quadrant FROM the clauses that fired and
      // never from its own inference.
      pull_reasons: pullFit.pull_reasons,
      fit_reasons: pullFit.fit_reasons,
      // The label IS the cell's name_id now - `quadrant.*` folded into `p5_q*`.
      quadrant_name_id: K[`p5_${pullFit.quadrant}`]?.name_id ?? null,
    },
    entry: cell(`p5_${pullFit.quadrant}`),
  }));

  const reframeRequired = dayRelations.some((r) => REFRAME_RELATIONS.has(r));

  return {
    kind: 'pair',
    engine_version: engineVersion,
    target_language: 'id',

    core: {
      a,
      b,
      pattern: temperament.pattern,
      quadrant: pullFit.quadrant,
    },

    facts,
    required_points: requiredPoints(facts, { coverageFloor: ROLE_IMPORTANCE.high }),

    safety_flags: reframeRequired
      ? [...PAIR_SAFETY_FLAGS, 'p2_reframe_required']
      : [...PAIR_SAFETY_FLAGS],

    qa: { facts_emitted: facts.length, facts_collapsed: [] },
  };
}
