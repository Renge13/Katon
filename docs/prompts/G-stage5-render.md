<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-02 by Cowork.
This is PROMPT G — Stage 5, the renderer wiring. Run AFTER D2/D2a (Stage 3) is complete and its
semantic JSON exists. Its own session/PR. Prompt H (Stage 6) follows; nothing G produces may reach
a user until H's gate exists — keep the serving path behind the existing fence until H lands.
-->

# Prompt G — Stage 5: the renderer, behind a provider interface

## Read first, in order
1. `../../CLAUDE.md` — rules 14-17 are the architecture this implements.
2. `../engine/pipeline-spec.md` — Stages 4, 5, 7, PROVIDER FALLBACK, PAYLOAD STRUCTURE. The spec.
3. `../content/renderer-prompt.txt` — THE system prompt. Single source of truth. Never inline a copy.
4. `../content/renderer-prompt-notes.md` — why each rule exists; the UI CONTRACT section is a task here.
5. `../PROGRESS.md` — "Renderer measurement note (2026-08-02)" under TODO #4.

## Tasks, in commit order

### 1. Provider interface + adapters
`render(systemPrompt, semanticJson, config) -> text`. Two adapters behind it:
- **GeminiAdapter (primary): `gemini-3.1-flash-lite`** for the free mirror (model-per-tier binding
  in pipeline-spec; the tier map lives in config, not in call sites).
- **OpenAIAdapter (secondary)**: same interface, PLUS the stricter style block from pipeline-spec
  §PROVIDER FALLBACK appended after the master prompt (hard-ban em-dash, ban "bukan X tapi/melainkan
  Y" entirely, no meta, no English, no rhetorical questions).
- Config: temperature 0.0-0.2, max_output_tokens capped, structured output (JSON mode) with the
  ordered `blocks[]` contract, and a `target_language` field in the payload — build it in NOW
  (architecture decision, PROGRESS) even though only Indonesian ships.
- Failover chain exactly as specced: Gemini retry 1 → OpenAI retry 1 → module-assembled fallback.
  API keys fail-closed like the payment fence: missing key in production = refuse, never a silent
  degrade to fallback (a misconfigured deploy must be loud).

### 2. The master prompt is a FILE, and it is versioned
Load `docs/content/renderer-prompt.txt` at build/startup — never paste its text into code (two
copies drift; the notes file exists because of that failure mode). Compute `prompt_version =
hash(file contents)`. Payload order per spec: master prompt as the identical cacheable FRONT,
semantic JSON as the small varying BACK. Never interleave chart data into the front.

### 3. Cache wiring (Stage 4 + Stage 7 halves)
- Before render: key = `hash(engine_version + semantic_JSON)`; hit = serve stored, zero API call.
- After Stage 6 passes (Prompt H): store with status `unreviewed` PLUS metadata `model` and
  `prompt_version` (decided 08-02 — flagged readings must be attributable). Until H exists, store
  nothing user-servable: gate renders behind the dev fence.

### 4. Module-assembled fallback (the floor, rule 17)
The always-available zero-LLM path. NOTE: pipeline-spec still says "the ~78 blocks" — that is the
SUPERSEDED module set. The fallback assembles from `content/glossary.json` four-field facts
(label / label_meaning / gift_seed / cost_seed) ordered by the Stage 3 hierarchy. Same data the
renderer gets, concatenated instead of woven. Plain, accurate, always on.

### 5. UI contract — paragraph breaks (from renderer-prompt-notes §UI CONTRACT)
`text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)` → each part its own `<p>`.
Do NOT use `white-space: pre-wrap` (it preserves the stray single newlines the validator rejects).

### 6. Loading state copy
"Menghitung bagan kelahiranmu" — NEVER any wording that advertises AI (decided, PROGRESS: it
invites "it just rephrased my input" suspicion). String goes through the one-voice audit surface.

## Constraints
- Nothing renders to a real user until Prompt H's gate exists. Keep it fenced.
- No engine files (`lib/bazi/*`), no Stage 3 surface, no payment surface.
- Each commit independently revertable; message describes everything staged.
- Contradiction between this prompt, the spec, and the code → STOP and report. Docs win over this
  prompt; CLAUDE.md wins over docs.
