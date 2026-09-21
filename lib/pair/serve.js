import 'server-only';
// ============================================================
// lib/pair/serve.js — GET /api/pair/[id], the gated compat facts
// ============================================================
// THE DETERMINISTIC FLOOR OF THE COMPAT REPORT, and the seam X-b2 hangs the
// renderer off. Facts only: rule 14 gives the engine all facts, hierarchy and
// structure and the LLM only words, so nothing here carries a sentence.
//
// ══ THE GATE ═══════════════════════════════════════════════
// Ruling 3 (Reyner, 2026-09-07 night): "No free P0 reading, no named relation
// tease, and no Gemini render before payment."
//
// So UNPAID gets the sku and the price and nothing else - not an archetype name,
// not a relation, not a hanzi. That is stricter than it looks: the P0 tease this
// supersedes was going to show exactly "two archetype faces plus ONE named
// relational fact", so an archetype in an unpaid body would be the superseded
// design leaking back in one field at a time.
//
// It still ANSWERS for an unpaid pair rather than 404ing, for the same reason
// `lib/deliver/handlers.js#serveDeliveryManifest` does: a paywall has to be able
// to describe the offer from the endpoint that fulfils it, and `status` +
// `sku` + `price` is a description of a product, not a piece of a reading.
//
// `paid` is read from the STORED row and nothing else. Rule 18: it flips only in
// the verified provider notification, and this handler takes no argument that could
// assert payment.
//
// ══ BOTH CHARTS ARE COMPUTED IN MEMORY ═════════════════════
// From the pair's OWN birth columns, via `calculateBaziChart`, never via a
// reading row. Person B has no reading row and must never get one: a reading row
// is a reachable `/r/<token>` URL, so minting one to "reuse the pipeline" would
// publish a reading of person B. The spec asserts the reading table is untouched
// across two serves.
//
// ══ NO BIRTH DATA GOES OUT ═════════════════════════════════
// Only DERIVED facts leave. The row holds `a_birth_date`, `a_birth_time`,
// `b_birth_date`, `b_birth_time` and `email`, so this is a live leak surface and
// the spec scans the serialised body for every one of those literal values, paid
// and unpaid. A's birth data is not secret from A, but this endpoint cannot know
// its caller is A, and echoing it back serves nothing.
// ============================================================

import { calculateBaziChart } from '../bazi/buildChart.js';
import { GLOSSARY } from '../semantic/glossary.js';
import { mainProfile } from '../bazi/mainProfile.js';
import { getPair } from '../pairStore.js';
import { priceFor } from '../pricing.js';
import { NOT_PAID } from '../deliver/handlers.js';

import { compatBranchRelations } from '../compat/branchRelations.js';
import { compatComplementarity } from '../compat/complementarity.js';
import { compatStemRelation } from '../compat/stemRelation.js';
import { compatTemperament } from '../compat/temperament.js';
import { compatPullFit } from '../compat/pullFit.js';

const reply = (body, status = 200) => Response.json(body, { status });

/**
 * One person's identity facts: the archetype, and the dominant Aspek.
 *
 * Ruling P4 requires the customer to get BOTH "the factual identity of each
 * person's dominant Aspek" and the relationship badge, so this is the first half
 * of that and `temperament` is the second.
 *
 * `name_en` rides along per rule 23's EN display layer (archetype names carry an
 * English pair). No birth data, no pillars beyond the day stem the archetype IS.
 */
function identityOf(chart) {
  const dm = chart.day.stem;
  const profile = mainProfile(chart, { silent: true });
  return {
    archetype: {
      stem: dm,
      name_id: GLOSSARY.arketipe[dm]?.name_id ?? null,
      name_en: GLOSSARY.arketipe[dm]?.name_en ?? null,
    },
    main_profile: {
      god: profile.hanzi,
      element: profile.element,
    },
  };
}

/** Rebuild one person's chart from the pair's own columns. */
const chartFrom = (birthDate, birthTime, termSide, gender) => calculateBaziChart({
  birthDate,
  // Postgres returns a `time` column as `HH:MM:SS`; the calculator wants HH:MM,
  // and the dev in-memory store holds exactly what was written. Slicing to five
  // characters handles both without caring which backend answered.
  birthTime: birthTime ? String(birthTime).slice(0, 5) : null,
  termSide,
  gender,
});

/**
 * GET /api/pair/[id] — the compat report's facts, gated on payment.
 *
 * @param {string} id the pair's bearer-token id
 * @returns {Promise<Response>} 200 `{status:'not_paid',sku,price}`
 *   | 200 `{status:'paid',facts}` | 404
 */
export async function servePairFacts(id) {
  const row = await getPair(id);
  if (!row) return reply({ error: 'not_found' }, 404);

  if (row.paid !== true) {
    // NOTHING about either chart. See the header: an archetype here would be the
    // superseded P0 tease returning one field at a time.
    return reply({ status: NOT_PAID, sku: row.sku ?? 'compat', price: priceFor(row.sku ?? 'compat') });
  }

  const a = chartFrom(row.a_birth_date, row.a_birth_time, row.a_term_side, row.a_gender);
  const b = chartFrom(row.b_birth_date, row.b_birth_time, row.b_term_side, row.b_gender);

  // The five modules, in the order the report reads them: who each person is,
  // then how the two charts meet. Each is a pure function over the two charts and
  // none of them touches the store.
  const branchRelations = compatBranchRelations(a, b);
  const complementarity = compatComplementarity(a, b);
  const stemRelation = compatStemRelation(a, b);

  return reply({
    status: 'paid',
    facts: {
      a: identityOf(a),
      b: identityOf(b),
      branchRelations,
      complementarity,
      stemRelation,
      temperament: compatTemperament(a, b),
      // Consumes the three above rather than recomputing them, which is also what
      // makes the quadrant reproducible from the same body a client received.
      pullFit: compatPullFit(branchRelations, complementarity, stemRelation),
    },
  });
}
