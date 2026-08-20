<!--
STATUS: RULED CONTENT - Reyner's ruling of 2026-08-19, section 7 of
docs/qa/2026-08-19-READ-VERDICT.md. Register is his. Cowork proposed the question; the article is
his call. This string replaces the named field in docs/content/glossary.json VERBATIM.

ON MAIN FIRST, ALONE, BEFORE THE PR THAT APPLIES IT. The #28 precedent.

APPLY WITH:  node scripts/apply-rulings.mjs docs/content/2026-08-19-arketipe-name-en-ruling.md --expect 1

ONE FIELD, WHICH IS EXACTLY WHY IT GOES THROUGH THE SCRIPT. A hand edit to a single JSON value is
the case where the guard feels unnecessary and is not: --expect asserts count, line extent and
shape, and it is what caught the tranche-1 corruption.

NOT A SILENT CHANGE TO THE CARD. `arketipe.name_en` is read by the sharecard as well as the
reading, and `splitName` in components/cards/Card.js treats a leading "The" as a kicker. This
ruling therefore moves 癸 from (no kicker, two-line headline) to (kicker, two-line headline), which
no archetype has been before. Two assertions in tests/card.spec.mjs pin the old value by name and
must move with the ruling. See the commit that applies this file, and the note in
docs/content/card-polish-spec.md.
-->

# The archetype English names - the tenth article, 2026-08-19

One assignment. Nine of ten `arketipe.name_en` values carry a definite article; `癸 Embun` did not.

Reyner's ruling:

> *"Add `The` and make it `The Morning Dew`. Leaving 1 out of 10 without an article looks like an
> unedited mistake rather than an intentional choice. `The Morning Dew` retains the exact same
> definite, mythical cadence as The Sun, The Ocean, or The Bonfire."*

This reverses the EN flag recorded in `docs/content/archetype-tags-REVIEW.md` line 46, which argued
that bare "Morning Dew" was stronger and cited tarot precedent for one bare name among nine. That
argument is not carried forward. The orphan reads as an oversight rather than as an intention.

Verified before this file was written, and to be re-verified after it applies:

```
node -e "const g=require('./docs/content/glossary.json'); for(const[k,v]of Object.entries(g.arketipe)) if(v&&v.name_en) console.log(k, v.name_id, '|', v.name_en)"
```

Before: nine `The ...`, one `Morning Dew`. After: ten `The ...`.

## arketipe.癸

- name_en: "The Morning Dew"
