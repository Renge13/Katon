<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-03 by Cowork.
This is PROMPT I. It is CONTENT + CHROME work: own session, own PR. Never combined with engine
or payment-logic work (CLAUDE.md PR discipline).
Context: Xendit rejected account activation (ticket 2686100) for KBLI mismatch AND website
criteria. MCS Consulting is fixing the KBLI side. This prompt fixes the website side.
-->

# Prompt I — Xendit merchant-compliance chrome (footer, pricing, about, legal pages)

## Read first, in order
1. `../../CLAUDE.md` — rules 14-25 especially (one voice, keyboard chars, ethics, free is never
   gated) and the PRODUCT block.
2. `../PROGRESS.md` — current state ledger. This prompt serves its TODO #8 (Xendit KYC).
3. `lib/pricing.js` — SHIPPED (Prompt F). Import `SKUS`, `priceFor`, `isSellable` from here;
   do not re-read the F prompt as spec, the code is current.
4. `../content/_STATIC-STRINGS.md` — the home for system copy. Every new user-facing chrome
   string this prompt creates gets recorded there (it is already flagged for a one-voice +
   keyboard-chars audit; do not add violations).

## Why this prompt exists

Xendit requires the merchant website to show: (a) the legal entity behind the site, (b) products
with descriptions and pricing reachable before checkout, (c) a business description, (d) standard
legal pages. As of 2026-08-03 none exist:
`grep -ril "privasi|syarat|footer" app components` matches only `components/Sharecard.jsx`
(incidental). There is no site footer, no pricing page, no about page, no legal pages.

## Non-negotiables (from CLAUDE.md — do not re-litigate here)

- **The free reading stays ungated and complete.** The pricing page describes the paid upsells;
  it must never imply the reading itself costs money (rule: FREE is the acquisition engine).
- **Prices come from `lib/pricing.js` (`SKUS`, `priceFor`).** Never hardcode a rupiah figure in
  JSX. One source of truth; when `LAUNCH_PRICING` flips, the page follows.
- **Voice rule 20.** One composed voice, plain precise Indonesian, keyboard characters only in
  user-facing strings: no em-dash, no curly quotes. Short sentences.
- **Ethics rule 25 + positioning.** The words "ramalan", "peruntungan", "nasib" never appear.
  Katon is refleksi / pembacaan pola. This matters commercially: the Xendit reviewer must read
  this site as digital self-reflection content, not fortune telling.
- **`[REYNER]` approves every user-facing string before merge.** He is sole authority on
  register. Propose copy, flag it, do not auto-decide.

## Tasks, in commit order

### 1. Site footer (in `app/layout.js`, renders on every route)

Contents, exactly:
- `PT Katon Digital Nusantara` — must match the NIB spelling character for character.
- Registered address: `Jalan Oliander 1 Blok P Nomor 9, Sektor 1-2 BSD, Rawabuntu, Serpong,
  Kota Tangerang Selatan, Banten 15318`.
- Contact email. `[REYNER]` must choose: an @katon.app address is strongly preferred over the
  gmail on the NIB (reviewer trust). Do not merge with a placeholder.
- Links: Harga, Tentang, Privasi, Syarat, Pengembalian.
- Keep it visually quiet. The funnel is the product; the footer is compliance chrome. It must
  not compete with `Lihat Refleksiku`.

### 2. `/harga` — pricing page (this is the "catalog" Xendit asks for)

Structure, top to bottom:
1. **Refleksi Katon — Gratis.** State plainly that the full personal reading is free and
   complete. Two sentences maximum.
2. **Complete Edition** — import `priceFor('artifact')`, display as `Rp 19.000` formatted from
   the SKU table, with the list price `Rp 25.000` shown as anchor and the launch price marked
   `harga peluncuran`. Description: kartu resolusi tinggi + PDF dari bacaanmu. State that it is
   offered after the free reading.
3. **Bacaan Kompatibilitas** — import `priceFor('compat')`. Gate the buy path on
   `isSellable('compat')` from `lib/pricing.js` — it is priced but NOT sellable today (see the
   `SELLABLE_SKUS` comment in that file). Render the price with a `segera` label and no buy
   button. When Prompt E ships and compat enters `SELLABLE_SKUS`, this page follows without a
   copy change.
4. One line on payment method: QRIS via Xendit.

No countdowns, no fake scarcity. Propose all copy, flag `[REYNER]`.

### 3. `/tentang` — business description

Four short paragraphs maximum: what Katon is (refleksi personal dari waktu kelahiranmu, berbasis
metode Empat Pilar), who it is for, how it works (isi tanggal lahir, terima bacaan, opsi kartu
dan PDF), and who operates it (PT Katon Digital Nusantara). A reviewer must understand the
business in 30 seconds without entering data.

### 4. `/privasi` — privacy policy (UU PDP-aware)

Must cover, in plain Indonesian: data collected (tanggal lahir, jam lahir opsional, alamat email
jika pembayaran), purpose (menghasilkan bacaan, memproses pembayaran), that birth data is used
for computation and the reading is cached, no sale of data to third parties, processors named
(Supabase, Xendit, penyedia LLM untuk penyusunan teks), retention, and a contact for data
requests. Do not overpromise (no "kami tidak pernah menyimpan data" — we do store it).
`[REYNER]` reviews substance as well as register; this page has legal weight.

### 5. `/syarat` — terms of service

Key clauses: digital content service; the ethics boundary as a user-facing disclaimer (bukan
nasihat medis, keuangan, atau hukum; bukan pengganti keputusan pribadi); paid items are digital
goods delivered after Xendit payment confirmation; entity name and governing law Indonesia.

### 6. `/pengembalian` — refund policy

Digital goods. Proposed default, `[REYNER]` decides the actual terms: refund if the paid file is
not delivered or is defective, contact email, response window. Do not promise refunds for
"tidak puas dengan isi bacaan" — that is unbounded for a content product.

## Out of scope

- Any change to `app/api/pay`, webhook, or `lib/pricing.js` itself (Prompt F owns those).
- Compat checkout (Prompt E, not yet written).
- The dummy-account walkthrough for the Xendit reviewer — ops task, not code.
- Engine files. Do not touch anything in `lib/bazi/`.

## Acceptance checks (run before PR)

1. Keyboard-chars audit on the diff, comments exempt (rule 20):
   `grep -rnP "\x{2014}|\x{2018}|\x{2019}|\x{201C}|\x{201D}" app components lib --include="*.js" --include="*.jsx"`
   — zero hits in user-facing strings.
2. `grep -rni "ramalan|nasib|peruntungan" app components` — zero hits on the diff.
3. `grep -rn "19000|25000|29000|45000|19\.000|25\.000" app components` — zero hits outside
   imports from `lib/pricing.js` (prices only via `priceFor`).
4. Footer renders on `/`, `/harga`, `/tentang`, and the reading route (`app/r/[token]`).
5. Every new page server-renders its text content (view-source shows the copy, not a shell) —
   the Xendit reviewer must see real content without executing JS.
6. `[REYNER]` has approved every user-facing string in the diff.
7. Ledger discipline: add a dated entry to `docs/PROGRESS.md` and record the new strings in
   `docs/content/_STATIC-STRINGS.md`. Per repo convention, any code-fact written into a doc
   carries the command that produced it and the date.
