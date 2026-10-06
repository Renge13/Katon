# Prompt BE: post-purchase polish (Reyner, 2026-10-06, after the first real Rp 19.000 purchase)
Goes in the working tree as `docs/prompts/BE-post-purchase-polish.md`. Untracked until you commit it.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

One new branch off `main`, one PR, do not merge. No engine, prompt or Stage 6 change (STAGE6 stays 1.73.0; assert both prompt versions unchanged). Every user-facing string in §6 is applied verbatim as Reyner confirmed it (Cowork drafted, Reyner approved before this prompt was pasted); change nothing else. Red first wherever behaviour changes.

**Context, verified 2026-10-06:** the first production purchase (invoice `Zn-4VU2Ni2lLdcTO25aS2.muw4uwtc`, Rp 19.000, QRIS) succeeded at DOKU 10:43:14 WIB and Vercel logged `POST www.katon.app/api/doku/notify 200 [doku] reading Zn-4VU2Ni2lLdcTO25aS2: paid=true reason=ok` at 10:43:17. The notify path works in production. A second invoice (`zDK_PNEbwMDFHYhT_MI2k.muw4scin`) is Reyner's abandoned desktop checkout, PENDING; leave it.

## 0. Record
Add this prompt and a dated PROGRESS entry: gate b production half for the Complete Edition DONE by notification (quote the log line above); gate i verified (your report, 2026-10-06). The compat purchase half stays open.

## 1. Site chrome
a. **One logo.** Pages that render the KATON mark inside the page body under the header (`/harga` and the other static pages that show it twice) drop the in-page mark; the header keeps it. List every page you changed.
b. **Address.** `kontakAddressLabel` ("Alamat terdaftar", `lib/site/copy.js:329`) and its value: show only `Tangerang Selatan, Banten`. Grep every page and the PDFs for the street address and replace it the same way. Report each hit.

## 2. Writing indicator placement
`status_writing` / `status_writing_sub` (`lib/site/copy.js:1066-1067`) move from under the title to the place where the reading text will appear, and disappear when it arrives. Wording unchanged.

## 3. After payment: land on the card and download section
a. The DOKU return URL (`callbackUrlResult`, `app/api/pay/[id]/route.js`, the `?bayar=selesai` one) and the page logic bring the buyer to the card and download section, not the top of the page, once `paid` is true. Use an anchor id on that section; scroll only after the page confirms paid (the polling already does), never on the marker alone. Same for compat (`pairUrl`).
b. Under the download buttons, add Reyner's guide line (§6, string G1), shown only after paid.

## 4. Persistent pay bar, AFTER the offer has been seen
Reyner wants the pay button reachable when a reader scrolls back up. The ruled product rule is that the paid offer comes "AFTER the free reading lands. Never a gate" (CLAUDE.md PRODUCT; `/harga` says "selalu ditawarkan setelah bacaanmu selesai"). So:
- A slim bar fixed to the bottom of the screen with the price and the existing buy button label, **shown only after the reader's viewport has reached the offer section once** (IntersectionObserver), on that device, for that reading.
- It hides while the offer section itself is on screen, and disappears for good once paid.
- Never before the offer has been seen. Mirror Complete Edition only; compat is off sale.
- Mobile first; it must not cover the download buttons or the footer links. Report a screenshot at 375 px, scrolled to top after the offer was seen.

## 5. PDF footer and closing page (Complete Edition and compat)
a. Remove the provenance line from the reader-visible PDF (`chartPageFoot` in `lib/pdf/document.js` ~line 808: `katon.app - <engine> - prompt <v> - gate <v>`, and the same in `lib/pdf/pairDocument.js` if present). **Keep that provenance, but invisible:** put it in the PDF document metadata (e.g. Keywords or Subject), so support can still trace which build wrote a reading. Assert it is in the metadata and not in the page text.
b. Running footer on every page, small and grey (the existing footnote style or smaller, never larger): string F1 (§6).
c. After the glossary (the last content page), one closing page in the same small grey style, with the sections in string C1 (§6). Book-colophon feel: quiet, no new colour, no large headings.
d. Read the rendered PDFs yourself (both editions): no provenance text visible, footer on every page, closing page last, nothing overprinted. Attach page images to the PR.

## 6. Strings (verbatim, Reyner confirmed 2026-10-06)
- **G1** (download guide, shown only after paid): "Pembayaran berhasil. Ketuk tombol unduh di bawah untuk menyimpan PDF dan kartu ke perangkatmu. File akan tersimpan otomatis di aplikasi Files (folder Downloads) pada iPhone, atau aplikasi File Manager (folder Unduhan) pada Android."
  Check the claim on iPhone Safari and Android Chrome (where the PDF and the card actually land) and report what you see; change nothing, Reyner decides if it differs.
- **F1** (PDF running footer, English by Reyner's ruling): "© 2026 PT Katon Digital Nusantara. All rights reserved. | katon.app"
  Reyner's ruled exceptions, record them in §0: the "©" character (rule 20 is keyboard characters only) and English in a reader-facing string (rule 20/23). Scope: this footer only.
- **C1** (closing page after the glossary, four short sections, small and grey):
  1. **Tentang bacaan ini.** Reuse the existing `RENDER_COPY.pdfDisclaimer` text verbatim.
  2. **Privasi.** "Data kelahiranmu terlindungi dan hanya digunakan untuk menyusun bacaan ini. Kebijakan selengkapnya: katon.app/privasi."
  3. **Hak cipta.** "Bacaan ini disusun khusus untuk penggunaan pribadi. Dilarang menyebarluaskan, mereproduksi, atau memperjualbelikan isinya untuk tujuan komersial."
  4. **Kontak.** "hello@katon.app | PT Katon Digital Nusantara | Tangerang Selatan, Banten"

## 7. Report and stop
Commits, red-first runs, the 375 px screenshots (§3 landing, §4 bar), the PDF page images (§5), and the preview URL. Do not merge.
