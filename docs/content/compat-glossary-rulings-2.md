<!--
STATUS: RULED. Reyner, 2026-09-08 (evening). One cell. Lands on main ALONE per the #28 ruling, then
applied on the fix branch with:
  node scripts/apply-rulings.mjs docs/content/compat-glossary-rulings-2.md --expect 1
Closes the gap recorded in lib/validate/pair.js:57-77 (the floor names neither person). When applied,
the `both_named` floor exemption is REMOVED and tests/compat-stage6-pair.spec.mjs:85 inverts by design.

TEMPLATE NOTE (Cowork): `{A}` and `{B}` are substituted by the engine with the two archetype
`name_id` values at fact-build time. Braces trip `style.code_leak` in the glossary sweep; mark the cell
`template: true` (or equivalent) so the sweep and Stage 6 see the SUBSTITUTED text, never the template.
The template itself is never served.
-->

# glossary.json#kompatibilitas - p0_opening, RULED

## kompatibilitas.p0_opening

- label_meaning: "Ini adalah bacaan tentang dua individu: {A} dan {B}"

**AMENDED 2026-09-09 (amendment h, `docs/content/pasangan-copy-rulings.md`).** It was
`"Bacaan ini tentang kamu, {A}, dan {B}."` and Reyner saw it rendered on a real paid report:
"Bacaan ini tentang kamu, Api Unggun, dan Samudra." Three items in a list, for a reading about two
people - and the reader is one of them, so it reads as her plus two strangers. He ruled the
replacement and amended the digit "2" to "dua" himself.

The row is corrected HERE as well as in the amendment, because this file is the one a session opens
when it asks what `p0_opening` was ruled to be. A ruling recorded in one file and superseded in
another is how a stale value gets re-applied by someone being careful.
