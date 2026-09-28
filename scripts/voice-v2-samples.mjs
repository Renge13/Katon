// ============================================================
// scripts/voice-v2-samples.mjs — the worksheet samples both judge calibrations read
// ============================================================
// Imported by scripts/calibrate-judge.mjs (all four classes, round 2) and
// scripts/calibrate-j1.mjs (J1 alone, round 3). One parser, so the two
// calibrations cannot drift into reading different clean sets.
//
// ── THE CLEAN SET IS READ FROM THE WORKSHEET, NOT RETYPED ──
// Each S-sample is the "**After:**" blockquote of its section in
// docs/content/voice-v2-worksheet-2026-09-24.md, parsed at run time. A `**Bold**`
// line opens a block; `**Penutup**` opens the penutup.
//
// ── EVERY SEED MUST ACTUALLY PLANT ─────────────────────────
// A seed is a string edit on a clean sample; if the anchor text is not found,
// `plant` throws. A seed that silently did nothing would score as "not caught" at
// best and as a clean pass at worst.
// ============================================================

import fs from 'node:fs';

const SHEET = fs.readFileSync('docs/content/voice-v2-worksheet-2026-09-24.md', 'utf8');

/** One S-sample as a `{blocks, penutup}` rendering. */
export function sample(tag) {
  const start = SHEET.indexOf(`### ${tag}.`);
  if (start < 0) throw new Error(`worksheet: no section ${tag}`);
  const after = SHEET.indexOf('**After', start);
  const lines = SHEET.slice(after).split(/\r?\n/).slice(1);
  const quoted = [];
  let begun = false;
  for (const line of lines) {
    if (line.startsWith('>')) { begun = true; quoted.push(line.replace(/^>\s?/, '')); } else if (begun) break;
  }
  const blocks = [];
  let penutup = null;
  let current = null;
  for (const line of quoted) {
    const h = /^\*\*(.+)\*\*$/.exec(line.trim());
    if (h) {
      if (h[1] === 'Penutup') { penutup = ''; current = null; continue; }
      current = { heading: h[1], text: '' };
      blocks.push(current);
      continue;
    }
    if (penutup !== null && current === null) { penutup += `${line}\n`; continue; }
    if (current) current.text += `${line}\n`;
  }
  const tidy = (s) => s.replace(/\n{3,}/g, '\n\n').trim();
  return {
    blocks: blocks.map((b) => ({ heading: b.heading, text: tidy(b.text) })),
    penutup: penutup === null ? '' : tidy(penutup),
  };
}

/** Replace `from` with `to` everywhere in a rendering; throws if `from` is absent. */
export function plant(rendered, from, to) {
  const all = JSON.stringify(rendered);
  if (!all.includes(JSON.stringify(from).slice(1, -1))) throw new Error(`seed anchor not found: ${from.slice(0, 60)}`);
  return {
    blocks: rendered.blocks.map((b) => ({ ...b, text: b.text.split(from).join(to) })),
    penutup: rendered.penutup.split(from).join(to),
  };
}

/** Load .env.local into process.env without overriding what is already set. */
export function loadEnvLocal() {
  const ENV = '.env.local';
  if (!fs.existsSync(ENV)) return;
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// Per 1M tokens, paid Standard tier, prompts <= 200k (ai.google.dev/gemini-api/docs/pricing,
// read 2026-09-24). Thought tokens bill as output.
export const PRICES = {
  'gemini-3.1-flash-lite': { in: 0.25 / 1e6, out: 1.5 / 1e6 },
  'gemini-3.1-pro-preview': { in: 2.0 / 1e6, out: 12.0 / 1e6 },
};
