'use client';

// ============================================================
// components/CopyLink.jsx — the URL, and a button that copies it
// ============================================================
// Y-2 ruling 2 (copy-link on the paid compat report) and commit 4 (the same
// component on the mirror's reading page). ONE implementation, because the two
// surfaces make the same promise - "this link is your only way back" - and a
// second copy is a second place for the fallback below to rot.
//
// ── THE FALLBACK IS NOT OPTIONAL ───────────────────────────
// `navigator.clipboard` is undefined on any page not served over HTTPS or
// localhost, and it REJECTS rather than throws when the document is not focused.
// Katon's reader is on a phone, on a link she may have opened from a chat app's
// in-app browser, where both are live possibilities. So the promise chain is
// caught, and the fallback selects the text so she can copy it herself - the
// worst case is the behaviour we had before the button existed, never a button
// that silently does nothing.

import { useRef, useState } from 'react';

import { Icon } from './kit.jsx';
import { CHROME_COPY } from '../lib/site/copy.js';

/** How long `Tautan tersalin` stays up. The prompt says 2s. */
export const COPIED_MS = 2000;

/**
 * @param {string} url   the absolute URL to show and copy
 * @param {boolean} [withCopy] render the button. False makes this a bare URL,
 *   which is what the error view wants: there is nothing to copy TO yet, and a
 *   copy button beside an apology is an odd offer.
 */
export default function CopyLink({ url, withCopy = false }) {
  const [toast, setToast] = useState(null);
  const textRef = useRef(null);
  const timerRef = useRef(null);

  async function copy() {
    // ── COPY FIRST. NO SELECTION ON THE HAPPY PATH. ───────────
    // This used to select the URL BEFORE calling `writeText`, under a comment
    // reading "SELECT FIRST, ALWAYS" - the selection was meant as a fallback and
    // a nudge. On a phone it is the only VISIBLE outcome, so tapping "Salin
    // tautan" looked like the app had highlighted the link instead of copying
    // it. Reyner reported exactly that from the #113 walk.
    //
    // The fix removes the cause rather than adding a condition around it: the
    // selection now happens ONLY where it is genuinely the fallback.
    try {
      await navigator.clipboard.writeText(url);
      show(CHROME_COPY.copy_link_done);
    } catch {
      // The clipboard refused - undefined off HTTPS, or a rejected write on an
      // unfocused document, both live for a reader inside a chat app's browser.
      // NOW the selection earns its place, and it gets a message: selecting text
      // silently is the same "nothing happened" complaint one layer down.
      selectUrl();
      show(CHROME_COPY.copy_link_fallback);
    }
  }

  /** Put the URL in the reader's own selection, so she can copy it by hand. */
  function selectUrl() {
    const node = textRef.current;
    if (!node || typeof window === 'undefined' || !window.getSelection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /** One toast slot, whichever message. Replaces any toast already up. */
  function show(message) {
    setToast(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), COPIED_MS);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 8 }}>
      <div
        ref={textRef}
        style={{ fontSize: 13, color: 'var(--tinta-soft)', wordBreak: 'break-all', flex: 1, lineHeight: 1.6 }}
      >
        {url}
      </div>
      {withCopy && (
        <button
          type="button"
          onClick={copy}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 999,
            padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--tinta-soft)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon.lock size={11} />
          {CHROME_COPY.copy_link}
        </button>
      )}

      {/* ── A TOAST, NOT A RELABELLED BUTTON (Y-2b item 2) ────────
          Reyner ruled the confirmation as a toast over content. A relabelled
          button asks her to still be looking at the button; a toast at the
          bottom is where a phone reader's eye already is after a tap, and it
          leaves the control saying what it does.

          `role="status"` so it is announced rather than only drawn -
          `aria-live="polite"` waits for a pause, which is right for a
          confirmation and wrong for an alert. */}
      {toast && (
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
        </div>
      )}
    </div>
  );
}
