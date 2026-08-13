// ============================================================
// Contrast measured from the RENDERED MARKUP
// ============================================================
// WHY THIS REPLACED THE TABLE-BASED AUDIT, 2026-08-13.
//
// `TEXT_ROLES` was exported, audited, and consumed by NOTHING. The card set
// `color` once on its root and every element inherited it, so the audit was
// reading the table beside the component rather than the component. It passed
// perfectly while the pillar branch was drawn at `opacity: 0.85` — a real
// dimming that appeared in no role and that nothing could have caught.
//
// **An assertion that reads the intent it is checking is not an assertion.**
//
// So this parses what `renderToStaticMarkup` actually produced, resolves CSS
// inheritance the way a browser would, and measures every text node that ends up
// on screen. A role that is never wired shows up as text in the wrong colour; a
// stray inline opacity shows up as a lower ratio. Neither is visible to a table.
//
// ── WHAT IT MODELS, AND WHAT IT DOES NOT ───────────────────
// MODELLED: `color` inherits from the nearest ancestor that sets it; `opacity`
// COMPOUNDS multiplicatively through ancestors, which is what CSS does — nested
// opacity groups multiply rather than override.
//
// MODELLED: a SOLID background on any element becomes the ground for its whole
// subtree. This is not a refinement, it is load-bearing — the very first run of
// this audit found the INTI DIRI pill, which draws `color: token.field` on a
// `background: token.accent`. Measured against the card's field that is a 1.00
// ratio, i.e. invisible; measured against the pill it sits on, it is the real
// number. The table-based audit could not see the pill at all, because a pill is
// not a role.
//
// NOT MODELLED: layout, and gradients as grounds. Nothing here knows where a box
// is, so the caller supplies the base ground as the token's flat field. That is
// sound BECAUSE the card's gradient steps AWAY from the ink at every stop, making
// the flat field the worst surface on either card — asserted separately in
// tests/card.spec.mjs. If that ever stops being true this audit becomes
// optimistic, and the assertion protecting it is the thing that must fail first.
// ============================================================

import { contrast, composite } from './contrast.js';

// React's server renderer emits well-formed tags with double-quoted attributes
// and escapes `"` `&` `<` `>` inside values, so `[^>]*` cannot run past a tag.
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|[^>"])*?)(\/?)>|([^<]+)/g;
const STYLE = /style="([^"]*)"/;

const decode = (s) => s
  .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** `color:#fff;opacity:0.8` -> { color: '#fff', opacity: '0.8' } */
function parseStyle(attrs) {
  const m = STYLE.exec(attrs);
  if (!m) return {};
  const out = {};
  for (const decl of decode(m[1]).split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    out[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return out;
}

/**
 * Every visible text run in `html`, with the colour and effective opacity it is
 * actually drawn at.
 *
 * @returns {{ text: string, color: string|null, opacity: number }[]}
 */
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Every visible text run, with the colour, effective opacity and the surface it
 * is drawn on.
 *
 * @param {string} html
 * @param {string} baseGround the card's worst-case surface, normally the field
 * @returns {{ text, color: string|null, opacity: number, ground: string }[]}
 */
export function textRuns(html, baseGround) {
  const runs = [];
  // Each frame carries the INHERITED colour, the COMPOUNDED opacity, the nearest
  // solid GROUND, and whether anything above it was marked decorative.
  const stack = [{ color: null, opacity: 1, ground: baseGround, hidden: false }];
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(html)) !== null) {
    const [, closing, tag, attrs = '', selfClosing, text] = m;

    if (text !== undefined) {
      const t = decode(text).trim();
      const top = stack[stack.length - 1];
      // `aria-hidden` text is decorative by declaration — the watermark, and
      // nothing else today. WCAG exempts it and so does this.
      if (t && !top.hidden) {
        runs.push({ text: t, color: top.color, opacity: top.opacity, ground: top.ground });
      }
      continue;
    }
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }

    const style = parseStyle(attrs);
    const parent = stack[stack.length - 1];
    // Only a SOLID hex background changes the ground. A gradient or an rgba tint
    // leaves it alone: the gradient is contrast-safe by construction, and an rgba
    // overlay cannot be resolved without knowing what is beneath it.
    const bg = style.background || style['background-color'];
    const frame = {
      color: style.color || parent.color,
      opacity: parent.opacity * (style.opacity !== undefined ? Number(style.opacity) : 1),
      ground: HEX.test(bg || '') ? bg : parent.ground,
      hidden: parent.hidden || /aria-hidden="true"/.test(attrs),
    };
    // Void elements never open a scope. `br`/`img` are the only ones this markup
    // can produce, but the self-closing form is handled for safety.
    if (!selfClosing && !['br', 'img', 'hr', 'input'].includes(tag)) stack.push(frame);
  }
  return runs;
}

/**
 * Audit a rendered card. Returns one row per text run, worst ratio first.
 *
 * @param {string} html    output of renderToStaticMarkup
 * @param {string} ground  the worst-case surface, normally the token's flat field
 */
export function auditRendered(html, ground) {
  return textRuns(html, ground)
    .map((r) => ({
      ...r,
      // TWO WAYS TO SCORE ZERO, both loud on purpose. No resolved colour means
      // the text falls back to the browser default, i.e. somebody forgot a role.
      // A non-hex colour means text is being drawn in something the token system
      // did not produce. Either is a defect; neither may be silently skipped, so
      // both land at the bottom of the sort rather than dropping out of it.
      ratio: HEX.test(r.color || '')
        ? contrast(composite(r.color, r.ground, r.opacity), r.ground)
        : 0,
    }))
    .sort((a, b) => a.ratio - b.ratio);
}
