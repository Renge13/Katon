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
import { readFileSync } from 'node:fs';

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

test('BC AMENDMENT 1: the pair prompt asks for both titles in the first chapter, six to eight chapters, and the everyday voice', () => {
  // Reyner, 2026-10-02 (docs/prompts/BC-amendment-1-adjustment-round.md items 2-3). The
  // three lines are his, quoted; a paraphrase is not the ruling.
  const p = loadPrompt('pair', 'v2');
  for (const line of [
    'In the first chapter, name both archetype titles once alongside their names.',
    // Reworded by amendment 2 item 2c, then by 2c item 2a (paragraphs in `paragraphs`).
    'Six to eight chapters. Each chapter is two or three paragraphs',
    'Write with deep intimacy and warmth, removing the invisible wall between the expert and the reader. Use plain, everyday Indonesian (Bahasa Indonesia sehari-hari) but strictly NO slang (tanpa bahasa gaul) and no chat particles. Do not use clinical, abstract, or bureaucratic terms (e.g., avoid \'dinamika\', \'menopang\', \'ruang personal\'). Ground the emotion in vivid, real-world human situations.',
  ]) assert.ok(p.includes(line), `the pair prompt lacks: ${line.slice(0, 70)}`);
});

test('BC AMENDMENT 1 item 6: the pair example says "hubungan kalian", not "dinamika ini", in the prompt and in the approved sample', () => {
  // The voice line now asks the writer to avoid "dinamika", so the example may not model
  // it. Reyner changed exactly one sentence (2026-10-02); both copies carry it.
  const fixed = 'Keajaiban sesungguhnya dari hubungan kalian ada pada elemen Api yang Nadia bawa.';
  const sample = readFileSync(new URL('../docs/content/compat-target-sample-2026-10-02.md', import.meta.url), 'utf8');
  for (const [where, text] of [['the pair prompt', loadPrompt('pair', 'v2')], ['the sample', sample]]) {
    assert.ok(text.includes(fixed), `${where} lacks the fixed sentence`);
    assert.equal(text.includes('dari dinamika ini'), false, `${where} still says "dari dinamika ini"`);
  }
});

// Reyner, 2026-10-04 (docs/prompts/BC-amendment-2-names-close-privacy.md item 2). One test
// per line, so each line's absence is its own red.
test('BC AMENDMENT 2 item 2a: "kamu"/"dia" in the facts are the two people, written by name', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.includes('In the first chapter, name both archetype titles once alongside their names. The facts\' texts are written to a reader: "kamu", "-mu", "dia", "ia" and "-nya" in them refer to the two people. Work out who each one is from the fact\'s provenance (supplier and receiver, `from`/`to`, `a_hits_b`, `b_hits_a`) and write that person\'s name. Never address either person as "kamu" or "-mu".'),
    'a: the names line is missing from "Who is who"');
});

test('BC AMENDMENT 2 item 2b: the penutup sets no conditions and gives no advice', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.includes('No advice, no recap list, no teaser. The penutup sets no conditions and gives no advice: no "jika kalian ..." and no "dengan menyadari ...".'),
    'b: the close line is missing');
});

test('BC AMENDMENT 2 item 2c: about as long as the example, no word-count target', () => {
  const p = loadPrompt('pair', 'v2');
  // The chapter sentence after it was reworded by 2c item 2a; this pins only 2c's own words.
  assert.ok(p.includes('Form: About as long as the example; never pad to reach a length. Six to eight chapters.'),
    'c: the Form line is not "about as long as the example"');
  assert.ok(p.includes('Never pad. Write each archetype'), 'c: the space before "Write" is missing');
  assert.equal(p.includes('800 to 1,000'), false, 'c: the word-count target is still in the prompt');
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
      // A v2 pair answers in `paragraphs` since BC amendment 2c; one paragraph each here.
      fetchImpl: async () => geminiSays(JSON.stringify({
        blocks: [first, ...floor.slice(1)].map(({ text, ...b }) => ({ ...b, paragraphs: [text] })),
        penutup: 'Kalian punya bahan untuk membangun rumah yang hangat dan kokoh, hari demi hari.',
      })),
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

// ── BC AMENDMENT 2c item 2 (Reyner, 2026-10-04): the two prompt edits, one test each ──
test('2c item 2a: the Form line asks for paragraphs (meaning, then a scene) and the JSON shape is paragraphs', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.includes('Six to eight chapters. Each chapter is two or three paragraphs in `paragraphs`: the first says what the fact means for these two people, in the reading\'s voice; the second is a concrete, ordinary-life scene showing how that pattern can appear between them; a third only when it adds something new. Never pad.'),
    'a: the paragraphs instruction is missing from Form');
  assert.ok(p.includes('{"blocks":[{"fact_ids":[...],"heading":"...","paragraphs":["...","..."]}],"penutup":"..."}'), 'a: the JSON shape is not paragraphs');
  assert.equal(p.includes('"text":"..."'), false, 'a: the old text shape is still in the prompt');
  assert.equal(p.includes('Paragraph breaks are two newlines.'), false, 'a: the paragraph-break line is still there');
});

test('2c item 2b: "membawa elemen" only for what one partner brings the other', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.includes('Do not present one chart fact as the chart cause of another unless the JSON says so. Write "membawa elemen" only for what one partner brings to the other (`p3_supply`). Describe a person\'s own element in another way.'),
    'b: the membawa elemen line is missing from Facts');
});

test('2d: the Voice paragraph asks for native Indonesian, not translated pop-psychology (Reyner, 2026-10-06)', () => {
  const p = loadPrompt('pair', 'v2');
  assert.ok(p.includes('Ground the emotion in vivid, real-world human situations. Do not use literal translations of English pop-psychology, therapy jargon, or Western relationship concepts (e.g., avoid unnatural translated phrases like kebersamaan yang disengaja, memegang ruang, or melakukan pekerjaan emosional). Express these ideas using natural, native Indonesian phrasing that people actually say in real life (e.g., menyempatkan waktu berdua, menjaga komunikasi).'),
    'the native-phrasing line is missing from Voice');
  // Dropped by Reyner 2026-10-06: "hadir sepenuhnya" is itself a translation of "be fully present".
  assert.equal(p.includes('hadir sepenuhnya'), false, 'the prompt still offers "hadir sepenuhnya" as an example');
});

// ── BC AMENDMENT 2c item 1 (Reyner, 2026-10-04): A v2 PAIR CHAPTER IS `paragraphs` ──
// "Give each chapter 2 or 3 paragraph entries rather than one text field." ... "Preserve
// the final rendered output format by joining the paragraphs downstream." The schema is read
// off the request the adapter actually sends, so nothing here depends on how it is built.
async function wireSchemaFor(sj) {
  const { renderWithGemini } = await import('../lib/render/providers/gemini.js');
  const prev = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test';
  let body = null;
  try {
    await renderWithGemini('prompt', sj, {
      model: 'm', temperature: 0, maxOutputTokens: 10, timeoutMs: 1000,
      fetchImpl: async (_url, opts) => { body = JSON.parse(opts.body); return geminiSays('{}'); },
    });
  } finally {
    if (prev === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev;
  }
  return body.generationConfig.responseSchema;
}

// The schema every reading was sent before 2c, as a literal: the mirror (and a v1 pair) must
// keep receiving exactly this, byte for byte.
const SCHEMA_BEFORE_2C = {
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
        required: ['fact_ids', 'heading', 'text'],
        propertyOrdering: ['fact_ids', 'heading', 'text'],
      },
    },
    penutup: { type: 'STRING' },
  },
  required: ['blocks', 'penutup'],
  propertyOrdering: ['blocks', 'penutup'],
};

test('2c: THE MIRROR SCHEMA IS BYTE-IDENTICAL, and so is a v1 pair\'s', async () => {
  const { buildSemanticJson } = await import('../lib/semantic/index.js');
  assert.equal(JSON.stringify(await wireSchemaFor(buildSemanticJson(A, { voice: 'v2' }))), JSON.stringify(SCHEMA_BEFORE_2C));
  assert.equal(JSON.stringify(await wireSchemaFor(buildPairSemantic(A, B, { voice: 'v1' }))), JSON.stringify(SCHEMA_BEFORE_2C));
});

test('2c: A v2 PAIR is asked for fact_ids, heading, paragraphs (an array of strings), in that order', async () => {
  const items = (await wireSchemaFor(PAIR)).properties.blocks.items;
  assert.deepEqual(Object.keys(items.properties), ['fact_ids', 'heading', 'paragraphs']);
  assert.deepEqual(items.propertyOrdering, ['fact_ids', 'heading', 'paragraphs']);
  assert.deepEqual(items.required, ['fact_ids', 'heading', 'paragraphs']);
  assert.equal(items.properties.paragraphs.type, 'ARRAY');
  assert.deepEqual(items.properties.paragraphs.items, { type: 'STRING' });
  // Asked for, not enforced here. Gemini enforces them (probed 2026-10-04 on
  // gemini-3.1-flash-lite: an instruction for 1 paragraph returned 2, for 4 returned 3).
  assert.equal(items.properties.paragraphs.minItems, 2);
  assert.equal(items.properties.paragraphs.maxItems, 3);
});

test('2c: THE PAIR PARSE JOINS paragraphs INTO text; one or four are accepted as given; only empty content throws', async () => {
  const { parseRenderResponse, RenderShapeError } = await import('../lib/render/schema.js');
  const raw = JSON.stringify({
    blocks: [
      { fact_ids: ['p1_stem_relation'], heading: 'H1', paragraphs: ['  Satu.  ', '', 'Dua.'] },
      { fact_ids: ['p3_supply'], heading: 'H2', paragraphs: ['Hanya satu.'] },
      { fact_ids: ['p3_supply'], heading: 'H3', paragraphs: ['a.', 'b.', 'c.', 'd.'] },
    ],
    penutup: 'Penutup.',
  });
  const got = parseRenderResponse(raw, { paragraphs: true });
  assert.deepEqual(got.blocks.map((b) => b.text), ['Satu.\n\nDua.', 'Hanya satu.', 'a.\n\nb.\n\nc.\n\nd.']);
  for (const b of got.blocks) assert.deepEqual(Object.keys(b), ['fact_ids', 'heading', 'text'], 'downstream gets today\'s shape');
  assert.equal(got.penutup, 'Penutup.');
  for (const bad of [[], ['', '   '], 'one string', undefined, [3]]) {
    const one = JSON.stringify({ blocks: [{ fact_ids: ['p3_supply'], heading: 'H', paragraphs: bad }], penutup: 'P.' });
    assert.throws(() => parseRenderResponse(one, { paragraphs: true }), RenderShapeError, JSON.stringify(bad));
  }
  // Without the flag (the mirror, a v1 pair) the parse is today's: `text` is required.
  assert.throws(() => parseRenderResponse(raw), RenderShapeError);
});

test('2c: END TO END, a v2 pair served from paragraphs carries joined text and no paragraphs key', async () => {
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  const prev = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test';
  try {
    const floor = assembleFallback(PAIR).blocks.filter((b) => b.fact_ids[0] !== OPENING_FACT_ID);
    const first = [`Kalian berdua ibarat The Garden dan The Forge. ${floor[0].text}`, 'Di rumah, Nadia sering membuka rencana akhir pekan dan Bima menyambutnya.'];
    const model = {
      blocks: [
        { fact_ids: floor[0].fact_ids, heading: 'Tarikan Alami', paragraphs: first },
        ...floor.slice(1).map((b) => ({ fact_ids: b.fact_ids, heading: b.heading, paragraphs: [b.text] })),
      ],
      penutup: 'Kalian punya bahan untuk membangun rumah yang hangat dan kokoh, hari demi hari.',
    };
    const out = await renderReading(PAIR, {
      dedupeInFlight: false, spendGuards: false,
      fetchImpl: async () => geminiSays(JSON.stringify(model)),
    });
    assert.equal(out.source, 'gemini', `floored: ${JSON.stringify(out.attempts?.at(-1))}`);
    assert.equal(out.blocks[0].text, first.join('\n\n'));
    assert.equal(out.blocks.some((b) => 'paragraphs' in b), false);
  } finally {
    if (prev === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev;
  }
});
