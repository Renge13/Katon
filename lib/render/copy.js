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
};
