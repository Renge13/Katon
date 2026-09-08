<!--
STATUS: APPLIED. Reyner, 2026-09-08 (28 strings). Cowork drafted, Reyner ruled, Cowork swept.
Supersedes the APPLIED-AS-DRAFTED version of this file (Code applied the drafts the same day; this
ruling REPLACES those values). Lands on main ALONE before the PR that applies it (the #28 ruling).

APPLIES TO: 4 SITE_COPY.home_*, 22 PASANGAN_COPY, 2 SITE_COPY.privasi.* = 28 slots, all ids pasangan_*.
NO SCRIPT APPLIES THIS: substitute by hand, verbatim; npm run check:copy and the verbatim verifier
from #105 are the proof.

ONE AMENDMENT (rule 20, keyboard characters only): link_keep as ruled carried an em-dash. Replaced by
a colon. Reyner to confirm; every other string is byte-for-byte his.

SWEEP: compiled as lib/validate/style.js:63, 70 patterns. 0 hits after the amendment (the em-dash was
the only finding), 0 non-keyboard characters. Falsifiers 4/4 (cenderung, selaras, sangat cocok,
Kondisi ini).

FOUR STRINGS ARE PROMISES: form_email_help, link_keep, privasi_email, privasi_second_person.
privasi_second_person promises deletion "jika bacaan dihapus" - true once the manual deletion
procedure covers pair rows (Y-1 ledger item). If email sending or deletion behaviour changes, all
four change in one commit.
-->

# Compatibility UI copy - RULED 2026-09-08

| Bank | Slot | Ruled string |
|---|---|---|
| SITE_COPY | `home_mirror_label` | `Bacaan Diri` |
| SITE_COPY | `home_mirror_sub` | `Pahami polamu sendiri. Gratis.` |
| SITE_COPY | `home_compat_label` | `Kompatibilitas` |
| SITE_COPY | `home_compat_sub` | `Dinamika dua orang, dibaca dari dua tanggal lahir.` |
| PASANGAN_COPY | `page_title` | `Bacaan Kompatibilitas` |
| PASANGAN_COPY | `page_lead` | `Bacaan personal tentang bagaimana dua pola bertemu: tarikan, gesekan, unsur penyeimbang, ritme harian, dan dinamika hubungan kalian.` |
| PASANGAN_COPY | `includes_1` | `Inti diri kalian berdua dan dinamika hubungannya` |
| PASANGAN_COPY | `includes_2` | `Kursi pasangan di bagan masing-masing saat saling bertemu` |
| PASANGAN_COPY | `includes_3` | `Elemen yang saling memengaruhi di antara kalian` |
| PASANGAN_COPY | `includes_4` | `Pola hubungan: Cermin, Serumpun, atau Kontras` |
| PASANGAN_COPY | `includes_5` | `Kuadran tarikan dan ritme, plus peta dinamika: poin penguat, area gesekan, dan komitmen masing-masing` |
| PASANGAN_COPY | `price_note` | `Sekali bayar. Hasil tersimpan dalam satu tautan yang bisa dibuka kapan saja.` |
| PASANGAN_COPY | `form_a_legend` | `Kamu` |
| PASANGAN_COPY | `form_b_legend` | `Dia` |
| PASANGAN_COPY | `form_email_label` | `Email` |
| PASANGAN_COPY | `form_email_help` | `Hanya dipakai untuk membuka kembali bacaan jika tautan hilang. Tidak ada email yang dikirim.` |
| PASANGAN_COPY | `form_submit` | `Lanjut ke Pembayaran` |
| PASANGAN_COPY | `season_gate_b_intro` | `Tanggal lahirnya bertepatan dengan pergantian musim. Jawab sebisamu, atau tanyakan langsung kepadanya jika ragu.` |
| PASANGAN_COPY | `pending_title` | `Menunggu Konfirmasi Pembayaran` |
| PASANGAN_COPY | `pending_body` | `Halaman ini otomatis diperbarui setelah pembayaran diterima. Tidak perlu memuat ulang.` |
| PASANGAN_COPY | `paid_title` | `Bacaan Kalian Sudah Siap` |
| PASANGAN_COPY | `link_keep` | `Simpan tautan halaman ini. Ini satu-satunya akses ke bacaan kalian: tanpa akun dan tanpa kiriman email.` |
| PASANGAN_COPY | `unpaid_resume` | `Bacaan ini belum dibayar. Selesaikan pembayaran untuk membukanya.` |
| PASANGAN_COPY | `report_badge_eyebrow` | `Pola Hubungan` |
| PASANGAN_COPY | `report_quadrant_eyebrow` | `Tarikan & Ritme` |
| PASANGAN_COPY | `notfound_title` | `Bacaan Tidak Ditemukan` |
| SITE_COPY.privasi | `privasi_email` | `Alamat email disimpan hanya untuk mengakses kembali bacaan jika tautan hilang. Kami tidak pernah mengirim pesan ke email tersebut atau membagikannya.` |
| SITE_COPY.privasi | `privasi_second_person` | `Data tanggal lahir orang kedua disimpan khusus untuk bacaan ini. Data tidak dipakai untuk membuat profil terpisah dan akan ikut terhapus jika bacaan dihapus.` |

## Y-2 strings (Cowork drafts, ship under the 2026-09-08 chrome process ruling; Reyner amends in place)

| Slot | Draft |
|---|---|
| `nav_mirror` | `Bacaan Diri` |
| `nav_compat` | `Kompatibilitas` |
| `step_1` | `Kamu` |
| `step_2` | `Dia` |
| `step_3` | `Email` |
| `step_next` | `Lanjut` |
| `step_edit` | `Ubah` |
| `summary_time_unknown` | `jam tidak diisi` |
| `copy_link` | `Salin tautan` |
| `copy_link_done` | `Tautan tersalin` |
| `rendering_title` | `Menyusun Bacaan Kalian` |
| `rendering_body` | `Biasanya kurang dari satu menit. Halaman ini otomatis diperbarui.` |
| `error_title` | `Ada yang Salah` |
| `error_body` | `Bacaan belum bisa ditampilkan. Coba muat ulang; jika masih gagal, hubungi hello@katon.app dengan tautan halaman ini.` |
| `sales_closed_title` | `Belum Tersedia` |
| `sales_closed_body` | `Pembelian sedang ditutup sementara. Bacaan yang sudah dibayar tetap bisa dibuka lewat tautannya.` |
| `home_link` | `Beranda` |
