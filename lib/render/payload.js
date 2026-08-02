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
