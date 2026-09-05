// ============================================================
// GET /api/keepalive - the Supabase anti-pause ping
// ============================================================
// Driven by the `crons` entry in `vercel.json`. Vercel Cron issues a GET.
//
// The handler lives in `lib/health/keepalive.js` so `node --test` can load it -
// same reason `app/api/mirror/route.js` gives for its own split - and that file
// carries the reasoning, the contract and what this does NOT do. Read it before
// changing either.
//
// THE CONTRACT IN ONE LINE: 200 with `ok: true` if and only if a real database
// round trip succeeded. Never make this route return 200 on a failed ping.
// ============================================================

import { keepAlive } from '@/lib/health/keepalive.js';

export const runtime = 'nodejs';

// A cron ping that got cached would be a ping that never reached the database,
// which is the failure this route is least able to detect on its own.
export const dynamic = 'force-dynamic';

export async function GET(request) {
  return keepAlive(request);
}
