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
    addressLabel: 'Alamat terdaftar',
    contactLabel: 'Kontak',
    nav: [
      { href: '/harga', label: 'Harga' },
      { href: '/tentang', label: 'Tentang' },
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
      note: 'Ditawarkan setelah bacaan gratismu selesai. Bukan syarat untuk membaca apa pun.',
    },

    compat: {
      name: 'Bacaan Kompatibilitas',
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
    title: 'Tentang Katon',
    lead: 'Katon membaca pola dari waktu kelahiranmu, dan menuliskannya sebagai satu bacaan yang bisa kamu pakai.',

    paragraphs: [
      'Katon memakai metode Empat Pilar, sistem klasik Tiongkok yang membaca tanggal dan jam kelahiran sebagai delapan komponen. Perhitungannya pasti: tanggal lahir yang sama selalu menghasilkan bagan yang sama. Yang Katon tulis dari bagan itu adalah pola caramu bekerja, bukan daftar kejadian yang akan datang.',
      'Katon dibuat untuk orang yang ingin mengenali dirinya dengan lebih tepat. Kenapa pola yang sama terus berulang, di bagian mana energimu habis, apa yang sebenarnya menenangkanmu. Tidak ada kuis dan tidak ada tebakan. Semuanya dihitung dari data kelahiran yang kamu masukkan.',
      'Cara pakainya tiga langkah. Isi tanggal lahir, tambahkan jam lahir kalau kamu mengingatnya. Bacaanmu muncul lengkap dan gratis, dengan satu kartu yang bisa kamu simpan atau bagikan. Setelah itu ada dua tambahan berbayar yang bisa kamu ambil atau lewati: kartu resolusi tinggi dengan PDF, dan bacaan kompatibilitas untuk dua orang.',
    ],

    operatorHeading: 'Siapa yang mengelola Katon',
    // Sentence 1 is split so ENTITY.name is composed in, never duplicated here.
    operatorBefore: 'Katon dioperasikan oleh',
    operatorAfter:
      ', badan usaha yang terdaftar di Kota Tangerang Selatan, Banten. Pembayaran diproses lewat QRIS oleh Xendit. Untuk pertanyaan apa pun, termasuk soal datamu, kirim email ke',
  },
};
