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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A LEAF module with no imports of its own, so this cannot close a cycle with
// lib/validate/index.js - which lib/render/index.js already imports.
import { DIRECTIVE_TEMPLATE } from '../validate/directive.js';

/**
 * Where the prompt lives, relative to the repo root.
 *
 * It lives under `docs/` because it is a document Reyner edits, not an asset.
 * `next.config.mjs` adds it to `outputFileTracingIncludes` so the Vercel bundle
 * ships it at this same relative path. If a deploy ever throws here, that trace
 * entry is the thing that broke.
 */
const PROMPT_RELATIVE = join('docs', 'content', 'renderer-prompt.txt');

/**
 * DO NOT rewrite this as `new URL('../../docs/...', import.meta.url)`.
 *
 * That was the original form and it broke `next build` the first time a route
 * imported this module (Prompt J, 2026-08-07). Webpack RECOGNISES that exact
 * literal pattern as an asset reference: it copies the file to
 * `static/media/renderer-prompt.<hash>.txt` and rewrites the expression into a
 * URL built on the PUBLIC path. `readFileSync` then receives a URL whose
 * protocol is not `file:` and throws ERR_INVALID_ARG_TYPE at module load, which
 * fails page-data collection for every route that touches the render chain.
 * Building the path with `path.join` keeps the bundler out of it.
 *
 * Two candidates, tried in order, because neither is reliable alone:
 *   - module-relative, exact under `node --test` and the CLI scripts, and wrong
 *     if a bundler has relocated this file into a chunk;
 *   - cwd-relative, which is what holds on Vercel (the function's working
 *     directory is the traced project root) and in every npm script.
 */
function promptCandidates() {
  const paths = [];
  try {
    paths.push(join(dirname(fileURLToPath(import.meta.url)), '..', '..', PROMPT_RELATIVE));
  } catch {
    // import.meta.url is not a file URL under this loader. The cwd path stands.
  }
  paths.push(join(process.cwd(), PROMPT_RELATIVE));
  return paths;
}

/** CRLF and lone CR both become LF. See the header. */
function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, '\n');
}

function loadPrompt() {
  const tried = promptCandidates();
  for (const path of tried) {
    try {
      return normalizeNewlines(readFileSync(path, 'utf8'));
    } catch {
      // Try the next candidate. A genuinely missing file falls out below, and
      // assertPromptLoaded() is the second net for a file that reads but is
      // wrong.
    }
  }
  throw new Error(`renderer-prompt.txt not found. Tried:\n  ${tried.join('\n  ')}`);
}

/** The master prompt, exactly as sent to every provider. */
export const MASTER_PROMPT = loadPrompt();

/**
 * Content hash of the master prompt AND the regeneration directive's template.
 * Stored as metadata on a cached reading, never part of the cache key.
 *
 * ── WHY THE DIRECTIVE IS IN HERE, ADDED 2026-08-22 ─────────
 * `stricterDirective` is appended to MASTER_PROMPT on every regeneration, so from
 * the model's side it is prompt text - and it had no version stamp of any kind. It
 * moved neither `STAGE6_VERSION` (which is about what the gate ACCEPTS, and the
 * directive accepts nothing) nor this constant (which hashed only the prompt
 * file). An edit to it changed the model's input on every regenerated reading and
 * left no trace on the row.
 *
 * Surfaced by the budget-3 run, where the erosion ladder showed the directive
 * trading findings rather than converging and the follow-up question - was it the
 * directive's wording - had no version to ask against. RULED BY REYNER: it needs
 * one, and it belongs to PROMPT_VERSION because that is what it functionally is.
 *
 * THE SEPARATOR IS NOT DECORATION. Hashing `A + B` without one lets a character
 * moved from the end of the prompt to the start of the template hash identically,
 * which is exactly the collision a version stamp exists to rule out.
 *
 * WHAT THIS DOES NOT COVER, and it is not small: the individual finding MESSAGES
 * interpolated into the template are produced across lib/validate/*.js, so
 * rewording one still changes the model's input without moving any version. See
 * lib/validate/directive.js for why no mechanism for that has been proposed.
 *
 * Truncated to 16 hex chars: this is an attribution label a human reads in a QA
 * table, not a security boundary, and 64 bits is far past the point where two
 * hand-edited prompt versions collide.
 */
export const PROMPT_VERSION = createHash('sha256')
  .update(MASTER_PROMPT)
  .update(' directive ')
  .update(DIRECTIVE_TEMPLATE)
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
