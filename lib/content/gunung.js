import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const gunung = {
  stem: '戊',
  archetypeName: 'GUNUNG',
  dayMasterChinese: '戊',
  dayMasterElement: 'Earth',
  states: {
    balanced: {
      card: {
        modifier: `Berpijak Kokoh`,
        dimension: `Kamu adalah orang pertama yang dicari saat keadaan sedang kacau, dan kehadiranmu saja sudah cukup membuat sekitarmu merasa aman. Karena kamu selalu terlihat kokoh tanpa celah, semua orang datang untuk bersandar padamu. Hampir tidak ada yang sadar bahwa kamu pun butuh disangga.`,
        feed: [`Matahari`, `Pelita`],
        drain: [`Jati`, `Akar`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali seseorang menumpahkan seluruh masalahnya kepadamu, lalu mereka pergi dengan perasaan jauh lebih ringan, sementara kamu hanya mengangguk dan menampung semuanya tanpa ada yang balik bertanya, "Kamu sendiri bagaimana?"

Itulah dirimu. Kamu adalah jangkar saat orang lain kalut. Kamu tidak mudah panik dan tidak gampang goyah. Saat dunia di sekitarmu terasa runtuh, kamulah titik stabil yang membuat mereka percaya bahwa semua hal masih bisa dikendalikan.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Bumi yang seimbang, tetapi jenisnya bukan tanah subur yang sibuk mengasuh tanaman. Kamu adalah gunung yang berpijak kokoh, dan tugas utamamu bukan memanjakan, melainkan menahan beban. Karena posisinya seimbang, kestabilanmu ini tidak membuatmu menjadi batu kaku yang membosankan. Kamu tetap bisa bergerak saat situasi mendesak. Masalahnya, ketenanganmu yang konstan ini membuat orang lain lupa bahwa gunung pun menanggung tekanan yang luar biasa di dalamnya.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang selalu kuat. Kamu yang menenangkan saat pasanganmu cemas, kamu yang tetap berpijak saat keadaan berguncang. Tetapi karena kamu tidak pernah terlihat goyah, lama-kelamaan orang di sekitarmu berhenti bertanya apakah kamu baik-baik saja. Mereka berasumsi kamu tidak membutuhkan apa-apa, justru karena kamu begitu jarang meminta. Dan kamu pun membiarkannya, karena bagimu, menjadi yang paling kokoh terasa lebih aman daripada mengakui bahwa kamu juga bisa lelah.` },
          bridge: [`Semua orang tahu mereka bisa bersandar padaku. Tapi kalau giliran aku yang capek, ke mana aku harus bersandar? Atau memang sudah seharusnya aku yang menahan semuanya sendiri?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa ketenangan yang membuat semua orang merasa aman justru membuatmu merasa sendirian. Ini bukan karena orang-orang di sekitarmu tidak peduli, dan bukan pula karena kamu kurang kuat.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kestabilan yang menjadi kekuatanmu justru membuat kebutuhanmu sendiri tidak terlihat oleh siapa pun.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang membuatmu merasa aman untuk sesekali tidak kuat, dan mereka yang justru menjadikanmu tempat menumpahkan beban tanpa pernah berbalik menopangmu.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan ketenanganmu adalah kekuatan sejati, dan kapan ia hanyalah caramu menghindari risiko untuk terlihat membutuhkan.` },
            ],
          },
          ocean: {
            beat1: `Ketenanganmu adalah salah satu hal paling langka yang kamu miliki. Kamu memberi orang-orang di sekitarmu sesuatu yang sangat berharga: rasa aman bahwa ada satu titik yang tidak akan goyah, apa pun yang terjadi. Tetapi mari jujur, menjadi titik yang tidak boleh goyah itu memiliki bebannya sendiri. Saat kamu selalu menjadi yang paling kuat, perlahan tidak ada lagi ruang yang tersisa untuk sesekali menjadi yang membutuhkan. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Seseorang datang dengan masalahnya, kamu mendengarkan dan menenangkan, lalu mereka pergi merasa lega. Tetapi saat kamu sendiri sedang berat, kamu justru menyimpannya sendiri, karena rasanya aneh membebani orang dengan sesuatu yang seharusnya bisa kamu tangani.`,
                `Orang-orang terdekatmu menganggapmu sebagai sosok yang selalu baik-baik saja. Mereka jarang menanyakan keadaanmu, bukan karena tidak peduli, melainkan karena kamu tidak pernah memberi tanda bahwa kamu pun sedang tidak baik-baik saja.`,
                `Saat kamu akhirnya lelah, kamu tidak tahu harus bersandar pada siapa. Kamu begitu terbiasa menjadi tempat bersandar, sampai gagasan untuk meminta dukungan terasa asing, bahkan sedikit mengganggu.`,
              ],
            },
            beat3: {
              body: `Orang di sekitarmu berhenti bertanya apakah kamu baik-baik saja bukan karena mereka tidak peduli, melainkan karena kamu terlalu rapi menyembunyikan retakan. Kamu hampir tidak pernah meminta, jadi mereka berasumsi kamu memang tidak butuh apa-apa. Kekuatanmu yang sama yang membuat orang merasa aman adalah kekuatan yang membuat kebutuhanmu menjadi tak terlihat.

Dan mari jujur: sebagian dari dirimu memang memilih peran ini. Menjadi sosok yang tidak bisa goyah terasa jauh lebih aman daripada harus mengaku kalau kamu sedang lelah. Bagimu, menanggung semuanya sendirian jauh lebih mudah dihadapi daripada risiko meminta bantuan, lalu mendapati tidak ada orang yang datang menopangmu. Kamu memilih untuk tidak terlihat demi menghindari rasa kecewa.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan individu tipe Jati atau Akar, yang datang dengan pertumbuhan dan dinamika mereka sendiri, lalu menjadikan kestabilanmu sebagai fondasi permanen untuk bersandar. Tanpa sadar, kamu diposisikan sebagai pilar yang wajib selalu kuat tanpa pernah diberi kesempatan untuk berganti peran. Kamu lelah karena peran ini lama-kelamaan dianggap sebagai kewajiban yang sudah semestinya, bukan sebagai sesuatu yang kamu pilih untuk berikan.`,
              feed: `Bertemu dengan individu tipe Matahari atau Pelita yang membawa kehangatan dan perhatian yang aktif. Kepekaan mereka membuat mereka bisa melihat menembus permukaanmu yang tampak tenang, sampai ke beban yang kamu pikul di dalam. Mereka akan bertanya bagaimana keadaanmu sebelum kamu sempat menutupinya. Di dekat mereka, kamu punya izin langka untuk meletakkan bebanmu sejenak tanpa takut kehilangan tempatmu.`,
              sign: `Tandanya sederhana. Pendamping yang tepat akan memperhatikan saat kamu diam terlalu lama, dan ia berinisiatif untuk menopangmu. Orang yang keliru akan terus bersandar tanpa pernah sekali pun menoleh untuk memastikan pundakmu masih sanggup menahan.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Bumi yang kuat dan kokoh, namun diimbangi dengan baik oleh unsur lain sehingga tidak membeku menjadi kaku. Struktur ini adalah modal yang bagus: kamu punya kapasitas besar untuk menahan badai tanpa kehilangan arah dirimu, selama kamu tidak mengunci semua beban itu sendirian di dalam tanah. Keseimbangan inilah kekuatan sejatimu, dan ia pula yang membuat orang lupa bahwa gunung yang paling tenang sekalipun tetap menanggung beban di dalam dirinya.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat bebanmu sedang berat tetapi kamu refleks memilih diam dan menahannya sendiri, rem dulu sedetik. Tanyakan ini pada dirimu sendiri:`,
              rule: `Aku diam karena aku memang sanggup melewatinya, atau aku cuma takut kalau aku minta tolong, ternyata tidak ada yang peduli?`,
              body: `Jika kamu memang sedang tenang dan kuat, silakan hadapi sendiri. Itulah kestabilanmu yang bekerja dengan benar. Tetapi jika kamu diam karena takut ditolak, ingatlah bahwa hubungan dua arah tidak akan pernah tercipta kalau kamu selalu menutup akses orang lain untuk membantumu. Khusus di hadapan orang yang kamu percayai, cobalah sesekali jujur bahwa kamu sedang lelah, tanpa perlu buru-buru menutupnya dengan kalimat, "tapi aku nggak apa-apa kok". Kalimat sederhana itu memberi mereka kesempatan untuk hadir bagimu, seperti kamu selama ini selalu hadir bagi mereka.`,
            },
            beat7: `Kekokohanmu adalah karunia besar bagi orang-orang yang kamu sayangi. Kamu adalah tempat berteduh yang aman di tengah badai, dan itu bukan sesuatu yang perlu kamu kurangi demi terlihat lebih membutuhkan. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan diam adalah bentuk kekuatan, dan kapan ia hanyalah caramu menjaga jarak agar tidak perlu meminta.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti merasa harus selalu menjadi yang paling kokoh untuk layak disayangi, dan mulai memilih orang-orang yang ingin menopangmu, bukan hanya bersandar padamu. Kekuatan sejatimu bukan terletak pada seberapa kuat kamu menahan seluruh beban dunia sendirian, melainkan pada keberanianmu untuk sesekali melunak dan berkata, "hari ini, aku butuh tempat bersandar," kepada orang yang tepat.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `Menjulang Sunyi`,
        dimension: `Kamu adalah orang yang tidak mudah digeser. Prinsipmu jelas, caramu sudah teruji, dan kamu tidak akan berubah hanya karena suasana menuntutnya. Tapi coba perhatikan: makin lama, makin jarang pasanganmu memintamu berubah. Bukan karena semuanya sudah cocok, melainkan karena mereka sudah belajar bahwa memintamu bergerak tidak pernah berhasil.`,
        feed: [`Pedang`, `Permata`, `Jati`, `Akar`],
        drain: [`Gunung`, `Ladang`],
      },
      river: {
        siapaKamu: `Ingat pertengkaran terakhir yang "selesai" tanpa penyelesaian? Pasanganmu ingin mencoba cara baru, kamu bertahan pada caramu, dan akhirnya merekalah yang mengalah. Lagi. Bukan karena mereka setuju, tapi karena mereka sudah sadar bahwa memintamu untuk bergerak itu percuma.

Itulah dirimu. Kamu adalah titik yang tidak bergerak. Kamu punya prinsip yang kokoh dan cara hidup yang sudah kamu yakini benar. Saat orang lain gampang terombang-ambing, kamu tetap di tempat. Itu kekuatan yang jarang dimiliki orang.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Bumi yang mendominasi baganmu secara berlebihan. Kamu tidak lagi berfungsi sebagai fondasi yang menopang, melainkan gunung yang menolak dipindahkan. Kekokohan yang seharusnya membuat orang merasa aman kini menjelma menjadi tembok yang harus mereka putari.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang bisa diandalkan tidak akan berubah. Masalahnya, pasanganmu jadi satu-satunya pihak yang selalu menyesuaikan diri. Merekalah yang mengalah pada caramu, membentuk diri di sekeliling keputusanmu yang sudah bulat. Lama-kelamaan mereka berhenti meminta, dan kamu salah membaca diamnya itu sebagai tanda semuanya baik-baik saja.` },
          bridge: [`Kami jarang ribut kok, hubungan kami adem. Tapi kenapa akhir-akhir ini dia jadi lebih pendiam? Kenapa rasanya dia ada di sebelahku, tapi jauh?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa ketidakgoyahanmu, hal yang membuatmu bisa diandalkan, justru perlahan membuat orang di sebelahmu merasa sendirian. Ini bukan soal siapa yang benar, dan bukan soal kamu harus meninggalkan prinsipmu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa kekokohan yang menjadi kekuatanmu perlahan berubah menjadi tembok yang membuat pasanganmu berhenti berharap kamu bisa bergerak.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang berani menantangmu untuk bergerak tanpa membuatmu merasa diserang, dan mereka yang justru mengunci kalian berdua dalam kebuntuan yang sama-sama keras kepala.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan mengenali kapan tetap kokoh adalah kekuatan sejati, dan kapan ia hanyalah caramu menolak untuk melunak bagi orang yang tepat.` },
            ],
          },
          ocean: {
            beat1: `Kekokohanmu itu nyata dan berharga. Di dunia yang serba goyah, kamu memberi orang di sekitarmu sesuatu yang langka: kepastian bahwa ada satu hal yang tidak akan berubah semudah itu. Tapi mari jujur, menjadi titik yang tidak pernah bergeser punya harganya sendiri. Saat kamu tidak pernah bergerak, lama-kelamaan hanya ada satu orang yang boleh berubah dalam hubungan ini, dan itu selalu bukan kamu. Di situlah jarak yang selama ini sulit kamu jelaskan mulai terbentuk.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab:`,
              scenes: [
                `Pasanganmu mengusulkan cara baru, kamu punya alasan kuat untuk tetap pada caramu, dan tanpa terasa selalu caramulah yang menang. Bukan karena kamu memaksa, tapi karena kamu tidak pernah benar-benar terbuka untuk digeser.`,
                `Kalian jarang bertengkar, dan kamu menganggapnya sebagai tanda hubungan yang sehat. Padahal yang terjadi, pasanganmu sudah berhenti mengangkat hal-hal yang ia tahu tidak akan mengubah apa pun.`,
                `Saat pasanganmu berubah, tumbuh, atau ingin sesuatu yang berbeda, kamu bertahan di tempat yang sama. Kamu menyebutnya konsisten, tapi bagi mereka, kamu tidak ikut bergerak bersama mereka.`,
              ],
            },
            beat3: {
              body: `Kamu tidak sedang "stabil", kamu sedang macet. Dalam hubungan, kamu memaksa pasangan untuk terus mengalah dan beradaptasi dengan caramu yang sudah membatu. Mereka perlahan berhenti meminta, dan kamu salah membaca diamnya itu sebagai tanda semuanya aman. Padahal, itu suara orang yang sudah menyerah untuk mengubahmu.

Perhatikan bedanya dengan sekadar diandalkan. Ini bukan soal kamu memikul beban sampai tak terlihat. Ini soal kamu berdiri begitu teguh sampai tidak ada ruang bagi orang lain untuk menggerakkanmu satu langkah pun. Kamu tidak sedang berdiri teguh; kamu sedang berdiri sendirian di puncak yang tidak bisa diakses siapa pun. Inilah harga dari puncak yang menjulang sunyi: kamu berdiri paling kokoh, dan kamu berdiri paling sendiri.`,
              pull: ``,
            },
            beat4: {
              drain: `Berpasangan dengan sesama tipe Bumi seperti Gunung atau Ladang. Kalian sama-sama kokoh dan tidak mudah digeser, jadi begitu muncul perbedaan, tidak ada satu pun pihak yang mau melunak. Bukannya saling menstabilkan, kalian justru saling mengunci dalam kebuntuan yang sama-sama keras kepala, sampai hubungan berhenti bergerak sama sekali.`,
              feed: `Berdampingan dengan tipe Pedang atau Permata yang cukup tajam untuk menantangmu secara jujur kapan kamu perlu bergerak, tanpa membuatmu merasa diserang. Atau tipe Jati dan Akar yang membawa pertumbuhan dan mengajakmu ikut melangkah, alih-alih terus menabrak tembokmu dari depan. Di dekat mereka, berubah tidak lagi terasa seperti kekalahan.`,
              sign: `Tandanya sederhana. Pendamping yang tepat membuatmu ingin bergerak tanpa merasa dipaksa. Orang yang keliru akan diam-diam menyerah, lalu kamu terkecoh menganggap kebisuannya sebagai tanda persetujuan.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan dominasi unsur Bumi tanpa cukup elemen lain yang bisa mencairkan kekakuan itu. Struktur seperti ini justru punya potensi besar menjadi tempat berpijak paling kuat bagi orang lain, asalkan kamu mau membuka satu celah untuk digeser oleh orang yang benar-benar kamu percaya. Pahami bahwa keteguhan ini adalah aset, asal kamu tahu kapan harus memakainya untuk melindungi, dan kapan harus memakainya untuk memberi jalan.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat pasanganmu meminta sesuatu yang berbeda dan kamu refleks bertahan pada caramu, rem dulu sedetik. Tanyakan ini pada dirimu sendiri:`,
              rule: `Aku bertahan karena caraku memang lebih baik, atau aku cuma nggak mau repot berubah dan bergeser sedikit demi dia?`,
              body: `Kalau caramu memang terbukti lebih baik setelah kamu benar-benar mempertimbangkan sudut pandangnya, silakan pertahankan. Itu kekokohan yang bekerja dengan benar. Tapi kalau kamu bertahan hanya karena berubah itu tidak nyaman, ingat bahwa hubungan hanya bisa hidup kalau kedua orang di dalamnya sama-sama bisa bergerak. Sesekali, biarkan orang yang kamu percaya menggesermu satu langkah. Bukan karena kamu kalah, tapi karena kamu mengakui dia cukup penting untuk membuatmu melunak.`,
            },
            beat7: `Kekokohanmu adalah karunia yang langka. Jangan kamu buang demi terlihat lebih lentur, tapi pelajari kapan harus melunak. Satu-satunya hal yang perlu kamu kuasai hanyalah membedakan kapan tidak bergeser adalah kekuatan, dan kapan ia hanyalah caramu menolak untuk melunak bagi orang yang tepat.

Gunung yang hebat bukanlah yang tidak bisa digerakkan oleh apa pun, melainkan yang berdiri teguh menghadapi badai, namun tetap menyediakan satu jalan bagi orang yang ia sayangi untuk mendaki sampai ke puncaknya. Begitu kamu bisa membedakan keduanya, kekokohanmu berhenti menjadi tembok yang membuat orang menyerah, dan mulai menjadi tempat yang membuat satu orang merasa cukup aman untuk tinggal, justru karena kamu bersedia bergerak untuknya.`,
          },
          closer,
        },
      },
    },
  },
};
