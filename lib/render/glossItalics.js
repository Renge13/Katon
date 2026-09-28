// ============================================================
// The bracketed English gloss, set in italic (Prompt AQ §4)
// ============================================================
// Reyner, 2026-09-28: "the term in the brackets or in english should be put in
// italic". So "Gunung (The Mountain)" reads "Gunung (*The Mountain*)": the brackets
// stay upright and only the English inside them is italic.
//
// ── STYLING ONLY. THE TEXT IS NEVER CHANGED. ───────────────
// This splits a string into runs for the renderer to style. It returns nothing a
// cache, a gate or a validator reads, and joining the runs gives back the input
// byte for byte (`tests/result-page-ui.spec.mjs` pins that). The stored reading and
// the prose Stage 6 checked are exactly what they were.
//
// ── DETECTION IS THE GLOSSARY'S, NEVER A HAND LIST ─────────
// A parenthetical is italicised only when its whole content is a `name_en` somewhere
// in `docs/content/glossary.json` - archetype, aspek, bintang, relasi_cabang, elemen
// and every other section that carries one - read from the glossary itself. The
// same set `insertBrackets` puts in (`label_bracket` equals `name_en` for every
// entry; checked 2026-09-28 by walking the glossary for any `label_bracket` absent
// from the `name_en` set: none). Anything else in brackets stays as it is.
//
// ── IT TAKES THE NAMES AS AN ARGUMENT ──────────────────────
// The glossary is 62KB. The PDFs build on the server and call `glossaryEnglishNames`
// directly; the web reading receives the ~60 names from the root layout (a server
// component) through `components/GlossNames.jsx`, so the client bundle never carries
// the glossary to italicise a handful of words.
// ============================================================

/**
 * Every `name_en` string in a glossary, deduplicated. `_`-prefixed keys are metadata
 * (READMEs, notes) and are skipped, as every other glossary walker here skips them.
 *
 * @param {Object} glossary
 * @returns {string[]} sorted
 */
export function englishNamesOf(glossary) {
  const out = new Set();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      if (k === 'name_en' && typeof v === 'string' && v.trim()) out.add(v.trim());
      else walk(v);
    }
  };
  walk(glossary);
  return [...out].sort();
}

/**
 * Split prose into runs, marking the English inside a bracket as a gloss.
 *
 * Only the innermost bracket pair is considered (`[^()]`), so a nested
 * "(Pola Kontras (Contrasting Pattern))" italicises the inner name and leaves the
 * outer bracket alone. The match is on the whole trimmed content, exact case: the
 * pipeline inserts these names verbatim, so a looser match would only ever widen
 * italics onto text that is not a glossary name.
 *
 * @param {string} text
 * @param {Iterable<string>} names English glossary names
 * @returns {Array<{text: string, gloss: boolean}>} runs; their texts concatenate to `text`
 */
export function glossRuns(text, names) {
  const s = typeof text === 'string' ? text : '';
  const set = names instanceof Set ? names : new Set(names || []);
  if (!s || set.size === 0) return s ? [{ text: s, gloss: false }] : [];

  const runs = [];
  let last = 0;
  const re = /\(([^()]*)\)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const inner = m[1];
    const name = inner.trim();
    if (!set.has(name)) continue;
    // Keep any whitespace just inside the brackets upright, with the brackets.
    const lead = inner.slice(0, inner.indexOf(name));
    const trail = inner.slice(lead.length + name.length);
    const open = m.index;
    runs.push({ text: s.slice(last, open) + '(' + lead, gloss: false });
    runs.push({ text: name, gloss: true });
    last = open + 1 + inner.length;
    runs.push({ text: trail + ')', gloss: false });
    last += 1;
  }
  runs.push({ text: s.slice(last), gloss: false });
  return runs.filter((r) => r.text.length > 0);
}
