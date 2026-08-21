<!--
STATUS: QUEUED BUILD PROMPT. Behind prompt L. Written by Cowork 2026-08-20 from
claude/pdf-spec-complete-edition-2026-08-19.md, AMENDED by what building a real draft found.
Where this file and that spec disagree, THIS FILE WINS: the spec was written before anything
was built, and three of its assumptions did not survive contact.
Reference artifact: Cowork's draft PDF for chart 1 (1989-09-13 09:00), 9 pages, built with
reportlab. It is NOT the implementation - production is @react-pdf/renderer per the spec.
It exists to prove the shape and to hand you the three traps below already sprung.
-->

# Prompt M — the Complete Edition PDF

Promotion precondition 2's other half. The card is closed; this is the paid artifact's second
half. **Launch scope ruled 2026-08-19: compat does not gate launch, so L and this are the whole
critical path.**

---

## FOUR CORRECTIONS. Read these before the build order.

### 1. A `label: null` fact must never be named. Not in English, not in Indonesian.

Two facts in chart 1 carry `label: null` — `element_missing_Wood` and `element_dominant_Water`.
Cowork's first draft printed their `label_bracket`, so a paid Indonesian document said
**"Missing Wood"** and **"Dominant Officer"**. The second draft "fixed" it by inventing
`Kayu yang Hilang` and `Air yang Dominan`. **Both are wrong and the repo already says so:**

```
lib/render/fallback.js:94   "A `label: null` fact is a CONDITION (a missing element is not
                             something you carry) and naming it is the exact failure the
                             prompt calls out. Preserved, never substituted."
lib/validate/fact.js:373    fact.condition_named - HARD reject when label_bracket appears,
                             and for ANY name-with-bracket construction in a block carrying
                             only unnamed conditions.
```

`fact.condition_named` **HARD** is what floored chart 5 at attempt 2 in Reyner's read. The first
draft did by hand exactly what that gate exists to stop the model doing.

**So:** a condition gets its ruled `label_meaning` and **no heading**, and it never appears in the
chart page's "what is in your chart" list, because that list is things she carries. Assert it:

```
conditions = {f.id for f in facts if f.label is None}
for entry in appendix: assert entry.key not in conditions or entry.name is None
```

### 2. Spec step 6's gate asserts MEANING present, never NAME present.

Spec §8 step 6: *"the PDF must fail loudly if any mechanic in her chart has no legend entry."*
Written naively that gate demands a name for every mechanic, which **forces correction 1's bug**.
It must assert that every mechanic contributes a `label_meaning`, and must be indifferent to
whether it has a name. Reyner ruled this explicitly on 2026-08-20.

### 3. The appendix cross-references need a FIXED POINT, and a verify that blocks the ship.

Spec §4 calls the page reference "the whole design", and it is the one part that cannot be built
in a single pass: printing `hal. N` on the chart page changes that page's height, which can push
the appendix onto a different page than the measuring pass saw. **A two-pass build can print a
reference its own second pass invalidated.**

Iterate until the page map stops moving, then verify and refuse to emit on drift. Cowork's draft
does this and prints:

```
page map converged after 1 rebuild(s)
REF VERIFY (by construction): 22/22 anchors land where printed
appendix starts on page 6; refs pointing before it: 0
text present on the claimed page: 22/22
```

**Three checks, because the first verifier was wrong.** It searched the whole PDF for the entry's
name and took the first hit — but `Pilar Kerja` appears in the reading on page 2 and in the chart
table on page 5, long before the appendix, so it reported 21 mismatches that were all its own.
Verify **by construction** (the shipped build's own recorded anchor pages must equal the map it
printed), then bound it (no ref before the appendix's first page), then spot it (the entry's text
is present on the page it claims). One check alone is not enough here.

### 4. A RULING IN THE REPO BEATS A COWORK PROMPT. ALWAYS.

**Added 2026-08-21, ruled by Reyner, and it reverses an instruction this prompt gave.**

Corrections 1-3 above are Cowork correcting its own spec. This one is Reyner correcting Cowork,
and it is the general rule the other three are instances of.

**What this prompt told you to do, and must not:** ship a Cowork-drafted 胎元 line and "do not block
on Reyner". That instructed a session to override a standing ruling of his. `glossary.json` ->
`pilar.conception._note`, ruled 2026-08-07:

> *"It has NO label_meaning on purpose: nothing downstream interprets it, and inventing one would be
> unreviewed interpretive copy. Ruled by Reyner 2026-08-07, replacing the hand-authored 'Istana
> Konsepsi' that lived in `lib/readingView.js` and in no glossary entry."*

The line this prompt hands over is that exact thing a second time, and this prompt's group order used
`Istana Konsepsi` - the very string the ruling replaced with `Pilar Konsepsi`.

**THE RESOLUTION, now the ruled behaviour:** 胎元 ships with its glossary NAME and `display_only: true`,
carrying no meaning and exempt from correction 2's gate. It is a chart-page item Joey also prints, not
a mechanic being explained, so a legend of meanings owes it none. The day Reyner writes a
`label_meaning` for `pilar.conception`, the entry starts carrying it with no code change.

**THE PRECEDENCE, stated so no future session has to derive it:** a ruling recorded in the repo beats
a build prompt written by Cowork, always, however recent or however confident the prompt is. A prompt
may correct a spec. It may not overrule Reyner. Where a prompt and a repo ruling disagree, the prompt
is the thing that is wrong, and the disagreement is worth a ledger row rather than a silent fix.

**`claude/pdf-spec-complete-edition-2026-08-19.md` has NO STANDING** and its absence from this repo is
not a gap. It is a Cowork proposal, not a ruling. This prompt is self-contained: nothing needs to be
read out of that file, and "where they disagree, this file wins" is a statement about two Cowork
documents rather than a precedence rule that matters.

---

## WHAT THE DRAFT CONFIRMED, so you do not re-litigate it

| | |
|---|---|
| Appendix from her chart only | 22 entries for chart 1, not the whole glossary. Correct and small |
| Reading verbatim from cache | The PDF authors nothing. Byte-identical to the served render |
| Page count | 9 for chart 1. A consequence, never a target |
| 胎元 | ~~Ships with the descriptive line below; do not block on Reyner.~~ **REVERSED - see correction 4.** Name only, `display_only`, no meaning invented |
| Group order | Aspek, Bintang, Elemen dan Kekuatan, Relasi Cabang, Pilar, Shio, **Pilar Konsepsi** (NOT "Istana Konsepsi" - correction 4) |
| Pillar names | From `glossary.json` -> `pilar.<k>.name_id`. Cowork hand-typed `Pilar Leluhur` and the glossary says **`Pilar Akar`**. Never hand-type a name that exists as data |

**The 胎元 line Cowork drafted, RECORDED AND NOT SHIPPED** (correction 4). Kept so the proposal stays legible and nobody re-drafts it from scratch:

> Pilar kelima, dihitung dari pilar bulanmu. Katon menampilkannya sebagai bagian dari peta, dan
> tidak membacanya sebagai bagian dari dirimu.

---

## BUILD ORDER

1. **Appendix generator.** Semantic JSON in, the used subset out. Pure data, testable with no PDF
   involved, and per the spec the piece most likely to be wrong. Correction 1's assertion lives here.
2. **Font registration + one page of her reading.** `@react-pdf/renderer` takes TTF, not woff2.
   Archivo for Latin; **Noto Serif TC, the 65-glyph subset already built for the card**, for hanzi.
   **`申` is the canary** — Google's subsetter dropped it once and the build now verifies against the
   server's own `unicode-range`. Assert it survives the PDF round trip too.
3. **Full document** — cover, reading, chart, appendix, colophon.
4. **The reference fixed point + the three verifies** (correction 3). Ship-blocking.
5. **The step-6 gate** (correction 2). The spec says this step will be skipped and should not be.
6. **Wire to checkout, with the card, as one delivery.**

**Determinism is a rule, not a preference.** The PDF reads `render_cache` and never re-renders. A
PDF that regenerates its own prose is a second reading wearing the first one's name.

## NOT IN THIS PROMPT

- **The design pass.** This is the content and structure pass. Typography, colour, cover treatment
  and the card's token system come after Reyner has signed off what the document SAYS. Do not spend
  effort on visual polish here; it will be redone.
- **The colophon copy.** Cowork drafted it from rule 25 and Reyner reads it before launch. Ship the
  draft; do not rewrite it.
- **Embedding the card image.** Spec §2 rules it out so the PDF ships independent of the card
  export path.
- **`arketipe.name_en` article work** — that is prompt L commit 0 and is already done.
