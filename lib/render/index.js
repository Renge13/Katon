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
import { scrubInternal } from './payload.js';
import { readCache, writeCache } from './cache.js';
import { STAGE6_VERSION, serveFenceReason } from './fence.js';
import { validateRendering, stricterDirective } from '../validate/index.js';

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
 * @param {number} [options.validationRetries=1] Stage 6's regeneration budget.
 *   One, per Prompt H. Set 0 to measure the FIRST-PASS rate, which is the number
 *   that says whether the prompt works; the default measures the shipped rate.
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
  validationRetries = 1,
  modelOverride = null,
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
      // Passed through so a HIT is as attributable as a fresh render. The row
      // has always carried it; the cached branch simply never surfaced it,
      // which left a serve path unable to say which gate cleared the text it
      // was about to send (Prompt J).
      stage6_version: hit.stage6_version,
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
  // The provider sees a scrubbed VIEW. The key was already taken over the full
  // object above, so stripping here cannot move a chart's cache entry.
  const payload = scrubInternal(semanticJson);
  const knownFactIds = (semanticJson.facts || []).map((f) => f.id);
  const attempts = [];

  const chain = [];
  if (geminiConfigured()) {
    // modelOverride exists for the measurement harness's rider arm, which runs a
    // second model in the SAME batch. It is deliberately not a config entry: a
    // model choice that outlives one measurement belongs in TIER_MODELS, where
    // it is bound to a tier and reviewable.
    chain.push({
      name: 'gemini',
      call: renderWithGemini,
      model: modelOverride || modelFor(tier, 'gemini'),
    });
  }
  if (openaiConfigured(tier)) {
    chain.push({ name: 'openai', call: renderWithOpenAI, model: modelFor(tier, 'openai') });
  }

  // ── Stage 6's regeneration budget ────────────────────────
  // ONE, total, per Prompt H: "Fail -> regenerate ONCE with a stricter directive
  // appended. Fail twice -> serve the module-assembled fallback + flag."
  //
  // It is separate from the TRANSPORT retry above. A 503 and a reading that
  // says "kuat" about a weak chart are different events: the first is worth an
  // identical second call, the second is only worth a call that has been told
  // what was wrong. Sharing one counter between them would let two timeouts
  // consume the budget for a validation problem that was never diagnosed.
  let regenerationsLeft = validationRetries;
  let directive = '';
  let lastFindings = [];

  for (const provider of chain) {
    for (let attempt = 1; attempt <= config.attemptsPerProvider; attempt += 1) {
      let parsed;
      let raw;
      try {
        raw = await provider.call(`${MASTER_PROMPT}${directive}`, payload, {
          ...config, model: provider.model,
        });
        parsed = parseRenderResponse(raw.text, { knownFactIds });
      } catch (err) {
        // A malformed or fact-inventing response is a MODEL failure, not a
        // provider one. Tagged so the harness can keep the two apart: counting a
        // schema violation as a transport error credits the model for output it
        // never managed to produce.
        attempts.push({
          provider: provider.name, ok: false, error: err.message,
          shape: err.name === 'RenderShapeError',
        });
        // `retryable === false` means a second identical call cannot help (bad
        // key, bad request, a shape the model will reproduce). Spending the
        // remaining attempt on it only delays the failover.
        if (err.retryable === false) break;
        continue;
      }

      // ── Stage 6 ──────────────────────────────────────────
      const gate = validateRendering(parsed, semanticJson, { provider: provider.name });
      if (gate.ok) {
        attempts.push({
          provider: provider.name, ok: true, regenerated: directive !== '',
          stage6_metrics: gate.metrics,
        });
        return {
          ...gate.normalized,
          source: raw.provider,
          model: raw.model,
          prompt_version: PROMPT_VERSION,
          stage6_version: gate.stage6_version,
          findings: gate.findings, // 'flag' findings can survive a pass
          cache_key: key,
          cached: false,
          attempts,
        };
      }

      lastFindings = gate.findings;
      attempts.push({
        provider: provider.name,
        ok: false,
        stage6: gate.findings.filter((f) => f.severity !== 'flag').map((f) => f.check),
        hard: gate.hard,
        stage6_metrics: gate.metrics,
      });

      if (regenerationsLeft > 0) {
        regenerationsLeft -= 1;
        directive = stricterDirective(gate.findings);
        continue;
      }
      // Budget spent. H sends this to the floor rather than to the secondary:
      // a provider that failed validation twice is not a transport problem, and
      // the floor is always accurate.
      break;
    }
    if (regenerationsLeft <= 0 && lastFindings.length > 0) break;
  }

  // ── the floor ────────────────────────────────────────────
  if (!allowFallback) {
    throw new RenderRefused(
      chain.length === 0 ? 'no_provider_configured' : 'all_providers_failed',
    );
  }
  return {
    ...assembleFallback(semanticJson),
    model: null,
    prompt_version: null,
    // The floor is engine content, not model output, so no gate ran over it. It
    // is servable because rule 17 names module assembly as the always-available
    // floor beneath both providers, and it is marked so a QA row can tell the
    // two apart at a glance.
    stage6_version: `${STAGE6_VERSION}-floor`,
    // Prompt H: fail twice -> fallback AND flag the chart for human QA.
    qa_flag: lastFindings.length > 0 ? 'stage6_failed_twice' : null,
    findings: lastFindings,
    cache_key: key,
    cached: false,
    attempts,
  };
}

/**
 * Stage 7's store half. THE ONLY WAY A RENDER BECOMES SERVABLE.
 *
 * Refuses while the Stage 6 gate does not exist, so the pre-H state cannot be
 * bypassed by calling this directly. Prompt H sets STAGE6_VERSION and this
 * starts working; nothing else has to change.
 *
 * ── THE FLOOR SERVES, IT DOES NOT STORE (rule 16, amended 2026-08-07) ──
 * A module-assembled result means the providers could not deliver: an outage, a
 * rate limit, two validation failures. Freezing that into the cache would let a
 * one-hour Gemini blip cost those charts their real reading PERMANENTLY, because
 * the next request is a cache hit and the chain never runs again. The key only
 * moves when ENGINE_VERSION does, which may be months.
 *
 * So the floor is served and discarded, and the next request retries. The
 * determinism guarantee is unharmed where it matters: it now reads "deterministic
 * after the first generation THAT PASSES STAGE 6", and a floor result never was
 * one - `assembleFallback` is pure engine content, so re-deriving it is
 * byte-identical anyway. The only visible consequence is that a reader who saw
 * the floor during an outage sees the real reading afterwards, which is the
 * direction anyone would choose.
 *
 * Enforced HERE rather than in the caller because this is the single door. A
 * rule that lives in one route is a rule the next route does not know about.
 *
 * @param {Object} rendered the result of renderReading
 * @param {Object} semanticJson the JSON it was rendered from
 * @returns {Promise<boolean>} true when a row was written, false when the result
 *   was the floor and was deliberately not stored.
 */
export async function persistRendered(rendered, semanticJson) {
  const reason = serveFenceReason();
  if (reason) throw new RenderRefused(reason);

  // Returned rather than thrown: every serve path calls this on every miss, and
  // an outage is an ordinary event on that path, not a programming error.
  if (rendered.source === 'module_assembly') return false;

  await writeCache(rendered.cache_key, {
    engineVersion: semanticJson.engine_version,
    blocks: rendered.blocks,
    penutup: rendered.penutup,
    source: rendered.source,
    model: rendered.model,
    promptVersion: rendered.prompt_version,
    // The version the reading ACTUALLY passed, not the version installed today.
    // Taking it off the result rather than off the import is what keeps a row
    // honest about which gate cleared it. The `-floor` variant can no longer
    // reach this line, but the read stays result-side: a future result that
    // passes an OLDER gate must still record the older gate.
    stage6Version: rendered.stage6_version ?? STAGE6_VERSION,
  });
  return true;
}
