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
export const ENGINE_VERSION = '0.4.4-stage3';

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

/**
 * The `Sebaran Unsur` caveat. RULED by Reyner 2026-08-31, verbatim.
 *
 * ── ONE CONSTANT BECAUSE TWO LITERALS ALREADY DIVERGED ──
 * This caveat renders under the same heading on TWO surfaces - the free reading
 * page (`components/Funnel.jsx`, via `element_presence_note`) and the Rp 19.000
 * PDF (`lib/pdf/document.js`). They were two hand-typed strings, and they drifted
 * into two different WRONG strings pointing in opposite directions: the page
 * shipped ENGLISH to an Indonesian audience, and the PDF shipped `skor`, which
 * `style.arithmetic.2` bans. The PDF had been translated; the page never was.
 *
 * A test can pin two literals equal. A shared constant makes them unable to
 * differ, and the instruction was that they must not diverge AGAIN.
 *
 * Ruling and its falsified sweep: `docs/content/presence-note-ruling.md`.
 */
export const ELEMENT_PRESENCE_NOTE = 'Sebaran visual, bukan ukuran kekuatan.';

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
 * READING ORDER — the reader meets herself before she meets a finding.
 *
 * Phase 2 ranks by importance and that ranking is correct: it decides what a
 * reading is ABOUT. It is the wrong thing to OPEN with. Ranked purely by
 * importance the Day Master lands wherever its axes put it — 9th of 14 on
 * 1996-10-02 19:20 — so the reading opened on its most dramatic finding and
 * revealed who the reader is one block before the penutup. Reyner read the four
 * production QA readings as the buyer and ruled it not ship-quality (PROGRESS,
 * "MIRROR QA VERDICT 2026-08-10", finding 1).
 *
 * So the identity spine is lifted to the front and everything after it keeps the
 * importance descent untouched. Rule 14: the ORDER is the engine's decision. The
 * renderer is told to write the spine first and is not asked to identify it.
 *
 * ── WHY THIS IS NOT "SORT SPINE FIRST" ─────────────────────
 * `hierarchy.role === 'spine'` is four facts, and `spouse_palace` is one of
 * them. The Fondasi Pasangan is a PLACE in the chart, not the reader's identity,
 * and hoisting it would put the closest-relationship finding in the opening
 * breath. Role alone cannot separate them.
 *
 * The separation already exists in this file: `core` and `strength` below are
 * the two blocks that state who this person is, and between them they name
 * exactly three things — the day stem, the strength verdict, and the main
 * profile. THAT is the identity set, and these matchers read it off those blocks
 * rather than hard-coding fact ids, so a fact id that changes cannot silently
 * drop a limb of the spine out of the opening. `spouse_palace` appears in
 * neither block and stays in the findings descent, which is the whole point.
 *
 * The third matcher resolves to `main_profile`, or to the CR-1 fact when one
 * fired — CR-1 supersedes the main profile and inherits its standing, and both
 * carry the same Aspek as `core.main_profile`, one on the fact and one on its
 * provenance. `spouse_palace` carries its Aspek as `seat_god`, so it cannot
 * match here by accident.
 */
const IDENTITY_MATCHERS = [
  (fact, core) => fact.provenance.kind === 'day_stem' && fact.provenance.stem === core.day_master,
  (fact, core, verdict) => fact.provenance.kind === 'strength' && fact.provenance.verdict === verdict,
  (fact, core) => (fact.god ?? fact.provenance.god) === core.main_profile,
];

/**
 * Move the identity spine to the front, in spine order, and leave the rest alone.
 *
 * Runs AFTER collapseSuperseded, so the profile limb is whichever of the pair
 * survived the collapse. Ties and the tail keep Phase 2's order exactly, so the
 * result is still deterministic and the cache key still stable.
 *
 * @returns {Object[]} a new array; the input is not mutated
 */
function identityFirst(facts, core, verdict) {
  const identity = [];
  for (const matches of IDENTITY_MATCHERS) {
    const found = facts.find((fact) => fact.hierarchy.role === 'spine'
      && !identity.includes(fact)
      && matches(fact, core, verdict));
    if (found) identity.push(found);
  }
  return [...identity, ...facts.filter((fact) => !identity.includes(fact))];
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
        // FIRST because it is the OPENING obligation, not merely one more field.
        // Only the day-master fact carries `archetype`, so only that point gains it.
        // Reyner's ruling 2026-08-19; lib/validate/opening.js is what checks it.
        f.archetype?.name_id ? 'archetype' : null,
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

  // Built before facts[] because the reading order is READ OFF it — see
  // IDENTITY_MATCHERS. Emitted below unchanged and in its original position.
  const core = {
    day_master: chart.day.stem,
    element: elementId(chart.day.element),
    archetype_key: archetypeKey(GLOSSARY.arketipe[chart.day.stem]?.name_id),
    archetype_name_id: GLOSSARY.arketipe[chart.day.stem]?.name_id ?? null,
    archetype_name_en: GLOSSARY.arketipe[chart.day.stem]?.name_en ?? null,
    main_profile: profile.hanzi,
    main_profile_display: GLOSSARY.aspek[profile.hanzi].name_id,
    main_profile_bracket: GLOSSARY.aspek[profile.hanzi].name_en,
  };

  const ordered = identityFirst(kept, core, strength.verdict);

  return {
    engine_version: engineVersion,
    target_language: 'id',
    hour_known: chart.hasHourPillar,
    quiet_chart,
    // A 節 or 時辰 edge. At +-2 minutes no method is authoritative, so the
    // renderer reads softly and QA gets a flag.
    boundary_flag: chart.boundaryFlag,

    core,

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
      //
      // ── READER-FACING, SO IT IS INDONESIAN. RULED 2026-08-31 ──
      // `components/Funnel.jsx` renders this verbatim under the `Sebaran Unsur`
      // heading on the FREE READING PAGE. It shipped in English until today, which
      // is a rule-20 violation on the acquisition surface, and no instrument could
      // see it: every blocklist pattern is an Indonesian token, so an English
      // string sweeps clean. `tests/engine-copy-language.spec.mjs` is the eye that
      // was missing.
      //
      // THE SAME STRING IS IN `lib/pdf/document.js`. They must not diverge again -
      // one caveat, one heading, two surfaces, and they said different things for
      // months. That spec pins them equal.
      // Ruling: `docs/content/presence-note-ruling.md`.
      element_presence_note: ELEMENT_PRESENCE_NOTE,
      // The target file's shape, so it carries only the first. The AUTHORITATIVE
      // list is facts[], which holds one element_missing_X per absent element —
      // no fixture chart has two, but nothing prevents it.
      missing_element: Object.keys(presenceId).find((k) => presenceId[k] === 0) ?? null,
    },

    facts: ordered,
    // Follows facts[], so the checklist opens on the identity spine too. The
    // floor assembles blocks straight off this array (lib/render/fallback.js),
    // which is why the module-assembly floor obeys the new order for free.
    required_points: requiredPoints(ordered, contractParams),
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
 *
 * ── EVERY FIELD IN THE PAYLOAD IS PART OF THE CACHE IDENTITY, INCLUDING FIELDS
 *    THE RENDERER NEVER READS ──
 *
 * `element_presence_note` is one. It is a reader-facing caveat, and
 * `grep -rn element_presence_note lib/render/ lib/validate/` returns nothing.
 *
 * Editing such a string moves the key for EVERY chart - measured on `b774a70`,
 * `8c8a58f4...` -> `08cc9201...` - and `lib/mirror/handlers.js:276` re-points each
 * row on its next GET. **A RETURNING READER THEREFORE TRIGGERS A FULL GEMINI
 * RE-RENDER WHOSE OUTPUT CANNOT DIFFER FROM WHAT THEY ALREADY READ.**
 *
 * It is lazy and per-visit, not bulk: no migration job, no bill event. That is why
 * it was ACCEPTED on 2026-08-31, at pre-launch traffic, when the ruled Indonesian
 * caveat replaced an English one.
 *
 * **THE ACCEPTANCE IS A FACT ABOUT TRAFFIC, NOT ABOUT THE DESIGN, AND IT EXPIRES
 * WHEN ACQUISITION STARTS** - one provider, no balance alert, and the failure is
 * silent: the re-render succeeds and the prose is identical, so nothing reports
 * that money was spent to produce the same text.
 *
 * MOVING renderer-invisible caveats out of this function's input is a contract
 * change against a guarded test (`tests/stage3-contract.spec.mjs`) and is
 * deliberately UNSTARTED until traffic exists and it can be priced.
 */
export function cacheKey(semanticJson) {
  const canonical = JSON.stringify(canonicalize(semanticJson));
  return createHash('sha256')
    .update(`${semanticJson.engine_version}\n${canonical}`)
    .digest('hex');
}
