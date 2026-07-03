import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const akar = {
  stem: '乙',
  archetypeName: 'AKAR',
  dayMasterChinese: '乙',
  dayMasterElement: 'Wood',
  states: {
    balanced: {
      card: {
        modifier: `Menjalar Luwes`,
        dimension: `Kamu bisa menyesuaikan diri dengan siapa pun dan keadaan apa pun. Tidak ada situasi yang terlalu sulit, tidak ada orang yang terlalu rumit; kamu selalu menemukan jalan supaya semuanya tetap berjalan. Kamu tahu persis apa yang orang lain mau. Giliran ditanya kamu sendiri mau apa, kamu malah bingung menjawabnya.`,
        feed: [`Samudra`, `Hujan`],
        drain: [`Pedang`, `Permata`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali seseorang bertanya, "kamu maunya yang mana?", dan kamu menjawab "terserah". Bukan karena tidak peduli, tapi karena kamu sudah terbiasa menyetel keinginanmu sendiri ke mode senyap demi kenyamanan orang lain.

Itulah dirimu. Kamu luwes luar biasa. Saat orang lain kaku menghadapi perubahan, kamu justru menemukan celah dan jalan memutar. Kelenturan inilah yang membuatmu mudah disukai dan jarang berkonflik dengan siapa pun. Di mana pun kamu berada, kamu punya cara membuat semuanya tetap terasa baik-baik saja.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Kayu, namun bukan kayu yang tumbuh tinggi dan kaku ke atas. Kayu di dalam dirimu jenis yang menjalar, lentur, tahu cara meliuk menghindari batu alih-alih menabraknya. Di bagan lahirmu, unsur ini hadir dalam porsi yang seimbang, jadi kelenturanmu tidak membuatmu kehilangan pijakan. Lembut di luar, kuat dan ulet di dalam. Kamu bagaikan sulur yang menjalar luwes: ia menyesuaikan bentuk dengan apa pun yang dilewatinya, tapi tetap tumbuh ke arah yang ia tuju. Kemampuan inilah kekuatanmu yang paling besar. Tapi kelenturan yang sama ini pula yang pelan-pelan bisa membuatmu kehilangan dirimu sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam sebuah relasi, kamu yang paling mudah diajak mengalah. Kamu mengikuti ritme pasangan atau keluargamu, jarang menuntut sesuatu berjalan sesuai maumu. Dari luar, kamu terlihat sebagai pasangan atau sahabat yang mudah. Tapi ada harga yang diam-diam kamu bayar. Setelah bertahun-tahun selalu menyesuaikan diri, kamu mulai kesulitan menjawab pertanyaan paling sederhana sekalipun: sebenarnya, kamu sendiri mau apa? Dan saat mencoba menjawabnya, yang kamu temukan justru kekosongan:` },
          bridge: [`Kenapa aku selalu bisa membuat orang lain nyaman, tapi giliran ditanya aku sendiri maunya apa, aku malah bingung sendiri? Apa aku sudah terlalu lama jadi versi yang orang lain butuhkan, sampai lupa versi diriku yang sebenarnya?`],
          paywallTeaser: {
            lead: ``,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kelenturan yang membuatmu mudah dicintai justru bisa membuatmu kehilangan dirimu sendiri.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe kepribadian yang membantumu menemukan kembali bentukmu, dan mereka yang justru membuatmu terus melebur tanpa sisa.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan mengalah adalah pilihan yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk punya keinginan sendiri.` },
            ],
          },
          ocean: {
            beat1: `Kelenturanmu berharga. Kemampuan meredakan ketegangan dan menjaga keharmonisan membuat hubunganmu jarang pecah oleh hal kecil, dan itu bukan kemampuan yang dimiliki semua orang. Tapi ada satu hal yang perlu kamu dengar jujur: kemudahanmu mengalah selama ini terasa seperti kebaikan, padahal sebagiannya adalah caramu menghindari sesuatu yang lebih menakutkan, yaitu mengecewakan orang lain dengan punya keinginan sendiri. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Beberapa situasi berikut mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Saat ditanya mau makan apa, mau pergi ke mana, atau memilih yang mana, jawaban refleksmu hampir selalu "terserah" atau "ikut kamu saja." Bukan karena kamu benar-benar tidak punya selera, tapi karena memikirkan apa yang kamu mau terasa lebih melelahkan daripada sekadar mengikuti.`,
                `Dalam sebuah hubungan, kamu pelan-pelan menyerap kebiasaan, selera, bahkan cara berpikir pasanganmu, sampai sulit dibedakan mana yang dulu benar-benar milikmu dan mana yang kamu ambil dari mereka.`,
                `Saat kamu akhirnya punya keinginan yang berbeda dari orang sekitarmu, kamu lebih sering memendamnya daripada menyuarakannya. Rasanya tidak sebanding: mempertahankan maumu berisiko membuat orang lain kecewa, sementara mengalah terasa jauh lebih aman.`,
              ],
            },
            beat3: {
              body: `Penyebabnya bukan karena kamu lemah atau tidak punya pendirian. Justru sebaliknya, menyesuaikan diri adalah bentuk kecerdasan emosional. Kamu membaca keadaan dengan cepat, memahami apa yang dibutuhkan, lalu membentuk dirimu agar pas dengan ruang yang ada. Itu kemampuan, bukan kekurangan.

Tapi setiap kali kamu menyesuaikan diri, ada porsi kecil dari keinginanmu sendiri yang kamu pangkas. Sekali dua kali tidak terasa apa-apa. Namun setelah bertahun-tahun, potongan-potongan kecil yang terus kamu pangkas itu menumpuk, sampai kamu tiba di satu titik ketika kamu kesulitan mengenali bentuk dirimu sendiri di luar bentuk yang dibutuhkan orang lain.

Bayangkan sulur yang menjalar mengikuti pagar. Selama ada pagarnya, ia tumbuh indah dan terarah. Tapi karena terus mengikuti bentuk pagar itu, lama-lama ia lupa bahwa ia sebenarnya bisa tumbuh ke arah mana pun yang ia mau. Begitu juga kelenturanmu: ia membuatmu bisa hidup berdampingan dengan siapa saja, tapi kalau tidak kamu sadari, ia bisa membuatmu melebur sampai tak bersisa. Kelelahanmu bukan karena terlalu sering mengalah, tapi karena kamu kehilangan kontak dengan apa yang sebenarnya kamu inginkan.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan tipe Pedang atau Permata yang kuat, tegas, dan punya pendirian jelas. Di dekat mereka, kelenturanmu bekerja terlalu keras; kamu mengikuti arah dan standar mereka sampai suaramu sendiri tenggelam. Mereka tidak bermaksud begitu, tapi kehadiran mereka yang begitu pasti membuatmu makin sulit menemukan ruang untuk maumu sendiri. Bersama mereka, kamu pelan-pelan jadi pendukung impian mereka, dan lupa kamu juga punya impian sendiri.`,
              feed: `Bertemu tipe Samudra atau Hujan yang lembut, sabar, dan punya kedalaman perasaan. Mereka tidak memaksamu mengikuti bentuk mereka; mereka memberimu ruang aman untuk pelan-pelan menemukan kembali apa yang sebenarnya kamu inginkan. Seperti air yang menghidupi akarmu tanpa memaksanya tumbuh ke arah tertentu. Di dekat mereka, kamu merasa diberi izin untuk jadi dirimu sendiri, lengkap dengan keinginan yang selama ini kamu pendam.`,
              sign: `Tandanya sangat sederhana. Orang yang tepat akan penasaran dengan apa yang kamu mau dan mendorongmu menyuarakannya. Sementara orang yang keliru akan merasa nyaman justru karena kamu tidak pernah menuntut apa-apa.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka pada grafikmu. Unsur Kayu-mu hadir kuat namun tidak berlebihan; ia diimbangi unsur-unsur lain dalam komposisi yang serasi. Struktur ini modal yang bagus: kelenturan yang tetap punya akar, jadi kamu bisa menyesuaikan diri tanpa benar-benar kehilangan dirimu. Keseimbangan inilah kekuatan sejatimu, tapi ia pula yang membuatmu mudah lupa bahwa kamu juga berhak tumbuh ke arah yang kamu pilih sendiri.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat refleks mengalah muncul dan kamu hampir berkata "terserah, ikut kamu saja", berhenti sejenak sebelum kata itu keluar. Tanyakan ini:`,
              rule: `Aku mengalah karena ini memang tidak penting buatku, atau karena takut bikin dia kecewa kalau aku jujur soal mauku?`,
              body: `Kalau memang tidak penting, mengalah adalah pilihan yang sehat; tidak semua hal perlu kamu perjuangkan. Tapi kalau kamu mengalah hanya karena takut mengecewakan, ingat: orang lain tidak bisa mencintai bagian dirimu yang tidak pernah kamu perlihatkan. Setiap kali kamu memendam maumu demi menjaga kenyamanan, kamu memberi mereka versi dirimu yang lebih mudah, bukan versi yang utuh. Di hadapan orang yang sudah kamu percayai, cobalah sesekali menyuarakan satu keinginan kecil yang benar-benar milikmu, meski terasa berisiko. Itu memberi mereka kesempatan mengenal dirimu yang sebenarnya, bukan hanya dirimu yang selalu mengiyakan.`,
            },
            beat7: `Kelenturanmu adalah salah satu hal terindah dalam dirimu. Kemampuan menyesuaikan diri dan menerima orang lain apa adanya membuatmu sosok yang langka dan menenangkan. Itu bukan sesuatu yang perlu kamu buang. Yang perlu kamu kuasai hanyalah membedakan kapan mengalah adalah pilihan yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk punya keinginan sendiri.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti melebur tanpa sisa, dan mulai tumbuh berdampingan dengan orang lain tanpa kehilangan bentukmu. Satu hal untuk selalu kamu ingat: kamu tidak harus menghilang supaya orang lain mau tinggal. Dan orang yang tepat tidak akan meminta kamu kehilangan bentukmu. Mereka justru akan senang melihat kamu akhirnya tumbuh ke arah yang kamu pilih sendiri.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `Kusut Melilit`,
        dimension: `Kemampuanmu untuk mencintai dan berempati secara total adalah ketulusan yang langka. Tetapi kecenderunganmu untuk melebur tanpa jarak menciptakan satu blind spot besar yang perlahan mencekik ruang gerak orang yang kamu sayangi. Sulur yang memeluk paling erat sering kali tidak sadar bahwa pelukannya membuat yang dipeluk kehabisan ruang untuk bernapas.`,
        feed: [`Matahari`, `Pelita`, `Pedang`, `Permata`],
        drain: [`Jati`, `Akar`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali pasanganmu menyampaikan sebuah rencana yang tidak melibatkanmu, dan secara refleks kamu langsung menata ulang seluruh jadwal harimu agar tetap bisa berada di dekatnya.

Itulah dirimu. Bagimu, mencintai berarti melebur sepenuhnya tanpa sekat. Kamu mengamati setiap detail terkecil dan membaca perubahan suasana hati mereka bahkan sebelum terucap, karena kamu meyakini bahwa semakin sempit jarak di antara kalian, semakin murni ikatan yang terjalin.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Kayu, khususnya jenis tanaman merambat yang lentur dan pandai menyesuaikan diri dengan apa pun yang ada di dekatnya. Masalahnya, unsur Kayu ini hadir terlalu kuat di baganmu, sehingga kelenturan alami itu berubah menjadi lilitan. Alih-alih sekadar mendampingi, kamu tanpa sadar membelit orang yang kamu cintai, sebuah bentuk kasih sayang yang justru berisiko mematikan ruang tumbuh mereka.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu memberikan kedekatan yang sepenuhnya. Kamu ingin tahu segalanya, terlibat dalam segalanya, hadir di setiap sudut hidup orang yang kamu sayangi. Bagimu, itulah cinta yang sesungguhnya. Masalahnya, orang yang kamu sayangi lama-kelamaan merasa tidak lagi punya ruang yang benar-benar miliknya sendiri. Setiap hari buruknya menjadi hari burukmu juga, setiap temannya menjadi urusanmu juga, sampai ia mulai merasa sesak, bukan karena kurang dicintai, melainkan karena dicintai terlalu rapat. Lalu saat ia mencoba mengambil sedikit jarak untuk bernapas, kamu pun panik dan bingung:` },
          bridge: [`Aku kasih dia semua yang aku punya, aku ada buat dia setiap saat. Tapi kenapa makin aku deket, dia malah kelihatan pengen menjauh? Apa salahnya pengen selalu ada buat orang yang kita sayang?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa kedekatan yang kamu maksudkan sebagai cinta yang paling tulus justru membuat orang yang kamu sayangi merasa terkurung. Ini bukan karena cintamu terlalu besar, dan bukan pula karena mereka tidak menyayangimu balik.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa keinginan untuk selalu dekat justru membuat orang yang kamu sayangi merasa kehabisan ruang.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang cukup kokoh untuk dekat denganmu tanpa merasa terlilit, dan mereka yang justru membuatmu membelit semakin erat.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kedekatanmu adalah bentuk cinta, dan kapan ia hanyalah caramu menghindari rasa takut ditinggalkan.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu untuk menyayangi sepenuh hati adalah sesuatu yang langka. Di dunia yang penuh orang yang mencintai setengah-setengah dan selalu menjaga jarak aman, kamu memberi seluruh dirimu tanpa ragu. Tetapi mari jujur, kedekatan sebesar itu memiliki bebannya sendiri. Cinta yang tidak menyisakan jarak sedikit pun perlahan berubah menjadi ruang yang terasa sempit bagi orang yang menerimanya. Di sinilah letak masalah yang selama ini sulit kamu pahami.`,
            beat2: {
              intro: `Situasi ini mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Pasanganmu ingin menghabiskan waktu sendirian atau bersama teman-temannya, dan meskipun kamu berkata tidak apa-apa, ada rasa cemas yang langsung muncul, seakan-akan jarak sekecil apa pun adalah tanda bahwa ada yang tidak beres.`,
                `Kamu begitu menyatu dengan pasanganmu sampai suasana hatinya langsung menjadi suasana hatimu. Saat ia sedang murung, kamu ikut murung; saat ia punya masalah, masalah itu langsung menjadi milikmu juga, sampai kamu kesulitan membedakan mana perasaanmu sendiri.`,
                `Kamu menunjukkan cinta dengan selalu hadir, selalu membantu, selalu terlibat, sampai suatu saat orang yang kamu sayangi berkata bahwa ia butuh sedikit ruang, dan kalimat itu terasa seperti sebuah penolakan yang menyakitkan.`,
              ],
            },
            beat3: {
              body: `Kamu memaknai keterlibatan penuh dalam setiap sisi kehidupan pasangan sebagai bentuk kesetiaan yang tertinggi. Sayangnya, kedekatan seintens itu perlahan mengikis ruang pribadi mereka. Suasana hati mereka langsung menjadi suasana hatimu, dan lingkaran pertemanan mereka otomatis menjadi urusanmu juga, sampai mereka merasa sesak oleh kedekatan yang terlalu rapat. Saat mereka mencoba mengambil jarak untuk sekadar bernapas, kamu langsung didera kepanikan.

Orang yang kamu sayangi butuh sebagian kecil hidup yang tetap menjadi miliknya sendiri: sebuah hari buruk yang tidak langsung menjadi milikmu, sebuah pertemanan yang tidak perlu kamu masuki, sebuah keinginan yang boleh berbeda darimu tanpa membuatmu cemas. Semakin erat kamu memeluk, semakin ia merasa harus melepaskan diri hanya untuk bisa merasa menjadi dirinya sendiri.

Ini bagian yang paling sulit diterima: mereka menjauh bukan karena cintamu kurang, melainkan karena cintamu tidak menyisakan ruang. Sulur yang membelit pohon dengan niat memeluknya paling erat justru bisa menghalangi pohon itu tumbuh. Dan yang membuatnya semakin berat, semakin kamu merasa mereka menjauh, semakin kuat pula dorongan untuk membelit lebih erat lagi, padahal justru itulah yang membuat mereka semakin ingin menjauh.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan sesama elemen Kayu, yaitu individu tipe Jati atau Akar. Bersama sesama Akar, kalian saling membelit sampai tidak ada lagi satu pun bentuk yang berdiri sendiri; dua orang yang sama-sama melebur tidak menyisakan ruang bagi siapa pun untuk bernapas. Bersama Jati yang justru selalu bergerak maju, kamu akan membelit semakin erat setiap kali ia menjauh, dan semakin kamu membelit, semakin ia terdorong untuk tumbuh menjauhimu. Keduanya sama-sama membuat lilitanmu semakin kencang.`,
              feed: `Bertemu dengan individu tipe Pedang atau Permata yang memiliki batas dan pendirian yang jelas. Justru karena mereka punya bentuk yang kokoh dan tidak bisa kamu belit sepenuhnya, kamu belajar bahwa dekat tidak harus berarti menyatu tanpa sisa. Atau tipe Matahari atau Pelita yang cukup hangat dan aman untuk tidak menuntut peleburan total. Di dekat mereka, kamu menemukan bahwa kamu bisa mencintai seseorang dengan dalam sambil tetap membiarkan mereka memiliki ruangnya sendiri, dan justru di situlah cintamu bisa bernapas.`,
              sign: `Tandanya sederhana. Pendamping yang tepat tetap merasa menjadi dirinya sendiri saat berada di dekatmu, dan ia mendekat karena ingin, bukan karena tidak bisa lepas. Orang yang keliru akan perlahan merasa hilang di dalam pelukanmu, sampai satu-satunya cara untuk bernapas adalah dengan menjauh.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka pada grafikmu. Unsur Kayu-mu tidak sekadar hadir; ia mendominasi tanpa cukup unsur lain yang mengimbanginya. Dominasi inilah yang menjelaskan mengapa kamu selalu diliputi kecemasan yang besar setiap kali muncul jarak, baik secara emosional maupun secara fisik. Memahami sebaran ini membantumu melihat bahwa dorongan untuk selalu melekat bukanlah tanda cintamu salah, melainkan tanda bahwa kelenturan sebesar itu membutuhkan bentuknya sendiri agar kamu bisa mencintai dengan dekat tanpa kehilangan batas antara dirimu dan orang lain.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Saat kamu merasakan dorongan untuk mengikuti setiap gerak orang yang kamu sayangi, atau saat rasa cemas muncul begitu ia ingin sedikit menjauh, pertanyaan yang biasanya tebersit di benakmu adalah, "Bukankah selalu ada untuknya itu justru bukti aku benar-benar mencintainya?" Mulai hari ini, cobalah mengubah arah pertanyaan tersebut menjadi seperti ini:`,
              rule: `Apakah aku mendekat karena ini yang ia butuhkan, atau karena jarak sekecil apa pun membuatku takut kehilangan dia?`,
              body: `Jika kedekatan itu memang sesuatu yang kalian berdua inginkan, maka nikmatilah sepenuhnya. Itulah saat cintamu menjadi karunia yang paling hangat. Tetapi jika kamu mendekat hanya karena takut ditinggalkan, ingatlah bahwa memberi ruang bukan berarti kamu kurang mencintai. Justru memberi orang yang kamu sayangi ruang untuk tetap menjadi dirinya sendiri adalah bentuk cinta yang paling matang, karena di situ kamu mempercayai bahwa mereka akan tetap kembali kepadamu tanpa harus kamu ikat. Sesekali, cobalah membiarkan orang yang kamu sayangi memiliki satu hari, satu ruang, atau satu keinginan yang sepenuhnya milik mereka, tanpa kamu ikut masuk ke dalamnya. Ruang kecil itulah yang justru menumbuhkan rindu dan membuat mereka selalu ingin kembali mendekat kepadamu.`,
            },
            beat7: `Kemampuanmu untuk menyayangi dengan sepenuh hati adalah salah satu hal paling berharga di dalam dirimu. Kesetiaan, perhatian, dan kesediaanmu untuk hadir sepenuhnya bagi orang yang kamu sayangi adalah karunia yang langka. Itu bukan sesuatu yang perlu kamu kecilkan demi membuat orang lain nyaman. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan kedekatan adalah pemberian, dan kapan ia menjadi lilitan yang membuat orang yang kamu sayangi justru kehabisan napas.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti merasa harus mengikat seseorang agar ia tetap tinggal, dan mulai mempercayai bahwa cinta yang sehat tidak perlu genggaman yang erat untuk bertahan. Sebab sulur yang paling indah bukanlah yang mencekik pohon yang ia peluk, melainkan yang tumbuh berdampingan dengannya, cukup dekat untuk saling menopang, tetapi cukup lapang untuk membiarkan keduanya sama-sama bernapas. Saat kamu belajar memberi ruang, kamu akan menemukan bahwa orang yang tepat tidak akan pergi ke mana-mana. Justru karena ia bebas untuk pergi, ia memilih untuk tetap tinggal.`,
          },
          closer,
        },
      },
    },
  },
};
