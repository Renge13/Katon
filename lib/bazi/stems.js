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

// Hidden stems (藏干) — main stem first
export const HIDDEN_STEMS = {
  '子': [{ stem: '壬', weight: 1.0 }],
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
