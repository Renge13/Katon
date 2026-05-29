import { nanoid } from 'nanoid';
import { createReading } from '@/lib/readingStore';
import { getFreeContent, hasArchetype } from '@/lib/content';
import { computeChartInputs } from '@/lib/chart';
import { json, badRequest, VALID_DOMAINS } from '@/lib/http';

export const runtime = 'nodejs';

// POST /api/reading
// Compute the chart server-side, resolve element_variant server-side, create a
// row with a CSPRNG bearer token, and return ONLY free content + the token.
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

  // SERVER-SIDE chart computation. The client never supplies day_master or
  // element_variant — they are derived here and persisted, so they can't be
  // tampered with. (Phase 2 replaces the stub in lib/chart.js with the real port.)
  const { dayMaster, elementVariant } = computeChartInputs({ birthDate, birthTime });

  if (!hasArchetype(dayMaster)) {
    // Until all 10 content files land, only resolvable archetypes can be served.
    return json(
      { error: 'archetype_content_unavailable', dayMaster },
      501,
    );
  }

  const id = nanoid(21); // CSPRNG token (nanoid uses crypto), never sequential
  const row = {
    id,
    day_master: dayMaster,
    element_variant: elementVariant,
    domain,
    paid: false,
    wa_number: null,
  };
  await createReading(row);

  const freeContent = getFreeContent(dayMaster, elementVariant, domain);
  return json({ token: id, domain, freeContent });
}
