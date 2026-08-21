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
// matters beyond caution: the commit that lands this also makes the archetype a
// required point, and a required point is a new way to fail coverage. If both
// could move the floor, neither one's contribution would be recoverable
// afterwards - rule 13, and the CLAUDE.md rule that gate changes ship isolated,
// which exempts a check that only fires and logs.
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
