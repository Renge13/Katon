# Katon — Doc Standard (how every canon/reference file is created and updated)

Purpose: kill the stale-vs-current confusion at the root. One file per topic, one place that says
how current it is, no base+addendum splits. Apply to every new doc and every overwrite from here on.

## 1. One file per topic. No addendums.
A topic has exactly ONE living file. When something changes, EDIT that file and re-upload it —
never create a `-addendum`, `-v2`, `-delta`, or `-patch` companion. Addendums are how truth splits
and drifts. (Migration: MEMORY-v4-addendum folds into MEMORY; SPEC-v5-addendum becomes SPEC.)

## 2. Filenames carry IDENTITY, not version.
Name the file for what it IS, stable forever: `SPEC.md`, `MEMORY.md`, `bazi-interpreter-skill.md`,
`bazi-card-skill.md`, `bazi-states.md`. NO `-v4`/`-v5` in the filename. Version history lives in the
header + git, not in the name. (Rename is a later batch — don't interrupt content work for it. New
files get clean names now; existing `-v4/-v5` names get dropped on the next deliberate rename pass.)

## 3. Every file opens with a STATUS HEADER (the single source of "how current").
First lines of every canon/reference file, exactly this shape:

```
<!--
STATUS: LIVE
UPDATED: 2026-06-19
SUPERSEDES: (what older file/decision this replaces, if any)
OWNER: founder validates voice/meaning; Claude owns structure
-->
```

One date, at the top. Drop the inline `[v5.1]` / `[v5.2]` tags scattered through the body — they are
the noise that made it impossible to tell current from stale. If a specific decision needs a date
(because it reversed an earlier one), put it inline as `[CHANGED 2026-06-19]` ONCE at that decision,
not as a running version label.

## 4. Supersession is explicit, in the header, not implied.
When a file replaces an older decision, the header's SUPERSEDES line names it. A reader never has to
diff two files to learn which won. (e.g. SPEC header: "SUPERSEDES the casual-voice lock + Bikin
labels".)

## 5. Changelog notes stay, but clearly marked as HISTORY.
Documenting "what this replaced" is good (it's why the BIKIN search hits were harmless in interpreter).
Keep them, but wrap them so they read as history, never as instruction:
`[HISTORY: was BIKIN TENANG/CAPEK; now Yang Menenangkan/Melelahkan, v5.2]`. A live label and a history
note must never be confusable — the search test is: grep an old term, every hit must be inside a
HISTORY marker, never a live rule.

## 6. The grep test (run after every overwrite — 2 min).
For any retired term, grep canon. Every hit MUST be inside a HISTORY/changelog marker. A hit in a live
rule = stale file = re-overwrite. Standing retired-term watchlist:
- `BIKIN` / `Bikin Tenang` / `Bikin Capek` / `Bikin Panas` → live label is "Yang Menenangkan/Melelahkan"
- `rezeki` → domain is `uang` (legacy lib/bazi code excepted, that's the 4b cleanup)
- `Talenta` → CUT from card; live hit = stale card skill
- `cetak biru` → use "bentuk dasarmu"
- casual-voice tells in brand prose (`ngerasa/bikin/kayak/capek/rame`) → baku only

## 7. When Claude hands over a file, it states the move.
Every file Claude delivers says, in one line: "NEW file" or "OVERWRITE <name>" or "REPLACES <old> +
<old addendum>". So there is never a question of where it goes.
