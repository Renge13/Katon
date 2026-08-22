import 'server-only';
// ============================================================
// Stage 4 (check) + Stage 7 (store) — the result cache
// ============================================================
// SERVER ONLY. Same backend pattern as lib/readingStore.js: Supabase when
// configured, else a process-local Map so the pipeline is runnable before
// credentials are wired. Requires migration 0006_render_cache.sql.
//
// The KEY is lib/semantic/index.js#cacheKey — sha256 over the canonical semantic
// JSON with the engine version hashed in. It is NOT computed here, so there is
// exactly one definition of it and tests/stage3-contract.spec.mjs already guards
// its stability.
//
// ── WHY A PRE-GATE ROW MUST BE UNSERVABLE, PERMANENTLY ─────
// G task 3: "Until H exists, store nothing user-servable." A status flag alone
// would not survive Prompt H landing — once H starts writing rows that look the
// same, yesterday's unvalidated rows become indistinguishable from today's
// validated ones and get served. So the discriminator is `stage6_version`:
// null means no gate ran, and readCache() refuses to return such a row unless
// the caller explicitly asks for it (QA and the dev fence do; the serve path
// never can). Rows written today are inert forever, not inert until H ships.
// ============================================================

import { getSupabaseAdmin } from '../supabase.js';

const TABLE = 'render_cache';

/** DEV-ONLY in-memory store, pinned on globalThis so it survives Next dev HMR. */
const mem = (globalThis.__katonRenderCacheMem ??= new Map());

/**
 * Stage 4. A hit means zero API call and the identical text every time.
 *
 * @param {string} cacheKey
 * @param {Object} [options]
 * @param {boolean} [options.includeUnvalidated=false] return rows with no
 *   stage6_version. ONLY for QA surfaces and the pre-H dev fence. A serve path
 *   that passes true has defeated rule 17.
 * @returns {Promise<Object|null>}
 */
export async function readCache(cacheKey, { includeUnvalidated = false } = {}) {
  if (!cacheKey) return null;

  const sb = getSupabaseAdmin();
  let row;
  if (sb) {
    const { data, error } = await sb.from(TABLE).select('*').eq('cache_key', cacheKey).maybeSingle();
    // A missing table (migration 0006 not applied) must not take the request
    // down — it degrades to a permanent miss, which is expensive but correct.
    // The message is distinctive enough to be greppable in logs.
    if (error) throw new Error(`readCache: ${error.message}`);
    row = data;
  } else {
    row = mem.get(cacheKey) ? { ...mem.get(cacheKey) } : null;
  }

  if (!row) return null;
  if (!includeUnvalidated && !row.stage6_version) return null;
  return row;
}

/**
 * Stage 7. Store a rendered reading.
 *
 * Metadata `model` + `prompt_version` are stored alongside so a flagged reading
 * is attributable to the exact model and prompt that produced it (decided
 * 2026-08-02, PROGRESS TODO #4). Without them a thumbs-down is a complaint about
 * an unknown system.
 *
 * @param {string} cacheKey
 * @param {Object} entry
 * @param {string} entry.engineVersion
 * @param {Array} entry.blocks the ordered blocks[] contract
 * @param {string} entry.penutup
 * @param {'gemini'|'module_assembly'} entry.source
 * @param {string|null} [entry.model]
 * @param {string|null} [entry.promptVersion]
 * @param {string|null} [entry.stage6Version] null until Prompt H exists. A null
 *   here is what makes the row unservable, so it is written explicitly rather
 *   than defaulted.
 */
export async function writeCache(cacheKey, entry) {
  if (!cacheKey) throw new Error('writeCache: no cache key');
  if (!entry?.engineVersion) throw new Error('writeCache: no engine version');
  if (!Array.isArray(entry.blocks) || entry.blocks.length === 0) {
    throw new Error('writeCache: refusing to store an empty reading');
  }

  const row = {
    cache_key: cacheKey,
    engine_version: entry.engineVersion,
    blocks: entry.blocks,
    penutup: entry.penutup ?? '',
    source: entry.source,
    model: entry.model ?? null,
    prompt_version: entry.promptVersion ?? null,
    stage6_version: entry.stage6Version ?? null,
    status: 'unreviewed',
  };

  const sb = getSupabaseAdmin();
  if (sb) {
    // Upsert, not insert: a re-warm after a prompt edit rewrites the same key,
    // and two concurrent misses on the same chart must not 23505 one of them.
    const { error } = await sb.from(TABLE).upsert(row, { onConflict: 'cache_key' });
    if (error) throw new Error(`writeCache: ${error.message}`);
    return;
  }
  mem.set(cacheKey, { ...row, created_at: new Date().toISOString(), served_count: 0 });
}

/**
 * Mark a cached reading flagged (the thumbs-down half of Stage 7).
 *
 * It KEEPS SERVING while flagged, per pipeline-spec: pulling it leaves a hole for
 * every user who shares that semantic profile. A hard fact or safety failure is
 * the exception and is Prompt H's call, not this function's.
 */
export async function flagCache(cacheKey) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(TABLE).update({ status: 'flagged' }).eq('cache_key', cacheKey);
    if (error) throw new Error(`flagCache: ${error.message}`);
    return;
  }
  const row = mem.get(cacheKey);
  if (row) row.status = 'flagged';
}

/** Test/dev helper. Never called from a request path. */
export function __clearMemCache() {
  mem.clear();
}
