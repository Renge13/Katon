<!-- STATUS: RULED 2026-09-09 (Reyner). The ruled values live ONLY in docs/content/pasangan-copy-rulings.md
(amendments a-e at its head). This sheet is the worksheet and carries no value of its own; the
Amendment column below only points. Email field: KEPT; #16 and #27 amended (rulings amendment e).
Nothing open.
Cowork, 2026-09-09. Every static string a buyer sees on the Compatibility surface, for Reyner's
review after the preview walk. The 28 PASANGAN/home/privasi strings are RULED and live in
docs/content/pasangan-copy-rulings.md; they are listed here again only so the review is one page.
Shared strings come from the mirror (BirthFields / Funnel) and change for BOTH products if amended. -->

# Compatibility surface - static strings under review

## Shared with the mirror (components/BirthFields.jsx, Funnel.jsx) - amending changes the mirror too
| Where | Current | Source |
|---|---|---|
| field label | `Tanggal lahir` | BirthFields.jsx:48 |
| field label | `Jam lahir · opsional` | BirthFields.jsx:69 |
| helper under Jam lahir | `Jamnya saja sudah cukup. Bacaanmu tetap akurat tanpa ini, tapi kalau ada, beberapa lapisan jadi lebih dalam.` | BirthFields.jsx:78 - AMENDED, see rulings |
| field label | `Jenis kelamin · opsional` | BirthFields.jsx:95 |
| options | `Perempuan` / `Laki-laki` | BirthFields.jsx:103-104 |
| under CTA | `Bersifat pribadi. Hanya untukmu.` | Funnel.jsx:534 (mirror), Pasangan.jsx:358 (compat) - AMENDED, see rulings |
| busy label | `Menyiapkan...` | Reyner-approved 2026-08-23 |

## The 28 ruled strings, as LIVE now (from lib/site/copy.js) - rule amendments in the last column
| # | Slot | Where | Live string | Amendment |
|---|---|---|---|---|
| 1 | `home_mirror_label` | Home card 1 title | Bacaan Diri | |
| 2 | `home_mirror_sub` | Home card 1 sub | Pahami polamu sendiri. Gratis. | |
| 3 | `home_compat_label` | Home card 2 title | Kompatibilitas | |
| 4 | `home_compat_sub` | Home card 2 sub | Dinamika dua orang, dibaca dari dua tanggal lahir. | |
| 5 | `page_title` | /kompatibilitas H1 | Bacaan Kompatibilitas | |
| 6 | `page_lead` | header paragraph under H1 | Bacaan personal tentang bagaimana dua pola bertemu: tarikan, gesekan, unsur penyeimbang, ritme harian, dan dinamika hubungan kalian. | AMENDED, see rulings |
| 7 | `includes_1` | check list 1 | Inti diri kalian berdua dan dinamika hubungannya | |
| 8 | `includes_2` | check list 2 | Kursi pasangan di bagan masing-masing saat saling bertemu | |
| 9 | `includes_3` | check list 3 | Elemen yang saling memengaruhi di antara kalian | |
| 10 | `includes_4` | check list 4 | Pola hubungan: Cermin, Serumpun, atau Kontras | |
| 11 | `includes_5` | check list 5 | Kuadran tarikan dan ritme, plus peta dinamika: poin penguat, area gesekan, dan komitmen masing-masing | |
| 12 | `price_note` | under Rp 39.000 | Sekali bayar. Hasil tersimpan dalam satu tautan yang bisa dibuka kapan saja. | |
| 13 | `form_a_legend` | card 1 eyebrow | Kamu | |
| 14 | `form_b_legend` | card 2 eyebrow | Dia | |
| 15 | `form_email_label` | email label | Email | |
| 16 | `form_email_help` | under email | Hanya dipakai untuk membuka kembali bacaan jika tautan hilang. Tidak ada email yang dikirim. | field KEPT; AMENDED, see rulings |
| 17 | `form_submit` | CTA | Lanjut ke Pembayaran | |
| 18 | `season_gate_b_intro` | season gate about B | Tanggal lahirnya bertepatan dengan pergantian musim. Jawab sebisamu, atau tanyakan langsung kepadanya jika ragu. | |
| 19 | `pending_title` | after CTA, unpaid | Menunggu Konfirmasi Pembayaran | |
| 20 | `pending_body` | under it | Halaman ini otomatis diperbarui setelah pembayaran diterima. Tidak perlu memuat ulang. | |
| 21 | `paid_title` | report top (DROPPED by Addendum 2) | Bacaan Kalian Sudah Siap | DROPPED |
| 22 | `link_keep` | report link box | Simpan tautan halaman ini. Ini satu-satunya akses ke bacaan kalian, tanpa akun dan tanpa kiriman email. | |
| 23 | `unpaid_resume` | returning unpaid | Bacaan ini belum dibayar. Selesaikan pembayaran untuk membukanya. | |
| 24 | `report_badge_eyebrow` | over P4 block | Pola Hubungan | |
| 25 | `report_quadrant_eyebrow` | over P5 block | Tarikan & Ritme | |
| 26 | `notfound_title` | 404 | Bacaan Tidak Ditemukan | |
| 27 | `privasi_email` | /privasi | Alamat email disimpan hanya untuk mengakses kembali bacaan jika tautan hilang. Kami tidak pernah mengirim pesan ke email tersebut atau membagikannya. | AMENDED, see rulings |
| 28 | `privasi_second_person` | /privasi | Data tanggal lahir orang kedua disimpan khusus untuk bacaan ini. Data tidak dipakai untuk membuat profil terpisah dan akan ikut terhapus jika bacaan dihapus. | |

| 29 | `sales_closed_title` | /kompatibilitas, sales closed | Belum Tersedia | |
| 30 | `sales_closed_body` | under it | Pembelian sedang ditutup sementara. Bacaan yang sudah dibayar tetap bisa dibuka lewat tautannya. | |

Flagged by Reyner on the walk: #6 page_lead (wordy), #21 paid_title (dropped by Addendum 2).

**29 and 30 ADDED BY CODE, 2026-09-09, and they are not part of the ruled 28.** They are Cowork
drafts from the Y-2 table that shipped EARLY in Y-1, because Y-1 is what closed sales and a closed
shop needed something to say the moment it closed. **They are live on production right now** - they
are what katon.app/kompatibilitas shows today - so a sheet titled "every static string a buyer sees"
that omitted them would have Reyner rule an incomplete set. Verified against `lib/site/copy.js`
rather than transcribed:

    rows parsed: 28 -> mismatches: 0 -> live slots not on the sheet: 2

## Y-2 drafts (Cowork, swept) - in pasangan-copy-rulings.md under "Y-2 strings"; plus new section labels:
| Slot | Draft |
|---|---|
| `section_core` | `Inti Diri` |
| `section_seat` | `Kursi Pasangan` |
| `section_element` | `Unsur` -> RULED `Penyeimbang Unsur` |
| `section_pattern` | `Pola Hubungan` (= report_badge_eyebrow) |
| `section_rhythm` | `Tarikan & Ritme` (= report_quadrant_eyebrow) |
| `section_close` | `Penutup` -> RULED `Peta Dinamika` |
| (others) | `Inti Diri`, `Kursi Pasangan`, `Pola Hubungan`, `Tarikan & Ritme` RULED as drafted |
