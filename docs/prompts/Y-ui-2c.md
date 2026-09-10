# Prompt Y-ui-2c: copy-link on desktop, and the URL in a field (Reyner, 2026-09-10, after #114)

Cowork, 2026-09-10. #114 merged. Reyner's second walk: the copy button WORKS ON HIS PHONE (toast seen)
and on his PC it "only highlights without copying". Plus a UX ruling: the URL must sit in a field
block, not as loose text ("looks buggy").

Facts, from `components/CopyLink.jsx` as merged (staged from the tree 2026-09-10): `copy()` awaits
`navigator.clipboard.writeText(url)` first, no pre-selection; the `catch` selects the text and shows
`copy_link_fallback`. So on his PC the clipboard write is REJECTING and the fallback branch is what he
saw. ANSWERED 2026-09-10: the PC browser is BRAVE, and a toast appeared together with the highlight,
i.e. the fallback toast - `writeText` rejected. Brave enforces a stricter user-gesture rule on the
async clipboard API than Chrome (brave/brave-browser #16890, #18032). The fix below does not depend on
the cause; rung 2 (`execCommand('copy')` on a selected input inside the click handler) is what works
where the async API refuses.

One PR, one commit for the behaviour, the prompt file alongside.

## 1. The URL lives in a read-only input (Reyner ruling)
Render `url` in `<input type="text" readOnly value={url} />` styled as the site's field (same border,
radius, padding and font as BirthFields inputs; `wordBreak` no longer needed; the value scrolls
horizontally inside the field). Button beside it as now. `aria-label` on the input from a chrome
slot (`copy_link_field_label`, Cowork draft `Tautan bacaan`, ships under the chrome process ruling).
Tapping the input itself selects its whole value (`onFocus` -> `select()`): a field a reader taps
should hand her the URL, not put a caret in the middle of it.

## 2. Copy: three rungs, and the highlight is the last one
```
try { await navigator.clipboard.writeText(url); show(copy_link_done); return; } catch {}
input.select();
const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
if (ok) { show(copy_link_done); return; }        // selection stays, harmless inside a field
show(copy_link_fallback);                         // selection stays, and this time it IS the outcome
```
Why the middle rung: `execCommand('copy')` inside a click handler with a selected input works in
every desktop browser and in most in-app webviews, including where the async API rejects for focus
or permission reasons - which is Reyner's PC and Code's automated pane alike. Deprecated, universally
supported, and the point is that the reader gets the URL. Rule 20 applies to any new string.

## 3. Tests - each shown red on the merged code first
(a) `writeText` resolves: `copy_link_done` toast, `execCommand` NOT called, no selection made.
(b) `writeText` rejects, `execCommand` returns true: `copy_link_done` toast, selection made.
(c) `writeText` rejects, `execCommand` returns false/absent: `copy_link_fallback` toast, selection made.
(d) The rendered element is an `<input readOnly>` carrying the URL as its value, on BOTH surfaces
(compat report and mirror).
(b) is the new behaviour and must be red on the merged code (which goes straight to the fallback).

## 4. Proof
On the Vercel preview, in the automated pane where `writeText` is known to reject: tap the button and
show that the toast is `copy_link_done` (rung 2 succeeding), not `copy_link_fallback`. That is the
same environment that failed in #114, now passing for the reason the fix exists. If `execCommand`
also fails in the pane, say so with the output. THE MERGE PROOF IS REYNER'S: one click in Brave on the
preview must show `Tautan tersalin` AND paste the URL. Until that click, the PR stays open.

## 5. The toast renders mid-screen, not at the bottom (Reyner, phone screenshot 2026-09-10)
Observed on the #114 preview in Brave mobile: the "Tautan tersalin" toast sits about 28 px above the
bottom edge of the LINK BOX, over the URL text, not at the bottom of the viewport. `position: fixed`
with `bottom: 28` resolves against the nearest ancestor that has a `transform`, `filter`,
`backdrop-filter`, `perspective` or `will-change: transform` - that ancestor becomes the containing
block and "fixed" degrades to "absolute inside it". The link box is inside the report's `Reveal`
stagger wrapper, which animates with a transform; that is Cowork's inference - CONFIRM it with
`getComputedStyle` on the toast's ancestors on the preview and quote the offending property in the
PR body. Fix regardless of which ancestor it is: render the toast through `createPortal(..., document.body)`
so no ancestor can capture it (guard for SSR: portal only after mount). Test: after a copy, the toast
element's `parentElement` is `document.body`; shown red on the merged code (parent is the CopyLink div).
Reyner's word for the current state is "janky"; the toast must appear at the bottom of the screen on
both surfaces.

## NOT in this PR
Anything else on the report. Prompt Z is Cowork's and is next.
