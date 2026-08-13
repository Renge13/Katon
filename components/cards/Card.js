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
//   2. CARD OBJECT vs CANVAS. Both carry the same colour field, so the object
//      needs an edge or it is invisible. Rendered here as a hairline inset plus
//      a soft shadow, which is what the 08-03 proposal mocks and what Cowork
//      recommends, because the alternative — a different surface value for the
//      card — adds a FOURTH colour token per archetype. NOT LOCKED.
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

const SANS = 'var(--font-hanken), system-ui, -apple-system, sans-serif';
const SERIF = 'var(--font-spectral), Georgia, "Times New Roman", serif';

/** rgba() from a #rrggbb and an alpha. Kept local — kit.jsx is a client module. */
function alpha(hex, a) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

/** Is this token's ink the dark end? Decides which way the hairline and shadow go. */
function inkIsDark(token) {
  return parseInt(token.ink.slice(1, 3), 16) < 128;
}

/**
 * The canvas plus the floating card object. Both carry the SAME field colour, so
 * the whole export reads as the archetype's colour at thumbnail size; the object
 * is separated by a hairline and a shadow only. See open question 2 above.
 */
function Canvas({ spec, token, scale, children }) {
  const { canvas, card } = spec;
  const px = (n) => n * scale;
  const dark = inkIsDark(token);
  return E('div', {
    style: {
      width: px(canvas.w), height: px(canvas.h), background: token.field,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    },
  },
    E('div', {
      style: {
        width: px(card.w), height: px(card.h), background: token.field, color: token.ink,
        borderRadius: px(40), position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: px(72),
        // A light field needs a dark hairline and a dark field a light one, or the
        // inset vanishes into whichever side it was tuned for. Read off the token
        // rather than hardcoded: the ink IS the far end of the field's lightness.
        boxShadow: `0 ${px(24)}px ${px(64)}px ${alpha('#000000', dark ? 0.18 : 0.42)}, `
          + `inset 0 0 0 ${Math.max(1, px(2))}px ${alpha(dark ? '#000000' : '#ffffff', 0.16)}`,
      },
    },
      // the same top-light / bottom-shade the 08-03 mock carries, so the card
      // object reads as a physical thing rather than a rectangle of paint
      E('div', {
        style: {
          position: 'absolute', inset: 0, borderRadius: px(40), pointerEvents: 'none',
          background: `linear-gradient(178deg, ${alpha('#ffffff', 0.09)}, transparent 34%, ${alpha('#000000', 0.10)} 92%)`,
        },
      }),
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
      style: { fontFamily: SANS, fontSize: px(26), letterSpacing: px(4), textTransform: 'uppercase', color: token.accent, marginBottom: px(14) },
    }, data.nameId),
    E('div', {
      key: 'en',
      style: { fontFamily: SANS, fontWeight: 800, fontSize: px(112), lineHeight: 0.94, letterSpacing: px(1), textTransform: 'uppercase' },
    }, String(data.nameEn || '').split(' ').map((w, i) => E('div', { key: i }, w))),
    // Axis two. Indonesian on BOTH cards.
    E('div', {
      key: 'aspek',
      style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: px(36), marginTop: px(16), color: token.accent },
    }, data.aspek),
  );
}

/** 3 fixed + 3 dynamic. The dynamic three are dimmed, as the 08-03 mock has them. */
function Tags({ data, px }) {
  const base = { fontFamily: SANS, fontWeight: 650, fontSize: px(23), letterSpacing: px(3.4), textTransform: 'uppercase' };
  return E('div', {
    style: { display: 'flex', flexWrap: 'wrap', gap: `${px(12)}px ${px(30)}px`, marginTop: px(30), ...base },
  },
    data.tags.fixed.map((t) => E('span', { key: `f-${t}` }, t)),
    data.tags.dynamic.map((t) => E('span', { key: `d-${t}`, style: { opacity: 0.62 } }, t)),
  );
}

function Hook({ data, px }) {
  if (!data.hook) return null;
  return E('p', {
    style: { fontFamily: SERIF, fontSize: px(27), lineHeight: 1.5, marginTop: px(30), maxWidth: px(660), opacity: 0.95 },
  }, data.hook);
}

/** Badges, Indonesian name only. No English bracket — a card has no room for beat 3. */
function Badges({ data, token, px, withMeaning }) {
  if (!data.badges.length) return null;
  return E('div', { style: { display: 'flex', flexDirection: 'column', gap: px(12) } },
    data.badges.map((b) => E('div', { key: b.label },
      E('div', {
        style: { fontFamily: SANS, fontWeight: 640, fontSize: px(23), letterSpacing: px(1.2), color: token.accent },
      },
        // Bintang Penolong is in 77% of charts, so it is never a headline and is
        // always rendered WITH its palace — never a bare "help arrives".
        `◆ ${b.label}${b.palace ? `   ${b.palace}` : ''}`,
      ),
      withMeaning && b.meaning && E('div', {
        key: 'm',
        style: { fontFamily: SERIF, fontSize: px(21), lineHeight: 1.45, marginTop: px(5), opacity: 0.8 },
      }, b.meaning),
    )),
  );
}

/** gender + birthdate on the left, source on the right. Null gender: date + source. */
function Footer({ data, px }) {
  return E('div', {
    style: {
      display: 'flex', justifyContent: 'space-between', marginTop: px(26),
      fontFamily: SANS, fontWeight: 520, fontSize: px(20), letterSpacing: px(2.6),
      textTransform: 'uppercase', opacity: 0.78,
    },
  },
    E('span', { key: 'l' }, data.footer.left),
    E('span', { key: 'r' }, data.footer.right),
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
  return E(Canvas, { spec: CARD_A, token, scale },
    E(Headline, { key: 'h', data, token, px }),
    E(Tags, { key: 't', data, px }),
    E(Hook, { key: 'k', data, px }),
    E('div', { key: 'b', style: { marginTop: 'auto' } }, E(Badges, { data, token, px })),
    E(Footer, { key: 'f', data, px }),
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

  return E(Canvas, { spec: CARD_B, token, scale },
    E(Headline, { key: 'h', data, token, px, showNameId: true }),
    E(Tags, { key: 't', data, px }),
    E(Hook, { key: 'k', data, px }),
    E('div', { key: 'bd', style: { marginTop: px(34) } }, E(Badges, { data, token, px, withMeaning: true })),

    // THE APPENDIX BAND. Separated by a full-bleed rule and a tinted ground so the
    // lower third reads as a different surface while scrolling.
    E('div', {
      key: 'app',
      style: {
        marginTop: 'auto', marginLeft: px(-72), marginRight: px(-72), marginBottom: px(-72),
        padding: `${px(40)}px ${px(72)}px ${px(60)}px`,
        background: alpha(token.ink, 0.07),
        borderTop: `${Math.max(1, px(2))}px solid ${alpha(token.ink, 0.22)}`,
      },
    },
      // The eight characters, each paired with its Indonesian animal and element so
      // it is readable rather than decorative. Card A has none, by ruling.
      E('div', { key: 'grid', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: px(14) } },
        data.appendix.pillars.map((p) => E('div', { key: p.key, style: { textAlign: 'center' } },
          E('div', { key: 'p', style: { fontFamily: SANS, fontSize: px(16), letterSpacing: px(1.6), textTransform: 'uppercase', opacity: 0.6 } }, p.palace),
          E('div', { key: 'g', style: { fontFamily: SERIF, fontSize: px(46), margin: `${px(6)}px 0 ${px(4)}px` } }, p.ganzhi),
          E('div', { key: 'e', style: { fontFamily: SANS, fontSize: px(18), color: token.accent } }, `${p.element}${p.animal ? ` ${p.animal}` : ''}`),
        )),
      ),

      // Element bars: visual, NO numbers. Numbers invite comparison of the wrong
      // thing, and these are a display distribution, never a strength score.
      E('div', { key: 'bars', style: { display: 'flex', gap: px(10), marginTop: px(30) } },
        Object.entries(bars).map(([name, v]) => E('div', { key: name, style: { flex: 1 } },
          E('div', { key: 'track', style: { height: px(8), background: alpha(token.ink, 0.16), borderRadius: px(4), overflow: 'hidden' } },
            E('div', { style: { width: `${(v / max) * 100}%`, height: '100%', background: token.accent } }),
          ),
          E('div', { key: 'l', style: { fontFamily: SANS, fontSize: px(16), letterSpacing: px(1.4), textTransform: 'uppercase', marginTop: px(7), opacity: 0.7 } }, name),
        )),
      ),

      // 胎元 stays, 命宮 does not (D1b): two conventions score 4/5 and 3/5 against
      // Joey and neither is right, and a wrong value in a legitimacy block is
      // worse than a missing one.
      data.appendix.conception && E('div', {
        key: 'tai',
        style: { fontFamily: SANS, fontSize: px(18), letterSpacing: px(1.4), marginTop: px(24), opacity: 0.7 },
      }, `${data.appendix.conception.label} ${data.appendix.conception.ganzhi} ${data.appendix.conception.animal}`),

      E(Footer, { key: 'f', data, px }),
    ),
  );
}
