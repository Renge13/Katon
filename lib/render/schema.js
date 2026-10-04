// ============================================================
// Stage 5 — the structured-output contract
// ============================================================
// pipeline-spec §RESPONSE FORMAT: the LLM returns prose INSIDE a fixed JSON
// shape. renderer-prompt-notes run 1 is why the shape is an ORDERED array rather
// than a fixed set of keys: fixed keys became a template, and the template beat
// the instruction telling the model to choose its own arrangement.
//
// ── A CONTRADICTION IN renderer-prompt.txt, RESOLVED HERE ──
// The prompt's OUTPUT FORMAT section prints the shape twice and the two disagree:
//
//   line 201  { "fact_id": "...", "text": "..." }
//   line 220  { "fact_ids": ["..."], "heading": "...", "text": "..." }
//
// The bullets between them describe `fact_ids` as an array and `heading` as a
// 2-to-5 word label, so two of the three statements agree and the FINAL schema
// block is authoritative. This file implements that one. The prompt is a doc and
// docs win over code here, so the earlier block is REPORTED for Reyner to delete
// rather than silently reconciled. Verified against
// docs/content/renderer-prompt.txt on 2026-08-02:
//   grep -n 'fact_id' docs/content/renderer-prompt.txt
//
// ── WHAT THIS FILE IS NOT ──────────────────────────────────
// STRUCTURAL validation only: is this the right shape, are the ids real, is the
// paragraph-break rule obeyed. Whether the PROSE is true, safe and in voice is
// Stage 6 (Prompt H) and must not start leaking in here.
// ============================================================

/**
 * The response schema in the neutral form both adapters translate. Kept as one
 * object so the two providers cannot drift into asking for different shapes and
 * producing two different bugs.
 */
export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fact_ids: { type: 'array', items: { type: 'string' } },
          heading: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['fact_ids', 'heading', 'text'],
      },
    },
    penutup: { type: 'string' },
  },
  required: ['blocks', 'penutup'],
};

/** Field order for providers that honour one. Matches the prompt's schema block. */
export const PROPERTY_ORDER = ['blocks', 'penutup'];
export const BLOCK_PROPERTY_ORDER = ['fact_ids', 'heading', 'text'];

/**
 * ── THE v2 PAIR ASKS FOR PARAGRAPHS (BC amendment 2c, Reyner 2026-10-04) ──
 * "Give each chapter 2 or 3 paragraph entries rather than one text field." Each block is
 * `paragraphs: string[]` in place of `text`; the parse joins them back into `text`
 * (`parseRenderResponse`'s `paragraphs` option), so Stage 6, the cache, the floor, the PDF
 * and the result page receive exactly the shape they always did. Pair v2 only: the mirror
 * and v1 pairs keep RESPONSE_SCHEMA, byte for byte.
 *
 * `minItems`/`maxItems` ask for two or three. They are a REQUEST to the provider, never a
 * rejection here: a block with one paragraph, or four, is joined as given.
 */
export const PAIR_V2_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fact_ids: { type: 'array', items: { type: 'string' } },
          heading: { type: 'string' },
          paragraphs: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 3 },
        },
        required: ['fact_ids', 'heading', 'paragraphs'],
      },
    },
    penutup: { type: 'string' },
  },
  required: ['blocks', 'penutup'],
};
export const PAIR_V2_BLOCK_PROPERTY_ORDER = ['fact_ids', 'heading', 'paragraphs'];

/** Whether a reading is written in paragraphs: a v2 pair. */
export const writesParagraphs = (semanticJson) => semanticJson?.kind === 'pair' && semanticJson?.voice === 'v2';

export class RenderShapeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RenderShapeError';
  }
}

/**
 * Parse and structurally validate a provider's raw response.
 *
 * Throws rather than returning a result object: every caller is inside the
 * failover chain, where a bad shape and a 500 must be handled identically. A
 * return value invites one call site to forget to check it.
 *
 * @param {string} raw the provider's text response
 * @param {Object} [options]
 * @param {string[]} [options.knownFactIds] ids from the semantic JSON. When given,
 *   every referenced id must exist - an invented id means the renderer invented a
 *   fact, which is the rule-14 violation the whole architecture exists to prevent.
 * @param {boolean} [options.paragraphs] the v2 pair shape (BC amendment 2c): each block
 *   carries `paragraphs: string[]`, joined here into `text` - trimmed, empties dropped, two
 *   newlines between - so nothing downstream sees the difference.
 * @returns {{ blocks: Array<{fact_ids: string[], heading: string, text: string}>, penutup: string }}
 */
export function parseRenderResponse(raw, { knownFactIds, paragraphs = false } = {}) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new RenderShapeError('empty response');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new RenderShapeError(`response is not JSON: ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RenderShapeError('response is not a JSON object');
  }
  if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
    throw new RenderShapeError('blocks must be a non-empty array');
  }
  if (typeof parsed.penutup !== 'string' || parsed.penutup.trim() === '') {
    throw new RenderShapeError('penutup must be a non-empty string');
  }

  const known = knownFactIds ? new Set(knownFactIds) : null;

  const blocks = parsed.blocks.map((block, i) => {
    const at = `blocks[${i}]`;
    if (!block || typeof block !== 'object') throw new RenderShapeError(`${at} is not an object`);
    if (!Array.isArray(block.fact_ids) || block.fact_ids.length === 0) {
      throw new RenderShapeError(`${at}.fact_ids must be a non-empty array`);
    }
    let text = block.text;
    if (paragraphs) {
      if (!Array.isArray(block.paragraphs) || block.paragraphs.some((p) => typeof p !== 'string')) {
        throw new RenderShapeError(`${at}.paragraphs must be an array of strings`);
      }
      text = block.paragraphs.map((p) => p.trim()).filter(Boolean).join('\n\n');
      if (text === '') throw new RenderShapeError(`${at}.paragraphs must hold non-empty text`);
    } else if (typeof text !== 'string' || text.trim() === '') {
      throw new RenderShapeError(`${at}.text must be a non-empty string`);
    }
    for (const id of block.fact_ids) {
      if (typeof id !== 'string') throw new RenderShapeError(`${at}.fact_ids holds a non-string`);
      if (known && !known.has(id)) {
        throw new RenderShapeError(`${at} cites unknown fact "${id}"`);
      }
    }
    return {
      fact_ids: block.fact_ids,
      // The prompt requires a heading; an absent one is a shape defect the
      // failover chain should see, but an EMPTY one is recoverable and the UI
      // simply renders no label. Normalised so downstream never sees undefined.
      heading: typeof block.heading === 'string' ? block.heading.trim() : '',
      text,
    };
  });

  return { blocks, penutup: parsed.penutup };
}
