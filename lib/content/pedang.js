import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const pedang = {
  stem: '庚',
  archetypeName: 'PEDANG',
  dayMasterChinese: '庚',
  dayMasterElement: 'Metal',
  states: {
    balanced: {
      card: {
        modifier: `Terhunus Siaga`,
        dimension: `Kehadiranmu membawa kejernihan yang menenangkan. Saat keadaan terasa rumit dan semua orang kebingungan, kamu yang mampu melihat inti persoalan dan mengatakannya dengan lugas. Orang-orang mencarimu justru karena kamu tidak basa-basi. Mereka melihat ketajamanmu dan langsung percaya. Yang tidak mereka lihat: ketajaman yang sama itu sering membuatmu disalahartikan sebagai sosok yang dingin.`,
        feed: [`Gunung`, `Ladang`],
        drain: [`Matahari`, `Pelita`],
      },
      river: {
        siapaKamu: `Kamu adalah orang yang dicari saat keadaan menjadi terlalu rumit. Di saat orang lain berputar-putar dalam keraguan, kamu memiliki kemampuan langka untuk melihat inti persoalan dengan jernih, lalu menyampaikannya tanpa berbelit. Bagimu, satu kalimat jujur jauh lebih berharga daripada sepuluh kalimat manis yang kosong. Ketegasan ini bukan berarti kamu keras hati. Kamu tegas tanpa harus kasar, dan kamu bisa diam tanpa kehilangan arah. Justru karena kejernihan inilah orang-orang merasa aman menyerahkan keputusan sulit ke tanganmu.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Logam, sebuah unsur yang fitrahnya memberi bentuk, memilah, dan memutuskan. Menariknya, Logam di dalam bagan lahirmu tidak setajam mata pisau yang haus memotong apa saja. Unsur ini hadir dalam porsi yang seimbang, didukung oleh unsur-unsur lain yang menjaganya tetap terkendali. Keseimbangan itulah yang membuat ketajamanmu disertai pertimbangan, sehingga kamu tahu kapan harus berbicara dan kapan harus menahan diri. Kamu bagaikan pedang yang terhunus dan siaga, namun tetap tenang; ia tidak memotong apa pun yang tidak perlu dipotong. Sayangnya, ketenangan dan ketegasan yang sama inilah yang menyimpan satu sudut mati yang jarang kamu sadari sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam sebuah relasi, peran sebagai pengambil keputusan dan penengah yang jujur hampir selalu jatuh ke tanganmu. Kamu menjadi orang yang berani mengatakan kebenaran yang dihindari orang lain, sosok yang tidak hanyut dalam drama, serta pribadi yang tetap berpijak saat yang lain panik. Namun, cara penyampaianmu yang lugas dan tanpa bumbu kerap ditafsirkan keliru. Ketulusanmu untuk membantu malah terbaca sebagai sikap yang dingin, dan kejujuranmu adakalanya melukai di tempat yang justru ingin kamu jaga. Yang lebih sunyi lagi, saat kamu sendiri yang terluka, kamu tidak meledak. Kamu memilih diam dan menarik diri perlahan, menutup pintu tanpa suara. Dan setiap kali itu terjadi, sebuah tanda tanya yang sama kembali tersisa di kepalamu.` },
          bridge: [`Kenapa setiap kali aku berkata jujur untuk kebaikan mereka, yang tertinggal malah jarak? Apakah caraku peduli memang terlalu tajam, sampai orang-orang hanya merasakan lukanya tanpa pernah tahu maksud baik di baliknya?`],
          paywallTeaser: {
            lead: ``,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kejernihan yang membuatmu diandalkan justru membuat orang lain sulit melihat kelembutan di baliknya.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe kepribadian yang membuat ketegasanmu terasa dihargai, dan mereka yang justru menuntutmu terus tampil tajam.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan diammu adalah ketegasan yang sehat, dan kapan ia adalah pintu yang kamu tutup karena takut terluka lagi.` },
            ],
          },
          ocean: {
            beat1: `Sebelum kita bedah lebih jauh, ada satu kenyataan yang jarang disadari oleh dunia luar: keberanianmu untuk bersikap jujur saat orang lain memilih diam itu memiliki bebannya sendiri. Kamu telanjur ditempatkan sebagai sosok yang selalu kuat, selalu tahu jawabannya, dan seakan kebal dari keraguan. Padahal, di balik ketegasan itu ada hati yang sebenarnya sangat berhati-hati memilih kata, justru karena kamu paham betul bahwa kata-kata bisa melukai. Kejernihan yang kamu bagikan kepada sekelilingmu memang sangat berharga. Namun, karena kamu menyampaikannya tanpa banyak basa-basi, hampir tidak ada orang yang terpikir bahwa di balik setiap kalimat tegasmu tersimpan pertimbangan yang panjang dan niat yang tulus.`,
            beat2: {
              intro: `Beberapa situasi berikut mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Seseorang datang meminta pendapat, lalu kamu memberikannya secara jujur dan apa adanya. Alih-alih berterima kasih, mereka justru menjauh dengan wajah yang berubah dingin, karena kebenaran itu terasa menyakitkan untuk didengar.`,
                `Saat kamu kecewa pada seseorang, kamu tidak pernah meributkannya. Kamu justru menjadi pendiam, menarik diri secara perlahan, dan diam-diam mengambil keputusan di dalam hati. Sering kali orang itu bahkan tidak sadar bahwa di matamu, pintu sudah mulai tertutup.`,
                `Kamu sangat tidak nyaman berada di tengah drama yang berlarut-larut. Saat orang lain ingin kamu ikut hanyut dalam keluh kesah yang sama berulang-ulang, kamu malah ingin segera mencari jalan keluarnya. Akibatnya, kepedulianmu yang berorientasi pada solusi sering disalahpahami sebagai sikap yang tidak mau mengerti perasaan.`,
              ],
            },
            beat3: {
              body: `Penyebabnya jauh lebih halus daripada yang kamu kira. Cara kepedulianmu bekerja memang berbeda. Kamu menunjukkan rasa sayang lewat tindakan yang menyelesaikan masalah, bukan lewat kata-kata yang sekadar menemani. Bagimu, membantu seseorang keluar dari kesulitan adalah bentuk cinta yang paling nyata.

Masalahnya, ketajaman yang kamu pakai untuk membereskan persoalan itu sama persis dengan ketajaman yang bisa melukai perasaan. Keduanya bukan dua hal yang berbeda; keduanya adalah satu mata pisau yang sama, hanya terlihat dari dua sisi. Saat orang lain hanya ingin didengar, mereka justru menerima sebuah solusi yang terasa seperti penghakiman. Mereka melihat ketajaman bilahnya, tetapi tidak melihat tangan yang dengan hati-hati mengarahkannya agar tidak melukai lebih dari yang seharusnya. Kondisi ini menyerupai sebilah pedang berkualitas tinggi: ia ditempa bukan untuk menebas sembarangan, melainkan untuk memotong dengan presisi di saat yang tepat. Tetapi orang yang belum mengenalmu cukup dalam hanya akan melihat sisi tajamnya, dan otomatis menjaga jarak.`,
              pull: `Hal inilah yang menjadi alasan mengapa kamu yang paling jujur dan paling bisa diandalkan justru kerap merasa paling kesepian. Kejernihanmu terlihat begitu kokoh sehingga orang lupa bahwa di balik pedang yang tenang itu ada seseorang yang juga ingin dimengerti.`,
            },
            beat4: {
              drain: `Berdampingan dengan individu tipe Matahari atau Pelita, yang membawa kehangatan besar namun juga menuntut kehangatan yang setara sebagai balasannya. Mereka cenderung membutuhkan ekspresi perasaan yang meluap-luap dan penegasan kasih sayang yang terus-menerus. Di dekat mereka, caramu mencintai lewat tindakan dan kejujuran sering terasa kurang, seolah-olah kamu dituntut untuk menjadi seseorang yang lebih ramai dan ekspresif dari dirimu yang sebenarnya. Lama-kelamaan, kamu merasa lelah karena terus diminta untuk melunakkan ketajaman yang sebetulnya adalah inti dari dirimu.`,
              feed: `Bertemu dengan individu tipe Gunung atau Ladang yang memiliki kesabaran dan kelapangan hati. Mereka tidak gentar oleh ketegasanmu, dan justru merasa aman karena tahu kamu selalu berkata apa adanya. Mereka memberi ruang yang kokoh bagi ketajamanmu untuk bekerja tanpa merasa terancam olehnya. Berada di dekat mereka, kejujuranmu tidak lagi terasa seperti sesuatu yang harus kamu redam; ia diterima sebagai bentuk kepedulian, persis seperti yang kamu maksudkan.`,
              sign: `Tandanya sangat sederhana. Pendamping yang tepat akan membuatmu merasa diterima apa adanya, lengkap dengan ketajamanmu. Sementara orang yang keliru akan terus-menerus memintamu untuk menjadi lebih lunak, sampai kamu lupa bentuk aslimu sendiri.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka tersebut. Unsur Logam-mu hadir dengan kuat, tetapi tidak berdiri sendirian secara berlebihan; ia ditopang dan diimbangi oleh unsur-unsur lain dalam komposisi yang serasi. Struktur seperti ini merupakan karunia yang jarang dimiliki: sebuah ketajaman yang memiliki pengendali, sehingga kamu bisa memutuskan dengan tegas tanpa menjadi sembrono. Inilah yang membuatmu mampu memotong persoalan dengan presisi, lalu tahu kapan harus berhenti. Keseimbangan inilah kekuatan sejatimu, namun di sisi lain, hal ini pula yang membuat orang-orang lupa bahwa di balik ketegasanmu ada perasaan yang juga bisa terluka.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Saat kamu merasa kecewa dan dorongan untuk menarik diri mulai muncul, pertanyaan yang biasanya tebersit di dalam benakmu adalah, "Buat apa aku menjelaskan, toh mereka tidak akan mengerti juga?" Mulai hari ini, cobalah untuk mengubah arah pertanyaan tersebut menjadi seperti ini:`,
              rule: `Aku diam karena ini memang bukan persoalan yang perlu kuperjuangkan, atau aku menutup pintu karena takut terluka kalau aku jujur soal perasaanku?`,
              body: `Jika kamu memang menilai sebuah hubungan sudah tidak sehat dan tidak layak diperjuangkan, maka keputusanmu untuk melangkah pergi adalah pilihan yang sepenuhnya sah dan patut dihormati. Itulah ketajamanmu yang bekerja dengan benar: memisahkan mana yang memang urusanmu untuk diputuskan, dan mana yang bukan. Namun, apabila kamu menutup diri hanya karena takut terlihat rapuh saat mengakui bahwa kamu pun terluka, ingatlah bahwa orang lain tidak bisa memperbaiki keretakan yang tidak pernah kamu perlihatkan. Mereka tidak sedang berpura-pura tidak peduli; kamulah yang menutup pintu terlalu rapi dan terlalu cepat, sebelum mereka sempat mengetuknya. Khusus di hadapan orang-orang yang sudah kamu percayai, cobalah sesekali menyampaikan satu kalimat yang jujur bukan tentang masalah mereka, melainkan tentang perasaanmu sendiri. Langkah kecil itu memberi mereka kesempatan untuk hadir mendampingimu.`,
            },
            beat7: `Ketegasan dan kejernihanmu adalah salah satu aset terbaik di dalam dirimu. Sebuah keberanian untuk jujur yang membuat orang merasa aman bersandar pada penilaianmu. Itu bukan sesuatu yang perlu kamu tumpulkan demi menyenangkan orang lain. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan diammu adalah ketegasan yang sehat, dan kapan ia hanyalah pintu yang kamu tutup karena takut terluka.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti menyesali ketajamanmu sendiri, dan mulai memilih orang-orang yang tidak butuh kamu melunak untuk merasa dicintai. Satu hal yang sangat berharga untuk selalu kamu ingat: kejujuranmu adalah bentuk kepedulian yang paling langka, dan orang yang tepat tidak akan lari dari ketajamanmu. Mereka akan tinggal cukup lama untuk melihat bahwa di balik bilah yang tenang itu, ada tangan yang sejak awal hanya ingin menjaga.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `yang Selalu Terasah`,
        dimension: `Kamu hampir selalu benar. Kamu bisa melihat celah dalam sebuah argumen, menunjuk akar masalah, dan mengakhiri perdebatan dengan satu kalimat yang tidak terbantahkan. Tapi coba perhatikan: makin sering kamu memenangkan perdebatan, makin sepi ruang di sekelilingmu. Ketajaman yang membuatmu selalu unggul adalah ketajaman yang sama yang perlahan memutus hal-hal yang sebenarnya ingin kamu jaga.`,
        feed: [`Samudra`, `Hujan`, `Matahari`, `Pelita`],
        drain: [`Pedang`, `Permata`],
      },
      river: {
        siapaKamu: `Coba ingat perdebatan terakhir yang kamu menangkan telak. Argumenmu rapi, logikamu tidak terbantahkan, dan lawan bicaramu terdiam. Tapi setelah kamu menang, ada rasa ganjil yang tertinggal: kamu benar, namun jarak di antara kalian justru melebar.

Itulah dirimu. Kamu adalah pisau yang selalu terasah. Kamu bisa membedah persoalan sampai ke intinya dan mengatakan kebenaran yang dihindari orang lain. Ketegasan seperti ini jarang dimiliki orang, dan itu membuatmu diandalkan.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Logam yang melampaui kapasitasnya, tanpa cukup penyeimbang untuk meredam energinya. Logam memang ditakdirkan untuk memilah dan memutuskan, tapi bilahmu terus-menerus diasah tanpa henti. Kamu bukan lagi pedang yang memotong dengan presisi di momen yang tepat; kamu menjelma menjadi pisau yang begitu tajam sampai melukai apa pun yang bergesekan dengannya, bahkan yang tidak kamu maksudkan untuk dipotong.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu selalu bisa menang. Kamu bisa menunjukkan di mana pasanganmu keliru, menang dalam setiap argumen, dan membuktikan bahwa kamu benar. Masalahnya, terlalu sering menang berarti pasanganmu terlalu sering kalah. Setiap kali kamu memotong, kamu memang benar, tapi kamu juga memutus sedikit demi sedikit ikatan yang justru paling ingin kamu pertahankan.` },
          bridge: [`Aku cuma ngomong yang bener kok, aku nggak salah. Tapi kenapa tiap kali aku menang, rasanya aku malah makin kehilangan dia?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa ketajaman yang membuatmu selalu benar justru perlahan membuatmu sendirian. Ini bukan soal kamu harus mulai berpura-pura salah, dan bukan soal kamu harus menumpulkan pikiranmu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa ketajaman yang menjadi kekuatanmu justru memutus ikatan yang paling ingin kamu jaga.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang menerima ketajamanmu dan meredakannya, dan mereka yang justru mengubah setiap perbedaan menjadi duel yang tidak menyisakan apa pun.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan mengenali kapan memotong adalah keberanian yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk terluka lebih dulu.` },
            ],
          },
          ocean: {
            beat1: `Ketajamanmu itu nyata dan berharga. Di tengah orang-orang yang berputar dalam keraguan, kamu bisa melihat inti persoalan dan mengatakannya dengan lugas. Tapi mari jujur, menjadi orang yang selalu benar punya harganya sendiri. Saat pisaumu selalu terhunus, lama-kelamaan orang di sekitarmu lebih sibuk melindungi diri dari ketajamanmu daripada merasa dekat denganmu. Di situlah rasa sepi yang selama ini sulit kamu jelaskan mulai terbentuk.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab:`,
              scenes: [
                `Pasanganmu bercerita tentang masalahnya, dan sebelum ia selesai, kamu sudah menemukan letak kesalahannya lalu langsung menunjukkannya. Kamu benar, tapi ia justru terdiam dan menutup diri.`,
                `Dalam setiap perbedaan pendapat, kamu hampir selalu menang. Bukan karena kamu memaksa, tapi karena argumenmu memang lebih tajam. Lama-kelamaan, pasanganmu berhenti membawa apa pun yang penting, karena ia tahu ujungnya ia akan kalah lagi.`,
                `Saat kamu tersinggung atau kecewa, refleksmu adalah menyerang balik dengan kalimat yang tepat sasaran dan menyakitkan. Kamu tahu persis di mana titik lemahnya, dan kamu memotong tepat di sana.`,
              ],
            },
            beat3: {
              body: `Kemampuanmu untuk selalu benar sudah berubah menjadi dorongan untuk selalu menang, dan dorongan itulah yang merusak hubungan. Setiap kali kamu membedah kesalahan pasanganmu secara telak, kamu memaksanya berada di posisi pihak yang kalah. Pikiranmu terlalu sibuk mempertahankan kebenaran logikamu sampai kamu berhenti bertanya apakah kali ini kamu benar-benar perlu memotong.

Perhatikan bedanya. Ini bukan soal kejujuranmu yang disalahpahami sebagai sikap dingin. Ini soal ketajaman yang benar-benar melukai, lalu memutus ikatan yang tidak bisa disambung kembali hanya dengan alasan bahwa kamu benar. Kamu memenangkan perdebatan itu, tapi kamu kehilangan sedikit dari orang yang kamu ajak berdebat. Setiap kemenangan kecil meninggalkan satu sayatan tak terlihat, dan sayatan yang menumpuk lama-kelamaan menjadi jarak. Inilah harga dari mata pisau yang selalu terasah: kamu unggul dalam setiap adu argumen, dan kamu kalah dalam hal yang paling kamu pedulikan.`,
              pull: ``,
            },
            beat4: {
              drain: `Berpasangan dengan sesama tipe Logam seperti Pedang atau Permata. Kalian sama-sama tajam dan sama-sama merasa benar, jadi setiap perbedaan berubah menjadi duel berdarah. Tidak ada satu pun pihak yang mau melunak, dan tanpa kehangatan yang bisa meredam, setiap percakapan berubah menjadi ajang pembuktian siapa yang paling unggul, sampai tidak ada lagi sisa ikatan yang bisa diselamatkan.`,
              feed: `Berdampingan dengan tipe Samudra atau Hujan yang punya kedalaman untuk menampung ketajamanmu tanpa merasa terancam, sehingga pisaumu tidak perlu selalu terhunus. Atau tipe Matahari dan Pelita yang membawa kehangatan yang melunakkan bilahmu, membuatnya melengkung sebelum sempat mematahkan ikatan. Di dekat mereka, kamu tidak perlu menang untuk merasa aman.`,
              sign: `Tandanya sederhana. Pendamping yang tepat membuatmu merasa cukup aman untuk tidak selalu tajam. Orang yang keliru akan mengubah setiap percakapan menjadi pertarungan yang harus kamu menangkan.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Logam yang sangat dominan tanpa cukup penyeimbang yang bisa meredakan ketajamannya. Inilah kenapa ketegasan yang seharusnya menjadi kekuatan berubah menjadi bilah yang memotong terlalu banyak, dan kenapa muncul dorongan untuk menyerang balik dengan kalimat telak saat kamu merasa tersudut. Kabar baiknya, ini bukan takdir mati. Ketajaman seperti ini adalah aset yang langka, asalkan kamu belajar kapan harus menghunusnya dan kapan harus membiarkannya tersarung demi orang yang kamu sayangi.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu sudah melihat letak kesalahan pasanganmu dan dorongan untuk langsung memotongnya muncul, rem dulu sedetik. Tanyakan ini pada dirimu:`,
              rule: `Aku ngomong ini karena dia memang perlu denger, atau aku cuma pengen menang dan buktiin aku bener?`,
              body: `Kalau sesuatu memang perlu dikatakan demi kebaikan bersama, katakanlah, tapi pilih waktu dan caranya dengan kepala dingin. Itu ketajaman yang bekerja dengan benar. Tapi kalau kamu memotong hanya untuk membuktikan bahwa kamu benar, ingat bahwa menang dalam sebuah perdebatan tidak pernah sepadan dengan kehilangan orang yang kamu cintai. Sesekali, biarkan sebuah persoalan kecil lewat tanpa kamu bereskan. Bukan karena kamu kalah, tapi karena kamu memilih ikatan itu lebih penting daripada rasa puas karena benar.`,
            },
            beat7: `Ketajamanmu adalah karunia yang langka. Kamu berani mengatakan kebenaran saat orang lain memilih diam, dan itu bukan sesuatu yang perlu kamu tumpulkan menjadi biasa-biasa saja demi disukai. Satu-satunya hal yang perlu kamu kuasai hanyalah membedakan kapan memotong adalah keberanian, dan kapan ia hanyalah caramu memenangkan sesuatu yang sebenarnya tidak perlu dimenangkan.

Pedang yang paling hebat bukanlah yang paling sering menebas, melainkan yang tahu persis kapan harus tetap tersarung. Begitu kamu bisa membedakan keduanya, ketajamanmu berhenti menjadi hal yang membuat orang menjaga jarak, dan mulai menjadi sesuatu yang membuat satu orang merasa aman justru karena ia tahu kamu memilih untuk tidak melukainya, padahal kamu bisa.`,
          },
          closer,
        },
      },
    },
  },
};
