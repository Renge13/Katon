# CLAUDE.md — Katon

This file is the source of truth Claude Code reads. If anything here conflicts with
older notes, an installed skill, or prior context, **this file wins.**

## Product

Katon (katon.app). Indonesian self-pattern webapp. Birthdate → BaZi (八字 Four
Pillars) reading shown as a shareable card + free portrait, with a paid tier
(Rp 49.000) unlocking domain-specific "prescription" readings. Positioned as a
self-discovery / reflection lens, not predictive astrology.

## Locked decisions (do NOT re-litigate or reintroduce)

1. **Name: Katon / katon.app.** Not RENA, not dirimu.id, not DIRIMU.
   ⚠️ `dirimu` is also the Indonesian word for "yourself" and appears throughout
   the COPY (e.g. "inti dirimu"). NEVER purge it from user-facing copy. Only remove
   the brand-name artifacts: `package-lock.json` name, the legacy `dirimu-*.png`
   export filename/slug, baked-in `rena.io`/`rena` in template images, stray brand
   comments.
2. **Methodology: PURE BaZi (八字).** No Weton / Javanese / pasaran / day-names.
   (Audit confirmed the code is already clean here — nothing to purge.)
3. **Exactly 10 archetypes**, one per Day Master stem (甲乙丙丁戊己庚辛壬癸).
   Not 35. (Already true in code.)
4. **NO AI / LLM API AT RUNTIME.** All copy is hand-written, deterministic, stored
   as static data. Same birthdate → same reading, always. Zero per-user token cost.
5. **Paywall MUST be server-gated.** Paid copy must NEVER reach the browser before
   payment is verified server-side. (Current Vite SPA ships paid content free —
   this is THE thing the migration fixes.)
6. **Voice: "old friend who knows you well."** Casual everyday Indonesian
   (ngerasa, bikin, kayak, gitu aja, capek, inget encouraged). Sharecard = no
   subject pronoun; reading = "kamu". No mystical-cosmic words (alam semesta,
   energi kosmis, ramalan, takdir), no bossy prescriptions ("kamu harus").

## Stack (decided)

Next.js 15 (App Router, JS to match repo) + Supabase (Postgres) + Xendit QRIS +
Vercel. (React 19, kept from the Vite app — Next 15 is the React-19 release.)
Production deploys on Vercel project `katon` (katon-eta.vercel.app); the old `rena`
project is deprecated.
Migration verdict: **B — fresh Next.js scaffold, heavy reuse.** Same repo
(`Renge13/Katon`). Port `lib/bazi/` and presentational components verbatim; build
orchestration + server layer + server-gated paywall new. Keep old Vite `src/` as
reference until 丙 renders end-to-end, then delete in cleanup.

## The paid content schema — 7 fields, 5 beats (THE spec)

Free tier = recognition ("ini gw banget"). Paid tier = understanding + direction
("oh gitu toh" + "jadi gw harus..."). A deeper *description* does NOT justify the
price — the reframe and the decision rule do. Every paid domain reading has:

1. `polanya` — the pattern tied to the CHART MECHANISM (e.g. missing Wood = no
   fuel → burns own reserves). The "why" behind the "what". ~2-4 sentences.
2. `yangSebenernyaKejadian` — **THE REFRAME (most important beat).** The hidden
   driver under the visible behavior ("kamu kira lagi sayang, padahal lagi beli
   rasa aman"). This is the *understanding* she pays for. ~2-3 sentences.
3. `gimanaIniMuncul` — 3-4 concrete observable scenes (array). Keeps depth
   "ini gw banget", not abstract.
4. `yangNgabisin` + `yangNgisi` — turn element theory into a PEOPLE/SITUATION
   filter she can use tomorrow (the draining type vs the feeding/missing-element
   type).
5. `caraMutusinnya` + `decisionRule` — **THE PRESCRIPTION.** A concrete,
   archetype-specific test for the stuck decision. `decisionRule` is the
   highlighted one-liner. MUST differ per archetype. End by returning agency.

Render as 5 beats (4 is one section split into drains/feeds; 5 is one section with
the rule highlighted), NOT 7 equal blocks.

**The complete 丙/Matahari reference (all 3 domains, fully written) is in
`lib/content/bing.js`.** All 9 other archetypes are written to match that bar and
shape. Do NOT ship the old 5-field `deepInsight` content (pola/simpul/bentukHidup/
saatMenguras/yangStabilkan) as paid copy — it's the old description-tier value;
keep it only as tone reference.

## Funnel (one scrolling page, state-driven)

`input → [~2.5s anticipation pause] → sharecard → free read → bridge → paywall → [pay] → unlocked`

- Input: birthdate only (jam lahir optional — BaZi doesn't need it). Optional
  "lagi kepikiran apa" (Hubungan/Karier/Rezeki) selects which domain unlocks first
  AND which of the 3 bridge questions fires (must swap to match; hardcoding is a
  bug). Assurance line under the button.
- Anticipation pause: calc is instant; show ~2.5s staged "Ngitung empat pilarmu…
  / Nyari elemen intimu… / Nyusun polamu…" BEFORE the sharecard reveal. NOT before
  unlock.
- Sharecard first: 3 dimension lines (three-shapes rule), Share/Save here, 9:16
  PNG export.
- Free read: siapa kamu → **Empat Pilarmu + komposisi energimu** (missing/dominant
  element = sharpest personalization) → pola dasar + cara kamu hadir.
- **FREE-CHART BOUNDARY (spec ruling).** The chart — Four Pillars + element
  composition — renders in the FREE reading, but with **neutral, descriptive
  labels AND neutral data only**: stems/branches, element names, polarity,
  per-element glosses that describe the ELEMENT (not the person), and
  dominant/thinnest markers. Element bars ship **`pct` (ratio) only** — the raw
  weighted counts (`value`) are NOT in the payload, so counts never reach the
  client. ALL interpretive/prescriptive copy (the `explanation`, hourNote, and
  every paid beat) stays PAID. The chart is server-derived, not paid prescription
  content, so it is included in the free `/api/reading` payload — but it must never
  carry an evaluative sentence. (Boundary lives in the DATA, not just the labels.)
- Bridge: the domain-matched question. Names the live decision, withholds answer.
- Paywall: teaser = first 1-2 sentences of the REAL domain reading, cut
  mid-sentence on the `yangSebenernyaKejadian` beat + a FROSTED PLACEHOLDER (not
  the real locked text) + 八字 credibility line + price. Price NEVER shown naked:
  anchor ("konsultasi biasanya Rp 300-500rb; ini Rp 49rb selamanya") + greyed
  "Rp 249rb/tahun — Segera" decoy. Ask WhatsApp number only AFTER "Buka/Bayar".
- Unlocked: brief "Lagi nulis bacaanmu…" pause OK here → blur lifts because REAL
  content arrives from /full. Send WA with katon.app/r/<token>. Other 2 domains
  locked-but-visible = upsell loop.

## Secure architecture (non-negotiable)

```
Supabase reading { id text PK (CSPRNG token), day_master, element_variant,
  domain, paid boolean default false, wa_number, created_at }

POST /api/reading           -> compute chart, resolve element_variant SERVER-SIDE,
                               insert row (CSPRNG id), return {token, freeContent}
GET  /api/reading/[id]      -> free content + bridge + teaser (always; safe)
GET  /api/reading/[id]/full -> paid content ONLY IF paid===true (server check); else teaser
POST /api/pay/[id]          -> create Xendit QRIS invoice, store wa_number
POST /api/webhook/xendit    -> VERIFY signature/callback-token FIRST -> paid=true -> send WA
```

- `id` is a CSPRNG token (nanoid/crypto.randomUUID), never sequential. URL = bearer
  key. No accounts/passwords for MVP.
- `paid` flips ONLY in the verified webhook, never from any client path.
- `element_variant` resolved SERVER-SIDE at reading creation (not client) so it
  can't be tampered with; persisted on the row so /full recomposes deterministically.
- Paid content (`paidDomains` in `lib/content/*.js`) imported ONLY by the /full
  route so Next never bundles it client-side. VERIFY via build output / network tab
  that paid text is absent until /full with paid=true.
- No service/secret keys in any client bundle — server-only env vars.

### Phase 4 split (do these as SEPARATE steps)
- **4a — payment + security (critical):** Xendit QRIS invoice; signed webhook with
  signature/token verification before trusting "paid"; webhook is IDEMPOTENT
  (double-fire is harmless, WA-send fires ONCE); client shows a
  "menunggu konfirmasi pembayaran" PENDING state while paid=false-but-invoice-exists.
  Test forging an unlock (call /full while paid=false; replay unsigned webhook) —
  must fail.
- **4b — cleanup (trivial):** brand-name purge (see decision #1), confirm 10
  archetypes, deploy/domain change ONLY with owner confirmation, remove old Vite
  `src/` once 丙 renders end-to-end.

## Pricing (locked)

- Rp 49.000 per domain reading, forever. NEVER shown naked — always anchored.
- One domain per purchase (the one she picked = peak intent). Other two show
  locked-but-visible after = warm upsell (~Rp 29K each / ~Rp 79K all three). Don't
  bundle all three into first price; don't use three cold paywalls.
- Rp 249rb/year: decoy only for now; DO NOT build (no renewal logic until a
  time-bound 流年/大运 layer exists).

## Reference / test

- Reyner's chart: `1989-09-13` → day pillar 丙子 → Day Master 丙 → Matahari,
  missing Wood, dominant Water. Use as the end-to-end smoke test.
- Validate calculator against Joey Yap's calculator: 15-20 birthdate/Day-Pillar
  test pairs.
- Virality metric: new sessions ÷ completed readings (K-factor proxy). Instrument
  `reading_completed` + `share_button_tapped` (Plausible/PostHog).
