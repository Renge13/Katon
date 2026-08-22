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
//   Gemini (retry 1) -> module assembly. ONE provider since 2026-08-22.
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
  GENERATION, REGENERATION_BUDGET, DAILY_ATTEMPT_CEILING, DEFAULT_TIER, modelFor,
  renderFenceReason,
  geminiConfigured,
} from './config.js';
import { renderWithGemini } from './providers/gemini.js';
import { parseRenderResponse } from './schema.js';
import { assembleFallback } from './fallback.js';
import { scrubInternal } from './payload.js';
import { readCache, writeCache } from './cache.js';
import { STAGE6_VERSION, serveFenceReason } from './fence.js';
import { validateRendering, stricterDirective, forbiddenLiterals } from '../validate/index.js';
import { consume } from '../ratelimit.js';

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
 * @param {number} [options.validationRetries=2] Stage 6's regeneration budget.
 *   TWO since 2026-08-19, set from the depth sweep (18% floor at one, 3% at two,
 *   0-3 points deeper) rather than from Prompt H's original one. Set 0 to measure
 *   the FIRST-PASS rate, which is the number that says whether the prompt works;
 *   the default measures the shipped rate. Independent of the transport retry -
 *   see the budget note at the loop, and note that this arg was INERT until that
 *   loop was fixed.
 * @param {typeof fetch} [options.fetchImpl] injected in tests
 * @param {Object} [options.generation] overrides for GENERATION
 * @returns {Promise<{
 *   blocks: Array, penutup: string, source: string, model: string|null,
 *   prompt_version: string|null, cache_key: string, cached: boolean,
 *   attempts: Array<{provider: string, ok: boolean, error?: string}>,
 * }>}
 */
// ============================================================
// SPEND GUARD (b) — IN-FLIGHT DE-DUPLICATION
// ============================================================
// Nothing de-duplicated a render that was already running. `readCache` returns a
// finished row or null, so every concurrent miss for one chart started its own
// full chain - and against the funnel's 3s poll and a measured p50 of 7.6s per
// attempt (up to ~23s at three attempts), that is roughly EIGHT polls inside one
// render, each one a separate provider chain for the same chart.
//
// IT IS NOT A POLL BUG, which is why the fix lives here and not in the poll. The
// same hazard fires on a plain refresh, two open tabs, or a shared link opened
// twice. The poll is only the loudest caller.
//
// ── WHAT THIS IS, AND WHAT IT IS NOT ──────────────────────
// A process-local promise map. Concurrent callers for one cache key await ONE
// chain and all receive its result.
//
// IT DOES NOT DE-DUPLICATE ACROSS INSTANCES, and that limitation is the reason
// this guard travels with guard (a) rather than instead of it. Serverless
// instances share no memory, so two lambdas holding the same chart still run two
// chains. Guard (a) is the cross-instance bound - it goes through Supabase, so
// three renders per key per hour holds however many instances are involved. This
// one collapses the same-instance burst, which is the shape the poll actually
// produces: one browser, one keep-alive connection, one instance.
//
// The DEFERRED REGISTER row called an in-process map "a cheap complement, not the
// fix", and that is still the honest description. The fix it named - kick the
// render once when the reading is created, let the poll read a status - is a
// funnel change and belongs to the promotion commit. This is the complement,
// landed with the bound that makes it sufficient for now.
//
// ── WHY THE KEY IS NOT JUST THE CACHE KEY ─────────────────
// A shared promise hands the FIRST caller's options to every later one. Two
// callers wanting the same chart with different `validationRetries` or
// `allowUnvalidatedCache` want different renders, and silently serving one the
// other's result would be a correctness bug wearing a performance fix's clothes.
// So the map key carries a signature of every option that can change the RESULT.
//
// An injected `fetchImpl` cannot go in a signature at all, so it is compared by
// REFERENCE on the in-flight entry: share only if it is the identical function
// object, which is trivially true in production where both are undefined.
//
// Reference comparison rather than "never share when injected", which was the
// first cut and was wrong for a reason worth keeping: a test transport is the only
// way to exercise this guard without buying a render, so refusing to share under
// injection would have made the guard permanently untestable. A guard nothing can
// test is a guard nobody can trust.
// ============================================================

/** In-flight renders, pinned on globalThis so Next HMR does not orphan them. */
const inFlight = (globalThis.__katonRenderInFlight ??= new Map());

/** Options that change the RESULT. Anything absent here must not affect output. */
function dedupeSignature(o) {
  return [
    o.tier ?? '', o.allowUnvalidatedCache ? 1 : 0, o.allowFallback === false ? 0 : 1,
    o.validationRetries ?? '', o.modelOverride ?? '', o.captureProse ? 1 : 0,
    o.spendGuards === false ? 0 : 1,
  ].join('|');
}

/**
 * Render a chart, sharing one chain with any identical render already running.
 *
 * @param {Object} semanticJson Stage 3 output, verbatim.
 * @param {Object} [options] see renderOnce.
 * @param {boolean} [options.dedupeInFlight=true] set false to force a private
 *   chain. Only a test measuring concurrency itself should need it.
 */
export async function renderReading(semanticJson, options = {}) {
  const { dedupeInFlight = true, fetchImpl } = options;
  if (!dedupeInFlight) return renderOnce(semanticJson, options);

  const mapKey = `${computeCacheKey(semanticJson)}:${dedupeSignature(options)}`;
  const running = inFlight.get(mapKey);
  // A SHALLOW COPY PER CALLER, not the shared object. Two callers holding one
  // reference means one mutating a field the other reads - a bug that appears
  // only under concurrency and is miserable to find.
  if (running && running.fetchImpl === fetchImpl) return { ...(await running.promise) };
  // A different transport for the same key is a different render. It runs
  // privately rather than displacing the entry the other caller is awaiting.
  if (running) return renderOnce(semanticJson, options);

  const promise = renderOnce(semanticJson, options)
    // Cleared on settle, success or failure. A rejected chain left in the map
    // would pin one chart to its own failure for the life of the instance.
    .finally(() => { inFlight.delete(mapKey); });
  inFlight.set(mapKey, { promise, fetchImpl });
  return { ...(await promise) };
}

/** Test helper. Never called from a request path. */
export function __clearInFlight() {
  inFlight.clear();
}

/**
 * A rendering as markdown, for the QA sidecar trace only.
 *
 * The SAME SHAPE `docs/qa/2026-08-18-retry-depth.json` stored - heading, blank
 * line, text - so one script can read either trace. Do not "improve" it: the value
 * of a tape is that an old one and a new one are comparable.
 */
function proseOf(rendered) {
  const parts = [];
  for (const b of rendered?.blocks || []) {
    if (b.heading) parts.push(`### ${b.heading}`);
    parts.push(b.text || '');
  }
  if (rendered?.penutup) parts.push(rendered.penutup);
  return parts.join('\n\n');
}

async function renderOnce(semanticJson, {
  tier = DEFAULT_TIER,
  allowUnvalidatedCache = false,
  allowFallback = true,
  validationRetries = REGENERATION_BUDGET,
  modelOverride = null,
  // QA ONLY, and off by default on purpose. When true, each attempt record carries
  // the model's PROSE. The QA harness banks it as a sidecar trace so a question
  // asked next week can be answered from prose already paid for; production has no
  // use for a rejected attempt's text and no route should be able to return it by
  // spreading the result object.
  captureProse = false,
  // ── THE SPEND GUARDS, AND WHY THIS SWITCH EXISTS ─────────
  // ON in production. The QA harness turns it OFF, and that is not a convenience:
  // `qa:renders --n 10` renders the SAME chart ten times inside a few minutes, so
  // guard (a) - three renders per cache key per hour - would refuse runs 4 through
  // 10 into the floor and report a 70% floor rate for a system at 10%. The guard
  // would silently destroy the instrument that measures the thing the guard exists
  // to bound.
  //
  // It is off for the harness rather than the harness being special-cased inside
  // the guard, because a guard that knows about its callers is a guard nobody can
  // reason about. Same shape as `captureProse`: QA-only, default-safe, and named
  // at the call site so a route cannot acquire it by accident.
  spendGuards = true,
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
  // NO SECOND PROVIDER. Ruled by Reyner 2026-08-22: one provider, and the
  // deterministic floor is the failover. The loop below still iterates `chain`,
  // which is what keeps the TRANSPORT retry intact - `transportLeft` is scoped per
  // provider, so collapsing the loop away would have taken the 503 retry with it.

  // ── Stage 6's regeneration budget: TWO, set from measurement ──
  // Was ONE, per Prompt H. Raised to TWO on 2026-08-19 on the depth sweep, which
  // is the first evidence anyone had: gate floor 18% at one regeneration, 3% at
  // two, and 0-3 points for everything deeper. The prose cost at the second
  // regeneration is small - 90% keep the archetype image, 9 of 11 keep the named
  // element, characters flat 4623 -> 4636 - and the real erosion only shows up
  // deeper. Artifacts: docs/qa/2026-08-18-retry-depth.md and
  // docs/qa/2026-08-19-retry-erosion.md.
  //
  // ── THE TWO BUDGETS ARE NOW ACTUALLY SEPARATE ──────────────
  // The paragraph here used to claim they were: "sharing one counter between them
  // would let two timeouts consume the budget for a validation problem that was
  // never diagnosed." **They shared one counter anyway.** A single
  // `attempt <= config.attemptsPerProvider` loop bounded both, so two transport
  // failures really did spend the regeneration budget, and - measured before
  // touching anything - raising `validationRetries` was INERT: with
  // attemptsPerProvider 2, budgets of 1, 2 and 3 all produced exactly 2 provider
  // calls. Setting the budget to 2 without this would have changed nothing and
  // looked like it had.
  //
  // So each event now draws on its own counter, which is what makes the number
  // above mean what it says:
  //   transportLeft      identical retries after a retryable failure. A 503 is
  //                      worth the same call again.
  //   regenerationsLeft  calls that have been TOLD what was wrong. A reading that
  //                      says "kuat" about a weak chart is not worth repeating.
  // Total calls per provider are bounded by 1 + transportLeft + regenerationsLeft,
  // so the ceiling stays explicit rather than emergent.
  let regenerationsLeft = validationRetries;
  let directive = '';
  let lastFindings = [];

  // ── SPEND GUARD (a): renders per cache key per hour ───────
  // Charged AFTER the cache read, so a cache hit is free and a returning reader is
  // never counted. Charged BEFORE the first provider call, so a refusal costs
  // nothing.
  //
  // A REFUSAL SERVES THE FLOOR, IT DOES NOT 503. Rule 17 names module assembly as
  // the always-available floor, and this is exactly the condition it is for: the
  // reader still gets a reading, in her language, from ruled glossary strings. A
  // spend guard that took the page away would be trading a cost problem for an
  // availability problem.
  //
  // AND THE FLOOR IS STILL NOT PERSISTED, which is what keeps this from becoming
  // permanent. `persistRendered` refuses it (rule 16), so when the window rolls
  // the next request renders for real. The guard bounds the RATE of healing, never
  // its eventual success.
  //
  // Emptying `chain` is how the refusal reaches the floor: the loop below iterates
  // it, so nothing runs and execution falls through to the floor return, which is
  // the single exit that already knows how to build one. A second floor return
  // here would be a second copy of the thing this file's header warns about.
  let guardRefusal = null;
  if (spendGuards && chain.length > 0) {
    const verdict = await consume('render_per_key', { key });
    if (!verdict.allowed) {
      guardRefusal = verdict.reason === 'limiter_unavailable'
        ? 'spend_guard_limiter_unavailable'
        : 'spend_guard_renders_per_key';
      // Recorded as an attempt so the tape and the QA table can tell a
      // guard-refused floor from a GATE floor. They are different events with the
      // same shape, and the floor-rate measurement must not conflate them - the
      // same trap as counting a transport truncation as a gate floor, which once
      // turned a real 0 of 39 into a reported 3%.
      attempts.push({
        provider: null,
        ok: false,
        stage6: [],
        stage6_detail: [],
        spend_guard: guardRefusal,
        retry_after: verdict.retryAfter,
      });
      chain.length = 0;
    }
  }

  for (const provider of chain) {
    // `attemptsPerProvider` is the TRANSPORT budget and always was, whatever the
    // old loop bound implied: "retry 1 means two tries" (config.js). Minus the
    // first call, it is the number of identical retries.
    let transportLeft = Math.max(0, config.attemptsPerProvider - 1);
    for (;;) {
      // ── SPEND GUARD (c): the hard daily attempt ceiling ────
      // Charged PER ATTEMPT rather than per render, and the difference is the
      // point: a regeneration is a provider call and costs the same as a first
      // call, so a per-render check would let the budget overrun by up to the
      // regeneration budget on every render past the line. This also stops a run
      // mid-chain, which is the correct behaviour for a ceiling - the reader gets
      // the floor rather than the ceiling being treated as advisory.
      if (spendGuards) {
        const daily = await consume('render_attempts_daily', { global: 'all' }, {
          limits: { global: DAILY_ATTEMPT_CEILING },
        });
        if (!daily.allowed) {
          guardRefusal = daily.reason === 'limiter_unavailable'
            ? 'spend_guard_limiter_unavailable'
            : 'spend_guard_daily_ceiling';
          attempts.push({
            provider: provider.name,
            ok: false,
            stage6: [],
            stage6_detail: [],
            spend_guard: guardRefusal,
            retry_after: daily.retryAfter,
          });
          break;
        }
      }

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
        // A transport failure spends the TRANSPORT budget and nothing else. When
        // it is gone, hand this provider over to the next one with the
        // regeneration budget intact - the validation problem was never diagnosed,
        // so it was never this counter's to spend.
        if (transportLeft <= 0) break;
        transportLeft -= 1;
        continue;
      }

      // ── Stage 6 ──────────────────────────────────────────
      const gate = validateRendering(parsed, semanticJson, { provider: provider.name });
      if (gate.ok) {
        attempts.push({
          provider: provider.name, ok: true, regenerated: directive !== '',
          stage6_metrics: gate.metrics,
          ...(captureProse ? { prose: proseOf(gate.normalized) } : {}),
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
      const rejecting = gate.findings.filter((f) => f.severity !== 'flag');
      attempts.push({
        provider: provider.name,
        ok: false,
        stage6: rejecting.map((f) => f.check),
        // THE MESSAGE, NOT ONLY THE NAME. Added 2026-08-22, because a check name
        // is not always an attribution: `fact.condition_named` has TWO passes with
        // two different messages - the fact's own `label_bracket` surfacing, and
        // any name-with-bracket construction inside a conditions-only block - and
        // an n=10 run that recorded names alone made it the leading floor cause
        // (16 firings) while leaving which pass fired unrecoverable. The prose is
        // gone once the run ends, so a rate arrived without its cause and the
        // money was already spent. Same defect as the 08-21 run that produced a
        // floor rate with no floor reasons, one level down.
        stage6_detail: rejecting.map((f) => ({ check: f.check, message: f.message })),
        hard: gate.hard,
        stage6_metrics: gate.metrics,
        ...(captureProse ? { prose: proseOf(parsed) } : {}),
      });

      if (regenerationsLeft > 0) {
        regenerationsLeft -= 1;
        // The chart's condition labels go in so the directive cannot quote one
        // back. `stage6_detail` above keeps the RAW message: the tape needs the
        // literal to diagnose with, the model must not be handed it.
        directive = stricterDirective(gate.findings, forbiddenLiterals(semanticJson));
        continue;
      }
      // Budget spent. H sends this to the floor rather than to the secondary:
      // a provider that exhausted its regenerations is not a transport problem,
      // and the floor is always accurate.
      break;
    }
    if (regenerationsLeft <= 0 && lastFindings.length > 0) break;
  }

  // ── the floor ────────────────────────────────────────────
  if (!allowFallback) {
    throw new RenderRefused(
      guardRefusal
      || (chain.length === 0 ? 'no_provider_configured' : 'all_providers_failed'),
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
    // WAS `stage6_failed_twice`, which stopped being true on 2026-08-19 when the
    // regeneration budget went to two. Renamed rather than left as a value that
    // counts wrong: this string is what a QA reader sees in the `qa_flag` row of
    // `npm run qa:renders`, and a flag naming the wrong number of attempts is the
    // stale-constant defect in a smaller font. Safe to rename - it is in-memory
    // only. `render_cache` has no `qa_flag` column and rule 16 forbids persisting
    // a floor, so no stored row carries the old spelling; the one occurrence in
    // docs/qa/2026-08-17-renders.md is a dated artifact and stays as written.
    // A guard refusal wins the flag. It is the reason the reader is here, and it
    // is not a gate outcome: `lastFindings` is empty on this path because no
    // attempt was made, so the old expression would have reported `null` and left
    // a floor with no cause at all.
    qa_flag: guardRefusal || (lastFindings.length > 0 ? 'stage6_budget_spent' : null),
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
