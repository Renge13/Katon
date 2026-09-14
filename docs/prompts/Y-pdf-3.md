<!--
STATUS: RELEASED 2026-09-14 by Reyner (two rulings below). Written by Cowork.
Cowork wrote this into the working tree; Code commits it FIRST, alone, on `feat/compat-pdf`.
A RULING RECORDED IN THE REPO BEATS THIS FILE, ALWAYS (Prompt M correction 4). Where this prompt and a
ruled cell, a DECIDED block, or a locked rule disagree, the prompt is the defect - ledger row, not a
silent fix.
-->

# Prompt Y-3 — the compat PDF (RELEASE precondition, Addendum 2 item 8)

Branch `feat/compat-pdf`, from main after #119. The last content precondition before promotion; after
it the chain is U (Render) -> V (DOKU) -> `?dari` -> real-money walk -> promotion.

Four checks, cited: (1) every file named below was read on the staged tree 2026-09-14 (`lib/pdf/*`,
`lib/deliver/handlers.js:179-232`, `lib/pair/serveReading.js:96-`, `lib/pdf/document.js:361-445`); (2)
every new assertion is shown red first, and the PDF instruments are the ones Prompt M already made
fail on purpose - reuse them, do not write new ones; (3) nothing here adds a gate: the PDF authors
nothing and validates nothing, it prints a cache row that already passed; (4) customer: a paying reader
gets a document she can keep, forward and reopen, which is the second half of "a link she can return
to". Nothing else in this prompt buys her anything and nothing else is in it.

## RULINGS (Reyner, 2026-09-14) — record verbatim in the repo, commit 0
R1. The compat PDF is INCLUDED in the compat price. No new SKU, no new price, no checkout change.
R2. Content: "as complete as possible: data, chart, anything." Everything the engine knows about the
pair that is reader-facing goes in - both charts, the pair facts, the reading, the glossary meanings.
Bounded only by the locked rules (no verdict, no score, no ramalan; conditions unnamed; names from the
glossary only; keyboard characters only).

## THE ONE DESIGN FACT: THIS IS THE MIRROR PDF WITH TWO CHARTS AND A FACTS PAGE
`buildCompleteEditionPdf` (`lib/pdf/build.js:76`) already does the hard part - the reference fixed
point, the three verifies, the fonts, the 申 canary, the appendix generator with correction 1's
condition rule and correction 2's meaning gate. **Reuse it. Do not write a second PDF pipeline.** The
compat document is a second COMPOSER (`lib/pdf/pairDocument.js`) fed to the SAME builder, the same way
`buildPairSemantic` is a second producer of the same contract `renderReading` consumes.

Determinism is a rule (Prompt M): the PDF reads `render_cache` and never re-renders. **A PDF that
regenerates its own prose is a second reading wearing the first one's name.**

## Commit 0 — this file, alone. Plus R1/R2 as a dated row in `docs/PROGRESS.md`.

## Commit 1 — the builder takes a composer (refactor, MIRROR BYTES UNCHANGED)
`buildCompleteEditionPdf({ chart, semanticJson, rendered })` becomes
`buildPdf({ compose, appendix, ...args })` with `buildCompleteEditionPdf` kept as a thin wrapper that
passes `completeEdition` and `buildAppendix`. Nothing about the mirror document changes.
PROOF, red first: before touching anything, dump `pageTexts()` of chart 1's Complete Edition into
`tests/fixtures/pdf-chart1-pages.json`; add an assertion that the wrapper still produces the identical
page texts; show it red by changing one style value, revert, green. This is the assertion that says
the refactor moved nothing a reader sees.

## Commit 2 — `lib/pdf/pairAppendix.js`: the used subset, for a pair
`buildPairAppendix({ chartA, chartB, semanticJson })`: every glossary entry the pair facts touch -
`kompatibilitas.*` cells for the facts present (p1 variant, p2 relation(s) + reframe when
`p2_reframe_required`, p3 supplies / same_imbalance / no_supply, `p4_<pattern>`, `p5_<quadrant>`),
plus the shared terms both charts carry (Aspek, Bintang, Elemen, Pilar, Shio, Pilar Konsepsi
display-only) in Prompt M's `GROUP_ORDER`. Correction 1 applies unchanged: a `label: null` fact gets
its `label_meaning` and no name, and never appears in a "what is in your chart" list. Correction 2
applies: `assertEveryMechanicExplained` is indifferent to names and demands meanings. Pure data, no
PDF involved; test it with the Y-1 fixture pair and 2x6 (a clash pair, so `p2_reframe` is in the
subset) and assert the subset for Y-1 is not the whole glossary.

## Commit 3 — `lib/pdf/pairDocument.js`: the composer
Pages, in order. Every string a reader sees comes from `glossary.json` (`name_id`, `name_en`,
`label_meaning`), from the SERVED payload (`servePairReading`'s resolved names - `pattern`, `quadrant`,
section slots), or from the five new copy slots in commit 4. **No hand-typed Indonesian anywhere
else. No raw key (`q4`, `contrasting`, `a_produces_b`) may appear in the text - the 2026-09-08 defect
was exactly that, and the PDF is the next consumer `serveReading.js` warned about.**

1. **Cover.** `{A name_id} dan {B name_id}` as the title (A first, B second, engine order); under it
   `name_en` pairs (EN display layer, names only); `cover_sub` slot; the two births EXACTLY as the
   report header shows them today (dates, and whatever else `pair.a`/`pair.b` carry) - no more. If
   Reyner wants birth times on the cover he rules it; do not add them.
2. **The reading**, verbatim from the cache row: engine P0 first (it is in `blocks` now, gate 1.24.0+),
   every block with its heading resolved the same way `PasanganReport` resolves eyebrows (reuse
   `lib/pair/reportView.js#projectNames` / the server's `namedOr`, never a second resolver), the
   penutup. Byte-equal to the served JSON - asserted, not eyeballed.
3. **Bagan Kelahiranmu** (slot `chart_a_heading`) - chart A exactly as the mirror's `chartPage` prints a
   chart: four pillars, hanzi paired with Indonesian animal/element (rule 23: hanzi you point at,
   never bare), Day Master, archetype, 胎元 display-only (M correction 4), and the `hal. N` references
   into the appendix for A's named mechanics.
4. **Bagan Kelahiran Dia** (slot `chart_b_heading`) - chart B, same component, same rules.
5. **Data di Balik Bacaan Ini** (slot `facts_heading`) - the pair facts as a table, one row per fact
   the reading carries, columns `Kamu` / `Dia` where a fact has a side (ruled address terms, no new
   strings): P1 the stem relation with direction RESOLVED from `provenance.cycle` (the engine knows
   who gives; print the two elements' `name_id` in the kamu/dia columns and the relation's glossary
   `name_id`); P2 the day-branch relation(s) with the branches shown as hanzi + name; P3 each supply
   with `from`/`to` mapped to the columns; P4 the pattern `name_id`; P5 the quadrant `name_id` (its
   `name_id` only - **NO score, NO axis numbers, NO verdict word**, rule 25). Each row's meaning is its
   glossary `label_meaning` with a `hal. N` reference into the appendix. If a fact's ruled text is
   direction-neutral, print it as ruled; the table's columns carry the direction, the sentence does
   not need to.
6. **Istilah dalam Bacaanmu** - the pair appendix from commit 2, `APPENDIX_HEADING` reused.
7. **Colophon** - the mirror's, unchanged.

Document metadata: title `Katon - {A} dan {B}`, author `katon.app`, no Creator string naming a model.

## Commit 4 — five copy slots, RULED BY REYNER before this commit lands
Proposed by Cowork, swept 2026-09-14 against the 70 live patterns compiled as `style.js` compiles them
(`entry.flags || 'iu'`, objects carrying `pattern` only; control string fired three patterns):

| slot | proposal | sweep |
|---|---|---|
| `pdf_cover_sub` | Bacaan kompatibilitas dari dua bagan kelahiran. | clean |
| `pdf_chart_a_heading` | Bagan Kelahiranmu | clean |
| `pdf_chart_b_heading` | Bagan Kelahiran Dia | clean |
| `pdf_facts_heading` | Data di Balik Bacaan Ini | clean |
| `report_download_pdf` | Unduh PDF (reuse the mirror delivery button's label instead if one exists in `components/`; grep before adding) | clean |

Reyner rules these in the rulings file `docs/content/pasangan-copy-rulings.md` (amendment i), his
words replace the proposals verbatim, and commit 4 applies them. Two commits in one PR (rulings, then
apply) - a five-string tranche does not need `apply-rulings`. `npm run check:copy` and
`tests/unruled-copy.spec.mjs` are the proof; a slot left unruled must FAIL the production build, as
`compat_invoice_desc` did.

## Commit 5 — the door: `GET /api/pair/[id]/pdf`
Mirror `serveDeliveryPdf` (`lib/deliver/handlers.js:179`) line for line, on the pair store:
- `admit(request)` from `serveReading.js` - same bearer, same refusal. An unpaid row answers
  `{status:'not_paid'}` 402 with NO chart bytes and no archetype names (X-b1 ruling 3).
- Rate limit `deliver_pdf` AFTER the gate, BEFORE the work (rule 19 reasoning: CPU, not content).
- Rebuild both charts in memory from the row's birth inputs (never a `reading` row), `buildPairSemantic`,
  recompute the cache key, `readCache(key, { includeUnvalidated: false })`. **No cache row -> 409
  `reading_not_rendered`.** A floor-served pair has no row (rule 16) and gets 409: the PDF is only
  ever the passed reading. No render is started from this route.
- No byte cache (M's decision, same reasons). `Content-Disposition: attachment;
  filename="katon-pasangan-<id>.pdf"`, `Cache-Control: private, no-store`.
Wire the composer in the route file, not in the handler (the `server-only` seam M documents).

## Commit 6 — the button on the report
On `/kompatibilitas/[id]`, in the `ready` view ONLY (`READY_VIEWS` includes `floor`; the PDF route
answers 409 on floor, so the button is HIDDEN on the `floor` view rather than shown and failing; a
reload re-renders and the button appears). Beside `Salin tautan`, same treatment, no new visual
language. The href carries the bearer the page already holds. Cowork's call under rule 9: a reader
cannot see the floor/ready distinction, so hiding is a technicality; if Reyner prefers a visible
disabled state with a sentence, that sentence is his.

## Commit 7 — ledger
LIVE STATE; `docs/NEXT.md` pointer (Y-3 done; current work = Prompt U); PROGRESS MEASUREMENTS row with
page counts for Y-1 and 2x6 (a consequence, never a target); COWORK-BRIEF row if this prompt was found
stale anywhere.

## PROOF — every one red first, the red run in the commit message
- Commit 1: chart 1 page texts byte-identical before/after the refactor (red by design, above).
- Commit 2: Y-1 appendix subset < whole glossary; 2x6 subset contains `p2_reframe`; a synthetic
  `label: null` fact yields an entry with meaning and no name, and is absent from the reference list.
- Commit 3, on the Y-1 fixture pair and 2x6 through the real builder:
  - every `rendered.blocks[i].text` and `penutup` present in `pageTexts()` verbatim; the P0 sentence
    `Ini adalah bacaan tentang dua individu: {A} dan {B}` present once on the reading page;
  - all sixteen pillar characters of A and B present, each adjacent to its Indonesian pair;
  - NO raw key in any page text: assert absence of every `Object.keys(GLOSSARY.kompatibilitas)`
    string, of `q1..q4`, and of every `provenance.cycle` value;
  - no `@@UNRULED`, no em-dash, no curly quotes, no `?` (rule 20) in any page text;
  - no verdict vocabulary: run the three verdict patterns from `blocklist.json` over the page texts
    and assert 0 hits (this is the content the gate already passed, so it is a regression check on the
    TABLE and CHROME, not on the prose);
  - fixed point converges and the three verifies pass for BOTH pairs; `hal. N` references from the
    two chart pages and the facts page land in the appendix (bounded + spotted);
  - 申 canary: `glyphProof` unchanged and still asserted.
- Commit 5: unpaid -> 402, body has no `facts`, no hanzi, no archetype name; wrong bearer -> the same
  refusal `servePairReading` gives; paid with no cache row -> 409 `reading_not_rendered`; paid with a
  row -> 200 `application/pdf`, `%PDF` magic, and the text of the served reading inside; the
  `deliver_pdf` limiter fires on the N+1th call.
- Commit 6: the button is in the `ready` view's DOM and absent from `floor` and from every non-ready
  view; the href carries the bearer.

## NOT IN THIS PROMPT
No design pass (M's rule: content and structure first; typography, cover treatment, colour come after
Reyner has read what the document SAYS). No embedding of a card image. No email delivery. No byte
cache. No mirror PDF change beyond the refactor, proven byte-identical. No Stage 6 change, no
`STAGE6_VERSION` bump. No new SKU or price. No Indonesian outside the rulings file. No `?dari`.
Open the PR with the Preview URL and a Y-1 PDF attached to the PR body; Reyner reads the document on
his phone before the merge - that read is the founder read the gate cannot give.
