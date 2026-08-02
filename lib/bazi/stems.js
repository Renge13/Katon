// ============================================================
// BaZi Heavenly Stems (天干) and Earthly Branches (地支)
// ============================================================

export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

export const STEM_ELEMENTS = {
  '甲': 'Wood',  '乙': 'Wood',
  '丙': 'Fire',  '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

export const STEM_POLARITY = {
  '甲': 'Yang', '乙': 'Yin',
  '丙': 'Yang', '丁': 'Yin',
  '戊': 'Yang', '己': 'Yin',
  '庚': 'Yang', '辛': 'Yin',
  '壬': 'Yang', '癸': 'Yin',
};

export const BRANCH_ELEMENTS = {
  '子': 'Water', '丑': 'Earth', '寅': 'Wood',  '卯': 'Wood',
  '辰': 'Earth', '巳': 'Fire',  '午': 'Fire',  '未': 'Earth',
  '申': 'Metal', '酉': 'Metal', '戌': 'Earth', '亥': 'Water',
};

// Hidden stems (藏干) — main stem first. THE single source of this table; every
// consumer imports it (buildChart, tenGods, mainProfile, tenGodTally, strength).
//
// 子 = 癸, CORRECTED 2026-08-01. It was 壬, which was wrong and sat in the
// accuracy core: every chart containing 子 assigned its Water to the wrong Ten
// God. Joey's own output for fixture chart 1 prints 子 → 癸 Gui -Water 官, and the
// mainstream 藏干 table agrees. All twelve branches were re-verified against
// Joey's printed hidden stems; only 子 was wrong.
//
// The trap: the Yang/Yin Water split is 亥 → 壬 (Yang) and 子 → 癸 (Yin), which is
// the OPPOSITE of what each branch's own polarity label suggests. Same shape for
// Fire: 巳 → 丙, 午 → 丁. Do not "fix" these back.
export const HIDDEN_STEMS = {
  '子': [{ stem: '癸', weight: 1.0 }],
  '丑': [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.1 }],
  '寅': [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '卯': [{ stem: '乙', weight: 1.0 }],
  '辰': [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.1 }],
  '巳': [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '午': [{ stem: '丁', weight: 0.6 }, { stem: '己', weight: 0.4 }],
  '未': [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.1 }],
  '申': [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '酉': [{ stem: '辛', weight: 1.0 }],
  '戌': [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.1 }],
  '亥': [{ stem: '壬', weight: 0.6 }, { stem: '甲', weight: 0.4 }],
};

// Six harmonies (六合) — pairs that harmonize
export const SIX_HARMONIES = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
  ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

// Six clashes (六冲)
export const SIX_CLASHES = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

// ── 刑 (Punishment) ────────────────────────────────────────
// The only mechanic in the set that describes SELF-INFLICTED friction. Everything
// else either comes at you (Officer pressure, Clash, Harm) or is carried (badges).
//
// SCOPE RULING (D1): count 自刑 and FULL 三刑 only. A partial trine — two of the
// three branches — is NOT counted. Measured across the 13 fixture charts,
// including partials pushes frequency from 31% to 54%, at which point the marker
// stops carrying information.
//
// VERIFIED 2026-08-01 against independent BaZi sources (masterseanchan.com,
// fourpillars.pro, deeporacle.ai, kittybazispace); all agree on all four rows and
// none disagreed. NOT verifiable against tyme4ts, which has no punishment API, and
// NOT against the bazi-calculator skill, which has no punishment table — and whose
// 藏干 table still carries the 子 = 壬 error this repo corrected, so it is not a
// trustworthy source for tables.
//
// Do not confuse 刑 with 害 (Harm, above) or add 破 (Break) — deliberately excluded.

/** Branches that punish themselves when repeated. NOT every branch does this. */
export const SELF_PUNISHMENT = ['辰', '午', '酉', '亥'];

/** 三刑 — full trines only. All three branches must be present. */
export const PUNISHMENT_TRINES = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
];

/** 相刑 — a mutual pair, not a partial trine, so it counts. */
export const PUNISHMENT_PAIRS = [['子', '卯']];

/**
 * Punishments present among a chart's branches.
 *
 * @param {string[]} branches the chart's branches (3 without an hour, 4 with)
 * @returns {{ type: 'self'|'trine'|'pair', branches: string[] }[]} empty when none
 */
export function branchPunishments(branches) {
  const present = branches.filter(Boolean);
  const counts = {};
  for (const b of present) counts[b] = (counts[b] ?? 0) + 1;
  const out = [];

  // 自刑 — the branch must appear at least twice, and be one of the four.
  for (const branch of SELF_PUNISHMENT) {
    if ((counts[branch] ?? 0) >= 2) {
      out.push({ type: 'self', branches: Array(counts[branch]).fill(branch) });
    }
  }

  // 三刑 — complete trines only. Two of three is excluded by the ruling.
  for (const trine of PUNISHMENT_TRINES) {
    if (trine.every((b) => counts[b])) out.push({ type: 'trine', branches: [...trine] });
  }

  for (const pair of PUNISHMENT_PAIRS) {
    if (pair.every((b) => counts[b])) out.push({ type: 'pair', branches: [...pair] });
  }

  return out;
}

/**
 * Returns branches that harmonize with a given branch
 */
export function getHarmonyBranches(branch) {
  for (const pair of SIX_HARMONIES) {
    if (pair[0] === branch) return [pair[1]];
    if (pair[1] === branch) return [pair[0]];
  }
  return [];
}

/**
 * Returns branches that clash with a given branch
 */
export function getClashBranches(branch) {
  for (const pair of SIX_CLASHES) {
    if (pair[0] === branch) return [pair[1]];
    if (pair[1] === branch) return [pair[0]];
  }
  return [];
}
