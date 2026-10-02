// ============================================================
// The archetype is named by its English title, in prose (G1, Reyner 2026-10-02)
// ============================================================
// CLAUDE.md rule 23, AMENDED 2026-10-02: "archetype titles are English everywhere
// ("The Garden", "The Forge") ... The Indonesian archetype name is no longer shown to
// readers and is never bracketed beside the English." Record:
// docs/product/compat-rulings-2026-10-02.md (G1, E7). Prompt BB §3.
//
// The writer is handed only the English title (the Indonesian one is internal_only in
// the semantic JSON, lib/semantic/index.js and pair.js). This step is the backstop for
// a writer that writes the Indonesian name anyway - the v2 examples show "Kamu adalah
// Samudra", and examples are Reyner's and not edited here. It REPLACES the old
// archetype bracket insertion ("Taman" -> "Taman (The Garden)"), which is deleted from
// both gates: the engine owns the name, so writing it the ruled way is formatting, not
// a word choice (rule 14), exactly as the insertion was.
//
// For each person's archetype (the reader's on a mirror, both on a pair), in prose
// fields (blocks[].text, penutup), every mention becomes the English title:
//   "Taman (The Garden)" / "Taman (anything)" / "Taman [Garden]"  -> "The Garden"
//   "The Garden (Taman)" / "The Garden (The Garden)"             -> "The Garden"
//   "Taman" standing alone (no letter on either side)            -> "The Garden"
// Case-sensitive, as the glossary spells the name. Other people's archetypes are not
// touched: a reading only ever names its own.
//
// KNOWN RESIDUAL, recorded rather than guarded: an archetype name that is also an
// ordinary noun (Matahari, Taman, Gunung, Embun ...) used as that noun AND capitalised
// - in practice, at the start of a sentence - is replaced too ("Matahari pagi ..." on a
// Matahari chart). Every replacement is logged (`terms.archetype_english`), so the QA
// tape shows each one.
// ============================================================

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

/** The archetype(s) a payload names, as {id, en}: the reader's, or both people's on a pair. */
export function archetypeTitles(semanticJson) {
  const core = semanticJson?.core || {};
  const people = semanticJson?.kind === 'pair' ? [core.a, core.b] : [core];
  return people
    .filter((p) => p?.archetype_name_id && p?.archetype_name_en)
    .map((p) => ({ id: p.archetype_name_id, en: p.archetype_name_en }));
}

/**
 * Rewrite every archetype mention in prose to its English title.
 *
 * @param {Object} rendered blocks[] contract
 * @param {Object} semanticJson Stage 3 output, full (the gate's copy, which keeps name_id)
 * @returns {{rendered: Object, replaced: Array<{was: string, to: string, where: string}>}}
 */
export function englishArchetypes(rendered, semanticJson) {
  const titles = archetypeTitles(semanticJson)
    .sort((a, b) => b.id.length - a.id.length);
  if (titles.length === 0) return { rendered, replaced: [] };
  const replaced = [];
  const fix = (text, where) => {
    if (typeof text !== 'string') return text;
    let next = text;
    for (const { id, en } of titles) {
      const ID = escapeRe(id);
      const EN = escapeRe(en);
      const edge = (s) => `(?<![\\p{L}])${s}(?![\\p{L}])`;
      // 1. Indonesian name with any bracket after it (round or square).
      next = next.replace(new RegExp(`${edge(ID)}\\s*(?:\\([^()]{1,60}\\)|\\[[^\\]]{1,60}\\])`, 'gu'), (m) => {
        replaced.push({ was: m, to: en, where });
        return en;
      });
      // 2. English title followed by a bracket naming it again, in either language.
      next = next.replace(new RegExp(`${edge(EN)}\\s*\\((${ID}|${EN})\\)`, 'giu'), (m) => {
        replaced.push({ was: m, to: en, where });
        return en;
      });
      // 3. The Indonesian name standing alone.
      next = next.replace(new RegExp(edge(ID), 'gu'), (m) => {
        replaced.push({ was: m, to: en, where });
        return en;
      });
    }
    return next;
  };
  const out = {
    ...rendered,
    blocks: (rendered.blocks || []).map((b, i) => ({ ...b, text: fix(b.text, `blocks[${i}]`) })),
    penutup: fix(rendered.penutup, 'penutup'),
  };
  return { rendered: out, replaced };
}
