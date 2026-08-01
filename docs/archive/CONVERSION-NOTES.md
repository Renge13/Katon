# CONVERSION-NOTES.md — Hubungan MVP 20-cell batch

One-time markdown → JS conversion. **Markdown is source of truth; JS is a generated
artifact.** Generator: `scripts/build-content.mjs` (parses `contents/*-hubungan-FINAL.md`,
emits `lib/content/<archetype>.js` + `shared.js` + `index.js`). Prose is sliced by heading
and emitted VERBATIM — no rewording. This file lists everything flagged for founder review.
Nothing in `lib/content/` has been overwritten yet; awaiting sign-off on this surface.

Status at this gate: **20/20 cells pass all §6 hard checks; 0 failures.** Structural match
vs the frozen fixture (`scripts/fixtures/matahari.structural.js`) = PASS. All emitted files
`node --check` clean; zero static/price/label/marker leakage; all 10 cells reference the
shared constants.

---

## A. Mechanical normalization applied (no rewording — words are verbatim)

Only markdown *syntax* was touched, never prose:
- Stripped heading `#`, bullet `*`/`-`, emphasis `**`/`*`, and blockquote `>` markers.
- A fully-quoted blockquote (`> "…"`) → inner text with the wrapping `"` removed (inner-voice
  quotes: bridge, beat3 pull, beat4 sign, beat6 rule). Inline quotes inside prose (e.g.
  `"aku tidak apa-apa"`, `*"…"*` in beat6 lead) are KEPT; only the `*` emphasis is stripped.
- Beat 5 injection markers stripped: `$$…$$` (matahari-balanced) and `*(pillars … injected
  live …)*` (all others). Beat-5 body asserted digit-free.
- `[static: hourExplanation]` / `[static: closer]` and any inline equivalents → the shared
  constants `hourExplanation` / `closer` (never inlined per cell).
- Price/anchor/CTA lines (`Buka bacaan … Rp 49.000`, the two `*italic*` lines) are NOT stored
  in content — they render from `lib/pricing.js`. Generator strips + asserts they never appear
  in emitted cells.
- **FREE heading domain parenthetical normalized:** the 4 bare-format files head the third FREE
  beat `## Ke Mana Ini Bawa Kamu (Hubungan)`. The trailing `(Hubungan)` is a domain annotation,
  not a heading rename, so it is stripped before the byte-match (otherwise all 4 bare cells would
  falsely fail the locked-heading check). Affected: jati/akar/matahari/pedang-balanced. **Confirm
  this normalization is acceptable, or heal the 4 markdown headings to drop `(Hubungan)`.**

## B. Two source layouts (informational)

- **Full format (16 cells):** `**NAME modifier** · stem el` sharecard header, `**Dimension:**`
  label, `## FREE READING` / `## PAYWALL` / `## PAID READING` wrappers, `**Lead:**`, `### N ·` beats.
- **Bare format (4 cells: matahari/pedang/jati/akar-balanced):** no header line, no `**Dimension:**`
  label, no `## FREE READING`/`## PAYWALL` wrappers, no `**Lead:**`, bare `## N ·` beats. These are
  older scaffold files; the gaps below all trace to this format.

## C. matahari.js prose diff (regenerate from markdown — YOUR active sign-off, C2/C1)

Structural shape identical. `states.balanced` prose fields that differ (current shipped JS →
regenerated-from-markdown). `keMana` and `beat7` are byte-identical (not listed). Amplified state
is newly added (no prior JS to diff).

1. **`card.dimension`** — GENUINE DRIFT (markdown sharecard was rewritten; ending changed):
   - CURRENT: `…Orang-orang betah berada dekat denganmu, bahkan sering kali tanpa mereka pahami
     alasannya. Namun, ada satu hal yang kerap luput dari perhatian mereka: sebagai sosok yang
     selalu membagikan kehangatan, kamu pun adakalanya rindu untuk diperhatikan.`
   - NEW: `…Orang-orang betah berada dekat denganmu, sering kali tanpa mereka pahami alasannya.
     Kamu yang selalu memastikan semua orang merasa aman. Tapi kapan terakhir kali ada yang
     memastikan hal yang sama untukmu?`
2. **`paywallTeaser.lead`** — CURRENT `Ada alasan yang sangat masuk akal…` → NEW `` (empty). Bare
   format has no `**Lead:**` in markdown; render skips an empty lead. See flag D-3.
3. **`beat5.hourNote`** — old inline paragraph → canonical `hourExplanation` constant (C1, expected).
4. **`closer`** — old inline paragraph → canonical `closer` constant (C1, expected).

**Decisions needed:** bless #1 (dimension rewrite) and #2 (drop the lead / or supply one). #3/#4
are the agreed canon swap.

## D. Flags by category (29 total; none block the build)

**D-1 · Modifier taken from HTML comment (3)** — bare format has no sharecard header, so the
modifier came from the comment `Modifier:` line. Confirm each:
- jati-balanced → `Berbatang Tegak` · akar-balanced → `Menjalar Luwes` · pedang-balanced → `Terhunus Siaga`

**D-2 · Modifier §0 exception (1)** — matahari-balanced has NO modifier anywhere in markdown;
reused the shipped `yang Teduh`. Per C2, after sign-off the confirmed modifier must be written
BACK into `matahari-balanced-hubungan-FINAL.md` so markdown is complete and self-sufficient.

**D-3 · Paywall lead missing (4)** — no `**Lead:**` in jati/akar/matahari/pedang-balanced;
emitted `lead: ''` (teaser renders without a lead line). Supply leads or accept the omission.

**D-4 · FREE heading parenthetical normalized (4)** — see §A last bullet (jati/akar/matahari/pedang-balanced).

**D-5 · Static drift vs canonical (2, expected)** — matahari-balanced inlines an hourExplanation
and a closer that differ from the founder-canonical constants. Canon wins in output; drift flagged
per your rule (never silently pick).

**D-6 · beat3 pull-quote absent (14, by design)** — 6 cells have a beat-3 `>` reveal quote
(hujan-amp, jati-bal, ladang-amp, matahari-bal, pedang-bal, samudra-bal); the other 14 don't
(verified against the markdown — not dropped). `beat3.pull` is optional; render skips it. Emitted
as `pull: ''` where absent.

**D-7 · Sharecard header artifact (1)** — `samudra-balanced` header reads
`**MATAHARI → SAMUDRA Berarus Dalam** · 壬 Air` (copy-paste slip from the matahari template).
Modifier best-effort-extracted as `Berarus Dalam`. Founder will fix at source after the batch
(NOT auto-fixed here).

## E. §6 validation — all 20 cells PASS

Checks (hard-fail, enforced in the generator): locked 7 paid + 3 FREE headings byte-match ·
accordion[0/1/2] titles byte-equal paid beats 3/4/6 (emitted as shared refs → cannot drift) ·
hourExplanation/closer/price/anchor resolve to shared constants (never inlined) · 3 FREE + 7 PAID
structure · beat2 scenes non-empty · beat4 drain+feed+sign · beat6 rule · no em-dash in prose ·
no `BIKIN`/`Bikin Tenang` (casual lowercase `bikin` is allowed voice) · no `rezeki`. Coverage: all
10 stems have `balanced.hubungan` (fallback target) and all 20 (stem,state) present. Feed/drain
card arrays agree with beat-4 prose names (0 mismatches).

Run `node scripts/build-content.mjs --out <dir> --report` for the live table.
