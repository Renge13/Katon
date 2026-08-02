// ============================================================
// Stage 5 — OpenAIAdapter (secondary)
// ============================================================
// Same interface as the Gemini adapter, PLUS the stricter style block.
//
// pipeline-spec §PROVIDER FALLBACK: GPT writes more "AI-ish" than Gemini -
// em-dashes, the bukan-X-tapi-Y hedge, over-polish. renderer-prompt-notes records
// that the bukan/melainkan construction is CONFIRMED UNFIXABLE BY PROMPT ALONE
// (run 5 emitted it twice against an explicit ban), so this block is a tighter
// leash and not a fix. Stage 6 running harder on GPT output is the other half,
// and it belongs to Prompt H.
//
// The style block is APPENDED AFTER the master prompt, never merged into it. The
// master prompt has to stay byte-identical across providers: it is the cacheable
// prefix, and it is the thing prompt_version identifies.
// ============================================================

import { RESPONSE_SCHEMA } from '../schema.js';
import { ProviderError, isRetryableStatus } from './gemini.js';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Transcribed from pipeline-spec §PROVIDER FALLBACK, which states the three
 * constraints in these words. Kept as a quotation of the spec rather than
 * rewritten, so a spec edit and a code edit stay one diff apart.
 *
 * English, and instruction rather than copy, so rule 20's keyboard-characters-only
 * audit does not apply to it - that surface is rendered text, payment
 * descriptions, headings, buttons and error copy. The em-dash inside the ban is
 * the character being banned and must stay.
 */
export const STRICTER_STYLE_BLOCK = [
  '',
  '## ADDITIONAL STYLE CONSTRAINTS',
  '',
  'Hard ban the em-dash (—). Use period or comma.',
  "Ban the 'bukan X, tapi/melainkan Y' construction entirely. State X. New sentence for the cost.",
  "No meta ('sebagai AI'), no English, no rhetorical questions.",
].join('\n');

/** OpenAI strict mode requires additionalProperties:false and every key required. */
function openaiSchema() {
  const block = RESPONSE_SCHEMA.properties.blocks.items;
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { ...block.properties },
          required: [...block.required],
        },
      },
      penutup: { type: 'string' },
    },
    required: [...RESPONSE_SCHEMA.required],
  };
}

/**
 * @param {string} systemPrompt the master prompt, verbatim. The style block is
 *   appended here, inside the adapter, so no call site has to know about it.
 * @param {Object} semanticJson
 * @param {Object} config same shape as the Gemini adapter's
 * @returns {Promise<{ text: string, provider: 'openai', model: string }>}
 */
export async function renderWithOpenAI(systemPrompt, semanticJson, config) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ProviderError('OPENAI_API_KEY unset', { retryable: false });
  if (!config.model) {
    // See TIER_MODELS: no document in this repo names a GPT model, so there is
    // nothing safe to default to.
    throw new ProviderError('no openai model bound for this tier (set KATON_OPENAI_MODEL)');
  }

  const body = {
    model: config.model,
    temperature: config.temperature,
    max_completion_tokens: config.maxOutputTokens,
    messages: [
      { role: 'system', content: `${systemPrompt}\n${STRICTER_STYLE_BLOCK}` },
      { role: 'user', content: JSON.stringify(semanticJson) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'katon_reading', strict: true, schema: openaiSchema() },
    },
  };

  const fetchImpl = config.fetchImpl || fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  let res;
  try {
    res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    throw new ProviderError(`openai request failed: ${err.message}`, { retryable: true });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ProviderError(`openai ${res.status}: ${detail.slice(0, 400)}`, {
      status: res.status,
      retryable: isRetryableStatus(res.status),
    });
  }

  const payload = await res.json();
  const choice = payload?.choices?.[0];
  const text = typeof choice?.message?.content === 'string' ? choice.message.content.trim() : '';
  if (!text) {
    // `length` here means the cap truncated the JSON mid-object. It is a failure,
    // not a short reading, and the parse in schema.js would reject it anyway.
    throw new ProviderError(
      `openai returned no text${choice?.finish_reason ? ` (${choice.finish_reason})` : ''}`,
      { retryable: true },
    );
  }

  return { text, provider: 'openai', model: config.model };
}
