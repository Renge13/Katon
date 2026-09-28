# AC: DOKU sandbox QRIS walk + voice v2 round 3 (Cowork, 2026-09-24)

Written by Cowork into the working tree. Not yet committed: commit it with part C.
Rulings below are Reyner's (2026-09-24). Check any claim against docs/ before acting on it.

Three jobs, in order. A first; B only after A is reported or blocked; C last.

## A. DOKU sandbox QRIS walk (flip-gate b attempt)

Sandbox QRIS credentials are now filled in the Back Office (after DOKU's Disable procedure).

1. Run probe:doku against sandbox. Report the result.
2. Walk one sandbox QRIS purchase end to end (Rp 19.000 mirror). Report: was the
   notification delivered to our notify URL (yes/no, with log lines), was capture
   recorded, did settleReading flip the order to paid, did reconcile-on-load agree.
3. If anything needs an env change or a Back Office change, NAME IT for Reyner and stop.
   Do not work around it.
4. Record the outcome in docs/ops/doku-walk.md (gate b section), with the date.

## B. Voice v2 round 3 (final round per the cap), on feat/voice-v2

Rulings (Reyner, 2026-09-24):

- Writer model: UNCHANGED, gemini-3.1-flash-lite (the current writer, pinned id).
  Writer model review is deferred to after launch.
- Same v2 writer prompts as round 2. No prompt edits except fix (i).
- Fix (i): the archetype bracket comes from core.archetype_name_en. Round-2 output
  showed wrong brackets: "Embun (Water)", "Matahari (Bing)", "Taman (Ji)", "Kayu [Wood]".
- Fix (ii): typography normalisation parity with v1 (em/en dashes, curly quotes, ellipsis;
  brackets that contain hanzi only). Deterministic, post-write, same as v1.
- Each accept-changing edit gets its own commit with its own STAGE6_VERSION bump.

J1 provisional hard gate (judge model unchanged: the current Pro judge):

1. Calibrate J1 BEFORE any round-3 render. Seeded set = S1-S4 seeded invented-fact
   violations, plus the real g4WH4 round-2 sentence ("... Air yang tidak dominan di
   baganmu"; engine: B supplies Kayu, Air is A's dominant) as a seeded fixture.
   Clean set = S1-S4 as written. Run the full calibration 3 times.
2. J1 passes only if it catches EVERY seeded invented-fact violation in all 3 runs AND
   produces ZERO J1 false positives on the clean set across all 3 runs. Quote every miss
   and every false positive with its grounding fields.
3. If it fails: ONE fix round is allowed, to the judge's J1 instructions only. Then re-run
   the 3x calibration once. If it still fails, J1 stays ADVISORY for MVP. Stop tuning.
   Report and continue to the renders either way.
4. If it passes, runtime: J1 finding -> one regeneration with the quoted finding fed
   back -> second J1 finding -> serve floor.
5. J2-J4 stay advisory (logged, stored with the render, never blocking). Do not add
   writer constraints from any judge finding.

Run: re-render the same 7 subjects (5 mirrors + 2 pairs), v2 only, to
reports/voice-v2/round3/ (PDF + JSON, index.html, summary.json), with J1 in whichever
state calibration left it.

Report: the J1 calibration table (3 runs, seeded catches, clean false positives) and the
resulting J1 state. Then per reading: words, D1-D4 hard fails, J1 findings with quotes and
grounding, whether it regenerated, whether the floor was served, J2-J4 advisory findings
with quotes. State whether the g4WH4 factual error recurs. Give the total round-3 spend.
Do not merge. Do not apply migration 0011.

## C. Record (docs-only PR on main, merge authority as before)

- Commit this file as docs/prompts/AC-qris-walk-voice-round3.md.
- docs/ops/doku-walk.md gate a: production QRIS activation submitted 2026-09-24 17:05 WIB,
  brand "Katon", MCC 5817 (Barang Digital - Aplikasi, selain game; DOKU's 5816 label is a
  duplicate typo, standard 5816 = games). Back Office status UPDATING (under DOKU review).
- docs/content/voice-v2-spec-2026-09-24.md §8: round-3 row with the B rulings above and the
  J1 outcome (this edit lives on feat/voice-v2 with round 3).
- DEFERRED REGISTER: "Writer model review, post-launch. Candidates seen 2026-09-24 in AI
  Studio: gemini-3.5-flash-lite $0.30/$2.50, gemini-3.8-flash $0.75/$3.75 (promo to
  2026-12-31); current gemini-3.1-flash-lite $0.25/$1.50 per 1M tokens in/out. Pin exact
  ids, never -latest aliases. Also consider a cheaper judge after J1 calibration settles."

Stop after the report.
