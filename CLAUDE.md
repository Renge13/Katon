# KATON — emotional reflection webapp

Personal project. Brand history: **DIRIMU → RENA → KATON** (current). The previous rebrand to RENA stalled when `rena.id` turned out to be unavailable; current brand is **KATON** with domain `katon.app`. Live at https://rena-id.vercel.app today; cutover to `katon.app` is in progress (GitHub repo rename `Renge13/Rena` → `Renge13/Katon`, Vercel project rename, DNS — all done outside Claude). Old URL 307-redirects to new once cutover completes. The filesystem path is still `D:\claude-projects\rena` for now (renaming to `katon` is optional cleanup).

**Brand positioning (KATON, rebranded from RENA, originally DIRIMU):**
KATON is a **modern emotional reflection brand** that quietly uses BaZi / Four Pillars behind the scenes but does **NOT** lead with metaphysics terminology in marketing surfaces. Brand feel: serene, emotionally intimate, literary, psychologically elegant, premium. Visual: watercolor on textured cream paper, "Muji + premium psychology journal + watercolor editorial design + Apple-level polish". The product is positioned as a reflective lens, not fortune-telling or astrology.

Inner pages (post-form) retain light BaZi vocabulary (`EMPAT PILARMU` section header, sharecard Chinese characters like `丙火 · API`) as aesthetic signature — brand discipline applies to **landing surfaces only**.

**Critical identity note**: this is a **personal** project on Reyner's personal GitHub (`Renge13`), not the Cata work account (`reynercata`). Local repo has `user.email = reynersoendojo@gmail.com` and `user.name = Reyner Soendojo` so commits attribute correctly even though the default global identity is the work one. Never push under work credentials; never amend git config globally from this repo.

---

## Current state (handoff snapshot)

**Latest commit on `main`**: see `git log --oneline -5`. The recent arc (most recent first).

> **Merge note (2026-05-29):** two parallel lines that both forked from `9a0fe93` were merged here. Line A = the **image-overlay sharecard pilot + RENA→KATON rebrand** (this folder's local work). Line B = **Phase 8b paid-tier + tester-2 UX cuts** (pushed to remote elsewhere). Both are now on `main`. The `USE_IMAGE_CARD` sharecard toggle and the Phase 8b `deepInsight` report path are independent and coexist.

**Line A — image-overlay sharecard + KATON rebrand:**
- **Image-overlay sharecard pilot landed for 丙** — new component `BaziCardImage.jsx` + `BaziCardImage.css` overlays dynamic copy on a pre-baked watercolor template PNG at `public/cards/matahari-template.png`. Card 390×693 display, exports 1080×1920 PNG via `html-to-image` (in `src/utils/exportCardImage.jsx`). Demo at `/?cardDemo=1` (route check in `src/main.jsx`). Pilot toggle `USE_IMAGE_CARD` in App.jsx (default false). Legacy `BaziCard.jsx` untouched. Expand-to-9-archetypes is the next big task.
- **RENA → KATON rebrand (in progress, current)** — code-string sweep done: wordmark on landing + sharecard, `package.json` name, HTML title, export filename defaults (`rena-matahari.png` → `katon-matahari.png`), `BaziCardImage` CSS class (`.rena-card-image` → `.katon-card-image`), comments in App.css + Navbar.jsx. Outside Claude: GitHub repo rename `Renge13/Rena` → `Renge13/Katon` (DONE — remote now `Renge13/Katon`), Vercel project rename + custom domain `katon.app`, `git remote set-url origin` (DONE), filesystem rename `D:\claude-projects\rena` → `D:\claude-projects\katon` (DONE). The sharecard template at `public/cards/matahari-template.png` still bakes in a `rena.io` footer (covered by the temporary `.rci-footer-overlay` hack); user is regenerating the template with `katon.app` footer (and the other 9 archetype templates while at it).
- **DIRIMU → RENA rebrand (superseded, partial)** — identity sweep and homepage redesign (minimal navbar, reflection-first hero `Kamu punya pola.`, dropped `Ba Zi · 八字` chrome from landing, static watercolor bloom background). Inner pages unchanged. Most of this carried forward into KATON; only the brand word was swapped.

**Line B — Phase 8b paid tier + tester-2 UX cuts:**
- **Path 2D shipped** (commit `9e0c1ac`) — chapters with `deepInsight` suppress the Refleksi narrative. The 8b deepInsight becomes the chapter's primary content (pola paragraph gets the drop cap, no WAWASAN LEBIH DALAM divider). Graceful fallback: archetypes without deepInsight (8 of 10) keep full Refleksi cores. Driven by tester 2 feedback: *"intinya selalu diulang2, cuman dicocoklogiin dengan asmara, pekerjaan, dsb"* — the 7-chapter `archetype × life domain` shape was inviting each chapter to restate the same thesis. Gating in `sectionFromPassage`: `paragraphs = deepInsight ? [] : parts`. UI in `Report.jsx` adds `.deep-insight--primary` mode that drops the divider when paragraphs empty.
- **Relasi Cabang cut entirely** (commit `658d80e`) — tester 2 confused by two compatibility lists (Sharecard `ENERGI MENYOKONG/MENGUJI` vs Relasi Cabang `Cocok Dengan`). For 癸丑 specifically: self-match bug (六合 partner 子's primary stem = 癸 = user's own archetype, reads as "compatible with yourself"). Same bug fires for 壬寅 / 丙申 / 丁未. Plus content mismatch in `dayBranches.js`. One compatibility surface remains: sharecard's `ENERGI MENYOKONG/MENGUJI`.
- **Bab 1 rewritten as lens-frame, not label** (commit `4222917`, R5) — all 10 Bab 1 cores reframed from "Hujan/Matahari dilambangkan sebagai..." into "Hujan di bacaan ini bukan label untuk kelembutanmu, melainkan cara melihat...". Each Bab 1 now teaches the reader how to read the next 6 chapters as a pattern observer.
- **Redundancy cuts shipped** (commit `98c2bcb`, R6+R2+R8) — universal Bab 1 opener cut from all 10 archetypes (Entry Moment now carries that framing). Duplicate identityPills trimmed for 丙 + 癸 (6 → 4 pills each). Sifat-sifatmu standalone trait list removed from App.jsx.
- **8b pilot content shipped** for 丙 (commit `7a20de4`) and 癸 (commit `9ca8ef9`, plus pola rewrite at `3234592`). 4 paid-tier deepInsight blocks per archetype: Cinta/Karier/Rezeki/Kesehatan. 5-beat anatomy: `pola` (mechanism revelation) → `simpul` (recurring contradiction) → `bentukHidup` (3 bullets) → `saatMenguras` (3 bullets) → `yangStabilkan` (3 bullets). Each pola names the UNCONSCIOUS MECHANISM, not the surface pattern.
- **Plumbing for 8b** (commit `3389424`) — `passage.deepInsight` block added to data shape; `Report.jsx` render branch with hairline + ✦ + "Wawasan lebih dalam" label + 5-beat structure. `yangStabilkan` visually distinguished with gold tint.
- **Tier-1 pilot polish** (commit `74f3459`) — Entry Moment paragraph (~55 words italic serif) between report header and accordion. 丙 Kesehatan yangStabilkan de-slopped to Matahari-specific.
- **Price tag hidden during tester validation** (commit `62964a8`) — `display: none` on `.paywall-price`. Easy revert when QRIS lands.
- **Scroll-anchor + meta cleanup** (commit `2bb3395`).
- **Bank 9d-extended COMPLETE** — 5/5 Refleksi middle-section files audited (41 swaps total): polaDiHubungan (11), polaDiPekerjaan (9), polaDiTubuh (10), hubunganDenganRezeki (6), penutup (5).
- Earlier locks (still in force): Phase 7b/7c/7d COMPLETE (reading-page surfaces formal+spoken, pillarMeanings audit), Phase 8a free-tier polish, sharecard layout uniformity + chip relabel (`ENERGI MENYOKONG`/`ENERGI MENGUJI`), element-note single-paragraph simplification.

### Tester 2 validation cycle (active)

Tester 2 is **癸 Hujan** (1992-06-06 07:44). He read the 8b pilot pre-Path 2D and flagged two issues, both addressed:
1. Self-match + label mismatch. Fixed by cutting Relasi Cabang.
2. Repetition across chapters (*"intinya selalu diulang2"*). Fixed by Path 2D.

Awaiting his second read. Scaling 8b to remaining 8 archetypes is gated on his validation.

### Voice register (LOCKED — formal + spoken)

After tester feedback, voice settled on **formal Indonesian vocabulary with spoken cadence**. NOT Gen-Z casual, NOT dense literary.

- Banned casual: `nggak`, `bikin`, `ngerasa`, `udah`, `banget`, `pengen`, `mikir` (use `tidak`, `membuat`, `merasa`, `sudah`, `sangat`, `ingin`, `berpikir`).
- Banned forecast: `akan`, `pasti`, `selalu` (negation OK).
- Banned ornament: em-dashes, aphoristic compressions (`X, tapi Y` as standalone tagline).
- Universal markers OK: `kalau`, `tapi`, `jadi`, `saat`.

The smart-friend voice is "well-spoken intelligent observer" — premium signal comes from precision of insight in plain language, not ornate phrasing.

### Unified report architecture

ONE report titled "Bacaan Mendalam" — entire 7-chapter accordion IS the paid tier (currently free-with-click, payment infra deferred):

- **Above the paywall (free):** hero → form → 4 pillars → sharecard → archetype card → Komposisi Energimu → paywall preview.
- **Paywall preview (free, locked copy):** "Beberapa pola dalam dirimu tidak selalu terlihat saat dijalani." + body promising "arah / langkah praktis" + 5 feature pills (Refleksi Diri / Arah Karier & Rezeki / Relasi & Kecocokan / Keseimbangan Energi / Langkah Praktis). Price `Rp79.000` hidden during tester validation.
- **Click "Buka Refleksiku"** (the paywall CTA, currently no payment) → expanded state.
- **Expanded state:** Entry Moment paragraph (italic serif, ~55 words, centered) → 7-chapter accordion. Scroll auto-anchors to report-body top on first open; to clicked bab on subsequent chapter clicks.
- **8b deepInsight** = optional structured block on chapters 3-6 (Hubungan / Pekerjaan / Rezeki / Tubuh). When present, it BECOMES the chapter's primary content (pola gets drop cap; no "Wawasan lebih dalam" divider). When absent (non-pilot archetypes), chapter falls back to Refleksi narrative.

### Pending C2 work

- **Phase 8b scaling** — gated on tester 2's reaction to the polished pilot (Path 2D shipped). If validated, scale 8b across remaining 8 archetypes (4 sections × 8 archetypes = 32 more deepInsight blocks, ~10k words). Same anatomy as 丙 + 癸 pilots.
- **Phase 7e DEPRIORITIZED** — was full 70-Refleksi-passage audit. Path 2D makes this less urgent for pilot archetypes (Refleksi is suppressed for chapters 3-6). Bab 2 (Cara Kamu Hadir) Refleksi cores still render unconditionally and may still feel archetype-descriptive. Revisit if tester 2 flags Bab 2.
- **`dayBranches.js` content fidelity** — the 12 branch entries were written assuming reader's element matches the branch element. Now hidden (Relasi Cabang cut), but data still emitted by `getInterpretation` for future use. Re-parameterize by stem before re-introducing.

### Open UX issues (lower priority)

- Old dead CSS rules in App.css (`.paid-hook-card`, `.paid-hook`, `.paid-cta`, `.archetype-teaser`, plus now `.relations-card` family) — harmless but should clean up
- Bab 2 (Cara Kamu Hadir) Refleksi cores still archetype-descriptive — flagged out-of-scope for current tester 2 cycle but may need rewrite if his second read still points there.

### Reading the plan history

Full strategic context across all 8 phases lives in:
`C:\Users\Reyner\.claude\plans\build-a-react-webapp-streamed-candle.md`

---

## Product positioning

A **reflective lens for emotionally intelligent skeptics** — urban millennial / Gen Z professionals, creatives, knowledge workers who use systems like MBTI / Human Design / tarot as **self-reflection interfaces**, not as oracles.

- **NOT predictive astrology.** No fortune-telling vocabulary, no "akan / pasti / selalu" forecasts.
- The product wins on emotional resonance, identity articulation, narrative coherence. Never on metaphysical authority.
- Winners in this category own a **ritual**, not just content. The free reading is the ritual.
- Target reader: Indonesian female, 20s–40s, intelligent, real adult stakes (career, relationships, money). She wants to feel **seen effortlessly**. Every moment of confusion / terminology / abstraction reduces immersion.

**Two surfaces, two strategies:**
- **Sharecard** = marketing / viral distribution. Lightweight, screenshot-bait, posted to IG Story. PNG export 1080×1920 via html2canvas.
- **Free reading** = paywall hook. Deep, validating, opens a loop. Long-form reflective report engine.

Deterministic system — **explicitly no AI API at runtime**. The reflective voice generalises naturally across same-Day-Master charts via deterministic seeded selection.

---

## Stack

- Vite + React 19 (JSX, no TypeScript)
- Vercel deployment from `main` branch
- `@tabler/icons-react` for element icons
- `html2canvas` for PNG export
- `astronomia` (dev) for precomputed solar terms table
- No Tailwind, no shadcn — handwritten CSS with named tokens

---

## Architecture overview

```
src/
  App.jsx                          # main reading page
  App.css                          # site-wide styling
  index.css                        # global tokens (watercolor palette)
  lib/
    bazi/
      stems.js                     # 10 Heavenly Stems + 12 Earthly Branches data
      solarTerms.js                # precomputed solar terms 1900–2030
      calculator.js                # chart calculation (deterministic, pure)
      elementCycle.js              # 5-element generation / control cycles
      elementConfig.js             # element palette + ARCHETYPE_EMOJI map
      index.js                     # public API: calculateBaziChart, getInterpretation, getReport, runValidation
      interpretation/
        index.js                   # chart → InterpretationJSON composer
        dayMasters.js              # 10 archetype banks (name, chinese, subtitle, tagline, hero, identityPills, traits, taglineCard, kekuatan/bayangan/dampakDescriptors, sifatPills)
        dayBranches.js             # 12 branches with harmony/clash narratives
        elementImpact.js           # DOMINANT_ELEMENT and MISSING_ELEMENT prose
        paidHooks.js               # PAID_HOOK_TEMPLATE for the paywall blurb
        pickN.js                   # deterministic seeded picker
      report/
        composer.js                # chart → report (7 sections in narrative order)
        features.js                # ~15 chart-feature detectors (used by inserts)
        prompts.js                 # reflection prompts library (intentionally empty — see decisions)
        sections/                  # 7 composers, one per section
          _helpers.js              # sectionFromPassage — gates paragraphs on deepInsight presence (Path 2D)
        passages/                  # 7 banks, one per section, each keyed by stem
                                   # passage[stem] shape: { core, inserts, deepInsight? }
                                   # deepInsight shape (Phase 8b): { pola, simpul, bentukHidup[3], saatMenguras[3], yangStabilkan[3] }
  components/
    Report.jsx + Report.css        # accordion-style 7-chapter reader
    card/
      BaziCard.jsx                 # 6-zone TCG-style sharecard (was 7, Zone 3 image removed)
      WatercolorIllustration.jsx   # SVG abstract wash per element (currently unused)
  utils/
    exportCard.jsx                 # html2canvas → PNG download
scripts/
  check-copy.js                    # em-dash guard run on every commit (npm run check:copy)
  generate-solar-terms.js          # builds solarTerms.js from astronomia
```

---

## Image-overlay sharecard (current pilot)

Replaces the code-rendered `BaziCard.jsx` for 丙 (others still on legacy). The
watercolor template PNG is the full-bleed background; code overlays only the
dynamic copy in absolutely-positioned percentage-based zones.

**Files:**
- `src/components/card/BaziCardImage.jsx` + `BaziCardImage.css` — overlay component
- `src/utils/exportCardImage.jsx` — `html-to-image` export at 1080×1920
- `src/pages/CardDemo.jsx` — standalone demo with chart switcher
- `public/cards/{archetype}-template.png` — bare templates, lowercase filename, ≥1080×1920

**What's baked vs. overlaid (per template):** baked = archetype title, KEKUATAN/BAYANGAN/DAMPAK + HARMONIS/KONFLIK ghost labels, element icons, sun illustration, decorative hairlines, footer hairlines. Overlaid = top metadata, tagline, KBD body copy, element dots, italic element note, harmonis/konflik names + flavor notes, footer brand mark.

**Font system:** Spectral throughout (Google Fonts). Tagline/labels: 500 uppercase tracked. KBD body / pair note: 400 regular. Element note: italic 400. Pair names: 700.

**Footer overlay hack (temporary):** `.rci-footer-overlay` is an opaque cream-colored div (`rgb(252,245,235)` sampled from the template) that covers the baked `rena.io` text and renders `KATON.APP` on top. Delete this div + CSS rule once templates are regenerated with `katon.app` baked in.

**Calibration workflow (use this for each new archetype template):**
1. Save bare template at `public/cards/{archetype}-template.png` (lowercase) and **restart Vite dev server** (Vite doesn't HMR new `public/` files).
2. Open `/?cardDemo=1` and run pixel-scan via `preview_eval`: load template into a canvas, scan for dark warm pixels (`r<200 && g<100 && b<80`) in the left strip (x=10–30%) to find ghost-label y-centers and bottoms; scan for saturated/non-paper pixels in the icon band to find icon center x-positions.
3. Set each overlay zone's top% to label-bottom + ~0.8% for equal gaps. Set dot x-positions to detected icon centers.
4. Verify via export — `html-to-image` requires `await document.fonts.ready` (already in exportCardImage) or fonts fall back to system serifs in the PNG.

---

## Voice rules (non-negotiable)

Carried across every passage bank. Violations are bugs.

1. **Observation, never declaration.** Write what the *pattern* tends to be, not what the reader IS. Use "sering / cenderung / kadang / mungkin pernah". Avoid "kamu adalah X."
2. **Invite, don't predict.** No "akan / pasti / selalu" forecasting. (Negation is fine: "tidak pernah X" describes felt state, not forecast.)
3. **Archetype as metaphor, not fact.** The system is a **mirror**, not a destiny diagram.
4. **No mystical authority.** Banned: "alam semesta mengatur", "energi kosmis", "ramalan", "takdir". OK: "pola simbolik", "kerangka refleksi", "cermin".
5. **Hyper-specific phrases**, not single nouns. ❌ `"workaholic"` → ✓ `"kerja keras sampai lupa istirahat"`.
6. **No em-dashes** anywhere in copy. Use commas, periods, or parentheses. Enforced by `npm run check:copy`.
7. **One metaphor system per phrase.** No stacking. ❌ `"Kesetiaan yang tidak pamer, tapi selalu ada panen"` (emotion + farming collision).
8. **Sharecard surface = no subject pronoun** (no aku/kamu/dia in tagline, descriptors, subtitle). Reading surface = `kamu` is fine and expected.
9. **Section subtitle direction = person-first**, not symbol-first. ✓ `"Pribadi yang tumbuh pelan..."` ❌ `"Bumi yang menumbuhkan..."`.
10. **Plain Indonesian.** If a phrase reads as translated from English, reject it. The reader can sense it doesn't fit.

---

## The 10 Day Master archetypes

| Stem | Element | Polarity | Indonesian name | Emoji | Tegangan |
|------|---------|----------|-----------------|-------|----------|
| 甲 | Wood | Yang | Pohon Oak | 🌳 | Kekokohan vs. sulit bertumpu |
| 乙 | Wood | Yin | Tanaman Rambat | 🌱 | Kelenturan vs. lupa bentuk asli |
| 丙 | Fire | Yang | Matahari | ☀️ | Kehangatan vs. jarang ditanya butuh dihangatkan |
| 丁 | Fire | Yin | Lilin | 🕯️ | Nyala setia vs. terbakar tanpa disadari |
| 戊 | Earth | Yang | Gunung | ⛰️ | Stabilitas vs. sulit bergerak |
| 己 | Earth | Yin | Ladang | 🌾 | Kesuburan vs. lupa menyisakan panen sendiri |
| 庚 | Metal | Yang | Pedang | ⚔️ | Ketajaman vs. melukai tanpa sengaja |
| 辛 | Metal | Yin | Permata | 💎 | Standar tinggi vs. jarang merasa cukup |
| 壬 | Water | Yang | Samudra | 🌊 | Keluasan vs. sulit dipegang sendiri |
| 癸 | Water | Yin | Hujan | 🌧️ | Meresap vs. kehilangan batas |

Reyner himself is **丙 Matahari** (1989-09-13 09:00 → 丙子日). All voice locks done against his chart; he can validate against felt experience.

---

## Reading flow (App.jsx surfaces, top to bottom)

1. Hero — minimal navbar (Home + Methodology stub) → `KATON` wordmark + `Refleksi personal dari waktu kelahiranmu.` supporting line → `Kamu punya pola.` main statement + reflective sub. Replaces the old `DIRIMU` + `Empat Pilar Nasibmu` + `Ba Zi · 八字` eyebrow hero (rebranded through RENA to KATON).
2. Form — date selectors + optional time + `Lihat Refleksiku` submit (smooth-scrolls to result)
3. **Empat Pilarmu** — 4-pillar grid with `Energi Intimu` badge on day pillar, per-pillar meaning captions
4. **Persona** = sharecard (BaziCard) + Simpan Gambar (PNG download). Sharecard `ENERGI MENYOKONG/MENGUJI` is the only compatibility surface (element-cycle, universal per archetype).
5. **Archetype card** — hero description + 4 identity pills (down from 6 for 丙 + 癸 after R2 dedupe)
6. **Komposisi Energimu** — 5-element bars with plain-Indonesian meaning per element, dominant/missing prose note
7. **Bacaan Mendalam paywall preview** — locked promise copy (Beberapa pola... + 3 feature rows + 5 feature pills + CTA). Price hidden during tester validation.
8. **Click → expanded state** — Entry Moment italic paragraph + 7-chapter accordion (single-open). For 丙 + 癸 only: chapters 3-6 render the 8b deepInsight as primary content. Other 8 archetypes render full Refleksi narrative as before.

**Cuts from this section since v1:**
- Old `Sifat-sifatmu` standalone trait list — removed (R8, commit `98c2bcb`); sharecard SIFAT zone covers
- Old `Relasi Cabang` section (Cocok Dengan / Perlu Dijaga chips with branch-harmony text) — removed (`658d80e`); confusing-with-sharecard + self-match bug + Earth-voice-on-Water mismatch

---

## Refleksi (the deep read)

7 chapters, accordion pattern (shadcn-style, single-open, Bab 1 default-open). Click any closed row to expand; previous one collapses. Click the open row = no-op. Scroll auto-anchors to clicked bab via `useRef` + `useEffect` in `Report.jsx`.

| Bab | Section title | Source file | Purpose |
|-----|--------------|-------------|---------|
| 1 | Pola Dasar | `passages/pembukaan.js` | **Lens-frame** (R5 rewrite). Reframes archetype from noun (label) to verb (way of seeing). Hands off to Bab 2. |
| 2 | Cara Kamu Hadir | `passages/caraKamuHadir.js` | Personality pattern. How this archetype shows up. |
| 3 | Pola di Hubungan | `passages/polaDiHubungan.js` | Relationship pattern. **8b deepInsight if defined** (丙 + 癸 only currently). |
| 4 | Pola di Pekerjaan | `passages/polaDiPekerjaan.js` | Work pattern. **8b deepInsight if defined.** |
| 5 | Hubunganmu dengan Rezeki | `passages/hubunganDenganRezeki.js` | Relationship with money (not financial advice). **8b deepInsight if defined.** |
| 6 | Tubuh & Energi | `passages/polaDiTubuh.js` | Body/energy pattern (not wellness advice). **8b deepInsight if defined.** |
| 7 | Refleksi Akhir | `passages/penutup.js` | Closing. Names central tension + open declarative invitation. |

**Variation structure:**
- Each section has 10 unique cores keyed by stem (`'甲' / '乙' / ... / '癸'`) → **70 unique passages site-wide**.
- Within each core, conditional inserts fire based on chart features (`missing_Water`, `fireExcess`, `doubleBranch_巳`, etc.) — defined in `report/features.js`.
- Same chart → same output (deterministic seeded `pickN`). Different charts of the same archetype can read differently.
- `prompts.js` is intentionally empty — partner directive: "deliver epiphany, not rhetorics". Renderer skips the italic prompt line when empty.

**8b deepInsight (Phase 8b paid-tier deepening):**
- Optional structured block on chapters 3-6 only. Keyed by stem on each passage object: `passage[stem].deepInsight = { pola, simpul, bentukHidup[], saatMenguras[], yangStabilkan[] }`.
- 5-beat anatomy: `pola` (mechanism reveal: unconscious belief or motivation behind the pattern) → `simpul` (recurring contradiction) → `bentukHidup` (3 bullets, lived structures) → `saatMenguras` (3 bullets, early warnings) → `yangStabilkan` (3 bullets, stabilizing conditions — visually distinguished with gold tint as the load-bearing answer section).
- **Path 2D gating** (commit `9e0c1ac`): when `passage.deepInsight` is non-empty, `sectionFromPassage` returns `paragraphs: []` so the Refleksi narrative is suppressed. `Report.jsx` switches to `.deep-insight--primary` mode: no "Wawasan lebih dalam" divider, pola paragraph styled as `.report-paragraph--first` (drop cap). Reader sees only the 8b structure.
- Currently filled for 丙 + 癸 only. Other 8 archetypes fall back to full Refleksi narrative for chapters 3-6.

---

## Watercolor palette (Phase 6 lock)

Site-wide named tokens in `src/index.css`:

| Token | Hex | Use |
|-------|-----|-----|
| `--kertas` | `#F6F1E8` | Primary bg (paper cream) |
| `--kertas-2` | `#FBF7F3` | Card bg (slightly off) |
| `--tinta` | `#2A2520` | Primary text (deep ink) |
| `--tinta-soft` | `#5A4A3A` | Secondary text |
| `--kayu` | `#5B3A22` | Drop caps, archetype names, section titles |
| `--emas` | `#B08442` | Eyebrows, paywall accent, gold-foil ring |
| `--terra` | `#C56F50` | Primary CTAs, action accents |
| `--sage` | `#7C8B6F` | Cocok Dengan (harmony), Wood balance bar |
| `--senja` | `#6B7F94` | Perlu Dijaga Dengan (clash), Water balance bar |

Legacy aliases (`--ink`, `--pearl`, `--gold`) remap to the new palette so existing CSS rules continue to work. Future cleanup can deprecate.

Per-element balance bars: Wood→Sage, Fire→Terra, Earth→Emas, Metal→`#9DA1A8` (neutral slate), Water→Senja.

BaziCard inline `BASE` palette uses literal hex (not `var()`) for html2canvas PNG export reliability.

---

## Tooling commands

```bash
npm run dev                    # vite dev server (localhost:5173)
npm run build                  # production build → dist/
npm run check:copy             # em-dash guard across all copy banks
npm run generate:solar-terms   # rebuild solarTerms.js (rarely needed)
```

**Pre-commit ritual:**
1. `npm run check:copy` — must pass
2. `npm run build` — must succeed
3. Smoke-test on Reyner's chart (1989-09-13 09:00 → 丙 Matahari) via Node REPL or browser
4. Then commit + push

---

## Working with the copywriter (C2)

Content is drafted by an external copywriter referenced as "C2". The workflow for each content bank:

1. I draft a tightly-scoped prompt with voice rules, BAD/GOOD examples, exact deliverable format (single JS object), and exact existing text being replaced.
2. User pastes prompt into C2's chat.
3. User pastes C2's reply back.
4. I integrate (surgical `Edit` calls on the relevant passage files), preserve positions in arrays so deterministic `pickN` selections stay stable, run `check:copy + build + smoke`, commit, push.
5. Tester reads live. New flags become next bank's brief.

Bank history (most recent first):
- **R5 Bab 1 lens rewrite** — 10 archetypes. Bab 1 cores rewritten from archetype-paraphrase ("X dilambangkan sebagai...") to lens-frame ("X di bacaan ini bukan label untuk Y, melainkan cara melihat..."). Mix of syntax markers to avoid templating. (commit `4222917`)
- **8b 癸 Hujan pilot pola rewrite** — 8 pola paragraphs (4 domains × 2 pilot archetypes) rewritten to reveal the UNCONSCIOUS MECHANISM behind the pattern, not paraphrase Refleksi. Standouts: 丙 "ekonomi cahaya", 癸 "memahami pasangan adalah tabungan tak kasat mata against ditinggalkan", 癸 Rezeki "memasang harga adalah mengubah air yang seharusnya bebas menjadi barang yang harus dibeli". (commit `3234592`)
- **8b 癸 Hujan pilot v1** — 4 paid-tier deepInsight blocks (Cinta/Karier/Rezeki/Kesehatan, ~1400 words). 5-beat anatomy. 11 em-dashes + 5 forecast `akan` instances caught by guard and rewritten pre-commit. (commit `9ca8ef9`)
- **Tier-1 polish for 丙 pilot** — Entry Moment paragraph, 丙 Kesehatan yangStabilkan rewrite (killed wellness-app slop), gold-tint visual distinction for yangStabilkan section. (commit `74f3459`)
- **8b 丙 Matahari pilot v1** — 4 paid-tier deepInsight blocks for 丙 (Cinta/Karier/Rezeki/Kesehatan, ~1400 words). First Phase 8b content. (commit `7a20de4`)
- **8b plumbing** — `passage.deepInsight` data shape, `Report.jsx` render branch with hairline + ✦ + label + 5 beats. `Report.css` palette-matched styling. (commit `3389424`)
- **Bank 9d-extended COMPLETE** — 5/5 Refleksi middle-section files audited. 41 swaps total across polaDiHubungan (11), polaDiPekerjaan (9), polaDiTubuh (10), hubunganDenganRezeki (6), penutup (5). One metaphor system per phrase + formal Indonesian + no forecast verbs locked across all middle sections.
- **Bank 9d** — 庚 metaphor fixes (4) + systemic Penutup opener pattern rewrite (10 archetypes, "X hidup di tegangan ini:" → "Kekuatan terbesarmu sebagai X sering juga menjadi sumber kelelahannya:")
- **Bank 9c-pilot** — 己 Ladang trait audit (8 traits + 12 pills); editorial guardrail "one metaphor system per phrase" established
- **Bank 9a** — 10 person-first archetype subtitles for the card
- **Banks 1–7** — the 7 reflection sections × 10 archetypes filled (70 cores)

Pending content work:
- **8b scaling to remaining 8 archetypes** (gated on tester 2's reaction): 32 more deepInsight blocks, ~10k words. Same 5-beat anatomy. C2 brief template from pilot cycles is reusable.
- **Bab 2 (Cara Kamu Hadir) rewrite** — potentially still archetype-descriptive for pilot archetypes, would need rewrite if tester 2's second read flags it.

---

## Recent UX evolution (most recent first)

- **Path 2D** — Refleksi narrative suppressed for chapters where 8b deepInsight present. Chapter opens at the mechanism layer (pola with drop cap). Driven by tester 2 repetition feedback.
- **Relasi Cabang removed** — entire `.relations-card` section cut. Self-match bug for 癸丑/壬寅/丙申/丁未 + label confusion with sharecard ENERGI MENYOKONG/MENGUJI. Sharecard becomes the only compatibility surface.
- **Phase 8b pilot for 丙 + 癸** — 4 paid-tier deepInsight blocks per archetype with 5-beat mechanism-revelation anatomy. Entry Moment paragraph added between header and accordion. `yangStabilkan` section gold-tinted for findability. Scroll-anchor on report open + chapter click.
- **R5 Bab 1 lens rewrite** — all 10 Bab 1 cores reframed from archetype-paraphrase to lens-frame ("X di bacaan ini bukan label..., melainkan cara melihat..."). Hands off explicitly to Bab 2.
- **Redundancy audit R6+R2+R8** — universal Bab 1 opener cut, duplicate identityPills trimmed (丙 + 癸 6 → 4), Sifat-sifatmu standalone trait list removed (sharecard SIFAT zone already covers).
- **Bank 9d-extended COMPLETE** — voice polish propagated across all 5 Refleksi middle-section files (41 swaps). "One metaphor system per phrase" locked everywhere.
- **Phase 6** — full watercolor canvas redesign (palette migration, shadcn accordion for Refleksi, gold-foil paywall branding, form hug-content, scroll-to-result anchor, sharecard padding fix, footer redundancy removed)
- **Phase 5c** — accordion back-nav fix, form compact-pill submit
- **Phase 5a–b** — first tester legibility pass: archetype subtitles, person-first Ladang traits, BAYANGAN → SISI LAIN, SELARAS/PEMICU → COCOK DENGAN / PERLU DIJAGA DENGAN with archetype emoji
- **Phase 4** — long-form report engine (composer + 70 passage cores)
- **Phase 3** — TCG-style 7-zone sharecard on watercolor canvas (later reduced to 6 zones)
- **Phase 2** — initial sharecard + project relocated from C:\ to D:\claude-projects\dirimu (later renamed to D:\claude-projects\rena as part of the RENA rebrand; KATON rebrand keeps the same path for now)
- **Phase 0–1** — Vite scaffold + BaZi engine integration

---

## Out of scope (do not work on unless explicitly asked)

- **Reflection prompts library** — explicitly killed per partner directive.
- **Major luck pillars (大运) / annual luck (流年)** — paid tier, not in scope until paywall is built.
- **AI API integration** — explicitly off the table; deterministic only.
- **Mobile-specific layout passes** beyond the existing breakpoints.
- **Bundle size optimisation** — main chunk ~544 KB. Defer until users complain.
- **Real watercolor archetype illustrations** — BaziCard Zone 3 removed in Phase 6 pending real art.

---

## Defaults for any new session

- Read this file first. The plan file at `~/.claude/plans/build-a-react-webapp-streamed-candle.md` has the long historical context across all phases.
- Confirm the user wants you to write code before doing anything destructive. Default to plan mode for sizeable changes.
- For copy work: draft a tightly-scoped C2 prompt, never write Indonesian copy directly unless the user explicitly delegates it.
- Smoke chart is **1989-09-13 09:00** (Reyner, 丙 Matahari) unless the user is testing a different archetype.
- Commit attribution must be the personal identity (`reynersoendojo@gmail.com`). Push to `Renge13/Katon` (the GitHub repo rename `Dirimu` → `Rena` → `Katon` happens outside Claude; once the user runs `git remote set-url origin`, this is the canonical push target). Until the rename lands the remote may still read `Renge13/Rena` — that's fine, GitHub redirects.
- **Vite is case-sensitive on `public/` paths**, even on Windows NTFS. `/cards/matahari-template.png` ≠ `/cards/Matahari-template.png`. The fetch returns 200 OK for the wrong case but with `content-type: text/html` (Vite's SPA fallback). Always use lowercase filenames in `public/`.
- **New files in `public/` require a Vite dev-server restart** (HMR ignores them). Restart via `preview_stop` + `preview_start`, not just a browser reload.
- **`preview_screenshot` can intermittently time out** while the page is fully responsive. Fall back to `preview_eval` with DOM queries (`getBoundingClientRect`, `getComputedStyle`) for measurement — they keep working during screenshot stalls.
