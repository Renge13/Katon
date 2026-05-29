// ============================================================
// Element dominance and absence — pattern observation
// ============================================================
// Triggered by the chart's elementBalance counts. The composer
// picks ONE note to surface: missing element takes priority over
// dominant.
//
// Phase 8a.5: stripped the inline 'Bacaan Mendalam' CTA tail
// sentences from paragraph 2. Phase 7b batch 3: stripped the
// remaining rhetorical-question paragraph 2 across all 10
// entries. Element notes are now single-paragraph observations.
// The consolidated Bridge section between Relasi Cabang and the
// Bacaan Mendalam CTA handles all open-loop framing for the
// reading page.
//
// Voice: formal Indonesian vocabulary with spoken cadence.
// 'tidak' not 'nggak'. 'membuat' not 'bikin'. 'merasa' not
// 'ngerasa'. 'sangat' not 'banget'. Conversational rhythm, not
// literary prose.
//
// FORMAT: single paragraph per element.
// ============================================================

export const DOMINANT_ELEMENT = {
  Wood:  'Kayu yang dominan membuatmu terus memulai dan merencanakan. Kamu sering menjadi orang pertama yang mengangkat tangan untuk proyek baru, tetapi di tengah jalan energimu terpecah karena kamu sudah mulai yang lain. Fokusmu sering terbagi antara yang seharusnya selesai dan yang ingin segera kamu mulai.',
  Fire:  'Api yang dominan membuatmu mudah menjadi pusat perhatian. Kamu menyala cepat dalam obrolan, presentasi, atau ide-ide spontan. Tetapi di balik itu, kamu sering merasa kehabisan bahan bakar ketika tidak ada yang merespons, atau ketika keramaian justru membuatmu merasa sendirian.',
  Earth: 'Bumi yang dominan membuatmu sering menjadi tempat orang pulang. Kamu menyediakan rasa aman dan ketenangan untuk sekitar. Tetapi karena semua orang menganggapmu kokoh, kamu jarang bisa menunjukkan bahwa kamu juga butuh disandarkan, bukan hanya menjadi sandaran.',
  Metal: 'Logam yang dominan membuat standarmu tinggi dan logikamu tajam. Kamu bisa melihat kelemahan dalam sebuah rencana atau ketidakkonsistenan dalam sebuah argumen. Tetapi ketajaman ini sering berbalik ke dirimu sendiri: kamu sulit puas, dan kritik internal bisa lebih keras dari kritik siapa pun.',
  Water: 'Air yang dominan membuatmu sangat peka terhadap perasaan sekitar. Kamu sering sudah tahu isi hati orang lain sebelum mereka membuka mulut. Tetapi kedalaman ini juga membuatmu kesulitan menemukan orang yang bisa memahamimu dengan cara yang sama.',
}

export const MISSING_ELEMENT = {
  Wood:  'Kayu yang kurang membuatmu sering memiliki ide tetapi jarang benar-benar memulai. Rencana matang di kepala, tetapi begitu mulai dieksekusi, kamu ragu atau kehilangan momentum. Akibatnya, kamu lebih sering menonton daripada menanam.',
  Fire:  'Api yang kurang membuat kehidupanmu stabil, tetapi sering terasa datar. Kamu cenderung menghindari perhatian, bahkan ketika sebenarnya layak mendapat sorotan. Ada rasa takut untuk bersinar yang membuatmu lebih sering berada di latar belakang.',
  Earth: 'Bumi yang kurang membuatmu sering merasa melayang. Kamu bisa memiliki banyak aktivitas, tetapi tidak ada yang benar-benar membuatmu merasa berpijak. Ada kerinduan akan rutinitas yang stabil, tetapi kamu tidak yakin bagaimana membangunnya tanpa merasa terkekang.',
  Metal: 'Logam yang kurang membuatmu sulit mengambil keputusan tegas. Kamu sering menimbang terlalu lama, khawatir melukai orang lain, atau takut membuat pilihan yang salah. Akibatnya, batas-batasmu sering kabur dan itu melelahkan secara mental.',
  Water: 'Air yang kurang membuat hidupmu terasa kaku. Kamu cenderung memaksakan rencana dan sulit beradaptasi ketika keadaan berubah. Ada rasa lelah karena terus melawan arus, padahal yang kamu butuhkan justru belajar mengalir.',
}
