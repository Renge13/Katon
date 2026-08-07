import 'server-only';
// ============================================================
// The mirror route handlers
// ============================================================
// PROMPT J. The logic behind app/api/mirror/*; the route files are three-line
// adapters over these functions.
//
// ── WHY THE HANDLERS LIVE IN lib/ AND NOT IN THE ROUTE FILE ─
// Two reasons, both about the tests J is required to have.
//   1. `@/` is a bundler alias. A route file that imports `@/lib/...` cannot be
//      loaded by `node --test` at all, so route-level tests would have to be
//      replaced by "tests of the things the route calls" — which is exactly the
//      coverage that misses a wiring bug.
//   2. These return a plain Web `Response`, not a `NextResponse`. Next 15 accepts
//      either; only one of them is importable outside a bundler (`next/server`
//      has no `exports` map, so raw node ESM cannot resolve it).
// The route files stay thin so this indirection never becomes a place where
// behaviour hides.
// ============================================================

import { nanoid } from 'nanoid';

import { createReading, getReading, setReadingCacheKey } from '../readingStore.js';
import { calculateBaziChart } from '../bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../semantic/index.js';
import { renderReading, persistRendered, RenderRefused } from '../render/index.js';
import { consume, clientIp } from '../ratelimit.js';
import { semanticFromRow } from './reading.js';
import { mirrorServeView } from './view.js';
import { previewAllowed } from './fence.js';
import { resolveSession, sessionCookieHeader } from './session.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const reply = (body, status = 200, headers = {}) => Response.json(body, { status, headers });

/**
 * The fence's only answer, for every refusal it makes.
 *
 * Absent preview token, wrong preview token, unknown reading and a legacy row
 * all return THIS, byte for byte. Rule 19's named risk is content harvesting,
 * and a response that distinguishes "no such reading" from "you are not allowed"
 * tells a harvester which tokens are real.
 */
const gone = () => reply({ error: 'not_found' }, 404);

/**
 * Fence, session and rate limit, in that order, for every mirror endpoint.
 *
 * ORDER MATTERS. The fence runs FIRST so that a refused request never touches
 * the limiter: charging a counter before deciding whether the caller may be here
 * at all would let an unauthenticated stranger exhaust a real client's quota,
 * and it would make the 404 measurably slower than a miss.
 *
 * @returns {{refusal: Response}|{refusal: null, sessionId: string, headers: Object}}
 */
async function admit(request, bucket) {
  if (!previewAllowed(request)) return { refusal: gone() };

  const { sessionId, isNew } = resolveSession(request);
  const headers = isNew ? { 'set-cookie': sessionCookieHeader(sessionId) } : {};

  const verdict = await consume(bucket, { ip: clientIp(request), session: sessionId });
  if (!verdict.allowed) {
    return {
      refusal: reply({ error: verdict.reason }, 429, {
        ...headers,
        'retry-after': String(verdict.retryAfter),
      }),
    };
  }

  return { refusal: null, sessionId, headers };
}

// ── POST /api/mirror ───────────────────────────────────────

/**
 * Create a mirror reading. Does NOT render — rendering happens on the serve, so
 * the cache decides whether a provider is ever called and a create can never
 * quietly buy an LLM call.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function createMirrorReading(request) {
  const { refusal, headers } = await admit(request, 'mirror_create');
  if (refusal) return refusal;

  // Every response from here carries the session cookie when one was minted. A
  // validation failure that dropped it would leave a client retrying with a
  // FRESH session each time, so the session counter would sit at one forever and
  // only the per-IP ceiling would still be doing any work.
  const rejected = (message) => reply({ error: message }, 400, headers);

  let body;
  try {
    body = await request.json();
  } catch {
    return rejected('invalid JSON body');
  }

  const { birthDate, birthTime = null, gender = null, termSide = null } = body || {};

  if (typeof birthDate !== 'string' || !DATE_RE.test(birthDate)) {
    return rejected('birthDate (YYYY-MM-DD) is required');
  }
  if (birthTime !== null && (typeof birthTime !== 'string' || !TIME_RE.test(birthTime))) {
    return rejected('birthTime must be HH:MM (24h) or omitted');
  }
  if (gender !== null && gender !== 'male' && gender !== 'female') {
    return rejected('gender must be "male", "female", or omitted');
  }
  // The season gate. Not named in J's task list, but it is an existing engine
  // input, it is already persisted (migration 0003), and it decides the MONTH
  // PILLAR on the ~12 days a year a 節 falls inside the birth day. Refusing it
  // would make the mirror strictly less accurate than the funnel it replaces.
  if (termSide !== null && termSide !== 'before' && termSide !== 'after') {
    return rejected('termSide must be "before", "after", or omitted');
  }

  // SERVER-SIDE, always. Nothing about the chart is accepted from a client.
  let chart;
  try {
    chart = calculateBaziChart({ birthDate, birthTime, termSide, gender });
  } catch (err) {
    // The calculator throws on a date it cannot resolve (impossible calendar
    // date, outside the ephemeris). That is a bad request, not a server fault.
    return rejected(`chart could not be computed: ${err.message}`);
  }

  const semanticJson = buildSemanticJson(chart);
  const key = cacheKey(semanticJson);
  const id = nanoid(21); // CSPRNG (nanoid uses crypto), never sequential

  await createReading({
    id,
    day_master: chart.day.stem,
    // NULL on purpose. `state` keys the DEPRECATED hand-authored content cells
    // (contents/*.md), which this pipeline replaces; writing one would imply the
    // mirror reads them. lib/content#resolveCell falls back to the balanced cell
    // for an unknown state, so a null cannot crash the legacy reader either.
    state: null,
    domain: null,
    paid: false,
    wa_number: null,
    // SERVER-ONLY. Stored so the chart is recomputed on every read; never
    // returned to a client, never logged.
    birth_date: birthDate,
    birth_time: birthTime,
    term_side: termSide,
    gender,
    // The link to render_cache, and the marker that this is a mirror row.
    // Requires migration 0007.
    cache_key: key,
  });

  // No birth data echoed back. The client already has what it typed.
  return reply({ token: id, path: `/api/mirror/${id}` }, 201, headers);
}

// ── GET /api/mirror/[token] ────────────────────────────────

/**
 * Serve a mirror reading: cache check -> render on miss -> gate -> store -> serve.
 *
 * Every one of those steps is inside renderReading. This function consumes that
 * chain and reimplements none of it.
 *
 * @param {Request} request
 * @param {string} token
 * @returns {Promise<Response>}
 */
export async function serveMirrorReading(request, token) {
  // Limited on every read, hit or miss. Rule 19's risk is harvesting the CACHED
  // corpus, and a harvester's requests are all hits by definition: they cost
  // nothing to answer and take everything.
  const { refusal, headers } = await admit(request, 'mirror_serve');
  if (refusal) return refusal;

  const row = await getReading(token);
  // A legacy funnel row carries a null cache_key and was never built for this
  // pipeline. The two routes share a table; they do not share readings.
  if (!row || !row.cache_key) return gone();

  const { chart, semanticJson, key } = semanticFromRow(row);

  let rendered;
  try {
    // `allowUnvalidatedCache` is left at its false default and must stay there:
    // a serve path that passes true has defeated rule 17.
    rendered = await renderReading(semanticJson);
    if (!rendered.cached) await persistRendered(rendered, semanticJson);
  } catch (err) {
    // A missing API key in production, or a Stage 6 gate that does not exist.
    // Both are misconfiguration, and both must be LOUD rather than a silent
    // degrade to the floor (lib/render/config.js#renderFenceReason).
    if (err instanceof RenderRefused) return reply({ error: err.reason }, 503, headers);
    throw err;
  }

  // Re-point the row at the text it was actually served, so a later thumbs-down
  // flags that row rather than whatever the current engine version recomputes.
  if (row.cache_key !== key) await setReadingCacheKey(row.id, key);

  return reply(mirrorServeView({ token, chart, semanticJson, rendered }), 200, headers);
}
