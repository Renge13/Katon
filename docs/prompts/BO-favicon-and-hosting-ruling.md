# Prompt BO: favicon + record the 2026-10-12 hosting ruling (Reyner approved 2026-10-12)
Goes in the working tree as `docs/prompts/BO-favicon-and-hosting-ruling.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktree. Branch `feat/favicon` off `origin/main` (must contain #214, `16b5157`). Report the open-PR list first. The main checkout is on `chore/emil-skills-motion`: leave it alone.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. No engine, glossary, writer-prompt, PDF, analytics or Stage 6 change. **Do not merge.**

## 1. Favicon (Reyner: "Yes, add the favicon", 2026-10-12)
Today katon.app has no tab icon: there is no `app/icon.*`, `app/apple-icon.*` or `app/favicon.ico`, nothing in `app/layout.js` metadata names an icon, and `public/favicon.svg` is a leftover default (a purple lightning bolt) that nothing links to.
- **Design: option A, "clay dot"** (Cowork's recommendation; Reyner may switch to B before merge): a rounded square in `--kertas` (`#F4EEE3`, corner radius about 22% of the side) with a centred `--clay` (`#C4622A`) circle about 44% of the side. It is the dot from the header logomark (`components/SiteHeader.jsx`). Read both colours from `app/globals.css`, do not retype them from this file if they differ there.
  - (Option B, only if Reyner says so: the same square with a Spectral 500 capital `K` in `--tinta` and a small clay dot at its upper right.)
- **Files, the Next app-router way:** `app/icon.svg` (the mark as SVG), `app/apple-icon.png` (180x180, generated from the SVG), `app/favicon.ico` (32x32 and 16x16, for crawlers and older browsers). Delete `public/favicon.svg`.
- **Red first:** a test that fetches the built home page `<head>` and fails unless it carries an icon link that resolves (200) to an image. Show it failing on `main`.
- Screenshot the tab (light and dark browser chrome) on the preview.

## 2. Record the hosting ruling (its own commit)
Under the INTERIM REGISTER row "KATON RUNS A COMMERCIAL PRODUCT ON A NON-COMMERCIAL PLAN" in `docs/PROGRESS.md`, after the 2026-10-08 line, add verbatim:
`RULED 2026-10-12 (Reyner): "Keep on Vercel Hobby for now, I don't want to increase our overhead before we prove that our marketing can gain traction." This replaces the trigger "first promotion beyond own network". The new trigger ("traction") is not yet defined as a number: Cowork proposed one 2026-10-12, awaiting Reyner.`
Also add a STALE banner at the top of `docs/prompts/U-render-move.md` (inside its existing HTML comment): "STALE 2026-10-12: written before BotID (package botid, used in app/api/mirror/route.js and lib/mirror/handlers.js) and Vercel Web Analytics (package @vercel/analytics, components/PageAnalytics.jsx) landed. Both are Vercel-only. Refresh this prompt before running it."

## Report
`npm test`, `npm run check:qa`, CI green. PR link, preview URL, the tab screenshots. **Do not merge.**
