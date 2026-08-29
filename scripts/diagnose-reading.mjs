#!/usr/bin/env node
// ============================================================
// scripts/diagnose-reading.mjs — what produced this reading?
// ============================================================
//   npm run diagnose:reading -- <token>
//
// READ-ONLY. It selects and never writes, because it exists to answer questions
// about readings a real person is holding.
//
// THE QUESTION IT WAS BUILT FOR. A reading's prose can be a real Gemini render or
// the deterministic module-assembly floor, and the two are hard to tell apart by
// eye - the floor serves Reyner's own ruled glossary prose, which is the whole
// reason rule 15 tolerates it. But they fail differently and they are fixed in
// different places: a shape complaint about a FLOOR reading is a complaint about
// module assembly, and changing the renderer prompt for it would be editing the
// wrong file and then measuring the wrong thing.
//
// `source` is written on every cached row (`lib/render/cache.js`), so the answer
// is one lookup and it never needs to be inferred from the prose.
//
// A FLOOR IS NEVER CACHED (rule 16), so a row that exists at all was a render
// that passed Stage 6 - see the note this prints when the row is missing, which
// is itself the answer to a different question.
// ============================================================

import { getReading } from '../lib/readingStore.js';
import { getSupabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

const token = process.argv[2];
if (!token) {
  console.error('usage: npm run diagnose:reading -- <token>');
  process.exit(2);
}

if (!isSupabaseConfigured()) {
  console.error('Supabase is not configured in this environment.');
  console.error('This reads PRODUCTION rows, so it needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(2);
}

let row = await getReading(token);
if (!row) {
  // A TRUNCATED TOKEN IS THE COMMON CASE, NOT A MISSING READING. Ids are
  // nanoid(21) and they get copied out of a URL by hand or out of a chat message
  // that wrapped. The first time this script ran, the token it was given was 14
  // characters and it answered "NOT FOUND", which is true and useless. A prefix
  // match resolves it when it is unambiguous and says so when it is not.
  const sbLookup = getSupabaseAdmin();
  const { data: near } = await sbLookup.from('reading').select('id').like('id', `${token}%`);
  if (near?.length === 1) {
    console.log(`\n"${token}" is ${token.length} chars; reading ids are nanoid(21).`);
    console.log(`Resolved by prefix to ${near[0].id}.`);
    row = await getReading(near[0].id);
  } else if (near?.length > 1) {
    console.log(`"${token}" is an ambiguous prefix - ${near.length} readings match. Use the full id:`);
    for (const r of near) console.log('  ', r.id);
    process.exit(1);
  } else {
    console.log(`reading ${token}: NOT FOUND, and no reading id starts with it.`);
    process.exit(1);
  }
}

const show = (k, v) => console.log(`  ${k.padEnd(18)} ${v ?? '(null)'}`);

console.log(`\nREADING ${token}`);
show('created_at', row.created_at);
show('day_master', row.day_master);
show('birth_date', row.birth_date);
show('birth_time', row.birth_time);
show('gender', row.gender);
show('paid', row.paid === true ? 'TRUE' : String(row.paid));
show('sku', row.sku);
show('cache_key', row.cache_key);

if (!row.cache_key) {
  console.log('\nNo cache_key on the reading row: nothing was ever rendered and stored for it.');
  process.exit(0);
}

// RAW, NOT readCache(). `readCache` returns null for any row whose
// `stage6_version` is null - its `includeUnvalidated` guard - so a null from it is
// ambiguous between "nothing was ever stored" and "something was stored
// unvalidated", and those are different answers to this question. The raw select
// removes the ambiguity, and the guard is then reported here where it can be seen.
const sb = getSupabaseAdmin();
const { data: rows, error } = await sb.from('render_cache').select('*').eq('cache_key', row.cache_key);
if (error) throw new Error(`render_cache select failed: ${error.message}`);
const cached = rows?.[0] ?? null;
if (!cached) {
  console.log('\nNO CACHE ROW for that key.');
  console.log('Rule 16: module-assembly floors are served but NEVER persisted, so a missing row');
  console.log('is consistent with every attempt so far having floored. What the reader saw was');
  console.log('assembled at request time and the next request will retry the provider.');
  process.exit(0);
}

console.log('\nCACHE ROW');
show('source', cached.source);
show('model', cached.model);
show('prompt_version', cached.prompt_version);
show('stage6_version', cached.stage6_version);
show('engine_version', cached.engine_version);
show('status', cached.status);
show('created_at', cached.created_at);
show('served_count', cached.served_count);
show('blocks', Array.isArray(cached.blocks) ? `${cached.blocks.length} block(s)` : typeof cached.blocks);

console.log(`\nVERDICT: ${cached.source === 'module_assembly'
  ? 'MODULE ASSEMBLY — the deterministic floor. Prose shape complaints belong to module assembly, NOT the renderer prompt.'
  : `REAL RENDER (${cached.source}) — it passed Stage 6. Prose shape complaints belong to the renderer prompt or the gate.`}\n`);
