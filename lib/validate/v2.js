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
//                            (since 1.34.0 only the v2CitedPointIds set:
//                            mirror identity facts; pair p2_day_pair, p5_pull_fit)
//   D3 form                  hanzi, typographic characters, percentages or
//                            scores; the existing pair checks (pair.js)     hard
//                            (typography is normalised first since 1.32.0,
//                            so its D3 line now only asserts that step)
//   D4 ethics lexicon        blocklist.json `fatalism`, `medical`, `financial`,
//                            `ranking`, `self_harm` and (pair) `verdict`     hard
//   fact.*                   v1's factGuard, since 1.36.0: six truth checks
//                            hard, the three voice checks logged      hard/flag
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
import { factGuard } from './fact.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { coverageGuard } from './coverage.js';
import { pairGuard } from './pair.js';
import { renderedText, renderedProse } from './text.js';
import { insertBrackets, insideOpenParen } from './brackets.js';
import { STAGE6_VERSION } from './index.js';
import { OPENING_FACT_ID } from '../render/pairOpening.js';
import { v2CitedPointIds } from '../semantic/index.js';
import BLOCKLIST from './blocklist.json' with { type: 'json' };

const HANZI = /[㐀-䶿一-鿿]/u;
const TYPOGRAPHY = /[—–‘’“”…]/u;
// A percentage, or a score-like "N/10". The engine never hands the writer a number
// meant for the reader (spec §2: "no percentages or scores").
const SCORE = /\d+(?:[.,]\d+)?\s*(?:%|persen\b)|\b\d+\s*\/\s*10\b/iu;
const D4_CATEGORIES = new Set(['fatalism', 'medical', 'financial', 'ranking', 'self_harm']);
// The factGuard checks that gate v2 (AD amendment 2, item 3). Every other fact.*
// check - today fact.palace_dropped, fact.strength_same_breath and
// fact.strength_bare_label - is logged at flag.
const V2_FACT_HARD = new Set([
  'fact.day_master', 'fact.strength_contradiction', 'fact.badge_invented',
  'fact.condition_named', 'fact.hour_known_contradiction', 'fact.relation_positions',
  // STAGE6 1.46.0 (Prompt AG item 1): main's 1.41.0 truth check, hard on both voices.
  'fact.element_dominance',
  // STAGE6 1.56.0 (Prompt AO §2): an Aspek at a pillar the engine does not place it.
  'fact.aspek_pillar',
]);

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
 * A SUPPLIED term written with "dan" in place of its comma IS that term (STAGE6
 * 1.53.0, Prompt AK §1, Cowork's ruling). rVe4ca floored twice on it: the writer
 * wrote the supplied quadrant "Tarikan Kuat, Ritme Seirama" as "Tarikan Kuat dan
 * Ritme Seirama", D1's mask of supplied names no longer matched, and the bare "Kuat"
 * was rejected as an invented strength term. The spelling is put back to the ruled
 * one and LOGGED (`terms.normalised`), the bracket normaliser's treatment - never a
 * rejection. ONLY for names this reading's facts supply: a "dan" spelling of a term
 * it was not given is left alone, so D1 still sees it.
 */
function normaliseSuppliedTermSpelling(rendered, semanticJson) {
  const changes = [];
  const variants = [...suppliedTerms(semanticJson)]
    .filter((name) => name.includes(', '))
    .map((name) => ({ term: name, dan: name.split(', ').join(' dan ') }));
  if (variants.length === 0) return { rendered, changes };
  const fix = (text) => {
    if (typeof text !== 'string') return text;
    let next = text;
    for (const v of variants) {
      next = next.replace(new RegExp(`(?<![\\p{L}])${escapeRe(v.dan)}(?![\\p{L}])`, 'gu'), (m) => {
        changes.push({ term: v.term, was: m });
        return v.term;
      });
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
function inventedTerms(rawText, supplied, { multiWordOnly = false, where = 'the prose' } = {}) {
  const out = [];
  let text = rawText;
  for (const name of [...supplied].sort((a, b) => b.length - a.length)) {
    text = text.replace(new RegExp(escapeRe(name), 'gu'), (m) => ' '.repeat(m.length));
  }
  for (const [name, section] of TERMS) {
    if (supplied.has(name)) continue;
    if (multiWordOnly && !name.includes(' ')) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'gu');
    for (const m of text.matchAll(re)) {
      const before = text.slice(0, m.index);
      if (!name.includes(' ') && /(^|[.!?]\s+|\n\s*)$/u.test(before)) continue;
      out.push(finding('v2.d1_invented_term', 'hard',
        `"${name}" (${section}) appears in ${where} but no supplied fact carries it`));
      break;
    }
  }
  return out;
}

/**
 * D1 in HEADINGS (STAGE6 1.54.0, Prompt AL §1, Cowork's technical ruling).
 * Headings are title case, so a capital letter in a heading is not evidence of a
 * term: "Tarikan Kuat dan Perbedaan Sudut Pandang" (PZ0t, round 4c) and
 * "Perspektif yang Berseberangan" (rVe4ca, round 4b) were both rejected for a
 * single capitalised word that no prose sentence used. In a heading, D1 fires only
 * on a complete MULTI-WORD glossary term name the engine did not supply. Prose is
 * read exactly as before. A name found in both is reported once.
 */
function inventedTermsD1(normalized, supplied) {
  const prose = inventedTerms(renderedProse(normalized), supplied);
  const seen = new Set(prose.map((f) => f.message.split('" (')[0]));
  const headings = (normalized.blocks || []).map((b) => b.heading).filter(Boolean).join('\n\n');
  const inHeadings = inventedTerms(headings, supplied, { multiWordOnly: true, where: 'a heading' })
    .filter((f) => !seen.has(f.message.split('" (')[0]));
  return [...prose, ...inHeadings];
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
//   - THE PAIR OPENING IS NOT TOUCHED. `p0_opening` is Reyner's ruled text - the
//     glossary cell `kompatibilitas.p0_opening` (docs/content/glossary.json; its
//     ruling is docs/content/compat-glossary-rulings-2.md), filled with the two
//     archetype names and put in by the engine. Not quoted here: it has been ruled
//     three times and a quote goes stale. A first mention there would otherwise get
//     the bracket inserted into ruled text.
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
      next = next.replace(new RegExp(`${escapeRe(t.id)}(\\s*)\\[([^\\]]{1,60})\\]`, 'gu'), (m, space, inner, offset, whole) => {
        // Inside an open parenthesis the gloss is REMOVED, never made round: round
        // there is a bracket inside a bracket (STAGE6 1.59.0, AS Amendment 1 §B).
        if (insideOpenParen(whole, offset)) {
          normalised.push({ term: t.id, kind: 'arketipe', en: null, was: `[${inner}]`, context: m, nested: true });
          return t.id;
        }
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
  // ── A MENTION ALREADY INSIDE PARENTHESES IS NOT BRACKETED (Prompt AJ §3) ──
  // Round 4 served "Sebagai Kayu (Bambu (The Bamboo))": the writer put the archetype
  // in parentheses after the element, and v1's insertBrackets bracketed that mention
  // because it was the first. Cowork's ruling: hide every archetype mention that sits
  // inside a parenthesis from the insertion, so the English goes on the first BARE
  // mention; with no bare mention nothing is inserted (the cover shows the English).
  // The writer's own parenthesis is restored exactly as written afterwards.
  const hidden = [];
  const hideInParens = (text) => (typeof text !== 'string' ? text : text.replace(/\(([^()]*)\)/gu, (m, inner) => {
    let next = inner;
    for (const t of terms) {
      next = next.replace(new RegExp(`(?<![\\p{L}])${escapeRe(t.id)}(?![\\p{L}])`, 'gu'), (x) => {
        hidden.push(x);
        return `${hidden.length - 1}`;
      });
    }
    return `(${next})`;
  }));
  const unhide = (text) => (typeof text !== 'string' ? text : text.replace(/(\d+)/gu, (m, i) => hidden[Number(i)]));
  body = {
    ...body,
    blocks: body.blocks.map((b) => ({ ...b, text: hideInParens(b.text) })),
    penutup: hideInParens(body.penutup),
  };
  const inserts = [];
  // One call per person, so each is v1's function exactly, over a scope of one.
  for (const t of terms) {
    const r = insertBrackets(body, { core: { archetype_name_id: t.id, archetype_name_en: t.en }, facts: [] });
    body = r.rendered;
    inserts.push(...r.inserts);
    normalised.push(...r.normalised);
  }
  body = { ...body, blocks: body.blocks.map((b) => ({ ...b, text: unhide(b.text) })), penutup: unhide(body.penutup) };
  // Put the opening back where it was.
  const processed = [...body.blocks];
  const blocks = (rendered.blocks || []).map((b) => (isOpening(b) ? b : processed.shift()));
  return { rendered: { ...body, blocks }, inserts, normalised };
}

// ── SQUARE-BRACKET GLOSSES ARE NORMALISED, NOT REJECTED (STAGE6 1.37.0) ──
// Prompt AD amendment 2, item 4 (Cowork, 2026-09-26): "remove the cause, no new
// gate". Round 3 served "Kayu [Wood]", "Logam [Metal]", "Simpul [Punishment]" and
// "Aspek Pemikir [Indirect Resource]" (reports/voice-v2/round3/chart13, chart8); the
// only thing that saw them was style.code_leak, logged at flag on v2.
//
// WHAT v1 DOES, for the record: nothing to square brackets except reject them
// (style.code_leak, soft, a regeneration). Its post-write step, insertBrackets
// (./brackets.js), handles ROUND brackets on rule 23's bound terms only - archetype,
// Aspek, Bintang (Reyner 2026-08-19; Pilar and Elemen explicitly not bound) - and
// replaces a wrong one with the engine's label_bracket.
//
// So the sanctioned form is that: a square gloss right after a supplied Aspek or
// Bintang name becomes "(label_bracket)", whatever English the writer put inside.
// Any other square English gloss - an element, a relation, a palace - has no
// sanctioned bracket under rule 23 and is removed with its leading space. The
// archetype's square gloss is fix (i)'s and has already become round by now.
const LATIN_GLOSS = /^[A-Za-z][A-Za-z '-]{0,58}$/u;

/** Supplied Aspek / Bintang names -> their label_bracket, both people on a pair. */
function boundGlosses(semanticJson) {
  const bound = new Set([
    ...Object.values(GLOSSARY.aspek || {}).map((e) => e?.name_id),
    ...Object.values(GLOSSARY.bintang || {}).map((e) => e?.name_id),
  ].filter(Boolean));
  const out = new Map();
  for (const f of [
    ...(semanticJson.facts || []),
    ...(semanticJson.mirror?.a?.facts || []),
    ...(semanticJson.mirror?.b?.facts || []),
  ]) {
    if (f.label && f.label_bracket && bound.has(f.label)) out.set(f.label, f.label_bracket);
  }
  return out;
}

/** Returns the rendering with every square English gloss normalised, plus what changed. */
function normaliseSquareGlosses(rendered, semanticJson) {
  const glosses = boundGlosses(semanticJson);
  // Longest first, so "Aspek Pengelola" is not matched as a shorter name's tail.
  const names = [...glosses.keys()].sort((a, b) => b.length - a.length);
  const changes = [];
  const fix = (text) => {
    if (typeof text !== 'string' || !text.includes('[')) return text;
    return text.replace(/[ \t]*\[([^\]\n]{1,60})\]/gu, (m, inner, offset, whole) => {
      if (!LATIN_GLOSS.test(inner.trim())) return m; // not an English gloss: left to D3 / the log
      const before = whole.slice(0, offset);
      const term = names.find((n) => before.endsWith(n));
      // ── NEVER A BRACKET INSIDE A BRACKET (STAGE6 1.59.0, AS Amendment 1 §B) ──
      // r5-05 was served "(Aspek Penantang (Seven Killings))" from the writer's
      // "(Aspek Penantang [Seven Killings])": the square gloss was made round inside the
      // open parenthesis. Inside one it is removed with its content, whatever the term.
      const to = term && !insideOpenParen(whole, offset) ? ` (${glosses.get(term)})` : '';
      changes.push({ term: term ?? null, was: m.trim(), to: to.trim() || null, nested: insideOpenParen(whole, offset) });
      return to;
    });
  };
  return {
    rendered: {
      ...rendered,
      blocks: (rendered.blocks || []).map((b) => ({ ...b, text: fix(b.text) })),
      penutup: fix(rendered.penutup),
    },
    changes,
  };
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

// ── THE CLOSING HEDGE IS DROPPED (STAGE6 1.55.0, Prompt AL §2) ──
// Reyner's B33 ("remove it"), made mechanical by his ruling recorded as B35
// (docs/content/voice-constraint-rulings-2026-09-26.md): the prompt route was tried
// twice (B31, B33) and "Mungkin menarik" stayed. If a block's (or the penutup's)
// FINAL sentence begins "Mungkin menarik untuk" or "Menarik untuk", sentence-initial,
// either case, that sentence is dropped as long as one sentence remains. No word is
// added or rewritten. The gate then re-runs on the result: if any check that rejects
// fires more often than it did on the original, the sentence is kept and
// `close.hedge_kept` is logged; otherwise `close.hedge_dropped`. The phrase opening a
// sentence mid-block is left alone and logged (`close.hedge_midblock`). v2 only; no
// blocklist entry and no ban, so nothing here can reject a reading.
const CLOSING_HEDGE = /^(?:mungkin\s+)?menarik\s+untuk(?![\p{L}\p{N}])/iu;
const SENTENCE_BREAK = /(?<=[.!?])\s+/gu;

/** Every hedge in the reading: the droppable final ones, and the mid-block ones. */
function closingHedges(rendered) {
  const units = [
    ...(rendered.blocks || []).map((b, i) => ({ at: i, text: b.text })),
    { at: 'penutup', text: rendered.penutup },
  ];
  const finals = [];
  const mids = [];
  for (const { at, text } of units) {
    if (typeof text !== 'string') continue;
    const body = text.trimEnd();
    const breaks = [...body.matchAll(SENTENCE_BREAK)];
    const starts = [0, ...breaks.map((m) => m.index + m[0].length)];
    starts.forEach((start, n) => {
      const sentence = body.slice(start, n + 1 < starts.length ? breaks[n].index : body.length);
      if (!CLOSING_HEDGE.test(sentence)) return;
      if (n === starts.length - 1 && n > 0) finals.push({ at, sentence, kept: body.slice(0, breaks[n - 1].index) });
      else if (n < starts.length - 1) mids.push({ at, sentence });
    });
  }
  return { finals, mids };
}

const withText = (rendered, at, text) => (at === 'penutup'
  ? { ...rendered, penutup: text }
  : { ...rendered, blocks: rendered.blocks.map((b, i) => (i === at ? { ...b, text } : b)) });

/** How many times each REJECTING check fired. */
const rejectingCounts = (result) => result.findings
  .filter((f) => f.severity !== 'flag')
  .reduce((m, f) => m.set(f.check, (m.get(f.check) || 0) + 1), new Map());
const breaksACheck = (before, after) => {
  const b = rejectingCounts(before);
  return [...rejectingCounts(after)].some(([check, n]) => n > (b.get(check) || 0));
};
const whereOf = (at) => (at === 'penutup' ? 'penutup' : `blocks[${at}]`);

/**
 * The deterministic half of the v2 gate. Same result shape as `validateRendering`.
 *
 * @param {Object} rendered the parsed draft
 * @param {Object} semanticJson a v2 semantic JSON
 * @param {{provider?: string}} [options]
 */
export function validateRenderingV2(rendered, semanticJson, options = {}) {
  let result = gateV2(rendered, semanticJson, options);
  const { finals, mids } = closingHedges(rendered);
  if (finals.length === 0 && mids.length === 0) return result;
  let current = rendered;
  const log = mids.map((h) => finding('close.hedge_midblock', 'flag',
    `left in place, not the final sentence of ${whereOf(h.at)}: "${h.sentence}"`, whereOf(h.at)));
  for (const h of finals) {
    const trial = withText(current, h.at, h.kept);
    const trialResult = gateV2(trial, semanticJson, options);
    if (breaksACheck(result, trialResult)) {
      log.push(finding('close.hedge_kept', 'flag',
        `kept, dropping it fails a rejecting check, in ${whereOf(h.at)}: "${h.sentence}"`, whereOf(h.at)));
      continue;
    }
    current = trial;
    result = trialResult;
    log.push(finding('close.hedge_dropped', 'flag', `dropped from ${whereOf(h.at)}: "${h.sentence}"`, whereOf(h.at)));
  }
  return { ...result, findings: [...result.findings, ...log] };
}

function gateV2(rendered, semanticJson, { provider = 'gemini' } = {}) {
  const metrics = {
    same_breath: [], coverage: [], block_chars: [], breaks_per_block: [], total_chars: [],
    brackets: [], bracket_inserts: 0, bracket_normalised: 0, paragraph_inserts: 0,
  };
  // Normalises paragraph breaks only; its own findings are LOGGED (structure rules
  // are style rules under v2).
  const { findings: structural, normalized: structured } = structureGuard(rendered, metrics);
  // Fix (i), before every check, so what is judged is what is served and cached.
  const { rendered: bracketed, inserts, normalised: fixedBrackets } = bracketArchetypes(structured, semanticJson);
  // Square glosses (1.37.0), after fix (i) has made the archetype's round.
  const { rendered: squared, changes: square } = normaliseSquareGlosses(bracketed, semanticJson);
  // Fix (ii), after fix (i), for the reason in its header.
  const { rendered: typed, changes: typo } = normaliseTypography(squared);
  // "dan" for a supplied term's comma (1.53.0), last, so D1 reads the ruled spelling.
  const { rendered: normalized, changes: termFixes } = normaliseSuppliedTermSpelling(typed, semanticJson);
  metrics.typography_normalised = typo.length;
  metrics.square_glosses_normalised = square.length;
  metrics.bracket_inserts = inserts.length;
  metrics.bracket_normalised = fixedBrackets.length;
  const bracketLog = [
    ...fixedBrackets.map((n) => finding('brackets.normalised', 'flag',
      n.nested
        ? `removed "${n.was}" after arketipe "${n.term}": inside a parenthesis, round would nest`
        : `replaced "${n.was}" after arketipe "${n.term}" with "(${n.en})"`, [n.term])),
    ...inserts.map((i) => finding('brackets.inserted', 'flag',
      `inserted "(${i.en})" after arketipe "${i.term}": ...${i.context}...`, [i.term])),
    ...square.map((s) => finding('brackets.square_normalised', 'flag',
      s.to ? `replaced "${s.was}" after "${s.term}" with "${s.to}"`
        : s.nested ? `removed "${s.was}"${s.term ? ` after "${s.term}"` : ''}: inside a parenthesis, round would nest`
          : `removed "${s.was}" (no sanctioned bracket)`,
      s.term ? [s.term] : null)),
    ...(typo.length ? [finding('typography.normalised', 'flag',
      typo.map((t) => `${t.name} "${t.was}"`).join('; '))] : []),
    ...termFixes.map((t) => finding('terms.normalised', 'flag', `replaced "${t.was}" with the supplied "${t.term}"`, [t.term])),
  ];
  const text = renderedText(normalized);

  const cited = new Set((normalized.blocks || []).flatMap((b) => b.fact_ids || []));
  // D2 checks the smaller set since 1.34.0 (AD amendment 1, item 2): the mirror's
  // three identity facts, a pair's p2_day_pair and p5_pull_fit. The other required
  // points stay in the payload for the floor and the writer; see v2CitedPointIds.
  const mustCite = v2CitedPointIds(semanticJson);
  const d2 = (semanticJson.required_points || [])
    .filter((p) => mustCite.has(p.fact_id))
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

  // ── factGuard ON v2 (STAGE6 1.36.0; Prompt AD amendment 2, item 3) ──
  // v1's deterministic truth checks, which v2 never ran (v2.js was created without
  // them in d23dc24; spec §4a does not list them). Six gate at hard, as in v1; the
  // three that police voice rather than truth (rule 21's same-breath, the palace
  // per block) are LOGGED, per Reyner's B18 / B20.
  const facts = factGuard(normalized, semanticJson, text, metrics).map((f) => (
    V2_FACT_HARD.has(f.check) ? f : { ...f, severity: 'flag', logged_from: f.severity }));

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

  const findings = [...inventedTermsD1(normalized, suppliedTerms(semanticJson)), ...d2, ...d3, ...d4, ...facts, ...logged];
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
