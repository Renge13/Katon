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
// ── ALL TEN ARE APPROVED, 2026-08-15 ───────────────────────
// `approved: true` means Reyner ruled it and `docs/content/sharecard-mockups-02.html`
// carries the same hex in its `:root`. It was five and five from 2026-08-03; the
// other five were ruled on 08-15 and there are no PROPOSED tokens left.
//
// `tests/card.spec.mjs` pins every approved triple against the mockup file, so a
// drift between this table and the ruled source fails a test rather than shipping.
// That pin now covers all thirty hexes rather than fifteen.
//
// ── WHAT APPROVAL DID **NOT** SETTLE ───────────────────────
// Two approved tokens sit UNDER the accent-on-field floor: 己 Taman 3.26 and
// 癸 Embun 3.05, against 3.31. That is a real state and it is named rather than
// averaged away — see ACCENT_FLOOR and ACCENT_EXEMPT in lib/card/contrast.js.
// The floor is FROZEN at the 08-13 measurement for exactly this reason: derived
// from the approved rows it would now be the set's own minimum, which makes the
// guard an assertion that a set cannot be worse than its worst member.
//
// Colour tokens stay on the do-not-decide-alone list. Approval is not a licence
// to re-hex one; it is the record that these ten were ruled.
//
// Element pairing is deliberate and is the thing not to break: each element
// family shares a hue and splits on LIGHTNESS, yang heavy and yin pale, which is
// the pattern the two Metals the rule was read off already established.
// ============================================================

/** @typedef {{ field: string, ink: string, accent: string, approved: boolean }} Token */

/** Keyed by Day Master stem, matching `glossary.json` -> `arketipe`. */
export const CARD_TOKENS = {
  // ── Kayu / Wood — hue ~152, yang deep, yin bright
  '甲': { field: '#1B4A2C', ink: '#ECF5EE', accent: '#8FBF9F', approved: true }, // Jati
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
  '丁': { field: '#7C2012', ink: '#FDEEE8', accent: '#EFA98C', approved: true }, // Api Unggun
  // ── Tanah / Earth — hue ~82, yang stone-ochre, yin warm sand
  //
  // GUNUNG'S FIELD CHANGED 2026-08-15 (Reyner): #8F7040 -> #4A3A1E, the same hue
  // taken down in lightness, with the ink and the accent BOTH KEPT. One hex.
  //
  // It was the weakest card in the set and it failed three different measurements,
  // all of which had the same cause — the field was not dark enough for a set
  // whose whole system is a near-white ink on a deep field. Re-measured after the
  // edit with `lib/card/contrast.js#contrast`, which is also what the audit and
  // the tests read, so these numbers cannot drift from the code:
  //
  //     ink    #FAF4E9   4.21 -> 10.02   was the sole AA_EXEMPT entry
  //     accent #E3CFA8   3.02 ->  7.18   was under the 3.31 locked-set floor
  //     brass  #D9BC85   2.52 ->  6.00   was falling back to ink on Card B
  //
  // Three failures, one edit, and none of them needed a second colour. The pale
  // warm accent on warm mid ochre was giving the metallic nothing to sit against;
  // on the darker field the bars and the seal read.
  //
  // The 08-15 ruling that fixed the CARD's contrast was separate from, and came
  // before, the ruling that approved the TOKEN later the same day.
  '戊': { field: '#4A3A1E', ink: '#FAF4E9', accent: '#E3CFA8', approved: true }, // Gunung
  '己': { field: '#D0B87E', ink: '#241E12', accent: '#755C2C', approved: true }, // Taman
  // ── Logam / Metal — achromatic, the pair the lightness rule was read off
  '庚': { field: '#26282D', ink: '#E8E9EC', accent: '#9BA1AD', approved: true },  // Besi Tempa
  '辛': { field: '#EDEAE4', ink: '#1C1A17', accent: '#8A7B5C', approved: true },  // Permata
  // ── Air / Water — hue ~236, yang deep, yin pale mist
  '壬': { field: '#0E3A5C', ink: '#EAF3F9', accent: '#7FB6D9', approved: true },  // Samudra
  '癸': { field: '#A9CFE0', ink: '#16242C', accent: '#46748F', approved: true }, // Embun
};

// ============================================================
// BRASS — a GLOBAL finish, and deliberately not a fourth token slot
// ============================================================
// RULED 2026-08-14 (card-polish-spec §6.3). Card B's 1e finish needs a metallic,
// and there are exactly TWO of them for the whole set, selected by `inkIsDark`:
// pale brass on the seven dark fields, antique brass on the three light ones.
//
// ── THIS IS NOT A FOURTH PER-ARCHETYPE COLOUR, and the distinction matters ──
// `CARD_TOKENS` above is one triple per Day Master, and its field/ink/accent rule
// was MEASURED off the five locked triples. Brass has nothing to do with that
// derivation: it does not vary by archetype, it is not derived from the field,
// and adding an archetype does not add a brass. Anyone extending the token table
// should read this block and leave brass alone.
//
// `stops` draw the metal. `text` is the ONE solid value brass text may use —
// `background-clip: text` gradient type does not survive html-to-image (spec §4)
// and is invisible to `lib/card/domContrast.js` besides, which resolves a run's
// colour from the inline `color`. `ink` is what may be written ON brass.
export const BRASS = {
  light: {
    stops: ['#F5EDD6', '#C9A76A', '#F2E6C4'],
    text: '#D9BC85',
    // The darkest stop, which is the one a text ground has to be measured at.
    solid: '#C9A76A',
    ink: '#3E2F14',
    tint: '#E9D6A6',
  },
  dark: {
    stops: ['#6E5628', '#A98A4A', '#5C4720'],
    text: '#6E5628',
    solid: '#7E6531',
    ink: '#F3EBD5',
    tint: '#6E5628',
  },
};

/**
 * Which brass a token takes. THE PREDICATE IS THE TOKEN'S OWN INK POLE, never a
 * stem list (spec §5): a stem list desyncs the moment a token is re-hexed, and
 * re-hexing the five proposed tokens is exactly what is expected to happen next.
 */
export function brassFor(token) {
  return inkIsDark(token) ? BRASS.dark : BRASS.light;
}

/** Is this token's ink the dark end? True means a LIGHT field: the inverted finish. */
export function inkIsDark(token) {
  return parseInt(token.ink.slice(1, 3), 16) < 128;
}

/**
 * Stems whose triple Reyner has ruled — ALL TEN as of 2026-08-15.
 *
 * It is still computed rather than replaced by the number 10, because the flag is
 * the fact and this is a view of it: an eleventh token, or one flipped back, has
 * to show up here and in `tokenApproved` without anyone remembering to.
 */
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
 * Is this card shippable to a user, colour-wise?
 *
 * TRUE FOR ALL TEN as of 2026-08-15, and the gate stays anyway. It used to be the
 * thing standing between the card and a route — five of ten would have shipped an
 * unapproved colour — and it is now a guard with nothing to catch. That is the
 * same shape as `AA_EXEMPT` emptying: the mechanism is what makes the next
 * addition safe, and deleting it would mean an eleventh archetype reaches a user
 * before anyone has ruled its colour.
 */
export function tokenApproved(stem) {
  return tokenFor(stem).approved;
}
