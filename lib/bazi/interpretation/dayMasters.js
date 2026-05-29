// ============================================================
// Day Master archetypes — keyed by Heavenly Stem character
// ============================================================
// 10 entries, one per Heavenly Stem. The Day Master is the
// backbone of the BaZi reading.
//
// FIELD SCHEMA per entry:
//
//   Reading-page fields (existing — drive the longer prose surfaces):
//     name           Indonesian archetype name (canonical).
//     chinese        Stem + element character (e.g. '丙火').
//     tagline        Canonical first-person sharable line ("Aku ...").
//     hero           2–3 sentence Indonesian prose. Who you ARE.
//     identityPills  12 short phrases; composer picks 5 per chart.
//     traits         8 phrases; composer picks 6 per chart.
//
//   Card-surface fields (TCG-style BaziCard, watercolor canvas):
//     taglineCard          Pronoun-stripped variant ("Hadir untuk ...").
//                          NO subject (no aku/kamu/dia).
//     kekuatanDescriptors  3 noun phrases. Strengths. Per bazi-card skill.
//     bayanganDescriptors  3 noun phrases. Shadows, not softened.
//     dampakDescriptors    2–3 noun phrases. What OTHERS feel around them,
//                          NOT self-descriptors.
//     sifatPills           4–6 Gen-Z behavioral phrases for the card's
//                          SIFAT zone ("drama sebentar, move on cepet"
//                          register). Composer picks 4 per chart.
//
// Card fields ship empty for 9 archetypes; 丙 prefilled from the
// reference screenshot. Card component hides empty rows gracefully.
// ============================================================

export const DAY_MASTERS = {
  '甲': {
    name: 'Pohon Oak',
    chinese: '甲木',
    subtitle: 'Pribadi yang jadi tumpuan, meski tak pernah meminta peran itu.',
    tagline: 'Aku bukan yang paling keras, tapi aku yang paling teguh.',
    hero: 'Kamu sering menjadi orang yang dicari ketika situasi mulai goyah, meski kamu tidak pernah meminta peran itu. Kehadiranmu biasa membuat sekitar merasa lebih aman, seperti pohon tua yang akarnya mencengkeram tanah di bawah permukaan. Di balik ketenangan itu, ada kelelahan karena jarang ada yang bertanya apakah kamu juga butuh bersandar.',
    identityPills: [
      'Tumpuan tanpa diminta',
      'Akar yang tidak terlihat',
      'Prinsip yang tidak mudah goyah',
      'Pendengar yang menyimpan cerita',
      'Bertahan di musim kering',
      'Tempat berteduh bagi sekitar',
    ],
    traits: [
      'Kamu sering memilih diam saat kata-kata tidak lagi berarti',
      'Kamu mengakar dalam-dalam sebelum berani tumbuh ke atas',
      'Kamu menjadi pendengar yang menyimpan banyak cerita orang lain',
      'Kamu jarang tergesa, tapi langkahmu tidak pernah benar-benar berhenti',
      'Kamu sering menjadi tempat pulang bagi orang-orang di sekitarmu',
      'Kamu keras pada diri sendiri, tapi lembut pada yang kamu lindungi',
      'Kesabaranmu kadang disalahartikan sebagai keras kepala',
      'Kamu sering menepati janji bahkan yang tidak pernah diucapkan',
    ],
    taglineCard: 'Tidak selalu bersuara, tapi selalu bisa dipegang.',
    kekuatanDescriptors: [
      'bisa diandalkan dalam situasi genting',
      'memegang prinsip tanpa goyah',
    ],
    bayanganDescriptors: [
      'sulit meminta bantuan kepada orang lain',
      'kaku ketika harus berubah mendadak',
    ],
    dampakDescriptors: [
      'orang merasa lebih tenang di dekatnya',
      'menjadi tempat bertanya ketika bingung',
    ],
    sifatPills: [
      'berpikir panjang, eksekusi tetap berjalan',
      'lingkaran teman kecil tetapi loyal',
      'merencanakan jauh ke depan',
      'tidak suka drama, langsung ke inti',
      'kehadirannya membuat sekitar merasa aman',
    ],
  },
  '乙': {
    name: 'Tanaman Rambat',
    chinese: '乙木',
    subtitle: 'Sosok yang lentur dan tak mudah patah oleh keadaan.',
    tagline: 'Aku meliuk, tapi aku tidak pernah patah.',
    hero: 'Kamu biasa membaca ruangan sebelum siapa pun sempat bicara, menangkap isyarat kecil yang terlewat orang lain. Sikapmu yang lentur sering membuatmu mudah menyesuaikan diri, tapi di dalam kepala, kamu sudah memetakan banyak kemungkinan sebelum melangkah. Hanya saja, karena terlalu sering merambat ke berbagai arah, kadang kamu sendiri lupa di mana akarmu yang sesungguhnya.',
    identityPills: [
      'Pengamat di sudut ruangan',
      'Lentur tanpa kehilangan arah',
      'Strategi di balik ketenangan',
      'Penemu celah yang tak terlihat',
      'Tahu kapan harus mundur',
      'Merambat diam-diam ke depan',
    ],
    traits: [
      'Kamu sering mengubah rintangan menjadi pijakan berikutnya',
      'Kamu jarang mengumumkan rencana sebelum waktunya tiba',
      'Kamu pandai membaca emosi yang tidak terucapkan',
      'Kamu bisa bertahan dalam kondisi yang membuat orang lain menyerah',
      'Kamu memilih jalur yang tidak terlihat oleh orang lain',
      'Kesabaranmu kadang terlihat seperti sikap pasrah',
      'Kamu sering menemukan celah ketika semua pintu terasa tertutup',
      'Kamu mengingat siapa yang pernah membantu saat kamu merambat',
    ],
    taglineCard: 'Tumbuh di celah yang orang lain lewatkan.',
    kekuatanDescriptors: [
      'membaca situasi dengan cepat',
      'menyesuaikan diri di mana saja',
    ],
    bayanganDescriptors: [
      'sering sulit ditebak isinya',
      'cenderung menghindari konfrontasi',
    ],
    dampakDescriptors: [
      'membawa ketenangan di tengah kacau',
      'sering memberi solusi yang tak terduga',
    ],
    sifatPills: [
      'banyak rencana, tidak semua diumumkan',
      'tahan banting tetapi tetap tenang',
      'pandai membaca dinamika sosial',
      'jika ditolak, mencari jalan lain',
      'hadir tanpa perlu menarik perhatian',
    ],
  },
  '丙': {
    name: 'Matahari',
    chinese: '丙火',
    subtitle: 'Orang yang kehadirannya membuat sekitar terasa lebih hidup.',
    tagline: 'Aku hadir untuk menerangi, bukan untuk bersinar sendirian.',
    hero: 'Kamu sering jadi orang pertama yang bicara saat ruangan masih ragu, dan setelah itu yang lain ikut bersuara. Energimu biasa menularkan keberanian pada orang di sekitar, seolah mereka baru sadar bisa melangkah karena kamu sudah lebih dulu. Di balik itu, ada kelelahan yang jarang kamu tunjukkan, karena orang lebih sering melihat nyalamu daripada menanyakan apakah panasmu mulai surut.',
    identityPills: [
      'Pencair suasana yang alami',
      'Pulih cepat dari konflik',
      'Kerja keras sampai lupa lelah',
      'Butuh apresiasi untuk menyala',
    ],
    traits: [
      'Kamu melihat peluang di tempat orang lain hanya melihat masalah',
      'Kamu jarang bisa menyembunyikan perasaan, dan itu justru menjadi kekuatanmu',
      'Kamu sering memberi tanpa menghitung, tapi kamu ingat siapa yang benar-benar menghargai',
      'Lelahmu jarang terlihat karena kamu jarang berhenti menyala',
      'Kamu sering dianggap kuat, sehingga jarang ditanya apakah kamu butuh istirahat',
      'Kadang kamu menghilang sejenak, lalu kembali dengan semangat yang penuh',
      'Kamu tidak ragu memutus hubungan yang sudah tidak sehat',
      'Kehangatanmu sering membuat orang lupa bahwa kamu juga bisa kehabisan tenaga',
    ],
    taglineCard: 'Menerangi ruangan tanpa perlu diminta.',
    kekuatanDescriptors: [
      'mencairkan suasana dengan mudah',
      'energinya menular ke sekitar',
    ],
    bayanganDescriptors: [
      'butuh respons agar tetap menyala',
      'mudah lelah tanpa sadar',
    ],
    dampakDescriptors: [
      'orang merasa lebih hidup di dekatnya',
      'menjadi sumber semangat untuk tim',
    ],
    sifatPills: [
      'cepat pulih dari konflik, tidak berlarut',
      'jika peduli, total sepenuhnya',
      'kerja keras sampai lupa istirahat',
      'senang ketika ada yang mengapresiasi',
      'membuat suasana menjadi lebih hangat',
    ],
  },
  '丁': {
    name: 'Lilin',
    chinese: '丁火',
    subtitle: 'Pribadi yang menerangi sudut-sudut yang orang lain lewatkan.',
    tagline: 'Cahayaku kecil, tapi aku yang membuat kamu melihat dalam gelap.',
    hero: 'Cahayamu jarang menggelegar, tapi di saat gelap, kamu sering jadi satu-satunya yang masih setia menyala. Kamu tidak perlu menerangi seluruh ruangan, cukup satu sudut yang kamu jaga dengan diam-diam. Namun, karena nyalamu kecil dan terus menyala, kadang kamu terbakar habis tanpa ada yang menyadari.',
    identityPills: [
      'Nyala kecil di sudut sepi',
      'Penerang yang tak banyak bicara',
      'Peka pada yang tak terucap',
      'Menemani, bukan memimpin',
      'Setia pada nyala sendiri',
      'Menerangi yang terdekat dulu',
    ],
    traits: [
      'Kamu sering menjadi orang yang dicari saat yang lain butuh kejelasan',
      'Kamu setia dalam diam, dan jarang berhenti menyala',
      'Kamu biasa menerangi rahasia yang orang lain sembunyikan',
      'Kamu tahu kapan harus meredup untuk bertahan',
      'Kamu menjadi pendengar yang membuat orang berani jujur',
      'Kadang kamu diabaikan, tapi nyalamu tetap ada',
      'Kamu sering mengorbankan diri diam-diam, lalu berpura-pura tidak lelah',
      'Kamu tidak butuh sorotan karena sudah menjadi arti bagi sekelilingmu',
    ],
    taglineCard: 'Menerangi yang orang lain tak lihat, meski nyalanya kecil.',
    kekuatanDescriptors: [
      'menangkap hal yang orang lain lewatkan',
      'merasakan emosi dengan akurat',
    ],
    bayanganDescriptors: [
      'berpikir berlebihan, sulit berhenti',
      'mudah lelah karena menyerap emosi',
    ],
    dampakDescriptors: [
      'membuat orang merasa dipahami',
      'suasana menjadi lebih teduh',
    ],
    sifatPills: [
      'peka membaca yang tak terucap',
      'lebih banyak mendengar daripada bicara',
      'menyimpan perasaan tanpa perlu diumbar',
      'memperhatikan hal kecil pada orang',
      'setia dalam diam, jarang minta diakui',
    ],
  },
  '戊': {
    name: 'Gunung',
    chinese: '戊土',
    subtitle: 'Orang yang diandalkan, meski tak banyak kata.',
    tagline: 'Aku tidak bergerak, karena semua orang butuh tempat berpijak.',
    hero: 'Kamu sering menjadi fondasi yang diam, menahan beban tanpa banyak yang menyadari. Orang-orang mengagumi puncak, tapi hanya sedikit yang tahu bahwa di bawah sana kamulah yang menopang semuanya. Di balik ketenangan itu, ada kelelahan karena jarang ada yang menawarkanmu tempat bersandar.',
    identityPills: [
      'Tumpuan yang tak banyak bicara',
      'Pijakan saat semuanya goyah',
      'Peta batin yang kokoh',
      'Penjaga diam di bawah',
      'Stabilitas yang tak terguncang',
      'Tempat kembali yang sunyi',
    ],
    traits: [
      'Kamu sering menjadi orang yang ditelepon saat semuanya runtuh',
      'Kamu menyimpan beban banyak orang tanpa mengeluh',
      'Keputusanmu lama dibuat, tapi jarang berubah',
      'Kamu tidak mencari validasi, hanya butuh ruang untuk berdiri',
      'Kesetiaanmu mungkin membosankan, tapi tidak tergantikan',
      'Kamu tidak akan mengikuti ke tempat yang goyah',
      'Kehadiranmu membuat orang lain lega tanpa kamu sadari',
      'Kamu jarang bereaksi cepat, tapi reaksimu sering yang paling tepat',
    ],
    taglineCard: 'Diam di tempat, karena semua orang butuh tempat berpijak.',
    kekuatanDescriptors: [
      'bisa diandalkan saat semuanya goyah',
      'pikiran tenang meski sekitar kacau',
    ],
    bayanganDescriptors: [
      'cenderung menyimpan perasaan sendiri',
      'lama menimbang sebelum memutuskan',
    ],
    dampakDescriptors: [
      'orang merasa lebih aman saat dia ada',
      'jadi tempat pulang yang sunyi tapi nyaman',
    ],
    sifatPills: [
      'orang yang dicari saat semuanya berantakan',
      'jarang mengumbar perasaan, tapi perhatiannya konsisten',
      'lebih banyak menyelesaikan daripada mengumumkan',
      'tidak suka drama, hanya peduli yang penting',
      'kehadirannya membuat sekitar merasa stabil',
    ],
  },
  '己': {
    name: 'Ladang',
    chinese: '己土',
    subtitle: 'Pribadi yang tumbuh pelan, tapi menguatkan banyak orang.',
    tagline: 'Aku bukan latar belakang. Aku adalah tanahnya.',
    hero: 'Kamu sering menjadi tanah tempat benih-benih yang terlantar menemukan tempat tumbuh. Kamu menerima apa yang orang lain buang, lalu diam-diam mengubahnya menjadi panen. Jarang diingat, tapi tanpa dirimu, tidak ada yang bisa berdiri.',
    identityPills: [
      'Penumbuh yang diabaikan',
      'Menerima tanpa menghakimi',
      'Melepaskan, lalu menuai',
      'Penyedia yang sunyi',
      'Tak mudah kosong meski terus memberi',
      'Tempat kembali setelah lelah',
    ],
    traits: [
      'Kamu sering memberi ruang untuk orang lain bertumbuh',
      'Kamu sering diremehkan sampai hasilmu tampak',
      'Kamu punya cadangan kekuatan yang tidak disadari',
      'Kamu bisa membagi yang sedikit ke banyak orang',
      'Kamu memberi banyak, tanpa merasa berkurang',
      'Penampilanmu biasa, tapi isimu luar biasa',
      'Kamu mengerti bahwa memberi adalah menanam, bukan membuang',
      'Kamu tetap ada, meski tidak ada yang mengingat',
    ],
    taglineCard: 'Tempat tumbuh bagi yang terabaikan, tanpa minta diingat.',
    kekuatanDescriptors: [
      'merangkul tanpa banyak suara',
      'memberi tanpa menghitung',
    ],
    bayanganDescriptors: [
      'cenderung melupakan kebutuhan sendiri',
      'sulit mengatakan tidak',
    ],
    dampakDescriptors: [
      'membuat orang merasa punya tempat berpulang',
      'kehadirannya seperti tanah yang menerima tanpa syarat',
    ],
    sifatPills: [
      'sering mengalah, tapi diam-diam mencatat siapa yang ingat',
      'menyediakan banyak tanpa mengharap kembali',
      'menampung cerita orang tanpa lelah',
      'mendahulukan kebutuhan orang terdekat',
      'tidak pernah benar-benar kosong meski terus memberi',
    ],
  },
  '庚': {
    name: 'Pedang',
    chinese: '庚金',
    subtitle: 'Pribadi yang memotong keraguan dengan keputusan tegas.',
    tagline: 'Aku memotong karena aku peduli pada yang benar.',
    hero: 'Kamu sering memotong tanpa berniat melukai, karena bagimu diam di depan yang salah sama dengan membiarkan. Caramu bicara langsung dan tanpa basa-basi kadang membuat orang gentar. Tapi ketajaman itu jugalah yang membuatmu tidak bisa digunakan untuk hal-hal yang tidak penting.',
    identityPills: [
      'Pemotong kebohongan',
      'Tidak bisa dibengkokkan',
      'Prinsip di atas segalanya',
      'Tidak punya waktu untuk basa-basi',
      'Bilah yang memisah benar dari nyaman',
      'Dingin, bukan kejam',
    ],
    traits: [
      'Kamu sering mengatakan hal yang dipikirkan orang tapi takut diucapkan',
      'Kamu tidak bisa bersikap manis hanya untuk menjaga perasaan',
      'Kamu memotong lingkaran pertemanan yang tidak sehat',
      'Kamu lebih memilih sendiri daripada dikelilingi yang palsu',
      'Kejujuranmu kadang menyakitkan, tapi memotong yang busuk',
      'Diammu lebih menakutkan daripada amarahmu',
      'Bagimu tidak ada abu-abu, hanya benar atau tidak benar',
      'Kamu lebih dihormati daripada disukai, dan itu cukup untukmu',
    ],
    taglineCard: 'Menyampaikan kebenaran, meski kadang terasa tajam.',
    kekuatanDescriptors: [
      'memutuskan dengan cepat dan tepat',
      'pemikiran yang logis dan tajam',
    ],
    bayanganDescriptors: [
      'terkadang menyakiti tanpa disadari',
      'sulit sabar menghadapi keraguan',
    ],
    dampakDescriptors: [
      'memberi kejelasan, meski terasa keras',
      'standarnya memaksa orang berkembang',
    ],
    sifatPills: [
      'tidak suka basa-basi, bicara langsung',
      'lingkaran kecil, tapi sangat setia',
      'memutus komunikasi jika dikhianati',
      'tidak sabar dengan ketidakjelasan',
      'jujur meskipun menyakitkan',
    ],
  },
  '辛': {
    name: 'Permata',
    chinese: '辛金',
    subtitle: 'Sosok yang teliti, menghasilkan yang langka dan bernilai.',
    tagline: 'Bukan semua orang bisa melihat nilaimu. Itu bukan masalahmu.',
    hero: 'Kamu tidak berkilau untuk semua mata, dan hanya mereka yang cukup lama mencari yang bisa membaca nilaimu. Di dunia yang memuja yang mencolok, kamu hadir sebagai kemewahan yang tenang, tanpa perlu pengakuan. Namun, justru karena nilaimu tidak mudah terlihat, kadang kamu diabaikan oleh yang tidak sabar.',
    identityPills: [
      'Cahaya yang tersembunyi',
      'Tidak untuk semua orang',
      'Indah tanpa berusaha',
      'Ketajaman yang halus',
      'Ditemukan, bukan dipamerkan',
      'Harga yang tidak ditawar',
    ],
    traits: [
      'Kamu tidak akan menjual murah, meski tidak ada yang menawar',
      'Kamu menyembunyikan kedalaman di balik penampilan tenang',
      'Kamu sering diremehkan sampai mereka butuh pertolonganmu',
      'Kekuatanmu tidak kasar, tapi tidak bisa dihancurkan',
      'Kamu bisa menyayat tanpa suara',
      'Kamu memilih siapa yang boleh melihat isi dirimu',
      'Kamu menunggu waktu yang tepat untuk berkilau, bukan karena tidak mampu',
      'Nilaimu tidak berkurang hanya karena diabaikan',
    ],
    taglineCard: 'Kualitas tidak perlu diumumkan; yang mengerti tetap menemukan.',
    kekuatanDescriptors: [
      'memiliki standar yang tinggi',
      'sangat teliti dan presisi',
    ],
    bayanganDescriptors: [
      'terlalu keras pada diri sendiri',
      'sering merasa tidak cukup baik',
    ],
    dampakDescriptors: [
      'mengingatkan orang pada kualitas',
      'pengakuannya sangat berharga',
    ],
    sifatPills: [
      'tidak suka memamerkan pencapaian',
      'sangat selektif dalam memilih teman',
      'memperhatikan detail hingga kelelahan',
      'standar tinggi, baik untuk diri sendiri',
      'hanya sedikit yang bisa mendekat',
    ],
  },
  '壬': {
    name: 'Samudra',
    chinese: '壬水',
    subtitle: 'Pribadi yang melihat jauh ke depan, melampaui yang tampak.',
    tagline: 'Aku tidak bisa dijelaskan. Aku hanya bisa dirasakan.',
    hero: 'Kamu sering hadir seperti lautan yang tenang di permukaan, tapi menyimpan arus dalam yang tidak mudah terbaca. Kehadiranmu membuat orang penasaran, karena di balik ketenangan itu sering tersimpan kedalaman yang melampaui apa yang tampak. Namun, arus yang berubah tanpa isyarat itu kadang membuatmu sendiri sulit dipegang, seolah kamu mengikuti pasang yang hanya kamu rasakan.',
    identityPills: [
      'Arus di balik permukaan',
      'Kedalaman yang tak terlihat',
      'Mengalir tanpa bisa ditahan',
      'Membawa, bukan menahan',
      'Tidak bisa dipetakan',
      'Tenang di permukaan, dalam di bawah',
    ],
    traits: [
      'Kadang kamu tidak mengerti dirimu sendiri, tapi orang lain tetap percaya padamu',
      'Kamu bisa menenangkan orang lain, tapi menyimpan kekacauan sendiri',
      'Kamu bisa berganti bentuk tanpa kehilangan kedalamanmu',
      'Kamu sering ditarik oleh sesuatu yang tidak dilihat orang lain',
      'Kamu pendiam yang menyimpan banyak hal di dalam dirimu',
      'Kamu tidak bisa dimiliki, tapi orang sering mencarimu',
      'Kamu menyimpan banyak hal di kedalaman yang tidak sembarang orang selami',
      'Kamu terlihat tidak terprediksi, padahal kamu hanya mengikuti ritme yang lebih dalam',
    ],
    taglineCard: 'Sulit dipegang, karena pikirannya melampaui apa yang tampak.',
    kekuatanDescriptors: [
      'melihat gambaran besar yang orang lain lewatkan',
      'intuisinya sering tepat meski tanpa alasan jelas',
    ],
    bayanganDescriptors: [
      'suasana hatinya berubah tanpa isyarat yang jelas',
      'sering sulit dimengerti oleh orang di sekitarnya',
    ],
    dampakDescriptors: [
      'membuat orang penasaran dengan kedalaman pikirannya',
      'kehadirannya terasa misterius namun menarik',
    ],
    sifatPills: [
      'suasana hatinya berubah seperti cuaca, tanpa peringatan',
      'pikirannya terus menyelam, terutama saat sendiri',
      'seolah mengerti banyak hal, tapi jarang mengatakannya',
      'kadang menghilang, lalu kembali tanpa penjelasan',
      'membuat orang penasaran, karena sulit dipahami',
    ],
  },
  '癸': {
    name: 'Hujan',
    chinese: '癸水',
    subtitle: 'Pribadi yang meresap dalam, memahami yang tak terucap.',
    tagline: 'Aku tidak selalu terlihat, tapi aku yang membuat segalanya tumbuh.',
    hero: 'Kamu sering hadir tanpa suara, tapi setelah kepergianmu, semuanya terasa lebih hidup. Tidak semua orang menyadari kehadiranmu sampai mereka melihat tunas muncul di tanah yang kemarin masih kering. Namun, kelembutan yang meresap begitu dalam itu kadang membuatmu menyerap terlalu banyak, dan batas antara dirimu dan orang lain menjadi kabur.',
    identityPills: [
      'Merembes, bukan menghantam',
      'Tidak pernah memaksa',
      'Tidak terlihat tapi terasa',
      'Kelembutan yang meresap',
    ],
    traits: [
      'Kamu sering menghilang setelah memberi, tanpa minta ucapan terima kasih',
      'Kamu menampung air mata banyak orang tanpa memperlihatkan milikmu',
      'Kamu kadang diremehkan sampai musim kemarau tiba',
      'Kamu bisa menyentuh hati yang paling keras dengan cara yang lembut',
      'Kamu punya ritme sendiri yang tidak terburu-buru',
      'Kamu menyediakan ruang tanpa mendikte apa yang harus tumbuh',
      'Kamu tidak banyak bicara, tapi kehadiranmu sering jadi jawaban yang tidak diucapkan',
      'Kamu sering membuat orang merasa lebih baik tanpa mereka sadari',
    ],
    taglineCard: 'Tidak banyak bicara, tetapi kehadirannya menenangkan.',
    kekuatanDescriptors: [
      'mampu merasakan emosi orang lain dengan tepat',
      'memberi ruang aman bagi orang lain untuk terbuka',
    ],
    bayanganDescriptors: [
      'cenderung menyerap perasaan orang lain',
      'batas antara diri dan orang lain sering kabur',
    ],
    dampakDescriptors: [
      'orang merasa diterima apa adanya di dekatnya',
      'bantuannya datang tanpa diminta, diam-diam',
    ],
    sifatPills: [
      'sering merasa ikut sedih tanpa tahu sebabnya',
      'lebih nyaman mendengarkan daripada bercerita',
      'bisa membaca suasana hati orang tanpa mereka bicara',
      'butuh waktu sendiri untuk mengosongkan beban',
      'kehadirannya lembut, tapi dampaknya dalam',
    ],
  },
}
