<!--
STATUS: SUPERSEDED 2026-08-02 — all decisions CLOSED and landed. Kept as the decision trail only.
Landed in: glossary.json (arketipe + tag_arketipe), CLAUDE.md rule 23 amendment, PROGRESS.md
DECIDED 2026-08-02. Move this file to docs/archive/ at the next tidy.
FINAL: Jati/The Teak, Bambu/The Bamboo, Matahari/The Sun, Api Unggun/The Bonfire, Gunung/The
Mountain, Taman/The Garden, Besi Tempa/The Forge, Permata/The Jewel, Samudra/The Ocean, Embun/
Morning Dew. 30 tags as in Decision 2 below with swaps TAKTIS, PENYAYANG, LUGAS, VISIONER applied.
EN layer scoped to names + tags + card strings; reading body stays Indonesian. tags_en still pending.
-->

# Archetype names + fixed tags — decision sheet (CLOSED)

## Reyner's rulings so far (2026-08-02)

1. Unmentioned rows = agreed as recommended.
2. English display layer wanted: "English things become more legit and more marketable here."
   Cowork counter-proposal: SCOPE IT to names + tags + card strings, not the full glossary
   (double-authoring 49 entries + a second Stage-6 style pass for a body text the target demo
   reads in Indonesian anyway). `[REYNER]` to confirm scope.
3. Beringin KILLED — never associate with politics. Jati proposed by Reyner.
4. Tanah Subur rejected for 己 — needs a better word.
5. Tag swaps accepted: TAKTIS, PENYAYANG, LUGAS, VISIONER. PEMILIH reclaim stands.

## The "The" question — answered, tarot precedent

Major Arcana mixes "The Sun / The Tower / The Star" with bare "Death / Temperance / Justice /
Strength". Convention: concrete objects take "The", abstractions go bare. All ten Katon archetypes
are concrete objects, so "The" works everywhere — "The Bamboo" reads as a fable card, which is the
right register. Mixed The/bare is also legitimate if one name is better bare (see 癸).

---

## Decision 1 — the 10 archetype names

| DM | Element | Nama (ID) | Status | Name (EN) — proposal `[REYNER]` | Note |
|----|---------|-----------|--------|--------------------------------|------|
| 甲 | Kayu Yang | **Jati** | PROPOSED by Reyner, endorse strongly | The Teak | Endorsement: premium heirloom wood, classical 甲, paints, and the free pun — *jati diri*. The card is about identity; the name self-demonstrates. EN flag: "Teak" is furniture-wood in English, but the EN layer targets Indonesian eyes, where Teak still reads as jati. |
| 乙 | Kayu Yin | **Bambu** | DECIDED | The Bamboo | |
| 丙 | Api Yang | **Matahari** | DECIDED | The Sun | |
| 丁 | Api Yin | **Api Unggun** | DECIDED | The Bonfire | |
| 戊 | Tanah Yang | **Gunung** | DECIDED | The Mountain | |
| 己 | Tanah Yin | OPEN — Taman / Sawah / Oase | `[REYNER]` | The Garden / The Rice Field / The Oasis | Rec: **Taman**. Curated place where things grow and people rest; urban-compatible; and it CORRECTS the salah_dikira (people think you are mudah diatur — a gardener is the one deciding what deserves to grow). Sawah: terasering imagery is beautiful but rural-coded for the demo. Oase: coolest EN, least classical. |
| 庚 | Logam Yang | **Besi Tempa** | DECIDED | The Forge | EN flag: "The Forged Iron" is clunky. "The Forge" is the cool version but shifts object (the fire that shapes vs the metal shaped). Bare tarot-style "Forged Steel" is the honest alternative. `[REYNER]` |
| 辛 | Logam Yin | **Permata** | DECIDED | The Jewel | "The Jewel" reads richer than "The Gem". `[REYNER]` |
| 壬 | Air Yang | **Samudra** | DECIDED | The Ocean | |
| 癸 | Air Yin | **Embun** | DECIDED | Morning Dew | EN flag: "The Dew" is thin. Bare "Morning Dew" is stronger; mixing one bare name into nine "The" names has direct tarot precedent. `[REYNER]` |

---

## Decision 2 — the 30 fixed tags. DECIDED 2026-08-02.

Final set with Reyner's four swaps applied. All 30 distinct, keyboard-only, no slang, rendered
uppercase on the card. English tag column left open pending the scope ruling.

| DM | Nama | Tag 1 | Tag 2 | Tag 3 |
|----|------|-------|-------|-------|
| 甲 | Jati* | TEGUH | MENAUNGI | KONSISTEN |
| 乙 | Bambu | LUWES | ULET | TAKTIS |
| 丙 | Matahari | HANGAT | BERSEMANGAT | TERBUKA |
| 丁 | Api Unggun | PEKA | SETIA | PENYAYANG |
| 戊 | Gunung | KOKOH | ANDAL | TENANG |
| 己 | (open)* | SABAR | TELATEN | MENGAYOMI |
| 庚 | Besi Tempa | TEGAS | TANGGUH | LUGAS |
| 辛 | Permata | TELITI | ANGGUN | PEMILIH |
| 壬 | Samudra | DINAMIS | GIGIH | VISIONER |
| 癸 | Embun | JELI | HALUS | PENGERTIAN |

*pending the two open name rows; the tags themselves are decided and name-independent.

---

## The English display layer — proposed system, awaiting scope ruling

**What it is NOT:** a translation of the reading. The body stays Indonesian.

**What it is:** `name_en` (and later `tags_en`) fields in `glossary.json`, keyed by stem like
everything else. The card renderer takes a display variant: `id` (default) or `en-name` (English
name + English tags, Indonesian everything else). Display choice is a card-visual-system decision
and an A/B candidate on share rate — do not lock it now.

Why this is nearly free: the glossary IS already a display-name lookup keyed by stem, and the
renderer contract already mandates a `target_language` field (PROGRESS, architecture). The engine
never sees display names.

Consequences to accept if adopted:
1. Rule 23 ("Indonesian name first, English in brackets once") needs a one-line amendment for the
   card surface. `[REYNER]` ruling, logged in CLAUDE.md when made.
2. Every EN string is register-reviewed by Reyner same as Indonesian. English that misses is worse
   than no English.
3. The EN names must be the SAME OBJECT as the ID names (same watercolour). No species swaps.

---

## Where the decisions land (so this file can be deleted)

1. **Names** -> `glossary.json`: `arketipe_kandidat` becomes `arketipe`, `{ name_id, name_en }` per
   stem, note updated to DECIDED with date.
2. **Tags** -> new `tag_arketipe` key in `glossary.json`, keyed by stem (one file serves card +
   reading). Alternative — hardcoding in the card component — splits content across code and content.
3. Rule 23 amendment if the EN layer is adopted.
4. This sheet is then superseded and moves to `docs/archive/`.
