<!--
STATUS: APPLIED. Reyner, 2026-09-08 (28 strings) + 2026-09-09 amendments (below).
Cowork drafted, Reyner ruled, Cowork swept. The 28 of 2026-09-08 were applied on the day; the
2026-09-09 amendments were applied by the second commit of the copy PR that lands before Y-2
commit 1 (Addendum 2 item 5), which is the commit that flipped this line.

APPLIES TO: 4 SITE_COPY.home_*, 22 PASANGAN_COPY, 2 SITE_COPY.privasi.* = 28 slots, all ids pasangan_*
+ 2026-09-09: 2 PASANGAN_COPY amendments (page_lead, form_email_help), 1 SITE_COPY.privasi amendment
(privasi_email), 1 PASANGAN_COPY drop, 6 chrome section slots, 2 shared JSX strings (mirror AND compat).
NO SCRIPT APPLIES THIS: substitute by hand, verbatim; npm run check:copy and the verbatim verifier
from #105 are the proof.

TWO AMENDMENTS TO link_keep, AND THE SECOND CLOSES THE FIRST.
  1. COWORK, on landing (rule 20, keyboard characters only): as ruled it carried an em-dash, replaced
     by a colon, flagged for Reyner to confirm.
  2. REYNER, 2026-09-08, confirming and amending: the colon becomes a COMMA. His wording is now the
     row below verbatim, and nothing in this file is awaiting his confirmation any more.
Every other string is byte-for-byte his and always was.

AMENDMENTS 2026-09-09 (Reyner, after walking the mock-payment preview; Cowork swept, 0 edits):
  a. page_lead REPLACED (was wordy). New value is the row below.
  b. paid_title DROPPED (Y-2 Addendum 2 item 1: one reader; report opens with page_title + engine
     pair line). Remove the slot from copy.js and from tests/compat-surface.spec.mjs PASANGAN_SLOTS;
     PasanganReport.jsx:337 goes with it.
  c. Six SECTION eyebrows RULED (Addendum 2 item 2). section_pattern and section_rhythm carry the
     SAME words as report_badge_eyebrow / report_quadrant_eyebrow. ONE SLOT EACH, not two: rename
     report_badge_eyebrow -> section_pattern and report_quadrant_eyebrow -> section_rhythm
     (PasanganReport.jsx:76,79; spec:100). A second copy of a ruled value is the cause of the next
     stale-test day (COWORK-BRIEF, rule 3 mirror). Technicality, Cowork's call under rule 9.
  d. Two SHARED strings amended in JSX (they are not in a copy bank; keep them hard-coded, do not
     create a bank for two strings). They change the MIRROR and COMPAT together.
  e. EMAIL FIELD: KEEP (Reyner, 2026-09-09). form_email_help #16 and privasi_email #27 AMENDED in
     the same ruling (four-promise rule: the address now also goes to the payment provider, so
     "hanya untuk mengakses kembali" had to go). #16 is Cowork's proposal, Reyner YES verbatim.
     #27 is Cowork's, simplified at Reyner's instruction ("simple, not verbose"); he amends in place
     if the register is off. Both swept clean.

SWEEP 2026-09-09: compiled as lib/validate/style.js:64 (`new RegExp(entry.pattern, entry.flags || 'iu')`,
only objects carrying `pattern`), 70 patterns. Falsifiers 4/4 fired (cenderung, selaras, sangat cocok,
Kondisi ini). 11 ruled strings: 0 hits, 0 non-keyboard characters, 0 dash/curly/?, 0 `bukan X tapi Y`,
0 3-gram overlap with the ruled 28 or the Y-2 drafts.

FOUR STRINGS ARE PROMISES: form_email_help, link_keep, privasi_email, privasi_second_person.
privasi_second_person promises deletion "jika bacaan dihapus" - true once the manual deletion
procedure covers pair rows (Y-1 ledger item). If email sending or deletion behaviour changes, all
four change in one commit. The new under-CTA string ("Hanya bisa diakses via tautanmu") is a FIFTH
promise of the same family: true while access is token-only and no email is sent.
-->

# Compatibility UI copy - RULED 2026-09-08, amended 2026-09-09

| Bank | Slot | Ruled string |
|---|---|---|
| SITE_COPY | `home_mirror_label` | `Bacaan Diri` |
| SITE_COPY | `home_mirror_sub` | `Pahami polamu sendiri. Gratis.` |
| SITE_COPY | `home_compat_label` | `Kompatibilitas` |
| SITE_COPY | `home_compat_sub` | `Dinamika dua orang, dibaca dari dua tanggal lahir.` |
| PASANGAN_COPY | `page_title` | `Bacaan Kompatibilitas` |
| PASANGAN_COPY | `page_lead` | `Peta dinamika dua pola: tarikan, titik gesekan, dan ritme harian kalian.` |
| PASANGAN_COPY | `includes_1` | `Inti diri kalian berdua dan dinamika hubungannya` |
| PASANGAN_COPY | `includes_2` | `Kursi pasangan di bagan masing-masing saat saling bertemu` |
| PASANGAN_COPY | `includes_3` | `Elemen yang saling memengaruhi di antara kalian` |
| PASANGAN_COPY | `includes_4` | `Pola hubungan: Cermin, Serumpun, atau Kontras` |
| PASANGAN_COPY | `includes_5` | `Kuadran tarikan dan ritme, plus peta dinamika: poin penguat, area gesekan, dan komitmen masing-masing` |
| PASANGAN_COPY | `price_note` | `Sekali bayar. Hasil tersimpan dalam satu tautan yang bisa dibuka kapan saja.` |
| PASANGAN_COPY | `form_a_legend` | `Kamu` |
| PASANGAN_COPY | `form_b_legend` | `Dia` |
| PASANGAN_COPY | `form_email_label` | `Email` |
| PASANGAN_COPY | `form_email_help` | `Diperlukan untuk pembayaran dan untuk membuka kembali bacaan jika tautan hilang. Tidak ada email yang dikirim.` |
| PASANGAN_COPY | `form_submit` | `Lanjut ke Pembayaran` |
| PASANGAN_COPY | `season_gate_b_intro` | `Tanggal lahirnya bertepatan dengan pergantian musim. Jawab sebisamu, atau tanyakan langsung kepadanya jika ragu.` |
| PASANGAN_COPY | `pending_title` | `Menunggu Konfirmasi Pembayaran` |
| PASANGAN_COPY | `pending_body` | `Halaman ini otomatis diperbarui setelah pembayaran diterima. Tidak perlu memuat ulang.` |
| PASANGAN_COPY | ~~`paid_title`~~ | DROPPED 2026-09-09 (was `Bacaan Kalian Sudah Siap`). Remove slot, render, and spec entry. |
| PASANGAN_COPY | `link_keep` | `Simpan tautan halaman ini. Ini satu-satunya akses ke bacaan kalian, tanpa akun dan tanpa kiriman email.` |
| PASANGAN_COPY | `unpaid_resume` | `Bacaan ini belum dibayar. Selesaikan pembayaran untuk membukanya.` |
| PASANGAN_COPY | `section_pattern` (was `report_badge_eyebrow`) | `Pola Hubungan` |
| PASANGAN_COPY | `section_rhythm` (was `report_quadrant_eyebrow`) | `Tarikan & Ritme` |
| PASANGAN_COPY | `notfound_title` | `Bacaan Tidak Ditemukan` |
| SITE_COPY.privasi | `privasi_email` | `Alamat email dipakai untuk pembayaran dan membuka kembali bacaan jika tautan hilang, tidak untuk yang lain. Kami tidak pernah mengirim pesan ke email tersebut.` |
| SITE_COPY.privasi | `privasi_second_person` | `Data tanggal lahir orang kedua disimpan khusus untuk bacaan ini. Data tidak dipakai untuk membuat profil terpisah dan akan ikut terhapus jika bacaan dihapus.` |

## Report section eyebrows - RULED 2026-09-09 (Y-2 Addendum 2 item 2)

Small eyebrow over every report block; the big serif headline under it is the glossary `name_id` of
the block's primary fact, never a model heading. Chrome strings, PASANGAN_COPY.

| Slot | Ruled string | Over |
|---|---|---|
| `section_core` | `Inti Diri` | P1 |
| `section_seat` | `Kursi Pasangan` | P2 |
| `section_element` | `Penyeimbang Unsur` | P3 |
| `section_pattern` | `Pola Hubungan` | P4 (same slot as the badge eyebrow above) |
| `section_rhythm` | `Tarikan & Ritme` | P5 (same slot as the quadrant eyebrow above) |
| `section_close` | `Peta Dinamika` | P7 penutup |

## Shared with the mirror - RULED 2026-09-09 (hard-coded JSX, both products change together)

| Where | Was | Ruled string |
|---|---|---|
| `components/BirthFields.jsx:119` helper under Jam lahir | `Jamnya saja sudah cukup. Bacaanmu tetap akurat tanpa ini, tapi kalau ada, beberapa lapisan jadi lebih dalam.` | `Tanpa jam tetap akurat, pakai jam jauh lebih presisi.` |
| `components/Funnel.jsx:534` AND `components/Pasangan.jsx:358` under CTA | `Bersifat pribadi. Hanya untukmu.` | `Privat. Hanya bisa diakses via tautanmu.` |
| `components/Funnel.jsx:664` helper under the season gate's hour | `Jamnya saja sudah cukup. Dengan ini kamu juga mendapat pilar keempat.` | `Jam lahir membuka pilar keempat.` |

The third row is RULED 2026-09-09, after #112 flagged it as the one "Jamnya saja" the
2026-09-09 sweep did not cover: a different sentence on a different surface, so no ruling reached
it and #112 deliberately left it alone. With the hour-only picker (Y-2 Addendum 2 item 4) "jamnya
saja sudah cukup" describes a constraint the field now enforces on its own, so it says nothing.
It lands in the SAME commit as the picker, with this row and the test that reads it.

Unchanged and confirmed on the same walk: `Tanggal lahir`, `Jam lahir · opsional`, `Jenis kelamin ·
opsional`, `Perempuan` / `Laki-laki`, `Menyiapkan...`.

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

## Email strings - RULED 2026-09-09 (amendment e), record of the change

| Slot | Was (2026-09-08) | Now |
|---|---|---|
| `form_email_help` | `Hanya dipakai untuk membuka kembali bacaan jika tautan hilang. Tidak ada email yang dikirim.` | `Diperlukan untuk pembayaran dan untuk membuka kembali bacaan jika tautan hilang. Tidak ada email yang dikirim.` |
| `privasi_email` | `Alamat email disimpan hanya untuk mengakses kembali bacaan jika tautan hilang. Kami tidak pernah mengirim pesan ke email tersebut atau membagikannya.` | `Alamat email dipakai untuk pembayaran dan membuka kembali bacaan jika tautan hilang, tidak untuk yang lain. Kami tidak pernah mengirim pesan ke email tersebut.` |

Why: on the walk Reyner asked "what is the email for?"; the old #16 answered recovery only and hid
the reason the field exists (payment providers require a payer email). The old #27 said "hanya" and
"tidak ... membagikannya", both untrue once the address is passed to the payment provider. Nothing is
open in this file.
