// ============================================================
// Site chrome + static page copy
// ============================================================
// Rule 20: ONE VOICE EVERYWHERE, INCLUDING CHROME. Every string here is
// user-facing, sits on the same audit surface as the reading itself, and is
// walked by scripts/check-copy.js.
//
// Kept as a bank rather than inlined in the JSX for the reason lib/render/copy.js
// states: a string that lives where it is used is a string nobody audits. It also
// keeps docs/content/_STATIC-STRINGS.md checkable against one file.
//
// THE ENTITY NAME IS NOT DUPLICATED HERE. Labels live in this bank, the name and
// address come from lib/site/entity.js, and the two are composed at render time.
// Two copies of a registered name is one copy too many: the NIB match is what the
// Xendit reviewer checks, and a drifted second copy would pass every test we have.
//
// EACH PAGE'S `meta` IS THE BROWSER-TAB TITLE AND THE SEARCH-RESULT SNIPPET, so it
// is user-facing and belongs here. It lived in the route files until 2026-08-03,
// where check-copy.js could not see it. Note what that move exposes: the titles use
// a MIDDLE DOT (U+00B7), which is not a keyboard character, and they pass only
// because the ban list covers dashes, curly quotes and the ellipsis rather than
// every non-keyboard glyph. The convention predates this file - `app/layout.js`'s
// root title uses it too - so it is left alone rather than quietly changed here.
//
// FORBIDDEN VOCABULARY, and this is commercial rather than cosmetic (rule 25):
// "ramalan", "nasib", "peruntungan" appear nowhere. The reviewer has to read this
// site as digital self-reflection content. Fortune telling is a restricted
// category for payment processors.
// ============================================================

export const SITE_COPY = {
  /**
   * The site footer. Renders on every route, so it is the only chrome the Xendit
   * reviewer is guaranteed to see no matter which page they land on. Visually
   * quiet on purpose: it is compliance chrome and it must not compete with the
   * one action on the page.
   */
  footer: {
    operatorLabel: 'Dioperasikan oleh',
    // No addressLabel. The registered address is deliberately not rendered - see
    // the comment at the removal site in components/SiteFooter.jsx.
    contactLabel: 'Kontak',
    // `Kontak` points into /tentang rather than at a page of its own. The address
    // and the number are NOT in the footer (Reyner, 08-05) but a reviewer scanning
    // for them needs a named path to where they are; "Tentang" alone does not read
    // as "contact details are in here".
    nav: [
      { href: '/harga', label: 'Harga' },
      { href: '/tentang', label: 'Tentang' },
      { href: '/tentang#kontak', label: 'Kontak' },
      { href: '/privasi', label: 'Privasi' },
      { href: '/syarat', label: 'Syarat' },
      { href: '/pengembalian', label: 'Pengembalian' },
    ],
  },

  /**
   * /harga — the product catalogue Xendit asks to see before checkout.
   *
   * NOT A PRICE LIST. No rupiah figure appears in this bank; every number on the
   * page is resolved from lib/pricing.js at render time. The two label strings
   * below are the only pricing copy, and which of them a row shows is decided by
   * isSellable() and by whether launch pricing is live, never by editing text.
   *
   * The free row leads. A reader who lands here from the footer before ever
   * seeing a reading must not conclude the reading costs money.
   */
  harga: {
    meta: {
      title: 'Harga - KATON',
      description:
        'Bacaan Katon gratis dan lengkap. Complete Edition dan Compatibility Reading adalah tambahan opsional.',
    },
    title: 'Harga',
    lead: 'Bacaan Katon gratis dan lengkap. Yang berbayar hanya tambahan, dan selalu ditawarkan setelah bacaanmu selesai.',

    launchLabel: 'harga peluncuran',
    listLabel: 'harga normal',
    soonLabel: 'segera',

    free: {
      name: 'Refleksi Katon',
      price: 'Gratis',
      body: 'Bacaan personal lengkap dari tanggal lahirmu, semua bagiannya terbuka. Tidak perlu akun dan tidak perlu bayar.',
    },

    artifact: {
      name: 'Complete Edition',
      body: 'Kartu resolusi tinggi dan PDF dari bacaanmu, siap disimpan atau dicetak.',
      // The purchase path, stated as steps, with the middle word linking to the
      // funnel. Xendit's criterion 2 asks for products purchasable via a checkout
      // flow; this page has no buy button because the real offer lives at the end
      // of the reading, so the path has to be legible here instead. The closing
      // sentence is the FREE-is-never-a-gate guarantee and is not optional.
      noteBefore: 'Beli lewat bacaanmu: ',
      noteLink: 'isi tanggal lahirmu',
      noteAfter:
        ', terima bacaan gratis, lalu tawarannya muncul di akhir. Melewatinya tidak mengurangi apa pun dari bacaan gratismu.',
    },

    compat: {
      // English product name, matching Complete Edition. Product names are an EN
      // tier layer (Reyner, 2026-08-03); body copy stays Indonesian.
      name: 'Compatibility Reading',
      body: 'Membaca pola antara kamu dan satu orang lain, dari dua tanggal lahir.',
      note: 'Belum bisa dibeli. Harganya kami tampilkan supaya kamu tahu lebih dulu.',
    },

    payment: 'Pembayaran memakai QRIS dan diproses oleh Xendit. Semua harga dalam rupiah, sekali bayar, tanpa langganan.',
    cta: 'Mulai dari bacaan gratis',
  },

  /**
   * /tentang — the business description.
   *
   * Written to be understood in about 30 seconds by someone who will not enter a
   * birthdate: what the product is, who it serves, the three steps, and who
   * receives the money. That last paragraph is the one the merchant reviewer is
   * actually looking for, so the entity name is composed in from ENTITY.
   */
  tentang: {
    meta: {
      title: 'Tentang - KATON',
      // Reworded when the metadata moved into the bank: the old description named
      // PT Katon Digital Nusantara as a literal, which is the entity-name
      // duplication this file exists to prevent.
      description: 'Apa itu Katon, untuk siapa, cara pakainya, dan siapa yang mengelolanya.',
    },
    title: 'Tentang Katon',
    lead: 'Katon membaca pola dari waktu kelahiranmu, dan menuliskannya sebagai satu bacaan yang bisa kamu pakai.',

    paragraphs: [
      'Katon memakai metode Empat Pilar, sistem klasik Tiongkok yang membaca tanggal dan jam kelahiran sebagai delapan komponen. Perhitungannya pasti: tanggal lahir yang sama selalu menghasilkan bagan yang sama. Yang Katon tulis dari bagan itu adalah pola caramu bekerja, bukan daftar kejadian yang akan datang.',
      'Katon dibuat untuk orang yang ingin mengenali dirinya dengan lebih tepat. Kenapa pola yang sama terus berulang, di bagian mana energimu habis, apa yang sebenarnya menenangkanmu. Tidak ada kuis dan tidak ada tebakan. Semuanya dihitung dari data kelahiran yang kamu masukkan.',
      // "tiga langkah" was dropped 2026-08-03: the paragraph lists four things, so
      // the count contradicted the content. "Sederhana" makes no promise to count.
      'Cara pakainya sederhana. Isi tanggal lahir, tambahkan jam lahir kalau kamu mengingatnya. Bacaanmu muncul lengkap dan gratis, dengan satu kartu yang bisa kamu simpan atau bagikan. Setelah itu ada tambahan berbayar yang bisa kamu ambil atau lewati: kartu resolusi tinggi dengan PDF. Compatibility Reading untuk dua orang sedang disiapkan.',
    ],

    // The contact block Xendit's second rejection asks for (address + contact
    // number). It lives HERE and not in the footer on Reyner's ruling 2026-08-05:
    // the footer stays quiet compliance chrome, and /tentang is the page a reviewer
    // already opens to understand the business. Labels only - every value is
    // composed in from lib/site/entity.js, so the NIB-matched address and the
    // number each exist once in the repo.
    kontakHeading: 'Kontak',
    kontakLead:
      'Untuk pertanyaan, permintaan soal datamu, atau kendala pembayaran, hubungi kami lewat salah satu dari ini.',
    kontakWhatsappLabel: 'WhatsApp',
    kontakEmailLabel: 'Email',
    kontakAddressLabel: 'Alamat terdaftar',

    operatorHeading: 'Siapa yang mengelola Katon',
    // Sentence 1 is split so ENTITY.name is composed in, never duplicated here.
    operatorBefore: 'Katon dioperasikan oleh',
    operatorAfter:
      ', badan usaha yang terdaftar di Kota Tangerang Selatan, Banten. Pembayaran diproses lewat QRIS oleh Xendit. Untuk pertanyaan apa pun, termasuk soal datamu, kirim email ke',
  },

  /**
   * /privasi — the privacy policy.
   *
   * EVERY FACTUAL CLAIM HERE WAS CHECKED AGAINST THE CODE ON 2026-08-03, not
   * recalled. Written that way because a privacy policy that overstates is a
   * worse liability than one that is plain:
   *
   * - collected fields: `app/api/reading/route.js` persists birth_date,
   *   birth_time, domain, term_side, gender (all nullable but birth_date);
   *   `lib/readingStore.js` setInvoice adds wa_number, invoice id, sku.
   * - gender is accepted by the API and is NOT collected by the UI today
   *   (`grep -n "gender" components/Funnel.jsx` -> no matches), so it is not
   *   listed as collected.
   * - no email is captured anywhere today, so none is claimed.
   * - no cookies, no storage, no analytics: `grep -rn
   *   "localStorage|sessionStorage|cookies()|document.cookie|gtag|analytics"
   *   app components lib` returns one code comment and nothing else.
   * - the LLM payload carries no identifier and no raw birth date
   *   (`lib/render/payload.js`; the Stage 3 semantic JSON has no date field).
   *
   * "Kami tidak pernah menyimpan data" is FORBIDDEN as a claim. We do store it,
   * on purpose, and the caching section says so in the reader's own interest.
   */
  privasi: {
    meta: {
      title: 'Privasi - KATON',
      description:
        'Apa yang Katon simpan, untuk apa, siapa yang ikut memproses, dan bagaimana kamu meminta datamu dihapus.',
    },
    title: 'Kebijakan Privasi',
    lead: 'Katon berjalan tanpa akun dan mengumpulkan sesedikit mungkin. Halaman ini menjelaskan apa yang kami simpan, kenapa, dan bagaimana kamu bisa meminta datamu dihapus.',
    updated: 'Berlaku sejak 3 Agustus 2026.',

    collectHeading: 'Data yang kami kumpulkan',
    collect: [
      'Tanggal lahir. Ini satu-satunya data yang wajib, karena tanpa itu tidak ada yang bisa dihitung.',
      'Jam lahir, kalau kamu mengisinya. Opsional, dan bacaanmu tetap utuh tanpa itu.',
      'Nomor WhatsApp, hanya kalau kamu membeli produk berbayar, untuk mengirimkan tautan bacaanmu.',
      'Catatan pembayaran dari Xendit: nomor invoice, jumlah, dan status. Kami tidak pernah menerima atau menyimpan nomor kartu maupun data akun bankmu.',
      'Log teknis dari penyedia hosting kami, termasuk alamat IP dan waktu akses. Ini bagian standar dari cara server bekerja.',
    ],
    collectNote:
      'Katon tidak meminta nama, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga.',

    purposeHeading: 'Untuk apa data itu dipakai',
    purpose: [
      'Menghitung bagan kelahiranmu dan menyusun bacaannya.',
      'Menyimpan hasilnya supaya kamu bisa membukanya lagi lewat tautan yang sama.',
      'Memproses pembayaran dan mengirimkan produk berbayar yang kamu beli.',
      'Menjaga layanan tetap sehat: membatasi penyalahgunaan dan memperbaiki kesalahan teknis.',
    ],

    cacheHeading: 'Bacaanmu disimpan, dan itu disengaja',
    cache: [
      'Bagan dan teks bacaanmu kami simpan. Dua alasannya menguntungkanmu. Pertama, tautan bacaanmu tetap bisa dibuka lain hari. Kedua, tanggal lahir yang sama selalu menghasilkan bacaan yang sama, jadi bacaanmu tidak berubah setiap kali dibuka.',
      'Konsekuensinya jujur kami sebut: data kelahiranmu memang tersimpan di basis data kami. Kalau kamu tidak ingin itu terjadi, jangan mengisi formulirnya, atau minta penghapusan setelahnya lewat cara di bawah.',
    ],

    processorHeading: 'Pihak lain yang ikut memproses',
    processorLead:
      'Katon memakai beberapa penyedia layanan. Masing-masing hanya menerima bagian yang dibutuhkan untuk tugasnya.',
    processors: [
      'Supabase, untuk basis data tempat bagan dan bacaanmu disimpan.',
      'Vercel, untuk hosting situs ini dan log teknisnya.',
      'Xendit, untuk pembayaran QRIS. Data pembayaranmu diproses di sistem mereka, bukan di sistem kami.',
      'Penyedia model bahasa untuk menyusun teks bacaan: Google (Gemini) sebagai utama, dengan OpenAI sebagai cadangan bila diperlukan. Yang dikirim ke penyedia ini adalah hasil hitungan bagan, tanpa tanggal lahir mentah, tanpa nama, tanpa email, dan tanpa nomor WhatsApp.',
    ],
    // The middle sentence is the UU PDP cross-border transfer clause, added by
    // Reyner 2026-08-03 in his own words. It rests on the four providers' standard
    // terms, which incorporate data-processing terms for every customer - so it is
    // true by incorporation rather than by a signed bilateral DPA. If any provider
    // is ever swapped for one without those terms, this sentence becomes false.
    processorNote:
      'Sebagian penyedia ini menyimpan datanya di luar Indonesia. Penyedia ini terikat perjanjian pemrosesan data dan standar keamanan masing-masing. Kami tidak menjual datamu dan tidak menyerahkannya ke pihak lain untuk iklan, dalam keadaan apa pun.',

    retentionHeading: 'Berapa lama disimpan',
    retention: [
      'Bagan dan bacaan: selama Katon masih berjalan, supaya tautanmu tetap bisa dibuka.',
      'Nomor WhatsApp: selama catatan pembayaran yang terkait masih kami simpan.',
      'Catatan pembayaran: lebih lama, karena pembukuan dan pajak mewajibkannya.',
    ],

    rightsHeading: 'Hakmu atas datamu',
    // DO NOT "FIX" `Pelindungan` TO `Perlindungan`. It looks like a typo and is
    // not one: `Pelindungan Data Pribadi` is the official title of UU 27/2022 as
    // enacted. Changing it misquotes the statute this clause cites. Confirmed
    // against the law's title and ruled by Reyner 2026-08-03.
    rightsLead:
      'Hak-hak ini mengikuti Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
    rights: [
      'Meminta salinan data yang kami simpan tentangmu.',
      'Meminta koreksi kalau ada yang salah.',
      'Meminta penghapusan bacaan dan data kelahiranmu.',
      'Menarik persetujuanmu atas pemrosesan data, ke depan.',
    ],
    rightsHowBefore:
      'Kirim email ke',
    rightsHowAfter:
      '. Sertakan tautan bacaanmu, karena Katon tidak memakai akun dan tautan itulah satu-satunya cara kami menemukan datamu. Permintaan penghapusan kami jalankan paling lama 14 hari kerja setelah kami terima, kecuali bagian yang wajib kami simpan untuk pembukuan.',

    changesHeading: 'Kalau kebijakan ini berubah',
    changes:
      'Perubahan akan ditulis di halaman ini, dengan tanggal berlakunya yang baru. Kami tidak akan memakai data yang sudah terkumpul untuk tujuan baru yang tidak dijelaskan di sini tanpa memberi tahu lebih dulu.',
  },

  /**
   * /syarat — terms of service.
   *
   * The "Batas layanan" section is rule 25 turned into a user-facing disclaimer.
   * It is the clause a payment reviewer reads to decide what category this
   * merchant belongs to, so it states the boundary plainly rather than burying it:
   * no medical, financial or legal advice, and the reader keeps the decision.
   */
  syarat: {
    meta: {
      title: 'Syarat Layanan - KATON',
      description:
        'Syarat pemakaian Katon: layanan konten digital, batas layanan, produk berbayar, dan hukum yang berlaku.',
    },
    title: 'Syarat Layanan',
    lead: 'Dengan memakai Katon, kamu setuju dengan syarat di halaman ini. Isinya singkat karena layanannya juga sederhana.',
    updated: 'Berlaku sejak 3 Agustus 2026.',

    serviceHeading: 'Tentang layanan ini',
    serviceBefore: 'Katon adalah layanan konten digital yang dioperasikan oleh',
    serviceAfter:
      '. Katon menghitung bagan kelahiran dengan metode Empat Pilar dan menyusunnya menjadi satu bacaan. Semuanya berjalan di dalam situs ini. Tidak ada barang fisik yang dikirim.',

    freeHeading: 'Bacaan gratis',
    free: 'Bacaan utama Katon gratis, terbuka seluruhnya, dan tidak memerlukan akun. Kami boleh membatasi jumlah permintaan dari satu pengguna atau satu jaringan bila diperlukan untuk menjaga layanan tetap berjalan.',

    paidHeading: 'Produk berbayar',
    paid: [
      'Produk berbayar Katon adalah barang digital. Daftar dan harganya ada di halaman Harga.',
      'Pesananmu berlaku setelah pembayaran dikonfirmasi oleh Xendit. Sebelum konfirmasi itu masuk, belum ada pesanan yang berjalan.',
      'Setelah dikonfirmasi, produkmu tersedia di tautan bacaanmu, dan tautannya kami kirim ke nomor WhatsApp yang kamu masukkan saat pembayaran. Pastikan nomornya benar, karena itu satu-satunya alamat yang kami punya.',
      'Harga yang berlaku adalah harga yang tampil saat kamu membayar. Harga peluncuran berlaku untuk periode tertentu dan bisa berakhir tanpa pemberitahuan, tetapi tidak pernah berubah untuk pesanan yang sudah dibayar.',
    ],

    limitsHeading: 'Batas layanan',
    limits: [
      'Katon bukan nasihat medis, keuangan, atau hukum, dan tidak menggantikan tenaga profesional di bidang itu. Kalau kamu sedang menghadapi persoalan kesehatan, keuangan, atau hukum, temui orang yang berwenang untuk itu.',
      'Bacaan Katon adalah bahan refleksi. Ia menggambarkan pola, bukan kepastian tentang kejadian yang akan datang, dan tidak menjanjikan hasil apa pun. Keputusan atas hidupmu tetap milikmu sepenuhnya.',
      'Katon untuk pengguna berusia 17 tahun atau lebih. Di bawah itu, perlu izin orang tua atau wali.',
    ],

    conductHeading: 'Yang tidak boleh dilakukan',
    conduct: [
      'Mengambil isi Katon secara massal atau otomatis, termasuk dengan alat pengambil data.',
      'Menjual kembali, menyalin, atau menerbitkan ulang isi bacaan sebagai produkmu sendiri.',
      'Mencoba mengakses bacaan orang lain, atau bagian sistem yang tidak ditujukan untuk umum.',
    ],
    conductNote:
      'Bacaanmu sendiri milikmu untuk dipakai dan dibagikan sesukamu. Yang kami batasi adalah pengambilan isi Katon secara massal.',

    liabilityHeading: 'Tanggung jawab',
    liability:
      'Kami berusaha menjaga Katon tetap berjalan dan hitungannya benar, tetapi layanan ini disediakan apa adanya. Bila terjadi kesalahan pada produk berbayar, tanggung jawab kami terbatas pada perbaikan produk itu atau pengembalian dananya, sesuai halaman Pengembalian.',

    lawHeading: 'Hukum yang berlaku',
    lawBefore: 'Syarat ini diatur oleh hukum Republik Indonesia. Bila ada perselisihan, kami akan menyelesaikannya lebih dulu secara musyawarah lewat email ke',
    lawAfter: '. Kalau tidak selesai, penyelesaiannya mengikuti hukum yang berlaku di Indonesia.',
  },

  /**
   * /pengembalian — the refund policy.
   *
   * TERMS CONFIRMED BY REYNER 2026-08-03: claim window 7 days from payment,
   * reply within 3 hari kerja.
   *
   * THE CLAIM WINDOW IS ONE CONSTANT, `claimWindowDays`. It is stated twice on the
   * page - once as the deadline to file, once as the cutoff that makes a working
   * product non-refundable - and two hand-written copies of the same number is how
   * a policy ends up contradicting itself. The strings carry a `{claimDays}`
   * placeholder that app/pengembalian/page.js fills in.
   *
   * THE SCOPE IS DELIVERY AND DEFECT, NEVER DISSATISFACTION. "Tidak puas dengan
   * isi bacaan" is unbounded for a content product: the content is computed from
   * the reader's own input and cannot be re-adjudicated, so a satisfaction refund
   * would be a promise with no floor. The page says so plainly instead of hiding
   * it, and pairs it with a real remedy: we fix the file first, and refund if we
   * cannot.
   */
  pengembalian: {
    meta: {
      title: 'Pengembalian Dana - KATON',
      description:
        'Kapan dana produk berbayar Katon bisa dikembalikan, apa yang tidak tercakup, dan cara mengajukannya.',
    },
    title: 'Kebijakan Pengembalian Dana',
    lead: 'Produk berbayar Katon adalah barang digital. Halaman ini menjelaskan kapan dananya bisa dikembalikan dan bagaimana cara mengajukannya.',
    updated: 'Berlaku sejak 3 Agustus 2026.',

    /** Days from payment to file a claim. Substituted for `{claimDays}` below. */
    claimWindowDays: 7,

    freeHeading: 'Bacaan gratis',
    free: 'Bacaan utama Katon gratis, jadi tidak ada pembayaran dan tidak ada yang perlu dikembalikan.',

    eligibleHeading: 'Yang bisa dikembalikan',
    eligibleLead:
      'Kami mengembalikan dana penuh kalau produk yang kamu bayar tidak sampai atau tidak bisa dipakai:',
    eligible: [
      'Pembayaranmu sudah dikonfirmasi, tetapi produknya tidak pernah tersedia.',
      'Filenya rusak, tidak bisa dibuka, atau tidak lengkap.',
      'Yang kamu terima bukan bacaanmu, misalnya kartu atau PDF dari bagan orang lain.',
      'Kamu membayar dua kali untuk pesanan yang sama.',
    ],
    // Names the cases rather than counting them. The old wording said "tiga keadaan
    // pertama", which was correct only for the current bullet order: add or reorder
    // one and the sentence goes silently wrong, and no test can catch a positional
    // reference between two pieces of prose. A double charge is deliberately not in
    // this list - there is nothing to repair, so it goes straight to a refund.
    eligibleNote:
      'Kalau produknya rusak, tidak lengkap, atau bukan bacaanmu, kami coba perbaiki dan kirim ulang lebih dulu. Kalau perbaikannya gagal, dananya kami kembalikan penuh.',

    notEligibleHeading: 'Yang tidak bisa dikembalikan',
    notEligible: [
      'Isi bacaan yang tidak sesuai harapanmu. Isinya dihitung dari data kelahiran yang kamu masukkan, dan tidak bisa dinilai ulang sebagai cacat produk.',
      'Tanggal atau jam lahir yang kamu masukkan salah. Kalau ini terjadi, hubungi kami: kami akan mencoba menghitung ulang untukmu, dan itu biasanya lebih cepat daripada pengembalian dana.',
      'Produk yang sudah kamu terima dan bisa kamu buka, lalu diminta kembali setelah lewat {claimDays} hari.',
    ],

    howHeading: 'Cara mengajukan',
    howLead: 'Ajukan paling lambat {claimDays} hari setelah pembayaran. Kirim email dan sertakan tiga hal:',
    how: [
      'Tautan bacaanmu. Ini penanda utamanya, karena Katon tidak memakai akun.',
      'Bukti pembayaran atau nomor invoice dari Xendit.',
      'Apa yang bermasalah, sesingkat mungkin.',
    ],
    replyHeading: 'Berapa lama kami menjawab',
    reply: [
      // "3 hari kerja", not "3x24 jam kerja". The old phrasing mixed calendar hours
      // with business days, which is the sort of ambiguity a customer argues about.
      'Kami menjawab paling lama 3 hari kerja setelah emailmu masuk.',
      'Kalau permintaanmu disetujui, dana dikembalikan ke sumber pembayaran yang sama. Waktu tibanya tergantung bank atau penyedia dompet digitalmu, dan biasanya beberapa hari kerja.',
    ],
    contactBefore: 'Kirim ke',
    contactAfter: '. Satu email cukup, tidak perlu formulir.',
  },
};
