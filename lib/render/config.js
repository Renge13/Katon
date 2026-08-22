// ============================================================
// Stage 5 — renderer configuration and the API-key fence
// ============================================================
// The tier map lives HERE and nowhere else (G task 1). A call site that names a
// model is a call site that has to be found again when the model changes, and
// pipeline-spec §MODEL-PER-TIER BINDING is explicit that model choice is bound
// to product tier rather than to a global default.
// ============================================================

/**
 * Model per (tier, provider). pipeline-spec §MODEL-PER-TIER BINDING: the free
 * mirror is a straightforward JSON-to-prose job and a fast model is correct for
 * it; compatibility connects contradictory chart elements and buys the deeper
 * model with an invisible fraction of the sale.
 *
 * THERE IS ONE PROVIDER. Ruled by Reyner 2026-08-22: Gemini, with module assembly as
 * the failover. This block used to carry an `openai: null` entry and explain that no
 * document in the repo named a GPT model, so the id had no safe default and the chain
 * skipped the secondary until `KATON_OPENAI_MODEL` was set.
 *
 * That explanation was accurate and it was also the case for deleting the path: a
 * failover armed by an environment variable nobody had set, pointing at a model nobody
 * had chosen, is not a mitigation. It is a branch that reads like one. The consequence
 * of removing it is recorded in PROGRESS rather than softened - a Gemini outage is now
 * a 100% floor rate, and the replacement mitigation is operational rather than
 * architectural.
 */
export const TIER_MODELS = {
  free_mirror: {
    gemini: 'gemini-3.1-flash-lite',
  },
  // Not sold yet. Present so the binding is a table rather than an `if`, and so
  // the compatibility tier cannot quietly inherit the free tier's model.
  compatibility: {
    gemini: process.env.KATON_GEMINI_MODEL_PAID || null,
  },
};

export const DEFAULT_TIER = 'free_mirror';

/**
 * Generation config. Shared by both adapters; each translates it into its own
 * provider vocabulary.
 *
 * temperature: pipeline-spec §Stage 5 allows 0.0-0.2 and the fallback chain
 * specifies 0.2 for both providers. The renderer is choosing words over a fixed
 * fact set, so the small amount of freedom is the point; the determinism
 * guarantee comes from the RESULT CACHE, never from temperature.
 *
 * maxOutputTokens: "punchy" per spec. A chart carries up to ~14 facts and only
 * the top few earn a paragraph, so this is a runaway guard, not a target.
 * Structured output means an overrun truncates mid-JSON and fails the parse,
 * which is the loud failure we want rather than a silently half-written reading.
 *
 * timeoutMs: the spec's failstate list starts with "timeout", so there has to be
 * one. Without an explicit abort, a hung provider socket holds the request until
 * the platform kills it and the failover chain never runs.
 */
export const GENERATION = {
  temperature: 0.2,
  maxOutputTokens: 4096,
  timeoutMs: 45_000,
  /**
   * THE TRANSPORT BUDGET, and only that. Per provider: "retry 1" in the spec's
   * chain means two tries, so 2 here is one identical retry after a retryable
   * failure.
   *
   * IT USED TO BOUND STAGE 6's REGENERATIONS TOO, which was never the intent and
   * made `validationRetries` inert - measured 2026-08-19: budgets of 1, 2 and 3
   * all produced exactly 2 calls. The two counters are separate now
   * (`lib/render/index.js`, the budget note at the loop), so raising THIS number
   * buys more retries of an identical call and nothing else. Raising the
   * REGENERATION budget is `validationRetries`.
   */
  attemptsPerProvider: 2,
};

/**
 * Fail-closed key fence, modelled on lib/paymentFence.js.
 *
 * G task 1: "missing key in production = refuse, never a silent degrade to
 * fallback (a misconfigured deploy must be loud)". The module-assembled fallback
 * is the floor for a PROVIDER OUTAGE. Reaching that floor because someone forgot
 * an env var would look identical from the outside while meaning something
 * completely different, and the whole product would quietly serve its worst
 * output forever.
 *
 * Outside production this returns null: local dev is expected to run with no
 * keys and exercise the fallback path deliberately.
 *
 * @returns {string|null} refusal reason, or null when rendering may proceed.
 */
export function renderFenceReason() {
  if (process.env.NODE_ENV !== 'production') return null;
  if (!process.env.GEMINI_API_KEY) return 'gemini_api_key_unset';
  return null;
}

/** Primary configured? Used by the chain, and by health checks. */
export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// `openaiConfigured` lived here and is GONE, 2026-08-22, with the provider. It is
// worth one line of grave marker rather than silence: it returned false for the whole
// life of the project, because arming the secondary needed a model id that no document
// in this repo ever named. The failover it gated therefore never ran once. Deleting it
// removes an illusion, not a capability - which is the argument Reyner ruled on.

/**
 * @param {string} tier
 * @param {'gemini'} provider
 * @returns {string|null} the model id, or null when the tier/provider is unarmed.
 */
export function modelFor(tier, provider) {
  return TIER_MODELS[tier]?.[provider] ?? null;
}
