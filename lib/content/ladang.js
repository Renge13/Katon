import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const ladang = {
  stem: '己',
  archetypeName: 'LADANG',
  dayMasterChinese: '己',
  dayMasterElement: 'Earth',
  states: {
    balanced: {
      card: {
        modifier: `Subur Bersemi`,
        dimension: `Kamu tahu persis kapan seseorang butuh bantuan, sering kali sebelum mereka mengatakannya. Kamu memberi dengan murah hati, tapi kamu juga tahu menyisakan cukup untuk dirimu sendiri. Justru karena tanahmu selalu tampak subur, orang di sekitarmu lupa bahwa kesuburan itu ada yang merawat. Mereka datang untuk memanen, dan pergi tanpa pernah berpikir untuk ikut menyiram.`,
        feed: [`Matahari`, `Pelita`],
        drain: [`Jati`, `Akar`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali kamu mengurus banyak keperluan orang terdekatmu dengan begitu rapi, sampai tidak ada satu pun dari mereka yang sadar seberapa keras kamu bekerja di balik layar. Bukan karena mereka tidak peduli, tapi karena kamu membuat semuanya terlihat mudah.

Itulah dirimu. Kamu adalah tanah yang menumbuhkan. Orang-orang berkembang di dekatmu karena kamu merawat mereka dengan tulus. Bedanya, kamu tahu batas: kamu memberi banyak, tapi kamu tidak pernah benar-benar kehabisan, karena kamu selalu menyisakan sepetak untuk dirimu sendiri.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Bumi yang seimbang. Bumi memang sifatnya menumbuhkan dan menampung, dan di baganmu, unsur ini hadir dengan kuat namun tetap terkendali. Kamu bukan tanah yang dibiarkan terbuka untuk siapa saja tanpa batas; kamu adalah ladang subur dan terawat, yang tahu persis takaran memberi tanpa membuat tanahmu sendiri gersang. Justru karena kamu merawatnya sebaik itu, orang lupa bahwa kesuburan itu tidak datang dengan sendirinya.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang membuat segalanya terasa lebih ringan. Kamu mengurus, kamu mengingat, kamu menyediakan, dan kamu melakukannya dengan begitu rapi sampai orang di sekitarmu berhenti menyadari bahwa itu semua butuh usaha. Lama-kelamaan, kebaikanmu berubah dari sesuatu yang disyukuri menjadi sesuatu yang diharapkan. Bukan karena mereka jahat, tapi karena kamu tidak pernah terlihat kewalahan, jadi mereka menganggap semua ini memang datang gratis darimu.` },
          bridge: [`Aku nggak masalah ngasih, aku suka ngerawat orang. Tapi kenapa lama-lama rasanya semua ini jadi kewajibanku, bukan pilihanku? Kayak nggak ada yang inget buat sesekali balik nanya, aku sendiri gimana?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kebaikan yang kamu berikan dengan tulus perlahan berubah menjadi sesuatu yang dianggap sudah semestinya. Ini bukan karena orang-orang di sekitarmu tidak tahu berterima kasih, dan bukan karena kamu kurang memberi.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa kemurahan hati yang kamu rawat dengan baik justru membuat orang lupa bahwa ia ada harganya.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang ikut merawat tanahmu dan menghargai apa yang kamu beri, dan mereka yang datang hanya untuk memanen lalu pergi.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan mengenali kapan memberi adalah pilihan yang membuatmu penuh, dan kapan ia hanyalah caramu menghindari risiko untuk mengecewakan.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu menumbuhkan orang lain adalah bakat yang langka. Kamu meninggalkan orang dalam keadaan lebih baik daripada saat kamu menemukan mereka, dan kamu melakukannya tanpa menguras habis dirimu sendiri, karena kamu tahu cara menjaga tanahmu tetap subur. Tapi mari jujur, ada beban tersendiri dalam menjadi orang yang selalu bisa diandalkan. Justru karena kamu mengelola semuanya dengan begitu baik, hampir tidak ada yang menyadari bahwa apa yang kamu beri itu ada harganya. Di sinilah letak lelah yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab:`,
              scenes: [
                `Kamu mengurus banyak hal untuk orang-orang terdekatmu dengan begitu rapi, sampai tidak ada yang menyadari usahanya. Mereka hanya melihat hasilnya yang mulus, dan menganggap itu memang sudah beres dengan sendirinya.`,
                `Kamu memberi karena kamu memang mau, bukan karena terpaksa. Tapi lama-kelamaan, pemberian yang tadinya disyukuri berubah menjadi sesuatu yang diharapkan, bahkan dituntut.`,
                `Sesekali kamu ingin ada yang balik bertanya apa yang kamu butuhkan. Tapi karena kamu tidak pernah terlihat kekurangan, pertanyaan itu hampir tidak pernah datang.`,
              ],
            },
            beat3: {
              body: `Kekuatanmu justru terletak pada apa yang membedakanmu dari orang yang memberi tanpa batas: kamu punya pagar. Kamu memberi dengan murah hati, tapi kamu tahu menyisakan cukup untuk dirimu sendiri, dan itulah kenapa kamu tetap bisa berdiri sementara orang lain kehabisan.

Tapi di situ pula letak biayanya. Karena kamu mengelola kesuburanmu dengan begitu baik, kamu tidak pernah terlihat kewalahan. Dan karena kamu tidak pernah terlihat kewalahan, orang berhenti menyadari bahwa apa yang kamu beri itu butuh usaha untuk dijaga. Mereka melihat ladang yang selalu bersemi dan menyimpulkan bahwa ia tumbuh dengan sendirinya. Ketahananmu yang mandiri itu justru membuat orang berasumsi bahwa kamu tidak pernah butuh perhatian balik. Kebaikanmu pelan-pelan berpindah dari sesuatu yang mereka syukuri menjadi sesuatu yang mereka andalkan tanpa pikir panjang. Kamu tidak sedang kehabisan, tapi kamu sedang tidak dianggap, dan kadang yang kedua terasa lebih sepi daripada yang pertama.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan tipe Jati atau Akar, yang tumbuh subur di tanahmu lalu terus menanam tanpa pernah ikut merawatnya. Mereka berkembang justru karena kamu menyediakan ruang bagi mereka, tapi mereka menganggap kesuburan itu sebagai hak yang sudah semestinya ada. Semakin lama, mereka semakin banyak mengambil dan semakin sedikit menyadari bahwa tanah tempat mereka berpijak itu ada yang menjaganya. Kamu lelah bukan karena memberi, tapi karena memberimu tidak pernah benar-benar terlihat.`,
              feed: `Bertemu dengan tipe Matahari atau Pelita yang membawa kehangatan dan perhatian yang aktif. Mereka tidak hanya datang untuk memanen; mereka menyadari bahwa tanahmu ada yang merawat, dan mereka ikut menghangatkannya. Mereka bertanya bagaimana keadaanmu, dan mereka menghargai apa yang kamu beri sebagai sebuah pilihan, bukan kewajiban. Di dekat mereka, memberi terasa mengisi, bukan menguras.`,
              sign: `Tandanya sederhana. Pendamping yang tepat akan menyadari usahamu bahkan saat kamu membuatnya terlihat mudah. Orang yang keliru hanya akan menikmati hasilnya, lalu lupa bahwa ada tangan yang menanamnya.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Bumi yang kuat, namun diimbangi dengan baik oleh unsur lain sehingga tidak meluap tanpa kendali. Struktur ini adalah modal yang bagus: kamu punya kapasitas besar untuk menumbuhkan orang lain tanpa kehilangan pijakanmu sendiri, selama kamu terus menjaga batas yang selama ini membuatmu tetap utuh. Keseimbangan inilah kekuatan sejatimu, dan ia pula yang membuat orang lupa bahwa ladang yang paling subur sekalipun tetap butuh dirawat agar terus bisa memberi.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu refleks ingin mengiyakan sesuatu padahal kamu tahu itu akan memakan lebih dari yang pantas, rem dulu sedetik. Tanyakan ini pada dirimu:`,
              rule: `Aku ngasih ini karena aku emang mau dan masih punya buat diberikan, atau karena aku takut dianggap berubah kalau sesekali aku bilang 'nggak'?`,
              body: `Kalau kamu memberi karena memang ingin dan tanahmu masih cukup subur untuk itu, berikan dengan senang hati. Itulah kemurahan hatimu yang bekerja dengan benar. Tapi kalau kamu mengiyakan hanya karena takut kehilangan tempatmu di mata seseorang, ingat bahwa hubungan yang sehat tidak menuntutmu untuk terus memberi agar layak dipertahankan. Sesekali, biarkan orang melihat bahwa kesuburanmu ada batasnya. Bukan untuk menutup pintu, tapi untuk memberi mereka kesempatan menghargai apa yang selama ini kamu beri dengan cuma-cuma.`,
            },
            beat7: `Kemurahan hatimu adalah salah satu hal terindah dalam dirimu, dan pagar yang kamu miliki membuatnya bisa bertahan lama. Itu bukan sesuatu yang perlu kamu kurangi demi terlihat lebih berkorban. Satu-satunya hal yang perlu kamu kuasai hanyalah membiarkan orang lain sesekali melihat harga di balik kesuburanmu, supaya mereka belajar merawat, bukan sekadar memanen.

Ladang yang paling subur bukanlah yang membiarkan siapa saja mengambil sepuasnya, melainkan yang tahu siapa yang layak diberi ruang untuk tumbuh bersamanya. Begitu kamu berani menunjukkan bahwa kebaikanmu adalah pilihan dan bukan sumber yang tak terbatas, kamu akan melihat dengan jelas siapa yang benar-benar menghargai tanahmu, dan mulai memberi kepada orang-orang yang tidak hanya datang saat musim panen, tapi juga tinggal untuk ikut menyiram.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `tanpa Pagar`,
        dimension: `Kamu orang pertama yang mengulurkan tangan bahkan sebelum diminta. Memberi sudah seperti bernapas bagimu, otomatis dan tanpa hitungan. Tanahmu terbuka untuk siapa saja. Siapa pun bisa masuk dan menanam sesuka hati, sampai kamu lupa menyisakan sepetak pun untuk dirimu sendiri.`,
        feed: [`Pedang`, `Permata`],
        drain: [`Gunung`, `Ladang`],
      },
      river: {
        siapaKamu: `Kamu tipe yang selalu ada. Saat orang lain butuh tempat bersandar atau sedang kekurangan, kamu yang paling cepat bergerak. Kepedulianmu berjalan otomatis, tanpa perlu kamu pikirkan dua kali.

Orang-orang tumbuh subur di dekatmu, karena kamu menyiram mereka dengan tulus tanpa pernah menagih balasan di kemudian hari.`,
        kenapaBegini: `Elemen intimu adalah Bumi, tanah yang sifat dasarnya menumbuhkan dan menampung. Di baganmu, porsi Bumi ini meluap besar sekali, mendominasi unsur yang lain. Itulah kenapa insting merawat orang lain di dalam dirimu seolah punya bahan bakar tanpa habis.

Memiliki tanah seluas itu jelas berkah bagi orang sekitar. Tapi lahan yang terlalu terbuka tanpa sekat menyimpan satu hal yang sering luput dari perhatianmu sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu hampir selalu jadi pihak yang berkorban paling banyak. Kamu sibuk mengurus, mengalah, dan menyediakan, sampai melewati ambang batas tenagamu sendiri. Anehnya, makin banyak yang kamu serahkan, makin kamu merasa kosong dan kurang dihargai. Kekecewaan itu kamu simpan sendiri, menumpuk diam-diam, tanpa kamu benar-benar paham kenapa berbuat baik justru membuatmu sehabis ini.` },
          bridge: [`Aku udah ngasih segalanya buat dia. Tapi kenapa makin lama aku malah ngerasa makin abis, kayak nggak ada lagi yang tersisa buat diriku sendiri?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kebaikan yang seharusnya membuatmu bahagia malah menguras habis dirimu. Ini bukan soal kamu kurang ikhlas, dan bukan juga soal mereka yang tidak tahu berterima kasih.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Kenapa kemurahan hatimu malah membuat orang lupa kamu juga punya batas.` },
              { title: BEAT_HEADINGS[4], helper: `Siapa yang ikut merawat tanahmu, dan siapa yang cuma datang saat musim panen.` },
              { title: BEAT_HEADINGS[6], helper: `Satu cara tahu kamu memberi karena tulus, atau karena takut kehilangan kalau berhenti.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu membesarkan orang lain itu bakat yang mahal. Banyak orang lewat dalam hidup seseorang tanpa meninggalkan apa-apa; kamu selalu meninggalkan orang dalam keadaan lebih baik dari saat kamu menemukan mereka. Ada orang-orang yang hari ini bisa berdiri tegak hanya karena dulu kamu rela menjadi tanah tempat mereka berakar saat mereka belum jadi siapa-siapa. Itu jejak yang nyata, dan tidak semua orang punya kapasitas sebesar itu.`,
            beat2: {
              intro: `Beberapa hal ini mungkin terasa sangat akrab:`,
              scenes: [
                `Seseorang minta tolong di saat tenagamu sendiri sudah habis, tapi kamu tetap bilang "bisa". Menolak terasa jauh lebih berat daripada memaksakan diri, jadi kamu memilih lelah daripada dihantui rasa bersalah.`,
                `Kamu berkorban banyak untuk seseorang, lalu menelan kecewa diam-diam saat mereka tidak membalas dengan takaran yang sama. Kamu tidak pernah mengucapkannya, tapi hitungan itu ada di kepalamu.`,
                `Saat ada yang balik bertanya, "kamu sendiri butuh apa?", kamu justru bingung menjawab. Kamu terlalu terbiasa membaca kebutuhan orang lain sampai kebutuhanmu sendiri terasa asing.`,
              ],
            },
            beat3: {
              body: `Kamu mungkin mengira rasa lelah ini datang karena orang-orang di sekitarmu terlalu banyak menuntut, atau karena kamu kurang pandai memilih siapa yang pantas dibantu. Kenyataannya tidak sesederhana itu. Masalahnya terletak pada bentuk tanahmu sendiri.

Tanahmu tidak punya pagar. Bagimu, membuka pintu lebar-lebar untuk siapa saja terasa seperti wujud cinta yang paling murni: tanpa syarat, tanpa memilih. Tapi ingat, tak berpagar bukan berarti tanpa batas. Lahanmu tetap punya kapasitas, dan unsur haranya tetap bisa habis terkuras. Bedanya, karena kamu tidak pernah memasang patok sendiri, orang lain yang menentukan seberapa dalam mereka boleh menggali. Dan orang akan terus mengambil selama tidak ada yang melarang.

Lebih dari itu, kamu telanjur menilai dirimu dari seberapa banyak yang bisa kamu beri. Memberi bukan lagi sekadar tindakan sukarela, melainkan satu-satunya cara kamu merasa berarti. Di sinilah letak lelahmu: kamu capek bukan cuma karena berkorban, tapi karena kamu takut membayangkan siapa dirimu jika berhenti berguna.

Tanpa pagar, kamu tidak sedang menjadi orang yang lebih mulia. Kamu hanya pelan-pelan kehilangan tempat untuk berdiri sebagai dirimu sendiri.`,
              pull: `Itulah ironi terbesarnya. Kamu yang merasa paling banyak berkorban justru sering berakhir merasa paling sepi. Tanahmu kering bukan karena kurang subur, tapi karena kamu membiarkan semua orang memanennya tanpa aturan.`,
            },
            beat4: {
              drain: `Tipe sesama Bumi, seperti Gunung atau Ladang. Dinamika ini menjebak justru karena kalian memakai elemen yang sama. Sesama tanah tidak akan pernah bisa saling mengisi hara atau menyuburkan satu sama lain; kalian cuma akan saling menumpuk beban. Mereka tidak hadir untuk merawat atau mencangkul tanahmu. Alih-alih menggemburkan, mereka memperlakukan kemurahan hatimu sebagai lahan tambahan untuk ditanami, atau sekadar tempat kosong untuk berpijak. Karena kamu tipe tanpa pagar yang refleksnya selalu mengalah, kamu pelan-pelan bergeser menjadi lantai tempat mereka berdiri dengan nyaman. Sementara itu, kebutuhanmu sendiri telantar dan gersang karena tidak ada yang menggarap. Bersama mereka, kamu tidak sedang tumbuh dalam hubungan; kamu cuma habis dipakai sebagai fondasi.`,
              feed: `Tipe yang tegas dan punya bentuk yang jelas, seperti Pedang atau Permata. Mereka justru membawa batas yang tidak kamu miliki. Mereka tahu diri untuk tidak mengambil lebih dari yang pantas, dan tidak tersinggung saat kamu mulai berkata "tidak". Di dekat mereka, keinginanmu untuk memberi kembali menjadi pilihan, bukan keharusan.`,
              sign: `Tandanya sederhana. Orang yang tepat membuatmu merasa terisi setelah memberi. Orang yang keliru membuatmu merasa kosong, lalu bersalah karena merasa kosong.`,
            },
            beat5: {
              explanation: `Coba lihat sebaran angkamu. Unsur Bumi-mu menonjol jauh di atas yang lain. Itu sumber kemurahan hatimu yang luar biasa, sekaligus titik tempat batasmu mudah lebur. Tanah seluas ini sanggup menumbuhkan banyak hal, tapi tanpa unsur yang memberi bentuk dan tepi, ia gampang dijejali sampai rusak. Kekuatanmu dan titik lelahmu tumbuh dari akar yang sama.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu refleks ingin mengiyakan sesuatu padahal tenagamu sudah habis, tahan sebentar. Ganti pertanyaannya. Jangan bertanya "tega nggak aku menolak." Tanyakan ini:`,
              rule: `Aku ngasih ini karena emang pengen, atau karena takut dia bakal pergi kalau aku bilang nggak?`,
              body: `Kalau kamu memberi karena memang ingin, dengan tenaga yang masih ada, lakukan dengan senang hati tanpa beban.

Tapi kalau kamu mengiyakan karena didorong rasa takut, takut dianggap jahat, takut tidak lagi dicintai saat tidak berguna, maka itu bukan lagi cinta. Itu cara membayar supaya tidak ditinggalkan. Dan hubungan yang dirawat dengan cara seperti itu tidak akan pernah cukup; ia akan terus menagih, sampai tidak ada lagi yang tersisa darimu untuk diberikan.`,
            },
            beat7: `Kemurahan hatimu adalah salah satu hal terindah dalam dirimu. Dunia butuh lebih banyak orang yang menumbuhkan sesamanya seperti kamu. Itu bukan sesuatu yang perlu kamu padamkan.

Yang perlu kamu pelajari hanyalah memasang pagar. Pagar dibuat bukan untuk mengusir orang, tapi untuk menentukan sendiri siapa yang boleh masuk dan seberapa banyak yang boleh diambil. Memasang batas bukan bentuk keegoisan; justru itu satu-satunya cara agar kebaikanmu bisa bertahan lama tanpa menghabiskan dirimu. Begitu kamu berani memasangnya, kamu akan melihat dengan jelas siapa yang benar-benar menghargai tanahmu, dan siapa yang selama ini datang hanya karena pintunya tidak pernah terkunci.`,
          },
          closer,
        },
      },
    },
  },
};
