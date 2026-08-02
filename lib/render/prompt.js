// ============================================================
// Stage 5 — the master prompt is a FILE, and it is versioned
// ============================================================
// docs/content/renderer-prompt.txt is the single source of truth (G task 2).
// It is READ, never pasted into code. renderer-prompt-notes.md exists because a
// second copy already drifted once; a string literal here would be that failure
// with extra steps.
//
// ── WHY THE TEXT IS NEWLINE-NORMALISED ─────────────────────
// prompt_version is stamped onto every cached reading so a flagged reading is
// attributable to the exact prompt that produced it (PROGRESS, 2026-08-02). A
// hash over raw bytes would make that attribution platform-dependent: this repo
// is developed on Windows and deployed on Linux, and although `.gitattributes`
// pins `eol=lf` today, one contributor with a different `core.autocrlf` would
// silently fork the version for identical prompt CONTENT.
//
// The normalisation is applied to the text that is SENT as well as to the text
// that is HASHED, so the two can never disagree. Hashing a normalised form while
// sending a raw one would be worse than not normalising at all.
//
// ── WHY THE VERSION IS NOT THE ENGINE VERSION ──────────────
// They invalidate different things. ENGINE_VERSION changes what is TRUE and so
// participates in the cache key (a bump re-renders everything). prompt_version
// changes only HOW it is worded, and is metadata: editing the prompt must not
// silently invalidate every cached reading in the table. Which readings to
// re-warm after a prompt edit is a judgement call, and it stays one.
// ============================================================

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Resolved against this module rather than cwd, so the loader works from a
 * route handler, a test and a script alike.
 *
 * The file lives under `docs/` because it is a document Reyner edits, not an
 * asset. `next.config.mjs` adds it to `outputFileTracingIncludes` so the Vercel
 * bundle actually ships it. If a deploy ever throws ENOENT here, that trace
 * entry is the thing that broke.
 */
const PROMPT_PATH = new URL('../../docs/content/renderer-prompt.txt', import.meta.url);

/** CRLF and lone CR both become LF. See the header. */
function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, '\n');
}

/** The master prompt, exactly as sent to every provider. */
export const MASTER_PROMPT = normalizeNewlines(readFileSync(PROMPT_PATH, 'utf8'));

/**
 * Content hash of the master prompt. Stored as metadata on a cached reading, never
 * part of the cache key.
 *
 * Truncated to 16 hex chars: this is an attribution label a human reads in a QA
 * table, not a security boundary, and 64 bits is far past the point where two
 * hand-edited prompt versions collide.
 */
export const PROMPT_VERSION = createHash('sha256')
  .update(MASTER_PROMPT)
  .digest('hex')
  .slice(0, 16);

/**
 * Fails loudly at startup if the prompt did not load as expected.
 *
 * An empty or truncated read is the failure mode that would otherwise reach a
 * user as a reading generated with no guardrails at all — the LLM would still
 * answer, and it would answer badly, and nothing else in the pipeline is looking
 * for a missing system prompt. The two markers are structural section headings,
 * so this survives ordinary edits and catches a truncated or wrong file.
 */
export function assertPromptLoaded() {
  const markers = ['## OUTPUT FORMAT', '## VOICE'];
  const missing = markers.filter((m) => !MASTER_PROMPT.includes(m));
  if (MASTER_PROMPT.length < 1000 || missing.length > 0) {
    throw new Error(
      `renderer-prompt.txt did not load correctly (${MASTER_PROMPT.length} chars`
      + `${missing.length ? `, missing ${missing.join(', ')}` : ''})`,
    );
  }
  return true;
}
