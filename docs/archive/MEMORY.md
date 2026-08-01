# Katon — Project Memory (canonical)

**Product:** Katon (katon.app). Indonesian self-pattern webapp. BaZi (八字 Four Pillars) under the
hood, positioned as a self-discovery / reflection lens, not predictive astrology.

> This is the single canonical project doc. It supersedes and absorbs the older RENA-era files
> (SESSION_HANDOFF.md, project_8b_pilot.md, project_bank_9d_extended.md) and the v2 skill docs.
> Those can be deleted — the still-useful engineering notes from them are folded in below.

---

## Locked decisions

1. **Name:** Katon (katon.app). Not dirimu.id, not DIRIMU, not RENA.
2. **Methodology:** PURE BaZi (八字). Weton / Javanese calendar / pasaran / day-names **removed
   entirely** — no engine, no label, no credibility signal, no references anywhere.
3. **Archetypes:** exactly **10**, one per Day Master stem (甲乙丙丁戊己庚辛壬癸). Not 35 (Weton artifact).
4. **Voice [CHANGED 2026-06-19, v5.2]:** polished **baku** register — articulate, warm but composed,
   proper Indonesian, always "kamu". NO prose slang (ngerasa/bikin/kayak/capek/rame banned in brand
   prose), no chat particles, no literary excess. **This supersedes the earlier "old friend / casual
   everyday Indonesian" lock** (the RENA-era voice pivot). Authority that sees her, not a buddy.
   Sharecard = no subject pronoun; reading = "kamu". EXEMPTION: quoted inner voice (bridge, beat-6)
   stays conversational — it mimics the user, not the brand. Full spec + rationale in interpreter §8.
5. **NO AI API AT RUNTIME.** Everything deterministic. All copy (10 archetypes × free + 3 paid
   domains) is **manually written, fully controlled, stored as static data**. Same birthdate → same
   reading, always. Core business decision: zero per-user token cost = profitable from first sale.
6. **Paid domains:** **3** — Hubungan, Karier, Rezeki. Health/Tubuh cut (avoidance topic).
7. **Free/paid boundary:** description is free, prescription is paid. Free = the portrait
   (recognition, "ini gw banget"). Paid = understanding + direction ("oh gitu toh" + "jadi gw
   harus..."): the 5-beat prescription structure — polanya / yang sebenernya kejadian (the reframe) /
   gimana ini muncul / yang ngabisin vs yang ngisi / cara mutusinnya (the decision rule). A deeper
   *description* does NOT justify the price; the reframe + the decision rule do. See interpreter skill
   for the full spec + the complete Matahari worked archetype.

---

## Stack (decided)

- **Framework:** Next.js 14 (App Router) — over the RENA Vite/React codebase because paywall
  security REQUIRES server-side content gating, which a pure SPA can't do safely. Next.js API routes
  give the webhook handler + gating endpoint in one project, one Vercel deploy.
- **DB:** Supabase (Postgres) — reading records + paid flag. No OTP/login needed for MVP (the reading
  URL is the bearer key).
- **Payments:** Xendit, QRIS. Universal Indonesian standard (GoPay/OVO/DANA/ShopeePay/all banks).
  Lowest friction for Rp 49K impulse. Midtrans = acceptable alt; do not re-litigate.
- **Hosting:** Vercel.
- **Calc engine:** port deterministic BaZi calculator from RENA / sxtwl-validated logic. Validated
  vs Joey Yap (gold standard). BaZi does NOT need birth hour.
- **Re-entry:** unguessable reading URL (katon.app/r/<token>) via WhatsApp. No accounts/passwords.

Ports cleanly from RENA: calculator math + interpretation data structures. Does NOT port: Vite shell
(no server gating), RENA voice, Weton concepts, the 8b/Refleksi chapter system (replaced by 3-domain
paid structure).

---

## The funnel (one scrolling page, state-driven)

input → [anticipation pause] → sharecard FIRST → free read → bridge question → paywall → [pay] → unlocked

- **Input:** birthdate only (jam lahir optional). Optional "lagi kepikiran apa"
  (Hubungan/Karier/Rezeki) pre-selects which domain unlocks first AND which bridge question fires.
  Assurance line under the button.
- **Anticipation pause (~2.5s):** calc is instant, but a manufactured pause framed as *reading her*
  ("Ngitung empat pilarmu / Nyari elemen intimu / Nyusun polamu") builds anticipation before the
  spike. BEFORE the reveal, never before the unlock.
- **Sharecard first:** 3-second dopamine spike + shareable object. Three-shapes rule. Share/Save at
  the peak.
- **Free read:** siapa kamu → komposisi energimu (missing/dominant element = sharpest
  personalization) → pola dasar + cara kamu hadir (compress to one block; mobile scroll length is a
  known weak point).
- **Bridge:** domain-matched question (3 per archetype) — names the live decision, withholds the
  answer. Input selection picks which fires. (Hardcoding to Hubungan is a bug.)
- **Paywall:** frosted REAL teaser (first 1-2 sentences only) cut mid-sentence + 八字 credibility +
  Rp 49.000 + then QRIS. Sequence: price+blur+credibility first, ask WhatsApp only AFTER "Bayar".
- **Pay:** QRIS scan. On verified webhook (server-side), unlock.
- **Unlocked:** "Lagi nulis bacaanmu..." micro-pause OK here → blur lifts because real content
  ARRIVES from server. WA link sent = re-entry + receipt + viral channel. Other 2 domains stay
  locked = next open loop (soft upsell).

---

## Psychology beats
- **"ini gw banget" (Barnum done right):** name a behavior, let her supply the feeling. Vary sentence
  shape across the 3 card lines (flat / turn / scene).
- **Credibility = authority:** surface 八字 at the paywall.
- **Curiosity gap (Loewenstein):** named personally-important question + withheld answer = urge to
  pay. Bridge question is the priming dose.
- **Ostrich effect:** Health cut.
- **Anticipation:** slow build before reveal, instant gratification at unlock.

---

## Pricing (locked)
- **Rp 49.000** — one domain reading, forever. Core SKU. NEVER shown naked — always with an anchor
  (research: an un-anchored price is where pricing fails; too-low reads as low quality).
  - Anchor 1: "sekali konsultasi biasanya Rp 300-500rb; punyamu sekali bayar, selamanya."
  - Anchor 2: the Rp 249rb/year tier shown as a greyed "Segera" decoy beside 49rb (makes 49rb feel
    small). Mark coming-soon honestly; do NOT fake-sell it.
  - The FREE TIER carries the quality signal — prestige framing only works if every element is
    consistent. If the card/free read feel cheap, no price works.
- **Paid structure: one domain per purchase, other two as warm upsell.** She picks her concern at
  input → that domain is the Rp 49K unlock (peak intent). After reading, the other two show
  locked-but-visible = next open loop. Upsell ~Rp 29K each or ~Rp 79K for all three. Do NOT bundle
  all three into first price (throws away cheapest second sale); do NOT use three cold paywalls
  (triples friction).
- **Rp 249.000/year** — DO NOT build yet. One-time self-portrait has no renewal logic. Only justified
  once a time-bound layer (流年/大运) exists. Defer. (Time layer = new deterministic copy, still no AI.)
- **Compatibility report** (later) — own price (~Rp 49-79K), two charts. After share rate validated.

---

## Secure MVP architecture (simple, hack-resistant)

The RENA "generate all upfront, frontend-blur" approach is INSECURE — DevTools strips CSS blur. Paid
text must never reach the browser before payment.

1. **Reading ID = server-generated unguessable token** (CSPRNG, nanoid/UUID → /r/8x3kf9). URL is the
   bearer key. Unguessable = no enumeration.
2. **Payment state server-side**, keyed to reading ID (paid:false default). Frontend can NEVER set it.
3. **Verify the Xendit webhook** (callback token/signature) before trusting any "paid" event. THE
   security linchpin. NON-NEGOTIABLE.
4. **Content endpoint gates server-side:** GET /api/reading/:id/full returns paid content only if
   paid===true; else teaser only. Frontend asks; server decides.
5. **Content is static, not generated.** Pre-written copy per archetype → "unlock" = server returns
   already-written JSON. No generation, no token cost, instant. Blur = UI state while paid is false.

Closes: DevTools-blur hack, URL-enumeration hack, fake-webhook hack.
Frontend never holds: full paid copy (until paid), the payment-flag write, any secret keys.

---

## Validation status / next
- **Resonance** (feels accurate): partially validated (RENA felt-tests).
- **Shareability** (strangers post unprompted): **NOT validated.** The whole engine. Next experiment:
  ~20 strangers take it, measure unprompted shares.
- **Virality metric:** don't measure shares directly (screenshots untrackable, IG strips referrers).
  Measure **new sessions ÷ completed readings** (K-factor proxy). Instrument reading_completed +
  share_button_tapped (Plausible/PostHog).

---

## Skills (v3, Katon era)
- bazi-interpreter v3 — 10 archetypes + old-friend voice + paywall psychology + JSON schema.
- bazi-card v3 — sharecard spec, three-shapes rule, fixed harmony/clash hint, 3 paid domains.
- bazi-calculator — unchanged (pure math, Weton-free, Joey-Yap validated).

---

## Build sequence (recommended)
1. **Copy first (brain):** write all 10 archetypes — free read + 3 domain readings + 3 bridge
   questions each — to the v3 voice spec. This is the product.
2. **Calculator (port):** deterministic chart math into Next.js, re-validate vs Joey Yap (15-20 test
   pairs).
3. **Static flow (skin):** input → pause → card → free read → bridge → paywall, client-side, copy
   wired in. No payment yet.
4. **Gating + payment (lock):** Supabase records, unguessable URLs, Xendit QRIS, verified webhook,
   server-gated content endpoint, WA delivery.
5. **Instrument:** analytics for the virality metric.
