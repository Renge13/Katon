// ============================================================
// Reading a produced PDF back — the round-trip verifier
// ============================================================
// Prompt M build step 2's canary, and the reason it needs code at all: a PDF that
// renders successfully and a PDF that renders CORRECTLY are different claims. Tofu
// does not throw. The build reports success, the file opens, the page is laid out,
// and the pillar cells are empty boxes.
//
// So the assertion cannot be "it rendered". It has to open the artifact and ask what
// is inside it - the repo's own rule, and this file is that rule applied to a binary.
//
// ── WHAT A PDF ACTUALLY CARRIES, measured from a probe rather than assumed ──
// react-pdf embeds the hanzi face as a CIDFontType2 with two relevant streams, both
// Flate-compressed:
//
//   FontFile2   an sfnt font program. Magic `true`, tables including `glyf`, which
//               is where outlines live. A subset with no glyf is a subset with no
//               shapes.
//   ToUnicode   a CMap mapping the CIDs used on the page back to Unicode. If a
//               character was drawn, its code point is in here.
//
// The pair is what makes this a round TRIP. ToUnicode alone proves the text was
// ENCODED as the right character; glyf proves an OUTLINE was embedded to draw it
// with. Tofu is exactly the case where the first is true and the second is not.
//
// ── NO PDF LIBRARY, ON PURPOSE ─────────────────────────────
// Same reasoning as ttf.js declining fontkit: this runs in the assertion path, and a
// parser dependency there means a test that can fail for reasons unrelated to the
// product. Flate streams and a `glyf` table are a small, stable surface. Anything
// this cannot parse it reports as unparsed rather than as absent, because a parser
// gap and a missing glyph must never look the same.
// ============================================================

import zlib from 'node:zlib';

import { isTrueType } from './ttf.js';

/**
 * Every Flate stream in a PDF, inflated.
 *
 * Streams that do not inflate are SKIPPED rather than throwing: a PDF legitimately
 * carries uncompressed and non-Flate streams, and this is looking for two specific
 * ones rather than auditing the file.
 *
 * @param {Buffer} pdf
 * @returns {Array<{body: Buffer, dict: string}>} `dict` is the raw bytes preceding
 *   the stream, which is where /Subtype and /Length live.
 */
export function inflatedStreams(pdf) {
  const raw = pdf.toString('latin1');
  const out = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const start = m.index + m[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) continue;
    let body;
    try {
      body = zlib.inflateSync(pdf.subarray(start, end));
    } catch {
      continue;
    }
    out.push({ body, dict: raw.slice(Math.max(0, m.index - 400), m.index) });
  }
  return out;
}

/**
 * The sfnt tables of every embedded font program in a PDF.
 *
 * @param {Buffer} pdf
 * @returns {Array<{tables: string[], glyphs: number, bytes: number}>}
 */
export function embeddedFonts(pdf) {
  const fonts = [];
  for (const { body } of inflatedStreams(pdf)) {
    if (body.length < 12 || !isTrueType(body)) continue;
    const numTables = body.readUInt16BE(4);
    const tables = [];
    let glyphs = 0;
    for (let i = 0; i < numTables; i += 1) {
      const rec = 12 + i * 16;
      const tag = body.subarray(rec, rec + 4).toString('latin1');
      tables.push(tag);
      if (tag === 'maxp') {
        // numGlyphs is at offset 4 of the maxp table.
        const off = body.readUInt32BE(rec + 8);
        if (off + 6 <= body.length) glyphs = body.readUInt16BE(off + 4);
      }
    }
    fonts.push({ tables, glyphs, bytes: body.length });
  }
  return fonts;
}

/**
 * Every Unicode code point a PDF's ToUnicode CMaps map back to.
 *
 * ── THE THREE FORMS, AND THE ONE THAT NEARLY SHIPPED A FALSE PASS ──
 * A CMap writes destinations as 4-hex-digit big-endian UTF-16. Three encodings are
 * legal and react-pdf uses the third:
 *
 *   bfchar          <src> <dst>                       one CID, one character
 *   bfrange scalar  <lo> <hi> <dst>                   CIDs lo..hi map to dst, dst+1, ...
 *   bfrange ARRAY   <lo> <hi> [<d0> <d1> ... ]        CIDs lo..hi map to the LIST
 *
 * The first cut of this function knew the first two and not the third, and the array
 * form degrades into the scalar form catastrophically rather than harmlessly: given
 * `<0000> <0007> [<0000> <5df1> ...]` it read lo=0, hi=7, dst=0 and then a stray
 * third group from the array as another range, expanding tens of thousands of
 * consecutive code points. **That produced a PASS for characters the document had
 * never drawn** - 25,099 code points "drawn" on a document with eight glyphs, and a
 * canary assertion that reported 申 present in a document with no 申 in it.
 *
 * Which is the whole argument for this file existing, arriving from the inside: a
 * verifier that is wrong in the permissive direction is worse than no verifier, and
 * the only thing that caught it was a chart whose characters fell OUTSIDE the bogus
 * range. So the array form is parsed first and explicitly, and a range whose shape
 * this does not recognise is skipped rather than guessed at.
 *
 * @param {Buffer} pdf
 * @returns {Set<number>} code points the document says it drew
 */
export function drawnCodePoints(pdf) {
  const found = new Set();
  for (const { body } of inflatedStreams(pdf)) {
    const txt = body.toString('latin1');
    if (!txt.includes('beginbfchar') && !txt.includes('beginbfrange')) continue;

    for (const block of txt.match(/beginbfchar([\s\S]*?)endbfchar/g) || []) {
      // <src> <dst>, and only the destination is Unicode.
      for (const pair of block.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g) || []) {
        const dst = /<[0-9a-fA-F]+>\s*<([0-9a-fA-F]+)>/.exec(pair)?.[1];
        if (dst) for (const cp of utf16beCodePoints(dst)) found.add(cp);
      }
    }
    for (const block of txt.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
      // ARRAY FORM FIRST, because it is what react-pdf emits and because reading it
      // as the scalar form is the failure documented above. Consumed from the block
      // so its inner <..> groups cannot be re-read as a scalar range.
      let rest = block;
      const arrayRow = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\[([^\]]*)\]/g;
      let a;
      while ((a = arrayRow.exec(block)) !== null) {
        for (const hex of a[3].match(/<([0-9a-fA-F]*)>/g) || []) {
          for (const cp of utf16beCodePoints(hex.slice(1, -1))) {
            // .notdef maps to 0000 and is not a character anyone drew.
            if (cp !== 0) found.add(cp);
          }
        }
        rest = rest.split(a[0]).join(' ');
      }

      // Then the scalar form, over what is left. lo..hi onto dst, dst+1, ...
      const scalar = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
      let sm;
      while ((sm = scalar.exec(rest)) !== null) {
        const lo = parseInt(sm[1], 16);
        const hi = parseInt(sm[2], 16);
        const dst = utf16beCodePoints(sm[3]);
        // A range wider than the BMP is not a range, it is a parse gone wrong. Skip
        // rather than expand: a parser gap and a missing glyph must never look the
        // same, and the permissive reading is the one that produced a false pass.
        if (dst.length !== 1 || hi < lo || hi - lo > 0xffff) continue;
        for (let i = 0; i <= hi - lo; i += 1) if (dst[0] + i !== 0) found.add(dst[0] + i);
      }
    }
  }
  return found;
}

/** `7533` -> [0x7533], surrogate pairs included. */
function utf16beCodePoints(hex) {
  const units = [];
  for (let i = 0; i + 4 <= hex.length; i += 4) units.push(parseInt(hex.slice(i, i + 4), 16));
  const out = [];
  for (let i = 0; i < units.length; i += 1) {
    const u = units[i];
    if (u >= 0xd800 && u <= 0xdbff && i + 1 < units.length) {
      out.push(0x10000 + ((u - 0xd800) << 10) + (units[i + 1] - 0xdc00));
      i += 1;
    } else {
      out.push(u);
    }
  }
  return out;
}

/**
 * The Latin text a PDF draws, per font resource.
 *
 * ── WHY THIS IS NOT ONE STRING ────────────────────────────
 * react-pdf writes text as hex runs split by kerning:
 * `[<4d617461686172> -15 <69> 0] TJ` is "Matahar" then "i". Concatenating the runs
 * recovers the words. But the bytes only mean Unicode for a SIMPLE font - a
 * WinAnsi-encoded Helvetica. For the CID-keyed hanzi face the same bytes are GLYPH
 * IDs, and decoding those as latin1 produces plausible-looking noise.
 *
 * Noise that can contain any ASCII substring by accident is exactly what an
 * assertion like "the document must not contain Missing Wood" cannot tolerate. So
 * the active font is tracked and runs are returned keyed by it, and a caller asserts
 * against the face it means. Hanzi coverage is a different question with a different
 * instrument - `drawnCodePoints`.
 *
 * @param {Buffer} pdf
 * @returns {Map<string, string>} font resource name (`F1`) -> text drawn with it
 */
export function textByFont(pdf) {
  const out = new Map();
  for (const { body } of inflatedStreams(pdf)) {
    const txt = body.toString('latin1');
    if (!txt.includes('TJ') && !txt.includes('Tj')) continue;
    let font = '?';
    // One pass over the operators that matter: a font selection, or a show.
    const re = /\/(F\d+)\s+[\d.]+\s+Tf|\[([^\]]*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      if (m[1]) { font = m[1]; continue; }
      let run = '';
      if (m[2] !== undefined) {
        for (const hex of m[2].match(/<([0-9a-fA-F]*)>/g) || []) {
          run += Buffer.from(hex.slice(1, -1), 'hex').toString('latin1');
        }
      } else if (m[3] !== undefined) {
        run += m[3].replace(/\\(.)/g, '$1');
      }
      out.set(font, (out.get(font) || '') + run);
    }
  }
  return out;
}

/**
 * The document's Latin text, for assertions about words.
 *
 * Runs drawn with a CID-keyed face are DROPPED, identified by the NUL bytes a 2-byte
 * CID encoding produces for any glyph id under 256. That is a heuristic and it is
 * stated as one: it is here to keep glyph-id noise out of substring assertions, not
 * to be a PDF text extractor. Anything about hanzi asks `drawnCodePoints` instead,
 * which reads the ToUnicode CMap and does not guess.
 *
 * @param {Buffer} pdf
 * @returns {string}
 */
export function latinText(pdf) {
  return [...textByFont(pdf).values()]
    .filter((t) => !t.includes('\u0000'))
    .join('\n');
}

/**
 * Did every one of these characters survive into the document, with an outline?
 *
 * @param {Buffer} pdf
 * @param {string[]} chars
 * @returns {{ok: boolean, missing: string[], fonts: Array, outlined: boolean}}
 */
export function roundTrip(pdf, chars) {
  const drawn = drawnCodePoints(pdf);
  const missing = chars.filter((c) => !drawn.has(c.codePointAt(0)));
  const fonts = embeddedFonts(pdf);
  // At least one embedded program must carry outlines. `glyf` is where they are, and
  // more than one glyph means it is not a lone .notdef.
  const outlined = fonts.some((f) => f.tables.includes('glyf') && f.glyphs > 1);
  return { ok: missing.length === 0 && outlined, missing, fonts, outlined };
}

// ============================================================
// THE PAGE MAP — reading a produced PDF's own structure
// ============================================================
// Build step 4 (prompt M correction 3). The appendix cross-references need to know
// which page each entry landed on, and the correction is explicit that the answer
// must come BY CONSTRUCTION rather than from searching the document for the entry's
// name: `Pilar Kerja` appears in the reading and again in the chart table long
// before the appendix, so a whole-document search that took the first hit reported
// 21 mismatches that were all its own.
//
// ── WHY NOT ASK react-pdf, AND THIS WAS MEASURED ──────────
// The obvious mechanism is the `render` prop, which hands a callback
// `{ pageNumber }`. THREE PROBES SAY IT CANNOT BE TRUSTED FOR THIS, and the way it
// fails is the permissive direction this file is entirely about:
//
//   render on a View          the node collapses to zero height. 60 rows that
//                             paginate to 4 pages statically became a ONE-page
//                             document, and every row reported page 1.
//   render as a Text's WHOLE  the same collapse. Dynamic content does not take part
//   content                   in pagination; it is drawn afterwards into a
//                             reserved box.
//   render on a one-line      layout stayed byte-identical to the static build (3
//   name inside a static      pages both), so it IS layout-neutral - AND IT STILL
//   entry                     REPORTED EVERY ENTRY ON PAGE 1 OF 3.
//
// The third is the dangerous one. It perturbs nothing, it returns a plausible map,
// and the map is wrong. A verifier that is wrong permissively is worse than none.
//
// ── WHAT IS TRUSTWORTHY: /Dests, WRITTEN BY THE RENDERER ──
// Give a node an `id` and react-pdf writes a named destination into the document's
// name tree:
//
//   /Dests << /Names [ (pilar.day) [99 0 R /XYZ 40 801.89 null] ... ] >>
//
// `99 0 R` is the PAGE OBJECT the node actually landed on, emitted from the real
// layout by the same renderer that drew it, and `/Type /Pages /Kids [...]` turns
// that object into a page number. So the map is the renderer's own record, read out
// of the shipped bytes - which is what "by construction" means here. It is the
// object graph rather than prose, so none of the string ambiguity that broke the
// first verifier can reach it.
// ============================================================

/**
 * The page objects of a PDF, in page order.
 *
 * A NESTED page tree THROWS rather than being walked. pdfkit emits one flat
 * `/Type /Pages` node and this asserts that rather than parsing PDF in general - a
 * partial walk that silently returned the first level would renumber every page
 * after the split. Same rule as the CMap ranges above: a shape this does not
 * recognise is reported, never guessed at.
 *
 * @param {Buffer} pdf
 * @returns {string[]} object numbers as strings, index 0 = page 1
 */
export function pageObjectOrder(pdf) {
  const raw = pdf.toString('latin1');
  const nodes = [...raw.matchAll(/\/Type\s*\/Pages\b([\s\S]{0,8000}?)>>/g)];
  if (nodes.length !== 1) {
    throw new Error(`pageObjectOrder: expected one /Type /Pages node, found ${nodes.length}`);
  }
  const body = nodes[0][1];
  const kids = /\/Kids\s*\[([^\]]*)\]/.exec(body);
  if (!kids) throw new Error('pageObjectOrder: the /Pages node has no /Kids array');
  const order = [...kids[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((m) => m[1]);
  const count = /\/Count\s+(\d+)/.exec(body);
  if (count && Number(count[1]) !== order.length) {
    throw new Error(`pageObjectOrder: /Count ${count[1]} but ${order.length} kids - `
      + 'the page tree is nested and this does not walk one');
  }
  return order;
}

/**
 * Named destinations to the 1-based page they point at.
 *
 * Matched on the destination ARRAY shape - `(name) [ N 0 R /XYZ` - rather than by
 * walking the name tree, so it is indifferent to whether that tree stayed flat or
 * split into /Kids as it grew. The shape appears nowhere else in a PDF.
 *
 * @param {Buffer} pdf
 * @returns {Map<string, number>} destination name -> page number
 */
export function namedDestinationPages(pdf) {
  const raw = pdf.toString('latin1');
  const order = pageObjectOrder(pdf);
  const index = new Map(order.map((obj, i) => [obj, i + 1]));
  const out = new Map();
  const dest = /\(((?:[^()\\]|\\.)*)\)\s*\[\s*(\d+)\s+\d+\s+R\s*\/(?:XYZ|Fit)/g;
  for (const m of raw.matchAll(dest)) {
    const page = index.get(m[2]);
    // A destination pointing at an object that is not in /Kids is not a page
    // reference this understands. Skipped rather than guessed - and the caller's
    // completeness check turns a skip into a refusal rather than a silent gap.
    if (page) out.set(m[1].replace(/\\(.)/g, '$1'), page);
  }
  return out;
}

/**
 * The Latin text of each page, in page order.
 *
 * The whole-document `latinText` above cannot answer "is this string on page 6",
 * which is the third of correction 3's checks. Pages are resolved through /Kids and
 * then each page's own /Contents object, so a page's text is that page's text - not
 * the n-th content stream in file order, which is a coincidence rather than a fact.
 *
 * CID-keyed runs are dropped by the same heuristic `latinText` uses, and for the
 * same stated reason: keeping glyph-id noise out of substring assertions.
 *
 * @param {Buffer} pdf
 * @returns {string[]} index 0 = page 1
 */
export function pageTexts(pdf) {
  const objects = pdfObjects(pdf);
  return pageObjectOrder(pdf).map((pageObj) => {
    const contents = /\/Contents\s+(\d+)\s+\d+\s+R/.exec(objects.get(pageObj)?.head || '');
    const body = contents ? (objects.get(contents[1])?.stream || '') : '';
    return contentStreamRuns(body)
      .filter((t) => !t.includes(NUL))
      .join('\n');
  });
}

/**
 * Every indirect object, by object number: its dictionary text and, where it has
 * one, its inflated stream.
 *
 * ── WHY AN INDEX AND NOT A REGEX PER LOOKUP ───────────────
 * The first cut of `pageTexts` did it with two lazy regexes and BOTH were wrong, in
 * the quiet way. `/(\d+)\s+\d+\s+obj([\s\S]{0,400}?)stream/` starts at an object
 * that has no stream and lazily runs on until it finds the NEXT object's `stream`,
 * so it labelled object 12's content stream as object 11's - every page's text
 * attributed to its neighbour. Object bodies are delimited by the next header, so
 * that is what this uses. One parse, one pass, no lookahead across a boundary.
 *
 * @param {Buffer} pdf
 * @returns {Map<string, {head: string, stream: string|null}>}
 */
export function pdfObjects(pdf) {
  const raw = pdf.toString('latin1');
  const headers = [...raw.matchAll(/(\d+)\s+(\d+)\s+obj/g)];
  const out = new Map();
  for (let i = 0; i < headers.length; i += 1) {
    const h = headers[i];
    const from = h.index + h[0].length;
    const to = i + 1 < headers.length ? headers[i + 1].index : raw.length;
    const body = raw.slice(from, to);
    const sm = /stream\r?\n/.exec(body);
    let stream = null;
    if (sm) {
      const sFrom = from + sm.index + sm[0].length;
      const sTo = raw.indexOf('endstream', sFrom);
      if (sTo > -1 && sTo < to) {
        try {
          stream = zlib.inflateSync(pdf.subarray(sFrom, sTo)).toString('latin1');
        } catch {
          // Uncompressed and non-Flate streams are kept as-is rather than skipped.
          // `inflatedStreams` above may skip because it is hunting two specific
          // streams; here the object number matters, and a skip would silently
          // blank a page instead of shortening a list.
          stream = pdf.subarray(sFrom, sTo).toString('latin1');
        }
      }
    }
    out.set(h[1], { head: sm ? body.slice(0, sm.index) : body, stream });
  }
  return out;
}

/** The NUL a 2-byte CID encoding produces for any glyph id under 256. */
const NUL = String.fromCharCode(0);

/**
 * The text runs of ONE content stream. The caller has already decided which page
 * this is, which is the whole difference from `textByFont` - same operators, a
 * different question.
 */
function contentStreamRuns(txt) {
  const out = [];
  const re = /\/(F\d+)\s+[\d.]+\s+Tf|\[([^\]]*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
  let m;
  let run = '';
  while ((m = re.exec(txt)) !== null) {
    // A font switch ends the run: runs drawn with different faces must not be
    // concatenated, or one CID byte would poison a page's whole Latin text.
    if (m[1]) { if (run) { out.push(run); run = ''; } continue; }
    if (m[2] !== undefined) {
      for (const hex of m[2].match(/<([0-9a-fA-F]*)>/g) || []) {
        run += Buffer.from(hex.slice(1, -1), 'hex').toString('latin1');
      }
    } else if (m[3] !== undefined) {
      run += m[3].replace(/\\(.)/g, '$1');
    }
  }
  if (run) out.push(run);
  return out;
}
