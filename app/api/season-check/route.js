import { seasonTurnOnDate } from '@/lib/bazi';
import { json, badRequest } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/season-check   body: { birthDate: "YYYY-MM-DD" }
//
// Asks one question: does a 節 (solar term) fall INSIDE this calendar date?
// On the ~12 days a year it does, a birth with no time has a genuinely
// undetermined MONTH pillar — the boundary sits somewhere in the day and no
// convention recovers it. The funnel uses this to decide whether to show the
// season gate before creating the reading, so the reading is created ONCE with
// the resolved answer instead of being written and then mutated.
//
// Deliberately NOT under /api/reading/: it creates nothing, reads nothing, and
// touches no reading row. It returns public calendar facts only — no chart, no
// day master, no content. Nothing here is gated, because there is nothing to gate.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  const { birthDate } = body || {};
  if (!birthDate || typeof birthDate !== 'string') {
    return badRequest('birthDate (YYYY-MM-DD) is required');
  }

  let turn;
  try {
    turn = seasonTurnOnDate(birthDate);
  } catch {
    return badRequest('birthDate must be a valid YYYY-MM-DD date');
  }

  // needsHour is about THIS DATE, not about a particular user: it is true
  // whenever the date carries a season turn. What the caller does with it depends
  // on what it already knows, which is why `hour` is returned alongside `at`:
  // with no birth time the whole day is unresolved, but with an hour only the
  // hour EQUAL TO `hour` straddles the turn — every other one sits cleanly on a
  // side and needs no question. Same public calendar fact either way; `at` is
  // for display, `hour` is for that comparison, so the caller never has to parse
  // a formatted string back into a number.
  if (!turn) return json({ needsHour: false });
  return json({ needsHour: true, term: turn.term, at: turn.at, hour: turn.hour, minute: turn.minute });
}
