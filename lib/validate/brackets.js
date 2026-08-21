// ============================================================
// Stage 6 — RULE 23 BRACKET-ONCE, AS A REPORTER
// ============================================================
// CLAUDE.md rule 23: "Indonesian name first, English term in brackets once."
// Reyner's ruling of 2026-08-19 (verdict section 3) fixed the scope that had been
// ambiguous: bracket-once binds `Aspek`, `Bintang` and `Arketipe`. It does NOT
// bind `Pilar` or `Elemen`. The corpus had already been deciding it that way -
// `pilar` 0 of 274 bracketed, `elemen` 13 of 170 - so the ruling ratifies rather
// than reverses, and those 13 are the exception to sweep, not the convention.
//
// Rule 23 was enforced by NOTHING. That is how chart 1 shipped "Aspek Pengelola"
// and "Aspek Pengatur" with 0 of 2 bracketed and PASSED the gate at attempt 2 -
// the modal served attempt, not some deep retry nobody sees.
//
// ── THIS FILE REJECTS NOTHING. THAT IS THE WHOLE DESIGN. ──
// Ruled by Reyner 2026-08-21: the check lands as a REPORTER first, then flips to
// enforcing in its own commit with its own measurement and its own
// STAGE6_VERSION bump.
//
// Every finding here is `severity: 'flag'`, and lib/validate/index.js computes
// `failing = findings.filter((f) => f.severity !== 'flag')`. So a flag CANNOT
// change `ok`, cannot cost a regeneration, and cannot move the floor rate. That
// matters for a reason beyond caution: the commit that lands this also makes the
// archetype a required point, and a required point is a new way to fail coverage.
// If both changes could move the floor, neither one's contribution to a floor-rate
// move would be recoverable afterwards - rule 13, and the CLAUDE.md rule that gate
// changes ship isolated, which exempts a check that fires and logs precisely
// because it cannot confound anything.
//
// ── WHY EXPECTED ENGLISH COMES FROM THE PAYLOAD AND NOWHERE ELSE ──
// This file does NOT read the glossary. It uses only pairs the semantic JSON
// actually carries, and reports a mentioned term with no pair as `no_pair` rather
// than as a violation. That is not fastidiousness, it is the measurement that
// commit 2 needs:
//
//   - `core.archetype_name_id` / `core.archetype_name_en`  -> a pair exists
//   - `core.main_profile_display` / `core.main_profile_bracket` -> a pair exists
//   - convergence Aspek facts and Bintang badge facts carry `label` ONLY
//
// So for every Aspek that is not the main profile, and for every Bintang, THE
// PAYLOAD SUPPLIES NO ENGLISH. The glossary has it (10 of 10 aspek, 8 of 8
// bintang carry `name_en`) but Stage 3 does not forward it. Enforcing brackets
// while the payload withholds the term would oblige the renderer to supply
// terminology from its own knowledge, which is rule 14 inverted - the LLM
// deciding something true. `no_pair` counts how often that would happen, and it
// is the number that says whether commit 2 needs Stage 3 to forward `name_en`
// first.
// ============================================================

/** Rule 23's ruled scope. `Pilar` and `Elemen` are deliberately absent. */
export const BRACKET_SCOPE = ['arketipe', 'aspek', 'bintang'];

/**
 * A term is bracketed when its FIRST mention is immediately followed by a
 * parenthetical. "Once" is about the first mention; later bare mentions are
 * correct and are not counted against it.
 */
const followingBracket = (text, term) => {
  const at = text.indexOf(term);
  if (at === -1) return null;
  const after = text.slice(at + term.length);
  const m = /^\s*\(([^)]{1,60})\)/.exec(after);
  return m ? m[1].trim() : '';
};

/** Terms rule 23 binds, each with the English the PAYLOAD supplies (or null). */
function scopedTerms(semanticJson) {
  const core = semanticJson.core || {};
  const terms = [];

  if (core.archetype_name_id) {
    terms.push({ kind: 'arketipe', id: core.archetype_name_id, en: core.archetype_name_en || null });
  }
  if (core.main_profile_display) {
    terms.push({ kind: 'aspek', id: core.main_profile_display, en: core.main_profile_bracket || null });
  }
  for (const f of semanticJson.facts || []) {
    if (!f.label) continue;
    // Fact id prefixes are the engine's own taxonomy, so the scope is read off
    // structure rather than off a label that happens to start with "Aspek".
    const kind = f.id.startsWith('aspek_') ? 'aspek' : f.id.startsWith('badge_') ? 'bintang' : null;
    if (!kind) continue;
    if (terms.some((t) => t.id === f.label)) continue; // main profile already counted
    terms.push({ kind, id: f.label, en: f.name_en || null });
  }
  return terms;
}

/**
 * Report rule-23 bracket compliance. Never rejects.
 *
 * @param {Object} semanticJson Stage 3 output, full
 * @param {string} text the rendered reading as one string
 * @param {Object} [metrics] mutated with a `brackets` array when present
 * @returns {Array} findings, all `severity: 'flag'`
 */
export function bracketReport(semanticJson, text, metrics) {
  const out = [];
  for (const term of scopedTerms(semanticJson)) {
    const found = followingBracket(text, term.id);
    if (found === null) continue; // never mentioned; rule 23 says nothing

    const verdict = term.en === null
      ? 'no_pair'
      : found === ''
        ? 'unbracketed'
        : found.toLowerCase() === term.en.toLowerCase() ? 'bracketed' : 'mismatch';

    metrics?.brackets?.push({ kind: term.kind, term: term.id, expected: term.en, found, verdict });

    if (verdict === 'unbracketed' || verdict === 'mismatch') {
      out.push({
        check: `brackets.${verdict}`,
        severity: 'flag',
        message: `rule 23: first mention of ${term.kind} "${term.id}" `
          + (verdict === 'unbracketed'
            ? `carries no "(${term.en})"`
            : `brackets "(${found})" where the engine supplies "(${term.en})"`),
        where: [term.id],
      });
    }
  }
  return out;
}
