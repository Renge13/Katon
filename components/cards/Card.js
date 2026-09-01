// ============================================================
// Card A (free shareable) and Card B (paid artifact)
// ============================================================
// Built to the rulings, which are NOT re-opened here:
//   docs/content/sharecard-spec.md       "DECIDED 2026-08-01 — all four open questions"
//   docs/PROGRESS.md                     "DECIDED 2026-08-03 — card sizes LOCKED"
//   docs/content/card-polish-spec.md     1a and 1e, ruled 2026-08-14
//
// The last of those is the authority for everything in this file dated 08-14, and
// its own reference renders are `docs/content/card-1a-free.png`,
// `card-1e-paid.png` and `card-1e-ten-tokens.png`.
//
// ── WHAT 08-14 CHANGED ─────────────────────────────────────
// Before it, CardA and CardB were the same object at two densities: nothing
// separated them in a feed except an aspect ratio the feed crops away.
//
//   CARD A (1a)  A typographic pass. "The" drops to a kicker so the noun owns the
//                headline at 139 instead of 112, three hairlines divide the
//                content zones, the hook grows, the diamond comes off the badges,
//                and the stem crops the corner instead of blooming behind it.
//   CARD B (1e)  A FINISH: an SVG rim, a specular sheen, brass on four elements,
//                a foil seal, and a debossed watermark. Content and geometry are
//                unchanged — the boxed pillar cells, the bars and the type scale
//                all already matched the reference.
//
// ── GEOMETRY: THE TWO CARDS NO LONGER SHARE A FRAME (2026-08-31) ──
// CARD A IS THE EXPORT: 1080x1350 (4:5), full-bleed, opaque, SQUARE corners, no
// mat, no rim, no shadow.
// CARD B IS UNCHANGED: a 907x1747 object floating on its own 1080x1920 (9:16)
// canvas at a uniform 86.4 margin - taller is the exclusivity signal.
// Padding 72 and border-box on both. RADIUS 40 is CARD B ONLY now.
//
// Until prompt R commit 1 this described ONE shared frame: Card A was a 63:88
// object on a 3:4 canvas, and the margin was the single value satisfying both
// ratios ((1080-2m)/(1440-2m) = 63/88, m = 86.4). Card B inherited that margin.
// Card A's half of that is gone and the inheritance inverts (see CARD_B below).
//
// Asserted in tests/card.spec.mjs against the rendered markup; Card B's pixels
// are held against a committed baseline by scripts/gate-card-b-identity.mjs.
//
// THE GRADIENT SYSTEM IS ALSO UNCHANGED: flat canvas, gradient object, three
// stops stepping AWAY from the ink by GRADIENT_STOPS. The finish sits ON that,
// it does not replace it.
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
// ── INLINE STYLES ONLY, AND TWO THINGS THAT LOOK FINE AND ARE NOT ──
// html-to-image walks computed styles, so anything in a stylesheet exports blank.
// Two properties in the design reference ALSO fail, and both fail silently — the
// PNG simply comes out wrong (spec §4):
//   1. `mask-composite` / `-webkit-mask-composite`, the reference's rim. Drawn
//      here as an inline SVG stroke instead. See <Rim>.
//   2. `background-clip: text` gradient type, the reference's "JATI" and badge
//      labels. Drawn here in SOLID brass. At 28-29px the metallic sweep across a
//      short string is not perceptible; the gradient stays where it is large,
//      which is the seal and the rim.
// Both are guarded by a test, because "it looked right in the browser" is exactly
// how a silent export failure ships.
//
// ── WHAT IS STILL OPEN ─────────────────────────────────────
//   1. COLOUR TOKENS. Five of ten are unapproved (lib/card/tokens.js), and the
//      accent-on-field floor is a second question about three of them — see
//      `accentAudit` in lib/card/contrast.js, printed by audit:card-contrast.
//   2. BRASS TEXT ON FIVE TOKENS. Measured, failing, and falling back to ink.
//      See BRASS_TEXT_FALLBACK below; this is the §6.4 report.
//   3. tags_en. Not needed by anything here: Card A's head is `name_en` alone and
//      the Aspek and tags stay Indonesian on both cards, per the 08-03 ruling.
// ============================================================

import React from 'react';
import { tokenFor, brassFor, inkIsDark } from '../../lib/card/tokens.js';
import { contrast, composite } from '../../lib/card/contrast.js';
import { HAN_FAMILY, hanFontFaceCss } from '../../lib/card/hanFont.js';

const E = React.createElement;

// ── Canvas and object, in export pixels ────────────────────
// CARD_A HAS ONE NUMBER PAIR NOW and it is ruled: 1080x1350. It used to have
// three - a canvas, the margin the 63:88 ratio forced, and the object that
// followed - and all three went with the mat.
//
// CARD_B's CANVAS is ruled (1080x1920) and its OBJECT IS NOT. The 08-03 ruling
// sizes Card B and says nothing about a floating object, so a uniform 86.4 margin
// gives 907x1747 as a CONSEQUENCE, not as a second ratio ruling. That margin was
// borrowed from Card A; it is Card B's own literal from 2026-08-31.
// ── CARD A IS THE EXPORT, 1080x1350, RULED 2026-08-31 (prompt R commit 1) ──
// It has NO CANVAS AND NO MARGIN any more. The 63:88 object floating on a 3:4 mat
// is gone: full-bleed, fully opaque, square corners, no mat, no rim, no shadow.
// `docs/content/card-polish-spec.md` §10 is the authority and
// `docs/prompts/R-card-a-4x5.md` is the build.
//
// THE THREE NUMBERS THAT USED TO BE HERE WERE ALL RULED TOO, and this reverses
// the 2026-08-03 ruling rather than drifting from it. `tests/card.spec.mjs` used
// to carry `assert.notEqual(CARD_A.canvas.h, 1350)`, written so "a session that
// finds 4:5 in an older doc sees the reversal fail a test". That guard did its job
// for four weeks; it is now replaced by its mirror rather than deleted, so the
// same protection runs in the new direction.
//
// WHAT THE MEASURE GAINS, and it is the reason PAD was ruled at 0% added padding:
// `PADDING` stays 72, held absolute, so the inner measure goes 763 -> 936. The
// frame grows 19.1% and the text measure grows 22.7%.
export const CARD_A = { card: { w: 1080, h: 1350 } };

/**
 * THE SURFACE A CARD EXPORTS AS, for a spec that may or may not have a canvas.
 *
 * ── THIS EXISTS BECAUSE ITS ABSENCE SHIPPED A BROKEN PAGE ──
 * Prompt R commit 1 removed `CARD_A.canvas`, and R says to find every consumer
 * before editing the constant because "a grep is cheaper than a runtime surprise".
 * The prescribed grep - for `CARD_A.canvas` - CANNOT REACH THE CONSUMERS THAT
 * MATTER, because they take the spec as an argument and read `spec.canvas`:
 *
 *   components/cards/exportCards.js  captureSpec(kind, card)   caught by a test
 *   components/Funnel.jsx            <ScaledCard spec={CARD_A}> CAUGHT IN A BROWSER
 *
 * The second threw `TypeError: Cannot read properties of undefined (reading 'w')`
 * on the FREE READING PAGE while `npm test` reported 30/30, because no test can
 * render that component - it is JSX behind `'use client'`, and plain `node --test`
 * cannot parse it.
 *
 * So the fix is not another grep. Every consumer asks THIS function instead of
 * destructuring, `tests/card.spec.mjs` forbids the direct read, and a spec without
 * a canvas answers with its card rather than with `undefined`.
 */
export function exportSize(spec) {
  return spec.canvas ?? spec.card;
}
// `padY` — CARD B ONLY, and it is the largest single item in the 2026-08-26
// spacing reclaim. See RECLAIMED_B for the whole ledger and the measurement.
//
// ── 86.4 IS NOW CARD B'S OWN LITERAL, NOT A BORROWED ONE ──
// It was carried over from Card A for family resemblance, and §10 states the
// consequence plainly: "that inheritance direction now has to invert." Card A has
// no margin to inherit FROM. The value is unchanged to the digit - Card B is
// untouched by prompt R, and `scripts/gate-card-b-identity.mjs` proves it in
// pixels rather than in prose - but it is now sourced here, where it is used.
export const CARD_B = { canvas: { w: 1080, h: 1920 }, margin: 86.4, card: { w: 907, h: 1747 }, padY: 56 };

export const RADIUS = 40;
export const PADDING = 72;

/** Appended to a card's `id` to address the OBJECT rather than the canvas (§7). */
export const OBJECT_ID_SUFFIX = '-object';

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
// system sans and nobody is told. Verified still true 2026-08-14:
//   grep -rn "font-archivo" app/  ->  no matches
const FONT = 'var(--font-archivo), Archivo, system-ui, -apple-system, sans-serif';

/** The eight characters and the seal. Data you point at, never words you read. */
// THE HANZI FACE. Georgia has NO CJK GLYPHS, so until 2026-08-17 all four sites
// below - pillar stem, pillar branch, seal, watermark - were drawn by whatever
// the OS substituted, and the EXPORTED PNG differed between iPhone, Android and
// Windows. On the object whose whole job is to travel, that is a defect.
//
// Ruled 2026-08-17: Noto Serif TC, self-hosted, subsetted to the 65 glyphs the
// card can draw. TRADITIONAL, not Simplified - the set carries the traditional
// forms (Wound, Kill, Canopy, Noble, Wealth, Post-horse), and SC would render
// those with mainland shapes against a repo that writes traditional throughout.
// The Georgia stack stays BEHIND it as the fallback.
const HAN = `"${HAN_FAMILY}", Georgia, "Times New Roman", serif`;

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
 *
 * IT STAYS HERE, and it stays 4.5. The 08-14 ruling re-admitted dimmed ink, and
 * the thing it did NOT do was move this number — see DIM_EXEMPT.
 */
export const MIN_CONTRAST = 4.5;

// ── TEXT ROLES ───────────────────────────────────────
// Every place text meets a surface, with the colour and the opacity it is drawn
// at. CONSUMED by roleStyle() below, which is the only source of text colour on
// either card, and MEASURED by lib/card/domContrast.js off the rendered markup
// rather than off this table.
//
// ── THE 2026-08-13 MEASUREMENT, WHICH STILL STANDS ON THE ARITHMETIC ──
//
// Auditing an earlier map against AA failed 51 of 150 pairs, with two causes that
// have completely different fixes:
//
//   1. ACCENT CAN NEVER CARRY TEXT. It is BY DEFINITION the mid-lightness value
//      between field and ink, so its ceiling against the field runs 3.02 to 5.69
//      and SIX of ten tokens sit under 4.5 AT FULL OPACITY. No opacity, size or
//      weight change reaches AA, because opacity 1 is already the maximum. So
//      accent survives as a NON-TEXT colour: the watermark, the element bars and
//      the cell borders. This has NOT been reopened.
//
//   2. DIMMING COMPOUNDS ON THE TOKENS WITH NO HEADROOM. Ink at full opacity
//      clears 4.5 on nine tokens, but Bambu sits at 4.93, so its lowest usable
//      opacity is 0.94 — measured, not guessed. Anything below that fails a
//      LOCKED token.
//
// From 2 the file then concluded "opacity is no longer available as a hierarchy
// tool here", and every role was set to 1.
//
// ── WHAT 2026-08-14 CHANGED, AND WHAT IT DID NOT ───────────
// Reyner ruled that the reference's SIX ink levels ship. That ruling is on the
// DESIGN QUESTION. It does not touch the arithmetic above, which is still exactly
// true: a role at 0.51 on Bambu does not reach 4.5 and never will.
//
// So the dimmed rows are an EXEMPTION with a pinned list — the same mechanism the
// repo already uses for AA_EXEMPT — rather than a lowered floor. MIN_CONTRAST is
// unchanged at 4.5, every role outside DIM_EXEMPT still has to clear it, and
// domContrast keeps REPORTING the exempt roles' real ratios instead of skipping
// them, so the number stays visible.
export const TEXT_ROLES = {
  // ── Card A and Card B ──
  kicker:       { on: 'ink', over: 'field', opacity: 0.48 },
  headline:     { on: 'ink', over: 'field', opacity: 1 },
  aspek:        { on: 'ink', over: 'field', opacity: 0.75 },
  tagFixed:     { on: 'ink', over: 'field', opacity: 0.51 },
  tagDynamic:   { on: 'ink', over: 'field', opacity: 0.51 },
  hook:         { on: 'ink', over: 'field', opacity: 1 },
  badgeMeaning: { on: 'ink', over: 'field', opacity: 0.72 },
  footer:       { on: 'ink', over: 'field', opacity: 0.53 },
  // Card A's badge label. Card B's is brass — see badgeLabelFoil.
  badgeLabel:   { on: 'ink', over: 'field', opacity: 0.82 },

  // ── Card B only ──
  pillarLabel:  { on: 'ink', over: 'field', opacity: 0.51 },
  pillarStem:   { on: 'ink', over: 'field', opacity: 1 },
  pillarBranch: { on: 'ink', over: 'field', opacity: 0.80 },
  pillarMeta:   { on: 'ink', over: 'field', opacity: 0.74 },
  pillarAnimal: { on: 'ink', over: 'field', opacity: 0.51 },
  barLabel:     { on: 'ink', over: 'field', opacity: 0.58 },

  // THE DAY-PILLAR CELL LIFTS EVERY ONE OF ITS OWN ROWS, which is how it reads
  // as the emphasised one without a second border weight. Its stem is `pillarStem`
  // like the others; the rest are these.
  pillarBranchDay: { on: 'ink', over: 'field', opacity: 0.88 },
  pillarMetaDay:   { on: 'ink', over: 'field', opacity: 0.90 },
  pillarAnimalDay: { on: 'ink', over: 'field', opacity: 0.64 },

  // ── THE BRASS ROLES ──
  // `brassText` resolves per token and may be brass or ink — see brassTextFor.
  // They are declared as roles, and NOT special-cased in the audit, because
  // "expected to clear 4.5 comfortably" is a prediction and the audit is what
  // turns it into a number. It did: five of ten tokens fail. See the fallback.
  nameId:          { on: 'brassText', over: 'field', opacity: 1 },
  badgeLabelFoil:  { on: 'brassText', over: 'field', opacity: 1 },
  pillarLabelDay:  { on: 'brassText', over: 'field', opacity: 0.82 },
  // The one INVERTED role: the INTI DIRI pill is brass INK on a brass ground, so
  // its ratio does not depend on the token at all. `over` is a palette key.
  intiDiri:        { on: 'brassInk', over: 'brass', opacity: 1 },
};

/**
 * The roles the 2026-08-14 ruling exempts from MIN_CONTRAST.
 *
 * A REPORT, NOT A PERMISSION — the same standing as AA_EXEMPT. The test pins it
 * to exactly the set of roles drawn under opacity 1, so a role can never be
 * dimmed without appearing here, and nothing joins it without someone editing
 * this line. It can only shrink.
 *
 * ── KNOW WHAT IS IN IT, because it is not all articles ─────
 * `tagFixed` and `tagDynamic` at 0.51 are CONTENT WORDS — Teguh, Menaungi,
 * Konsisten. If a legibility complaint ever arrives, those are the rows to raise
 * first, and the cheap fix is to return the tag rows to full ink while leaving
 * the kicker and the footer dimmed: that keeps most of the hierarchy and costs
 * one value.
 */
export const DIM_EXEMPT = [
  'kicker', 'aspek', 'tagFixed', 'tagDynamic', 'badgeMeaning', 'footer', 'badgeLabel',
  'pillarLabel', 'pillarBranch', 'pillarMeta', 'pillarAnimal', 'barLabel',
  'pillarBranchDay', 'pillarMetaDay', 'pillarAnimalDay', 'pillarLabelDay',
];

/**
 * Tokens whose INK cannot reach AA at any opacity.
 * THIS LIST IS A REPORT, NOT A PERMISSION — the test pins it exactly, so it can
 * only shrink, and nothing new may join it without someone editing this line.
 *
 * ── IT IS EMPTY, AS OF 2026-08-15, AND IT STAYS ────────────
 * The list had one entry for its whole life: 戊 Gunung, ink 4.21 on #8F7040.
 * Reyner took that field down to #4A3A1E on 2026-08-15 and it now measures 10.02,
 * so every token in the set clears AA on its own field with no exemption at all.
 *
 * THE MECHANISM IS NOT DELETED WITH THE ENTRY, and that is deliberate. An empty
 * exemption list is the OUTCOME this list existed for, not a sign it was never
 * needed: it is what let a failing token stay visible and named for two weeks
 * instead of being hidden by a lowered floor, and it is what the next
 * under-AA token gets measured against. Deleting it would mean the next one has
 * nowhere to be recorded except a lowered MIN_CONTRAST.
 */
export const AA_EXEMPT = [];

/**
 * Tokens excused from the SHEEN gate — Card B's finish putting full-opacity text
 * under AA in the lit band.
 *
 * ── IT WAS EMPTY, AND THAT IS WHY THE AUDIT EXITED 1 ───────
 * Added 2026-08-17 with nothing in it, deliberately. The audit had been PRINTING
 * "UNDER AA IN THE CORNER" since the finish shipped and never letting that reach
 * `unexpected`, so the per-token line said PASS, the process exited 0, and the
 * failure sat twenty lines further down the same output. An instrument that
 * reports the broken state as passing is worse than no instrument, because it is
 * evidence.
 *
 * SAME STANDING AS ITS THREE SIBLINGS — `AA_EXEMPT`, `DIM_EXEMPT`,
 * `ACCENT_EXEMPT`: **a report, not a permission. It can only shrink, and nothing
 * joins it without someone editing this line.** Putting a stem here is a ruling
 * that the finish is worth the ratio on that token, and it is Reyner's to make.
 * It is NOT the way to make the audit green.
 *
 * ── 乙 AND 丙. RULED BY REYNER 2026-08-19, WITH ALL THREE OPTIONS PRICED ──
 * Their ratios stay PRINTED by `npm run audit:card-contrast`, on their own rows,
 * every run. This is what an excused defect looks like when it is still known.
 *
 * WHAT FAILS: the sheen is white-alpha over the whole object, so on a LIGHT-INK
 * token it moves the surface TOWARD the ink. 乙 Bambu 3.68 and 丙 Matahari 3.61
 * against 4.5. On these two it is EVERY full-opacity role rather than one label,
 * because their brass had already fallen back and so all of it is drawn in ink.
 *
 * THE THREE CHEAPER FIXES WERE TRIED AND ARE GONE, not skipped:
 *   - PLACEMENT IS REFUTED. All 72 angles swept (`npm run probe:sheen`); the best
 *     any angle reaches is 3.90, still under. The highlight is a BAND across the
 *     top, not a corner, so there is no rotation that puts it where the text is
 *     not.
 *   - THE BRASS FALLBACK CANNOT REACH THEM. It is the mechanism that closed 甲 丁
 *     戊 壬 under A2, and it closes nothing here: 乙 and 丙 fell back to ink on the
 *     FLAT card, so there is no brass left to retreat from.
 *   - MASKING IS NOT A FOURTH OPTION. Since it is all the text and not one run, a
 *     mask that spares the text is the sheen removed.
 *
 * WHAT REYNER REJECTED, AND WHAT IT WOULD HAVE COST:
 *   - CAPPING SHEEN ALPHA at 0.048, or at 0.007 to clear both. 0.007 is an ABSENT
 *     finish on Matahari, not a subtler one.
 *   - DARKENING THE FIELDS. That would darken Matahari TWICE IN FIVE DAYS, after
 *     #FF4F12 -> #CC3F0E on 08-13, on the token whose whole job is to be the
 *     bright half of Fire.
 *
 * AND THE STANDING ARGUMENT, which is why this is a ruling and not a lowered
 * floor: 4.5 is a WEB accessibility floor for navigable interfaces, and Card B is
 * a downloaded PNG. It inherited the bar by analogy, never by scope. Reyner
 * accepts the legibility cost on two of ten paid cards KNOWINGLY.
 *
 * SHEEN, SHEEN_ANGLE and lib/card/tokens.js are untouched by this ruling.
 */
export const SHEEN_EXEMPT = ['乙', '丙'];

/**
 * ── §6.4, MEASURED: BRASS TEXT FAILS ON EIGHT OF TEN TOKENS ──
 *
 * RULED AS BUILT, 2026-08-15. Reyner read the cards and found every one legible,
 * which is the fallback doing its job. It is not provisional and there is to be
 * no second, darker BRASS_TEXT: brass stays TWO global values selected by
 * `inkIsDark()`, per spec §6.3.
 *
 * The spec predicted that `BRASS_TEXT` would "clear 4.5 comfortably" on dark
 * fields and flagged Taman as the one risk. Measured over all ten tokens with
 * `contrast()`, brass text against the field, at the opacity it is drawn — and
 * RE-MEASURED after Gunung's field moved on 2026-08-15:
 *
 *     甲 Jati        5.53  ok        己 Taman      3.58  FAILS
 *     乙 Bambu       2.93  FAILS     庚 Besi Tempa 8.06  ok
 *     丙 Matahari    2.68  FAILS     辛 Permata    5.78  ok
 *     丁 Api Unggun  5.54  ok        壬 Samudra    6.46  ok
 *     戊 Gunung      6.00  ok        癸 Embun      4.19  FAILS
 *
 * FOUR failures ON THE FLAT FIELD (read A2 below before quoting this as the set),
 * down from five: 戊 Gunung left the list when its field went to
 * #4A3A1E, from 2.52 to 6.00, on the same edit that emptied AA_EXEMPT. The two
 * remaining dark-field failures are the point the spec did not expect — pale
 * brass is a LIGHT metallic, so Bambu's green and Matahari's orange are not dark
 * enough to carry it. Taman failed as predicted; Embun is the fourth.
 *
 * THE FALLBACK IS APPLIED PER TOKEN, not per role: where brass text fails, that
 * token's brass text retreats to `ink` and brass stays on everything non-text —
 * rim, seal, cell border, pill background (the day cell's brass FILL is gone as
 * of 2026-08-19 — see A1 in `PillarCells`). 1e still reads as the paid
 * card on all ten, because the seal and the rim are what carry it at thumbnail
 * size.
 *
 * Per TOKEN rather than per ROLE because the failure is a property of the field:
 * dropping brass text from all ten because Bambu cannot hold it would spend the
 * six tokens that can. Nothing is substituted silently — this comment, the
 * `brassText` role rows and `npm run audit:card-contrast` all name it.
 *
 * ── A2, APPLIED 2026-08-19: THE TEST IS THE FIELD **AND THE SHEEN** ──
 * The four rows above marked `ok` were measured on the FLAT FIELD, and on Card B
 * brass text is not drawn on the flat field. The sheen's peak white stop sits
 * over the region "Bintang Penolong" occupies, and it lifts the ground toward
 * the pale brass rather than away from it, so a token that clears 4.5 flat can be
 * under it lit. Measured on `min(field, every sheenGrounds() stop)`:
 *
 *     甲 Jati       5.57 -> 3.63   丁 Api Unggun 5.54 -> 3.83
 *     戊 Gunung     6.00 -> 3.80   壬 Samudra    6.46 -> 4.12
 *     庚 Besi Tempa 8.06 -> 4.99 ok   辛 Permata  5.78 -> 4.97 ok
 *
 * So the fallback set goes from FOUR to EIGHT, and the four that join it are
 * carried by ink instead: 甲 5.96, 丁 6.20, 戊 6.34, 壬 6.71 on the same lit
 * ground. That is the whole of A2 — four `sheen` findings closed by the
 * mechanism that was already here, measuring the surface it was already missing.
 *
 * ── THE DECISION IS PER CARD, NOT PER TOKEN (Reyner, 2026-08-19) ──
 * A2 first shipped as one pooled answer per token. The ruling to split it is
 * right, but **the reason given for it was factually wrong and the correction
 * belongs here rather than only in a chat log.**
 *
 * THE CLAIM WAS: pooling made Card A pay for Card B's finish, because 甲 丁 戊 壬
 * fail only under the sheen and lost brass on the free card anyway.
 *
 * THE FACT IS: **CARD A DRAWS NO BRASS TEXT AT ALL.** All three roles that read
 * `brassText` — `nameId`, `badgeLabelFoil`, `pillarLabelDay` — are Card B only.
 * Card A calls `<Headline>` without `showNameId`, passes `role: 'badgeLabel'` to
 * `<Badges>`, and has no `<PillarCells>`. That follows from the 2026-08-14 ruling
 * that Card A carries NO FINISH. So pooling degraded nothing on Card A, and this
 * split **changes not one pixel of either card today.** Verified: `grep -n
 * "roleStyle('nameId'\|badgeLabelFoil\|pillarLabelDay" components/cards/Card.js`
 * returns three sites, all inside Card B's subtree (2026-08-19).
 *
 * ── SO WHY KEEP IT ─────────────────────────────────────────
 * Because the pooled version was right by ACCIDENT and this one is right by
 * CONSTRUCTION. It is one archetype on two surfaces with different physics: Card B
 * carries a translucent white wash and Card A does not, so the same ink on the same
 * field is a different measurement there. Every other value already varies by card
 * (the rim and the drop shadow are Card B only). And it is a GUARD: the moment
 * anyone gives Card A a `brassText` role, that card starts answering on its own
 * physics instead of inheriting a sheen it does not have. The test pins the
 * currently-unobservable half deliberately, so the guard cannot rot unnoticed.
 *
 *     CARD A decides on the FLAT FIELD          -> 乙 丙 己 癸 fall back (4)
 *     CARD B decides on min(field, sheen stops) -> 甲 乙 丙 丁 戊 己 壬 癸 (8)
 *
 * No token moves under AA by this, on either card: A's four fallbacks were already
 * failing on the flat field, and ink clears AA on all ten fields.
 *
 * `card` IS REQUIRED AND UNVALIDATED VALUES THROW. A default would let a caller
 * silently take one card's answer for the other, which is the failure this split
 * exists to prevent, and it is the same reason `roleStyle` throws on an unknown
 * role rather than falling back to something plausible.
 *
 * WHAT NONE OF THIS CLOSES: 乙 Bambu and 丙 Matahari. Their brass had already
 * retreated to ink on the flat card, so there is nothing left to retreat from,
 * and their INK is what is under AA in the lit band — 3.68 and 3.61. That is
 * SHEEN_EXEMPT's problem and Reyner ruled it on 2026-08-19; see the list.
 */
export const CARD_SURFACES = ['A', 'B'];

function assertSurface(card) {
  if (!CARD_SURFACES.includes(card)) {
    throw new Error(
      `brass text needs a card surface, one of ${CARD_SURFACES.join(' / ')}, got ${JSON.stringify(card)}`
      + ' — Card A decides on the flat field, Card B on the sheen ground, and they differ on four tokens',
    );
  }
}

export function brassTextFor(token, card) {
  return brassTextWorst(token, card) >= MIN_CONTRAST ? brassFor(token).text : token.ink;
}

/**
 * The worst ground this token's brass text has to hold ON THIS CARD.
 *
 * Card B takes the minimum across ALL sheen stops rather than the largest alpha —
 * the same rule `sheenGrounds()` states for its own callers, and for the same
 * reason: white hurts on a dark field and the 7% black hurts on a light one, so
 * "peak alpha" gets one branch right by luck. Card A has no overlay at all, so its
 * worst ground is its only ground.
 */
export function brassTextWorst(token, card) {
  assertSurface(card);
  const brass = brassFor(token);
  const grounds = card === 'B'
    ? [token.field, ...sheenGrounds(token).map((g) => g.ground)]
    : [token.field];
  return grounds.reduce((worst, ground) => Math.min(worst, contrast(brass.text, ground)), Infinity);
}

/** Tokens where brass text does not reach AA on this card and has retreated to ink. */
export function brassTextFallbacks(tokens, card) {
  return Object.entries(tokens)
    .map(([stem, t]) => ({ stem, ratio: brassTextWorst(t, card) }))
    .filter((r) => r.ratio < MIN_CONTRAST);
}

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
export function roleStyle(role, palette) {
  const r = TEXT_ROLES[role];
  if (!r) throw new Error(`No text role "${role}"`);
  const color = palette[r.on];
  if (!color) throw new Error(`Role "${role}" wants "${r.on}", which this palette has no value for`);
  return { color, opacity: r.opacity };
}

/**
 * The token's three hexes, plus the two values the brass finish adds.
 *
 * `card` is REQUIRED because `brassText` differs between the two surfaces — see
 * `brassTextFor`. It is not defaulted: a palette that quietly answered for Card A
 * while rendering Card B is precisely the silent adoption the split forbids.
 */
export function paletteFor(token, card) {
  const brass = brassFor(token);
  return {
    ...token,
    brassText: brassTextFor(token, card),
    brassInk: brass.ink,
    // The pill's ground, declared solid so domContrast can resolve it — see <Pill>.
    brass: brass.solid,
  };
}

/** Card A's gradient depth. Three stops, from the 08-03 token proposal. */
export const GRADIENT_STOPS = [0, 0.08, 0.16];

/**
 * CARD B SHOWS AT MOST TWO BADGES. A CONTENT BUDGET, NOT A LAYOUT GUARD.
 *
 * ── IT WAS THREE, AND THE 08-14 RE-PROBE IS WHY IT IS NOT ──
 * Spec §6.5 asked for the budget to be re-measured against 1e's footer, because
 * the 200-character ceiling had been probed against a ONE-LINE footer and 1e's is
 * two stacked lines beside a 111px seal. Measured, and it is worse than the spec
 * expected — the ceiling did not just fall, THREE BADGES STOPPED FITTING AT ALL:
 *
 *   丁 Api Unggun, three badges of 134 + 114 + 175 = 423 characters, all three
 *   inside the old 200 ceiling and all three real glossary copy, overflowed the
 *   object by 63 export pixels. Clipped by `overflow: hidden`, silently.
 *
 * Card B's spacing was tightened first (see <CardB>), which recovered 79px and
 * left 丁 still 59px over. Nothing else was available without moving a ruled
 * number: the seal is ruled at 111, the type sizes are ruled, and auto-scaling
 * type to fit is the thing this budget exists to avoid.
 *
 * So the cut is the badge count, which is the lever the budget is FOR. Stage 3
 * ranks badges by importance, so dropping to two takes the least important one on
 * the charts that have three; the measured average is 2.5, so most are unaffected.
 * Card A is NOT capped — without meanings a badge is one short line.
 *
 * ── RULED 2026-08-15. TWO IS THE NUMBER. ──────────────────
 * Reyner confirmed it against what actually overflowed, which is the
 * `label_meaning` SENTENCES rather than the labels — a third badge costs three
 * lines of prose, not one line of name. This is not provisional and it is not a
 * placeholder for a later decision.
 *
 * What a reversal would cost, kept on record because the measurement is the
 * expensive part and not because three is expected back: recovering the 59px
 * needs the seal down from 111 to about 90 AND `badgeMeaning` from 25 to 23.
 * Neither alone reaches it. The seal is a ruled dimension, so that half is a
 * decision rather than a tweak.
 */
export const CARD_B_BADGE_LIMIT = 2;

/**
 * Longest `label_meaning` that fits at CARD_B_BADGE_LIMIT bullets, MEASURED.
 *
 * RE-PROBED 2026-08-14 (spec §6.5), two ways, both after layout in a browser:
 *
 *   `npm run audit:card-budget -- --probe` renders Card B at a sweep of synthetic
 *   lengths, cut from the longest REAL `label_meaning` rather than from lorem —
 *   synthetic filler is wider and once put the break at 126, which would have been
 *   a false constraint on Reyner's copy. Measured headroom at the cap:
 *       200 chars x 2  ->  +38 export px
 *       201 chars x 2  ->  +38
 *       202 chars x 2  ->  -31   the block gains a line here
 *   So 200 is the last width that fits, with one character of slack.
 *
 *   `npm run preview:cards` then measures every archetype's REAL content the same
 *   way and prints it per card. Worst is +105 export px.
 *
 * 200 HOLDS, but only because CARD_B_BADGE_LIMIT came down to two — at three it
 * was not close, and the binding archetype overflowed on real copy well inside
 * the ceiling. Read that constant's note before raising either number: the real
 * constraint is the TOTAL height of the badge block, and a per-entry ceiling only
 * describes it while the count is fixed.
 *
 * THE WHOLE GLOSSARY FITS: 8 of 8 bintang entries are 109 to 186 characters. The
 * ceiling is a TRIPWIRE for the next entry someone writes, not a backlog.
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

/** `hex` moved `amount` of the way to black. */
function darken(hex, amount) {
  const ch = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount)));
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// ── TYPE SCALE, in export pixels ───────────────────────────
// The design reference renders at 0.36, so every number here is its design pixel
// divided by 0.36. Sizes shared by both cards live in SCALE; the three that
// differ are in the two override objects.
//
// SCALE.headline IS 139, NOT 112, and that walks back a derivation on purpose.
// The old 0.815 factor (763/936, off the live product's card) exists because type
// has to come down with the LINE MEASURE. A one-word headline is not
// measure-constrained: "TEAK" at 139 occupies about 63% of the 763px inner width,
// so it cannot wrap. A MULTI-word headline is a different case and is handled in
// <Headline>, not here.
const SCALE = {
  kicker: 30,        // the live card's eyebrow size
  headline: 139,
  nameId: 28,
  aspek: 46,
  tag: 25,
  hook: 39,
  badgeMeaning: 25,
  footer: 24,
  pillarLabel: 20,
  pillarStem: 62,
  pillarBranch: 38,
  pillarMeta: 21,
  intiDiri: 16,
  barLabel: 19,
  seal: 111,
  sealInner: 92,
  sealGlyph: 47,
};
const SCALE_A = { ...SCALE, badgeLabel: 30 };
const SCALE_B = { ...SCALE, badgeLabel: 29 };

/**
 * ── THE HEADLINE'S THREE TYPE FACTS, EXPORTED SO THEY HAVE ONE SOURCE ──
 *
 * `scripts/measure-head-fit.mjs` renders these words in a real browser with real
 * Archivo to decide whether any head overflows the measure. It has to declare the
 * SAME size, weight and tracking that <Headline> declares, or it measures
 * something the card does not draw - which is the characteristic failure of a
 * measurement harness: being precisely wrong.
 *
 * So they are named here and read by both. A drift between the card and its own
 * ruler is now impossible rather than merely unlikely.
 */
export const HEADLINE_SIZE = SCALE.headline;
export const HEADLINE_WEIGHT = 800;
export const HEADLINE_TRACKING = -0.7;

/**
 * Heads that genuinely overflow the measure at full size. MEASURED, NOT GUESSED.
 *
 * ── EMPTY, AND THAT IS THE 2026-08-31 RULING ──
 * Reyner, prompt R section 0a: "Embun remains at 139 on the new 936px measure
 * unless the rendered text actually fails to fit." Measured over all ten with
 * `npm run measure:head-fit`: the widest head word is MOUNTAIN and it uses well
 * under the measure, so nothing reduces. The numbers and their date live in
 * `docs/qa/2026-08-31-head-fit.md`; they are not repeated here, because a
 * measurement in a source file is rule 8's mistake one layer down.
 *
 * ── THE BRANCH STAYS. THAT IS ALSO THE RULING ──
 * It is not scaffolding to delete now that the set is empty; it is the gate for
 * the eleventh archetype name, or for a rename. What CHANGED is what fires it: a
 * measured overflow instead of a word count.
 *
 * ── WHY A PINNED SET AND NOT A METRICS CALL AT RENDER TIME ──
 * §0a: "Implement it as a measured fit, resolved once over all ten, and pinned -
 * in `npm run preview:cards` or the card-budget harness, not as a metrics call
 * during render." Card.js renders to markup that is captured later; there is no
 * measurement pass at render time, and inventing one to answer a question about
 * ten fixed strings is the expensive way round. Rule 24 fixes the set at ten.
 */
export const HEADS_THAT_OVERFLOW = Object.freeze(new Set([]));

/** How much a head that overflows comes down by. Unchanged; only its trigger moved. */
export const HEADLINE_OVERFLOW_FACTOR = 0.80;

/**
 * ── CARD B'S VERTICAL RECLAIM, 2026-08-26. RULED BY REYNER ──
 *
 * WHAT WENT WRONG. Card B's object is a fixed-height column flex with
 * `overflow: hidden`, so content past the bottom is clipped SILENTLY - there is
 * no scrollbar, no warning, and nothing on screen shows it, because the node the
 * card is captured from is off-screen in a 1px box. It is visible only in the
 * exported file, which is where it shipped.
 *
 * Once `cae2cbb` let the prose wrap again, **9 of the 13 fixture charts
 * overflowed**, by up to 121 export pixels. Three things vary per chart and the
 * card's height is the sum of all three:
 *
 *     hook            91 to 118 chars   GLOSSARY.salah_dikira, per stem
 *     badge meaning   114 to 344 chars  up to CARD_B_BADGE_LIMIT of them
 *     tag rows        4 or 6 tags       3 fixed + up to 3 dynamic, deduped
 *
 * THE CHART THAT SURFACED IT RANKED SEVENTH OF THIRTEEN by total prose, so the
 * 85px it showed was never the number to design against. `npm run
 * audit:card-budget -- --overflow` measures all thirteen and is the instrument
 * this table was fitted on.
 *
 * REYNER'S RULING, and the two things it forbids are as load-bearing as the one
 * it requires: **tighten vertical spacing. Do not trim prose - it is what the
 * customer paid for. Do not change the outer dimensions - 907x1747 is a ruled
 * export ratio.** So every number below is a margin, a padding or a gap. No type
 * size moved, no line-height moved, and no string was shortened.
 *
 * ── WHY A TABLE RATHER THAN EDITED LITERALS ────────────────
 * Because the next person needs to see what was spent. Each line is a WITHDRAWAL
 * from the card's air, and air is a design decision that was made once at these
 * values. Scattered as literals it reads as a redesign; gathered here it reads as
 * a debt, with the old value beside the new one so it can be paid back if the
 * layout ever absorbs length properly.
 *
 * ── IT LEAVES 7px, AND SEVEN SURFACES CAN SPEND IT ─────────
 * The tightest of 23 measured cases is 癸 at maximum prose, clearing the card by
 * 7 export pixels - a fifth of a line. `tests/card-budget.spec.mjs` freezes every
 * glossary surface that reaches Card B so the build fails when one grows; the
 * full table and the reasoning are in `docs/qa/2026-08-26-card-b-overflow.md`.
 *
 * THE THREE OBVIOUS ONES ARE NOT THE DANGEROUS ONES. `lib/card/cardData.js` names
 * `bintang`, `tag_arketipe` and `salah_dikira`. Three more arrive indirectly:
 * `aspek.name_id` is both the Aspek line and - through a convergence fact's label
 * - the dynamic tag row, though nothing here mentions `GLOSSARY.aspek`;
 * `arketipe.name_en` sets the HEADLINE and spends by WORD COUNT rather than
 * length, which is how 癸 became the tightest case; `arketipe.name_id` is the
 * kicker. A rename from "The Sun" to "The Rising Sun" costs a headline line,
 * about 100px against 7, and no length ceiling would see it coming.
 *
 * ── EVERY VALUE HERE IS CARD B'S ALONE ─────────────────────
 * Card A is untouched, and that is asserted rather than asserted-to: the shared
 * components take these as PROPS whose defaults are Card A's current values, so
 * Card A's rendered markup is byte-identical across this change.
 * `tests/card.spec.mjs` pins that.
 */
const RECLAIMED_B = {
  // was 18 - the Indonesian name over the brass hairline
  headNameGap: 12,
  // was 14 - under the THE kicker
  headKickerGap: 10,
  // was 25 - over "Aspek ..."
  headAspekGap: 16,
  // was 36 - the hairline under the headline block
  hairTop: 24,
  // was 28 / 14 - the tag rows, and the gap BETWEEN wrapped rows
  tagsTop: 20,
  tagRowGap: 10,
  // was 40 - over the quote
  hookTop: 28,
  // was 24 - over the badge block
  badgesTop: 16,
  // was 30 - the appendix's own top padding, under `marginTop: auto`
  appendixTop: 18,
  // was 26 / 11 - the element bars and their labels
  barsTop: 18,
  barLabelTop: 8,
};

/**
 * The Day Master stem, once, as a watermark.
 *
 * RULED 2026-08-13: hanzi on the card is DECORATIVE ONLY. Nobody reads a
 * watermark, which is rule 23's own test — hanzi you can point at is fine, hanzi
 * you must read is not. It is `aria-hidden`, so `lib/card/domContrast.js` skips
 * it: that is WCAG's decorative-element exemption, made a property of the markup
 * rather than a special case in the audit.
 *
 * ── IT CROPS THE CORNER NOW (spec §2.6) ────────────────────
 * It used to sit at `top: 90`. Both cards now pull it off the top-right corner.
 *
 * IT STILL PASSES BEHIND THE HEADLINE, and that is not an oversight. Measured in
 * the reference, the glyph's strokes cross the full height of the headline line
 * and reach into the tag row — the ruled `top: 90` placement sat DEEPER behind
 * the type than this one does. The change is two things and neither is "it clears
 * the type": cropping harder moves the glyph's densest region, the crossbar
 * junction, off-card, and THE ALPHA DROP from the ruled 0.18 to 0.115 is what
 * actually lets the headline read over it. A watermark that genuinely cleared the
 * headline ink would have to come down to roughly 0.46 of the card width, which
 * abandons the ruled proportion and stops reading as texture. Not done, and
 * recorded here so the alpha is understood as load-bearing rather than cosmetic.
 *
 * TOP-RIGHT ON BOTH CARDS AND BOTH POLARITIES (ruled 2026-08-13). Polarity does
 * its work through WEIGHT rather than position — yang is drawn stronger — and
 * that split is preserved on both cards even though the reference drew one value.
 */
const YANG = new Set(['甲', '丙', '戊', '庚', '壬']);

/**
 * ── THE WATERMARK FILL IS `accent`, ON BOTH CARDS (corrected 2026-08-14) ──
 *
 * These are the repo's own 08-13 ruled alphas and they are back after a detour
 * worth recording, because the trap generalises to any future "a darker version
 * of the token" rule.
 *
 * An earlier draft of the polish spec had Card B's watermark at
 * `darken(field, .45) @ 0.26` and Card A's at `accent @ 0.115/0.09`. Both were
 * wrong, and together they were worse than either alone: the same glyph on the
 * same archetype came out LIGHTER than the field on Card A and DARKER on Card B.
 *
 * The darkening was the real error. MIXING A HEX TOWARD BLACK IN sRGB DROPS
 * CHROMA WITH LIGHTNESS, so a 45% darkening does not give a deeper version of the
 * token, it gives mud. Measured on the built cards: 辛 Permata #EDEAE4 went to a
 * neutral grey with no hue left at all, 己 Taman #D0B87E to grey-brown, 壬
 * Samudra #0E3A5C to desaturated slate. Only 丙 Matahari kept any identity, and
 * it read as a brown blot rather than as fire.
 *
 * `accent` cannot do that: it is DEFINED as the field's own hue at equal or lower
 * chroma (lib/card/tokens.js), so it is hue-true by construction.
 *
 * ── AND THE SAME WARNING ABOUT `stepAway` ──────────────────
 * `stepAway()` also steps toward white or black, and it is correct ONLY because
 * GRADIENT_STOPS are 0 / 0.08 / 0.16 — shallow enough that the chroma loss is
 * invisible. Do not reuse it at a large amount anywhere, and never in the
 * watermark path. `tests/card.spec.mjs` asserts that path stays clean.
 */
export const WATERMARK_FILL = { yang: 0.18, yin: 0.14 };

/**
 * ── THE TWO PLACEMENTS, NAMED (prompt R commit 2, section 0b) ──
 *
 * CARD B IS UNTOUCHED at its 2026-08-14 values. CARD A's were RE-DERIVED on the
 * 1080x1350 frame and are NOT the old numbers scaled: the worksheet's §2 banner
 * forbids scaling old-frame export pixels into the new one, and the constraint in
 * `card-polish-spec.md:153` is a RELATIONSHIP to the headline and the tag row -
 * both of which moved, and neither proportionally to the card.
 *
 * Derived and checked with `npm run measure:watermark`, which renders each card
 * twice - once with this node suppressed - and takes the bounding box of the
 * differing pixels as the glyph's INK. The div box is not the ink box: at 864px
 * with line-height 0.8 the box is 864x691 and the strokes sit inset from it by an
 * amount that differs per stem, so measuring the div would answer a question
 * nobody asked.
 *
 * The per-stem table lives in `docs/qa/2026-08-31-watermark-fit.md`.
 *
 * THE SIZE IS NOT HERE and is not re-derived: §0b approves it, and
 * `spec.card.w * 0.80` follows the frame on its own (907 -> 1080 gives 864).
 */
export const WATERMARK_A = { top: -128, right: -144 };
export const WATERMARK_B = { top: -105, right: -133 };

function Watermark({ stem, token, spec, px, foil, offset }) {
  if (!stem) return null;
  const isYang = YANG.has(stem);
  const lightField = inkIsDark(token);
  const size = foil ? 0.69 : 0.80;
  // `offset` is the measurement harness trying a candidate. Nothing in the app
  // passes it, so the shipped cards always use the two constants above.
  const off = offset ?? (foil ? WATERMARK_B : WATERMARK_A);
  return E('div', {
    'aria-hidden': 'true',
    // A HANDLE FOR THE RULER, not for the reader. scripts/measure-watermark-fit.mjs
    // renders the card twice - once with this node suppressed - and diffs the two
    // to get the GLYPH INK bounding box, which is not the div box: at font-size 864
    // with line-height 0.8 the box is 864x691 and the strokes sit inset from it by
    // an amount that differs per stem. §10's constraint is about the ink.
    'data-role': 'watermark',
    style: {
      position: 'absolute', pointerEvents: 'none', userSelect: 'none',
      fontFamily: HAN,
      fontSize: px(spec.card.w * size), lineHeight: 0.8,
      // ACCENT, at the ruled alphas, ON BOTH CARDS. Never a darkened field —
      // see WATERMARK_FILL above for the measurement that killed that rule.
      color: alpha(token.accent, isYang ? WATERMARK_FILL.yang : WATERMARK_FILL.yin),
      // THE DEBOSS IS CARD B'S ONLY, AND DARK FIELDS' ONLY. Two hard 2px offsets
      // and NO BLUR: 2 export px on a 907px card is 0.2% of the width, which is a
      // hint of relief. Anything larger, or any blur radius at all, renders as a
      // misregistered second copy of the glyph rather than as depth.
      //
      // Suppressed on the three light fields (己 Taman, 辛 Permata, 癸 Embun),
      // where the dark half of the offset has no gradient to sink into and reads
      // as grime around the strokes.
      ...(foil && !lightField
        ? { textShadow: `0 ${px(2)}px 0 ${alpha(token.ink, 0.07)}, 0 -${px(2)}px 0 rgba(0,0,0,0.10)` }
        : null),
      top: px(off.top),
      right: px(off.right),
    },
  }, stem);
}

/**
 * THE RIM — Card B's edge, and the thing that reads at thumbnail size.
 *
 * ── AN SVG STROKE, NOT A MASKED BORDER GRADIENT (spec §4) ──
 * The design reference draws this with `-webkit-mask` plus `mask-composite: xor`,
 * which is the standard way to get a gradient border in a browser and which does
 * NOT survive html-to-image. It fails silently: the card looks right on screen
 * and the exported PNG has either no rim or a solid filled rectangle over the
 * whole object. An SVG stroke exports as an SVG stroke.
 *
 * `rx` IS 39, NOT 40. The stroke straddles the path, so a 2px stroke on a 40px
 * radius overshoots the object's own `borderRadius: 40` by one pixel at the
 * corners and shows as a hairline of canvas colour. Same reason `x`/`y` are 1 and
 * the rect is 2px smaller than the card in each dimension.
 *
 * THE GRADIENT ID MUST BE UNIQUE PER INSTANCE. Two cards in one document with the
 * same id silently share the first one's gradient, and the preview page renders
 * ten of these plus ten thumbnails. `useId` is per-instance and stable across
 * server render; the colons it produces are stripped because `url(#...)` is
 * parsed as a CSS selector-ish token and a bare colon there is asking for trouble.
 */
function Rim({ token, spec, px, id }) {
  const light = inkIsDark(token);
  const stops = light
    // On a light field a near-white rim is invisible on the bright half, so the
    // gloss alternates: white where the light catches, the field's own shadow
    // where it does not. Same shape, inverted material.
    ? [
      ['rgba(255,255,255,.85)', '0%'],
      [alpha(darken(token.field, 0.55), 0.30), '34%'],
      ['rgba(255,255,255,.6)', '62%'],
      [alpha(darken(token.field, 0.5), 0.22), '100%'],
    ]
    : [
      [alpha(token.ink, 0.72), '0%'],
      [alpha(token.ink, 0.07), '34%'],
      [alpha(token.ink, 0.44), '62%'],
      [alpha(token.ink, 0.05), '100%'],
    ];
  const w = px(spec.card.w);
  const h = px(spec.card.h);
  const sw = Math.max(0.5, px(2));
  return E('svg', {
    'aria-hidden': 'true', width: w, height: h,
    style: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  },
    E('defs', { key: 'd' },
      E('linearGradient', { id, gradientTransform: 'rotate(152 .5 .5)' },
        stops.map(([color, offset]) => E('stop', { key: offset, offset, stopColor: color })),
      ),
    ),
    E('rect', {
      key: 'r',
      x: sw / 2, y: sw / 2, width: w - sw, height: h - sw,
      rx: px(RADIUS) - sw / 2,
      fill: 'none', stroke: `url(#${id})`, strokeWidth: sw,
    }),
  );
}

/**
 * THE SHEEN — one translucent wash, white-alpha rather than a token colour, so
 * the same declaration works on all seven dark fields.
 *
 * ── IT COSTS CONTRAST, AND THAT IS MEASURED RATHER THAN IGNORED ──
 * On a light-ink token a white sheen moves the surface TOWARD the ink, and it
 * sits over the region the headline occupies. Measured 2026-08-14, ink against
 * `composite(#ffffff, field, 0.15)`: 甲 6.99, 乙 3.94, 丙 3.65, 丁 6.86,
 * 戊 3.50, 庚 8.74, 壬 7.79. Three tokens lose AA in the lit corner, and they are
 * the three with the least headroom to begin with — the same three brass text
 * fails on, for the same reason.
 *
 * NOT unilaterally reduced: the sheen is ruled at 0.15 and the alternative
 * (scaling it per token) would silently redesign the finish. It is reported
 * instead — `npm run audit:card-contrast` prints the row — and the fix, if
 * Reyner wants one, is the same field darkening that fixed Matahari on 08-13.
 */
export const SHEEN_ANGLE = 158;

/**
 * THE SHEEN AS DATA, so the audit can measure the thing the card draws.
 *
 * It used to be two CSS strings inline in <Sheen>, and the audit carried its own
 * copy of the peak alpha — `composite('#ffffff', field, .15)` written out by hand.
 * That is two sources for one fact, and it went wrong in the direction these
 * always go: the audit's copy modelled only the DARK branch, so the three light
 * fields were skipped entirely and the black stop at the far corner was measured
 * by nothing. The CSS is now DERIVED from these stops, and `sheenGrounds()` below
 * is what the audit reads, so the two cannot drift.
 *
 * `light` is the branch for a LIGHT FIELD (dark ink, `inkIsDark` true). It is
 * inverted on purpose: a hard white highlight along the top edge and a soft black
 * at the far corner, so the gloss reads as a lit edge with a shadow under it
 * rather than as a wash that would simply grey the card out.
 */
export const SHEEN = {
  dark: [
    { rgb: '255,255,255', a: 0.15, pos: 0 },
    { rgb: '255,255,255', a: 0.05, pos: 26 },
    { rgb: '255,255,255', a: 0, pos: 46 },
    { rgb: '255,255,255', a: 0, pos: 100 },
  ],
  light: [
    { rgb: '255,255,255', a: 0.62, pos: 0 },
    { rgb: '255,255,255', a: 0.12, pos: 24 },
    { rgb: '0,0,0', a: 0, pos: 46 },
    { rgb: '0,0,0', a: 0.07, pos: 100 },
  ],
};

// `.15`, not `0.15`, and a bare `0` for zero — the shape the cards already ship
// and the shape tests/card.spec.mjs matches on. Derived rather than retyped.
const sheenAlpha = (a) => (a === 0 ? '0' : String(a).replace(/^0/, ''));

export function sheenCss(token) {
  const stops = SHEEN[inkIsDark(token) ? 'light' : 'dark'];
  return `linear-gradient(${SHEEN_ANGLE}deg, ${stops
    .map((s) => `rgba(${s.rgb},${sheenAlpha(s.a)}) ${s.pos}%`).join(', ')})`;
}

/**
 * Every opaque surface the sheen can put under a word on this token, as hexes.
 *
 * A CALLER MUST TAKE THE WORST OF THESE, not the largest alpha, and the reason is
 * that the two branches hurt in opposite directions. On a dark field white is the
 * enemy: it lifts the surface toward a near-white ink. On a light field white
 * HELPS — it pushes the surface away from a dark ink — and the 7% black at the far
 * corner is the stop that costs contrast. A measurement that reaches for "peak
 * alpha" gets the dark branch right by luck and the light branch backwards.
 */
export function sheenGrounds(token) {
  return SHEEN[inkIsDark(token) ? 'light' : 'dark']
    .map((s) => {
      const [r, g, b] = s.rgb.split(',').map(Number);
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
      return { alpha: s.a, hex, ground: composite(hex, token.field, s.a) };
    });
}

function Sheen({ token }) {
  return E('div', {
    'aria-hidden': 'true',
    style: {
      position: 'absolute', pointerEvents: 'none', inset: 0,
      background: sheenCss(token),
    },
  });
}

/**
 * The canvas, and the card object floating on it.
 *
 * ── THE CANVAS IS FLAT AND THE OBJECT CARRIES THE GRADIENT ──
 * Ruled 2026-08-13 and NOT reopened: the two separate by surface rather than by a
 * drawn border, which needs no fourth colour token per archetype.
 *
 * The gradient is DERIVED, never a second set of hexes: three stops stepping AWAY
 * from the ink by GRADIENT_STOPS. It is deliberately SHALLOW, and the reason is
 * `sharecard-tokens-proposal.html` section 5 — the original rule ran the field
 * down to near-black, which swept Matahari's gradient through Api Unggun's flat
 * field so that two different archetypes read as one colour.
 *
 * Stepping away from the ink also means the deep end is the HIGH-contrast end, so
 * the flat field stays the worst surface the GRADIENT produces and one audit
 * ground covers it. (The sheen is a separate overlay and is measured separately —
 * see <Sheen>.)
 *
 * ── CARD B CARRIES A RIM AND A DROP SHADOW. CARD A CARRIES NEITHER ──
 * RULED 2026-08-14, and it is narrower than it looks. The 2026-08-13 rejection of
 * an inset hairline plus a drop shadow stands FOR CARD A, which still ships with
 * neither. What was rejected there was a border that needed A FOURTH COLOUR TOKEN
 * PER ARCHETYPE; the rim is the token's OWN INK at four alphas, so it costs no
 * new colour and the original objection does not reach it.
 */
function Canvas({ spec, token, scale, stem, foil, rimId, id, watermarkOffset, children }) {
  const { card } = spec;
  // ── FULL-BLEED WHEN THE SPEC HAS NO CANVAS (prompt R commit 1) ──
  // Card A lost its mat, so the object IS the export surface. The outer box
  // COLLAPSES ONTO the object rather than being deleted here: both export targets
  // are addressed by id (`id` for the canvas, `id-object` for the object) and
  // `components/cards/exportCards.js` queries both. Collapsing the DOM is prompt
  // R's COMMIT 3, "the export collapse", and doing it here would break the export
  // path inside a commit whose subject is geometry.
  //
  // So the two boxes remain and become the same size. The outer one draws no
  // visible pixel of its own: the object covers it exactly, opaquely, with square
  // corners, which is what "full-bleed, no mat" means in a two-box DOM.
  const canvas = exportSize(spec);
  const bleeds = !spec.canvas;
  const px = (n) => n * scale;
  const ground = `linear-gradient(168deg, ${GRADIENT_STOPS.map((s, i) =>
    `${stepAway(token.field, token.ink, s)} ${[0, 55, 100][i]}%`).join(', ')})`;

  return E('div', {
    // THE TWO EXPORT TARGETS ARE ADDRESSED BY ID (spec §7). The canvas is the
    // SHARE capture and the object is the DOWNLOAD capture, so both need a
    // handle a DOM query can reach. See components/cards/exportCards.js.
    id,
    style: {
      // BORDER-BOX EXPLICITLY, on both boxes. The app sets `* { box-sizing:
      // border-box }` in globals.css, and relying on that made the card 1051x1411
      // instead of 907x1267 anywhere the reset was absent — the padding was added
      // OUTSIDE the ruled size, which silently cut the 86.4 margin to 14.5. It
      // shipped that way in a review preview once.
      //
      // `tests/card.spec.mjs` asserts this in the rendered markup, because a
      // computed-style read reports the CONTENT box and happily "confirms" 907
      // while 1051 is drawn.
      boxSizing: 'border-box',
      width: px(canvas.w), height: px(canvas.h), background: token.field,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    },
  },
    E('div', {
      id: id ? `${id}${OBJECT_ID_SUFFIX}` : undefined,
      style: {
        boxSizing: 'border-box',
        width: px(card.w), height: px(card.h), background: ground,
        // SQUARE ON CARD A, ruled. A radius is what makes an object read as a card
        // sitting ON something; with the mat gone there is nothing for it to sit
        // on, and a rounded corner would show the canvas behind it - the exact mat
        // §10 removes, reintroduced four corners at a time.
        borderRadius: bleeds ? 0 : px(RADIUS), position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        // VERTICAL PADDING IS PER-SPEC; HORIZONTAL IS NOT. `spec.padY` lets Card B
        // buy back frame space without narrowing the text measure - a narrower
        // measure would re-break every line and change the very thing being
        // measured. Card A leaves `padY` unset and emits the single-value form it
        // always has, so its markup is unchanged character for character.
        padding: spec.padY && spec.padY !== PADDING
          ? `${px(spec.padY)}px ${px(PADDING)}px`
          : px(PADDING),
        ...(foil ? { boxShadow: `0 ${px(20)}px ${px(44)}px rgba(0,0,0,.38)` } : null),
      },
    },
      // THE HANZI @font-face TRAVELS WITH THE OBJECT, not with the page.
      // It sits INSIDE the object div deliberately: exportCards captures the
      // OBJECT for the download target, cropping to its bounds, so a <style> on
      // the canvas or in globals.css would be outside the cropped node and the
      // downloaded PNG would fall back to whatever the OS substitutes - the exact
      // defect this replaced. Inside, both export targets carry it.
      E('style', { key: 'hanfont', dangerouslySetInnerHTML: { __html: hanFontFaceCss() } }),
      // Under everything, clipped by the object's own overflow.
      E(Watermark, { key: 'wm', stem, token, spec, px, foil, offset: watermarkOffset }),
      foil && E(Sheen, { key: 'sheen', token }),
      children,
      // LAST, so the edge is over the content: a long line may not sit on top of
      // the card's own rim.
      foil && E(Rim, { key: 'rim', token, spec, px, id: rimId }),
    ),
  );
}

/**
 * A hairline dividing two content zones. 3 export px at `ink@0.16`.
 *
 * NOT the inset hairline on the object EDGE that was rejected on 2026-08-13 —
 * that ruling is about how the object separates from the canvas, and it stands.
 * These are inside the object, and on Card A they are what replaces the diamond
 * as the thing that delimits the badge block.
 */
function Hair({ token, px, top }) {
  return E('div', {
    'aria-hidden': 'true',
    style: {
      height: Math.max(1, px(3)), marginTop: px(top), position: 'relative',
      background: alpha(token.ink, 0.16),
    },
  });
}

/**
 * ── THE KICKER RULE IS "A LEADING ARTICLE", NOT "THE FIRST WORD" ──
 *
 * ALL TEN `arketipe.name_en` values start with "The" as of 2026-08-19, when Reyner
 * ruled 癸 Embun from "Morning Dew" to "The Morning Dew". THE RULE IS NOT RELAXED
 * TO "THE FIRST WORD" ON THAT ACCOUNT: the tenth was bare until that ruling, a
 * first-word rule would have printed MORNING as a kicker and left DEW as the whole
 * headline, and the next name added is as likely to be bare as not. The two unit
 * cases in the spec keep the article-less branch alive.
 *
 * A multi-word headline is also NOT measure-safe at 139: "MORNING" measures about
 * 740px against 763 of inner width. It fits, with 23px to spare, which is close
 * enough that it must be asserted rather than assumed — so multi-word headlines
 * come down to 0.80 and the test pins both branches.
 */
export function splitName(nameEn) {
  const words = String(nameEn || '').trim().split(/\s+/).filter(Boolean);
  const hasArticle = words.length > 1 && words[0].toLowerCase() === 'the';
  return {
    kicker: hasArticle ? words[0] : null,
    head: hasArticle ? words.slice(1) : words,
  };
}

function Headline({ data, palette, px, sc, showNameId, brassHair, nameGap = 18, kickerGap = 14, aspekGap = 25 }) {
  const { kicker, head } = splitName(data.nameEn);
  // ── A REAL-FIT GATE, NOT A WORD COUNT (ruled 2026-08-31, prompt R §0a) ──
  // This read `head.length > 1 ? sc.headline * 0.80 : sc.headline` - a proxy for
  // "this might be too wide" that is not even monotonic in width. MOUNTAIN is 8
  // characters and rendered at FULL size; MORNING is 7 and was the one reduced.
  // The proxy shrank the shorter word and left the longer one alone.
  //
  // Each head word gets its own block below, so a multi-word head never has to
  // fit on one line and only the LONGEST WORD is ever constrained. That is why
  // the set is keyed on words.
  const overflows = head.some((w) => HEADS_THAT_OVERFLOW.has(String(w).toUpperCase()));
  const headSize = overflows ? sc.headline * HEADLINE_OVERFLOW_FACTOR : sc.headline;
  return E('div', { style: { position: 'relative', display: 'flex', flexDirection: 'column' } },
    // Card A prints name_en ALONE — no Indonesian name, no ID eyebrow (08-03).
    // Card B may carry the Indonesian name; it is a document, not a share, and on
    // Card B it is brass with a brass hairline running off to its right.
    showNameId && E('div', {
      key: 'id',
      style: { display: 'flex', alignItems: 'center', gap: px(22), marginBottom: px(nameGap) },
    },
      E('span', {
        key: 'n',
        style: { ...roleStyle('nameId', palette), fontFamily: FONT, fontWeight: 700, fontSize: px(sc.nameId), letterSpacing: px(5.6), textTransform: 'uppercase' },
      }, data.nameId),
      E('span', {
        key: 'r', 'aria-hidden': 'true',
        style: { flex: 1, height: Math.max(1, px(2)), background: brassHair },
      }),
    ),
    kicker && E('div', {
      key: 'kick',
      style: { ...roleStyle('kicker', palette), fontFamily: FONT, fontWeight: 700, fontSize: px(sc.kicker), letterSpacing: px(5.6), textTransform: 'uppercase', marginBottom: px(kickerGap) },
    }, kicker),
    E('div', {
      key: 'en',
      'data-role': 'headline',
      style: {
        ...roleStyle('headline', palette), fontFamily: FONT, fontWeight: HEADLINE_WEIGHT,
        fontSize: px(headSize), lineHeight: 0.90, letterSpacing: px(HEADLINE_TRACKING),
        textTransform: 'uppercase',
      },
    }, head.map((w, i) => E('div', { key: i }, w))),
    // Axis two. Indonesian on BOTH cards. Italic and a lighter weight carry most
    // of the step down from the headline; it was the ACCENT colour until
    // 2026-08-13, and accent cannot reach AA on six of ten tokens.
    E('div', {
      key: 'aspek',
      style: { ...roleStyle('aspek', palette), fontFamily: FONT, fontStyle: 'italic', fontWeight: 480, fontSize: px(sc.aspek), marginTop: px(aspekGap) },
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
 */
function Tags({ data, palette, px, sc, showDynamic, top = 31, rowGap = 14 }) {
  const base = { fontFamily: FONT, fontWeight: 650, fontSize: px(sc.tag), letterSpacing: px(3.4), textTransform: 'uppercase' };
  return E('div', {
    'data-role': 'tags',
    style: { display: 'flex', flexWrap: 'wrap', gap: `${px(rowGap)}px ${px(32)}px`, marginTop: px(top), position: 'relative', ...base },
  },
    data.tags.fixed.map((t) => E('span', { key: `f-${t}`, style: roleStyle('tagFixed', palette) }, t)),
    showDynamic ? data.tags.dynamic.map((t) => E('span', { key: `d-${t}`, style: roleStyle('tagDynamic', palette) }, t)) : null,
  );
}

/**
 * The recognition line — the part people screenshot. It was the third-largest
 * thing on Card A and is now the second.
 *
 * `flex: 1` puts the card's slack HERE, between the hook and the badges, instead
 * of pooling as one dead block above the footer.
 */
function Hook({ data, palette, px, sc, grow = true, top = 61 }) {
  if (!data.hook) return null;
  return E('p', {
    style: {
      ...roleStyle('hook', palette),
      fontFamily: FONT, fontWeight: 440, fontSize: px(sc.hook), lineHeight: 1.52,
      margin: 0, marginTop: px(top), maxWidth: px(700), position: 'relative',
      ...(grow ? { flex: 1 } : null),
    },
  }, data.hook);
}

/**
 * Badges. Indonesian name only, no English bracket, and NO PALACE.
 *
 * THE PALACE CAME OFF 2026-08-13. It read "Penyendiri Pilar Akar" and it now
 * reads "Penyendiri". The reading carries provenance; a card bullet does not need
 * it and the line space is scarce. That does NOT reverse the 08-01 Bintang
 * Penolong rule — read it again and it is about PROSE, where a bare "help
 * arrives" is a platitude. A card bullet is not making that claim.
 *
 * ── THE DIAMOND CAME OFF 2026-08-14 ────────────────────────
 * It was the only non-typographic mark on Card A, and the hairline above the
 * block already delimits it. On Card B the labels are brass, which marks them.
 */
function Badges({ data, palette, px, sc, withMeaning, max, role }) {
  const list = max ? data.badges.slice(0, max) : data.badges;
  if (!list.length) return null;
  return E('div', { style: { display: 'flex', flexDirection: 'column', gap: px(withMeaning ? 10 : 14), position: 'relative' } },
    list.map((b) => E('div', { key: b.label },
      E('div', {
        style: { ...roleStyle(role, palette), fontFamily: FONT, fontWeight: 640, fontSize: px(sc.badgeLabel), letterSpacing: px(1.2) },
      }, b.label),
      withMeaning && b.meaning && E('div', {
        key: 'm',
        // Marked so the preview page's budget probe can find it and swap in
        // MAX_LABEL_MEANING characters. Inert in the export; the alternative was
        // matching on text content, which is a probe that breaks the moment the
        // copy it is checking changes.
        'data-role': 'badgeMeaning',
        style: { ...roleStyle('badgeMeaning', palette), fontFamily: FONT, fontWeight: 400, fontSize: px(sc.badgeMeaning), lineHeight: 1.45, marginTop: px(withMeaning ? 4 : 6) },
      }, b.meaning),
    )),
  );
}

/** Card A's footer: gender + birthdate left, source right. Null gender: date only. */
function Footer({ data, palette, px, sc }) {
  const base = {
    ...roleStyle('footer', palette), fontFamily: FONT, fontWeight: 520,
    fontSize: px(sc.footer), letterSpacing: px(2.6), textTransform: 'uppercase',
  };
  return E('div', {
    style: { display: 'flex', justifyContent: 'space-between', marginTop: px(26), position: 'relative', ...base },
  },
    E('span', { key: 'l' }, data.footer.left),
    E('span', { key: 'r' }, data.footer.right),
  );
}

/**
 * Card B's footer: the same two strings STACKED on the left, and the SEAL on the
 * right, where Card A puts `katon.app`.
 *
 * The stem now appears twice on the card, as the watermark and as the seal. That
 * is deliberate — the watermark is texture, the seal is a mark — and BOTH stay
 * `aria-hidden`, so neither is a character anyone is asked to read and rule 23
 * holds. No third hanzi may appear.
 */
function FoilFooter({ data, palette, token, px, sc, brass }) {
  const line = {
    ...roleStyle('footer', palette), fontFamily: FONT, fontWeight: 520,
    fontSize: px(sc.footer), letterSpacing: px(2.6), textTransform: 'uppercase',
  };
  return E('div', {
    style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: px(12), position: 'relative' },
  },
    E('div', { key: 'l', style: { display: 'flex', flexDirection: 'column', gap: px(8) } },
      data.footer.left ? E('span', { key: 'a', style: line }, data.footer.left) : null,
      E('span', { key: 'b', style: line }, data.footer.right),
    ),
    E('div', {
      key: 'seal', 'aria-hidden': 'true',
      style: {
        width: px(sc.seal), height: px(sc.seal), borderRadius: '50%',
        background: `linear-gradient(140deg, ${brass.stops[0]} 0%, ${brass.stops[1]} 42%, ${brass.stops[2]} 66%, ${brass.stops[0]} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 ${px(6)}px ${px(22)}px rgba(0,0,0,.34)`, flexShrink: 0,
      },
    },
      E('div', {
        style: {
          width: px(sc.sealInner), height: px(sc.sealInner), borderRadius: '50%',
          border: `${Math.max(1, px(2.8))}px solid ${inkIsDark(token) ? 'rgba(243,235,213,.42)' : 'rgba(60,44,20,.42)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: HAN, fontSize: px(sc.sealGlyph), lineHeight: 1,
          color: brass.ink,
        },
      }, data.stem),
    ),
  );
}

/**
 * The four pillars, on Card B. Separate rounded cells, the stem set large over
 * its branch, element and polarity beneath, and an INTI DIRI pill marking the day
 * pillar — the live product's `components/kit.jsx#PillarCell` treatment.
 *
 * THE BOXES ARE WHY 1e EXISTS. The exploration's ruled-band alternative had
 * nowhere to put the emphasis except a colour change; a box gives the day pillar
 * somewhere to carry the metallic, and that is the one place on the card where
 * the finish and the data coincide.
 *
 * The branch's animal is kept on its own line under the meta. Rule 23 requires
 * every hanzi to be paired so it is readable rather than bare, and element +
 * polarity pairs the STEM; without the animal the branch is the one character
 * left undecodable.
 */
function PillarCells({ data, palette, token, px, sc, brass }) {
  // ── A1, APPLIED 2026-08-19: THE DAY CELL'S BRASS WASH IS GONE ──
  // It was `composite(brass.tint, token.field, 0.13)` — a solid brass wash under
  // the day pillar only. It lifted that cell's ground toward the ink and put two
  // tokens' branch glyph under AA on a surface no other cell paints: 乙 #EFF8EF
  // on #398650 = 4.12, 丙 #FFF4EC on #d05322 = 3.93, both against a 4.93 / 4.53
  // they measure on the plain field.
  //
  // REMOVED RATHER THAN REDUCED, because reducing it is not a finish:
  //   - the alpha that would keep BOTH tokens at AA is a <= 0.005. That is not a
  //     subtler wash, it is an absent one, and a 0.5% brass tint declared as if it
  //     were an emphasis is the `sheen at 0.007` mistake in another cell.
  //   - the inset glow was measured as the alternative carrier and it does not
  //     reach the glyph: 0.000027 alpha over the stem, delta 0.0000 on both
  //     tokens. It lights the cell's edge, not its middle, so it was never what
  //     the wash was doing.
  //
  // THE DAY CELL IS STILL THE EMPHASISED ONE, by four marks the wash was not:
  // the brass border at 0.55, the inset glow, the INTI DIRI pill, and four text
  // rows lifted to their own `*Day` roles. The fill is now the same on all four
  // cells, so `p.isDayMaster` no longer chooses a ground — which is also why the
  // rendered gate can trust one ground per token again.
  const cellFill = alpha(token.ink, inkIsDark(token) ? 0.07 : 0.05);
  return E('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: px(16), position: 'relative' } },
    data.appendix.pillars.map((p) => E('div', {
      key: p.key,
      style: {
        position: 'relative', textAlign: 'center', borderRadius: px(22),
        padding: `${px(p.isDayMaster ? 30 : 24)}px ${px(8)}px ${px(22)}px`,
        background: cellFill,
        border: `${Math.max(1, px(2))}px solid ${p.isDayMaster ? alpha(brass.tint, 0.55) : alpha(token.ink, inkIsDark(token) ? 0.22 : 0.16)}`,
        ...(p.isDayMaster ? { boxShadow: `inset 0 0 ${px(33)}px ${alpha(brass.tint, 0.12)}` } : null),
      },
    },
      p.isDayMaster && E('div', {
        key: 'dm',
        style: {
          position: 'absolute', top: px(-13), left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 700, fontSize: px(sc.intiDiri),
          letterSpacing: px(3.3), textTransform: 'uppercase',
          ...roleStyle('intiDiri', palette),
          // A SOLID background-color UNDER the gradient. The gradient is what is
          // seen; the solid is what `domContrast.js` resolves as this text's
          // ground, and without it the pill's dark ink would be measured against
          // the dark card field and scored as unreadable. It is the gradient's
          // darkest stop, so the number is the worst case rather than a flattering
          // one. It was FIELD on INK until 2026-08-14, which passed but had
          // nothing to do with the finish.
          backgroundColor: brass.solid,
          backgroundImage: `linear-gradient(96deg, ${brass.stops[0]}, ${brass.stops[1]})`,
          borderRadius: px(999),
          padding: `${px(4)}px ${px(12.5)}px`,
        },
      }, 'Inti diri'),
      E('div', {
        key: 'label',
        style: { ...roleStyle(p.isDayMaster ? 'pillarLabelDay' : 'pillarLabel', palette), fontFamily: FONT, fontWeight: 600, fontSize: px(sc.pillarLabel), letterSpacing: px(1.6), textTransform: 'uppercase' },
      }, p.palace),
      E('div', {
        key: 'stem',
        style: {
          ...roleStyle('pillarStem', palette), fontFamily: HAN,
          fontSize: px(sc.pillarStem), lineHeight: 1, marginTop: px(8),
          // The day stem glows. Decorative: a text-shadow does not change the
          // colour the audit measures.
          ...(p.isDayMaster ? { textShadow: `0 0 ${px(39)}px rgba(242,230,196,.42)` } : null),
        },
      }, p.stem),
      E('div', {
        key: 'branch',
        style: { ...roleStyle(p.isDayMaster ? 'pillarBranchDay' : 'pillarBranch', palette), fontFamily: HAN, fontSize: px(sc.pillarBranch), lineHeight: 1, marginTop: px(4) },
      }, p.branch),
      E('div', {
        key: 'meta',
        style: { ...roleStyle(p.isDayMaster ? 'pillarMetaDay' : 'pillarMeta', palette), fontFamily: FONT, fontWeight: 500, fontSize: px(sc.pillarMeta), marginTop: px(10) },
      }, `${p.element}${p.polarity ? ` ${p.polarity}` : ''}`),
      E('div', {
        key: 'animal',
        style: { ...roleStyle(p.isDayMaster ? 'pillarAnimalDay' : 'pillarAnimal', palette), fontFamily: FONT, fontWeight: 400, fontSize: px(sc.pillarMeta), marginTop: px(3) },
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
 *
 * NO FINISH. No rim, no sheen, no brass, no shadow. The finish is Card B's whole
 * differentiating axis and giving Card A any of it puts the two cards back where
 * 08-14 found them.
 */
export function CardA({ data, scale = 1, id = 'card-a', watermarkOffset }) {
  const token = tokenFor(data.stem);
  // 'A' — the flat field is the only ground here, so brass text is judged on it
  // and 甲 丁 戊 壬 keep their brass name. See brassTextFor.
  const palette = paletteFor(token, 'A');
  const px = (n) => n * scale;
  const sc = SCALE_A;

  return E(Canvas, { spec: CARD_A, token, scale, stem: data.stem, id, watermarkOffset },
    E(Headline, { key: 'h', data, palette, px, sc }),
    E(Hair, { key: 'r1', token, px, top: 47 }),
    // Three fixed trait words only. No dynamic Aspek — see <Tags>.
    E(Tags, { key: 't', data, palette, px, sc, showDynamic: false }),
    // <Hook> carries flex:1, so the slack lands here rather than as one dead
    // block above the footer, and the hairline below it rides down with it.
    E(Hook, { key: 'k', data, palette, px, sc }),
    E(Hair, { key: 'r2', token, px, top: 0 }),
    // Badges are NOT capped here: without their meanings they are one short line
    // each, so four of them cost four lines. The budget problem is Card B's.
    E('div', { key: 'b', style: { marginTop: px(26) } },
      E(Badges, { data, palette, px, sc, role: 'badgeLabel' })),
    E(Hair, { key: 'r3', token, px, top: 42 }),
    E(Footer, { key: 'f', data, palette, px, sc }),
  );
}

/**
 * CARD B — the paid artifact, as 1e. Optimised for keeping, and for being SEEN to
 * be the paid one: it is a badge of purchase, and a badge nobody can see is not
 * a badge.
 *
 * THE THUMBNAIL-LEGIBLE DIFFERENCE is the FINISH — a lit rim, a bright corner and
 * a brass seal — plus the 9:16 silhouette, the Indonesian name and the appendix.
 * Print resolution is invisible in a feed, so it is not on that list; a light
 * effect survives being 100px tall in a way that detail does not.
 */
export function CardB({ data, scale = 1, id = 'card-b' }) {
  const token = tokenFor(data.stem);
  // 'B' — this card carries the sheen, so brass text is judged against every stop
  // it composites and eight of ten tokens retreat to ink. See brassTextFor.
  const palette = paletteFor(token, 'B');
  const brass = brassFor(token);
  const px = (n) => n * scale;
  const sc = SCALE_B;
  const bars = data.appendix.elements || {};
  const max = Math.max(1, ...Object.values(bars));
  // Unique per instance. The preview page renders ten of these plus ten
  // thumbnails in one document, and a shared gradient id means nine of them
  // silently take the first card's rim colours.
  const rimId = `rim-${React.useId().replace(/:/g, '')}`;
  const brassHair = `linear-gradient(90deg, ${alpha(brass.tint, 0.6)}, ${alpha(brass.tint, 0)})`;

  return E(Canvas, { spec: CARD_B, token, scale, stem: data.stem, foil: true, rimId, id },
    E(Headline, {
      key: 'h', data, palette, px, sc, showNameId: true, brassHair,
      nameGap: RECLAIMED_B.headNameGap, kickerGap: RECLAIMED_B.headKickerGap, aspekGap: RECLAIMED_B.headAspekGap,
    }),
    // ── CARD B'S VERTICAL SPACING IS TIGHTER THAN CARD A'S ──
    // §2.2, §2.3 and §2.4 are Card A deltas and are drawn at their ruled values
    // there. Card B is a DOSSIER carrying three badges with their meanings where
    // Card A carries three bare labels, and its footer is a 111px seal where Card
    // A's is one 24px line. At Card A's air, 丁 Api Unggun's real content
    // overflowed the object by 63 export pixels and was clipped by
    // `overflow: hidden` — silently, which is the only way this can fail.
    // Measured in the preview page's own budget probe; see MAX_LABEL_MEANING.
    E(Hair, { key: 'r1', token, px, top: RECLAIMED_B.hairTop }),
    // The Aspek tags live here and only here — Card B is a document its owner has
    // read a reading beside, so the system vocabulary has somewhere to land.
    E(Tags, { key: 't', data, palette, px, sc, showDynamic: true, top: RECLAIMED_B.tagsTop, rowGap: RECLAIMED_B.tagRowGap }),
    E(Hook, { key: 'k', data, palette, px, sc, grow: false, top: RECLAIMED_B.hookTop }),
    E('div', { key: 'bd', style: { marginTop: px(RECLAIMED_B.badgesTop) } },
      E(Badges, { data, palette, px, sc, withMeaning: true, max: CARD_B_BADGE_LIMIT, role: 'badgeLabelFoil' })),

    // THE APPENDIX. Not a band (ruled 2026-08-13): it had its own tinted plate
    // and a full-bleed rule above it, and together those made the bottom third
    // read as a SEPARATE OBJECT sitting under the card — a tray, not a part. It
    // is part of the card, separated by nothing but space, and the pillar cells
    // give the region its own structure.
    E('div', {
      key: 'app',
      style: { marginTop: 'auto', paddingTop: px(RECLAIMED_B.appendixTop), position: 'relative' },
    },
      E(PillarCells, { key: 'pillars', data, palette, token, px, sc, brass }),

      // Element bars: visual, NO numbers. Numbers invite comparison of the wrong
      // thing, and these are a display distribution, never a strength score.
      // Accent is a NON-TEXT colour and this is one of the places it survives.
      E('div', { key: 'bars', style: { display: 'flex', gap: px(10), marginTop: px(RECLAIMED_B.barsTop) } },
        Object.entries(bars).map(([name, v]) => E('div', { key: name, style: { flex: 1 } },
          E('div', { key: 'track', style: { height: px(9), background: alpha(token.ink, 0.16), borderRadius: px(5), overflow: 'hidden' } },
            E('div', { style: { width: `${(v / max) * 100}%`, height: '100%', background: token.accent } }),
          ),
          E('div', { key: 'l', style: { ...roleStyle('barLabel', palette), fontFamily: FONT, fontWeight: 600, fontSize: px(sc.barLabel), letterSpacing: px(1.4), textTransform: 'uppercase', marginTop: px(RECLAIMED_B.barLabelTop) } }, name),
        )),
      ),

      // 胎元 IS NOT RENDERED, ruled 2026-08-13. The engine still computes it and
      // the reading's own chart block still shows it; the card drops it. It is a
      // chart-sheet fact, and this object's job is to travel.

      E(FoilFooter, { key: 'f', data, palette, token, px, sc, brass }),
    ),
  );
}
