<!--
STATUS: PROPOSALS, not ruled. Cowork's drafts for Reyner to rewrite. Nothing here reaches the
glossary until it comes back in his register as a rulings file applied with
`scripts/apply-rulings.mjs --expect N`.
Origin: docs/qa/2026-08-19-READ-VERDICT.md section 4 — cross-chart verbatim repetition ruled
UNACCEPTABLE for a Rp 19.000 reading, 2026-08-19.
Measurements below were produced this session at zero provider cost. Commands are inline.
-->

# Tranche 3 — repetition variants

**The ruling:** *"Verbatim sentences across friends' reports shatters personalization. High-frequency
glossary cells need 2-3 structural variants."*

**One thing must be settled before any prose is written**, and it is section 2. Drafting the wrong KIND
of variant wastes Reyner's rewrite, which is the expensive step.

---

## 1. WHICH CELLS ACTUALLY COLLIDE — measured over 13 charts, not the 4-chart QA set

The read found 9 colliding sentences, but it looked at four charts, and that set is not
representative — `空亡` collided in 3 of 4 there while appearing in only 3 of 13 across the fixture.
**Exposure is what matters: a cell's collision rate is just how many readers receive it.** Measured by
running the engine over `tests/bazi-validation.fixture.js` (`VALIDATION_CHARTS`, 13 charts, no provider
calls):

| Cell | Charts | % | Label |
|---|---|---|---|
| **`spouse_palace`** | **13** | **100%** | Fondasi Pasangan |
| `bintang.天乙貴人` | 10 | 77% | Bintang Penolong |
| `main_profile` | 9 | 69% | (varies) |
| `elemen_dominan.*` | 8 | 62% | (varies by relation) |
| `kekuatan.balanced` | 8 | 62% | Seimbang |
| `aspek_convergence` 正印 / 偏印 / 傷官 | 6 each | 46% | Pelindung / Pemikir / Pemijar |
| `kekuatan.weak` | 5 | 38% | Lemah |
| `relasi_cabang.半合` · `bintang.文昌` | 5 | 38% | Setengah Gabungan · Bintang Cendekia |
| everything else | <=4 | <=31% | |

**`spouse_palace` is the whole problem in one row. Every reader gets it — 13 of 13 — so its frame
sentence is shared by 100% of customers.** Today that sentence is:

> `Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.`

Two friends comparing readings will find it every time. Nothing else in the corpus is close.

**Instrument caveats, both mine.** `elemen_dominan.*` collapsed to one row with an empty label because
the keying field was blank for some charts; the per-relation split needs a second pass before that row
is quoted. And the fixture is 13 charts, so a 1-of-13 cell reads as 8% when the true rate could be
anywhere near it. Treat the top five as sound and the tail as indicative.

---

## 2. THE FORK — what a "structural variant" should be. Settle this first.

**Option A — same meaning, n phrasings, picked deterministically by the engine.** Index off something
stable in the chart so the cache key stays deterministic. Honest but arbitrary: two readers get
different words for no reason either could ever be told.

**Option B — same meaning, n phrasings, the renderer picks.** Rule-14 clean, since words are the LLM's
to choose. **But the LLM cannot see what other readers received**, so it may converge on one phrasing
and the collision returns. That is measurable and cheap to measure, and it would be measured after the
prose exists — i.e. after the expensive step.

**Option C — key the variant on a distinction the engine ALREADY makes, so each variant says something
different and TRUE.** Recommended, and the precedent is in the file already:

```
$ node -e "console.log(require('./docs/content/glossary.json').elemen_dominan._note)"
Keyed by facts.js elementRelation() -> relation_to_day_master. Not by element.
```

`elemen_dominan` is five cells keyed on `relation_to_day_master`, each ruled separately, each saying
something genuinely different — `same` is about stubbornness, `feeds` about over-preparation, `drains`
about output emptying you. **And `spouse_palace`'s own fact already carries that same field:**

```
$ node --conditions=react-server scripts/emit-semantic.mjs 1989-09-13 09:00
  "id": "spouse_palace",
  "provenance": { "kind": "day_branch_seat", "branch": "子", "seat_stem": "癸",
                  "seat_god": "正官", "element": "Air",
                  "relation_to_day_master": "controls" }
```

So option C costs no new engine mechanism for this cell — the discriminating field is already in the
fact and already has ruled prose elsewhere to pattern on. **It also stops the work being cosmetic.** A
brief of "say the same thing three different ways" invites exactly the filler Reyner calls Buku
Terjemahan Syndrome. A brief of "say what is actually different about these five cases" does not.

**The trade, stated plainly:** option C writes five strings where A and B write two or three, and it
only works for cells that carry a discriminating field. Cells that do not — `kekuatan.balanced` is the
same sentence for everyone balanced, by definition — fall back to A or B. So the ruling may well be
**C where a field exists, B elsewhere**, rather than one mechanism everywhere.

---

## 3. WORKED EXAMPLE — `spouse_palace`, option C, five drafts

Reyner rewrites; Cowork does not decide register. These replace the single shared frame sentence, keyed
on `relation_to_day_master`. Patterned on his tranche-2b syntax: two sentences, concrete, no hedging.

**The BaZi content is not improvised.** Each variant describes the same five relations
`elemen_dominan` already rules, applied to the day-branch seat instead of the dominant element. The
relation itself is engine-computed and already in the fact. **Rule 4 still applies to Reyner's read:
if any of these five describes the relation wrongly, the draft is wrong, not the engine.**

| key | draft |
|---|---|
| `same` | Hubungan paling dekatmu berjalan seperti cermin. Yang kamu bawa akan kamu temui lagi dari seberang, dan gesekannya biasanya soal siapa yang mengalah lebih dulu. |
| `feeds` | Hubungan paling dekatmu terasa seperti tempat berteduh. Ada yang menopangmu di situ, dan justru karena nyaman kamu bisa lupa cara berdiri sendiri. |
| `drains` | Di hubungan paling dekat kamu yang banyak memberi. Tenagamu mengalir ke luar dengan wajar, dan kamu baru sadar kosong setelah lama berjalan. |
| `is_controlled` | Hubungan paling dekatmu terasa seperti sesuatu yang harus kamu kelola. Ada tanggungan di situ, dan kamu mengurusnya lebih dulu daripada menikmatinya. |
| `controls` | Hubungan paling dekatmu menuntut kamu memenuhi ukuran tertentu. Kamu sanggup memikulnya, dan justru karena sanggup, jarang ada yang menawarkan keringanan. |

### Swept before Reyner sees them, and the sweep was fixed twice first

```
compiled 65 blocklist patterns from lib/validate/blocklist.json
plus 10 typography / register checks not in the JSON

CLEAN  spouse_palace.same  (160 chars)
CLEAN  spouse_palace.feeds  (146 chars)
CLEAN  spouse_palace.drains  (140 chars)
CLEAN  spouse_palace.is_controlled  (149 chars)
CLEAN  spouse_palace.controls  (154 chars)

TOTAL FINDINGS: 0

SELF-TEST on a deliberately bad sentence: 6 patterns fired
  forbidden_content.fatalism[0] | forbidden_content.fatalism[3] | style.hedge_construction[0]
  | question-mark | secara-adverbial | pasti akan

3-GRAM OVERLAP against 202 existing glossary strings:
  spouse_palace.same: max shared 3-grams = 1  (pilar.year.label_meaning)
  spouse_palace.feeds: max shared 3-grams = 0
  spouse_palace.drains: max shared 3-grams = 1  (elemen_dominan.same.cost_seed)
  spouse_palace.is_controlled: max shared 3-grams = 0
  spouse_palace.controls: max shared 3-grams = 0
```

**Two instrument bugs were caught before the CLEAN above meant anything, and both were Cowork's:**

1. **The first sweep compiled ZERO patterns and still printed CLEAN on all five.** `blocklist.json`
   stores `{pattern, note}` objects inside arrays; the walker only collected bare strings. A sweep that
   finds nothing because it looked at nothing is the exact failure the read-verdict's discarded
   imperative detector was. **The script now aborts if it compiles zero patterns, and self-tests on a
   deliberately bad sentence** — `Kamu bukan lemah tapi kuat, dan pada 2027 kamu pasti akan berhasil
   secara konsisten?` — so CLEAN is only reportable when the instrument has been shown able to fail.
2. **`style.code_leak` fired on all five, and it was NOT a broken repo check.** It matched
   `["Hubungan","paling","dekatmu"]` — ordinary Indonesian words — which looks exactly like the known
   class of token-bans that misfire. It is not one. `lib/validate/style.js:60` compiles
   `new RegExp(entry.pattern, entry.flags || 'iu')`, that entry carries its own case-sensitive flags,
   and the sweep had hardcoded `i`. **Cowork broke a working check and nearly filed it as a repo
   defect.** The presumption that a firing check is wrong applies to Reyner-ruled strings, not to a
   check Cowork just miscompiled.

**A third bug, and it is the one this whole tranche is about.** `controls` was transcribed into the
table above as `Kamu sanggup memikulnya, and justru karena sanggup` — English `and` for `dan`. The sweep
had tested the correct string, so it reported CLEAN on prose that differed from what Reyner would have
read. **This is the tranche-1 corruption class exactly: a string that passed a check is not the same
claim as the string in the document.** The table and the swept strings are now asserted byte-identical,
and that assertion, not the sweep, is what makes the table quotable:

```
keys tested: ['controls', 'drains', 'feeds', 'is_controlled', 'same']
BYTE-IDENTICAL swept vs table: True
```

**One real finding on the drafts, fixed before this file was written:** `is_controlled` originally read
`kamu cenderung mengurusnya`, and `style.hedging[1]` catches `cenderung` — hedging inside a claim. The
word was deleted; nothing else moved.

---

## 4. THE QUEUE, ranked, not yet drafted

Nothing below is drafted, because section 2's fork decides what kind of prose to write.

| Cell | % | Has a discriminating field? | Likely mechanism |
|---|---|---|---|
| `bintang.天乙貴人` | 77% | `hits[].palace` — the pillar it sits in | **C.** The palace is already rendered beside it |
| `main_profile` | 69% | the god itself; already 10 cells | already varies — **verify before drafting** |
| `kekuatan.balanced` | 62% | none. Balanced is balanced | **B**, or leave it |
| `elemen_dominan.*` | 62% | already keyed on the relation | already C — **re-measure the split first** |
| `aspek_convergence` 正印/偏印/傷官 | 46% | `convergence_palaces` | **C** |

**`main_profile` at 69% may need nothing at all.** It resolves to one of ten aspek cells, so its real
collision rate is per-aspek, not 69%. Measure before drafting: this row is a candidate for the
measurement showing there is no problem.

---

## 5. A SEPARATE DEFECT FOUND WHILE MEASURING — the same cell mounted twice

`spouse_palace` embeds a full copy of the aspek cell under `seat_content` — `label_meaning`, `gift`,
`cost`, `actionable`, all of it. That aspek can ALSO arrive as its own `aspek_convergence_*` fact in the
same chart. **So one glossary cell has two mount points in a single reading**, and that is how
`Kamu melihat pola yang luput dari pandangan orang lain...` turned up in chart 13's `Intuisi Pemikir`
and chart 5's `Fondasi Pasangan`.

**Within one reading it is currently NOT firing** — the read measured **0** sentences repeated to their
own reader across all five readings, and chart 13 merged the two into one block titled
`Aspek Peraih dan Fondasi Pasangan`, which is the renderer handling it well. **But nothing enforces
that.** It is the renderer being tactful, unchecked, on the one defect shape that has already shipped
once. Worth a check, and it belongs with the tranche-3 code work rather than in prompt L.
