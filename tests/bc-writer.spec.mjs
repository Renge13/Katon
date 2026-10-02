// ============================================================
// tests/bc-writer.spec.mjs — the compat writer rebuilt (Prompt BC §2)
// ============================================================
// Run: npm run test:bc-writer
//
// Reyner, 2026-10-02 (I1-I6 and the BC decisions): the pair prompt is its own complete
// text (no shared-base line reaches the pair writer), the example is his approved sample,
// the writer opens the reading (I3), and the mirror's prompt is untouched.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { OPENING_FACT_ID, engineOpening } from '../lib/render/pairOpening.js';
import { renderReading, __clearInFlight } from '../lib/render/index.js';
import { PROMPT_VERSIONS_V2, loadPrompt, V2_BASE_PROMPT_TEXT } from '../lib/render/prompt.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';

const A = calculateBaziChart({ birthDate: '2005-02-14', birthTime: '07:00' });
const B = calculateBaziChart({ birthDate: '1999-07-07', birthTime: '17:00' });
const PAIR = buildPairSemantic(A, B, { voice: 'v2', status: 'Menikah', nicknames: { a: 'Nadia', b: 'Bima' } });

test('THE MIRROR PROMPT IS BYTE-IDENTICAL: its version did not move (BC: "must be identical before and after")', () => {
  // A literal on purpose, and it is the one BC asks for: the version as main had it on
  // 2026-10-02 (after #194). If a BC edit reaches the mirror, this goes red.
  assert.equal(PROMPT_VERSIONS_V2.mirror, 'v2-fea0decb8c52e0c1');
});

test('THE PAIR PROMPT IS ITS OWN TEXT: BC\'s block, then the pair example, and no shared-base line', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.startsWith('You write a Katon compatibility reading in Indonesian, for two people'), p.slice(0, 80));
  assert.ok(p.includes('Kalian berdua ibarat The Garden yang tenang dan The Forge yang kokoh.'), 'Reyner\'s sample is the example');
  for (const gone of ['first turn of a conversation', 'not acting as an oracle', 'address her as', 'Must be in it',
    'Sebagai The Ocean', '=== MIRROR EXAMPLES ===', 'Di antara kalian mengalir dinamika Inti Menghidupi']) {
    assert.equal(p.includes(gone), false, `the pair prompt still carries: ${gone}`);
  }
  // Not one paragraph of the shared base survives into it.
  for (const para of V2_BASE_PROMPT_TEXT.split(/\n\s*\n/u).map((x) => x.trim()).filter((x) => x.length > 40)) {
    assert.equal(p.includes(para), false, `a base paragraph reached the pair writer: ${para.slice(0, 60)}`);
  }
});

const okBody = (json) => ({ ok: true, status: 200, json: async () => json, text: async () => '' });
const geminiSays = (text) => okBody({ candidates: [{ content: { parts: [{ text }] } }] });

test('I3: ON A v2 PAIR THE WRITER OPENS - the engine opening is not prepended', async () => {
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  const prev = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test';
  try {
    const floor = assembleFallback(PAIR).blocks.filter((b) => b.fact_ids[0] !== OPENING_FACT_ID);
    const first = { ...floor[0], heading: 'Tarikan Alami', text: `Kalian berdua ibarat The Garden dan The Forge. ${floor[0].text}` };
    const out = await renderReading(PAIR, {
      dedupeInFlight: false,
      spendGuards: false,
      fetchImpl: async () => geminiSays(JSON.stringify({ blocks: [first, ...floor.slice(1)], penutup: 'Kalian punya bahan untuk membangun rumah yang hangat dan kokoh, hari demi hari.' })),
    });
    assert.equal(out.source, 'gemini', `floored: ${JSON.stringify(out.attempts?.at(-1))}`);
    assert.equal(out.blocks[0].heading, 'Tarikan Alami', 'the first block is the writer\'s first chapter');
    assert.ok(out.blocks[0].text.startsWith('Kalian berdua ibarat The Garden dan The Forge.'));
    assert.equal(out.blocks.some((b) => (b.fact_ids || []).includes(OPENING_FACT_ID)), false, 'no engine opening block');
    assert.equal(out.blocks.some((b) => b.text === engineOpening(PAIR).text), false);
  } finally {
    if (prev === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev;
  }
});

test('I3: THE FLOOR still opens with the engine sentence (it has no writer to open it)', () => {
  const floor = assembleFallback(PAIR);
  assert.deepEqual(floor.blocks[0].fact_ids, [OPENING_FACT_ID]);
});
