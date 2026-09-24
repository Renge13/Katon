import 'server-only';
// ============================================================
// lib/pair/servePdf.js — GET /api/pair/[id]/pdf
// ============================================================
// Prompt Y-3 commit 5. `lib/deliver/handlers.js#serveDeliveryPdf` line for line,
// on the pair store. Every difference is the store or the document; nothing about
// the policy changes, and where a sentence below reads like the mirror's it is
// because the reasoning is the mirror's and restating it differently would be
// inventing a second policy.
//
// ══ IT NEVER RENDERS. THIS IS THE WHOLE DESIGN. ════════════
// The PDF reads `render_cache` and refuses when there is no row. A floored pair has
// no row by rule 16 - `persistRendered` refuses `module_assembly` at the single
// door - so a floor-served reader gets 409 here rather than a document, and her
// next page load retries the provider. A PDF that started its own render would be a
// second reading wearing the first one's name, and it would be the one she keeps.
//
// ══ THE `server-only` SEAM, AND WHY THE COMPOSER IS NOT IMPORTED HERE ══
// The mirror's handler documents it: a module that imports the PDF BUILDER cannot
// also import `render/cache.js` under `--conditions=react-server`, and one that
// imports the cache cannot import the builder. So the route file wires the builder
// in and this module takes it as `renderPdf`. It is also the right seam on its own
// terms - the security-critical half of this file is the gate, and the gate is
// testable without building a PDF.
// ============================================================

import { getPair } from '../pairStore.js';
import { calculateBaziChart } from '../bazi/buildChart.js';
import { buildPairSemantic } from '../semantic/pair.js';
import { cacheKey } from '../semantic/index.js';
import { readCache } from '../render/cache.js';
import { priceFor } from '../pricing.js';
import { NOT_PAID, NOT_RENDERED } from '../deliver/handlers.js';
import { consume, clientIp } from '../ratelimit.js';
import { admit } from './serveReading.js';

const reply = (body, status = 200, headers = {}) => Response.json(body, { status, headers });

/** Rebuild one person's chart from the pair's own columns. `serveReading`'s. */
const chartFrom = (birthDate, birthTime, termSide, gender) => calculateBaziChart({
  birthDate,
  birthTime: birthTime ? String(birthTime).slice(0, 5) : null,
  termSide,
  gender,
});

/**
 * GET /api/pair/[id]/pdf — the compat document.
 *
 * @param {Request} request
 * @param {string} id the pair's bearer-token id
 * @param {Object} deps
 * @param {Function} deps.renderPdf `buildPairPdf`, injected by the route file
 * @returns {Promise<Response>}
 */
/** The report page's own door, the one `settlePair` warms through as well. */
const reportDoor = async (request, id) => {
  const { servePairReading } = await import('./serveReading.js');
  return servePairReading(request, id);
};

export async function servePairPdf(request, id, { renderPdf, warm = reportDoor }) {
  // THE SAME BEARER AND THE SAME REFUSAL as the report. Imported rather than
  // rebuilt: two definitions of who may read a pair is two answers to one question,
  // and the one that drifts is the one nobody is looking at.
  const { refusal, headers } = await admit(request);
  if (refusal) return refusal;

  const row = await getPair(id);
  if (!row) return reply({ error: 'not_found' }, 404, headers);

  // ── UNPAID: 402, AND NOT ONE DERIVED BYTE ──────────────────
  // X-b1 ruling 3. No chart is built, so there are no hanzi and no archetype names
  // to leak - the same shape `servePairFacts` and `servePairReading` return, at 402
  // because this endpoint delivers an artifact rather than describing a product.
  // The body is the price and the sku, which is what an unpaid caller may know.
  if (row.paid !== true) {
    return reply(
      { status: NOT_PAID, sku: row.sku ?? 'compat', price: priceFor(row.sku ?? 'compat') },
      402,
      headers,
    );
  }

  // RATE-LIMITED AFTER THE GATE AND BEFORE THE WORK. A compat document is TWO full
  // renders - the fixed point needs a rebuild - over six sections and two charts, so
  // a valid token in a loop is a CPU cost rather than a harvesting one. Rule 19's
  // reasoning, on the one pair endpoint whose cost is compute. `deliver_pdf` is
  // shared with the mirror's PDF deliberately: it is one machine's CPU, and two
  // buckets would let a caller spend it twice.
  const gate = await consume('deliver_pdf', { ip: clientIp(request) });
  if (!gate.allowed) {
    return reply({ error: 'rate_limited', retry_after: gate.retryAfter }, 429, headers);
  }

  // FROM THE PAIR'S OWN BIRTH COLUMNS, never from a `reading` row. Person B is not a
  // reading and has no mirror (ruled 2026-09-07); the pair row is the only place
  // these two births exist together.
  const a = chartFrom(row.a_birth_date, row.a_birth_time, row.a_term_side, row.a_gender);
  const b = chartFrom(row.b_birth_date, row.b_birth_time, row.b_term_side, row.b_gender);
  const semanticJson = buildPairSemantic(a, b);

  // THE KEY IS RECOMPUTED, NOT READ OFF `row.cache_key`. The mirror's reason holds
  // here too: `ENGINE_VERSION` is hashed in, so the stored column names last
  // engine's text, and the consequence specific to a PDF is that the prose and the
  // two chart pages would come from different engine versions in one document.
  //
  // `includeUnvalidated: false`: a row that never passed Stage 6 is not a reading,
  // and a paid document is the last place to relax that.
  // ── ~~After a bump this refuses until the reading is re-rendered~~ ─────
  // CORRECTED 2026-09-24: a miss is WARMED THROUGH THE REPORT DOOR, once. Reyner's
  // own paid pair answered 409 on production - her reading was cached under an
  // older ENGINE_VERSION, and only the REPORT page renders, so a pre-bump buyer who
  // tapped "Unduh PDF" first got JSON. The PDF still renders NO PROSE OF ITS OWN
  // and still never mixes engine versions: it asks the REPORT page's own door
  // (`servePairReading`), which renders, runs Stage 6 and persists exactly as a page load
  // would, then prints the CURRENT-key row that door cached. A floor is never
  // persisted (rule 16), so a warm that floors still ends in 409 and her next load
  // retries. `warm` is injectable only so a spec can stand in for the door.
  const key = cacheKey(semanticJson);
  let rendered = await readCache(key, { includeUnvalidated: false });
  if (!rendered) {
    await warm(request, id);
    rendered = await readCache(key, { includeUnvalidated: false });
  }
  // ── NO ROW MEANS 409, AND A FLOORED PAIR HAS NO ROW ────────
  // Not a 500 and not a render. Rule 16 keeps floors out of the cache, so this is
  // the ordinary answer for a reader whose render failed - and her next page load
  // retries the provider, which a stored floor would have prevented forever.
  if (!rendered) return reply({ error: NOT_RENDERED }, 409, headers);

  // NO BYTE CACHE. The mirror's decision and its reasons: the document is
  // deterministic given the cache row, so rebuilding is correct, and a second
  // storage layer for paid artifacts is a separate call with its own retention
  // question. The rate limit above is what makes rebuilding affordable.
  const { buffer } = await renderPdf({
    chartA: a,
    chartB: b,
    semanticJson,
    rendered,
    // The two births, exactly as the report header shows them - date and gender,
    // nothing else. `servePairReading`'s `pair` block, built from the same columns.
    pair: {
      a: { date: row.a_birth_date, gender: row.a_gender ?? null },
      b: { date: row.b_birth_date, gender: row.b_gender ?? null },
    },
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/pdf',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="katon-pasangan-${id}.pdf"`,
      // A paid artifact is per-buyer and must not sit in a shared cache.
      'Cache-Control': 'private, no-store',
    },
  });
}
