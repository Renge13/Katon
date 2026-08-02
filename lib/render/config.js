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
 * `openai` is null on purpose. NO DOCUMENT IN THIS REPO NAMES A GPT MODEL -
 * pipeline-spec says "GPT secondary" and stops there, and G names only the
 * Gemini model. Guessing an id here would put an unverifiable string on the
 * failover path where nothing exercises it until the day Gemini is down. Set
 * KATON_OPENAI_MODEL to arm the secondary; until then the chain skips it and
 * says so.
 */
export const TIER_MODELS = {
  free_mirror: {
    gemini: 'gemini-3.1-flash-lite',
    openai: process.env.KATON_OPENAI_MODEL || null,
  },
  // Not sold yet. Present so the binding is a table rather than an `if`, and so
  // the compatibility tier cannot quietly inherit the free tier's model.
  compatibility: {
    gemini: process.env.KATON_GEMINI_MODEL_PAID || null,
    openai: process.env.KATON_OPENAI_MODEL_PAID || null,
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
  /** Per provider, per attempt. "retry 1" in the spec's chain means two tries. */
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

/**
 * Secondary configured? Needs BOTH a key and a model id, because the model id
 * has no safe default (see TIER_MODELS).
 */
export function openaiConfigured(tier = DEFAULT_TIER) {
  return Boolean(process.env.OPENAI_API_KEY && TIER_MODELS[tier]?.openai);
}

/**
 * @param {string} tier
 * @param {'gemini'|'openai'} provider
 * @returns {string|null} the model id, or null when the tier/provider is unarmed.
 */
export function modelFor(tier, provider) {
  return TIER_MODELS[tier]?.[provider] ?? null;
}
