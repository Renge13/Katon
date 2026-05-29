// lib/content/bing.js
// Katon — 丙 (Yang Fire / Matahari) content blob.
// REFERENCE ARCHETYPE. All 9 others are written to match this shape and bar.
//
// SCHEMA NOTES:
// - This file is the COMPLETE data for one Day Master. Drop-in: adding a new
//   archetype = adding a sibling file (jia.js, yi.js, ...) of the same shape.
// - FREE tier = card + freeRead + bridgeQuestions. Client-safe; may ship to browser.
// - PAID tier = paidDomains. SERVER-ONLY. This file (or at least `paidDomains`)
//   must be imported ONLY by the /api/reading/[id]/full route so Next never
//   bundles paid copy client-side. Simplest safe split: keep paidDomains in a
//   separate server-only module if your bundler can't tree-shake it out.
// - elementNote VARIES BY CHART, not just archetype. Provide variants; the
//   calculator resolves which one applies (missing/dominant element) and that
//   resolved key is persisted on the reading row as `element_variant`.
//
// VOICE: "old friend who knows you well." Casual Indonesian. No subject pronoun
// on the card; "kamu" in the reading. No mystical-cosmic words, no "kamu harus".

export const bing = {
  dayMasterChinese: "丙",
  dayMasterElement: "Fire",
  archetypeName: "MATAHARI",

  // ---------- FREE: SHARECARD ----------
  card: {
    // no subject pronoun, max ~12 words
    tagline: "Bikin semua orang anget, tapi paling susah ngehangatin diri sendiri.",
    // THREE-SHAPES RULE: line 1 flat observation, line 2 a turn, line 3 a small scene.
    // Each names a BEHAVIOR; the reader supplies the feeling.
    dimensions: {
      kekuatan: "Orang ngerasa lebih ringan abis ngobrol sama kamu.",
      polaTersembunyi: "Kamu inget hal-hal kecil soal orang. Giliran kamu, kok malah sepi.",
      yangOrangNggakSadar:
        "Di balik yang paling tegar di grup, ada yang lagi pengen ditanya \u201ckamu sendiri gimana?\u201d",
    },
    // distinct branches per side (harmony vs clash) — never repeat a zodiac year
    compatibleBranches: ["\u4e11", "\u4ea5"], // 丑 (Kerbau), 亥 (Babi) — harmony with 子
    clashBranches: ["\u5348"],                 // 午 (Kuda) — clash with 子
    // surfaced as taggable people, computed per the user's actual day branch
  },

  // ---------- FREE: READING ----------
  freeRead: {
    siapaKamu:
      "Ada orang yang masuk ruangan, dan ruangannya berubah. Bukan karena dia berusaha, tapi emang gitu caranya hadir. Kehangatan yang dia kasih jarang dihitung, dan di situ masalahnya: yang nyalain orang lain sering lupa, dia sendiri juga butuh dinyalain.",
    polaDasar:
      "Matahari di sini bukan label \u201ckamu ceria\u201d. Ini cara ngelihat: kamu ngukur diri dari seberapa terang orang lain jadi gara-gara kamu. Selama ada yang ikut anget, kamu ngerasa cukup. Repotnya pas nggak ada yang ngeliat, karena di saat itu kamu nggak punya cara lain buat ngerasa berarti.",
    caraKamuHadir:
      "Di depan orang, kamu hampir selalu jadi yang nenangin suasana. Orang dateng biar ngerasa lebih enteng, dan kamu kasih itu tanpa diminta. Yang jarang keliatan: kamu sendiri jarang punya tempat naro beban. Bukan nggak ada yang peduli, tapi kamu udah kebiasa jadi tempat orang nyandar, sampe lupa kamu juga boleh nyandar.",
  },

  // elementNote: pick by resolved element_variant. The 丙子/Reyner chart resolves
  // to "missing_wood" (also dominant Water). Write 2-3 variants per archetype.
  elementNote: {
    missing_wood:
      "Apimu nyata. Tapi yang paling kuat di kamu malah Air, hal yang justru madamin api. Dan Kayu, satu-satunya yang bisa nyalain kamu lagi, hampir nggak ada. Artinya kamu sering nyala dari cadangan, bukan dari sumber. Makanya kamu bisa terang banget, terus tiba-tiba kosong, tanpa tahu pasti kapan habisnya.",
    dominant_fire:
      "Apimu gede dan keliatan. Tapi makin terang sumbunya, makin cepet abis lilinnya. Kamu jago nyalain, susah ngerem. Yang perlu kamu jaga bukan nyalanya, tapi kapan harus padam bentar biar nggak kebakar sendiri.",
    balanced:
      "Apimu cukup stabil, ada bahan bakar, ada yang nahan. Tantanganmu bukan kehabisan, tapi milih ruangan mana yang layak kamu terangin, karena kamu cenderung nyala buat semua orang tanpa milih.",
  },

  // ---------- FREE: BRIDGE (one fires, matched to the domain she picked) ----------
  // OPENS a loop, never closes. Names a live decision, withholds the answer.
  bridgeQuestions: {
    hubungan:
      "Pola ngasih duluan ini, bikin kamu bertahan di hubungan yang harusnya udah kamu tinggal, atau malah nutup pintu ke orang yang sebenernya pas?",
    karier:
      "Kamu yang selalu nyalain tim, nahan-nahan jadi yang paling diandelin, atau diam-diam udah lama pengen pergi tapi takut tempatnya redup tanpa kamu?",
    rezeki:
      "Kamu gampang ngasih, gampang nraktir, gampang bantu \u2014 tapi pernah ngitung, sebenernya ke mana perginya yang kamu hasilin, dan kenapa kok nggak pernah kerasa cukup?",
  },

  // ---------- PAID: SERVER-ONLY. 5 beats, 7 fields. ----------
  // beats: 1 polanya | 2 yangSebenernyaKejadian (the reframe — most important) |
  //        3 gimanaIniMuncul (scenes) | 4 yangNgabisin + yangNgisi (people filter) |
  //        5 caraMutusinnya + decisionRule (the prescription)
  paidDomains: {
    hubungan: {
      title: "Kenapa kamu selalu yang ngasih duluan",
      subtitle: "dan gimana cara berhentinya tanpa jadi dingin",
      polanya:
        "Buat kamu, sayang itu artinya ngasih duluan, terus-terusan. Soalnya jauh di dalam, dibalas sayang kerasa kayak sesuatu yang harus kamu menangin dulu, bukan sesuatu yang boleh kamu terima gitu aja. Apimu butuh bahan bakar buat nyala, tapi di kamu Kayu hampir nggak ada. Jadi kamu nyalain orang lain pakai cadangan dirimu sendiri. Makin sayang, makin kamu kasih; makin kamu kasih, makin kamu diam-diam nunggu dibalas. Pas nggak sebanding, kamu nggak marah, kamu cuma redup.",
      yangSebenernyaKejadian:
        "Kamu kira kamu lagi sayang. Padahal sebagian dari itu, kamu lagi beli rasa aman. Tiap kali ngasih, ada bagian kecil yang mikir \u201ckalau aku cukup baik, dia nggak akan pergi.\u201d Makanya kamu sering ketarik sama orang yang nggak gampang ngasih balik, yang dingin, yang sibuk, yang harus kamu kejar. Bukan kebetulan. Orang yang gampang sayang balik kerasa \u201ckurang menantang\u201d, karena kamu nggak tahu cara nerima sayang yang dateng tanpa kamu menangin dulu.",
      gimanaIniMuncul: [
        "Kamu inget tanggal penting dia, dia lupa punya kamu, dan kamu bilang ke diri sendiri \u201cnggak apa-apa\u201d.",
        "Kamu yang mulai baikan tiap berantem, walaupun bukan kamu yang salah.",
        "Pas dia akhirnya perhatian, kamu malah bingung, kadang malah curiga.",
        "Hubungan kerasa \u201caman\u201d pas kamu yang jagain; pas posisinya kebalik, kamu panik.",
      ],
      yangNgabisin:
        "Orang yang nerima terus tanpa pernah nanya balik \u201ckamu sendiri gimana?\u201d. Sama kamu mereka nyaman banget, soalnya kamu nggak pernah minta apa-apa. Itu tanda bahaya, bukan tanda cocok.",
      yangNgisi:
        "Orang yang maksa kamu nerima. Yang nraktir balik dan nolak diganti. Yang nanya \u201ckamu capek nggak?\u201d sebelum kamu sempet pura-pura kuat. Awalnya bakal kerasa aneh, bahkan nggak nyaman. Itu bukan tanda nggak cocok, itu tanda kamu lagi belajar hal yang nggak pernah kamu bisa.",
      caraMutusinnya:
        "Jangan ukur hubungan dari seberapa dibutuhin kamu di situ. Ukur dari satu hal: pas kamu berhenti ngasih sebentar, dia mendekat atau menjauh? Yang tepat buat kamu bakal mendekat pas kamu istirahat, soalnya dia di situ buat kamu, bukan buat yang kamu kasih. Yang salah bakal langsung menjauh begitu keran perhatianmu kamu tutup, dan itu jawaban yang selama ini kamu takut nyari. Kamu nggak perlu mutusin sekarang. Kamu cuma perlu satu minggu berhenti jadi matahari buat dia, dan liat.",
      decisionRule:
        "Pas kamu berhenti ngasih sebentar, dia mendekat atau menjauh?",
    },

    karier: {
      title: "Kenapa kamu jadi tiang yang nggak bisa pergi",
      subtitle: "dan cara tau ini panggilan atau jebakan",
      polanya:
        "Di kerjaan, kamu jadi yang nyalain. Tim lagi down, kamu yang ngangkat. Ada yang nggak beres, kamu yang turun tangan. Lama-lama kamu jadi orang yang \u201ctanpa dia semuanya berhenti\u201d. Tapi apimu nyala dari cadangan, bukan sumber (Kayu kosong). Jadi kamu kasih terang ke semua orang sambil diam-diam kehabisan, dan nggak ada yang ngeh, soalnya kamu selalu keliatan kuat.",
      yangSebenernyaKejadian:
        "Kamu kira kamu nggak bisa pergi karena mereka butuh kamu. Yang sebenernya: kamu butuh dibutuhin. Jadi yang paling diandelin itu identitasmu, bukan cuma peranmu. Makanya kamu betah di tempat yang sebenernya udah nggak ngasih apa-apa lagi, asal di situ kamu masih jadi yang penting. Rasa \u201cpenting\u201d itu yang nahan kamu, bukan gaji, bukan jenjang.",
      gimanaIniMuncul: [
        "Kamu nolak tawaran lebih bagus, alesannya \u201ckasian timku gimana\u201d.",
        "Kamu yang paling telat pulang, dan diam-diam bangga sama itu.",
        "Pas ada yang bisa gantiin kamu, kamu malah nggak nyaman, bukan lega.",
        "Kamu pengen diakuin, tapi gengsi minta; jadi nunggu diliat, terus kecewa pas nggak.",
      ],
      yangNgabisin:
        "Tempat yang cuma manfaatin terangmu tapi nggak pernah naro bahan bakar balik \u2014 nggak ada mentor, nggak ada yang ngajarin, kamu terus yang ngasih ke bawah. Kamu bakal abis pelan-pelan.",
      yangNgisi:
        "Tempat yang bikin kamu belajar, ada orang di atasmu yang kamu kagumin, ada hal baru yang maksa kamu tumbuh. Matahari butuh kayu buat nyala terus; kamu butuh tempat yang ngasih makan, bukan cuma minta cahaya.",
      caraMutusinnya:
        "Jangan tanya \u201cmereka bakal gimana kalau aku pergi?\u201d. Tanya: \u201csetahun terakhir, aku tumbuh atau cuma dibutuhin?\u201d Kalau jawabannya cuma \u201cdibutuhin\u201d, itu bukan panggilan, itu jebakan yang kerasa enak karena nyentuh kebutuhanmu buat jadi penting. Tempat yang tepat buat Matahari bukan yang paling butuh kamu, tapi yang bikin kamu makin nyala. Kamu nggak harus resign besok, kamu cuma harus jujur soal bedanya.",
      decisionRule:
        "Setahun terakhir, aku tumbuh atau cuma dibutuhin?",
    },

    rezeki: {
      title: "Kenapa gampang dapet, gampang abis",
      subtitle: "dan kenapa nggak pernah kerasa cukup",
      polanya:
        "Kamu nggak pelit, malah kebalikan. Gampang nraktir, gampang bantu, gampang bilang \u201caku aja yang bayar\u201d. Uang buat kamu cara nunjukin sayang dan bikin orang seneng, bukan cuma alat. Tapi Air yang dominan artinya rezeki ngalir terus \u2014 masuk deres, keluar juga deres. Kamu jago ngehasilin, tapi susah nahan. Bukan karena boros, tapi karena nyimpen buat diri sendiri kerasa agak egois.",
      yangSebenernyaKejadian:
        "Kamu kira kamu murah hati. Sebagian iya. Tapi sebagian lagi, kamu lagi beli rasa berharga. Selama kamu yang ngasih, kamu yang penting di meja itu, dan itu kerasa lebih enak daripada nyimpen diam-diam. Makanya \u201ccukup\u201d nggak pernah dateng \u2014 yang kamu kejar bukan angkanya, tapi rasa diliat dan dibutuhin yang dibeli pakai angka itu. Berapapun masuk, lubangnya bukan di dompet.",
      gimanaIniMuncul: [
        "Kamu inget pernah bantu siapa aja, tapi lupa pernah dibantu apa nggak.",
        "Saldo naik, kamu malah cari alesan buat ngebagiin atau ngerayain.",
        "Minta dibayarin balik kerasa lebih susah daripada ngasih.",
        "Kamu hitung kasar pemasukan, tapi nggak pernah berani liat ke mana perginya.",
      ],
      yangNgabisin:
        "Orang dan kebiasaan yang cuma muncul pas kamu lagi royal. Lingkaran yang ngukur kamu dari seberapa kamu ngasih. Makin kamu kasih, makin kamu kekunci di peran \u201cyang selalu nalangin\u201d.",
      yangNgisi:
        "Sistem yang nahan dulu sebelum kamu sempet ngasih \u2014 auto-transfer ke tabungan begitu masuk, pos terpisah yang nggak kamu sentuh. Buat kamu, disiplin bukan soal pelit, tapi soal mindahin \u201cmenang\u201d dari momen ngasih ke momen punya.",
      caraMutusinnya:
        "Sebelum ngasih atau ngeluarin, tanya satu hal: \u201cini karena aku pengen, atau karena aku pengen diliat?\u201d Kalau jawabannya yang kedua, tahan dulu \u2014 itu pola lama nyari rasa berharga lewat ngasih. Kamu nggak perlu berhenti murah hati, itu hal terindah dari Matahari. Kamu cuma perlu satu rekening yang nggak ada hubungannya sama bikin orang lain seneng, dan jagain itu kayak kamu jagain orang yang kamu sayang.",
      decisionRule:
        "Ini karena aku pengen, atau karena aku pengen diliat?",
    },
  },

  // closing line appended after every paid domain (reflective lens, not prediction)
  paidClosing:
    "Ini bukan ramalan. Pola yang kebaca dari Empat Pilarmu, dipakein ke pertanyaan yang lagi kamu bawa. Yang mutusin tetap kamu.",
};

export default bing;
