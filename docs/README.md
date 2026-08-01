# docs/

Specs, decisions and research for Katon. **Read `PROGRESS.md` first** — it is the ledger, and its
SUPERSEDED section wins any conflict with anything else in here.

Root `CLAUDE.md` holds the locked non-negotiables. If a doc in here contradicts `CLAUDE.md`,
`CLAUDE.md` wins and the doc is stale.

## Layout

| Folder | What's in it | Trust level |
|---|---|---|
| `PROGRESS.md` | The ledger. Session-resume file. | **CURRENT** |
| `DOC-STANDARD.md` | How docs are written and kept current. | **CURRENT — and under-followed. See below.** |
| `prompts/` | Claude Code handover prompts. Run A → A2 → B → C. | **CURRENT** |
| `engine/` | Calculator decision, engine state, pipeline spec, blueprint. | **CURRENT** |
| `content/` | Renderer prompt, glossary naming, card spec, static strings, test kit. | **Mostly current — see flags** |
| `product/` | Launch decisions, paid product map, compat spec, security checklist. | **Mostly current — see flags** |
| `research/` | Cold-read analysis, mechanism inventory, older skill docs. | **Mixed. Mine for insight, do not treat as spec.** |
| `archive/` | Superseded. Kept for history only. | **DEAD. Never build from these.** |

## The single source of truth for each thing

| Question | File |
|---|---|
| What is decided and what is next? | `PROGRESS.md` |
| What must Claude Code never re-litigate? | `../CLAUDE.md` |
| What system prompt does the renderer use? | `content/renderer-prompt.txt` |
| What are things called in Indonesian? | `content/glossary-naming.md` |
| How does the calculator work and why? | `engine/calculator-decision.md` |
| What do we sell, and when? | `product/paid-product-map.md` |
| Why did the old readings fail? | `research/coldread-analysis.md` |

Anything with two copies is a bug. If you find one, delete the wrong one and note it in `PROGRESS.md`.

## Flags — files added 2026-08-01 from Claude.ai project knowledge, NOT fully re-read

Fifteen files were pulled out of project knowledge and sorted by their headers, not by reading them
end to end. **Placement is a best guess at currency, not a ruling.** Treat these with suspicion until
someone reads them against `CLAUDE.md`:

- `research/SPEC-v5-addendum.md` — contains validated v5 voice rules that are still cited in practice,
  but predates the pivot. Some rules live, some dead.
- `research/bazi-interpreter-skill-v5.md` — the pre-pivot "free river / paid ocean" brief. Structure is
  superseded by the engine + renderer split; the interpretation discipline may still be useful.
- `research/bazi-states-and-compatibility-v4.md` — built on the five-state model
  (balanced/amplified/governed/depleted/overfueled), which is **NOT a strength model** and was replaced.
  The feed/drain compatibility logic may still be reusable.
- `research/DRIVER-MATRIX-50.md`, `research/feed-drain-lookup-20-cells.md` — tied to the 20-cell
  hand-authoring era. The anti-redundancy discipline outlives the artefact.
- `content/bazi-card-skill-v4.md` — sharecard spec. Predates the current card thinking but the card is
  about to be built, so this needs a real read before it is either used or archived.
- `content/_STATIC-STRINGS.md` — system copy. Needs an audit against the one-voice ruling and the
  keyboard-characters-only rule.
- `product/PRELAUNCH-security-checklist.md` — from the June 2026 audit. Believed current and it matters
  before taking real money.

## Note on DOC-STANDARD.md

It says: *"One file per topic. No addendums."* Written to kill stale-vs-current confusion at the root.

The project then accumulated `MEMORY.md` + `MEMORY-v4-addendum.md`, and `SPEC-v5` + `SPEC-v5-addendum`,
and two competing `PROGRESS.md` files — which is exactly the confusion it was written to prevent, and
which cost a full session to untangle on 2026-08-01.

**Follow it.** When a doc changes, overwrite it and note the change in its header. Never append a
v-next addendum beside it.
