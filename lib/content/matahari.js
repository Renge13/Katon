import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const matahari = {
  stem: '丙',
  archetypeName: 'MATAHARI',
  dayMasterChinese: '丙',
  dayMasterElement: 'Fire',
  states: {
    balanced: {
      card: {
        modifier: `yang Teduh`,
        dimension: `Kehadiranmu membawa kenyamanan yang tenang. Tanpa perlu bersuara keras, kamu bisa membuat suasana terasa hidup sekaligus aman bagi siapa saja di sekitarmu. Orang-orang betah berada dekat denganmu, sering kali tanpa mereka pahami alasannya. Kamu yang selalu memastikan semua orang merasa aman. Tapi kapan terakhir kali ada yang memastikan hal yang sama untukmu?`,
        feed: [`Jati`, `Akar`],
        drain: [`Samudra`, `Hujan`],
      },
      river: {
        siapaKamu: `Rasa aman dan tenang adalah hal pertama yang orang rasakan saat berada di dekatmu, meski mereka kerap kesulitan menjelaskan alasannya. Kamu memancarkan kepedulian yang pas, hadir sepenuhnya tanpa pernah berebut perhatian. Daripada menjadi sosok yang paling mendominasi pembicaraan, kamu adalah tipe orang yang kedatangannya seketika membuat seisi ruangan merasa terlindungi. Kehangatanmu berjalan sangat konsisten, dapat selalu diandalkan, dan tidak pernah terpengaruh oleh pasang surut suasana hatimu.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Api, sebuah unsur yang fitrahnya menerangi dan menghidupkan suasana. Menariknya, Api di dalam bagan lahirmu tidak berkobar sendirian secara berlebihan. Unsur ini tumbuh berdampingan dengan elemen-elemen lain dalam porsi yang serasi dan proporsional. Keselarasan tersebut membuat kepedulianmu memiliki bahan bakar yang awet sekaligus wadah penjaga yang kokoh. Kamu mampu terus berbagi kenyamanan tanpa perlu takut kehabisan energi, sehingga jiwamu jarang sekali mengalami titik jenuh yang parah. Sayangnya, situasi yang terasa begitu damai bagi orang lain ini menyimpan sebuah sudut mati yang jarang kamu sadari sendiri.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Peran sebagai pilar yang kokoh hampir selalu jatuh ke tanganmu dalam setiap relasi. Kamu menjadi penenang saat situasi kacau, sosok tempat bersandar, serta pribadi yang senantiasa tampak tegar dalam segala keadaan. Orang-orang kerap datang hanya untuk mencari ketenangan, lalu melangkah pergi setelah merasa lebih baik, tanpa sempat memeriksa bagaimana kondisi hatimu yang sebenarnya. Dan setiap kali hal itu terjadi, sebuah tanda tanya yang sama kembali tersisa di kepalamu, sebuah pertanyaan yang sampai sekarang belum kamu temukan jawabannya.` },
          bridge: [`Mengapa aku selalu menjadi tempat bagi semua orang untuk bercerita dan bersandar, tetapi saat kondisiku sedang rapuh, rasanya tidak ada satu pun yang menyadarinya? Apakah penampilanku terlalu tangguh sehingga mereka mengira aku tidak membutuhkan siapa-siapa?`],
          paywallTeaser: {
            lead: ``,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa justru kestabilan dirimu yang membuat orang lain lupa bahwa kamu pun butuh ditopang.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe kepribadian yang mampu mengisi kembali energimu, dan mereka yang hanya datang untuk mengurasnya.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kamu memberi dengan ketulusan, dan kapan kamu sekadar takut terlihat rapuh.` },
            ],
          },
          ocean: {
            beat1: `Sebelum kita bedah lebih jauh, ada satu kenyataan yang jarang disadari oleh dunia luar: menjadi sosok yang selalu dituntut stabil itu memiliki beban lelahnya sendiri. Kamu telanjur ditempatkan sebagai muara sandaran semua orang, dianggap selalu sanggup mengatasi keadaan, serta seakan-akan kebal dari hari yang buruk. Padahal, ada kalanya tenagamu habis dan kamu merindukan uluran tangan yang merangkulmu tanpa perlu kamu minta terlebih dahulu. Rasa aman yang kamu bagikan kepada sekelilingmu memang sangat nyata. Namun, karena penampilanmu terlalu meyakinkan, hampir tidak ada orang yang terpikir bahwa kamu pun sesekali ingin bersandar. Hal ini terjadi karena mereka memang tidak pernah mengetahui seberapa banyak rasa peduli yang kamu simpan di dalam sana.`,
            beat2: {
              intro: `Beberapa situasi berikut mungkin terasa sangat akrab dalam hidupmu:`,
              scenes: [
                `Saat kepanikan melanda sekeliling, kamu secara otomatis mengambil alih kendali secara tenang untuk merapikan keadaan. Semua orang merasa lega karena kehadiranmu, tetapi tidak ada satu pun yang bertanya apakah di dalam hati kecilmu sebenarnya tersimpan rasa takut yang sama.`,
                `Kamu sangat sering mengambil peran sebagai pendengar yang baik, tempat berkeluh kesah, serta pemberi semangat. Namun, saat roda kehidupanmu sedang berada di bawah, kamu justru kebingungan mencari tempat untuk bercerita hingga akhirnya memilih untuk memendamnya sendiri.`,
                `Kalimat "aku tidak apa-apa" sudah menjadi respons otomatis yang kamu ucapkan bahkan saat situasimu sedang tidak baik. Kamu melakukannya demi menghindari kemungkinan merepotkan sesama, juga karena telanjur nyaman dengan cap sebagai pribadi yang selalu kuat.`,
              ],
            },
            beat3: {
              body: `Penyebabnya jauh lebih halus daripada yang kamu kira. Karakter kepedulianmu memiliki sifat yang ajek dan tidak pernah menuntut balasan. Kamu terus berpijar tanpa pernah memperlihatkan tanda-tanda kehabisan daya, selalu memberi tanpa mengharapkan upah.

Sifat yang serbakonsisten inilah yang membuat sekelilingmu membaca keadaanmu sebagai sesuatu yang selalu aman. Mereka mengartikan ketenangan sikapmu sebagai bukti bahwa kamu tidak memerlukan bantuan, sebab pandangan mereka hanya tertuju pada lapisan luar yang memang jarang sekali memperlihatkan retakan. Kondisi ini menyerupai sang surya yang setia terbit setiap pagi tanpa perlu diperintah. Semua makhluk hidup bebas menikmati sinarnya, tetapi hampir tidak ada yang meluangkan waktu untuk merenungkan apakah sang surya pernah merasa lelah untuk terus bersinar.`,
              pull: `Hal inilah yang menjadi alasan mengapa kamu yang paling sering menguatkan justru menjadi sosok yang paling jarang ditanya kabarnya. Pancaran kepedulianmu terlihat begitu kokoh sehingga orang-orang menganggapnya tidak akan pernah bisa habis.`,
            },
            beat4: {
              drain: `Berdampingan dengan individu tipe Samudra atau Hujan, yang membawa volume air serta gejolak emosi yang sangat besar untuk ditampung. Kehadiran mereka secara otomatis memosisikanmu sebagai wadah peredam ketakutan mereka, sehingga seluruh energimu terkuras habis hanya demi menenangkan ombak yang tidak kunjung usai. Kamu terus-menerus memberi tanpa jeda, sementara mereka jarang menyadari bahwa dirimu pun ikut basah kuyup akibat badai tersebut.`,
              feed: `Bertemu dengan individu tipe Jati atau Akar yang memiliki prinsip hidup kokoh serta arah tujuan yang jelas. Mereka memberikan sebuah ruang yang bernilai bagi kepedulianmu, bukan sekadar sumur hampa yang tidak memiliki dasar. Berada di dekat mereka membuat kasih sayang yang kamu pancarkan terasa dihargai sekaligus terisi kembali, tidak hanya mengalir keluar secara cuma-cuma.`,
              sign: `Tandanya sangat sederhana. Pendamping yang tepat akan membuat jiwamu terasa penuh dan terisi kembali. Sementara orang yang keliru hanya akan datang saat membutuhkan kenyamananmu, lalu melangkah pergi begitu giliranmu yang memerlukan pertolongan.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka tersebut. Tidak ada satu pun elemen yang mendominasi secara ekstrem ataupun hilang sepenuhnya; seluruh unsur hadir dalam komposisi yang sangat proporsional, dengan Api sebagai poros utamamu. Struktur seperti ini merupakan karunia yang jarang dimiliki oleh orang lain: sebuah kepedulian yang memiliki pasokan bahan bakar yang cukup untuk terus berpijar, sekaligus mempunyai unsur penyeimbang yang kuat agar tidak membakar habis diri sendiri. Keseimbangan inilah yang menjadi kekuatan sejatimu, namun di sisi lain, hal ini pula yang membuat orang-orang sering lupa bahwa kamu adalah manusia biasa yang juga bisa merasakan lelah.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Saat rasa sepi mendadak menyergapmu di tengah keramaian, pertanyaan yang biasanya tebersit di dalam benakmu adalah, "Mengapa tidak ada satu pun orang yang peduli kepadaku?" Mulai hari ini, cobalah untuk mengubah arah pertanyaan tersebut menjadi seperti ini:`,
              rule: `Aku memilih diam karena memang ingin menghadapi ini sendirian, atau aku hanya takut terlihat lemah dan membebani orang lain?`,
              body: `Jika kamu memang secara sadar memilih untuk menyelesaikan suatu urusan secara mandiri, itu adalah pilihan yang sepenuhnya sah dan patut dihormati. Namun, apabila kamu memilih bungkam hanya karena dicekam rasa takut dianggap rapuh atau merepotkan, ingatlah bahwa sesama manusia tidak akan pernah bisa memberikan bantuan yang tidak pernah kamu tunjukkan. Mereka tidak sedang berpura-pura buta terhadap keadaanmu; kamulah yang terlalu lihai dalam menyembunyikan setiap retakan yang ada. Khusus di hadapan orang-orang yang sudah kamu percayai, cobalah sesekali memosisikan dirimu sebagai pihak yang ditopang, bukan selalu menjadi penopang. Perlihatkan satu celah kecil yang rapuh. Langkah tersebut merupakan sebuah bentuk keterbukaan yang memberikan mereka kesempatan untuk hadir mendampingimu.`,
            },
            beat7: `Sifat kepedulianmu yang ajek dan menenangkan ini adalah salah satu aset terbaik di dalam dirimu. Sebuah rasa nyaman yang membuat siapa saja merasa terlindungi dan betah bertahan di dekatmu. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah keberanian untuk sesekali memperlihatkan sisi membutuhkanmu, agar orang yang tepat tahu kapan saatnya giliran mereka untuk menopangmu.

Begitu kamu berani membuka celah kecil itu, kamu akan mulai bisa menyaring dengan jelas siapa saja yang benar-benar menaruh kepedulian tulus, bukan sekadar memanfaatkan kenyamanan yang kamu tawarkan. Satu hal yang sangat berharga untuk selalu kamu ingat: kamu tidak perlu selalu tampil sempurna dan perkasa hanya untuk dianggap layak disayangi. Seseorang yang tepat bagi hidupmu akan memilih untuk bertahan bukan karena kamu selalu bersinar terang bagi mereka, melainkan karena mereka memiliki ketulusan untuk ikut bersinar bersama dalam mendekapmu.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `di Puncak Siang`,
        dimension: `Kemampuanmu menghidupkan suasana dan menjadi sumber energi bagi orang lain adalah karunia yang luar biasa. Tetapi cahaya yang menyala tanpa jeda menciptakan satu blind spot besar: kamu membuat orang terdekatmu kehabisan ruang teduh untuk sekadar beristirahat.`,
        feed: [`Gunung`, `Ladang`, `Samudra`, `Hujan`],
        drain: [`Matahari`, `Pelita`],
      },
      river: {
        siapaKamu: `Ketika seseorang mulai mengeluhkan masalahnya, kamu secara refleks langsung sibuk menyusun solusi dan mengambil alih keadaan, bahkan sebelum mereka selesai bercerita. Kamu merasa wajib bertanggung jawab atas kenyamanan semua orang di sekitarmu. Celakanya, saat energimu sendiri terkuras habis, kamu justru merasa asing dan canggung untuk menerima bantuan atau dirawat oleh orang lain.`,
        kenapaBegini: `Karakter dasarmu dikuasai elemen Api dalam kapasitas yang berlebihan. Api pada fitrahnya menerangi, tetapi di dalam baganmu, ia berkobar tanpa tombol untuk meredup, menjelma menjadi matahari di puncak siang yang konstan menyengat. Dorongan untuk selalu berkontribusi ini adalah kekuatan besarmu, namun ketiadaan jeda membuat orang-orang di sekitarmu kehilangan tempat bernaung, sekaligus perlahan membakar habis dirimu sendiri dari dalam.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu adalah orang yang selalu memberi: memastikan pasanganmu bahagia, memperbaiki suasana hatinya, hadir di setiap saat ia membutuhkanmu. Tetapi tanpa kamu sadari, kamu juga butuh mereka membutuhkanmu. Saat pasanganmu mulai bisa menyelesaikan sesuatu sendiri, kamu diam-diam merasa tergeser. Lalu saat ia meminta sedikit ruang, kamu pun bingung:` },
          bridge: [`Aku ngasih semuanya biar dia bahagia, aku selalu ada buat dia. Tapi kenapa makin aku kasih, dia malah kelihatan pengen sendiri? Apa salahnya pengen jadi orang yang bikin dia bahagia?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa kehangatan yang kamu berikan tanpa henti justru membuat orang yang kamu sayangi merasa perlu menjauh sejenak.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kebutuhanmu untuk selalu memberi justru membuat orang yang kamu sayangi tidak punya ruang untuk balik memberimu.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang bisa mengisimu kembali, dan mereka yang justru membuatmu terus membakar dirimu tanpa henti.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kamu memberi karena tulus, dan kapan karena butuh merasa dibutuhkan.` },
            ],
          },
          ocean: {
            beat1: `Kemampuan membuat orang lain merasa diperhatikan, terangkat, dan diterima adalah karunia yang tidak dimiliki semua orang. Tetapi mari jujur, kehangatan tanpa jeda memiliki bebannya sendiri. Matahari yang bersinar tanpa henti tidak memberi malam bagi siapa pun untuk beristirahat, termasuk bagi dirimu sendiri. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab dalam hidupmu:`,
              scenes: [
                `Seseorang datang bercerita, dan sebelum ia selesai, kamu sudah menawarkan solusi. Padahal kadang yang ia butuhkan hanyalah didengarkan.`,
                `Saat orang yang kamu sayangi mulai bisa mengatasi sesuatu tanpa bantuanmu, ada rasa kehilangan yang aneh, seakan-akan kamu tidak lagi sepenting dulu.`,
                `Kamu memberi terus-menerus, tetapi saat kamu sendiri lelah, kamu kesulitan membiarkan orang lain merawatmu. Menerima terasa lebih asing daripada memberi.`,
              ],
            },
            beat3: {
              body: `Kamu menunjukkan kasih sayang dengan cara terus memberi dan menjadi penyelamat. Sayangnya, di balik pemberian itu ada satu kebutuhan yang jarang kamu akui: kamu butuh dibutuhkan. Menjadi sumber kebahagiaan seseorang adalah caramu merasa berarti, sehingga saat mereka tidak lagi membutuhkanmu sebanyak dulu, rasanya seperti kehilangan tempatmu di hidup mereka.

Dengan selalu mengambil posisi sebagai pemberi tunggal, kamu diam-diam merampas kesempatan pasangan untuk balik merawatmu. Orang yang kamu sayangi kadang menjauh bukan karena kurang menghargaimu, melainkan karena hubungan yang hanya mengalir satu arah pada akhirnya melelahkan kedua belah pihak. Matahari yang terus bersinar tidak menyisakan malam, dan tanpa malam, tidak ada yang bisa merindukan pagi.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan sesama elemen Api, yaitu individu tipe Matahari atau Pelita. Kalian sama-sama ingin menjadi yang memberi, saling berebut peran menjadi pemberi solusi, tanpa ada yang bersedia sekadar dihangatkan. Langit yang dipenuhi dua matahari hanya akan mempercepat keduanya kehabisan bahan bakar.`,
              feed: `Bertemu dengan individu tipe Gunung atau Ladang yang kokoh, sehingga mereka bisa menerima kehangatanmu tanpa menjadi bergantung. Atau tipe Samudra atau Hujan yang punya kedalaman untuk membasuh kelelahanmu dan mengisi kembali energimu yang terkuras. Di dekat mereka, kamu belajar bahwa kamu tetap berharga bahkan saat sedang tidak memberi apa-apa.`,
              sign: `Tandanya sederhana. Pendamping yang tepat ingin balik merawatmu, dan merasa senang saat kamu mengizinkannya. Orang yang keliru akan terus menerima kehangatanmu tanpa pernah sekali pun bertanya siapa yang menghangatkanmu.`,
            },
            beat5: {
              explanation: `Grafik kelahiranmu menegaskan bahwa unsur Api menyala terlalu besar tanpa cukup unsur penyeimbang. Dominasi inilah yang memunculkan rasa gelisah dan bersalah setiap kali kamu tidak melakukan apa-apa. Bagan ini menunjukkan bahwa nilai dirimu tidak diukur dari seberapa berguna kamu bagi orang lain; kamu membutuhkan sesuatu yang mengimbangi, agar bisa bersinar dengan sehat tanpa menghanguskan diri sendiri.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Tahan keinginan untuk langsung memperbaiki keadaan atau menyelamatkan pasanganmu dari ketidaknyamanan. Saat dorongan itu muncul, gantilah pembenaran yang biasa kamu pakai dengan pertanyaan yang lebih jujur:`,
              rule: `Apakah aku memberi karena ia memang membutuhkannya sekarang, atau karena aku butuh merasa dibutuhkan olehnya?`,
              body: `Jika ia hanya butuh didengar, belajarlah untuk hadir tanpa langsung memperbaiki. Mengizinkan orang lain merawatmu bukan berarti kamu lemah. Nikmati pemberian mereka tanpa buru-buru merasa berutang budi, dan biarkan dirimu sesekali beristirahat dalam kehangatan yang disediakan orang lain.`,
            },
            beat7: `Jiwa penolong dan ketulusanmu untuk merangkul sesama adalah aset yang sangat bernilai, dan tidak semestinya kamu redupkan menjadi biasa-biasa saja. Kamu hanya perlu bijaksana membedakan antara ketulusan memberi dan kegelisahan yang takut kehilangan peran.

Sebab matahari yang paling menghidupkan bukanlah yang bersinar tanpa henti sampai membakar habis dirinya, melainkan yang tahu kapan harus terbenam demi memberikan malam, agar esok bisa terbit kembali dengan cahaya yang utuh. Saat kamu belajar untuk sesekali menerima, kamu akan menemukan bahwa orang yang tepat tidak hanya ingin dihangatkan olehmu. Mereka ingin menjadi tempat kamu pulang untuk menghangatkan diri.`,
          },
          closer,
        },
      },
    },
  },
};
