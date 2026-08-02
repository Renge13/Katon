import 'server-only';
// ============================================================
// Stage 5 — the failover chain
// ============================================================
// SERVER ONLY (it reads API keys through the adapters and the cache through
// Supabase). One place owns the retry policy, the provider order and the floor,
// so the adapters can each stay a single request.
//
// The chain, exactly as pipeline-spec §PROVIDER FALLBACK specifies it:
//
//   Gemini (retry 1) -> OpenAI (retry 1, + stricter style) -> module assembly
//
// ── WHERE THIS STOPS ───────────────────────────────────────
// It renders. It does NOT store and it does NOT serve.
//
// Storing is Stage 7 and G task 3 puts it AFTER Stage 6 passes, which is Prompt
// H's call to make; persistRendered() below is the door H will use. Serving is
// fenced in ./fence.js. A render today is a QA artifact and nothing else.
//
// ── WHY A SHAPE FAILURE IS A PROVIDER FAILURE ──────────────
// A response that parses to the wrong shape, or cites a fact id that is not in
// the semantic JSON, is treated exactly like a 500: it consumes an attempt and
// moves the chain along. pipeline-spec lists "response empty/garbled -> treat as
// failure, same fallover chain", and an invented fact id is the same class of
// event one level up - the provider produced something that is not a reading.
// ============================================================

import { cacheKey as computeCacheKey } from '../semantic/index.js';
import { MASTER_PROMPT, PROMPT_VERSION, assertPromptLoaded } from './prompt.js';
import {
  GENERATION, DEFAULT_TIER, modelFor, renderFenceReason, geminiConfigured, openaiConfigured,
} from './config.js';
import { renderWithGemini } from './providers/gemini.js';
import { renderWithOpenAI } from './providers/openai.js';
import { parseRenderResponse } from './schema.js';
import { assembleFallback } from './fallback.js';
import { readCache, writeCache } from './cache.js';
import { STAGE6_VERSION, serveFenceReason } from './fence.js';

export class RenderRefused extends Error {
  constructor(reason) {
    super(`render refused: ${reason}`);
    this.name = 'RenderRefused';
    this.reason = reason;
  }
}

/**
 * Set the output language on a semantic JSON.
 *
 * MUST be applied BEFORE the cache key is taken. `target_language` is part of
 * the semantic JSON, so it is part of the hash: an Indonesian and an English
 * reading of one chart are two different cache entries, which is exactly right.
 * Mutating the language after keying would overwrite one language's cached
 * reading with the other's.
 *
 * Only Indonesian ships. The field is built in now because pipeline-spec
 * §BUILD-IN-NOW is explicit that retrofitting it later is painful and adding it
 * now is free.
 */
export function withTargetLanguage(semanticJson, language) {
  return { ...semanticJson, target_language: language };
}

/**
 * Render a chart's semantic JSON into the ordered blocks[] contract.
 *
 * @param {Object} semanticJson Stage 3 output, verbatim. Never modified here -
 *   it is the hash input.
 * @param {Object} [options]
 * @param {string} [options.tier='free_mirror']
 * @param {boolean} [options.allowUnvalidatedCache=false] let a pre-Stage-6 row
 *   count as a hit. QA and the dev script pass true so repeated runs do not
 *   re-buy the same reading; a serve path must never pass it.
 * @param {boolean} [options.allowFallback=true] set false to make an outage
 *   throw instead of silently landing on the floor (used when MEASURING the
 *   providers, where a floor result would quietly count as a pass).
 * @param {typeof fetch} [options.fetchImpl] injected in tests
 * @param {Object} [options.generation] overrides for GENERATION
 * @returns {Promise<{
 *   blocks: Array, penutup: string, source: string, model: string|null,
 *   prompt_version: string|null, cache_key: string, cached: boolean,
 *   attempts: Array<{provider: string, ok: boolean, error?: string}>,
 * }>}
 */
export async function renderReading(semanticJson, {
  tier = DEFAULT_TIER,
  allowUnvalidatedCache = false,
  allowFallback = true,
  fetchImpl,
  generation = {},
} = {}) {
  const key = computeCacheKey(semanticJson);

  // ── Stage 4 ──────────────────────────────────────────────
  const hit = await readCache(key, { includeUnvalidated: allowUnvalidatedCache });
  if (hit) {
    return {
      blocks: hit.blocks,
      penutup: hit.penutup,
      source: hit.source,
      model: hit.model,
      prompt_version: hit.prompt_version,
      cache_key: key,
      cached: true,
      attempts: [],
    };
  }

  // ── the fail-closed key fence ────────────────────────────
  // Before any attempt, and it THROWS rather than falling through. A
  // misconfigured production deploy that quietly served the floor forever would
  // be indistinguishable from a provider outage while meaning something else
  // entirely (G task 1).
  const fenceReason = renderFenceReason();
  if (fenceReason) throw new RenderRefused(fenceReason);

  assertPromptLoaded();

  const config = { ...GENERATION, ...generation, fetchImpl };
  const knownFactIds = (semanticJson.facts || []).map((f) => f.id);
  const attempts = [];

  const chain = [];
  if (geminiConfigured()) {
    chain.push({ name: 'gemini', call: renderWithGemini, model: modelFor(tier, 'gemini') });
  }
  if (openaiConfigured(tier)) {
    chain.push({ name: 'openai', call: renderWithOpenAI, model: modelFor(tier, 'openai') });
  }

  for (const provider of chain) {
    for (let attempt = 1; attempt <= config.attemptsPerProvider; attempt += 1) {
      try {
        const raw = await provider.call(MASTER_PROMPT, semanticJson, {
          ...config, model: provider.model,
        });
        const parsed = parseRenderResponse(raw.text, { knownFactIds });
        attempts.push({ provider: provider.name, ok: true });
        return {
          ...parsed,
          source: raw.provider,
          model: raw.model,
          prompt_version: PROMPT_VERSION,
          cache_key: key,
          cached: false,
          attempts,
        };
      } catch (err) {
        attempts.push({ provider: provider.name, ok: false, error: err.message });
        // `retryable === false` means a second identical call cannot help (bad
        // key, bad request, a shape the model will reproduce). Spending the
        // remaining attempt on it only delays the failover.
        if (err.retryable === false) break;
      }
    }
  }

  // ── the floor ────────────────────────────────────────────
  if (!allowFallback) {
    throw new RenderRefused(
      chain.length === 0 ? 'no_provider_configured' : 'all_providers_failed',
    );
  }
  return { ...assembleFallback(semanticJson), model: null, prompt_version: null,
    cache_key: key, cached: false, attempts };
}

/**
 * Stage 7's store half. THE ONLY WAY A RENDER BECOMES SERVABLE.
 *
 * Refuses while the Stage 6 gate does not exist, so the pre-H state cannot be
 * bypassed by calling this directly. Prompt H sets STAGE6_VERSION and this
 * starts working; nothing else has to change.
 *
 * @param {Object} rendered the result of renderReading
 * @param {Object} semanticJson the JSON it was rendered from
 */
export async function persistRendered(rendered, semanticJson) {
  const reason = serveFenceReason();
  if (reason) throw new RenderRefused(reason);

  await writeCache(rendered.cache_key, {
    engineVersion: semanticJson.engine_version,
    blocks: rendered.blocks,
    penutup: rendered.penutup,
    source: rendered.source,
    model: rendered.model,
    promptVersion: rendered.prompt_version,
    stage6Version: STAGE6_VERSION,
  });
}
