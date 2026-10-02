// ============================================================
// Stage 6 — FACT GUARD (hard reject)
// ============================================================
// The text may not contradict the semantic JSON. Everything checked here is a
// claim about what is TRUE, which makes it the rule-14 boundary in enforcement
// form: the engine decided these, so the renderer disagreeing with one is not a
// style slip and does not get a regeneration on style grounds.
//
// Every check is scoped as narrowly as it can be. `kuat` is an ordinary
// Indonesian adjective and `bulan` is an ordinary noun; a whole-text keyword
// sweep for either would reject correct readings constantly. So verdict and
// position checks run INSIDE the block that cites the relevant fact, where the
// words can only mean what the fact means.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { stemOverlap, sentences } from './text.js';
import { clauses, namedSide, nameSides } from './pairTruth.js';
import { aspekOccurrences } from '../semantic/facts.js';

/**
 * UNFITTED, all of them (rule 13's discipline: one change, one measurement).
 * scripts/measure-stage6.mjs reports the observed distribution per check so
 * these get set from data. Do not tune two at once.
 */
export const FACT_PARAMS = {
  /**
   * Share of a verdict's label_meaning stems that must appear in the block
   * carrying the verdict word. Rule 21's "same breath", made mechanical.
   *
   * Low on purpose. The prompt REQUIRES rewriting in the renderer's own words,
   * so a high bar would reject good paraphrase and reward transcription - which
   * is precisely the run-2 failure. This asks only that the explanation is
   * recognisably present.
   */
  sameBreathOverlap: 0.25,

  /** Distinctive stems the block must share with label_meaning, minimum. */
  sameBreathMinHits: 2,
};

const VERDICT_WORDS = { weak: 'lemah', balanced: 'seimbang', strong: 'kuat' };

/**
 * The first use of a verdict word AS A VERDICT, skipping adjectival uses.
 *
 * `yang kuat` modifies whatever precedes it - "Aspek Pelindung yang kuat" is an
 * ordinary Indonesian noun phrase and claims nothing about the strength verdict. Every
 * other occurrence is treated as a verdict use, which keeps the check narrow in the one
 * direction that matters: it may miss a strange phrasing, and it will not reject
 * ordinary prose.
 *
 * SCANS ON rather than bailing at the first hit. Returning null on an adjectival use
 * would let one early "yang kuat" hide a genuinely bare label later in the same block.
 *
 * @returns {{index: number, 0: string}|null} a RegExp-exec-shaped match, or null
 */
function verdictUse(text, word) {
  const re = new RegExp(`\\b${word}\\b`, 'gi');
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (/\byang\s+$/i.test(text.slice(0, m.index))) continue;
    return m;
  }
  return null;
}

/**
 * Words that may stand between a subject and its verdict word without changing
 * whose verdict it is: copulas, classifiers and degree adverbs. "Kamu tergolong
 * kuat", "Bagan kamu termasuk Kuat", "Gunung ini sangat lemah".
 */
const VERDICT_LINKS = new Set([
  'adalah', 'ialah', 'merupakan', 'itu', 'ini', 'termasuk', 'tergolong', 'terbilang',
  'terhitung', 'sangat', 'cukup', 'terlalu', 'amat', 'begitu', 'lebih', 'paling',
  'relatif', 'cenderung', 'memang', 'justru', 'sebenarnya', 'sesungguhnya', 'sudah',
  'telah', 'tetap', 'pun', 'masih', 'jadi', 'menjadi', 'agak',
]);
/** Words that turn a verdict word into its denial: not a claim of that verdict. */
const VERDICT_NEGATORS = new Set(['tidak', 'tak', 'bukan', 'kurang', 'belum']);
/** Joins that pair two poles ("kuat maupun lemah"), which is not a claim of either. */
const VERDICT_POLES = new Set(['maupun', 'atau', 'ataupun']);

/**
 * Who a strength verdict can be about: the reader words, and her Day Master element
 * and archetype name as the ENGINE names them, never a hand list.
 *
 * @param {Object} semantic Stage 3 output
 * @returns {{words: Set<string>, archetype: string[]}}
 */
function verdictSubjects(semantic) {
  const words = new Set(['kamu', 'baganmu', 'dirimu']);
  const element = String(semantic.core?.element || '').toLowerCase();
  if (element) { words.add(element); words.add(`${element}mu`); }
  // The archetype as the reader meets it: its English title since G1 (2026-10-02),
  // minus the article, which is not a name.
  const archetype = String(semantic.core?.archetype_name_en || '').toLowerCase().split(/\s+/u)
    .filter((w) => w && w !== 'the');
  return { words, archetype };
}

/**
 * Is some occurrence of `word` in `text` a verdict predicated of HER?
 *
 * Walks back from the word, over VERDICT_LINKS only, to the first other token. It is
 * a claim when that token is a subject (a multi-word archetype is matched whole). It
 * is not when the walk meets a negator, a pole join, a clause break (a token ending
 * in punctuation) or any other word, which is then what the verdict word modifies.
 */
function verdictPredicatedOfHer(text, word, { words, archetype }) {
  const s = String(text || '');
  const re = new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, 'giu');
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const before = s.slice(0, m.index).split(/\s+/u).filter(Boolean);
    // "kuat maupun lemah": the word is one of two poles, not a claim of either.
    const next = s.slice(m.index + m[0].length).trimStart().split(/\s+/u)[0] || '';
    if (VERDICT_POLES.has(next.toLowerCase().replace(/[^\p{L}]/gu, ''))) continue;
    for (let i = before.length - 1, hops = 0; i >= 0 && hops < 4; i -= 1, hops += 1) {
      const raw = before[i];
      if (/[^\p{L}]$/u.test(raw)) break; // a clause break: whatever came before is another clause
      const token = raw.replace(/^[^\p{L}]+/u, '').toLowerCase();
      if (VERDICT_NEGATORS.has(token) || VERDICT_POLES.has(token)) break;
      if (words.has(token)) return true;
      if (archetype.length && token === archetype[archetype.length - 1]) {
        const tail = before.slice(i - archetype.length + 1, i + 1)
          .map((t) => t.replace(/[^\p{L}]/gu, '').toLowerCase());
        if (tail.join(' ') === archetype.join(' ')) return true;
      }
      if (!VERDICT_LINKS.has(token)) break;
    }
  }
  return false;
}

/**
 * Palace display name -> the display name of that palace's BRANCH, where one
 * exists. Derived from GLOSSARY.pilar, which is the authority for the pairing.
 *
 * Today this holds exactly one entry, `Pilar Diri` -> `Fondasi Pasangan`, because
 * the day pillar is the only one whose branch is named separately. Derived rather
 * than hardcoded so a future branch name is picked up without editing this file.
 */
const BRANCH_ALIAS = new Map(
  Object.values(GLOSSARY.pilar || {})
    .filter((p) => p?.name_id && p?.branch_name_id)
    .map((p) => [p.name_id, p.branch_name_id]),
);

const branchAliasFor = (palace) => BRANCH_ALIAS.get(palace) ?? null;

/** Indonesian words that name a pillar, and the position each maps to. */
const POSITION_WORDS = {
  tahun: 'year', bulan: 'month', hari: 'day', jam: 'hour',
};

/**
 * Constructions in which a pillar word is NOT a span statement, and which
 * renderer-prompt.txt itself requires or encourages. Stripped before the bare-word
 * scan below; see checkRelationPositions for why.
 *
 *   1. A PART of a pillar rather than the pillar. renderer-prompt §THE PALACES AND
 *      THE PARTS, line ~76: 'Always pair the part with the pillar: "batang bulan",
 *      "cabang hari", "batang jam"'. `pilar` is here too because §PROVENANCE IS NOT
 *      ARITHMETIC lists "ini datang dari pilar harimu" as encouraged. The trailing
 *      \w* carries the possessive: the prompt's own example is "cabang bulanmu".
 *   2. The Day Master idiom. Same section lists "hari lahirmu unsur Api" as
 *      encouraged, and real readings open blocks with it.
 *   3. THE CALENDAR-UNIT SENSES (added 2026-08-12, round 4 of one root cause).
 *      `tahun/bulan/hari/jam` are the ordinary Indonesian words for year, month,
 *      day and hour, so most of their occurrences measure TIME and say nothing
 *      about a chart position. Three classes, and they are classes rather than an
 *      idiom list on purpose - see below.
 *
 * ── WHY CLASSES AND NOT AN IDIOM LIST ──────────────────────
 * This check has now cost work four times and every previous round patched one
 * SURFACE FORM of the same root cause: rounds 1-2 scoped the prompt's own mandated
 * phrasings, round 3 (2026-08-11) made the scan whole-token after `kehidupan
 * sehari-hari` raised a HARD finding on ordinary Indonesian, and round 4 was
 * `di kemudian hari` in a ruled glossary string. A list of three idioms would have
 * been round 5 waiting to happen.
 *
 * So the patterns were derived from EVIDENCE, not from memory of Indonesian: the
 * whole glossary and renderer-prompt.txt were swept through this exact stripping
 * plus PILLAR_TOKEN, and every surviving token was read in context. Eight survived,
 * and NONE of them was a span statement:
 *
 *   bulan ini            aspek.正財, elemen_dominan.controls   (calendar deictic)
 *   tujuh hari           bintang.文昌                          (counted duration)
 *   enam bulan ke depan  kekuatan.balanced                     (counted duration)
 *   satu hari seminggu   elemen_dominan.drains                 (counted duration)
 *   di jam yang sama     elemen_hilang.土                      (clock time)
 *   bulan Ayam / tahun Ular   renderer-prompt.txt              (NOT stripped - see below)
 *
 * ── THE EXPOSURE CONDITION, MEASURED RATHER THAN ASSUMED ───
 * The first draft of this comment said any reading braiding one of those cells with
 * a relation fact was a hard finding waiting to happen. THAT IS FALSE, and measuring
 * it is what showed so: with the span stated correctly, a calendar unit changes
 * nothing (0 of 108 combinations), because gate 1.4.0 dropped the `extra` condition
 * and an unexpected position is no longer evidence.
 *
 * It fires only when the block does NOT state the span AND a calendar unit appears:
 * the scan then has something to name, so `named.size === 0` no longer skips, and
 * the real span is reported as dropped. Measured over 13 fixture charts plus the
 * hour-less chart, every relation fact against each of the six live cells:
 * **108 of 108 HARD before this fix, 0 of 108 after.**
 *
 * That shape is not hypothetical - IT IS THE FLOOR, for every relation fact. A
 * relation carries no `fact.palace` (its span lives in `provenance.positions_id`)
 * and `assembleFallback` prints only `fact.palace`, so the floor never states a
 * relation's span. The check was blind to that because nothing was named; a calendar
 * unit made it visible and then mis-described it as "the text names [day]".
 * **The floor gap is REAL, PRE-EXISTING and NOT FIXED HERE** - it is recorded in
 * PROGRESS. What is fixed here is the check reading a calendar unit as a pillar.
 *
 * ── WHAT IS DELIBERATELY NOT STRIPPED, AND WHY STRIPPING CAN BACKFIRE ──
 * `bulan Ayam` and `tahun Ular` - the prompt's own encouraged phrasing - DO name a
 * pillar, by its animal. They stay.
 *
 * That is not a nicety. Stripping only ever REMOVES a position from `named`, and
 * `missing` is computed from what is named, so stripping a construction that
 * genuinely names a pillar MOVES IT INTO `missing` and makes the check fire where
 * it used to pass. A braided block reading "Pilar Akar ... bulan Ayam" for a
 * [year, month] span passes today and would fail if the zodiac form were stripped.
 * Strip only what CANNOT be a chart reference.
 */
const NOT_A_SPAN = [
  /\b(batang|cabang|pilar)\s+(tahun|bulan|hari|jam)\w*/gi,
  /\bhari\s+lahir\w*/gi,
  // A COUNTED duration. `belas` and `puluh` stand alone so "dua belas bulan"
  // strips on "belas bulan" and the leading numeral is harmless on its own.
  /\b(?:\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|belas|puluh|beberapa|banyak|tiap|setiap|sekali|separuh)\s+(?:tahun|bulan|hari|jam)\w*/gi,
  // A calendar deictic: the unit followed by a pointer at a time, not a pillar.
  /\b(?:tahun|bulan|hari|jam)\s+(?:ini|itu|depan|lalu|berikutnya|sebelumnya|esok|kemarin|yang)\b/gi,
  // A temporal pre-modifier: `kemudian hari`, `suatu hari`, `sepanjang hari`.
  /\b(?:kemudian|suatu|sepanjang|selama|sisa|akhir|awal|pertengahan|belakangan)\s+(?:tahun|bulan|hari|jam)\w*/gi,
];

/**
 * A pillar word, alone, carrying at most an Indonesian possessive clitic.
 *
 * ── WHY THIS IS A WHOLE-TOKEN TEST AND NOT A REGEX ─────────
 * The scan used to be `new RegExp('\\b' + word, 'i')`: a LEADING boundary and no
 * trailing one, so any word that merely STARTS with a pillar word matched it.
 * `jam` claimed "jaminan", `bulan` claimed "bulanan", `tahun` claimed "tahunan".
 * Observed 2026-08-11 on `kehidupan sehari-hari`, where the check reported a
 * 半合 as naming [day] and dropping [year, hour, month] - a HARD finding on
 * ordinary Indonesian that says nothing about any pillar.
 *
 * Adding a trailing `\b` does NOT fix it. A hyphen is itself a word boundary, so
 * `\bhari\b` still matches the second half of `sehari-hari`, and it would also
 * break the possessives the check must keep seeing (`harimu`, `bulannya`).
 *
 * So the text is split on whitespace and each token is matched WHOLE. A
 * hyphenated compound is one token and therefore cannot be entered halfway, and
 * a suffixed noun like `bulanan` is simply a different token. Edge punctuation is
 * trimmed so `hari,` and `(bulan)` still count; internal characters are not, so
 * `sehari-hari` stays intact.
 *
 * The clitics are the three that attach to a bare noun: -mu, -nya, -ku. They are
 * enumerated rather than globbed, because `\w*` is what caused this bug.
 *
 * ── REDUPLICATION IS A REAL REFERENCE ──────────────────────
 * Indonesian pluralises by repeating the noun, so `hari-hari`, `bulan-bulan`,
 * `tahun-tahun` and `jam-jam` genuinely name their pillar and must match. The
 * `(?:-\1)?` backreference is what separates them from `sehari-hari`: the
 * repetition must be of the SAME word and the token must START with it, so a
 * prefixed form never qualifies. `berhari-hari` ("for days on end") is excluded
 * by the same property, which is right - it is a duration, not a pillar.
 *
 * A clitic may follow the reduplication (`hari-harinya`, `tahun-tahunku`), so
 * the suffix group sits outside the repetition rather than inside it.
 */
const PILLAR_TOKEN = /^(tahun|bulan|hari|jam)(?:-\1)?(?:mu|nya|ku)?$/i;

/** Positions named by a bare pillar word somewhere in `text`. */
function positionWordsIn(text) {
  const found = new Set();
  for (const raw of String(text).split(/\s+/)) {
    // Trim non-letters from the ENDS only. Anything internal - a hyphen above
    // all - is part of the token and must stay.
    const token = raw.replace(/^[^\p{L}]+/u, '').replace(/[^\p{L}]+$/u, '');
    const hit = PILLAR_TOKEN.exec(token);
    if (hit) found.add(POSITION_WORDS[hit[1].toLowerCase()]);
  }
  return found;
}

const finding = (check, message, where) => ({
  check, severity: 'hard', message, where,
});

/** Blocks that cite a given fact id. */
function blocksCiting(rendered, factId) {
  return (rendered.blocks || []).filter((b) => (b.fact_ids || []).includes(factId));
}

/**
 * The strength verdict, both directions.
 *
 * (a) CONTRADICTION: the JSON says weak and the text says kuat. Checked inside
 *     the strength block, plus two whole-text patterns that can only be verdict
 *     claims ("Kamu Lemah", "Api Kuat") and would otherwise escape by appearing
 *     in a block that did not cite the fact.
 * (b) SAME BREATH: rule 21 and glossary.kekuatan._note. `label` and
 *     `label_meaning` ship as separate JSON fields, so emitting the label bare
 *     is mechanically possible and nothing upstream can prevent it.
 */
function checkStrength(rendered, semantic, out, metrics) {
  const fact = (semantic.facts || []).find((f) => f.provenance?.kind === 'strength');
  if (!fact) return;

  const verdict = fact.provenance.verdict;
  const own = VERDICT_WORDS[verdict];
  const others = Object.entries(VERDICT_WORDS)
    .filter(([k]) => k !== verdict)
    .map(([, word]) => word);

  // ── THE SUBJECT IS THE READER, NEVER AN ELEMENT ───────────
  // CORRECTED 2026-08-21. This was `\b(kamu|<element>)\s+<wrong>\b`, and the element
  // half made it fire on ELEMENT-DISTRIBUTION prose. Reproduced from fresh-1996's own
  // semantic JSON, whose Day Master element is Air and whose verdict is `strong`:
  //
  //   "Unsur Air seimbang dengan Logam di baganmu."   -> read as claiming "Seimbang"
  //   "Air seimbang, jadi arahmu jelas."              -> same
  //
  // Both are statements about how much of an element is present, and the engine
  // SUPPLIES that distribution in `chart.element_presence`. CLAUDE.md rules 9 and 10
  // are explicit that the bars are a display distribution and NEVER a strength score,
  // so a check that reads "<element> seimbang" as a strength verdict is making exactly
  // the conflation the engine forbids - and it fires hardest on a chart whose verdict
  // is strong or weak, because then "seimbang" is a "wrong" word for it.
  //
  // The verdict is a claim about HER. So the subject list is reader words only. "Api
  // Kuat" as a verdict claim is a real shape and is now caught by the citing-block pass
  // below instead, which is where a verdict claim belongs anyway.
  const READER_SUBJECTS = ['kamu', 'baganmu', 'dirimu'];
  for (const wrong of others) {
    const asVerdict = new RegExp(`\\b(${READER_SUBJECTS.join('|')})\\s+${wrong}\\b`, 'i');
    for (const block of rendered.blocks || []) {
      if (asVerdict.test(block.text)) {
        out.push(finding('fact.strength_contradiction',
          `the chart is "${verdict}" but the text states "${wrong}"`, block.fact_ids));
      }
    }
  }

  // ── THE VERDICT, NOT THE WORD (STAGE6 1.58.0, Prompt AS §3) ──
  // This pass flagged ANY wrong verdict word anywhere in a block citing the strength
  // fact, on the assumption that a strength block talks only about strength. v2 merges
  // facts into one block (day master + strength + main profile), so every ordinary
  // "kuat" in it became a verdict. Round 5 had six firings and all six were that:
  // "kehadiran kuat", "tarikan kuat", "berakar kuat", "mengalir kuat", and "posisimu
  // tidak ekstrem kuat maupun lemah", which states balanced CORRECTLY. They caused
  // both round-5 floors (tests/fixtures/strength-contradiction-r5.json).
  //
  // A wrong word now counts only when it is PREDICATED OF HER: its subject, reached
  // back through copulas and degree words only, is a reader word, her Day Master
  // element or her archetype name (both read from the engine's `core`). A negator on
  // the way ("tidak", "bukan", "kurang") or a clause break means it is not a claim.
  // Everything else is the word modifying another noun or verb, which is ordinary
  // Indonesian and says nothing about the verdict.
  const subjects = verdictSubjects(semantic);
  const blocks = blocksCiting(rendered, fact.id);
  for (const block of blocks) {
    for (const wrong of others) {
      if (verdictPredicatedOfHer(block.text, wrong, subjects)) {
        out.push(finding('fact.strength_contradiction',
          `the strength block names "${wrong}" but the verdict is "${verdict}"`, block.fact_ids));
      }
    }

    // ── "yang kuat" IS AN ADJECTIVE, NOT THE VERDICT ────────
    // CORRECTED 2026-08-21. This took the FIRST occurrence of the verdict word and
    // demanded the label_meaning beside it. Reproduced from paid prose - the single
    // `fact.strength_same_breath` in the 77-attempt trace fired on:
    //
    //   "Kamu adalah seorang Samudra dengan Aspek Pelindung (Direct Resource) yang kuat."
    //
    // where `kuat` modifies the ASPEK. Ordinary Indonesian, no verdict claimed, and the
    // check then demanded the strength meaning turn up next to it. That is the failure
    // class PROGRESS records for this family: a check bans a TOKEN where the defect is a
    // CONSTRUCTION, and the presumption when it rejects a legitimate string is that the
    // CHECK is wrong. Same shape as the `mungkin` fix, which replaced a blocklist token
    // with a clause-subject test.
    //
    // So an occurrence preceded by `yang` is skipped and the scan continues, rather than
    // bailing out. Bailing would have been the other bug: one adjectival use early in a
    // block would hide a genuinely bare label later in it.
    const match = verdictUse(block.text, own);
    if (!match) continue;

    // The explanation must land in the same block, and something must follow the
    // label. renderer-prompt: "Never leave a blunt label sitting alone at the end
    // of a sentence, a block, or a paragraph."
    const after = block.text.slice(match.index + match[0].length);
    if (sentences(after).length === 0) {
      out.push(finding('fact.strength_bare_label',
        `"${own}" is the last thing in its block; the resolution never arrives`,
        block.fact_ids));
      continue;
    }

    const overlap = stemOverlap(fact.label_meaning, block.text);
    // Recorded whether it passes or fails. The threshold is UNFITTED, so the
    // harness needs the DISTRIBUTION, not just the rejections - a threshold set
    // from failures alone cannot tell "nothing is near the line" from "half the
    // corpus is one stem away from it".
    metrics?.same_breath.push({ ratio: overlap.ratio, hits: overlap.hits, total: overlap.total });
    if (overlap.ratio < FACT_PARAMS.sameBreathOverlap
        && overlap.hits < FACT_PARAMS.sameBreathMinHits) {
      out.push(finding('fact.strength_same_breath',
        `"${own}" appears without the substance of its meaning `
        + `(${overlap.hits}/${overlap.total} stems)`, block.fact_ids));
    }
  }
}

/**
 * Claims that the birth hour is unknown. Only ever consulted when it IS known.
 *
 * Deliberately narrow: each pattern names the hour or the birth time AND says it is
 * absent or unmappable, so a reading may still say some other thing cannot be
 * mapped without tripping this.
 */
const HOUR_UNKNOWN_CLAIMS = [
  /\b(jam|waktu|pukul)\s+(lahir\w*|kelahiran\w*)\s+(tidak|belum)\s+(diketahui|ada|tercatat)/i,
  /\b(pilar|batang|cabang)\s+jam\w*[^.!?]{0,40}?\b(tidak|belum)\s+(dapat|bisa)\s+dipetakan/i,
  /\b(tidak|belum)\s+(dapat|bisa)\s+dipetakan[^.!?]{0,40}?\b(jam|waktu)\s+(lahir\w*|kelahiran\w*)/i,
  /\btanpa\s+(jam|waktu)\s+(lahir\w*|kelahiran\w*)/i,
];

/**
 * THE HOUR IS KNOWN AND THE READING SAYS IT IS NOT.
 *
 * FOUND 2026-08-06 by the rejection gallery, on chart 1, on two independent runs:
 * the penutup read "Pilar jam lahirmu tidak dapat dipetakan karena waktu kelahiran
 * tidak diketahui" on a chart whose hour is 09:00, in a reading that named Pilar
 * Arah one paragraph above. A plain falsehood about the reader's own chart.
 *
 * HARD, for the same reason the strength contradiction is: the engine decided this,
 * so the renderer contradicting it is not a style slip and does not get a
 * regeneration on style grounds. A reader who knows her birth time and is told the
 * reading could not use it has been handed a reason to distrust everything above it.
 *
 * IT WAS CAUGHT BY ACCIDENT. Nothing in the fact guard looked for it - the
 * `raw_pillar` STYLE ban, added hours earlier, happened to match the same sentence.
 * Without that coincidence it would have shipped. That is the whole argument for
 * checking this rather than trusting the prompt's hour_known instruction.
 *
 * ONE DIRECTION ONLY. When hour_known is FALSE the prompt REQUIRES the statement,
 * and asserting it is PRESENT is a coverage question rather than a contradiction.
 * Left undone deliberately: Reyner approved the hard check, not its inverse.
 */
function checkHourKnown(semantic, text, out) {
  if (semantic.hour_known !== true) return;
  for (const pattern of HOUR_UNKNOWN_CLAIMS) {
    const hit = pattern.exec(text);
    if (!hit) continue;
    out.push(finding('fact.hour_known_contradiction',
      `the birth hour IS known but the text says otherwise: "${hit[0].trim()}"`, null));
    return; // one finding is enough - they are all the same defect
  }
}

/**
 * The one side whose nickname or English title appears in `text` (BC §1.6), or null.
 * A text naming both people names neither.
 */
function nameSideIn(text, semantic) {
  const sides = new Set(nameSides(semantic)
    .filter(({ name }) => new RegExp(`(?<![\\p{L}])${name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?![\\p{L}])`, 'iu').test(text || ''))
    .map(({ side }) => side));
  return sides.size === 1 ? [...sides][0] : null;
}

/**
 * The Day Master element. A different element named as the core self is a lie.
 *
 * ── BOTH PEOPLE ON A PAIR (E5, Reyner 2026-10-02; STAGE6 1.69.0) ──
 * A pair's `core` is `{ a, b }`, so `core.element` was undefined and the check
 * returned before reading a word: "Kamu adalah Logam" passed for a reader whose
 * element is Tanah. Each person is now checked against their own element, by the
 * subject words that name them: A (the reader) by `inti dirimu` / `kamu`, B by
 * `inti dirinya` / `dia` / `ia` - the same kamu/dia sides `pairTruth.js` reads.
 * Names are not sides yet; they arrive with F2 and E4's extension.
 */
function checkDayMaster(rendered, semantic, out) {
  // Each person's nickname and English title are subjects too since BC §1.6 (E4
  // extended, 2026-10-02), via pairTruth's nameSides (a name both share names neither).
  const named = (side) => nameSides(semantic).filter((n) => n.side === side)
    .map((n) => n.name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
  const people = semantic.core?.a && semantic.core?.b
    ? [
      { element: semantic.core.a.element, subject: ['inti dirimu', 'kamu', ...named('a')].join('|'), who: 'the reader (A)' },
      { element: semantic.core.b.element, subject: ['inti dirinya', 'dia', 'ia', ...named('b')].join('|'), who: 'the partner (B)' },
    ]
    : [{ element: semantic.core?.element, subject: 'inti dirimu|kamu', who: null }];

  for (const { element, subject, who } of people) {
    if (!element) continue;
    const others = Object.values(GLOSSARY.elemen)
      .map((e) => e.name_id)
      .filter((name) => name !== element);
    for (const block of rendered.blocks || []) {
      for (const wrong of others) {
        if (new RegExp(`\\b(${subject})\\s+(adalah\\s+)?${wrong}\\b`, 'i').test(block.text)) {
          out.push(finding('fact.day_master', who
            ? `the Day Master of ${who} is ${element} but the text calls them ${wrong}`
            : `the Day Master is ${element} but the text calls the self ${wrong}`, block.fact_ids));
        }
      }
    }
  }
}

/**
 * Badge invention (the run-1 failure).
 *
 * Every badge name in the glossary that this chart does NOT carry is checked
 * against the text. A badge is something the person HAS; naming one they do not
 * is the renderer deciding something true.
 */
function checkBadgeInvention(rendered, semantic, text, out) {
  // BOTH MIRRORS ON A v2 PAIR (STAGE6 1.44.0, Prompt AG item 4). A pair's own
  // `facts` are the pair facts; each person's badges ride in `mirror.a` /
  // `mirror.b`, which only v2 builds. Reading `facts` alone made every supplied
  // badge on a v2 pair "invented". Same union as v2.js suppliedTerms. A v1 pair has
  // no `mirror` and is unchanged.
  const carried = new Set([
    ...(semantic.facts || []),
    ...(semantic.mirror?.a?.facts || []),
    ...(semantic.mirror?.b?.facts || []),
  ].map((f) => f.label).filter(Boolean));
  for (const entry of Object.values(GLOSSARY.bintang)) {
    const name = entry.name_id;
    if (!name || carried.has(name)) continue;
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      out.push(finding('fact.badge_invented',
        `the text names "${name}", which is not in this chart`, null));
    }
  }
}

/**
 * A `label: null` fact rendered as though it were a badge.
 *
 * The glossary sets name_id null for CONDITIONS (a missing element is not
 * something you carry). renderer-prompt names the exact failure:
 * "Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu".
 * Mechanically: the condition's English bracket must never surface, because the
 * only way it can is as a name.
 */
function checkConditionNamed(rendered, semantic, text, out) {
  for (const fact of semantic.facts || []) {
    if (fact.label !== null) continue;

    // (a) The fact's own English bracket. The only way it can surface is as a
    //     name, because there is no Indonesian name for it to cite.
    if (fact.label_bracket && text.includes(fact.label_bracket)) {
      out.push(finding('fact.condition_named',
        `"${fact.label_bracket}" is a condition, not a badge, and must not be named`,
        [fact.id]));
      continue;
    }

    // (b) ANY name-with-bracket construction in a block that carries only
    //     unnamed conditions. renderer-prompt's example invents a CATEGORY name
    //     rather than reusing the fact's own bracket - "Tidak ada satu pun Unsur
    //     yang Hilang (Missing Element) berupa Kayu" - so matching on the
    //     bracket alone would miss the documented failure entirely.
    for (const block of blocksCiting(rendered, fact.id)) {
      const allUnnamed = block.fact_ids.every(
        (id) => (semantic.facts || []).find((f) => f.id === id)?.label === null,
      );
      if (!allUnnamed) continue;
      const named = /\b[A-Z][\wÀ-ÿ]*(?:\s+[a-zA-Z][\wÀ-ÿ]*){0,3}\s*\([^)]+\)/.exec(block.text);
      if (named) {
        out.push(finding('fact.condition_named',
          `${fact.id} is a condition and this block names it: "${named[0]}"`, [fact.id]));
      }
    }
  }
}

/**
 * Palace attribution: a fact whose required point demands `palace` must have
 * that palace named in a block that cites it.
 *
 * OBSERVED TWICE (PROGRESS, gate-check runs 1 and 2, 2026-08-02): "profile
 * palace dropped" both times. This is the check for it.
 *
 * ── WHY A BRANCH NAME SATISFIES ITS PILLAR ─────────────────
 * DIAGNOSED 2026-08-06 off captured provider output, 5 of 5 failures on charts 5
 * and 10: every one was `spouse_palace`, required to name the literal string
 * "Pilar Diri". Both surface forms the renderer produced are the PROMPT'S OWN:
 *
 *   chart 10: "Fondasi Pasanganmu ditempati oleh Aspek Peraih ..." - verbatim the
 *             model sentence renderer-prompt.txt prescribes, naming no pillar.
 *   chart  5: "Fondasi Pasanganmu berada di pilar hari" - a construction the
 *             prompt BANS in one section and ENCOURAGES in another.
 *
 * So the sentence the prompt tells the renderer to write did not satisfy the check
 * for the fact it was written for. That is a CONTRACT bug, not a renderer failure,
 * and `spouse_palace` is 13 of the 29 palace demands in the fixture.
 *
 * The fix is not a relaxation. `Fondasi Pasangan` IS the day pillar's branch, so a
 * block naming it has located the fact MORE precisely than "Pilar Diri" would -
 * the seat rather than the whole pillar. The alias is accepted only when the fact's
 * OWN LABEL is that branch name, so an unrelated fact sitting in Pilar Diri cannot
 * pass by mentioning a spouse palace it has nothing to do with.
 */
function checkPalaces(rendered, semantic, out) {
  for (const point of semantic.required_points || []) {
    if (!point.must_cover?.includes('palace')) continue;
    const fact = (semantic.facts || []).find((f) => f.id === point.fact_id);
    if (!fact?.palace) continue;

    const blocks = blocksCiting(rendered, fact.id);
    if (blocks.length === 0) continue; // coverage.js owns the missing-block case

    // The palace name, OR the branch name of that palace when the fact's own label
    // IS that branch name. See branchAliasFor: naming the branch locates the fact
    // more precisely than naming the pillar, so it cannot be a weaker answer.
    const alias = fact.label === branchAliasFor(fact.palace) ? fact.label : null;
    const named = blocks.some((b) => {
      const haystack = `${b.heading} ${b.text}`;
      return haystack.includes(fact.palace) || (alias !== null && haystack.includes(alias));
    });
    if (!named) {
      out.push(finding('fact.palace_dropped',
        `${fact.id} sits in ${fact.palace}${alias ? ` (or "${alias}")` : ''} `
        + 'and no block citing it says so', [fact.id]));
    }
  }
}

/**
 * Branch-relation positions.
 *
 * OBSERVED (PROGRESS, gate-check run 2): the 半合 spans year + hour + month in
 * the JSON and the text said "tahun dan bulan", silently dropping the hour.
 *
 * Only fires when the text actually names positions - naming none is allowed
 * (the relation can be described without listing pillars), naming a WRONG SET is
 * not. Palace names count as position mentions too, since "Pilar Kerja" is the
 * preferred way to say "month".
 *
 * ── THE BARE-WORD SCAN IS SCOPED, AND THAT IS LOAD-BEARING ─
 * MEASURED 2026-08-04, after Stage 3 began handing over `positions_id`: over the
 * only three charts still failing this check (2, 11, 6), **8 of 8 findings had
 * `missing == []`** - the span was stated COMPLETELY every time - and every one
 * failed on an EXTRA position. Separately, 5 of 5 relation blocks reaching the gate
 * carried the phrase verbatim. So the renderer was right and the check was wrong.
 *
 * The cause: a bare `tahun/bulan/hari/jam` is not evidence of a span statement.
 * renderer-prompt.txt REQUIRES "batang bulan" / "cabang hari" / "batang jam" and
 * ENCOURAGES "hari lahirmu unsur Api" and "ini datang dari pilar harimu", so a
 * block that stated its span correctly in palace names and then correctly named a
 * stem picked up a spurious extra position and failed. The measured extras were
 * `hour` and `month`, so it was never only "hari".
 *
 * This is the third instance of the same false-positive shape in this gate, after
 * bare_polarity matching the pronoun "yang" and english_leakage matching "the"
 * inside rule 23's own sanctioned bracket (33 of 133 rejections, 2026-08-02). The
 * technique is the one englishLeakage already uses: cut the sanctioned construction
 * out BEFORE scanning.
 *
 * Palace detection deliberately reads the UNMODIFIED text. A palace name cannot
 * occur inside a part construction, and palace names are the signal the prompt
 * actually asks for, so nothing is gained by narrowing them.
 */
/** Ids of every relation fact (branch relations and the punishment) in a payload. */
const RELATION_FACT_IDS = (semantic) => new Set((semantic.facts || [])
  .filter((f) => f.provenance?.kind === 'branch_relation' || f.provenance?.kind === 'punishment')
  .map((f) => f.id));

function checkRelationPositions(rendered, semantic, out) {
  for (const fact of semantic.facts || []) {
    if (fact.provenance?.kind !== 'branch_relation') continue;
    const expected = new Set(fact.provenance.positions || []);
    if (expected.size === 0) continue;

    for (const block of blocksCiting(rendered, fact.id)) {
      // ── A FOLDED BLOCK IS READ SENTENCE BY SENTENCE (STAGE6 1.61.0, Prompt AT §2 / AV §2.4) ──
      // Reyner, 2026-09-30: "Fold the clashes." A block citing more than one relation
      // is judged, for each relation, only on the sentences that NAME it: a pillar named
      // for one relation is not charged to the others, and "hari-harimu" (her days) in a
      // sentence about none of them is not a day pillar. A sentence naming the relation
      // with part of its span still rejects. A block citing one relation reads as before.
      const folded = (block.fact_ids || []).filter((id) => RELATION_FACT_IDS(semantic).has(id)).length > 1;
      const haystack = folded
        ? sentences(`${block.heading}. ${block.text}`).filter((s) => fact.label && s.includes(fact.label)).join(' ')
        : `${block.heading} ${block.text}`;
      if (!haystack) continue;
      // Bare pillar words are scanned against a copy with the non-span
      // constructions removed. Replaced with a space, not deleted, so two words
      // either side of a stripped phrase cannot fuse into a third.
      const scan = NOT_A_SPAN.reduce((text, re) => text.replace(re, ' '), haystack);
      const named = positionWordsIn(scan);
      for (const [position, palace] of Object.entries(semantic.chart?.palaces || {})) {
        if (palace && haystack.includes(palace)) named.add(position);
      }
      if (named.size === 0) continue;

      // ── MISSING ONLY. `extra` IS NOT EVIDENCE. ──────────────
      // A dropped position is the failure this check exists for: the observed
      // case was a 半合 spanning year + hour + month where the text said "tahun
      // dan bulan". That is `missing`, and every genuine misstatement is.
      //
      // `extra` was removed 2026-08-06 because it cannot be attributed to THIS
      // fact. blocksCiting() returns one block for every fact it cites, and this
      // scan reads the whole block, so in a BRAIDED block each relation is charged
      // with the other facts' palaces - and renderer-prompt.txt requires braiding
      // ("A braided block MUST close by converging"). Measured: chart 2 carries two
      // relations, states BOTH spans correctly in one block, and failed on each
      // other 10 runs out of 10; chart 11's relation is braided with a badge whose
      // "di Pilar Arah" supplied the extra. 8 of 8 sampled findings had
      // `missing == []`, i.e. every single one was a correct span.
      //
      // Dropping `extra` costs nothing real: a relation stated as the WRONG set
      // ("your year and month" for a year+hour span) is missing `hour` and still
      // fails. There is no failure mode that is extra-only and genuine.
      const missing = [...expected].filter((p) => !named.has(p));
      if (missing.length) {
        out.push(finding('fact.relation_positions',
          `${fact.id} spans [${[...expected].join(', ')}] but the text names `
          + `[${[...named].join(', ')}], dropping [${missing.join(', ')}]`, [fact.id]));
      }
    }
  }
}

// ── ELEMENT DOMINANCE (STAGE6 1.41.0) ─────────────────────────
// Prompt AG item 1. An element named with a dominance word must be the one the
// engine counts as dominant, and can never be one the engine counts as missing.
const DOMINANCE = /(?<![\p{L}])(paling banyak|paling dominan|mendominasi|dominan)(?![\p{L}])/giu;
// "tidak dominan" is the p3 cell's own wording ("elemen yang tidak dominan di
// baganmu") and means the opposite; any negator in the two words before skips it.
const DOMINANCE_NEGATED = /(?<![\p{L}])(tidak|tak|kurang|bukan)(?:\s+[\p{L}-]+)?\s*$/iu;
const ELEMENT_NAMES = Object.values(GLOSSARY.elemen).map((e) => e.name_id);

/** Element mentions in a clause: capitalised, or introduced by elemen / unsur. */
function elementMentions(clause) {
  const found = [];
  for (const name of ELEMENT_NAMES) {
    const re = new RegExp(`(?<![\\p{L}])(?:(elemen|unsur)\\s+)?(${name})(?![\\p{L}])`, 'giu');
    for (const m of clause.matchAll(re)) {
      if (m[1] || m[2] === name) found.push({ name, index: m.index + m[0].length - m[2].length });
    }
  }
  return found.sort((x, y) => x.index - y.index);
}

/** What the engine says about one chart's elements, from its facts and presence. */
function elementTruth(facts, presence) {
  const kinds = (k) => new Set(facts.filter((f) => f.provenance?.kind === k).map((f) => f.provenance.element));
  const shares = presence ? Object.values(presence) : [];
  const top = shares.length ? Math.max(...shares) : null;
  return {
    missing: kinds('element_absent'),
    dominant: kinds('element_dominant'),
    isTop: (name) => (presence && top !== null ? presence[name] === top : null),
  };
}

function checkElementDominance(rendered, semantic, out) {
  const isPair = semantic.kind === 'pair';
  // A mirror is one chart. A pair has element facts only on v2, per person in
  // `mirror.a` / `mirror.b`; a v1 pair carries none and this check has nothing to
  // compare against.
  const charts = isPair
    ? { a: semantic.mirror?.a, b: semantic.mirror?.b }
    : { self: { facts: semantic.facts || [], presence: semantic.chart?.element_presence } };
  const truths = Object.fromEntries(Object.entries(charts)
    .filter(([, c]) => c && (c.facts || []).length)
    .map(([k, c]) => [k, elementTruth(c.facts, c.presence ?? c.chart?.element_presence ?? null)]));
  if (Object.keys(truths).length === 0) return;

  for (const block of rendered.blocks || []) {
    for (const sentence of sentences(block.text)) {
      const whose = isPair ? namedSide(sentence, semantic) : 'self';
      const truth = whose && truths[whose];
      if (!truth) continue;
      for (const clause of clauses(sentence)) {
        for (const m of clause.matchAll(DOMINANCE)) {
          if (DOMINANCE_NEGATED.test(clause.slice(0, m.index))) continue;
          const mentions = elementMentions(clause);
          const before = mentions.filter((e) => e.index < m.index);
          const named = (before.length ? before[before.length - 1] : mentions[0])?.name;
          if (!named) continue;
          const top = truth.isTop(named);
          const wrong = truth.missing.has(named)
            ? `${named} is missing from this chart`
            : top === false && !truth.dominant.has(named)
              ? `${named} is not the element the chart holds most of`
              : top === null && truth.dominant.size && !truth.dominant.has(named)
                ? `the dominant element is ${[...truth.dominant].join(', ')}, not ${named}`
                : null;
          if (wrong) {
            out.push(finding('fact.element_dominance', `"${clause}" - ${wrong}`, block.fact_ids));
          }
        }
      }
    }
  }
}

// ── ASPEK AT A NAMED PILLAR (STAGE6 1.56.0) ─────────────────────
// Prompt AO §2, on Reyner's AN ruling ("engine accuracy is non-negotiable"). Round 4d
// served, for PZ0t's reader: "Aspek Pengelola-mu yang menonjol di Pilar Kerja dan Pilar
// Diri"; the engine places her Pengelola (正財) at Pilar Kerja only - Pilar Diri's 子
// carries 癸, Aspek Pengatur - and the AO §2 sample (an2) served the same claim again.
// A claimed pillar is right when ANY stem or hidden stem there carries that Aspek, the
// engine's own placement (aspekOccurrences, lib/semantic/facts.js), so the check can
// only reject a pillar where the Aspek is absent altogether.
//
// SUBJECT (Cowork's rule, AO §2.3): the reader on a mirror. On a pair, "-mu" on the Aspek
// name is A and "-nya" or "dia" in the span is B; otherwise it does not fire and is
// LOGGED as fact.aspek_pillar_unattributed, because a pillar right for one person can be
// wrong for the other. A v1 pair carries no per-person chart, so there is nothing to
// compare and the check is silent there.
const ASPEK_NAMES = Object.values(GLOSSARY.aspek || {}).map((c) => c?.name_id).filter(Boolean)
  .sort((a, b) => b.length - a.length);
const ASPEK_BY_NAME = new Map(Object.entries(GLOSSARY.aspek || {})
  .filter(([k, c]) => !k.startsWith('_') && c?.name_id).map(([hanzi, c]) => [c.name_id, hanzi]));
const PILLAR_POS = { akar: 'year', kerja: 'month', diri: 'day', arah: 'hour' };
const ASPEK_AT_PILLAR = new RegExp(
  `(${ASPEK_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('|')})(-?(?:mu|nya))?(?![\\p{L}])`
  + '([^.]{0,80}?)(?<![\\p{L}])di\\s+pilar\\s+(akar|kerja|diri|arah)'
  + '((?:\\s*(?:,|dan|serta)\\s*(?:pilar\\s+)?(?:akar|kerja|diri|arah)(?![\\p{L}]))*)',
  'giu',
);
const pillarOf = (s) => (typeof s === 'string' && s.length >= 2 ? { stem: s[0], branch: s[1] } : null);

/** Where the engine places each Aspek, for the pillar strings a semantic chart carries. */
function placementOf(chartStrings) {
  if (!chartStrings?.day) return null;
  const chart = {
    year: pillarOf(chartStrings.year), month: pillarOf(chartStrings.month),
    day: pillarOf(chartStrings.day), hour: pillarOf(chartStrings.hour),
  };
  if (!chart.year || !chart.month || !chart.day) return null;
  const by = new Map();
  for (const o of aspekOccurrences(chart)) {
    if (!by.has(o.god)) by.set(o.god, new Set());
    by.get(o.god).add(o.position);
  }
  return by;
}

function checkAspekPillars(rendered, semantic, out) {
  const isPair = semantic.kind === 'pair';
  const places = isPair
    ? { a: placementOf(semantic.mirror?.a?.chart), b: placementOf(semantic.mirror?.b?.chart) }
    : { self: placementOf(semantic.chart) };
  if (!Object.values(places).some(Boolean)) return;
  const palaceOf = (pos) => ({ year: 'Pilar Akar', month: 'Pilar Kerja', day: 'Pilar Diri', hour: 'Pilar Arah' })[pos];

  for (const block of rendered.blocks || []) {
    for (const sentence of sentences(block.text)) {
      for (const m of sentence.matchAll(ASPEK_AT_PILLAR)) {
        const [, name, possessive, between, first, rest] = m;
        // Another term between the name and "di Pilar" may own the pillar instead.
        if (/(?<![\p{L}])(Aspek|Bintang|Fondasi|Tanda|Bunga)\s/u.test(between)) continue;
        const hanzi = ASPEK_BY_NAME.get(ASPEK_NAMES.find((n) => n.toLowerCase() === name.toLowerCase()));
        if (!hanzi) continue;
        const claimed = [first, ...[...(rest || '').matchAll(/(akar|kerja|diri|arah)/giu)].map((x) => x[1])]
          .map((p) => PILLAR_POS[p.toLowerCase()]);
        const wrongFor = (place) => [...new Set(claimed)].filter((p) => !(place.get(hanzi) || new Set()).has(p));
        let whose = 'self';
        if (isPair) {
          const pos = (possessive || '').toLowerCase().replace('-', '');
          whose = pos === 'mu' ? 'a'
            : pos === 'nya' || /(?<![\p{L}])dia(?![\p{L}])/iu.test(between) ? 'b'
              : nameSideIn(between, semantic);
          if (!whose) {
            // ── FALSE FOR BOTH PEOPLE IS FALSE WHOEVER IT IS ABOUT (STAGE6 1.57.0) ──
            // Prompt AP §3, Cowork's technical ruling inside Reyner's AN ruling. With no
            // subject marker, a claim matching NEITHER person's placement is wrong about
            // whichever one it means, so it is rejected. True for one and false for the
            // other, it stays logged: there is no way to know which person is meant.
            if (places.a && places.b && wrongFor(places.a).length && wrongFor(places.b).length) {
              const at = (place) => [...(place.get(hanzi) || [])].map(palaceOf).join(', ') || 'no pillar';
              out.push(finding('fact.aspek_pillar',
                `"${m[0]}" - false for both people: ${ASPEK_NAMES.find((n) => n.toLowerCase() === name.toLowerCase())} sits at ${at(places.a)} for kamu and ${at(places.b)} for dia`,
                block.fact_ids));
              continue;
            }
            out.push({ ...finding('fact.aspek_pillar_unattributed',
              `"${m[0]}" - no subject on the Aspek name, not checked`, block.fact_ids), severity: 'flag' });
            continue;
          }
        }
        const place = places[whose];
        if (!place) continue;
        const truth = place.get(hanzi) || new Set();
        const wrong = [...new Set(claimed)].filter((p) => !truth.has(p));
        if (wrong.length) {
          const at = [...truth].map(palaceOf).join(', ') || 'no pillar';
          out.push(finding('fact.aspek_pillar',
            `"${m[0]}" - ${ASPEK_NAMES.find((n) => n.toLowerCase() === name.toLowerCase())} sits at ${at}, not ${wrong.map(palaceOf).join(', ')}`
            + `${isPair ? ` (${whose === 'a' ? 'kamu' : 'dia'})` : ''}`, block.fact_ids));
        }
      }
    }
  }
}

// ── A BADGE AT A NAMED PILLAR (STAGE6 1.63.0) ───────────────────
// Prompt AV §4, Cowork's technical ruling. Since #177 the page shows each badge's card,
// with its pillar, from the engine; a sentence placing that badge on another pillar
// contradicts the card on the same screen. "Bintang X ... di Pilar Y" (every glossary
// bintang: Tanda Kekosongan, Bunga Persik, Mata Pisau and Penyendiri too) is HARD when
// no fact carrying X places it at Y. The truth is the union over every fact with that
// name, because Tanda Kekosongan can ride as two (void_stack and badge_空亡). A true
// partial list passes. A badge the chart does not carry is fact.badge_invented's.
// SUBJECT is checkAspekPillars' handling, reused: the reader on a mirror; on a pair
// "-mu" A, "-nya"/"dia" B, no marker and false for both HARD, true for one only LOGGED.
const BINTANG_NAMES_ORDERED = Object.entries(GLOSSARY.bintang || {})
  .filter(([k, c]) => !k.startsWith('_') && c?.name_id).map(([, c]) => c.name_id)
  .sort((a, b) => b.length - a.length);
const BINTANG_AT_PILLAR = new RegExp(
  `(${BINTANG_NAMES_ORDERED.map((n) => n.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('|')})(-?(?:mu|nya))?(?![\\p{L}])`
  + '([^.]{0,80}?)(?<![\\p{L}])di\\s+pilar\\s+(akar|kerja|diri|arah)'
  + '((?:\\s*(?:,|dan|serta)\\s*(?:pilar\\s+)?(?:akar|kerja|diri|arah)(?![\\p{L}]))*)',
  'giu',
);
// Another term between the badge and "di Pilar" may own the pillar instead.
const OTHER_TERM = new RegExp(`(?<![\\p{L}])(Aspek|Bintang|Fondasi|Tanda|Bunga|Mata Pisau|Penyendiri|${
  Object.values(GLOSSARY.relasi_cabang || {}).map((c) => c?.name_id).filter(Boolean).join('|')})(?![\\p{L}])`, 'u');
const BADGE_PALACE = { year: 'Pilar Akar', month: 'Pilar Kerja', day: 'Pilar Diri', hour: 'Pilar Arah' };

/** Badge name -> the set of positions the engine places it at, for one chart's facts. */
function badgePlacement(facts) {
  const names = new Set(BINTANG_NAMES_ORDERED);
  const by = new Map();
  for (const f of facts || []) {
    if (!names.has(f.label)) continue;
    const at = f.provenance?.hits ? f.provenance.hits.map((h) => h.position) : [f.provenance?.position];
    if (!by.has(f.label)) by.set(f.label, new Set());
    for (const p of at.filter(Boolean)) by.get(f.label).add(p);
  }
  return by.size ? by : null;
}

function checkBintangPillars(rendered, semantic, out) {
  const isPair = semantic.kind === 'pair';
  const places = isPair
    ? { a: badgePlacement(semantic.mirror?.a?.facts), b: badgePlacement(semantic.mirror?.b?.facts) }
    : { self: badgePlacement(semantic.facts) };
  if (!Object.values(places).some(Boolean)) return;
  const at = (place, name) => [...((place && place.get(name)) || [])].map((p) => BADGE_PALACE[p]).join(', ') || 'no pillar';

  const texts = [...(rendered.blocks || []).map((b) => [b.text, b.fact_ids]), [rendered.penutup, null]];
  for (const [text, where] of texts) {
    for (const sentence of sentences(text || '')) {
      for (const m of sentence.matchAll(BINTANG_AT_PILLAR)) {
        const [, written, possessive, between, first, rest] = m;
        const name = BINTANG_NAMES_ORDERED.find((n) => n.toLowerCase() === written.toLowerCase());
        // The badge's own name, capitalised as a name. "seorang penyendiri" is a noun.
        if (!name || written[0] !== name[0]) continue;
        if (OTHER_TERM.test(between.split(name).join(' '))) continue;
        const claimed = [...new Set([first, ...[...(rest || '').matchAll(/(akar|kerja|diri|arah)/giu)].map((x) => x[1])]
          .map((p) => PILLAR_POS[p.toLowerCase()]))];
        const wrongFor = (place) => claimed.filter((p) => !((place && place.get(name)) || new Set()).has(p));
        let whose = 'self';
        if (isPair) {
          const pos = (possessive || '').toLowerCase().replace('-', '');
          whose = pos === 'mu' ? 'a'
            : pos === 'nya' || /(?<![\p{L}])dia(?![\p{L}])/iu.test(between) ? 'b'
              : nameSideIn(between, semantic);
          if (!whose) {
            if (wrongFor(places.a).length && wrongFor(places.b).length) {
              out.push(finding('fact.bintang_pillar',
                `"${m[0]}" - false for both people: ${name} sits at ${at(places.a, name)} for kamu and ${at(places.b, name)} for dia`, where));
            } else {
              out.push({ ...finding('fact.bintang_pillar_unattributed',
                `"${m[0]}" - no subject on the badge name, not checked`, where), severity: 'flag' });
            }
            continue;
          }
        }
        const place = places[whose];
        if (!place || !place.has(name)) continue; // not carried: fact.badge_invented's
        const wrong = wrongFor(place);
        if (wrong.length) {
          out.push(finding('fact.bintang_pillar',
            `"${m[0]}" - ${name} sits at ${at(place, name)}, not ${wrong.map((p) => BADGE_PALACE[p]).join(', ')}`
            + `${isPair ? ` (${whose === 'a' ? 'kamu' : 'dia'})` : ''}`, where));
        }
      }
    }
  }
}

/**
 * @param {Object} rendered parsed blocks[] contract
 * @param {Object} semantic Stage 3 output (the FULL one, not the scrubbed view)
 * @param {string} text the reading as one string, ids excluded
 * @param {Object} [metrics] collector for the UNFITTED thresholds; see the harness
 * @returns {Array} findings, all severity 'hard'
 */
export function factGuard(rendered, semantic, text, metrics) {
  const out = [];
  checkStrength(rendered, semantic, out, metrics);
  checkHourKnown(semantic, text, out);
  checkDayMaster(rendered, semantic, out);
  checkBadgeInvention(rendered, semantic, text, out);
  checkConditionNamed(rendered, semantic, text, out);
  checkPalaces(rendered, semantic, out);
  checkRelationPositions(rendered, semantic, out);
  // STAGE6 1.41.0 (Prompt AG item 1). Mirror, and v2 pairs through mirror.a/b.
  checkElementDominance(rendered, semantic, out);
  // STAGE6 1.56.0 (Prompt AO §2). Mirror both voices; pairs where the payload carries
  // each person's chart (v2).
  checkAspekPillars(rendered, semantic, out);
  // STAGE6 1.63.0 (Prompt AV §4). Same scope as the Aspek check above.
  checkBintangPillars(rendered, semantic, out);
  return out;
}
