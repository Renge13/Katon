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
//   D4 ethics lexicon        blocklist.json `fatalism`, `medical`, `financial`
//                            and (pair) `verdict` ONLY                       hard
//
// ── REMOVED FROM THE GATE, KEPT AS LOGGED METRICS (spec §4a) ──
// Every `style.*` category and stem-overlap coverage run exactly as in v1 and
// their findings are recorded at severity `flag`: they can never reject a v2
// reading. "If round 2 shows one of them is needed, it returns on that evidence."
//
// ── D4 IS LITERAL, AND THAT HAS A CONSEQUENCE ─────────────
// The spec names verdict, fatalism, medical and financial "ONLY". blocklist.json's
// `forbidden_content` also carries `ranking` (CLAUDE.md rule 25: no ranking of gods
// or strength states) and `self_harm`. Under v2 those two are LOGGED, not gating -
// the judge is the reviewer for them now. Flagged to Reyner rather than decided.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { structureGuard } from './structure.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { coverageGuard } from './coverage.js';
import { pairGuard } from './pair.js';
import { renderedText } from './text.js';
import { STAGE6_VERSION } from './index.js';
import BLOCKLIST from './blocklist.json' with { type: 'json' };

const HANZI = /[㐀-䶿一-鿿]/u;
const TYPOGRAPHY = /[—–‘’“”…]/u;
// A percentage, or a score-like "N/10". The engine never hands the writer a number
// meant for the reader (spec §2: "no percentages or scores").
const SCORE = /\d+(?:[.,]\d+)?\s*(?:%|persen\b)|\b\d+\s*\/\s*10\b/iu;
const D4_CATEGORIES = new Set(['fatalism', 'medical', 'financial']);

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
  const { findings: structural, normalized } = structureGuard(rendered, metrics);
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
  ].map((f) => ({ ...f, severity: 'flag', logged_from: f.severity }));

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
