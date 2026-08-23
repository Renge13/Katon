// ============================================================
// Stage 5 — chrome copy
// ============================================================
// Rule 20: ONE VOICE EVERYWHERE, INCLUDING CHROME. These strings are user-facing
// and sit on the same audit surface as the reading itself. scripts/check-copy.js
// walks this object.
//
// Kept as a bank rather than inlined at a call site for the same reason the
// master prompt is a file: a string that lives where it is used is a string
// nobody audits.
// ============================================================

export const RENDER_COPY = {
  /**
   * The loading state.
   *
   * NEVER advertise the AI (decided, PROGRESS). Wording that names a model, or
   * "sedang menulis", invites exactly the "it just rephrased my input" suspicion
   * the cold-read analysis found to be the product's main credibility risk. The
   * true statement is also the reassuring one: the chart is being computed, and
   * that part is deterministic and is the moat.
   */
  loading: 'Menghitung bagan kelahiranmu',

  /**
   * ── RULED BY REYNER, 2026-08-21. His words now, not a proposal. ──
   * The module-assembly floor's opening. Added 2026-08-21 because the floor was
   * opening with TWO BARE NOUN-PHRASES and no verb:
   *
   *     "Matahari (The Sun)."  "Api (Fire)."
   *
   * Reyner ruled that shape UNSELLABLE as-is. It satisfies
   * `opening.archetype_missing` - the name IS present - and still reads as a data
   * dump, which is why that check is recorded as too weak in PROGRESS.
   *
   * `assembleFallback`'s standing contract is that it authors NOTHING: every
   * Indonesian word comes from glossary.json, and the file contributes punctuation
   * and ordering only. Joining two labels into one clause needs a CONNECTIVE, which
   * is new user-facing Indonesian, which is Reyner's alone (CLAUDE.md rule 20). So
   * the words live here, in the audited bank that `scripts/check-copy.js` walks,
   * rather than inline at the call site where nobody would ever re-read them.
   *
   * IT WAS PATTERNED ON PROSE REYNER HAD ALREADY SEEN, not invented from nothing.
   * Chart 13's model opening in `docs/qa/2026-08-21-renders.md` reads "Kamu adalah
   * Bambu (The Bamboo) dengan batang hari Kayu." - so `Kamu adalah X dengan unsur Y`
   * borrowed a frame from a reading that was rendered and read. Reyner ruled that
   * proposal AS WRITTEN on 2026-08-21, so these are his strings and the register
   * question is closed.
   *
   * Composed as: `${lead} <Arketipe> (<English>) ${join} <Elemen>.`
   *
   *     Kamu adalah Matahari (The Sun) dengan unsur Api.
   *
   * THE ELEMENT IS DELIBERATELY UNBRACKETED HERE. Rule 23's ruled scope binds
   * Aspek, Bintang and Arketipe and explicitly NOT Elemen - Reyner: "Pilar and
   * Elemen should remain unbracketed to avoid visual clutter" - and the floor had
   * been bracketing it. Joining the clause and dropping that bracket are one edit.
   *
   * If Reyner rewrites either string, nothing else changes: the floor recomposes.
   */
  floorIdentity: {
    lead: 'Kamu adalah',
    join: 'dengan unsur',
  },

  /**
   * ── THE PDF's DISCLAIMER LINE. RULED BY REYNER 2026-08-22, his exact words. ──
   *
   * IT REPLACES A WHOLE PAGE. The Complete Edition used to end on a colophon page
   * printing `SITE_COPY.syarat.limits` - rule 25 as a user-facing disclaimer, three
   * paragraphs of it. Reyner killed the page:
   *
   *   "Ending a paid Rp 19.000 personal reading with copy-pasted Terms of Service
   *    text kills the product experience right at the finish line."
   *
   * So the obligation stays and the page goes: one 8pt line at the foot of the chart
   * page carries rule 25 instead. Rule 25 is satisfied either way - no medical,
   * financial or legal advice, and timing is never prophecy - and the reading now
   * ends on the reading.
   *
   * ── WHY IT LIVES IN THIS BANK AND NOT IN lib/pdf/document.js ──
   * This file is Stage 5's chrome bank and a PDF is not Stage 5, which is a fair
   * objection. It wins anyway on the file's own stated reason: `scripts/check-copy.js`
   * walks RENDER_COPY, so a string here is swept for em-dashes, curly quotes and the
   * banned tokens on every run, and *"a string that lives where it is used is a string
   * nobody audits."* A disclaimer inlined in a React tree gets audited once, by hand,
   * by whoever wrote it.
   *
   * SWEPT AND CLEAN, verified 2026-08-22: no em-dash, no curly quote, no banned
   * token. `npm run check:copy` is the standing check.
   *
   * ── THE FALLBACK REYNER SUPPLIED IS UNSHIPPABLE AS WRITTEN ──
   * He also gave a closing BLOCK to use only if a closing block is ever forced -
   * heading `Catatan Akhir`, body:
   *
   *   "Peta ini membaca pola dan potensi, bukan garis takdir yang kaku. Apa yang
   *    kamu baca di sini adalah bahan cermin[EM DASH]pada akhirnya, setiap keputusan
   *    dan langkah nyata di luar sana tetap sepenuhnya milikmu."
   *
   * IT CONTAINS AN EM-DASH, which rule 20 bans outright for user-facing strings and
   * which `style.typography` counts. It is recorded in PROGRESS rather than stored
   * here, deliberately: putting it in this bank would fail `check:copy` on the next
   * run, and "temporarily" exempting it is how a banned character ships. If the
   * fallback is ever needed, the em-dash needs replacing first and that is Reyner's
   * call, not a search-and-replace.
   */
  pdfDisclaimer: 'Katon adalah cermin refleksi diri. Bacaan ini memetakan pola, bukan nasihat medis, keuangan, atau hukum.',
};
