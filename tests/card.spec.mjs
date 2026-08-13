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
import { CARD_TOKENS, tokenFor, APPROVED_STEMS } from '../lib/card/tokens.js';
import { auditContrast, contrast, composite, surfaces } from '../lib/card/contrast.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  CARD_A, CARD_B, CardA, CardB, TEXT_ROLES, BAND_TINT, MIN_CONTRAST,
  AA_EXEMPT, GRADIENT_STOPS, stepAway, CARD_B_BADGE_LIMIT, MAX_LABEL_MEANING,
} from '../components/cards/Card.js';
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

// ── CONTRAST: every text role x every token ────────────────
// Added 2026-08-13 on Reyner's review. The iteration READS correctly now, so this
// exists to keep it that way: `accent` is by definition the mid-lightness value
// and five of ten fields are pale, so a plausible-looking new hex can halve a
// ratio silently. A bad token must fail a test, not ship.

test('EVERY text role on EVERY token meets WCAG AA, except the two known tokens', () => {
  assert.equal(MIN_CONTRAST, 4.5, 'the target is WCAG AA and it is not negotiable downward');
  const rows = auditContrast(TEXT_ROLES, CARD_TOKENS, BAND_TINT);
  assert.equal(rows.length, Object.keys(TEXT_ROLES).length * Object.keys(CARD_TOKENS).length);

  const under = rows.filter((r) => r.ratio < MIN_CONTRAST);
  const unexpected = under.filter((r) => !AA_EXEMPT.includes(r.stem));
  assert.deepEqual(
    unexpected.map((r) => `${r.stem}.${r.role}=${r.ratio.toFixed(2)}`), [],
    `under AA and not on the known list. Run: npm run audit:card-contrast`,
  );
});

test('the AA exemption list is pinned, so it can only shrink', () => {
  // A REPORT, NOT A PERMISSION. Both entries cannot reach 4.5 at any opacity
  // because their INK ceiling is already under it, so the fix is a token change
  // and the token is Reyner's. Pinning the list exactly means nothing new can
  // join it by accident: a third token going under AA fails the test above.
  assert.deepEqual(AA_EXEMPT, ['丙', '戊']);
  for (const stem of AA_EXEMPT) {
    const t = CARD_TOKENS[stem];
    assert.ok(contrast(t.ink, t.field) < MIN_CONTRAST,
      `${stem} now reaches AA - take it off AA_EXEMPT`);
  }
  // And everything NOT on the list must clear AA at full-opacity ink, which is
  // what makes the list complete rather than a sample.
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    if (AA_EXEMPT.includes(stem)) continue;
    assert.ok(contrast(t.ink, t.field) >= MIN_CONTRAST, `${stem} is under AA and unlisted`);
  }
});

test('ACCENT CARRIES NO TEXT — it is a mid-lightness value and cannot reach AA', () => {
  // The structural finding, 2026-08-13: accent's ceiling against the field runs
  // 3.05 to 5.69 and SIX of ten tokens are under 4.5 at full opacity. No opacity,
  // size or weight change fixes that. So accent is a non-text colour: watermark,
  // bars, the INTI DIRI pill, cell borders.
  for (const role of Object.values(TEXT_ROLES)) assert.equal(role.on, 'ink');
  const failing = Object.entries(CARD_TOKENS)
    .filter(([, t]) => contrast(t.accent, t.field) < MIN_CONTRAST);
  assert.ok(failing.length >= 5, 'if accent now clears AA broadly, this rule can be revisited');
});

test('opacity is part of the measurement, and is no longer a hierarchy tool', () => {
  // Bambu is the binding LOCKED token at ink 4.93, so its lowest usable opacity
  // is 0.94. Anything dimmer fails a colour Reyner ruled, which is why every role
  // sits at 1 and size/weight/italic carry the hierarchy instead.
  const t = CARD_TOKENS['丙'];
  const raw = contrast(t.ink, t.field);
  const dimmed = contrast(composite(t.ink, t.field, 0.5), t.field);
  assert.ok(dimmed < raw - 0.5, `dimming must lower the ratio: ${raw.toFixed(2)} -> ${dimmed.toFixed(2)}`);

  const bambu = CARD_TOKENS['乙'];
  assert.ok(contrast(composite(bambu.ink, bambu.field, 0.9), bambu.field) < MIN_CONTRAST,
    'Bambu at 0.9 opacity should be under AA - that is why roles sit at 1');

  for (const [name, role] of Object.entries(TEXT_ROLES)) {
    assert.equal(role.opacity, 1, `${name} is dimmed; see the note on TEXT_ROLES`);
    assert.ok(['field', 'band'].includes(role.over), `${name} sits over ${role.over}`);
  }
});

test('the appendix band and the gradient step AWAY from the ink, so the FIELD is the worst surface', () => {
  // This is what lets one audit cover both cards. The first version tinted the
  // band toward the ink and quietly cost contrast on the tokens with none spare.
  for (const [stem, t] of Object.entries(CARD_TOKENS)) {
    const { field, band } = surfaces(t, BAND_TINT);
    assert.ok(contrast(t.ink, band) >= contrast(t.ink, field) - 0.001,
      `${stem}: the band has LESS contrast than the field`);
    for (const step of GRADIENT_STOPS) {
      const stop = stepAway(t.field, t.ink, step);
      assert.ok(contrast(t.ink, stop) >= contrast(t.ink, t.field) - 0.001,
        `${stem}: gradient stop ${step} has LESS contrast than the flat field`);
    }
  }
});

test('exactly five tokens are approved, and the unapproved five are flagged', () => {
  // Not a target — a tripwire. When Reyner approves one, this number moves and
  // the failure is the prompt to update LIVE STATE and the deferred register.
  assert.equal(APPROVED_STEMS.length, 5);
  const unapproved = STEMS.filter((s) => !CARD_TOKENS[s].approved);
  assert.deepEqual(unapproved, ['甲', '丁', '戊', '己', '癸']);
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

test('Card B renders at most three badges', () => {
  assert.equal(CARD_B_BADGE_LIMIT, 3);
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const base = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });
  const data = { ...base, badges: [1, 2, 3, 4].map((i) => ({ label: `Bintang ${i}`, meaning: `M${i}`, palace: null })) };
  const b = renderToStaticMarkup(React.createElement(CardB, { data }));
  assert.ok(b.includes('Bintang 3'), 'the third badge must render');
  assert.ok(!b.includes('Bintang 4'), 'the fourth must be cut - Stage 3 ranked it least important');
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
