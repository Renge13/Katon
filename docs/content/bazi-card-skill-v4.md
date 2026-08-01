---
name: bazi-card
version: 4 (COMPLETE STANDALONE — replaces v3 entirely)
description: >
  Sharecard design specification for Katon (katon.app), the Indonesian BaZi self-discovery webapp.
  Use whenever designing, coding, or evaluating the shareable result card: layout, content zones,
  visual hierarchy, color, typography, the 9:16 export, and the free-vs-paid boundary. Defines what
  goes on the card, in what order, and why. PURE BaZi — no Weton, no Javanese calendar.
  Companion doc: bazi-states-and-compatibility-v4 (the element-state + feed/drain mechanics).
---

# Katon Card Design Skill (v4)

## What v4 changes from v3 (read first)
1. **Headline carries the element-STATE modifier.** Archetype + state modifier as ONE phrase
   (e.g. "MATAHARI di Balik Awan"). The modifier (Governed/Depleted/Amplified/Over-fueled/Balanced)
   is what makes two same-archetype people read differently. See companion doc.
2. **Tagline REMOVED.** The dimension paragraph does the work. Less is more.
3. **Dimensions = a short flowing Surface->Turn PARAGRAPH** (not 3 separate labeled rows as in v3).
   The 3-shapes discipline still informs the prose. The third "Ache" beat stays in the PAID reading.
4. **Talenta Bawaan zone CUT [v5.2].** The earlier v4 added a Talenta zone (3 behavioral talents);
   it is removed. Zone 3 (one Surface->Turn facet) + feed/drain carry the card. Fewer zones, less
   clutter, faster 3-second hook. (Talent content was never written; do not reintroduce without a reason.)
5. **Harmonis/Konflik (shio-based) REMOVED.** Replaced by element-based feed/drain
   ("YANG MENENANGKAN / YANG MELELAHKAN"), same state-aware rule as the paid Ngisi/Nguras. This keeps the
   whole card coherent on ONE mechanic. Shio survives only as optional caption where math aligns.
6. **Footer = "katon.app" only.** Removed top-right and bottom-left "katon · 八字" marks.
7. **Dark-mode-friendly** in-app rendering (founder uses dark mode). Export stays light watercolor.
8. **No em-dashes** in copy.

---

## Card Purpose (two jobs at once)
1. **Distribution** - Gen Z (15-25) posts on Story / sends in WA; friends tap, take it, share.
2. **Conversion signal** - the payer (woman 25-40) sees it, feels "this knows me," scrolls into the
   free read, hits the bridge, pays.
Lands in the first 3 seconds. Appears BEFORE the free reading in the scroll (first dopamine hit).

---

## Format Specifications
- **Primary export:** 9:16 (1080 x 1920px) PNG for Story / WA
- **In-app:** scaled to mobile (~375px wide); render legibly on dark backgrounds
- **Safe zone:** 80px padding all sides for Story posting

---

## Visual Aesthetic: Watercolor on Canvas
Light, warm, handcrafted; stands out against the dark-premium aesthetic common in the Indonesian
self-discovery space; photographs well on Stories. v4: background is an ATMOSPHERIC PAINTERLY /
REPRESENTATIONAL watercolor SCENE per archetype (NOT an abstract wash - representational tested
stronger for emotional resonance and shareability), FULL-BLEED behind all zones, possibly tinted by
state. Portrait orientation for the 9:16 art zone.

**Base colors:**
```
Card background:  #FEFCF8   Card border: #E4DAD0   Dividers: #EDE5DC
Text primary:     #3A2E24   Text secondary: #5A4A3A  Muted: #A8927E
Pill bg: #FBF7F3   Pill border: #E0D4C8
```
(For dark-mode in-app view, invert surface tokens while keeping element accents; export PNG stays light.)

**Element palettes (per Day Master):**
```
Fire  丙丁:  Deep #8B3A1A · Mid #C4622A · Wash #FDDCB0
Wood  甲乙:  Deep #2E5C2E · Mid #5A8F4E · Wash #D4EACB
Water 壬癸:  Deep #2A4E5C · Mid #5A8898 · Wash #CBE0EA
Earth 戊己:  Deep #5A4E3A · Mid #8A7A5E · Wash #E8E0D0
Metal 庚辛:  Deep #4A4E56 · Mid #787A82 · Wash #DCE0E8
```
Deep = archetype name + dimension accent. Mid = element label + state modifier. Wash = art tint + pill fills.

**Typography:**
```
Archetype name:   Serif, 30-40px, Element Deep, all-caps, tracking +2
State modifier:   Serif italic, ~22px, same Element family (lighter weight) - reads as ONE phrase with the name
Element label:    Sans, 11px, Element Mid, tracking +1.5
Dimension prose:  Sans, 14-15px, text-primary, flowing paragraph
Zone labels:      Sans, 10px, UPPERCASE, tracking +1.5, muted
Feed/drain names: Sans, 14-15px (feeds = element-mid tone; drains = a warm alert tone)
Footer:           Sans, 10px, muted
```

---

## Card Content Zones (v4)

### Zone 0 - Header
Birth date as legitimacy anchor (e.g. "13 SEP 1989"). Birth HOUR shown only if provided. Layout must
look intentional when hour is absent (most users have no hour).

### Zone 1 - Element label
Small: "丙 · API" (Element Mid). The real BaZi anchor. No large standalone Chinese character (clutters).

### Zone 2 - Identity (the 3-second hook)
ARCHETYPE NAME (serif, all-caps, Element Deep) + STATE MODIFIER (serif italic, same color family) as
ONE phrase. e.g. "MATAHARI di Balik Awan". No mid-dot between them. NO tagline.

### Zone 3 - Dimensions (the "ini gw banget" zone)
A short flowing PARAGRAPH, Surface -> Turn:
- **Surface:** what others see / the visible strength (flatters).
- **Turn:** the gap underneath, ending on a hook that hints there is more.
The third beat (the Ache / the wound) is WITHHELD - it lives in the paid reading. The card flatters
to earn the share; the reading reveals to earn the sale.
Still obey the spirit of the THREE-SHAPES rule inside the prose: vary sentence shape (an observation,
a turn, a small scene); never the monotonous "{positive} tapi {negative}" repeated - that Barnum
rhythm breaks the spell. NAME A BEHAVIOR, let her supply the feeling.

### Zone 4 - Feed/Drain (replaces v3 Harmonis/Konflik)
Two short blocks. Element-based, state-aware (see companion doc), MUST agree with paid Ngisi/Nguras.
```
YANG MENENANGKAN  -> [archetype names that feed this state]   + optional one-line why
YANG MELELAHKAN   -> [archetype names that drain this state]  + optional one-line why
```
Labels are the fixed system string "YANG MENENANGKAN / YANG MELELAHKAN" (baku, brand-consistent — no
per-archetype metaphor variants; the old casual "bikin panas" style is retired in v5.2). Lead with ARCHETYPE NAMES (drives "which are you?" sharing -> friend gets their own card),
not shio. Optional secondary "sering lahir tahun [shio]" ONLY where branch math genuinely aligns -
never fake it. NO universal friend/enemy framing - this is what THIS state needs, not good/bad people.

### Zone 5 - Footer
"katon.app" only.

---

## Cross-domain
The card is IDENTICAL across all 3 domains (pure identity, no domain content). Only the free reading's
bridge and the paid reading fork by domain.

---

## Free vs Paid Boundary
- **Free** = the full sharecard + the free "river" reading (Siapa Kamu / Kenapa Begini / Ke Mana Ini
  Bawa Kamu + the domain-specific Bridge). See interpreter skill. Free gives the portrait + names the
  live decision, but WITHHOLDS the driver.
- **Free stops** at the bridge (the fork she is standing at).
- **Paid** = the domain "ocean" reading (7-beat arc). Three paid domains only: Hubungan, Karier,
  Rezeki. Health/Tubuh is CUT (avoidance topic, dampens purchase).
- **Paywall UX (v4 CHANGED):** locked accordion of paid section TITLES + helper lines promising
  UNDERSTANDING/DIRECTION. Show structure/titles, NEVER blurred real content (DevTools strips blur =
  security leak; and leaked content resolves curiosity = lost conversion). v3's "frosted real content"
  approach is REPLACED. ONE CTA Rp 49.000 single domain; bundle is a POST-reading upsell.
- **Credibility:** compact "dihitung dari Empat Pilar 八字, bukan kuis" PROMISE at the paywall; the
  FULL pillars visual is the POST-payment reveal (legitimacy payoff). PURE BaZi - never mention Weton.

---

## Copywriting Rules for Card Content
1. **No subject pronoun** in identity/dimension copy (no aku/kamu/dia).
2. **Dimension prose names behaviors**, varied sentence shapes, Surface->Turn, withholds the Ache.
3. **State modifier must be an IMAGE, not the state name.** The modifier encodes the element-state as
   a concrete picture the subject can feel, NEVER the literal state label. e.g. Governed Matahari
   (Water floods the Fire) = "di Balik Awan" (sun behind clouds) — NOT "yang Tertekan". Balanced
   Matahari = "yang Teduh" (warm but shaded, steady) — NOT "yang Seimbang". The picture carries the
   meaning; "Seimbang/Tertekan/Amplified" are mechanics, banned from the headline.
4. **Archetype name UPPERCASE**, state modifier italic, as one phrase.
5. **Polished baku voice** — proper Indonesian, warm but composed, no prose slang. [v5.2 — see interpreter §8; supersedes the old "casual old friend (ngerasa/bikin/kayak/capek)" rule.]
6. **No em-dashes.**

---

## Shareability Checklist
- [ ] Archetype + state modifier legible at Story thumbnail size, reads as one phrase?
- [ ] Dimension prose varies sentence shape (no repeated "X tapi Y")?
- [ ] Does the dimension prose name behaviors (not spell out the feeling)?
- [ ] Is the Ache withheld (card flatters; wound saved for paid)?
- [ ] Is the state modifier an IMAGE (e.g. "yang Teduh", "di Balik Awan"), not the literal state name ("yang Seimbang")?
- [ ] No subject pronoun in identity/dimensions?
- [ ] Feed/drain leads with archetype names; gives a reason to tag a friend?
- [ ] Feed/drain agrees with the paid reading's Ngisi/Nguras?
- [ ] Shio caption only where math aligns (or omitted)?
- [ ] Background art is a real representational watercolor scene (not abstract wash, not empty box)?
- [ ] Birth date visible (legitimacy anchor)?
- [ ] Footer says katon.app only?
- [ ] Renders legibly in dark mode (in-app) and exports light (9:16 PNG)?
- [ ] Would a 22-year-old Indonesian woman post this unironically?
- [ ] Any Weton / Javanese reference anywhere? (must be NONE)
