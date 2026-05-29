// ============================================================
// Day Branch flavor — keyed by Earthly Branch character
// ============================================================
// 12 entries, one per Earthly Branch. Drives the 六合/六冲 harmony
// + clash mechanic in the Relasi Cabang reading section.
//
// Phase 8a.5: voice tightened to formal Indonesian vocabulary with
// spoken cadence. 'tidak' not 'nggak'. 'membuat' not 'bikin'.
// 'merasa' not 'ngerasa'. Sharp brand voice while staying
// conversational in rhythm.
//
// FIELD SCHEMA per entry:
//   harmony   single paragraph, ~40-55 words. Reader's dynamic
//             with the compatible counterpart (六合 partner).
//   clash     single paragraph, ~40-55 words. Reader's dynamic
//             with the clash counterpart (六冲 partner).
// ============================================================

export const DAY_BRANCHES = {
  '子': {
    harmony: 'Kamu yang pikirannya lari ke mana-mana sering merasa lebih tenang di dekat mereka. Tipe Bumi yang sabar dan tidak mudah goyah ini bisa menjadi jangkar untuk ide-idemu yang beterbangan. Mereka membantumu berhenti, menimbang, dan memilih satu langkah yang paling realistis tanpa membuatmu merasa dibatasi.',
    clash:   'Mereka yang penuh semangat dan suka menjadi pusat perhatian kadang membuatmu tidak nyaman karena mendorongmu keluar dari zona aman. Kamu yang suka menyimpan strategi sering dipaksa lebih terbuka dan cepat. Ketegangan ini bisa menjadi ujian: apakah kamu cukup percaya diri untuk tampil apa adanya?',
  },
  '丑': {
    harmony: 'Mereka, tipe Air yang lincah dan banyak akal, bisa mencairkan kekakuanmu. Di dekat mereka, kamu menjadi lebih fleksibel dan berani mencoba pendekatan baru. Mereka membantumu melihat celah yang selama ini terlewat, dan mengajakmu untuk tidak terlalu kaku terhadap rutinitas.',
    clash:   'Mereka tipe Bumi yang lebih lembut dan emosional kadang membuatmu merasa tidak sabar. Cara mereka yang santai dan suka mengalir sering terasa mengganggu ritme kerjamu yang pasti. Tetapi sebenarnya mereka mengingatkanmu untuk lebih rileks dan tidak terlalu keras pada diri sendiri.',
  },
  '寅': {
    harmony: 'Mereka, tipe Air yang intuitif dan penuh kedalaman, bisa meredam impulsifmu. Mereka membawa ketenangan dan perspektif yang membuatmu tidak hanya bertindak cepat, tetapi juga berpikir panjang. Di dekat mereka, visi besarmu menjadi lebih membumi tanpa kehilangan nyalanya.',
    clash:   'Mereka yang logis, tajam, dan suka memotong langsung sering berbenturan dengan gaya spontanmu. Kamu yang suka kebebasan bisa merasa terkekang oleh standar mereka yang tinggi. Gesekan ini sebenarnya bisa mengasah idemu agar lebih presisi, jika kamu mau mendengarkan.',
  },
  '卯': {
    harmony: 'Mereka, tipe Bumi yang setia dan protektif, bisa menjadi pelindung untuk sisi sensitifmu. Kamu yang sering merasa perlu waspada dan menjaga jarak menjadi lebih rileks. Mereka membawa rasa aman yang membuatmu berani membuka diri tanpa takut disalahpahami.',
    clash:   'Mereka yang perfeksionis dan teliti kadang membuatmu merasa terus dikritik. Standar mereka yang tinggi bisa menyayat kelembutanmu. Tetapi sebenarnya mereka hanya ingin kamu lebih kuat dan tidak mudah terluka, meski caranya mungkin terasa keras.',
  },
  '辰': {
    harmony: 'Mereka, tipe Logam yang presisi dan berkelas, bisa membuat energimu yang meledak-ledak menjadi lebih terarah. Kamu yang penuh ambisi dan suka mengambil alih menjadi memiliki partner yang bisa memoles idemu menjadi nyata. Mereka membawa struktur tanpa meredam semangatmu.',
    clash:   'Mereka yang memiliki prinsip teguh dan suka menjadi penjaga aturan sering berbenturan dengan dominasimu. Dua otoritas bertemu, dan gesekan muncul karena kalian berdua sama-sama sulit mengalah. Ini ujian untuk belajar berbagi panggung dan menghargai sudut pandang lain.',
  },
  '巳': {
    harmony: 'Mereka, tipe Logam yang tajam dan cepat berpikir, bisa mengimbangi strategi cerdikmu. Kalian berdua sama-sama suka menganalisa, dan mereka bisa membantu idemu yang rumit menjadi rencana yang rapi. Kerja sama ini sering menghasilkan solusi yang brilian.',
    clash:   'Mereka yang penuh perasaan dan cenderung mengalir kadang membuatmu frustrasi karena dianggap tidak jelas. Kamu yang suka segala sesuatu terukur dan terencana menjadi merasa tidak sinkron. Tetapi mereka mengingatkanmu bahwa tidak semua hal bisa dikontrol dengan logika.',
  },
  '午': {
    harmony: 'Mereka, tipe Bumi yang tenang dan penuh perhatian, bisa menjadi tempatmu mendingin ketika energi sudah di puncak. Kamu yang suka menjadi pusat perhatian kadang butuh ruang redup; mereka menyediakannya tanpa perlu banyak kata. Di dekat mereka, kamu bisa beristirahat dari tuntutan untuk selalu bersinar.',
    clash:   'Mereka yang tertutup dan penuh rahasia kadang membuatmu kesal karena sulit ditebak. Kamu yang ekspresif menginginkan kejelasan, tetapi mereka justru membuatmu merasa terus diuji. Tantangan ini bisa mengajarimu bahwa tidak semua orang harus terbuka dengan caramu.',
  },
  '未': {
    harmony: 'Mereka, tipe Api yang hangat dan ekspresif, bisa melunakkan sisi keras kepalamu. Kamu yang sering memendam perasaan menjadi lebih mudah terbuka di dekat mereka. Mereka membawa cahaya yang membuatmu merasa lebih ringan dan tidak sendirian menanggung beban.',
    clash:   'Mereka yang pekerja keras dan disiplin kadang membuatmu merasa kurang cukup. Standar mereka yang tinggi membuatmu meragukan caramu sendiri yang lebih santai. Sebenarnya mereka hanya ingin kamu lebih bertanggung jawab, tetapi gesekan ini bisa menjadi pelajaran untuk menerima batasan.',
  },
  '申': {
    harmony: 'Mereka, tipe Api yang strategis dan penuh wawasan, bisa mengasah ide-ide liarmu. Kamu yang cepat bosan dan suka meloncat-loncat menjadi memiliki partner yang bisa menyalurkan kreativitasmu ke jalur yang tepat. Bersama mereka, kamu menjadi lebih fokus tanpa kehilangan kecerdikan.',
    clash:   'Mereka yang pemberani dan suka tantangan sering mengacaukan rencana matangmu. Kamu yang suka kebebasan terstruktur merasa terganggu oleh spontanitas mereka. Tetapi justru dari situ kamu bisa belajar fleksibilitas dan keluar dari zona nyaman intelektualmu.',
  },
  '酉': {
    harmony: 'Mereka, tipe Bumi yang ambisius dan penuh otoritas, bisa menjadi panggung untuk kilauanmu. Kamu yang teliti dan butuh pengakuan dihargai oleh mereka yang memahami nilai presisi. Mereka memberimu kepercayaan diri untuk tampil, bukan sekadar di belakang layar.',
    clash:   'Mereka yang lembut dan mengalah sering membuatmu tidak sabar karena dianggap kurang tegas. Kamu yang suka standar tinggi menjadi frustrasi. Tetapi mereka sebenarnya bisa mengajarimu bahwa tidak semua harus sempurna, dan sedikit fleksibilitas tidak akan menurunkan kualitasmu.',
  },
  '戌': {
    harmony: 'Mereka, tipe Kayu yang sensitif dan cinta damai, bisa menjadi satu-satunya yang bisa masuk ke balik pertahananmu. Kamu yang setia dan waspada akhirnya bisa rileks karena mereka tidak mengancam. Di dekat mereka, kamu bisa menjadi versi dirimu yang paling lembut tanpa takut dimanfaatkan.',
    clash:   'Mereka yang dominan dan suka memimpin sering menantang otoritasmu. Kamu yang protektif menjadi merasa terpojok ketika ide-idemu dipertanyakan. Benturan ini sebenarnya bisa membuka matamu bahwa tidak semua perubahan adalah ancaman, dan kadang kamu perlu lebih terbuka pada kritik.',
  },
  '亥': {
    harmony: 'Mereka, tipe Kayu yang visioner dan penuh inisiatif, bisa membuatmu tidak hanya mengalir. Mereka mendorongmu untuk mewujudkan intuisi menjadi tindakan nyata. Di dekat mereka, kamu lebih berani mengambil risiko dan keluar dari kebiasaan menunda-nunda.',
    clash:   'Mereka yang suka mengontrol dan penuh perhitungan kadang membuatmu merasa dibatasi. Kamu yang bebas dan intuitif menjadi tidak nyaman dengan aturan mereka. Tetapi justru dari situ kamu bisa belajar disiplin dan membuat seluruh kepekaanmu menjadi sesuatu yang konkret, bukan hanya perasaan.',
  },
}
