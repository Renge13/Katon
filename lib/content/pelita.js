import { hourExplanation, closer, BEAT_HEADINGS } from './shared.js';

/** @type {import('./schema').Archetype} */
export const pelita = {
  stem: '丁',
  archetypeName: 'PELITA',
  dayMasterChinese: '丁',
  dayMasterElement: 'Fire',
  states: {
    balanced: {
      card: {
        modifier: `Pijar Setia`,
        dimension: `Kamu tahu ada yang salah bahkan sebelum orang lain membuka mulut. Kamu menangkap hal-hal kecil yang orang lain lewatkan: nada yang sedikit berubah, jeda yang terlalu lama, senyum yang tidak sampai ke mata. Kamu menerangi semua orang dari satu titik yang justru paling gelap: tepat di belakang nyalamu sendiri, tempat yang tidak pernah sempat kamu lihat.`,
        feed: [`Jati`, `Akar`],
        drain: [`Samudra`, `Hujan`],
      },
      river: {
        siapaKamu: `Coba ingat kapan terakhir kali kamu tahu temanmu sedang sedih hanya dari perubahan kecil caranya membalas chat, lalu kamu yang lebih dulu bertanya, "kamu kenapa?"

Itulah dirimu. Kamu punya radar emosional yang luar biasa peka. Kamu menangkap apa yang tersirat dan paham apa yang tidak terucap. Orang-orang merasa benar-benar dilihat dan dimengerti saat bersamamu, karena kamu tahu apa yang mereka butuhkan bahkan sebelum mereka sempat memintanya.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Api, tapi bukan api unggun besar yang membakar dan menerangi seluruh ruangan sekaligus. Kamu adalah nyala lilin kecil yang tenang dan fokus, seperti pelita: cahayamu jatuh tepat pada apa yang perlu dilihat. Karena porsinya seimbang, nyalamu setia dan awet tanpa menghanguskan dirimu sendiri. Kepekaan ini kekuatan terbesarmu, sekaligus alasan kenapa kamu sering kehabisan tenaga sendirian.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu pembaca situasi terbaik. Kamu tahu pasanganmu lelah sebelum dia mengeluh, dan kamu hafal setiap detail kecil tentang mereka. Kamu mencintai lewat cara memperhatikan. Sialnya, karena kamu bisa membaca orang lain begitu jelas, kamu mengira mereka juga bisa membacamu sebaik itu. Kenyataannya jarang begitu. Orang yang kamu perhatikan sedetail itu hampir tidak pernah menanyakan kabarmu dengan kedalaman yang sama. Dan kamu pun berakhir menyimpan satu keluhan sunyi:` },
          bridge: [`Kenapa saat aku yang sedang tidak baik-baik saja, tidak ada satu orang pun yang menyadarinya? Apa aku terlalu sibuk melihat orang lain, sampai lupa membiarkan diriku terlihat?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal kenapa kemampuanmu membaca semua orang justru membuatmu paling sering merasa tidak terlihat. Ini bukan karena orang-orang di sekitarmu egois, dan bukan karena kamu menuntut terlalu banyak.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan kenapa kemampuanmu membaca orang lain justru membuatmu paling sering merasa tidak terlihat.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang ikut memperhatikanmu balik, dan mereka yang cuma menikmati cahayamu lalu pergi.` },
              { title: BEAT_HEADINGS[6], helper: `Satu cara tahu kamu memperhatikan karena tulus, atau karena takut membiarkan diri terlihat.` },
            ],
          },
          ocean: {
            beat1: `Kemampuanmu melihat orang lain sedalam itu bakat yang langka. Kamu memberi mereka kemewahan untuk dimengerti tanpa perlu repot menjelaskan. Tapi mari jujur: kepekaan ini juga beban yang kamu pilih sendiri. Melihat segalanya berarti kamu menyerap segalanya, dan selama ini kamu tidak tahu cara mematikan radar itu sejenak untuk beristirahat. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini pasti sering kamu alami:`,
              scenes: [
                `Kamu langsung tahu suasana hati seseorang berubah hanya dari nada bicara atau pilihan kata di chat, lalu kamu ikut memikirkannya seharian.`,
                `Kamu hafal luar kepala semua ketakutan dan kesukaan orang terdekatmu, tapi ragu apakah ada dari mereka yang tahu isi hatimu tanpa perlu kamu beri tahu lebih dulu.`,
                `Kamu lebih nyaman menjadi penanya. Begitu obrolan mulai bergeser ke dirimu, kamu refleks melempar topiknya kembali ke mereka.`,
              ],
            },
            beat3: {
              body: `Penyebabnya bukan karena orang di sekitarmu egois, dan bukan karena kamu menuntut terlalu banyak. Masalahnya ada pada arah cahayamu sendiri.

Pelita menerangi apa yang ada di depannya, bukan dirinya sendiri. Kamu menyorot seluruh perhatianmu ke luar, sampai kamu berdiri di titik paling gelap, tepat di belakang nyala lampu. Karena kamu selalu terlihat tegar dan tidak pernah menunjukkan celah, orang lain menganggap kamu baik-baik saja dan tidak butuh diperhatikan.

Lama-kelamaan terbentuk pola yang sunyi. Kamu menerangi semua orang, sementara bagian dirimu yang ingin dimengerti tetap tinggal dalam gelap. Kepedulianmu berjalan satu arah, karena kamu sendiri yang menolak untuk terlihat.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan tipe Samudra atau Hujan yang datang dengan gelombang emosi yang luas dan dalam. Radarmu otomatis bekerja ekstra keras untuk menampung seluruh dunia mereka. Masalahnya, ruang perasaan mereka terlalu besar sampai suaramu yang kecil makin tenggelam. Kamu kehabisan tenaga karena terus menerangi kedalaman mereka, sementara cahayamu sendiri meredup tanpa ada yang menyadari.`,
              feed: `Bertemu tipe Jati atau Akar yang punya akar kokoh dan arah yang jelas. Mereka tidak cuma menumpang di cahayamu; mereka akan balik memperhatikanmu dan menanyakan kabarmu dengan sungguh-sungguh. Di dekat mereka, kamu bisa berhenti sejenak jadi pengamat, karena tahu ada yang dengan sukarela ikut menjagamu.`,
              sign: `Tandanya sederhana. Orang yang tepat akan sadar saat cahayamu meredup, bahkan sebelum kamu bilang. Orang yang keliru baru sadar setelah lampumu mati total.`,
            },
            beat5: {
              explanation: `Perhatikan sebaran angka pada grafikmu. Unsur Api-mu hadir stabil dan seimbang. Kamu punya bahan bakar yang cukup untuk bertahan lama tanpa membuat dirimu hangus. Keseimbangan ini berkah, tapi ia pula yang membuat orang di sekitarmu lupa bahwa nyala yang menerangi mereka itu tetap butuh dijaga supaya tidak padam sendirian.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Lain kali saat kamu tergoda mengalihkan pembicaraan kembali ke orang lain begitu seseorang menanyakan kabarmu, berhenti sejenak. Tanyakan ini pada dirimu:`,
              rule: `Aku mengalihkan obrolan ini karena memang mau mendengarkan dia, atau karena aku takut kalau aku jujur, ternyata dia tidak benar-benar peduli?`,
              body: `Kalau kamu memang ingin hadir untuk orang lain, lakukan dengan tenang; memperhatikan adalah caramu mencintai, dan itu indah. Tapi kalau kamu bersembunyi karena takut kecewa, ingat ini: orang lain tidak akan bisa membaca apa yang sengaja kamu bungkus rapat. Berhentilah menuntut orang lain menjadi cenayang. Khusus di depan orang yang sudah kamu percayai, mulailah membuka sedikit celah dan tunjukkan bahwa kamu juga butuh didengar.`,
            },
            beat7: `Kepekaanmu adalah hal yang indah, dan dunia butuh lebih banyak orang yang bisa melihat sesamanya sedalam itu. Kamu hanya perlu belajar membedakan mana kepedulian yang tulus, dan mana strategi ego untuk bersembunyi di balik peran "si paling mengerti".

Nyala yang menerangi orang lain pun tetap butuh tangan yang melindunginya dari angin. Membiarkan dirimu dilihat bukan tanda kamu lemah; itu satu-satunya cara agar cahayamu tidak padam sendirian. Dan orang yang tepat tidak akan datang hanya untuk menikmati terangmu. Mereka akan tinggal untuk memastikan nyalamu tetap hidup.`,
          },
          closer,
        },
      },
    },
    amplified: {
      card: {
        modifier: `Melalap Sumbu`,
        dimension: `Kamu membaca kode dan dinamika batin orang lain dengan ketajaman yang jarang dimiliki. Tetapi ketidakmampuanmu untuk mematikan radar itu menciptakan satu blind spot besar: kamu kehabisan energi karena sibuk membenahi perasaan yang sebetulnya tidak perlu kamu urusi. Nyala yang menerangi paling terang adalah nyala yang paling cepat melalap sumbunya sendiri.`,
        feed: [`Gunung`, `Ladang`, `Samudra`, `Hujan`],
        drain: [`Matahari`, `Pelita`],
      },
      river: {
        siapaKamu: `Saat pasanganmu berkata "aku tidak apa-apa", kamu secara otomatis sudah menangkap beberapa hal yang ia sembunyikan di balik kalimat itu. Sebelum ia selesai bicara, kamu sudah sibuk menyusun cara memulihkan suasana hatinya.

Itulah dirimu. Kamu punya kapasitas langka untuk menangkap apa yang tersirat dan memahami yang tidak terucap. Kepekaan ini membuat orang merasa benar-benar dimengerti saat bersamamu. Tetapi kamu juga tidak tahu cara berhenti memproses semua yang kamu tangkap.`,
        kenapaBegini: `Karakter dasarmu berakar pada elemen Api, tipe nyala lilin yang fokus dan terarah, bukan api besar yang membakar sembarangan. Masalahnya, porsi Api ini terlalu mendominasi baganmu, sehingga nyalanya melesat terlalu tinggi. Kamu tidak lagi sekadar menerangi, melainkan terus-menerus mengamati. Ketika pelita dipaksa menyala sekencang lampu sorot, ia akan melalap sumbunya sendiri jauh sebelum waktunya.`,
      },
      domains: {
        hubungan: {
          river: { keMana: `Dalam hubungan, kamu selalu tiga langkah di dalam batin pasanganmu: membaca suasana hatinya, memikirkan yang ia khawatirkan, memecahkan masalah yang belum ia sadari. Bagimu, itulah bentuk cinta. Masalahnya, diperhatikan sedetail itu lama-kelamaan terasa seperti terus diamati, sampai pasanganmu tidak lagi punya ruang untuk sekadar diam tanpa dibaca. Sementara kamu sendiri kehabisan tenaga karena tidak pernah mematikan nyala itu. Lalu saat ia menarik diri sedikit, kamu pun bingung:` },
          bridge: [`Aku cuma pengen ngerti dia sepenuhnya, tahu apa yang dia butuhin sebelum dia minta. Tapi kenapa makin aku ngerti dia, dia malah kelihatan pengen ruang sendiri? Apa salahnya peduli sedetail itu?`],
          paywallTeaser: {
            lead: `Ada alasan yang masuk akal mengapa kepekaan yang kamu maksudkan sebagai cinta justru membuat pasanganmu merasa terus diamati, sekaligus membuatmu kehabisan tenaga sendirian.`,
            accordion: [
              { title: BEAT_HEADINGS[3], helper: `Alasan mengapa kemampuanmu membaca segalanya justru membakar habis tenagamu sendiri.` },
              { title: BEAT_HEADINGS[4], helper: `Tipe yang membiarkan radarmu beristirahat, dan mereka yang justru membuatmu terus membaca tanpa henti.` },
              { title: BEAT_HEADINGS[6], helper: `Panduan untuk mengenali kapan kepekaanmu adalah bentuk cinta, dan kapan ia hanyalah caramu menghindari rasa tidak berdaya.` },
            ],
          },
          ocean: {
            beat1: `Kemampuan memahami orang sedalam itu adalah karunia yang langka. Kamu memberi mereka kemewahan untuk dimengerti tanpa perlu menjelaskan. Tetapi mari jujur, melihat segalanya berarti tidak pernah bisa berhenti melihat, dan nyala yang tidak pernah diredupkan akan membakar sumbunya sendiri. Di sinilah letak kelelahan yang selama ini sulit kamu jelaskan.`,
            beat2: {
              intro: `Situasi ini mungkin terasa akrab dalam hidupmu:`,
              scenes: [
                `Seseorang berkata ia baik-baik saja, dan kamu sudah tahu itu tidak benar. Kamu langsung memikirkan apa yang salah dan bagaimana membantunya, bahkan saat ia belum meminta apa pun.`,
                `Kamu menangkap setiap perubahan kecil pada orang yang kamu sayangi, lalu terus memikirkannya, sampai masalah mereka menjadi sesuatu yang kamu bawa terus di kepalamu.`,
                `Kamu sibuk membaca dan memahami semua orang, tetapi saat kamu sendiri lelah, kamu kesulitan berhenti, seakan-akan mematikan radarmu adalah sesuatu yang tidak kamu izinkan.`,
              ],
            },
            beat3: {
              body: `Kamu mengira bahwa membaca batin pasangan sampai ke bagian terkecil adalah bentuk kepedulian yang tertinggi. Nyatanya, terus-menerus diamati dan dianalisis membuat pasanganmu merasa kehilangan ruang pribadi. Mereka tidak lagi punya tempat untuk sekadar merasa biasa saja tanpa kamu timbang maknanya.

Kepekaan yang sama yang membuat cintamu begitu dalam adalah kepekaan yang tidak punya tombol untuk berhenti. Kamu tidak bisa memilih untuk tidak melihat, jadi kamu terus membaca, terus menganalisis, terus memikirkan setiap orang yang kamu sayangi, sampai nyalamu sendiri terkuras.

Ini bagian yang paling sulit diterima: nyala yang menerangi semua orang adalah nyala yang membakar sumbunya sendiri paling dulu. Kamu memberi begitu banyak pemahaman kepada orang lain sampai tidak ada lagi yang tersisa untuk menerangi dirimu sendiri.`,
              pull: ``,
            },
            beat4: {
              drain: `Berdampingan dengan sesama elemen Api, yaitu individu tipe Matahari atau Pelita. Bersama sesama Pelita, kalian sibuk saling membaca tanpa henti sampai tidak ada sudut yang tenang untuk bernapas. Bersama Matahari yang butuh terus bersinar, sumbumu akan terbakar habis menopang cahayanya yang tidak mau kalah terang. Keduanya membuat nyalamu terkuras lebih cepat.`,
              feed: `Bertemu dengan individu tipe Gunung atau Ladang yang tenang dan tidak penuh tanda untuk kamu baca, sehingga radarmu akhirnya bisa beristirahat. Atau tipe Samudra atau Hujan yang cukup dalam untuk memikul beban perasaannya sendiri, sehingga kamu tidak perlu terus-menerus menangkap dan memperbaikinya. Di dekat mereka, kamu belajar bahwa kamu boleh berhenti melihat sejenak, dan tetap dicintai bahkan saat radarmu sedang mati.`,
              sign: `Tandanya sederhana. Pendamping yang tepat menyadari saat nyalamu mulai redup, dan memintamu beristirahat. Orang yang keliru akan terus menikmati caramu memahami mereka tanpa pernah bertanya siapa yang memahamimu.`,
            },
            beat5: {
              explanation: `Grafik kelahiranmu menunjukkan unsur Api yang menyala besar, jauh melampaui unsur lain yang seharusnya sesekali memberimu jeda untuk meredup. Inilah sumber kepekaanmu yang luar biasa, sekaligus alasan mengapa kamu begitu sulit berhenti melihat dan memikirkan orang lain. Nyala sebesar ini terus mencari sesuatu untuk diterangi, dan saat tidak ada lagi, ia mulai melalap sumbunya sendiri. Bagan ini menunjukkan bahwa kepekaanmu bukanlah sesuatu yang salah, melainkan tanda bahwa nyala sebesar itu membutuhkan sesuatu yang mengimbanginya, agar kamu bisa menerangi tanpa menghabiskan dirimu sendiri.`,
              hourNote: hourExplanation,
            },
            beat6: {
              lead: `Saat kamu menangkap sinyal dari pasanganmu dan dorongan untuk langsung memikirkan atau memperbaikinya muncul, tahan diri sejenak. Pertanyaan yang biasanya tebersit di benakmu adalah, "Bukankah memperhatikan sedetail ini justru bukti aku mencintainya?" Mulai hari ini, cobalah mengubahnya menjadi:`,
              rule: `Apakah ia memang butuh aku menangkap dan memperbaiki ini sekarang, atau aku hanya tidak tahan membiarkan sesuatu terlihat dan tidak tertangani?`,
              body: `Jika ia memang membutuhkan pemahamanmu, maka berikanlah sepenuhnya. Itulah saat kepekaanmu menjadi karunia yang paling berharga. Tetapi jika kamu terus membaca hanya karena tidak tahan diam, ingatlah bahwa membiarkan sesuatu apa adanya, tanpa langsung kamu bedah, bukan berarti kamu kurang peduli. Kadang orang yang kamu sayangi hanya ingin didampingi, bukan diteliti. Sesekali, redupkan nyalamu dengan sengaja, dan izinkan dirimu menjadi pihak yang diperhatikan untuk sesaat.`,
            },
            beat7: `Kepekaan dan empatimu yang dalam adalah salah satu hal paling berharga di dalam dirimu. Kemampuan untuk memahami orang sedalam itu, untuk melihat apa yang tidak terlihat orang lain, adalah karunia yang langka. Itu bukan sesuatu yang perlu kamu tumpulkan menjadi biasa-biasa saja demi membuat orang lain nyaman. Satu-satunya pelajaran besar yang perlu kamu kuasai hanyalah membedakan kapan kamu memperhatikan karena tulus, dan kapan karena tidak tahan membiarkan sesuatu tidak tertangani.

Begitu kamu bisa membedakan keduanya, kepekaanmu akan berhenti menjadi sesuatu yang membakar habis dirimu, dan mulai menjadi sesuatu yang bisa kamu jaga tetap menyala lama. Sebab pelita yang paling bernilai bukanlah yang menyala paling terang dalam semalam, melainkan yang tahu kapan harus meredup agar cahayanya tetap menerangi sampai esok hari. Saat kamu belajar untuk sesekali beristirahat, kamu akan menemukan bahwa orang yang tepat tidak hanya ingin kamu mengerti mereka. Mereka juga ingin belajar mengerti kamu, jika saja kamu mengizinkan dirimu terlihat.`,
          },
          closer,
        },
      },
    },
  },
};
