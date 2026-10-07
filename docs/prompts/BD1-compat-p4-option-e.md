# Prompt BD1: P4 option E into the engine, then compat goes on sale (Reyner ruled 2026-10-04)
Goes in the working tree as `docs/prompts/BD1-compat-p4-option-e.md`. Untracked until you commit it: commit it in the §5 PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`, then `docs/qa/2026-10-02-bb-engine-scoping.md` §1.3 (Option E) and `docs/product/compat-p4-p5-rules.md` §1. Read `.git/HEAD`. Branch `feat/compat-p4-option-e` off `main`; confirm `main` contains #204 (`17406a7`). Before coding, report the open-PR list. **Two PRs:** do §5 (the WhatsApp removal, small, separate branch) first, then the P4 work (§1-§4). Commit this prompt file in the §5 PR.

Cite the four checks. No regex through a shell heredoc. No model-based judge (do not run `lib/validate/judge.js` or the calibrate scripts). Red first wherever behaviour changes. No writer-prompt or Stage 6 change: assert STAGE6 and both compat prompt files unchanged. Never set `PAYMENTS_PROVIDER=mock` or `COMPAT_SALES` on any Preview (shared database). **Do not merge.**

## Scope
P4 `contrasting` (80.6% of random pairs) splits four ways by directed family step. `matching` and `related` stay exactly as ruled. Four new glossary cells, ruled verbatim below. That is all. **Out of scope (BD2, needs a two-source rule spec first):** E11 cross-links and C2/E10 wealth and three-branch facts. Do not touch them.

## §1. The rule (Cowork's technical ruling, implementing Reyner's Option E)
Family position on the generating cycle, from each person's OWN Day Master, exactly as `tenGodRelation` already derives it: companion 0, output 1, wealth 2, officer 3, resource 4. Step `d = (kB - kA) mod 5`, A = the reader (`lib/semantic/pair.js` p3 precedent: A is "kamu").

| relation | d | pattern id | meaning |
|---|---|---|---|
| `same_god` | | `matching` | unchanged |
| `same_group` | 0 | `related` | unchanged |
| `different_group` | 1 | `a_generates_b` | A's family generates B's |
| `different_group` | 2 | `a_controls_b` | A's family controls B's |
| `different_group` | 3 | `b_controls_a` | B's family controls A's |
| `different_group` | 4 | `b_generates_a` | B's family generates A's |

- No new table: derive positions from the same `elementRelation` output `tenGodRelation` maps (one position map beside `RELATION`, or derived; your call, say which). `lib/bazi/tenGods.js` stays read-only (rule 7).
- `relation` keeps its three values. Only `pattern` splits.
- **Symmetry changes, on purpose.** The old comment "swapping the two charts ... leaves `relation` and `pattern` alone" becomes false. New property, tested over a pair sample: swapping A and B maps `a_generates_b <-> b_generates_a`, `a_controls_b <-> b_controls_a`, and leaves `matching`, `related` and `relation` alone.
- Rule 4 and rule 25 hold: Katon framework, never presented as classical; "controls" ranks nothing.

## §2. Commit 1: the ruling record (docs only)
1. This prompt file, only if the §5 PR has not merged yet (it carries it).
2. `docs/content/compat-p4-option-e-rulings-2026-10-04.md`: the table in §3 verbatim, with the provenance below. Code cannot read the Claude project, so this file is the repo's only copy.
   - Ruled by Reyner 2026-10-04: structure (two names, each in two directions; A is always "kamu", the partner "ia"); the `p4_b_*` cells are kamu/ia swaps of his wording, approved by him the same day.
   - Ownership split, Reyner 2026-10-04: "`Inti Menekan` owns schedules/rules, while `Pola Membentuk` owns clarity/decision-making." Reason: `p1_controls` (Inti Menekan) can appear in the same reading, and a Rp 39.000 reader must not read the same dynamic twice.
   - `p4_contrasting` ("Pola Kontras") is RETIRED.
3. `docs/product/compat-p4-p5-rules.md` §1: amend the 1.1 table to six patterns (§1 above), add an AMENDED 2026-10-07 line to the STATUS block naming this prompt, and replace the `@@UNRULED@@` placeholders with the cell keys. Keep 1.2 and 1.3; fix any sentence that is now false.

## §3. Commit 2: cells, engine, tests
**Glossary (`docs/content/glossary.json`, `kompatibilitas`).** Insert these four verbatim, each with a `_note` giving its d and "A is the reader (kamu), B the partner (ia)". Delete `p4_contrasting` after the engine can no longer emit it; if any reader of that key remains, stop and report it instead of deleting.

| key | name_id | name_en | label_meaning | meaning_seed | daily_seed |
|---|---|---|---|---|---|
| `p4_a_generates_b` | Pola Menyalakan | Kindling Pattern | Caramu melangkah menyalakan semangatnya. Hal yang membuatmu bergerak secara alami menjadi alasan untuknya ikut melangkah. | Dorongan alamimu adalah pemantik untuk caranya menjalani hidup. Ia tumbuh lebih cepat di dekatmu, namun kamu bisa merasa lelah jika harus selalu menjadi pihak yang memulai. | Ide atau antusiasme yang kamu lontarkan di pagi hari sering kali sudah ia jalankan di sore hari, dengan caranya sendiri. |
| `p4_b_generates_a` | Pola Menyalakan | Kindling Pattern | Caranya melangkah menyalakan semangatmu. Hal yang membuatnya bergerak secara alami menjadi alasan untukmu ikut melangkah. | Dorongan alaminya adalah pemantik untuk caramu menjalani hidup. Kamu tumbuh lebih cepat di dekatnya, namun ia bisa merasa lelah jika harus selalu menjadi pihak yang memulai. | Ide atau antusiasme yang ia lontarkan di pagi hari sering kali sudah kamu jalankan di sore hari, dengan caramu sendiri. |
| `p4_a_controls_b` | Pola Membentuk | Shaping Pattern | Kehadiranmu memberi kejelasan pada pikirannya. Kamu secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan. | Caramu memandang hidup memberi kepastian pada jalannya. Di hari baik, ia merasa lebih mantap dan terarah karenamu. Di hari berat, kejelasan yang sama bisa terasa menuntut untuknya. | Saat ia datang dengan banyak pemikiran atau pilihan yang berserakan, kamu yang biasanya memilah dan membantunya mengambil satu keputusan pasti. |
| `p4_b_controls_a` | Pola Membentuk | Shaping Pattern | Kehadirannya memberi kejelasan pada pikiranmu. Ia secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan. | Caranya memandang hidup memberi kepastian pada jalanmu. Di hari baik, kamu merasa lebih mantap dan terarah karenanya. Di hari berat, kejelasan yang sama bisa terasa menuntut untukmu. | Saat kamu datang dengan banyak pemikiran atau pilihan yang berserakan, ia yang biasanya memilah dan membantumu mengambil satu keputusan pasti. |

Cowork's sweep, 2026-10-07, against `main`'s glossary (md5 `e0a0a43dc681ab958626b1048c85c3cf`) and blocklist (md5 `ac4a1d320c427bd55fd6932fd56c7d13`), compiled as `style.js:63` does (18 patterns): all 16 strings clean on blocklist, typography, question marks and bukan..tapi; controls fired (financial 2 hits, code_leak, bukan..tapi, `?`, em-dash). 3-gram overlaps: "yang sama bisa" (羊刃 cost_seed) and "di hari baik" (`p1_controls` daily_seed), both ruled incidental. Re-run your own glossary sweeps after inserting; they must stay green. **Insert by a script that reads the strings from the rulings file, not by retyping them**, and assert byte equality between the two.

**Engine (`lib/compat/temperament.js`).** Red test first: one pair per new pattern, from real `calculateBaziChart` charts, asserting the pattern id. Then the swap property. Update the file's header comments to the six-pattern rule. `lib/semantic/pair.js` keys the cell as `p4_${pattern}` already: confirm, do not add a mapping.

**Rates must reproduce the scoping run exactly.** `node scripts/compat-base-rates.mjs --charts 2000 --pairs 5000 --seed 20260907` must give matching 526, related 445, a_generates_b 977, a_controls_b 1001, b_controls_a 1054, b_generates_a 997 (BB §1.3). Make the harness print six patterns. Any other count is a defect in the implementation or the harness: stop and report which. Show it failing first (e.g. swap d=2 and d=3) and say what it printed.

**Consumers.** Read, report with file:line, change only what is false: `lib/pair/serveReading.js` (`namedOr`), `lib/pair/reportView.js` (comment at :87), `lib/pdf/pairDocument.js` facts table (:308-314) and the glossary appendix, `lib/render/glossItalics.js` comment, `lib/validate/judge.js:90` description (update the line so it is true; do not run it). `lib/validate/pair.js` `pair.direction_resolved` is for direction-NEUTRAL cells; these four are direction-fixed: confirm it does not count them, add no check.

**Cache.** `cacheKey` hashes the whole semantic JSON (`lib/semantic/index.js:472`), so a changed P4 cell already misses the cache. **Do not bump `ENGINE_VERSION`** (it would re-render every mirror reading). Matching and related pairs must keep their key: assert it on one pair of each.

## §4. Report-only measurements
1. Over the 5000-pair run: how many pairs get both `p1_controls` and a `p4_*_controls_*` cell, and how many `p1_produces` with `p4_*_generates_*`. Numbers only.
2. **Writer round, four renders, one per new key**, live writer, compat voice as shipped. Choose pairs whose charts are NOT the compat prompt's example. Put the four P4 blocks verbatim in `docs/qa/2026-10-07-bd1-writer-round.md`, each with its pattern id and the two nicknames, plus Stage 6 outcome and provider cost. Judge nothing; Cowork reads them for direction (does the block give the step to the right person). If a render floors, say "floor" beside it.
3. One paid report page and one PDF from the local mock path, for one Menyalakan and one Membentuk pair, saved under the same qa folder. Label each "render" or "floor".

## §5. Separate small PR, first: remove the WhatsApp number from /tentang#kontak (Reyner ruled 2026-10-07)
Branch `fix/kontak-no-whatsapp` off `main`, independent of the P4 work, so it can merge on its own today.
1. `app/tentang/page.js:54-61`: remove the WhatsApp `<dt>`/`<dd>` pair. Email and "Alamat terdaftar" stay, in that order.
2. `lib/site/entity.js`: delete `whatsapp` and `whatsappE164`, and correct the header comment (lines ~30-50) so it no longer says the number is on the site. Keep the history in one line: added for Xendit's second rejection 2026-08-05, removed by Reyner 2026-10-07.
3. `lib/site/copy.js`: delete `kontakWhatsappLabel`. Replace `kontakLead` with Reyner's ruled string, verbatim:
   `Untuk pertanyaan, permintaan soal datamu, atau kendala pembayaran, kirim email ke kami.`
   (Cowork swept it 2026-10-07: clean, 18 patterns, controls fired.) Fix the comment above it the same way as in step 2.
4. Then grep `lib app components tests scripts docs/ops` for `0818805913`, `62818805913`, `wa.me` and `whatsapp` (case-insensitive), and list every hit with file:line. Remove only what shows the number to a reader or links to it. **Leave the reading-delivery code in `lib/wa.js`, `lib/readingStore.js` and `lib/pair/settle.js` alone**; it is not the contact number. Say what you left and why.
5. Red first: a test that renders /tentang and fails while the number or a `wa.me` link is in the HTML. Show it red, then green.
6. Do not touch the footer, /privasi or /syarat unless step 4 finds the number there. If it does, stop and report rather than rewording.

## Validation and report
`npm test`, `npm run check:qa`, CI green, on each PR. Report: the open-PR list, the implementation map, the falsification output for the red tests and the rate harness, the §4 numbers and file paths, the §5 grep list, and both PR links. **Do not merge.** Reyner merges.

## After merge (Reyner, not Code)
1. Vercel, Production only: set `COMPAT_SALES=open`, then redeploy production (an env change applies on the next deploy).
2. Reyner buys one compat reading on his phone, Rp 39.000 QRIS. Cowork then checks: the Vercel notify line `paid=true reason=ok`, every DOKU return URL lands on `www.katon.app`, the paid report renders, and the token goes into PROGRESS "KNOWN TEST ROWS". That closes gate b's compat half in `docs/ops/doku-walk.md`.
