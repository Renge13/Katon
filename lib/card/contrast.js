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
