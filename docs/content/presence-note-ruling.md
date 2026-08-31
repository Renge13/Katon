<!--
STATUS: RULED. Reyner, 2026-08-31. Cowork drafted, Reyner ruled, Cowork swept.
This file lands on `main` ALONE, before the PR that applies it (the #28 ruling).
It replaces `docs/content/presence-note-worksheet.md`, which was never committed.

DRAFTED ON REF `feat/card-a-4x5`. Both edit sites named below exist on that ref and on `main`.
VERBATIM MEANS VERBATIM. Register is Reyner's (working-style rule 9).
-->

# `element_presence_note` — RULED

## THE RULING

> ### `Sebaran visual, bukan ukuran kekuatan.`

**Reyner, 2026-08-31.** It is his own wording, not one of Cowork's four candidates - `visual` for
`tampilan`.

## WHAT IT REPLACES — one caveat that was wrong on BOTH surfaces, in opposite ways

| Surface | Shipped until now | Why it was wrong |
|---|---|---|
| **Free reading page** — `lib/semantic/index.js:286` rendered by `components/Funnel.jsx:702` | `display distribution only, never a strength score` | **English, on the acquisition surface.** Rule 20 |
| **Complete Edition PDF, Rp 19.000** — `lib/pdf/document.js:194` | `Sebaran tampilan, bukan skor kekuatan.` | **`skor` is banned** by `style.arithmetic.2` |

Same caveat, same `Sebaran Unsur` heading, two different strings: the PDF was translated and the free
page never was, so a paying reader got Indonesian and a free reader got English.

**The caveat itself is NOT removed.** `lib/semantic/index.js:283-285` keeps it deliberately (D2a §5):
the value is max-normalised nowhere and seasonally weighted nowhere, it is a plain share of the eight
characters, and the note is what stops a reader taking the bars for a strength score.

**On `skor`: the check was not bent, and the precedent is this repo's own.** `ramalan` is banned under
`forbidden_content.fatalism` and the copy rulings record that it must not appear *even to be negated*.
A caveat that denies a score does not have to say the word. The ruled string keeps the denial and
drops the token.

## THE SWEEP

Compiled exactly as `lib/validate/style.js:63` does it.

```
PATTERNS: 65   case-sensitive: 2
FALSIFIERS on their own rule: 6/6
RULED: "Sebaran visual, bukan ukuran kekuatan."   clean - 0 hits
```

Falsified first on six inputs, each aimed at a different rule and required to fire on THAT rule:
`forbidden_content.fatalism`, `style.slang`, `style.hedge_construction`, `style.code_leak`,
`style.arithmetic`, `rule20.keyboard`.

## WHY NEITHER STRING WAS EVER CAUGHT — and what the fix must add

**Every pattern in the blocklist is an Indonesian token, so the English string sweeps CLEAN.** The
gate cannot see an English leak at all. The one surface it could have flagged was the paid PDF, which
nothing runs it against. This is the invisible-defect class - errors 32, 35 and 38 - and this repo's
convention is that **the commit repairing an invisible defect adds the eye that would have seen it.**

## APPLYING IT

1. This file lands on `main`, alone.
2. Replace **both** strings with the ruled one, verbatim:
   - `lib/semantic/index.js:286` — `element_presence_note`
   - `lib/pdf/document.js:194` — the PDF's `s.small` line
   **They must not diverge again.** Same caveat, same words, both surfaces.
3. The comment above `lib/pdf/document.js:194` quotes the old English string. Update it so the
   comment does not describe a string that no longer exists - a corrected value with a stale
   justification beside it is error 27's shape.
4. **Add the missing eye:** a test that fails when a reader-facing engine string is English. Same
   shape as `scripts/check-unruled-copy.mjs`, which already proves the pattern works on the copy bank.
   **Show it failing first** - revert one string to English, watch it fire, restore.
5. Re-sweep both sites after the edit and record the result.
