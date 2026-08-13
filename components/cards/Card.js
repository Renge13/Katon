// ============================================================
// Card A (free shareable) and Card B (paid artifact)
// ============================================================
// Built to the rulings, which are NOT re-opened here:
//   docs/content/sharecard-spec.md   "DECIDED 2026-08-01 — all four open questions"
//   docs/PROGRESS.md                 "DECIDED 2026-08-03 — card sizes LOCKED"
//
// ── GEOMETRY, LOCKED ───────────────────────────────────────
// Card A is a 63:88 card OBJECT floating on a 3:4 feed-safe canvas. A 3:4 canvas
// and a 63:88 card admit exactly ONE uniform margin: solve
// (1080-2m)/(1440-2m) = 63/88 and m = 86.4, card 907 x 1267. Any slimmer margin
// makes the top-bottom and left-right gaps unequal. The 1080x1350 (4:5) proposal
// is SUPERSEDED. Card B is 1080x1920 (9:16) — taller is the exclusivity signal.
// The arithmetic is asserted in tests/card.spec.mjs, not trusted to this comment.
//
// ── WHY THIS FILE IS .js AND NOT .jsx ──────────────────────
// `scripts/card-preview.mjs` renders these with `react-dom/server` under plain
// `node`, and Node cannot load JSX — it strips TypeScript types and nothing else.
// The repo has no esbuild, no @swc/core and no babel runtime to borrow. The
// alternatives were a build step for one preview file, or a second copy of the
// layout inside the script, and a second copy of a layout is two sources of truth
// for the thing the whole file exists to define. So: React.createElement, aliased
// to `E` below, and one component tree that Next and Node both load.
//
// ── INLINE STYLES ONLY ─────────────────────────────────────
// Same constraint as components/Sharecard.jsx: html-to-image walks computed
// styles and drops CSS classes, so anything in a stylesheet exports blank.
//
// ── WHAT IS STILL OPEN, and is therefore marked in the code ─
//   1. COLOUR TOKENS. Five of ten are unapproved (lib/card/tokens.js).
//   2. ~~CARD OBJECT vs CANVAS~~ CLOSED 2026-08-13. Reyner rejected the inset
//      hairline and the drop shadow. The canvas stays a FLAT field and the object
//      carries the GRADIENT, so they separate by surface rather than by a drawn
//      border, and no fourth colour token is needed.
//   3. tags_en. Not needed by anything here: Card A's head is `name_en` alone and
//      the Aspek and tags stay Indonesian on both cards, per the 08-03 ruling.
// ============================================================

import React from 'react';
import { tokenFor } from '../../lib/card/tokens.js';

const E = React.createElement;

// ── Canvas and object, in export pixels ────────────────────
// CARD_A's three numbers are all ruled: the canvas, the margin the 63:88 ratio
// forces, and the object that follows from them.
//
// CARD_B's CANVAS is ruled (1080x1920) and its OBJECT IS NOT. The 08-03 ruling
// sizes Card B and says nothing about a floating object, so the same uniform
// 86.4 margin is carried over for family resemblance and the resulting 907x1747
// is a CONSEQUENCE, not a second ratio ruling. It is deliberately not 63:88 —
// forcing that would either shrink the object or break the 9:16 canvas, and 9:16
// is the exclusivity signal.
export const CARD_A = { canvas: { w: 1080, h: 1440 }, margin: 86.4, card: { w: 907, h: 1267 } };
export const CARD_B = { canvas: { w: 1080, h: 1920 }, margin: 86.4, card: { w: 907, h: 1747 } };

// ── TYPE: ARCHIVO THROUGHOUT (ruled 2026-08-13) ────────────
// One family for the whole card, which is what the 08-03 mocks use. The app's
// Spectral/Hanken pair is the READING's type system and does not follow the card
// here — the card is a separate object with a separate job.
//
// DEPENDENCY, and it is silent if forgotten: nothing loads Archivo yet.
// `scripts/card-preview.mjs` links it from Google Fonts for the preview page, and
// `app/layout.js` does NOT — adding it there would ship a font download on every
// route for a card no route renders. THE COMMIT THAT WIRES A CARD MUST ADD
// ARCHIVO TO layout.js as `--font-archivo`, or the card silently renders in the
// system sans and nobody is told. Same shape as the gender input; recorded in the
// deferred register for the same reason.
const FONT = 'var(--font-archivo), Archivo, system-ui, -apple-system, sans-serif';

// ── TEXT ROLES ───────────────────────────────────────
// Every place text meets a surface, with the colour and the opacity it is drawn
// at. CONSUMED by roleStyle() below, which is the only source of text colour on
// either card, and MEASURED by lib/card/domContrast.js off the rendered markup
// rather than off this table. The table alone proved nothing: it was exported and
// used by nothing until 2026-08-13 while the card set one inherited colour on its
// root, so the audit was reading the intent beside the component.
//
// ── EVERY TEXT ROLE IS INK, AT FULL OPACITY. Measured 2026-08-13. ──
//
// The target is WCAG AA, 4.5:1. Auditing the previous map against it failed
// 51 of 150 pairs, and the failures had two causes with completely different
// fixes:
//
//   1. ACCENT CAN NEVER CARRY TEXT. It is BY DEFINITION the mid-lightness value
//      between field and ink, so its ceiling against the field runs 3.05 to 5.69
//      and SIX of ten tokens sit under 4.5 AT FULL OPACITY. No opacity, size or
//      weight change reaches AA, because opacity 1 is already the maximum. So
//      every text role moves to `ink`, and accent survives as a NON-TEXT colour:
//      the watermark, the element bars and the cell borders. The INTI DIRI pill
//      was on that list and came off it - it carries TEXT, and field-on-accent is
//      the same unreachable ratio. It is now field-on-ink; see `intiDiri` below.
//
//   2. DIMMING COMPOUNDS ON THE TOKENS WITH NO HEADROOM. Ink at full opacity
//      clears 4.5 on eight tokens, but Bambu sits at 4.93, so its lowest usable
//      opacity is 0.94 — measured, not guessed. Anything below that fails a
//      LOCKED token. **Opacity is no longer available as a hierarchy tool here.**
//      Size, weight and italic carry it instead, which is better typography than
//      fading text anyway.
//
// The map stays role-by-role even though every row is now identical, because the
// assertion is "every role x every token" and the day someone dims one of these
// back down, the audit has to catch it.
export const TEXT_ROLES = {
  headline:     { on: 'ink', over: 'field', opacity: 1 },
  aspek:        { on: 'ink', over: 'field', opacity: 1 },
  tagFixed:     { on: 'ink', over: 'field', opacity: 1 },
  tagDynamic:   { on: 'ink', over: 'field', opacity: 1 },
  hook:         { on: 'ink', over: 'field', opacity: 1 },
  badgeLabel:   { on: 'ink', over: 'field', opacity: 1 },
  badgeMeaning: { on: 'ink', over: 'field', opacity: 1 },
  footer:       { on: 'ink', over: 'field', opacity: 1 },
  nameId:       { on: 'ink', over: 'field', opacity: 1 },
  pillarLabel:  { on: 'ink', over: 'field',  opacity: 1 },
  pillarGanzhi: { on: 'ink', over: 'field',  opacity: 1 },
  pillarMeta:   { on: 'ink', over: 'field',  opacity: 1 },
  pillarAnimal: { on: 'ink', over: 'field',  opacity: 1 },
  barLabel:     { on: 'ink', over: 'field',  opacity: 1 },
  // The one INVERTED role: the INTI DIRI pill is field-coloured text on an ink
  // pill, which is the same pair as the body copy with the two swapped, so it
  // scores identically. `over` is a token key like `on`, not a surface name.
  intiDiri:     { on: 'field', over: 'ink', opacity: 1 },
};

/**
 * WCAG AA. Asserted over the RENDERED MARKUP in tests/card.spec.mjs.
 *
 * An earlier pass set this to 2.2 on the argument that Matahari's accent capped
 * at 2.22, so a higher floor would fail a colour Reyner ruled. That resolved the
 * tension by lowering the bar, and it was the wrong way round: the bar is a
 * legibility standard, and a ruled token that cannot meet it is a DECISION to put
 * in front of him rather than a reason to move the standard.
 *
 * That is exactly how it resolved. Matahari was the one LOCKED token under AA;
 * Reyner darkened its field to #CC3F0E on 2026-08-13 and it now measures 4.53.
 * `AA_EXEMPT` is down to Gunung, which is only PROPOSED.
 */
export const MIN_CONTRAST = 4.5;

/**
 * The colour and opacity a role is DRAWN with. Every text element in this file
 * spreads this; none sets `color` by hand.
 *
 * ── WHY THIS FUNCTION EXISTS (fixed 2026-08-13) ────────────
 * `TEXT_ROLES` was exported, audited, and CONSUMED BY NOTHING. The card set
 * `color: token.ink` once on its root and every element inherited it, so the
 * table described an intention and the audit measured that intention rather than
 * the card. The gap was not theoretical: the pillar branch was drawn at
 * `opacity: 0.85`, a real dimming that appeared in no role and that the audit
 * therefore could not see.
 *
 * An assertion that reads the intent it is checking is not an assertion. So the
 * roles are now the only source of text colour, the root sets none, and
 * `lib/card/domContrast.js` measures the RENDERED MARKUP instead of this table.
 */
export function roleStyle(role, token) {
  const r = TEXT_ROLES[role];
  if (!r) throw new Error(`No text role "${role}"`);
  return { color: token[r.on], opacity: r.opacity };
}

/**
 * Tokens that cannot reach AA at any opacity, with the ink they already have.
 * THIS LIST IS A REPORT, NOT A PERMISSION — the test pins it exactly, so it can
 * only shrink, and nothing new may join it without someone editing this line.
 *
 *   戊 Gunung    proposed  ink 4.21 on #8F7040. Not locked, so it moves with the
 *                            token ruling: #896B3D clears it at 4.53, a 4.5%
 *                            darkening that is barely visible.
 */
export const AA_EXEMPT = ['戊'];

/**
 * THE FLAT FIELD IS THE WORST SURFACE ON EITHER CARD, and that is enforced rather
 * than hoped for. Both cards carry the same gradient, and it steps AWAY from the
 * ink - darker under a light ink, lighter under a dark one - so every stop has
 * MORE contrast than the flat field it starts from. Measure the field and you
 * have covered every pixel of text on both cards.
 *
 * There used to be a second surface here: the appendix band had its own tinted
 * plate, and the FIRST version of that plate tinted TOWARD the ink and quietly
 * cost contrast on the tokens with none to spare. Reyner removed the plate
 * entirely on 2026-08-13 for a different reason - it read as a tray under the
 * card - which leaves exactly one ground and no BAND_TINT to get wrong.
 */

/** Card B's gradient depth. Three stops, from the 08-03 token proposal. */
export const GRADIENT_STOPS = [0, 0.08, 0.16];

/**
 * CARD B SHOWS AT MOST THREE BADGES. A CONTENT BUDGET, NOT A LAYOUT GUARD.
 *
 * The block varies about sevenfold: badge count runs 1 to 4 and each carries a
 * `label_meaning` of 109 to 186 characters (`npm run audit:card-budget`). A card
 * is a fixed rectangle, so the widest content has to fit or the design is only
 * true for the charts that happen to be short.
 *
 * Three, because Stage 3 already ranks the badges by importance, so the cut takes
 * the least important one, and the measured average is 2.5 — most charts are
 * unaffected. Card A is NOT capped: without meanings a badge is one short line.
 *
 * NOT auto-scaling type to fit. Cards must stay dimensionally identical across
 * the set, and type that shrinks to accommodate is a card that tells the reader
 * how much text it has.
 */
export const CARD_B_BADGE_LIMIT = 3;

/**
 * Longest `label_meaning` that fits at CARD_B_BADGE_LIMIT bullets, MEASURED.
 *
 * `npm run audit:card-budget -- --probe`, read in a browser 2026-08-13: with
 * three bullets the block gains a line somewhere between 200 and 210 characters,
 * so 200 is the last width that fits. Probed with REAL Indonesian sliced from the
 * longest existing entry, not lorem - synthetic "MaMaMa" filler is far wider and
 * put the break at 126, which would have been a false constraint on Reyner's copy.
 *
 * THE WHOLE GLOSSARY FITS: 8 of 8 bintang entries are 109 to 186 characters, so
 * the longest has 14 characters of headroom. No content has to be shortened.
 * The ceiling is a TRIPWIRE for the next entry someone writes, not a backlog.
 *
 * It is enforced as a TEST over glossary.json, never as a runtime truncation:
 * those strings are Reyner-ruled and cutting one mid-sentence at render time
 * would be the card editing his copy.
 */
export const MAX_LABEL_MEANING = 200;

/**
 * `hex` moved AWAY from the ink by `amount` (0..1): toward white when the ink is
 * dark, toward black when the ink is light.
 */
export function stepAway(hex, ink, amount) {
  const dark = inkIsDark({ ink });
  const ch = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(dark ? v + (255 - v) * amount : v * (1 - amount));
  });
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** rgba() from a #rrggbb and an alpha. Kept local — kit.jsx is a client module. */
function alpha(hex, a) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

/** Is this token's ink the dark end? Decides which way the hairline and shadow go. */
function inkIsDark(token) {
  return parseInt(token.ink.slice(1, 3), 16) < 128;
}

// ── TYPE SCALE, derived from the LIVE product's card ────────
// Rebalanced 2026-08-13. The first pass had a dominant headline over body text
// that was small relative to the card, and Card A ran roughly half its height as
// empty space.
//
// The reference is `components/Sharecard.jsx`, the card that actually ships:
// 360px wide on screen, exported at x3, so its sizes in export pixels are
//   name 138 | modifier 57 | eyebrow 30 | body 43.5 | feed names 42 | footer 30
// Card A's object is NARROWER than that card — 907 wide against 1080, so
// 763 of inner width against 936 — and type has to come down with the measure or
// the line length collapses. The factor is 763/936 = 0.815, and every size below
// is the live value times that factor, rounded.
//
// So the headline was already right (138 x 0.815 = 112) and everything under it
// was 20-35% too small. That is the whole finding: it was not the headline
// dominating, it was the body failing to answer it.
const SCALE = {
  headline: 112,   // 138 x 0.815
  nameId: 27,      // 33 x 0.815, Card B's Indonesian eyebrow
  aspek: 46,       // 57 x 0.815, was 36
  tag: 25,         // 30 x 0.815, was 23
  hook: 35,        // 43.5 x 0.815, was 27
  badgeLabel: 30,  // 42 x 0.815 = 34 on Card A; Card B trims to 30, see CARD_B_BADGE_LIMIT
  badgeMeaning: 25,
  footer: 24,      // 30 x 0.815, was 20
  pillarLabel: 20,
  pillarStem: 62,
  pillarBranch: 38,
  pillarMeta: 21,
  barLabel: 19,
};

/**
 * The Day Master stem, once, as a translucent watermark.
 *
 * RULED 2026-08-13: hanzi on the card is DECORATIVE ONLY, and this is the whole
 * of it. The pictogram glyph set the 08-03 mock carried is dropped — it repeated
 * what the headline already said, and a drawn mark is invention where the stem is
 * data the engine computed.
 *
 * This does NOT contradict sharecard-spec's "the eight characters are
 * deliberately NOT on Card A". Reyner's ruling reads that ban as being on the
 * GRID AS CONTENT — eight characters a reader is asked to decode — not on one
 * character as texture. Rule 23's own test says the same thing: hanzi you can
 * point at is fine, hanzi you must read is not. Nobody reads a watermark.
 *
 * TOP-RIGHT ON BOTH CARDS AND BOTH POLARITIES (ruled 2026-08-13). The live
 * product moves it to the lower left for yin, and that was carried over here and
 * is now reversed: the headline is top-left, so top-right is the one large empty
 * region on either card, and Card B's bottom third is the densest area on
 * anything in this system. A watermark behind the pillar cells and the element
 * bars is not texture, it is interference.
 *
 * Polarity still does real work, but through WEIGHT rather than position — yang
 * is drawn slightly stronger — so the two same-element archetypes keep a visible
 * difference without the watermark landing in the busy corner.
 */
const YANG = new Set(['甲', '丙', '戊', '庚', '壬']);

function Watermark({ stem, token, spec, px }) {
  if (!stem) return null;
  const isYang = YANG.has(stem);
  return E('div', {
    // DECORATIVE, and marked so rather than assumed so. It is a texture, not a
    // character anyone reads (see the note above), which is exactly WCAG's
    // decorative-element exemption — so it is the one thing on the card that does
    // not owe a 4.5 contrast ratio, and `lib/card/domContrast.js` skips
    // aria-hidden subtrees for that reason. Marking it in the markup keeps the
    // exemption a property of the card rather than a special case in the audit.
    'aria-hidden': 'true',
    style: {
      position: 'absolute', pointerEvents: 'none', userSelect: 'none',
      fontFamily: 'Georgia, "Times New Roman", serif',
      // 0.83 of the card's width, the same proportion the live card uses.
      fontSize: px(spec.card.w * 0.83), lineHeight: 0.8,
      color: alpha(token.accent, isYang ? 0.18 : 0.14),
      top: px(90), right: px(-70),
    },
  }, stem);
}

/**
 * The canvas, and the card object floating on it.
 *
 * ── THE EDGE IS THE GRADIENT. No outline, no shadow. (RULED 2026-08-13) ──
 * The canvas stays a FLAT field and the object carries the GRADIENT, so the two
 * separate by surface rather than by a drawn border. The previous inset hairline
 * plus drop shadow are REMOVED — Reyner rejected them, and this closes the open
 * question that has sat on the preview page since 08-03. It also needs no fourth
 * colour token per archetype, which was the whole reason the alternative (a
 * different surface value for the card) was unattractive.
 *
 * BOTH CARDS GET THE GRADIENT. It was Card B only until 2026-08-13, which left
 * Card A with nothing separating object from canvas once the outline came off.
 * Card B's exclusivity signal is its 9:16 silhouette, the Indonesian name and the
 * appendix — never the gradient, which is now structural on both.
 *
 * The gradient is DERIVED, never a second set of hexes: three stops stepping AWAY
 * from the ink by GRADIENT_STOPS. It is deliberately SHALLOW, and the reason is
 * `sharecard-tokens-proposal.html` section 5 — the original rule ran the field
 * down to near-black, which swept Matahari's gradient through Api Unggun's flat
 * field so that two different archetypes read as one colour. A gradient held in
 * the field's own upper band never crosses another archetype.
 *
 * Stepping away from the ink also means the deep end is the HIGH-contrast end, so
 * the flat field stays the worst surface and one audit covers everything.
 */
function Canvas({ spec, token, scale, stem, children }) {
  const { canvas, card } = spec;
  const px = (n) => n * scale;
  const ground = `linear-gradient(168deg, ${GRADIENT_STOPS.map((s, i) =>
    `${stepAway(token.field, token.ink, s)} ${[0, 55, 100][i]}%`).join(', ')})`;
  return E('div', {
    style: {
      // BORDER-BOX EXPLICITLY, on both boxes. The app sets `* { box-sizing:
      // border-box }` in globals.css, and relying on that made the card 1051x1411
      // instead of 907x1267 anywhere the reset was absent — the padding and border
      // were added OUTSIDE the ruled size, which silently cut the 86.4 margin to
      // 14.5. It shipped that way in the review preview.
      //
      // The card is exported through html-to-image and is meant to render in
      // isolation, so it may not depend on an ambient stylesheet for a dimension
      // that is a ruling. `tests/card.spec.mjs` asserts this in the rendered
      // markup, because a computed-style read reports the CONTENT box and
      // happily "confirms" 907 while 1051 is drawn.
      boxSizing: 'border-box',
      // FLAT field. The object's gradient is what makes it an object.
      width: px(canvas.w), height: px(canvas.h), background: token.field,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    },
  },
    E('div', {
      style: {
        boxSizing: 'border-box',
        width: px(card.w), height: px(card.h), background: ground,
        borderRadius: px(40), position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: px(72),
      },
    },
      // The watermark sits UNDER everything, clipped by the card's own overflow.
      E(Watermark, { key: 'wm', stem, token, spec, px }),
      children,
    ),
  );
}

/** Two-axis headline: the Day Master archetype, then the Aspek beneath it. */
function Headline({ data, token, px, showNameId }) {
  return E('div', { style: { position: 'relative' } },
    // Card A prints name_en ALONE — no Indonesian name, no ID eyebrow (08-03).
    // Card B may carry the Indonesian name; it is a document, not a share.
    showNameId && E('div', {
      key: 'id',
      style: { ...roleStyle('nameId', token), fontFamily: FONT, fontWeight: 600, fontSize: px(SCALE.nameId), letterSpacing: px(4), textTransform: 'uppercase', marginBottom: px(16) },
    }, data.nameId),
    E('div', {
      key: 'en',
      style: { ...roleStyle('headline', token), fontFamily: FONT, fontWeight: 800, fontSize: px(SCALE.headline), lineHeight: 0.94, letterSpacing: px(1), textTransform: 'uppercase' },
    }, String(data.nameEn || '').split(' ').map((w, i) => E('div', { key: i }, w))),
    // Axis two. Indonesian on BOTH cards.
    E('div', {
      key: 'aspek',
      // Italic and a lighter weight carry the step down from the headline. It was
      // the accent colour until 2026-08-13; accent cannot reach AA on six of ten
      // tokens, so the distinction is typographic now. See TEXT_ROLES.
      style: { ...roleStyle('aspek', token), fontFamily: FONT, fontStyle: 'italic', fontWeight: 480, fontSize: px(SCALE.aspek), marginTop: px(18) },
    }, data.aspek),
  );
}

/**
 * Tags. THREE FIXED TRAIT WORDS ALWAYS; the three dynamic Aspek only on Card B.
 *
 * RULED 2026-08-13: Card A drops them entirely. "Aspek Pengatur" is SYSTEM
 * VOCABULARY — it means nothing to someone meeting Katon in a feed, and Card A
 * has no comprehension budget to teach it. Card B is a document its owner has
 * paid for and read a reading alongside, so the vocabulary lands there.
 *
 * It also settles two things that were awkward for free. The row no longer mixes
 * one-word traits with two-word system labels in a single style, so the restyle
 * that would have needed is moot. And the Bintang-appearing-twice problem
 * (dimmed tag plus badge bullet) disappears from Card A outright — the dedupe in
 * `cardData.js#dynamicTags` still matters, but now only for Card B.
 */
function Tags({ data, token, px, showDynamic }) {
  const base = { fontFamily: FONT, fontWeight: 650, fontSize: px(SCALE.tag), letterSpacing: px(3.4), textTransform: 'uppercase' };
  return E('div', {
    style: { display: 'flex', flexWrap: 'wrap', gap: `${px(14)}px ${px(32)}px`, marginTop: px(34), ...base },
  },
    data.tags.fixed.map((t) => E('span', { key: `f-${t}`, style: roleStyle('tagFixed', token) }, t)),
    showDynamic ? data.tags.dynamic.map((t) => E('span', { key: `d-${t}`, style: roleStyle('tagDynamic', token) }, t)) : null,
  );
}

/**
 * The recognition line. It carries `flex: 1` so the slack in the card lands HERE,
 * between the hook and the badges, instead of pooling as one dead block above the
 * footer — which is what the live card does with its own body paragraph.
 */
function Hook({ data, token, px }) {
  if (!data.hook) return null;
  return E('p', {
    style: {
      ...roleStyle('hook', token),
      fontFamily: FONT, fontWeight: 440, fontSize: px(SCALE.hook), lineHeight: 1.45,
      marginTop: px(34), maxWidth: px(700), flex: 1,
    },
  }, data.hook);
}

/**
 * Badges. Indonesian name only, no English bracket, and NO PALACE.
 *
 * THE PALACE CAME OFF 2026-08-13. It read "◆ Penyendiri Pilar Akar" and it now
 * reads "◆ Penyendiri". The reading carries provenance; a card bullet does not
 * need it and the line space is scarce.
 *
 * That does NOT reverse the 08-01 Bintang Penolong rule — read it again and it is
 * about PROSE: *"Never 'bantuan akan datang'. Always 'bantuan datang lewat
 * pekerjaan'."* Those are sentences in a reading, where a bare "help arrives" is a
 * platitude. A bullet on a card is not making that claim, and the palace is one
 * line away in the reading it came from. Recorded in sharecard-spec.md so the
 * next reader does not have to re-derive it.
 *
 * `max` is the content budget, not a layout guard — see CARD_B_BADGE_LIMIT.
 */
function Badges({ data, token, px, withMeaning, max }) {
  const list = max ? data.badges.slice(0, max) : data.badges;
  if (!list.length) return null;
  return E('div', { style: { display: 'flex', flexDirection: 'column', gap: px(10) } },
    list.map((b) => E('div', { key: b.label },
      E('div', {
        style: { ...roleStyle('badgeLabel', token), fontFamily: FONT, fontWeight: 640, fontSize: px(SCALE.badgeLabel), letterSpacing: px(1.2) },
      }, `◆ ${b.label}`),
      withMeaning && b.meaning && E('div', {
        key: 'm',
        style: { ...roleStyle('badgeMeaning', token), fontFamily: FONT, fontWeight: 400, fontSize: px(SCALE.badgeMeaning), lineHeight: 1.4, marginTop: px(6) },
      }, b.meaning),
    )),
  );
}

/** gender + birthdate on the left, source on the right. Null gender: date + source. */
function Footer({ data, token, px }) {
  return E('div', {
    style: {
      ...roleStyle('footer', token),
      display: 'flex', justifyContent: 'space-between', marginTop: px(30),
      fontFamily: FONT, fontWeight: 520, fontSize: px(SCALE.footer), letterSpacing: px(2.6),
      textTransform: 'uppercase',
    },
  },
    E('span', { key: 'l' }, data.footer.left),
    E('span', { key: 'r' }, data.footer.right),
  );
}

/**
 * The four pillars, on Card B, in the LIVE product's treatment (ruled 2026-08-13).
 *
 * `components/kit.jsx#PillarCell` is the reference: separate rounded cells, the
 * stem set large over its branch, element and polarity beneath, and an INTI DIRI
 * pill marking the day pillar. The first pass drew a flat 4x2 grid, which read as
 * a table rather than as the chart.
 *
 * The branch's animal is kept on its own line under the meta. Rule 23 requires
 * every hanzi to be paired so it is readable rather than bare, and element +
 * polarity pairs the STEM; without the animal the branch is the one character
 * left undecodable.
 */
function PillarCells({ data, token, px }) {
  const dark = inkIsDark(token);
  return E('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: px(16) } },
    data.appendix.pillars.map((p) => E('div', {
      key: p.key,
      style: {
        position: 'relative', textAlign: 'center', borderRadius: px(22),
        padding: `${px(p.isDayMaster ? 30 : 24)}px ${px(8)}px ${px(22)}px`,
        background: p.isDayMaster ? alpha(token.accent, dark ? 0.20 : 0.26) : alpha(token.ink, 0.06),
        border: `${Math.max(1, px(2))}px solid ${p.isDayMaster ? token.accent : alpha(token.ink, 0.18)}`,
      },
    },
      p.isDayMaster && E('div', {
        key: 'dm',
        style: {
          position: 'absolute', top: px(-13), left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 650, fontSize: px(16),
          letterSpacing: px(1.6), textTransform: 'uppercase',
          // INK pill, FIELD text — an inversion of the card's own text pair, so
          // its ratio is identical to the body copy's and it passes wherever the
          // token passes. It was FIELD on ACCENT until 2026-08-13, which is the
          // accent-vs-field ratio that structurally cannot reach AA: the DOM
          // audit found it at 3.02 to 3.45 on six of ten tokens, and Matahari's
          // was 1.00 against the card ground because pill and field were the same
          // colour. The table-based audit could never have seen this — a pill is
          // not a role, and its ground is not the field.
          ...roleStyle('intiDiri', token),
          background: token.ink, borderRadius: px(999),
          padding: `${px(5)}px ${px(14)}px`,
        },
      }, 'Inti diri'),
      E('div', {
        key: 'label',
        style: { ...roleStyle('pillarLabel', token), fontFamily: FONT, fontWeight: 600, fontSize: px(SCALE.pillarLabel), letterSpacing: px(1.6), textTransform: 'uppercase' },
      }, p.palace),
      E('div', {
        key: 'stem',
        style: { ...roleStyle('pillarGanzhi', token), fontFamily: 'Georgia, "Times New Roman", serif', fontSize: px(SCALE.pillarStem), lineHeight: 1, marginTop: px(12) },
      }, p.stem),
      E('div', {
        key: 'branch',
        style: { ...roleStyle('pillarGanzhi', token), fontFamily: 'Georgia, "Times New Roman", serif', fontSize: px(SCALE.pillarBranch), lineHeight: 1, marginTop: px(6) },
      }, p.branch),
      E('div', {
        key: 'meta',
        style: { ...roleStyle('pillarMeta', token), fontFamily: FONT, fontWeight: 500, fontSize: px(SCALE.pillarMeta), marginTop: px(14) },
      }, `${p.element}${p.polarity ? ` ${p.polarity}` : ''}`),
      E('div', {
        key: 'animal',
        style: { ...roleStyle('pillarAnimal', token), fontFamily: FONT, fontWeight: 400, fontSize: px(SCALE.pillarMeta), marginTop: px(4) },
      }, p.animal),
    )),
  );
}

/**
 * CARD A — the free shareable. Optimised for travel.
 *
 * Deliberately NOT here, and each absence is a ruling: the strength verdict (rule
 * 21 needs the explanation in the same breath and a card has no room), numbers of
 * any kind, the eight characters, and prose beyond the one hook line.
 */
export function CardA({ data, scale = 1 }) {
  const token = tokenFor(data.stem);
  const px = (n) => n * scale;
  // No `marginTop: auto` on the badges any more. <Hook> carries flex:1, so the
  // slack lands inside the reading zone rather than as one dead block above the
  // footer — the fix for Card A running about half its height empty.
  return E(Canvas, { spec: CARD_A, token, scale, stem: data.stem },
    E(Headline, { key: 'h', data, token, px }),
    // Three fixed trait words only. No dynamic Aspek — see <Tags>.
    E(Tags, { key: 't', data, token, px, showDynamic: false }),
    E(Hook, { key: 'k', data, token, px }),
    // Badges are NOT capped here: without their meanings they are one short line
    // each, so four of them cost four lines. The budget problem is Card B's.
    E('div', { key: 'b', style: { marginTop: px(24) } }, E(Badges, { data, token, px })),
    E(Footer, { key: 'f', data, token, px }),
  );
}

/**
 * CARD B — the paid artifact. Optimised for keeping, and for being SEEN to be the
 * paid one: it is a badge of purchase, and a badge nobody can see is not a badge.
 *
 * THE THUMBNAIL-LEGIBLE DIFFERENCE is three things that survive being 100px tall,
 * none of them resolution: the 9:16 silhouette next to Card A's 3:4, the
 * Indonesian name above the English one, and the APPENDIX BAND — a visibly
 * separated lower third holding the chart. Print resolution is invisible on
 * Instagram, so it is not on this list.
 */
export function CardB({ data, scale = 1 }) {
  const token = tokenFor(data.stem);
  const px = (n) => n * scale;
  const bars = data.appendix.elements || {};
  const max = Math.max(1, ...Object.values(bars));

  return E(Canvas, { spec: CARD_B, token, scale, stem: data.stem, gradient: true },
    E(Headline, { key: 'h', data, token, px, showNameId: true }),
    // The Aspek tags live here and only here — Card B is a document its owner has
    // read a reading beside, so the system vocabulary has somewhere to land.
    E(Tags, { key: 't', data, token, px, showDynamic: true }),
    E(Hook, { key: 'k', data, token, px }),
    E('div', { key: 'bd', style: { marginTop: px(22) } },
      E(Badges, { data, token, px, withMeaning: true, max: CARD_B_BADGE_LIMIT })),

    // THE APPENDIX. Not a band any more (RULED 2026-08-13): it had its own tinted
    // plate and a full-bleed rule above it, and together those made the bottom
    // third read as a SEPARATE OBJECT sitting under the card — a tray, not a part.
    // Both are gone. It is part of the card, separated by nothing but space, and
    // the pillar cells already give the region its own visual structure.
    //
    // This also removes the last surface that was not the card's own gradient, so
    // every piece of text on either card now sits on one ground.
    E('div', {
      key: 'app',
      style: { marginTop: px(46) },
    },
      // THE FOUR PILLAR CHARACTERS, in the live product's cell treatment.
      E(PillarCells, { key: 'pillars', data, token, px }),

      // Element bars: visual, NO numbers. Numbers invite comparison of the wrong
      // thing, and these are a display distribution, never a strength score.
      E('div', { key: 'bars', style: { display: 'flex', gap: px(10), marginTop: px(30) } },
        Object.entries(bars).map(([name, v]) => E('div', { key: name, style: { flex: 1 } },
          E('div', { key: 'track', style: { height: px(9), background: alpha(token.ink, 0.16), borderRadius: px(5), overflow: 'hidden' } },
            E('div', { style: { width: `${(v / max) * 100}%`, height: '100%', background: token.accent } }),
          ),
          E('div', { key: 'l', style: { ...roleStyle('barLabel', token), fontFamily: FONT, fontWeight: 600, fontSize: px(SCALE.barLabel), letterSpacing: px(1.4), textTransform: 'uppercase', marginTop: px(9) } }, name),
        )),
      ),

      // 胎元 IS NOT RENDERED, ruled 2026-08-13. The engine still computes it and
      // the reading's own chart block still shows it; the card drops it. It is a
      // chart-sheet fact, and this object's job is to travel.

      E(Footer, { key: 'f', data, token, px }),
    ),
  );
}
