# Katon — STATIC / SHARED STRINGS (locked, identical across ALL readings)

> These are SYSTEM copy, not reading copy. They appear in every reading, byte-identical.
> NEVER per-archetype. NEVER sent to a fluency/naturalization pass again. Write once, lock.
> For Code: store as shared constants referenced by the template, NOT inside archetype content files.

## hourExplanation  (paid Beat 5 whenever birth hour is empty — replaces old noHourNote, v5)
Soal jam lahir. Petamu dihitung dari tiga pilar: tahun, bulan, dan hari. Jam lahir menambahkan pilar keempat, yang mengungkap sisi paling pribadimu: caramu bergerak saat tidak ada yang melihat. Tanpa jam, bacaan ini tetap utuh pada polanya. Dengan jam, ia menjadi lebih tajam di lapisan yang paling dalam. Kalau suatu saat kamu tahu jam lahirmu, masukkan, dan petamu akan dihitung ulang.

## noHourNote  (DEPRECATED — replaced by hourExplanation)
Jam lahir belum diisi. Kalau nanti diisi, ada satu pilar lagi yang bisa mempertajam bacaan ini.

## closer  (ends every paid reading — v5.1 unified voice)
Ini bukan ramalan. Ini pola yang terbaca dari Empat Pilarmu, dipakai untuk pertanyaan yang sedang kamu bawa. Yang memutuskan tetap kamu.

## credibilityPromise  (paywall)
dihitung dari Empat Pilar 八字, bukan kuis

## priceAnchor  (paywall — v5.1)
Sekali konsultasi biasanya Rp 300-500rb. Punyamu sekali bayar, selamanya.

## priceCTA template  (paywall — only the domain word changes)
Buka bacaan {DOMAIN} · Rp 49.000
  → Hubungan / Karier / Uang

## fdLabels  (feed/drain naming — IDENTICAL everywhere, v5.2)
Card labels: YANG MENENANGKAN / YANG MELELAHKAN
Paid section name (beat 4 + paywall accordion): Yang Menenangkan vs Yang Melelahkan
(Exact card↔section match is deliberate. Why-lines describe EFFECT, never mechanism.
"ngisi/nguras" survive as body verbs only.)
[HISTORY: was "Bikin Tenang/Capek" (interp) and "Bikin Tenang/Panas" (card/states); unified to
"Yang Menenangkan/Melelahkan", baku + brand-consistent, 2026-06-19. Do not reintroduce "Bikin".]

## footer
katon.app

---

# SITE CHROME + STATIC PAGES (added 2026-08-03, Prompt I)

> **The strings themselves live in `lib/site/copy.js` and `lib/site/entity.js`, and are NOT copied
> into this file.** That is a deliberate departure from the sections above, for the same reason the
> registered entity name exists exactly once in the repo: legal prose duplicated into a doc drifts
> silently, and this copy would then be a second source that reads as authoritative and is wrong.
> This section is the INVENTORY and the audit trail. The bank is the text.
>
> **Audit is mechanical, not by eye.** `scripts/check-copy.js` walks `SITE_COPY` and `ENTITY` and
> fails on any banned typography, so rule 20 is enforced on every string below on every run:
> ```
> npm run check:copy
> ```
> Passing as of 2026-08-03.

> **Every page section also carries a `meta` object** (`title` + `description`) - the browser-tab
> title and the search-result snippet. These moved out of the route files into the bank on 2026-08-03
> so `check:copy` walks them; each route now reads `export const metadata = q.meta`. Titles use a
> HYPHEN, not a middle dot: `U+00B7` is on the ban list as of the same date (Reyner: rule 20 keeps
> zero exceptions).

## ENTITY - `lib/site/entity.js`
`name` / `address` / `email`. Only `name` and `email` are rendered, both in the footer and on
`/tentang`, `/privasi`, `/syarat` and `/pengembalian` via mailto links.
`name` and `address` must match the NIB COMPONENT FOR COMPONENT - not character for character, which
an earlier version of this line claimed and which was never true: the NIB sets the name in ALL CAPS
and the stored address drops the `Desa/Kelurahan`, `Kec.`, `Provinsi` and `Kode Pos:` field labels.
Checked against the NIB PDF 2026-08-03. `email` is `hello@katon.app`, forwarding to Reyner's mailbox
(his choice, 2026-08-03, over the gmail on the NIB).

## SITE_COPY.footer - `components/SiteFooter.jsx`, mounted in `app/layout.js`
`operatorLabel` / `contactLabel` / `nav[5]` (Harga, Tentang, Privasi, Syarat, Pengembalian).
Renders on EVERY route, reading route included. Verified 2026-08-03 on `/`, `/harga`, `/tentang` and
`/r/[token]` against a running dev server.
**NO REGISTERED ADDRESS, and no `addressLabel`** (Reyner, 2026-08-03). Xendit's stated website
criteria (Kira, ticket 2686100, 3 Aug) ask for a live site, a catalog with pricing and a checkout
flow, and a business description - not an entity address. `ENTITY.address` is kept for the PDF
artifact and future invoices and is rendered nowhere. Its absence is a decision, not an omission.

## SITE_COPY.harga - `app/harga/page.js`
`title` / `lead` / `launchLabel` / `listLabel` / `soonLabel` / `free.{name,price,body}` /
`artifact.{name,body,noteBefore,noteLink,noteAfter}` / `compat.{name,body,note}` / `payment` / `cta`.
**No rupiah figure is stored in the bank or in the JSX.** Numbers come from `lib/pricing.js`, and
which label a row shows is decided by `isSellable()` and by whether launch < list.
The Complete Edition note is split in three because the funnel is linked inside the sentence: this
page has no buy button, since the real offer lives at the end of the free reading, so the purchase
path has to be readable here instead (Xendit criterion 2).
**Product names are an EN tier layer** (Reyner, 2026-08-03): `Complete Edition` and
`Compatibility Reading`. Body copy stays Indonesian. The Indonesian name `Bacaan Kompatibilitas` is
retired - `grep -rni "kompatibilitas" app components lib` returns only code comments.

## SITE_COPY.tentang - `app/tentang/page.js`
`title` / `lead` / `paragraphs[3]` / `operatorHeading` / `operatorBefore` + `operatorAfter`
(split so `ENTITY.name` is composed in, never duplicated). The operator paragraph KEEPS the domicile
("terdaftar di Kota Tangerang Selatan, Banten"): with the address gone from the footer it is the
site's only entity-location tie (Reyner, 2026-08-03).

## SITE_COPY.privasi - `app/privasi/page.js`
`title` / `lead` / `updated` / `collectHeading` + `collect[5]` + `collectNote` /
`purposeHeading` + `purpose[4]` / `cacheHeading` + `cache[2]` /
`processorHeading` + `processorLead` + `processors[4]` + `processorNote` /
`retentionHeading` + `retention[3]` / `rightsHeading` + `rightsLead` + `rights[4]` +
`rightsHowBefore` + `rightsHowAfter` / `changesHeading` + `changes`.
Every factual claim was checked against the code on 2026-08-03 and the commands are recorded in the
bank's own comment block. **"kami tidak pernah menyimpan data" is forbidden here** - we do store it,
and the caching section says so.
`processorNote` carries the UU PDP cross-border transfer clause, added by Reyner 2026-08-03 in his own
words. It rests on the four providers' standard terms rather than on a signed bilateral DPA, so it
becomes false if any provider is swapped for one without them.
**`Pelindungan` in `rightsLead` is the official spelling of UU 27/2022 and must never be "corrected"**
to `Perlindungan` - doing so misquotes the statute the clause cites. A guard comment sits beside it.
Three claims here are COMMITMENTS about the future, not descriptions: no cookies or analytics, no name
or email captured, and the named model providers. See the TRIPWIRE in `PROGRESS.md`.

## SITE_COPY.syarat - `app/syarat/page.js`
`title` / `lead` / `updated` / `serviceHeading` + `serviceBefore` + `serviceAfter` /
`freeHeading` + `free` / `paidHeading` + `paid[4]` / `limitsHeading` + `limits[3]` /
`conductHeading` + `conduct[3]` + `conductNote` / `liabilityHeading` + `liability` /
`lawHeading` + `lawBefore` + `lawAfter`.
`limits` is rule 25 written as a user-facing disclaimer. It is the clause a payment reviewer reads
to decide this merchant's category, so it is stated early and plainly.
`paid[2]` promises the reading link is sent to the buyer's WhatsApp number. **`lib/wa.js` is a
provider-gated stub and cannot currently keep that promise** - see the LAUNCH GATE in `PROGRESS.md`.
The clause stays as written (Reyner, 2026-08-03); the gate is what resolves it.

## SITE_COPY.pengembalian - `app/pengembalian/page.js`
`title` / `lead` / `updated` / **`claimWindowDays`** / `freeHeading` + `free` /
`eligibleHeading` + `eligibleLead` + `eligible[4]` + `eligibleNote` /
`notEligibleHeading` + `notEligible[3]` / `howHeading` + `howLead` + `how[3]` /
`replyHeading` + `reply[2]` / `contactBefore` + `contactAfter`.
Terms confirmed by Reyner 2026-08-03: claim within 7 days of payment, reply within **3 hari kerja**
(not "3x24 jam kerja", which mixed calendar hours with business days).
**`claimWindowDays` is the single source for the claim window.** It is stated twice on the page - the
deadline to file, and the cutoff that makes a working product non-refundable - so both strings carry a
`{claimDays}` placeholder that `app/pengembalian/page.js` substitutes. Two hand-written copies of the
same number is how a policy contradicts itself.
`eligibleNote` NAMES the repairable cases rather than counting them ("tiga keadaan pertama" was a
positional reference into a bullet list, silently wrong on any reorder). A double charge is not in it:
there is nothing to repair, so it goes straight to a refund.
`notEligible[1]` promises a recomputation for a wrong birth date. **There is no code path for it** -
see the SUPPORT COMMITMENT note in `PROGRESS.md`.

## Vocabulary check
`ramalan`, `nasib` and `peruntungan` appear in NO string in the bank. The single grep hit is the
comment in `lib/site/copy.js` that states the ban. Rule 20 exempts comments, and this is the same
class of false positive as COWORK-BRIEF error 13. Run on 2026-08-03:
```
git diff main...HEAD -- app components lib | grep -niE "^\+.*(ramalan|nasib|peruntungan)"
```
