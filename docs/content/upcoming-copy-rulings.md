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
