// ============================================================
// TTF coverage — asking a font what it actually contains
// ============================================================
// Prompt M build step 2. `@react-pdf/renderer` takes TTF, so the PDF carries its own
// copy of the card's hanzi subset, and the one thing that must never be assumed about
// a subset is which glyphs it holds.
//
// ── WHY THIS IS A MODULE AND NOT A FEW LINES IN THE SCRIPT ─
// The build script verifies coverage before writing the file, and a test verifies the
// COMMITTED file without touching the network. Those two must not be two
// implementations: this session already paid for that mistake once, when a bracket
// reporter measured artifact prose while the gate measured the whole reading and the
// rehearsal therefore proved nothing about the performance. One reader, both callers.
//
// ── WHY NOT fontkit ────────────────────────────────────────
// react-pdf bundles it, so it is available once that dependency lands - but the build
// script runs BEFORE it and the test must keep working if the renderer is ever
// swapped. Two cmap formats is a small, stable surface; a font-parsing dependency in
// the assertion path is not.
// ============================================================

/**
 * Every Unicode code point a TTF's `cmap` can map.
 *
 * Handles formats 4 and 12, which is what Google Fonts serves. An UNKNOWN format
 * THROWS rather than returning a short set, because a parser gap and a subsetter bug
 * must never look the same - one is our defect and the other is tofu in a paid
 * document.
 *
 * @param {Buffer} buf the whole font file
 * @returns {Set<number>} mapped code points
 */
export function codePointsOf(buf) {
  const numTables = buf.readUInt16BE(4);
  let cmapOff = 0;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.subarray(rec, rec + 4).toString('latin1') === 'cmap') {
      cmapOff = buf.readUInt32BE(rec + 8);
      break;
    }
  }
  if (!cmapOff) throw new Error('no cmap table in this font');

  const found = new Set();
  const numSub = buf.readUInt16BE(cmapOff + 2);
  for (let i = 0; i < numSub; i++) {
    const sub = cmapOff + buf.readUInt32BE(cmapOff + 4 + i * 8 + 4);
    const format = buf.readUInt16BE(sub);

    if (format === 4) {
      const segX2 = buf.readUInt16BE(sub + 6);
      const ends = sub + 14;
      const starts = ends + segX2 + 2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = buf.readUInt16BE(ends + s * 2);
        const start = buf.readUInt16BE(starts + s * 2);
        if (start === 0xffff) continue;
        for (let c = start; c <= end && c !== 0x10000; c++) found.add(c);
      }
    } else if (format === 12) {
      const nGroups = buf.readUInt32BE(sub + 12);
      for (let g = 0; g < nGroups; g++) {
        const rec = sub + 16 + g * 12;
        const start = buf.readUInt32BE(rec);
        const end = buf.readUInt32BE(rec + 4);
        for (let c = start; c <= end; c++) found.add(c);
      }
    } else if (format !== 0 && format !== 6) {
      throw new Error(`unhandled cmap subtable format ${format}; refusing to guess coverage`);
    }
  }
  return found;
}

/** TTF magic. `true` is the old Apple spelling; EOT is 00 08 00 00 and woff2 is wOF2. */
export function isTrueType(buf) {
  const magic = buf.subarray(0, 4);
  return magic.equals(Buffer.from([0x00, 0x01, 0x00, 0x00]))
    || magic.toString('latin1') === 'true';
}
