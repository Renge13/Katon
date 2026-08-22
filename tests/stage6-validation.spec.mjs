// ============================================================
// Stage 6 — the gate
// ============================================================
// Run: npm run test:stage6
//
// One adversarial fixture per check, asserting REJECTION, plus a known-good
// reading asserting a PASS. A gate with only negative tests rejects everything
// and looks healthy doing it.
//
// The known-good is the module-assembled floor, not hand-written prose. Two
// reasons: this file then authors no Indonesian (Reyner is the sole authority on
// register), and it asserts something worth asserting on its own - rule 17 calls
// module assembly the always-available floor beneath both providers, so a floor
// that cannot pass the gate is not a floor.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';

import { assembleFallback } from '../lib/render/fallback.js';
import { renderReading, persistRendered } from '../lib/render/index.js';
import { readCache, __clearMemCache } from '../lib/render/cache.js';
import { MASTER_PROMPT } from '../lib/render/prompt.js';
import { parseRenderResponse } from '../lib/render/schema.js';
import { scrubInternal, internalFieldNames } from '../lib/render/payload.js';
import {
  validateRendering, stricterDirective, STAGE6_VERSION, CATEGORIES, STRUCTURE_PARAMS,
  STYLE_PARAMS,
} from '../lib/validate/index.js';
import { hasUnsanctionedQuestion } from '../lib/validate/style.js';
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };
import { stemOverlap, distinctiveStems, sentences } from '../lib/validate/text.js';

const jsonFor = (tc) => buildSemanticJson(calculateBaziChart({
  birthDate: tc.date, birthTime: tc.time,
}));
const CHART_1 = jsonFor(VALIDATION_CHARTS[0]);

/**
 * The floor, plus a penutup the floor cannot write (it returns '' on purpose).
 *
 * The penutup is a FIXTURE sentence, not glossary content, and that is deliberate.
 * It used to be `core.label_meaning` - a string the floor already renders inside a
 * block - so the fixture repeated itself three sentences over, and
 * `structure.duplicate_sentence` correctly rejected it the moment that check
 * existed. Any glossary string would collide the same way, because the floor
 * renders every string of every fact. The sentence below carries no banned pattern
 * (asserted by the blocklist sweep below) and appears nowhere else.
 */
function goodReading(semantic = CHART_1) {
  const floor = assembleFallback(semantic);
  return {
    blocks: floor.blocks,
    penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.',
  };
}

/** Deep copy with one block's text replaced, so fixtures stay one-line diffs. */
function withBlockText(reading, factId, text) {
  const copy = structuredClone(reading);
  const block = copy.blocks.find((b) => b.fact_ids.includes(factId));
  block.text = text;
  return copy;
}

const checksIn = (result) => result.findings.map((f) => f.check);

// ── the gate passes what it should ─────────────────────────

test('the module-assembled floor passes its own gate, on every fixture chart', () => {
  // Rule 17's floor has to clear the bar every other output clears. When this
  // was first run it did NOT - the floor never named a palace, while five of
  // chart 1's nine required points demand one. lib/render/fallback.js now leads
  // each block with the palace. This test is what caught that.
  // THE EXEMPTION IS GONE, and its removal is the confirmation it was written for.
  // Between 2026-08-04 and 08-05 this test carried a derived exemption for charts 9
  // and 12, whose CR-1 Aspek was also a converging Aspek: two facts resolved to one
  // glossary entry and the floor rendered it twice, word for word. Stage 3 now
  // collapses the pair (the third collapseSuperseded instance), so all 13 charts
  // pass with no special case - which is what the exemption existed to detect.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const result = validateRendering(goodReading(semantic), semantic, {
      provider: 'module_assembly',
    });
    // RESCOPED TO HARD FINDINGS 2026-08-11 (issue #23, option d), and this is
    // the release contract: a hard finding on any fixture chart's floor blocks
    // the release, because the serve path now REFUSES such a floor with a 503
    // (lib/mirror/handlers.js#floorRefusalReason) and a chart nobody can read is
    // worse than a bland one.
    //
    // It used to assert `result.ok`, which means NO finding of any severity.
    // That was stricter than the ruled behaviour and, once the ruling landed,
    // defended nothing: soft findings on the floor KEEP SERVING, deliberately,
    // because pulling a reading over a style count leaves a hole for everyone
    // who shares that semantic profile and the floor is blander rather than
    // untrue. An assertion demanding zero soft findings would have forced a
    // glossary edit for a reading the product intends to serve.
    //
    // The soft count is still surfaced in the failure message, so a tranche that
    // makes the floor noticeably worse is visible here even when it does not
    // block.
    const soft = checksIn(result).filter((c) => !c.startsWith('forbidden.'));
    assert.equal(result.hard, false,
      `chart ${tc.id} floor HARD-rejected: ${checksIn(result).join(', ')}`
      + `${soft.length ? ` (soft, not blocking: ${soft.join(', ')})` : ''}`);
  }
});

test('no chart emits the CR-1 Aspek and its convergence as two facts', () => {
  // The collapse, asserted where it belongs rather than only through the floor.
  // Charts 9 (正財) and 12 (偏財) are the two that used to.
  let collapsed = 0;
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const cr1 = semantic.facts.find((f) => f.provenance?.rule === 'CR-1');
    if (!cr1) continue;
    const twin = semantic.facts.find((f) => f.provenance?.kind === 'aspek_convergence'
      && f.provenance.god === cr1.provenance.god);
    assert.equal(twin, undefined,
      `chart ${tc.id}: ${cr1.provenance.god} converges AND is the profile; one must be absorbed`);
    if (cr1.provenance.convergence_positions) collapsed += 1;
  }
  assert.equal(collapsed, 2, 'exactly two fixture charts carry an absorbed convergence');
});

test('a passing result records the gate version that passed it', () => {
  const result = validateRendering(goodReading(), CHART_1);
  assert.equal(result.stage6_version, STAGE6_VERSION);
  assert.match(STAGE6_VERSION, /^\d+\.\d+\.\d+$/);
});

// ── 1. FACT GUARD ──────────────────────────────────────────

test('a contradicted strength verdict is a HARD reject', () => {
  // The chart is weak. pipeline-spec's example: JSON "Seimbang" + text "lemah".
  const bad = withBlockText(goodReading(), 'strength_weak',
    'Kamu Api Kuat. Tenagamu lahir dari dalam dirimu sendiri dan tidak pernah habis.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(result.hard, 'a false verdict is not a style slip');
  assert.ok(checksIn(result).includes('fact.strength_contradiction'));
});

test('a bare strength label is rejected even when nothing contradicts it', () => {
  // Rule 21 + glossary.kekuatan._note. label and label_meaning are separate JSON
  // fields, so emitting the label alone is mechanically possible and nothing
  // upstream can stop it. This is the check that stops it.
  const bad = withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(
    checksIn(result).some((c) => c.startsWith('fact.strength_')),
    'a label with no resolution must not pass',
  );
});

test('the same-breath check accepts a REWRITE, not just a copy', () => {
  // The prompt forbids copying label_meaning verbatim, so a gate that demanded
  // the verbatim string would reject correct behaviour and reward the run-2
  // transcription failure. Paraphrase that keeps the substance must pass.
  const fact = CHART_1.facts.find((f) => f.id === 'strength_weak');
  const paraphrase = 'Kamu Api Lemah. Lemah di sini tidak berbicara soal kemampuan. '
    + 'Sumber tenagamu berada di luar dirimu, jadi tempat yang tepat membuatmu melesat '
    + 'dan tempat yang salah menguras habis cadanganmu. '
    + `${fact.gift} ${fact.cost}`;
  const result = validateRendering(withBlockText(goodReading(), 'strength_weak', paraphrase),
    CHART_1);
  assert.ok(result.ok, `rejected a valid rewrite: ${checksIn(result).join(', ')}`);

  // And the proxy is doing real work: the paraphrase is NOT the original.
  assert.ok(!paraphrase.includes(fact.label_meaning), 'fixture must not be a copy');
  assert.ok(stemOverlap(fact.label_meaning, paraphrase).ratio > 0.25);
});

test('CLAIMING THE HOUR IS UNKNOWN WHEN IT IS KNOWN IS A HARD REJECT', () => {
  // FOUND 2026-08-06 by the rejection gallery, on chart 1, twice. The penutup said
  // the fourth pillar could not be mapped, on a chart whose hour is 09:00, in a
  // reading that named Pilar Arah one paragraph above. Nothing in the fact guard
  // looked for it - the raw_pillar STYLE ban caught it by coincidence.
  assert.equal(CHART_1.hour_known, true, 'fixture assumption');

  const observed = 'Pilar jam lahirmu tidak dapat dipetakan karena waktu kelahiran '
    + 'tidak diketahui.';
  const variants = [
    observed,                                        // verbatim, as it shipped
    'Jam lahirmu tidak diketahui, jadi bagian ini dibaca lebih longgar.',
    'Tanpa jam lahir, arah ke depan hanya bisa dibaca sebagian.',
  ];
  for (const claim of variants) {
    const bad = goodReading();
    bad.penutup = claim;
    const result = validateRendering(bad, CHART_1);
    assert.ok(checksIn(result).includes('fact.hour_known_contradiction'), `not caught: ${claim}`);
    assert.ok(result.hard, 'a falsehood about the reader\'s own chart is not a style slip');
  }
});

test('the same sentence is ALLOWED when the hour really is unknown', () => {
  // The other direction, and the reason the hour-less fixture variants exist. With
  // hour_known false the prompt REQUIRES this statement, so the check must be
  // silent - otherwise it would reject every reading of a chart with no birth time,
  // which is a large share of real users.
  for (const tc of HOUR_UNKNOWN_CHARTS) {
    const semantic = buildSemanticJson(calculateBaziChart({
      birthDate: tc.date, birthTime: tc.time,
    }));
    assert.equal(semantic.hour_known, false, `chart ${tc.id} must have no hour`);

    const reading = goodReading(semantic);
    reading.penutup = 'Pilar jam lahirmu tidak dapat dipetakan karena waktu kelahiran '
      + 'tidak diketahui.';
    assert.ok(!checksIn(validateRendering(reading, semantic))
      .includes('fact.hour_known_contradiction'), `chart ${tc.id}`);
  }
});

test('the hour-less variants are real charts and still match their sources', () => {
  // They are DERIVED rows, not evidence. This is what stops them drifting into
  // pointing at a chart that has been edited or renumbered underneath them.
  assert.equal(HOUR_UNKNOWN_CHARTS.length, 3);
  for (const tc of HOUR_UNKNOWN_CHARTS) {
    const source = VALIDATION_CHARTS.find((c) => c.id === tc.from);
    assert.ok(source, `chart ${tc.id} claims to derive from ${tc.from}, which is gone`);
    assert.equal(tc.date, source.date, `chart ${tc.id} date drifted from chart ${tc.from}`);
    assert.equal(tc.time, null, 'the whole point is that it has no time');
    assert.ok(tc.id > 100, 'ids are offset so they cannot collide with a fixture id');

    // And the floor still passes its own gate for them - rule 17 holds for a chart
    // with no hour exactly as it holds for one with.
    const semantic = buildSemanticJson(calculateBaziChart({
      birthDate: tc.date, birthTime: tc.time,
    }));
    const result = validateRendering(goodReading(semantic), semantic,
      { provider: 'module_assembly' });
    assert.ok(result.ok, `chart ${tc.id} floor rejected: ${checksIn(result).join(', ')}`);
  }
});

test('an invented badge is a HARD reject', () => {
  // The run-1 failure. Chart 1 carries Bunga Persik and Bintang Penolong; it
  // does not carry Mata Pisau.
  assert.ok(!CHART_1.facts.some((f) => f.label === 'Mata Pisau'), 'fixture assumption');
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    'Di petamu ada Mata Pisau, dan itu membuat keputusanmu tajam sejak awal. '
    + 'Kamu memutuskan cepat dan jarang menyesal.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(result.hard);
  assert.ok(checksIn(result).includes('fact.badge_invented'));
});

test('a null-label condition worn as a badge is a HARD reject', () => {
  // renderer-prompt names this failure verbatim.
  const bad = withBlockText(goodReading(), 'element_missing_Wood',
    'Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu di petamu, '
    + 'dan itu mengubah cara kamu memulai sesuatu yang baru.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(result.hard);
  assert.ok(checksIn(result).includes('fact.condition_named'));
});

test('a dropped palace is caught (observed in gate-check runs 1 and 2)', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'profile_vs_favorable');
  assert.equal(fact.palace, 'Pilar Kerja', 'fixture assumption');
  const bad = withBlockText(goodReading(), 'profile_vs_favorable',
    `${fact.label_meaning} ${fact.gift} ${fact.cost}`); // everything but the palace
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('fact.palace_dropped'));
});

test('THE SPOUSE PALACE IS SATISFIED BY ITS BRANCH NAME, NOT ONLY ITS PILLAR', () => {
  // DIAGNOSED 2026-08-06 off captured provider output: 5 of 5 palace failures on
  // charts 5 and 10 were `spouse_palace` required to name the literal "Pilar Diri",
  // and BOTH forms the renderer produced are the prompt's own. This is the first,
  // verbatim from chart 10 - the model sentence renderer-prompt.txt prescribes.
  const fact = CHART_1.facts.find((f) => f.id === 'spouse_palace');
  assert.equal(fact.palace, 'Pilar Diri', 'fixture assumption');
  assert.equal(fact.label, 'Fondasi Pasangan', 'the label IS the day branch name');

  const asPrescribed = withBlockText(goodReading(), 'spouse_palace',
    'Fondasi Pasanganmu ditempati oleh Aspek Pengatur (Direct Officer). '
    + `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(asPrescribed, CHART_1)).includes('fact.palace_dropped'),
    'the sentence the prompt prescribes must satisfy the check it was written for');

  // Naming the pillar outright still passes - this widens the check, never narrows it.
  const asPillar = withBlockText(goodReading(), 'spouse_palace',
    `Di Pilar Diri, ${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(asPillar, CHART_1)).includes('fact.palace_dropped'));
});

test('naming NEITHER the palace nor its branch still fails', () => {
  // The other direction. The check must still catch a fact cashed out with no
  // location at all - that is the failure it exists for, observed twice in the
  // 2026-08-02 gate-check runs.
  const fact = CHART_1.facts.find((f) => f.id === 'spouse_palace');
  const bad = withBlockText(goodReading(), 'spouse_palace',
    `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  // The HEADING has to be cleared too. The floor sets `heading: fact.label`, which
  // for this fact IS "Fondasi Pasangan", and checkPalaces reads heading + text - so
  // leaving it would have the fixture satisfy the check it is meant to fail.
  bad.blocks.find((b) => b.fact_ids.includes('spouse_palace')).heading = 'Hubungan Terdekat';
  const findings = validateRendering(bad, CHART_1).findings
    .filter((f) => f.check === 'fact.palace_dropped');
  assert.equal(findings.length, 1, 'a locationless fact is still a hard reject');
  assert.match(findings[0].message, /Fondasi Pasangan/, 'the message names the accepted alias');
});

test('the alias is scoped to the fact whose LABEL is that branch name', () => {
  // A fact that merely SITS in Pilar Diri must not pass by mentioning a spouse
  // palace it has nothing to do with. Only spouse_palace carries the alias, because
  // only its label is the branch name; every other palace demand is Pilar Kerja or
  // Pilar Akar, which have no branch name in GLOSSARY.pilar at all.
  const other = CHART_1.facts.find((f) => f.palace && f.label !== 'Fondasi Pasangan'
    && CHART_1.required_points.some((p) => p.fact_id === f.id && p.must_cover.includes('palace')));
  assert.ok(other, 'the fixture must carry a second palace-demanding fact');

  const bad = withBlockText(goodReading(), other.id,
    `Fondasi Pasanganmu juga bicara di sini. ${other.label_meaning} ${other.gift} ${other.cost}`);
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('fact.palace_dropped'),
    `${other.id} needs ${other.palace}; a spouse-palace mention must not satisfy it`);
});

test('a misstated branch-relation span is caught (observed in gate-check run 2)', () => {
  // The 半合 spans year + hour + month; run 2 wrote "tahun dan bulan".
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  assert.deepEqual([...fact.provenance.positions].sort(), ['hour', 'month', 'year']);
  const bad = withBlockText(goodReading(), fact.id,
    `Ini datang dari tahun dan bulan kelahiranmu. ${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('fact.relation_positions'));
});

test('A CORRECT SPAN SURVIVES THE MANDATED PILLAR-PART CONSTRUCTIONS', () => {
  // The 8/8 false positive, fixed. Chart 1's 半合 spans year + hour + month and NOT
  // day, so before the scan was scoped, a block that stated the span perfectly and
  // then wrote "batang hari" - which renderer-prompt REQUIRES for a stem - failed
  // with "names [day, year, month, hour]". Measured extras were hour and month too,
  // so every one of the four words is exercised here.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const phrase = fact.provenance.positions_id;
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;

  const mandated = [
    'Ini terbaca dari batang hari kamu.', // §THE PALACES AND THE PARTS
    'Ini terbaca dari cabang bulanmu.', // the prompt's own possessive example
    'Ini terbaca dari batang jam kamu.',
    'Ini datang dari pilar harimu.', // §PROVENANCE IS NOT ARITHMETIC
    'Hari lahirmu membawa unsur Api.', // the Day Master idiom, encouraged
  ];
  for (const clause of mandated) {
    const reading = withBlockText(goodReading(), fact.id,
      `Tarikan ini menempati ${phrase}. ${clause} ${tail}`);
    const checks = checksIn(validateRendering(reading, CHART_1));
    assert.ok(!checks.includes('fact.relation_positions'),
      `a complete span must survive: ${clause}`);
  }
});

test('an INCOMPLETE span still fails, even wrapped in those constructions', () => {
  // The other direction. Scoping the scan must not blind the check to the failure
  // it exists for - dropping a position the JSON lists.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;

  // Two of the three palaces, plus a mandated construction as camouflage.
  const short = withBlockText(goodReading(), fact.id,
    `Tarikan ini menempati Pilar Akar dan Pilar Kerja. Ini terbaca dari batang hari kamu. ${tail}`);
  const findings = validateRendering(short, CHART_1).findings
    .filter((f) => f.check === 'fact.relation_positions');
  assert.equal(findings.length, 1, 'a dropped position is still a hard reject');
  assert.match(findings[0].message, /but the text names/);

  // And the original observed failure, stated in bare words, still fails.
  const bare = withBlockText(goodReading(), fact.id,
    `Ini datang dari tahun dan bulan kelahiranmu. ${tail}`);
  assert.ok(checksIn(validateRendering(bare, CHART_1)).includes('fact.relation_positions'));
});

test('A BRAIDED BLOCK MAY NAME ANOTHER FACT\'S PALACE WITHOUT FAILING', () => {
  // `extra` was dropped 2026-08-06. blocksCiting() returns one block per citing
  // fact and this check reads the WHOLE block, so a braided block charged each
  // relation with the other facts' palaces - and renderer-prompt.txt REQUIRES
  // braiding. Measured: chart 2 states both its spans correctly in one block and
  // failed on each other 10 runs out of 10; 8 of 8 sampled findings had
  // `missing == []`, i.e. every one was a correct span.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const phrase = fact.provenance.positions_id;
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;

  // The span is COMPLETE, and the block also names Pilar Diri - a palace this
  // relation does not span (chart 1's 半合 is year + month + hour, never day).
  // That is what a braid looks like, and it must pass.
  const braided = withBlockText(goodReading(), fact.id,
    `Tarikan ini menempati ${phrase}. Fondasi Pasanganmu di Pilar Diri membawa hal lain. ${tail}`);
  const checks = checksIn(validateRendering(braided, CHART_1));
  assert.ok(!checks.includes('fact.relation_positions'),
    'a complete span must survive a braided neighbour naming its own palace');

  // The guarantee that dropping `extra` costs nothing: a WRONG set is still a
  // MISSING set. Naming day+month for a year+month+hour span omits year and hour.
  const wrong = withBlockText(goodReading(), fact.id,
    `Tarikan ini menempati Pilar Diri dan Pilar Kerja. ${tail}`);
  assert.ok(checksIn(validateRendering(wrong, CHART_1)).includes('fact.relation_positions'),
    'there is no failure mode that is extra-only and genuine');
});

test('naming NO positions is allowed; naming the RIGHT set is allowed', () => {
  // The check must not force the renderer to list pillars it had no reason to.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const silent = withBlockText(goodReading(), fact.id,
    `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(silent, CHART_1)).includes('fact.relation_positions'));

  const complete = withBlockText(goodReading(), fact.id,
    'Tarikan ini datang dari tahun, bulan dan jam kelahiranmu sekaligus. '
    + `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(complete, CHART_1)).includes('fact.relation_positions'));
});

test('A PILLAR WORD INSIDE AN ORDINARY WORD IS NOT A PILLAR', () => {
  // FOUND 2026-08-11 by the tranche-1 content pass. The scan was `\b` + word with
  // NO trailing boundary, so anything merely STARTING with a pillar word claimed
  // that pillar. "kehidupan sehari-hari" reported chart 1's 半合 as naming [day]
  // and dropping [year, hour, month] - a HARD finding, on a reader's own chart,
  // from a phrase that means "everyday life".
  //
  // A trailing \b is NOT the fix: a hyphen is a word boundary, so `\bhari\b`
  // still enters `sehari-hari` halfway. Whole-token matching is.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;
  const span = fact.provenance.positions_id;

  const innocent = [
    'Dalam kehidupan sehari-hari, rasanya hampir pas.', // the observed case
    'Sehari saja sudah cukup untuk melihatnya.', // the se- prefix
    'Kamu bisa menunggu berhari-hari tanpa gelisah.', // ber- + reduplication: a duration
    'Penghasilan bulanan kamu tidak menentukan arah ini.', // bulan + -an
    'Kamu membuat rencana tahunan tanpa diminta.', // tahun + -an
    'Kamu jarang meminta jaminan sebelum melangkah.', // jam inside jaminan
    'Rasa itu menjamin kamu terus bergerak.', // jam inside menjamin
  ];
  for (const clause of innocent) {
    const reading = withBlockText(goodReading(), fact.id,
      `Tarikan ini menempati ${span}. ${clause} ${tail}`);
    assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('fact.relation_positions'),
      `ordinary Indonesian was read as a pillar: ${clause}`);
  }

  // And the words that DO name a pillar still do, or the fix would have bought
  // silence instead of precision. Three classes: bare, cliticised, and
  // REDUPLICATED - Indonesian pluralises by repeating the noun, so "hari-hari"
  // names the day pillar exactly as "hari" does (ruled 2026-08-11). The last two
  // carry a clitic on top of the reduplication.
  const naming = [
    'tahun', 'tahunmu', 'bulan', 'bulannya', 'hari', 'hariku', 'jam', 'jammu',
    'hari-hari', 'bulan-bulan', 'tahun-tahun', 'jam-jam',
    'hari-harinya', 'tahun-tahunku',
  ];
  for (const clause of naming) {
    const reading = withBlockText(goodReading(), fact.id,
      `Tarikan ini terbaca di ${clause}. ${tail}`);
    const hit = checksIn(validateRendering(reading, CHART_1)).includes('fact.relation_positions');
    assert.ok(hit, `"${clause}" must be read as naming a pillar`);
  }

  // The repetition must be of the SAME word. "hari-bulan" is not a plural of
  // either, and the backreference is what makes that true rather than a
  // hand-listed exclusion.
  for (const clause of ['hari-bulan', 'tahun-jam']) {
    const reading = withBlockText(goodReading(), fact.id,
      `Tarikan ini menempati ${span}. Catatan ${clause} tidak relevan. ${tail}`);
    assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('fact.relation_positions'),
      `"${clause}" is not a reduplicated plural`);
  }
});

test('A CALENDAR UNIT IS NOT A PILLAR - round 4, and the classes are from evidence', () => {
  // 2026-08-12. Tranche 2b's ruled `relasi_cabang.害` line ended `di kemudian hari`
  // and raised a HARD finding on every chart 害 fires on (6, 8, 10, 11 plus the
  // hour-less chart), because a bare `hari` was read as the day pillar. Round 3
  // made the scan whole-token, which cannot reach a STANDALONE token, so this is
  // the same root cause through a fourth surface form.
  //
  // The clauses below are not invented: the whole glossary and renderer-prompt.txt
  // were swept through the real stripping and tokeniser, and these are the forms
  // that actually survived. See NOT_A_SPAN in lib/validate/fact.js.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;
  const span = fact.provenance.positions_id;

  const calendar = [
    'Jangan tunggu di kemudian hari.', // the round-4 case, tranche 2b
    'Suatu hari kamu akan melihatnya.', // pre-modifier
    'Kirim pembaruan bulan ini.', // deictic - aspek.正財, elemen_dominan.controls
    'Eksekusi satu penerapan dalam tujuh hari.', // counted - bintang.文昌
    'Tetapkan komitmen untuk enam bulan ke depan.', // counted - kekuatan.balanced
    'Sisihkan satu hari seminggu.', // counted - elemen_dominan.drains
    'Tetapkan rutinitas di jam yang sama.', // clock - elemen_hilang.土
    'Kunci targetnya minimal untuk dua belas bulan.', // `belas` stands alone
    'Kamu bisa menunggu sepanjang hari.', // pre-modifier
  ];
  for (const clause of calendar) {
    const reading = withBlockText(goodReading(), fact.id,
      `Tarikan ini menempati ${span}. ${clause} ${tail}`);
    assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('fact.relation_positions'),
      `a calendar unit was read as a pillar: ${clause}`);
  }

  // THE ZODIAC FORM IS DELIBERATELY NOT STRIPPED, and this is the test that says
  // so. `bulan Ayam` names the month pillar by its animal and renderer-prompt.txt
  // encourages it. Stripping only ever REMOVES a position from `named`, and
  // `missing` is derived from what is named, so stripping a form that genuinely
  // names a pillar would move it into `missing` and fire where the text is right.
  const zodiacFact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const positions = zodiacFact.provenance.positions;
  const reading = withBlockText(goodReading(), zodiacFact.id,
    `Tarikan ini menempati ${span}. Hari lahirmu jatuh di bulan Ayam. ${tail}`);
  const hit = checksIn(validateRendering(reading, CHART_1)).includes('fact.relation_positions');
  assert.ok(!hit || !positions.includes('month'),
    'the zodiac month form must keep counting as naming the month pillar');
});

test('NO ENGINE STRING NAMES A PILLAR BY BARE WORD', () => {
  // The sibling of NO ENGINE STRING WOULD TRIP THE STYLE GATE, and it exists for
  // the same reason: a glossary cell that trips a gate check punishes the renderer
  // for carrying engine content faithfully. Four of the last four
  // `fact.relation_positions` rounds were found by content authoring rather than by
  // this suite, twice on a Reyner-ruled string. This is the check that makes the
  // next one a fast unit failure instead of a 503.
  //
  // A span is always pre-verbalised by the engine as PALACE names
  // (provenance.positions_id, e.g. "Pilar Akar dan Pilar Kerja"), so no cell needs
  // a bare pillar word to state one, and any cell that produces one is an accident.
  // Strings containing a palace name are skipped: they name a position legitimately,
  // and in a two-palace span naming one of them is correctly a finding.
  const PALACE_NAMES = Object.values(GLOSSARY.pilar)
    .flatMap((p) => [p.name_id, p.branch_name_id]).filter(Boolean);
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');

  const offenders = [];
  const walk = (node, path) => {
    if (typeof node === 'string') {
      if (PALACE_NAMES.some((name) => node.includes(name))) return;
      const reading = { blocks: [{ heading: '', text: node, fact_ids: [fact.id] }] };
      const findings = validateRendering(reading, CHART_1).findings
        .filter((f) => f.check === 'fact.relation_positions');
      if (findings.length) offenders.push(`${path}: ${findings[0].message}`);
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) walk(value, path ? `${path}.${key}` : key);
    }
  };
  walk(GLOSSARY, '');

  assert.deepEqual(offenders, [],
    `glossary strings read as naming a pillar:\n  ${offenders.join('\n  ')}`);
});

// ── 2. COVERAGE ────────────────────────────────────────────

test('a required point in no block is caught', () => {
  const reading = goodReading();
  reading.blocks = reading.blocks.filter((b) => !b.fact_ids.includes('badge_桃花'));
  const result = validateRendering(reading, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('coverage.missing_point'));
});

test('a dropped cost is caught under its own check name', () => {
  // Gift-without-cost is the ethics failure mode: rule 25's "never rank a state
  // as good or bad" only has teeth if the costs survive.
  const fact = CHART_1.facts.find((f) => f.id === 'aspek_convergence_正官');
  const bad = withBlockText(goodReading(), fact.id, `${fact.label_meaning} ${fact.gift}`);
  const result = validateRendering(bad, CHART_1);
  assert.ok(checksIn(result).includes('coverage.cost_dropped'));
});

test('coverage never penalises ORDER, PAST THE OPENING', () => {
  // The carried principle: validate coverage, never structural conformance. The
  // prompt promises the renderer it will not be punished for an unusual order,
  // and the gate has to keep that promise.
  //
  // RESCOPED 2026-08-21, and the scope is the prompt's own, not a concession to a
  // new check. renderer-prompt.txt has always said "THE OPENING IS FIXED. THE REST
  // OF THE ARRANGEMENT IS FREE", and the sentence this test was written from reads
  // in full: "PAST THE OPENING THREE you will never be penalised for an unusual
  // order." The old test reversed EVERY block, including the opening, so it
  // asserted something broader than the contract it cites - and it passed only
  // because nothing yet enforced the opening.
  const reading = goodReading();
  const [first, ...rest] = reading.blocks;
  reading.blocks = [first, ...rest.reverse()];
  const result = validateRendering(reading, CHART_1);
  assert.ok(result.ok, `reordering past the opening was penalised: ${checksIn(result).join(', ')}`);

  // And the exception is real rather than notional: move the opening and the gate
  // says so. Both halves live in one test on purpose - a reader who changes either
  // rule has to look at the other.
  const moved = goodReading();
  moved.blocks = [...moved.blocks.slice(1), moved.blocks[0]];
  assert.ok(checksIn(validateRendering(moved, CHART_1)).includes('opening.archetype_missing'),
    'moving the day-master block out of first position must fire the opening rule');
});

// ── THE OPENING NAMES THE ARCHETYPE (Reyner, 2026-08-19) ───

test('THE ARCHETYPE IS A REQUIRED POINT, not merely context', () => {
  // The 08-19 diagnosis: `core.archetype_name_id` was in the payload for every
  // chart and still went missing, because `core` is CONTEXT and obligation lives
  // in `required_points`. Measured over the 77 stored attempt proses in
  // docs/qa/2026-08-18-retry-depth.json, the archetype reached the first 250
  // characters on 41 of 77 attempts and 16 of 39 PASSING ones.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const dm = semantic.required_points.find((p) => p.fact_id.startsWith('day_master_'));
    assert.ok(dm, `chart ${tc.id} has no day-master required point`);
    assert.ok(dm.must_cover.includes('archetype'),
      `chart ${tc.id}: the day-master point must demand the archetype`);

    // And ONLY that point. `archetype` is derived from a field only the day-master
    // fact carries, so a second point demanding it would mean the field leaked.
    const others = semantic.required_points
      .filter((p) => p !== dm && p.must_cover.includes('archetype'));
    assert.deepEqual(others.map((p) => p.fact_id), [],
      `chart ${tc.id}: only the day-master point may demand the archetype`);
  }
});

test('a reading that opens on the ELEMENT is COUNTED, and never rejected', () => {
  // "Kamu adalah Kayu (Wood) reads like a spreadsheet header" - Reyner. This is
  // the exact sentence shape that made two of four charts unsellable.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const archetype = CHART_1.core.archetype_name_id;
  const opensOnElement = withBlockText(goodReading(), dmId,
    `Api (Fire). ${CHART_1.facts.find((f) => f.id === dmId).label_meaning}`);

  const result = validateRendering(opensOnElement, CHART_1);
  assert.ok(checksIn(result).includes('opening.archetype_missing'),
    `an element-first opening must be caught: ${checksIn(result).join(', ')}`);
  // DEMOTED TO A FLAG 2026-08-22 on the n=10 measurement. It had been soft on the
  // reasoning that "a regeneration fixes it" - and the data says it does not: 20
  // occurrences inside floored runs, present in 13 of the 14, at attempt 1 in 9. It was
  // the leading cause of floors, and a floored reader receives a document the model
  // never wrote. The obligation stays in the prompt and in `must_cover`; only the
  // rejection went. So it must be COUNTED and must not change the verdict.
  assert.equal(result.hard, false, 'never a HARD failure');
  const failing = result.findings.filter((f) => f.severity !== 'flag');
  assert.ok(!failing.some((f) => f.check === 'opening.archetype_missing'),
    'it must not be able to reject a reading');
  assert.ok(!opensOnElement.blocks[0].text.includes(archetype), 'fixture must not name it');

  // The floor, which DOES name it, is the control.
  assert.ok(!checksIn(validateRendering(goodReading(), CHART_1))
    .includes('opening.archetype_missing'), 'the floor names the archetype and must pass');
});

test('the HEADING does not satisfy the opening rule; the sentence must', () => {
  // A section title is not the reader meeting herself in a sentence, and allowing
  // the heading would let the rule pass on a label while the prose still opens on
  // taxonomy.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const reading = withBlockText(goodReading(), dmId,
    `Api (Fire). ${CHART_1.facts.find((f) => f.id === dmId).label_meaning}`);
  reading.blocks[0].heading = CHART_1.core.archetype_name_id;
  assert.ok(checksIn(validateRendering(reading, CHART_1)).includes('opening.archetype_missing'),
    'the archetype in the heading must not satisfy the rule');
});

// ── RULE 23 BRACKETS: A REPORTER, NOT A GATE ───────────────

test('THE PIPELINE INSERTS THE BRACKET, so an unbracketed model output still passes', () => {
  // Ruled 2026-08-21 after enforcement was measured: floor rate 0/4 -> 2/4, and under
  // the STRICT precondition 3 a floored chart FAILS, so that gate cost the launch gate
  // rather than one chart. Compliance moved into the pipeline.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const arche = CHART_1.core.archetype_name_id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;

  // The exact sentence that floored chart 1 under enforcement.
  const fused = withBlockText(goodReading(), dmId, `Kamu adalah Api ${arche} yang Lemah. ${meaning}`);
  const result = validateRendering(fused, CHART_1);

  assert.ok(!checksIn(result).includes('brackets.unbracketed'),
    `insertion must have fixed it, not rejected it: ${checksIn(result).join(', ')}`);
  assert.ok(result.metrics.bracket_inserts > 0, 'it must record that it inserted');

  // AND THE INSERTED TEXT IS WHAT GETS CACHED. `...gate.normalized` is spread into the
  // served result, so validating one string and storing another would validate nothing.
  const served = result.normalized.blocks.find((b) => b.fact_ids.includes(dmId)).text;
  assert.ok(served.includes(`${arche} (${CHART_1.core.archetype_name_en})`),
    `the served text must carry the bracket: ${served.slice(0, 90)}`);
});

test('every insertion is REPORTED with its context, because reading badly is not assertable', () => {
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const arche = CHART_1.core.archetype_name_id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;
  const result = validateRendering(
    withBlockText(goodReading(), dmId, `Kamu adalah Api ${arche} yang Lemah. ${meaning}`), CHART_1);

  const inserted = result.findings.filter((f) => f.check === 'brackets.inserted');
  assert.ok(inserted.length > 0, 'an insertion must be visible to QA');
  for (const f of inserted) {
    assert.equal(f.severity, 'flag', 'an insertion is not a defect and must never reject');
    assert.match(f.message, /READ THIS/, 'the context is the point of this finding');
  }
});

test('INSERTION IS IDEMPOTENT: a reading that got it right is byte-identical after', () => {
  // The floor already brackets everything (fallback.js has always done this insertion),
  // so it is the natural fixture for "already correct".
  const before = goodReading();
  const result = validateRendering(structuredClone(before), CHART_1);
  assert.equal(result.metrics.bracket_inserts, 0, 'nothing should need inserting');
  for (const [i, block] of result.normalized.blocks.entries()) {
    assert.equal(block.text, before.blocks[i].text, `block ${i} was rewritten`);
  }
  assert.ok(!checksIn(result).some((c) => c.startsWith('brackets.')),
    'a compliant reading produces no bracket finding at all');
});

test('INSERTION NEVER TOUCHES Pilar, Elemen, OR A HEADING', () => {
  // Rule 23's ruled scope, and the heading rule that stopped bracket-once rejecting
  // the floor on every chart.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const reading = withBlockText(goodReading(), dmId,
    'Api dan Pilar Diri dan Fondasi Pasangan berada di baganmu. '
    + CHART_1.facts.find((f) => f.id === dmId).label_meaning);
  const bare = reading.blocks.find((b) => b.fact_ids.includes(dmId));
  bare.heading = 'Aspek Pengatur'; // a bare label in a title is not a first mention

  const result = validateRendering(reading, CHART_1);
  const served = result.normalized.blocks.find((b) => b.fact_ids.includes(dmId));
  assert.ok(!served.text.includes('Api (Fire)'), 'Elemen must never be bracketed');
  assert.ok(!served.text.includes('Pilar Diri ('), 'Pilar must never be bracketed');
  assert.ok(!served.text.includes('Fondasi Pasangan ('), 'a palace is not a bound term');
  assert.equal(served.heading, 'Aspek Pengatur', 'a heading must never be rewritten');
});

test('the assertion CANNOT FLOOR A READER even when insertion is bypassed', () => {
  // The property the whole redesign rests on. A pipeline defect must be visible and
  // must never cost a reader their reading - a regeneration cannot fix a bug in our
  // own code, so rejecting for one only burns the budget and lands on the floor.
  const result = validateRendering(goodReading(), CHART_1);
  for (const f of result.findings.filter((f) => f.check.startsWith('brackets.'))) {
    assert.equal(f.severity, 'flag', `${f.check} must never be soft or hard`);
  }
  // And the verdict is computed identically with every bracket finding removed.
  const withoutBrackets = result.findings
    .filter((f) => !f.check.startsWith('brackets.') && f.severity !== 'flag');
  assert.equal(result.ok, withoutBrackets.length === 0);
});

test('EVERY in-scope term already has its English in the payload - no_pair is empty', () => {
  // THIS TEST REPLACES ONE THAT PINNED A BUG AS CORRECT BEHAVIOUR. The first
  // version of brackets.js read `f.name_en`, found it absent on every fact, and
  // concluded Stage 3 forwarded English for the archetype and main profile alone -
  // reporting 12 of 20 in-scope terms as `no_pair` and calling that a prerequisite
  // for the enforcing commit. The field is `label_bracket`, which the
  // module-assembly floor has used for brackets all along, and every fact carries
  // it. There was never a gap.
  //
  // `no_pair` stays in the taxonomy because a real glossary gap would still be
  // one. This pins that it is EMPTY on the fixture, so the same misreading cannot
  // be reported as a finding again.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const result = validateRendering(goodReading(semantic), semantic);
    const noPair = result.metrics.brackets.filter((b) => b.verdict === 'no_pair');
    assert.deepEqual(noPair.map((b) => b.term), [],
      `chart ${tc.id}: the payload supplies English for every in-scope term`);
    assert.ok(result.metrics.brackets.length > 0, `chart ${tc.id} exercised no scoped term`);
  }
});

test('THE BRACKET SCOPE IS READ FROM THE GLOSSARY, so no category can be missed', () => {
  // The first scope was an allowlist of provenance.kind values and it was wrong
  // twice: it missed `coherence_rule` ("Aspek Pengelola" - one of the two terms in
  // the ruling's OWN live instance) and `void_stack` ("Tanda Kekosongan", a 空亡
  // bintang). Membership is data, so it is asked of the data.
  const inScope = new Set([
    ...Object.values(GLOSSARY.aspek).map((v) => v.name_id),
    ...Object.values(GLOSSARY.bintang).map((v) => v.name_id),
  ].filter(Boolean));

  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const reported = new Set(validateRendering(goodReading(semantic), semantic)
      .metrics.brackets.map((b) => b.term));
    for (const fact of semantic.facts) {
      if (!inScope.has(fact.label)) continue;
      // The floor renders every required point, so an in-scope label that reached
      // a block must have been judged.
      const rendered = assembleFallback(semantic).blocks
        .some((b) => b.text.includes(fact.label));
      if (rendered) {
        assert.ok(reported.has(fact.label),
          `chart ${tc.id}: "${fact.label}" is an ${inScope.has(fact.label) ? 'aspek/bintang' : '?'} `
          + 'entry that reached the prose and was not judged');
      }
    }
  }

  // And the exclusions hold: Elemen is explicitly out of scope by the ruling.
  const c1 = validateRendering(goodReading(), CHART_1);
  const judged = c1.metrics.brackets.map((b) => b.term);
  assert.ok(!judged.includes('Api'), 'Elemen must not be judged (Reyner, verdict section 3)');
  assert.ok(!judged.includes('Fondasi Pasangan'), 'a palace is not an Aspek or a Bintang');
});

test('the slot-filling check is inert against today\'s Stage 3, and that is the point', () => {
  // Prompt H specifies: flag when block order matches JSON order AND importance
  // is non-monotonic. Implemented as specced rather than reinterpreted -
  // reinterpreting it would mean flagging the order the prompt explicitly asks
  // for. Reported, not hidden.
  const inJsonOrder = goodReading(); // the floor emits required_points order
  const result = validateRendering(inJsonOrder, CHART_1);
  assert.ok(!checksIn(result).includes('coverage.slot_filling'));

  // WHY IT IS STILL INERT, UNDER THE ORDER K CHANGED (2026-08-11).
  //
  // The old pin here was "facts[] is sorted by descending importance", which
  // made the two conditions mutually exclusive outright. Stage 3 now lifts the
  // identity spine to the front, so facts[] is NOT globally sorted any more and
  // that pin would have been simply false. The contract it is replaced by is the
  // one Stage 3 actually emits, and it has two halves.
  const roles = CHART_1.facts.map((f) => f.hierarchy.role);
  const opening = roles.findIndex((role) => role !== 'spine');
  assert.ok(opening >= 1, 'facts[] must open with the engine-mandated spine run');

  // Half 1: the opening is the ENGINE's order, so the check skips it. Obeying a
  // commanded order was never evidence of slot-filling.
  // Half 2: past the opening, importance still descends - so "matches JSON
  // order" and "importance is monotonic" remain the same statement there, and
  // the check still cannot fire. If EITHER half goes, this check wakes up.
  const tail = CHART_1.facts.slice(opening).map((f) => f.importance);
  assert.deepEqual(tail, [...tail].sort((a, b) => b - a),
    'if the findings tail ever stops being importance-sorted, this check wakes up');
});

test('the identity opening is not read as slot-filling', () => {
  // The regression this pairs with: before coverage.js was taught to skip the
  // opening, EVERY well-formed reading raised coverage.slot_filling, because the
  // engine's own opening is non-monotonic (day master 55, then strength 78, then
  // CR-1 85 on chart 1). A flag on every reading is a flag on nothing.
  const opening = CHART_1.facts.slice(0, 3);
  assert.deepEqual(opening.map((f) => f.hierarchy.role), ['spine', 'spine', 'spine']);
  const importances = opening.map((f) => f.importance);
  assert.notDeepEqual(importances, [...importances].sort((a, b) => b - a),
    'the opening must be non-monotonic, or this test proves nothing');

  const reading = goodReading();
  const leadIds = reading.blocks.map((b) => b.fact_ids[0]);
  assert.deepEqual(leadIds.slice(0, 3), opening.map((f) => f.id),
    'the floor must lead with the spine, in order');
  assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('coverage.slot_filling'));
});

// ── 3. FORBIDDEN CONTENT ───────────────────────────────────

test('every forbidden category hard-rejects', () => {
  const cases = {
    fatalism: 'Pada tahun 2027 kamu akan menemukan arah yang kamu cari.',
    medical: 'Pola ini sering muncul sebagai gejala penyakit yang perlu kamu periksa.',
    financial: 'Waktu yang tepat untuk masuk ke investasi saham sudah dekat.',
    ranking: 'Aspek Pengatur adalah aspek terbaik yang bisa dimiliki seseorang.',
    self_harm: 'Kalau terasa berat, menyerah saja lebih ringan.',
  };
  for (const [category, sentence] of Object.entries(cases)) {
    const bad = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Kalimat tambahan supaya blok ini cukup panjang untuk diperiksa.`);
    const result = validateRendering(bad, CHART_1);
    assert.ok(result.hard, `${category} did not hard-reject`);
    assert.ok(checksIn(result).includes(`forbidden.${category}`), `${category} not caught`);
  }
});

// ── 4. STYLE GUARD ─────────────────────────────────────────

test('the bukan-X-tapi-Y construction is caught, in prose and in the penutup', () => {
  // THE load-bearing regex. It has escaped an explicit prompt ban three times:
  // renderer-prompt-notes run 5 (twice) and PROGRESS gate-check run 2, where it
  // appeared in the penutup - which is why the penutup is checked too.
  const inProse = withBlockText(goodReading(), 'day_master_Fire',
    'Pengakuan sulit menempel, bukan karena hasilnya kurang, melainkan karena rasa '
    + 'memilikinya jarang ikut datang.');
  assert.ok(checksIn(validateRendering(inProse, CHART_1)).includes('style.hedge_construction'));

  const inPenutup = goodReading();
  inPenutup.penutup = 'Kamu bukan orang yang lambat, tapi orang yang menunggu pemicunya.';
  assert.ok(checksIn(validateRendering(inPenutup, CHART_1)).includes('style.hedge_construction'));
});

test('"BUKAN BERARTI" IS CARVED OUT - it negates a misreading, it does not hedge', () => {
  // Reyner's ruling A on the 2026-08-06 rejection gallery. hedge_construction was
  // the largest rejection cause in the pipeline, and the gallery showed its most
  // common trigger was this exact sentence - which is the resolve-in-the-same-breath
  // move rule 21 REQUIRES, not the hedge the ban was written for.
  //
  //   "bukan berarti X"  negates a MISREADING the label invites   -> allowed
  //   "bukan X tapi Y"   substitutes one claim for another        -> banned
  const carved = withBlockText(goodReading(), 'strength_weak',
    'Kamu Api Lemah. Lemah di sini bukan berarti tidak mampu, melainkan sumber '
    + 'tenagamu ada di luar dirimu. Tempat yang tepat membuatmu melesat, dan tempat '
    + 'yang salah menguras habis cadanganmu.');
  assert.ok(!checksIn(validateRendering(carved, CHART_1)).includes('style.hedge_construction'),
    'the sentence rule 21 asks for must not be rejected');

  // The ban still catches what it was built for, INCLUDING when a carved-out
  // phrase appears earlier in the same breath - the lookahead skips that one
  // occurrence, it does not disarm the check.
  const stillBanned = goodReading();
  stillBanned.penutup = 'Bukan berarti mudah. Kamu bukan penunggu, tapi penggerak.';
  assert.ok(checksIn(validateRendering(stillBanned, CHART_1))
    .includes('style.hedge_construction'), 'a real hedge after a carve-out still fails');
});

test('tension-collapse vocabulary is caught', () => {
  // Run 1 turned the steward/self-reliant tension into "menyatu secara selaras
  // ... membentuk identitas utuh" - neutering the one fact Reyner confirms he
  // lives.
  const bad = withBlockText(goodReading(), 'profile_vs_favorable',
    'Pilar Kerja. Dua sisi ini akhirnya menyatu dan membentuk identitas utuh yang khas milikmu.');
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('style.tension_collapse'));
});

test('typography, hanzi, questions and arithmetic are all caught', () => {
  const cases = [
    ['style.typography', 'Kamu tahu arahmu — dan kamu tetap berjalan pelan setiap harinya.'],
    ['style.hanzi', 'Cabang bulanmu adalah 酉, dan itu menentukan tekanan yang kamu rasakan.'],
    ['style.rhetorical_question', 'Bagian mana dari dirimu yang paling butuh ruang sekarang?'],
    ['style.arithmetic', 'Air mengisi 37% dari petamu, jadi apimu jarang menyala penuh.'],
    ['style.bare_polarity', 'Kamu Api Yang, dan itu membuat caramu hadir terasa terbuka.'],
    ['style.slang', 'Kamu ngerasa capek terus padahal kerjanya tidak seberapa berat.'],
    ['style.particles', 'Itu tuh yang bikin kamu bertahan lama di tempat yang sama.'],
    // `mungkin` about the READER still fires - see the split test below.
    ['style.hedging', 'Kamu mungkin akan merasa lebih ringan setelah membaca ini semua.'],
    // `style.adverbial` was DELETED 2026-08-17. It is deliberately not replaced
    // here: the check is gone, so a case asserting it fires would assert the
    // opposite of the ruling.
    ['style.meta', 'Sebagai AI, saya membaca petamu dan menemukan pola yang menarik.'],
    ['style.essay_connectives', 'Hal ini membuat kamu terlihat tenang di mata orang lain.'],
  ];
  for (const [check, sentence] of cases) {
    const bad = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Satu kalimat lagi supaya blok ini punya panjang yang wajar.`);
    assert.ok(checksIn(validateRendering(bad, CHART_1)).includes(check), `${check} not caught`);
  }
});

test('THE QUESTION BAN POLICES THE MODEL, NOT THE DICTIONARY', () => {
  // Ruled by Reyner 2026-08-11, on the hedge_construction precedent: the gate
  // polices what the model improvises, never engine-authored prose.
  //
  // The ban fired on every "?" including the ones inside ruled glossary seeds,
  // which the module-assembly floor copies VERBATIM - so it was rejecting
  // Reyner's own sentences and, across every run measured, never once the
  // failure it was written for (0 of 130 on the current prompt, 0 of 520 on
  // three neighbours). The failure itself is real and stays banned:
  // renderer-prompt.txt names and quotes it.
  //
  // hasUnsanctionedQuestion is tested directly with an injected list, because
  // whether any glossary cell currently carries a "?" is a content question that
  // changes tranche by tranche, and this behaviour must not.
  const seed = 'Sebelum mengambil peran baru, tanya ke diri sendiri: siapa yang akan '
    + 'mengisi ulang energiku di sini?';
  const invented = 'Bagian mana dari dirimu yang paling butuh ruang sekarang?';

  assert.equal(hasUnsanctionedQuestion(seed, [seed]), false,
    'an engine-authored question is sanctioned');
  assert.equal(hasUnsanctionedQuestion(`Pembuka. ${seed} Penutup.`, [seed]), false,
    'and stays sanctioned when the reading wraps prose around it');
  assert.equal(hasUnsanctionedQuestion(invented, [seed]), true,
    'a question the engine did not author still fails');
  assert.equal(hasUnsanctionedQuestion(`${seed} ${invented}`, [seed]), true,
    'one sanctioned question does not launder a second, invented one');

  // A REWRITE is not the sanctioned sentence. The prompt orders the renderer to
  // rewrite rather than copy, so this is what keeps the model policed: only the
  // floor, which copies verbatim, is exempt.
  const rewritten = 'Sebelum ambil peran baru, tanyakan siapa yang akan mengisi energimu?';
  assert.equal(hasUnsanctionedQuestion(rewritten, [seed]), true,
    'a paraphrased question is the model improvising and must still fail');

  // With no engine questions at all - main's glossary today - nothing changes.
  assert.equal(hasUnsanctionedQuestion(invented, []), true);
  assert.equal(hasUnsanctionedQuestion('Tidak ada pertanyaan di sini.', []), false);
});

test('an unsanctioned English bracket is caught, a glossary one is not', () => {
  // Rule 23 sanctions exactly one English use: the bracket after an Indonesian
  // name, once. The allowlist is DERIVED from glossary name_en values, so a new
  // entry is sanctioned automatically and no second list can drift.
  const invented = withBlockText(goodReading(), 'day_master_Fire',
    'Inti dirimu adalah Api (Solar Yang Energy), dan itu terasa di caramu hadir.');
  assert.ok(checksIn(validateRendering(invented, CHART_1)).includes('style.unsanctioned_bracket'));

  // The floor writes "Bunga Persik (Peach Blossom)" and must not be flagged.
  assert.ok(!checksIn(validateRendering(goodReading(), CHART_1))
    .includes('style.unsanctioned_bracket'));
});

test('the style allowance is per-provider, and there is only ONE provider now', () => {
  // Was "OpenAI output is graded on the same checks, with its own allowance knob".
  // The openai arm went with the provider on 2026-08-22, and removing it changed
  // nothing: its allowance was 0, IDENTICAL to gemini, so the "own knob" was never
  // actually looser. module_assembly is the other live value and is also 0.
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    'Kamu bukan orang yang lambat, tapi orang yang menunggu pemicunya dari luar.');
  for (const provider of ['gemini', 'module_assembly']) {
    const result = validateRendering(bad, CHART_1, { provider });
    assert.ok(checksIn(result).includes('style.hedge_construction'), provider);
  }
  assert.deepEqual(Object.keys(STYLE_PARAMS.allowance).sort(), ['gemini', 'module_assembly'],
    'a provider key here that cannot occur is an availability illusion');
});

// ── 5. STRUCTURE ───────────────────────────────────────────

test('3+ newlines normalise, a lone newline is rejected, and the normalised text is returned', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'day_master_Fire');
  const body = `${fact.label_meaning} ${fact.gift}`;

  const collapsed = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${body}\n\n\n\n${fact.cost}`);
  const ok = validateRendering(collapsed, CHART_1);
  const block = ok.normalized.blocks.find((b) => b.fact_ids.includes('day_master_Fire'));
  assert.ok(block.text.includes('\n\n'), 'the break survives');
  assert.ok(!/\n{3,}/.test(block.text), '3+ newlines must collapse to 2');
  assert.ok(!checksIn(ok).includes('structure.stray_newline'));

  const stray = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${body}\n${fact.cost}`);
  assert.ok(checksIn(validateRendering(stray, CHART_1)).includes('structure.stray_newline'));
});

test('more than two paragraph breaks in one block is rejected', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'day_master_Fire');
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${fact.label_meaning}\n\n${fact.gift}\n\n${fact.cost}\n\nSatu bagian lagi.`);
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('structure.too_many_breaks'));
});

// ── 6. THE FOUR CHECKS FROM REYNER'S BLIND-JUDGING NOTES ───
// All four are POST-GATE MISSES, not speculative hardening. The 2026-08-02 pairs
// file holds only text the gate PASSED (measure-stage6.mjs records a result for
// judging only when `!fallback`, and renderReading returns non-fallback solely from
// the gate.ok branch), and the defects below were found in it. Counts over its 32
// samples: 1 duplicate sentence, 2 unparagraphed walls, 0 code leaks, 0 disclaimers.
// The last two were cheap insurance; the first two were live escapes.

test('THE 17-SENTENCE WALL IS FIXED, NOT REJECTED, AND THE WORDS SURVIVE', () => {
  // The actual escape, reconstructed to its measured shape: chart 3 of the
  // 2026-08-02 pairs file shipped 954 characters of 17 unbroken sentences THROUGH
  // the gate. Reyner's rule (08-05) made it a rejection; his 08-06 ruling makes it
  // a deterministic FIX, because the renderer never emits a break and so could
  // never satisfy the rule by being asked (0 of 31 blocks, measured).
  const wallText = `${'Kamu bergerak lebih dulu dan menimbang belakangan. '.repeat(17)}`.trim();
  assert.equal(sentences(wallText).length, 17, 'fixture must be the observed 17 sentences');
  // Under 1100 chars, so the SENTENCE limb is what triggers the insert.
  assert.ok(wallText.length < STRUCTURE_PARAMS.maxCharsUnbroken,
    `the backstop must NOT be what triggers it (${wallText.length} chars)`);

  const result = validateRendering(
    withBlockText(goodReading(), 'day_master_Fire', wallText), CHART_1,
  );
  const block = result.normalized.blocks.find((b) => b.fact_ids.includes('day_master_Fire'));

  // 1. It PASSES.
  assert.ok(!checksIn(result).includes('structure.unparagraphed'),
    'the wall must be fixed, not rejected');
  // 2. It came out with exactly one break.
  assert.equal((block.text.match(/\n\n/g) || []).length, 1, 'exactly one break inserted');
  // 3. THE BREAK IS AT A SENTENCE BOUNDARY - the character before it terminates.
  assert.match(block.text, /[.!?]\n\n/, 'the break must land on a sentence boundary');
  // 4. THE WORDS ARE BYTE-IDENTICAL. Only a whitespace run changed, which is the
  //    whole rule-20 boundary: the gate inserts paragraph breaks, never words.
  assert.equal(block.text.replace(/\s+/g, ' '), wallText.replace(/\s+/g, ' '),
    'not one non-whitespace character may change');
  // 5. It is counted as a fix, not a failure.
  assert.equal(result.metrics.paragraph_inserts, 1);

  // Near the midpoint, so neither half is a wall in its own right.
  const [first, second] = block.text.split('\n\n');
  assert.ok(Math.abs(first.length - second.length) < wallText.length / 3,
    'the break should land near the middle, not at the first boundary it finds');
});

test('AN 8-SENTENCE BLOCK IS LEFT ALONE, BYTE FOR BYTE', () => {
  // The other direction. A rule that reformatted ordinary blocks would be a style
  // opinion wearing a formatter's name, and it would rewrite cached readings for
  // no reason.
  const fine = `${'Kamu membaca situasi lebih cepat daripada kamu menjelaskannya. '.repeat(8)}`.trim();
  assert.equal(sentences(fine).length, 8, 'exactly at the limit, not over it');
  assert.ok(fine.length < STRUCTURE_PARAMS.maxCharsUnbroken);

  const result = validateRendering(
    withBlockText(goodReading(), 'day_master_Fire', fine), CHART_1,
  );
  const block = result.normalized.blocks.find((b) => b.fact_ids.includes('day_master_Fire'));
  assert.equal(block.text, fine, 'an 8-sentence block must come back untouched');
  assert.equal(result.metrics.paragraph_inserts, 0);
  assert.ok(!checksIn(result).includes('structure.unparagraphed'));
});

test('a block with NO sentence boundary still fails - nothing can format it', () => {
  // The one case the reformatter cannot rescue: a single enormous sentence. There
  // is nowhere to put a break, so it stays a genuine wall and stays a rejection.
  const oneSentence = `Kamu ${'terus bergerak dan menimbang serta menata ulang '.repeat(30)}sekali lagi`;
  assert.equal(sentences(oneSentence).length, 1);
  assert.ok(oneSentence.length > STRUCTURE_PARAMS.maxCharsUnbroken);

  const result = validateRendering(
    withBlockText(goodReading(), 'day_master_Fire', oneSentence), CHART_1,
  );
  assert.ok(checksIn(result).includes('structure.unparagraphed'));
  assert.equal(result.metrics.paragraph_inserts, 0, 'nothing was inserted');
  const f = result.findings.find((x) => x.check === 'structure.unparagraphed');
  assert.match(f.message, /no sentence boundary/);
});

test('A DENSE 5-SENTENCE BLOCK OF ~750 CHARACTERS PASSES', () => {
  // The other direction, and the whole reason the unit changed from characters to
  // sentences. The retired 700-character floor rejected this; it is not a wall.
  // A character count cannot tell a wall from a dense paragraph - what made the
  // judging-set block unreadable was 17 consecutive sentences, not its width.
  const dense = `${'Kamu membaca situasi lebih cepat daripada kamu menjelaskannya, sehingga orang lain menyangka keputusanmu datang tanpa pertimbangan sama sekali. '.repeat(5)}`.trim();
  assert.equal(sentences(dense).length, 5, 'five sentences');
  assert.ok(dense.length > 600 && dense.length < 800, `~750 chars, got ${dense.length}`);
  assert.ok(dense.length > 700,
    `and would have FAILED the retired 700-character floor (${dense.length} chars)`);

  const reading = withBlockText(goodReading(), 'day_master_Fire', dense);
  assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('structure.unparagraphed'));
});

test('the 1100-character backstop catches few-but-enormous sentences', () => {
  // Eight sentences satisfy the sentence rule, so without the backstop a block of
  // eight 200-character sentences would pass as a paragraph. Reyner's ruling names
  // this case: over 1100 characters breaks regardless of sentence count.
  const long = `${'Kamu terbiasa menyelesaikan banyak hal sendiri sampai orang lain berhenti menawarkan bantuan, dan pada titik itu kemandirian berubah menjadi beban yang tidak pernah kamu sebut. '.repeat(8)}`.trim();
  assert.ok(sentences(long).length <= STRUCTURE_PARAMS.maxSentencesUnbroken,
    'must satisfy the sentence rule, so only the backstop can catch it');
  assert.ok(long.length > STRUCTURE_PARAMS.maxCharsUnbroken, `over 1100, got ${long.length}`);

  // As of gate 1.5.0 the backstop TRIGGERS THE INSERT rather than a rejection, on
  // the same terms as the sentence limb.
  const result = validateRendering(
    withBlockText(goodReading(), 'day_master_Fire', long), CHART_1,
  );
  const block = result.normalized.blocks.find((b) => b.fact_ids.includes('day_master_Fire'));
  assert.equal(result.metrics.paragraph_inserts, 1, 'the backstop must trigger the insert');
  assert.match(block.text, /[.!?]\n\n/, 'at a sentence boundary');
  assert.equal(block.text.replace(/\s+/g, ' '), long.replace(/\s+/g, ' '), 'words unchanged');
  assert.ok(!checksIn(result).includes('structure.unparagraphed'));
});

test('an ordinary block is never asked to paragraph', () => {
  // A rule that made every block break would be a style opinion wearing a structure
  // check's name. The module floor is the reference for ordinary.
  const clean = validateRendering(goodReading(), CHART_1);
  assert.ok(!checksIn(clean).includes('structure.unparagraphed'));
});

test('the same sentence twice in one reading is rejected', () => {
  // OBSERVED post-gate: chart 3 said "Baganmu berdiri di titik tengah yang stabil."
  // twice, two sentences apart, inside one block.
  const fact = CHART_1.facts.find((f) => f.id === 'day_master_Fire');
  const repeated = `Api (Fire). ${fact.label_meaning} ${fact.gift} ${fact.label_meaning}`;
  const bad = withBlockText(goodReading(), 'day_master_Fire', repeated);
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('structure.duplicate_sentence'));
});

test('duplicate detection spans BLOCKS, and ignores punctuation and case', () => {
  const reading = goodReading();
  const sentence = 'Tempat yang tepat membuatmu bergerak jauh lebih cepat dari biasanya';
  reading.blocks[0].text += ` ${sentence}.`;
  reading.blocks[1].text += ` ${sentence.toUpperCase()}!`;
  assert.ok(checksIn(validateRendering(reading, CHART_1))
    .includes('structure.duplicate_sentence'), 'a restatement across blocks still repeats');
});

test('a SHORT sentence may recur; only substantial ones count', () => {
  // Prefer a pattern that misses over one that rejects real readings (blocklist
  // _README, and the 33-of-133 false-positive episode of 2026-08-02).
  const reading = goodReading();
  const short = 'Itu wajar.';
  assert.ok(short.length < STRUCTURE_PARAMS.minDuplicateSentenceChars);
  reading.blocks[0].text += ` ${short}`;
  reading.blocks[1].text += ` ${short}`;
  assert.ok(!checksIn(validateRendering(reading, CHART_1))
    .includes('structure.duplicate_sentence'));
});

test('a raw variable or code string in the prose is rejected', () => {
  const leaks = [
    'Pilar Kerjamu membawa label_meaning yang kuat.', // snake_case
    'Pilar Kerjamu membawa supportShare yang tinggi.', // camelCase
    'Pilar Kerjamu membawa {fact_ids} di dalamnya.', // braces
    'Pilar Kerjamu ada di Pilar null dan terasa jelas.', // a leaked missing value
    'Pilar Kerjamu terbaca dari provenance bagan ini.', // the one bare-word field
  ];
  for (const text of leaks) {
    const bad = withBlockText(goodReading(), 'day_master_Fire', `Api (Fire). ${text}`);
    assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('style.code_leak'),
      `not caught: ${text}`);
  }
});

test('the code-leak check does not fire on a correct reading', () => {
  // The camelCase pattern is case-SENSITIVE for this reason; under the default
  // case-insensitive flags it reduces to [a-z]+[a-z] and matches every word in the
  // language. It flagged all 398 glossary strings before the flag was pinned.
  assert.ok(!checksIn(validateRendering(goodReading(), CHART_1)).includes('style.code_leak'));
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    assert.ok(!checksIn(validateRendering(goodReading(semantic), semantic,
      { provider: 'module_assembly' })).includes('style.code_leak'), `chart ${tc.id}`);
  }
});

test('THE RAW PILLAR IS REJECTED; THE PALACE NAME IS NOT', () => {
  // Added 2026-08-06 with the prompt fix it enforces. renderer-prompt used to BAN
  // "pilar hari" in one section and ENCOURAGE "ini datang dari pilar harimu" in
  // another; the renderer followed the encouragement and wrote "Fondasi Pasanganmu
  // berada di pilar hari" on chart 5. The contradiction is resolved in the same
  // commit, so this ban enforces a rule the prompt now states only once.
  const fact = CHART_1.facts.find((f) => f.id === 'spouse_palace');
  const tail = `${fact.label_meaning} ${fact.gift} ${fact.cost}`;

  for (const raw of ['pilar hari', 'pilar harimu', 'pilar bulan', 'pilar tahun', 'pilar jam']) {
    const bad = withBlockText(goodReading(), 'spouse_palace',
      `Fondasi Pasanganmu berada di ${raw}. ${tail}`);
    assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('style.raw_pillar'),
      `not caught: ${raw}`);
  }

  // The four palace names must survive. They are capital-P and never followed by a
  // pillar word, which is what keeps the pattern from eating correct prose.
  for (const good of ['Pilar Diri', 'Pilar Kerja', 'Pilar Akar', 'Pilar Arah']) {
    const ok = withBlockText(goodReading(), 'spouse_palace',
      `Fondasi Pasanganmu berada di ${good}. ${tail}`);
    assert.ok(!checksIn(validateRendering(ok, CHART_1)).includes('style.raw_pillar'),
      `false positive on ${good}`);
  }

  // And the module floor, which names palaces on every block, stays clean.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    assert.ok(!checksIn(validateRendering(goodReading(semantic), semantic,
      { provider: 'module_assembly' })).includes('style.raw_pillar'), `chart ${tc.id}`);
  }
});

test('a mid-reading system disclaimer is rejected', () => {
  const disclaimers = [
    'Ini bukan nasihat medis untuk kondisimu.',
    'Catatan: pembacaan berikut bersifat umum.',
    'Perlu diingat bahwa setiap orang berbeda.',
    'Bacaan ini hanya menggambarkan kecenderungan umum.',
    'Sebagai model bahasa, saya membaca pola dari bagan.',
    'Uraian di atas tidak dimaksudkan sebagai kepastian.',
  ];
  for (const text of disclaimers) {
    const bad = withBlockText(goodReading(), 'day_master_Fire', `Api (Fire). ${text}`);
    assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('style.meta'),
      `not caught: ${text}`);
  }
});

test('THE DISCLAIMER CHECK DOES NOT FIRE ON "Sebagai Air"', () => {
  // The `\b` after AI in the meta pattern is load-bearing. Without it, "Sebagai Air
  // (Water)" matches - correct prose on every Water chart, and the exact shape of
  // the bare_polarity/`yang` and english_leakage/`the` false positives that cost 33
  // rejections on 2026-08-02. A scan written for this session's audit reproduced the
  // bug and flagged a real chart-4 reading; the shipped pattern does not.
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    'Sebagai Air (Water) dengan arketipe Embun, kamu menyesuaikan diri tanpa kehilangan arah.');
  assert.ok(!checksIn(validateRendering(bad, CHART_1)).includes('style.meta'));
});

// ── the regeneration directive ─────────────────────────────

test('the stricter directive names the failures and omits the flags', () => {
  const bad = withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.');
  const result = validateRendering(bad, CHART_1);
  const directive = stricterDirective(result.findings);

  assert.ok(directive.includes('REGENERATION'));
  for (const f of result.findings.filter((x) => x.severity !== 'flag')) {
    assert.ok(directive.includes(f.check), `directive omitted ${f.check}`);
  }
  assert.ok(!directive.includes('[coverage.slot_filling]'), 'a flag is not a failure to fix');
});

// ── the payload scrub (the sanctioned engine line) ─────────

test('internal_only fields never reach a provider', () => {
  // The marker existed on three facts since Stage 3 was written and NOTHING read
  // it. confidence_reasons joined it on 2026-08-02 because it ships English with
  // hanzi ("root 巳 pulled toward Metal by 半合") to a renderer banned from both.
  assert.ok(internalFieldNames(CHART_1).includes('confidence_reasons'));
  assert.ok(internalFieldNames(CHART_1).includes('support_share'));

  const sent = JSON.stringify(scrubInternal(CHART_1));
  // These two are marked everywhere they occur, so they must be gone globally.
  for (const field of ['confidence_reasons', 'support_share']) {
    assert.ok(!sent.includes(`"${field}"`), `${field} survived the scrub`);
  }
  assert.ok(!sent.includes('internal_only'), 'naming the marker to a model invites a mention');

  // `percent` is NOT asserted globally, and the reason is a REPORTED Stage 3
  // inconsistency rather than a gap here: element_dominant_* declares
  // internal_only ['provenance.percent'] and element_missing_* does not, so a
  // zero percent still reaches the provider. The scrub honours each marker where
  // it is declared; it cannot honour one that was never written.
  const scrubbed = scrubInternal(CHART_1);
  const dominant = scrubbed.facts.find((f) => f.id.startsWith('element_dominant_'));
  if (dominant) assert.ok(!('percent' in dominant.provenance), 'a declared path must be honoured');

  // The record itself is untouched: the key was taken over the full object.
  assert.ok(JSON.stringify(CHART_1).includes('confidence_reasons'));
});

// ── the data files are data, and must stay loadable ────────

test('every blocklist pattern compiles and carries a note', () => {
  // Prompt H: the lists are data files with their own schema test, so a
  // malformed edit fails CI rather than production. Reyner can extend them
  // without a code deploy, and this is what makes that safe.
  let count = 0;
  for (const group of ['forbidden_content', 'style']) {
    for (const [category, entries] of Object.entries(BLOCKLIST[group])) {
      if (category.startsWith('_')) continue;
      assert.ok(Array.isArray(entries), `${group}.${category} must be an array`);
      assert.ok(entries.length > 0, `${group}.${category} is empty`);
      for (const entry of entries) {
        assert.equal(typeof entry.pattern, 'string', `${group}.${category} pattern`);
        assert.ok(entry.note && entry.note.length > 10,
          `${group}.${category} /${entry.pattern}/ needs a note saying why it exists`);
        assert.doesNotThrow(() => new RegExp(entry.pattern, 'iu'),
          `${group}.${category} /${entry.pattern}/ does not compile`);
        count += 1;
      }
    }
  }
  assert.ok(count > 30, `only ${count} patterns loaded`);
  assert.ok(CATEGORIES.forbidden.length >= 5 && CATEGORIES.style.length >= 8);
});

test('NO ENGINE STRING WOULD TRIP THE STYLE GATE', () => {
  // The invariant that makes this gate safe to point at rendered text.
  //
  // Until f068352 the glossary itself held `secara `, `cenderung` and `mungkin`,
  // so these regexes would have rejected readings for faithfully carrying
  // Reyner-reviewed engine content - the gate punishing the renderer for obeying
  // the engine. The ban-sweep cleaned all 12. This asserts it stays clean, and
  // will fail the moment a new entry reintroduces one.
  const offenders = [];
  const patterns = [];

  // Scoped to the fields lib/semantic/glossary.js#contentFrom actually reads
  // into the semantic JSON, because those are the only strings that can reach
  // prose. Checking every string in the file instead would flag internal
  // descriptors that no renderer ever sees.
  //
  // Two such descriptors exist and BOTH carry bare yin/yang, which golden rule 5
  // bans in prose: `arketipe.*.element` ("Api Yang") and `salah_dikira.*.name_id`
  // ("Api Yang" again). Neither is wired into a fact today. Both are REPORTED
  // rather than silently exempted, because the day one is wired in, the gate
  // will reject every reading that names it and the cause will not be obvious.
  const RENDERED_FIELDS = new Set([
    'name_id', 'label_meaning', 'gift_seed', 'cost_seed', 'actionable_seed',
    'branch_name_id', 'branch_label_meaning', 'line',
  ]);
  const EXEMPT = /^glossary\.salah_dikira\./;
  // Compiled with EACH ENTRY'S OWN FLAGS, exactly as lib/validate/style.js#compile
  // does. Hardcoding 'iu' here made this test stricter than the gate it guards, and
  // for a case-sensitive pattern that is not caution but a false alarm: the
  // case-insensitive form of `code_leak`'s camelCase regex is `[a-z]+[a-z]`, which
  // matches every word in the language, so this test reported all 398 glossary
  // strings as offenders against a pattern the gate would never have fired.
  for (const [category, entries] of Object.entries(BLOCKLIST.style)) {
    if (category.startsWith('_')) continue;
    for (const entry of entries) {
      patterns.push([category, new RegExp(entry.pattern, entry.flags || 'iu')]);
    }
  }

  (function walk(node, path) {
    if (typeof node === 'string') {
      if (path.includes('_note') || path.includes('_README') || EXEMPT.test(path)) return;
      if (!RENDERED_FIELDS.has(path.split('.').at(-1))) return;
      for (const [category, regex] of patterns) {
        if (regex.test(node)) offenders.push(`${path} [${category}]: ${node.slice(0, 70)}`);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    }
  }(GLOSSARY, 'glossary'));

  assert.deepEqual(offenders, []);
});

test('distinctive stems ignore function words and short words', () => {
  const stems = distinctiveStems('Kamu yang tidak pernah bersandar pada keberuntungan');
  assert.ok(!stems.includes('kamu'), 'a stopword is not evidence of paraphrase');
  assert.ok(stems.some((s) => 'bersandar'.startsWith(s)));
  assert.equal(stemOverlap('', 'apa pun').ratio, 1, 'an empty source can never fail a block');
});

// ── the failstates (Prompt H) ──────────────────────────────
// Fail -> regenerate ONCE with a stricter directive. Fail twice -> module floor
// + flag for QA. Exercised through the real chain with an injected fetch.

const geminiSays = (text) => ({
  ok: true, status: 200,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  text: async () => text,
});

async function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k];
  }
  try { return await fn(); } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const asResponse = (reading) => JSON.stringify(reading);

// A REAL provider HTTP error, matching the shape the 503 test builds inline. Added
// 2026-08-22 because two new tests referenced an `httpError` that did not exist here:
// the fetchImpl threw a ReferenceError, renderReading handled it as a transport failure,
// and BOTH TESTS PASSED FOR THE WRONG REASON. eslint no-undef caught it; the runtime
// could not, because a thrown fetch and a 503 look identical from inside the loop.
const httpError = (status) => ({
  ok: false, status, text: async () => String(status), json: async () => ({}),
});
const GOOD = asResponse(goodReading());
const BAD = asResponse(withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.'));

test('a Stage 6 failure regenerates ONCE, and the retry carries the directive', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const systems = [];
    const out = await renderReading(CHART_1, {
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(init.body);
        systems.push(body.systemInstruction.parts[0].text);
        return geminiSays(systems.length === 1 ? BAD : GOOD);
      },
    });

    assert.equal(systems.length, 2, 'exactly one regeneration');
    assert.ok(!systems[0].includes('REGENERATION'), 'the first call is the clean prompt');
    assert.ok(systems[1].includes('REGENERATION'), 'the retry must be told what was wrong');
    assert.ok(systems[1].includes('fact.strength_'), 'and told WHICH check failed');
    assert.ok(systems[1].startsWith(MASTER_PROMPT), 'the master prompt stays the verbatim front');

    assert.equal(out.source, 'gemini');
    assert.equal(out.stage6_version, STAGE6_VERSION);
    assert.equal(out.attempts.at(-1).regenerated, true);
  });
});

test('failing THREE times serves the floor and flags the chart for QA', async () => {
  // WAS "failing TWICE" until 2026-08-19, when the regeneration budget went from
  // one to two on the depth-sweep evidence (gate floor 18% -> 3%). The shape of
  // the guarantee is unchanged: the budget is spent, then the floor, never the
  // secondary provider.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return geminiSays(BAD); },
    });

    assert.equal(calls, 3, 'one original plus TWO regenerations, then stop');
    assert.equal(out.source, 'module_assembly');
    assert.equal(out.qa_flag, 'stage6_budget_spent');
    assert.ok(out.findings.length > 0, 'the reason must survive onto the QA row');
    // The floor is engine content, so no gate ran over it. Marked, not faked.
    assert.equal(out.stage6_version, `${STAGE6_VERSION}-floor`);
    assert.ok(out.blocks.length > 0, 'the product never hard-fails on the free mirror');
  });
});

test('a floor result is NOT stored, and says so in its return value', async () => {
  // SUPERSEDED 2026-08-07. This test used to assert the opposite - that the
  // floor was stored under a `-floor` gate marker so a QA row could tell it from
  // a validated render at a glance. The marker still exists and is still on the
  // in-memory result; what changed is that the row is never written.
  //
  // Rule 16, as amended and ratified by Reyner: storing the floor let one
  // provider outage cost those charts their real reading PERMANENTLY, because
  // the next request is a cache hit and the chain never runs again. Determinism
  // now attaches to the first generation that PASSES STAGE 6.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(BAD) });
    assert.equal(out.source, 'module_assembly');
    assert.equal(out.stage6_version, `${STAGE6_VERSION}-floor`);

    assert.equal(await persistRendered(out, CHART_1), false, 'the floor must not be stored');
    assert.equal(await readCache(out.cache_key), null);
    // Not even as an unservable row: a stored floor would be a cache hit for
    // every later request, and includeUnvalidated is the QA door, not a loophole.
    assert.equal(await readCache(out.cache_key, { includeUnvalidated: true }), null);
  });
});

test('THE REGENERATION BUDGET IS REACHABLE — it was INERT before 2026-08-19', async () => {
  // ── THIS TEST EXISTS BECAUSE THE ARGUMENT DID NOTHING ──────
  // A single `attempt <= config.attemptsPerProvider` loop bounded transport
  // retries AND regenerations together, so with attemptsPerProvider 2, budgets of
  // 1, 2 and 3 all produced exactly TWO provider calls. Measured before the fix,
  // which is the only reason it was noticed: setting the budget to 2 would have
  // changed nothing and looked like it had.
  //
  // So the assertion is not "the budget is 2" - that is one constant and easy to
  // read. It is that MOVING the budget MOVES the call count, which is the property
  // that was false. A future change to attemptsPerProvider cannot silently cap it
  // again without failing here.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    for (const [budget, expected] of [[0, 1], [1, 2], [2, 3], [3, 4]]) {
      __clearMemCache();
      let calls = 0;
      await renderReading(CHART_1, {
        validationRetries: budget,
        fetchImpl: async () => { calls += 1; return geminiSays(BAD); },
      });
      assert.equal(calls, expected,
        `validationRetries ${budget} must produce ${expected} calls, not ${calls} - `
        + 'the budget is capped by something else again');
    }
  });
});

test('A TRANSPORT FAILURE DOES NOT SPEND THE REGENERATION BUDGET', async () => {
  // The loop's own comment claimed this for months and the loop did not do it:
  // "sharing one counter between them would let two timeouts consume the budget
  // for a validation problem that was never diagnosed." They shared one counter.
  //
  // A 503 and a reading that says "kuat" about a weak chart are different events.
  // Here the first call 503s and every later one fails the GATE, so the full
  // regeneration budget must still be available afterwards: 1 transport failure
  // + 1 original + 2 regenerations = 4 calls. Under the old shared counter this
  // stopped at 2.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return { ok: false, status: 503, text: async () => 'x', json: async () => ({}) };
        return geminiSays(BAD);
      },
    });
    assert.equal(calls, 4, 'a 503 must cost the TRANSPORT budget and leave both regenerations');
    // And the gate attempts are distinguishable from the transport one on the
    // attempts[] trail, which is what the measurement harness reads.
    const gateAttempts = out.attempts.filter((a) => a.stage6);
    assert.equal(gateAttempts.length, 3, 'three attempts actually reached Stage 6');
    assert.equal(out.attempts.filter((a) => a.error).length, 1, 'exactly one transport failure');
    assert.equal(out.source, 'module_assembly', 'and the budget spent still lands on the floor');
  });
});

test('validationRetries 0 measures the FIRST-PASS rate', async () => {
  // The number that says whether the PROMPT works, as distinct from whether the
  // pipeline works. The harness needs both.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      validationRetries: 0,
      fetchImpl: async () => { calls += 1; return geminiSays(BAD); },
    });
    assert.equal(calls, 1, 'no regeneration budget means no regeneration');
    assert.equal(out.source, 'module_assembly');
  });
});

test('a transport failure does not count against the FIRST-PASS rate', async () => {
  // The harness reads first-pass off attempts[]: the first attempt that actually
  // reached Stage 6. A 503 never reached it, so a 503 followed by a clean render
  // is a first-pass PASS. Getting this backwards would make the prompt look
  // worse every time the provider had a bad afternoon, and prompt quality is
  // exactly what the number is for.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let call = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => {
        call += 1;
        if (call === 1) return { ok: false, status: 503, text: async () => 'x', json: async () => ({}) };
        return geminiSays(GOOD);
      },
    });

    const firstStage6 = out.attempts.find((a) => a.stage6 || a.ok === true);
    assert.equal(firstStage6.ok, true, 'the first attempt that reached the gate passed it');
    assert.ok(!out.attempts.some((a) => a.regenerated), 'no regeneration was spent');
    assert.equal(out.source, 'gemini');
  });
});

// ── false positives the FIRST LIVE BATCH exposed (2026-08-02) ──
// Both of these rejected correct Indonesian, and between them they accounted for
// 33 of the 133 rejections in the first run. A gate's own false-positive rate is
// part of its correctness, not a footnote.

test('bare_polarity does not fire on the relative pronoun "yang"', () => {
  // "yang" is the ordinary Indonesian relative pronoun. Case-insensitively this
  // pattern matched "api yang menyala" and rejected the reading. It is now
  // case-SENSITIVE, and that is the whole fix.
  const innocent = [
    'Ada api yang menyala pelan di dalam dirimu sepanjang hari ini.',
    'Air yang terlalu banyak membuat nyalamu tidak pernah penuh.',
    'Logam yang keras itu duduk di cabang bulanmu sejak awal.',
    'Tanah yang menopang langkahmu tidak pernah benar-benar goyah.',
  ];
  for (const sentence of innocent) {
    const reading = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Satu kalimat lagi supaya blok ini punya panjang yang wajar.`);
    assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('style.bare_polarity'),
      `false positive on: ${sentence}`);
  }

  // The real violation still fires: capitalised polarity as a label.
  const real = withBlockText(goodReading(), 'day_master_Fire',
    'Kamu Api Yang, dan itu membuat caramu hadir terasa terbuka sejak awal.');
  assert.ok(checksIn(validateRendering(real, CHART_1)).includes('style.bare_polarity'));
});

test('english_leakage ignores words inside a SANCTIONED bracket', () => {
  // Rule 23's EN display layer gives archetypes English names, and "The Sun"
  // contains "the". Scanning the raw text flagged a reading for obeying rule 23.
  const sanctioned = withBlockText(goodReading(), 'day_master_Fire',
    'Arketipemu adalah Matahari (The Sun), dan itu terlihat dari caramu mengisi ruangan.');
  const result = validateRendering(sanctioned, CHART_1);
  assert.ok(!checksIn(result).includes('style.english_leakage'), 'flagged a sanctioned bracket');
  assert.ok(!checksIn(result).includes('style.unsanctioned_bracket'));

  // English in the PROSE still fires.
  const leaked = withBlockText(goodReading(), 'day_master_Fire',
    'This is the pattern that shapes how you move through a room every single day.');
  assert.ok(checksIn(validateRendering(leaked, CHART_1)).includes('style.english_leakage'));
});

test('a blocklist entry may override the default regex flags', () => {
  const entry = BLOCKLIST.style.bare_polarity[0];
  assert.equal(entry.flags, 'u', 'bare_polarity must stay case-sensitive');
  assert.ok(entry.note.includes('CASE-SENSITIVE'), 'and must say why in its note');
});

test('a malformed response counts as a MODEL failure, not a transport failure', () => {
  // The harness splits fallbacks into quality vs provider. A schema violation is
  // the model failing to produce a reading, so crediting it to "transport" would
  // let a model that emits garbage look like a provider outage. Observed
  // 2026-08-02: one rider run was mislabelled exactly this way.
  const shapeErr = (() => {
    try { parseRenderResponse('not json at all'); return null; } catch (e) { return e; }
  })();
  assert.equal(shapeErr.name, 'RenderShapeError');

  // The chain tags it, and the tag is what the harness reads.
  const tagged = { provider: 'gemini', ok: false, error: shapeErr.message, shape: true };
  const transport = { provider: 'gemini', ok: false, error: 'gemini 503: boom' };
  assert.equal(tagged.shape, true);
  assert.ok(!transport.shape, 'an HTTP failure must not be tagged as a shape failure');
});

test('style.adverbial IS GONE, and `secara lengkap` is sayable again', () => {
  // RULED 2026-08-17 (Reyner, on the 2026-08-18 rejection gallery). `\bsecara \w+`
  // was a TOKEN ban for a CONSTRUCTION defect. Measured over 40 runs: 14 findings,
  // 9 of them the plain adverb `secara konsisten`, and not one the construction the
  // ban was written for.
  //
  // THIS TEST IS THE DEFERRED REGISTER ROW CLOSING. PROGRESS recorded
  // `secara lengkap` as "the gate rejects a sentence the product must be able to
  // say" - it is the hour-less disclosure, which the product has to be able to
  // print. It now passes.
  const hourless = withBlockText(goodReading(), 'day_master_Fire',
    'Tanpa jam lahir, petamu tetap bisa dibaca secara lengkap pada tiga pilar. '
    + 'Satu kalimat lagi supaya blok ini punya panjang yang wajar.');
  const checks = checksIn(validateRendering(hourless, CHART_1));
  assert.ok(!checks.includes('style.adverbial'), 'style.adverbial must no longer exist');
  assert.ok(!checks.some((c) => c === 'style.adverbial'), 'no adverbial finding may be produced');
});

test('style.hedging IS SPLIT: `mungkin` fires on the reader, not on a third party', () => {
  // RULED 2026-08-17. Golden rule 7 bans hedging INSIDE A CLAIM. `mungkin` in a
  // clause about someone else's PERCEPTION hedges their guess, and the claim about
  // her stays committed - which is also the `salah_dikira` shape the product's own
  // hook lines are built from. Measured: 14 of 15 `mungkin` findings over 40 runs
  // had a non-reader subject, so the gate was rejecting the signature move.
  //
  // BOTH DIRECTIONS ARE ASSERTED. A one-directional test here would let the check
  // be quietly gutted, which is the failure mode the `bare_polarity` and
  // `english_leakage` false positives already cost this pipeline once.
  const fires = (sentence) => {
    const bad = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Satu kalimat lagi supaya blok ini punya panjang yang wajar.`);
    return checksIn(validateRendering(bad, CHART_1)).includes('style.hedging');
  };

  // SUPPRESSED - the hedge is on someone else's guess, or on the world.
  assert.ok(!fires('Orang lain mungkin mengira kamu sulit ditebak, padahal tujuanmu selalu sama.'),
    'a third-party perception clause must not trip the hedge ban');
  assert.ok(!fires('Situasi mungkin berubah, tetapi kamu jarang ikut berubah.'),
    'a clause about the world must not trip the hedge ban');
  assert.ok(!fires('Mereka mungkin menilai hasilmu terlalu cepat.'),
    'mereka is a third party too');

  // STILL FIRES - the hedge is inside a claim about her.
  assert.ok(fires('Kamu mungkin menunda hal yang paling penting bagimu.'),
    'mungkin about the reader is the case the ban exists for');
  assert.ok(fires('Jalanmu mungkin tidak selalu lurus, namun arahnya tetap sama.'),
    'a possessive about the reader is still the reader');

  // UNTOUCHED - cenderung, agak and sepertinya stay in the blocklist.
  assert.ok(fires('Kamu cenderung bertahan di situasi yang sudah jelas.'),
    'cenderung was explicitly left as-is');
  assert.ok(fires('Kamu agak menahan diri ketika orang lain sedang bicara.'),
    'agak was explicitly left as-is');
  assert.ok(fires('Sepertinya kamu menunggu izin yang tidak akan datang.'),
    'sepertinya was explicitly left as-is');
});

// ── THE FUSED OPENING: COUNTED, NOT GATED (ruled 2026-08-21) ──

test('THE FUSED OPENING IS FLAGGED AND NEVER REJECTED', () => {
  // `Kamu adalah Api Matahari` puts the element in front of the image, which is the
  // shape Reyner rejected on chart 13. It is NOT closed and does not get a gate: a
  // rejecting check here is the same shape as the one that measured 0/4 -> 2/4 floors
  // and was refused, and it would be measured with the same n=1 instrument that
  // returned 0/4, 2/4 and 1/4 on identical code.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const fact = CHART_1.facts.find((f) => f.id === dmId);
  const arche = CHART_1.core.archetype_name_id;

  const fused = withBlockText(goodReading(), dmId,
    `Kamu adalah ${fact.label} ${arche} yang Lemah. ${fact.label_meaning}`);
  const result = validateRendering(fused, CHART_1);

  const flagged = result.findings.filter((f) => f.check === 'opening.element_fused');
  assert.equal(flagged.length, 1, `the fusion must be counted: ${checksIn(result).join(', ')}`);
  assert.equal(flagged[0].severity, 'flag', 'it must NOT be able to reject');
  // The load-bearing assertion: the verdict is unchanged by its presence.
  assert.equal(result.ok, result.findings.filter((f) => f.severity !== 'flag').length === 0);
});

test('the ruled opening is NOT flagged, and a missing archetype is not double-reported', () => {
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const fact = CHART_1.facts.find((f) => f.id === dmId);
  const arche = CHART_1.core.archetype_name_id;

  // Ruled: archetype alone, element in the next breath.
  const ruled = withBlockText(goodReading(), dmId,
    `Kamu adalah ${arche} (${CHART_1.core.archetype_name_en}) yang Lemah. ${fact.label_meaning}`);
  assert.ok(!checksIn(validateRendering(ruled, CHART_1)).includes('opening.element_fused'),
    'the ruled sentence must not be flagged');

  // And when the archetype is absent entirely, only the missing-name finding fires -
  // reporting both would double-count one defect.
  const absent = withBlockText(goodReading(), dmId, `Api (Fire). ${fact.label_meaning}`);
  const checks = checksIn(validateRendering(absent, CHART_1));
  assert.ok(checks.includes('opening.archetype_missing'));
  assert.ok(!checks.includes('opening.element_fused'), 'one defect, one finding');
});

test('INSERTION CANNOT LAUNDER A FUSED OPENING, which is why the flag exists', () => {
  // The exact sentence the 08-21 insertion run produced on chart 1:
  // "Kamu adalah Api Matahari (The Sun)." Rule 23 is satisfied; the fusion remains.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const fact = CHART_1.facts.find((f) => f.id === dmId);
  const arche = CHART_1.core.archetype_name_id;

  const result = validateRendering(withBlockText(goodReading(), dmId,
    `Kamu adalah ${fact.label} ${arche} yang Lemah. ${fact.label_meaning}`), CHART_1);

  assert.ok(!checksIn(result).includes('brackets.unbracketed'), 'insertion satisfied rule 23');
  assert.ok(checksIn(result).includes('opening.element_fused'), 'and the fusion is still counted');
});

// ── ONE PROVIDER, AND THE TRANSPORT RETRY SURVIVED IT ──────

test('A 503 IS STILL RETRIED AGAINST GEMINI after the OpenAI path was deleted', async () => {
  // The deletion's one real risk. `transportLeft` is scoped INSIDE
  // `for (const provider of chain)`, so collapsing that loop away - which looks like
  // tidying once the chain can only hold one entry - would have taken the 503 retry
  // with it. Reyner's ruling removed FAILOVER and kept the retry, and those are
  // different things: retrying a 503 against the same provider is not failover.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return httpError(503);
        return geminiSays(asResponse(goodReading()));
      },
      generation: { attemptsPerProvider: 2 },
    });
    assert.equal(calls, 2, 'the 503 must be retried against the SAME provider');
    assert.equal(out.source, 'gemini', 'and the retry must produce a real render');
  });
});

test('AN EXHAUSTED GEMINI FLOORS, and there is no second provider to catch it', async () => {
  // The consequence of the ruling, asserted rather than described. This is what a
  // Gemini outage or an exhausted balance looks like for every reader at once: the
  // floor. It is the availability budget now, and PROGRESS records that the
  // replacement mitigation is a balance alert that does not exist yet.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: 'test', KATON_OPENAI_MODEL: 'gpt-x' },
    async () => {
      const out = await renderReading(CHART_1, {
        fetchImpl: async () => httpError(503),
        generation: { attemptsPerProvider: 1 },
      });
      // Note the env above ARMS what used to be the secondary. It changes nothing,
      // which is the point: there is no code left to read those variables.
      assert.equal(out.source, 'module_assembly', 'the floor is the only failover');
    });
});

// ── THE HOUR CONTRADICTION: THE PROMPT WAS THE DEFECT ─────

test('THE HOUR CHECK IS CORRECT - it fires on the strings that were actually observed', () => {
  // Reproduced from paid prose in docs/qa/2026-08-18-retry-depth.json, 7 attempts that
  // fired this check. These are the LITERAL matched phrases, not invented fixtures, and
  // every one is a plain falsehood on an hour-bearing chart. The check is not firing on
  // ordinary Indonesian, so it is not the thing to relax.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const observed = [
    'Pilar jam lahirmu tidak dapat dipetakan',
    'jam lahir tidak diketahui',
    'waktu kelahiran tidak diketahui',
    'pilar jam tidak dapat dipetakan',
  ];
  assert.equal(CHART_1.hour_known, true, 'fixture assumption: this chart HAS an hour');
  for (const claim of observed) {
    const reading = withBlockText(goodReading(), dmId,
      `${claim} sehingga sebagian bacaan ini terbatas. `
      + CHART_1.facts.find((f) => f.id === dmId).label_meaning);
    assert.ok(checksIn(validateRendering(reading, CHART_1))
      .includes('fact.hour_known_contradiction'), `must catch: "${claim}"`);
  }
});

test('and it does NOT fire on prose that merely reads the hour pillar', () => {
  // The narrowness matters: a reading may name Pilar Arah, discuss the hour pillar, and
  // say some OTHER thing cannot be mapped, without tripping this.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const fine = withBlockText(goodReading(), dmId,
    'Pilar Arah membawa jam lahirmu ke dalam bacaan ini. '
    + CHART_1.facts.find((f) => f.id === dmId).label_meaning);
  assert.ok(!checksIn(validateRendering(fine, CHART_1))
    .includes('fact.hour_known_contradiction'), 'reading the hour pillar is not a contradiction');

  // And the always-available floor never trips it on an hour-bearing chart.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    if (semantic.hour_known !== true) continue;
    assert.ok(!checksIn(validateRendering(goodReading(semantic), semantic))
      .includes('fact.hour_known_contradiction'), `chart ${tc.id}: the floor must not trip it`);
  }
});

test('THE PROMPT NAMES BOTH BRANCHES, which is the actual fix', () => {
  // THE DEFECT WAS THE PROMPT, not the payload and not the check. The payload is right -
  // chart 13 carries hour_known=true and chart.hour="戊寅" - and the check fires only on
  // real falsehoods. But the prompt described ONLY the false branch:
  //
  //   "hour_known: if false, state once, plainly, that the fourth pillar cannot be mapped"
  //
  // which HANDS THE MODEL THE SENTENCE and gives it no counter-instruction. The observed
  // output was that sentence almost verbatim - "Pilar jam lahirmu tidak dapat dipetakan" -
  // on 6 of 7 occurrences, all at attempt 1, concentrated on one chart. A conditional the
  // model does not honour, whose consequent we supplied.
  //
  // So the prompt now states the TRUE branch explicitly. This test is what stops the
  // negative half being dropped again in an edit that only reads the false half.
  assert.match(MASTER_PROMPT, /hour_known: TRUE means/,
    'the prompt must state what TRUE means, not only what FALSE means');
  assert.match(MASTER_PROMPT, /never say or imply\s+it is missing, unmappable, or unknown/,
    'and must forbid the claim outright when the hour is known');
  assert.match(MASTER_PROMPT, /Only when it is FALSE/,
    'the instruction to state it must be scoped to the false branch');
});

// ── VERDICT WORDS ARE READ AS VERDICTS (fix 2, 2026-08-21) ──

test('AN ELEMENT BEING BALANCED IS NOT A STRENGTH VERDICT', () => {
  // Reproduced from fresh-1996's own semantic JSON: Day Master element Air, verdict
  // `strong`, so "Seimbang" is a wrong word for it. The old subject list included the
  // element, so element-DISTRIBUTION prose read as a verdict claim.
  //
  // CLAUDE.md rules 9 and 10 are the argument: the element bars are a display
  // distribution and NEVER a strength score. A check reading "<element> seimbang" as a
  // verdict makes exactly the conflation the engine forbids.
  const fresh = buildSemanticJson(calculateBaziChart({
    birthDate: '1996-10-02', birthTime: '19:20',
  }));
  assert.equal(fresh.strength.verdict, 'strong', 'fixture assumption');
  assert.equal(fresh.core.element, 'Air', 'fixture assumption: the collision needs this element');

  // The sentence goes in a NON-strength block, which is where element distribution
  // belongs. A SECOND, stricter pass still fires on any wrong verdict word inside the
  // block that CITES the strength fact, and that pass is deliberately NOT changed here:
  // no false positive has been observed against it, and widening a check on a
  // hypothesis is the thing this repo keeps paying for. Recorded as a limit, not fixed.
  const other = fresh.facts.find((f) => f.provenance?.kind !== 'strength' && f.label_meaning);
  const ok = withBlockText(goodReading(fresh), other.id,
    'Unsur Air seimbang dengan Logam di baganmu. ' + other.label_meaning);
  assert.ok(!checksIn(validateRendering(ok, fresh)).includes('fact.strength_contradiction'),
    'describing element presence must not read as a verdict claim');
});

test('but a verdict claim ABOUT HER still hard-rejects', () => {
  // The check must not have been widened into uselessness. The subject list is reader
  // words, and every one of them still fires.
  const fresh = buildSemanticJson(calculateBaziChart({
    birthDate: '1996-10-02', birthTime: '19:20',
  }));
  const strengthId = fresh.facts.find((f) => f.provenance?.kind === 'strength').id;
  for (const claim of ['Kamu seimbang di antara dua kutub', 'Baganmu lemah di area ini',
    'Dirimu lemah saat tekanan datang']) {
    const bad = withBlockText(goodReading(fresh), strengthId,
      `${claim}. ${fresh.facts.find((f) => f.id === strengthId).label_meaning}`);
    const result = validateRendering(bad, fresh);
    assert.ok(checksIn(result).includes('fact.strength_contradiction'), `must catch: "${claim}"`);
    assert.equal(result.hard, true, 'a verdict contradiction is HARD');
  }
});

test('"yang kuat" IS AN ADJECTIVE and does not demand the strength meaning', () => {
  // The literal string from the one fact.strength_same_breath in the 77-attempt trace:
  // `kuat` modifies the Aspek, claims no verdict, and the check then demanded the
  // strength meaning turn up beside it. Token ban where the defect is a construction.
  const fresh = buildSemanticJson(calculateBaziChart({
    birthDate: '1996-10-02', birthTime: '19:20',
  }));
  const strengthId = fresh.facts.find((f) => f.provenance?.kind === 'strength').id;
  const adjectival = withBlockText(goodReading(fresh), strengthId,
    'Kamu adalah seorang Samudra dengan Aspek Pelindung (Direct Resource) yang kuat. '
    + 'Arahmu jelas dan langkahmu jarang goyah.');
  assert.ok(!checksIn(validateRendering(adjectival, fresh))
    .includes('fact.strength_same_breath'), 'an adjectival "yang kuat" claims no verdict');
});

test('AN ADJECTIVAL USE CANNOT HIDE A BARE LABEL LATER IN THE SAME BLOCK', () => {
  // The other bug this could have been: skipping the first hit and returning null would
  // let one early "yang kuat" mask a genuinely bare verdict further down. verdictUse
  // scans on instead of bailing.
  const fresh = buildSemanticJson(calculateBaziChart({
    birthDate: '1996-10-02', birthTime: '19:20',
  }));
  const strengthId = fresh.facts.find((f) => f.provenance?.kind === 'strength').id;
  const hidden = withBlockText(goodReading(fresh), strengthId,
    'Aspek Pelindung yang kuat membentuk caramu bekerja. Baganmu Kuat. Titik.');
  assert.ok(checksIn(validateRendering(hidden, fresh)).includes('fact.strength_same_breath'),
    'the later bare verdict must still be caught');
});

// ── FIX 3: style.hedging IS CORRECT, and chart 5's 41% IS STALE ──

test('TWO OF THE FOUR OBSERVED HEDGE REJECTIONS ALREADY PASS', () => {
  // chart 5's 41% comes from the 08-18 trace, which predates the 08-17 change moving
  // `mungkin` out of the blocklist into hedgeAboutReader(). Run against TODAY's guard,
  // two of the four strings that were rejected then are accepted now - so the 41% is an
  // upper bound and the current rate is unknown, exactly as the analysis caveated.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;

  const nowFine = [
    // `sedikit` as an ordinary quantity, not a hedge about whether anything is true.
    'Kamu memiliki kelenturan tinggi sehingga perubahan mendadak yang membuat orang lain '
      + 'kehilangan arah biasanya hanya menggeser langkahmu sedikit saja.',
    // `mungkin` about the WORLD. The clause subject is Situasi, not the reader.
    'Situasi mungkin berubah, tetapi kamu jarang ikut goyah karena kamu memiliki '
      + 'kelenturan yang tinggi.',
  ];
  for (const text of nowFine) {
    const reading = withBlockText(goodReading(), dmId, `${text} ${meaning}`);
    assert.ok(!checksIn(validateRendering(reading, CHART_1)).includes('style.hedging'),
      `must NOT be rejected today: ${JSON.stringify(text.slice(0, 60))}`);
  }
});

test('and the two that SHOULD still fire, do', () => {
  // `mungkin` about the READER is a real hedge and stays caught. `cenderung` is the
  // interesting one: it fired on 4 separate runs, always attempt 1, always on the same
  // sentence - and the glossary cell it comes from says it FLAT:
  //
  //   glossary: "Kamu bertahan di situasi yang sudah jelas selesai."
  //   model:    "Kamu cenderung bertahan di situasi yang sudah jelas selesai."
  //
  // So the model is softening a sentence Reyner wrote without a hedge. The check is not
  // firing on ordinary Indonesian - it is catching a ruled string being weakened - which
  // is why NOTHING IS CHANGED here. This test is the evidence for that decision.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;
  const stillCaught = [
    'Kamu cenderung bertahan di situasi yang sudah jelas selesai.',
    'Kamu mungkin merasa belum pantas menyandang keberhasilanmu sendiri meskipun orang '
      + 'lain melihatmu berhasil.',
  ];
  for (const text of stillCaught) {
    const reading = withBlockText(goodReading(), dmId, `${text} ${meaning}`);
    assert.ok(checksIn(validateRendering(reading, CHART_1)).includes('style.hedging'),
      `must still be caught: ${JSON.stringify(text.slice(0, 60))}`);
  }
});

test('THE GLOSSARY CELL IS FLAT, which is what makes the hedge a defect', () => {
  // The load-bearing fact behind leaving the check alone. If the ruled string itself
  // hedged, the check would be the defect instead.
  // It is elemen_hilang.金 - a MISSING METAL cell, which is why chart 5 in particular
  // keeps meeting it. Searched across every section rather than a named one, so moving
  // the cell does not silently make this test vacuous.
  const cells = Object.values(GLOSSARY)
    .filter((sec) => sec && typeof sec === 'object')
    .flatMap((sec) => Object.values(sec))
    .filter((v) => v && typeof v === 'object')
    .map((v) => v.label_meaning)
    .filter((c) => typeof c === 'string');
  const flat = cells.find((c) => c.includes('bertahan di situasi yang sudah jelas selesai'));
  assert.ok(flat, 'the cell the model softened must still exist');
  assert.ok(!/\bcenderung\b/i.test(flat), 'and it must still say it without a hedge');
});

// ── FIX 4: style.raw_pillar IS THE SAME DEFECT AS FIX 1 ────

test('ALL SIX raw_pillar HITS WERE THE HOUR SENTENCE, so fix 1 covers them', () => {
  // Applying the actual blocklist pattern to the paid prose - rather than eyeballing a
  // nearby sentence - every one of the six style.raw_pillar occurrences matched inside:
  //
  //   "Pilar jam lahirmu tidak dapat dipetakan karena informasi waktu..."
  //
  // The same sentence as fact.hour_known_contradiction. fact.js's own docblock predicted
  // this from the other direction: the hour defect was "caught by ACCIDENT" because "the
  // raw_pillar STYLE ban, added hours earlier, happened to match the same sentence."
  //
  // So chart 13's top TWO checks - 6/18 and 5/18 - are ONE root cause, and the prompt fix
  // in the first commit of this branch addresses both. NOTHING IS CHANGED in raw_pillar:
  // it is correct, `pilar jam` IS the banned raw form where a palace name belongs, and it
  // caught a real falsehood.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;
  const observed = 'Pilar jam lahirmu tidak dapat dipetakan karena informasi waktu '
    + 'kelahiran tidak tercatat.';

  const checks = checksIn(validateRendering(
    withBlockText(goodReading(), dmId, `${observed} ${meaning}`), CHART_1));
  assert.ok(checks.includes('style.raw_pillar'), 'the raw pillar form is still banned');
  assert.ok(checks.includes('fact.hour_known_contradiction'),
    'and the SAME sentence still trips the hour check - one defect, two findings');
});

test('a PALACE name is never mistaken for a raw pillar', () => {
  // The pattern's own note claims it is clean on all four "Pilar X" palace names, which
  // are capital-P and never followed by a pillar word. Asserted rather than trusted,
  // because five of the six observed hits sat in prose that ALSO used palace names
  // correctly - so a pattern that could not tell them apart would have looked identical
  // in the data.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const meaning = CHART_1.facts.find((f) => f.id === dmId).label_meaning;
  const palaces = 'Pilar Kerja dan Pilar Diri ditempati oleh Benturan (Clash). '
    + 'Pilar Akar dan Pilar Arah tetap tenang.';
  assert.ok(!checksIn(validateRendering(
    withBlockText(goodReading(), dmId, `${palaces} ${meaning}`), CHART_1))
    .includes('style.raw_pillar'), 'palace names must never trip the raw-pillar ban');
});

// ── INSERTION IS SCOPED: bracket-ONCE means once (2026-08-22) ──

test('A TERM THE MODEL BRACKETED LATER IS LEFT ALONE ENTIRELY', () => {
  // Demonstrated defect, and invisible to style.unsanctioned_bracket because BOTH
  // values are sanctioned:
  //
  //   before  "Kamu adalah Matahari yang tenang. Dan Matahari (The Sun) selalu terlihat."
  //   after   "Kamu adalah Matahari (The Sun) yang tenang. Dan Matahari (The Sun) ..."
  //
  // Two bracketed mentions is rule 23 BROKEN, not kept. Insertion only checked whether
  // a bracket followed the FIRST occurrence, so a correctly-bracketed later mention did
  // not stop it.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const arche = CHART_1.core.archetype_name_id;
  const en = CHART_1.core.archetype_name_en;
  const reading = withBlockText(goodReading(), dmId,
    `Kamu adalah ${arche} yang tenang. Dan ${arche} (${en}) selalu terlihat.`);

  const result = validateRendering(reading, CHART_1);
  const served = result.normalized.blocks.find((b) => b.fact_ids.includes(dmId)).text;
  // Counted by splitting rather than by a built regex: the term is glossary data and
  // may carry regex metacharacters, and a heredoc has already eaten the backslashes in
  // this file's escapes three times today.
  const bracketed = served.split(`${arche} (`).length - 1;
  assert.equal(bracketed, 1, `bracket-ONCE means once, got ${bracketed}: ${served.slice(0, 110)}`);
  assert.equal(result.metrics.bracket_inserts, 0, 'and nothing should have been inserted');
});

test('INSERTION CANNOT CREATE AN UNSANCTIONED BRACKET, on any fixture chart', () => {
  // Measured 2026-08-22 over every fixture chart plus fresh-1996: 100 insertions, and
  // every value insertion can emit is a glossary name_en, which is exactly what
  // SANCTIONED is built from. So the 9 style.unsanctioned_bracket occurrences in the
  // 08-22 run are NOT insertion's doing - they are the model inventing a gloss, which
  // insertion correctly SKIPS because a bracket already follows the term.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const bare = (semantic.core.archetype_name_id
      ? [`Ada ${semantic.core.archetype_name_id} di baganmu.`] : [])
      .concat(semantic.facts.filter((f) => f.label && f.label_bracket)
        .map((f) => `Ada ${f.label} di baganmu.`))
      .join(' ');
    const dmId = semantic.facts.find((f) => f.id.startsWith('day_master_')).id;
    const result = validateRendering(withBlockText(goodReading(semantic), dmId, bare), semantic);
    assert.ok(!checksIn(result).includes('style.unsanctioned_bracket'),
      `chart ${tc.id}: insertion produced an unsanctioned bracket`);
  }
});

test('AN INVENTED GLOSS IS NORMALISED, not skipped and not rejected', () => {
  // CHANGED 2026-08-22 on Reyner's ruling, and this test used to assert the opposite -
  // that the invented gloss fires the check while insertion stands aside. That was the
  // defect: skipping meant the bad value survived, `style.unsanctioned_bracket` fired
  // SOFT, and a regeneration was spent on a formatting rule the engine already owns.
  const dmId = CHART_1.facts.find((f) => f.id.startsWith('day_master_')).id;
  const arche = CHART_1.core.archetype_name_id;
  const en = CHART_1.core.archetype_name_en;
  const invented = withBlockText(goodReading(), dmId,
    `Kamu adalah ${arche} (Sun) yang tenang. Arahmu jelas dan langkahmu jarang goyah.`);

  const result = validateRendering(invented, CHART_1);
  const served = result.normalized.blocks.find((b) => b.fact_ids.includes(dmId)).text;

  assert.ok(served.includes(`${arche} (${en})`), `the value must be corrected: ${served.slice(0, 90)}`);
  assert.ok(!served.includes('(Sun)'), 'and the paraphrase must be gone');
  assert.ok(!checksIn(result).includes('style.unsanctioned_bracket'),
    'so the check has nothing left to fire on, and no regeneration is spent');
  assert.equal(result.metrics.bracket_normalised, 1, 'the correction must be counted');
  assert.equal(result.metrics.bracket_inserts, 0, 'and must not also insert a second bracket');
  // Surfaced for a human, because a corrected paraphrase is louder than an insertion:
  // the model was GIVEN the value and wrote something else.
  assert.ok(result.findings.some((f) => f.check === 'brackets.normalised'),
    'and it must be visible to QA');
});
