// ============================================================
// Stage 6 — FORBIDDEN CONTENT + STYLE GUARD
// ============================================================
// Both are driven by lib/validate/blocklist.json, which is DATA (Prompt H):
// adding a banned word later is a content change Reyner approves, not a deploy.
//
// The split in severity is the ethics line, not a taste line:
//   forbidden_content -> 'hard'. Rule 25. A reading that gives medical advice is
//                        not one regeneration away from acceptable.
//   style             -> 'soft'. Regenerate once with a stricter directive.
//
// ── WHY THIS FILE IS NOW SAFE TO POINT AT ENGINE CONTENT ───
// Until f068352 the glossary itself contained `secara `, `cenderung` and
// `mungkin`, so these regexes would have rejected readings for faithfully
// carrying Reyner-reviewed engine strings - the gate punishing the renderer for
// obeying. The ban-sweep cleaned all 12. The invariant is now asserted rather
// than assumed: tests/stage6-validation.spec.mjs runs every style pattern over
// the whole glossary and fails if any engine string would trip the gate.
// ============================================================

import BLOCKLIST from './blocklist.json' with { type: 'json' };
import { GLOSSARY } from '../semantic/glossary.js';

export const STYLE_PARAMS = {
  /**
   * Per-category allowance before a style category fails, by provider.
   *
   * pipeline-spec: "Stage-6 STYLE GUARD runs HARDER on GPT output (lower
   * thresholds)". GPT writes more AI-ish prose, so it gets a tighter leash at
   * render and a stricter gate here.
   *
   * Zero everywhere today. The knob exists because the harness will measure
   * whether any category needs slack, and discovering that is cheaper than
   * guessing it now. UNFITTED.
   */
  allowance: { gemini: 0, openai: 0, module_assembly: 0 },
};

/** Typographic characters rule 20 bans outright. Not data: rule 20 is locked. */
const BANNED_TYPOGRAPHY = [
  ['em-dash', '—'], ['en-dash', '–'],
  ['curly quote', '‘'], ['curly quote', '’'],
  ['curly quote', '“'], ['curly quote', '”'],
  ['ellipsis char', '…'],
];

/** CJK. Rule 23: hanzi you must READ is not allowed; prose is reading. */
const HANZI = /[㐀-䶿一-鿿]/u;

/**
 * Compiled once. A malformed pattern throws here, and the schema test catches it.
 *
 * `flags` defaults to case-insensitive because almost every banned word is banned
 * in any casing. An entry can override it, and one has to: see bare_polarity,
 * where case is the ONLY thing separating the ban from ordinary Indonesian.
 */
function compile(entries) {
  return entries.map((entry) => ({
    regex: new RegExp(entry.pattern, entry.flags || 'iu'),
    source: entry.pattern,
    note: entry.note,
  }));
}

const FORBIDDEN = Object.fromEntries(
  Object.entries(BLOCKLIST.forbidden_content)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, entries]) => [key, compile(entries)]),
);

const STYLE = Object.fromEntries(
  Object.entries(BLOCKLIST.style)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, entries]) => [key, compile(entries)]),
);

export const CATEGORIES = {
  forbidden: Object.keys(FORBIDDEN),
  style: Object.keys(STYLE),
};

/**
 * Every English term the reading is allowed to contain, derived from the
 * glossary's own name_en values rather than listed by hand.
 *
 * Rule 23 sanctions exactly one English use: the bracket after an Indonesian
 * name, once. Deriving the allowlist means a new glossary entry is sanctioned
 * automatically and a hand-maintained second list cannot drift from the first.
 */
function sanctionedBrackets() {
  const allowed = new Set();
  (function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.name_en === 'string') allowed.add(node.name_en.toLowerCase());
    if (typeof node.branch_name_en === 'string') allowed.add(node.branch_name_en.toLowerCase());
    for (const value of Object.values(node)) walk(value);
  }(GLOSSARY));
  return allowed;
}
const SANCTIONED = sanctionedBrackets();

const finding = (check, severity, message, where) => ({ check, severity, message, where });

/** Rule 25. Hard reject, no regeneration reasoning applied. */
export function forbiddenGuard(text) {
  const out = [];
  for (const [category, patterns] of Object.entries(FORBIDDEN)) {
    for (const { regex, source, note } of patterns) {
      const hit = regex.exec(text);
      if (hit) {
        out.push(finding(`forbidden.${category}`, 'hard',
          `matched /${source}/ at "${excerpt(text, hit.index)}" - ${note}`, null));
      }
    }
  }
  return out;
}

/**
 * @param {Object} rendered
 * @param {string} text the reading as one string, fact_ids EXCLUDED (ids carry
 *   hanzi legitimately and would trip the hanzi check on every correct reading)
 * @param {string} provider 'gemini' | 'openai' | 'module_assembly'
 */
export function styleGuard(rendered, text, provider = 'gemini') {
  const out = [];
  const allowance = STYLE_PARAMS.allowance[provider] ?? 0;

  for (const [name, char] of BANNED_TYPOGRAPHY) {
    const count = text.split(char).length - 1;
    if (count > 0) {
      out.push(finding('style.typography', 'soft',
        `${count} ${name}${count > 1 ? 's' : ''} in rendered text (rule 20)`, null));
    }
  }

  const hanzi = text.match(new RegExp(HANZI, 'gu'));
  if (hanzi) {
    out.push(finding('style.hanzi', 'soft',
      `Chinese characters in prose: ${[...new Set(hanzi)].join('')} (rule 23)`, null));
  }

  if (/\?/.test(text)) {
    out.push(finding('style.rhetorical_question', 'soft',
      'a question mark in the reading; rhetorical questions are banned everywhere', null));
  }

  for (const [category, patterns] of Object.entries(STYLE)) {
    const hits = [];
    for (const { regex, source } of patterns) {
      const hit = regex.exec(text);
      if (hit) hits.push({ source, at: excerpt(text, hit.index) });
    }
    if (hits.length > allowance) {
      out.push(finding(`style.${category}`, 'soft',
        hits.map((h) => `/${h.source}/ at "${h.at}"`).join('; '), null));
    }
  }

  out.push(...englishLeakage(text));
  return out;
}

/**
 * English leakage outside the sanctioned bracket terms.
 *
 * Two mechanical rules, no dictionary:
 *   1. Anything in parentheses must be a glossary name_en. That is the only
 *      sanctioned English, and it makes an unsanctioned parenthetical - an
 *      explanation, an aside, an invented translation - visible.
 *   2. A short list of English function words, which is what leakage actually
 *      looks like when a model drifts language mid-sentence.
 */
function englishLeakage(text) {
  const out = [];
  let prose = text;

  for (const match of text.matchAll(/\(([^)]{1,60})\)/g)) {
    const inner = match[1].trim().toLowerCase();
    if (SANCTIONED.has(inner)) {
      // Cut the sanctioned bracket out before scanning for leaked English.
      //
      // Rule 23's EN display layer means glossary terms carry English names, and
      // several are English SENTENCES' worth of function words - the archetype
      // brackets alone give "The Sun", "The Ocean". Scanning the raw text found
      // "the" inside "(The Sun)" and flagged a reading for obeying rule 23.
      // Measured 2026-08-02: 13 hits in the first live batch, all of this shape.
      prose = prose.replace(match[0], ' ');
      continue;
    }
    out.push(finding('style.unsanctioned_bracket', 'soft',
      `"(${match[1].trim()})" is not a glossary term; rule 23 allows the `
      + 'English bracket only as a citation of a name', null));
  }

  const leaked = ['the', 'your', 'you are', 'this is', 'which', 'because of',
    'however', 'therefore'].filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(prose));
  if (leaked.length) {
    out.push(finding('style.english_leakage', 'soft',
      `English in prose: ${leaked.join(', ')}`, null));
  }

  return out;
}

function excerpt(text, index) {
  return text.slice(Math.max(0, index - 10), index + 40).replace(/\s+/g, ' ').trim();
}
