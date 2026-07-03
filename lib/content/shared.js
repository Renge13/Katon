import 'server-only';
// Shared content constants. Leaf module: archetype files AND index.js import it, so
// no circular dependency. Static prose (hourExplanation, closer) is founder-canonical
// and lives ONCE here; the paid-beat + FREE headings live here so every cell references
// the same string and the paywall accordion cannot drift from the beat it names.

export const hourExplanation = `Soal jam lahir. Petamu dihitung dari tiga pilar: tahun, bulan, dan hari. Jam lahir menambahkan pilar keempat, yang mengungkap sisi paling pribadimu: caramu bergerak saat tidak ada yang melihat. Tanpa jam, bacaan ini tetap utuh pada polanya. Dengan jam, ia menjadi lebih tajam di lapisan yang paling dalam. Kalau suatu saat kamu tahu jam lahirmu, masukkan, dan petamu akan dihitung ulang.`;

export const closer = `Ini bukan ramalan. Ini pola yang terbaca dari Empat Pilarmu, dipakai untuk pertanyaan yang sedang kamu bawa. Yang memutuskan tetap kamu.`;

export const BEAT_HEADINGS = {
  1: `Yang Perlu Kamu Dengar Dulu`,
  2: `Bagaimana Ini Muncul`,
  3: `Yang Sebenarnya Terjadi`,
  4: `Yang Menenangkan vs Yang Melelahkan`,
  5: `Empat Pilarmu · 八字`,
  6: `Cara Memutuskannya`,
  7: `Apa Artinya`,
};

export const FREE_HEADINGS = [`Siapa Kamu`, `Kenapa Begini`, `Ke Mana Ini Bawa Kamu`];

export const FD_LABELS = {
  cardFeed: 'YANG MENENANGKAN',
  cardDrain: 'YANG MELELAHKAN',
  section: 'Yang Menenangkan vs Yang Melelahkan',
};
