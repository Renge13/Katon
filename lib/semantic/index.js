// ============================================================
// Stage 3, PHASE 3 — the semantic JSON contract
// ============================================================
// Assembles the object the renderer receives, and nothing else. Stage 5 and
// Stage 6 are separate prompts; this stage emits JSON and stops.
//
// Shape is docs/content/provecell-01-USER.json, which is the only shape that has
// been validated against a real renderer.
//
// ── THE CACHE KEY IS WHY DETERMINISM IS A CORRECTNESS BUG ──
// Stage 4 keys on hash(semantic JSON + engine version). Two runs of the same
// chart that differ by one reordered key, or by one float that rounds
// differently, miss the cache and pay for a second LLM call that produces a
// second, different reading of the same birthdate. The whole
// deterministic-after-first-generation guarantee rests on byte-identity, so it
// is asserted rather than assumed.
//
// The emitted JSON keeps its natural, readable key order. The HASH is computed
// over a key-sorted canonical form, so a future refactor that reorders a field
// cannot silently invalidate every cached reading in the table.
// ============================================================

import { createHash } from 'node:crypto';

import { computeStrength } from '../bazi/strength.ts';
import { mainProfile } from '../bazi/mainProfile.js';
import { buildFactInventory, elementPresence } from './facts.js';
import { scoreFacts, HIERARCHY_PARAMS } from './hierarchy.js';
import { GLOSSARY, elementId, palaceName } from './glossary.js';

/**
 * Bumping this invalidates every cached reading on next access. Bump it when the
 * MEANING of the JSON changes — a new fact type, a scoring change, a contract
 * change — and not for a comment or a rename.
 */
export const ENGINE_VERSION = '0.4.2-stage3';

export const CONTRACT_PARAMS = {
  /**
   * A fact at or above this importance must be covered by the reading. Spine
   * facts are added regardless, so this only governs findings.
   *
   * UNFITTED, like everything in HIERARCHY_PARAMS. It yields 9 required points
   * on chart 1 against the hand-written file's 8.
   */
  coverageFloor: 65,
};

/**
 * Ethics constants, per CLAUDE.md rule 25. Deliberately NOT a place to put chart
 * conditions — confidence and boundary_flag are carried where they belong, and
 * mixing "never do this" with "this chart is marginal" would blur both.
 */
export const SAFETY_FLAGS = ['no_fatalism', 'no_medical', 'no_financial', 'no_god_ranking'];

/** `Api Unggun` -> `api_unggun`. Stable slug for the archetype's assets. */
function archetypeKey(nameId) {
  return nameId ? nameId.toLowerCase().replace(/\s+/g, '_') : null;
}

/**
 * Drop facts that another fact has absorbed.
 *
 * Two collapses, both of the same kind: the inventory correctly emits a part and
 * the whole, and sending both to the renderer produces the same paragraph twice.
 *
 *   1. `main_profile` when CR-1 fired. Phase 1 already marks it — same glossary
 *      entry, same four strings, the CR-1 fact only reframes them.
 *   2. `badge_空亡` when EVERY position it hits is already inside a void stack.
 *      A void that also carries the profile source and two badges is one finding,
 *      not two. It survives when it hits a position no stack covers.
 *
 * The hand-written target resolves both the same way.
 */
function collapseSuperseded(facts) {
  const stackedPositions = new Set(
    facts.filter((f) => f.provenance.kind === 'void_stack').map((f) => f.provenance.position),
  );

  const dropped = [];
  const kept = facts.filter((fact) => {
    if (fact.superseded_by) {
      dropped.push({ id: fact.id, absorbed_by: fact.superseded_by });
      return false;
    }
    if (fact.provenance.kind === 'badge_anchor' && fact.provenance.badge === '空亡'
        && fact.provenance.hits.every((h) => stackedPositions.has(h.position))) {
      dropped.push({ id: fact.id, absorbed_by: 'void_stack' });
      return false;
    }
    return true;
  });

  return { kept, dropped };
}

/**
 * The coverage checklist.
 *
 * STRUCTURED, not prose, and for the same reason provenance is: the target
 * file's required points are Indonesian sentences that exist in no glossary
 * entry, so writing them means Stage 3 authoring user-facing copy. A checklist
 * of fact ids is also the only form Stage 6 can validate MECHANICALLY — it can
 * check that a reading covered fact X, and it cannot check that a reading
 * covered a sentence.
 *
 * D2's rule holds either way: every required point has a backing fact. A point
 * without one forces the renderer to author, which is exactly the failure that
 * produced an entirely invented `inti_diri` in run 1.
 *
 * NOT included: "penutup berupa verdict yang percaya diri". That is a style
 * instruction with no backing fact, and it already lives in renderer-prompt.txt
 * where it belongs.
 */
function requiredPoints(facts, params) {
  return facts
    .filter((f) => f.hierarchy.role === 'spine' || f.importance >= params.coverageFloor)
    .map((f) => ({
      fact_id: f.id,
      importance: f.importance,
      // Which of the fact's own strings must survive into the prose. Derived
      // from what the fact actually carries, so a required point can never ask
      // for content that is not there.
      must_cover: [
        f.label_meaning ? 'label_meaning' : null,
        f.gift ? 'gift' : null,
        f.cost ? 'cost' : null,
        f.actionable ? 'actionable' : null,
        f.palace ? 'palace' : null,
      ].filter(Boolean),
    }));
}

/**
 * Build the semantic JSON for a chart.
 *
 * @param {Object} chart output of calculateBaziChart
 * @param {Object} [options]
 * @returns {Object} the renderer's only input
 */
export function buildSemanticJson(chart, {
  hierarchyParams = HIERARCHY_PARAMS,
  contractParams = CONTRACT_PARAMS,
  engineVersion = ENGINE_VERSION,
} = {}) {
  const strength = computeStrength(chart);
  const profile = mainProfile(chart, { silent: true });
  const inventory = buildFactInventory(chart, strength);
  const { facts: ranked, quiet_chart } = scoreFacts(inventory, hierarchyParams);
  const { kept, dropped } = collapseSuperseded(ranked);

  const presence = elementPresence(chart);
  const presenceId = {};
  for (const [element, pct] of Object.entries(presence)) presenceId[elementId(element)] = pct;

  const pillar = (p) => (p ? `${p.stem}${p.branch}` : null);
  const animal = (p) => (p ? GLOSSARY.shio[p.branch].name_id : null);

  return {
    engine_version: engineVersion,
    target_language: 'id',
    hour_known: chart.hasHourPillar,
    quiet_chart,
    // A 節 or 時辰 edge. At +-2 minutes no method is authoritative, so the
    // renderer reads softly and QA gets a flag.
    boundary_flag: chart.boundaryFlag,

    core: {
      day_master: chart.day.stem,
      element: elementId(chart.day.element),
      archetype_key: archetypeKey(GLOSSARY.arketipe[chart.day.stem]?.name_id),
      archetype_name_id: GLOSSARY.arketipe[chart.day.stem]?.name_id ?? null,
      archetype_name_en: GLOSSARY.arketipe[chart.day.stem]?.name_en ?? null,
      main_profile: profile.hanzi,
      main_profile_display: GLOSSARY.aspek[profile.hanzi].name_id,
      main_profile_bracket: GLOSSARY.aspek[profile.hanzi].name_en,
    },

    // Verbatim from computeStrength. `lean` and `provisional` do not exist —
    // there are three verdicts, and softening is the renderer's job, which it
    // learns from `confidence` (D2a §4).
    //
    // confidence_reasons is INTERNAL_ONLY as of 2026-08-02. It is engine
    // diagnostics in English with hanzi ("root 巳 pulled toward Metal by 半合")
    // and the renderer is banned from writing either, so softening is learned
    // from the confidence LEVEL and never from these strings. It stays in the
    // payload because QA and the cache key want it; lib/render/payload.js strips
    // every internal_only field before the JSON is shown to a provider.
    strength: {
      verdict: strength.verdict,
      confidence: strength.confidence,
      confidence_reasons: strength.confidenceReasons,
      favorable: strength.favorable.map(elementId),
      unfavorable: strength.unfavorable.map(elementId),
      internal_only: ['confidence_reasons'],
    },

    chart: {
      year: pillar(chart.year),
      month: pillar(chart.month),
      day: pillar(chart.day),
      hour: pillar(chart.hour),
      animals: {
        year: animal(chart.year), month: animal(chart.month),
        day: animal(chart.day), hour: animal(chart.hour),
      },
      palaces: {
        year: palaceName('year'), month: palaceName('month'),
        day: palaceName('day'), hour: palaceName('hour'),
      },
      element_presence: presenceId,
      // Kept deliberately (D2a §5) so a future reader cannot mistake this for a
      // strength score. It is max-normalised nowhere and seasonally weighted
      // nowhere; it is a plain share of the eight characters.
      element_presence_note: 'display distribution only, never a strength score',
      // The target file's shape, so it carries only the first. The AUTHORITATIVE
      // list is facts[], which holds one element_missing_X per absent element —
      // no fixture chart has two, but nothing prevents it.
      missing_element: Object.keys(presenceId).find((k) => presenceId[k] === 0) ?? null,
    },

    facts: kept,
    required_points: requiredPoints(kept, contractParams),
    safety_flags: SAFETY_FLAGS,

    // QA surface. Not for the renderer — it records what the collapse removed,
    // so a fact vanishing from a reading is traceable to a decision.
    qa: {
      facts_emitted: inventory.length,
      facts_collapsed: dropped,
    },
  };
}

/**
 * Recursively key-sorted copy. The hash input, never the emitted payload.
 *
 * Arrays keep their order — `facts` is ranked and that ranking is meaning, not
 * formatting.
 */
export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

/**
 * Stage 4's cache key: sha256 over the canonical JSON plus the engine version.
 *
 * The version is hashed IN rather than concatenated onto the key, so bumping it
 * invalidates the whole table in one move.
 */
export function cacheKey(semanticJson) {
  const canonical = JSON.stringify(canonicalize(semanticJson));
  return createHash('sha256')
    .update(`${semanticJson.engine_version}\n${canonical}`)
    .digest('hex');
}
