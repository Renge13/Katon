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
 * THE REGENERATION BUDGET. Stage 6 rejections only - a call that has been TOLD
 * what was wrong (`stricterDirective`).
 *
 * IT LIVES HERE AND NOT AS A DEFAULT PARAMETER because the transport budget
 * directly above it is the constant everyone finds first, and the two were
 * confused for each other once already (see the note on `attemptsPerProvider`).
 * A reader who comes looking for "how many chances does the model get" now finds
 * both numbers in one place, next to the sentence explaining which is which.
 *
 * 2 FROM 2026-08-19 TO 2026-08-22, and that number came from two artifacts rather
 * than a guess: `docs/qa/2026-08-18-retry-depth.md` for the floor curve (18% at
 * one regeneration, 3% at two, and depth 3 bought ZERO further points on that
 * trace) and `docs/qa/2026-08-19-retry-erosion.md` for what the second
 * regeneration costs the prose.
 *
 * ── 3 AS OF 2026-08-22, AND THE PRIOR EVIDENCE IS AGAINST IT ──
 * Raised on Reyner's instruction, as its own commit with its own measurement,
 * and the reason to raise it is NOT that the floor is expected to move. It is
 * that erosion past depth 2 has never been measured at all: the 08-19 probe
 * stopped where the budget stopped, so "what does a third regeneration cost the
 * prose" has no answer, and the budget cannot be argued either way without one.
 *
 * WHAT THE EXISTING EVIDENCE PREDICTS, recorded here BEFORE the run so the
 * prediction cannot be written after the fact:
 *
 *   1. The 08-18 trace measured depth 2 -> 3 as 5% -> 5%. Zero.
 *   2. On `docs/qa/2026-08-22-renders-n10-verify2.md` the dominant floor cause is
 *      `fact.condition_named`, a HARD check, and it SURVIVES the whole existing
 *      budget: 6 of the 8 floored runs show it firing at attempt 1 and again at
 *      the final attempt, after a `stricterDirective` that named it. A fourth
 *      attempt has to fix what two stricter directives did not.
 *
 * So the floor is predicted to move little or not at all, at +1 call on every
 * reading that reaches the budget. If it does move, the prediction was wrong and
 * that is worth more than the floors. If it does not, the number goes back to 2
 * with an erosion curve to show for the trip.
 *
 * ── THE PREDICTION MISSED. POOLED FLOOR 20% -> 10%. ──
 * `docs/qa/2026-08-22-renders-n10-budget3.md`, n=10 per chart, 0 truncations:
 * chart 1 20 -> 0, fresh-1996 30 -> 0, chart 13 20 -> 10, chart 5 10 -> 30 (the
 * only chart that got worse). BOTH pieces of evidence above were the wrong
 * evidence, and how they were wrong is the part to keep:
 *
 *   (1) the 08-18 depth curve was taken on a gate whose depth-2 floor was already
 *       5%, so it had no headroom left to show and could not have predicted THIS
 *       gate either. A depth curve read off one trace by truncation does not
 *       carry across a gate change, because what floors has changed underneath it.
 *   (2) "it survives the whole budget" was read as convergence failure. The
 *       erosion ladder says the runs ALTERNATE - chart 13 run 4 rejects on
 *       cost_dropped, condition_named, cost_dropped, condition_named - so a check
 *       that appears to survive is often a check re-introduced, and an extra draw
 *       against an alternating sequence lands on the good side some of the time.
 *
 * THE COST, measured for the first time at this depth: a regeneration introduces
 * a check the previous attempt PASSED in 45% of steps at 1->2, 65% at 2->3 and
 * 33% at 3->4. `stricterDirective` trades findings rather than converging. So 3
 * is not obviously right either - it is the number the floor rate favours and the
 * erosion rate argues against, and the trade has not been ruled on.
 *
 * ── BACK TO 2, RULED BY REYNER 2026-08-22. THE TRADE IS DECIDED. ──
 * *"Depth 3 is thinner, not tighter. It completely dropped entire factual nodes to
 * hit length targets."*
 *
 * THE RULING IS ON THE PROSE, NOT ON THE FLOOR RATE, and that is the whole of it.
 * The paragraph above set the exit condition as "if the floor does not move, the
 * number goes back to 2" - and the floor DID move, 20% -> 10%, so on the terms
 * this docblock set for itself depth 3 had earned its place. It is being reverted
 * anyway, on evidence the floor rate cannot see: the depth-pair read found depth 3
 * DROPPING FACTUAL NODES to meet length. The padding test passed at depth 3;
 * BREADTH DID NOT.
 *
 * So this is the erosion measurement arriving as a verdict rather than as a curve.
 * The 33% figure at 3->4 above says a regeneration re-introduces a check; what it
 * could not say is WHAT the model gives up to satisfy the stricter directive, and
 * the answer is content. A reading that loses a fact to gain a gate pass is worse
 * than a floored one, because the floor is visible and a missing node is not.
 *
 * IT UN-MET PRECONDITION 3a, AND REYNER RESOLVED THAT ON 2026-08-23 BY REMOVING THE
 * GATE RATHER THAN BY MOVING IT. This paragraph said the collision was real and "NOT
 * RESOLVED HERE", which was correct for a day. His clearance:
 *
 *   "The 10% floor rate threshold is officially removed as a launch blocker. ... A 20%
 *    floor rate represents a safe, graceful degradation rather than a broken customer
 *    state."
 *
 * SO THE ~20% THIS CONSTANT PRODUCES IS THE RULED STATE, not a regression and not a
 * widened threshold. **Nothing here was edited from 10% to 20% and nothing should be:
 * there is no threshold constant in this file, and there is not supposed to be one.**
 * The floor rate is still measured as a dated observation (PROGRESS MEASUREMENTS,
 * 08-23) and it is still the availability budget - rule 15 leaves one provider, so an
 * outage is a 100% floor. It simply no longer decides ship or no-ship.
 */
export const REGENERATION_BUDGET = 2;

// ============================================================
// SPEND GUARD (c) — THE HARD DAILY ATTEMPT CEILING
// ============================================================
// The last line of defence, and the only one that is not per-chart. Guards (a)
// and (b) bound how often ONE chart can be rendered; neither bounds how many
// charts there are. A loop somewhere, a scripted client, or a genuine traffic
// spike puts an unbounded number of distinct cache keys through the chain, and
// every one of them is inside both other guards' limits.
//
// IT IS A CEILING, NOT A BUDGET. It is not sized to expected spend - it is sized
// so that the worst day costs a survivable amount instead of the whole balance.
// The 2026-08-12 incident was credit depletion, discovered by every render
// returning the floor, and removing the OpenAI secondary on 2026-08-22 made that
// failure a 100% floor rate with no architectural mitigation left. This bounds
// the version of it that we cause ourselves.
//
// THE ARITHMETIC, from the ledger's own numbers rather than a guess at the shape:
//   Rp 79 per attempt        (probe-retry-depth, 08-18: 78 attempts for ~Rp 6,200)
//   1.80 attempts per run    (measured 08-22, docs/qa/2026-08-22-renders-n10-postfixes.md)
//   so ~Rp 142 per reading, and 1500 attempts is ~833 readings for ~Rp 118,500.
//
// 833 readings in a day is several times any plausible early-launch day at zero
// current traffic, so an honest spike is not refused; a runaway is capped at a
// loss Reyner can absorb rather than at the balance. UNFITTED, like every other
// number of this kind here - it is an opening bound against a behaviour nobody
// has observed on real traffic, and rule 8 says a measurement goes in PROGRESS.md
// dated, never into a constant that then pretends to be evidence.
//
// THE DAY BOUNDARY IS 00:00 UTC, which is 07:00 in Jakarta. Stated because it is
// surprising rather than because it matters: the fixed-window helper aligns to
// the epoch and an offset would be code for no gain. A ceiling exists to stop a
// runaway, and a runaway does not care which hour the window turns over.
export const DAILY_ATTEMPT_CEILING = 1500;

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
