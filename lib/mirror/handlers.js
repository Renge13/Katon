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
import { assembleFallback } from '../render/fallback.js';
import { flagCache } from '../render/cache.js';
import { STAGE6_VERSION } from '../render/fence.js';
import { validateRendering } from '../validate/index.js';
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

  rendered = floorIfHardFailing(rendered, semanticJson);

  // ── THE FLOOR IS GATED TOO (issue #23, option b) ───────────
  // Rule 17: nothing reaches a user without passing Stage 6. Until now the floor
  // was exempt - `renderReading` returns it with no gate run over it, and
  // `floorIfHardFailing` skipped floor results on the stated assumption that
  // "engine content re-derived from the glossary cannot have acquired a fact
  // contradiction". The tranche-1 content pass falsified that: a ruled seed
  // carried "pasti akan", which is forbidden.fatalism, on three fixture charts.
  // The only reason it did not reach a reader is that the gate was run by hand.
  //
  // So failing the gate used to ROUTE AROUND the gate: the worse the pipeline
  // was doing, the less validation the reader got. This closes that.
  //
  // HARD FINDINGS ONLY, matching floorIfHardFailing's policy for cached rows.
  // A soft finding keeps serving - pulling a reading over a hedge count would
  // leave a hole for everyone sharing that semantic profile, and the floor is
  // blander rather than untrue. Ruled 2026-08-11.
  //
  // A 503 is the honest answer when it fires. There is nothing beneath the
  // floor, so the choice is between no reading and a reading that breaks rule
  // 25, and rule 25 is not negotiable.
  const floorGate = floorRefusalReason(rendered, semanticJson);
  if (floorGate) return reply({ error: floorGate }, 503, headers);

  // Re-point the row at the text it was actually served, so a later thumbs-down
  // flags that row rather than whatever the current engine version recomputes.
  if (row.cache_key !== key) await setReadingCacheKey(row.id, key);

  return reply(mirrorServeView({ token, chart, semanticJson, rendered }), 200, headers);
}

/**
 * Re-gate a CACHED reading, and drop to the floor if it now fails hard.
 *
 * ── WHY A STORED ROW IS RE-CHECKED AT ALL ──────────────────
 * pipeline-spec Stage 7 and lib/validate/index.js's own header: "an already
 * cached reading that fails one of these falls back IMMEDIATELY; it does not
 * keep serving while queued." A row passed the gate on the day it was written,
 * and the gate moves - STAGE6_VERSION exists precisely because what passes
 * changes. Without this, a tightening protects every reading rendered after it
 * and none of the ones already frozen in the cache, which is backwards: the
 * frozen ones are the ones nobody will look at again.
 *
 * HARD FINDINGS ONLY. Those are fact contradiction and forbidden content - rule
 * 14 and rule 25, the two things that must never reach a reader. A soft finding
 * (style, coverage, structure) keeps serving, because pulling a reading over a
 * hedge-pattern count would leave a hole for everyone who shares that semantic
 * profile and the floor is blander, not truer.
 *
 * IT DOES NOT REWRITE THE ROW. The stored text is the evidence a human review
 * needs; overwriting it with the floor would answer the QA question by deleting
 * it. The floor is served, the row stays exactly as it is.
 *
 * A floor row is skipped - it is already module assembly, and engine content
 * re-derived from the glossary cannot have acquired a fact contradiction.
 *
 * THAT LAST SENTENCE WAS FALSE and is why floorRefusalReason exists below. It
 * held only while the glossary happened to be clean. The glossary is content,
 * content changes, and the tranche-1 pass put forbidden.fatalism into three
 * fixture charts' floors. The skip stays - re-gating a floor here would be
 * duplicated work - but the result is checked before it is served.
 */
function floorIfHardFailing(rendered, semanticJson) {
  if (!rendered.cached || rendered.source === 'module_assembly') return rendered;

  const gate = validateRendering(
    { blocks: rendered.blocks, penutup: rendered.penutup },
    semanticJson,
    { provider: rendered.source },
  );
  if (!gate.hard) return rendered;

  return {
    ...assembleFallback(semanticJson),
    model: null,
    prompt_version: null,
    stage6_version: `${STAGE6_VERSION}-floor`,
    cache_key: rendered.cache_key,
    // The text being served is NOT the cached row's, and the meta must not
    // claim it is.
    cached: false,
    hard_fail_fallback: true,
  };
}

/**
 * Why this module-assembled reading must NOT be served, or null.
 *
 * Closes the exemption rule 17 never granted: the floor reaches a reader
 * unvalidated on two paths, and the second is the sharper one - a cached row
 * hard-fails re-gating and the floor substituted as the REMEDY was itself never
 * checked. The gate fired, and the replacement was unexamined.
 *
 * Runs at the SERVE boundary rather than inside renderReading, deliberately.
 * "Reaches a reader" is decided here; the harness and the CLI scripts call
 * renderReading to MEASURE, and a measurement run must still be able to look at
 * a floor that would not ship. Measuring and serving are different acts, which
 * is the same reason persistRendered lives where it does.
 *
 * Provider output is not re-checked here: it has already passed the gate inside
 * renderReading, or it would not be here.
 *
 * @returns {string|null} a refusal reason for the 503 body, or null to serve
 */
export function floorRefusalReason(rendered, semanticJson) {
  if (rendered.source !== 'module_assembly') return null;

  const gate = validateRendering(
    { blocks: rendered.blocks, penutup: rendered.penutup },
    semanticJson,
    { provider: 'module_assembly' },
  );
  if (!gate.hard) return null;

  // The reason names the checks, so an operator reading a 503 in the logs knows
  // whether a content tranche broke the floor or something stranger happened.
  const checks = [...new Set(gate.findings.filter((f) => f.severity === 'hard')
    .map((f) => f.check))];
  return `floor_failed_gate:${checks.join(',')}`;
}

// ── POST /api/mirror/[token]/feedback ──────────────────────

/**
 * Stage 7's feedback half, minimal: 👎 marks the cached reading `flagged`.
 *
 * A FLAGGED READING KEEPS SERVING. pipeline-spec is explicit about it: pulling
 * it leaves a hole for every user who shares that semantic profile, and a
 * reading somebody disliked is not the same thing as a reading that is wrong.
 * The exception is the hard-check case, and that is handled at serve time by
 * floorIfHardFailing above rather than by this endpoint - which means it applies
 * whether or not anyone ever pressed the button.
 *
 * It flags the row the reading was SERVED FROM (`reading.cache_key`), never a
 * recomputed one. Bump ENGINE_VERSION between the serve and the vote and a
 * recomputed key would name text the reader never saw.
 *
 * 👍 IS ACCEPTED AND NOT PERSISTED, deliberately. `render_cache` has nowhere to
 * put it: adding a counter is a schema change, and Prompt J task 4 specifies
 * exactly one behaviour ("flips render_cache.status to flagged on 👎"). The
 * accumulating QA dataset pipeline-spec describes is Stage 7 proper, not this.
 * Reported rather than quietly invented.
 *
 * No UI in J. This is the endpoint only; the funnel wiring comes with promotion.
 *
 * @param {Request} request
 * @param {string} token
 * @returns {Promise<Response>}
 */
export async function recordMirrorFeedback(request, token) {
  const { refusal, headers } = await admit(request, 'mirror_feedback');
  if (refusal) return refusal;

  let body;
  try {
    body = await request.json();
  } catch {
    return reply({ error: 'invalid JSON body' }, 400, headers);
  }

  const vote = body?.vote;
  if (vote !== 'up' && vote !== 'down') {
    return reply({ error: 'vote must be "up" or "down"' }, 400, headers);
  }

  const row = await getReading(token);
  // Same 404 as everywhere else on this route: an unknown token, a legacy row,
  // and a mirror row that has never been served all look identical.
  if (!row || !row.cache_key) return gone();

  if (vote === 'down') await flagCache(row.cache_key);

  return reply({ ok: true, vote, flagged: vote === 'down' }, 200, headers);
}
