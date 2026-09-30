// ============================================================
// tests/card-budget.spec.mjs — the node tripwire on Card B's 7px
// ============================================================
//   npm run test:card-budget
//
// WHY THIS EXISTS. On 2026-08-26 Card B's prose overflowed its object on 9 of 13
// fixture charts. The fix tightened vertical spacing, and the measurement that
// cleared it left **7 export pixels of slack on 癸 at maximum prose** - about a
// fifth of a line. Anything that adds one wrapped line anywhere clips the paid
// card again, silently, because the object is `overflow: hidden` and the node it
// is captured from is off-screen in a 1px box.
//
// THE LAYOUT SWEEP THAT MEASURED THAT CANNOT RUN HERE. It needs a real layout
// engine and the real font - line breaking is the whole question, and jsdom has
// neither. It lives in `npm run audit:card-budget -- --overflow` and is driven in
// a browser. Adding puppeteer to CI to run it was considered and not taken: it is
// a large dependency for one check, and it is not the check that actually catches
// the risk.
//
// **THE RISK IS CONTENT GROWTH, AND THAT IS CHECKABLE IN NODE.** The sweep
// measures the worst card the CURRENT glossary can produce. If no string that
// reaches Card B grows past the length the sweep measured, the worst case cannot
// get worse, and the 7px stands. So this file freezes those lengths. It fails the
// build the moment a content tranche spends the slack, and it names the command
// that re-measures.
//
// ── IT FREEZES SEVEN SURFACES, NOT THREE ───────────────────
// The obvious three are the ones `lib/card/cardData.js` names directly -
// `bintang` (:110), `tag_arketipe` (:144), `salah_dikira` (:149). Three more
// reach the card INDIRECTLY and are easy to miss, and one of them is the surface
// that produced the tightest case in the whole sweep:
//
//   aspek.name_id     TWO surfaces. The Aspek line under the headline
//                     (lib/semantic/index.js:233 -> core.main_profile_display),
//                     AND the dynamic tag row: `dynamicTags` takes `f.label`,
//                     and a convergence fact's label is the aspek entry's
//                     `name_id` (lib/semantic/facts.js:367-373, contentFrom).
//   arketipe.name_en  THE HEADLINE, and it spends slack by WORD COUNT rather
//                     than by length. `splitName` puts a leading article in the
//                     kicker and wraps what is left, so "The Morning Dew" draws
//                     MORNING / DEW on two lines where "The Sun" draws one. 癸 is
//                     the only two-word head today and it is the 7px case.
//   arketipe.name_id  Card B's kicker (EMBUN, MATAHARI). One line, low risk,
//                     frozen for completeness.
//
// `spouse_palace` and `kekuatan` do NOT reach either card - verified by grep over
// `lib/card/` and `components/cards/`, and asserted below so it stays true. That
// is what makes prompt M's tranche safe against this budget.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { GLOSSARY } from '../lib/semantic/glossary.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { splitName, CardB } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const RECALIBRATE = 'npm run audit:card-budget -- --overflow   (then serve reports/ and read the slack column)';

/**
 * THE FROZEN CALIBRATION.
 *
 * RE-MEASURED 2026-09-30, and the number is the same 7px for a different reason.
 * The 2026-08-26 sweep measured 0 overflow across 23 cases (13 fixture charts plus
 * a maximum-prose card per stem) with 7px on MAX 癸. By 2026-09-30 that line was
 * false: MAX 癸 overflowed by +40px, and so did three REAL 癸 charts (1954-01-07
 * 10:00, 1953-01-12 10:00, 1953-05-12 02:00 - two longest badges, six tags on
 * three rows). No string had grown; every length below still held. The cause was
 * the headline size (see the headline test below). With Card B's two-line head
 * back at its 08-26 size the 2026-09-30 sweep reads 0 overflow across 86 cases -
 * the 23, plus 63 real charts picked as the heaviest per stem from a walk over
 * every chart 1950-2005 - with 7px on MAX 癸 and on those three real 癸 charts.
 *
 * THE 7px IS NOW A REAL CUSTOMER'S MARGIN, not only a synthetic one: 208 of
 * 26,585 癸 charts in that walk show the two longest badges with six tags.
 *
 * **A FAILURE HERE IS NOT A BUG. It means the measurement is stale.** Re-run the
 * sweep, confirm nothing overflows, and move the number. If the sweep DOES
 * overflow, the answer is not a smaller string and not more spacing: Reyner ruled
 * on 2026-08-26 that the durable fix is a layout that absorbs length.
 */
const CALIBRATION = {
  measuredOn: '2026-09-30',
  tightestSlackPx: 7,
  tightestCase: 'MAX 癸, and REAL 癸 1954-01-07 10:00 - 空亡 + 驛馬, six tags on three rows',
  // Card B's headline as DRAWN, export px. 癸 is 139 x 0.80 because it is the one
  // two-word head; at 139 it costs 47px and the card clips (measured 2026-09-30).
  cardBHeadlinePx: { 甲: 139, 乙: 139, 丙: 139, 丁: 139, 戊: 139, 己: 139, 庚: 139, 辛: 139, 壬: 139, 癸: 111.2 },
  // Global ceilings: the sweep pairs the two LONGEST label_meanings with every
  // stem, so any entry staying at or under this keeps the worst case unchanged -
  // including a NEW bintang entry, which a per-key table would not cover.
  // 188 since 2026-09-30 (Prompt AX §2: Reyner's Tanda Kekosongan sentence, 186 -> 188).
  // RE-MEASURED, not moved: `audit:card-budget -- --overflow` in the browser (Archivo
  // loaded, checked) BEFORE and AFTER the change reads the same: the 13 fixture charts
  // fit, tightest real slack 23px; the synthetic MAX 癸 overflows +40px in BOTH, so the
  // +2 characters add no line. That +40px was the headline leak (7100f1a), fixed by
  // CARD_B_STACKED_HEAD_FACTOR; re-measured on the merged tree with the 188-char
  // sentence in: 0 overflow across 89 cases, 7px tightest (the measurement above).
  bintangMeaningMax: 188,
  bintangNameMax: 16,
  aspekNameMax: 16,
  arketipeNameIdMax: 10,
  tagArketipeLongest: 11,
  tagArketipeCount: 3,
  // PER STEM, because the sweep pairs each stem's own hook with the worst badges
  // and a stem cannot borrow another stem's hook. A global ceiling would test a
  // card the engine can never emit.
  hookPerStem: { 甲: 91, 乙: 114, 丙: 118, 丁: 108, 戊: 104, 己: 99, 庚: 101, 辛: 106, 壬: 107, 癸: 105 },
  // Headline LINES, not characters.
  headWordsPerStem: { 甲: 1, 乙: 1, 丙: 1, 丁: 1, 戊: 1, 己: 1, 庚: 1, 辛: 1, 壬: 1, 癸: 2 },
};

const len = (s) => (s || '').length;
const real = (obj) => Object.entries(obj || {}).filter(([k]) => !k.startsWith('_'));
const why = (what) => `${what}\n\n  Card B had 7px of slack when this was last measured (${CALIBRATION.measuredOn}).`
  + `\n  This is not a bug - the measurement is stale. Re-measure with:\n    ${RECALIBRATE}`;

test('the badge meanings have not grown past what fits', () => {
  for (const [key, v] of real(GLOSSARY.bintang)) {
    assert.ok(
      len(v.label_meaning) <= CALIBRATION.bintangMeaningMax,
      why(`bintang.${key}.label_meaning is ${len(v.label_meaning)} chars, over the measured ${CALIBRATION.bintangMeaningMax}.`),
    );
    assert.ok(
      len(v.name_id) <= CALIBRATION.bintangNameMax,
      why(`bintang.${key}.name_id is ${len(v.name_id)} chars, over the measured ${CALIBRATION.bintangNameMax}.`),
    );
  }
});

test('the hook has not grown, per stem', () => {
  for (const stem of STEMS) {
    const actual = len(GLOSSARY.salah_dikira?.[stem]?.line);
    assert.ok(
      actual <= CALIBRATION.hookPerStem[stem],
      why(`salah_dikira.${stem}.line is ${actual} chars, over the measured ${CALIBRATION.hookPerStem[stem]}.`),
    );
  }
});

test('the tag row has not grown - fixed tags, and the aspek names the dynamic ones use', () => {
  for (const [stem, tags] of real(GLOSSARY.tag_arketipe)) {
    assert.equal(
      (tags || []).length, CALIBRATION.tagArketipeCount,
      why(`tag_arketipe.${stem} has ${(tags || []).length} tags, not the measured ${CALIBRATION.tagArketipeCount}.`),
    );
    for (const t of tags || []) {
      assert.ok(
        len(t) <= CALIBRATION.tagArketipeLongest,
        why(`tag_arketipe.${stem} carries "${t}" at ${len(t)} chars, over the measured ${CALIBRATION.tagArketipeLongest}.`),
      );
    }
  }
  // THE INDIRECT ONE. A convergence fact's label is its aspek entry's name_id,
  // and `dynamicTags` puts that straight into Card B's tag row. Nothing in
  // lib/card/ mentions GLOSSARY.aspek, so a grep of the card layer would miss it.
  for (const [god, v] of real(GLOSSARY.aspek)) {
    assert.ok(
      len(v.name_id) <= CALIBRATION.aspekNameMax,
      why(`aspek.${god}.name_id is ${len(v.name_id)} chars, over the measured ${CALIBRATION.aspekNameMax}.`
        + '\n  It is BOTH the Aspek line under the headline and a dynamic tag.'),
    );
  }
});

test('the headline still takes the same number of lines, per stem', () => {
  // WORD COUNT, NOT LENGTH. splitName sends a leading article to the kicker and
  // wraps the rest, so a two-word head is a second headline line at 80% size -
  // roughly 100 export px against 7 of slack. Renaming an archetype from "The
  // Sun" to "The Rising Sun" would clip the paid card, and no length ceiling
  // anywhere would have noticed.
  for (const stem of STEMS) {
    const head = splitName(GLOSSARY.arketipe?.[stem]?.name_en || '').head || [];
    assert.ok(
      head.length <= CALIBRATION.headWordsPerStem[stem],
      why(`arketipe.${stem}.name_en now splits to ${head.length} headline word(s), over the measured ${CALIBRATION.headWordsPerStem[stem]}.`),
    );
    assert.ok(
      len(GLOSSARY.arketipe?.[stem]?.name_id) <= CALIBRATION.arketipeNameIdMax,
      why(`arketipe.${stem}.name_id is over the measured ${CALIBRATION.arketipeNameIdMax}.`),
    );
  }
});

test('CARD B\'S HEADLINE IS DRAWN AT THE SIZE THE SWEEP MEASURED, per stem', () => {
  // ── THE EIGHTH SURFACE IS NOT CONTENT, AND IT IS THE ONE THAT SPENT THE 7px ──
  // Every test above freezes a STRING. On 2026-08-31 `7100f1a` changed no string:
  // it replaced <Headline>'s word-count reduction with §0a's fit gate - ruled for
  // Card A's 936 measure - and <Headline> is shared, so 癸's MORNING / DEW went
  // from 111 to 139 on Card B too. That is +47px of headline against 7 of slack,
  // and real 癸 cards overflowed by 40px - hairline gone, badges jammed into the
  // pillars, seal 19px off the edge - while all five tests above stayed green,
  // because they could not see a size.
  //
  // So the size itself is frozen, read off the rendered markup rather than off a
  // constant, because the defect was a constant that was correct for the card it
  // was ruled for and wrong for the one it reached.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const base = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  for (const stem of STEMS) {
    const arche = GLOSSARY.arketipe[stem];
    const html = renderToStaticMarkup(React.createElement(CardB, {
      data: { ...base, stem, nameEn: arche.name_en, nameId: arche.name_id },
    }));
    const m = html.match(/data-role="headline" style="[^"]*?font-size:([\d.]+)px/);
    assert.ok(m, `no headline font-size found on Card B for ${stem}`);
    const drawn = Number(m[1]);
    assert.ok(
      Math.abs(drawn - CALIBRATION.cardBHeadlinePx[stem]) < 0.01,
      why(`Card B draws ${stem}'s headline at ${drawn}px, not the measured ${CALIBRATION.cardBHeadlinePx[stem]}px.`
        + '\n  The headline is the biggest block on the card; a size change moves every line under it.'),
    );
  }
});

test('NO NEW GLOSSARY SECTION HAS REACHED THE CARD without being budgeted', () => {
  // The completeness tripwire, and the reason it is worth a test of its own: this
  // whole budget is only sound if the list of surfaces is complete. It was NOT
  // complete when it was first written - three sections were named and three more
  // reach the card indirectly, including the one that produced the tightest case.
  //
  // If `lib/card/cardData.js` starts reading another glossary section, that
  // section can spend the slack and nothing above covers it. This fails until it
  // is added to CALIBRATION deliberately.
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'card', 'cardData.js'), 'utf8');
  const seen = [...new Set((src.match(/GLOSSARY\.[a-z_]+/g) || []))].sort();
  assert.deepEqual(
    seen, ['GLOSSARY.bintang', 'GLOSSARY.salah_dikira', 'GLOSSARY.tag_arketipe'],
    why(`lib/card/cardData.js now reads ${seen.join(', ')}.\n`
      + '  A new section reaching the card can spend Card B\'s slack. Budget it in CALIBRATION first.'),
  );

  // And the two prompt-M sections stay out of the card layer. Reyner's clearance
  // for that tranche rests on this being true, so it is asserted rather than
  // remembered.
  for (const dir of ['lib/card', 'components/cards']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((n) => n.endsWith('.js'))) {
      const body = fs.readFileSync(path.join(ROOT, dir, f), 'utf8');
      for (const section of ['spouse_palace', 'kekuatan']) {
        assert.ok(
          !body.includes(`GLOSSARY.${section}`),
          why(`${dir}/${f} now reads GLOSSARY.${section}, which was cleared as OUT of the card budget.`),
        );
      }
    }
  }
});
