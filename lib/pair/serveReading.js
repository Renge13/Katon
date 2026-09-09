import 'server-only';
// ============================================================
// lib/pair/serveReading.js — GET /api/pair/[id]/reading
// ============================================================
// The paid compat report: facts AND prose. Same pipeline as the mirror -
// `renderReading` -> Gemini -> Stage 6 -> `render_cache` -> floor on refusal -
// consuming the pair semantic JSON as a second instance of one contract.
//
// ══ THE GATE IS servePairFacts's, DELIBERATELY THE SAME ═════
// Unpaid gets `{ status: 'not_paid', sku, price }` and NOTHING else - not an
// archetype, not a relation, no hanzi. Ruling 3 (2026-09-07): no free compat
// result and no Gemini render before payment. **The render is not merely hidden
// from an unpaid caller; it is never STARTED**, so an unpaid request cannot spend
// a provider call.
//
// ══ RULE 16: THE FLOOR IS SERVED AND NEVER STORED ══════════
// `persistRendered` is the single door and it refuses `module_assembly` itself,
// so this path cannot store a floor even by mistake. That matters more here than
// on the mirror: a stored floor would cost a PAYING customer their real reading
// permanently, because the next request is a cache hit and the chain never runs
// again until ENGINE_VERSION moves.
//
// ══ WHAT THIS COMMIT DOES NOT HAVE, AND IT IS STATED HERE ══
// **The compat Stage 6 checks are NOT in the pipeline yet.** Prompt X-b2's
// commit 3 adds `both_named`, `no_verdict` and `reframe_present`, and it is
// BLOCKED: each rejecting check must first be shown red on a REAL Gemini render,
// and no `GEMINI_API_KEY` was available. So a pair render is validated today by
// the GENERIC Stage 6 checks only - the shape, coverage, style and forbidden
// content rules that apply to any reading.
//
// The consequence, plainly: **nothing currently enforces that both people are
// named in the opening, or that the P2 reframe is present when the flag is
// raised.** Both are ruled requirements. Until commit 3 lands, this endpoint must
// not be put in front of a reader. There is no UI for it, which is what makes
// that acceptable rather than a live defect.
// ============================================================

import { calculateBaziChart } from '../bazi/buildChart.js';
import { buildPairSemantic } from '../semantic/pair.js';
import { GLOSSARY } from '../semantic/glossary.js';
import { renderReading, persistRendered } from '../render/index.js';
import { getPair, setPairCacheKey } from '../pairStore.js';
import { priceFor } from '../pricing.js';
import { NOT_PAID } from '../deliver/handlers.js';
// The floor policy is the mirror's and is imported rather than restated: two
// definitions of 'when is a floor too broken to serve' is two answers to one
// question, and this one is about rule 25 rather than about a product.
import { floorRefusalReason } from '../mirror/handlers.js';
import { consume, clientIp } from '../ratelimit.js';
import { resolveSession, sessionCookieHeader } from '../mirror/session.js';

const reply = (body, status = 200, headers = {}) => Response.json(body, { status, headers });

/**
 * Session and rate limit, on the same dimensions as the mirror GET.
 *
 * `pair_serve` rather than `mirror_serve`: this is the harvesting surface for a
 * different product, and a compat buyer re-reading her report must not be able
 * to exhaust a budget the mirror shares, or vice versa.
 */
async function admit(request) {
  const { sessionId, isNew } = resolveSession(request);
  const headers = isNew ? { 'set-cookie': sessionCookieHeader(sessionId) } : {};
  const verdict = await consume('pair_serve', { ip: clientIp(request), session: sessionId });
  if (!verdict.allowed) return { refusal: reply({ error: verdict.reason }, 429, headers) };
  return { refusal: null, headers };
}

/** Rebuild one person's chart from the pair's own columns. See serve.js. */
const chartFrom = (birthDate, birthTime, termSide, gender) => calculateBaziChart({
  birthDate,
  birthTime: birthTime ? String(birthTime).slice(0, 5) : null,
  termSide,
  gender,
});

/**
 * GET /api/pair/[id]/reading — the paid compat report.
 *
 * @param {Request} request
 * @param {string} id the pair's bearer-token id
 * @param {Object} [options] `renderOptions` is passed to renderReading, which is
 *   how the spec injects a provider stub without this module knowing about tests.
 * @returns {Promise<Response>}
 */
/**
 * A `kompatibilitas` cell's `name_id`, or null.
 *
 * Null rather than the key, deliberately: the caller renders no label at all for
 * a missing cell, which reads as an absence. Falling back to the key is how
 * `contrasting` reached a reader in the first place.
 */
const namedOr = (key) => GLOSSARY.kompatibilitas?.[key]?.name_id ?? null;

export async function servePairReading(request, id, { renderOptions = {} } = {}) {
  const { refusal, headers } = await admit(request);
  if (refusal) return refusal;

  const row = await getPair(id);
  if (!row) return reply({ error: 'not_found' }, 404, headers);

  if (row.paid !== true) {
    // Identical to servePairFacts. No chart is built and NO RENDER IS STARTED.
    return reply(
      { status: NOT_PAID, sku: row.sku ?? 'compat', price: priceFor(row.sku ?? 'compat') },
      200,
      headers,
    );
  }

  const a = chartFrom(row.a_birth_date, row.a_birth_time, row.a_term_side, row.a_gender);
  const b = chartFrom(row.b_birth_date, row.b_birth_time, row.b_term_side, row.b_gender);
  const semanticJson = buildPairSemantic(a, b);

  const rendered = await renderReading(semanticJson, renderOptions);

  // ── THE FLOOR GATE. The mirror's policy, imported rather than restated. ──
  // When the FLOOR itself hard-fails Stage 6 a 503 is the honest answer: there
  // is nothing beneath the floor, so the choice is between no reading and a
  // reading that breaks a rule. Failing the gate must never route AROUND it.
  const floorGate = floorRefusalReason(rendered, semanticJson);
  if (floorGate) return reply({ error: floorGate }, 503, headers);

  // ── AND A SECOND REFUSAL, BECAUSE THE FIRST DOES NOT COVER THIS ──
  // **A PLACEHOLDER MUST NEVER REACH A PAYING CUSTOMER.** While
  // `GLOSSARY.kompatibilitas` is unruled, the floor is assembled out of
  // `@@UNRULED: kompat_*@@` strings, and I checked whether the floor gate above
  // catches that. **IT DOES NOT**, and the measurement is why this exists:
  //
  //     validateRendering(floor, pairSemantic)
  //       ok:   false
  //       hard: false          <- so floorRefusalReason returns null
  //       flag  coverage.slot_filling
  //       soft  style.code_leak   "@@UNRULED: kompat_p0_names_name@@ ..."
  //
  // Both findings are SOFT, and soft findings keep serving by design - the rule
  // is that a hedge count should not pull a reading. So the floor would have
  // been served, with HTTP 200, to someone who had paid: a page of placeholders.
  //
  // This is a SERVE-BOUNDARY refusal in the same class as the floor gate, not a
  // Stage 6 change: it adds no check to `validateRendering`, moves no
  // `STAGE6_VERSION`, and touches nothing the mirror renders. It is unconditional
  // rather than pair-only in spirit - a sentinel in prose is never servable - and
  // it becomes unreachable the moment Reyner rules the glossary, at which point
  // it costs one comparison per serve and keeps guarding the next unruled cell.
  const prose = JSON.stringify({ blocks: rendered.blocks, penutup: rendered.penutup });
  if (prose.includes('@@UNRULED')) {
    return reply({ error: 'unruled_content_in_reading' }, 503, headers);
  }

  // Rule 16, through the single door. `persistRendered` returns false for a
  // floor rather than throwing, because an outage is an ordinary event on this
  // path. Only a real, gate-passing render is stored, and only then does the row
  // learn its cache key.
  if (!rendered.cached) {
    const stored = await persistRendered(rendered, semanticJson);
    if (stored && row.cache_key !== rendered.cache_key) {
      await setPairCacheKey(id, rendered.cache_key);
    }
  }

  return reply({
    status: 'paid',
    // `served_from` is the passive detector of a dead provider, exactly as
    // `mirror_served`'s source field is: a run of `floor` here means the chain
    // is failing on every call with nothing else saying so.
    served_from: rendered.cached ? 'cache' : (rendered.source === 'module_assembly' ? 'floor' : 'render'),
    // ── NAMES, NOT KEYS. A PAYING CUSTOMER SAW THE KEYS. ──────
    // This sent `semanticJson.core.pattern` and `.quadrant` - the engine's own
    // identifiers, `contrasting` and `q4` - and `PasanganReport` labelled the P4
    // and P5 blocks from them believing they were glossary names. On 2026-09-08
    // that reached a real reader who had paid Rp 39.000.
    //
    // RESOLVED HERE, ON THE SERVER, and not in the component: rule 14 puts every
    // name in the engine, the glossary is the only place a name comes from, and
    // **a raw key must never leave the server in a field a client is expected to
    // display.** Fixing it client-side would have left the next consumer - a PDF,
    // an email, a share card - to make the same mistake independently.
    //
    // `namedOr` throws nothing and invents nothing: a key with no cell yields
    // null, which renders as no label, rather than printing the key. A missing
    // cell is a content gap and a content gap must look like an absence.
    // ── THE TWO BIRTHS, FOR THE HEADER LINE (Addendum 2 item 1) ──
    // The report opens by naming the pair from facts. The buyer typed both of
    // these herself, possibly days earlier, so confirming WHICH two people this
    // reading is about is the header's whole job.
    //
    // It is behind the paywall and behind the bearer token, and it returns only
    // what she already provided - no chart, no archetype, nothing derived about
    // person B. `servePairFacts`'s unpaid branch is untouched and still returns
    // neither.
    pair: {
      a: { date: row.a_birth_date, gender: row.a_gender ?? null },
      b: { date: row.b_birth_date, gender: row.b_gender ?? null },
    },
    facts: {
      a: semanticJson.core.a,
      b: semanticJson.core.b,
      pattern: namedOr(`p4_${semanticJson.core.pattern}`),
      quadrant: namedOr(`p5_${semanticJson.core.quadrant}`),
    },
    // ── EVERY BLOCK'S NAME, NOT JUST THE TWO (Y-2 Addendum 2 item 2) ──
    // The report gives every block a two-level heading: a chrome SECTION label
    // over the glossary `name_id` of that block's primary fact. `pattern` and
    // `quadrant` above are the same names by their old route and are kept, since
    // the report's badge and quadrant blocks read them and a rename is not what
    // this commit is for.
    //
    // BUILT FROM THE FACTS, NOT FROM A HAND-WRITTEN KEY LIST. Each fact already
    // carries its glossary cell as `entry`, so this is a projection rather than a
    // second mapping to keep in step - `p1_produces` vs `p1_controls` and the
    // four `p5_q*` are chosen by the engine, and a list here would have to
    // re-derive that choice and could disagree with it.
    //
    // Cells with no `name_id` (p0's opening, p7's leads) are absent rather than
    // null-valued, so the component renders no headline for them - the same
    // "a missing cell must look like an absence" rule `namedOr` follows.
    names: Object.fromEntries(
      (semanticJson.facts || [])
        .map((f) => [f.id, f.entry?.name_id ?? null])
        .filter(([, name]) => typeof name === 'string' && name.length > 0),
    ),
    reading: {
      blocks: rendered.blocks,
      penutup: rendered.penutup,
    },
  }, 200, headers);
}
