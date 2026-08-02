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
import { renderReading, persistRendered, withTargetLanguage } from '../lib/render/index.js';
import { STRICTER_STYLE_BLOCK, renderWithOpenAI } from '../lib/render/providers/openai.js';
import { STAGE6_VERSION, serveFenceReason, serveAllowed } from '../lib/render/fence.js';
import { splitParagraphs, inspectParagraphs } from '../lib/render/paragraphs.js';
import { RENDER_COPY } from '../lib/render/copy.js';

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

// ── the failover chain ─────────────────────────────────────
// Injected fetch throughout. No key is ever read for its value, only for its
// presence, and no request leaves the process.

const okBody = (payload) => ({
  ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload),
});
const geminiSays = (text) => okBody({ candidates: [{ content: { parts: [{ text }] } }] });
const httpError = (status) => ({
  ok: false, status, text: async () => 'boom', json: async () => ({}),
});

/** A response that cites only ids chart 1 actually carries. */
const validRender = JSON.stringify({
  blocks: [{ fact_ids: ['void_stack_month'], heading: 'Ruang kerja', text: 'Isi bacaan.' }],
  penutup: 'Penutup.',
});

async function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k];
  }
  try {
    return await fn();
  } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

test('a first-try Gemini render returns with its attribution', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return geminiSays(validRender); },
    });
    assert.equal(calls, 1);
    assert.equal(out.source, 'gemini');
    assert.equal(out.model, 'gemini-3.1-flash-lite');
    assert.equal(out.prompt_version, PROMPT_VERSION);
    assert.equal(out.cached, false);
    assert.equal(out.cache_key, cacheKey(CHART_1));
  });
});

test('the master prompt is the front and the chart JSON is the back', async () => {
  // pipeline-spec PAYLOAD STRUCTURE. Chart data in the system instruction would
  // break the cacheable prefix on every call.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let body;
    await renderReading(CHART_1, {
      fetchImpl: async (_url, init) => {
        body = JSON.parse(init.body);
        return geminiSays(validRender);
      },
    });
    const front = body.systemInstruction.parts[0].text;
    const back = body.contents[0].parts[0].text;
    assert.equal(front, MASTER_PROMPT, 'the front must be the prompt, verbatim');
    assert.ok(!front.includes('void_stack_month'), 'chart data leaked into the cacheable front');
    assert.equal(JSON.parse(back).engine_version, CHART_1.engine_version);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
  });
});

test('a transient failure retries once, then the chain lands on the floor', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return httpError(503); },
    });
    assert.equal(calls, 2, 'retry 1 means two attempts');
    assert.equal(out.source, 'module_assembly');
    assert.equal(out.attempts.length, 2);
    assert.ok(out.blocks.length > 0, 'the floor must always produce a reading');
  });
});

test('a non-retryable failure does not spend the second attempt', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return httpError(400); },
    });
    assert.equal(calls, 1, 'a 400 will be a 400 again; retrying only delays the failover');
  });
});

test('an invented fact id fails the attempt like a 500 would', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const invented = JSON.stringify({
      blocks: [{ fact_ids: ['badge_naga_emas'], heading: 'h', text: 't' }],
      penutup: 'p',
    });
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(invented) });
    assert.equal(out.source, 'module_assembly');
    assert.match(out.attempts[0].error, /unknown fact/);
  });
});

test('Gemini exhausted hands over to OpenAI, with the stricter style block', async () => {
  __clearMemCache();
  await withEnv({
    GEMINI_API_KEY: 'test', OPENAI_API_KEY: 'test', KATON_OPENAI_MODEL: 'test-gpt',
  }, async () => {
    const seen = [];
    const out = await renderReading(CHART_1, {
      tier: 'free_mirror',
      fetchImpl: async (url, init) => {
        seen.push({ url, body: JSON.parse(init.body) });
        if (String(url).includes('googleapis')) return httpError(503);
        return okBody({ choices: [{ message: { content: validRender } }] });
      },
      generation: { attemptsPerProvider: 1 },
    });

    // TIER_MODELS reads KATON_OPENAI_MODEL at module load. Under `node --test`
    // this spec's imports run before the env is set, so the secondary is
    // unarmed and the chain correctly skips it. Both outcomes are asserted so
    // the test states the real contract either way rather than passing vacuously.
    if (out.source === 'module_assembly') {
      assert.equal(seen.length, 1, 'an unarmed secondary must be skipped, not called');
      assert.equal(seen.filter((s) => !String(s.url).includes('googleapis')).length, 0);
      return;
    }

    assert.equal(out.source, 'openai');
    const gpt = seen.find((s) => !String(s.url).includes('googleapis'));
    const system = gpt.body.messages[0].content;
    assert.ok(system.startsWith(MASTER_PROMPT), 'the master prompt must stay the verbatim front');
    assert.ok(system.includes(STRICTER_STYLE_BLOCK), 'the stricter style block was not appended');
  });
});

test('the OpenAI adapter appends the stricter style block, after the prompt', async () => {
  // Direct, because the chain test above can only reach the secondary when
  // KATON_OPENAI_MODEL happened to be set before config.js was imported. The
  // adapter contract itself must be covered unconditionally.
  await withEnv({ OPENAI_API_KEY: 'test' }, async () => {
    let body;
    const out = await renderWithOpenAI(MASTER_PROMPT, CHART_1, {
      model: 'test-gpt',
      temperature: 0.2,
      maxOutputTokens: 4096,
      timeoutMs: 1000,
      fetchImpl: async (_url, init) => {
        body = JSON.parse(init.body);
        return okBody({ choices: [{ message: { content: validRender } }] });
      },
    });

    assert.equal(out.provider, 'openai');
    const system = body.messages[0].content;
    assert.ok(system.startsWith(MASTER_PROMPT), 'the master prompt must stay the verbatim front');
    assert.ok(system.includes(STRICTER_STYLE_BLOCK), 'the stricter style block was not appended');
    // The three constraints pipeline-spec names, transcribed not paraphrased.
    assert.ok(STRICTER_STYLE_BLOCK.includes('—'), 'the em-dash ban must name the character');
    assert.ok(STRICTER_STYLE_BLOCK.includes('melainkan'));
    assert.ok(STRICTER_STYLE_BLOCK.includes('sebagai AI'));
    // The chart goes in the user message, never the system one.
    assert.equal(JSON.parse(body.messages[1].content).engine_version, CHART_1.engine_version);
    assert.equal(body.response_format.json_schema.strict, true);
  });
});

test('a cache hit costs no API call', async () => {
  __clearMemCache();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: [{ fact_ids: ['day_master_Fire'], heading: 'h', text: 'tersimpan' }],
    penutup: 'p',
    source: 'gemini',
    model: 'gemini-3.1-flash-lite',
    promptVersion: PROMPT_VERSION,
    stage6Version: 'test-gate-1',
  });

  await withEnv({ GEMINI_API_KEY: 'test' }, async () => {
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { throw new Error('the cache did not short-circuit'); },
    });
    assert.equal(out.cached, true);
    assert.equal(out.blocks[0].text, 'tersimpan');
  });
});

test('production with no Gemini key REFUSES rather than degrading quietly', async () => {
  // G task 1: a misconfigured deploy must be loud. Silently serving the floor
  // forever is indistinguishable from an outage and means something else.
  __clearMemCache();
  await withEnv({ NODE_ENV: 'production', GEMINI_API_KEY: undefined }, async () => {
    await assert.rejects(
      () => renderReading(CHART_1, { fetchImpl: async () => geminiSays(validRender) }),
      (err) => err.name === 'RenderRefused' && err.reason === 'gemini_api_key_unset',
    );
  });
});

test('measurement mode refuses the floor instead of counting it as a pass', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    await assert.rejects(
      () => renderReading(CHART_1, {
        allowFallback: false,
        fetchImpl: async () => httpError(500),
      }),
      (err) => err.name === 'RenderRefused' && err.reason === 'all_providers_failed',
    );
  });
});

// ── the Stage 6 fence ──────────────────────────────────────

test('the fence is closed, and persisting a render is refused while it is', async () => {
  assert.equal(STAGE6_VERSION, null, 'Prompt H sets this, and nothing else may');
  assert.equal(serveFenceReason(), 'stage6_gate_absent');
  assert.equal(serveAllowed(), false);

  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(validRender) });
    await assert.rejects(
      () => persistRendered(out, CHART_1),
      (err) => err.name === 'RenderRefused' && err.reason === 'stage6_gate_absent',
    );
    assert.equal(
      await readCache(out.cache_key, { includeUnvalidated: true }), null,
      'nothing may be written while the gate is absent',
    );
  });
});

// ── the UI contract and the chrome copy ────────────────────

test('a block splits on the double break, and on nothing else', () => {
  assert.deepEqual(splitParagraphs('Satu.\n\nDua.'), ['Satu.', 'Dua.']);
  // A lone newline is never a paragraph break. It stays inside the paragraph so
  // the gate can see it; pre-wrap would have rendered it as a visible artefact.
  assert.deepEqual(splitParagraphs('Satu.\nDua.'), ['Satu.\nDua.']);
  // 3+ collapse rather than producing an empty paragraph.
  assert.deepEqual(splitParagraphs('Satu.\n\n\n\nDua.'), ['Satu.', 'Dua.']);
  assert.deepEqual(splitParagraphs('   '), []);
  assert.deepEqual(splitParagraphs(undefined), []);
});

test('the strict view reports what the tolerant one repairs', () => {
  // Prompt H reads this one. Reports, never fixes.
  const got = inspectParagraphs('Satu.\nDua.\n\nTiga.\n\n\nEmpat.');
  assert.equal(got.paragraphs.length, 3);
  assert.equal(got.breakCount, 2);
  assert.equal(got.strayNewlines, 1, 'the lone newline must be visible to the gate');
  assert.equal(inspectParagraphs('Satu.\n\nDua.').strayNewlines, 0);
});

test('the loading copy never advertises the AI', () => {
  // Decided in PROGRESS: naming the model invites "it just rephrased my input".
  assert.equal(RENDER_COPY.loading, 'Menghitung bagan kelahiranmu');
  for (const banned of ['AI', 'Gemini', 'GPT', 'model', 'kecerdasan']) {
    assert.ok(!RENDER_COPY.loading.includes(banned), `loading copy names "${banned}"`);
  }
  // Rule 20's audit surface. scripts/check-copy.js walks this object too.
  for (const value of Object.values(RENDER_COPY)) {
    assert.ok(!/[—–‘’“”…]/.test(value), `banned typography in "${value}"`);
  }
});

test('target_language is set before keying, so two languages are two entries', () => {
  const en = withTargetLanguage(CHART_1, 'en');
  assert.equal(en.target_language, 'en');
  assert.equal(CHART_1.target_language, 'id', 'the input must not be mutated');
  assert.notEqual(cacheKey(en), cacheKey(CHART_1));
});
