import 'server-only';
// ============================================================
// lib/analytics/events.js — the single door for funnel counters
// ============================================================
// SERVER ONLY. Prompt Q commit 2. The only module that writes `funnel_event` or
// `product_interest`, in the same spirit as `lib/readingStore.js` being the
// single door for the `reading` row: one place to audit, one place to fix.
//
// Backend: Supabase when configured, else a process-local Map pinned on
// globalThis (DEV FALLBACK, non-persistent, single-process), mirroring
// readingStore so local verification needs no Supabase at all.
//
// ── THE ONE RULE THAT OVERRIDES EVERYTHING HERE ──
// `recordEvent` MUST NEVER THROW INTO A REQUEST PATH. Instrumentation that can
// break a reading is worse than no instrumentation: it would trade the product
// for a number about the product. Every path catches, logs and continues, and
// the return value says whether the write landed so a CALLER may care - but no
// caller is obliged to, and none currently does.
//
// ── RULE 16 IS NOT VIOLATED ──
// A future session will flag this, so it is answered here rather than in a PR
// thread. Rule 16 forbids PERSISTING A FLOOR RENDER. Recording that a floor was
// served is not the render: no prose is stored, this is never read by
// `readCache`, it does not become a cache entry, and the next request still
// retries the provider. `mirror_served` with `source: 'module_assembly'` is a
// tally mark, and the floor stays un-cached exactly as ruled.
//
// ── NO PII ──
// `detail` carries render source and booleans. NEVER a birth date, birth time,
// name or contact. `assertNoPii` enforces it at the door rather than trusting
// every call site, because the call sites are spread across four route files and
// the one that gets it wrong will be the one added later.
// ============================================================

import { getSupabaseAdmin } from '../supabase.js';

const EVENTS = 'funnel_event';
const INTEREST = 'product_interest';

/**
 * The events, fixed. A typo in a call site would otherwise create a new event
 * silently and quietly halve a denominator - the read-out would show a plausible
 * number rather than an error, which is the worst failure an instrument has.
 *
 * `pair_served` (Prompt AV §5, 2026-09-30) is the ninth, and it is keyed by a PAIR id,
 * not a reading id: it counts compatibility serves, render or floor, and why. It is in
 * no mirror denominator (scripts/demand-readout.mjs counts readers by name).
 */
export const FUNNEL_EVENTS = Object.freeze([
  'reading_created',
  'mirror_served',
  'card_downloaded',
  'offer_seen',
  'checkout_started',
  'purchase_confirmed',
  'upcoming_seen',
  'interest_registered',
  'pair_served',
  // Prompt AZ §4 (Reyner, 2026-10-01): the Compatibility block on the mirror result
  // page. Client-fired, keyed by the MIRROR reading id, allowlisted in
  // lib/mirror/handlers.js CLIENT_EVENTS.
  'compat_cta_seen',
  'compat_cta_click',
]);

/**
 * SYSTEM events: facts about the SERVICE, not about a reader (Prompt AK §3.4). Stored
 * in the same funnel_event table, under a `system:` reading_id, so the funnel's
 * eight events and their denominators are untouched - scripts/demand-readout.mjs
 * sets `system:` rows aside before it counts anything.
 */
export const SYSTEM_EVENTS = Object.freeze(['writer_cap_reached']);
export const SYSTEM_PREFIX = 'system:';

/** Products that may carry interest. Neither is sellable; see lib/pricing.js. */
export const INTEREST_PRODUCTS = Object.freeze(['compat', 'annual']);

// DEV-ONLY stores, pinned on globalThis so they survive Next dev HMR.
const memEvents = (globalThis.__katonFunnelMem ??= new Map());
const memInterest = (globalThis.__katonInterestMem ??= new Map());

const key = (readingId, event) => `${readingId} ${event}`;

/**
 * Keys that must never appear in `detail`, at any depth.
 *
 * This is a BLOCKLIST AT THE DOOR and it is deliberately blunt. The alternative -
 * trusting each call site - fails the first time someone passes a whole chart
 * object "just to see", and by then it is in a table with no schema to stop it.
 */
const PII_KEYS = ['birth_date', 'birthDate', 'birth_time', 'birthTime', 'name', 'contact', 'wa', 'wa_number'];

function assertNoPii(detail) {
  if (detail == null) return;
  const seen = JSON.stringify(detail);
  for (const k of PII_KEYS) {
    if (seen.includes(`"${k}"`)) throw new Error(`funnel_event.detail may not carry "${k}"`);
  }
  // A bare ISO date is PII here even under an innocent key: the pillars are
  // derived from the birth datetime, so a date in an analytics row is a chart.
  if (/\d{4}-\d{2}-\d{2}/.test(seen)) throw new Error('funnel_event.detail may not carry a date');
}

/**
 * Record one funnel event. Idempotent per (reading, event).
 *
 * FIRST OCCURRENCE WINS ON `created_at`, repeats bump `count`. That asymmetry is
 * the whole reason this is an upsert rather than an insert: a refresh must not
 * inflate a denominator, and a refresh COUNT is still worth having.
 *
 * @returns {Promise<boolean>} true if the write landed. Never throws.
 */
export async function recordEvent(readingId, event, detail = null) {
  try {
    if (!readingId || typeof readingId !== 'string') return false;
    const system = readingId.startsWith(SYSTEM_PREFIX);
    if (!(system ? SYSTEM_EVENTS : FUNNEL_EVENTS).includes(event)) throw new Error(`unknown ${system ? 'system' : 'funnel'} event "${event}"`);
    assertNoPii(detail);

    const sb = getSupabaseAdmin();
    if (sb) {
      // ON CONFLICT bumps count and updated_at, and LEAVES created_at alone.
      // Postgres `excluded` cannot express "count + 1" through the JS client's
      // upsert(), so this goes through an RPC-free two-step: try insert, and on
      // a unique violation (23505) bump instead. Two round trips on a repeat,
      // one on the common path, and no stored procedure to keep in sync.
      const ins = await sb.from(EVENTS).insert({ reading_id: readingId, event, detail });
      if (!ins.error) return true;
      if (ins.error.code !== '23505') throw new Error(ins.error.message);

      const cur = await sb.from(EVENTS)
        .select('id, count').eq('reading_id', readingId).eq('event', event).single();
      if (cur.error) throw new Error(cur.error.message);

      const bump = await sb.from(EVENTS)
        .update({ count: (cur.data.count ?? 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', cur.data.id);
      if (bump.error) throw new Error(bump.error.message);
      return true;
    }

    const k = key(readingId, event);
    const row = memEvents.get(k);
    if (row) {
      row.count += 1;
      row.updated_at = new Date().toISOString();
    } else {
      memEvents.set(k, {
        reading_id: readingId, event, detail, count: 1,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    }
    return true;
  } catch (err) {
    // SWALLOWED ON PURPOSE. See the header: a counter may never break a reading.
    console.error(`[analytics] recordEvent(${event}) failed:`, err?.message ?? err);
    return false;
  }
}

/**
 * Record one SYSTEM event (AK §3.4), keyed `system:<key>`. Same storage and the same
 * idempotence as recordEvent: the first write per key makes the row, repeats bump
 * its count. Never throws.
 */
export async function recordSystemEvent(key, event, detail = null) {
  return recordEvent(`${SYSTEM_PREFIX}${key}`, event, detail);
}

/**
 * Record interest in an unbuilt product. Contact is OPTIONAL and may be null.
 *
 * THE TAP IS THE METRIC. Requiring a contact before recording would measure
 * willingness to hand over a phone number rather than desire for the product,
 * which is a different question and not the one September is asking.
 *
 * @returns {Promise<boolean>} true if the write landed. Never throws.
 */
export async function recordInterest(readingId, product, contact = null) {
  try {
    if (!readingId || typeof readingId !== 'string') return false;
    if (!INTEREST_PRODUCTS.includes(product)) throw new Error(`unknown product "${product}"`);
    const clean = typeof contact === 'string' && contact.trim() ? contact.trim().slice(0, 120) : null;

    const sb = getSupabaseAdmin();
    if (sb) {
      // Upsert on the unique index: a second tap updates contact if one is now
      // given, and never creates a second signal.
      const { error } = await sb.from(INTEREST)
        .upsert({ reading_id: readingId, product, contact: clean }, { onConflict: 'reading_id,product' });
      if (error) throw new Error(error.message);
      return true;
    }

    memInterest.set(key(readingId, product), {
      reading_id: readingId, product, contact: clean, created_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error(`[analytics] recordInterest(${product}) failed:`, err?.message ?? err);
    return false;
  }
}

/**
 * READ-ONLY, for `scripts/demand-readout.mjs` and for tests.
 * Returns every row in the window, newest first. Never used by a request path.
 */
export async function readEvents({ since = null, until = null } = {}) {
  const sb = getSupabaseAdmin();
  if (sb) {
    let q = sb.from(EVENTS).select('reading_id, event, detail, count, created_at');
    if (since) q = q.gte('created_at', since);
    if (until) q = q.lte('created_at', until);
    const { data, error } = await q;
    if (error) throw new Error(`readEvents: ${error.message}`);
    return data ?? [];
  }
  return [...memEvents.values()].filter((r) =>
    (!since || r.created_at >= since) && (!until || r.created_at <= until));
}

/** READ-ONLY, as above. */
export async function readInterest({ since = null, until = null } = {}) {
  const sb = getSupabaseAdmin();
  if (sb) {
    let q = sb.from(INTEREST).select('reading_id, product, contact, created_at');
    if (since) q = q.gte('created_at', since);
    if (until) q = q.lte('created_at', until);
    const { data, error } = await q;
    if (error) throw new Error(`readInterest: ${error.message}`);
    return data ?? [];
  }
  return [...memInterest.values()].filter((r) =>
    (!since || r.created_at >= since) && (!until || r.created_at <= until));
}

/** TEST ONLY. Clears the dev fallback so a spec starts from a known state. */
export function __resetAnalyticsMemForTest() {
  memEvents.clear();
  memInterest.clear();
}
