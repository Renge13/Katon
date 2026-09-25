// ============================================================
// lib/validate/v2.js — the voice-v2 reviewer, deterministic half (D1-D4)
// ============================================================
// docs/content/voice-v2-spec-2026-09-24.md §4a. The v2 writer is FREE; this half
// catches only what code can catch without reading for meaning, and cannot
// hallucinate. The judge (J1-J4, `./judge.js`) runs after it.
//
//   D1 invented chart fact   a glossary TERM NAME in the prose that no supplied
//                            fact carries                                    hard
//   D2 missing critical fact a required point no block cites by fact_id     soft
//                            (its meaning's coverage is J4's call, not stems)
//   D3 form                  hanzi, typographic characters, percentages or
//                            scores; the existing pair checks (pair.js)     hard
//                            (typography is normalised first since 1.32.0,
//                            so its D3 line now only asserts that step)
//   D4 ethics lexicon        blocklist.json `fatalism`, `medical`, `financial`,
//                            `ranking`, `self_harm` and (pair) `verdict`     hard
//
// ── REMOVED FROM THE GATE, KEPT AS LOGGED METRICS (spec §4a) ──
// Every `style.*` category and stem-overlap coverage run exactly as in v1 and
// their findings are recorded at severity `flag`: they can never reject a v2
// reading. "If round 2 shows one of them is needed, it returns on that evidence."
//
// ── D4 COVERS ALL FIVE forbidden_content CATEGORIES (corrected 2026-09-24) ──
// The spec's D4 row first said verdict, fatalism, medical and financial "ONLY",
// which dropped `ranking` (CLAUDE.md rule 25) and `self_harm`. Built literally
// that way in 1.26.0 (both logged), flagged, and corrected by Reyner the same day:
// both are hard (spec §4a, CORRECTED 2026-09-24). STAGE6 1.28.0.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { structureGuard } from './structure.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { coverageGuard } from './coverage.js';
import { pairGuard } from './pair.js';
import { renderedText } from './text.js';
import { insertBrackets } from './brackets.js';
import { STAGE6_VERSION } from './index.js';
import { OPENING_FACT_ID } from '../render/pairOpening.js';
import BLOCKLIST from './blocklist.json' with { type: 'json' };

const HANZI = /[㐀-䶿一-鿿]/u;
const TYPOGRAPHY = /[—–‘’“”…]/u;
// A percentage, or a score-like "N/10". The engine never hands the writer a number
// meant for the reader (spec §2: "no percentages or scores").
const SCORE = /\d+(?:[.,]\d+)?\s*(?:%|persen\b)|\b\d+\s*\/\s*10\b/iu;
const D4_CATEGORIES = new Set(['fatalism', 'medical', 'financial', 'ranking', 'self_harm']);

const finding = (check, severity, message, where = null) => ({ check, severity, message, where });

/**
 * D4's verdict half, HARD, pair readings only. v1's `pair.verdict` runs the same
 * `blocklist.json#verdict.patterns` at FLAG severity and rejects nothing; the spec
 * makes them hard for v2. Compiled exactly as the gate compiles every pattern
 * (`new RegExp(pattern, flags || 'iu')`). Pair only: `cocok` in a mirror reading
 * ("cara yang cocok untukmu") is not a verdict about two people.
 */
function verdictHits(text) {
  return (BLOCKLIST.verdict?.patterns ?? [])
    .filter((e) => e?.pattern)
    .filter((e) => new RegExp(e.pattern, e.flags || 'iu').test(text))
    .map((e) => finding('v2.d4_verdict', 'hard', `/${e.pattern}/ - no overall verdict on the pair`));
}

/** Every glossary TERM a reader could take for a chart fact, name -> section. */
function termUniverse() {
  const out = new Map();
  const add = (section, name) => { if (name) out.set(name, section); };
  for (const section of ['aspek', 'bintang', 'kekuatan', 'relasi_cabang', 'pilar', 'kompatibilitas']) {
    for (const [key, cell] of Object.entries(GLOSSARY[section] || {})) {
      if (!key.startsWith('_')) add(section, cell?.name_id);
    }
  }
  add('palace', 'Fondasi Pasangan');
  return out;
}
const TERMS = termUniverse();

/** The term names the SUPPLIED facts carry, including both mirrors on a v2 pair. */
function suppliedTerms(semanticJson) {
  const facts = [
    ...(semanticJson.facts || []),
    ...(semanticJson.mirror?.a?.facts || []),
    ...(semanticJson.mirror?.b?.facts || []),
  ];
  const names = new Set();
  for (const f of facts) {
    if (f.label) names.add(f.label);
    if (f.palace) names.add(f.palace);
  }
  // The chart's own pillars are supplied by the chart itself: an hour-less chart
  // has no Pilar Arah, which is exactly the invention D1 must catch.
  const pillars = { year: 'Pilar Akar', month: 'Pilar Kerja', day: 'Pilar Diri', hour: 'Pilar Arah' };
  const charts = semanticJson.kind === 'pair' ? [] : [semanticJson.chart];
  for (const chart of charts) {
    for (const [pos, name] of Object.entries(pillars)) if (chart?.[pos]) names.add(name);
  }
  if (semanticJson.kind === 'pair') for (const name of Object.values(pillars)) names.add(name);
  if (semanticJson.core?.main_profile_display) names.add(semanticJson.core.main_profile_display);
  return names;
}

/**
 * D1. A term name in the prose that no supplied fact carries.
 *
 * Whole words, case-sensitive (a term is a proper name in the prose). A ONE-WORD
 * term at the start of a sentence is skipped: `Kuat` or `Lemah` opening a sentence
 * is ordinary Indonesian, not a strength verdict being claimed.
 *
 * SUPPLIED TERMS ARE MASKED FIRST. `Kuat` inside the supplied quadrant name
 * `Tarikan Kuat, Ritme Bergesek` is that name, not a strength claim - found on the
 * pair floor draft, the first run of this check.
 */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, (c) => `\\${c}`);
function inventedTerms(rawText, supplied) {
  const out = [];
  let text = rawText;
  for (const name of [...supplied].sort((a, b) => b.length - a.length)) {
    text = text.replace(new RegExp(escapeRe(name), 'gu'), (m) => ' '.repeat(m.length));
  }
  for (const [name, section] of TERMS) {
    if (supplied.has(name)) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'gu');
    for (const m of text.matchAll(re)) {
      const before = text.slice(0, m.index);
      if (!name.includes(' ') && /(^|[.!?]\s+|\n\s*)$/u.test(before)) continue;
      out.push(finding('v2.d1_invented_term', 'hard',
        `"${name}" (${section}) appears in the prose but no supplied fact carries it`));
      break;
    }
  }
  return out;
}

// ── FIX (i), ROUND 3: THE ARCHETYPE BRACKET IS THE ENGINE'S (STAGE6 1.31.0) ──
// Ruled by Reyner 2026-09-24 (docs/prompts/AC-qris-walk-voice-round3.md §B): "the
// archetype bracket comes from core.archetype_name_en". Round 2's v2 writer wrote
// "Embun (Water)", "Samudra (Air)", "Matahari (Bing)", "Taman (Ji)", "Embun (癸)",
// "Gunung (戊)", and "Kayu [Wood] dengan arketipe Bambu" (reports/voice-v2, run 2).
//
// v1 never had this problem because v1 never asks the model: `insertBrackets`
// (./brackets.js, Reyner's 2026-08-21 ruling) puts the engine's value on the first
// prose mention and replaces a wrong one. v2 did not run it. This runs THAT
// function, unchanged, scoped to the archetype(s) alone - the ruling names the
// archetype and nothing else, so Aspek and Bintang brackets stay the writer's.
//
// Three things v1's call does not need and v2's does:
//   - A PAIR NAMES TWO ARCHETYPES, `core.a` and `core.b`. v1's scope reads
//     `core.archetype_name_id`, which a pair does not have.
//   - THE PAIR OPENING IS NOT TOUCHED. `p0_opening` is Reyner's ruled sentence
//     ("Ini adalah bacaan tentang dua individu: Matahari dan Taman."), put in by the
//     engine; a first mention there would otherwise get the bracket inserted into
//     ruled text.
//   - A SQUARE-BRACKET GLOSS right after an archetype name ("Bambu [Bamboo]") is read
//     as that name's bracket, so it is replaced rather than followed by a second one.
//     Only after an archetype name: "Kayu [Wood]" is an element and stays as written.
//
// It changes what D3 accepts ("Matahari (丙)" carried hanzi and was a hard reject;
// the bracket is now the engine's), so it ships alone with its own bump.

/** The archetype(s) a payload names: the reader's on a mirror, both people's on a pair. */
function archetypeTerms(semanticJson) {
  const core = semanticJson.core || {};
  const people = semanticJson.kind === 'pair' ? [core.a, core.b] : [core];
  return people
    .filter((p) => p?.archetype_name_id && p?.archetype_name_en)
    .map((p) => ({ id: p.archetype_name_id, en: p.archetype_name_en }));
}

/**
 * Fix (i). Returns the rendering with every archetype bracket the engine's, plus
 * what was changed, for the log.
 */
function bracketArchetypes(rendered, semanticJson) {
  const terms = archetypeTerms(semanticJson);
  if (terms.length === 0) return { rendered, inserts: [], normalised: [] };
  const isOpening = (b) => (b.fact_ids || []).includes(OPENING_FACT_ID);
  const normalised = [];
  const squareToRound = (text) => {
    if (typeof text !== 'string') return text;
    let next = text;
    for (const t of terms) {
      next = next.replace(new RegExp(`${escapeRe(t.id)}(\\s*)\\[([^\\]]{1,60})\\]`, 'gu'), (m, space, inner) => {
        normalised.push({ term: t.id, kind: 'arketipe', en: t.en, was: `[${inner}]`, context: m });
        return `${t.id}${space}(${inner})`;
      });
    }
    return next;
  };
  let body = {
    ...rendered,
    blocks: (rendered.blocks || []).filter((b) => !isOpening(b)).map((b) => ({ ...b, text: squareToRound(b.text) })),
    penutup: squareToRound(rendered.penutup),
  };
  const inserts = [];
  // One call per person, so each is v1's function exactly, over a scope of one.
  for (const t of terms) {
    const r = insertBrackets(body, { core: { archetype_name_id: t.id, archetype_name_en: t.en }, facts: [] });
    body = r.rendered;
    inserts.push(...r.inserts);
    normalised.push(...r.normalised);
  }
  // Put the opening back where it was.
  const processed = [...body.blocks];
  const blocks = (rendered.blocks || []).map((b) => (isOpening(b) ? b : processed.shift()));
  return { rendered: { ...body, blocks }, inserts, normalised };
}

// ── FIX (ii), ROUND 3: TYPOGRAPHY IS NORMALISED, NOT REJECTED (STAGE6 1.32.0) ──
// Ruled by Reyner 2026-09-24 (docs/prompts/AC-qris-walk-voice-round3.md §B):
// "typography normalisation ... (em/en dashes, curly quotes, ellipsis; brackets that
// contain hanzi only). Deterministic, post-write."
//
// Typography was v2's leading rejection in round 2: 6 of 22 v2 drafts, every run-2
// hit U+2014, and it floored chart 1 (docs/qa/2026-09-24-voice-v2-renders-v1-v2.md).
// The characters are form, not meaning, and each has one keyboard equivalent, so the
// pipeline writes it rather than paying a regeneration to ask the model again.
//
// THE RULING SAYS "SAME AS v1", AND v1 DOES NOT DO THIS. Recorded so nobody goes
// looking for the v1 function: v1 REJECTS these characters (`style.typography` and
// `style.hanzi`, soft, lib/validate/style.js) and regenerates, with two
// regenerations to v2's one. v1's deterministic post-write step is insertBrackets,
// which fix (i) already reuses. This is new code, v2 only; v1 is unchanged.
//
// The substitutes: a dash becomes " - " (the glossary's own form, 12 uses, no
// em-dash); curly quotes become straight; the ellipsis becomes "...". A bracket
// that holds ONLY Chinese characters is removed with its leading space: it glosses
// a name with the hanzi rule 23 keeps out of prose. It runs AFTER fix (i), so an
// archetype's hanzi bracket has already become the engine's English one. Hanzi
// anywhere else is untouched and D3 still rejects it.
const TYPO_SUBSTITUTES = [
  [/[ \t]*[—–][ \t]*/gu, ' - ', 'dash'],
  [/[‘’]/gu, "'", 'curly quote'],
  [/[“”]/gu, '"', 'curly quote'],
  [/…/gu, '...', 'ellipsis'],
  [/[ \t]*[(（[][\s\u3000]*[㐀-䶿一-鿿][㐀-䶿一-鿿\s\u3000、，,·]*[)）\]]/gu, '', 'hanzi-only bracket'],
];

/** Fix (ii). Returns the rendering with typography normalised, plus what changed. */
function normaliseTypography(rendered) {
  const changes = [];
  const fix = (text) => {
    if (typeof text !== 'string') return text;
    let next = text;
    for (const [re, to, name] of TYPO_SUBSTITUTES) {
      next = next.replace(re, (m) => { changes.push({ name, was: m }); return to; });
    }
    return next;
  };
  return {
    rendered: {
      ...rendered,
      blocks: (rendered.blocks || []).map((b) => ({ ...b, heading: fix(b.heading), text: fix(b.text) })),
      penutup: fix(rendered.penutup),
    },
    changes,
  };
}

/**
 * The deterministic half of the v2 gate. Same result shape as `validateRendering`.
 *
 * @param {Object} rendered the parsed draft
 * @param {Object} semanticJson a v2 semantic JSON
 * @param {{provider?: string}} [options]
 */
export function validateRenderingV2(rendered, semanticJson, { provider = 'gemini' } = {}) {
  const metrics = {
    same_breath: [], coverage: [], block_chars: [], breaks_per_block: [], total_chars: [],
    brackets: [], bracket_inserts: 0, bracket_normalised: 0, paragraph_inserts: 0,
  };
  // Normalises paragraph breaks only; its own findings are LOGGED (structure rules
  // are style rules under v2).
  const { findings: structural, normalized: structured } = structureGuard(rendered, metrics);
  // Fix (i), before every check, so what is judged is what is served and cached.
  const { rendered: bracketed, inserts, normalised: fixedBrackets } = bracketArchetypes(structured, semanticJson);
  // Fix (ii), after fix (i), for the reason in its header.
  const { rendered: normalized, changes: typo } = normaliseTypography(bracketed);
  metrics.typography_normalised = typo.length;
  metrics.bracket_inserts = inserts.length;
  metrics.bracket_normalised = fixedBrackets.length;
  const bracketLog = [
    ...fixedBrackets.map((n) => finding('brackets.normalised', 'flag',
      `replaced "${n.was}" after arketipe "${n.term}" with "(${n.en})"`, [n.term])),
    ...inserts.map((i) => finding('brackets.inserted', 'flag',
      `inserted "(${i.en})" after arketipe "${i.term}": ...${i.context}...`, [i.term])),
    ...(typo.length ? [finding('typography.normalised', 'flag',
      typo.map((t) => `${t.name} "${t.was}"`).join('; '))] : []),
  ];
  const text = renderedText(normalized);

  const cited = new Set((normalized.blocks || []).flatMap((b) => b.fact_ids || []));
  const d2 = (semanticJson.required_points || [])
    .filter((p) => !cited.has(p.fact_id))
    .map((p) => finding('v2.d2_point_not_cited', 'soft',
      `required point ${p.fact_id} is not cited by any block`, p.fact_id));

  const d3 = [
    ...(HANZI.test(text) ? [finding('v2.d3_hanzi', 'hard', 'Chinese characters in the prose')] : []),
    ...(TYPOGRAPHY.test(text) ? [finding('v2.d3_typography', 'hard', 'a non-keyboard typographic character')] : []),
    ...(SCORE.test(text) ? [finding('v2.d3_score', 'hard', `a percentage or score: "${SCORE.exec(text)[0]}"`)] : []),
    // The existing pair checks, severities unchanged (spec: "existing pair.js").
    // Its `pair.verdict` is a FLAG in v1 and is replaced by D4's hard one below.
    ...pairGuard(normalized, semanticJson, text).filter((f) => f.check !== 'pair.verdict'),
  ];

  const forbidden = forbiddenGuard(text);
  const d4 = [
    ...forbidden.filter((f) => D4_CATEGORIES.has(f.check.replace('forbidden.', ''))),
    ...(semanticJson.kind === 'pair' ? verdictHits(text) : []),
  ];

  // ── LOGGED, NEVER GATING ─────────────────────────────────
  const logged = [
    ...forbidden.filter((f) => !D4_CATEGORIES.has(f.check.replace('forbidden.', ''))),
    ...styleGuard(normalized, text, provider, semanticJson),
    ...coverageGuard(normalized, semanticJson, metrics),
    ...structural,
  ].map((f) => ({ ...f, severity: 'flag', logged_from: f.severity })).concat(bracketLog);

  const findings = [...inventedTerms(text, suppliedTerms(semanticJson)), ...d2, ...d3, ...d4, ...logged];
  const failing = findings.filter((f) => f.severity !== 'flag');
  return {
    ok: failing.length === 0,
    hard: findings.some((f) => f.severity === 'hard'),
    findings,
    metrics,
    normalized,
    stage6_version: STAGE6_VERSION,
  };
}

/**
 * The v2 regeneration note: the rejecting findings, quoted, and nothing else.
 *
 * NOT v1's `stricterDirective`, whose templates restate v1's style rulebook - the
 * very rules v2 removed from the writer. The spec's regeneration is "the quotes fed
 * back" (§4b, J3), so the note is exactly that: what was wrong, in the reviewer's
 * own words, under the writer's unchanged prompt.
 *
 * @param {Array<Object>} findings
 * @returns {string} appended to the v2 writer prompt
 */
export function v2Directive(findings) {
  const rejecting = findings.filter((f) => f.severity !== 'flag');
  if (rejecting.length === 0) return '';
  const lines = rejecting.map((f) => (f.sentence
    ? `- "${f.sentence}": ${f.unsupported || f.message}`
    : `- ${f.message}`));
  return `\n\nYour previous draft was rejected by the reviewer for these reasons. Write the reading again, fixing them, under the same rules:\n${lines.join('\n')}\n`;
}
