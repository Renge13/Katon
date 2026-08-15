// ============================================================
// Contrast measurement for the card's text roles
// ============================================================
// PURE, and deliberately not in the component: `tests/card.spec.mjs` asserts with
// it and `scripts/card-preview.mjs` prints with it, so the number in the test and
// the number on the review page cannot disagree.
//
// ── WHY OPACITY IS PART OF THE MEASUREMENT ─────────────────
// The card draws several roles at reduced opacity — the dynamic tags at 0.62, the
// footer at 0.78, a pillar label at 0.6. A ratio computed from the raw ink hex
// describes text the card never draws. Each role is therefore COMPOSITED over the
// surface it sits on first, and the ratio is measured on the result.
//
// ── WHY THE FLOOR IS NOT A WCAG NUMBER ─────────────────────
// The five LOCKED tokens are Reyner's, and Matahari sits at ink 3.04 / accent 2.22
// against its own vivid orange field. A test asserting 4.5, or even 3.0 on accent,
// would fail a token he ruled. So the floor is the locked set's own worst case:
// a new token may not be worse than what already shipped. That is the same rule
// `docs/content/sharecard-tokens-proposal.html` measured its five proposals
// against, and it is the only floor this project has evidence for.

/** sRGB relative luminance of a #rrggbb. */
export function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque colours. Order does not matter. */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** `fg` drawn at `a` over opaque `bg`, as the opaque colour that actually appears. */
export function composite(fg, bg, a) {
  const mix = (i) => {
    const f = parseInt(fg.slice(i, i + 2), 16);
    const b = parseInt(bg.slice(i, i + 2), 16);
    return Math.round(f * a + b * (1 - a));
  };
  return `#${[1, 3, 5].map((i) => mix(i).toString(16).padStart(2, '0')).join('')}`;
}

/** `hex` moved toward white (`up`) or black by `amount` (0..1). */
function shift(hex, up, amount) {
  const ch = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(up ? v + (255 - v) * amount : v * (1 - amount));
  });
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * WHICH INK POLE A FIELD CAN ACTUALLY CARRY — a GUARD, never a chooser.
 *
 * For any field there are two directions an ink can go, light or dark, and one of
 * them usually has more room. This reports both ceilings and the nearest
 * hue-preserving ink on each side that reaches `target`.
 *
 * ── IT MUST NOT AUTO-APPLY, and that is the whole design (ruled 2026-08-13) ──
 * The DECLARED ink in `lib/card/tokens.js` stays the authority. If code picked
 * the winning pole, a token edit could silently repaint every word on the card:
 * someone darkens a field for taste, the ink flips from near-white to near-black,
 * the audit still passes, and nobody is told the design changed. So the build
 * FAILS on a declared ink that misses AA, and the failure NAMES the pole that
 * would have worked. A person decides; the machine only refuses to stay quiet.
 *
 * @param {string} field
 * @param {number} [target] the ratio to solve for
 */
export function inkPoles(field, target = 4.5) {
  const solve = (up) => {
    for (let a = 0; a <= 1.0001; a += 0.005) {
      const candidate = shift(field, up, a);
      if (contrast(candidate, field) >= target) {
        return { hex: candidate, ratio: contrast(candidate, field) };
      }
    }
    return null;
  };
  const light = { ceiling: contrast(field, '#ffffff'), reaches: solve(true) };
  const dark = { ceiling: contrast(field, '#000000'), reaches: solve(false) };
  return { light, dark, better: light.ceiling >= dark.ceiling ? 'light' : 'dark' };
}

/**
 * ── ACCENT ON FIELD, AND WHY ITS FLOOR IS NOT WCAG ─────────
 *
 * A TOKEN report. Nothing in `components/cards/Card.js` calls this, and nothing
 * applies it: colour tokens are on the do-not-decide-alone list.
 *
 * `docs/content/sharecard-tokens-measure.mjs` already sets the bar as the ruled
 * set's own worst case rather than an abstract WCAG target, and that is correct
 * because accent is NON-TEXT — the watermark, the element bars, the cell
 * borders. 4.5 was never the test for it.
 *
 * ── THE FLOOR IS FROZEN, AND THAT IS THE WHOLE POINT ───────
 *
 * It used to be DERIVED from the `approved: true` rows, which was right while
 * five were locked and five were proposed: approving a token moved the bar on its
 * own, and a proposal could be measured against what had already shipped.
 *
 * ALL TEN WERE APPROVED ON 2026-08-15, and a derived floor then becomes the
 * SET'S OWN MINIMUM — Embun at 3.05 — so `under` comes back empty and the guard
 * degrades into an assertion that a set cannot be worse than its worst member.
 * It would report "all clear" at the exact moment two ruled tokens sit below the
 * bar. The `withEmbun` case in tests/card.spec.mjs predicted this: approving a
 * lower token lowers the bar.
 *
 * So the floor is the 2026-08-13 measurement, frozen: the five then-locked
 * triples measured 3.31 / 3.43 / 3.45 / 5.40 / 5.69 and Matahari defined it.
 */

/**
 * The five triples the floor was read off, on 2026-08-13, kept as HEXES rather
 * than as a number. These are history: the values AT THAT DATE. If a token is
 * ever re-hexed this block does not move, because the floor was measured then —
 * which is exactly what makes it frozen rather than derived.
 */
const FLOOR_SOURCE_2026_08_13 = [
  { stem: '丙', accent: '#FFC9A8', field: '#CC3F0E' }, // 3.31, defines it
  { stem: '乙', accent: '#A8DBB4', field: '#1F7A43' }, // 3.43
  { stem: '辛', accent: '#8A7B5C', field: '#EDEAE4' }, // 3.45
  { stem: '壬', accent: '#7FB6D9', field: '#0E3A5C' }, // 5.40
  { stem: '庚', accent: '#9BA1AD', field: '#26282D' }, // 5.69
];

/** The floor recomputed from the five hexes it was measured off. */
export function accentFloorFromLocked() {
  return Math.min(...FLOOR_SOURCE_2026_08_13.map((t) => contrast(t.accent, t.field)));
}

/**
 * The frozen floor. **3.31** everywhere it is printed, and every doc says 3.31.
 *
 * ── IT IS COMPUTED FROM THE FROZEN HEXES, NOT TYPED AS 3.31 ──
 * Writing the literal was tried first and it broke the guard immediately. The
 * true measurement is 3.3075; `3.31` is its two-decimal PRESENTATION, rounded
 * UP. Freezing the rounded value puts the bar 0.0025 above the token that
 * defines it, so 丙 Matahari — the whole reason the number is 3.31 — came back
 * reported as failing its own floor.
 *
 * The epsilon in `accentAudit` exists to stop exactly that, and it cannot help
 * when the constant is genuinely higher than the measurement. So the constant IS
 * the measurement, taken from hexes that do not move, and the rounding lives only
 * where numbers are displayed. A test pins `toFixed(2)` to "3.31" so the value a
 * human reads and the value the code compares stay the same fact.
 */
export const ACCENT_FLOOR = accentFloorFromLocked();

/**
 * Approved tokens that sit UNDER the frozen floor.
 *
 * A REPORT, NOT A PERMISSION — the same standing as `AA_EXEMPT` and `DIM_EXEMPT`
 * in components/cards/Card.js. It can only shrink, and nothing joins it without
 * someone editing this line.
 *
 *   己 Taman  3.26 on #D0B87E
 *   癸 Embun  3.05 on #A9CFE0
 *
 * Both are LIGHT fields, where accent has to sit between a pale field and a dark
 * ink and there is simply less room. Both are approved, so this is not a backlog
 * of unruled values — it is two ruled tokens whose accent is weaker than the rest
 * of the set, named so it stays visible instead of being averaged away.
 */
export const ACCENT_EXEMPT = ['己', '癸'];

/**
 * Every token's accent-on-field ratio, against the frozen floor.
 *
 * EVERY ROW IS REPORTED, exempt or not, exactly as `lib/card/domContrast.js` does
 * for the dimmed text roles. An exemption suppresses the FAILURE, never the
 * NUMBER — the moment a report stops printing what it excused, nobody can see it
 * drift.
 *
 * @param {Record<string, {field: string, ink: string, accent: string, approved: boolean}>} tokens
 */
export function accentAudit(tokens) {
  const floor = ACCENT_FLOOR;
  const rows = Object.entries(tokens).map(([stem, t]) => {
    const ratio = contrast(t.accent, t.field);
    // The epsilon is not decoration: the token that DEFINED the floor sits
    // exactly on it, and a bare `<` reports Matahari as failing its own bar.
    const below = ratio < floor - 1e-9;
    return {
      stem,
      ratio,
      approved: t.approved,
      below,
      exempt: ACCENT_EXEMPT.includes(stem),
      // `under` is what a caller should gate on: below the floor AND not excused.
      under: below && !ACCENT_EXEMPT.includes(stem),
    };
  });
  return {
    floor,
    rows,
    under: rows.filter((r) => r.under).map((r) => r.stem),
    below: rows.filter((r) => r.below).map((r) => r.stem),
  };
}

/**
 * Does a token's DECLARED ink reach `target` on its own field, and if not, what
 * would? The message is the product here — it is what a failing build prints.
 */
export function inkVerdict(stem, token, target = 4.5) {
  const ratio = contrast(token.ink, token.field);
  if (ratio >= target) return { stem, ok: true, ratio, message: null };

  const poles = inkPoles(token.field, target);
  const win = poles[poles.better];
  const pole = poles.better === 'light' ? 'a LIGHTER' : 'a DARKER';
  return {
    stem, ok: false, ratio, poles,
    message: `${stem}: declared ink ${token.ink} on ${token.field} is ${ratio.toFixed(2)}, `
      + `under ${target}. ${pole} ink reaches it — e.g. ${win.reaches ? win.reaches.hex : 'none on this hue'}`
      + `${win.reaches ? ` at ${win.reaches.ratio.toFixed(2)}` : ''}. `
      + `Darkening the FIELD instead also works and keeps the ink. NOT APPLIED: the declared ink is the authority.`,
  };
}
