import 'server-only';
// ============================================================
// Fixed-window rate limiting
// ============================================================
// CLAUDE.md rule 19: "Rate-limit per IP/session. No bulk endpoint. No enumerable
// reading URLs. The real abuse risk is content harvesting, not API cost (the
// entire mirror space costs ~$115 to cache forever)."
//
// That last clause decides the SHAPE of this. If the risk were API cost the
// limiter would sit in front of the renderer; because the risk is harvesting the
// CACHED corpus, the limit has to sit in front of every read, hit or miss. A
// harvester's requests are all cache hits by definition — they cost nothing and
// take everything.
//
// ── TWO DIMENSIONS, AND WHAT EACH ONE ACTUALLY BUYS ────────
// Per-session (an httpOnly cookie) bounds an honest browser. It does NOT bound
// an attacker: dropping the cookie mints a new session. Per-IP is the dimension
// that binds a scraper, and it is deliberately the looser of the two, because
// Indonesian mobile traffic arrives through carrier NAT and a strict per-IP cap
// would throttle a whole city block of real users. Neither is sufficient alone;
// the pair is, which is why rule 19 names both.
//
// ── FAIL CLOSED ────────────────────────────────────────────
// A backend error is a REFUSAL, not a pass. An unlimited endpoint is the exact
// state rule 19 forbids, and "the limiter was broken" is not a reason to enter
// it. Same philosophy as lib/paymentFence.js and lib/render/config.js: a
// misconfigured deploy fails loudly rather than degrading into something that
// looks fine from outside.
//
// ── BACKENDS ───────────────────────────────────────────────
// Supabase when configured, else a process-local Map — the same pattern as
// readingStore.js and render/cache.js. The Map is for local dev and tests ONLY.
// On Vercel it would not limit a rate, it would limit a rate PER LAMBDA
// INSTANCE, resetting on every cold start. Requires migration 0008.
// ============================================================

import { getSupabaseAdmin } from './supabase.js';

/**
 * The buckets, per dimension. UNFITTED — these are opening guesses, not
 * measurements, and the right numbers come from real traffic (rule 8: a
 * measurement goes in PROGRESS.md, dated, never into a constant that then
 * pretends to be evidence).
 *
 * `session` is tighter than `ip` on purpose. See the NAT note above.
 */
export const RATE_LIMITS = {
  // Creating a reading computes a chart and writes a row. Ten an hour is far
  // more than a person exploring their own and their friends' birthdates.
  mirror_create: {
    session: { limit: 10, windowSeconds: 3600 },
    ip: { limit: 60, windowSeconds: 3600 },
  },
  // Reading one. Generous, because a revisit and a refresh are both normal, and
  // because this is the harvesting surface the ceiling exists for.
  mirror_serve: {
    session: { limit: 120, windowSeconds: 3600 },
    ip: { limit: 300, windowSeconds: 3600 },
  },
  mirror_feedback: {
    session: { limit: 20, windowSeconds: 3600 },
    ip: { limit: 60, windowSeconds: 3600 },
  },

  // ── THE PAID PDF: A COMPUTE CEILING, NOT A HARVESTING ONE ──
  // A Complete Edition costs TWO full document renders, because the page-reference
  // fixed point needs a rebuild (lib/pdf/build.js). So a valid paid token fetched in
  // a loop is a CPU bill, and rule 19's "the real abuse risk is content harvesting"
  // does not cover it - the content behind this endpoint was already bought.
  //
  // IP ONLY, no session dimension. The delivery link is a bearer token a buyer may
  // legitimately open on a phone and a laptop, and a session bucket would refuse the
  // second device. Twenty an hour is far more than downloading your own document a
  // few times and re-downloading it after losing the file. UNFITTED, like every
  // number in this table.
  deliver_pdf: {
    ip: { limit: 20, windowSeconds: 3600 },
  },

  // ── SPEND GUARD (a): renders per cache key per hour ───────
  // NOT a harvesting limit, and the only bucket here that is not. Rule 19 says
  // the abuse risk is content harvesting rather than API cost, and that is still
  // true of READS - but it stopped being the whole story once the floor rate was
  // ACCEPTED at 10% rather than treated as a defect on its way out (Reyner,
  // 2026-08-22).
  //
  // THE MECHANISM IT BOUNDS, which is a right rule with a standing cost. Rule 16
  // forbids persisting a floor, so a floored reader who reloads gets a genuinely
  // fresh render - that SELF-HEALS quality, and `tests/mirror-route.spec.mjs`
  // pins it as correct: "the second request must retry the provider, not serve a
  // frozen floor". The same sentence describes unbounded cost. A chart that keeps
  // flooring re-renders on every request forever, and every one of those is a
  // provider call nothing caches.
  //
  // WHY THE DIMENSION IS THE CACHE KEY AND NOT THE CLIENT. The cost is per
  // CHART, not per person: two readers of one shared link are the same spend, and
  // one reader reloading is the same spend again. A session or IP bucket cannot
  // see either, and both already have buckets above for the harvesting risk.
  //
  // THREE PER HOUR, and the tuning target is Reyner's: one reload must still
  // heal. Attempt 1 is the reader's first visit. A reload spends 2, a second
  // reload spends 3, and only the fourth render inside the hour is refused into
  // the floor - so the self-healing property survives with a spare, while a
  // pathological chart costs at most 3 chains an hour instead of one per request.
  // UNFITTED, like every number in this file: an opening guess against a
  // behaviour nobody has observed on real traffic, not a measurement.
  render_per_key: {
    key: { limit: 3, windowSeconds: 3600 },
  },

  // ── SPEND GUARD (c): provider attempts per day, GLOBAL ────
  // The only bucket here with no per-client or per-chart dimension, because it is
  // the only one bounding total spend rather than one actor's share of it. Guards
  // (a) and (b) bound how often ONE chart renders and neither bounds how many
  // charts exist; an unbounded number of distinct cache keys sits inside both.
  //
  // The limit lives in lib/render/config.js as DAILY_ATTEMPT_CEILING, next to the
  // other render budgets and with the arithmetic behind it, and is injected at the
  // call site. A spend ceiling read from the rate-limiter's table would be the one
  // number about render cost that is not with the render config.
  render_attempts_daily: {
    global: { limit: null, windowSeconds: 86_400 },
  },
};

/** DEV-ONLY in-memory counters, pinned on globalThis so they survive Next HMR. */
const mem = (globalThis.__katonRateLimitMem ??= new Map());

/** Fixed-window start: the same instant for every request inside one window. */
function windowStart(now, windowSeconds) {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(now / ms) * ms);
}

/**
 * Increment one counter and return its new value.
 *
 * @returns {Promise<number|null>} the count after this hit, or null when the
 *   backend could not answer. Null is a REFUSAL upstream, never a pass.
 */
async function hit(key, start) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.rpc('rate_limit_hit', {
      p_key: key,
      p_window_start: start.toISOString(),
    });
    if (error || typeof data !== 'number') return null;
    return data;
  }

  const row = mem.get(key);
  if (!row || row.windowStart !== start.getTime()) {
    mem.set(key, { windowStart: start.getTime(), count: 1 });
    return 1;
  }
  row.count += 1;
  return row.count;
}

/**
 * Consume one unit against every dimension of a bucket.
 *
 * EVERY dimension is charged even when an earlier one has already refused. The
 * alternative — short-circuit on the first denial — would leave the per-IP
 * counter under-counting a client that is being refused on its session, which is
 * precisely the client whose IP total matters most.
 *
 * @param {string} bucket a key of RATE_LIMITS
 * @param {{ip?: string|null, session?: string|null}} identity
 * @param {Object} [options]
 * @param {number} [options.now=Date.now()]
 * @param {Object} [options.limits] per-dimension limit overrides. A bucket may
 *   declare `limit: null` to say "the number lives elsewhere and must be passed"
 *   - guard (c)'s ceiling belongs with the render budgets, not in this table -
 *   and an unresolved null THROWS rather than defaulting to unlimited. A spend
 *   guard that silently becomes infinite is worse than no spend guard.
 * @returns {Promise<{allowed: boolean, reason: string|null, retryAfter: number}>}
 */
export async function consume(bucket, identity, { now = Date.now(), limits = {} } = {}) {
  const rules = RATE_LIMITS[bucket];
  if (!rules) throw new Error(`consume: unknown rate-limit bucket "${bucket}"`);

  let refusedBy = null;
  let retryAfter = 0;

  for (const [dimension, rule] of Object.entries(rules)) {
    const value = identity?.[dimension];
    // An absent dimension is not charged and not refused. A first POST arrives
    // before any session cookie exists, and a request with no resolvable client
    // IP is a local one. The other dimension still applies.
    if (!value) continue;

    const limit = limits[dimension] ?? rule.limit;
    if (typeof limit !== 'number') {
      throw new Error(
        `consume: bucket "${bucket}" dimension "${dimension}" has no limit. `
        + 'Declared null, so it must be passed in options.limits.',
      );
    }

    const start = windowStart(now, rule.windowSeconds);
    const count = await hit(`${bucket}:${dimension}:${value}`, start);

    const over = count === null || count > limit;
    if (over && !refusedBy) {
      refusedBy = count === null ? 'limiter_unavailable' : `rate_limited_${dimension}`;
      retryAfter = Math.max(
        1,
        Math.ceil((start.getTime() + rule.windowSeconds * 1000 - now) / 1000),
      );
    }
  }

  return { allowed: refusedBy === null, reason: refusedBy, retryAfter };
}

/**
 * The client's IP, as reported by the platform proxy.
 *
 * TRUSTWORTHY ONLY BEHIND ONE. Vercel overwrites `x-forwarded-for` on the way
 * in, so the first entry is the real peer there. Run this app naked on a port
 * and the header is whatever the caller typed — which is why the session
 * dimension is not optional and why the whole route is fenced today.
 */
export function clientIp(request) {
  const forwarded = request?.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return request?.headers?.get?.('x-real-ip') || null;
}

/** Test/dev helper. Never called from a request path. */
export function __clearMemRateLimit() {
  mem.clear();
}
