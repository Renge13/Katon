// ============================================================
// lib/voice.js — which renderer voice is live
// ============================================================
// Voice v2 (docs/content/voice-v2-spec-2026-09-24.md; launch-critical since the
// 2026-09-26 voice rulings): a free Gemini writer over the supplied semantic
// universe, and a deterministic factual reviewer.
//
//   VOICE unset / anything else   v1
//   VOICE=v2                      v2, in every environment, production included
//
// THE PRODUCTION FORCE IS GONE (Prompt AO §4, 2026-09-28). Until this commit,
// `VERCEL_ENV=production` returned v1 whatever VOICE said, because v2 was not yet
// ruled for readers. Production now follows VOICE like Preview, so the voice is an
// ENVIRONMENT decision: set `VOICE=v2` in Vercel Production to serve v2, and set
// `VOICE=v1` (or unset it) and redeploy to roll back. No code revert is needed.
// Read per call, so a test or a script can set it.
// ============================================================

/** @returns {'v1'|'v2'} */
export function voiceVersion() {
  return (process.env.VOICE || '').trim().toLowerCase() === 'v2' ? 'v2' : 'v1';
}
