// ============================================================
// The mirror serve shape
// ============================================================
// Turns a chart + its semantic JSON + a rendered reading into the JSON the
// mirror GET returns. Pure: no env, no network, no Supabase, so the whole serve
// contract is testable without a route.
//
// ── WHY THE BLOCKS ARE SPLIT HERE AND NOT IN THE CLIENT ────
// lib/render/paragraphs.js: a block's `text` carries exactly two newlines as a
// paragraph separator, and HTML collapses whitespace, so a client that drops the
// raw text into one element loses every break SILENTLY — the reading still reads,
// it just reads as a wall. Prompt J task 1 makes it the route's job: the client
// receives `paragraphs[]` and never sees a `\n`.
//
// ── HANZI: RULE 23'S KEEP SIDE ─────────────────────────────
// The eight characters ARE the chart and they stay, because they are what lets a
// user cross-check Katon against any other calculator. They are never bare: each
// cell carries its Indonesian animal and element beside it. Hanzi you can point
// at is fine; hanzi you must read is not, which is why nothing here puts a
// character in a heading, a label or a sentence.
//
// Element names come from lib/semantic/glossary.js#elementId — the ONE path from
// an engine element to display copy. Deliberately not lib/readingView.js's local
// ELEMENT_ID map, which renders Earth as "Bumi" where the glossary says "Tanah"
// (flagged in glossary.js's header as exactly the drift to avoid).
//
// 胎元 is NOT here. It is on the chart and the legacy sheet shows it, but its
// only Indonesian label ("Istana Konsepsi") is hand-authored in
// lib/readingView.js and exists in no glossary entry. Copying an unreviewed
// string into a new surface is a register decision, and register is Reyner's
// (rule 20). Reported, not decided.
// ============================================================

import { splitParagraphs } from '../render/paragraphs.js';
import { elementId } from '../semantic/glossary.js';

const POSITIONS = ['year', 'month', 'day', 'hour'];

/**
 * The chart display data: the legitimacy object, cross-checkable, no prose.
 *
 * @param {Object} chart calculateBaziChart output
 * @param {Object} semanticJson buildSemanticJson output for the SAME chart
 */
export function mirrorChartView(chart, semanticJson) {
  const sc = semanticJson.chart;

  const pillars = POSITIONS
    .filter((position) => chart[position])
    .map((position) => ({
      position,
      // Indonesian palace name, from GLOSSARY.pilar via Stage 3.
      palace: sc.palaces[position],
      // The cross-checkable object. Stem and branch are also given apart so a
      // client can lay out a two-row cell without re-slicing a string.
      hanzi: sc[position],
      stem: chart[position].stem,
      branch: chart[position].branch,
      // The pairing that keeps the hanzi readable (rule 23).
      animal: sc.animals[position],
      element: elementId(chart[position].element),
      ...(position === 'day' ? { is_day_master: true } : {}),
    }));

  return {
    archetype: {
      key: semanticJson.core.archetype_key,
      name_id: semanticJson.core.archetype_name_id,
      name_en: semanticJson.core.archetype_name_en,
    },
    day_master: {
      stem: semanticJson.core.day_master,
      element: semanticJson.core.element,
    },
    pillars,
    // The hour pillar is ABSENT rather than blank when the hour is unknown, and
    // the flag says so explicitly. A UI that renders four cells from a
    // three-cell array would otherwise have to infer the difference between "no
    // hour given" and "hour pillar failed to compute".
    hour_known: semanticJson.hour_known === true,
    element_presence: sc.element_presence,
    element_presence_note: sc.element_presence_note,
    missing_element: sc.missing_element,
  };
}

/**
 * The two independent reasons a reading should be read softly.
 *
 * ── A CORRECTION TO PROMPT J TASK 2 ────────────────────────
 * The prompt says "Stage 3 carries `confidence` / `confidence_reasons` for
 * solar-term-edge and 子-hour charts". It does not. Those are two different
 * signals from two different files, measuring two different risks:
 *
 *   boundary_flag         lib/bazi/pillars.ts. `solarTerm.flagged ||
 *                         hourEdge.flagged` - the birth instant sits within two
 *                         minutes of a 節 or a 時辰 change, or the hour is
 *                         unknown on a 節 day. The CHART ITSELF may be the wrong
 *                         one. This is the solar-term-edge case the prompt names.
 *   strength.confidence   lib/bazi/strength.ts. supportShare within 5 points of
 *                         a verdict threshold, an unrooted Day Master, or a root
 *                         pulled by a 半合. The chart is certain; the VERDICT
 *                         read off it is marginal.
 *
 * Collapsing them would have produced a `boundary` flag that fires on the wrong
 * charts for the wrong reason, and pillars.ts already warns that its own
 * either-or "cannot tell the two risks apart". The single flag the prompt asked
 * for is the union, since both mean "read softly"; the sources travel beside it
 * so a later copy pass can say something different about each.
 *
 * `confidence_reasons` is NOT exposed and must not be. It is engine diagnostics
 * in English with hanzi ("root 巳 pulled toward Metal by 半合"), marked
 * internal_only in the semantic JSON for exactly that reason.
 */
function boundarySignal(semanticJson) {
  return {
    chart_edge: semanticJson.boundary_flag === true,
    strength_confidence: semanticJson.strength?.confidence === 'low',
  };
}

/**
 * The full GET payload.
 *
 * @param {Object} args
 * @param {string} args.token the reading's bearer token
 * @param {Object} args.chart calculateBaziChart output
 * @param {Object} args.semanticJson buildSemanticJson output
 * @param {Object} args.rendered renderReading output (or a cache row shaped like it)
 */
export function mirrorServeView({ token, chart, semanticJson, rendered }) {
  const boundary = boundarySignal(semanticJson);

  return {
    token,
    // Prompt J task 2. The UI reads softly when this is true; the copy for that
    // state is a later Reyner pass and J only exposes the flag.
    boundary: boundary.chart_edge || boundary.strength_confidence,
    boundary_sources: boundary,
    blocks: (rendered.blocks || []).map((block) => ({
      heading: block.heading || '',
      fact_ids: block.fact_ids || [],
      paragraphs: splitParagraphs(block.text),
    })),
    penutup: rendered.penutup || '',
    chart: mirrorChartView(chart, semanticJson),
    // Attribution, not content. Which gate passed this text and which model
    // wrote it is the first question any QA pass asks, and pipeline-spec Stage 7
    // stores both on the cache row precisely so a thumbs-down is a complaint
    // about a KNOWN system rather than an unknown one.
    meta: {
      engine_version: semanticJson.engine_version,
      cached: rendered.cached === true,
      source: rendered.source,
      model: rendered.model ?? null,
      prompt_version: rendered.prompt_version ?? null,
      stage6_version: rendered.stage6_version ?? null,
      // True when a CACHED reading was re-gated at serve time, failed a hard
      // check, and was replaced by the floor. It is not the same event as an
      // ordinary floor render (a provider outage), and a QA surface that could
      // not tell them apart would read a gate tightening as an outage.
      hard_fail_fallback: rendered.hard_fail_fallback === true,
    },
  };
}
