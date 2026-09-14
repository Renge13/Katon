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

// ── TEMPLATE CELLS ─────────────────────────────────────────
// A cell marked `_template: true` carries SLOTS - `{A}`, `{B}` - that the engine
// fills at fact-build time. `kompatibilitas.p0_opening` is the first and, at the
// time of writing, the only one: the opening has to name both people, the names
// are per-pair, and a ruled sentence cannot contain them. Reyner ruled the
// sentence WITH the slots, so every word a reader sees is still his and the
// engine supplies only two names it already owns.
//
// **`{` AND `}` TRIP `style.code_leak`, CORRECTLY** - a brace in prose is the
// model echoing its input structure back at the reader. So a raw template is not
// prose and must never be swept as prose. Two consequences, both enforced rather
// than remembered:
//   - the FACT carries the filled string, never the template (lib/semantic/pair.js)
//   - a glossary sweep fills first, via `sweepableGlossary()` below
// The marker is `_`-prefixed because it is metadata, like `_note`: it is not a
// string Reyner ruled, so it must not be counted as an assignment by
// `scripts/apply-rulings.mjs --expect` or by the section's shape test.

/** Slot-filling. The single door; nothing else may substitute into a cell. */
export function fillPairTemplate(text, a, b) {
  return String(text ?? '').replaceAll('{A}', a ?? '').replaceAll('{B}', b ?? '');
}

/**
 * The glossary as a SWEEP sees it: every template cell filled with two real
 * archetype names.
 *
 * Filled with real `arketipe` names rather than "A" and "B" on purpose - a sweep
 * asks "would this string trip the gate", and the strings that actually reach a
 * reader contain names of that shape and length. Two DIFFERENT ones, because an
 * opening that named the same person twice would read correctly and be wrong.
 *
 * Deep-copies rather than mutating: `GLOSSARY` is a live import shared by the
 * engine, and a sweep that filled it in place would leave the filled string in
 * production memory.
 */
export function sweepableGlossary() {
  const names = Object.values(GLOSSARY.arketipe).map((v) => v.name_id).filter(Boolean);
  const [a, b] = [names[0], names[1]];
  const fill = (node) => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(fill);
    if (!node || typeof node !== 'object') return node;
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = node._template === true && typeof v === 'string' && !k.startsWith('_')
        ? fillPairTemplate(v, a, b)
        : fill(v);
    }
    return out;
  };
  return fill(GLOSSARY);
}

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
    // ── THE COMPAT SEEDS, AND THEY ARE OMITTED WHEN ABSENT ────
    // Ruled 2026-09-10 (42 strings, `docs/content/compat-seeds-rulings.md`):
    // every `kompatibilitas` FACT cell carries what it means between the two
    // people and one ordinary-week scene. Without this they sit in the glossary
    // and never reach a fact - measured before writing it:
    //
    //   fact keys: id, type, provenance, label, label_bracket, label_meaning,
    //              gift, cost, actionable, hierarchy, importance
    //   meaning_seed on fact: null
    //
    // SPREAD CONDITIONALLY, NEVER `?? null`, and that is the whole care here.
    // `cacheKey` is `sha256(engine_version + canonical(semanticJson))`, so a key
    // present with a null value is still a key: emitting these on every fact
    // would move EVERY MIRROR READING'S cache key and re-render the lot, for two
    // fields no mirror cell has. Omitted when absent, the mirror's JSON is
    // byte-identical and only compat re-renders - which is the consequence
    // Prompt Z states and the only one anyone agreed to pay.
    ...(entry.meaning_seed ? { meaning_seed: entry.meaning_seed } : {}),
    ...(entry.daily_seed ? { daily_seed: entry.daily_seed } : {}),
  };
}

/** Palace display name for a pillar position. */
export function palaceName(position) {
  return GLOSSARY.pilar[position]?.name_id ?? null;
}

/**
 * The LIFE DOMAIN a palace stands for, as a ready Indonesian noun phrase.
 *
 * QA finding 5, 2026-08-11: "Pilar Kerja" reads as an internal variable that leaked
 * to the user - the reader cannot tell whether it means her job, her career arc, or
 * how she is seen. `domain_id` is the reviewed gloss that answers it
 * ("pekerjaan dan kariermu"), ruled by Reyner and landed as DATA in tranche 1.
 * Nothing read it until this join.
 *
 * A JOIN, NOT AUTHORING. Every string returned here is already in the glossary and
 * already Reyner's, exactly like `palaceName` above.
 */
export function palaceDomain(position) {
  return GLOSSARY.pilar[position]?.domain_id ?? null;
}

/**
 * Reverse lookup: palace DISPLAY NAME -> its life domain.
 *
 * Facts carry the palace as a display name rather than a position (see the `fact()`
 * factory), so the join needs this direction. Built once from the glossary, and the
 * contract test asserts it is bijective - four positions, four distinct names - so
 * this cannot silently collapse if a name is ever edited to match another.
 */
const DOMAIN_BY_PALACE_NAME = new Map(
  Object.keys(GLOSSARY.pilar)
    .map((position) => [palaceName(position), palaceDomain(position)])
    .filter(([name, domain]) => name && domain),
);

/** The life domain for a palace given its display name. */
export function palaceDomainByName(name) {
  return DOMAIN_BY_PALACE_NAME.get(name) ?? null;
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
