'use client';

// ============================================================
// components/CopyLink.jsx — the URL, in a field, with a button that copies it
// ============================================================
// Y-2 ruling 2 (copy-link on the paid compat report) and commit 4 (the same
// component on the mirror's reading page). ONE implementation, because the two
// surfaces make the same promise - "this link is your only way back" - and a
// second copy is a second place for the ladder below to rot.
//
// ── THREE RUNGS, AND THE HIGHLIGHT IS THE LAST ONE (Y-2c) ──
// `navigator.clipboard.writeText` is not a floor. It is undefined off HTTPS, it
// rejects when the document is not focused, and BRAVE rejects it under a
// stricter user-gesture rule than Chrome's - which is what Reyner hit on his PC:
// the button "only highlights without copying", because the fallback branch was
// the second rung and the last.
//
//   1. `writeText(url)`                     the modern API, when it is allowed
//   2. `execCommand('copy')` on the         deprecated, universally supported,
//      selected field, inside the click     and works exactly where rung 1 will
//      handler                              not
//   3. leave the field selected and say so  she copies it herself
//
// Rung 2 is the one that makes this a fix rather than a message. The selection
// is not a consolation there - it is HOW the copy happens - which is why it
// stays on screen afterwards and why that is harmless inside a field.
//
// ── THE TOAST IS PORTALLED, AND THAT IS NOT DEFENSIVE (Y-2c item 5) ──
// `position: fixed` resolves against the nearest ancestor carrying a transform,
// filter, perspective or will-change: that ancestor becomes the containing block
// and `fixed` quietly degrades to `absolute` inside it. Measured on the #114
// preview, walking the toast's own ancestors:
//
//   div.k-rise  transform: matrix(1, 0, 0, 1, 0, 0)
//   div.k-fade  transform: matrix(1, 0, 0, 1, 0, 0)
//   toast top 1814 / bottom 1871, viewport 1226   -> 645px below the fold
//
// TWO ancestors, and both transforms are the IDENTITY matrix - the reveal has
// finished and the transform is a no-op, and it still creates a containing
// block. Waiting for the animation was never going to help. `Reveal`'s transform
// is the site's motion language and is used everywhere, so the toast is the
// thing that has to stop caring where it is mounted.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from './kit.jsx';
import { CHROME_COPY } from '../lib/site/copy.js';

/** How long a toast stays up. The prompt says ~2s. */
export const COPIED_MS = 2000;

/**
 * @param {string} url   the absolute URL to show and copy
 * @param {boolean} [withCopy] render the button. False makes this a bare field,
 *   which is what the error view wants: there is nothing to copy TO yet, and a
 *   copy button beside an apology is an odd offer.
 */
export default function CopyLink({ url, withCopy = false }) {
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // The portal needs a real `document`, which does not exist during SSR. Mount
  // gates it rather than a `typeof window` check at render time: the latter
  // makes the server and the first client render disagree, which is a hydration
  // mismatch rather than a fix.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // DEFERRED, not set in the effect's body: a synchronous setState there is a
    // cascading render and the lint rule refuses it. `PasanganFromQuery` defers
    // the same way for the same reason. Nothing is portalled on the first paint
    // anyway - there is no toast until she taps.
    let live = true;
    queueMicrotask(() => { if (live) setMounted(true); });
    return () => {
      live = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function copy() {
    // RUNG 1. When the browser allows it, nothing is selected and nothing is
    // left on screen but the confirmation.
    try {
      await navigator.clipboard.writeText(url);
      show(CHROME_COPY.copy_link_done);
      return;
    } catch {
      // Rejected or absent. Fall through - deliberately no logging: a refused
      // clipboard is an ordinary event on this path, not an error.
    }

    // RUNG 2. `execCommand` is deprecated and universally supported, and it
    // needs the selection, so this is the one place selecting is the mechanism
    // rather than the apology.
    selectUrl();
    const copied = typeof document !== 'undefined'
      && typeof document.execCommand === 'function'
      && document.execCommand('copy');
    if (copied) {
      show(CHROME_COPY.copy_link_done);
      return;
    }

    // RUNG 3. The selection stays, and this time it IS the outcome, so it is
    // named: text highlighted with no message is the "nothing happened"
    // complaint one layer down.
    show(CHROME_COPY.copy_link_fallback);
  }

  /** Select the whole value. Rung 2 copies from this; rung 3 leaves it for her. */
  function selectUrl() {
    const node = inputRef.current;
    if (!node) return;
    node.focus({ preventScroll: true });
    node.select();
  }

  /** One toast slot, whichever message. Replaces any toast already up. */
  function show(message) {
    setToast(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), COPIED_MS);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
      {/* ── THE URL IS A FIELD (Y-2c item 1) ─────────────────────
          Reyner: loose text "looks buggy". This is the site's own input - the
          border, radius, padding and type come from `app/globals.css`'s
          `input[type="text"]` rule, the same one BirthFields renders through -
          so the URL reads as a value the page is showing her rather than as
          prose that wrapped badly. The value scrolls inside the field, so
          `wordBreak` is gone with the loose text.

          READ-ONLY, not disabled: a disabled input cannot be selected, and rung
          2 copies from the selection.

          Tapping it hands over the WHOLE URL. A caret dropped in the middle of a
          link is never what she wanted. */}
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={url}
        aria-label={CHROME_COPY.copy_link_field_label}
        onFocus={(e) => e.target.select()}
        style={{ flex: 1, minWidth: 0 }}
      />

      {withCopy && (
        <button
          type="button"
          onClick={copy}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 999,
            padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--tinta-soft)',
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
        >
          <Icon.lock size={11} />
          {CHROME_COPY.copy_link}
        </button>
      )}

      {/* A TOAST, NOT A RELABELLED BUTTON. A relabelled button asks her to still
          be looking at the button; a toast is where a phone reader's eye already
          is after a tap, and it leaves the control saying what it does.

          `role="status"` + `aria-live="polite"` so it is announced and not only
          drawn - polite waits for a pause, which is right for a confirmation and
          wrong for an alert. */}
      {mounted && toast && createPortal(
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
            zIndex: 50, maxWidth: 'calc(100vw - 44px)',
            background: 'var(--tinta)', color: 'var(--kertas-2)',
            borderRadius: 999, padding: '10px 18px',
            fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4,
            boxShadow: 'var(--shadow-card)', textAlign: 'center',
          }}
        >
          {toast}
        </div>,
        document.body,
      )}
    </div>
  );
}
