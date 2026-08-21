// ============================================================
// Stage 6 — text helpers
// ============================================================
// ── THE HARD PROBLEM THIS FILE EXISTS FOR ──────────────────
// The gate has to check that a rendered block "carries the substance of" an
// engine string. It CANNOT do that by substring match, because the master prompt
// explicitly forbids the thing a substring match would look for:
//
//   "Render them in your own words. [...] Do NOT copy them verbatim either."
//
// Run 2 of the live experiments failed for exactly the opposite reason - it
// became transcription. So a verbatim check would grade the one failure mode the
// prompt was rewritten to eliminate as a perfect pass, and grade correct
// rewriting as a miss.
//
// The proxy used instead is DISTINCTIVE-STEM OVERLAP: strip stopwords and short
// words from the engine string, prefix-match what remains against the block, and
// require a few hits. It is a proxy and it is honest about being one -
// `coverageThreshold` is UNFITTED and the measurement harness reports the
// distribution so it can be set from data rather than from taste.
//
// Prefix matching rather than equality because Indonesian affixes heavily:
// `tenaga` -> `tenagamu`, `dukung` -> `dukungan`/`mendukung`. Comparing whole
// words would miss most real paraphrase.
// ============================================================

/**
 * Indonesian function words. Deliberately SHORT: this list only has to stop
 * common words from counting as evidence of paraphrase, and every word added
 * here makes the check weaker, not stronger.
 */
const STOPWORDS = new Set([
  'yang', 'dan', 'atau', 'tetapi', 'tapi', 'untuk', 'dari', 'pada', 'dengan',
  'dalam', 'akan', 'sudah', 'belum', 'tidak', 'bukan', 'juga', 'saja', 'lebih',
  'sangat', 'bisa', 'dapat', 'harus', 'masih', 'karena', 'seperti', 'ketika',
  'saat', 'kamu', 'kamumu', 'dirimu', 'diri', 'orang', 'lain', 'lainnya',
  'itu', 'ini', 'ada', 'adalah', 'sebagai', 'oleh', 'agar', 'supaya', 'setiap',
  'kalau', 'jika', 'maka', 'sering', 'jarang', 'selalu', 'pernah', 'nya',
  'satu', 'dua', 'para', 'punya', 'membuat', 'menjadi', 'terasa', 'rasa',
]);

/** Words shorter than this carry no evidence. Indonesian roots are rarely 3. */
const MIN_STEM = 5;

/** How much of a word must match for affixation to be tolerated. */
const PREFIX_LEN = 5;

/** Lowercase word tokens. Keeps only letters, so punctuation cannot join words. */
export function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^a-zÀ-ɏ]+/i)
    .filter(Boolean);
}

/**
 * The distinctive words of an engine string: long enough to mean something, not
 * a function word, deduplicated.
 *
 * Stripped of common Indonesian affixes at the tail so `tenagamu` and `tenaga`
 * produce the same stem. Prefix-only stripping on purpose - a real stemmer is a
 * dependency and a source of surprises, and the comparison below is a prefix
 * match anyway.
 */
export function distinctiveStems(text) {
  const stems = new Set();
  for (const word of tokenize(text)) {
    if (word.length < MIN_STEM) continue;
    if (STOPWORDS.has(word)) continue;
    stems.add(word.slice(0, PREFIX_LEN));
  }
  return [...stems];
}

/**
 * What share of `source`'s distinctive stems appear anywhere in `candidate`.
 *
 * @returns {{ ratio: number, hits: number, total: number, missing: string[] }}
 *   ratio is 1 when the source carries no distinctive stems at all, so a short
 *   engine string can never fail a block for being short.
 */
export function stemOverlap(source, candidate) {
  const stems = distinctiveStems(source);
  if (stems.length === 0) return { ratio: 1, hits: 0, total: 0, missing: [] };

  const haystack = tokenize(candidate).join(' ');
  const missing = [];
  let hits = 0;
  for (const stem of stems) {
    // Word-initial match, so `pas` inside `melampaui` cannot count.
    if (new RegExp(`(^|\\s)${stem}`).test(haystack)) hits += 1;
    else missing.push(stem);
  }
  return { ratio: hits / stems.length, hits, total: stems.length, missing };
}

/**
 * Split into sentences on terminal punctuation. Used by the same-breath check,
 * which needs to know whether anything followed a bare label.
 */
export function sentences(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Every user-visible string of a rendered reading, in reading order. */
export function renderedStrings(rendered) {
  const out = [];
  for (const block of rendered.blocks || []) {
    if (block.heading) out.push(block.heading);
    if (block.text) out.push(block.text);
  }
  if (rendered.penutup) out.push(rendered.penutup);
  return out;
}

/**
 * The whole reading as one string.
 *
 * fact_ids are EXCLUDED, and that is load-bearing: ids legitimately carry hanzi
 * (`badge_桃花`, `relation_半合_巳酉`) and the style guard rejects hanzi. Running
 * the guard over ids would reject every correct reading.
 */
export function renderedText(rendered) {
  return renderedStrings(rendered).join('\n\n');
}

/**
 * The reading's PROSE only - block texts and the penutup, no headings.
 *
 * Added 2026-08-21 for rule 23, and the reason is worth keeping: a heading is a
 * separate visual element, not a sentence. The module-assembly floor sets
 * `heading: fact.label` and then REPEATS the label inside the text, bracketed,
 * precisely because (fallback.js) "a reading that relies on one for its resolution
 * has a bare label". Measured over the whole reading INCLUDING headings, the first
 * mention of "Aspek Pengatur" is the bare heading and the correctly bracketed
 * sentence one line below never gets looked at - so bracket-once rejected the
 * always-available floor on every fixture chart, which rule 17 does not allow.
 *
 * `opening.js` excludes the heading for the same reason: naming the archetype in a
 * section title is not the reader meeting herself in a sentence.
 */
export function renderedProse(rendered) {
  const out = [];
  for (const block of rendered.blocks || []) if (block.text) out.push(block.text);
  if (rendered.penutup) out.push(rendered.penutup);
  return out.join('\n\n');
}
