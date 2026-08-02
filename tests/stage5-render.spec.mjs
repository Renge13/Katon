// ============================================================
// Stage 5 — prompt loading, the output contract, and the floor
// ============================================================
// Run: npm run test:stage5
//
// No network. The provider adapters are exercised through an injected fetch, so
// this spec never spends an API call and never depends on a key being present.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// lib/render/cache.js carries a `server-only` guard, which resolves to an empty
// stub under that condition — the same way Next's RSC bundle resolves it, and
// the same arrangement scripts/forge-tests.mjs already uses.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

import { MASTER_PROMPT, PROMPT_VERSION, assertPromptLoaded } from '../lib/render/prompt.js';
import { parseRenderResponse, RenderShapeError } from '../lib/render/schema.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { readCache, writeCache, flagCache, __clearMemCache } from '../lib/render/cache.js';

const jsonFor = (tc) => buildSemanticJson(calculateBaziChart({
  birthDate: tc.date, birthTime: tc.time,
}));

const CHART_1 = jsonFor(VALIDATION_CHARTS[0]);

// ── the prompt is a file, and it is versioned ──────────────

test('the master prompt loads from its file, whole', () => {
  assert.equal(assertPromptLoaded(), true);
  assert.ok(MASTER_PROMPT.length > 10_000, 'the prompt is ~15k chars');
  // Sections the adapters and Stage 6 both depend on existing.
  for (const marker of ['## OUTPUT FORMAT', '## VOICE', '## THE GOLDEN RULES']) {
    assert.ok(MASTER_PROMPT.includes(marker), `missing ${marker}`);
  }
});

test('the prompt text carries no CR, so prompt_version is platform-stable', () => {
  // The version is stamped on cached readings for attribution. A CRLF checkout
  // must not fork it for identical content, so the SENT text is normalised too.
  assert.ok(!MASTER_PROMPT.includes('\r'), 'prompt text still holds a carriage return');
  assert.match(PROMPT_VERSION, /^[0-9a-f]{16}$/);
});

// ── the ordered blocks[] contract ──────────────────────────

const GOOD = JSON.stringify({
  blocks: [
    { fact_ids: ['void_stack_month'], heading: 'Ruang kerja', text: 'Satu.' },
    { fact_ids: ['strength_weak', 'day_master_Fire'], heading: 'Cadangan', text: 'Dua.\n\nTiga.' },
  ],
  penutup: 'Penutup.',
});

test('a well-formed response parses, and keeps its block order', () => {
  const got = parseRenderResponse(GOOD, { knownFactIds: CHART_1.facts.map((f) => f.id) });
  assert.equal(got.blocks.length, 2);
  assert.deepEqual(got.blocks[0].fact_ids, ['void_stack_month']);
  assert.equal(got.blocks[1].heading, 'Cadangan');
  assert.equal(got.penutup, 'Penutup.');
});

test('an invented fact id is rejected', () => {
  // Rule 14. A cited id that is not in the semantic JSON means the renderer
  // decided something was true, which is the one thing it may never do.
  const bad = JSON.stringify({
    blocks: [{ fact_ids: ['badge_naga_emas'], heading: 'x', text: 'y' }],
    penutup: 'z',
  });
  assert.throws(
    () => parseRenderResponse(bad, { knownFactIds: CHART_1.facts.map((f) => f.id) }),
    RenderShapeError,
  );
});

test('empty, non-JSON and mis-shaped responses all throw the same error type', () => {
  for (const raw of [
    '',
    '   ',
    'Halo, ini bacaanmu.',
    '[]',
    JSON.stringify({ blocks: [], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: [], heading: 'h', text: 't' }], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: ['a'], heading: 'h', text: '' }], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: ['a'], heading: 'h', text: 't' }], penutup: '' }),
  ]) {
    assert.throws(() => parseRenderResponse(raw), RenderShapeError, `accepted: ${raw}`);
  }
});

test('a missing heading degrades to empty rather than failing the render', () => {
  const raw = JSON.stringify({
    blocks: [{ fact_ids: ['a'], text: 'teks' }],
    penutup: 'p',
  });
  assert.equal(parseRenderResponse(raw).blocks[0].heading, '');
});

// ── the module-assembled floor ─────────────────────────────

test('the floor covers every required point, in hierarchy order', () => {
  const out = assembleFallback(CHART_1);
  assert.deepEqual(
    out.blocks.map((b) => b.fact_ids[0]),
    CHART_1.required_points.map((p) => p.fact_id),
  );
  assert.equal(out.source, 'module_assembly');
});

test('the floor stands on every fixture chart and authors no typography', () => {
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    const out = assembleFallback(json); // throws on banned typography
    assert.ok(out.blocks.length > 0, `chart ${tc.id} assembled to nothing`);
    for (const block of out.blocks) {
      assert.ok(block.text.trim().length > 0, `chart ${tc.id} emitted an empty block`);
    }
  }
});

test('the floor never leaves a strength label bare (rule 21, same breath)', () => {
  // glossary kekuatan._note: lemah/kuat must co-occur with its meaning sentence.
  // Structural here - the label and its meaning share ONE text field, so no
  // layout decision downstream can separate them.
  let seen = 0;
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    const strength = json.facts.find((f) => f.id.startsWith('strength_'));
    if (!strength) continue;
    const block = assembleFallback(json).blocks.find((b) => b.fact_ids[0] === strength.id);
    if (!block) continue; // below the coverage floor on this chart
    seen += 1;
    const labelAt = block.text.indexOf(strength.label);
    assert.ok(labelAt >= 0, `chart ${tc.id}: strength label absent`);
    assert.ok(
      block.text.includes(strength.label_meaning),
      `chart ${tc.id}: strength label rendered without its meaning`,
    );
    assert.ok(
      block.text.indexOf(strength.label_meaning) > labelAt,
      `chart ${tc.id}: the meaning must follow the label, not precede it`,
    );
  }
  assert.ok(seen > 0, 'no chart exercised the strength block');
});

test('the floor names a badge and never names a null-label condition', () => {
  // "Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu" is the
  // failure the prompt calls out. A condition is described, never named.
  const out = assembleFallback(CHART_1);
  const badge = out.blocks.find((b) => b.fact_ids[0] === 'badge_桃花');
  assert.match(badge.text, /^Bunga Persik \(Peach Blossom\)\./);

  const missing = out.blocks.find((b) => b.fact_ids[0] === 'element_missing_Wood');
  const fact = CHART_1.facts.find((f) => f.id === 'element_missing_Wood');
  assert.equal(fact.label, null, 'fixture assumption: a missing element carries no name');
  assert.equal(missing.heading, '');
  assert.ok(missing.text.startsWith(fact.label_meaning), 'the condition is described, not named');
  assert.ok(!missing.text.includes('Missing Wood'), 'a condition must not wear its bracket');
});

test('the floor reports the two things it cannot say', () => {
  // Both would be new user-facing Indonesian copy, and Reyner is the sole
  // authority on register. Reported as data rather than invented.
  const out = assembleFallback(CHART_1);
  assert.equal(out.penutup, '');
  assert.equal(out.notes.penutup_unavailable, true);
  assert.equal(typeof out.notes.hour_known, 'boolean');
});

// ── the result cache (Stage 4 check + Stage 7 store) ───────
// Against the in-memory dev backend. Supabase is not configured in tests, and
// the two paths are the same shape by construction.

test('a stored reading round-trips on its key, with its attribution', async () => {
  __clearMemCache();
  const key = cacheKey(CHART_1);
  const out = assembleFallback(CHART_1);

  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: out.blocks,
    penutup: out.penutup,
    source: 'gemini',
    model: 'gemini-3.1-flash-lite',
    promptVersion: PROMPT_VERSION,
    stage6Version: 'test-gate-1',
  });

  const row = await readCache(key);
  assert.equal(row.cache_key, key);
  assert.equal(row.blocks.length, out.blocks.length);
  // Flagged readings must be attributable to the exact model AND prompt.
  assert.equal(row.model, 'gemini-3.1-flash-lite');
  assert.equal(row.prompt_version, PROMPT_VERSION);
  assert.equal(row.status, 'unreviewed');
});

test('a row written with no Stage 6 gate is never returned to a serve path', async () => {
  // G task 3. This is the pre-H state: nothing validated it, so nothing serves
  // it - and it stays unservable AFTER H lands, because the discriminator is the
  // absent stage6_version rather than a status that H would start overwriting.
  __clearMemCache();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: assembleFallback(CHART_1).blocks,
    penutup: '',
    source: 'module_assembly',
    stage6Version: null,
  });

  assert.equal(await readCache(key), null, 'an ungated row reached the serve path');
  const qa = await readCache(key, { includeUnvalidated: true });
  assert.ok(qa, 'QA must still be able to see it');
  assert.equal(qa.stage6_version, null);
});

test('the cache refuses to store an empty reading', async () => {
  __clearMemCache();
  await assert.rejects(
    () => writeCache('k', { engineVersion: 'v', blocks: [], source: 'gemini' }),
    /empty reading/,
  );
  await assert.rejects(
    () => writeCache('', { engineVersion: 'v', blocks: [{}], source: 'gemini' }),
    /no cache key/,
  );
});

test('a flagged reading keeps serving', async () => {
  // pipeline-spec Stage 7: pulling it leaves a hole for every user who shares
  // that semantic profile.
  __clearMemCache();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: assembleFallback(CHART_1).blocks,
    penutup: 'x',
    source: 'gemini',
    stage6Version: 'test-gate-1',
  });
  await flagCache(key);

  const row = await readCache(key);
  assert.equal(row.status, 'flagged');
  assert.ok(row.blocks.length > 0, 'a flagged reading still serves');
});
