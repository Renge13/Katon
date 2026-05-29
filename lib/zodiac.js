// Earthly Branch → Indonesian zodiac animal. Client-safe (no server-only).
// Used on the sharecard to surface harmony/clash branches as "taggable people"
// ("cocok sama yang lahir tahun Kerbau").

export const BRANCH_ZODIAC_ID = {
  '子': 'Tikus',
  '丑': 'Kerbau',
  '寅': 'Macan',
  '卯': 'Kelinci',
  '辰': 'Naga',
  '巳': 'Ular',
  '午': 'Kuda',
  '未': 'Kambing',
  '申': 'Monyet',
  '酉': 'Ayam',
  '戌': 'Anjing',
  '亥': 'Babi',
};

export function branchesToZodiac(branches) {
  return (branches || []).map((b) => BRANCH_ZODIAC_ID[b] || b);
}

// Earthly Branch → archetype name, via the branch's primary hidden stem
// (BRANCH_PRIMARY_STEM in lib/bazi/interpretation) → DAY_MASTERS name. NOT 1:1:
// 丑/未 → Ladang, 辰/戌 → Gunung (the two Earth branch-pairs share a primary stem).
export const BRANCH_ARCHETYPE = {
  '子': 'Hujan',         // 癸
  '丑': 'Ladang',        // 己
  '寅': 'Pohon Oak',     // 甲
  '卯': 'Tanaman Rambat',// 乙
  '辰': 'Gunung',        // 戊
  '巳': 'Matahari',      // 丙
  '午': 'Lilin',         // 丁
  '未': 'Ladang',        // 己
  '申': 'Pedang',        // 庚
  '酉': 'Permata',       // 辛
  '戌': 'Gunung',        // 戊
  '亥': 'Samudra',       // 壬
};

/** Branches → [{ branch, archetype, zodiac }] for archetype-primary card display. */
export function branchesToTaggable(branches) {
  return (branches || []).map((b) => ({
    branch: b,
    archetype: BRANCH_ARCHETYPE[b] || b,
    zodiac: BRANCH_ZODIAC_ID[b] || b,
  }));
}
