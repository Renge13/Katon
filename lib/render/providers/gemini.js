// ============================================================
// Stage 5 — GeminiAdapter (primary)
// ============================================================
// One adapter, one job: turn (systemPrompt, semanticJson, config) into text.
// It does not retry, does not fail over and does not validate content. The chain
// in ../index.js owns all three, so that the retry policy is written once rather
// than once per provider.
//
// PAYLOAD ORDER IS LOAD-BEARING (pipeline-spec §PAYLOAD STRUCTURE): the master
// prompt is the identical, cacheable FRONT and goes in `systemInstruction`; the
// chart's semantic JSON is the small varying BACK and goes in `contents`. Chart
// data must never be interleaved into the front or the provider-side prompt
// cache prefix breaks.
// ============================================================

import { RESPONSE_SCHEMA, PROPERTY_ORDER, BLOCK_PROPERTY_ORDER } from '../schema.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export class ProviderError extends Error {
  /**
   * @param {string} message
   * @param {Object} [meta]
   * @param {number} [meta.status] HTTP status, when there was one
   * @param {boolean} [meta.retryable] whether retrying the SAME provider could help
   */
  constructor(message, { status = null, retryable = false } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.status = status;
    this.retryable = retryable;
  }
}

/**
 * 429 and 5xx are transient and worth one retry. 4xx otherwise is a bad request
 * or a bad key, and retrying it just spends the timeout budget twice before
 * reaching the secondary.
 */
export function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

/** Gemini's responseSchema is an OpenAPI subset; it also honours propertyOrdering. */
function geminiSchema() {
  const block = RESPONSE_SCHEMA.properties.blocks.items;
  return {
    type: 'OBJECT',
    properties: {
      blocks: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            fact_ids: { type: 'ARRAY', items: { type: 'STRING' } },
            heading: { type: 'STRING' },
            text: { type: 'STRING' },
          },
          required: [...block.required],
          propertyOrdering: [...BLOCK_PROPERTY_ORDER],
        },
      },
      penutup: { type: 'STRING' },
    },
    required: [...RESPONSE_SCHEMA.required],
    propertyOrdering: [...PROPERTY_ORDER],
  };
}

/**
 * @param {string} systemPrompt the master prompt, verbatim
 * @param {Object} semanticJson Stage 3's output, verbatim
 * @param {Object} config
 * @param {string} config.model
 * @param {number} config.temperature
 * @param {number} config.maxOutputTokens
 * @param {number} config.timeoutMs
 * @param {typeof fetch} [config.fetchImpl] injected in tests
 * @returns {Promise<{ text: string, provider: 'gemini', model: string }>}
 */
export async function renderWithGemini(systemPrompt, semanticJson, config) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ProviderError('GEMINI_API_KEY unset', { retryable: false });
  if (!config.model) throw new ProviderError('no gemini model bound for this tier');

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(semanticJson) }] }],
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      responseMimeType: 'application/json',
      responseSchema: geminiSchema(),
    },
  };

  const fetchImpl = config.fetchImpl || fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  let res;
  try {
    res = await fetchImpl(`${ENDPOINT}/${config.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    // An abort and a socket error are the same thing to the chain: this provider
    // did not answer. Both are worth one retry.
    throw new ProviderError(`gemini request failed: ${err.message}`, { retryable: true });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // The body often carries the real reason (bad key, quota, blocked model) and
    // is worth surfacing; it is provider diagnostics, never user-facing copy.
    const detail = await res.text().catch(() => '');
    throw new ProviderError(`gemini ${res.status}: ${detail.slice(0, 400)}`, {
      status: res.status,
      retryable: isRetryableStatus(res.status),
    });
  }

  const payload = await res.json();
  const text = extractText(payload);
  if (!text) {
    // Empty/garbled counts as a failure and enters the same failover chain
    // (pipeline-spec §Stage 5 failstates). A safety block lands here too, which
    // is correct: a blocked response is not a reading.
    const reason = payload?.candidates?.[0]?.finishReason || payload?.promptFeedback?.blockReason;
    throw new ProviderError(`gemini returned no text${reason ? ` (${reason})` : ''}`, {
      retryable: true,
    });
  }

  return { text, provider: 'gemini', model: config.model };
}

/** Concatenates the candidate's text parts. Tolerates a response split into parts. */
function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('').trim();
}
