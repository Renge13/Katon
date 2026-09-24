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

// On `main` bb4a0b0, VOICE unset. THESE MUST NEVER MOVE on this branch.
const V1_KEYS = {
  mirror: 'b38088d0aa89991d2da6521cd6e6536e4a3fbf34fa6422133f0782a442c3511f',
  pair: 'b600cf5b1d3168751e1308b7b4b8a6f38430bace947765e4ef9acf4561e013a0',
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
