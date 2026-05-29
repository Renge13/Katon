import 'server-only';
// SERVER ONLY. The single data-access layer for the `reading` row.
//
// Backend: Supabase when configured, else a process-local in-memory Map
// (DEV FALLBACK — non-persistent, single-process). The fallback lets the secure
// flow be demonstrated locally before Supabase credentials are wired; production
// always runs on Supabase.
//
// SECURITY: `paid` flips ONLY through markReadingPaid(), which is called ONLY by
// the verified Xendit webhook. No other path may set paid=true.

import { getSupabaseAdmin } from './supabase.js';

const TABLE = 'reading';

// DEV-ONLY in-memory store. Pinned on globalThis so it survives Next's dev
// module re-evaluation (HMR re-instantiates module-scoped state between requests).
// Single-process, non-persistent. Never used when Supabase is configured.
const mem = (globalThis.__katonReadingMem ??= new Map());

/** Insert a new reading row. Caller supplies a CSPRNG `id`. */
export async function createReading(row) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from(TABLE).insert(row).select().single();
    if (error) throw new Error(`createReading: ${error.message}`);
    return data;
  }
  mem.set(row.id, { ...row, created_at: new Date().toISOString() });
  return { ...mem.get(row.id) };
}

/** Fetch a reading by its bearer-token id, or null if not found. */
export async function getReading(id) {
  if (!id) return null;
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`getReading: ${error.message}`);
    return data;
  }
  return mem.get(id) ? { ...mem.get(id) } : null;
}

/** Store the WhatsApp number captured at payment intent. */
export async function setWaNumber(id, waNumber) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(TABLE).update({ wa_number: waNumber }).eq('id', id);
    if (error) throw new Error(`setWaNumber: ${error.message}`);
    return;
  }
  const row = mem.get(id);
  if (row) row.wa_number = waNumber;
}

/**
 * Flip paid=true. THE ONLY place paid is set. Idempotent: returns whether this
 * call was the transition (false→true) so the webhook can fire WA exactly once
 * (the once-only guard is finished in Phase 4a).
 */
export async function markReadingPaid(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    // Conditional update: only rows still unpaid transition. The returned rows
    // tell us if THIS call was the transition.
    const { data, error } = await sb
      .from(TABLE)
      .update({ paid: true })
      .eq('id', id)
      .eq('paid', false)
      .select('id');
    if (error) throw new Error(`markReadingPaid: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }
  const row = mem.get(id);
  if (!row) return false;
  if (row.paid === true) return false;
  row.paid = true;
  return true;
}
