// ============================================================
// Glossary access for Stage 3
// ============================================================
// docs/content/glossary.json is the ENGINE CONTENT TABLE. Every user-facing
// string in the semantic JSON is read from it. Stage 3 never writes one.
//
// Rule 14: the engine owns all facts, the LLM chooses only words. That cuts both
// ways — Stage 3 inventing a label is the same violation as the renderer
// inventing a finding, just one stage earlier.
//
// ── ELEMENT NAMES ──────────────────────────────────────────
// The strength engine speaks English (Wood, Fire); every user-facing surface
// speaks Indonesian (Kayu, Api). That translation goes through glossary.elemen
// and nowhere else. The English -> hanzi bridge below is DERIVED by inverting the
// glossary's own name_en values rather than hardcoded, so there is exactly one
// place the pairing is written down and a second map cannot silently drift from
// it (D2a §5).
//
// NOTE, flagged not fixed: lib/readingView.js carries its own ELEMENT_ID map that
// renders Earth as "Bumi", while the glossary says "Tanah". That surface predates
// the glossary and is out of Stage 3's scope, but it is the exact drift this
// derivation exists to prevent.
// ============================================================

import GLOSSARY from '../../docs/content/glossary.json' with { type: 'json' };

export { GLOSSARY };

/** Element hanzi keyed by the English name the strength engine emits. */
export const ELEMENT_HANZI = Object.fromEntries(
  Object.entries(GLOSSARY.elemen).map(([hanzi, entry]) => [entry.name_en, hanzi]),
);

/** Indonesian element name. The only path from an engine element to display copy. */
export function elementId(englishElement) {
  const hanzi = ELEMENT_HANZI[englishElement];
  if (!hanzi) throw new Error(`No glossary element for "${englishElement}"`);
  return GLOSSARY.elemen[hanzi].name_id;
}

/** The five Indonesian element names, for the no-English-leaks assertion. */
export const ELEMENT_NAMES_ID = Object.values(GLOSSARY.elemen).map((e) => e.name_id);
export const ELEMENT_NAMES_EN = Object.keys(ELEMENT_HANZI);

/**
 * The four content fields every fact carries, pulled from one glossary entry.
 *
 * `gift_seed` / `cost_seed` are SEEDS by the glossary's own README: defaults the
 * engine is meant to condition per chart by palace, strength verdict and
 * interactions. Phase 1 passes them through unconditioned and marks them so, so
 * that conditioning arrives as a visible change rather than as a silent one.
 *
 * @param {Object|null|undefined} entry a node of glossary.json
 * @returns {{ label, label_bracket, label_meaning, gift, cost, actionable }}
 */
export function contentFrom(entry) {
  if (!entry) {
    return {
      label: null, label_bracket: null, label_meaning: null,
      gift: null, cost: null, actionable: null,
    };
  }
  return {
    // name_id is deliberately null for conditions rather than badges (a missing
    // element is not something you carry). Preserved, never substituted.
    label: entry.name_id ?? null,
    label_bracket: entry.name_en ?? null,
    label_meaning: entry.label_meaning ?? null,
    gift: entry.gift_seed ?? null,
    cost: entry.cost_seed ?? null,
    actionable: entry.actionable_seed ?? null,
  };
}

/** Palace display name for a pillar position. */
export function palaceName(position) {
  return GLOSSARY.pilar[position]?.name_id ?? null;
}

/** Reading order. A span is spoken front-to-back, never in table-lookup order. */
const POSITION_ORDER = ['year', 'month', 'day', 'hour'];

/**
 * A span of positions as ONE ready Indonesian phrase.
 *
 *   ['month']                  -> "Pilar Kerja"
 *   ['month', 'year']          -> "Pilar Akar dan Pilar Kerja"
 *   ['hour', 'year', 'month']  -> "Pilar Akar, Pilar Kerja, dan Pilar Arah"
 *
 * ── WHY STAGE 3 SAYS THIS AND NOT THE RENDERER ─────────────
 * `relation_positions` was the one check a prompt edit did not move (PROGRESS
 * 2026-08-02: 24% -> 28% across `baa5b7c0` -> `9f5ee276`, flat at n=39, after an
 * instruction that named it explicitly). The renderer was handed a position ARRAY
 * and asked to say all of it; it kept saying two of three. Handing it the finished
 * phrase removes the step it was failing at.
 *
 * This is a DATA JOIN, not copy. Every name comes from `GLOSSARY.pilar` and rule
 * 23's locked palace names; nothing here is authored. Positions are deduped and
 * sorted into reading order, so the phrase for a span does not depend on which
 * branch of the pair the relation table happened to list first.
 *
 * @param {string[]} positions any order, duplicates allowed
 * @returns {string|null} null when no position resolves to a palace
 */
export function palacePhrase(positions) {
  const names = [...new Set(positions || [])]
    .filter((p) => POSITION_ORDER.includes(p))
    .sort((a, b) => POSITION_ORDER.indexOf(a) - POSITION_ORDER.indexOf(b))
    .map(palaceName)
    .filter(Boolean);

  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} dan ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, dan ${names.at(-1)}`;
}
