import 'server-only';
// ============================================================
// The Rp 19.000 delivery — the card and the PDF, one purchase, one gate
// ============================================================
// PROMPT M BUILD STEP 6: "wire to checkout, with the card, as one delivery."
// Promotion precondition 2 is what this closes: *"the Rp 19.000 has a deliverable
// that is NOT the free mirror - the card + PDF exist and ship"*.
//
// ── ONE GATE, AND IT IS THE ONLY ONE ──────────────────────
// Rule 18: `paid` flips only in the verified Xendit webhook, never from a client
// path. Every function here reads `row.paid === true` and nothing else grants
// access - no header, no query flag, no environment variable. The
// NEXT_PUBLIC_FREE_FULL_READING lesson is in CLAUDE.md's SUPERSEDED list and it is
// the reason there is no test ungate in this file: that flag was set in Vercel and
// production served the paid product to everyone.
//
// ── ONE DELIVERY, TWO ARTIFACTS, ONE READINESS TEST ───────
// The card and the PDF are different mechanisms - the card is a client-side capture
// of a React component (`components/cards/exportCards.js`, html-to-image, and prompt
// M explicitly rules OUT embedding it in the PDF so the document ships independent
// of that path), while the PDF is server-rendered bytes. What makes them ONE
// delivery is that they are bought together, gated together, and refused together.
// The manifest below is that single answer, so the client renders one surface with
// two downloads rather than two features that can disagree about whether the buyer
// paid.
//
// ── WHY BOTH ARE REFUSED UNTIL THE MIRROR IS PROMOTED, AND IT IS NOT A LIMITATION ──
// This is the sequencing constraint the route header already states: *"retiring the
// gate and replacing the unvalidated prose are the same act... there is no ordering
// in which one lands without the other."* Both artifacts read the NEW pipeline:
//
//   the PDF   `rendered.blocks` from `render_cache`, VERBATIM. A legacy funnel row
//             has no render_cache row at all, so there is nothing determinate to
//             print. The alternative is a PDF built on the deterministic FLOOR, and
//             a paid artifact built on module assembly is not the product - the
//             floor is fluent Indonesian and reads like the real thing, which is
//             exactly why shipping one unlabelled would not be noticed.
//   the card  `buildCardData` needs only chart + semantic JSON, so its data is
//             available TODAY. It is refused anyway, and for a different reason:
//             two archetype name sets are live and disagree on five of ten
//             (PROGRESS.md, LIVE STATE, divergence 3). The card would name her
//             Bambu while the reading beside it names her Akar.
//
// So the readiness predicate is "is this reading served from the mirror pipeline",
// and `row.cache_key` is that fact - `setReadingCacheKey` is called by the mirror
// serve path and by nothing else, and PROGRESS records that "legacy funnel rows
// never call this and keep a null cache_key". The condition is therefore CHECKED
// rather than described in a doc, and the day promotion lands it starts passing with
// no edit here.
//
// ── WHAT THIS FILE DELIBERATELY DOES NOT DO ───────────────
// It does not touch `INVOICE_DESCRIPTION`. That string is on the Xendit checkout
// page and on the buyer's statement line, and its own docblock says it names the
// card and PDF again "when paid really is card + PDF". Today the paid path still
// delivers the 7-beat deep read, so renaming it now would charge for one thing and
// deliver another - the merchant-compliance problem that comment exists to record,
// reintroduced. It moves in the promotion commit, beside `/harga` and `/syarat`,
// which is where precondition 2's copy half lives.
// ============================================================

import { getReading } from '../readingStore.js';
import { semanticFromRow } from '../mirror/reading.js';
import { readCache } from '../render/cache.js';
import { buildCardData } from '../card/cardData.js';
import { consume, clientIp } from '../ratelimit.js';

// PLAIN WEB `Response`, NOT `NextResponse` - and not `lib/http.js`, which wraps it.
// Next 15 accepts either, and only one of them is importable outside a bundler:
// `next/server` has no `exports` map, so raw node ESM cannot resolve it and the spec
// for this file could not load. Same reasoning and same two-line helper as
// `lib/mirror/handlers.js`, whose header states it; duplicated rather than imported
// because importing `lib/http.js` is the thing that breaks.
const reply = (body, status = 200) => Response.json(body, { status });
const notFound = () => reply({ error: 'not_found' }, 404);

/**
 * What Rp 19.000 buys. One list, so the manifest, the client surface and any later
 * receipt cannot disagree about what was sold.
 */
export const DELIVERY_ITEMS = ['card', 'pdf'];

/** Refusal reasons. Named, because "not ready" tells an operator nothing. */
export const NOT_PAID = 'not_paid';
export const LEGACY_READING = 'legacy_reading';
export const NOT_RENDERED = 'reading_not_rendered';

/**
 * Is this reading served from the mirror pipeline?
 *
 * The one predicate both artifacts share. See the header for why a legacy row is
 * refused rather than served a floor-sourced document or a card that contradicts the
 * reading beside it.
 *
 * @param {Object} row a `reading` row
 * @returns {{ready: boolean, reason: string|null}}
 */
export function deliverable(row) {
  if (row?.paid !== true) return { ready: false, reason: NOT_PAID };
  if (!row.cache_key) return { ready: false, reason: LEGACY_READING };
  return { ready: true, reason: null };
}

/**
 * GET /api/deliver/[id] — what this purchase includes, and whether it is ready.
 *
 * ANSWERS FOR AN UNPAID READING TOO, with `paid: false` and no artifact data. The
 * paywall needs to be able to describe the offer before it is bought, and a 404
 * before payment would make the offer undescribable from the same endpoint that
 * fulfils it. Nothing here is paid content: it is a list of two item names and a
 * boolean.
 */
export async function serveDeliveryManifest(id) {
  const row = await getReading(id);
  if (!row) return notFound();

  const { ready, reason } = deliverable(row);
  return reply({
    token: id,
    paid: row.paid === true,
    items: DELIVERY_ITEMS.map((item) => ({
      item,
      // Both items resolve from the SAME predicate. If they ever diverge, they stop
      // being one delivery, and that is a product decision rather than a refactor.
      ready,
      reason,
    })),
  });
}

/**
 * GET /api/deliver/[id]/card — the card's data, gated.
 *
 * THE SERVER SENDS DATA AND THE CLIENT DRAWS THE CARD, which is not a compromise:
 * `components/cards/exportCards.js` captures a live DOM node with html-to-image at
 * ruled pixel sizes, and there is no headless browser in this deployment to do it
 * server-side. What matters for rule 18 is that the DATA does not leave the server
 * before payment, and that is what this gate is.
 */
export async function serveDeliveryCard(id) {
  const row = await getReading(id);
  if (!row) return notFound();

  const { ready, reason } = deliverable(row);
  if (!ready) return reply({ error: reason }, reason === NOT_PAID ? 402 : 409);

  const { chart, semanticJson } = semanticFromRow(row);
  return reply({
    token: id,
    card: buildCardData({
      chart,
      semanticJson,
      birthDate: row.birth_date,
      gender: row.gender || null,
    }),
  });
}

/**
 * GET /api/deliver/[id]/pdf — the Complete Edition, gated.
 *
 * @param {Request} request for the rate-limit identity
 * @param {string} id
 * @param {Object} deps
 * @param {Function} deps.renderPdf `buildCompleteEditionPdf`, INJECTED.
 *
 * ── WHY THE RENDERER IS INJECTED, AND IT IS NOT FOR MOCKING ──
 * `@react-pdf/renderer` needs the CLIENT React build, and every route-handler test
 * in this repo runs under `--conditions=react-server`, where React resolves to its
 * react-server entry and the reconciler dies. So a test that imports the PDF
 * builder cannot also import `render/cache.js`, and one that imports the cache
 * cannot import the builder. Inside Next both coexist - `server-only` is satisfied
 * by the bundler and a Node route is not an RSC - so the route file wires them and
 * this module stays testable under the condition its siblings use.
 *
 * It is also the right seam on its own terms: the security-critical half of this
 * function is the gate, and the gate is now testable without rendering a PDF. The
 * bytes have their own suite (`tests/pdf-document.spec.mjs`, plain node).
 */
export async function serveDeliveryPdf(request, id, { renderPdf }) {
  const row = await getReading(id);
  if (!row) return notFound();

  const { ready, reason } = deliverable(row);
  if (!ready) return reply({ error: reason }, reason === NOT_PAID ? 402 : 409);

  // RATE-LIMITED AFTER THE GATE AND BEFORE THE WORK. A Complete Edition costs two
  // full document renders - the fixed point needs a rebuild - so a valid token in a
  // loop is a CPU cost, not a harvesting one. Rule 19's ceiling reasoning applied to
  // the one endpoint here whose cost is compute rather than content.
  const gate = await consume('deliver_pdf', { ip: clientIp(request) });
  if (!gate.allowed) {
    return reply({ error: 'rate_limited', retry_after: gate.retryAfter }, 429);
  }

  const { chart, semanticJson, key } = semanticFromRow(row);
  // `includeUnvalidated: false`: a row that never passed Stage 6 is not a reading,
  // and a paid document is the last place to relax that. Same argument, same flag,
  // as `scripts/dump-render-cache.mjs`.
  //
  // THE KEY IS RECOMPUTED, NOT READ OFF THE ROW. `semanticFromRow` explains why in
  // general - ENGINE_VERSION is hashed in, so the stored column names last engine's
  // text. The consequence specific to a PDF is that the prose and the chart page
  // would otherwise come from two different engine versions in one document. After
  // a bump this refuses until the reading is re-rendered, which is the honest
  // outcome rather than a mixed-version artifact.
  const rendered = await readCache(key, { includeUnvalidated: false });
  if (!rendered) return reply({ error: NOT_RENDERED }, 409);

  // NO BYTE CACHE, and that is a decision rather than an omission: the document is
  // deterministic given the cache row, so rebuilding is correct, and a second
  // storage layer for paid artifacts is a separate call with its own retention
  // question. The rate limit above is what makes rebuilding affordable.
  const { buffer } = await renderPdf({ chart, semanticJson, rendered });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="katon-${id}.pdf"`,
      // A paid artifact is per-buyer and must not sit in a shared cache.
      'Cache-Control': 'private, no-store',
    },
  });
}
