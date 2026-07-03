#!/usr/bin/env node
// scripts/build-content.mjs
// ---------------------------------------------------------------------------
// Generate lib/content/<archetype>.js from contents/<archetype>-<state>-hubungan-FINAL.md.
//
// Markdown is the SOURCE OF TRUTH; the emitted JS is a build artifact. Prose is
// sliced by heading and emitted VERBATIM — the only text touched is markdown-syntax
// normalization (strip #/>/*/** and the wrapping quotes of a fully-quoted blockquote)
// and JS template-literal escaping. No rewording, ever.
//
// The generator HARD-FAILS (throws, nonzero exit) on any locked-invariant breach:
//   - 7 paid beat headings + 3 FREE headings byte-match the locked strings
//   - accordion titles [0][1][2] byte-equal paid beats 3/4/6 (emitted as shared refs)
//   - hourExplanation/closer/price/anchor/CTA never inlined per cell
//   - structure counts (3 FREE + 7 PAID, beat2 scenes, beat4 drain/feed/sign, beat6 rule)
//   - no em-dash in prose; no BIKIN / rezeki
//
// Usage:
//   node scripts/build-content.mjs --out <dir>   emit shared.js + index.js + 10 cells to <dir>
//   node scripts/build-content.mjs --report      also print the §6 pass/fail table
//   node scripts/build-content.mjs --apply       emit to lib/content (real; post sign-off)
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENTS = path.join(ROOT, 'contents');

// ---- founder-supplied canonical statics (authoritative; NOT from drifted matahari) ----
const CANON = {
  hourExplanation: `Soal jam lahir. Petamu dihitung dari tiga pilar: tahun, bulan, dan hari. Jam lahir menambahkan pilar keempat, yang mengungkap sisi paling pribadimu: caramu bergerak saat tidak ada yang melihat. Tanpa jam, bacaan ini tetap utuh pada polanya. Dengan jam, ia menjadi lebih tajam di lapisan yang paling dalam. Kalau suatu saat kamu tahu jam lahirmu, masukkan, dan petamu akan dihitung ulang.`,
  closer: `Ini bukan ramalan. Ini pola yang terbaca dari Empat Pilarmu, dipakai untuk pertanyaan yang sedang kamu bawa. Yang memutuskan tetap kamu.`,
};

const BEAT_HEADINGS = {
  1: 'Yang Perlu Kamu Dengar Dulu',
  2: 'Bagaimana Ini Muncul',
  3: 'Yang Sebenarnya Terjadi',
  4: 'Yang Menenangkan vs Yang Melelahkan',
  5: 'Empat Pilarmu · 八字',
  6: 'Cara Memutuskannya',
  7: 'Apa Artinya',
};
const FREE_HEADINGS = ['Siapa Kamu', 'Kenapa Begini', 'Ke Mana Ini Bawa Kamu'];

// archetype -> stem/name/element (English element, independent of the Indonesian md word)
const ARCH = {
  jati:     { stem: '甲', name: 'JATI',     el: 'Wood'  },
  akar:     { stem: '乙', name: 'AKAR',     el: 'Wood'  },
  matahari: { stem: '丙', name: 'MATAHARI', el: 'Fire'  },
  pelita:   { stem: '丁', name: 'PELITA',   el: 'Fire'  },
  gunung:   { stem: '戊', name: 'GUNUNG',   el: 'Earth' },
  ladang:   { stem: '己', name: 'LADANG',   el: 'Earth' },
  pedang:   { stem: '庚', name: 'PEDANG',   el: 'Metal' },
  permata:  { stem: '辛', name: 'PERMATA',  el: 'Metal' },
  samudra:  { stem: '壬', name: 'SAMUDRA',  el: 'Water' },
  hujan:    { stem: '癸', name: 'HUJAN',    el: 'Water' },
};
const ARCH_NAMES = new Set(Object.values(ARCH).map((a) => a.name));
// display (title-case) archetype names used in feed/drain arrays on the card
const DISPLAY = {
  JATI: 'Jati', AKAR: 'Akar', MATAHARI: 'Matahari', PELITA: 'Pelita', GUNUNG: 'Gunung',
  LADANG: 'Ladang', PEDANG: 'Pedang', PERMATA: 'Permata', SAMUDRA: 'Samudra', HUJAN: 'Hujan',
};

const PRICE_LINES = [
  'Buka bacaan Hubungan · Rp 49.000',
  'Dihitung presisi berdasarkan metode Empat Pilar 八字, bukan sekadar tebak-tebakan kuis.',
  'Sekali sesi konsultasi langsung biasanya memakan biaya Rp 300-500rb. Versi digital ini cukup sekali bayar, aktif selamanya.',
];

const flags = []; // {cell, kind, detail}
const flag = (cell, kind, detail) => flags.push({ cell, kind, detail });

// ------------------------------ md helpers ------------------------------

// strip inline emphasis markers (** and *) but keep inner text incl. any " quotes
function stripEmphasis(s) {
  return s.replace(/\*\*/g, '').replace(/\*/g, '');
}

// normalize a single prose line: trim, strip emphasis
function line(s) {
  return stripEmphasis(s.trim()).trim();
}

// a fully-quoted blockquote ("...") -> inner text; otherwise unchanged
function unquote(s) {
  const m = s.match(/^"([\s\S]*)"$/);
  return m ? m[1] : s;
}

// Split a markdown string into logical blocks separated by blank lines.
// Each block is the raw (multi-line) text with original line breaks.
function blocks(md) {
  return md
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function isHr(b) { return /^-{3,}$/.test(b.trim()); }
function isBullet(b) { return /^[*-]\s+/.test(b.trim()); }
function isQuote(b) { return b.trim().startsWith('>'); }
function isInjectionMarker(b) {
  const t = b.trim();
  return /^\$\$[\s\S]*\$\$$/.test(t) || /injected live/i.test(t);
}
function isPriceLine(b) {
  const t = stripEmphasis(b.trim());
  return PRICE_LINES.some((p) => t.includes(p) || t.includes('Rp 49.000') || t.includes('Rp 300-500rb'));
}
// "- **Title** · helper" — the paywall accordion bullets
function isAccordionBullet(b) { return /^[*-]\s+\*\*[^*]+\*\*\s*·/.test(b.trim()); }
// the closer slot OR the inline closer paragraph (bare-format matahari inlines it)
function isCloserLine(b) {
  const t = stripEmphasis(b.trim());
  return /\[static:\s*closer\]/i.test(b) || /^Ini bukan ramalan/.test(t);
}
// bare-format files have no ## PAYWALL heading and no heading after beat 7, so the
// accordion/price (after keMana) and the closer (after beat7) bleed into adjacent
// sections. These are parsed elsewhere / are shared constants — never body prose.
function isBoiler(b) { return isPriceLine(b) || isAccordionBullet(b) || isCloserLine(b); }

// join a run of plain-paragraph blocks with \n\n, normalizing each
function joinParas(bs) {
  return bs.map((b) => line(b.replace(/\n/g, ' ').replace(/\s+/g, ' '))).join('\n\n').trim();
}

// pull the text out of a blockquote block (strip leading > on each line, join, unquote)
function quoteText(b) {
  const inner = b
    .split('\n')
    .map((l) => l.replace(/^>\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return unquote(stripEmphasis(inner)).trim();
}

// Slice into ordered heading sections: [{level, num, title, body}]
function sections(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^(#{2,3})\s+(.*)$/);
    if (m) {
      if (cur) out.push(cur);
      const rawTitle = m[2].trim();
      const numM = rawTitle.match(/^(\d)\s*·\s*(.*)$/);
      cur = {
        level: m[1].length,
        num: numM ? Number(numM[1]) : null,
        title: numM ? numM[2].trim() : rawTitle,
        bodyLines: [],
      };
    } else if (cur) {
      cur.bodyLines.push(l);
    }
  }
  if (cur) out.push(cur);
  return out.map((s) => ({ ...s, body: s.bodyLines.join('\n').trim() }));
}

function findSection(secs, titleTest) {
  return secs.find((s) => titleTest(s.title));
}

// strip a trailing domain parenthetical " (Hubungan)"/(Karier)/(Uang) for byte-match
function stripDomainParen(title) {
  return title.replace(/\s*\((Hubungan|Karier|Uang)\)\s*$/i, '').trim();
}

// ------------------------------ parse one cell ------------------------------

function parseCell(archKey, state) {
  const cell = `${archKey}-${state}`;
  const file = path.join(CONTENTS, `${archKey}-${state}-hubungan-FINAL.md`);
  const raw = fs.readFileSync(file, 'utf8');

  // capture + strip HTML comment
  const commentM = raw.match(/<!--([\s\S]*?)-->/);
  const comment = commentM ? commentM[1] : '';
  const md = raw.replace(/<!--[\s\S]*?-->/g, '');

  const secs = sections(md);
  const meta = ARCH[archKey];

  // ---- Sharecard ----
  const sc = findSection(secs, (t) => /^Sharecard$/i.test(t));
  if (!sc) throw new Error(`${cell}: no ## Sharecard`);

  // Line-based: header / **Dimension:** label / feed / drain lines can each be adjacent
  // to the next with no blank line, so block-splitting can't separate them.
  let modifier = null;
  const feedDrain = { feed: [], drain: [] };
  const proseParts = [];
  for (const raw of sc.body.split('\n')) {
    const t = raw.trim();
    if (!t || isHr(t)) continue;
    const feedM = t.match(/^\*\*Yang Menenangkan:\*\*\s*(.+)$/);
    const drainM = t.match(/^\*\*Yang Melelahkan:\*\*\s*(.+)$/);
    // feed/drain names are separated by comma or middot (both occur across the corpus)
    if (feedM) { feedDrain.feed = feedM[1].split(/\s*[,·]\s*/).map((x) => x.trim()).filter(Boolean); continue; }
    if (drainM) { feedDrain.drain = drainM[1].split(/\s*[,·]\s*/).map((x) => x.trim()).filter(Boolean); continue; }
    const hdr = t.match(/^\*\*([^*]+)\*\*\s*·\s*\S+\s+\S+/); // **NAME modifier** · stem el (full format)
    if (hdr) {
      const boldInner = hdr[1].trim();
      const expected = meta.name;
      if (boldInner.startsWith(expected + ' ')) {
        modifier = boldInner.slice(expected.length + 1).trim();
      } else {
        modifier = boldInner.split(/\s+/).slice(-2).join(' '); // best-effort: last two words
        flag(cell, 'sharecard-header', `header bold "${boldInner}" does not start with archetype name "${expected}"`);
      }
      continue;
    }
    const dimLabel = t.match(/^\*\*Dimension:\*\*\s*(.*)$/i);
    if (dimLabel) { if (dimLabel[1].trim()) proseParts.push(dimLabel[1].trim()); continue; }
    proseParts.push(t);
  }
  const dimension = line(proseParts.join(' ').replace(/\s+/g, ' '));
  if (!feedDrain.feed.length || !feedDrain.drain.length) {
    throw new Error(`${cell}: empty feed/drain (feed=${feedDrain.feed.length} drain=${feedDrain.drain.length}) — sharecard parse failed`);
  }

  // modifier fallbacks: comment "Modifier:" line, then existing-JS exception (matahari-balanced)
  if (!modifier) {
    const cm = comment.match(/Modifier:\s*([^\[\(\|\n]+)/);
    if (cm) {
      modifier = cm[1].trim();
      flag(cell, 'modifier-source', `modifier "${modifier}" taken from comment (no sharecard header); confirm`);
    }
  }
  if (!modifier) {
    if (cell === 'matahari-balanced') {
      modifier = 'yang Teduh';
      flag(cell, 'modifier-source', `no modifier in markdown; reused shipped matahari.js value 'yang Teduh' (§0 exception — heal markdown after sign-off)`);
    } else {
      modifier = '';
      flag(cell, 'modifier-missing', `no modifier found in markdown or comment`);
    }
  }

  // ---- FREE sections ----
  // full format: under ## FREE READING as ### ; bare format: top-level ##.
  const siapa = findSection(secs, (t) => /^Siapa Kamu$/i.test(t));
  const kenapa = findSection(secs, (t) => /^Kenapa Begini$/i.test(t));
  const keManaSec = findSection(secs, (t) => /^Ke Mana Ini Bawa Kamu/i.test(t));
  for (const [sec, want] of [[siapa, 'Siapa Kamu'], [kenapa, 'Kenapa Begini'], [keManaSec, 'Ke Mana Ini Bawa Kamu']]) {
    if (!sec) throw new Error(`${cell}: missing FREE section "${want}"`);
    const norm = stripDomainParen(sec.title);
    if (norm !== want) {
      throw new Error(`${cell}: FREE heading "${sec.title}" != "${want}"`);
    }
    if (sec.title !== norm) flag(cell, 'free-heading-paren', `FREE heading "${sec.title}" normalized to "${norm}" (domain parenthetical stripped)`);
  }

  const siapaKamu = joinParas(blocks(siapa.body).filter((b) => !isHr(b) && !isQuote(b)));
  const kenapaBegini = joinParas(blocks(kenapa.body).filter((b) => !isHr(b) && !isQuote(b)));
  // line-based: the "**Bridge (inner voice):**" label may sit on the line directly
  // above the > quote with no blank line, so block-splitting can't separate them.
  const keLines = keManaSec.body.replace(/\r\n/g, '\n').split('\n');
  const keProseParas = [];
  let keCur = [];
  const keQuoteLines = [];
  for (const raw of keLines) {
    const t = raw.trim();
    if (t.startsWith('>')) { keQuoteLines.push(t.replace(/^>\s?/, '')); continue; }
    if (/^\*\*Bridge/i.test(t)) continue; // drop the "Bridge (inner voice):" label
    if (isHr(t) || isBoiler(t)) continue; // bare format: accordion/price/closer bleed in here
    if (!t) { if (keCur.length) { keProseParas.push(keCur.join(' ')); keCur = []; } continue; }
    keCur.push(t);
  }
  if (keCur.length) keProseParas.push(keCur.join(' '));
  const keMana = keProseParas.map((p) => line(p.replace(/\s+/g, ' '))).join('\n\n').trim();
  const bridgeText = keQuoteLines.length
    ? unquote(stripEmphasis(keQuoteLines.join(' ').replace(/\s+/g, ' ').trim())).trim()
    : '';
  const bridge = bridgeText ? [bridgeText] : [];
  if (!bridge.length) flag(cell, 'free-quote-missing', `no inner-voice quote at end of "Ke Mana Ini Bawa Kamu"`);

  // ---- Paywall lead + accordion ----
  let lead = '';
  const leadSec = findSection(secs, (t) => /^PAYWALL$/i.test(t));
  const accordion = [];
  // accordion bullets can live under PAYWALL (full) or as bare bullets after keMana (bare)
  const scanForPaywall = leadSec ? leadSec.body : keManaSec.body;
  // lead: "**Lead:** ..." block
  const leadBlock = blocks(scanForPaywall).find((b) => /^\*\*Lead:\*\*/i.test(b.trim()));
  if (leadBlock) {
    lead = line(leadBlock.trim().replace(/^\*\*Lead:\*\*/i, ''));
  } else {
    lead = '';
    flag(cell, 'paywall-lead-missing', `no "**Lead:**" in source markdown; emitting empty lead (render skips it)`);
  }
  // accordion bullets: "- **Title** · helper" or "* **Title** · helper"
  const accSource = (leadSec ? leadSec.body : '') + '\n' + keManaSec.body + '\n' + md;
  const accRe = /^[*-]\s+\*\*([^*]+)\*\*\s*·\s*(.+)$/gm;
  let am;
  const seen = new Set();
  while ((am = accRe.exec(accSource)) && accordion.length < 3) {
    const title = am[1].trim();
    if (seen.has(title)) continue;
    seen.add(title);
    accordion.push({ title, helper: line(am[2]) });
  }
  if (accordion.length !== 3) throw new Error(`${cell}: expected 3 accordion items, got ${accordion.length}`);
  // accordion titles MUST byte-match beats 3/4/6
  const wantAcc = [BEAT_HEADINGS[3], BEAT_HEADINGS[4], BEAT_HEADINGS[6]];
  accordion.forEach((a, i) => {
    if (a.title !== wantAcc[i]) throw new Error(`${cell}: accordion[${i}] "${a.title}" != beat "${wantAcc[i]}"`);
  });

  // ---- Paid beats ----
  const beatSecs = {};
  for (const s of secs) if (s.num) beatSecs[s.num] = s;
  for (let n = 1; n <= 7; n++) {
    if (!beatSecs[n]) throw new Error(`${cell}: missing paid beat ${n}`);
    if (beatSecs[n].title !== BEAT_HEADINGS[n]) {
      throw new Error(`${cell}: beat ${n} heading "${beatSecs[n].title}" != "${BEAT_HEADINGS[n]}"`);
    }
  }

  const beatBlocks = (n) => blocks(beatSecs[n].body).filter((b) => !isHr(b) && !isBoiler(b));

  // beat1
  const beat1 = joinParas(beatBlocks(1).filter((b) => !isQuote(b) && !isBullet(b)));

  // beat2 { intro, scenes[] } — line-based: intro & bullets may be contiguous (no blank line)
  const b2lines = beatSecs[2].body.replace(/\r\n/g, '\n').split('\n');
  const b2introLines = [];
  const scenes = [];
  let inScenes = false;
  for (const raw of b2lines) {
    const t = raw.trim();
    if (!t || isHr(t) || isBoiler(t)) continue;
    if (/^[*-]\s+/.test(t)) { inScenes = true; scenes.push(line(t.replace(/^[*-]\s+/, ''))); }
    else if (inScenes) { scenes[scenes.length - 1] += ' ' + line(t); } // wrapped continuation
    else b2introLines.push(line(t));
  }
  const b2intro = b2introLines.join(' ').trim();
  if (!scenes.length) throw new Error(`${cell}: beat2 has no scenes`);

  // beat3 { body, pull }
  const b3 = beatBlocks(3);
  const b3quote = b3.find(isQuote);
  const beat3 = { body: joinParas(b3.filter((b) => !isQuote(b))), pull: b3quote ? quoteText(b3quote) : '' };
  if (!beat3.pull) flag(cell, 'beat3-pull-absent', `beat3 has no pull-quote (may be intentional per cell design)`);

  // beat4 { drain, feed, sign }
  const b4 = beatBlocks(4);
  const b4quote = b4.find(isQuote);
  let b4drain = '', b4feed = '';
  for (const b of b4) {
    const t = b.trim();
    const dm = t.match(/^\*\*Yang membuatmu lelah:\*\*\s*([\s\S]+)$/i);
    const fm = t.match(/^\*\*Yang membuatmu tenang:\*\*\s*([\s\S]+)$/i);
    if (dm) b4drain = joinParas([dm[1]]);
    else if (fm) b4feed = joinParas([fm[1]]);
  }
  if (!b4drain || !b4feed) throw new Error(`${cell}: beat4 missing drain/feed`);
  const beat4 = { drain: b4drain, feed: b4feed, sign: b4quote ? quoteText(b4quote) : '' };
  if (!beat4.sign) throw new Error(`${cell}: beat4 missing signal quote`);

  // beat5 { explanation, hourNote:CANON }
  const b5 = beatBlocks(5).filter((b) => !isInjectionMarker(b));
  const b5expBlocks = b5.filter((b) => !isQuote(b) && !/\[static:\s*hourExplanation\]/i.test(b));
  const explanation = joinParas(b5expBlocks);
  if (/\d/.test(explanation)) flag(cell, 'beat5-digits', `beat5 explanation contains a digit (should be frame-only)`);
  const hasHourSlot = /\[static:\s*hourExplanation\]/i.test(beatSecs[5].body);
  if (!hasHourSlot) {
    // matahari-balanced inlines the full paragraph instead of the slot; capture & compare
    const inlineHour = b5.filter(isQuote).map(quoteText).join(' ').trim() ||
      b5.map((b) => line(b)).find((t) => /jam lahir/i.test(t));
    if (inlineHour && inlineHour !== CANON.hourExplanation) {
      flag(cell, 'static-drift', `inline hourExplanation differs from canonical constant`);
    }
  }
  const beat5 = { explanation, hourNote: '__HOUR__' }; // placeholder -> emitted as `hourExplanation`

  // beat6 { lead, rule, body }
  const b6 = beatBlocks(6);
  const b6quote = b6.find(isQuote);
  if (!b6quote) throw new Error(`${cell}: beat6 missing rule quote`);
  const b6i = b6.indexOf(b6quote);
  const beat6 = {
    lead: joinParas(b6.slice(0, b6i).filter((b) => !isQuote(b))),
    rule: quoteText(b6quote),
    body: joinParas(b6.slice(b6i + 1).filter((b) => !isQuote(b))),
  };

  // beat7
  const beat7 = joinParas(beatBlocks(7).filter((b) => !isQuote(b) && !isBullet(b)));

  // closer: [static: closer] slot or inline
  const closerSlot = /\[static:\s*closer\]/i.test(md);
  if (!closerSlot) {
    const tail = blocks(md).map((b) => line(b)).reverse().find((t) => /ramalan/i.test(t));
    if (tail && tail !== CANON.closer && !/\[static/.test(tail)) flag(cell, 'static-drift', `inline closer differs from canonical constant`);
  }

  return {
    card: { modifier, dimension, feed: feedDrain.feed, drain: feedDrain.drain },
    river: { siapaKamu, kenapaBegini },
    domain: {
      river: { keMana },
      bridge,
      paywallTeaser: { lead, accordion },
      ocean: { beat1, beat2: { intro: b2intro, scenes }, beat3, beat4, beat5, beat6, beat7 },
      closer: '__CLOSER__',
    },
  };
}

// ------------------------------ emit ------------------------------

function tl(s) {
  const esc = String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return '`' + esc + '`';
}
function arr(a) { return '[' + a.map((x) => tl(x)).join(', ') + ']'; }

function emitOcean(o, ind) {
  const p = ind;
  return `{
${p}  beat1: ${tl(o.beat1)},
${p}  beat2: {
${p}    intro: ${tl(o.beat2.intro)},
${p}    scenes: [
${o.beat2.scenes.map((s) => `${p}      ${tl(s)},`).join('\n')}
${p}    ],
${p}  },
${p}  beat3: {
${p}    body: ${tl(o.beat3.body)},
${p}    pull: ${tl(o.beat3.pull)},
${p}  },
${p}  beat4: {
${p}    drain: ${tl(o.beat4.drain)},
${p}    feed: ${tl(o.beat4.feed)},
${p}    sign: ${tl(o.beat4.sign)},
${p}  },
${p}  beat5: {
${p}    explanation: ${tl(o.beat5.explanation)},
${p}    hourNote: hourExplanation,
${p}  },
${p}  beat6: {
${p}    lead: ${tl(o.beat6.lead)},
${p}    rule: ${tl(o.beat6.rule)},
${p}    body: ${tl(o.beat6.body)},
${p}  },
${p}  beat7: ${tl(o.beat7)},
${p}}`;
}

function emitDomain(d, ind) {
  const p = ind;
  return `{
${p}  river: { keMana: ${tl(d.river.keMana)} },
${p}  bridge: ${arr(d.bridge)},
${p}  paywallTeaser: {
${p}    lead: ${tl(d.paywallTeaser.lead)},
${p}    accordion: [
${p}      { title: BEAT_HEADINGS[3], helper: ${tl(d.paywallTeaser.accordion[0].helper)} },
${p}      { title: BEAT_HEADINGS[4], helper: ${tl(d.paywallTeaser.accordion[1].helper)} },
${p}      { title: BEAT_HEADINGS[6], helper: ${tl(d.paywallTeaser.accordion[2].helper)} },
${p}    ],
${p}  },
${p}  ocean: ${emitOcean(d.ocean, p + '  ')},
${p}  closer,
${p}}`;
}

function emitState(cell, ind) {
  const p = ind;
  const c = cell.card;
  return `{
${p}  card: {
${p}    modifier: ${tl(c.modifier)},
${p}    dimension: ${tl(c.dimension)},
${p}    feed: ${arr(c.feed)},
${p}    drain: ${arr(c.drain)},
${p}  },
${p}  river: {
${p}    siapaKamu: ${tl(cell.river.siapaKamu)},
${p}    kenapaBegini: ${tl(cell.river.kenapaBegini)},
${p}  },
${p}  domains: {
${p}    hubungan: ${emitDomain(cell.domain, p + '    ')},
${p}  },
${p}}`;
}

function emitArchetype(archKey, balanced, amplified) {
  const meta = ARCH[archKey];
  return `import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const ${archKey} = {
  stem: '${meta.stem}',
  archetypeName: '${meta.name}',
  dayMasterChinese: '${meta.stem}',
  dayMasterElement: '${meta.el}',
  states: {
    balanced: ${emitState(balanced, '    ')},
    amplified: ${emitState(amplified, '    ')},
  },
};
`;
}

function emitShared() {
  return `import 'server-only';
// Shared content constants. Leaf module: archetype files AND index.js import it, so
// no circular dependency. Static prose (hourExplanation, closer) is founder-canonical
// and lives ONCE here; the paid-beat + FREE headings live here so every cell references
// the same string and the paywall accordion cannot drift from the beat it names.

export const hourExplanation = ${tl(CANON.hourExplanation)};

export const closer = ${tl(CANON.closer)};

export const BEAT_HEADINGS = {
  1: ${tl(BEAT_HEADINGS[1])},
  2: ${tl(BEAT_HEADINGS[2])},
  3: ${tl(BEAT_HEADINGS[3])},
  4: ${tl(BEAT_HEADINGS[4])},
  5: ${tl(BEAT_HEADINGS[5])},
  6: ${tl(BEAT_HEADINGS[6])},
  7: ${tl(BEAT_HEADINGS[7])},
};

export const FREE_HEADINGS = ${arr(FREE_HEADINGS)};

export const FD_LABELS = {
  cardFeed: 'YANG MENENANGKAN',
  cardDrain: 'YANG MELELAHKAN',
  section: 'Yang Menenangkan vs Yang Melelahkan',
};
`;
}

function emitIndex() {
  const imports = Object.keys(ARCH).map((k) => `import { ${k} } from './${k}.js';`).join('\n');
  const reg = Object.entries(ARCH).map(([k, m]) => `  '${m.stem}': ${k},`).join('\n');
  return `import 'server-only';
// SERVER ONLY — re-exports paid content ('ocean'/'closer') and must never be imported
// by a Client Component. The 'server-only' guard fails a client import at build time,
// keeping paid copy out of the browser bundle (locked decision #5).

${imports}
import { BEAT_HEADINGS } from './shared.js';

// Registry keyed by Day Master stem. Adding an archetype = add its file + a line.
const REGISTRY = {
${reg}
};

// Re-export the locked headings so existing importers keep working.
export { BEAT_HEADINGS };

export function getArchetype(stem) {
  return REGISTRY[stem] || null;
}

export function hasArchetype(stem) {
  return Boolean(REGISTRY[stem]);
}

/**
 * Resolve the state cell with Balanced fallback. Path is content[stem][state][domain];
 * an unwritten state MISSES and falls back to the archetype's 'balanced' cell.
 * @returns {{ a, cell, requested: string, served: string } | null}
 */
function resolveCell(stem, state) {
  const a = getArchetype(stem);
  if (!a) return null;
  const requested = state || 'balanced';
  let served = requested;
  let cell = a.states?.[requested];
  if (!cell) {
    served = 'balanced';
    cell = a.states?.balanced;
  }
  if (!cell) return null;
  if (served !== requested) {
    console.info(\`[content] state miss: requested=\${requested} served=\${served} stem=\${stem}\`);
  }
  return { a, cell, requested, served };
}

/**
 * Client-SAFE free content for a reading. Contains NO paid copy.
 */
export function getFreeContent(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r) return null;
  const { a, cell, served } = r;
  const dc = domain ? cell.domains?.[domain] : null;
  return {
    dayMasterChinese: a.dayMasterChinese,
    dayMasterElement: a.dayMasterElement,
    archetypeName: a.archetypeName,
    card: cell.card,
    river: cell.river,
    keMana: dc?.river?.keMana ?? null,
    bridge: dc?.bridge ?? null,
    servedState: served,
  };
}

/**
 * The paywall teaser: a 1-2 line lead + the 3 accordion title/helper pairs. Client-SAFE.
 */
export function getTeaser(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r || !domain) return null;
  const dc = r.cell.domains?.[domain];
  return dc?.paywallTeaser ?? null;
}

/**
 * Full paid domain content. SERVER-ONLY and GATED: called ONLY after row.paid === true.
 */
export function getPaidDomain(stem, state, domain) {
  const r = resolveCell(stem, state);
  if (!r || !domain) return null;
  const dc = r.cell.domains?.[domain];
  if (!dc) return null;
  if (process.env.NODE_ENV !== 'production') assertFeedDrainAgree(r.cell.card, dc.ocean, stem, domain);
  return { ...dc.ocean, closer: dc.closer };
}

// Dev-only: the card's feed/drain archetype NAMES must appear in beat4's prose.
function assertFeedDrainAgree(card, ocean, stem, domain) {
  if (!card || !ocean) return;
  const b4 = ocean.beat4;
  if (!b4) return;
  for (const name of card.feed || []) {
    if (b4.feed && !b4.feed.includes(name)) {
      console.warn(\`[content] feed mismatch: card lists "\${name}" but beat4.feed omits it (\${stem}/\${domain})\`);
    }
  }
  for (const name of card.drain || []) {
    if (b4.drain && !b4.drain.includes(name)) {
      console.warn(\`[content] drain mismatch: card lists "\${name}" but beat4.drain omits it (\${stem}/\${domain})\`);
    }
  }
}
`;
}

// ------------------------------ validation (§6) ------------------------------

function noEmDash(s) { return !String(s).includes('—'); }
function walkStrings(obj, fn, pathStr = '') {
  if (typeof obj === 'string') { fn(obj, pathStr); return; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => walkStrings(v, fn, `${pathStr}[${i}]`)); return; }
  if (obj && typeof obj === 'object') { for (const k of Object.keys(obj)) walkStrings(obj[k], fn, `${pathStr}.${k}`); }
}

function validateCell(cell, data) {
  const checks = {};
  // headings byte-match: enforced during parse (accordion + beats); mark pass
  checks.headings = true;
  checks.accordionInvariant =
    data.domain.paywallTeaser.accordion.length === 3; // titles emitted as refs -> exact by construction
  checks.freeQuote = data.domain.bridge.length > 0;
  checks.beat2Scenes = data.domain.ocean.beat2.scenes.length > 0;
  checks.beat4 = Boolean(data.domain.ocean.beat4.drain && data.domain.ocean.beat4.feed && data.domain.ocean.beat4.sign);
  checks.beat6Rule = Boolean(data.domain.ocean.beat6.rule);
  // static resolution: hourNote/closer are placeholders -> emitted as constants (never inline)
  checks.staticResolved = data.domain.ocean.beat5.hourNote === '__HOUR__' && data.domain.closer === '__CLOSER__';
  // no em-dash / BIKIN / rezeki in any prose string
  let em = true, bikin = true, rezeki = true;
  walkStrings({ ...data, domain: { ...data.domain, ocean: { ...data.domain.ocean, beat5: { explanation: data.domain.ocean.beat5.explanation } } } }, (s) => {
    if (!noEmDash(s)) em = false;
    // case-SENSITIVE: the banned artifacts are the all-caps label "BIKIN" and the old
    // feed label "Bikin Tenang". Casual lowercase "bikin" is encouraged voice (CLAUDE.md).
    if (/BIKIN/.test(s) || /Bikin Tenang/.test(s)) bikin = false;
    if (/rezeki/i.test(s)) rezeki = false;
  });
  checks.noEmDash = em;
  checks.noBikin = bikin;
  checks.noRezeki = rezeki;
  // feed/drain <-> beat4 name agreement (flag-only per brief; don't fix)
  const b4 = data.domain.ocean.beat4;
  for (const n of data.card.feed) if (!b4.feed.includes(n)) flag(cell, 'fd-agree', `card feed "${n}" not found in beat4.feed prose`);
  for (const n of data.card.drain) if (!b4.drain.includes(n)) flag(cell, 'fd-agree', `card drain "${n}" not found in beat4.drain prose`);
  return checks;
}

// ------------------------------ main ------------------------------

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const apply = args.includes('--apply');
const report = args.includes('--report');
let outDir = apply ? path.join(ROOT, 'lib', 'content') : (outIdx >= 0 ? path.resolve(args[outIdx + 1]) : null);
if (!outDir) { console.error('specify --out <dir> or --apply'); process.exit(2); }

fs.mkdirSync(outDir, { recursive: true });

const parsed = {};
const table = {};
for (const archKey of Object.keys(ARCH)) {
  const balanced = parseCell(archKey, 'balanced');
  const amplified = parseCell(archKey, 'amplified');
  parsed[archKey] = { balanced, amplified };
  table[`${archKey}-balanced`] = validateCell(`${archKey}-balanced`, balanced);
  table[`${archKey}-amplified`] = validateCell(`${archKey}-amplified`, amplified);
  fs.writeFileSync(path.join(outDir, `${archKey}.js`), emitArchetype(archKey, balanced, amplified));
}
fs.writeFileSync(path.join(outDir, 'shared.js'), emitShared());
fs.writeFileSync(path.join(outDir, 'index.js'), emitIndex());

// coverage checks
const stems = Object.values(ARCH).map((a) => a.stem);
const allBalanced = Object.keys(ARCH).every((k) => parsed[k].balanced);
const all20 = Object.keys(ARCH).every((k) => parsed[k].balanced && parsed[k].amplified);
if (!allBalanced) throw new Error('not every stem has a balanced.hubungan cell');
if (!all20) throw new Error('not all 20 (stem,state) cells present');

// aggregate pass/fail
let failed = 0;
for (const [cell, ck] of Object.entries(table)) {
  for (const [k, v] of Object.entries(ck)) if (!v) { failed++; }
}

if (report) {
  const CHK = ['headings', 'accordionInvariant', 'freeQuote', 'beat2Scenes', 'beat4', 'beat6Rule', 'staticResolved', 'noEmDash', 'noBikin', 'noRezeki'];
  const hdr = ['cell'.padEnd(20), ...CHK.map((c) => c.slice(0, 8).padEnd(9))].join('');
  console.log('\n§6 VALIDATION TABLE\n' + hdr);
  console.log('-'.repeat(hdr.length));
  for (const cell of Object.keys(table).sort()) {
    const row = [cell.padEnd(20), ...CHK.map((c) => (table[cell][c] ? '  ✓' : '  ✗').padEnd(9))].join('');
    console.log(row);
  }
  console.log('\nCoverage: 10 balanced=' + allBalanced + '  all20=' + all20 + '  stems=' + stems.join(''));
  console.log(`\nFLAGS (${flags.length}):`);
  for (const f of flags) console.log(`  [${f.cell}] ${f.kind}: ${f.detail}`);
}

console.log(`\nwrote ${Object.keys(ARCH).length} archetypes + shared.js + index.js to ${outDir}`);
console.log(`checks failed: ${failed}`);
if (failed > 0) process.exit(1);
