import { nanoid } from 'nanoid';
import { createReading } from '@/lib/readingStore';
import { hasArchetype } from '@/lib/content';
import { computeChartInputs } from '@/lib/chart';
import { freeViewFromChart } from '@/lib/readingView';
import { json, badRequest, VALID_DOMAINS } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/reading
// Compute the chart server-side, resolve element_variant server-side, persist the
// raw birth inputs (SERVER-ONLY) + a CSPRNG token, return ONLY free content.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  const { birthDate, birthTime = null, domain = null } = body || {};
  if (!birthDate || typeof birthDate !== 'string') {
    return badRequest('birthDate (YYYY-MM-DD) is required');
  }
  if (domain !== null && !VALID_DOMAINS.includes(domain)) {
    return badRequest(`domain must be one of ${VALID_DOMAINS.join(', ')} or omitted`);
  }

  // SERVER-SIDE chart computation. day_master + element_variant are derived here,
  // never supplied by the client.
  const { dayMaster, elementVariant, chart } = computeChartInputs({ birthDate, birthTime });

  if (!hasArchetype(dayMaster)) {
    return json({ error: 'archetype_content_unavailable', dayMaster }, 501);
  }

  const id = nanoid(21); // CSPRNG token (nanoid uses crypto), never sequential
  await createReading({
    id,
    day_master: dayMaster,
    element_variant: elementVariant,
    domain,
    paid: false,
    wa_number: null,
    // SERVER-ONLY: stored so the chart can be recomputed on every read. Never
    // returned to the client, never logged.
    birth_date: birthDate,
    birth_time: birthTime,
  });

  // Response carries ONLY server-derived content — no birthDate/birthTime echo.
  // (The client already has the birthdate it typed for any local display.)
  const { freeContent, teaser } = freeViewFromChart(chart, domain);
  return json({ token: id, domain, freeContent, teaser });
}
