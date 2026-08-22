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
// ── THE PIPELINE INSERTS. THE CHECK ONLY ASSERTS. ──────────
// Ruled by Reyner 2026-08-21, and the route to it is worth keeping because the
// middle step is what produced the ruling.
//
// It landed first as a REPORTER (every finding `severity: 'flag'`, which
// lib/validate/index.js excludes from `failing`, so it could not reject). Then it was
// flipped to ENFORCING and measured: floor rate 0/4 -> 2/4, one chart attributable -
// chart 1's attempt 1 failed on `brackets.unbracketed` and nothing else, so a reading
// that had been served first try now floored. **Under the STRICT precondition 3 ruled
// the same day, a floored chart FAILS, so that gate did not cost one chart, it cost
// the launch gate.** The enforcing commit is kept unmerged and undeleted on
// `feat/rule23-enforced`; its measurement is the argument for what this file does now.
//
// So compliance MOVED INTO THE PIPELINE. `insertBrackets` puts `(English)` on the
// first prose mention, and `bracketGuard` becomes an assertion that can only fire if
// that insertion is broken - never because a model forgot. Its findings stay `flag`
// for exactly that reason: a pipeline defect must be VISIBLE to QA and must never
// floor a reader, and a regeneration cannot fix a bug in our own code anyway. The
// tests are where it is a hard assertion.
//
// Two things reporting-first got right and one it got wrong, all three recorded in the
// verdict: it produced the number the ruling was made on, it corrected a bogus
// prerequisite figure of mine - and IT COULD NOT PREDICT THE GATE, because the
// reporter measured artifact prose while the gate measured the whole reading including
// headings. Two haystacks, so the rehearsal proved nothing about the performance.
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
 * INSERT the English bracket on the first PROSE mention of each bound term.
 *
 * ── WHY THIS IS A PIPELINE STEP AND NOT A GATE CHECK ───────
 * Ruled by Reyner 2026-08-21, after enforcement was built AND MEASURED. Asking the
 * model to remember it cost the launch gate: floor rate went 0/4 -> 2/4, and under
 * the STRICT precondition 3 ruled the same day a floored chart FAILS, so a gate that
 * floors one chart does not cost one chart. The full arc is in
 * docs/qa/2026-08-19-READ-VERDICT.md section 3, and the measurement that argues for
 * this lives on the `feat/rule23-enforced` branch, deliberately unmerged and
 * undeleted.
 *
 * Rule 14 reads the same way round: the LLM chooses WORDS, the engine owns NAMES.
 * `label` and `label_bracket` are both engine data, so putting one after the other
 * is a FORMATTING rule, not a word choice - there is nothing here for a model to
 * get right or wrong. `lib/render/fallback.js` has been doing exactly this insertion
 * since the floor was built (`sentence(label + " (" + label_bracket + ")")`), and
 * this reuses that shape rather than inventing a second one.
 *
 * It also removes one of the two obligations a regeneration was trying to satisfy at
 * once: both charts that floored under enforcement had an attempt that failed
 * `opening.archetype_missing` ALONE, because the retry sent to fix brackets rewrote
 * the opening and dropped the archetype.
 *
 * ── PROSE ONLY, FIRST MENTION ONLY, AND IDEMPOTENT ─────────
 * Headings are never touched: a bare label in a section title is not a first mention
 * (see renderedProse). Later bare mentions are correct and are left alone - rule 23
 * is bracket-ONCE. A term already bracketed by the model is left exactly as written,
 * so a reading that got it right is byte-identical afterwards.
 *
 * The result is spread into what gets served AND cached (`...gate.normalized` in
 * lib/render/index.js), so what the reader sees is what the gate checked. A step that
 * fixed the text after validation would have validated nothing.
 *
 * @param {Object} rendered normalised blocks[] contract
 * @param {Object} semanticJson Stage 3 output, full
 * @returns {{rendered: Object, inserts: Array<{term: string, kind: string, en: string, context: string}>}}
 */
export function insertBrackets(rendered, semanticJson) {
  const terms = scopedTerms(semanticJson).filter((t) => t.en !== null);
  if (terms.length === 0) return { rendered, inserts: [], normalised: [] };

  const out = structuredClone(rendered);
  const inserts = [];
  const normalised = [];
  const done = new Set();

  // Longest name first, so a term that contains another cannot be half-matched by
  // the shorter one and leave the longer one looking already-bracketed.
  const ordered = [...terms].sort((a, b) => b.id.length - a.id.length);

  const fields = [
    ...(out.blocks || []).map((b) => ({ get: () => b.text, set: (v) => { b.text = v; } })),
    { get: () => out.penutup, set: (v) => { out.penutup = v; } },
  ];

  // ── NORMALISE, DO NOT SKIP. ────────────────────────────────
  // CORRECTED 2026-08-22, and the version it replaces was wrong in the one case that
  // costs money. Skipping any term that carried a bracket meant this:
  //
  //   model writes  "Matahari (Sun)"     <- sanctioned value is "The Sun"
  //   insertion     skips it, because a bracket already follows
  //   the gate      style.unsanctioned_bracket fires, SOFT, and a regeneration is spent
  //
  // So the mechanism built to stop the model paying for a formatting rule handed the
  // bill straight back. A wrong bracket on a bound term is now REPLACED with
  // `label_bracket` - the engine owns the name, and correcting a paraphrase of an engine
  // string is formatting rather than meaning.
  //
  // THE DOUBLE-BRACKET FIX SURVIVES: a term already bracketed CORRECTLY anywhere gets no
  // second bracket. That defect was real -
  //
  //   before  "Kamu adalah Matahari yang tenang. Dan Matahari (The Sun) selalu terlihat."
  //   after   "Kamu adalah Matahari (The Sun) yang tenang. Dan Matahari (The Sun) ..."
  //
  // two bracketed mentions, rule 23 broken, and invisible to the check because both
  // values are sanctioned.
  //
  // KNOWN RESIDUAL, recorded rather than fixed on synthetic evidence: if the model
  // brackets the SAME term twice and gets the value wrong both times, both are
  // corrected and the reading ends with two correct brackets. Rule 23 says once. It has
  // only been produced by a probe fixture that repeats a term two facts share, never by
  // a model, and stripping a bracket the model wrote is a bigger step than correcting
  // one. Leaving a wrong gloss standing costs a regeneration; a duplicate correct one
  // costs nothing but tidiness.
  const correct = (v) => String(v).trim().toLowerCase();

  // Pass 1: replace every WRONG bracket on a bound term. All of them, not just the
  // first - the check flags any unsanctioned parenthetical, so leaving a second one
  // would leave the finding it was meant to remove.
  for (const field of fields) {
    const text = field.get();
    if (typeof text !== 'string') continue;
    let next = text;
    for (const term of ordered) {
      let at = next.indexOf(term.id);
      while (at !== -1) {
        const tail = next.slice(at + term.id.length);
        const m = /^(\s*)\(([^)]{1,60})\)/.exec(tail);
        if (m && correct(m[2]) !== correct(term.en)) {
          const cut = at + term.id.length;
          next = next.slice(0, cut) + `${m[1]}(${term.en})` + next.slice(cut + m[0].length);
          normalised.push({
            term: term.id, kind: term.kind, en: term.en, was: m[2].trim(),
            context: next.slice(Math.max(0, at - 40), cut + term.en.length + 43).trim(),
          });
        }
        at = next.indexOf(term.id, at + 1);
      }
    }
    if (next !== text) field.set(next);
  }

  // Pass 2: anything now carrying a CORRECT bracket needs nothing more.
  const wholeProse = fields.map((f) => f.get())
    .filter((t) => typeof t === 'string')
    .join('\n');
  for (const term of ordered) {
    // indexOf + a look at what follows, rather than a built regex: the term is
    // glossary data and may contain regex metacharacters, and escaping it here would
    // be a second place to get that wrong.
    let at = wholeProse.indexOf(term.id);
    while (at !== -1) {
      const m = /^\s*\(([^)]{1,60})\)/.exec(wholeProse.slice(at + term.id.length));
      if (m && correct(m[1]) === correct(term.en)) { done.add(term.id); break; }
      at = wholeProse.indexOf(term.id, at + 1);
    }
  }

  // Pass 3: insert on the first mention of whatever is still bare.
  for (const field of fields) {
    for (const term of ordered) {
      if (done.has(term.id)) continue;
      const text = field.get();
      if (typeof text !== 'string') continue;
      const at = text.indexOf(term.id);
      if (at === -1) continue;

      done.add(term.id); // first PROSE mention, wherever it lands
      const cut = at + term.id.length;
      field.set(`${text.slice(0, cut)} (${term.en})${text.slice(cut)}`);
      // The context is the ONE thing a human has to look at: an insertion can be
      // correct and still read badly, and no assertion can tell the difference.
      const ctx = field.get();
      inserts.push({
        term: term.id,
        kind: term.kind,
        en: term.en,
        context: ctx.slice(Math.max(0, at - 40), cut + term.en.length + 43).trim(),
      });
    }
  }

  return { rendered: out, inserts, normalised };
}

/**
 * Report rule-23 bracket compliance. Never rejects.
 *
 * @param {Object} semanticJson Stage 3 output, full
 * @param {string} text the reading's PROSE, AFTER insertBrackets has run
 * @param {Object} [metrics] mutated with a `brackets` array when present
 * @param {Array} [inserts] what insertBrackets did, surfaced so a human can read the
 *   one thing no assertion can judge: whether a correct insertion reads badly
 * @returns {Array} findings, all `severity: 'flag'` - see the header
 */
export function bracketGuard(semanticJson, text, metrics, inserts = [], normalised = []) {
  const out = [];

  // THE INSERTIONS THEMSELVES, surfaced. Not a defect and not a rejection: the
  // harness prints findings per reading, so this is how each insertion reaches a
  // human's eye with enough context to judge whether it reads well.
  // A NORMALISATION IS A CORRECTED PARAPHRASE, and it is louder than an insertion:
  // the model was GIVEN the value and wrote something else. Surfaced so the prompt half
  // of this fix can be judged by whether these go to zero.
  for (const n of normalised) {
    out.push({
      check: 'brackets.normalised',
      severity: 'flag',
      message: `rule 23 replaced "(${n.was})" with "(${n.en})" after ${n.kind} `
        + `"${n.term}" -- the model paraphrased a supplied value. READ THIS: ...${n.context}...`,
      where: [n.term],
    });
  }

  for (const ins of inserts) {
    out.push({
      check: 'brackets.inserted',
      severity: 'flag',
      message: `rule 23 inserted "(${ins.en})" after ${ins.kind} "${ins.term}" `
        + `-- READ THIS: ...${ins.context}...`,
      where: [ins.term],
    });
  }

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
      // REACHING HERE MEANS insertBrackets IS BROKEN, not that a model forgot -
      // insertion runs first and is unconditional. Phrased as the pipeline defect it
      // now is, so nobody reads it as a content problem and goes editing the prompt.
      out.push({
        check: `brackets.${verdict}`,
        severity: 'flag',
        message: `PIPELINE DEFECT, not model output: after insertBrackets, ${term.kind} `
          + `"${term.id}" `
          + (verdict === 'unbracketed'
            ? `still carries no "(${term.en})"`
            : `carries "(${found})" where the engine supplies "(${term.en})"`),
        where: [term.id],
      });
    }
  }
  return out;
}
