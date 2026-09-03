<!--
STATUS: RULED. Reyner, 2026-08-31. Cowork drafted, Reyner ruled, Cowork swept.
This file lands on main ALONE, before the PR that applies it (the #28 ruling).

IT REPLACES `docs/content/upcoming-copy-worksheet.md`, which was never committed. The worksheet's
ruling column is filled and folded in below; there is no second copy to go stale.

APPLIES TO: the eleven `PENDING(...)` slots in `UPCOMING_COPY`, `lib/site/copy.js`.
NO SCRIPT APPLIES THIS. `scripts/apply-rulings.mjs` targets `glossary.json`, not the copy bank -
substitute the eleven values by hand, verbatim, and let `npm run check:copy` be the proof.

VERBATIM MEANS VERBATIM. Reyner is the sole authority on register. Do not adjust punctuation,
capitalisation or spacing to match a neighbouring string.
-->

# UPCOMING_COPY — the eleven slots, RULED

## THE RULINGS

| # | Slot | Ruled string | Reyner's note |
|---|---|---|---|
| 1 | `eyebrow` | `Yang sedang dikerjakan` | Quiet craft language. Free of marketing hype |
| 2 | `lead` | `Dua bacaan ini belum dijual.` | Flat and unromantic. Does not compete with the live Artifact CTA |
| 3 | `compat.label` | `Kamu dan Satu Orang` | Intimate, grounded, conversational |
| 4 | `compat.sub` | `Kecocokan, dibaca dari dua tanggal lahir.` | Clear mechanics, zero mystic fluff |
| 5 | `annual.label` | `Setahun ke Depan` | Clean and unforced |
| 6 | `annual.sub` | `Peta cuaca untuk tahun yang kamu masuki.` | Pure weather mapping; sidesteps the fatalism blocklist |
| 7 | `availability` | `Belum tersedia` | Factual status tag. Avoids promising a timeline |
| 8 | `interestCta` | `Beri tahu saya kalau sudah siap` | Natural first-person phrasing |
| 9 | `thanks` | `Sudah tercatat, terima kasih.` | Simple receipt-less acknowledgement |
| 10 | `contactLabel` | `Email atau nomor WhatsApp, boleh dikosongkan` | Explicit, low-friction permission to opt out |
| 11 | `contactSubmit` | `Kirim` | The only word needed |

**Slot 7 was ruled FIRST, and it is what unlocked slot 1.** `Sedang disiapkan` would have forced a
paraphrase in the eyebrow to avoid reading as a stutter one line above it. `Belum tersedia` is a
neutral state flag, which leaves `Yang sedang dikerjakan` free to frame the craft. Recorded because
the dependency is invisible in the finished table and a later edit to either slot can reintroduce it.

## THE SWEEP

Compiled exactly as `lib/validate/style.js:63` does it -- `new RegExp(entry.pattern, entry.flags || 'iu')`.

```
PATTERNS: 65   case-sensitive: 2      (style.code_leak.1, style.bare_polarity.0)
FALSIFIERS firing on their own rule: 5/5
slot count: 11
slot 1 / slot 7 shared verb: none
TOTAL HITS: 0
```

Falsified before it was trusted, on five inputs each aimed at a different rule, each required to fire
on THAT rule rather than merely to fire:

| Input | Fired on |
|---|---|
| `ramalan tahun 2027` | `forbidden_content.fatalism.0` |
| `kamu ngerasa capek` | `style.slang.0` |
| `bukan lemah tapi kuat` | `style.hedge_construction.0` |
| `nilai supportShare kamu tinggi` | `style.code_leak.1` |
| `Belum tersedia — dua bacaan` | `rule20.keyboard U+2014` |

False-positive control: `Peta cuaca untuk tahun yang kamu masuki.` returned clean, confirming
`bare_polarity` did not fire on ordinary relative-pronoun `yang`.

**COWORK'S FIRST SWEEP WAS BROKEN AND REPORTED 30 HITS ON ALL TWELVE CANDIDATES.** It walked the JSON
compiling every string it found, so the `flags` value `"u"` became the pattern `/u/`, and it forced
`'iu'` onto every entry -- including `style.code_leak.1`, whose own note records that case-insensitivity
turns it into "every word of two letters or more". Both halves are the documented failure this project
has been burned by, and the second is named in the Cowork skill. It was caught only because the
instrument was falsified first: the em-dash falsifier fired on `code_leak` instead of the keyboard
check, and every candidate came back dirty. **Recorded rather than quietly fixed, because a sweep that
reports CLEAN is only worth what its falsification is worth.**

## APPLYING IT

1. This file lands on `main`, alone.
2. Replace the eleven `PENDING(...)` values in `UPCOMING_COPY` with the strings above, verbatim.
3. `npm run check:copy` must go from refusing a production build to passing. That transition IS the
   acceptance test -- run it before the change and show it red.
4. `npm test` stays green, `test:unruled-copy` included.
5. `PENDING` and `scripts/check-unruled-copy.mjs` STAY. They are the gate for the next unruled string,
   not scaffolding for this one. Deleting them because no sentinel remains is how the gate stops
   existing before anyone needs it again.

**Do not apply a partial set.** Any slot left on its sentinel keeps the production build refused,
which is correct; a slot filled with an unruled guess does not.

---

## AMENDED 2026-08-31 — THE TWO CAPITALISED SLOTS RENDER IN SENTENCE CASE

**Reyner, 2026-08-31.** `eyebrow` and `availability` were rendering UPPERCASE — `YANG SEDANG
DIKERJAKAN` and `BELUM TERSEDIA`. The stored strings were always verbatim; the case was CSS.

**RULED: both render in sentence case, as written.** The reason is the rulings' own stated intent
rather than a new preference: slot 1 was ruled *"quiet craft language, free of marketing hype"* and
slot 2 *"factual status tag"*, in a block whose job is not to rival the live Artifact CTA. Caps read
as a status chip shouting, which is the register both rulings were written to avoid — arriving
through CSS instead of through words. **The eleven strings are unchanged.**

### HOW, and the part that is easy to get wrong

**DO NOT EDIT `Eyebrow`.** `components/kit.jsx:57` is shared — 3 call sites on `main` alone — and
removing its `textTransform` would change every eyebrow on the site. It is not what was ruled.

It already spreads `...style` LAST:

```js
// components/kit.jsx:57, ref main
export function Eyebrow({ children, color, style }) {
  return <div style={{ ...letterSpacing: '.16em', textTransform: 'uppercase', ..., ...style }}>{children}</div>;
}
```

So a call-site `style={{ textTransform: 'none' }}` wins with no component edit. Apply it at the
`UPCOMING_COPY` call site only. Do the equivalent at whatever renders `availability` on
`feat/demand-test` — a `textTransform` added in `7cec498` while the content was still a placeholder.
That site is not visible from `main` and is deliberately not named here by line.

### THE CONSEQUENCE, so it is not rediscovered as a defect

**`letterSpacing: '.16em'` is tuned for capitals.** Dropping `textTransform` without relaxing it
gives spaced-out lowercase, which reads worse than either end state and looks like a bug rather than
a decision. **Relax the tracking at the same call sites, in the same commit.** This is an
implementation consequence of the ruling, not a reopening of it: the ruling is sentence case, and
sentence case at caps tracking is not sentence case done.

Check it rendered, not just changed — the strings reach the DOM through the copy bank and the block
renders client-side, so a source read is not evidence about what a reader sees.

---

## AMENDED 2026-09-01 -- `thanks` SPLITS IN TWO, AND THE ANTICIPATION LINES LOOP

**Reyner, 2026-09-01.** Three rulings. The first replaces a ruled slot, the second explicitly
declines to change one, and the third is not a copy ruling at all -- it is here because it is the
only reason the block above it needs re-reading.

### 1. `thanks` IS REPLACED AND SPLIT

Slot 9 of the eleven is retired. One string was doing two jobs at two different moments:

| Was | Becomes | Slot | Shown when |
|---|---|---|---|
| `thanks` = `Sudah tercatat, terima kasih.` | `interestNoted` = `Minatmu sudah tercatat.` | the TAP | `interest_registered` has been fired for this product |
| (same string, same slot) | `contactSent` = `Emailmu sudah masuk.` | the SUBMIT | the contact POST came back `ok` |

**WHY ONE STRING COULD NOT DO BOTH, and it is a correctness problem rather than a wording
preference.** `Sudah tercatat, terima kasih.` rendered the moment a product was tapped and never
changed afterwards, so a reader who then typed an email and pressed `Kirim` got no acknowledgement
that the second, different thing had happened. The block's own header rules that **the tap is the
metric** and the contact box is optional and arrives after the signal is already recorded. Two
moments that the design deliberately separates were sharing one confirmation.

**EACH NEW STRING NAMES ITS OWN OBJECT** -- `Minatmu` for the tap, `Emailmu` for the submit -- which
is what makes them distinguishable a line apart. Neither says `terima kasih`: the block is recording
a fact, and thanking someone for a tap overstates what happened.

**`Emailmu sudah masuk.` IS A CLAIM ABOUT THE SERVER, so it may only appear when the server said so.**
This is the half that constrains the code rather than the copy. The string asserts that a thing
arrived; showing it after an empty box, a rejected POST or a `410 gone` reading is the product
telling a reader something untrue. The confirmation is therefore tied to a successful submit, and
that binding is the change's actual subject. **There is no failure string.** `product_interest`
upserts on `(reading_id, product)`, so a retry is harmless, and leaving the input visible with its
value intact says "not yet" without inventing a twelfth slot nobody ruled.

### 2. `availability` STAYS `Belum tersedia` -- RULED, NOT OVERLOOKED

Unchanged, and written down because a section that edits its neighbours is exactly where a slot gets
changed by momentum. **The 2026-08-31 dependency recorded in `lib/site/copy.js` is untouched:**
`Sedang disiapkan` was the discarded alternative, and it would still force a paraphrase in `eyebrow`
to avoid reading as a stutter one line above. Nothing in this amendment touches that pair.

### 3. THE ANTICIPATION LINES LOOP INSTEAD OF HOLDING

> **SUPERSEDED 2026-09-02, ONE DAY LATER. THE LINES ARE DELETED, NOT RE-RULED.** Reyner walked the
> funnel himself and ruled the whole anticipation screen out: during `calculating` the reader now
> stays on the form and the submit button carries the state. `ANTICIPATION`, the `step` state, the
> interval below and `<Anticipation>` are gone from `components/Funnel.jsx`, and `.k-ring`/`kRipple`
> went with them.
>
> **The ruling below was correct and it is kept for exactly the reason it gives about itself.** It
> exists because a rationale left standing after its conclusion is reversed gets taken as the reason
> for what the next reader is looking at - and a one-day-old ruling for copy that no longer renders
> is the sharpest version of that. What replaced it is not different words; it is the finding that
> the screen stopped earning its place when chart-early cut the wait from p50 7.6s to roughly 2.5s.

`components/Funnel.jsx`, the three lines shown while the reading renders. They advanced twice and
then **held** on `Menghitung keseimbangan energimu` for as long as the render took. **RULED: they
cycle.** The render behind them has no deadline, and a line frozen for eight seconds reads as a hung
page, which is the opposite of what the component is for.

**This is not a copy ruling -- the three strings are unchanged** -- and it is recorded here anyway
because the comment above that effect argues the case for holding, and the argument becomes false
the moment looping lands. It weighed holding against *blanking*, and looping is neither. A rationale
left in place after its conclusion is reversed is worse than no rationale: the next reader takes it
as the reason for what they are looking at.

## THE SWEEP -- BOTH NEW STRINGS, 2026-09-01

Compiled exactly as `lib/validate/style.js:63` does it -- `new RegExp(entry.pattern, entry.flags || 'iu')`.
Patterns read from `lib/validate/blocklist.json`, never retyped, and never passed through a shell heredoc.

```
COMPILED 65 checks from lib/validate/blocklist.json
CONTROLS: 7/7 fired
CLEAN UPCOMING_COPY.interestNoted: "Minatmu sudah tercatat."
CLEAN UPCOMING_COPY.contactSent:   "Emailmu sudah masuk."
RESULT: 0 hit(s) across 2 candidates.
```

**Falsified before its CLEAN was trusted.** Seven deliberately bad inputs, each required to fire on
the rule it was aimed at:

| Input | Fired on |
|---|---|
| `Ini ramalan nasib dan peruntunganmu.` | `forbidden_content.fatalism.0` |
| `Sepertinya kamu agak lelah.` | `style.hedging.0` and `.2` |
| `Minat sudah dicatat di contactSent.` | `style.code_leak.1` (camelCase, flags `u`) |
| `Nilai product_interest sudah tercatat.` | `style.code_leak.0` (snake_case) |
| `Minatmu sudah tercatat -- terima kasih.` | `rule20.keyboard U+2014` |
| `Emailmu sudah masuk ...` | `rule20.keyboard U+2026` |
| `Aspekmu adalah <hanzi> yang kuat.` | hanzi in prose (rule 23) |

The last three matter most: **they are the candidate strings themselves, altered only by the defect.**
A control that shares no shape with the real input proves the instrument fires, not that it fires
*here*.

**AN EIGHTH CONTROL WAS WRONG AND THE SWEEP CAUGHT IT.** `Kamu mungkin akan merasa lebih baik.` was
written expecting `style.hedging` and returned CLEAN. The sweep was not broken: `mungkin` was
deliberately MOVED out of this file on 2026-08-17 into `lib/validate/style.js#hedgeAboutReader`,
which `blocklist.json#_removed` records. Replaced with `sepertinya` and `agak`, which are still here.
Written down because the 2026-08-31 sweep above records the opposite failure -- an instrument wrong
about a candidate -- and this is the pair: **a control can be wrong too, and a CLEAN control is a
claim about the blocklist that has to be checked against the blocklist.**

### APPLYING IT

1. This file lands on `main` in its own commit, before the one that applies it.
2. `lib/site/copy.js`: rename `thanks` to `interestNoted`, add `contactSent`. One call site.
3. The confirmation binding in ruling 1 is behaviour, so **an assertion has to go red without it** --
   press `Kirim` with an empty box, and with a POST that rejects, and assert `Emailmu sudah masuk.`
   is not shown in either case. A happy-path test passes whether or not the gating exists.
4. `fireEvent` KEEPS ITS CONTRACT. It is fire-and-forget by design and the other seven events rely on
   that; the awaited path is added for the contact submit alone.
5. **No `STAGE6_VERSION` bump.** Nothing here changes what Stage 6 accepts or rejects.
