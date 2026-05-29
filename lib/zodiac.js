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
