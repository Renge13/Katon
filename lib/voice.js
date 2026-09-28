// ============================================================
// lib/voice.js — which renderer voice is live
// ============================================================
// Voice v2 round 2 (docs/content/voice-v2-spec-2026-09-24.md §7): a free Gemini
// writer over the supplied semantic universe, and a strict factual reviewer, built
// BEHIND A SWITCH so v1 - what production serves - does not move.
//
//   VOICE unset / anything else   v1
//   VOICE=v2                      v2, on Preview and locally
//   VERCEL_ENV=production         v1, WHATEVER VOICE SAYS
//
// The production refusal is structural, the same shape as `paymentsProvider()`
// refusing `mock` there: v2 is not ruled for readers, so no env var typo can put it
// in front of one. Read per call, so a test or a script can set it.
// ============================================================

/** @returns {'v1'|'v2'} */
export function voiceVersion() {
  if (process.env.VERCEL_ENV === 'production') return 'v1';
  return (process.env.VOICE || '').trim().toLowerCase() === 'v2' ? 'v2' : 'v1';
}
