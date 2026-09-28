# Prompt AM: Penyeimbang copy, merges, promotion prep, DOKU (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AM-supply-copy-promotion-prep.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. Each change ships alone and is shown red first. Quote the command for every claim.

**State (Cowork read):** Reyner pushed `feat/voice-v2` himself (`a052f6a..2ee0ec3`). Main is `fa0fb7b` plus #166. #167 and #168 are open.

## Reyner's rulings (2026-09-28, verbatim)
```
1. Use the drafts, with "kadarnya lebih rendah" in the meaning line and writer guidance.
2. Leave the Complete Edition header unchanged and park it.
3. Approve #168, and approve #167 after the copy is applied.
```
**Keyed form of ruling 1** (Cowork tightened it by key; Reyner confirmed this form by pasting AM). These are the texts to apply, byte for byte:

| Cell | Field | Text |
|---|---|---|
| `kompatibilitas.p3_supplies` (partner gives) | `label_meaning` | Dia membawa elemen yang kadarnya lebih rendah di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan. |
| `kompatibilitas.p3_supplies` | `meaning_seed` | Salah satu membawa elemen yang kadarnya lebih rendah di bagan pasangannya, memberikan rasa seimbang dan tenang di area yang tadinya rawan rapuh. |
| NEW cell, only the reader gives (name it to fit the section's key scheme; say which) | `name_id` | Penyeimbang Unsur |
| same new cell | `label_meaning` | Kamu membawa elemen yang kadarnya lebih rendah di bagannya. Kehadiranmu secara alami memberi keseimbangan yang ia butuhkan. |
| same new cell | `daily_seed` | Kehadiranmu secara alami meredakan kegelisahan di area tertentu dalam hidupnya, sehingga ketiadaanmu langsung membuat area tersebut terasa tidak stabil baginya. |
| same new cell | `meaning_seed` | the same text as `p3_supplies.meaning_seed` above (it is direction-neutral) |

`p3_supplies.daily_seed` and `p3_no_supply` stay unchanged.

**Cowork's ban-list sweep** of all four new texts: compiled as `new RegExp(entry.pattern, entry.flags || 'iu')`, 70 patterns, 0 hits; the control hit 3. No em dash, `?` or curly quotes. Re-run the repo's own glossary sweep.

## §1. #167: apply the copy, then merge (ruling 3)
1. **On #167's branch, two commits:**
   - Commit 1: the rulings record, with the verbatim block, the keyed table and the reason. It goes in the compat glossary rulings file that owns `p3_supplies`.
   - Commit 2: apply via `scripts/apply-rulings.mjs --expect <N>`. Say what N is.
2. **Wire the new cell** so that when only the reader gives (the supplied fact carries A→B and no B→A), the floor, the PDF meaning column and the glossary appendix all use it. When both give, or only the partner gives, `p3_supplies` stays.
   - **Red first:** pair 9 x 11 (only the reader gives) printed "Dia membawa…" on #167's head.
   - **Also test:** a pair where both give, and a pair where only the partner gives.
3. **Fix the stale technical text:** the `p3_no_supply` `_note` ("Unreachable from the 13-chart fixture") and the comment at `lib/semantic/pair.js:355-358`. The note must state the 1.9% seeded rate as a measurement with its date.
4. **No `ENGINE_VERSION` bump** (Cowork's ruling). The semantic hash already re-keys exactly the pairs that changed. Record the reasoning in the PR.
5. Suite, then merge #167.

## §2. Merge #168 (ruling 3). Park the CE header (ruling 2)
- Merge #168.
- Add a DEFERRED REGISTER row: the "Sudah siap. / Kartu dan PDF-mu bisa diunduh kapan saja…" header stays visible while "Unduh PDF" is hidden in the rare floor state (the provider has failed after the paid-budget render and warming). It is true again once the reading renders. What would close it: a floor-state variant of the header, which is copy and so Reyner's.
- Then merge main into `feat/voice-v2` (merge, don't rebase), resolving the STAGE6 line. Suite and replay.

## §3. What the branch changes for v1 readers today (report only; decides the merge path)
`feat/voice-v2` is about 61 commits ahead of main, and it carries engine work (E1-E3) as well as v2 prompt and gate work. Before the branch merges to main, list every change on it that alters what a **v1 production** reader gets while `lib/voice.js:19` still forces v1:
- semantic JSON, engine outputs, v1 gate, v1 prompt, UI, PDF.

For each one, give the commit, the file, and what a reader would see. Then run:
- the v1 replay (64 stored drafts);
- a semantic-JSON diff over the 13 chart fixtures and the 14 pairs, main against the branch, reporting how many cache keys move.

**Cowork's intended merge path**, confirmed or refuted by this report:
- One merge PR of `feat/voice-v2` into main, as a merge commit, not a squash, so the commit hashes the docs cite survive. Production stays on v1.
- The switch to v2 (the `lib/voice.js:19` line plus `VOICE=v2` in Production) is a separate, later one-line PR.
- If §3 shows a v1-visible change nobody has ruled on, stop and list it.

## §4. Round 4d: the final readings for Reyner's acceptance read (about $0.025)
On `feat/voice-v2` at its head after §2 (1.55.0 or later, with #167's engine change merged in):
- the seven subjects of round 4, output to `reports/voice-v2/round4d/`, FLOOR in any floored filename;
- report per reading: served or floor, gate findings, regenerations, cost, the close's last sentence, and the Penyeimbang lines for the two pairs.

This is the round Reyner reads for his final go (B30 was conditional). No voice score.

## §5. Migration 0011 (report only)
How have migrations been applied to production Supabase so far? Quote the doc or runbook. Is 0011 applied (read-only check, if you have a way to run one)? Give the exact steps for whoever applies it. Don't apply it.

## §6. DOKU and Xendit: do `docs/prompts/AL-amendment-1-doku-xendit.md` now
Items 1-4 as written. Reyner is waiting on item 2 (the confirmed sandbox notify URL) to send DOKU the QRIS notify URL and sandbox Client ID. Report that URL first, as soon as you have it.

## Report format
Per item: commits, red-first proof, output, and what the customer gets. End with the split.
