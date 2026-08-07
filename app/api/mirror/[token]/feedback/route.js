// ============================================================
// POST /api/mirror/[token]/feedback — Stage 7, minimal
// ============================================================
// PROMPT J task 4. Thumbs up/down on a served reading. A 👎 marks the cached
// reading `flagged` and it KEEPS SERVING: pipeline-spec is explicit that pulling
// it leaves a hole for everyone who shares that semantic profile, and a reading
// somebody disliked is not the same thing as a reading that is wrong.
//
// The hard-check exception (fact contradiction, forbidden content) is enforced
// at SERVE time in lib/mirror/handlers.js#floorIfHardFailing, so it applies
// whether or not anyone ever pressed the button.
//
// Same fence as the rest of the route. No UI in J; the funnel wiring comes with
// promotion, whose preconditions are in ../route.js.
// ============================================================

import { recordMirrorFeedback } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { token } = await params; // Next 15: params is async
  return recordMirrorFeedback(request, token);
}
