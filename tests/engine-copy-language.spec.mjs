// ============================================================
// tests/engine-copy-language.spec.mjs — an English string cannot reach a reader
// ============================================================
// Run: npm run test:engine-copy
//
// ── THE DEFECT THIS EXISTS FOR, AND WHY NOTHING COULD SEE IT ──
// `element_presence_note` shipped as `display distribution only, never a strength
// score` — ENGLISH, rendered verbatim under `Sebaran Unsur` on the FREE READING
// PAGE, to an Indonesian audience. It was there from before the promotion until
// 2026-08-31.
//
// **EVERY PATTERN IN `lib/validate/blocklist.json` IS AN INDONESIAN TOKEN.**
// `ramalan`, `skor`, `ngerasa`, `bukan ... tapi`. So an English string sweeps
// CLEAN through all 65 of them — the gate cannot see an English leak AT ALL, and
// scored the defect as perfect. `scripts/check-copy.js` walks the copy BANKS and
// never the engine's own output, so it could not see it either.
//
// This is the invisible-defect class (COWORK-BRIEF errors 32, 35, 38), and this
// repo's convention is that the commit repairing one ADDS THE EYE THAT WOULD HAVE
// SEEN IT. That is this file.
//
// ── HOW IT DETECTS ENGLISH, AND WHY THE LIST IS SHORT ──
// Not a language model and not a dictionary: a handful of high-signal English
// FUNCTION WORDS that are not Indonesian words, matched on word boundaries. The
// list is deliberately conservative — the cost of a false positive here is a
// blocked commit on a correct string, and the cost of a miss is one more caveat
// nobody reads for a month. It caught the real one on the first run.
//
// Words like `visual`, `data` and `final` are shared between the two languages and
// are NOT markers. The ruled replacement, `Sebaran visual, bukan ukuran kekuatan.`,
// passes.
//
// ── SCOPE: THE WHOLE SEMANTIC PAYLOAD, NOT ONE FIELD ──
// It walks every string in the semantic JSON for every fixture chart, so it
// catches the NEXT engine string as well as this one. Two exemptions, both narrow
// and both justified below.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, ELEMENT_PRESENCE_NOTE } from '../lib/semantic/index.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * High-signal English function words. Each is a word Indonesian does not use, so a
 * boundary match is strong evidence the string was never translated.
 *
 * NOT a general English detector. It does not need to be: it needs to fire on
 * prose a developer left in English, and every such string in this project has
 * been ordinary English prose rather than a single borrowed noun.
 */
const ENGLISH_MARKERS = /\b(the|of|is|are|was|were|and|or|not|with|from|this|that|only|never|always|score|strength|display|distribution)\b/i;

/**
 * Paths that are English ON PURPOSE, and why. Both are narrow by design: a broad
 * exemption is how this eye would go blind again.
 *
 *   *.name_en   RULED English. `CLAUDE.md` rule 23's EN display layer gives every
 *               archetype an English pair - "The Sun", "The Morning Dew". It is
 *               the one place English is the product.
 *   provenance  INTERNAL MACHINE KEYS, never rendered. `kind: 'strength'`,
 *               `kind: 'day_stem'`. `lib/render/payload.js#scrubInternal` exists
 *               precisely because this subtree is not reader-facing.
 */
const EXEMPT = [
  // Matches `name_en` AND `archetype_name_en`. The first version only matched the
  // bare leaf and the fixture sweep immediately flagged `core.archetype_name_en`
  // on six charts - the exemption has to name the RULED THING, not one spelling
  // of it.
  (p) => /(^|[._])name_en$/.test(p),
  (p) => /(^|\.)provenance(\.|$)/.test(p),
  // ENGINE DIAGNOSTICS, and the repo says so at the one place that could expose
  // them - `lib/mirror/view.js:152`: "`confidence_reasons` is NOT exposed and must
  // not be. It is engine diagnostics." They read like
  // `supportShare 56.2 is within 5 of a threshold`, which is English AND a code
  // leak, and both are fine in a field no reader can reach. If that ever changes,
  // this exemption is the thing to delete first.
  (p) => /(^|\.)confidence_reasons(\[|$)/.test(p),
];

/** Every string in an object, with its dotted path. */
function walkStrings(node, path_ = '', out = []) {
  if (typeof node === 'string') { out.push([path_, node]); return out; }
  if (Array.isArray(node)) { node.forEach((v, i) => walkStrings(v, `${path_}[${i}]`, out)); return out; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walkStrings(v, path_ ? `${path_}.${k}` : k, out);
  }
  return out;
}

/** Reader-facing strings that look like untranslated English. */
export function englishLeaks(semanticJson) {
  return walkStrings(semanticJson)
    .filter(([p]) => !EXEMPT.some((fn) => fn(p)))
    .filter(([, v]) => ENGLISH_MARKERS.test(v))
    .map(([p, v]) => ({ path: p, value: v }));
}

test('the detector fires on English and stays silent on Indonesian', () => {
  // POSITIVE AND NEGATIVE CONTROL, on synthetic input, so the detector is not a
  // function that has only ever been pointed at one object and pronounced working.
  const leaks = englishLeaks({ a: 'display distribution only, never a strength score' });
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].path, 'a');

  assert.deepEqual(englishLeaks({
    a: 'Sebaran visual, bukan ukuran kekuatan.',
    b: 'Tempat membaca dinamika hubungan paling dekat.',
    c: 'Kamu dan Satu Orang',
  }), [], 'ruled Indonesian must not trip the markers');

  // The exemptions are exemptions, not holes: English still IS English there, the
  // path is simply allowed to carry it. All three ruled-English paths pass.
  assert.deepEqual(englishLeaks({ name_en: 'The Sun' }), []);
  assert.deepEqual(englishLeaks({ core: { archetype_name_en: 'The Morning Dew' } }), []);
  assert.deepEqual(englishLeaks({ facts: [{ provenance: { kind: 'strength' } }] }), []);
  assert.deepEqual(englishLeaks({ strength: { confidence_reasons: ['supportShare 56.2 is within 5 of a threshold'] } }), []);

  // AND THE EXEMPTIONS ARE NARROW. A reader-facing field that merely SOUNDS like
  // one of them is still caught, or the exemption would be a hole with a name.
  assert.equal(englishLeaks({ core: { archetype_name_english: 'The Sun' } }).length, 1);
  assert.equal(englishLeaks({ note_about_provenance: 'this is the note' }).length, 1);
});

test('NO ENGLISH REACHES A READER, on every fixture chart', () => {
  // THE REAL SWEEP. Every chart, because a string can be conditional on the chart -
  // `element_missing`, a boundary flag, a void stack - and a one-chart check would
  // have a hole shaped exactly like the conditional it missed.
  const found = [];
  for (const c of VALIDATION_CHARTS) {
    const sj = buildSemanticJson(calculateBaziChart({ birthDate: c.date, birthTime: c.time }));
    for (const leak of englishLeaks(sj)) found.push({ chart: c.date, ...leak });
  }
  assert.deepEqual(found, [],
    `English reached the semantic payload:\n${found.map((f) => `  ${f.chart} ${f.path} = ${JSON.stringify(f.value)}`).join('\n')}`);
});

test('THE CAVEAT IS ONE CONSTANT, and both surfaces use it', () => {
  // ── THE OTHER HALF OF THE DEFECT ──
  // The same caveat rendered under the same heading on two surfaces from two
  // hand-typed literals, and they drifted into two DIFFERENT wrong strings: the
  // page shipped English, the PDF shipped `skor` (banned by style.arithmetic.2).
  // A test can pin two literals equal; a shared constant makes them unable to
  // differ. This asserts the constant is what both sites actually reach for.
  const semantic = fs.readFileSync(path.join(ROOT, 'lib/semantic/index.js'), 'utf8');
  const pdf = fs.readFileSync(path.join(ROOT, 'lib/pdf/document.js'), 'utf8');

  assert.match(semantic, /element_presence_note:\s*ELEMENT_PRESENCE_NOTE/,
    'the engine must emit the constant, not a re-typed literal');
  assert.match(pdf, /ELEMENT_PRESENCE_NOTE/,
    'the PDF must reach for the constant, not a second copy of the words');

  // And no second literal of the old strings survives anywhere in either file.
  for (const [name, src] of [['lib/semantic/index.js', semantic], ['lib/pdf/document.js', pdf]]) {
    const code = src.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*')).join('\n');
    assert.ok(!code.includes('display distribution only'), `${name} still carries the English literal`);
    assert.ok(!code.includes('Sebaran tampilan, bukan skor kekuatan'), `${name} still carries the skor literal`);
  }
});

test('the ruled string is what shipped, verbatim', () => {
  assert.equal(ELEMENT_PRESENCE_NOTE, 'Sebaran visual, bukan ukuran kekuatan.');
  const sj = buildSemanticJson(calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' }));
  assert.equal(sj.chart.element_presence_note, ELEMENT_PRESENCE_NOTE);
});
