# Cloudflare Workers compatibility spike, and why the answer is Render

**One bounded session, hard stop, ruled 2026-09-05. Nothing was migrated and no remediation was
begun.** The decision rule below was fixed BEFORE the evidence was gathered, so the result could
not be rationalised afterwards.

---

## THE DECISION, AND THE RULE THAT PRODUCED IT

> - check clean AND all four paths prove out within the one session -> **Cloudflare ($5/mo)**
> - ANY meaningful remediation work -> **Render ($7/mo flat)**
>
> The gap is $2/month. $24/year does not buy engineering time and does not buy risk on the PDF
> path, which is the entire paid product. **If you find yourself estimating how long a fix would
> take, the rule has already answered: Render.**

**THE ANSWER IS RENDER.** Two runtime `fs` reads exist in shipped server code, both on paid or
core paths, and each needs conversion to a bundled import or a static-asset binding. That is
meaningful remediation and the rule resolves without an estimate.

**THE RULE ALSO CAUGHT THE PERSON APPLYING IT, which is recorded because it is the whole reason
the rule was pre-committed.** On finding that the Han TTF is only 19,600 bytes and committed to
the repo, the immediate thought was *"that is a trivial base64 inline"*. **That is an estimate of
remediation effort, and the rule forbids exactly it.** The instinct was correct about difficulty
and irrelevant to the decision.

### IF AND WHEN THE MIGRATION HAPPENS, THIS IS THE FIRST LINE OF ITS BRIEF

> # THE RENDER SERVICE MUST BE IN SINGAPORE.

Not a footnote. `63d6488` moved the Vercel functions to `sin1` (`ap-southeast-1`) to sit in the
database's own AWS region, and `docs/qa/2026-09-05-region-move-both-legs.md` measures what that
bought: **tap -> chart 2,776.5ms -> 240.5ms, an 11.5x improvement, and prose cache hits
3,263ms -> 275.5ms.** All of it came from collocation. **A Render deployment in the wrong region
hands the entire 11.5x back**, and it would do so silently - the app would work, and only a
measurement would show it. The Supabase project is `ap-southeast-1`, Southeast Asia (Singapore),
`t4g.nano`.

---

## THE CHECK, VERBATIM

Cloudflare now recommends `vinext` over OpenNext and ships a compatibility checker.

```
$ npx --yes vinext check

  vinext compatibility report
  ========================================

  Imports: 3/4 fully supported
    ~  next/font/google (4 files) — fonts loaded from CDN, not self-hosted at build time
    ✓  server-only (49 files)
    ✓  next/server (4 files) — NextRequest/NextResponse shimmed
    ✓  next/link (6 files)

  Project structure:
    ✓  App Router (app/)
    ✓  7 page(s)
    ✓  1 layout(s)
    ✓  11 route handler(s)
    ✗  __dirname / __filename (CommonJS globals) — CJS globals unavailable in ESM — use
       fileURLToPath(import.meta.url) / dirname(...), or import.meta.dirname / import.meta.filename (Node 22+)

  ----------------------------------------
  Overall: 83% compatible (7 supported, 1 partial, 1 issues)

  Issues to address:
    ✗  __dirname / __filename (CommonJS globals)
       .claude/worktrees/adoring-cartwright-7187c4/scripts/build-content.mjs
       .claude/worktrees/adoring-cartwright-7187c4/scripts/diff-matahari.mjs
       .claude/worktrees/festive-mclaren-48c603/scripts/build-content.mjs
       .claude/worktrees/festive-mclaren-48c603/scripts/diff-matahari.mjs

  Partial support (may need attention):
    ~  next/font/google — fonts loaded from CDN, not self-hosted at build time
```

### THE CHECK IS WRONG IN BOTH DIRECTIONS, AND NEITHER ERROR FAVOURS CLOUDFLARE

**Its single ✗ is a FALSE POSITIVE.** All four files live under `.claude/worktrees/`, which are
scratch git worktrees on other branches, not shipped source:

```
$ git worktree list
D:/claude-projects/katon                                             1118d58 [main]
D:/claude-projects/katon/.claude/worktrees/adoring-cartwright-7187c4 5773566 [claude/adoring-cartwright-7187c4]
D:/claude-projects/katon/.claude/worktrees/festive-mclaren-48c603    63e19b8 [claude/festive-mclaren-48c603]
D:/claude-projects/katon/.claude/worktrees/great-satoshi-e5867f      0a73771 (detached HEAD)

$ grep -rn "__dirname\|__filename" lib app components scripts tests
                                    # no output
```

`scripts/build-content.mjs` was moreover **deleted in the 2026-08-23 promotion** (CLAUDE.md,
SUPERSEDED). The checker flagged a deleted file from a stale branch.

**And its clean verdict on everything else is not evidence, because it never examined the
questions.** The report says nothing about runtime `fs`, nothing about `node:crypto`, and nothing
about `@react-pdf/renderer`. **An 83% that omits the four load-bearing paths is not an answer to
them**, and Cloudflare's own docs are silent on runtime `fs` - which is why each was checked
directly below rather than inferred.

---

## a) SSR AND THE 11 ROUTE HANDLERS

Eleven, matching the checker's count, and **every one declares the Node runtime**:

```
$ for f in $(find app/api -name route.js | sort); do printf "%-45s %s\n" "$f" \
    "$(grep -o "runtime = '[a-z]*'" $f | head -1)"; done
app/api/deliver/[id]/card/route.js            runtime = 'nodejs'
app/api/deliver/[id]/pdf/route.js             runtime = 'nodejs'
app/api/deliver/[id]/route.js                 runtime = 'nodejs'
app/api/keepalive/route.js                    runtime = 'nodejs'
app/api/mirror/[token]/event/route.js         runtime = 'nodejs'
app/api/mirror/[token]/feedback/route.js      runtime = 'nodejs'
app/api/mirror/[token]/route.js               runtime = 'nodejs'
app/api/mirror/route.js                       runtime = 'nodejs'
app/api/pay/[id]/route.js                     runtime = 'nodejs'
app/api/season-check/route.js                 runtime = 'nodejs'
app/api/webhook/xendit/route.js               runtime = 'nodejs'
```

`next/server` is shimmed per the report. **`next/font/google` is flagged partial** - fonts would
load from a CDN rather than being self-hosted at build time. Not resolved here, and it is a real
question rather than a cosmetic one: this repo has `tests/app-fonts.spec.mjs`, and the card's
rendering is font-dependent by construction.

## b) THE PDF PATH - A RUNTIME DISK READ

```
$ grep -rn "readFileSync\|existsSync\|from 'node:fs'" lib/ app/ components/
lib/pdf/fonts.js:33:import fs from 'node:fs';
lib/pdf/fonts.js:79:  if (!fs.existsSync(HAN_TTF)) {
lib/pdf/fonts.js:85:  const buf = fs.readFileSync(HAN_TTF);
lib/render/prompt.js:30:import { readFileSync } from 'node:fs';
lib/render/prompt.js:86:      return normalizeNewlines(readFileSync(path, 'utf8'));

$ grep -n "HAN_TTF =" lib/pdf/fonts.js
58:export const HAN_TTF = path.join(HERE, 'fonts', 'noto-serif-tc-han.ttf');
```

`HERE` derives from `fileURLToPath(import.meta.url)`. **This reads a TrueType file off disk at
request time**, and Workers has no runtime filesystem. Also on this path: `node:zlib`
(`inspect.js:34`), `Buffer` (`ttf.js:79`, `inspect.js:223`, `:457`), and
`@react-pdf/renderer`'s `renderToBuffer` (`lib/pdf/build.js:48`), which
`app/api/deliver/[id]/pdf/route.js:12` notes needs the CLIENT React build.

**Bundle size is NOT the obstacle** - the TTF is a 19,600-byte subset and is committed
(`git ls-files lib/pdf/fonts/` lists it). The obstacle is that the read happens at runtime at
all, and that `@react-pdf/renderer` end-to-end on Workers is unproven here. **It was not
attempted, per the "do not begin remediation" instruction.**

## c) `lib/render/prompt.js` - THE STRONGEST FINDING IN THIS SPIKE

Reyner, 2026-09-05: *"the PROMPT_VERSION / prompt_version:null finding is the strongest argument
in the spike - better than the fs read, because it describes a failure that degrades silently
into an existing legitimate value rather than going red."* It is written out here for that reason.

```
$ grep -n "createHash\|readFileSync" lib/render/prompt.js
29:import { createHash } from 'node:crypto';
30:import { readFileSync } from 'node:fs';
86:      return normalizeNewlines(readFileSync(path, 'utf8'));

$ sed -n '129,134p' lib/render/prompt.js
export const PROMPT_VERSION = createHash('sha256')
  .update(MASTER_PROMPT)
  .update(' directive ')
  .update(DIRECTIVE_TEMPLATE)
  .digest('hex')
  .slice(0, 16);
```

**`PROMPT_VERSION` is a MODULE-SCOPE SYNCHRONOUS CONST.** It is evaluated once, deterministically,
before any request is served. Web Crypto's `crypto.subtle.digest` is **async**, so a port that
had to use it could not keep this shape: the value would become a promise, and every consumer
would have to await it -

```
lib/render/index.js:444    prompt_version: PROMPT_VERSION      (stamped onto the render result)
lib/render/cache.js:96     prompt_version: entry.promptVersion (written onto the cached row)
lib/mirror/view.js:219     prompt_version: rendered.prompt_version ?? null
lib/pdf/document.js:345    rendered.prompt_version && `prompt ${...}`  (printed in the PDF)
```

**THE DANGER IS NOT THE AWAIT. IT IS THAT `prompt_version: null` IS ALREADY A LEGITIMATE VALUE.**

```
$ grep -rn "prompt_version: null" lib/
lib/mirror/handlers.js:425:    prompt_version: null,
lib/render/index.js:500:    prompt_version: null,
```

Those nulls are the floor's - a module-assembly result had no prompt, so it correctly stamps
nothing. **So an async version stamp that is not yet resolved, or is awaited wrongly on one path,
writes `null` onto a REAL Gemini render - and that null is indistinguishable from a floor's.**

Nothing goes red. No test fails. The row is written, the reading serves, and the only casualty is
that *"which prompt produced this cached reading"* silently stops being answerable - which is the
exact question `STAGE6_VERSION`'s own convention exists to keep answerable, and which
`persistRendered` writes that field onto every row in order to preserve. **A failure that
degrades into an existing valid value is worse than one that throws**, and this repo has the
scar: CLAUDE.md's rule that a stale `STAGE6_VERSION` is *"the one thing that makes it
unanswerable"* was earned when two materially different gates both stamped `1.9.0`.

**This is not a claim that Workers cannot hash synchronously.** `node:crypto` under
`nodejs_compat` may well provide `createHash`; that was not verified and is not asserted. The
finding is about what the versioning discipline costs **if** the port forces the async form, and
it is a cost no bundle-size or benchmark check would ever surface.

## d) THE WEBHOOK AND CARD CAPTURE

```
$ grep -rn "from 'node:\|crypto" lib/xendit.js
lib/xendit.js:9:import crypto from 'node:crypto';
lib/xendit.js:53:  const ha = crypto.createHash('sha256').update(String(a), 'utf8').digest();
lib/xendit.js:55:  return crypto.timingSafeEqual(ha, hb);
```

`timingSafeEqual` is the doubtful member - it is a Node-specific primitive with no Web Crypto
equivalent, and its availability under `nodejs_compat` was not verified here.

**CARD CAPTURE IS NOT A WORKERS CONCERN AT ALL, and this is the one path that comes back clean
for a structural reason:** it runs in the browser.

```
$ grep -rn "toPng\|html-to-image" components/ | head -3
components/cards/exportCards.js:58:import { toPng } from 'html-to-image';
components/cards/exportCards.js:212:  return toPng(node, {
```

The server never renders the card image. Whatever host runs the app, this path is unaffected.

---

## WHAT THIS SPIKE DID NOT DO

- **No migration.** Nothing was moved, no host was provisioned, no config written.
- **No remediation.** Neither `fs` read was converted, and `vinext init` was not run. The
  recommended next steps in the check's own output were deliberately not followed.
- **`timingSafeEqual` and `createHash` under `nodejs_compat` were NOT verified**, nor was
  `@react-pdf/renderer` executed on Workers. Once the decision rule had fired on (b), further
  verification would have been spending the session to refine an answer already given.
- **Render was not evaluated in depth either.** It is the rule's output, not a measured
  preference over Railway. The one thing this document asserts about it is the region.
