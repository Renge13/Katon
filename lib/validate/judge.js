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
//
// ── ADVISORY SINCE STAGE6 1.29.0 (Reyner, 2026-09-24) ──────
// The render pipeline records every finding at `flag` and rejects nothing on it.
// `severity` here is still the SPEC's severity, kept as `judge_severity` there.
//
// ── THE FIX ROUND, 2026-09-24 (after docs/qa/2026-09-24-voice-v2-judge-calibration.md) ──
// Grounding context and implementation fixes only; the classes are the spec's.
//   (a) the prompt says relation fields in provenance ARE grounding, and glosses
//       every value the engine emits. Each gloss is transcribed from the code that
//       defines the value, never recalled (rule 4): elementRelation
//       (lib/semantic/facts.js), CYCLE (lib/compat/stemRelation.js), RELATION
//       (lib/compat/temperament.js), supplyFor (lib/compat/complementarity.js).
//       NOTE relation_to_season is elementRelation(season ruler, Day Master), the
//       arguments the other way round from relation_to_day_master, so the two are
//       glossed separately. tests/voice-judge.spec.mjs pins both on chart 1.
//   (b) J3 is described concretely, from the spec's own definition. The absolute
//       words are ILLUSTRATIONS (Reyner's clarification): the question stays "is
//       this more certain than the supplied facts and meanings support?", and no
//       word list exists anywhere in the gate. The two examples are invented
//       neutral meanings, not facts used by the calibration set.
//   (c) J4 only over the render's own required points: a J4 whose `sentence` is
//       not one of them is malformed, and an empty list admits no J4 at all.
//   (d) a non-finding (`unsupported` empty or "none") is malformed; the `none`
//       option is gone from `missing`.
//   (e) ~~the judge runs on the strongest Gemini model on the account~~
//       (`gemini-3.1-pro-preview`, pinned 2026-09-24). SUPERSEDED 2026-09-26 by
//       Reyner's ruling "Flash-lite only, no Pro" (Prompt AD amendment 2, item 0):
//       the judge runs on the WRITER's model, read from lib/render/config.js so the
//       two cannot drift. J1 was calibrated on Pro; its Flash-lite calibration is
//       docs/qa/2026-09-26-voice-v2-j1-flash-lite-arms.md.
// ============================================================

import { modelFor, DEFAULT_TIER } from '../render/config.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/** (e) The judge's model: the writer's own id (`gemini-3.1-flash-lite` today). */
export const JUDGE_MODEL = modelFor(DEFAULT_TIER, 'gemini');

const JUDGE_PROMPT = `You are the factual reviewer for a Katon reading, an Indonesian BaZi reading written by another model from a JSON of chart facts that Katon's engine calculated.

You receive: "facts" (the complete supplied universe: every chart fact, star, pillar and relationship, with what each means: label_meaning, gift, cost, and relation fields in provenance), "required_points" (the facts whose meaning must be covered), and "reading" (the prose to review).

The writer is EXPECTED to write sentences that do not exist in the JSON. That is the product. Never flag a sentence because it is not verbatim in the JSON. For every candidate sentence ask: Can this statement be reasonably grounded in one or more supplied facts or their supplied meanings, without introducing a new external chart fact, relationship, causal mechanism, or certainty? Yes = interpretation, pass. No = a finding.

Classes:
- J1 unsupported invention: the sentence introduces a chart fact, star, pillar, position or relationship that no supplied fact or supplied meaning can ground. Interpreting what a supplied fact means for the reader is NOT invention.
- J2 invented causality: the sentence asserts that one thing causes or explains another where no supplied relation field (cycle, relation, relation_to_day_master, relation_to_season, from/to, hits) and no supplied meaning supports that link. An interpretive connection already supported by those fields or meanings passes. Stating that two facts sit together (same pillar, same palace) always passes.
- J3 unsupported certainty: the sentence is more certain about the reader's psychology or behaviour than the supplied facts and meanings support. Typically this is a claim made absolute (for example "selalu", "tidak pernah", "sama sekali", "pasti", "dalam keadaan apa pun", or any equivalent) where the supplied meaning it rests on is partial or hedged ("sering", "jarang", "cenderung", "kadang"). The words are illustrations, not a list: judge the certainty of the claim against the certainty of its grounding. An absolute claim that rests on an equally absolute supplied meaning passes.
  Fail example. Supplied meaning: "Kamu cenderung menyimpan perasaan sampai waktunya tepat." Reading: "Kamu tidak pernah membuka perasaanmu kepada siapa pun." J3: the meaning says "cenderung", the sentence says never.
  Pass example. Same supplied meaning. Reading: "Kamu sering menunggu waktu yang tepat sebelum bercerita." As certain as its grounding, no finding.
- J4 meaning coverage: only for the facts listed in "required_points", and never for any other fact. For each listed required point, is its meaning present in the reading, including its cost? Report a J4 finding only when a listed point's meaning is missing; its "sentence" is that point's fact_id, and "missing" is "cost" if the cost is what is missing, else "other". If "required_points" is empty, there is no J4 finding.

Grounding fields. Every relation field inside a fact's "provenance" IS grounding, exactly as its meanings are: a sentence that states or interprets what such a field says is grounded. What each value means:
- relation_to_day_master (on an element, a relation or a seat): how that element stands to the Day Master's element. same = it is the Day Master's own element; feeds = it produces the Day Master's element; drains = the Day Master's element produces it; is_controlled = the Day Master's element controls it; controls = it controls the Day Master's element.
- relation_to_season (on the strength fact): how the Day Master's element stands to season_ruler_element, the element ruling the birth month (month_branch). same = they are the same element; feeds = the Day Master's element produces the season's; drains = the season's element produces the Day Master's; is_controlled = the season's element controls the Day Master's; controls = the Day Master's element controls the season's.
- cycle (p1_stem_relation, the two Day Masters): a_produces_b = A's Day Master element produces B's; b_produces_a = B's produces A's; a_controls_b = A's controls B's; b_controls_a = B's controls A's; same = the same element.
- a_hits_b / b_hits_a (p2_palace_frame) and relations (p2_day_pair): each entry says the pillar in "from" (chart, position, branch) forms "relation" with the pillar in "to", which is the other person's day branch, their spouse seat (Fondasi Pasangan). a_hits_b = a pillar of A reaches B's seat; b_hits_a = a pillar of B reaches A's seat. Positions are pillars: year = Pilar Akar, month = Pilar Kerja, day = Pilar Diri, hour = Pilar Arah.
- relation (半合, 三合, 六合, 冲, 害, 刑): names the branch relation; what it means is the label_meaning supplied with it. combines_into is the element a combination points to, with its own relation_to_day_master.
- hits (on a badge): the pillar or pillars where the badge falls; anchored_on is the pillar it is counted from.
- p3_supply entries: supplier holds "element", which the receiver's chart favours; receiver_favourable_rank 0 = the receiver's first-choice favourable element, 1 = its second choice.
- element_relation (p4_temperament, each person's dominant Aspek against their own Day Master): companion = same element; resource = produces the Day Master's element; output = the Day Master's element produces it; wealth = the Day Master's element controls it; officer = it controls the Day Master's element. relation: same_god = both dominant Aspek are the same; same_group = they share an element_relation; different_group = they do not.

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
          missing: { type: 'STRING', enum: ['cost', 'other'] },
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

/** "none", "None.", "n/a", "-": a finding that says nothing is unsupported. */
const NON_FINDING = /^(?:none|nothing|n\/?a|-)?\.?$/iu;

/**
 * A finding the spec lets us act on: grounding shown, the unsupported claim named.
 * (d) a non-finding is not one. (c) a J4 must name one of the render's OWN required
 * points and say what is missing; with no required points there is no J4.
 *
 * @param {Object} f
 * @param {string[]} [requiredIds] the fact ids of the payload's required_points
 */
export function wellFormed(f, requiredIds = []) {
  if (!Array.isArray(f?.grounding_considered) || f.grounding_considered.length === 0) return false;
  if (typeof f?.unsupported !== 'string' || NON_FINDING.test(f.unsupported.trim())) return false;
  if (!['J1', 'J2', 'J3', 'J4'].includes(f?.class)) return false;
  if (f.class === 'J4') {
    return requiredIds.includes(String(f.sentence).trim()) && ['cost', 'other'].includes(f.missing);
  }
  return true;
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
  model = JUDGE_MODEL, fetchImpl = fetch, timeoutMs = 240_000,
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
          // A thinking model: thought tokens count against this cap, and a
          // truncated JSON is a judge that did not run.
          temperature: 0, maxOutputTokens: 32768,
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
  const requiredIds = (payload.required_points || []).map((r) => r.fact_id);
  const ok = (f) => wellFormed(f, requiredIds);
  return {
    findings: all.filter(ok).map((f) => ({
      ...f, check: `v2.judge_${f.class.toLowerCase()}`, severity: severityOf(f),
    })),
    malformed: all.filter((f) => !ok(f)),
    usage: body?.usageMetadata ?? null,
    model,
  };
}

export { JUDGE_PROMPT };
