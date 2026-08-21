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
// ── IT ENFORCES, SINCE 2026-08-21. IT REPORTED FIRST, ON PURPOSE. ──
// It landed one commit earlier with every finding as `severity: 'flag'`, which
// lib/validate/index.js excludes from `failing` - so it could not reject, could not
// cost a regeneration and could not move the floor rate. That was not caution: the
// commit that introduced it also made the archetype a required point, and if both
// could move the floor neither one's contribution would have been recoverable
// afterwards (rule 13, and the CLAUDE.md rule that gate changes ship isolated).
//
// Reporting first is also what produced the number the ruling was made on, and that
// number CORRECTED THE DIAGNOSIS. The first version read `f.name_en`, found it
// absent, and reported 12 of 20 terms as `no_pair` - a supposed prerequisite that did
// not exist, because the field is `label_bracket` and every fact carries it. Once
// fixed the real figure was 19 of 21 bracketed, 0 `no_pair`, 0 mismatch, with BOTH
// misses being `Matahari`, the archetype, on charts 5 and 1.
//
// ── SO THE DEFECT IS THE FUSED OPENING, NOT A MISSING BRACKET ──
// Those two charts did not forget a bracket. They wrote `Kamu adalah Api Matahari` -
// element, then image - which is the same shape Reyner rejected on chart 13 as
// identity behind taxonomy. It survived commit 1 because that commit required the
// NAME and not the PATTERN. Shown the pair, Reyner ruled the second, 2026-08-21:
//
//     Kamu adalah Api Matahari yang Lemah.
//     Kamu adalah Matahari (The Sun) yang Lemah.
//
// Enforcement therefore is not a new rule. It is section 2's ruled pattern reaching
// the two charts the model happened to miss, and it works BECAUSE the fused form
// never brackets: `Api Matahari` puts no `(The Sun)` after the archetype, so the
// unbracketed check is what catches it.
//
// A FUSED-BUT-BRACKETED opening - `Api Matahari (The Sun)` - would still pass this
// check. That is a second check if it is ever observed, measured rather than assumed,
// and it is deliberately not bundled here: one accept-changing edit per commit.
//
// `no_pair` STAYS NON-FAILING. A term the payload supplies no English for cannot be
// bracketed without the renderer inventing terminology, which is rule 14 inverted -
// the LLM deciding something true. It is 0 across the fixture today and a test pins
// that, so this is a guard against a future glossary gap rather than a live case.
//
// ── SCOPE COMES FROM THE GLOSSARY, NOT FROM A LIST HERE ────
// A term is bracket-bound when its Indonesian name IS an `aspek` or `bintang`
// entry, asked of the glossary directly. An allowlist of `provenance.kind` values
// was the first attempt and it was wrong twice over: it missed `coherence_rule`
// ("Aspek Pengelola" - one of the two terms in the ruling's own live instance) and
// `void_stack` ("Tanda Kekosongan", a 空亡 bintang). Membership is data, so it is
// read from the data. fact.js already imports GLOSSARY, so this introduces no new
// dependency direction.
//
// Not in scope, deliberately: `Elemen` ("Api"), `Kekuatan` ("Lemah"), branch
// relations ("Setengah Gabungan") and palaces ("Fondasi Pasangan"). The first is
// explicitly excluded by the ruling; the others are simply not on its list.
//
// ── THE ENGLISH IS `label_bracket`, AND THIS WAS WRONG ONCE ─
// CORRECTED 2026-08-21, before this ever enforced anything. The first version of
// this file read `f.name_en`, found it absent on every fact, and concluded that
// Stage 3 forwarded English for the archetype and the main profile ALONE - so it
// reported 12 of 20 in-scope terms as `no_pair` and I wrote that up as a
// prerequisite for the enforcing commit. IT IS NOT TRUE. Every fact already
// carries `label_bracket` ("Aspek Pengatur" -> "Direct Officer", "Bintang
// Penolong" -> "Nobleman"), which is the field the module-assembly floor has been
// using for brackets all along. The pairs were always in the payload; the reporter
// was asking for a field name that does not exist. `no_pair` is kept because a
// glossary gap would still be real, and a test now pins that it is EMPTY on the
// fixture so the same mistake cannot be reported as a finding again.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';

/** Rule 23's ruled scope. `Pilar` and `Elemen` are deliberately absent. */
export const BRACKET_SCOPE = ['arketipe', 'aspek', 'bintang'];

/** Indonesian name -> which scoped category it belongs to, built from the glossary. */
const SCOPE_BY_NAME = new Map();
for (const [section, key] of [['aspek', 'aspek'], ['bintang', 'bintang']]) {
  for (const entry of Object.values(GLOSSARY[section] || {})) {
    if (entry?.name_id) SCOPE_BY_NAME.set(entry.name_id, key);
  }
}

/**
 * A term is bracketed when its FIRST mention is immediately followed by a
 * parenthetical. "Once" is about the first mention; later bare mentions are
 * correct and are not counted against it.
 */
const followingBracket = (text, term) => {
  const at = text.indexOf(term);
  if (at === -1) return null;
  const m = /^\s*\(([^)]{1,60})\)/.exec(text.slice(at + term.length));
  return m ? m[1].trim() : '';
};

/** Terms rule 23 binds, each with the English the payload supplies (or null). */
function scopedTerms(semanticJson) {
  const core = semanticJson.core || {};
  const terms = [];
  const seen = new Set();
  const add = (kind, id, en) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    terms.push({ kind, id, en: en || null });
  };

  add('arketipe', core.archetype_name_id, core.archetype_name_en);
  for (const f of semanticJson.facts || []) {
    const kind = SCOPE_BY_NAME.get(f.label);
    if (kind) add(kind, f.label, f.label_bracket);
  }
  return terms;
}

/**
 * Enforce rule-23 bracket-once. Soft: a regeneration is what fixes it.
 *
 * @param {Object} semanticJson Stage 3 output, full
 * @param {string} text the rendered reading as one string
 * @param {Object} [metrics] mutated with a `brackets` array when present
 * @returns {Array} findings. `unbracketed` and `mismatch` are SOFT; a `no_pair`
 *   term is never a finding at all - see the header.
 */
export function bracketGuard(semanticJson, text, metrics) {
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
        severity: 'soft',
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
