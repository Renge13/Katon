// ============================================================
// Stage 5 — what the provider is actually shown
// ============================================================
// The semantic JSON is the cache key's input and a QA artifact as well as the
// renderer's prompt, and those three audiences do not want the same fields. This
// module is the one place the three diverge.
//
// ── internal_only WAS A MARKER NOBODY ENFORCED ─────────────
// Stage 3 has declared `internal_only` on three facts since it was written
// (grep -rn "internal_only" lib/, 2026-08-02) and NOTHING read it. A convention
// that only documents an intention will eventually be believed by a reader who
// then ships the field.
//
// scrubInternal() is the enforcement. What it strips:
//   support_share       a SCORE; the prompt bans surfacing any number
//   provenance.percent  the same, one level down
//   presence            the same
//   confidence_reasons  English with hanzi ("root 巳 pulled toward Metal by
//                       半合"), and the prompt bans writing either
//
// ── IT RUNS AFTER THE KEY, NEVER BEFORE ────────────────────
// The cache key is taken over the FULL semantic JSON. Two charts that differ
// only in a stripped field are genuinely different charts and must not collide,
// and the QA row must be able to explain a reading from the same object the
// reading was keyed on. So the scrub is a view for one consumer, not a rewrite
// of the record.
// ============================================================

/** Reads a dotted path like `provenance.percent` off an object. */
function deleteAtPath(target, path) {
  const parts = path.split('.');
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (!node || typeof node !== 'object') return;
    node = node[part];
  }
  if (node && typeof node === 'object') delete node[parts.at(-1)];
}

/**
 * Deep copy with every `internal_only`-listed field removed.
 *
 * The marker is honoured at the level it appears on, which is what lets a fact
 * say `internal_only: ['provenance.percent']` and mean its OWN provenance rather
 * than some other fact's. The marker array is itself stripped: it is engine
 * bookkeeping and naming a field to a model is a good way to make the model
 * mention it.
 *
 * @param {Object} semanticJson
 * @returns {Object} a copy, safe to send to a provider
 */
export function scrubInternal(semanticJson) {
  const copy = structuredClone(semanticJson);

  (function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node.internal_only)) {
      for (const path of node.internal_only) deleteAtPath(node, path);
      delete node.internal_only;
    }
    for (const value of Object.values(node)) walk(value);
  }(copy));

  return copy;
}

/** The engine-owned opening's fact id (lib/render/pairOpening.js OPENING_FACT_ID). */
const OPENING_FACT_ID = 'p0_opening';

/**
 * The payload rules `writerPayload` applies, by kind, for v2. Hashed into the v2
 * prompt version (lib/render/prompt.js) because what the writer RECEIVES is part of
 * its input exactly as the prompt is: a v2 pair row written with the opening
 * withheld must not carry the same prompt_version as one written without the rule.
 */
//
// The archetype clause (G1, 2026-10-02): the writer receives the archetype's English
// title only - its Indonesian name is internal_only in the semantic JSON and scrubbed
// here by `scrubInternal` - so it is named in both rules and both versions move.
export const V2_WRITER_PAYLOAD_RULES = {
  mirror: 'withhold relation label_bracket; archetype by English title only',
  pair: 'withhold p0_opening; archetype by English title only',
};

/**
 * What the WRITER is handed: the scrubbed view, and on a v2 PAIR no opening at all.
 *
 * VOICE v2 PAIRS (Prompt AJ §2, Cowork's ruling, 2026-09-28). The engine owns the
 * pair opening and prepends it (`withEngineOpening`), so the writer has no use for
 * its text - and given it as a fact and a required point, the round-4 writer wrote
 * it AGAIN inside a braided block, which is served (the strip keeps a braided block
 * minus the claim). Removing it here removes the cause. The id stays in the full
 * semantic JSON, so it is still a known fact id: a writer that cites it anyway is
 * stripped by `withEngineOpening` (the backstop), not rejected as an unknown fact.
 * v1 is unchanged: its prompt was measured with the opening in the payload.
 */
export function writerPayload(semanticJson) {
  const copy = scrubInternal(semanticJson);
  if (copy.voice === 'v2' && copy.kind === 'pair') {
    copy.facts = (copy.facts || []).filter((f) => f.id !== OPENING_FACT_ID);
    copy.required_points = (copy.required_points || []).filter((r) => r.fact_id !== OPENING_FACT_ID);
  }
  // ── NO ENGLISH FOR A RELATION, v2 MIRROR (Prompt AV §2 item 3; round 6, AT §2 item 7) ──
  // Reyner, 2026-09-30: English brackets on Arketipe, Aspek and Bintang only, "Drop them
  // entirely for relations like Benturan and Gesekan". The writer is handed no English
  // to copy, so the rule is not left to the prompt; the gate strips what it invents
  // anyway (lib/validate/v2.js stripRelationBrackets). The gate still reads the full
  // semantic JSON; this is the writer's copy only. The pair was not switched.
  if (copy.voice === 'v2' && copy.kind === 'mirror') {
    copy.facts = (copy.facts || []).map((f) => {
      if (!RELATION_KINDS.has(f.provenance?.kind)) return f;
      const { label_bracket: _gone, ...rest } = f;
      return rest;
    });
  }
  return copy;
}

/** Stage 3's relation fact kinds: a branch relation, and the punishment (刑). */
const RELATION_KINDS = new Set(['branch_relation', 'punishment']);

/**
 * Every field name any `internal_only` marker in this payload claims.
 *
 * Stage 6 uses it to assert the scrub actually happened before a render, so a
 * future field that is marked but survives fails a test rather than a user.
 */
export function internalFieldNames(semanticJson) {
  const names = new Set();
  (function walk(node) {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node.internal_only)) {
      for (const path of node.internal_only) names.add(path.split('.').at(-1));
    }
    for (const value of Object.values(node)) walk(value);
  }(semanticJson));
  return [...names];
}
