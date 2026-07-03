import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const samudra = {
  stem: '壬',
  archetypeName: 'SAMUDRA',
  dayMasterChinese: '壬',
  dayMasterElement: 'Water',
  states: {
    balanced: {
      card: {
        modifier: `Berarus Dalam`,
        dimension: `Saat orang lain panik dan gaduh, kamu jangkar yang paling stabil. Kamu memproses segalanya jauh di bawah permukaan. Diammu jarang berarti kosong; biasanya itu caramu menimbang keadaan dengan kepala dingin sebelum melangkah.`,
        feed: [`Pedang`, `Permata`],
        drain: [`Gunung`, `Ladang`],
      },
      river: {
        siapaKamu: `Kamu tipe orang yang memilih menyimak saat ruangan sedang bising, lalu melempar satu kalimat penutup yang paling telak dan jernih. Kamu tidak reaktif, karena kamu butuh waktu mencerna segala hal secara utuh.

Bagimu, emosi itu untuk dirasakan dalam-dalam, bukan untuk dipamerkan. Sifat hemat ekspresi inilah yang sayangnya sering terbaca orang luar sebagai jarak.`,
        kenapaBegini: `Elemen intimu adalah Air, yang sifat dasarnya bergerak di kedalaman, bukan di permukaan yang riuh. Air di baganmu mengalir dalam takaran yang pas: tidak kering, tidak juga meluap. Cukup tenang untuk disandari, cukup dalam untuk tidak habis dibaca sekali pandang.

Keseimbangan ini membuatmu bisa peduli tanpa perlu berisik. Orang yang sudah lama mengenalmu paham betul isi hatimu. Yang baru mengenalmu kerap keliru mengira ketenanganmu sebagai sikap dingin.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu kerap jadi penampung terbaik sekaligus yang paling sedikit bersuara. Kamu menyimpan banyak hal sendiri, lalu hadir saat dibutuhkan tanpa banyak penjelasan. Dan setiap kali ada yang menudingmu tertutup atau sulit didekati, ada bagian dirimu yang bingung. Kamu merasa sudah peduli habis-habisan, hanya saja dengan cara yang sepertinya tidak pernah benar-benar mereka tangkap.` },
          bridge: [`Aku merasa sudah memberikan seluruh perhatianku. Tapi kenapa di matanya aku tetap dianggap cuek, kayak orang yang nggak punya hati?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kepedulian sebesar milikmu justru sering terbaca sebagai sikap masa bodoh. Ini bukan karena kamu kurang peka, dan bukan juga karena mereka sengaja menutup mata.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Kenapa ketenangan alamimu otomatis disalahartikan sebagai dingin.` },
              { title: BEAT_HEADINGS[4], helper: `Siapa yang bisa membaca bahasamu tanpa kamus, dan siapa yang menuntutmu menjadi orang lain.` },
              { title: BEAT_HEADINGS[6], helper: `Satu cara tahu apakah kamu memang menutup diri, atau hanya berbeda cara bicara.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu menampung keluh kesah orang tanpa ikut tenggelam itu aset yang langka. Saat orang lain gampang terseret arus emosi, kamu justru menjadi pelabuhan tempat badai mereda. Orang merasa aman bercerita padamu karena kamu tidak gampang kaget, tidak menghakimi, dan pandai menjaga rahasia. Ketenangan sedalam itu mahal harganya.`,
            beat2: {
              intro: `Beberapa hal ini mungkin terasa sangat akrab:`,
              scenes: [
                `Seseorang bercerita berputar-putar, dan kamu langsung menangkap akar masalah yang bahkan belum mereka sadari. Tapi kamu memilih diam, menunggu momen yang tepat, karena tahu mereka belum siap mendengarnya.`,
                `Kamu sedang memikul beban berat, tapi dari luar tidak ada yang retak sedikit pun. Kamu tetap berfungsi seperti biasa, sampai orang terdekatmu pun tidak sadar ada badai besar di dalam kepalamu.`,
                `Orang terdekat bertanya "kamu kenapa?" dengan nada khawatir, padahal kamu merasa baik-baik saja. Kamu bingung menjawabnya, karena bagimu diam adalah kondisi yang normal.`,
              ],
            },
            beat3: {
              body: `Kamu mengira mereka menjauh karena kamu payah berkomunikasi, atau karena ada yang salah dengan caramu menunjukkan rasa. Kenyataannya jauh lebih sederhana, jadi berhentilah menyalahkan dirimu sendiri.

Kepedulianmu bergerak seperti arus di kedalaman laut, bukan ombak yang memecah di pantai. Arusmu kuat, nyata, dan menggerakkan banyak hal. Tapi ia bekerja di bawah permukaan, di tempat yang tidak terlihat oleh orang yang hanya memandang dari tepi. Mereka menunggu tanda yang gampang dibaca: kata-kata yang diumbar, reaksi yang heboh, kehangatan yang langsung terasa. Sementara bahasamu adalah kehadiran yang tenang, dan itu hanya bisa dibaca oleh orang yang mau ikut mendekat.

Selama ini kamu menilai dirimu dari seberapa banyak yang kamu rasakan. Padahal yang sering membuatmu disalahpahami bukanlah soal seberapa dalam rasamu. Kedalaman itu memang tidak dirancang untuk terlihat dari jauh, dan di situlah salah pahamnya bermula.`,
              pull: `Itulah ironinya. Kamu yang merasa paling banyak memberi justru sering dianggap paling dingin. Rasa pedulimu tidak pernah kurang. Arusmu saja yang bergerak di tempat yang tidak semua orang berani menyelaminya.`,
            },
            beat4: {
              drain: `Tipe yang kaku dan menuntut kepastian, seperti Gunung atau Ladang. Mereka ingin segalanya jelas, terucap, dan terbukti sekarang juga. Di dekat mereka kamu lelah, karena terus dipaksa menerjemahkan isi hatimu ke dalam bahasa yang mereka mau.`,
              feed: `Tipe yang tajam dan jeli, seperti Pedang atau Permata. Mereka tidak takut pada kedalaman, dan bisa membaca yang tersirat tanpa kamu harus mengejanya. Di dekat orang seperti ini, kamu tidak perlu berpura-pura heboh atau naik ke permukaan hanya untuk dianggap ada.`,
              sign: `Tandanya sederhana. Bersama orang yang tepat, keheningan terasa nyaman, bahkan intim. Bersama orang yang keliru, diammu berubah menjadi beban, sampai kamu mulai mempertanyakan ada apa dengan dirimu.`,
            },
            beat5: {
              explanation: `Coba lihat sebaran angkamu. Elemen Air-mu kuat, tetapi punya rem yang pakem. Ada penyeimbang yang menjaga agar kedalamanmu tidak jebol menjadi banjir yang merusak. Kamu bisa berempati dalam-dalam tanpa kehilangan kendali. Kamu bukan air yang meluap. Kamu air yang tahu menahan bentuknya sendiri.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali kalau ada yang mengataimu dingin atau sulit ditebak, dan kamu mulai ragu pada dirimu sendiri, berhenti sejenak. Ganti pertanyaannya. Jangan bertanya "kenapa aku begini." Tanyakan ini:`,
              rule: `Aku emang lagi nutup diri sama dia, atau cuma cara kami nunjukin rasa yang beda?`,
              body: `Kalau kamu memang sedang menarik diri karena kecewa, itu hal yang sehat untuk kamu sadari. Di situ kamu bisa memilih membuka sedikit pintu, memberi mereka kesempatan masuk.

Tapi kalau kamu merasa sudah memberi dengan caramu sendiri, dan yang kurang hanyalah cara mereka membacanya, maka masalahnya tidak terletak pada kedalamanmu. Kamu tidak perlu menjadi air yang dangkal supaya lebih mudah dibaca. Kamu hanya butuh orang yang tidak takut pada kedalaman, dan sesekali, sedikit keberanian untuk menyuarakan apa yang selama ini kamu simpan di dasar.`,
            },
            beat7: `Kedalamanmu bukan sesuatu yang perlu kamu kecilkan. Justru di situ letak hal yang membuat orang merasa benar-benar aman di dekatmu: kamu sanggup menampung yang tidak sanggup ditampung orang lain.

Yang perlu kamu pelajari hanyalah membedakan kapan diammu adalah kedamaian, dan kapan ia adalah tembok. Begitu kamu bisa membedakannya, kamu akan berhenti menyesali dirimu yang tenang, dan mulai memilih orang-orang yang tidak butuh kamu berteriak untuk tahu bahwa kamu peduli. Orang yang tepat tidak akan berdiri di tepi menunggu ombak. Mereka akan ikut menyelam.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `Pasang Raya`,
        dimension: `Kamu memproses dan merasakan segala hal jauh lebih intens dibanding orang kebanyakan. Saat peduli pada seseorang, kamu langsung mengguyur mereka dengan seluruh kedalamanmu tanpa takaran. Air pasangmu sering kali terlalu besar untuk ukuran pantai orang lain. Kamu berniat memeluk, tetapi yang terjadi justru menenggelamkan.`,
        feed: [`Jati`, `Akar`, `Gunung`, `Ladang`],
        drain: [`Samudra`, `Hujan`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali seseorang menanyakan hal yang santai kepadamu, mungkin hanya berbasa-basi, tetapi kamu membalasnya dengan jawaban yang begitu mendalam dan berlapis-lapis sampai mereka terdiam, kewalahan oleh jawaban yang jauh lebih besar daripada pertanyaannya.

Itulah dirimu. Kamu memang tidak bisa bermain di permukaan. Bagimu, obrolan yang dangkal terasa hambar. Saat kamu masuk ke sebuah hubungan atau lingkaran pertemanan, kamu akan menyelam total. Kamu mencintai dengan intensitas penuh yang tidak semua orang punya kapasitas untuk menampungnya.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Air, tetapi di baganmu porsi Air ini meluap besar sekali, jauh melebihi unsur lain. Kamu bukan tipe arus bawah yang tenang dan misterius; kamu adalah ombak besar yang langsung menghantam ruangan. Kapasitas perasaanmu yang masif adalah sebuah kekuatan, namun air sebanyak ini tidak punya pembatas atau tanggul yang jelas. Ombakmu keluar begitu saja dengan kekuatan penuh, tanpa kamu sadar bahwa orang di hadapanmu mungkin sedang tidak siap untuk tenggelam.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu memberi dengan seluruh kedalamanmu. Setiap percakapan kamu bawa ke tempat yang dalam, setiap perasaan kamu sampaikan dengan kekuatan penuh. Bagimu, itulah bentuk cinta yang sebenarnya. Tetapi tidak semua orang siap untuk menyelam setiap kali mereka berbicara denganmu. Sebagian dari mereka mulai merasa kewalahan, seakan-akan setiap interaksi denganmu menuntut kedalaman yang tidak selalu sanggup mereka berikan. Lalu saat mereka mundur untuk mengambil napas, kamu pun kebingungan:` },
          bridge: [`Aku sudah memberikan seluruh hatiku untuk dia. Tapi kenapa setiap kali aku totalitas, dia malah kelihatan capek dan minta jarak? Apa peduliku semenakutkan itu?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa kedalaman yang kamu maksudkan sebagai cinta justru membuat orang di sekitarmu merasa kewalahan. Ini bukan karena perasaanmu terlalu besar, dan bukan pula karena mereka terlalu dangkal untuk memahamimu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kedalaman yang kamu berikan justru sering membuat orang yang kamu sayangi merasa tenggelam.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang cukup kokoh untuk menampung pasangmu tanpa goyah, dan mereka yang justru ikut tersapu lalu menyeretmu makin dalam.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kedalamanmu adalah pemberian, dan kapan ia menjadi arus yang justru menjauhkan orang.` },
            ],
          },
          ocean: {
            beat1: `Kedalaman perasaanmu adalah sesuatu yang langka. Di dunia yang dipenuhi hubungan yang dangkal dan basa-basi, kamu menawarkan sesuatu yang sungguh-sungguh: perhatian yang utuh, kepedulian yang nyata, kedalaman yang tidak pura-pura. Tetapi mari jujur, kedalaman sebesar itu memiliki bebannya sendiri. Air yang melimpah tanpa tepi tidak hanya mengisi; ia juga bisa menenggelamkan. Dan inilah yang selama ini sulit kamu pahami: terkadang yang membuat orang menjauh bukanlah kekuranganmu, melainkan justru terlalu besarnya pemberianmu.`,
            beat2: {
              intro: `Situasi ini mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Seseorang menanyakan hal sederhana, dan kamu menjawabnya dengan kedalaman penuh, lengkap dengan segala lapisan dan pertimbangannya. Kamu melihat raut mereka perlahan berubah dari ingin tahu menjadi kewalahan, tetapi kamu tidak tahu cara memberi jawaban yang lebih ringan.`,
                `Kamu ingin membicarakan sesuatu dengan serius dan mendalam, justru di saat pasanganmu hanya ingin bersantai. Bagimu kedalaman adalah cara menunjukkan cinta, tetapi bagi mereka, itu kadang terasa seperti tuntutan yang tidak pernah berhenti.`,
                `Saat kamu menumpahkan seluruh isi hatimu sekaligus, kamu melihat orang di hadapanmu kewalahan, bukan karena mereka tidak peduli, melainkan karena yang kamu berikan datang terlalu banyak dan terlalu sekaligus untuk dicerna.`,
              ],
            },
            beat3: {
              body: `Mari kita buka kenyataan yang sulit ini: dicintai olehmu terkadang terasa melelahkan. Orang-orang di sekitarmu menjauh bukan karena mereka dangkal atau tidak menghargaimu, melainkan karena berada di dekatmu membutuhkan tenaga batin yang besar.

Kamu membawa setiap obrolan ringan menjadi percakapan yang dalam dan berat. Setiap emosi kamu tunjukkan pada tingkat maksimal. Orang-orang terdekatmu terkadang mundur atau mengambil jarak bukan karena benci, melainkan murni karena mereka butuh ruang untuk sekadar bernapas. Hubunganmu rentan retak bukan karena kamu kurang memberi, melainkan karena kelimpahanmu yang terasa menghimpit.

Ini bagian yang paling sulit diterima: bukan kekuranganmu yang membuat mereka lelah, melainkan kelimpahanmu. Dan itu justru lebih sulit diperbaiki, karena tidak ada yang salah dengan kedalamanmu. Yang perlu kamu pelajari hanyalah kapan harus membuka pintu airmu sepenuhnya, dan kapan cukup membiarkannya mengalir pelan.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan sesama elemen Air yang sama-sama meluap, yaitu tipe Samudra atau Hujan, adalah resep instan menuju bencana emosional. Sekilas mereka tampak seperti satu-satunya orang yang bisa mengimbangimu, tetapi justru di sinilah letak masalahnya. Dua air dalam yang sama-sama meluap tidak akan saling menenangkan. Kalian tidak punya tepi untuk saling menahan, sehingga yang terjadi adalah pasang bertemu pasang. Alih-alih saling menyeimbangkan, kalian justru saling menyeret ke tempat yang semakin dalam, saling mengorek luka masing-masing, sampai tidak ada lagi pijakan yang kokoh untuk salah satu dari kalian.`,
              feed: `Bertemu dengan individu tipe Jati atau Akar yang memberi airmu arah untuk mengalir, atau tipe Gunung atau Ladang yang berfungsi sebagai garis pantai yang kokoh. Mereka cukup kuat untuk menerima hantaman ombakmu tanpa ikut terombang-ambing. Mereka memberi batas yang jelas, sehingga airmu tahu kapan harus berhenti meluap dan punya tempat yang aman untuk berlabuh. Di dekat mereka, kedalamanmu akhirnya menemukan tempat untuk berlabuh, bukan sekadar tempat untuk meluap.`,
              sign: `Tandanya sederhana. Pendamping yang tepat masih berdiri tegak setelah pasangmu surut, dan ia tetap di sana. Orang yang keliru akan ikut tersapu, lalu menyalahkanmu karena telah menenggelamkannya.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka pada grafikmu. Unsur Air-mu tidak sekadar hadir; ia meluap, jauh mendominasi unsur-unsur lain yang seharusnya menyeimbangkannya. Inilah sumber kedalamanmu yang luar biasa, sekaligus alasan mengapa ia begitu sulit dibendung. Air yang melimpah tanpa cukup tepi tidak punya banyak pilihan selain meluap keluar. Memahami sebaran ini membantumu melihat bahwa kewalahan yang dirasakan orang di sekitarmu bukanlah tanda cintamu salah, melainkan tanda bahwa kekuatan sebesar itu perlu disalurkan dengan terarah, bukan ditumpahkan ke satu orang sekaligus.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu merasa ingin membongkar seluruh isi kepalamu atau membawa sebuah obrolan masuk ke fase yang dalam, rem dulu sedetik. Tanyakan ini pada dirimu sendiri:`,
              rule: `Orang ini sekarang memang siap menyelam bersamaku, atau ia cuma butuh aku hadir dengan santai dan ringan?`,
              body: `Jika ia memang sedang butuh ruang aman untuk berbagi, silakan buka pintu airmu sepenuhnya. Itulah saat pemberianmu menjadi karunia yang paling berharga. Tetapi jika ia hanya sedang lelah dan butuh sesuatu yang ringan, belajarlah untuk menahan sebagian ombakmu. Menyimpan sebagian kedalamanmu bukan berarti kamu tidak tulus; justru itu adalah bentuk kedewasaan emosional, cinta yang memperhitungkan seberapa banyak yang sanggup ditampung orang lain. Berikan mereka air dalam bentuk rintik gerimis yang menyegarkan, bukan badai yang membuat mereka berlindung.`,
            },
            beat7: `Kapasitas perasaanmu yang luas adalah salah satu hal paling berharga di dalam dirimu. Kamu punya cinta yang murni dan pekat, kemampuan untuk hadir dengan sungguh-sungguh di dunia yang makin dangkal. Itu bukan sesuatu yang perlu kamu kecilkan demi membuat orang lain nyaman. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan seseorang sanggup menerima seluruh pasangmu, dan kapan ia hanya butuh sebagian saja untuk saat ini.

Begitu kamu bisa membedakan keduanya, kamu akan berhenti merasa bahwa kedalamanmu adalah sesuatu yang harus disesali. Kamu akan mulai memilih orang-orang yang cukup kokoh untuk menampung seluruh dirimu tanpa tersapu, dan di dekat merekalah kamu akan menemukan sesuatu yang selama ini kamu cari: tempat di mana kamu bisa menjadi sedalam dirimu yang sebenarnya, dan tetap disambut.

Karena dunia ini tidak kekurangan orang yang menyentuh segala sesuatu di permukaan. Yang langka adalah orang yang berani mencintai sedalam kamu. Kedalaman itu tidak perlu kamu kecilkan; ia hanya perlu menemukan pantai yang tepat untuk menyambutnya. Dan saat pantai itu kamu temukan, pasang terbesarmu tidak lagi menjadi sesuatu yang menenggelamkan, melainkan sesuatu yang membuat seseorang merasa benar-benar dicintai untuk pertama kalinya.`,
          },
          closer,
        },
      },
    },
  },
};
