# Prompt Y-copy-1: apply the 2026-09-09 compat string rulings (before Y-2 commit 1)

Cowork, 2026-09-09. Reyner ruled after walking the mock-payment preview. Y-2 Addendum 2 item 5 says
these land as a copy PR BEFORE Y-2 commit 1. This is that PR. Nothing here is a Y-2 feature.

## Source of truth
`docs/content/pasangan-copy-rulings.md`, head comment "AMENDMENTS 2026-09-09 (a-e)" and the three
tables it points to. Every string is Reyner's verbatim; swept 0/70 (falsifiers 4/4). **Do not edit a
word.** If a gate rejects one, the presumption is the gate is wrong (COWORK-BRIEF); stop and report,
do not bend the string.

## One PR, two commits (skill rule: for a handful of strings the ruled words stay separately
revertable without the tranche ceremony)

**Commit 1 - rulings only.** The two docs already in the working tree, uncommitted (Cowork wrote them
via the device bridge; they are NOT durable until you commit):
- `docs/content/pasangan-copy-rulings.md` (amended in place, single source)
- `docs/content/compat-surface-strings-review.md` (worksheet, status RULED, points only)
- this file, `docs/prompts/Y-copy-1.md`
No code in this commit.

**Commit 2 - apply.** Exactly these, and only these:
1. `lib/site/copy.js` PASANGAN_COPY:
   - `page_lead` -> new ruled value.
   - `form_email_help` -> new ruled value.
   - SITE_COPY.privasi `privasi_email` -> new ruled value. SAME COMMIT as form_email_help: they are
     two of the four promise strings and must never disagree about what the address is used for.
   - DELETE `paid_title`.
   - RENAME `report_badge_eyebrow` -> `section_pattern`, `report_quadrant_eyebrow` -> `section_rhythm`
     (values unchanged). One slot per ruled value; do not add aliases.
   - ADD `section_core`, `section_seat`, `section_element`, `section_close` with the ruled values.
     They are chrome strings; they render in Y-2 (Addendum 2 item 2), not in this PR. Adding them now
     means Y-2 has no copy edit in it.
2. `components/PasanganReport.jsx`: lines 76, 79 use the renamed slots; line 337 (`paid_title`
   Eyebrow) is REMOVED. Do not build the replacement header here - that is Y-2 Addendum 2 item 1.
   If removing the eyebrow leaves the report opening with nothing above the reading, that is
   acceptable for the hours between this merge and Y-2; note it in the PR body.
3. `tests/compat-surface.spec.mjs` PASANGAN_SLOTS: drop `paid_title`, rename the two eyebrow slots,
   add the four new section slots.
4. `components/BirthFields.jsx:78` helper string -> ruled value (mirror AND compat, shared).
5. `components/Funnel.jsx:534` AND `components/Pasangan.jsx:358` -> ruled value. Both, same commit;
   grep `Bersifat pribadi` afterwards and expect zero.
6. Any other reference to the renamed or deleted slots: `grep -rn "paid_title\|report_badge_eyebrow\|report_quadrant_eyebrow" --include=*.js --include=*.jsx --include=*.mjs` must return only this
   prompt and the rulings file's "(was ...)" notes.

## Proof, in the PR body
- `npm run check:copy` output.
- The verbatim verifier from #105 against `docs/content/pasangan-copy-rulings.md` (it must now read
  the amended table; if it hard-codes 28 rows, fix the count, not the table).
- `npm test` (the full CI set - Addendum 1).
- The grep in step 6, and `grep -rn "Bersifat pribadi\|Jamnya saja\|disimpan hanya untuk\|Hanya dipakai untuk membuka"` = 0.
- One line: which copy of the tree you applied against (`git log -1 --oneline` on main after commit 1).

## NOT in this PR
- Any change to the email FIELD itself: it is KEPT as is. Only its two strings move.
- Hour picker, busy state, report header, section-eyebrow rendering, link box: all Y-2.
- Prompt Z (reading voice): after Y-2 merges.
