import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const permata = {
  stem: '辛',
  archetypeName: 'PERMATA',
  dayMasterChinese: '辛',
  dayMasterElement: 'Metal',
  states: {
    balanced: {
      card: {
        modifier: `Berkilau Cemerlang`,
        dimension: `Matamu otomatis tahu mana kualitas asli dan mana yang sekadar polesan. Kamu selalu melihat potensi terbaik seseorang dan menolak membiarkan mereka puas dengan hasil yang biasa-biasa saja. Karena radarmu tidak bisa dimatikan, orang terdekatmu justru sering merasa diuji, bukan disayangi.`,
        feed: [`Gunung`, `Ladang`],
        drain: [`Matahari`, `Pelita`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali pasangan atau temanmu memamerkan sesuatu dengan bangga, tetapi hal pertama yang refleks keluar dari mulutmu justru satu detail kecil yang masih kurang. Kamu bahkan belum sempat memuji bagian yang sudah bagus.

Itulah dirimu. Kamu punya standar yang tinggi karena kamu tahu hal yang bernilai memang layak diperjuangkan. Orang-orang mencari penilaianmu justru karena kamu tidak mudah terkesan dengan hal-hal yang instan atau setengah jadi.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Logam yang seimbang, tetapi jenisnya bukan pedang tajam yang bertugas memotong. Kamu adalah permata, dan fungsi utamamu adalah menilai mutu. Karena porsi elemenmu seimbang, ketelitianmu ini sebenarnya hadir dengan pertimbangan yang matang, bukan asal kritik. Ketajaman matamu dalam melihat kualitas adalah kekuatan terbesarmu, sekaligus alasan mengapa orang-orang di sekitarmu kadang merasa kelelahan.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu mengira sedang mendorong pasanganmu menuju potensi terbaik mereka. Tetapi di telinga mereka, dorongan itu sering terdengar seperti ketidakpuasan yang konstan. Orang yang paling kamu perjuangkan justru menjadi orang yang paling merasa dihakimi. Dan kamu pun berakhir dengan keluhan sunyi:` },
          bridge: [`Kenapa saat aku mendorong seseorang karena aku yakin pada kemampuan mereka, mereka malah merasa tidak pernah cukup baik untukku? Apa caraku peduli memang se-menyiksa itu?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa caramu menyayangi, yang lahir dari keyakinan, justru sering terbaca sebagai penghakiman. Ini bukan karena kamu terlalu menuntut, dan bukan karena orang-orang di sekitarmu terlalu rapuh.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa keyakinanmu pada orang lain justru membuat mereka merasa tidak pernah cukup baik.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang membuat standarmu terasa sebagai dukungan, dan mereka yang justru menuntutmu terus tampil sempurna.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan penilaianmu adalah bentuk cinta yang sehat, dan kapan ia hanyalah caramu menjaga jarak agar tidak kecewa.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu mengenali kualitas sejati adalah bakat yang langka. Kamu memberi orang-orang di sekitarmu sesuatu yang berharga: seseorang yang menolak membiarkan mereka berpuas diri dengan versi yang setengah jadi. Tetapi jujur saja, dicintai olehmu itu membutuhkan energi besar. Mata yang terlatih untuk selalu mencari mana yang bisa lebih baik tidak punya tombol untuk berhenti. Ia terus menilai, bahkan saat sebenarnya yang kamu butuhkan hanyalah menerima sesuatu apa adanya. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Seseorang membagikan rencana atau hasil kerjanya kepadamu. Sebelum kamu sempat memuji, pikiranmu sudah lebih dulu menangkap satu bagian yang masih kurang, dan kamu pun mengatakannya, karena bagimu itulah bentuk perhatian yang jujur.`,
                `Orang terdekatmu mengeluh bahwa kamu sulit dibuat puas. Padahal di matamu, kamu hanya melihat betapa hebatnya mereka bisa menjadi, dan kamu tidak tega membiarkan potensi itu terbuang sia-sia.`,
                `Saat kamu sendiri mencapai sesuatu, kamu kesulitan menikmatinya. Pikiranmu langsung melompat ke kekurangan yang masih tersisa, sehingga rasa bangga itu jarang sempat singgah lama di dalam dirimu.`,
              ],
            },
            beat3: {
              body: `Dalam hubungan, kamu mengira sedang mendorong pasanganmu menuju potensi maksimal mereka. Tetapi di telinga mereka, itu terdengar seperti ketidakpuasan yang konstan. Orang yang paling kamu perjuangkan justru menjadi orang yang paling merasa dihakimi.

Mata penilai yang sama ini pula yang sering kamu arahkan ke dirimu sendiri, sehingga kamu hampir tidak pernah bisa merayakan pencapaianmu karena langsung fokus pada apa yang belum sempurna. Inilah yang paling sedikit kamu sadari: kemampuan yang membuatmu begitu peka pada kekurangan orang lain adalah kemampuan yang sama yang tidak pernah memberimu izin untuk merasa cukup atas dirimu sendiri.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan individu tipe Matahari atau Pelita, yang hidup dari kehangatan dan penegasan kasih sayang yang terus-menerus. Mereka butuh dipuji "kamu sudah hebat" justru di saat kamu melihat celah yang menurutmu masih bisa diperbaiki. Di dekat mereka, standarmu akan dianggap sebagai serangan, dan kamu lelah karena caramu menyayangi selalu disalahpahami.`,
              feed: `Bertemu dengan individu tipe Gunung atau Ladang yang punya rasa aman yang kuat dari dalam dan tidak mudah goyah oleh penilaian. Mereka tidak membaca standarmu sebagai serangan, melainkan sebagai bukti bahwa kamu menanggapi mereka dengan serius. Di dekat mereka, kritikanmu diterima sebagai bentuk kepercayaan.`,
              sign: `Ukurannya sederhana. Orang yang tepat merasa lebih berharga karena standarmu, sebab ia tahu kamu tidak akan buang-buang energi menuntut seseorang yang tidak kamu pedulikan. Orang yang keliru akan terus merasa kecil di dekatmu, sekeras apa pun ia berusaha.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Logam yang kuat namun terkendali oleh unsur penyeimbang lainnya. Komposisi ini adalah modal yang bagus: kamu punya ketelitian yang tinggi tanpa harus menjadi sosok yang kejam. Kamu punya rem internal yang menjaga standar tinggi itu tetap berjalan bersama kelapangan hati. Keseimbangan inilah kekuatan sejatimu, dan ia pula yang membuat orang lupa bahwa di balik penilaianmu yang tajam ada hati yang sebenarnya hanya ingin melihat mereka berhasil.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu melihat kekurangan pada orang yang kamu sayangi dan dorongan untuk mengoreksinya muncul, rem dulu sedetik. Ubah pertanyaan di kepalamu menjadi:`,
              rule: `Orang ini sekarang sedang butuh didorong untuk berkembang, atau dia cuma butuh dipastikan kalau usahanya hari ini sudah cukup?`,
              body: `Jika dia memang meminta masukan, silakan jujur. Itulah penilaianmu yang bekerja dengan benar. Tetapi jika dia hanya butuh merasa diterima, ingatlah bahwa tidak semua hal di dunia ini harus langsung diperbaiki agar layak dicintai. Khusus di depan orang-orang terdekatmu, cobalah sesekali memberikan pujian yang bersih, tanpa ada embel-embel "tapi besok-besok lebih bagus kalau..." di ujungnya.`,
            },
            beat7: `Ketelitianmu adalah aset. Menolak hasil yang setengah jadi adalah tanda kamu peduli pada kualitas, dan kamu tidak perlu menumpulkan radarmu hanya demi membuat orang lain nyaman. Kamu hanya perlu belajar membedakan kapan kamu perlu hadir sebagai penilai, dan kapan kamu cukup hadir sebagai pasangan.

Satu hal yang paling penting: berikan kelonggaran yang sama pada dirimu sendiri. Penilaian setajam milikmu juga berhak sesekali menurunkan standarnya dan berkata, "hari ini, ini sudah cukup, dan aku pun sudah cukup."`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `tanpa Cela`,
        dimension: `Matamu langsung tahu di mana letak kekurangan, bahkan sebelum kamu sempat melihat apa yang sudah bagus. Kamu mendorong pasanganmu menjadi versi terbaiknya, dan itu niat yang tulus. Tapi coba perhatikan: setiap kali ia berhasil mencapai standarmu, standar itu sudah bergeser lebih tinggi. Ia tidak pernah benar-benar sampai, karena bagimu, tidak pernah ada titik yang bisa disebut "sudah cukup".`,
        feed: [`Samudra`, `Hujan`, `Matahari`, `Pelita`],
        drain: [`Pedang`, `Permata`],
      },
      river: {
        siapaKamu: `Coba ingat saat terakhir pasanganmu menunjukkan sesuatu dengan bangga. Sebelum kamu sempat memuji bagian yang sudah bagus, matamu sudah lebih dulu menangkap satu detail yang masih kurang, dan itulah yang keluar pertama dari mulutmu. Kamu tidak bermaksud melukai. Kamu hanya benar-benar tidak bisa tidak melihatnya.

Itulah dirimu. Kamu punya mata yang langka: kemampuan melihat kualitas sejati dan menolak membiarkan orang yang kamu sayangi berpuas diri dengan hasil yang setengah jadi. Standarmu tinggi karena kamu tahu mereka bisa lebih.`,
        kenapaBegini: `Karakter dasarmu adalah elemen Logam yang melampaui kapasitasnya. Logam memang bertugas menilai dan menyaring, tapi di baganmu, tidak ada cukup kehangatan yang bisa membuat matamu sesekali berhenti menilai. Kamu bukan lagi permata yang tahu kapan sebuah mutu sudah layak dihargai; kamu menjelma menjadi mata yang tidak pernah bisa berkata "sudah cukup", pada siapa pun, termasuk pada dirimu sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu mengira sedang membantu pasanganmu bertumbuh. Masalahnya, tidak pernah ada garis akhir. Setiap kali ia memperbaiki satu hal, kamu sudah melihat hal berikutnya yang bisa lebih baik. Bagimu itu perhatian; baginya, itu hidup di bawah pemeriksaan yang tidak pernah selesai, di mana ia tidak pernah sekali pun benar-benar lulus.` },
          bridge: [`Aku kan cuma pengen yang terbaik buat dia. Tapi kenapa dia malah kelihatan capek tiap kali aku kasih masukan? Apa aku beneran nggak pernah bisa bilang 'ini udah bagus' tanpa ada tambahan 'tapi'?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa mata yang terlatih melihat potensi terbaik justru perlahan membuat orang di sebelahmu merasa tidak pernah cukup. Ini bukan karena kamu terlalu menuntut, dan bukan karena kamu harus menurunkan seleramu.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa matamu yang tidak pernah berhenti menilai membuat orang yang kamu sayangi tidak pernah merasa lulus.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang membuat matamu akhirnya bisa beristirahat, dan mereka yang justru mengunci kalian dalam pemeriksaan yang tidak pernah selesai.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan mengenali kapan penilaianmu adalah bentuk cinta yang sehat, dan kapan ia hanyalah caramu menolak membiarkan sesuatu terasa cukup.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu mengenali kualitas sejati adalah bakat yang langka. Di dunia yang mudah puas dengan hasil setengah jadi, kamu menolak membiarkan orang yang kamu sayangi berhenti di bawah kemampuan mereka. Tapi mari jujur, dicintai olehmu membutuhkan tenaga yang besar. Mata yang terlatih untuk selalu mencari mana yang bisa lebih baik tidak punya tombol untuk berhenti. Ia terus menilai, bahkan saat yang dibutuhkan pasanganmu hanyalah didengar dan diterima apa adanya. Di situlah kelelahan yang selama ini sulit kamu jelaskan mulai terbentuk.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab:`,
              scenes: [
                `Pasanganmu membagikan sesuatu yang ia banggakan. Sebelum kamu sempat memujinya, kamu sudah lebih dulu menyebut bagian yang masih kurang, karena bagimu itulah bentuk perhatian yang jujur.`,
                `Ia mengeluh bahwa kamu sulit dibuat puas. Di matamu, kamu hanya melihat betapa hebatnya ia bisa menjadi, dan kamu tidak tega membiarkan potensi itu terbuang.`,
                `Setiap kali ia mencapai sesuatu, momen bangganya selalu pendek, karena kamu, bagai instrumen audit yang berjalan tanpa henti, sudah lebih dulu mengarahkan pandangan ke hal berikutnya yang bisa diperbaiki.`,
              ],
            },
            beat3: {
              body: `Kekuatan terbesarmu, matamu yang jeli, sudah terasah melewati batasnya. Kamu tidak lagi sekadar melihat kualitas; kamu tidak bisa lagi berhenti mengukurnya. Dan karena matamu tidak pernah berhenti, tidak pernah ada satu momen pun yang kamu izinkan untuk sekadar cukup.

Perhatikan bedanya. Ini bukan soal ketelitianmu yang disalahpahami sebagai penghakiman. Ini soal tidak adanya garis akhir sama sekali. Setiap kali pasanganmu mencapai standarmu, standar itu sudah bergeser lebih tinggi sebelum ia sempat merayakannya. Ia terjebak dalam pusaran evaluasi tanpa garis akhir, di mana lulus hari ini hanya berarti ada ujian baru besok. Inilah harga dari mata yang tidak mengenal cela: kamu melihat lebih tajam daripada siapa pun, dan tidak seorang pun di dekatmu, termasuk dirimu sendiri, pernah merasa sudah cukup.`,
              pull: ``,
            },
            beat4: {
              drain: `Berpasangan dengan sesama tipe Logam seperti Pedang atau Permata. Kalian sama-sama jeli dan sama-sama tidak mudah puas, jadi tanpa kehangatan yang bisa mencairkan, hubungan berubah menjadi pemeriksaan dua arah yang tidak pernah berakhir. Setiap momen baik dinilai dari kedua sisi, dan tidak ada satu pun dari kalian yang bisa berkata "sudah cukup", sampai tidak ada lagi ruang yang tersisa untuk sekadar menikmati satu sama lain.`,
              feed: `Berdampingan dengan tipe Samudra atau Hujan yang punya kedalaman untuk menerima tanpa ikut menilai, sehingga matamu punya tempat untuk sesekali beristirahat. Atau tipe Matahari dan Pelita yang membawa kehangatan yang berani berkata "kamu sudah cukup" justru di saat kamu masih melihat celah. Di dekat mereka, kamu belajar bahwa mencintai tidak selalu berarti memperbaiki.`,
              sign: `Tandanya sederhana. Pendamping yang tepat membuatmu merasa aman untuk berhenti menilai sejenak. Orang yang keliru akan membuatmu merasa lulus hari ini hanya untuk diuji lagi besok.`,
            },
            beat5: {
              explanation: `Grafik elemenmu menunjukkan unsur Logam yang sangat dominan tanpa cukup kehangatan yang bisa melunakkannya. Inilah kenapa ketelitian yang seharusnya menjadi kekuatan berubah menjadi dorongan mengejar kesempurnaan yang tidak pernah bisa dipuaskan, lengkap dengan rasa gelisah setiap kali ada hal yang kurang. Kabar baiknya, ini bukan takdir mati. Mata setajam ini adalah aset yang langka, asalkan kamu belajar memberinya izin untuk sesekali berkata "ini sudah cukup", dimulai dari dirimu sendiri.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu melihat kekurangan pada orang yang kamu sayangi dan dorongan untuk mengoreksinya muncul, rem dulu sedetik. Tanyakan ini pada dirimu:`,
              rule: `Dia sekarang lagi butuh didorong buat berkembang, atau dia cuma butuh dipastikan kalau hari ini dia udah cukup?`,
              body: `Kalau ia memang meminta masukan, sampaikan dengan jujur. Itu ketelitianmu yang bekerja dengan benar. Tapi kalau ia hanya butuh merasa diterima, ingat bahwa tidak semua hal harus diperbaiki dulu agar layak dicintai. Sesekali, biarkan sesuatu yang sudah bagus tetap bagus tanpa kamu tambahi "tapi". Bukan karena kamu menurunkan standarmu, tapi karena kamu memilih dia lebih penting daripada versi sempurna yang ada di kepalamu.`,
            },
            beat7: `Ketelitianmu adalah karunia yang langka. Menolak hasil setengah jadi adalah tanda kamu peduli, dan itu bukan sesuatu yang perlu kamu tumpulkan menjadi biasa-biasa saja demi membuat orang lain nyaman. Satu-satunya hal yang perlu kamu kuasai hanyalah membedakan kapan kejelianmu adalah bentuk kepedulian, dan kapan ia berubah menjadi tuntutan yang menolak rasa puas.

Permata yang paling berharga bukanlah yang paling tidak punya cela, melainkan yang tahu kapan harus berhenti mencari cela pada hal yang sudah indah. Begitu kamu bisa membedakan keduanya, ketajaman matamu berhenti menjadi ujian yang tidak pernah lulus, dan mulai menjadi cara yang membuat satu orang merasa benar-benar berharga, justru karena kamu memilih untuk berkata kepadanya, dan kepada dirimu sendiri, "hari ini, ini sudah cukup."`,
          },
          closer,
        },
      },
    },
  },
};
