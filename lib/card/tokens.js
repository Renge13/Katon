// ============================================================
// Archetype colour tokens — one triple per Day Master stem
// ============================================================
// field  the object's colour. Hue IS the element family, so a reader learns
//        "green = Kayu" from two cards without being told.
// ink    the field's own hue, chroma collapsed, lightness pushed to the far end.
//        Never pure white, never pure black.
// accent the field's hue, chroma equal or lower, lightness between field and ink.
//
// The rule above is MEASURED off the five locked triples, not invented — see
// `docs/content/sharecard-tokens-proposal.html` §1 and re-run its measurement
// with `node docs/content/sharecard-tokens-measure.mjs`.
//
// ── FIVE ARE LOCKED, FIVE ARE NOT ──────────────────────────
// `approved: true` means Reyner ruled it and `docs/content/sharecard-mockups-02.html`
// carries the same hex in its `:root`. `approved: false` means the value is the
// 2026-08-03 PROPOSAL, rendered so the card can be looked at, and it is NOT a
// decision. Colour tokens are on the do-not-decide-alone list as of 2026-08-13.
//
// `tests/card.spec.mjs` pins every approved triple against the mockup file, so a
// drift between this table and the ruled source fails a test rather than shipping.
// Approving one of the five is a one-word edit here plus writing the hex into the
// mockup's `:root`; nothing else in the card reads these values.
//
// Element pairing is deliberate and is the thing not to break when approving:
// each element family shares a hue and splits on LIGHTNESS, yang heavy and yin
// pale, which is the pattern the two locked Metals already established.
// ============================================================

/** @typedef {{ field: string, ink: string, accent: string, approved: boolean }} Token */

/** Keyed by Day Master stem, matching `glossary.json` -> `arketipe`. */
export const CARD_TOKENS = {
  // ── Kayu / Wood — hue ~152, yang deep, yin bright
  '甲': { field: '#1B4A2C', ink: '#ECF5EE', accent: '#8FBF9F', approved: false }, // Jati
  '乙': { field: '#1F7A43', ink: '#EFF8EF', accent: '#A8DBB4', approved: true },  // Bambu
  // ── Api / Fire — hue ~34, yang open blaze, yin contained ember
  //
  // MATAHARI'S FIELD CHANGED 2026-08-13 (Reyner): #FF4F12 -> #CC3F0E, a 20%
  // darkening on the same hue, with the near-white ink KEPT. It was the only
  // LOCKED token that could not reach WCAG AA — 3.04 against the old field — and
  // it now measures 4.53.
  //
  // The alternative measured the same was flipping to a dark ink (#4A1705, 4.51)
  // on the original vivid field. REJECTED, and the reason is about the set rather
  // than the card: The Sun's identity IS a bright field, and a dark ink would
  // split the Fire pair on POLARITY as well as value, while every other element
  // pair splits on value alone. The token system exists to be read as a set.
  '丙': { field: '#CC3F0E', ink: '#FFF4EC', accent: '#FFC9A8', approved: true },  // Matahari
  '丁': { field: '#7C2012', ink: '#FDEEE8', accent: '#EFA98C', approved: false }, // Api Unggun
  // ── Tanah / Earth — hue ~82, yang stone-ochre, yin warm sand
  '戊': { field: '#8F7040', ink: '#FAF4E9', accent: '#E3CFA8', approved: false }, // Gunung
  '己': { field: '#D0B87E', ink: '#241E12', accent: '#755C2C', approved: false }, // Taman
  // ── Logam / Metal — achromatic, the pair the lightness rule was read off
  '庚': { field: '#26282D', ink: '#E8E9EC', accent: '#9BA1AD', approved: true },  // Besi Tempa
  '辛': { field: '#EDEAE4', ink: '#1C1A17', accent: '#8A7B5C', approved: true },  // Permata
  // ── Air / Water — hue ~236, yang deep, yin pale mist
  '壬': { field: '#0E3A5C', ink: '#EAF3F9', accent: '#7FB6D9', approved: true },  // Samudra
  '癸': { field: '#A9CFE0', ink: '#16242C', accent: '#46748F', approved: false }, // Embun
};

/** Stems whose triple Reyner has ruled. The other five render but must not ship. */
export const APPROVED_STEMS = Object.keys(CARD_TOKENS).filter((s) => CARD_TOKENS[s].approved);

/**
 * The token for a stem. Throws on an unknown stem rather than returning a default:
 * a card silently rendered in someone else's colour is worse than a build failure,
 * and all ten stems are known at author time.
 */
export function tokenFor(stem) {
  const t = CARD_TOKENS[stem];
  if (!t) throw new Error(`No card token for Day Master stem "${stem}"`);
  return t;
}

/**
 * Is this card shippable to a user, colour-wise? Read this before wiring the card
 * to any user-facing surface — five of ten would ship an unapproved colour.
 */
export function tokenApproved(stem) {
  return tokenFor(stem).approved;
}
