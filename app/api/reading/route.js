import { nanoid } from 'nanoid';
import { createReading } from '@/lib/readingStore';
import { hasArchetype } from '@/lib/content';
import { computeChartInputs } from '@/lib/chart';
import { freeViewFromChart } from '@/lib/readingView';
import { json, badRequest, VALID_DOMAINS } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/reading
// Compute the chart server-side, resolve element-state server-side, persist the
// raw birth inputs (SERVER-ONLY) + a CSPRNG token, return ONLY free content.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  const { birthDate, birthTime = null, domain = null, termSide = null, gender = null } = body || {};
  if (!birthDate || typeof birthDate !== 'string') {
    return badRequest('birthDate (YYYY-MM-DD) is required');
  }
  if (domain !== null && !VALID_DOMAINS.includes(domain)) {
    return badRequest(`domain must be one of ${VALID_DOMAINS.join(', ')} or omitted`);
  }
  if (termSide !== null && termSide !== 'before' && termSide !== 'after') {
    return badRequest('termSide must be "before", "after", or omitted');
  }
  if (gender !== null && gender !== 'male' && gender !== 'female') {
    return badRequest('gender must be "male", "female", or omitted');
  }

  // SERVER-SIDE chart computation. day_master + state are derived here,
  // never supplied by the client. termSide only shifts WHICH SIDE of an in-day
  // 節 is read (season gate); it cannot invent an hour pillar and is ignored on
  // any date without a 節 or when a real birthTime is given.
  const { dayMaster, state, chart } = computeChartInputs({ birthDate, birthTime, termSide, gender });

  if (!hasArchetype(dayMaster)) {
    return json({ error: 'archetype_content_unavailable', dayMaster }, 501);
  }

  const id = nanoid(21); // CSPRNG token (nanoid uses crypto), never sequential
  await createReading({
    id,
    day_master: dayMaster,
    state,
    domain,
    paid: false,
    wa_number: null,
    // SERVER-ONLY: stored so the chart can be recomputed on every read. Never
    // returned to the client, never logged.
    birth_date: birthDate,
    birth_time: birthTime,
    // Season-gate answer. Must persist: every read recomputes the chart from
    // this row, so dropping it would change the month pillar on revisit.
    term_side: termSide,
    // Optional. Nothing consumes it yet — it is stored so it does not have to be
    // re-collected when luck pillars (annual reading, luck-pillar map) are built.
    gender,
  });

  // Response carries ONLY server-derived content — no birthDate/birthTime echo.
  // (The client already has the birthdate it typed for any local display.)
  const { freeContent, teaser, chart: chartView } = freeViewFromChart(chart, domain);
  return json({ token: id, domain, freeContent, teaser, chart: chartView });
}
