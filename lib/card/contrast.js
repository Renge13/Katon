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

/**
 * The two surfaces text can sit on: the card field, and Card B's appendix band,
 * which is the field with ink laid over it at `bandTint`.
 */
export function surfaces(token, bandTint) {
  return { field: token.field, band: composite(token.ink, token.field, bandTint) };
}

/**
 * The ratio a role actually achieves on a token.
 *
 * @param {{on:'ink'|'accent', over:'field'|'band', opacity:number}} role
 * @param {{field:string, ink:string, accent:string}} token
 * @param {number} bandTint
 */
export function roleContrast(role, token, bandTint) {
  const ground = surfaces(token, bandTint)[role.over];
  return contrast(composite(token[role.on], ground, role.opacity), ground);
}

/**
 * Every role on every token, worst first. One call answers both "does this token
 * pass" and "which role is the binding constraint", and the second question is
 * the one that says what to change.
 */
export function auditContrast(roles, tokens, bandTint) {
  const rows = [];
  for (const [stem, token] of Object.entries(tokens)) {
    for (const [name, role] of Object.entries(roles)) {
      rows.push({ stem, role: name, ratio: roleContrast(role, token, bandTint) });
    }
  }
  return rows.sort((a, b) => a.ratio - b.ratio);
}
