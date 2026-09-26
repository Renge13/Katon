// ============================================================
// tests/voice-cache.spec.mjs — v1 and v2 never share a cache row
// ============================================================
// Run: npm run test:voice-cache
//
// Voice v2 round 2 (spec docs/content/voice-v2-spec-2026-09-24.md §7), step 2:
// CACHE ISOLATION FIRST. The voice version is part of the render cache key, so a
// reading rendered under one voice is never served under the other - in either
// direction. And v1 stays byte-identical: the keys below were computed on `main`
// (bb4a0b0) before this branch existed, so a v1 key that moves fails here and
// would otherwise have silently re-rendered every production reading.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { voiceVersion } from '../lib/voice.js';
import { writeCache, __clearMemCache } from '../lib/render/cache.js';
import { renderReading, __clearInFlight } from '../lib/render/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { STAGE6_VERSION } from '../lib/render/fence.js';

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });

// On `main`, VOICE unset. THESE MUST NEVER MOVE on this branch. mirror: bb4a0b0.
// pair: re-pinned to `main` ec8ea00 (PR #151, 2026-09-26), where frame hits got
// their own p2_frame_* cells and the pair semantic JSON moved on main itself; it was
// b600cf5b... on bb4a0b0 and 38062f2. A key that moves WITHOUT main moving is the bug.
const V1_KEYS = {
  mirror: 'b38088d0aa89991d2da6521cd6e6536e4a3fbf34fa6422133f0782a442c3511f',
  pair: 'c6d3d6ff2591e022be64524eb36174d03a22007cd4e1cd9bce1e2247a7e83b58',
};

const ENV = ['VOICE', 'VERCEL_ENV', 'GEMINI_API_KEY'];
let saved;
beforeEach(() => {
  saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  for (const k of ENV) delete process.env[k];
  __clearMemCache();
  __clearInFlight();
});
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
  }
});

const withVoice = (v, fn) => { if (v) process.env.VOICE = v; else delete process.env.VOICE; return fn(); };

test('THE SWITCH: default v1; v2 only when asked, and NEVER in production', () => {
  assert.equal(voiceVersion(), 'v1');
  process.env.VOICE = 'v2';
  assert.equal(voiceVersion(), 'v2');
  process.env.VERCEL_ENV = 'preview';
  assert.equal(voiceVersion(), 'v2', 'v2 on Preview');
  process.env.VERCEL_ENV = 'production';
  assert.equal(voiceVersion(), 'v1', 'production refuses v2 whatever VOICE says');
  process.env.VOICE = 'nonsense';
  delete process.env.VERCEL_ENV;
  assert.equal(voiceVersion(), 'v1', 'an unknown value is v1');
});

test('V1 IS BYTE-IDENTICAL: the keys main computed have not moved', () => {
  assert.equal(cacheKey(buildSemanticJson(A)), V1_KEYS.mirror);
  assert.equal(cacheKey(buildPairSemantic(A, B)), V1_KEYS.pair);
});

test('THE VOICE IS IN THE KEY: v2 keys differ from v1, for both kinds', () => {
  const v2m = withVoice('v2', () => buildSemanticJson(A));
  const v2p = withVoice('v2', () => buildPairSemantic(A, B));
  assert.equal(v2m.voice, 'v2');
  assert.equal(v2p.voice, 'v2');
  assert.notEqual(cacheKey(v2m), V1_KEYS.mirror);
  assert.notEqual(cacheKey(v2p), V1_KEYS.pair);
});

// ── CACHE IDENTITY, Prompt AG item 4 (2026-09-26) ──
// The two cross-voice tests below pass even with `voice` stripped from the key
// entirely - measured by that mutation of cacheKey - because a v2 semantic JSON
// differs from v1 in CONTENT (v2 facts, the pair's mirror.a/b), and that alone
// keeps the keys apart. So they cannot see the voice prefix. This one can: the
// same object with only `voice` changed must hash differently, which is the
// guarantee the prefix exists for ("isolation must not depend on a field
// surviving canonicalisation").
test('THE VOICE ALONE MOVES THE KEY: identical content, different voice, different key', () => {
  const sj = buildSemanticJson(A);
  assert.equal(sj.voice, undefined, 'precondition: a v1 object carries no voice');
  assert.notEqual(cacheKey({ ...sj, voice: 'v2' }), cacheKey(sj));
  const pj = buildPairSemantic(A, B);
  assert.notEqual(cacheKey({ ...pj, voice: 'v2' }), cacheKey(pj));
});

/** A servable row for `semanticJson`, the way a real serve writes it. */
async function cacheRow(semanticJson, promptVersion) {
  await writeCache(cacheKey(semanticJson), {
    ...assembleFallback(semanticJson), engineVersion: semanticJson.engine_version,
    source: 'gemini', model: 'test-model', promptVersion, stage6Version: STAGE6_VERSION,
  });
}

for (const [from, to] of [['v1', 'v2'], ['v2', 'v1']]) {
  test(`A ${from} ROW IS NEVER SERVED UNDER ${to}`, async () => {
    // Cache a row under `from`, then ask for the same chart under `to`. No provider
    // key is set, so a miss falls to the floor (uncached) - a HIT would come back
    // `cached: true` carrying the `from` row's prompt version.
    await cacheRow(withVoice(from === 'v2' ? 'v2' : null, () => buildSemanticJson(A)), `prompt-${from}`);
    const served = await withVoice(to === 'v2' ? 'v2' : null,
      () => renderReading(buildSemanticJson(A), { spendGuards: false, dedupeInFlight: false }));
    assert.equal(served.cached, false, `a ${from} row was served under ${to}`);
    assert.notEqual(served.prompt_version, `prompt-${from}`);
    // And the same voice DOES hit, so the test can fail the other way.
    const same = await withVoice(from === 'v2' ? 'v2' : null,
      () => renderReading(buildSemanticJson(A), { spendGuards: false, dedupeInFlight: false }));
    assert.equal(same.cached, true, `${from} under ${from} must hit its own row`);
  });
}

test('THE PROMPT IS NOT IN THE KEY: a v2 row written under an older v2 prompt is still served', async () => {
  // By design (lib/render/prompt.js header): prompt_version is metadata, so a
  // prompt edit does not re-render every cached reading. Recorded as a test so the
  // AG item 4 answer - voice cannot cross, prompt can - is a fact, not a memory.
  const sj = withVoice('v2', () => buildSemanticJson(A));
  await cacheRow(sj, 'v2-an-older-prompt');
  const served = await withVoice('v2',
    () => renderReading(buildSemanticJson(A), { spendGuards: false, dedupeInFlight: false }));
  assert.equal(served.cached, true);
  assert.equal(served.prompt_version, 'v2-an-older-prompt');
});

// ── A CACHED ROW IS RE-CHECKED BY THE VOICE THAT WROTE IT (STAGE6 1.43.0) ──
// Prompt AG item 4, an AF defect: lib/mirror/handlers.js re-gated every cached
// row with the v1 validator, so a v2 reading that passed v2's gate when it was
// written was floored on a later serve by a v1 rule v2 deliberately logs instead.
test('A CACHED v2 ROW IS RE-GATED BY v2, NOT v1 (and a v1 row still by v1)', async () => {
  const { floorIfHardFailing } = await import('../lib/mirror/handlers.js');
  const v2sj = withVoice('v2', () => buildSemanticJson(A));
  const v1sj = withVoice(null, () => buildSemanticJson(A)); // withVoice leaves VOICE set
  // The strength block said bare: fact.strength_same_breath is HARD on v1 and a
  // logged flag on v2 (1.36.0). Everything else is the floor's own text.
  const bare = (sj) => {
    const floor = assembleFallback(sj);
    return {
      blocks: floor.blocks.map((b) => (b.fact_ids.includes('strength_weak') ? { ...b, text: 'Kamu Lemah.' } : b)),
      penutup: 'Penutup yang cukup panjang untuk sebuah bacaan yang utuh.',
      source: 'gemini', cached: true, cache_key: cacheKey(sj),
    };
  };
  assert.ok(v2sj.facts.some((f) => f.id === 'strength_weak'), 'precondition: a weak chart');
  const onV2 = floorIfHardFailing(bare(v2sj), v2sj);
  assert.equal(onV2.source, 'gemini', 'the v2 row is served as written');
  assert.notEqual(onV2.hard_fail_fallback, true);
  // The same text on a v1 row is still floored, so the test can fail the other way.
  const onV1 = floorIfHardFailing(bare(v1sj), v1sj);
  assert.equal(onV1.hard_fail_fallback, true, 'v1 still floors a bare strength label');
});
