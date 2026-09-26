// ============================================================
// Stage 6 — pair truths the engine can PROVE, checked hard
// ============================================================
// Prompt AG item 1 (Cowork, 2026-09-26; Reyner's MVP ruling, `docs/product/
// product-boundary-rulings-2026-09-26.md` item 5): "Engine-provable errors get
// hard deterministic checks on v1 and v2". These are the AF Q8 class (b) cases:
// a pair sentence that contradicts a field the engine wrote, so the verdict needs
// no model and no judgement, only the provenance.
//
// ── WHAT THESE CHECKS DO NOT TRY TO DO ─────────────────────
// They do not parse Indonesian. They look for one narrow shape each, and a
// sentence they cannot read is PASSED, never guessed at. A missed inversion costs
// one wrong sentence; a false rejection costs a reader her reading (the floor).
// Every loosening choice below leans that way on purpose:
//   - the side of a clause is read from PRONOUN markers first (kamu / dia and a
//     closed list of their -mu / -nya forms), never from a bare `\w+nya`, which
//     matches `biasanya` and `sebaliknya`;
//   - a clause with a negator anywhere before its verb is skipped;
//   - an element counts only when it is capitalised or follows `elemen` / `unsur`,
//     because `air` is also the everyday word for water.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { sentences } from './text.js';

const finding = (check, message, factIds = []) => ({
  check, message, fact_ids: factIds, where: null, severity: 'hard',
});

/** English engine element -> Indonesian display name (`Water` -> `Air`). */
const ELEMENT_ID = Object.fromEntries(
  Object.values(GLOSSARY.elemen).map((e) => [e.name_en, e.name_id]),
);
const ELEMENT_NAMES = Object.values(ELEMENT_ID);

// The reader and the other person. A CLOSED list of suffixed forms: an open
// `\w+mu` matches `ilmu` and an open `\w+nya` matches `biasanya`, and here a
// wrong side is a wrong verdict, not a quieter counter.
const A_WORDS = ['kamu', 'dirimu', 'milikmu', 'bagimu', 'padamu', 'kepadamu', 'denganmu', 'olehmu',
  'untukmu', 'unsurmu', 'elemenmu', 'energimu', 'baganmu', 'kursimu'];
const B_WORDS = ['dia', 'ia', 'dirinya', 'miliknya', 'baginya', 'padanya', 'kepadanya', 'dengannya',
  'olehnya', 'untuknya', 'unsurnya', 'elemennya', 'energinya', 'bagannya', 'kursinya'];
const SIDE_OF = new Map([...A_WORDS.map((w) => [w, 'a']), ...B_WORDS.map((w) => [w, 'b'])]);
const SIDE_WORD = new RegExp(`(?<![\\p{L}-])(${[...A_WORDS, ...B_WORDS].join('|')})(?![\\p{L}-])`, 'giu');

const NEGATOR = /(?<![\p{L}])(bukan|tidak|tak)(?![\p{L}])/iu;

/**
 * A sentence cut into clauses. A comma, semicolon, colon, dash or a contrastive
 * conjunction starts a new subject often enough that reading a subject across one
 * would be guessing.
 */
function clauses(sentence) {
  return sentence
    .split(/[,;:]|\s-\s|(?<![\p{L}])(?:sementara|sedangkan|tetapi|tapi|namun|dan|lalu|kemudian)(?![\p{L}])/iu)
    .map((c) => c.trim())
    .filter(Boolean);
}

/** Every side marker in `text`, in order: `{ side, index, end }`. */
function sideMarks(text, elementSides = null) {
  const marks = [];
  for (const m of text.matchAll(SIDE_WORD)) {
    marks.push({ side: SIDE_OF.get(m[1].toLowerCase()), index: m.index, end: m.index + m[0].length, pronoun: true });
  }
  if (elementSides) {
    for (const [name, side] of Object.entries(elementSides)) {
      for (const m of text.matchAll(new RegExp(`(?<![\\p{L}])${name}(?![\\p{L}])`, 'gu'))) {
        marks.push({ side, index: m.index, end: m.index + m[0].length, pronoun: false });
      }
    }
  }
  return marks.sort((x, y) => x.index - y.index);
}

/** The side a span names: pronouns first, element names only if no pronoun. */
function pick(marks, last) {
  const pronouns = marks.filter((m) => m.pronoun);
  const pool = pronouns.length ? pronouns : marks;
  if (!pool.length) return null;
  return (last ? pool[pool.length - 1] : pool[0]).side;
}

// ── p1: who produces / controls whom ──────────────────────────
// Verb forms that state a direction. The optional -mu / -nya on an active verb is
// its object (`menghidupinya`), and it is read as the patient.
const P1_VERBS = {
  produces: {
    active: /(?<![\p{L}])(?:(menghidupi|men[sy]uplai|menumbuhkan|menyuburkan)(mu|nya)?|memberi(?:kan)?(mu|nya)?\s+(?:energi|tenaga|makan)|mengalirkan\s+(?:energi|tenaga))(?![\p{L}])/giu,
    passive: /(?<![\p{L}])(?:dihidupi|disuplai|ditumbuhkan|disuburkan|diberi\s+(?:energi|tenaga|makan))(?![\p{L}])/giu,
  },
  controls: {
    active: /(?<![\p{L}])(mengontrol|mengendalikan|menekan|membatasi|menguasai|menjinakkan|meredam)(mu|nya)?(?![\p{L}])/giu,
    passive: /(?<![\p{L}])(?:dikontrol|dikendalikan|ditekan|dibatasi|dikuasai|dijinakkan|diredam)(?![\p{L}])/giu,
  },
};

/**
 * The giver a clause states for one verb match, or null when it cannot tell.
 * Active: subject before the verb gives. Passive: the side after it gives.
 */
function statedGiver(clause, match, passive, elementSides) {
  const before = clause.slice(0, match.index);
  const after = clause.slice(match.index + match[0].length);
  const subjectMarks = sideMarks(before, elementSides);
  const subject = pick(subjectMarks, true);
  if (!subject) return null;
  // A negator anywhere before the verb ("bukan dia yang menghidupi kamu") turns
  // the statement round; skip the clause rather than read it.
  if (NEGATOR.test(before)) return null;
  const suffix = !passive && (match[2] || match[3]);
  const object = suffix
    ? (suffix.toLowerCase() === 'mu' ? 'a' : 'b')
    : pick(sideMarks(after, elementSides), false);
  if (!object || object === subject) return null;
  return passive ? object : subject;
}

/** `a_produces_b` -> { kind: 'produces', giver: 'a' }. `same` -> null. */
function parseCycle(cycle) {
  const m = /^(a|b)_(produces|controls)_(a|b)$/u.exec(cycle || '');
  return m ? { giver: m[1], kind: m[2] } : null;
}

const WHO = { a: 'kamu', b: 'dia' };

function checkStemDirection(rendered, fact, out) {
  const cycle = parseCycle(fact.provenance?.cycle);
  if (!cycle) return;
  const aEl = ELEMENT_ID[fact.provenance?.a?.element];
  const bEl = ELEMENT_ID[fact.provenance?.b?.element];
  const elementSides = aEl && bEl && aEl !== bEl ? { [aEl]: 'a', [bEl]: 'b' } : null;
  const verbs = P1_VERBS[cycle.kind];

  for (const block of rendered.blocks || []) {
    if (!(block.fact_ids || []).includes('p1_stem_relation')) continue;
    for (const sentence of sentences(block.text)) {
      for (const clause of clauses(sentence)) {
        for (const [passive, re] of [[false, verbs.active], [true, verbs.passive]]) {
          for (const match of clause.matchAll(re)) {
            const giver = statedGiver(clause, match, passive, elementSides);
            if (giver && giver !== cycle.giver) {
              out.push(finding(
                'pair.stem_inverted',
                `"${clause}" - the engine says ${WHO[cycle.giver]} ${cycle.kind === 'produces' ? 'menghidupi' : 'mengontrol'} ${WHO[cycle.giver === 'a' ? 'b' : 'a']} (${fact.provenance.cycle}); the text states the reverse`,
                ['p1_stem_relation'],
              ));
            }
          }
        }
      }
    }
  }
}

// ── p3: who brings which element ──────────────────────────────
const GIVE = /(?<![\p{L}])(membawa(?:kan)?|memberi(?:kan)?(?:mu|nya)?|menyumbang(?:kan)?|men[sy]uplai|melengkapi(?:mu|nya)?|mengisi(?:mu|nya)?)(?![\p{L}])/giu;
const RECEIVE = /(?<![\p{L}])(menerima|mendapat(?:kan)?|memperoleh)(?![\p{L}])/giu;

/**
 * The element named as the object of a supply verb: within the next four words,
 * and either capitalised or introduced by `elemen` / `unsur`.
 *
 * THE SCAN STOPS AT A PREPOSITION. After `ke`, `kepada`, `bagi` and the rest
 * the element is the RECIPIENT, not what is brought: "Api milikmu memberi energi
 * ke Tanah miliknya" is a true p1 sentence and read without the stop it said
 * kamu brings Tanah. Caught by running the whole true S4 sample through the gate.
 */
function objectElement(after) {
  const words = after.trim().split(/\s+/u).slice(0, 5);
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i].replace(/[^\p{L}]+$/u, '');
    if (/^(ke|kepada|pada|bagi|untuk|dari|dengan|oleh)$/iu.test(w)) return null;
    const name = ELEMENT_NAMES.find((n) => n.toLowerCase() === w.toLowerCase());
    if (!name) continue;
    const introduced = i > 0 && /^(elemen|unsur)$/iu.test(words[i - 1]);
    if (introduced || w === name) return name;
  }
  return null;
}

function checkSupplyDirection(rendered, fact, out) {
  const supplies = fact.provenance?.supplies || [];
  if (supplies.length === 0) return;
  const supplied = Object.fromEntries(supplies.map((s) => [s.from, ELEMENT_ID[s.element]]));

  for (const block of rendered.blocks || []) {
    if (!(block.fact_ids || []).includes('p3_supply')) continue;
    for (const sentence of sentences(block.text)) {
      for (const clause of clauses(sentence)) {
        for (const [receives, re] of [[false, GIVE], [true, RECEIVE]]) {
          for (const match of clause.matchAll(re)) {
            const before = clause.slice(0, match.index);
            const marks = sideMarks(before);
            const subject = pick(marks, true);
            if (!subject) continue;
            if (NEGATOR.test(before)) continue;
            const element = objectElement(clause.slice(match.index + match[0].length));
            if (!element) continue;
            const giver = receives ? (subject === 'a' ? 'b' : 'a') : subject;
            const truth = supplied[giver];
            if (truth === element) continue;
            out.push(finding(
              'pair.supply_inverted',
              truth
                ? `"${clause}" - ${WHO[giver]} brings ${truth} (p3_supply), not ${element}`
                : `"${clause}" - the engine gives no element that ${WHO[giver]} brings (p3_supply)`,
              ['p3_supply'],
            ));
          }
        }
      }
    }
  }
}

/**
 * HARD. A block citing `p1_stem_relation` or `p3_supply` states the reverse
 * direction, or names an element that is not the one supplied in that direction.
 * One gate change (STAGE6 1.39.0): two check ids, one proposition - the direction
 * the engine wrote is the direction the reader is told.
 */
export function checkDirectionAndSupplier(rendered, semanticJson, out) {
  const byId = new Map((semanticJson.facts || []).map((f) => [f.id, f]));
  const p1 = byId.get('p1_stem_relation');
  const p3 = byId.get('p3_supply');
  if (p1) checkStemDirection(rendered, p1, out);
  if (p3) checkSupplyDirection(rendered, p3, out);
}
