// ============================================================
// lib/validate/judge.js — the voice-v2 reviewer, judge half (J1-J3; J4 removed 1.39.0)
// ============================================================
// docs/content/voice-v2-spec-2026-09-24.md §4b. ONE Gemini call per draft, with
// structured output, for the things only reading can catch. It runs after D1-D4
// pass (`./v2.js`).
//
//   J1 unsupported invention   a chart fact / star / pillar / position /
//                              relationship nothing supplied can ground, or
//                              a past event claimed as real              hard
//   J2 invented chart cause    a CHART cause the engine did not supply    hard
//   J3 predictive certainty    rule 25 only: a certain future event,
//                              health, money or fate                      soft
//
// ── 1.39.0: THE RUBRIC CHANGE (Prompt AD Job B, amendment 1 item 5 + amendment 2 item 1, 2026-09-26) ──
// Reyner's C4/C5/C6 and B9. J1 learns the scene boundary: an illustration framed as
// possible or typical is not invention; a claimed past event, or a chart fact the
// engine did not give, still is. J2 flags only an invented CHART cause
// ("Karena pola ini, ..." is interpretation). J3 is narrowed to rule 25; certainty
// about who the person is passes. J4 is removed, and with it `required_points`
// from the judge's input and the `missing` field. The call is still ONE call, so
// every one of these edits is also an edit to what J1 reads - recalibrated on the
// final combined prompt. First on Pro (side branch 38a7a2c, FAILED: invented chart
// facts used as causes were filed as J2); the precedence line in J2 is the fix
// (amendment 2 item 1), measured on Flash-lite in
// docs/qa/2026-09-26-voice-v2-j1-flash-lite-arms.md.
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
// ~~ONE FIELD BEYOND THE SPEC'S FIVE: `missing` on a J4 finding~~ - removed with J4
// in 1.39.0. A finding is the spec's five fields again.
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
//   (c) [J4 removed in 1.39.0] J4 only over the render's own required points: a J4 whose `sentence` is
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

You receive: "facts" (the complete supplied universe: every chart fact, star, pillar and relationship, with what each means: label_meaning, gift, cost, and relation fields in provenance) and "reading" (the prose to review).

The writer is EXPECTED to write sentences that do not exist in the JSON. That is the product. Never flag a sentence because it is not verbatim in the JSON. For every candidate sentence ask: Can this statement be reasonably grounded in one or more supplied facts or their supplied meanings, without introducing a new external chart fact, relationship, chart cause, or prediction? Yes = interpretation, pass. No = a finding.

Classes:
- J1 unsupported invention: the sentence introduces a chart fact, star, pillar, position or relationship that no supplied fact or supplied meaning can ground. Interpreting what a supplied fact means for the reader is NOT invention.
  Illustrative scenes. The writer may illustrate a supplied pattern with a scene framed as possible or typical: "Misalnya, ketika ...", "Dalam keseharian, ini bisa terasa seperti ...", "biasanya ...". Such a scene is an example of the pattern, not a claim, and it is NOT invention when the pattern it illustrates is grounded. Two things are J1 even inside a scene: (1) a claim that something actually happened to the reader or the other person ("Tahun lalu kamu ...", "waktu kuliah kamu ...", "bulan lalu dia ..."), because the engine knows no events in anyone's life; (2) a chart fact, star, pillar, position or relationship that the supplied facts do not give, whatever framing carries it, including when it is given as the reason for something ("karena Pilar Kerja-mu berunsur Api" when the month pillar is not Fire).
- J2 invented chart causality: If the cause is itself a chart fact the supplied facts do not contain, it is J1, not J2. J2 is only for a link the engine does not make between supplied facts: the sentence says one SUPPLIED pillar, element, star, Aspek, position or relation causes or explains another, and no supplied relation field or meaning makes that link. Interpretive causality is legitimate and always passes: "Karena pola ini, ...", "itu sebabnya ...", or any sentence connecting a supplied fact or meaning to how the reader lives, feels or acts is interpretation, not a finding. A link a supplied relation field (cycle, relation, relation_to_day_master, relation_to_season, from/to, hits) supports passes. Stating that two facts sit together (same pillar, same palace) always passes.
- J3 predictive certainty: ONLY a sentence that states as certain an event that will happen, a health outcome, a money outcome, or a fate (for example "tahun depan kariermu pasti naik", "kalian akan berpisah", "kamu akan sakit kalau ..."). Certainty about who the person is, how they tend to act, or what the relationship is like is NEVER J3, however absolute: "Kamu selalu yang pertama membereskan masalah" passes.

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

Every finding must show its grounding: "sentence" (the quoted sentence), "class", "grounding_considered" (the fact ids you checked as possible grounding), "supported" (briefly, which part the facts do support), "unsupported" (briefly, the specific claim that remains unsupported). Report only real findings. If the reading has none, return an empty list.`;

// J4 (meaning coverage) is GONE since 1.39.0: Prompt AD Job B, C6 (Reyner:
// "REMOVE. A writing teacher.") and amendment 1 item 5. Not in the prompt, not in
// the enum, and a J4 the model returns anyway is malformed, never acted on.
const CLASSES = ['J1', 'J2', 'J3'];

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sentence: { type: 'STRING' },
          class: { type: 'STRING', enum: CLASSES },
          grounding_considered: { type: 'ARRAY', items: { type: 'STRING' } },
          supported: { type: 'STRING' },
          unsupported: { type: 'STRING' },
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
  return 'soft'; // J3
}

/** "none", "None.", "n/a", "-": a finding that says nothing is unsupported. */
const NON_FINDING = /^(?:none|nothing|n\/?a|-)?\.?$/iu;

/**
 * A finding the spec lets us act on: grounding shown, the unsupported claim named,
 * one of the live classes. (d) a non-finding is not one; a J4 is not one since
 * 1.39.0.
 *
 * @param {Object} f
 */
export function wellFormed(f) {
  if (!Array.isArray(f?.grounding_considered) || f.grounding_considered.length === 0) return false;
  if (typeof f?.unsupported !== 'string' || NON_FINDING.test(f.unsupported.trim())) return false;
  return CLASSES.includes(f?.class);
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
  const ok = (f) => wellFormed(f);
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
