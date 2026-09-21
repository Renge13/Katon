import 'server-only';
// SERVER ONLY. The single data-access layer for the `pair` row — the standalone
// paid Compatibility product.
//
// Shape mirrors lib/readingStore.js deliberately: same Supabase-or-memory
// fallback, same conditional paid flip, same signatures where the operation is
// the same. Two stores that behave differently under the same failure would be
// two things to reason about at the one place rule 18 is enforced.
//
// ══ PERSON B HAS NO ROW OF HER OWN, AND THAT IS THE POINT ══
// Ruled 2026-09-07 (night): person B gets no mirror, no reading, no link, no
// notification, no account. A `reading` row IS a reachable `/r/<token>` URL, so
// giving B one would create an openable reading of her regardless of what any UI
// links to. This table therefore holds BOTH birth inputs and both charts are
// computed IN MEMORY at serve time. See supabase/migrations/0010_pair.sql.
//
// SECURITY:
//  - `paid` flips ONLY through markPairPaid(), called ONLY by the verified provider
//    webhook. No other path may set paid=true (rule 18).
//  - every `a_*` and `b_*` birth column is server-only and is NEVER returned to a
//    client or logged. `GET /api/pair/[id]` returns derived facts, never births.
//  - `email` (ruling C) is a recovery record, not a credential. There is no
//    password, no session and no login anywhere near this table.

import { getSupabaseAdmin } from './supabase.js';

const TABLE = 'pair';

// DEV-ONLY in-memory store, pinned on globalThis so it survives Next dev HMR.
// Separate map from readingStore's: a pair is not a reading, and sharing one
// would let a pair id resolve as a reading in dev only, which is exactly the
// class of difference that hides a real routing bug until production.
const mem = (globalThis.__katonPairMem ??= new Map());

/** Insert a new pair row. Caller supplies a CSPRNG `id`. Requires migration 0010. */
export async function createPair(row) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from(TABLE).insert(row).select().single();
    if (error) throw new Error(`createPair: ${error.message}`);
    return data;
  }
  mem.set(row.id, {
    paid: false, sku: 'compat', created_at: new Date().toISOString(), ...row,
  });
  return { ...mem.get(row.id) };
}

/** Fetch a pair by its bearer-token id, or null if not found. */
export async function getPair(id) {
  if (!id) return null;
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`getPair: ${error.message}`);
    return data;
  }
  return mem.get(id) ? { ...mem.get(id) } : null;
}

/**
 * Record the provider invoice captured at payment intent, the SKU, and the email.
 *
 * The sku is what the webhook verifies the settled amount against, so it is
 * written here — at intent, server-side, from the allowlist — and never taken
 * from a callback body. Same reasoning as readingStore#setInvoice.
 *
 * `email` rides along because ruling C collects it AT checkout and nowhere else;
 * a separate setter would be a second write on the same request for no reason.
 */
export async function setPairInvoice(id, { invoiceId, invoiceUrl, sku, email }) {
  const sb = getSupabaseAdmin();
  const patch = {};
  if (invoiceId !== undefined) patch.invoice_id = invoiceId;
  if (invoiceUrl !== undefined) patch.invoice_url = invoiceUrl;
  if (sku !== undefined) patch.sku = sku;
  if (email !== undefined) patch.email = email;
  if (sb) {
    const { error } = await sb.from(TABLE).update(patch).eq('id', id);
    if (error) throw new Error(`setPairInvoice: ${error.message}`);
    return;
  }
  const row = mem.get(id);
  if (row) Object.assign(row, patch);
}

/**
 * Flip paid=true and stamp paid_at. THE ONLY place a pair's paid is set.
 *
 * Idempotent: returns true only on the false->true transition, exactly like
 * markReadingPaid, so a genuine provider double-fire cannot run a once-only side
 * effect twice. There is no such side effect on this path yet — Katon has no
 * email sender — and the conditional stays anyway, because the shape is what
 * makes adding one later safe.
 */
export async function markPairPaid(id, paidAtISO) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .update({ paid: true, paid_at: paidAtISO })
      .eq('id', id)
      .eq('paid', false) // conditional: only the still-unpaid row transitions
      .select('id');
    if (error) throw new Error(`markPairPaid: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }
  const row = mem.get(id);
  if (!row || row.paid === true) return false;
  row.paid = true;
  row.paid_at = paidAtISO;
  return true;
}

/** Record WHICH render_cache row a pair's report was built from. X-b2 sets this. */
export async function setPairCacheKey(id, cacheKey) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(TABLE).update({ cache_key: cacheKey }).eq('id', id);
    if (error) throw new Error(`setPairCacheKey: ${error.message}`);
    return;
  }
  const row = mem.get(id);
  if (row) row.cache_key = cacheKey;
}
