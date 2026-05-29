// ============================================================
// Pillar meanings — per-pillar × per-stem interpretive lines
// ============================================================
// Each pillar position (Tahun / Bulan / Hari / Jam) carries the
// reader's stem character. This lookup gives the reader-facing
// answer to "so what does it mean for me if my [pillar] is [stem]?"
//
// 4 pillars × 10 stems = 40 short interpretive lines.
//
// The line for each (pillar × stem) combination opens with the
// pillar's role framing ("Dunia melihatmu...", "Cara kerjamu...",
// "Inti dirimu...", "Di sisi pribadi...") and continues with the
// stem-specific behavioral observation.
//
// Voice: observational, plainspoken Indonesian, behavioral. No
// "akan / pasti / selalu". One metaphor system per line. No em-dashes.
//
// Same stem reads differently per position — that's the point.
// ============================================================

export const PILLAR_STEM_MEANINGS = {
  year: {
    '甲': 'Dunia melihatmu sebagai sosok yang kokoh dan bisa diandalkan sejak pertemuan pertama.',
    '乙': 'Dunia melihatmu sebagai pribadi yang lentur dan mudah beradaptasi di berbagai situasi sosial.',
    '丙': 'Dunia melihatmu sebagai orang yang hangat dan mudah membuat orang lain merasa diterima.',
    '丁': 'Dunia melihatmu sebagai sosok yang tenang dan penuh perhatian pada hal-hal kecil.',
    '戊': 'Dunia melihatmu sebagai pribadi yang stabil dan tak mudah goyah, seperti tempat bersandar yang aman.',
    '己': 'Dunia melihatmu sebagai sosok yang rendah hati dan peduli, sering siap membantu tanpa banyak bicara.',
    '庚': 'Dunia melihatmu sebagai sosok yang tegas dan tidak suka basa-basi.',
    '辛': 'Dunia melihatmu sebagai pribadi yang selektif dan berkelas, hanya sedikit yang bisa mendekat.',
    '壬': 'Dunia melihatmu sebagai sosok yang penuh ide besar dan sulit ditebak isi pikirannya.',
    '癸': 'Dunia melihatmu sebagai pribadi yang lembut dan mudah memahami perasaan orang lain.',
  },
  month: {
    '甲': 'Cara kerjamu tekun dan konsisten, lebih suka proyek jangka panjang yang bisa dirawat sampai kokoh.',
    '乙': 'Cara kerjamu fleksibel dan tak kaku, bisa menyesuaikan ritme dengan siapa pun yang terlibat.',
    '丙': 'Cara kerjamu penuh semangat dan suka memulai inisiatif, tapi butuh umpan balik agar tetap menyala.',
    '丁': 'Cara kerjamu mendetail dan mengamati dulu sebelum bergerak, pastikan semuanya tepat sasaran.',
    '戊': 'Cara kerjamu perlahan tapi pasti, tidak terburu-buru mengikuti tren yang belum terbukti.',
    '己': 'Cara kerjamu mendukung dari belakang, memastikan semua orang bisa berkembang dengan nyaman.',
    '庚': 'Cara kerjamu langsung ke inti, lebih suka memutuskan cepat daripada berlama-lama menimbang.',
    '辛': 'Cara kerjamu penuh standar tinggi, setiap detail kamu poles sampai sempurna sebelum dilepas.',
    '壬': 'Cara kerjamu visioner dan sering melompat ke gambaran besar, tapi butuh orang yang membumikan ide.',
    '癸': 'Cara kerjamu halus dan penuh empati, bisa membaca kebutuhan rekan tanpa banyak kata.',
  },
  day: {
    '甲': 'Inti dirimu sering tampak sebagai keteguhan yang tidak mudah goyah, bahkan saat tidak ada yang menopangmu.',
    '乙': 'Inti dirimu sering tampak sebagai kelenturan yang membuatmu bisa bertahan di segala musim, tanpa kehilangan esensi.',
    '丙': 'Inti dirimu sering tampak sebagai kehangatan yang ingin menerangi dan memberi energi pada sekitar.',
    '丁': 'Inti dirimu sering tampak sebagai kepekaan yang menangkap apa yang orang lain lewatkan, dan tetap setia menjaga nyala kecil itu.',
    '戊': 'Inti dirimu sering tampak sebagai stabilitas yang menjadi fondasi, tempat orang lain merasa aman untuk berlabuh.',
    '己': 'Inti dirimu sering tampak sebagai kesuburan yang ingin menumbuhkan dan merawat, bahkan sering lupa menyirami diri sendiri.',
    '庚': 'Inti dirimu sering tampak sebagai ketajaman dan kejujuran yang tidak suka berbelit, meski kadang menyayat tanpa sengaja.',
    '辛': 'Inti dirimu sering tampak sebagai presisi dan standar tinggi yang membuatmu terus mengasah hingga mencapai yang terbaik.',
    '壬': 'Inti dirimu sering tampak sebagai lautan dalam yang penuh visi dan arus pemikiran, sulit dibatasi definisi sederhana.',
    '癸': 'Inti dirimu sering tampak sebagai kelembutan yang meresap ke mana-mana, bisa merasakan dunia tanpa sekat yang jelas.',
  },
  hour: {
    '甲': 'Di sisi pribadi, kamu lebih sensitif dari yang terlihat, menyimpan kerentanan di balik kokohmu.',
    '乙': 'Di sisi pribadi, kamu kadang kehilangan arah karena terlalu sering menyesuaikan dengan orang lain.',
    '丙': 'Di sisi pribadi, kamu butuh momen untuk redup dan tak selalu menjadi pusat perhatian.',
    '丁': 'Di sisi pribadi, kamu sering merasa terbakar habis karena terlalu banyak menyerap emosi sekitar.',
    '戊': 'Di sisi pribadi, kamu sebenarnya ingin melepas beban dan membiarkan dirimu goyah sesekali.',
    '己': 'Di sisi pribadi, kamu mendambakan seseorang yang bisa merawatmu sebaik kamu merawat orang lain.',
    '庚': 'Di sisi pribadi, kamu sebenarnya lebih lembut dari yang biasa kamu tunjukkan.',
    '辛': 'Di sisi pribadi, kamu kadang merasa kesepian karena standarmu yang tinggi sulit dipahami orang lain.',
    '壬': 'Di sisi pribadi, kamu sering merasa terasing karena pikiranmu sudah melampaui apa yang bisa dibahas sehari-hari.',
    '癸': 'Di sisi pribadi, kamu butuh waktu mengering setelah menyerap hujan emosi dari orang lain.',
  },
}
