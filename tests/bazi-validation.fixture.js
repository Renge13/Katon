// ============================================================
// BaZi 13-chart validation fixture
// ============================================================
// Ground truth transcribed from Joey Yap's calculator, verified against the
// source PDFs. This is the authoritative table the engine is validated against.
// It is EVIDENCE. Never edit a row to make a failing test pass.
//
// Schema per row:
//   { id, date:'YYYY-MM-DD', time:'HH:MM', gender:'M'|'F',
//     expect: {
//       dayMaster,          // Day Master heavenly stem (hanzi)
//       dayMasterElement,   // Wood|Fire|Earth|Metal|Water
//       monthBranch,        // month pillar earthly branch (hanzi)
//       mainProfileHanzi,   // Track A canonical Main Profile Ten God (hanzi)
//       mainProfileLabel,   // Katon English label for that Ten God
//       mainStructure,      // Joey Yap "Structure" grouping (metadata)
//       topThreeBars: [{ god, score }],  // Track B expected top-3 RANK ORDER
//     } }
//
// ── allBars — Joey's FULL ten, page 2 "10 PROFILES STRENGTH CHART" ──
// PENDING for 12 of 13 charts. Chart 13 is transcribed; the rest are being
// collected. `null` means not-yet-transcribed, NOT zero — never treat a null row
// as data, and never infer the missing seven bars from the top three.
//
// Why this field is the important one (docs/prompts/C3-ruling-B.md): ten bars
// carry exactly five elements' worth of information, because each element maps
// to two gods (one yin, one yang). Summing a god pair recovers that element's
// strength, so allBars exposes JOEY'S ELEMENT DISTRIBUTION directly — five known
// values per chart. Session 2 proved the element ranking is the defect and that
// it can host Joey's top-3 in only 6/13 charts; fitting an element model through
// the top 3 alone was the keyhole.
//
// The five element totals are deliberately NOT stored beside allBars. They are
// derived by tests/joey-bars.mjs (elementBarsFrom) from this one source, so the
// two can never drift apart. tests/joey-bars.spec.mjs asserts the derivation
// reproduces the element totals published in C3-ruling-B.md for chart 13, and
// cross-checks every populated row against its own topThreeBars.
//
// ── topThreeBars ──
// `god` is the Ten God hanzi; `score` is Joey's published bar value, taken from
// docs/engine/engine-session-state.md. Only RANK ORDER is asserted — Katon does
// not reproduce Joey's proprietary normalisation constants — but the magnitudes
// are recorded because calibration needs to see near-ties (charts 9 and 13 each
// have a tie at the top, which makes their rank order intrinsically soft).
//
// ── Joey's profile names → Ten God hanzi ──
// AUTHORITY: docs/engine/joey-profile-mapping.md, transcribed from Joey's own
// printed legend ("JOEY YAP'S BAZI PROFILING SYSTEM / 10 PROFILES STRENGTH
// CHART"). That file is primary source — do not re-derive this mapping, and if
// the two ever disagree, that file wins. Reproduced here only for readability:
//   比肩 The Self-Reliant  = Friend
//   劫財 The Mover         = Leader          (chart 4: Leader64 -> third bar)
//   食神 The Creator       = Artist
//   傷官 The Dazzler       = Performer / Perf
//   正財 The Steward       = Dir             (Dir = DIRECT WEALTH, not "Director")
//   偏財 The Trailblazer   = Pioneer / Pio
//   正官 The Keeper        = Diplomat
//   七殺 The Fighter       = Warrior
//   正印 The Learner       = Analyzer
//   偏印 The Thinker       = Philosopher / Phil
//
// TWO TRANSCRIPTION CORRECTIONS, 2026-08-01 — both were mapping errors in this
// file, not changes to Joey's numbers:
//
//  1. Chart 2's "Warrior83" was mapped to 劫財 with a FLAG-for-confirmation note.
//     It is 七殺. Charts 6 (Warrior63) and 12 (Warrior70) were already mapped to
//     七殺 in this same file, and chart 4's third bar is "Leader64", which is the
//     name 劫財 actually carries. Two corroborations against one flagged guess.
//
//  2. Chart 13's "Dir78" was mapped to 正官 by reading "Dir" as "Director".
//     It is 正財. Chart 1's published row is Dir88/Friend85/Pioneer80 and its
//     independently transcribed top-3 is 正財/比肩/偏財, which fixes Dir = 正財
//     (Direct Wealth). 正官 is Diplomat, which appears in chart 2.
// ============================================================

// Joey's full ten bars for all 13 charts, collected browser-driven from his
// plotter (docs/engine/joey-bars-13.json). IMPORTED, never re-typed: hand
// transcription has produced three errors in this fixture's history (Warrior,
// Dir, and the 子 hidden stem), so the 130 numbers are read from the collected
// artifact and the hand-written `topThreeBars` below stays as an INDEPENDENT
// cross-check against it. tests/joey-bars.spec.mjs asserts the two agree.
import JOEY_BARS from '../docs/engine/joey-bars-13.json' with { type: 'json' };

const bar = (god, score) => ({ god, score });

export const VALIDATION_CHARTS = [
  {
    id: 1,
    date: '1989-09-13', time: '09:00', gender: 'M',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '酉',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Managers',
      // Dir 88 / Friend 85 / Pioneer 80 — the strength-engine calibration anchor.
      topThreeBars: [bar('正財', 88), bar('比肩', 85), bar('偏財', 80)],
    },
  },
  {
    id: 2,
    date: '1990-03-04', time: '14:00', gender: 'M',
    expect: {
      dayMaster: '戊', dayMasterElement: 'Earth', monthBranch: '寅',
      mainProfileHanzi: '比肩', mainProfileLabel: 'The Self-Reliant', mainStructure: 'Connectors',
      // Friend 87 / Warrior 83 / Diplomat 80 — see correction 1 in the header.
      topThreeBars: [bar('比肩', 87), bar('七殺', 83), bar('正官', 80)],
    },
  },
  {
    id: 3,
    date: '1992-04-20', time: '08:00', gender: 'M',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '辰',
      mainProfileHanzi: '偏印', mainProfileLabel: 'The Thinker', mainStructure: 'Thinkers',
      // Phil 98 / Artist 94 / Analyzer 80
      topThreeBars: [bar('偏印', 98), bar('食神', 94), bar('正印', 80)],
    },
  },
  {
    id: 4,
    date: '1995-06-01', time: '06:00', gender: 'F',
    expect: {
      dayMaster: '癸', dayMasterElement: 'Water', monthBranch: '巳',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Creators',
      // Dir 83 / Artist 79 / Leader 64
      topThreeBars: [bar('正財', 83), bar('食神', 79), bar('劫財', 64)],
    },
  },
  {
    id: 5,
    date: '1988-07-10', time: '22:00', gender: 'F',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '未',
      mainProfileHanzi: '傷官', mainProfileLabel: 'The Dazzler', mainStructure: 'Creators',
      // Perf 100 / Friend 88 / Artist 82
      topThreeBars: [bar('傷官', 100), bar('比肩', 88), bar('食神', 82)],
    },
  },
  {
    id: 6,
    date: '1989-03-03', time: '00:15', gender: 'M',
    expect: {
      dayMaster: '壬', dayMasterElement: 'Water', monthBranch: '寅',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      // Pio 100 / Artist 83 / Warrior 63
      topThreeBars: [bar('偏財', 100), bar('食神', 83), bar('七殺', 63)],
    },
  },
  {
    id: 7,
    date: '1993-06-12', time: '23:30', gender: 'F',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '午',
      mainProfileHanzi: '正印', mainProfileLabel: 'The Learner', mainStructure: 'Creators',
      // Analyzer 85 / Perf 83 / Artist 76
      topThreeBars: [bar('正印', 85), bar('傷官', 83), bar('食神', 76)],
    },
  },
  {
    id: 8,
    date: '1992-01-05', time: '08:00', gender: 'M',
    expect: {
      dayMaster: '庚', dayMasterElement: 'Metal', monthBranch: '子',
      mainProfileHanzi: '傷官', mainProfileLabel: 'The Dazzler', mainStructure: 'Creators',
      // Perf 98 / Phil 64 / Friend 62
      topThreeBars: [bar('傷官', 98), bar('偏印', 64), bar('比肩', 62)],
    },
  },
  {
    id: 9,
    date: '1990-08-07', time: '10:00', gender: 'F',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '未',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Creators',
      // Artist 98 / Perf 98 / Dir 95 — profile != top bar. The discriminator that
      // proved the bars are seasonal strength, not a token tally. 98/98 is a TIE,
      // so the top-two order is not meaningfully asserted.
      topThreeBars: [bar('食神', 98), bar('傷官', 98), bar('正財', 95)],
    },
  },
  {
    id: 10,
    date: '1985-02-04', time: '12:00', gender: 'M',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '寅',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      // Pio 87 / Friend 83 / Artist 82
      topThreeBars: [bar('偏財', 87), bar('比肩', 83), bar('食神', 82)],
      // 立春 boundary: year pillar must roll on 立春, not Jan 1.
      yearPillar: '乙丑', monthPillar: '戊寅',
    },
  },
  {
    id: 11,
    date: '1991-01-10', time: '04:00', gender: 'F',
    expect: {
      dayMaster: '庚', dayMasterElement: 'Metal', monthBranch: '丑',
      mainProfileHanzi: '正印', mainProfileLabel: 'The Learner', mainStructure: 'Thinkers',
      // Analyzer 82 / Perf 80 / Phil 69
      topThreeBars: [bar('正印', 82), bar('傷官', 80), bar('偏印', 69)],
    },
  },
  {
    id: 12,
    date: '1990-06-07', time: '12:00', gender: 'F',
    expect: {
      dayMaster: '癸', dayMasterElement: 'Water', monthBranch: '午',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      // Pio 98 / Warrior 70 / Artist 52
      topThreeBars: [bar('偏財', 98), bar('七殺', 70), bar('食神', 52)],
    },
  },
  {
    // Added 2026-07-30 from a Joey PDF. Boundary chart: 立春 1989 fires at
    // 04:27 (+08), so 04:00 keeps the PRIOR BaZi year (戊辰) and the 丑 month.
    // This row is also the first lock in tests/time-convention.spec.ts.
    //
    // Fourth confirmed instance of the intended Katon-vs-Joey divergence: 丑
    // hides 辛己癸, so 比肩 appears nowhere in the month branch and no
    // month-rooting rule can emit Joey's headline. Expected to FAIL Track A.
    id: 13,
    date: '1989-02-04', time: '04:00', gender: 'M',
    expect: {
      dayMaster: '乙', dayMasterElement: 'Wood', monthBranch: '丑',
      mainProfileHanzi: '比肩', mainProfileLabel: 'The Self-Reliant', mainStructure: 'Managers',
      // Friend 80 / Phil 80 / Dir 78 / Pio 72 — see correction 2 in the header.
      // 80/80 is a TIE, so the top-two order is not meaningfully asserted.
      topThreeBars: [bar('比肩', 80), bar('偏印', 80), bar('正財', 78)],
      // allBars is attached below from the collected data, like every other row.
      // Kept in mind for whoever reads this row first: 正印 (壬) and 正官 (庚) are
      // both 0 here because neither stem appears anywhere in the chart. That is
      // the zero-presence law, which holds 130/130 across all 13 charts and is
      // what refuted the shared-element-base model.
    },
  },
];

// ── Attach Joey's collected ten bars ──────────────────────
// Done here rather than inline per row so the 130 scores have exactly one source.
// `joeyPresence` carries Joey's per-stem presence figures alongside, because the
// presence-to-bar relationship is what the saturating-transform question needs
// (C4: presence is not monotone with the bar — 癸 at 3.0 scores below 庚 at 0.6).
for (const tc of VALIDATION_CHARTS) {
  const row = JOEY_BARS[String(tc.id)];
  if (!row) continue;
  tc.expect.allBars = {};
  tc.expect.joeyPresence = {};
  tc.expect.joeyStem = {};
  for (const [god, v] of Object.entries(row.joeyBars)) {
    tc.expect.allBars[god] = v.score;
    tc.expect.joeyPresence[god] = v.presence;
    tc.expect.joeyStem[god] = v.stem;
  }
  // Joey's own pillars/day master/month branch, for cross-checking the engine.
  tc.expect.joeyPillars = row.pillars;
  tc.expect.joeyDayMaster = row.dayMaster;
  tc.expect.joeyMonthBranch = row.monthBranch;
}

// Full-pillar expectations for the boundary edge cases (Task 2), keyed by id.
export const PILLAR_EDGE_CASES = {
  6:  { day: '壬戌', hour: '庚子' },  // early-子: do not borrow next day's stem
  7:  { day: '甲子', hour: '丙子' },  // late-子: keep the day, hour stem from next day
  10: { year: '乙丑', month: '戊寅' }, // 立春 year rollover
  13: { year: '戊辰', month: '乙丑', day: '乙未', hour: '戊寅' }, // 27 min BEFORE 立春
};

export default VALIDATION_CHARTS;
