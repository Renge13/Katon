// ============================================================
// Stage 6 — FACT GUARD (hard reject)
// ============================================================
// The text may not contradict the semantic JSON. Everything checked here is a
// claim about what is TRUE, which makes it the rule-14 boundary in enforcement
// form: the engine decided these, so the renderer disagreeing with one is not a
// style slip and does not get a regeneration on style grounds.
//
// Every check is scoped as narrowly as it can be. `kuat` is an ordinary
// Indonesian adjective and `bulan` is an ordinary noun; a whole-text keyword
// sweep for either would reject correct readings constantly. So verdict and
// position checks run INSIDE the block that cites the relevant fact, where the
// words can only mean what the fact means.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { stemOverlap, sentences } from './text.js';

/**
 * UNFITTED, all of them (rule 13's discipline: one change, one measurement).
 * scripts/measure-stage6.mjs reports the observed distribution per check so
 * these get set from data. Do not tune two at once.
 */
export const FACT_PARAMS = {
  /**
   * Share of a verdict's label_meaning stems that must appear in the block
   * carrying the verdict word. Rule 21's "same breath", made mechanical.
   *
   * Low on purpose. The prompt REQUIRES rewriting in the renderer's own words,
   * so a high bar would reject good paraphrase and reward transcription - which
   * is precisely the run-2 failure. This asks only that the explanation is
   * recognisably present.
   */
  sameBreathOverlap: 0.25,

  /** Distinctive stems the block must share with label_meaning, minimum. */
  sameBreathMinHits: 2,
};

const VERDICT_WORDS = { weak: 'lemah', balanced: 'seimbang', strong: 'kuat' };

/** Indonesian words that name a pillar, and the position each maps to. */
const POSITION_WORDS = {
  tahun: 'year', bulan: 'month', hari: 'day', jam: 'hour',
};

const finding = (check, message, where) => ({
  check, severity: 'hard', message, where,
});

/** Blocks that cite a given fact id. */
function blocksCiting(rendered, factId) {
  return (rendered.blocks || []).filter((b) => (b.fact_ids || []).includes(factId));
}

/**
 * The strength verdict, both directions.
 *
 * (a) CONTRADICTION: the JSON says weak and the text says kuat. Checked inside
 *     the strength block, plus two whole-text patterns that can only be verdict
 *     claims ("Kamu Lemah", "Api Kuat") and would otherwise escape by appearing
 *     in a block that did not cite the fact.
 * (b) SAME BREATH: rule 21 and glossary.kekuatan._note. `label` and
 *     `label_meaning` ship as separate JSON fields, so emitting the label bare
 *     is mechanically possible and nothing upstream can prevent it.
 */
function checkStrength(rendered, semantic, out) {
  const fact = (semantic.facts || []).find((f) => f.provenance?.kind === 'strength');
  if (!fact) return;

  const verdict = fact.provenance.verdict;
  const own = VERDICT_WORDS[verdict];
  const others = Object.entries(VERDICT_WORDS)
    .filter(([k]) => k !== verdict)
    .map(([, word]) => word);

  const element = semantic.core?.element;
  for (const wrong of others) {
    // "Kamu Lemah" / "Api Kuat" - shapes that can only be a verdict claim.
    const asVerdict = new RegExp(`\\b(kamu|${element})\\s+${wrong}\\b`, 'i');
    for (const block of rendered.blocks || []) {
      if (asVerdict.test(block.text)) {
        out.push(finding('fact.strength_contradiction',
          `the chart is "${verdict}" but the text states "${wrong}"`, block.fact_ids));
      }
    }
  }

  const blocks = blocksCiting(rendered, fact.id);
  for (const block of blocks) {
    for (const wrong of others) {
      if (new RegExp(`\\b${wrong}\\b`, 'i').test(block.text)) {
        out.push(finding('fact.strength_contradiction',
          `the strength block names "${wrong}" but the verdict is "${verdict}"`, block.fact_ids));
      }
    }

    const match = new RegExp(`\\b${own}\\b`, 'i').exec(block.text);
    if (!match) continue;

    // The explanation must land in the same block, and something must follow the
    // label. renderer-prompt: "Never leave a blunt label sitting alone at the end
    // of a sentence, a block, or a paragraph."
    const after = block.text.slice(match.index + match[0].length);
    if (sentences(after).length === 0) {
      out.push(finding('fact.strength_bare_label',
        `"${own}" is the last thing in its block; the resolution never arrives`,
        block.fact_ids));
      continue;
    }

    const overlap = stemOverlap(fact.label_meaning, block.text);
    if (overlap.ratio < FACT_PARAMS.sameBreathOverlap
        && overlap.hits < FACT_PARAMS.sameBreathMinHits) {
      out.push(finding('fact.strength_same_breath',
        `"${own}" appears without the substance of its meaning `
        + `(${overlap.hits}/${overlap.total} stems)`, block.fact_ids));
    }
  }
}

/** The Day Master element. A different element named as the core self is a lie. */
function checkDayMaster(rendered, semantic, out) {
  const element = semantic.core?.element;
  if (!element) return;
  const others = Object.values(GLOSSARY.elemen)
    .map((e) => e.name_id)
    .filter((name) => name !== element);

  for (const block of rendered.blocks || []) {
    for (const wrong of others) {
      if (new RegExp(`\\b(inti dirimu|kamu)\\s+(adalah\\s+)?${wrong}\\b`, 'i').test(block.text)) {
        out.push(finding('fact.day_master',
          `the Day Master is ${element} but the text calls the self ${wrong}`, block.fact_ids));
      }
    }
  }
}

/**
 * Badge invention (the run-1 failure).
 *
 * Every badge name in the glossary that this chart does NOT carry is checked
 * against the text. A badge is something the person HAS; naming one they do not
 * is the renderer deciding something true.
 */
function checkBadgeInvention(rendered, semantic, text, out) {
  const carried = new Set((semantic.facts || []).map((f) => f.label).filter(Boolean));
  for (const entry of Object.values(GLOSSARY.bintang)) {
    const name = entry.name_id;
    if (!name || carried.has(name)) continue;
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      out.push(finding('fact.badge_invented',
        `the text names "${name}", which is not in this chart`, null));
    }
  }
}

/**
 * A `label: null` fact rendered as though it were a badge.
 *
 * The glossary sets name_id null for CONDITIONS (a missing element is not
 * something you carry). renderer-prompt names the exact failure:
 * "Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu".
 * Mechanically: the condition's English bracket must never surface, because the
 * only way it can is as a name.
 */
function checkConditionNamed(rendered, semantic, text, out) {
  for (const fact of semantic.facts || []) {
    if (fact.label !== null) continue;

    // (a) The fact's own English bracket. The only way it can surface is as a
    //     name, because there is no Indonesian name for it to cite.
    if (fact.label_bracket && text.includes(fact.label_bracket)) {
      out.push(finding('fact.condition_named',
        `"${fact.label_bracket}" is a condition, not a badge, and must not be named`,
        [fact.id]));
      continue;
    }

    // (b) ANY name-with-bracket construction in a block that carries only
    //     unnamed conditions. renderer-prompt's example invents a CATEGORY name
    //     rather than reusing the fact's own bracket - "Tidak ada satu pun Unsur
    //     yang Hilang (Missing Element) berupa Kayu" - so matching on the
    //     bracket alone would miss the documented failure entirely.
    for (const block of blocksCiting(rendered, fact.id)) {
      const allUnnamed = block.fact_ids.every(
        (id) => (semantic.facts || []).find((f) => f.id === id)?.label === null,
      );
      if (!allUnnamed) continue;
      const named = /\b[A-Z][\wÀ-ÿ]*(?:\s+[a-zA-Z][\wÀ-ÿ]*){0,3}\s*\([^)]+\)/.exec(block.text);
      if (named) {
        out.push(finding('fact.condition_named',
          `${fact.id} is a condition and this block names it: "${named[0]}"`, [fact.id]));
      }
    }
  }
}

/**
 * Palace attribution: a fact whose required point demands `palace` must have
 * that palace named in a block that cites it.
 *
 * OBSERVED TWICE (PROGRESS, gate-check runs 1 and 2, 2026-08-02): "profile
 * palace dropped" both times. This is the check for it.
 */
function checkPalaces(rendered, semantic, out) {
  for (const point of semantic.required_points || []) {
    if (!point.must_cover?.includes('palace')) continue;
    const fact = (semantic.facts || []).find((f) => f.id === point.fact_id);
    if (!fact?.palace) continue;

    const blocks = blocksCiting(rendered, fact.id);
    if (blocks.length === 0) continue; // coverage.js owns the missing-block case
    const named = blocks.some((b) => `${b.heading} ${b.text}`.includes(fact.palace));
    if (!named) {
      out.push(finding('fact.palace_dropped',
        `${fact.id} sits in ${fact.palace} and no block citing it says so`, [fact.id]));
    }
  }
}

/**
 * Branch-relation positions.
 *
 * OBSERVED (PROGRESS, gate-check run 2): the 半合 spans year + hour + month in
 * the JSON and the text said "tahun dan bulan", silently dropping the hour.
 *
 * Only fires when the text actually names positions - naming none is allowed
 * (the relation can be described without listing pillars), naming a WRONG SET is
 * not. Palace names count as position mentions too, since "Pilar Kerja" is the
 * preferred way to say "month".
 */
function checkRelationPositions(rendered, semantic, out) {
  for (const fact of semantic.facts || []) {
    if (fact.provenance?.kind !== 'branch_relation') continue;
    const expected = new Set(fact.provenance.positions || []);
    if (expected.size === 0) continue;

    for (const block of blocksCiting(rendered, fact.id)) {
      const haystack = `${block.heading} ${block.text}`;
      const named = new Set();
      for (const [word, position] of Object.entries(POSITION_WORDS)) {
        if (new RegExp(`\\b${word}`, 'i').test(haystack)) named.add(position);
      }
      for (const [position, palace] of Object.entries(semantic.chart?.palaces || {})) {
        if (palace && haystack.includes(palace)) named.add(position);
      }
      if (named.size === 0) continue;

      const missing = [...expected].filter((p) => !named.has(p));
      const extra = [...named].filter((p) => !expected.has(p));
      if (missing.length || extra.length) {
        out.push(finding('fact.relation_positions',
          `${fact.id} spans [${[...expected].join(', ')}] but the text names `
          + `[${[...named].join(', ')}]`, [fact.id]));
      }
    }
  }
}

/**
 * @param {Object} rendered parsed blocks[] contract
 * @param {Object} semantic Stage 3 output (the FULL one, not the scrubbed view)
 * @param {string} text the reading as one string, ids excluded
 * @returns {Array} findings, all severity 'hard'
 */
export function factGuard(rendered, semantic, text) {
  const out = [];
  checkStrength(rendered, semantic, out);
  checkDayMaster(rendered, semantic, out);
  checkBadgeInvention(rendered, semantic, text, out);
  checkConditionNamed(rendered, semantic, text, out);
  checkPalaces(rendered, semantic, out);
  checkRelationPositions(rendered, semantic, out);
  return out;
}
