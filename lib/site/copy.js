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
      // REYNER-APPROVED 2026-08-06, INTERIM, and it closes the last surface the
      // 08-05 copy set missed. It read "Bacaan Katon gratis dan lengkap. Complete
      // Edition dan Compatibility Reading adalah tambahan opsional." - both dead
      // claims at once, on the browser-tab description and the search-result
      // snippet, which is the one user-facing string a reviewer can reach without
      // loading the page.
      //
      // DELIBERATELY NOT A COPY OF `lead`. The visible lead was the other candidate
      // and Reyner ruled against it: a snippet that clones the first line the reader
      // then sees wastes the slot. This one says what the product is and what the
      // paid tier costs the reader in commitment, which the lead does not.
      // RESTORED 2026-08-23 with the promotion. This is the string the 08-06 edit
      // replaced, and it was replaced for one reason: it named `Complete Edition`
      // when the paid path delivered a 7-beat deep read with no card and no PDF in
      // it. The card and the PDF ship in this commit, so the claim is true again.
      // THE RESTORE OF `Compatibility Reading` IS REVERSED, 2026-08-23. The paragraph
      // above argued it was safe because "the row on the page still says so" - and that
      // argument does not survive Reyner's B2 rule: never promise unbuilt features on a
      // merchant compliance page where checkout returns a 400. THIS STRING IS THE WORST
      // PLACE FOR IT, not the mildest: it is the browser-tab description and the
      // search-result snippet, which this file's own docblock calls "the one user-facing
      // string a reviewer can reach without loading the page" - and "tambahan opsional"
      // reads as PURCHASABLE, a stronger claim than the "sedang disiapkan" he struck.
      //
      // Found by grep AFTER the ruling rather than before it, so it is not an oversight
      // in the ruling; it predates the rule. Reyner ruled it 2026-08-23.
      //
      // THE /harga COMPAT ROW STAYS EXACTLY AS IT IS, on his ruling: `segera` badge, no
      // buy action, gated on `isSellable()` rather than on copy (app/harga/page.js). A
      // catalogue entry whose unavailability is visible on the page is honest, and it is
      // what a merchant reviewer should see. The rule is about PROMISES, not about
      // hiding the product.
      description:
        'Bacaan Katon gratis dan lengkap. Complete Edition adalah tambahan opsional.',
    },
    title: 'Harga',
    // REYNER-APPROVED 2026-08-05, INTERIM. The old lead read "Bacaan Katon gratis
    // dan lengkap. Yang berbayar hanya tambahan, dan selalu ditawarkan setelah
    // bacaanmu selesai." - accurate about the offer sequence, but it spent the word
    // `lengkap` on the free row, which is the word the paid row now needs, and it
    // called the paid product "tambahan" while the funnel sells it as the deeper
    // reading. Both surfaces now name Bacaan Mendalam.
    // RESTORED 2026-08-23. The 08-05 note above says exactly why this string went:
    // it "spent the word `lengkap` on the free row, which is the word the paid row
    // now needs". The paid row does not need it any more - it sells a card and a PDF,
    // not depth - so `lengkap` returns to the free row, where the locked model puts
    // it. FREE IS THE FULL MIRROR again, and this is the line that says so.
    lead: 'Bacaan Katon gratis dan lengkap. Yang berbayar hanya tambahan, dan selalu ditawarkan setelah bacaanmu selesai.',

    launchLabel: 'harga peluncuran',
    listLabel: 'harga normal',
    soonLabel: 'segera',

    free: {
      name: 'Refleksi Katon',
      price: 'Gratis',
      // REYNER-APPROVED 2026-08-05, INTERIM. Drops `lengkap` and `semua bagiannya
      // terbuka`. Neither was false about the free reading, but with the paid row
      // now called Bacaan Mendalam, a free row claiming completeness and a paid row
      // claiming depth invite the reader to ask which one they are being sold.
      // FREE IS STILL NEVER A GATE: the guarantee moved to artifact.noteAfter,
      // which is the sentence that has to carry it, and is untouched below.
      // RESTORED 2026-08-23. `lengkap` and `semua bagiannya terbuka` came out on
      // 08-05 because a free row claiming completeness beside a paid row claiming
      // DEPTH invited the reader to ask which one she was being sold. The paid row
      // claims an artifact now, not depth, so the question does not arise and the
      // free row can say the true thing again.
      body: 'Bacaan personal dari tanggal lahirmu, lengkap, semua bagiannya terbuka. Tidak perlu akun dan tidak perlu bayar.',
    },

    artifact: {
      // REYNER-APPROVED 2026-08-05, INTERIM. Was `Complete Edition` + "Kartu
      // resolusi tinggi dan PDF dari bacaanmu, siap disimpan atau dicetak." That
      // named a product with no fulfillment: the paid path unlocks the 7-beat deep
      // reading and there is no card and no PDF in it yet. The name and the body now
      // describe the unlock the buyer actually receives, matching the funnel's own
      // `Bacaan Mendalam` and the Xendit invoice description.
      //
      // THE SKU KEY STAYS `artifact`. It is the pricing-table and webhook identifier
      // (lib/pricing.js, the amount validation in the webhook), not display copy, and
      // renaming a live SKU key would strand in-flight invoices. Display name and SKU
      // key are allowed to diverge; this comment is why.
      //
      // Both revert together at the fulfillment swap, when card + PDF becomes true.
      // RESTORED 2026-08-23, and this is the row the whole 08-05 interim was about.
      // The note above says the pair was replaced because it "named a product with
      // no fulfillment: the paid path unlocks the 7-beat deep reading and there is
      // no card and no PDF in it yet", and it says "both revert together at the
      // fulfillment swap, when card + PDF becomes true". This commit is that swap.
      //
      // The old body named `hubungan, karier, atau uang`. Those were the DOMAINS,
      // and the domain is not a product - CLAUDE.md's SUPERSEDED list rules it, and
      // the pillars are the domains positionally. So the domain sentence does not
      // come back with the rest of the string; it has nothing to describe.
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
      // English product name. It was the EN tier layer (Reyner, 2026-08-03) paired
      // with `Complete Edition`; that pair broke on 2026-08-05 when the paid row
      // became `Bacaan Mendalam`, so this is now the only EN product name on the
      // page. Left in English deliberately: it is the unbuilt product, the name is
      // the one used in every planning doc, and renaming an unsellable row is copy
      // churn with nothing behind it. Revisit when compat becomes sellable.
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
      //
      // REYNER-APPROVED 2026-08-05, INTERIM. The approved text replaces the last
      // three sentences: `lengkap` is gone (the free-card collision), the card is
      // gone from the free sentence and the card + PDF are gone from the paid one
      // (neither is fulfilled yet), and the paid product is named.
      //
      // ASSUMPTION, FLAGGED: the two opening sentences are KEPT. The approved text
      // begins at "Bacaanmu muncul gratis" and has no counterpart for "Cara pakainya
      // sederhana. Isi tanggal lahir, tambahkan jam lahir kalau kamu mengingatnya."
      // Those carry no dead claim and they are the page's only how-to-use line, so
      // dropping them was read as not intended. If the whole paragraph was meant to
      // become the three approved sentences, cut them.
      // UPDATED 2026-08-23 with the promotion, and it is the ONE string here that is
      // not a straight restore: the pre-08-05 version of this paragraph is not
      // recorded verbatim anywhere, only described. So the paid clause is rebuilt
      // from the two strings that ARE Reyner's - `harga.artifact.name` and
      // `harga.artifact.body` above - and nothing else in the sentence moves.
      // `lengkap` returns to the free clause for the same reason it returns to
      // `harga.free.body`.
      //
      // REYNER-APPROVED 2026-08-23, REVISED: the Compatibility sentence is STRUCK
      // ENTIRELY. His reason becomes a rule rather than a one-off edit - NEVER PROMISE
      // UNBUILT FEATURES ON A MERCHANT COMPLIANCE PAGE WHERE CHECKOUT RETURNS A 400.
      // `compat` is priced at 45.000/29.000 (lib/pricing.js) and absent from
      // `SELLABLE_SKUS`, so its checkout 400s. "Sedang disiapkan" was the softest form
      // of that promise and it still made it on the page a payment reviewer reads.
      //
      // The note above about how the PAID clause was composed is kept deliberately: it
      // is the provenance of the half that survives.
      'Cara pakainya sederhana. Isi tanggal lahir, tambahkan jam lahir kalau kamu mengingatnya. Bacaanmu muncul gratis dan lengkap. Complete Edition berbayar, kartu resolusi tinggi dan PDF dari bacaanmu, bisa kamu ambil atau lewati.',
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
   * RE-AUDITED 2026-08-23, at the promotion. Every line below changed, because the
   * route that collected the data changed.
   *
   * - collected fields: `lib/mirror/handlers.js#createMirrorReading` persists
   *   birth_date, birth_time, term_side, gender and cache_key (all nullable but
   *   birth_date); `lib/readingStore.js` setInvoice adds invoice id and sku.
   *   `domain` is gone from the write - the domain is not a product (CLAUDE.md
   *   SUPERSEDED) and `createMirrorReading` never wrote one.
   * - NO PHONE NUMBER IS COLLECTED ANY MORE. `wa_number` stopped being collected at
   *   checkout on 2026-08-13, and `interest_wa` - the coming-soon demand capture -
   *   loses its only writer here: `app/api/reading/[id]/interest/route.js` is
   *   deleted with the domain concept, and `setInterest` with it.
   *   `grep -rn "setInterest\|interest_wa" lib app components` -> nothing.
   * - GENDER IS NOW COLLECTED. `grep -n "gender" components/Funnel.jsx` -> the
   *   optional select on the front door. It was correctly unlisted before because
   *   the field did not exist; it exists now because both cards print it.
   * - no email is captured anywhere today, so none is claimed.
   * - ONE COOKIE, and it is functional. `lib/mirror/session.js` mints an httpOnly
   *   session id on first contact and `lib/ratelimit.js` counts against it. There is
   *   still no storage and no analytics: `grep -rn
   *   "localStorage|sessionStorage|gtag|analytics" app components lib` returns
   *   nothing.
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

    // ── UPDATED 2026-08-23 WITH THE PROMOTION, AND THIS IS WHY IT IS PART OF THIS
    // COMMIT RATHER THAN A FOLLOW-UP: flipping the funnel CHANGES WHAT IS COLLECTED,
    // in three directions at once. A privacy notice that describes the retired
    // funnel is not a stale sentence, it is a false disclosure.
    //
    //   REMOVED  the WhatsApp line. The only path that ever wrote `interest_wa` was
    //            `app/api/reading/[id]/interest/route.js`, the coming-soon demand
    //            capture, and it is deleted here with the domain concept it served.
    //            `grep -rn "setInterest" lib app components` returns nothing after
    //            this commit. Nothing collects a phone number any more.
    //   ADDED    gender. The front door asks for it again (optional), because the
    //            2026-08-03 ruling puts PEREMPUAN / LAKI-LAKI in both card footers
    //            and this commit ships both cards. It was correctly NOT listed
    //            before - the field did not exist.
    //   ADDED    the session cookie. `lib/mirror/session.js` mints an httpOnly one
    //            on first contact and the rate limiter counts against it. The note
    //            below is still true as written - it is not a tracking cookie and
    //            there is no third-party analytics - but a functional cookie is
    //            still processing, and "no cookies" was the code comment above this
    //            block rather than the disclosure. Disclosed, not defended.
    collectHeading: 'Data yang kami kumpulkan',
    collect: [
      'Tanggal lahir. Ini satu-satunya data yang wajib, karena tanpa itu tidak ada yang bisa dihitung.',
      'Jam lahir, kalau kamu mengisinya. Opsional, dan bacaanmu tetap utuh tanpa itu.',
      'Jenis kelamin, kalau kamu mengisinya. Opsional, dan hanya dipakai untuk keterangan di kartumu.',
      'Catatan pembayaran dari Xendit: nomor invoice, jumlah, dan status. Kami tidak pernah menerima atau menyimpan nomor kartu maupun data akun bankmu.',
      'Satu cookie teknis untuk membatasi jumlah permintaan dari satu peramban. Cookie ini tidak melacakmu ke situs lain dan tidak berisi data kelahiranmu.',
      'Log teknis dari penyedia hosting kami, termasuk alamat IP dan waktu akses. Ini bagian standar dari cara server bekerja.',
    ],
    collectNote:
      'Katon tidak meminta nama, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga.',

    purposeHeading: 'Untuk apa data itu dipakai',
    purpose: [
      'Menghitung bagan kelahiranmu dan menyusun bacaannya.',
      'Menyimpan hasilnya supaya kamu bisa membukanya lagi lewat tautan yang sama.',
      'Memproses pembayaran dan menyiapkan produk berbayar yang kamu beli untuk diunduh.',
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
      // OPENAI IS STRUCK, AND THIS IS A DEFECT FOUND IN PASSING RATHER THAN A
      // PROMOTION CHANGE. The secondary provider was DELETED on 2026-08-22 (`e7c9a6c`,
      // and CLAUDE.md rule 15 records the ruling: one provider, the floor is the
      // failover). This page kept naming it as a processor for a day, which is a
      // disclosure that overstates who receives data - the opposite direction from
      // the usual privacy defect, and still wrong. It is fixed here because the
      // promotion is the commit that makes this page true again, and leaving one
      // false processor in it while correcting three other lines would be choosing
      // to ship a known-false disclosure.
      'Penyedia model bahasa untuk menyusun teks bacaan: Google (Gemini). Yang dikirim ke penyedia ini adalah hasil hitungan bagan, tanpa tanggal lahir mentah, tanpa nama, dan tanpa email.',
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
      // The WhatsApp row went with the collect row above: nothing writes a phone
      // number any more. A retention period for data nobody holds is worse than no
      // line, because it implies the collection is still happening.
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
      // UPDATED 2026-08-23 with the promotion. `terbuka` described an UNLOCK - the
      // paid product used to be prose that appeared in place. It is now two files a
      // buyer downloads, and that is the difference the refund page's "produk yang
      // bekerja" clause turns on, so the sentence has to say download. One clause
      // added, nothing else in the paragraph touched.
      //
      // REYNER-APPROVED 2026-08-23, SHIPPED AS WRITTEN: "The language on download links
      // and accountless access is clear, accurate, and aligns with refund policies."
      // The clause was never a restore of an earlier approved string, which is why it
      // was flagged; it is his now, unedited.
      'Setelah dikonfirmasi, produkmu siap diunduh di tautan bacaanmu, di halaman yang sama tempat kamu membayar. Kamu bisa mengunduhnya lagi kapan saja dari tautan itu. Simpan tautan itu, karena Katon berjalan tanpa akun dan tautan itulah satu-satunya cara membukanya lagi.',
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

// ============================================================
// UPCOMING_COPY — the two unbuilt products, RULED 2026-08-31
// ============================================================
// Prompt Q commit 4 shipped this block with all eleven strings stubbed. Reyner
// ruled every one of them on 2026-08-31; the ruling, its sweep and the reasoning
// per slot are in `docs/content/upcoming-copy-rulings.md`, which landed on `main`
// alone before this substitution. The values here are VERBATIM from that table -
// punctuation, capitalisation and spacing included, none of it adjusted to match a
// neighbouring string.
//
// Every reader-facing string for the block still lives in this one object, which
// is what made ruling it one file to open rather than a hunt through a 1100-line
// component. Keep it that way for the next one.
//
// ── WHY THE BLOCK SHIPPED STUBBED INSTEAD OF WAITING ──
// Commits 5 and 6 depend on this block EXISTING - the read-out's second
// denominator is `upcoming_seen`, which nothing fires until the block renders. A
// hold here would have blocked two commits on a wording decision that is not on
// their critical path. So the structure lands complete and the words land later,
// and the gate below makes "later" enforceable rather than hopeful.
//
// ── THE SENTINEL: NO SLOT CARRIES ONE NOW, AND THE GATE STAYS ARMED ──
// `PENDING()` wraps an unruled value in `@@UNRULED: ...@@`, deliberately
// unmissable: if one ever renders to a real reader, the bug reports itself in the
// screenshot instead of looking like a slightly odd Indonesian sentence that
// nobody questions. A placeholder that reads plausibly is the one that ships.
//
// `scripts/check-unruled-copy.mjs` REFUSES A PRODUCTION BUILD while any sentinel
// survives (wired as `prebuild`). Preview and local builds are allowed through on
// purpose - Reyner has to SEE the block rendered in order to rule the words, and a
// gate that blocks the preview would block the very review it exists to force.
// The line is production, which is the line that matters: a stub that can reach a
// paying reader is worse than a hold.
//
// IT NOW PASSES, AND NEITHER HALF IS DELETED FOR THAT REASON. The ruling's own
// step 5 is explicit that `PENDING` and the gate stay: they are the gate for the
// NEXT unruled string, and removing a green gate is how it stops existing before
// anyone needs it again. `tests/unruled-copy.spec.mjs` pins that the mechanism
// still works rather than merely that it is quiet.
//
// PRICES ARE NOT HERE. They resolve from `lib/pricing.js` at render time, exactly
// like the Artifact offer, because a price typed into a copy bank is a second
// source of truth for what a thing costs.
//
// COWORK PROPOSED WORDING ON 2026-08-29 and it was kept out of these slots until
// Reyner ruled, because putting an unruled proposal in the slot it would occupy is
// how a proposal becomes a decision by accident. Provenance of the eleven, checked
// against that proposal table rather than remembered:
//
//   6  adopted verbatim from a single proposal - compat.label, compat.sub,
//      annual.label, annual.sub, interestCta, contactLabel
//   1  CHOSEN from a proposed pair - availability, offered as `Belum tersedia`
//      or `Sedang disiapkan`. A selection, not an adoption, and the discarded
//      option is what the slot docblock below records as load-bearing
//   4  his own, never proposed - eyebrow, lead, thanks, contactSubmit
//
// None of that is visible in the finished table, which is why it is written down.
// ============================================================

/**
 * Wrap an unruled string so it cannot be mistaken for a ruled one.
 *
 * ── IT HAS NO CALL SITES AND IT STAYS. THAT IS THE RULING, NOT AN OVERSIGHT. ──
 * `docs/content/upcoming-copy-rulings.md`, APPLYING IT step 5: *"PENDING and
 * scripts/check-unruled-copy.mjs STAY. They are the gate for the next unruled
 * string, not scaffolding for this one. Deleting them because no sentinel remains
 * is how the gate stops existing before anyone needs it again."*
 *
 * EXPORTED RATHER THAN SILENCED. With the eleven slots ruled, nothing calls this,
 * and `no-unused-vars` failed the build on it - correctly. The two ways out were a
 * lint suppression or a `_` rename, and both say "this is dead" about a function
 * the ruling deliberately keeps alive. Exporting it says the true thing instead:
 * it is the sentinel constructor for ANY copy bank that acquires an unruled
 * string, which is what the next one will need and is one import away from having.
 */
export const PENDING = (slot) => `@@UNRULED: ${slot}@@`;

export const UPCOMING_COPY = {
  /** The quiet eyebrow over the block. Secondary to the Artifact CTA, never a rival. */
  eyebrow: 'Yang sedang dikerjakan',
  /** One line under the eyebrow saying these are not for sale yet. */
  lead: 'Dua bacaan ini belum dijual.',

  compat: {
    label: 'Kamu dan Satu Orang',
    sub: 'Kecocokan, dibaca dari dua tanggal lahir.',
  },
  annual: {
    // "Peta cuaca", never a forecast. `forbidden_content.fatalism` bans `ramalan`
    // and the ruling routes around it rather than negating it - a banned token is
    // banned even in denial. Timing is cuaca, never ramalan (rule 25).
    label: 'Setahun ke Depan',
    sub: 'Peta cuaca untuk tahun yang kamu masuki.',
  },

  /**
   * The not-yet-available marker on each card.
   *
   * RULED FIRST OF THE ELEVEN, AND IT UNLOCKED THE EYEBROW. `Sedang disiapkan`
   * was the alternative and it would have forced a paraphrase in `eyebrow` to
   * avoid reading as a stutter one line above. `Belum tersedia` is a neutral
   * state flag, which leaves `Yang sedang dikerjakan` free to frame the craft.
   * The dependency is invisible in the finished pair, so it is recorded here:
   * an edit to either slot can reintroduce the collision.
   */
  availability: 'Belum tersedia',
  /** The tap target. Tapping IS the metric; it must not read like a purchase. */
  interestCta: 'Beri tahu saya kalau sudah siap',

  /** Shown only AFTER the tap has already been recorded. */
  thanks: 'Sudah tercatat, terima kasih.',
  /** The optional contact field. Optional must be visible in the label itself. */
  contactLabel: 'Email atau nomor WhatsApp, boleh dikosongkan',
  contactSubmit: 'Kirim',
};
