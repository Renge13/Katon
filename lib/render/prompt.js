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

/** The pair reading's prompt. Same directory, same tracing entry. */
const COMPAT_PROMPT_RELATIVE = join('docs', 'content', 'compat-renderer-prompt.txt');

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
function promptCandidates(relative) {
  const paths = [];
  try {
    paths.push(join(dirname(fileURLToPath(import.meta.url)), '..', '..', relative));
  } catch {
    // import.meta.url is not a file URL under this loader. The cwd path stands.
  }
  paths.push(join(process.cwd(), relative));
  return paths;
}

/** CRLF and lone CR both become LF. See the header. */
function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, '\n');
}

function readPromptFile(relative) {
  const tried = promptCandidates(relative);
  for (const path of tried) {
    try {
      return normalizeNewlines(readFileSync(path, 'utf8'));
    } catch {
      // Try the next candidate. A genuinely missing file falls out below, and
      // assertPromptLoaded() is the second net for a file that reads but is
      // wrong.
    }
  }
  throw new Error(`${relative} not found. Tried:\n  ${tried.join('\n  ')}`);
}

/** The mirror's master prompt, exactly as sent to every provider. */
export const MASTER_PROMPT = readPromptFile(PROMPT_RELATIVE);

/**
 * Lift one `## HEADING` section out of the mirror prompt, verbatim.
 *
 * ── WHY THE PAIR PROMPT COMPOSES RATHER THAN COPIES ────────
 * Prompt X-b2: "Reuse the mirror prompt's voice, format and prohibition sections
 * VERBATIM ... do not paraphrase - a paraphrased rule is a second rule."
 *
 * A pasted copy satisfies that on the day it is pasted and stops satisfying it
 * the first time Reyner edits the mirror's VOICE section, which is the failure
 * this repo names elsewhere as a second source of truth. Extracting the sections
 * at load time makes the two literally the same bytes, permanently, and makes
 * "did anyone paraphrase" a question a test can answer rather than a promise.
 *
 * THE GOLDEN RULES and VOICE are shared because they are register and ethics,
 * which do not change with the number of subjects. OUTPUT FORMAT is NOT shared:
 * the mirror's says penutup names "who this person is" and mentions
 * `quiet_chart`, both of which are false for a pair. It is written out in the
 * compat file instead, and the JSON schema in it is the same schema.
 */
function sectionOf(text, heading) {
  const start = text.indexOf(`\n${heading}\n`);
  if (start === -1) throw new Error(`renderer-prompt.txt has no section ${heading}`);
  const after = text.indexOf('\n## ', start + 1);
  return text.slice(start + 1, after === -1 ? undefined : after + 1);
}

/** The section headings the pair prompt inherits, in the order it appends them. */
export const SHARED_SECTIONS = ['## THE GOLDEN RULES', '## VOICE'];

/**
 * The pair's master prompt: its own sections, then the mirror's shared ones.
 *
 * Appended AFTER the compat-specific text so the last thing the model reads is
 * the register and the hard bans, which is the order the mirror prompt itself
 * uses.
 */
export const COMPAT_PROMPT = [
  readPromptFile(COMPAT_PROMPT_RELATIVE),
  ...SHARED_SECTIONS.map((h) => sectionOf(MASTER_PROMPT, h)),
].join('\n');

/**
 * Every prompt, by `semanticJson.kind`. `renderOnce` selects with this and has
 * no other way to choose - an unknown kind throws rather than defaulting to the
 * mirror, because silently rendering a pair with the mirror's prompt would
 * produce a reading about one person from two charts.
 */
export const MASTER_PROMPTS = { mirror: MASTER_PROMPT, pair: COMPAT_PROMPT };

// ── VOICE v2 (round 2, 2026-09-24): THE TWO SHORT PROMPTS ─────
// Copied VERBATIM from docs/content/voice-v2-spec-2026-09-24.md §2 and §3 (the
// blockquotes, quote markers removed). The v1 prompts above are untouched and stay
// what production sends.
//
// THE PAIR PROMPT IS THE MIRROR v2 TEXT, THEN THE COMPAT v2 TEXT. §3 opens with
// "Same opening, same rule, same must-nots, for two people" and ends "Form: as the
// mirror", so it is written as a delta on §2 and cannot stand alone; composing the
// two verbatim files is the only way to send it as written. Nothing else is added.
const V2_MIRROR_PROMPT = readPromptFile(join('docs', 'content', 'renderer-prompt-v2.txt'));
const V2_COMPAT_PROMPT = readPromptFile(join('docs', 'content', 'compat-renderer-prompt-v2.txt'));
export const MASTER_PROMPTS_V2 = {
  mirror: V2_MIRROR_PROMPT,
  pair: `${V2_MIRROR_PROMPT}\n${V2_COMPAT_PROMPT}`,
};

/**
 * The prompt for a kind.
 *
 * @param {string} kind `semanticJson.kind`
 * @returns {string}
 */
export function loadPrompt(kind, voice = 'v1') {
  const prompt = (voice === 'v2' ? MASTER_PROMPTS_V2 : MASTER_PROMPTS)[kind];
  if (!prompt) throw new Error(`no master prompt for kind "${kind}"`);
  return prompt;
}

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
const versionOf = (text) => createHash('sha256')
  .update(text)
  .update(' directive ')
  .update(DIRECTIVE_TEMPLATE)
  .digest('hex')
  .slice(0, 16);

/**
 * PER KIND, 2026-09-08. `prompt_version` is stamped on every cached row so a
 * flagged reading is attributable to the exact prompt that produced it, and with
 * two prompts one constant could only ever be right about one of them.
 *
 * THE MIRROR'S VALUE IS UNCHANGED BY THE SPLIT and a test pins it: the hash is
 * computed over the same bytes with the same separator, so every mirror row
 * already in `render_cache` still attributes correctly. A version bump here
 * would have silently orphaned the attribution of every reading in the table.
 */
export const PROMPT_VERSIONS = {
  mirror: versionOf(MASTER_PROMPT),
  pair: versionOf(COMPAT_PROMPT),
};

/**
 * The mirror's prompt version.
 *
 * KEPT AS A NAMED EXPORT rather than replaced by the map, because it is what
 * every existing caller imports and its VALUE has not changed. Renaming it would
 * have made a pure addition look like a change to the mirror's attribution.
 */
export const PROMPT_VERSION = PROMPT_VERSIONS.mirror;

/** v2's own versions, so a v2 row can never be attributed to a v1 prompt. */
export const PROMPT_VERSIONS_V2 = {
  mirror: `v2-${versionOf(MASTER_PROMPTS_V2.mirror)}`,
  pair: `v2-${versionOf(MASTER_PROMPTS_V2.pair)}`,
};

/** The prompt version for a kind, for `persistRendered` to stamp. */
export function promptVersionFor(kind, voice = 'v1') {
  const version = (voice === 'v2' ? PROMPT_VERSIONS_V2 : PROMPT_VERSIONS)[kind];
  if (!version) throw new Error(`no prompt version for kind "${kind}"`);
  return version;
}

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
  // BOTH PROMPTS, 2026-09-08. Checking only the mirror's would leave the pair's
  // exactly as unguarded as the mirror's was before this function existed - and
  // the pair prompt is COMPOSED, so it has a second way to be wrong: a renamed
  // heading in the mirror file would make `sectionOf` throw at import, or a
  // silently empty section would strip the register and the hard bans.
  for (const [kind, prompt] of Object.entries(MASTER_PROMPTS)) {
    const missing = markers.filter((m) => !prompt.includes(m));
    if (prompt.length < 1000 || missing.length > 0) {
      throw new Error(
        `the ${kind} prompt did not load correctly (${prompt.length} chars`
        + `${missing.length ? `, missing ${missing.join(', ')}` : ''})`,
      );
    }
  }
  return true;
}
