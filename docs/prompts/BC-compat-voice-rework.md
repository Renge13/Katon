# Prompt BC: the compat voice rework (Cowork, 2026-10-02)
Untracked in the working tree as `docs/prompts/BC-compat-voice-rework.md`. **Not durable until you commit it** (in §0).

Cite the four checks. No regex through a shell heredoc. No model-based judge.

**What this is:** the compatibility reading rebuilt around Reyner's 2026-10-02 direction ("Be fearless in interpretation. Be disciplined about the underlying facts."; "Start writing from the human experience inward") and his rulings in `docs/product/compat-rulings-2026-10-02.md` (F1, F2, F4, A6, B1, B4, E2, G3, D3, D5, H5, I1–I6). The gold standard is Reyner's target sample, `docs/content/compat-target-sample-2026-10-02.md`.

**Out of scope here:** the engine work (E11 cross-links, E12 option E, C2/E10 wealth) is Prompt BD. The mirror prompt does not change in BC: **the mirror prompt version must be identical before and after** (rule 20's mirror round is later). `COMPAT_SALES` stays unset.

## §0. Record (docs only; its own PR; merge on Reyner's go)
1. Commit this prompt and `docs/content/compat-target-sample-2026-10-02.md`. **Before committing, check the sample contains no "[FIX" and no "[+COWORK"**; if it does, stop: Reyner has not approved the final text yet.
2. Add to `docs/product/compat-rulings-2026-10-02.md`, under a "Prompt BC decisions (Reyner, 2026-10-02)" heading, these four, verbatim:
   - **Address mode:** "Write about both people by name, in the third person, and about the pair as 'kalian'. Each person's name is their nickname (`core.a.nickname`, `core.b.nickname`); when a nickname is empty, use that person's English archetype title as their name."
   - **Status:** "Status is REQUIRED. One tap, three options (PDKT / Pacaran / Menikah)."
   - **Sample:** "I approve v2 in its entirety, including all the [FIX] corrections ... and the [+COWORK] structural additions."
   - **Length:** "Keep the 800-1,000 word target as drafted in Prompt BC."

## §1. Inputs: nicknames and status (one PR, `feat/compat-names-status`)
1. **Form.** On the compat form, add for each person an optional nickname ("Nama panggilan", optional) and, once, the relationship status: **PDKT / Pacaran / Menikah**, required (Reyner, 2026-10-02). Reyner rules all visible labels; propose them in the report with a 375px screenshot. No new copy goes live without his wording.
2. **Sanitise** each nickname on the server: letters (including accented), spaces, apostrophe and hyphen only; trim; 1–20 characters; anything else is rejected with a plain message. It enters the writer prompt, so this is also the prompt-injection guard. Red first.
3. **Store** with the pair. If this needs new columns, write the migration and **stop before deploying**: Reyner runs it in the Supabase SQL editor first (CLAUDE.md, Migrations). Say exactly what to run.
4. **Semantic JSON:** add `core.status` and `core.a.nickname` / `core.b.nickname`. They are part of the cache key, so the same two births with a different status or name are a different reading. Report the pair `engine_version` / key effect.
5. **Privacy:** report the current privacy-policy sentence about what compat stores, and propose one sentence covering the two nicknames (the partner's included). Reyner rules the wording; do not change the policy without it.
6. **Truth checks read names (E4, ruled).** `lib/validate/pairTruth.js` and the pair Day Master check (`fact.day_master`, E5) read sides only from kamu/dia words today, so "Bima membawa unsur Api yang Nadia butuhkan." PASSES for the sample pair, where A supplies. Make every pair truth check also recognise each person's nickname and English archetype title as that person's side. Red first, on the sample pair: that sentence fails; "Nadia membawa unsur Api yang Bima butuhkan." passes; "Nadia adalah Logam" fails. STAGE6 bump (own commit).

## §2. The writer (same PR, after §1)
1. **A pair prompt of its own.** Today the pair prompt is the shared base + `compat-renderer-prompt-v2.txt` + examples, and several base lines contradict Reyner's compat rulings ("first turn of a conversation... leave something worth exploring", "not acting as an oracle", "no causal link between two facts", "address her as kamu", "no ... reflection questions", "Must be in it: begin with her Day Master..."). Two instructions that contradict each other are a known cause of bad output here. **Build the v2 pair prompt as its own complete text**, from the block below plus the pair examples, so no base line reaches the pair writer. The mirror's prompt and version stay byte-identical (assert it).
2. **The pair prompt text** (Cowork's wording of Reyner's rulings; use verbatim; `{…}` marks the one place that follows Reyner's address-mode decision):

```
You write a Katon compatibility reading in Indonesian, for two people, from two BaZi charts that Katon's engine has already calculated and compared.

What it is: a fortune-style reading that makes two people feel seen, understood, sometimes exposed, and hopeful about what their relationship could become. It is not a report and not an explanation of BaZi mechanics. Write from the human experience inward and use the facts to make that experience specific. Be fearless in interpretation and disciplined about the facts.

Who is who: `core.a` is person A and `core.b` is person B. Write about both people by name, in the third person, and about the pair as "kalian". Each person's name is their nickname (`core.a.nickname`, `core.b.nickname`); when a nickname is empty, use that person's English archetype title as their name. Never write "salah satu" for a known person.

Status: `core.status` is PDKT, Pacaran or Menikah. Let it set the scenes and the stakes: early signals and getting to know each other for PDKT; building closeness and shared direction for Pacaran; home, roles, family and daily life for Menikah. Never predict the next stage.

Facts: the supplied JSON is the complete source of chart facts: the pair facts and each person's own chart (`mirror.a`, `mirror.b`). Do not invent a chart fact, star, pillar, position, relationship or direction. Every pair fact's direction is in its provenance (`from`/`to`, `a_hits_b`, `b_hits_a`, `cycle`, supplier and receiver); keep it exactly. You may connect facts into a human story: why one person's behaviour, given their facts, lands the way it does on the other. Do not present one chart fact as the chart cause of another unless the JSON says so.

The story: one continuous reading in chapters, each chapter making the next question feel inevitable, never a list of findings. Organise it around the questions people bring to a compatibility reading, roughly in this order, using only those the facts support: why they are drawn to each other; what each brings into the other's life; why this feels different; where they understand each other; where they misunderstand each other; what keeps triggering them; the trap that starts from love; what this relationship could become. Both people are present in every chapter: show what each one experiences, and why the same moment reads differently from each side. A chapter may draw on several facts. Headings are short chapter titles in plain Indonesian.

Voice: warm, bold and emotionally vivid; plain words, never purple; no slang and no chat particles. Bold, declarative claims about who they are and how they move together are welcome, and so are images and everyday scenes. Romantic, uncomfortable and aspirational are all allowed. The reading as a whole carries tension; it is never a list of compliments. A recurring pattern may be stated with conviction; a specific past event may not: a scene shows what can happen, never a report of what did.

Advice: in the body, advice is a plain, optional possibility, never an imperative or a reminder such as "ingatlah", "jangan lupa" or "kalian harus".

The close: the penutup is a short epilogue about what this relationship could become. Gather the reading's threads into one cohesive reflection, with aspiration as possibility ("punya bahan untuk", "bisa menjadi"). No advice, no recap list, no teaser.

Never: an overall verdict on the pair ("cocok" or "tidak cocok" as a conclusion, a score, a percentage); ranking the two people; advice to stay or leave; dates, deadlines or fixed outcomes ("pasti", "ditakdirkan"); financial advice or financial predictions; medical or mental-health claims; calling something rare unless a fact says so; coaching or quiz questions aimed at them (a rhetorical question in the body is fine, none in the penutup).

Form: 800 to 1,000 words in total. Write each archetype exactly as its English title ("The Garden"): never translated, never paired with an Indonesian word, never in brackets. An Aspek or Bintang name is written as its Indonesian name with `label_bracket` in brackets once, at first mention. Use pattern and quadrant names exactly as the facts give them. No romanised Chinese terms; use the Katon names. Keyboard characters only: no Chinese characters, no em-dashes, no curly quotes. Return only JSON: {"blocks":[{"fact_ids":[...],"heading":"...","text":"..."}],"penutup":"..."}. `fact_ids` lists every fact a chapter draws on. Paragraph breaks are two newlines.

The example that follows comes from another couple's charts. It shows the experience a Katon compatibility reading gives. Never reuse its facts, names or sentences: the JSON is the only source of facts for this reading. It is not a template.
```

3. **The example.** Replace the PAIR EXAMPLES section of `docs/content/voice-examples-v2.txt` with Reyner's sample (`docs/content/compat-target-sample-2026-10-02.md`, reading text only), under a one-line header naming the facts it draws on, in the format of the existing examples. The mirror examples are untouched.
4. **The writer opens (I3).** For v2 pairs, stop prepending the engine's `p0_opening`; the first chapter opens the reading. `pair.both_named` stays (the first chapter names both English titles). Red first.
5. **Writer chapter headings on the web report (I4).** `components/PasanganReport.jsx` shows the writer's chapter heading for v2 pairs (`modelHeadings`), as the PDF already does. Screenshot at 375px and desktop.
6. **Length and temperature (I5, I6).** No code length cap beyond the prompt; confirm `maxOutputTokens` holds 1,000 Indonesian words with room. Temperature is set per pair in `lib/render/config.js`; the representative round below decides 0.7 or 0.9.
7. Every test that pins the pair prompt, the example or the opening: repin with one reason each.

## §3. The representative round (report; no merge)
1. Four pairs, each at temperature 0.7 and 0.9 (8 renders, in memory, production's path):
   - the sample pair (2005-02-14 07:00 F + 1999-07-07 17:00 M), Menikah, nicknames "Nadia" / "Bima";
   - PZ0t (1989-09-13 09:00 F + 1990-03-04 14:00 M), Pacaran, nicknames of your choosing;
   - one pair from the base-rate harness with a **clashed** day pair and frame hits in both directions, PDKT, with nicknames;
   - one pair with **no nicknames**, Menikah.
2. Report per render: served or floor and why; words; every gate finding; the full reading text (all 8, verbatim, in a QA doc under `docs/qa/`, indexed). Then, as a read and not a gate: any direction stated against the provenance; any verdict, date, fixed outcome, financial or medical line; any advice in the penutup; any archetype written other than as its English title.
3. Build the compat PDF for the best render of the sample pair and the no-nickname pair, and attach them.
4. **Stop.** Reyner reads all eight, picks the temperature, and gives (or withholds) the go. One adjustment round at most after his read.

## §4. Compat PDF design to the mirror's system (separate PR, `feat/compat-pdf-design`; no merge)
Reyner (2026-10-01, on the compat PDF): "the design styling on compat is not consistent with the mirror (the color, separator), also the data part need better layouting."
1. Match the Complete Edition's system: the title colour and type, chapter headings in the CE's style (eyebrow and rule separators), page rhythm.
2. "Data di Balik Bacaan Ini": a row printed a description with no label on its left (the palace-frame fact). Give every row its label, align the Kamu/Dia columns, and lay the page out as a clean table.
3. Screenshots of every page of both PDFs from §3.3. **Stop** for Reyner's look.

## Report
Per section: commits, red-first proof, new STAGE6 and prompt versions (mirror unchanged, asserted), the migration to run (if any), the proposed form labels and privacy sentence, the §3 QA doc and PDFs, the §4 screenshots. End with the split.
