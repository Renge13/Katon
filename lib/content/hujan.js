import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const hujan = {
  stem: '癸',
  archetypeName: 'HUJAN',
  dayMasterChinese: '癸',
  dayMasterElement: 'Water',
  states: {
    balanced: {
      card: {
        modifier: `Rintik Lembut`,
        dimension: `Kamu tahu perasaan seseorang bahkan sebelum mereka sempat menyusun kata. Kamu membaca suasana, menangkap yang tersirat, dan membuat orang merasa benar-benar dimengerti. Tapi coba perhatikan: kamu begitu jernih memantulkan orang lain kepada diri mereka sendiri, sampai hampir tidak ada yang terpikir untuk sesekali menatap balik dan bertanya, sebenarnya kamu sedang merasakan apa.`,
        feed: [`Pedang`, `Permata`],
        drain: [`Gunung`, `Ladang`],
      },
      river: {
        siapaKamu: `Coba ingat terakhir kali kamu masuk ke sebuah ruangan dan langsung menangkap bahwa ada yang tidak beres dengan seseorang, jauh sebelum orang lain menyadarinya. Kamu tahu persis apa yang ia rasakan, dan kamu tahu persis apa yang perlu dikatakan. Tapi tidak ada satu pun yang menyadari bahwa kamu sedang membaca semua itu.

Itulah dirimu. Kamu adalah rintik yang lembut. Kamu merasakan segala sesuatu dengan mendalam, dan orang-orang merasa aman bercerita padamu karena kamu mengerti tanpa perlu mereka jelaskan. Bedanya, kamu tidak tenggelam dalam yang kamu rasakan; kamu bisa menampung perasaan orang lain tanpa kehilangan dirimu sendiri.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Air yang seimbang. Air memang sifatnya meresap dan merasakan, dan di baganmu, unsur ini hadir dengan kuat namun tetap punya tepiannya. Kamu bukan air yang meluap tak terkendali; kamu adalah aliran lembut yang bisa menyuburkan tanpa kehilangan bentuknya sendiri. Justru karena kamu mengalir dengan begitu tenang, orang lupa bahwa membaca perasaan mereka sedalam itu sebenarnya butuh sesuatu darimu.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang selalu mengerti. Kamu yang lebih dulu tahu saat pasanganmu sedang lelah, kamu yang menangkap perubahan nada suaranya sebelum ia sadar sendiri. Masalahnya, karena kamu begitu mudah mengerti orang lain, mereka jadi terbiasa dimengerti tanpa pernah berpikir untuk balik mengerti kamu. Kamu menjadi orang yang membaca semua orang, sementara hampir tidak ada yang pernah repot-repot membaca kamu.` },
          bridge: [`Aku selalu ngerti apa yang dia rasa, bahkan sebelum dia ngomong. Tapi kenapa kayaknya nggak ada yang pernah sadar aku juga lagi ngerasain sesuatu? Kayak aku ini cuma yang ngerti, bukan yang dimengerti.`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kepekaan yang membuat semua orang merasa dimengerti justru membuatmu merasa sendirian. Ini bukan karena orang-orang di sekitarmu tidak peduli, dan bukan karena perasaanmu terlalu rumit untuk dibaca.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa kemampuanmu memahami orang lain justru membuat perasaanmu sendiri jarang terlihat.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang berani menyampaikan perasaannya dengan jelas sehingga kamu tidak selalu harus menebak, dan mereka yang menyerap kepekaanmu tanpa pernah membalasnya.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan mengenali kapan memahami orang lain adalah bentuk cinta yang sehat, dan kapan ia hanyalah caramu menghindari risiko untuk terlihat sedang membutuhkan.` },
            ],
          },
          ocean: {
            beat1: `Kepekaanmu adalah salah satu hal paling langka yang kamu miliki. Kamu memberi orang di sekitarmu sesuatu yang sangat berharga: perasaan benar-benar dimengerti tanpa harus menjelaskan apa pun. Tapi mari jujur, menjadi orang yang selalu mengerti punya bebannya sendiri. Saat kamu terus-menerus membaca perasaan orang lain, lama-kelamaan kamu terbiasa memperhatikan tanpa pernah diperhatikan balik. Di sinilah letak lelah yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab:`,
              scenes: [
                `Kamu langsung tahu saat suasana hati pasanganmu berubah, dan kamu menyesuaikan diri bahkan sebelum ia mengatakan apa-apa. Tapi saat kamu sendiri sedang tidak baik-baik saja, hampir tidak ada yang menangkapnya.`,
                `Orang-orang datang padamu untuk merasa dimengerti, dan kamu selalu ada untuk itu. Tapi saat kamu ingin didengar, kamu bingung harus ke mana, karena kamu terbiasa menjadi tempat, bukan orang yang mencari tempat.`,
                `Kamu begitu terlatih membaca kebutuhan orang lain, sampai saat seseorang bertanya apa yang kamu rasakan, kamu justru butuh waktu lama untuk menjawabnya.`,
              ],
            },
            beat3: {
              body: `Kekuatanmu justru terletak pada apa yang membedakanmu dari orang yang tenggelam dalam perasaannya sendiri: kamu bisa merasakan sedalam itu tanpa kehilangan pijakan. Kamu menampung, kamu mengerti, dan kamu tetap utuh. Itu bukan kemampuan yang dimiliki semua orang.

Tapi di situ pula letak biayanya. Karena kamu membaca perasaan orang lain dengan begitu mudah dan tenang, mereka tidak pernah melihat bahwa itu membutuhkan sesuatu darimu. Kamu selalu menjadi juru bahasa bagi emosi orang-orang terdekatmu, membaca setiap perubahan nada suara sebelum mereka sadar sendiri. Mereka merasa dimengerti, lalu pergi merasa lebih ringan, tanpa terpikir bahwa orang yang mengerti mereka juga menyimpan perasaannya sendiri. Kamu menjadi cermin tempat semua orang melihat diri mereka dengan lebih jelas, dan justru karena itu, hampir tidak ada yang pernah melihat kamu. Kamu bukan orang yang perasaannya terlalu rumit untuk dibaca; kamu hanya terlalu terbiasa menjadi yang membaca, sampai lupa bahwa kamu pun berhak sesekali dibaca.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan tipe Gunung atau Ladang yang tenang dan sulit terbaca. Kamu mencurahkan kepekaanmu untuk memahami mereka, tapi mereka menyerap semua itu tanpa pernah membalas dengan usaha yang sama untuk memahamimu. Semakin lama, kamu merasa seperti mengalir ke tanah yang menyerap semuanya tanpa memantulkan apa pun kembali. Kamu lelah bukan karena mengerti mereka, tapi karena memahamimu tidak pernah menjadi giliran siapa pun.`,
              feed: `Bertemu dengan tipe Pedang atau Permata yang menyampaikan perasaannya dengan jelas dan lugas. Mereka tidak membuatmu harus menebak, dan justru karena mereka berani berkata apa adanya, untuk pertama kalinya radarmu bisa beristirahat dari peran sebagai penerjemah emosi. Di dekat mereka, sesekali kamu bisa menjadi orang yang dimengerti, bukan hanya yang mengerti.`,
              sign: `Tandanya sederhana. Pendamping yang tepat akan menyadari saat kamu diam terlalu lama, lalu bertanya lebih dulu. Orang yang keliru akan terus datang untuk dimengerti, tanpa pernah sekali pun bertanya bagaimana keadaanmu.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Air yang kuat, namun diimbangi dengan baik oleh unsur lain sehingga tidak meluap tanpa kendali. Struktur ini adalah modal yang bagus: kamu punya kepekaan yang dalam tanpa hanyut kehilangan dirimu di dalamnya, selama kamu tidak lupa bahwa perasaanmu sendiri juga layak diberi tempat. Keseimbangan inilah kekuatan sejatimu, dan ia pula yang membuat orang lupa bahwa aliran yang paling menenangkan sekalipun tetap butuh tempat untuk didengar.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu sedang menyimpan sesuatu tetapi refleks memilih fokus pada perasaan orang lain, rem dulu sedetik. Tanyakan ini pada dirimu:`,
              rule: `Aku diem dan ngurusin perasaan dia karena aku emang lagi kuat, atau karena aku takut kalau aku cerita, ternyata nggak ada yang mau ikut ngerti?`,
              body: `Kalau kamu memang sedang lapang dan ingin hadir untuk seseorang, lakukan dengan senang hati. Itulah kepekaanmu yang bekerja dengan benar. Tapi kalau kamu memilih diam karena takut perasaanmu tidak akan disambut, ingat bahwa hubungan dua arah tidak akan pernah tercipta kalau kamu selalu menjadi satu-satunya yang mengerti. Sesekali, biarkan orang yang kamu percaya membaca kamu, meski itu berarti kamu harus lebih dulu mengatakan apa yang kamu rasakan. Bukan karena kamu lemah, tapi karena kamu pun berhak dimengerti seperti kamu selama ini mengerti orang lain.`,
            },
            beat7: `Kepekaanmu adalah karunia yang langka. Kemampuanmu membuat orang merasa dimengerti adalah sesuatu yang membuat dunia terasa lebih hangat, dan itu bukan sesuatu yang perlu kamu kurangi menjadi biasa-biasa saja. Satu-satunya hal yang perlu kamu kuasai hanyalah membiarkan dirimu sesekali menjadi yang dimengerti, bukan hanya yang mengerti.

Aliran yang paling menghidupkan bukanlah yang hanya mengalir ke arah orang lain, melainkan yang juga membiarkan seseorang mengalir kembali kepadanya. Begitu kamu berani menunjukkan perasaanmu sendiri, kepekaanmu berhenti menjadi cermin yang hanya memantulkan orang lain, dan mulai menjadi jembatan dua arah, tempat kamu akhirnya merasakan hal yang selama ini kamu berikan pada semua orang: dimengerti, tanpa harus menjelaskan.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `yang Tak Reda`,
        dimension: `Kamu bisa merasakan isi hati orang lain bahkan sebelum mereka mengucapkannya. Kepekaan ini membuatmu sangat mudah dipercaya, namun ada harga yang harus dibayar: kamu menyerap emosi orang lain tanpa bisa memilih. Kamu sering pulang membawa beban yang sebenarnya bukan milikmu, lalu bingung kenapa hatimu terasa penuh padahal tidak ada masalah apa pun dalam hidupmu.`,
        feed: [`Jati`, `Akar`],
        drain: [`Samudra`, `Hujan`],
      },
      river: {
        siapaKamu: `Kamu tipe yang peka luar biasa. Sebelum orang lain selesai bicara, kamu sudah menangkap apa yang sebenarnya mereka rasakan. Suasana hati seseorang, ketegangan di sebuah ruangan, hingga kesedihan yang disembunyikan di balik senyum, semuanya terbaca olehmu tanpa perlu dijelaskan.

Karena itu, orang merasa benar-benar dimengerti saat berada di dekatmu. Kamu menjadi tempat yang aman untuk bercerita dan sosok yang menerima tanpa menghakimi.`,
        kenapaBegini: `Elemen intimu adalah Air, unsur yang sifat dasarnya meresap dan merasakan. Di baganmu, porsi Air ini meluap besar sekali, mendominasi unsur yang lain. Itulah kenapa kepekaan terhadap perasaan orang lain di dalam dirimu begitu tajam, hampir tidak pernah bisa kamu matikan.

Memiliki kepekaan seluas itu jelas membuat banyak orang merasa nyaman di dekatmu. Namun, air yang terlalu melimpah tanpa saluran keluar menyimpan satu hal yang sering luput dari perhatianmu sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu kerap menjadi tempat orang menumpahkan segala keluh kesah, ketakutan, dan kesedihan mereka. Kamu ikut larut sampai sulit membedakan mana perasaan pribadimu dan mana yang kamu serap dari sekitar. Anehnya, makin banyak yang kamu tampung, makin kamu merasa berat dan keruh. Kamu sering kehabisan tenaga di akhir hari, ikut terbebani oleh masalah yang sebenarnya bukan milikmu.` },
          bridge: [`Kenapa ya aku gampang banget kebawa perasaan orang lain? Masalah mereka tiba-tiba jadi beban pikiranku, sampai aku sendiri yang abis, padahal hidupku lagi baik-baik aja.`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kepekaan yang seharusnya menjadi kelebihanmu malah sering membuatmu kelelahan sendiri. Ini bukan karena kamu terlalu mudah terbawa perasaan, dan bukan juga karena mereka sengaja memanfaatkanmu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Kenapa perasaan orang lain terus naik di dalam dirimu tanpa pernah bisa surut.` },
              { title: BEAT_HEADINGS[4], helper: `Siapa yang memberi airmu jalan untuk mengalir, dan siapa yang cuma membuat genanganmu makin parah.` },
              { title: BEAT_HEADINGS[6], helper: `Satu cara tahu kamu menampung karena peduli, atau karena tidak tahu cara berhenti.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu merasakan orang lain sedalam itu adalah sesuatu yang langka. Banyak orang melewati hidup tanpa pernah benar-benar dimengerti oleh siapa pun; kamu memberi mereka pengalaman berharga untuk diterima apa adanya. Ada orang-orang yang sanggup bertahan melewati masa tergelap mereka hanya karena dulu kamu bersedia mendengar tanpa menghakimi. Itu bukan kemampuan kecil, melainkan kapasitas jiwa yang besar, dan tidak semua orang memilikinya.`,
            beat2: {
              intro: `Beberapa pola ini mungkin terasa sangat akrab:`,
              scenes: [
                `Seseorang menceritakan masalahnya, dan berjam-jam setelah mereka pergi kamu masih memikirkannya, masih ikut sedih, seolah masalah itu milikmu sendiri.`,
                `Kamu masuk ke sebuah ruangan dan langsung tahu ada yang tidak beres, padahal belum ada yang bicara. Suasana hati orang lain seolah menempel begitu saja ke dirimu.`,
                `Saat ada yang balik bertanya, "kamu sendiri lagi gimana?", kamu justru bingung menjawab. Kamu terlalu sibuk merasakan orang lain sampai perasaanmu sendiri terasa kabur.`,
              ],
            },
            beat3: {
              body: `Kamu mungkin mengira rasa lelah ini datang karena orang-orang di sekitarmu terlalu banyak mengeluh, atau karena kamu kurang pandai menjaga jarak. Kenyataannya tidak sesederhana itu. Masalahnya terletak pada bentuk airmu sendiri.

Airmu tidak punya muara. Kamu menyerap perasaan semua orang dengan mudah, itu sudah jelas. Tapi air yang masuk ke dalam dirimu tidak punya jalan untuk keluar. Tidak ada tempat untuk menumpahkannya, tidak ada saluran yang membuatnya mengalir pergi.

Air yang tidak menemukan muara tidak akan diam. Dia naik.

Setiap perasaan yang kamu serap dari orang lain menumpuk di atas perasaan sebelumnya, lapis demi lapis, sampai permukaannya nyaris meluap. Itulah kenapa kamu sering merasa berat tanpa sebab yang jelas: yang kamu rasakan bukan satu masalah konkret, tapi genangan dari puluhan perasaan orang lain yang tidak pernah sempat surut.

Lebih dari itu, kamu telanjur menjadikan "merasakan orang lain" sebagai cara utamamu terhubung. Menyerap perasaan mereka bukan lagi sekadar kepekaan, melainkan satu-satunya cara kamu merasa dekat dengan seseorang. Di sinilah letak lelahmu: kamu capek bukan cuma karena menampung, tapi karena kamu tidak pernah belajar ke mana harus mengalirkan semua yang sudah kamu tampung.`,
              pull: `Itulah ironi terbesarnya. Kamu yang paling peka terhadap perasaan semua orang justru menjadi sosok yang paling sering tenggelam sendirian. Hatimu penuh bukan karena hidupmu berat, tapi karena kamu menampung air yang seharusnya tidak pernah kamu pikul.`,
            },
            beat4: {
              drain: `Tipe sesama Air, seperti Samudra atau Hujan. Dinamika ini menjebak justru karena kalian membawa unsur yang sama. Saat dua air yang sama-sama meluap bertemu, tidak ada satu pun dari kalian yang bisa menjadi tepi bagi yang lain; kalian hanya akan saling menambah volume sampai dua-duanya meluap. Mereka datang membawa perasaan mereka sendiri yang juga sudah penuh, lalu menuangkannya ke dalam dirimu yang sudah nyaris luber. Karena kamu tipe yang refleksnya selalu menyerap, kamu pelan-pelan menjadi penampungan bagi banjir yang bukan milikmu. Bersama mereka, kamu tidak sedang berbagi beban; kalian cuma sama-sama tenggelam.`,
              feed: `Tipe yang punya arah dan tujuan yang jelas, seperti Jati atau Akar. Mereka adalah tanaman yang justru membutuhkan air seperti yang kamu punya. Perhatianmu, kepekaanmu, perasaan yang selama ini kamu tampung tanpa tahu harus dibawa ke mana, akhirnya menemukan tempat untuk mengalir dan menumbuhkan sesuatu yang nyata. Di dekat mereka, perasaan yang kamu serap tidak lagi menggenang di dalam; ia berubah menjadi sesuatu yang berguna. Kamu akhirnya punya muara.`,
              sign: `Tandanya sederhana. Orang yang tepat membuatmu merasa lebih ringan setelah bertukar cerita, seperti air yang akhirnya menemukan jalan. Orang yang keliru membuatmu pulang dengan hati yang makin penuh, padahal kamu tidak melakukan apa-apa.`,
            },
            beat5: {
              explanation: `Coba perhatikan sebaran angkamu. Unsur Air-mu menonjol jauh di atas yang lain. Itu sumber kepekaanmu yang luar biasa, sekaligus titik tempat kamu paling mudah tenggelam. Air sebanyak ini sanggup merasakan segalanya, tapi tanpa unsur yang memberinya arah dan jalan keluar, ia gampang menggenang sampai keruh. Kekuatanmu dan titik lelahmu tumbuh dari akar yang sama.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu refleks ikut larut dalam perasaan seseorang sampai lupa pada dirimu sendiri, tahan sebentar. Ganti pertanyaannya. Jangan bertanya "tega nggak aku nggak peduli." Tanyakan ini:`,
              rule: `Aku nampung ini karena emang pengen nemenin dia, atau karena aku nggak tahu caranya berhenti nyerap?`,
              body: `Kalau kamu memilih untuk hadir dan mendengar dengan sadar, sambil tetap tahu mana perasaanmu dan mana perasaan mereka, lakukan dengan tenang. Itu kepekaan yang sehat.

Tapi kalau kamu larut karena tidak punya pilihan lain, karena menyerap sudah menjadi refleks yang tidak bisa kamu hentikan, maka itu bukan lagi kepedulian. Itu air yang masuk tanpa pintu keluar. Dan hati yang menampung dengan cara seperti itu tidak akan pernah cukup tenang; ia akan terus terisi sampai kamu sendiri yang tenggelam di dalamnya.`,
            },
            beat7: `Kepekaanmu adalah salah satu hal terindah dalam dirimu. Dunia butuh lebih banyak orang yang mau benar-benar merasakan sesamanya seperti kamu. Itu bukan sesuatu yang perlu kamu tumpulkan.

Yang perlu kamu pelajari hanyalah menemukan muara. Air yang punya jalan untuk mengalir tidak akan pernah menggenang, sebesar apa pun ia. Mengalirkan perasaan yang kamu tampung, entah lewat orang yang tepat, lewat karya, atau lewat cara apa pun yang membuatnya keluar, bukan bentuk membuang kepedulian; justru itu satu-satunya cara agar kepekaanmu tidak berbalik menenggelamkanmu. Begitu kamu menemukan ke mana airmu harus mengalir, kamu akan melihat dengan jelas siapa yang ikut menumbuhkan sesuatu darinya, dan siapa yang selama ini cuma menambah genangan di dalam dadamu.`,
          },
          closer,
        },
      },
    },
  },
};
