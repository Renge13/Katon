// ============================================================
// lib/validate/judge.js — the voice-v2 reviewer, judge half (J1-J4)
// ============================================================
// docs/content/voice-v2-spec-2026-09-24.md §4b. ONE Gemini call per draft, with
// structured output, for the things only reading can catch. It runs after D1-D4
// pass (`./v2.js`).
//
//   J1 unsupported invention   a chart fact / star / pillar / position /
//                              relationship nothing supplied can ground   hard
//   J2 invented causality      a cause no supplied relation or meaning
//                              supports                                   hard
//   J3 unsupported certainty   more certain than the supplied meaning     soft
//   J4 meaning coverage        a required point's meaning missing:
//                              the COST missing is hard, anything else soft
//
// THE GOVERNING QUESTION, verbatim from the spec: "Can this statement be reasonably
// grounded in one or more supplied facts or their supplied meanings, without
// introducing a new external chart fact, relationship, causal mechanism, or
// certainty?" Interpretation passes; only invention is a finding.
//
// ── AUDITABLE, OR IGNORED ──────────────────────────────────
// Every finding must carry `sentence`, `class`, `grounding_considered`,
// `supported`, `unsupported`. One without `grounding_considered` and `unsupported`
// is MALFORMED: it is kept (so it can be read) and never acted on.
//
// ONE FIELD BEYOND THE SPEC'S FIVE, and it exists because the spec's own severity
// needs it: `missing` (`cost` | `other`) on a J4 finding, since "missing cost =
// hard; missing other = soft" cannot be read off five free-text fields reliably.
// ============================================================

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

const JUDGE_PROMPT = `You are the factual reviewer for a Katon reading, an Indonesian BaZi reading written by another model from a JSON of chart facts that Katon's engine calculated.

You receive: "facts" (the complete supplied universe: every chart fact, star, pillar and relationship, with what each means: label_meaning, gift, cost, and relation fields in provenance), "required_points" (the facts whose meaning must be covered), and "reading" (the prose to review).

The writer is EXPECTED to write sentences that do not exist in the JSON. That is the product. Never flag a sentence because it is not verbatim in the JSON. For every candidate sentence ask: Can this statement be reasonably grounded in one or more supplied facts or their supplied meanings, without introducing a new external chart fact, relationship, causal mechanism, or certainty? Yes = interpretation, pass. No = a finding.

Classes:
- J1 unsupported invention: the sentence introduces a chart fact, star, pillar, position or relationship that no supplied fact or supplied meaning can ground. Interpreting what a supplied fact means for the reader is NOT invention.
- J2 invented causality: the sentence asserts that one thing causes or explains another where no supplied relation field (cycle, relation, relation_to_day_master, relation_to_season, from/to, hits) and no supplied meaning supports that link. An interpretive connection already supported by those fields or meanings passes. Stating that two facts sit together (same pillar, same palace) always passes.
- J3 unsupported certainty: the sentence is more certain about the reader's psychology or behaviour than the supplied meaning supports.
- J4 meaning coverage: for each required point, is its meaning present in the reading, including its cost? Report a J4 finding only when a required point's meaning is missing; set "missing" to "cost" if the cost is what is missing, else "other".

Worked example that must PASS: "Orang melihat ketenanganmu. Mereka jarang melihat berapa banyak yang kamu tahan untuk tetap terlihat tenang." It is grounded in element_dominant_Water gift/cost and aspek_convergence_正官 cost, and introduces no new chart fact.

Every finding must show its grounding: "sentence" (the quoted sentence; for J4 the required point's fact id), "class", "grounding_considered" (the fact ids you checked as possible grounding), "supported" (briefly, which part the facts do support), "unsupported" (briefly, the specific claim that remains unsupported; for J4 the meaning that is missing). Report only real findings. If the reading has none, return an empty list.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sentence: { type: 'STRING' },
          class: { type: 'STRING', enum: ['J1', 'J2', 'J3', 'J4'] },
          grounding_considered: { type: 'ARRAY', items: { type: 'STRING' } },
          supported: { type: 'STRING' },
          unsupported: { type: 'STRING' },
          missing: { type: 'STRING', enum: ['cost', 'other', 'none'] },
        },
        required: ['sentence', 'class', 'grounding_considered', 'supported', 'unsupported'],
      },
    },
  },
  required: ['findings'],
};

/** The severity the spec assigns each class. */
export function severityOf(f) {
  if (f.class === 'J1' || f.class === 'J2') return 'hard';
  if (f.class === 'J4') return f.missing === 'cost' ? 'hard' : 'soft';
  return 'soft'; // J3
}

/** A finding the spec lets us act on: grounding shown, the unsupported claim named. */
export function wellFormed(f) {
  return Array.isArray(f?.grounding_considered) && f.grounding_considered.length > 0
    && typeof f?.unsupported === 'string' && f.unsupported.trim().length > 0
    && ['J1', 'J2', 'J3', 'J4'].includes(f?.class);
}

/**
 * Review one draft.
 *
 * @param {Object} rendered `{blocks, penutup}`
 * @param {Object} payload the SCRUBBED semantic JSON the writer saw
 * @param {Object} [options] `{model, fetchImpl, timeoutMs}`
 * @returns {Promise<{findings: Array, malformed: Array, usage: Object|null, model: string}>}
 *   `findings` are well-formed and carry `severity`; `malformed` are kept for reading.
 * @throws {Error} on a transport or parse failure - the caller treats "the reviewer
 *   could not run" as "not validated", never as a pass (rule 17).
 */
export async function judgeRendering(rendered, payload, {
  model = 'gemini-3.1-flash-lite', fetchImpl = fetch, timeoutMs = 60_000,
} = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('judge: GEMINI_API_KEY unset');
  const input = {
    facts: {
      core: payload.core, strength: payload.strength, chart: payload.chart,
      facts: payload.facts, mirror: payload.mirror,
    },
    required_points: payload.required_points,
    reading: { blocks: rendered.blocks, penutup: rendered.penutup },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(`${ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: JUDGE_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
        generationConfig: {
          temperature: 0, maxOutputTokens: 4096,
          responseMimeType: 'application/json', responseSchema: SCHEMA,
        },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`judge: gemini ${res.status}`);
  const body = await res.json();
  const text = (body?.candidates?.[0]?.content?.parts || []).map((p) => p?.text || '').join('');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('judge: response is not JSON'); }
  const all = Array.isArray(parsed?.findings) ? parsed.findings : [];
  return {
    findings: all.filter(wellFormed).map((f) => ({
      ...f, check: `v2.judge_${f.class.toLowerCase()}`, severity: severityOf(f),
    })),
    malformed: all.filter((f) => !wellFormed(f)),
    usage: body?.usageMetadata ?? null,
    model,
  };
}

export { JUDGE_PROMPT };
