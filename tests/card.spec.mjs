// ============================================================
// tests/card.spec.mjs — the card rulings, made executable
// ============================================================
// Every assertion here is a RULING, not a preference, and each one names its
// source. A ruling that lives only in a doc gets redrawn from scratch by the next
// session — which is exactly what happened to the card spec on 2026-08-13.
//
//   docs/content/sharecard-spec.md   "DECIDED 2026-08-01 — all four open questions"
//   docs/PROGRESS.md                 "DECIDED 2026-08-03 — card sizes LOCKED"
//
// If one of these fails, do not adjust the test. Either the code drifted from a
// ruling, or Reyner changed the ruling and the doc changed with it.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData, buildFooter, formatCardDate, dynamicTags } from '../lib/card/cardData.js';
import { CARD_TOKENS, tokenFor, tokenApproved, APPROVED_STEMS } from '../lib/card/tokens.js';
import { BRASS, brassFor, inkIsDark } from '../lib/card/tokens.js';
import {
  contrast, composite, luminance, inkPoles, inkVerdict,
  accentAudit, accentFloorFromLocked, ACCENT_FLOOR, ACCENT_EXEMPT,
} from '../lib/card/contrast.js';
import { auditRendered } from '../lib/card/domContrast.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  CARD_A, CARD_B, CardA, CardB, TEXT_ROLES, MIN_CONTRAST, roleStyle, paletteFor,
  AA_EXEMPT, DIM_EXEMPT, SHEEN_EXEMPT, sheenCss, sheenGrounds,
  GRADIENT_STOPS, stepAway, CARD_B_BADGE_LIMIT, MAX_LABEL_MEANING,
  RADIUS, PADDING, splitName, brassTextFor, brassTextFallbacks,
  WATERMARK_FILL, OBJECT_ID_SUFFIX,
} from '../components/cards/Card.js';
import { HAN_GLYPHS, HAN_FAMILY } from '../lib/card/hanFont.js';
// The DESCRIPTOR only. `captureCard` needs a DOM; `captureSpec` is pure so the
// ruled export sizes are asserted here rather than only in a browser nobody opens.
import { captureSpec, CAPTURE_KINDS } from '../components/cards/exportCards.js';

/** rgba() the way the card writes it, for comparing against rendered markup. */
const alphaOf = (hex, a) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
};
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const { renderToStaticMarkup } = ReactDOMServer;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// `birthTime: null` must MEAN null — `??` would swallow it back to the default
// and quietly turn the hour-less test into a second hour-known one.
const cardFor = (birthDate, opts = {}) => {
  const birthTime = 'birthTime' in opts ? opts.birthTime : '09:00';
  const chart = calculateBaziChart({ birthDate, birthTime });
  return buildCardData({ chart, semanticJson: buildSemanticJson(chart), birthDate, gender: opts.gender ?? null });
};

// ── GEOMETRY (2026-08-03, sizes LOCKED) ────────────────────

test('Card A is a 63:88 object on a 3:4 canvas at ONE uniform margin', () => {
  assert.equal(CARD_A.canvas.w, 1080);
  assert.equal(CARD_A.canvas.h, 1440);
  assert.equal(CARD_A.canvas.w / CARD_A.canvas.h, 3 / 4);

  // The margin is not a taste call, it is the only value that satisfies both
  // ratios: solve (1080-2m)/(1440-2m) = 63/88.
  const m = (1080 * 88 - 1440 * 63) / (2 * (88 - 63));
  assert.equal(m, 86.4);
  assert.equal(CARD_A.margin, m);

  // ...and the object follows from it, to the pixel we round to.
  assert.equal(Math.round(1080 - 2 * m), CARD_A.card.w);
  assert.equal(Math.round(1440 - 2 * m), CARD_A.card.h);
  assert.ok(Math.abs(CARD_A.card.w / CARD_A.card.h - 63 / 88) < 0.0005);
});

test('the ruled size is the BORDER box, declared by the card and not borrowed', () => {
  // THE BUG THIS EXISTS FOR, found 2026-08-13 in the review preview: the card
  // relied on the app's global `* { box-sizing: border-box }`. Without it, 72px of
  // padding and the hairline are added OUTSIDE the ruled width, so the object
  // draws 1051x1411 instead of 907x1267 and the 86.4 margin becomes 14.5.
  //
  // It was verified green beforehand by reading getComputedStyle().width, which
  // returns the CONTENT box and therefore reported 907 while 1051 was on screen.
  // So this asserts the DECLARATION in the rendered markup instead.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  for (const [name, Card] of [['CardA', CardA], ['CardB', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(Card, { data }));
    const declared = html.match(/box-sizing:\s*border-box/g) || [];
    assert.ok(declared.length >= 2, `${name} must declare border-box on canvas AND card, found ${declared.length}`);
  }
});

test('the superseded 4:5 proposal is not what we build', () => {
  // 1080x1350 was the 08-02 proposal and the 08-03 ruling replaced it. Named here
  // so a session that finds 4:5 in an older doc sees the reversal fail a test.
  assert.notEqual(CARD_A.canvas.h, 1350);
});

test('Card B is 9:16, and taller than Card A', () => {
  assert.equal(CARD_B.canvas.w, 1080);
  assert.equal(CARD_B.canvas.h, 1920);
  assert.equal(CARD_B.canvas.w / CARD_B.canvas.h, 9 / 16);
  assert.ok(CARD_B.canvas.h > CARD_A.canvas.h, 'taller IS the exclusivity signal');
  // Card B's object ratio is NOT ruled; only that it keeps Card A's margin.
  assert.equal(CARD_B.margin, CARD_A.margin);
});

// ── COLOUR TOKENS (open — five of ten unapproved as of 2026-08-13) ──

test('every Day Master has a token, and none is silently defaulted', () => {
  for (const stem of STEMS) {
    const t = tokenFor(stem);
    for (const k of ['field', 'ink', 'accent']) {
      assert.match(t[k], /^#[0-9A-F]{6}$/i, `${stem}.${k}`);
    }
  }
  assert.throws(() => tokenFor('X'), /No card token/);
});

test('the APPROVED triples match docs/content/sharecard-mockups-02.html verbatim', () => {
  // The mockup's :root is the ruled source. This is the drift guard: if someone
  // edits a locked hex in one place only, this fails instead of shipping.
  const mock = fs.readFileSync(path.join(ROOT, 'docs/content/sharecard-mockups-02.html'), 'utf8');
  for (const stem of APPROVED_STEMS) {
    const t = CARD_TOKENS[stem];
    for (const k of ['field', 'ink', 'accent']) {
      assert.ok(
        mock.toUpperCase().includes(t[k].toUpperCase()),
        `${stem}.${k} ${t[k]} is marked approved but is not in the ruled mockup`,
      );
    }
  }
});

// ── CONTRAST, MEASURED ON THE RENDERED MARKUP ─────────
// These read the HTML the cards actually produce, not the roles table beside
// them. The table version passed while the pillar branch carried an undeclared
// `opacity: 0.85` and the INTI DIRI pill was drawn field-on-accent at 1.00
// against the card ground. An assertion that reads the intent it is checking is
// not an assertion.

/** Every text run on both cards, for one token, measured on the flat field. */
function runsFor(stem) {
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = { ...buildCardData({ chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female' }), stem };
  const out = [];
  for (const [card, C] of [['A', CardA], ['B', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data }));
    for (const r of auditRendered(html, CARD_TOKENS[stem].field)) out.push({ ...r, card });
  }
  return out.sort((a, b) => a.ratio - b.ratio);
}

/**
 * The roles a run could be, for the exemption check: role name -> its ratio.
 *
 * TAKES A CARD since 2026-08-19: `brassText` differs between the two surfaces, so
 * a ratio without a card is now two different numbers. `ROLE_WORST` keeps the
 * worse of them, which is what an AA assertion has to test.
 */
const ROLE_RATIO = (role, token, card) => {
  const palette = paletteFor(token, card);
  const s = roleStyle(role, palette);
  const ground = TEXT_ROLES[role].over === 'brass' ? palette.brass : token.field;
  return contrast(composite(s.color, ground, s.opacity), ground);
};

const ROLE_WORST = (role, token) => Math.min(ROLE_RATIO(role, token, 'A'), ROLE_RATIO(role, token, 'B'));

test('EVERY role OUTSIDE DIM_EXEMPT meets WCAG AA, on every token but the known one', () => {
  // Spec §7.4. The floor did NOT move on 2026-08-14 — the ruling admitted an
  // exemption list, and everything off that list still has to clear 4.5.
  assert.equal(MIN_CONTRAST, 4.5, 'the target is WCAG AA and it is not negotiable downward');
  const full = Object.keys(TEXT_ROLES).filter((r) => !DIM_EXEMPT.includes(r));
  assert.ok(full.length >= 4, 'if nothing is left at full opacity, this test has stopped meaning anything');

  for (const stem of STEMS) {
    if (AA_EXEMPT.includes(stem)) continue;
    const under = full
      .map((role) => ({ role, ratio: ROLE_WORST(role, CARD_TOKENS[stem]) }))
      .filter((r) => r.ratio < MIN_CONTRAST);
    assert.deepEqual(
      under.map((r) => `${r.role}=${r.ratio.toFixed(2)}`), [],
      `${stem} draws a non-exempt role under AA. Run: npm run audit:card-contrast`,
    );
  }
});

test('the RENDERED markup draws no colour the roles did not produce', () => {
  // The dimmed roles mean the old "every run clears 4.5" assertion cannot stand
  // as written, and the thing that must NOT be lost with it is the DOM walk: the
  // audit still has to see the real markup, or a stray inline colour becomes
  // invisible again. So this asserts the weaker true thing — every rendered run
  // resolves to a hex that some role produces, at an opacity some role declares.
  // BOTH SURFACES union into the allowed set, because the runs being checked come
  // from both cards and their brassText differs. Taking one card would report the
  // other card's legitimate brass as a colour no role declares.
  const allowed = new Set();
  for (const stem of STEMS) {
    for (const card of ['A', 'B']) {
      const palette = paletteFor(CARD_TOKENS[stem], card);
      for (const role of Object.keys(TEXT_ROLES)) {
        const s = roleStyle(role, palette);
        allowed.add(`${s.color.toLowerCase()}@${s.opacity}`);
      }
    }
  }
  for (const stem of STEMS) {
    for (const r of runsFor(stem)) {
      assert.match(r.color || '', /^#[0-9a-f]{6}$/i, `${stem}: ${JSON.stringify(r.text.slice(0, 20))} has no resolvable colour`);
      assert.ok(
        allowed.has(`${r.color.toLowerCase()}@${Number(r.opacity.toFixed(2))}`),
        `${stem}: ${JSON.stringify(r.text.slice(0, 20))} is drawn ${r.color}@${r.opacity}, which no role declares`,
      );
    }
  }
});

test('DIM_EXEMPT IS EXACTLY THE SET OF DIMMED ROLES, so a role cannot be dimmed unlisted', () => {
  // Spec §7.3, and it is the whole mechanism of the 08-14 ruling: dimmed ink is
  // an exemption with a pinned list, not a lowered floor. The list can only
  // shrink, and nothing joins it without someone editing that line in Card.js.
  const dimmed = Object.entries(TEXT_ROLES)
    .filter(([, r]) => r.opacity < 1)
    .map(([name]) => name)
    .sort();
  assert.deepEqual(dimmed, [...DIM_EXEMPT].sort(),
    'a role is dimmed without being listed in DIM_EXEMPT, or listed without being dimmed');
});

test('the ink levels are EXACTLY the ruled ones (spec §2.7 and §3.6)', () => {
  // Transcribed from the two tables, so a drift in either direction fails here
  // rather than being noticed on a card six weeks later. Where a role exists on
  // both cards it takes the SAME value — one role, one opacity, no per-card drift.
  const ruled = {
    headline: 1, hook: 1, pillarStem: 1, nameId: 1, badgeLabelFoil: 1, intiDiri: 1,
    pillarMetaDay: 0.90, pillarBranchDay: 0.88, badgeLabel: 0.82, pillarLabelDay: 0.82,
    pillarBranch: 0.80, aspek: 0.75, pillarMeta: 0.74, badgeMeaning: 0.72,
    pillarAnimalDay: 0.64, barLabel: 0.58, footer: 0.53,
    pillarLabel: 0.51, pillarAnimal: 0.51, tagFixed: 0.51, tagDynamic: 0.51,
    kicker: 0.48,
  };
  assert.deepEqual(
    Object.fromEntries(Object.entries(TEXT_ROLES).map(([k, v]) => [k, v.opacity])),
    ruled,
  );
});

test('the audit sees text the roles table cannot describe', () => {
  // Guards the guard. If this stops finding more runs than there are roles, the
  // audit has quietly gone back to measuring the table.
  const runs = runsFor('壬');
  assert.ok(runs.length > Object.keys(TEXT_ROLES).length,
    `only ${runs.length} runs found; the DOM walk is not reaching the card`);
  // And the INTI DIRI pill is measured against the PILL, not the card ground.
  // The pill declares a SOLID background-color under its gradient for exactly
  // this reason: domContrast can only resolve a hex as a ground, so a gradient
  // pill would be scored against the card field and would report the pill's dark
  // brass ink sitting on a dark green card. The solid is the gradient's DARKEST
  // stop, so the number is the worst case rather than a flattering one.
  const pill = runs.find((r) => r.text.toLowerCase().includes('inti diri'));
  assert.ok(pill, 'the INTI DIRI pill must appear in the audit');
  assert.equal(pill.ground, BRASS.light.solid, 'the pill must be measured on its own background');
  assert.ok(pill.ratio > MIN_CONTRAST, `the pill measures ${pill.ratio.toFixed(2)}`);
});

test('the watermark is exempt BY DECLARATION, not by the audit knowing about it', () => {
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const html = renderToStaticMarkup(React.createElement(CardA, { data }));
  assert.ok(html.includes('aria-hidden="true"'), 'the watermark must mark itself decorative');
  // It is in the markup and NOT in the audit, which is what the exemption means.
  assert.ok(html.includes(data.stem), 'the stem must actually render');
  const runs = auditRendered(html, CARD_TOKENS[data.stem].field);
  assert.ok(!runs.some((r) => r.text === data.stem), 'a decorative watermark must not be audited as text');
});

test('THE AA EXEMPTION LIST IS EMPTY, and the mechanism survives it', () => {
  // A REPORT, NOT A PERMISSION, and it can only shrink. It has now shrunk to
  // nothing: Matahari left on 2026-08-13 (#CC3F0E) and Gunung on 2026-08-15
  // (#4A3A1E, ink 4.21 -> 10.02). Every token clears AA on its own field.
  assert.deepEqual(AA_EXEMPT, []);
  // The list must STAY, empty. An empty exemption list is the outcome it existed
  // for, not evidence it was unnecessary — it is where the next under-AA token
  // gets recorded instead of MIN_CONTRAST being lowered to hide it.
  assert.ok(Array.isArray(AA_EXEMPT), 'the mechanism must not be deleted with its last entry');

  for (const stem of AA_EXEMPT) {
    const t = CARD_TOKENS[stem];
    assert.ok(contrast(t.ink, t.field) < MIN_CONTRAST, `${stem} now reaches AA - take it off AA_EXEMPT`);
  }
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    if (AA_EXEMPT.includes(stem)) continue;
    assert.ok(contrast(t.ink, t.field) >= MIN_CONTRAST, `${stem} is under AA and unlisted`);
  }
});

/**
 * The audit's GATE 3, reproduced: does this token have full-opacity Card B text
 * under AA once the sheen is beneath it?
 *
 * Deliberately a copy of `scripts/audit-card-contrast.mjs` rather than an import
 * — the script is a report and the test is the pin, and a pin that imports the
 * thing it pins proves only that one file agrees with itself. Both read
 * `sheenGrounds()`, which is the single source that actually matters.
 *
 * A run whose ground is not the field sits on a fill painted ABOVE the sheen
 * (the INTI DIRI pill), so the wash cannot reach it and its flat ratio is honest.
 */
function sheenFailures(stem) {
  const token = CARD_TOKENS[stem];
  const html = renderToStaticMarkup(React.createElement(CardB, {
    data: { ...cardFor('1989-09-13'), stem },
  }));
  return auditRendered(html, token.field)
    .filter((r) => r.opacity === 1 && /^#[0-9a-f]{6}$/i.test(r.color || ''))
    .map((r) => {
      if (r.ground !== token.field) return { ...r, worst: r.ratio };
      const worst = Math.min(...sheenGrounds(token)
        .map((g) => contrast(composite(r.color, g.ground, r.opacity), g.ground)));
      return { ...r, worst };
    })
    .filter((r) => r.worst < MIN_CONTRAST);
}

test('SHEEN_EXEMPT IS EXACTLY 乙 AND 丙, and both genuinely fail the sheen gate', () => {
  // Added 2026-08-17 EMPTY, with the audit-gate fix, and filled on 2026-08-19 by
  // Reyner after all three cheaper options were priced. Same standing as
  // AA_EXEMPT above: a REPORT, NOT A PERMISSION, and it can only shrink.
  //
  // WHY IT MATTERED THAT IT STARTED EMPTY. The audit printed the sheen's failures
  // for the whole life of the finish and never let them reach the exit code, so
  // `npm run audit:card-contrast` said PASS and exited 0 on a card that fails AA
  // on six tokens. Filling this list is how that becomes true ON PURPOSE, with a
  // name against it. It was not how the audit was made green: four of those six
  // were CLOSED by A2 (brass text now measured against the sheen ground), and
  // only the two that no mechanism can reach are excused here.
  //
  // The ruling, the refuted alternatives and their prices are in Card.js beside
  // the list. The reasoning lives with the list because two stems and no argument
  // is how an excused defect stops being known.
  assert.deepEqual(SHEEN_EXEMPT, ['乙', '丙'],
    'SHEEN_EXEMPT moved - it is Reyner\'s ruling, not a way to make the audit green');
  assert.ok(Array.isArray(SHEEN_EXEMPT), 'the mechanism must not be deleted with its last entry');

  // DIRECTION 1 — every listed token still needs excusing. A token that has since
  // been fixed must LEAVE the list, or the list is excusing nothing and hiding
  // the fact that it is.
  for (const stem of SHEEN_EXEMPT) {
    assert.ok(CARD_TOKENS[stem], `${stem} is not a token - SHEEN_EXEMPT holds day-master stems`);
    const failures = sheenFailures(stem);
    assert.ok(failures.length > 0,
      `${stem} now clears the sheen gate - take it OFF SHEEN_EXEMPT`);
  }

  // DIRECTION 2 — nothing else may fail unlisted. This is the half that keeps the
  // exemption from becoming a lowered floor: a new failure has to be ruled on,
  // not absorbed.
  for (const stem of STEMS) {
    if (SHEEN_EXEMPT.includes(stem)) continue;
    const failures = sheenFailures(stem);
    assert.equal(failures.length, 0,
      `${stem} fails the sheen gate unlisted: ${failures.map((f) => `"${f.text.slice(0, 18)}" ${f.worst.toFixed(2)}`).join(', ')}`);
  }
});

test('THE SHEEN CSS IS DERIVED FROM SHEEN, and still byte-identical to what shipped', () => {
  // The declarations were two inline strings until 2026-08-17, and the audit
  // carried a THIRD copy of the peak alpha as a hand-written `.15`. They are one
  // source now — `SHEEN` — and this pins the rendered output so the refactor
  // cannot have moved a pixel. `.15` not `0.15`, bare `0` for zero: the exact
  // shape the cards already ship, which the Card-B-only assertion matches on.
  const dark = sheenCss({ ink: '#ECF5EE', field: '#1B4A2C' });   // 甲, light ink
  const light = sheenCss({ ink: '#1C1A17', field: '#EDEAE4' });  // 辛, dark ink
  assert.equal(dark,
    'linear-gradient(158deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,.05) 26%, '
    + 'rgba(255,255,255,0) 46%, rgba(255,255,255,0) 100%)');
  assert.equal(light,
    'linear-gradient(158deg, rgba(255,255,255,.62) 0%, rgba(255,255,255,.12) 24%, '
    + 'rgba(0,0,0,0) 46%, rgba(0,0,0,.07) 100%)');

  // AND THE GROUNDS THE AUDIT READS come from the same stops. The old audit
  // modelled only white at peak, which is why the light branch — whose costly
  // stop is 7% BLACK at the far corner — was skipped entirely.
  const grounds = sheenGrounds(CARD_TOKENS['辛']);
  assert.ok(grounds.some((g) => g.hex === '#000000' && g.alpha === 0.07),
    'the light branch carries a black stop and the audit must be able to see it');
});

test("GUNUNG'S FIELD IS #4A3A1E and its ink and accent are unchanged (Reyner, 2026-08-15)", () => {
  // ONE HEX fixed three separate failures, because they all had the same cause:
  // the field was not dark enough for a system built on near-white ink on a deep
  // field. Measured with contrast(), which is what the audit and this test read,
  // so the numbers in lib/card/tokens.js cannot drift from the code.
  const g = CARD_TOKENS['戊'];
  assert.equal(g.field, '#4A3A1E');
  assert.equal(g.ink, '#FAF4E9', 'the ink was explicitly kept');
  assert.equal(g.accent, '#E3CFA8', 'the accent was explicitly kept');

  assert.ok(Math.abs(contrast(g.ink, g.field) - 10.02) < 0.01, 'ink');
  assert.ok(Math.abs(contrast(g.accent, g.field) - 7.18) < 0.01, 'accent');
  assert.ok(Math.abs(contrast(BRASS.light.text, g.field) - 6.00) < 0.01, 'brass text');

  // It clears all three bars it used to fail.
  assert.ok(contrast(g.ink, g.field) >= MIN_CONTRAST, 'AA');
  assert.ok(!accentAudit(CARD_TOKENS).under.includes('戊'), 'the accent floor');
  // THE 08-15 RULING IS INTACT AND NOW VISIBLY SO. It was about the FLAT FIELD,
  // which is Card A's whole test, and 戊 keeps its brass name there. Card B judges
  // against the sheen ground, where 戊 measures 3.80 and retreats to ink. Both
  // asserted, because one line saying "戊 falls back" would read as the 08-15 fix
  // having been undone, and it has not been.
  assert.ok(contrast(BRASS.light.text, g.field) >= MIN_CONTRAST,
    'brass text must clear AA on the flat field - that was the 08-15 fix');
  assert.equal(brassTextFor(g, 'A'), BRASS.light.text,
    '戊 keeps brass on Card A: the 08-15 field fix stands');
  assert.equal(brassTextFor(g, 'B'), g.ink,
    '戊 gives it up on Card B because of the SHEEN, not the field');

  // The field ruling and the approval ruling were separate, and in that order:
  // 08-15 fixed the CARD's contrast, then 08-15 approved the TOKEN.
  assert.equal(g.approved, true);
  assert.ok(luminance(g.ink) > luminance(g.field), 'Gunung must stay a light-ink token');
});

test('the object gradient still steps AWAY from the ink (spec §1, not reopened)', () => {
  // This is what lets the audit measure ONE ground per token and cover every
  // pixel the GRADIENT produces: the flat field is its worst surface. The 08-14
  // finish sits on top of this rather than replacing it, so it still holds — the
  // sheen is a separate overlay and is measured separately, in audit:card-contrast.
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    for (const step of GRADIENT_STOPS) {
      const stop = stepAway(t.field, t.ink, step);
      assert.ok(contrast(t.ink, stop) >= contrast(t.ink, t.field) - 0.001,
        `${stem}: gradient stop ${step} has LESS contrast than the flat field`);
    }
  }
  // And the canvas stays FLAT, which is the other half of the 08-13 ruling.
  const data = cardFor('1989-09-13');
  for (const [name, C] of [['CardA', CardA], ['CardB', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data }));
    const root = html.slice(0, html.indexOf('>'));
    assert.ok(root.includes(`background:${CARD_TOKENS[data.stem].field}`),
      `${name}'s canvas must be the flat field`);
    assert.ok(!/radial-gradient/.test(html), `${name} draws a radial gradient`);
  }
});

test("MATAHARI'S FIELD IS #CC3F0E and its ink is unchanged (Reyner, 2026-08-13)", () => {
  // The ruling was specific about WHICH of the two measured options: darken the
  // field, keep the near-white ink. The rejected option was a dark ink on the
  // original vivid field, which would have split the Fire pair on polarity while
  // every other element pair splits on value alone.
  const m = CARD_TOKENS['丙'];
  assert.equal(m.field, '#CC3F0E');
  assert.equal(m.ink, '#FFF4EC', 'the ink was explicitly kept');
  assert.ok(contrast(m.ink, m.field) >= MIN_CONTRAST);
  assert.ok(luminance(m.ink) > luminance(m.field), 'Matahari must stay a light-ink token');
});

test('THE INK POLE IS A GUARD, NOT A CHOOSER', () => {
  // Nothing may auto-apply the winning pole: a token edit could then silently
  // repaint every word on the card and still pass. The declared ink is authority;
  // the report only refuses to stay quiet.
  //
  // ── THIS USES A SYNTHETIC TOKEN AS OF 2026-08-15, and it has to ──
  // It used to fail 戊 Gunung, the last real token under AA. Gunung's field moved
  // to #4A3A1E and now measures 10.02, so NO shipped token fails any more — which
  // is good, and which would have quietly turned this test into an assertion that
  // nothing ever fails. A guard that can only be exercised while the codebase is
  // broken is not a guard. So the failing case is constructed here.
  const failing = { field: '#8F7040', ink: '#FAF4E9', accent: '#E3CFA8' };
  assert.ok(contrast(failing.ink, failing.field) < MIN_CONTRAST,
    'the synthetic token must actually fail, or this test proves nothing');
  const v = inkVerdict('戊', failing, MIN_CONTRAST);
  assert.equal(v.ok, false);
  assert.match(v.message, /LIGHTER|DARKER/, 'the failure must name the pole that works');
  assert.match(v.message, /NOT APPLIED/, 'and must say it did not apply it');
  // The declared ink is untouched by asking.
  assert.equal(failing.ink, '#FAF4E9');

  // Every REAL token now passes, which is the state the guard exists to protect.
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    assert.equal(inkVerdict(stem, t, MIN_CONTRAST).ok, true, `${stem} fails its own ink`);
  }

  // And the poles are reported for BOTH directions, so the report is a fact about
  // the field rather than a recommendation dressed as one.
  const poles = inkPoles(failing.field, MIN_CONTRAST);
  assert.ok(poles.light.ceiling > 1 && poles.dark.ceiling > 1);
  assert.ok(['light', 'dark'].includes(poles.better));
});

test('ACCENT CARRIES NO TEXT — it is a mid-lightness value and cannot reach AA', () => {
  // Accent's ceiling against the field runs 3.05 to 5.69 and most tokens are
  // under 4.5 at full opacity, so no opacity, size or weight change fixes it.
  // It survives as a NON-TEXT colour: watermark, bars, cell borders.
  for (const [name, role] of Object.entries(TEXT_ROLES)) {
    assert.notEqual(role.on, 'accent', `${name} draws text in accent`);
  }
  const failing = Object.entries(CARD_TOKENS)
    .filter(([, t]) => contrast(t.accent, t.field) < MIN_CONTRAST);
  assert.ok(failing.length >= 5, 'if accent now clears AA broadly, this rule can be revisited');
});

test('THE ARITHMETIC BEHIND THE 08-13 NOTE IS STILL TRUE, which is why the list is an exemption', () => {
  // The 2026-08-14 ruling re-admitted dimmed ink on the DESIGN question. It did
  // not, and could not, change this: Bambu is the binding LOCKED token at ink
  // 4.93, so its lowest usable opacity is 0.94, and every dimmed row is under it.
  // That is exactly why the mechanism is a pinned exemption rather than a lower
  // MIN_CONTRAST — the number stays honest and the list carries the decision.
  const bambu = CARD_TOKENS['乙'];
  assert.ok(contrast(composite(bambu.ink, bambu.field, 0.9), bambu.field) < MIN_CONTRAST,
    'Bambu at 0.9 opacity should be under AA - that is what DIM_EXEMPT is exempting');
  for (const role of DIM_EXEMPT) {
    assert.ok(TEXT_ROLES[role], `DIM_EXEMPT names "${role}", which is not a role`);
    assert.ok(TEXT_ROLES[role].opacity < 1, `${role} is exempt but not dimmed`);
  }
});

test('THE ROLES TABLE IS ACTUALLY CONSUMED', () => {
  // The defect this exists for: TEXT_ROLES was exported, audited and used by
  // nothing, because the card set `color` once on its root and everything
  // inherited. `roleStyle` is now the only source of text colour.
  const t = CARD_TOKENS['壬'];
  assert.deepEqual(roleStyle('headline', t), { color: t.ink, opacity: 1 });
  assert.throws(() => roleStyle('nope', t), /No text role/);

  // The brass roles read palette keys that are NOT on the token. Handing them a
  // bare token THROWS rather than falling back, because a fallback here is the
  // exact failure mode this test exists for: a role that resolves to something
  // plausible and wrong.
  assert.throws(() => roleStyle('intiDiri', t), /brassInk/);
  const palette = paletteFor(t, 'B');
  assert.deepEqual(roleStyle('intiDiri', palette), { color: BRASS.light.ink, opacity: 1 });

  // `nameId` reads `brassText`, which is the per-token AND PER-CARD answer.
  // 壬 is the token the split is visible on: brass on Card A, ink on Card B,
  // asserted BOTH WAYS so neither surface can quietly adopt the other's value.
  assert.deepEqual(roleStyle('nameId', paletteFor(t, 'A')),
    { color: BRASS.light.text, opacity: 1 }, '壬 keeps its brass name on Card A');
  assert.deepEqual(roleStyle('nameId', palette),
    { color: t.ink, opacity: 1 }, '壬 gives it up on Card B, where the sheen is');
  // And a token that keeps brass on both, so the assertion above is about the
  // SPLIT rather than about brass being gone everywhere.
  for (const card of ['A', 'B']) {
    assert.deepEqual(roleStyle('nameId', paletteFor(CARD_TOKENS['庚'], card)),
      { color: BRASS.light.text, opacity: 1 }, `庚 keeps brass on Card ${card}`);
  }
  // A palette with no card at all must THROW rather than pick one.
  assert.throws(() => paletteFor(t), /card surface/);

  // And the root must NOT set a colour, or inheritance hides an unwired role.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const html = renderToStaticMarkup(React.createElement(CardA, { data }));
  const rootStyle = html.slice(0, html.indexOf('>'));
  assert.ok(!/color:/.test(rootStyle), 'the canvas must not set an inheritable colour');
});

// ── 1a AND 1e (docs/content/card-polish-spec.md, ruled 2026-08-14) ──
// Reference renders: docs/content/card-1a-free.png, card-1e-paid.png,
// card-1e-ten-tokens.png. Each assertion below is a ruling from that spec.

test('THE OBJECT DIMENSIONS ARE UNCHANGED BY THE POLISH PASS', () => {
  // Spec §1 and §7.1: geometry is locked and this pass may not move it. Asserted
  // in the RENDERED MARKUP, because a computed-style read reports the content box
  // and once "confirmed" 907 while 1051 was on screen.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  for (const [name, C, spec] of [['CardA', CardA, CARD_A], ['CardB', CardB, CARD_B]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data }));
    // The canvas is the first element; the object is the next one that declares
    // border-box. Both sizes have to appear, in that order.
    const canvas = `width:${spec.canvas.w}px;height:${spec.canvas.h}px`;
    const object = `width:${spec.card.w}px;height:${spec.card.h}px`;
    assert.ok(html.includes(canvas), `${name} canvas is not ${spec.canvas.w}x${spec.canvas.h}`);
    assert.ok(html.includes(object), `${name} object is not ${spec.card.w}x${spec.card.h}`);
    assert.ok(html.indexOf(canvas) < html.indexOf(object), `${name} draws the object outside the canvas`);
    assert.ok(html.includes(`border-radius:${RADIUS}px`), `${name} radius moved`);
    assert.ok(html.includes(`padding:${PADDING}px`), `${name} padding moved`);
    const declared = html.match(/box-sizing:\s*border-box/g) || [];
    assert.ok(declared.length >= 2, `${name} must declare border-box on canvas AND object, found ${declared.length}`);
  }
  // And the margin the geometry implies is still uniform on both. Compared with a
  // tolerance rather than rounded: the object width is ITSELF a rounding of
  // 1080 - 2*86.4 = 907.2, so re-deriving the margin from it lands on 86.5.
  for (const spec of [CARD_A, CARD_B]) {
    assert.ok(Math.abs((spec.canvas.w - spec.card.w) / 2 - spec.margin) < 0.5);
  }
});

test('THE KICKER IS A LEADING ARTICLE, not the first word (甲 vs 癸)', () => {
  // Spec §2.1 and §7.2. THE RULE STAYS A LEADING-ARTICLE RULE even though all ten
  // name_en values now carry an article — 癸 Embun became "The Morning Dew" on
  // 2026-08-19 (Reyner's ruling). The two unit cases below are properties of the
  // FUNCTION, asserted on literals, and they must hold whatever the fixture says:
  // a first-word rule would print MORNING as a kicker and leave DEW as the whole
  // headline, which is not the archetype's name.
  assert.deepEqual(splitName('The Teak'), { kicker: 'The', head: ['Teak'] });
  assert.deepEqual(splitName('Morning Dew'), { kicker: null, head: ['Morning', 'Dew'] });
  // THE FIXTURE CLAIMS ARE READ FROM THE GLOSSARY, NEVER TYPED. The 08-19 ruling
  // broke this test precisely because the old version hardcoded "Morning Dew" in
  // three places, so a one-field content ruling failed an assertion about the card
  // instead of being carried by it.
  const names = STEMS.map((s) => GLOSSARY.arketipe[s].name_en);
  assert.equal(names.filter((n) => splitName(n).kicker === null).length, 0,
    'all ten archetypes carry a definite article (ruled 2026-08-19)');
  assert.deepEqual(names.filter((n) => splitName(n).head.length > 1), ['The Morning Dew'],
    'exactly one archetype has a multi-word head, and it is the one that reduces to 0.80');

  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const base = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const render = (stem, nameEn) => renderToStaticMarkup(
    React.createElement(CardA, { data: { ...base, stem, nameEn } }));

  // 甲: a kicker, and a ONE-line headline at the full 139.
  const jati = render('甲', GLOSSARY.arketipe['甲'].name_en);
  assert.ok(jati.includes('>The</div>'), '甲 must render "The" as its own kicker element');
  assert.ok(jati.includes('font-size:139px'), '甲 headline must be the full 139');

  // 癸: THE ONLY CARD CARRYING BOTH A KICKER AND A TWO-LINE HEADLINE, which is new
  // as of the 08-19 ruling and is what the article cost. The headline still comes
  // down to 0.80 because "MORNING" at 139 leaves only 23px of the 763px measure.
  // MEASURED ON THE REAL LAYOUT, 2026-08-19, `npm run preview:cards` read through a
  // browser: the headline block grows 248.3 -> 323.9 export px, and the hook
  // paragraph is `flex-grow:1`, so it absorbs the whole 75.6px and keeps 302.3px
  // (5.08 lines) of headroom. 癸 does not clip and is not the tightest card — 丁 is,
  // at 280.7px. That is why the ruling needed no layout change to go with it.
  const embun = render('癸', GLOSSARY.arketipe['癸'].name_en);
  assert.ok(embun.includes('>The</div>'), '癸 must NOW render a kicker as well');
  assert.ok(embun.includes('>Morning</div>') && embun.includes('>Dew</div>'),
    '癸 headline must be two lines');
  assert.ok(embun.includes(`font-size:${139 * 0.8}px`), '癸 headline must come down for measure');
});

test('BRASS IS A GLOBAL FINISH, selected by the ink pole and never by a stem list', () => {
  // Spec §5 and §6.3. A stem list desyncs the moment a token is re-hexed, and
  // re-hexing the five proposed tokens is exactly what is expected next.
  const light = STEMS.filter((s) => inkIsDark(CARD_TOKENS[s]));
  assert.deepEqual(light, ['己', '辛', '癸'], 'Taman, Permata, Embun take the inverted finish');
  // The predicate must agree with luminance, or a token's ink is fighting its
  // field and `inkVerdict` is the thing that should be saying so.
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    assert.equal(inkIsDark(t), luminance(t.ink) < luminance(t.field), `${stem}`);
    assert.equal(brassFor(t), inkIsDark(t) ? BRASS.dark : BRASS.light, `${stem} has the wrong brass`);
  }
  // Brass is NOT a fourth token slot: it does not vary per archetype.
  assert.equal(new Set(STEMS.map((s) => brassFor(CARD_TOKENS[s]))).size, 2,
    'there must be exactly two brasses for the whole set');
  for (const t of Object.values(CARD_TOKENS)) {
    for (const k of Object.keys(t)) assert.ok(!/brass/i.test(k), 'CARD_TOKENS must stay a triple');
  }
});

test('§6.4 MEASURED — the brass-text fallback is PER CARD: 4 on A, 8 on B', () => {
  // The spec predicted brass text would "clear 4.5 comfortably" on dark fields
  // and flagged Taman as the one risk. Measured on the FLAT FIELD it failed on
  // five, then four when 戊 Gunung's field went to #4A3A1E on 2026-08-15
  // (2.52 -> 6.00): pale brass is a LIGHT metallic and Bambu's green and
  // Matahari's orange are not dark enough to carry it. Those four are CARD A's
  // set, and the flat field is Card A's entire test because it has no overlay.
  //
  // A2, 2026-08-19: the flat field was never the surface CARD B draws brass text
  // on. Against the field AND every `sheenGrounds()` stop, four more fail —
  // 甲 5.57 -> 3.63, 丁 5.54 -> 3.83, 戊 6.00 -> 3.80, 壬 6.46 -> 4.12 — and
  // retreat to ink, which holds 5.96 / 6.20 / 6.34 / 6.71 on that same lit ground.
  //
  // ── RULED PER CARD BY REYNER, 2026-08-19 ───────────────────
  // A2 first shipped POOLED, which cost Card A its brass name on 甲 丁 戊 壬 to
  // solve a problem Card A does not have. Card A is the free shareable card and
  // the acquisition loop. One archetype on two surfaces with different physics is
  // not two archetypes; the rim and the drop shadow are already Card B only.
  //
  // RULED AS BUILT 2026-08-15: the retreat to ink stays, and there is to be no
  // second darker BRASS_TEXT — brass is two global values (§6.3).
  const failA = brassTextFallbacks(CARD_TOKENS, 'A').map((f) => f.stem);
  const failB = brassTextFallbacks(CARD_TOKENS, 'B').map((f) => f.stem);
  assert.deepEqual(failA, ['乙', '丙', '己', '癸'],
    "Card A's fallback set moved - it judges the FLAT FIELD, so only a token edit moves it");
  assert.deepEqual(failB, ['甲', '乙', '丙', '丁', '戊', '己', '壬', '癸'],
    "Card B's fallback set moved - re-read the §6.4 report in Card.js");
  assert.equal(new Set(STEMS.map((s) => brassFor(CARD_TOKENS[s]))).size, 2,
    'brass must stay two global values, never a third darker one');

  // A IS A STRICT SUBSET OF B. Anything failing on the flat field also fails with
  // a wash over it, so a token on A's list and off B's would be an arithmetic bug.
  for (const stem of failA) {
    assert.ok(failB.includes(stem), `${stem} fails on Card A but not Card B, which is impossible`);
  }
  // THE SPLIT IS EXACTLY THE FOUR TOKENS THE SHEEN COSTS, named so a silent
  // widening of it fails here rather than in someone's eye.
  assert.deepEqual(failB.filter((s) => !failA.includes(s)), ['甲', '丁', '戊', '壬'],
    'the per-card split moved: these are the tokens brass survives on A and not on B');

  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    // NEITHER CARD MAY ADOPT THE OTHER'S ANSWER — asserted per card, per token,
    // which is the whole point of the split being a parameter rather than a mood.
    for (const [card, failing] of [['A', failA], ['B', failB]]) {
      const drawn = brassTextFor(t, card);
      if (failing.includes(stem)) {
        assert.equal(drawn, t.ink, `${stem} must retreat to ink on Card ${card}`);
      } else {
        assert.equal(drawn, brassFor(t).text, `${stem} must keep brass text on Card ${card}`);
        assert.ok(contrast(drawn, t.field) >= MIN_CONTRAST, `${stem} keeps brass under AA on ${card}`);
      }
    }
  }
  // A MISSING OR BOGUS CARD THROWS. A default is how a surface silently inherits
  // the wrong physics, and it is the failure this split exists to prevent.
  for (const bad of [undefined, null, '', 'a', 'C', 0]) {
    assert.throws(() => brassTextFor(CARD_TOKENS['甲'], bad), /card surface/,
      `brassTextFor accepted ${JSON.stringify(bad)} as a card`);
  }
  // The fallback is per TOKEN and per CARD, never per role: dropping brass text
  // everywhere because Bambu cannot hold it would spend the tokens that can.
  assert.ok(failB.length < STEMS.length, 'brass text must survive somewhere even on Card B');
  // And brass stays on NON-text everywhere, including the fallback tokens — that
  // is what keeps 1e reading as the paid card on all ten.
  for (const stem of failB) {
    const html = renderToStaticMarkup(React.createElement(CardB, {
      data: { ...cardFor('1989-09-13'), stem },
    }));
    assert.ok(html.includes(brassFor(CARD_TOKENS[stem]).stops[1]), `${stem} lost the brass seal`);
  }
  // ── THE HALF OF THE SPLIT THAT IS CURRENTLY UNOBSERVABLE ───
  // Card A's answer reaches no pixel today, and that is the honest state rather
  // than a hole in the test. All three roles that read `brassText` are Card B
  // only, because Card A carries NO FINISH (ruled 2026-08-14): no `nameId`, no
  // `badgeLabelFoil`, no `PillarCells`.
  //
  // THIS ASSERTION IS WHY THE SPLIT IS NOT DEAD CODE. It pins the fact that makes
  // Card A's answer invisible. The day someone gives Card A a brass role, this
  // fails and tells them the per-card decision has just started to matter -
  // instead of Card A silently inheriting a sheen it does not have.
  const BRASS_ROLES = Object.entries(TEXT_ROLES)
    .filter(([, r]) => r.on === 'brassText').map(([role]) => role);
  assert.deepEqual(BRASS_ROLES.sort(), ['badgeLabelFoil', 'nameId', 'pillarLabelDay'],
    'the set of roles reading brassText moved - re-check which card draws each');
  for (const stem of ['甲', '丁', '戊', '壬']) {
    const a = renderToStaticMarkup(React.createElement(CardA, {
      data: { ...cardFor('1989-09-13'), stem },
    }));
    assert.ok(!a.includes(BRASS.light.text),
      `Card A drew brass text on ${stem}. Card A has NO FINISH (08-14); if that ruling `
      + 'changed, its brass now has to clear AA on the flat field and this test is the place to say so');
  }
  // Card B, by contrast, DOES draw the brass it keeps - so the split is measured
  // on the surface where it is observable.
  for (const stem of ['庚', '辛']) {
    const b = renderToStaticMarkup(React.createElement(CardB, {
      data: { ...cardFor('1989-09-13'), stem },
    }));
    assert.ok(b.includes(brassFor(CARD_TOKENS[stem]).text),
      `${stem} keeps brass text on Card B and the markup does not contain it`);
  }
});

test('THE INTI DIRI PILL IS TOKEN-INDEPENDENT and beats the pair it replaced', () => {
  // Spec §6.4's other prediction, and this one held. The pill is the brass's own
  // ink on brass, so its ratio does not vary with the archetype at all.
  for (const b of [BRASS.light, BRASS.dark]) {
    assert.ok(contrast(b.ink, b.solid) >= MIN_CONTRAST, `${b.solid} cannot carry ${b.ink}`);
  }
  // TOKEN-INDEPENDENT is the actual claim, so it is the actual assertion: the
  // pill's measured ratio takes exactly two values across all ten archetypes,
  // one per brass, because neither side of the pair comes from the token.
  const measured = new Set(STEMS.map((s) => {
    // 'B' — the INTI DIRI pill is Card B only. The role reads brassInk rather than
    // brassText, so the card does not change this number; it is named for honesty.
    const palette = paletteFor(CARD_TOKENS[s], 'B');
    return contrast(roleStyle('intiDiri', palette).color, palette.brass).toFixed(4);
  }));
  assert.equal(measured.size, 2, `the pill's ratio varies by token: ${[...measured].join(', ')}`);
  for (const m of measured) assert.ok(Number(m) >= MIN_CONTRAST, `pill at ${m}`);
});

test('§4 — NEITHER SILENT EXPORT KILLER REACHES THE MARKUP', () => {
  // `mask-composite` and `background-clip: text` both render correctly in a
  // browser and both come out wrong through html-to-image, which is the export
  // path. Guarding them in the markup is the only place the failure is visible,
  // because the PNG is not something a test looks at.
  const data = cardFor('1989-09-13');
  for (const [name, C] of [['CardA', CardA], ['CardB', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data }));
    assert.ok(!/mask-composite/i.test(html), `${name} uses mask-composite`);
    assert.ok(!/-webkit-mask/i.test(html), `${name} uses a webkit mask`);
    assert.ok(!/background-clip/i.test(html), `${name} uses background-clip`);
    assert.ok(!/color:\s*transparent/i.test(html), `${name} draws transparent text`);
  }
});

test('THE RIM IS AN SVG STROKE, on Card B only, with a unique gradient id', () => {
  // Spec §3.1, §7.6, §7.7 and §7.8.
  const data = cardFor('1989-09-13');
  const a = renderToStaticMarkup(React.createElement(CardA, { data }));
  const b = renderToStaticMarkup(React.createElement(CardB, { data }));

  assert.ok(/<svg/.test(b) && /<rect/.test(b) && /stroke="url\(#/.test(b), 'Card B must draw an SVG rim');
  assert.ok(/stroke-width="2"/.test(b), 'the rim is a 2px stroke');
  // rx is 39, not 40: the stroke straddles the path, so a 2px stroke on a 40px
  // radius overshoots the object's own corner and shows a hairline of canvas.
  assert.ok(b.includes(`rx="${RADIUS - 1}"`), `the rim rx must be ${RADIUS - 1}, not ${RADIUS}`);

  // Card A ships with NEITHER rim nor shadow — the 08-13 rejection stands for it.
  assert.ok(!/<svg/.test(a), 'Card A must draw no rim');
  assert.ok(!/box-shadow/.test(a), 'Card A must draw no shadow');
  assert.ok(/box-shadow:0 20px 44px rgba\(0,0,0,\.38\)/.test(b), 'Card B must carry the ruled drop shadow');

  // TWO CARDS IN ONE DOCUMENT MUST NOT SHARE A GRADIENT. The preview page renders
  // ten of these plus ten thumbnails; a shared id means nine take the first one's
  // colours, and it looks almost right, which is the worst kind of wrong.
  const two = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(CardB, { key: 1, data }),
    React.createElement(CardB, { key: 2, data: { ...data, stem: '辛' } }),
  ));
  const ids = [...two.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 2, 'both cards must define a rim gradient');
  assert.notEqual(ids[0], ids[1], 'rim gradient ids collide across instances');
  // And an id must be usable in a url() reference — no colons from useId.
  for (const id of ids) assert.doesNotMatch(id, /[:\s#]/, `"${id}" is not url()-safe`);
});

test('THE FINISH IS CARD B ONLY, and it survives being 100px tall', () => {
  // 1a and 1e had to stop being one object at two densities. The finish is the
  // axis that answers it, because a light effect survives a thumbnail and detail
  // does not.
  const data = cardFor('1989-09-13');
  const a = renderToStaticMarkup(React.createElement(CardA, { data, scale: 0.093 }));
  const b = renderToStaticMarkup(React.createElement(CardB, { data, scale: 0.07 }));
  assert.ok(/<svg/.test(b) && !/<svg/.test(a), 'the rim is Card B only');
  assert.ok(/rgba\(255,255,255,\.15\)/.test(b), 'the sheen is Card B only');
  assert.ok(!/rgba\(255,255,255,\.15\)/.test(a));
  // The seal, and the fact that Card A keeps katon.app on its footer line.
  assert.ok(b.includes(BRASS.light.stops[1]), 'Card B must carry the brass seal');
  assert.ok(!a.includes(BRASS.light.stops[1]), 'Card A must carry no brass');
  assert.ok(a.includes(data.footer.right) && b.includes(data.footer.right));
});

test('the badges lost the diamond, on both cards', () => {
  // Spec §2.5. It was the only non-typographic mark on Card A, and the hairline
  // above the block already delimits it; on Card B the labels are brass.
  const data = cardFor('1989-09-13');
  for (const [name, C] of [['CardA', CardA], ['CardB', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data }));
    assert.ok(!html.includes('◆'), `${name} still draws the diamond`);
    assert.ok(html.includes(data.badges[0].label), `${name} lost the badge label`);
  }
});

test('the SEAL and the WATERMARK are both decorative, and there is no third hanzi', () => {
  // Spec §3.4. The stem appears twice on Card B — texture and mark — and neither
  // is a character anyone is asked to read, so rule 23 holds.
  const data = cardFor('1989-09-13');
  const html = renderToStaticMarkup(React.createElement(CardB, { data }));
  const stemCount = (html.match(new RegExp(data.stem, 'g')) || []).length;
  // Watermark, seal, and the day pillar's own cell, which IS data and IS paired.
  assert.equal(stemCount, 3, `the day master appears ${stemCount} times`);
  // The two decorative ones are not audited as text.
  const runs = auditRendered(html, CARD_TOKENS[data.stem].field);
  assert.equal(runs.filter((r) => r.text === data.stem).length, 1,
    'exactly one of the three is real text: the pillar cell');
});

test('§8.9 THE WATERMARK FILL IS ACCENT, on both cards, over all ten tokens', () => {
  // Corrected 2026-08-14 (spec §3.5, §6.7). An earlier draft had Card B on
  // `darken(field, .45)` and Card A on a lowered accent alpha, which put the same
  // glyph on the same archetype LIGHTER than the field on A and DARKER on B.
  assert.deepEqual(WATERMARK_FILL, { yang: 0.18, yin: 0.14 });
  const YANG = ['甲', '丙', '戊', '庚', '壬'];
  const base = cardFor('1989-09-13');

  for (const stem of STEMS) {
    const t = CARD_TOKENS[stem];
    const expected = alphaOf(t.accent, YANG.includes(stem) ? 0.18 : 0.14);
    for (const [name, C] of [['CardA', CardA], ['CardB', CardB]]) {
      const html = renderToStaticMarkup(React.createElement(C, { data: { ...base, stem } }));
      const wm = html.slice(html.indexOf('aria-hidden="true"'));
      const style = wm.slice(0, wm.indexOf('>'));
      assert.ok(style.includes(`color:${expected}`),
        `${name} ${stem}: watermark is not accent at the ruled alpha - ${style.match(/color:[^;"]*/)}`);
    }
  }

  // AND THE PATH STAYS CLEAN OF THE THING THAT CAUSED IT. Mixing a hex toward
  // black in sRGB drops chroma with lightness, so a large darkening gives mud
  // rather than a deeper token. `stepAway` has the same failure mode and is safe
  // only at GRADIENT_STOPS' shallow amounts.
  const src = fs.readFileSync(path.join(ROOT, 'components/cards/Card.js'), 'utf8');
  const wmFn = src.slice(src.indexOf('function Watermark('));
  const body = wmFn.slice(0, wmFn.indexOf('\n}\n'));
  assert.ok(!/darken\(/.test(body), 'darken() is back in the watermark path (spec §6.7)');
  assert.ok(!/stepAway\(/.test(body), 'stepAway() is in the watermark path (spec §6.7)');
});

test('§8.10 the deboss is CARD B on DARK FIELDS only', () => {
  // Two hard 2px offsets, no blur: 2 export px on a 907px card is 0.2% of the
  // width. Suppressed on the three light fields, where the dark half of the
  // offset has no gradient to sink into and reads as grime around the strokes.
  const base = cardFor('1989-09-13');
  const debossOf = (C, stem) => {
    const html = renderToStaticMarkup(React.createElement(C, { data: { ...base, stem } }));
    const wm = html.slice(html.indexOf('aria-hidden="true"'));
    const style = wm.slice(0, wm.indexOf('>'));
    const m = style.match(/text-shadow:([^;"]*)/);
    return m ? m[1] : null;
  };

  for (const stem of STEMS) {
    const lightField = inkIsDark(CARD_TOKENS[stem]);
    assert.equal(debossOf(CardA, stem), null, `${stem}: Card A must never deboss`);
    const b = debossOf(CardB, stem);
    if (lightField) {
      assert.equal(b, null, `${stem} is a light field and must not deboss`);
    } else {
      assert.ok(b, `${stem} is a dark field and must deboss`);
      // TWO HARD OFFSETS AND A ZERO BLUR RADIUS, asserted as the whole string.
      // The third length in each half is the blur, and it must be 0: any blur at
      // all renders as a misregistered second copy of the glyph rather than as
      // depth. Matching the exact shape is what catches a "0 2px 1px" edit.
      assert.match(
        b,
        /^0 2px 0 rgba\(\d+,\d+,\d+,0?\.07\), 0 -2px 0 rgba\(0,0,0,0?\.10?\)$/,
        `${stem}: deboss is "${b}", not the ruled two hard 2px offsets`,
      );
    }
  }
  // The suppressed set is exactly the light-field branch, read off the predicate.
  const suppressed = STEMS.filter((s) => debossOf(CardB, s) === null);
  assert.deepEqual(suppressed, ['己', '辛', '癸'], 'Taman, Permata, Embun');
});

test('§8.11 TWO EXPORT TARGETS: share is the canvas, download is the object', () => {
  // Spec §7. The download stops at the card edge; the share keeps the field,
  // because the field is what makes the posted file feed-safe.
  //
  // ── THE PIXEL HALF OF §7.3 IS NOT HERE, AND CANNOT BE ─────
  // "corners transparent, edge is rim not field" are claims about a raster.
  // html-to-image renders through an SVG foreignObject and needs a real layout
  // engine and a real canvas; jsdom has neither. So the raster assertions live in
  // `npm run probe:card-export`, which inlines html-to-image, captures both
  // targets for a dark-field and a light-field token, and reads pixels back off a
  // canvas. It must be served over http (`npm run serve:reports`) — from a
  // file:// or data: origin the document is opaque, every drawn image taints the
  // canvas, and getImageData throws instead of measuring.
  //
  // RUN 2026-08-15, all four assertions passing:
  //   甲 Card A  907x1267  corners alpha=0  edge #194529 (gradient, A has no rim)
  //   甲 Card B  907x1747  corners alpha=0  edge #335a41 rim, distance 61 from field
  //   辛 Card A  907x1267  corners alpha=0  edge #eeebe5 (gradient)
  //   辛 Card B  907x1747  corners alpha=0  edge #d3d0cc rim, distance 76 from field
  // Both rim branches are covered: on a dark field the rim reads lighter than the
  // field, on a light field darker, and neither is the field itself.
  //
  // What FOLLOWS is the part that is checkable without a browser, and it is the
  // part that would silently break the raster one: the descriptor, the ids and
  // the radius.
  assert.deepEqual(CAPTURE_KINDS, ['share', 'download']);

  for (const [card, spec] of [['A', CARD_A], ['B', CARD_B]]) {
    const share = captureSpec('share', card);
    const dl = captureSpec('download', card);

    // SHARE: the canvas node, at the ruled feed-native canvas size.
    assert.equal(share.width, spec.canvas.w);
    assert.equal(share.height, spec.canvas.h);
    assert.ok(!share.nodeId.endsWith(OBJECT_ID_SUFFIX), 'share must capture the canvas');

    // DOWNLOAD: the object node, at the object's own size, and no field.
    assert.equal(dl.width, spec.card.w);
    assert.equal(dl.height, spec.card.h);
    assert.ok(dl.nodeId.endsWith(OBJECT_ID_SUFFIX), 'download must capture the object');

    // PNG WITH ALPHA, never JPEG: the object's 40px radius leaves four
    // transparent corners and a JPEG would fill them with solid triangles.
    for (const s of [share, dl]) assert.equal(s.type, 'png');
    // And nothing may set a background colour, which would fill those corners.
    for (const s of [share, dl]) assert.equal(s.style.backgroundColor, undefined);

    // CARD B'S DROP SHADOW is drawn outside the object bounds and would be
    // clipped to a hard band. Dropped from the download, on both cards, so the
    // contract is a property of the capture rather than of which card it got.
    assert.equal(dl.style.boxShadow, 'none');
    assert.equal(share.style.boxShadow, undefined, 'the share keeps the shadow - it has a canvas to sit on');
  }
  assert.throws(() => captureSpec('nope', 'A'), /Unknown capture kind/);

  // The ids the capture reaches for must actually be in the rendered markup, or
  // both exports throw at the one moment a user is watching.
  const data = cardFor('1989-09-13');
  for (const [card, C] of [['A', CardA], ['B', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data, id: 'probe' }));
    assert.ok(html.includes('id="probe"'), `Card ${card} canvas has no id`);
    assert.ok(html.includes(`id="probe${OBJECT_ID_SUFFIX}"`), `Card ${card} object has no id`);
    // The object must be the one carrying the radius, or the crop has no corners
    // to make transparent.
    const obj = html.slice(html.indexOf(`id="probe${OBJECT_ID_SUFFIX}"`));
    assert.match(obj.slice(0, obj.indexOf('>')), new RegExp(`border-radius:${RADIUS}px`));
  }
});

test('THE ACCENT FLOOR IS FROZEN AT ITS 08-13 MEASUREMENT, not derived any more', () => {
  // Spec §6.6. A TOKEN report — `components/cards/Card.js` never calls it. The
  // bar is the ruled set's own worst case, not WCAG: accent is non-text.
  //
  // ── WHY IT STOPPED BEING DERIVED (2026-08-15) ──────────────
  // Deriving it from the `approved: true` rows was right while five were locked
  // and five proposed. With ALL TEN approved it becomes the set's own minimum,
  // `under` comes back empty, and the guard degrades into an assertion that a set
  // cannot be worse than its worst member — reporting "all clear" at the exact
  // moment two ruled tokens sit below the bar.
  const { floor, under, below, rows } = accentAudit(CARD_TOKENS);
  assert.equal(floor, ACCENT_FLOOR);

  // THE CONSTANT IS ITS OWN DERIVATION, recomputed from the five hexes the floor
  // was read off on 08-13 — frozen because those hexes are history and do not
  // move, not because someone typed the number.
  assert.equal(ACCENT_FLOOR, accentFloorFromLocked());
  // And it PRINTS as 3.31, which is the number in every doc and report. The true
  // measurement is 3.3075: freezing the rounded-up 3.31 instead put the bar above
  // the token that defines it and reported Matahari as failing its own floor.
  assert.equal(ACCENT_FLOOR.toFixed(2), '3.31');
  assert.ok(ACCENT_FLOOR < 3.31, 'the constant must be the measurement, not its presentation');

  // AND THE DEGENERATE CASE IS PINNED, so nobody re-derives it by accident.
  const derived = Math.min(...Object.values(CARD_TOKENS).map((t) => contrast(t.accent, t.field)));
  assert.ok(derived < ACCENT_FLOOR,
    'if the set minimum ever rises above the frozen floor, deriving becomes safe again');
  assert.ok(Math.abs(derived - 3.05) < 0.01, 'Embun is the set minimum at 3.05');

  // Two approved tokens sit BELOW the floor and are named rather than averaged
  // away. Both are light fields, where accent has less room between field and ink.
  assert.deepEqual(below.sort(), ['己', '癸'].sort(), 'Taman 3.26, Embun 3.05');
  assert.deepEqual([...ACCENT_EXEMPT].sort(), below.sort(),
    'ACCENT_EXEMPT must name exactly the approved tokens under the floor');
  for (const stem of below) {
    assert.ok(inkIsDark(CARD_TOKENS[stem]), `${stem} should be a light field`);
  }
  // Excused, so nothing gates on them — but still measured and still printed.
  assert.deepEqual(under, [], 'the exempt two must not be reported as unexcused failures');
  for (const stem of ACCENT_EXEMPT) {
    const row = rows.find((r) => r.stem === stem);
    assert.ok(row.ratio > 0, `${stem}'s real ratio must still be reported, not skipped`);
    assert.equal(row.exempt, true);
  }

  assert.ok(!below.includes('丙'), 'Matahari DEFINES the floor and cannot fail it');
  // 戊 Gunung left this list on 2026-08-15 (3.02 -> 7.18) when its field darkened.
  assert.ok(!below.includes('戊'), 'Gunung cleared the floor with its new field');
  assert.equal(rows.length, 10);
});


test('the watermark sits TOP-RIGHT on both cards and both polarities', () => {
  // Ruled 2026-08-13. The headline is top-left, so top-right is the one large
  // empty region; Card B's bottom third is the densest area in the system, and a
  // watermark behind the pillar cells is interference rather than texture.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const yang = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  assert.ok(['甲', '丙', '戊', '庚', '壬'].includes(yang.stem), 'this fixture chart must be yang');
  for (const stem of [yang.stem, '乙']) {
    for (const C of [CardA, CardB]) {
      const html = renderToStaticMarkup(React.createElement(C, { data: { ...yang, stem } }));
      const wm = html.slice(html.indexOf('aria-hidden="true"'));
      const style = wm.slice(0, wm.indexOf('>'));
      assert.match(style, /top:/, `${stem} watermark must be pinned to the top`);
      assert.match(style, /right:/, `${stem} watermark must be pinned to the right`);
      assert.ok(!/bottom:|left:/.test(style), `${stem} watermark still uses the old lower-left placement`);
    }
  }
});

test('ALL TEN tokens are approved, and this stays a tripwire', () => {
  // It fired as designed on 2026-08-15: it read "exactly five" for two weeks and
  // failed the moment Reyner ruled the other five, which is the prompt it exists
  // to be. It is not retired now that the number is ten — it should fail again if
  // anyone adds an eleventh token or flips one back to proposed.
  assert.equal(APPROVED_STEMS.length, 10);
  assert.equal(STEMS.length, 10, 'an eleventh archetype needs a colour ruling first');
  assert.deepEqual(STEMS.filter((s) => !CARD_TOKENS[s].approved), []);
  // The gate is still wired and still answers per stem, so an unapproved token
  // added later cannot reach a route just because the count looks right.
  for (const stem of STEMS) assert.equal(tokenApproved(stem), true, stem);
  assert.throws(() => tokenApproved('X'), /No card token/);
});

// ── HEAD AND HEADLINE (2026-08-03 ruling 2, and 08-01 decision 3) ──

test('the headline is TWO AXES: archetype, then Aspek', () => {
  const d = cardFor('1989-09-13');
  assert.equal(d.nameEn, 'The Sun');
  assert.equal(d.nameId, 'Matahari');
  assert.ok(d.aspek && d.aspek.startsWith('Aspek '), `Aspek axis missing: ${d.aspek}`);
});

test('Card A head is name_en ONLY, and the Aspek stays Indonesian on both cards', () => {
  // The Indonesian archetype name appears nowhere on the free card; it lives in
  // the reading. Enforced at the component level in tests/card.render.spec is not
  // possible without a DOM, so the data contract carries it: `nameId` exists for
  // Card B and the renderer is the one place it may be printed.
  const d = cardFor('1989-09-13');
  assert.notEqual(d.nameEn, d.nameId);
  assert.doesNotMatch(d.aspek, /[A-Za-z]+ (Wealth|Officer|Resource|Killing)/,
    'the Aspek must be the Indonesian name, not the English bracket');
});

// ── TAGS (2026-08-01 decision 2: HYBRID, 3 fixed + 3 dynamic) ──

test('every archetype has exactly three fixed tags', () => {
  for (const stem of STEMS) {
    const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
    const semanticJson = buildSemanticJson(chart);
    semanticJson.core.day_master = stem; // exercise the table, not this chart
    const d = buildCardData({ chart, semanticJson });
    assert.equal(d.tags.fixed.length, 3, `${stem} fixed tags`);
  }
});

test('dynamic tags come from the chart and are capped at three', () => {
  const d = cardFor('1989-09-13');
  assert.ok(d.tags.dynamic.length <= 3);
  // Ranking belongs to Stage 3. This asserts the card does not re-sort: the tags
  // must appear in the same relative order as the facts they came from.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const facts = buildSemanticJson(chart).facts;
  const taken = new Set(d.badges.map((b) => b.label));
  const expected = facts
    .filter((f) => (f.type === 'badge' || f.type === 'convergence') && f.label && !taken.has(f.label))
    .slice(0, 3).map((f) => f.label);
  assert.deepEqual(d.tags.dynamic, expected);
});

// ── CONTENT BUDGET (Reyner's review, 2026-08-13) ───────────
// The badge block is the only content-driven size on a fixed rectangle: count
// 1-4, meaning 109-186 chars, about a sevenfold range. Either the widest content
// fits or the design is only true for the charts that happen to be short.

test('CARD A shows no Aspek tags, CARD B does', () => {
  // "Aspek Pengatur" is system vocabulary. Card A meets someone in a feed and has
  // no comprehension budget to teach it; Card B is a document its owner paid for.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  assert.ok(data.tags.dynamic.length > 0, 'this chart must have dynamic tags for the test to mean anything');

  const a = renderToStaticMarkup(React.createElement(CardA, { data }));
  const b = renderToStaticMarkup(React.createElement(CardB, { data }));
  for (const tag of data.tags.dynamic) {
    assert.ok(!a.includes(tag), `Card A must not print the Aspek tag "${tag}"`);
    assert.ok(b.includes(tag), `Card B must print the Aspek tag "${tag}"`);
  }
  // The three fixed trait words stay on BOTH.
  for (const t of data.tags.fixed) {
    assert.ok(a.includes(t) && b.includes(t), `fixed tag "${t}" missing`);
  }
});

test('badge bullets carry no palace', () => {
  // "◆ Penyendiri", not "◆ Penyendiri Pilar Akar". The reading carries
  // provenance; the card does not need it and the line space is scarce. The 08-01
  // Bintang Penolong rule is about PROSE, not bullets — see the note on <Badges>.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const withPalace = data.badges.filter((b) => b.palace);
  assert.ok(withPalace.length > 0, 'the data still carries palaces; only the render drops them');
  for (const Card of [CardA, CardB]) {
    const html = renderToStaticMarkup(React.createElement(Card, { data }));
    for (const b of withPalace) {
      assert.ok(!html.includes(`${b.label}   ${b.palace}`), `${b.label} still prints its palace`);
    }
  }
});

test('Card B renders at most TWO badges, which is the 08-14 re-probe result', () => {
  // It was three. Spec §6.5 asked for the budget to be re-measured against 1e's
  // taller footer, and the measurement said three no longer fits at all: 丁 Api
  // Unggun's real copy, three entries all inside the 200 ceiling, overflowed the
  // object by 63 export pixels and was clipped silently. See CARD_B_BADGE_LIMIT.
  assert.equal(CARD_B_BADGE_LIMIT, 2);
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const base = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const data = { ...base, badges: [1, 2, 3, 4].map((i) => ({ label: `Bintang ${i}`, meaning: `M${i}`, palace: null })) };
  const b = renderToStaticMarkup(React.createElement(CardB, { data }));
  assert.ok(b.includes('Bintang 2'), 'the second badge must render');
  assert.ok(!b.includes('Bintang 3'), 'the third must be cut - Stage 3 ranked it less important');
  // Card A is NOT capped: without meanings each badge is one short line.
  const a = renderToStaticMarkup(React.createElement(CardA, { data }));
  assert.ok(a.includes('Bintang 4'));
});

test('every bintang label_meaning fits the measured ceiling', () => {
  // 200 chars, measured with `audit:card-budget --probe` against REAL Indonesian:
  // the block gains a line between 200 and 210 at three bullets. Currently 8 of 8
  // pass with 14 characters of headroom on the longest, so this is a tripwire for
  // the next entry someone writes rather than a backlog of edits.
  const over = Object.entries(GLOSSARY.bintang)
    .map(([k, v]) => ({ k, len: (v.label_meaning || '').length }))
    .filter((e) => e.len > MAX_LABEL_MEANING);
  assert.deepEqual(over.map((e) => `${e.k}=${e.len}`), [],
    `over the ${MAX_LABEL_MEANING}-char ceiling. Run: npm run audit:card-budget`);
});

test('the ceiling is not vacuous — it sits above the longest entry, but not far above', () => {
  // A ceiling of 9999 would pass the test above and constrain nothing. This pins
  // it to the measurement: real headroom, but less than one more badge's worth.
  const longest = Math.max(...Object.values(GLOSSARY.bintang).map((v) => (v.label_meaning || '').length));
  assert.ok(MAX_LABEL_MEANING >= longest, 'the ceiling must not fail existing ruled copy');
  assert.ok(MAX_LABEL_MEANING < longest * 1.5, 'the ceiling has drifted away from what was measured');
});

test('NOTHING appears both as a dynamic tag and in the badge row', () => {
  // The defect Reyner caught 2026-08-13: a chart's Bintang printed twice on one
  // card, dimmed in the tag row and again with its palace below. The tag row
  // exists to differentiate, so a repeat costs a slot and gains nothing.
  // Checked across the whole fixture, not one chart — the collision only happens
  // when a Bintang ranks high enough to reach the top three.
  for (const c of VALIDATION_CHARTS) {
    const d = cardFor(c.date, { birthTime: c.time });
    const badgeLabels = new Set(d.badges.map((b) => b.label));
    const dupes = d.tags.dynamic.filter((t) => badgeLabels.has(t));
    assert.deepEqual(dupes, [], `chart ${c.id} repeats ${dupes.join(', ')}`);
  }
});

test('the exclusion reads the BADGE ROW, not the fact type', () => {
  // Equivalent today, because the badge row renders every badge. They stop being
  // equivalent the moment that row is capped, and the version that survives a cap
  // is the one that reads what is really on the card.
  const facts = [
    { type: 'badge', label: 'Shown' },
    { type: 'badge', label: 'Cut' },
    { type: 'convergence', label: 'Aspek X' },
  ];
  // Only "Shown" reaches the badge row, so "Cut" is still available as a tag.
  assert.deepEqual(dynamicTags(facts, [{ label: 'Shown' }]), ['Cut', 'Aspek X']);
});

test('a thin chart yields fewer than three dynamic tags rather than an invented one', () => {
  // Chart 7 of the fixture is the thinnest (9 facts) and supplies only two.
  // Padding to three would mean the card inventing a fact — rule 14.
  assert.deepEqual(dynamicTags([{ type: 'badge', label: 'A' }, { type: 'convergence', label: 'B' }]), ['A', 'B']);
  assert.deepEqual(dynamicTags([]), []);
});

// ── FOOTER (2026-08-03 ruling 3: gender strings APPROVED) ──

test('the footer gender strings are exactly the approved two', () => {
  assert.equal(buildFooter({ gender: 'female', birthDate: '1989-09-13' }).gender, 'PEREMPUAN');
  assert.equal(buildFooter({ gender: 'male', birthDate: '1989-09-13' }).gender, 'LAKI-LAKI');
});

test('null gender renders date + source only, with no placeholder', () => {
  const f = buildFooter({ gender: null, birthDate: '1989-09-13' });
  assert.equal(f.gender, null);
  assert.equal(f.left, '13 Sep 1989');
  assert.equal(f.right, 'katon.app');
  // THIS IS THE LIVE CASE as of 2026-08-13: the funnel does not collect gender,
  // so every card rendered from a real reading today takes this branch.
  assert.doesNotMatch(f.left, /PEREMPUAN|LAKI-LAKI|null|undefined/);
});

test('an unknown gender value is treated as absent, never printed', () => {
  assert.equal(buildFooter({ gender: 'other', birthDate: '1989-09-13' }).gender, null);
  assert.equal(buildFooter({ gender: 'OTHER', birthDate: '1989-09-13' }).left, '13 Sep 1989');
});

test('the footer carries no banned typography (rule 20, keyboard characters only)', () => {
  // The card footer is user-facing chrome. The 08-03 token proposal reproduced a
  // U+00B7 middle dot here and flagged it as an unclosed rule-20 violation;
  // scripts/check-copy.js bans that character with zero exceptions.
  const f = buildFooter({ gender: 'female', birthDate: '1989-09-13' });
  for (const ch of ['—', '–', '·', '…', '‘', '’', '“', '”']) {
    assert.ok(!`${f.left}${f.right}`.includes(ch), `banned character ${ch} in the footer`);
  }
});

test('a missing birthdate yields no date rather than a guess', () => {
  assert.equal(formatCardDate(null), '');
  assert.equal(buildFooter({ gender: null, birthDate: null }).left, '');
  assert.equal(formatCardDate('1989-09-13'), '13 Sep 1989');
});

// ── WHAT CARD A MUST NOT CARRY (2026-08-01) ────────────────

test('Card A data carries no strength verdict and no numbers', () => {
  // Rule 21 permits "lemah" only when the explanation lands in the same breath,
  // and a card has no room for that. Percentages invite comparison of the wrong
  // thing. Both live in `appendix`, which only Card B renders.
  const d = cardFor('1989-09-13');
  const cardAsurface = JSON.stringify({
    nameEn: d.nameEn, aspek: d.aspek, tags: d.tags, hook: d.hook,
    badges: d.badges.map((b) => b.label), footer: d.footer,
  });
  assert.doesNotMatch(cardAsurface, /\b(lemah|kuat|seimbang)\b/i);
  assert.doesNotMatch(cardAsurface, /\d+([.,]\d+)?\s?%/);
});

test('the four pillar characters are Card B only, and none is left bare', () => {
  const d = cardFor('1989-09-13');
  // Card A's PROSE carries no hanzi. The single watermark stem is separate: it is
  // decorative texture drawn by the component, not a field of this data.
  assert.equal(d.hook.includes('丙'), false);
  // On Card B the four pillars STAY (ruled 2026-08-13) and every character is
  // paired so it can be read: stem and branch split out for the cell treatment,
  // element and polarity beneath, the branch's animal beneath that (rule 23).
  for (const p of d.appendix.pillars) {
    assert.ok(p.stem && p.branch, `${p.key} is missing a split stem/branch`);
    assert.equal(p.ganzhi, `${p.stem}${p.branch}`);
    assert.ok(p.element && p.polarity && p.animal, `${p.key} is bare hanzi`);
    assert.doesNotMatch(p.element, /Wood|Fire|Earth|Metal|Water/,
      'element must be Indonesian on a user-facing surface');
    assert.match(p.polarity, /^(Yin|Yang)$/);
  }
  assert.equal(d.appendix.pillars.filter((p) => p.isDayMaster).length, 1, 'exactly one INTI DIRI');
});

test('胎元 is OFF the card and still ON the engine (ruled 2026-08-13)', () => {
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const d = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  // The engine keeps computing it — 5/5 against Joey, and the reading's own chart
  // block still shows it. The card drops it: a chart-sheet fact on an object
  // whose one job is to travel.
  assert.ok(chart.conceptionPalace, 'the engine must still compute 胎元');
  const json = JSON.stringify(d);
  assert.ok(!json.includes('Istana Konsepsi'), '胎元 must not reach the card');
  assert.equal(d.appendix.conception, undefined);
  // 命宮 was already absent and stays absent for a different reason: no candidate
  // convention reproduces Joey better than 4/5 (D1b).
  assert.ok(!json.includes('命宮') && !json.includes('Istana Kehidupan'));
});

test('an hour-less chart still renders a card, with three pillars', () => {
  const d = cardFor('1989-09-13', { birthTime: null });
  assert.equal(d.appendix.pillars.length, 3);
  assert.ok(d.nameEn && d.aspek);
});

test('EVERY HANZI THE CARD CAN DRAW IS IN THE SUBSET, on all ten tokens', () => {
  // THE FAILURE MODE THIS EXISTS FOR IS TOFU, and tofu is silent: a missing glyph
  // is a box in an exported PNG that no assertion about colour, size or layout
  // can see. The subset is 65 glyphs derived from glossary.json; the card draws
  // hanzi at four sites (pillar stem, pillar branch, seal, watermark). If a
  // future badge, label or watermark introduces a character outside the set, it
  // renders as a box and this is what says so.
  const inSubset = new Set([...HAN_GLYPHS]);
  const CJK = /[㐀-䶿一-鿿]/gu;
  const missing = new Set();
  for (const stem of STEMS) {
    const data = cardFor('1989-09-13', { stem });
    for (const C of [CardA, CardB]) {
      const html = renderToStaticMarkup(React.createElement(C, { data }));
      // The @font-face itself is base64 and carries no CJK; strip the <style>
      // before scanning so the subset cannot appear to contain itself.
      const body = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
      for (const ch of body.match(CJK) || []) if (!inSubset.has(ch)) missing.add(ch);
    }
  }
  assert.deepEqual([...missing], [],
    'the card draws a hanzi outside the subset - it will render as tofu. Run: npm run build:han-subset');
});

test('THE HANZI FACE TRAVELS INSIDE THE OBJECT, so the download target carries it', () => {
  // exportCards crops the DOWNLOAD capture to the object. A @font-face on the
  // canvas, on the page, or in globals.css is outside that crop, and the
  // downloaded PNG would fall back to the OS - which is the defect this replaced,
  // reintroduced through the export path only, where nobody would look.
  const data = cardFor('1989-09-13');
  for (const [name, C] of [['CardA', CardA], ['CardB', CardB]]) {
    const html = renderToStaticMarkup(React.createElement(C, { data, id: 'x' }));
    const objectAt = html.indexOf(`id="x${OBJECT_ID_SUFFIX}"`);
    const styleAt = html.indexOf('@font-face');
    assert.ok(objectAt > -1, `${name} must render the object id`);
    assert.ok(styleAt > -1, `${name} must carry the @font-face`);
    assert.ok(styleAt > objectAt,
      `${name} declares the font OUTSIDE the object - the download crop would lose it`);
    // React escapes the quotes inside a style attribute, so the markup carries
    // &quot;Noto Serif TC&quot; rather than the literal. Match the family name.
    assert.ok(html.includes(HAN_FAMILY), `${name} must ask for ${HAN_FAMILY}`);
  }
});
