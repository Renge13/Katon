# Prompt BC, amendment 2: names, the close, privacy (Reyner's rulings, 2026-10-04)
Goes in the working tree as `docs/prompts/BC-amendment-2-names-close-privacy.md`. Untracked until you commit it: commit it on #197 with §0.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

The smallest round: three changes, one re-run, stop. Do not merge #197 or #198. No gate change: STAGE6 stays 1.73.0. No new check of any kind.

## §0. Record (one docs-only commit on #197)
Add to `docs/product/compat-rulings-2026-10-02.md`, under "Prompt BC decisions (Reyner, 2026-10-02)", as **"Amendment 2 (Reyner, 2026-10-04)"**, Reyner's words verbatim:
- Length: "Accept the approved gold sample as the practical target. I care about the reading feeling substantial and worth Rp39,000, not hitting a word-count target. Do not add padding just to reach 800 words."
- Harmony first: "Start with what draws the two people together, then introduce the strain where both apply." (Already implemented in `433a98a`; this records the ruling.)
- Privacy: "Katon tidak meminta nama lengkap, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga."
- Names: "when facts say "kamu" or "dia", those are references to the two people, and the reading should address them by the names supplied to the writer." Fixed upstream in the prompt, not by a gate.
- The close: the penutup "sets no conditions and gives no advice".
- Watch items, no gates or checks: "Keep the wrong-direction sentence and the "Sari, dengan elemen Api yang dominan" issue as watch items for now. Do not add gates or extra checks for either." Add both to the watch register in `docs/PROGRESS.md`, quoting the sentences from `docs/qa/2026-10-04-bc-adjustment-round.md` (nonames render 1: "The Morning Dew menemukan sumber keamanan melalui dorongan yang diberikan The Teak", against `p1_stem_relation` cycle `a_produces_b` and a one-way A->B `p3_supply`; PZ0t render 1: "Sari, dengan elemen Api yang dominan", against `element_dominant_Water` in `mirror.a`).
- Pending, not in this round: the compat glossary lines that hand the writer "dinamika" and "menopang". Reyner rules the rewrites first.

## 1. Privacy string (red first)
In `lib/site/copy.js` replace exactly:
`Katon tidak meminta nama, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga.`
with exactly:
`Katon tidak meminta nama lengkap, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga.`
Grep `app components lib docs/content` for any other copy of the old sentence and report each hit; change none of them without Reyner's word.

## 2. Pair prompt, three lines (one commit, red first, one prompt-version bump)
File: `docs/content/compat-renderer-prompt-v2.txt`. The mirror prompt does not change (keep the test that asserts it).

a. **"Who is who"**: append after "In the first chapter, name both archetype titles once alongside their names.":
> The facts' texts are written to a reader: "kamu", "-mu", "dia", "ia" and "-nya" in them refer to the two people. Work out who each one is from the fact's provenance (supplier and receiver, `from`/`to`, `a_hits_b`, `b_hits_a`) and write that person's name. Never address either person as "kamu" or "-mu".

b. **"The close"**: append after "No advice, no recap list, no teaser.":
> The penutup sets no conditions and gives no advice: no "jika kalian ..." and no "dengan menyadari ...".

c. **"Form"**: replace `800 to 1,000 words in total, six to eight chapters, each two or three paragraphs.Write` with:
> About as long as the example; never pad to reach a length. Six to eight chapters, each two or three paragraphs. Write

(This also restores the missing space before "Write".)

Red first: one assertion per line that fails on `v2-b167b0b65ed009ef` and passes after. Report the old and new pair prompt versions.

## 3. Re-run (8 renders), then stop
Same four pairs, two renders each at 0.7, production path, same script as amendment 1. Same report shape as `docs/qa/2026-10-04-bc-adjustment-round.md`, in a new QA doc. Add, per render, listed sentence by sentence:
- every sentence where "kamu" or "-mu" refers to one of the two people (nonames is the pair to watch);
- every penutup sentence containing "jika" or "dengan menyadari";
- the count of "dinamika" and "menopang". The glossary still hands the writer these words in this round, so this count measures the voice line on its own.

No word-count target. Report words and paragraphs per chapter as before. **Stop.** Reyner reads, then rules on merging.
