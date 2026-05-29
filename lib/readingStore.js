import 'server-only';
// SERVER ONLY. The single data-access layer for the `reading` row.
//
// Backend: Supabase when configured, else a process-local in-memory Map
// (DEV FALLBACK — non-persistent, single-process). Production runs on Supabase.
//
// SECURITY:
//  - `paid` flips ONLY through markReadingPaid(), called ONLY by the verified
//    Xendit webhook. No other path may set paid=true.
//  - `birth_date` / `birth_time` are stored to recompute the chart server-side,
//    and are NEVER returned to the client or logged (see readingView.js).

import { getSupabaseAdmin } from './supabase.js';

const TABLE = 'reading';

// DEV-ONLY in-memory store, pinned on globalThis so it survives Next dev HMR.
const mem = (globalThis.__katonReadingMem ??= new Map());

/** Insert a new reading row. Caller supplies a CSPRNG `id`. */
export async function createReading(row) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from(TABLE).insert(row).select().single();
    if (error) throw new Error(`createReading: ${error.message}`);
    return data;
  }
  mem.set(row.id, { paid: false, wa_sent: false, created_at: new Date().toISOString(), ...row });
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

/** Record the Xendit invoice id + WhatsApp number captured at payment intent. */
export async function setInvoice(id, { invoiceId, waNumber }) {
  const sb = getSupabaseAdmin();
  const patch = {};
  if (invoiceId !== undefined) patch.invoice_id = invoiceId;
  if (waNumber !== undefined) patch.wa_number = waNumber;
  if (sb) {
    const { error } = await sb.from(TABLE).update(patch).eq('id', id);
    if (error) throw new Error(`setInvoice: ${error.message}`);
    return;
  }
  const row = mem.get(id);
  if (row) Object.assign(row, patch);
}

/** Update birth_time (post-pay hour-enrichment door). Server recomputes the chart. */
export async function setBirthTime(id, birthTime) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(TABLE).update({ birth_time: birthTime }).eq('id', id);
    if (error) throw new Error(`setBirthTime: ${error.message}`);
    return;
  }
  const row = mem.get(id);
  if (row) row.birth_time = birthTime;
}

/**
 * Flip paid=true and stamp paid_at. THE ONLY place paid is set. Idempotent:
 * returns true only on the false→true transition, so the webhook can run
 * once-only side effects (WA send) exactly once even if Xendit double-fires.
 */
export async function markReadingPaid(id, paidAtISO) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .update({ paid: true, paid_at: paidAtISO })
      .eq('id', id)
      .eq('paid', false) // conditional: only the still-unpaid row transitions
      .select('id');
    if (error) throw new Error(`markReadingPaid: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }
  const row = mem.get(id);
  if (!row || row.paid === true) return false;
  row.paid = true;
  row.paid_at = paidAtISO;
  return true;
}

/**
 * Claim the WA-send slot. Returns true only on the false→true transition, so the
 * WhatsApp message is dispatched exactly once. Call BEFORE sending.
 */
export async function claimWaSend(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .update({ wa_sent: true })
      .eq('id', id)
      .eq('wa_sent', false)
      .select('id');
    if (error) throw new Error(`claimWaSend: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }
  const row = mem.get(id);
  if (!row || row.wa_sent === true) return false;
  row.wa_sent = true;
  return true;
}
