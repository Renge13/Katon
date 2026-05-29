import 'server-only';
// SERVER ONLY. Uses the Supabase service role key, which bypasses RLS and must
// never reach the browser. The `server-only` import above makes any client-side
// import of this module a build-time error.

import { createClient } from '@supabase/supabase-js';

let _client = null;

/**
 * Returns a singleton Supabase admin client, or `null` if env vars are not set.
 * Callers (readingStore) fall back to a dev in-memory store when this is null,
 * so the scaffold is runnable before Supabase credentials are wired.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
