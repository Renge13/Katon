import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const jati = {
  stem: '甲',
  archetypeName: 'JATI',
  dayMasterChinese: '甲',
  dayMasterElement: 'Wood',
  states: {
    balanced: {
      card: {
        modifier: `Berbatang Tegak`,
        dimension: `Kamu tipe yang tumbuh terus ke atas dengan caranya sendiri, tenang dan tanpa banyak suara. Orang-orang merasa aman di dekatmu karena kamu punya arah dan tidak gampang goyah. Semua orang bersandar padamu. Tapi tidak ada yang pernah bertanya kamu sendiri bersandar ke mana.`,
        feed: [`Samudra`, `Hujan`],
        drain: [`Pedang`, `Permata`],
      },
      river: {
        siapaKamu: `Kamu adalah orang yang tumbuh ke atas dengan caranya sendiri. Kamu punya arah yang jelas, mimpi yang kamu kejar diam-diam, dan kemampuan untuk tetap berdiri tegak meski keadaan sedang sulit. Kamu tidak suka banyak mengeluh; kamu lebih memilih menyelesaikan dan terus melangkah maju. Karena itulah orang-orang merasa tenang berada di dekatmu. Kamu memberi rasa aman, kamu bisa diandalkan, dan kamu jarang sekali membuat orang lain khawatir. Di banyak hubungan, kamu adalah sosok yang berdiri paling kokoh, tempat orang lain menyandarkan beban mereka.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Kayu, sebuah unsur yang fitrahnya tumbuh, meninggi, dan mencari cahaya. Di dalam bagan lahirmu, unsur Kayu ini hadir dalam porsi yang seimbang, ditopang oleh unsur-unsur lain yang membuatnya tumbuh mantap tanpa berlebihan. Keseimbangan itulah yang membuatmu bisa punya ambisi tanpa menjadi keras kepala, dan bisa memimpin tanpa harus menjulang menutupi orang lain. Kamu bagaikan pohon berbatang tegak yang tumbuh lurus ke atas: kuat, mandiri, dan memberi naungan bagi sekitarnya. Sayangnya, justru karena kamu terlihat sekuat itu, ada satu kebutuhanmu sendiri yang sering luput dari pandangan semua orang, termasuk dirimu sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam sebuah relasi, kamu hampir selalu menjadi pihak yang lebih kuat. Kamu yang menenangkan saat pasangan atau keluargamu panik, kamu yang menyelesaikan masalah saat yang lain kebingungan, dan kamu yang tetap tegak saat semuanya terasa goyah. Orang-orang terbiasa bersandar kepadamu, dan kamu pun terbiasa menjadi tempat bersandar itu. Namun, ada satu hal yang pelan-pelan terasa berat. Kamu begitu terbiasa menjadi yang kuat sampai meminta tolong terasa seperti menekuk batang yang seharusnya lurus, sebuah hal yang nyaris mustahil kamu lakukan. Maka kamu menyimpannya sendiri, terus tumbuh sendiri, sampai suatu titik kamu sadar bahwa tidak ada yang pernah benar-benar menanyakan kabarmu. Dan di saat seperti itu, sebuah pikiran yang sama kembali muncul:` },
          bridge: [`Kenapa aku selalu jadi tempat semua orang bersandar, tapi giliran aku yang capek, rasanya tidak ada tempat untuk menyandarkan diri? Apa karena aku terlihat terlalu kuat, sampai orang lupa bahwa aku juga sesekali ingin dijaga?`],
          paywallTeaser: {
            lead: ``,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kemandirian yang menjadi kekuatanmu justru membuat kebutuhanmu sendiri menjadi tidak terlihat.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe kepribadian yang membuatmu boleh berhenti menjadi kuat sejenak, dan mereka yang justru terus menguji ketangguhanmu.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kemandirianmu adalah kekuatan yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk bersandar.` },
            ],
          },
          ocean: {
            beat1: `Sebelum kita bedah lebih jauh, ada satu hal yang perlu kamu dengar: menjadi orang yang selalu kuat itu melelahkan, dan kelelahan itu sah untuk kamu rasakan. Kamu telanjur ditempatkan sebagai sosok yang mandiri dan tidak pernah merepotkan, sosok yang selalu punya jalan keluar. Banyak orang bahkan tidak pernah membayangkan kamu bisa rapuh, karena selama ini kamu selalu berhasil berdiri sendiri. Tapi kemampuanmu untuk bertahan dan tumbuh sendiri itu bukan berarti kamu tidak pernah lelah. Itu hanya berarti kamu sudah terlalu lama terbiasa memikulnya tanpa mengeluh, sampai bahkan dirimu sendiri lupa bahwa kamu juga berhak untuk ditopang.`,
            beat2: {
              intro: `Beberapa situasi berikut mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Saat kamu sedang menghadapi masalah berat, refleks pertamamu bukan mencari orang untuk bercerita, melainkan diam dan menyelesaikannya sendiri. Meminta bantuan terasa lebih sulit daripada menanggung bebannya seorang diri.`,
                `Orang-orang di sekitarmu terbiasa datang membawa keluh kesah mereka kepadamu, tapi jarang sekali ada yang balik bertanya bagaimana keadaanmu. Mereka menganggap kamu pasti baik-baik saja, karena kamu selalu terlihat begitu.`,
                `Saat kamu akhirnya benar-benar lelah, kamu tidak menunjukkannya dengan mengeluh. Kamu justru menjadi semakin sibuk, semakin tenggelam dalam pekerjaan atau urusan lain, seolah-olah dengan terus bergerak kamu bisa menghindari kenyataan bahwa kamu sebenarnya butuh berhenti sejenak.`,
              ],
            },
            beat3: {
              body: `Penyebabnya jauh lebih halus daripada sekadar kamu yang terlalu mandiri. Bagimu, ketangguhan sudah menjadi bagian dari identitasmu sejak lama. Kamu tumbuh dengan keyakinan bahwa berdiri di atas kaki sendiri adalah hal yang benar, dan itu memang membentukmu menjadi pribadi yang kuat dan bisa diandalkan.

Masalahnya, kekuatan yang membuatmu bisa berdiri tegak itu sama persis dengan kekuatan yang membuatmu sulit menekuk untuk meminta tolong. Keduanya tumbuh dari akar yang sama. Bagi pohon yang tinggi dan lurus, menekuk batang terasa berlawanan dengan seluruh sifat dasarnya. Maka saat kamu lelah, kamu memilih tetap tumbuh sendiri daripada menyandarkan diri, karena bersandar terasa seperti tanda bahwa kamu tidak cukup kuat. Padahal, justru pohon yang paling tinggi pun tetap membutuhkan tanah yang menopang akarnya dan air yang menghidupinya. Tidak ada pohon yang tumbuh hanya dari kekuatan dirinya sendiri.`,
              pull: `Inilah ironi terbesarnya. Kamu yang menjadi tempat semua orang bersandar justru sering menjadi yang paling sendirian saat lelah. Bukan karena tidak ada yang peduli, tapi karena kamu tumbuh begitu tegak sampai orang lupa bahwa batang yang kuat pun bisa terasa berat menopang dirinya sendiri.`,
            },
            beat4: {
              drain: `Berdampingan dengan individu tipe Pedang atau Permata, yang membawa ketajaman dan standar yang tinggi. Mereka cenderung menilai dan menuntut yang terbaik, dan di dekat mereka kamu merasa harus terus membuktikan ketangguhanmu, tidak boleh terlihat lemah sedikit pun. Alih-alih memberimu ruang untuk sesekali berhenti dan beristirahat, kehadiran mereka justru membuatmu merasa harus tumbuh lebih tinggi dan lebih kuat lagi. Lama-kelamaan, kamu lelah karena tidak pernah diizinkan untuk sekadar menjadi dirimu yang juga bisa capek.`,
              feed: `Bertemu dengan individu tipe Samudra atau Hujan yang membawa kelembutan dan kedalaman perasaan. Mereka tidak menuntutmu untuk terus kuat; mereka justru memperhatikan saat kamu mulai lelah, bahkan sebelum kamu mengatakannya. Mereka seperti air yang menghidupi akarmu, memberimu sesuatu untuk terus tumbuh tanpa kamu harus memberi terus-menerus. Di dekat mereka, kamu akhirnya merasa boleh berhenti sejenak, karena ada yang dengan tulus ingin menjagamu, bukan sekadar bersandar padamu.`,
              sign: `Tandanya sangat sederhana. Orang yang tepat akan menanyakan kabarmu lebih dulu, dan membuatmu merasa boleh untuk tidak selalu kuat. Sementara orang yang keliru hanya akan terus bersandar, lalu lupa bahwa kamu pun manusia yang sesekali ingin disandari.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka pada grafikmu. Unsur Kayu-mu hadir dengan kuat, namun tidak berlebihan; ia ditopang dan diimbangi oleh unsur-unsur lain dalam komposisi yang serasi. Struktur seperti ini adalah karunia yang jarang dimiliki: sebuah ambisi yang punya akar, sehingga kamu bisa terus tumbuh tanpa kehilangan arah dan tanpa menjadi keras kepala. Inilah yang membuatmu mampu memimpin dengan tenang dan tumbuh dengan mantap. Keseimbangan inilah kekuatan sejatimu, namun di sisi lain, hal ini pula yang membuat orang-orang lupa bahwa batang yang tegak sekalipun tetap butuh tanah dan air untuk hidup.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Saat kamu sedang lelah dan dorongan untuk menanggung semuanya sendiri kembali muncul, pertanyaan yang biasanya tebersit di benakmu adalah, "Untuk apa merepotkan orang lain, toh aku bisa mengatasinya sendiri." Mulai hari ini, cobalah mengubah arah pertanyaan tersebut menjadi seperti ini:`,
              rule: `Aku memilih menanggungnya sendiri karena ini memang sanggup kuhadapi, atau karena aku takut terlihat lemah kalau mengaku sedang butuh bantuan?`,
              body: `Jika kamu memang sedang baik-baik saja dan sanggup menghadapinya, maka berdiri di atas kakimu sendiri adalah kekuatan yang patut kamu syukuri. Itulah ketangguhanmu yang bekerja dengan benar. Namun, apabila kamu memilih diam hanya karena takut terlihat rapuh, ingatlah bahwa orang lain tidak bisa menjaga sesuatu yang tidak pernah kamu izinkan mereka lihat. Mereka bukannya tidak peduli; kamulah yang selama ini terlalu rapi menyembunyikan kelelahanmu, sampai mereka mengira kamu tidak pernah membutuhkan siapa-siapa. Khusus di hadapan orang-orang yang sudah kamu percayai, cobalah sesekali mengakui satu hal kecil yang sedang membuatmu lelah. Langkah kecil itu memberi mereka kesempatan untuk hadir menopangmu, persis seperti kamu selama ini menopang mereka.`,
            },
            beat7: `Ketangguhan dan kemandirianmu adalah salah satu hal terindah dalam dirimu. Kemampuan untuk terus tumbuh dan tetap tegak di tengah kesulitan itu membuat banyak orang merasa aman bersandar kepadamu. Itu bukan sesuatu yang perlu kamu tinggalkan. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan kemandirianmu adalah kekuatan yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk bersandar pada orang lain.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti merasa harus selalu kuat sendirian, dan mulai membiarkan orang-orang yang tepat ikut menopangmu. Satu hal yang berharga untuk selalu kamu ingat: membutuhkan orang lain bukanlah tanda bahwa kamu lemah. Pohon yang paling kuat sekalipun tumbuh karena ada tanah yang memeluk akarnya. Dan orang yang tepat tidak akan datang hanya untuk bersandar padamu. Mereka akan tinggal cukup lama untuk memastikan bahwa kamu pun punya tempat untuk bersandar.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `Kaku Getas`,
        dimension: `Ambisimu untuk terus tumbuh adalah mesin tangguh yang tidak pernah mati. Tetapi kecepatan ini menciptakan satu blind spot besar: kamu sering meninggalkan orang terdekatmu dalam kesepian karena terlalu sibuk mengejar hari esok. Pohon yang tumbuh paling cepat adalah pohon yang paling sering lupa melihat siapa yang masih berteduh di bawahnya.`,
        feed: [`Matahari`, `Pelita`, `Pedang`, `Permata`],
        drain: [`Jati`, `Akar`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali kamu mencapai target yang kamu kejar mati-matian. Alih-alih merayakannya, kamu langsung mengalihkan pandangan ke target baru yang lebih tinggi, bahkan sebelum keringatmu kering.

Itulah dirimu. Kamu cemas jika harus diam. Bagimu, berhenti sejenak rasanya seperti bergerak mundur, sehingga setiap pencapaian hanya kamu anggap sebagai batu loncatan yang harus segera dilewati. Kamu punya ambisi besar, arah yang jelas, dan dorongan untuk terus tumbuh yang tidak pernah benar-benar padam.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Kayu yang melampaui kapasitas. Secara alami, Kayu memang tumbuh lurus ke atas mencari cahaya, tetapi di baganmu, energi ini melaju kencang tanpa rem. Kamu menjelma menjadi pohon yang tumbuh terlalu cepat, terlalu tinggi, dan terlalu kaku. Dorongan ini adalah kekuatan hebatmu, namun sifat kaku itu membuatmu rapuh dan mudah patah saat badai hidup memaksamu untuk berkompromi atau melambat.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang selalu menatap ke depan. Kamu punya rencana, target, dan visi tentang ke mana kamu menuju. Masalahnya, kamu sering begitu sibuk tumbuh sampai lupa bahwa orang di sampingmu juga butuh kamu hadir di sini, hari ini, bukan hanya di masa depan yang sedang kamu kejar. Setiap kali pasanganmu ingin menikmati momen, kamu sudah memikirkan langkah selanjutnya. Lama-kelamaan mereka merasa seperti sedang mendampingi seseorang yang selalu setengah melangkah pergi. Lalu saat mereka mulai tertinggal, kamu pun bingung:` },
          bridge: [`Aku ngelakuin semua ini kan demi masa depan kita juga. Tapi kenapa makin aku usaha, dia malah makin ngerasa jauh dari aku? Apa salah kalau aku cuma pengen kita terus maju?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa dorongan untuk terus maju, yang kamu maksudkan sebagai bentuk tanggung jawab, justru membuat orang di sampingmu merasa tertinggal. Ini bukan karena ambisimu salah, dan bukan pula karena mereka tidak mendukungmu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa dorongan untuk terus tumbuh justru membuat orang yang kamu sayangi merasa kamu tinggalkan.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang membantumu berhenti sejenak dan menikmati apa yang sudah kamu capai, dan mereka yang justru memacumu untuk terus berlari tanpa henti.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan dorongan majumu adalah kekuatan sejati, dan kapan ia hanyalah caramu menghindari diam yang membuatmu gelisah.` },
            ],
          },
          ocean: {
            beat1: `Dorongan untuk terus tumbuh adalah salah satu hal paling berharga yang kamu miliki. Di dunia yang penuh orang yang mudah puas dan berhenti di tengah jalan, kamu terus bergerak, terus membangun, terus mengejar versi yang lebih baik dari hidupmu. Tetapi mari jujur, dorongan sebesar itu memiliki bebannya sendiri. Saat kamu tidak pernah bisa berhenti, orang-orang yang ingin berjalan bersamamu perlahan kehabisan napas mengejar. Di sinilah letak masalah yang selama ini sulit kamu pahami.`,
            beat2: {
              intro: `Situasi ini mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Kamu mencapai sesuatu yang sudah lama kamu perjuangkan, tetapi kamu hampir tidak sempat menikmatinya. Belum kering rasa bangga itu, pikiranmu sudah sibuk menyusun target berikutnya, seakan-akan berhenti sejenak untuk merayakannya adalah kemewahan yang tidak kamu izinkan untuk dirimu.`,
                `Pasanganmu mengajakmu menikmati momen sederhana, tetapi pikiranmu ada di tempat lain, di rencana dan langkah selanjutnya. Kamu hadir secara fisik, tetapi tidak benar-benar ada di sana bersamanya.`,
                `Saat seseorang di dekatmu ingin melambat atau merasa sudah cukup, kamu diam-diam merasa tidak sabar, seolah-olah keinginan mereka untuk berhenti adalah hambatan bagi arah yang sedang kamu tuju.`,
              ],
            },
            beat3: {
              body: `Kamu sering membenarkan dorongan ini dengan dalih tanggung jawab dan masa depan bersama. Padahal, pasanganmu tidak butuh proyeksi tentang lima tahun ke depan; mereka butuh kehadiranmu secara utuh hari ini. Kamu gagal benar-benar hadir di momen yang sedang berlangsung, sehingga orang di sampingmu merasa sedang mendampingi seseorang yang selalu setengah pergi.

Mereka akhirnya memilih mundur bukan karena berhenti peduli, melainkan karena lelah hanya dijadikan halte transit dalam ambisimu, bukan tujuan akhir yang ingin kamu tuju. Dan inilah bagian yang paling sulit diterima: pohon yang tumbuh terlalu lurus dan terlalu cepat menjadi kaku, dan saat sesuatu menuntutnya untuk menekuk, untuk melambat, untuk sekadar berhenti dan menikmati, ia justru patah karena tidak pernah belajar caranya.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan sesama pendorong, yaitu individu tipe Jati atau Akar yang sama-sama selalu bergerak. Hubungan kalian berubah menjadi ajang balap lari, sama-sama ambisius tanpa ada yang mau berhenti mengerem. Kalian sibuk menatap ke depan dan mengejar target masing-masing, sampai lupa saling menyapa dan merawat apa yang ada di antara kalian berdua. Hubungan kalian terus bergerak, tetapi jarang benar-benar berhenti untuk saling bertemu.`,
              feed: `Bertemu dengan individu tipe Pedang atau Permata yang memberikan batasan tegas, yang membantumu memahat apa yang sudah kamu capai alih-alih sekadar menambah tinggi tanpa henti. Atau tipe Matahari atau Pelita yang membawa kehangatan, yang membuat momen "sekarang" terasa cukup dan berharga untuk dinikmati tanpa rasa buru-buru. Di dekat mereka, kamu belajar bahwa berhenti sejenak bukan berarti mundur, melainkan memberi dirimu kesempatan untuk benar-benar menikmati apa yang sudah kamu tumbuhkan.`,
              sign: `Tandanya sederhana. Pendamping yang tepat membuatmu nyaman untuk berhenti sejenak dan menikmati tempat kalian berdiri sekarang. Orang yang keliru hanya akan ikut berlari di sampingmu, sampai kalian berdua lupa alasan awal memulai perjalanan.`,
            },
            beat5: {
              explanation: `Grafik kelahiranmu menunjukkan dominasi unsur Kayu yang tidak diimbangi unsur lain. Ketiadaan penyeimbang inilah yang membuatmu selalu didera kegelisahan saat situasi menuntutmu untuk diam. Inilah sumber dorongan luar biasa yang membuatmu tidak pernah berhenti tumbuh, sekaligus alasan mengapa berhenti terasa begitu sulit bagimu. Memahami sebaran ini membantumu melihat bahwa kegelisahanmu saat diam bukanlah tanda ada yang salah denganmu, melainkan tanda bahwa dorongan sebesar itu membutuhkan jangkar, agar kamu bisa terus berkembang tanpa harus mengorbankan orang-orang yang ingin tumbuh bersamamu.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Setiap kali kamu merasa tidak sabar menghadapi orang di sampingmu yang ingin melambat, hentikan dulu kebiasaan membela diri. Pertanyaan yang biasanya tebersit di benakmu bernada pembenaran, "Bukankah terus bergerak maju itu justru demi kebaikan kita bersama?" Mulai hari ini, cobalah mengubahnya menjadi refleksi yang lebih jujur:`,
              rule: `Apakah aku terus bergerak karena ini memang arah yang benar, atau karena diam sejenak membuatku merasa gelisah dan tidak berguna?`,
              body: `Jika langkah berikutnya memang penting dan orang di sampingmu sejalan denganmu, maka teruslah bergerak. Dorongan itu adalah kekuatanmu yang sejati. Tetapi jika kamu bergerak hanya karena takut dengan keheningan, ingatlah bahwa melambat untuk hadir bersama orang yang kamu sayangi bukanlah sebuah kekalahan. Menetaplah di satu pencapaian sedikit lebih lama, rasakan penuh bersama orang di sampingmu, sebelum matamu beralih ke puncak berikutnya. Momen itulah yang sebenarnya sedang kamu kejar selama ini.`,
            },
            beat7: `Kemampuanmu untuk bermimpi besar dan membangun tanpa lelah adalah karunia yang langka, sesuatu yang tidak perlu kamu pangkas menjadi biasa-biasa saja demi membuat orang lain nyaman. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan mana pergerakan yang benar-benar produktif, dan mana yang hanya pelarian dari rasa cemas saat kamu tidak melakukan apa-apa.

Begitu kamu bisa membedakan keduanya, dorongan majumu akan berhenti menjadi sesuatu yang menjauhkanmu dari orang lain, dan mulai menjadi sesuatu yang kamu bagi bersama mereka. Sebab pohon yang paling kuat bukanlah yang tumbuh paling tinggi sendirian, melainkan yang cukup lentur untuk memberi tempat bagi orang lain tumbuh di sampingnya. Saat kamu belajar untuk sesekali berhenti, kamu akan menemukan bahwa orang yang tepat tidak ingin memperlambatmu. Mereka hanya ingin memastikan bahwa saat kamu akhirnya sampai di puncak yang kamu kejar, kamu tidak menengok ke belakang dan mendapati dirimu berdiri di sana sendirian.`,
          },
          closer,
        },
      },
    },
  },
};
