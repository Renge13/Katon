// ============================================================
// BaZi 12-chart validation fixture
// ============================================================
// Ground truth transcribed from Joey Yap's calculator, verified against the
// source PDFs. This is the authoritative table the engine is validated against.
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
// ── topThreeBars ──
// Only the RANK ORDER is asserted (Task 5a) — we do NOT match Joey's proprietary
// normalization constants. `god` is the Ten God hanzi; `score` is the PDF's
// numeric bar value, which was NOT provided to this engine build, so it is
// stored as null. Fill in the real PDF numbers here when available; nothing in
// this phase depends on them.
//
// Ten God label ↔ hanzi (Katon canonical + Joey-name aliases seen in the PDFs):
//   比肩 The Self-Reliant  (Joey: Friend)
//   劫財 The Mover         (Joey: Rob Wealth / "Warrior" *)
//   食神 The Creator       (Joey: Artist)
//   傷官 The Dazzler       (Joey: Performer)
//   正財 The Steward       (Joey: Direct Wealth)
//   偏財 The Trailblazer   (Joey: Pioneer)
//   正官 The Keeper        (Joey: "Diplomat" * / Director)
//   七殺 The Fighter       (Joey: 7 Killings)
//   正印 The Learner       (Joey: Analyzer)
//   偏印 The Thinker       (Joey: Philosopher)
// * Chart 2's top-3 was given in raw Joey nomenclature ("Warrior", "Diplomat").
//   Mapped Warrior→劫財, Diplomat→正官 as the best fit — FLAG for confirmation.
// ============================================================

const bar = (god) => ({ god, score: null });

export const VALIDATION_CHARTS = [
  {
    id: 1,
    date: '1989-09-13', time: '09:00', gender: 'M',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '酉',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Managers',
      topThreeBars: [bar('正財'), bar('比肩'), bar('偏財')], // Steward, Self-Reliant, Trailblazer
    },
  },
  {
    id: 2,
    date: '1990-03-04', time: '14:00', gender: 'M',
    expect: {
      dayMaster: '戊', dayMasterElement: 'Earth', monthBranch: '寅',
      mainProfileHanzi: '比肩', mainProfileLabel: 'The Self-Reliant', mainStructure: 'Connectors',
      topThreeBars: [bar('比肩'), bar('劫財'), bar('正官')], // Friend, Warrior*, Diplomat*
    },
  },
  {
    id: 3,
    date: '1992-04-20', time: '08:00', gender: 'M',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '辰',
      mainProfileHanzi: '偏印', mainProfileLabel: 'The Thinker', mainStructure: 'Thinkers',
      topThreeBars: [bar('偏印'), bar('食神'), bar('正印')], // Thinker, Creator, Learner
    },
  },
  {
    id: 4,
    date: '1995-06-01', time: '06:00', gender: 'F',
    expect: {
      dayMaster: '癸', dayMasterElement: 'Water', monthBranch: '巳',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Creators',
      topThreeBars: [bar('正財'), bar('食神'), bar('劫財')], // Steward, Creator, Mover
    },
  },
  {
    id: 5,
    date: '1988-07-10', time: '22:00', gender: 'F',
    expect: {
      dayMaster: '丙', dayMasterElement: 'Fire', monthBranch: '未',
      mainProfileHanzi: '傷官', mainProfileLabel: 'The Dazzler', mainStructure: 'Creators',
      topThreeBars: [bar('傷官'), bar('比肩'), bar('食神')], // Dazzler, Self-Reliant, Creator
    },
  },
  {
    id: 6,
    date: '1989-03-03', time: '00:15', gender: 'M',
    expect: {
      dayMaster: '壬', dayMasterElement: 'Water', monthBranch: '寅',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      topThreeBars: [bar('偏財'), bar('食神'), bar('七殺')], // Trailblazer, Creator, Fighter
    },
  },
  {
    id: 7,
    date: '1993-06-12', time: '23:30', gender: 'F',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '午',
      mainProfileHanzi: '正印', mainProfileLabel: 'The Learner', mainStructure: 'Creators',
      topThreeBars: [bar('正印'), bar('傷官'), bar('食神')], // Learner, Dazzler, Creator
    },
  },
  {
    id: 8,
    date: '1992-01-05', time: '08:00', gender: 'M',
    expect: {
      dayMaster: '庚', dayMasterElement: 'Metal', monthBranch: '子',
      mainProfileHanzi: '傷官', mainProfileLabel: 'The Dazzler', mainStructure: 'Creators',
      topThreeBars: [bar('傷官'), bar('偏印'), bar('比肩')], // Dazzler, Thinker, Self-Reliant
    },
  },
  {
    id: 9,
    date: '1990-08-07', time: '10:00', gender: 'F',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '未',
      mainProfileHanzi: '正財', mainProfileLabel: 'The Steward', mainStructure: 'Creators',
      // profile ≠ top bar: Track A → 正財, but top element bar is Creator (食神)
      topThreeBars: [bar('食神'), bar('傷官'), bar('正財')], // Creator, Dazzler, Steward
    },
  },
  {
    id: 10,
    date: '1985-02-04', time: '12:00', gender: 'M',
    expect: {
      dayMaster: '甲', dayMasterElement: 'Wood', monthBranch: '寅',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      topThreeBars: [bar('偏財'), bar('比肩'), bar('食神')], // Trailblazer, Self-Reliant, Creator
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
      topThreeBars: [bar('正印'), bar('傷官'), bar('偏印')], // Learner, Dazzler, Thinker
    },
  },
  {
    id: 12,
    date: '1990-06-07', time: '12:00', gender: 'F',
    expect: {
      dayMaster: '癸', dayMasterElement: 'Water', monthBranch: '午',
      mainProfileHanzi: '偏財', mainProfileLabel: 'The Trailblazer', mainStructure: 'Managers',
      topThreeBars: [bar('偏財'), bar('七殺'), bar('食神')], // Trailblazer, Fighter, Creator
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
      // Real PDF bar values for this row (Friend 80, Philosopher 80 — a tie,
      // Director 78, Pioneer 72). Only rank order is asserted.
      topThreeBars: [
        { god: '比肩', score: 80 },  // Friend
        { god: '偏印', score: 80 },  // Philosopher
        { god: '正官', score: 78 },  // Director
      ],
    },
  },
];

// Full-pillar expectations for the boundary edge cases (Task 2), keyed by id.
export const PILLAR_EDGE_CASES = {
  6:  { day: '壬戌', hour: '庚子' },  // early-子: do not borrow next day's stem
  7:  { day: '甲子', hour: '丙子' },  // late-子: keep the day, hour stem from next day
  10: { year: '乙丑', month: '戊寅' }, // 立春 year rollover
  13: { year: '戊辰', month: '乙丑', day: '乙未', hour: '戊寅' }, // 27 min BEFORE 立春
};

export default VALIDATION_CHARTS;
