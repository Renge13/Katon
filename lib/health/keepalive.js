import 'server-only';

// ============================================================
// lib/health/keepalive.js - keep the Supabase project from pausing
// ============================================================
// WHY THIS EXISTS, and it is not a latency optimisation. The Supabase project
// pauses itself after a stretch with no activity, and a paused database does not
// serve the funnel: `POST /api/mirror` cannot write a row, so a reader gets an
// error instead of a chart. Ruled the highest-priority build item 2026-09-05,
// AHEAD of the region change and ahead of the stagger PR, for one reason -
// **a paused database during the demand window invalidates the September
// decision**, and that decision (migrate / terminate / stay on Xendit, see
// `lib/xendit.js` and the INTERIM REGISTER row it points at) is made on the
// funnel's purchase data. No data, no decision. That outranks two seconds of
// submit latency by a wide margin.
//
// ── THE CONTRACT, AND IT IS THE WHOLE POINT OF THE FILE ────
//
//   `ok: true` IF AND ONLY IF A REAL DATABASE ROUND TRIP SUCCEEDED.
//
// Every other outcome is a non-2xx with a reason. This is stated as a contract
// rather than left implicit because the obvious way to write a keep-alive is the
// broken way:
//
//     try { await ping(); } catch {} return reply({ ok: true });   // NEVER
//
// That version is green forever and the database pauses anyway. It is the exact
// shape CLAUDE.md's card-check convention was written for - a check "written from
// the requirement it is documenting, so it asserts what is easy to assert rather
// than what would break". A keep-alive is worse than most, because its failure is
// invisible until the thing it was preventing has already happened.
//
// `tests/keepalive.spec.mjs` therefore asserts the FAILING directions first: a
// database that throws must produce 503, and an unconfigured one must NOT produce
// a cheerful 200. Those tests were shown red before this file existed.
//
// ── WHAT IT DOES NOT DO ────────────────────────────────────
// **IT PREVENTS A PAUSE. IT CANNOT UNDO ONE.** A paused Supabase project is
// restored by hand from the dashboard; a ping against one fails and stays failing.
// So this is not a recovery mechanism, and the ping going red is the SYMPTOM of a
// pause that has already happened, not a defence against it. That is why the
// 2026-09-05 order puts "restart the database, confirm healthy" BEFORE this ships:
// installing a keep-alive in front of an already-paused project would look
// installed and be doing nothing.
//
// **NOTHING WATCHES IT except Vercel's own cron run log.** There is no alert, no
// counter, and no row anywhere that says "the ping stopped". Written down rather
// than implied, because rule 15's lesson is that a mitigation nobody is checking
// gets counted in availability reasoning as though it were. If this needs an
// owner, that is a separate, later, deliberate act.
//
// ── IT IS NOT THE PROBE REYNER VETOED ──────────────────────
// `docs/PROGRESS.md` records a 2026-08-26 frugality ruling and a 2026-08-29 one -
// **NO INTENTIONAL PRODUCTION SPEND TO OBSERVE A DEAD PROVIDER** - refusing an
// active probe on a schedule. This is a different thing and the distinction is the
// cost: that ruling is about buying PROVIDER calls to observe a provider. This
// makes no provider call, buys no tokens, and reads one indexed row. The shape
// looks similar enough ("a probe on a timer") that a future session could
// reasonably think the ruling covers it. It does not.
// ============================================================

import { getSupabaseAdmin } from '../supabase.js';

// PLAIN WEB `Response`, NOT `NextResponse` - and deliberately not `lib/http.js`,
// which wraps it. Next 15 accepts either, and only one of them is importable
// outside a bundler: `next/server` has no `exports` map, so raw node ESM cannot
// resolve it and `tests/keepalive.spec.mjs` could not load this file. Same
// reasoning and same one-line helper as `lib/mirror/handlers.js` and
// `lib/deliver/handlers.js`, both of which state it; duplicated rather than
// imported because importing `lib/http.js` is the thing that breaks.
//
// This was not a guess - the first version of this file imported `lib/http.js`
// and the spec died on `ERR_MODULE_NOT_FOUND: next/server`.
const reply = (body, status = 200) => Response.json(body, { status });

/**
 * The table the ping reads. `reading` is the funnel's own write target, so a
 * successful select here exercises the same project, schema and credentials the
 * funnel depends on - not a side channel that could be healthy while the funnel
 * is not.
 */
export const KEEPALIVE_TABLE = 'reading';

/**
 * Touch the database so the project does not idle into a pause.
 *
 * @param {Request} request
 * @param {Object}  [deps]
 * @param {() => any} [deps.getClient] seam for tests; production never passes it,
 *   so the default is the real admin client and a stub cannot reach production.
 * @returns {Promise<Response>} 200 only when the round trip succeeded.
 */
export async function keepAlive(request, { getClient = getSupabaseAdmin } = {}) {
  // ── AUTH, AND WHY AN UNSET SECRET DOES NOT REFUSE ─────────
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when that variable is
  // set. When it IS set we require it, so the endpoint is not a free invocation
  // for anyone who finds it.
  //
  // When it is NOT set we ping anyway and say so in the response. The other
  // choice - refuse without a secret - fails in the one direction that matters:
  // an unset variable would make every cron run a 401, the pings would never
  // land, and the database would pause exactly as if this file did not exist.
  // That is the `openaiConfigured()` failure in rule 15, where a branch that
  // reads like a mitigation had never once executed. A cheap endpoint left open
  // is a much smaller problem than a keep-alive that silently never runs, and
  // `POST /api/season-check` is already unauthenticated on the same reasoning.
  const secret = process.env.CRON_SECRET;
  const authenticated = Boolean(secret)
    && request.headers.get('authorization') === `Bearer ${secret}`;

  if (secret && !authenticated) {
    return reply({ ok: false, pinged: false, reason: 'bad_cron_secret' }, 401);
  }

  const sb = getClient();

  // NOT a 200. There is no database here to keep alive - locally, that is the
  // in-memory store and correct; in production it is a broken deploy. Either way
  // reporting `ok` would be a lie about the one fact this route exists to report.
  if (!sb) {
    return reply({ ok: false, pinged: false, reason: 'supabase_not_configured' }, 503);
  }

  const started = Date.now();
  let failure = null;
  try {
    const { error } = await sb.from(KEEPALIVE_TABLE).select('id').limit(1);
    if (error) failure = error;
  } catch (err) {
    // A throw and a returned `error` are the same outcome to a caller, and the
    // supabase client does both depending on how it fails. Catching only one of
    // them is how this route would come to report `ok` on a dead database.
    failure = err;
  }
  const ms = Date.now() - started;

  if (failure) {
    console.error(`[keepalive] ping failed after ${ms}ms:`, failure?.message || failure);
    return reply({
      ok: false,
      pinged: false,
      reason: 'query_failed',
      detail: String(failure?.message || failure),
      ms,
    }, 503);
  }

  if (!authenticated) {
    console.warn('[keepalive] CRON_SECRET is unset, so this endpoint is unauthenticated.');
  }

  return reply({ ok: true, pinged: true, table: KEEPALIVE_TABLE, ms, authenticated });
}
