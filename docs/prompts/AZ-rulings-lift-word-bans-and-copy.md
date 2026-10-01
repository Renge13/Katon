# Prompt AZ: lift the word bans, direction instead; AY rulings; #189 copy (Cowork, 2026-10-01)
Untracked in the working tree as `docs/prompts/AZ-rulings-lift-word-bans-and-copy.md`. Commit it with your first change.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

## Reyner, 2026-10-01, verbatim
```
Lift the ban on A and B. We don't ban specifics for the writer, just give overall direction. Eg. "should be encouraging, stay to the facts, warm, emphatics", or "don't be an oracle" "no fatalism", and not by banning word A, B, or C.

"saling melengkapi" sounds more natural.

Rest is good.
```
Plus his answer on the safety net: **"Keep 3 checks."**

**Keyed referents.** "A" and "B" are Cowork's two groups of `lib/validate/blocklist.json`:
- **A (truth and safety):** `forbidden_content.*`, `style.meta`, `style.code_leak`, `style.arithmetic`, `style.raw_pillar`, `verdict.patterns`.
- **B (register):** every other `style.*` group:
  - `essay_connectives`;
  - `hedging`;
  - `hedge_construction` (the bukan…tapi/melainkan construction);
  - `tension_collapse`;
  - `slang`;
  - `particles`;
  - `bare_polarity`.

"Rest is good" accepts Cowork's 半合 rewrite, the two Compatibility lines, and the offer changes (§3).

## §1. The gate: lift the word bans, keep three invisible checks
**The gate is never shown to the writer.** The writer gets only direction (§2). The gate keeps exactly these three, because each protects the reader rather than the voice:
1. **Pipeline leaks** (`style.code_leak`, plus the parts of `style.meta` that name the machine: sebagai AI / model bahasa / JSON / prompt / berdasarkan data yang diberikan). This is a bug alarm: a reading must never print `null`, a field name or braces.
2. **Self-harm** (`forbidden_content.self_harm`).
3. **Medical and financial advice** (`forbidden_content.medical`, `forbidden_content.financial`).

Everything else in the blocklist is **removed from the gate**. That means all of B and the rest of A:
- fatalism, ranking, the arithmetic and raw-pillar patterns;
- the rest of `style.meta`;
- `verdict.patterns`.

It applies to every surface the blocklist reaches: v1, v2, mirror, pair, floor, glossary and copy-bank checks.

**Unchanged, because they are not word bans:**
- the deterministic fact checks (strength, `aspek_pillar`, `bintang_pillar`, relation positions, D1 invented terms, the badge and condition checks);
- the bracket normalising and stripping;
- the closing-hedge drop;
- the copy bank's typography rule.

If any of these depends on a removed blocklist entry, **stop and report** before touching it.

- Keep the removed entries in the file under a `_retired_2026-10-01` key, each with its note, so the history stays readable. Nothing reads that key.
- **Red first:**
  - a draft containing "hal ini", "cenderung", "bukan X, tapi Y", "selaras", "takdir" and "cocok" now passes;
  - a draft containing `null`, "sebagai AI", "bunuh diri", "obat" or "investasi" still fails.
- **Replay** every stored draft on both gates. Report how many rejections and floors disappear, by check id. Any draft that newly passes while carrying one of the three kept categories is a stop.
- Own STAGE6 bump.

## §2. The writer prompt: direction, not word lists (shared base, so mirror and pair both get it)
Add, in "Interpret freely means" or directly after it:

> "Write warm, encouraging and empathetic, as one person writing to another, in plain spoken Indonesian: not an essay, a report or a translation. Stay with the facts in the JSON. You are reading this chart, not acting as an oracle: no fate, no fixed future, no dates."

- The existing "Do not invent" lines stay as they are. They already carry no-prediction, no-medical/financial/legal-advice and never-rank as direction.
- Check the prompt for any remaining **word list** addressed to the writer (a list of banned words or phrases, not a direction). Quote each one; Reyner's ruling removes them. The named examples of commands in the imperative line ("'ingatlah', 'jangan lupa', 'kamu harus'") were ruled separately on 2026-09-30 as a direction with examples. Keep them unless Reyner says otherwise, and report them.
- Record the new mirror and pair prompt versions.

## §3. Ship with PR 1 (glossary), in one deploy, so every saved reading is re-keyed once
Put §1 and §2 on PR 1's branch (`feat/glossary-batch-ay`) as their own commits, so one merge means one deploy and one re-key.

**AY PR 1 rulings:**
- **半合 `actionable_seed`:** "Rasa belum pas itu bagian dari ritmemu, bukan tanda ada yang rusak. Jeda sebentar sering sudah cukup untuk melihat bahwa yang ada di tanganmu sebenarnya sudah memadai."
- **傷官:** the tested reword "keesokannya".
- **土:** the tested reword "pada waktu yang sama".
- Record all three as REYNER-RULED 2026-10-01.
- Log the pillar check reading "hari"/"jam" as pillar names as a PROGRESS watch item.

**Then, once, on the final branch:**
- re-pin the expected pins, each with its reason;
- the sweep (only the three kept categories now), the replay, and the Card B pixel gate (expected unchanged);
- **one smoke check** on the 5 charts. Report per reading:
  - served or floor;
  - words;
  - the final sentence;
  - every imperative or reminder (a read, not a gate);
  - **for information only**, every sentence carrying a formerly banned construction ("bukan … tapi/melainkan", "hal ini", "cenderung", harmony words, a year, "takdir"/"pasti akan", "cocok"). Reyner judges these by reading.

  Stop only if an imperative remains, a close teases, or one of the three kept categories fires.
- Report and wait for Reyner's go.

## §4. PR 2 (#189): copy, REYNER-RULED 2026-10-01 (copy bank)
**The offer:**
- **Headline:** "Bacaanmu, disusun untuk disimpan." (unchanged)
- **Description, new, directly under the headline:** "Isi bacaannya sama dengan yang bisa kamu baca gratis di atas. Pilihan ini untuk kamu yang ingin menyimpannya sebagai arsip PDF dan kartu."
- **Line 1:** "PDF Edisi Lengkap" / (unchanged)
- **Line 2:** "Kamus Istilah Personal" / (unchanged)
- **Line 3:** "Kartu Edisi Lengkap" / "Kartu dengan desain berbeda dan informasi lebih lengkap, siap disimpan sebagai pengingat atau dibagikan ke lingkaran terdekatmu."
- **Remove** the line under the button ("Melewatinya tidak mengurangi apa pun dari bacaan gratismu.") from the offer. Report whether it is used anywhere else.

**The Compatibility block:**
- **Line 1:** "Peta Relasi" / "Masukkan tanggal lahir kalian berdua. Katon memetakan ritme harian kalian dan area yang mudah memicu salah paham."
- **Line 2:** "Titik Temu" / "Menyoroti dinamika ketertarikan, hal yang menguatkan hubungan, dan unsur yang saling melengkapi di antara kalian."

**/harga:** the Complete Edition body becomes the same headline, description and three lines, from the same copy-bank entries (not duplicated strings).

**Events:** add `compat_cta_seen` (fires only when the block is actually displayed) and `compat_cta_click`. Server-allowlisted like the other funnel events, and red first.

**Proof:** new screenshots at 375px and desktop (offer, compat block, /harga), with payments forced open locally. Report and wait for Reyner's go. No mock-payments variable on any Preview.

## §5. After launch (listed, not built)
None.

## Report
Per PR:
- commits;
- red-first proof;
- the §1 replay counts by check id;
- the §3 smoke table with final sentences and the informational list;
- the #189 screenshots.

End with the split.
