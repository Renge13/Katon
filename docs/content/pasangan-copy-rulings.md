<!--
STATUS: APPLIED-AS-DRAFTED. Reyner ruled 2026-09-08 that Compatibility UI chrome ships from Cowork
drafts (swept) and is amended in place; the full ruling process stays for READING words (glossary,
prompt, floor). Lands on main ALONE before the PR that applies it (the #28 ruling).

APPLIES TO: 4 SITE_COPY.home_* slots, 22 PASANGAN_COPY slots, 2 SITE_COPY.privasi slots = 28 rows and
28 DISTINCT SLOTS, which is every string the gate currently refuses on. NO SCRIPT APPLIES THIS:
substitute by hand, verbatim, npm run check:copy is the proof.

COUNT CORRECTED BY CLAUDE CODE ON LANDING, 2026-09-08, and NOT ONE STRING WAS TOUCHED. The line read
"21 PASANGAN_COPY slots ... (28 rows in the worksheet; 27 distinct slots)", and 4 + 21 + 2 is 27
against a table of 28. Enumerated rather than re-counted by eye:

    rows parsed: 28
    { SITE_COPY: 4, PASANGAN_COPY: 22, 'SITE_COPY.privasi': 2 }
    distinct slots: 28

It matters because there is no --expect here to catch it: apply-rulings.mjs does not target a copy
bank, so the count in this header IS the check, and a header claiming 27 would have left one slot
unapplied and a production build still refusing with nobody able to say which.

SWEEP: compiled as lib/validate/style.js:63 over the whole blocklist, 70 patterns (65 + 5 verdict).
0 hits, 0 non-keyboard characters. Falsifiers 4/4 (cenderung, selaras, sangat cocok, Kondisi ini).

FOUR STRINGS ARE PROMISES, NOT CHROME: form_email_help, link_keep, privasi_email,
privasi_second_person. They assert store-only email and deletion of B data on request. If either
behaviour changes, all four change in the same commit.
-->

# Compatibility UI copy (PASANGAN_COPY + SITE_COPY.home_* + SITE_COPY.privasi.*)

| Bank | Slot | String |
|---|---|---|
| SITE_COPY | `home_mirror_label` | `Bacaan Diri` |
| SITE_COPY | `home_mirror_sub` | `Pahami polamu sendiri. Gratis.` |
| SITE_COPY | `home_compat_label` | `Kompatibilitas` |
| SITE_COPY | `home_compat_sub` | `Dinamika antara kamu dan satu orang, dibaca dari dua tanggal lahir.` |
| PASANGAN_COPY | `page_title` | `Bacaan Kompatibilitas` |
| PASANGAN_COPY | `page_lead` | `Bacaan personal tentang bagaimana dua pola kalian bertemu: tarikan, gesekan, unsur yang saling mengisi, ritme sehari-hari, dan dinamika keseluruhan di antara kalian.` |
| PASANGAN_COPY | `includes_1` | `Inti diri kalian berdua, dan bagaimana keduanya berhubungan` |
| PASANGAN_COPY | `includes_2` | `Kursi pasangan di bagan masing-masing, dan apa yang terjadi saat keduanya bertemu` |
| PASANGAN_COPY | `includes_3` | `Unsur yang kalian bawa untuk satu sama lain` |
| PASANGAN_COPY | `includes_4` | `Pola hubungan kalian: Cermin, Serumpun, atau Kontras` |
| PASANGAN_COPY | `includes_5` | `Kuadran tarikan dan ritme, ditutup dengan peta: yang menguatkan, yang bergesek, dan yang dituntut dari masing-masing` |
| PASANGAN_COPY | `price_note` | `Sekali bayar. Bacaan tersimpan di satu tautan yang bisa kamu buka kapan saja.` |
| PASANGAN_COPY | `form_a_legend` | `Kamu` |
| PASANGAN_COPY | `form_b_legend` | `Dia` |
| PASANGAN_COPY | `form_email_label` | `Email` |
| PASANGAN_COPY | `form_email_help` | `Dipakai untuk membuka kembali bacaan ini kalau tautannya hilang. Tidak ada yang dikirim ke email ini.` |
| PASANGAN_COPY | `form_submit` | `Lanjut ke pembayaran` |
| PASANGAN_COPY | `season_gate_b_intro` | `Tanggal lahir dia jatuh tepat di hari pergantian musim. Jawab sebisamu; kalau tidak yakin, tanyakan langsung padanya.` |
| PASANGAN_COPY | `pending_title` | `Menunggu konfirmasi pembayaran` |
| PASANGAN_COPY | `pending_body` | `Halaman ini berganti sendiri begitu pembayaran masuk. Tidak perlu dimuat ulang.` |
| PASANGAN_COPY | `paid_title` | `Bacaan kalian sudah siap` |
| PASANGAN_COPY | `link_keep` | `Simpan tautan halaman ini. Tautan ini satu-satunya jalan masuk ke bacaan kalian: tidak ada akun, dan tidak ada yang dikirim ke email.` |
| PASANGAN_COPY | `unpaid_resume` | `Bacaan ini belum dibayar. Lanjutkan pembayaran untuk membukanya.` |
| PASANGAN_COPY | `report_badge_eyebrow` | `Pola hubungan` |
| PASANGAN_COPY | `report_quadrant_eyebrow` | `Tarikan dan ritme` |
| PASANGAN_COPY | `notfound_title` | `Bacaan tidak ditemukan` |
| SITE_COPY.privasi | `privasi_email` | `Untuk Bacaan Kompatibilitas, kami menyimpan alamat email yang kamu isi. Fungsinya satu: membuka kembali bacaan kalau tautannya hilang. Kami tidak mengirim apa pun ke alamat itu dan tidak membagikannya.` |
| SITE_COPY.privasi | `privasi_second_person` | `Bacaan Kompatibilitas memakai tanggal lahir orang kedua yang kamu masukkan. Data itu disimpan hanya bersama bacaan tersebut, tidak menghasilkan bacaan terpisah untuk orang itu, dan ikut terhapus kalau kamu meminta bacaannya dihapus.` |

Amendments by Reyner: none yet. Amend by editing the string here first, then the bank, same commit.
