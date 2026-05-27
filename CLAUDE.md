# KATON — emotional reflection webapp

Personal project. Brand history: **DIRIMU → RENA → KATON** (current). The previous rebrand to RENA stalled when `rena.id` turned out to be unavailable; current brand is **KATON** with domain `katon.app`. Live at https://rena-id.vercel.app today; cutover to `katon.app` is in progress (GitHub repo rename `Renge13/Rena` → `Renge13/Katon`, Vercel project rename, DNS — all done outside Claude). Old URL 307-redirects to new once cutover completes. The filesystem path is still `D:\claude-projects\rena` for now (renaming to `katon` is optional cleanup).

**Brand positioning (KATON, rebranded from RENA, originally DIRIMU):**
KATON is a **modern emotional reflection brand** that quietly uses BaZi / Four Pillars behind the scenes but does **NOT** lead with metaphysics terminology in marketing surfaces. Brand feel: serene, emotionally intimate, literary, psychologically elegant, premium. Visual: watercolor on textured cream paper, "Muji + premium psychology journal + watercolor editorial design + Apple-level polish". The product is positioned as a reflective lens, not fortune-telling or astrology.

Inner pages (post-form) retain light BaZi vocabulary (`EMPAT PILARMU` section header, sharecard Chinese characters like `丙火 · API`) as aesthetic signature — brand discipline applies to **landing surfaces only**.

**Critical identity note**: this is a **personal** project on Reyner's personal GitHub (`Renge13`), not the Cata work account (`reynercata`). Local repo has `user.email = reynersoendojo@gmail.com` and `user.name = Reyner Soendojo` so commits attribute correctly even though the default global identity is the work one. Never push under work credentials; never amend git config globally from this repo.

---

## Current state (handoff snapshot)

**Latest commit on `main`**: see `git log --oneline -5`. The recent arc:
- **Image-overlay sharecard pilot landed for 丙** — new component `BaziCardImage.jsx` + `BaziCardImage.css` overlays dynamic copy on a pre-baked watercolor template PNG at `public/cards/matahari-template.png`. Card 390×693 display, exports 1080×1920 PNG via `html-to-image` (in `src/utils/exportCardImage.jsx`). Demo at `/?cardDemo=1` (route check in `src/main.jsx`). Pilot toggle `USE_IMAGE_CARD` in App.jsx (default false). Legacy `BaziCard.jsx` untouched. Expand-to-9-archetypes is the next big task.
- **RENA → KATON rebrand (in progress, current)** — code-string sweep done: wordmark on landing + sharecard, `package.json` name, HTML title, export filename defaults (`rena-matahari.png` → `katon-matahari.png`), `BaziCardImage` CSS class (`.rena-card-image` → `.katon-card-image`), comments in App.css + Navbar.jsx. Outside Claude: GitHub repo rename `Renge13/Rena` → `Renge13/Katon`, Vercel project rename + custom domain `katon.app`, `git remote set-url origin`, optional filesystem rename `D:\claude-projects\rena` → `D:\claude-projects\katon`. The sharecard template at `public/cards/matahari-template.png` still bakes in a `rena.io` footer; user is regenerating the template with `katon.app` footer (and the other 9 archetype templates while at it).
- **DIRIMU → RENA rebrand (superseded, partial)** — identity sweep (`Dirimu`/`DIRIMU`/`dirimu` → `RENA`/`RENA`/`rena` in user-facing strings, `package.json`, HTML title, sharecard Zone 1 eyebrow) and homepage redesign (new minimal navbar with Home + Methodology stub, reflection-first hero `Kamu punya pola.` + `Dan mungkin selama ini, kamu belum pernah melihatnya.`, dropped `Ba Zi · 八字` chrome from landing, CTA `Lihat Empat Pilarku →` → `Lihat Refleksiku`, static watercolor bloom background, form labels Title Case). Inner pages unchanged (`EMPAT PILARMU`, `KOMPOSISI ENERGIMU`, sharecard Chinese characters all stay — brand discipline applies to landing surfaces only). Most of this work carried forward into KATON; only the brand word was swapped.
- **Phase 7d landed** — pillarMeanings.js audit. Two surgical fixes: `year['己']` swapped `selalu` → `sering` (banned forecast word slipped through Bank 9e), and all 10 `day[*]` entries softened from declarative opener `Inti dirimu adalah X` to observation-first `Inti dirimu sering tampak sebagai X` for cohesion with Phase 7c locks. Other 30 lines audited and left intact (audit, not demolish).
- **Phase 7c COMPLETE (10/10)** — reading-page surfaces (hero / identityPills / traits) now in formal+spoken register for every archetype. Batch 4 (壬 Samudra + 癸 Hujan) was the cleanest C2 delivery of the session — every drift the prompt flagged was caught and fixed in-batch, zero inline corrections needed.
- **Phase 7b COMPLETE (10/10)** with 己 catch-up (silently missed by earlier batches).
- **Sharecard layout uniformity** — `SIFAT` zone merged into Zone 4 as a 4th `DimRow` (was a standalone 76px Zone 5 that looked visually larger than KEKUATAN/SISI LAIN/DAMPAK). All four dimensions share one packed container with consistent dividers. Zone 6 grown 56→76 with bumped bottom padding so `ENERGI MENYOKONG`/`ENERGI MENGUJI` chips have breathing room from the card edge. Card total unchanged at 420px.
- **Sharecard chip relabel** — `COCOK DENGAN` / `PERLU DIJAGA DENGAN` → `ENERGI MENYOKONG` / `ENERGI MENGUJI` (element-family signal, separate from chart-specific Relasi Cabang).
- **Element note simplification** — single-paragraph format; open-loop framing lives in the Bridge alone.
- **Element note simplification** — `DOMINANT_ELEMENT` and `MISSING_ELEMENT` entries are now single-paragraph. The rhetorical-question paragraph-2 tail was stripped from all 10 entries. Open-loop framing lives in the Bridge alone.
- **Sharecard chip relabel** — sharecard now says `ENERGI MENYOKONG` / `ENERGI MENGUJI` (signals element-family, universal for the archetype). Reading-page Relasi Cabang keeps `Cocok Dengan` / `Perlu Dijaga Dengan` (chart-specific, from day branch's 六合/六冲). Identical-looking labels were collapsing the architectural distinction; tester saw the mismatch as a bug.
- **Phase 8a complete** (free tier polish + open-loop teasers, consolidated into the bridge section).
- **Phase 8b not started**: paid tier content (Karier, Cinta, Kesehatan, Rezeki) inside the unified report.

### Voice register (LOCKED — formal + spoken)

After tester feedback, voice settled on **formal Indonesian vocabulary with spoken cadence**. NOT Gen-Z casual, NOT dense literary.

- Banned casual: `nggak`, `bikin`, `ngerasa`, `udah`, `banget`, `pengen`, `mikir` (use `tidak`, `membuat`, `merasa`, `sudah`, `sangat`, `ingin`, `berpikir`).
- Banned forecast: `akan`, `pasti`, `selalu` (negation OK).
- Banned ornament: em-dashes, aphoristic compressions (`X, tapi Y` as standalone tagline).
- Universal markers OK: `kalau`, `tapi`, `jadi`, `saat`.

The smart-friend voice is "well-spoken intelligent observer" — premium signal comes from precision of insight in plain language, not ornate phrasing.

### Unified report architecture

ONE report titled "Bacaan Mendalam":
- Collapsed state = bridge section (text + 4-domain list + italic CTA link). Sits between Relasi Cabang and the expanded report. NO container, centered, italic serif.
- Expanded state = accordion with chapters. Currently 7 free chapters (pattern reflection). Phase 8b will add 4 paid directional chapters (Karier, Cinta, Kesehatan, Rezeki) inside the same report.
- Standalone `.paid-hook-card` REMOVED. All open-loop CTAs consolidated into the bridge.

### Pending C2 work

- **Phase 7e** (next): 70 Refleksi passage cores. Biggest content lift remaining in the free tier — 7 sections × 10 archetypes, each a multi-paragraph reflective passage with conditional inserts. Should be batched (probably section-by-section, 10 archetypes per batch = 7 batches).
- **Phase 8b**: paid tier content — Karier / Cinta / Kesehatan / Rezeki × 10 archetypes (~7,000-10,000 words)

### Open UX issues (lower priority)

- Old dead CSS rules in App.css (`.paid-hook-card`, `.paid-hook`, `.paid-cta`, `.archetype-teaser`) — harmless but should clean up
- 戊 bridge UI iterated commit `[next]` with italic link CTA + hairlines + ornament. If user feedback still says it feels cheap, next iteration could move further toward editorial-magazine register (drop the ornament glyph, add more vertical breathing)

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
        passages/                  # 7 banks, one per section, each keyed by stem
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
2. Form — date selectors + optional time + `Lihat Empat Pilarku →` submit (smooth-scrolls to result)
3. **Empat Pilarmu** — 4-pillar grid with `Energi Intimu` badge on day pillar, per-pillar meaning captions
4. **Persona** = sharecard (BaziCard) + Simpan Gambar (PNG download)
5. **Archetype card** — hero description + identity pills
6. **Sifat-sifatmu** — personality traits list
7. **Komposisi Energimu** — 5-element bars with plain-Indonesian meaning per element, dominant/missing prose note
8. **Relasi Cabang** — `Cocok Dengan / Perlu Dijaga Dengan` archetype chips (with emoji)
9. **Refleksi** (gated behind `Buka Refleksi →` CTA) — opens to accordion with 7 chapters
10. **Bacaan Mendalam** — gold-foil bordered paywall block

---

## Refleksi (the deep read)

7 chapters, accordion pattern (shadcn-style, single-open, Bab 1 default-open). Click any closed row to expand; previous one collapses. Click the open row = no-op.

| Bab | Section title | Source file | Purpose |
|-----|--------------|-------------|---------|
| 1 | Pola Dasar | `passages/pembukaan.js` | Orientation. Frames the archetype as metaphor. |
| 2 | Cara Kamu Hadir | `passages/caraKamuHadir.js` | Personality pattern. How this archetype shows up. |
| 3 | Pola di Hubungan | `passages/polaDiHubungan.js` | Relationship pattern. |
| 4 | Pola di Pekerjaan | `passages/polaDiPekerjaan.js` | Work pattern. |
| 5 | Hubunganmu dengan Rezeki | `passages/hubunganDenganRezeki.js` | Relationship with money (not financial advice). |
| 6 | Tubuh & Energi | `passages/polaDiTubuh.js` | Body/energy pattern (not wellness advice). |
| 7 | Refleksi Akhir | `passages/penutup.js` | Closing. Names central tension + open declarative invitation. |

**Variation structure:**
- Each section has 10 unique cores keyed by stem (`'甲' / '乙' / ... / '癸'`) → **70 unique passages site-wide**.
- Within each core, conditional inserts fire based on chart features (`missing_Water`, `fireExcess`, `doubleBranch_巳`, etc.) — defined in `report/features.js`.
- Same chart → same output (deterministic seeded `pickN`). Different charts of the same archetype can read differently.
- The ONLY content shared across all 10 archetypes is the unified Pola Dasar opener: `"Bukan ramalan tentang masa depan. Tapi cermin pola yang sering muncul tanpa kamu sadari."` That's product framing, not archetype voice.
- `prompts.js` is intentionally empty — partner directive: "deliver epiphany, not rhetorics". Renderer skips the italic prompt line when empty.

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
- **Bank 9d** — 庚 metaphor fixes (4) + systemic Penutup opener pattern rewrite (10 archetypes, "X hidup di tegangan ini:" → "Kekuatan terbesarmu sebagai X sering juga menjadi sumber kelelahannya:")
- **Bank 9c-pilot** — 己 Ladang trait audit (8 traits + 12 pills); editorial guardrail "one metaphor system per phrase" established
- **Bank 9a** — 10 person-first archetype subtitles for the card
- **Banks 1–7** — the 7 reflection sections × 10 archetypes filled (70 cores)

Pending content work:
- **Bank 9c-extended** — propagate the trait audit to the other 9 archetypes (after 己 voice locks in user review)
- Potential 9d-style metaphor audit on the other 9 archetypes' middle sections (Hubungan / Pekerjaan / Tubuh / Rezeki / Penutup) — Pedang is unlikely to be the only one with awkward stretch

---

## Recent UX evolution (most recent first)

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
