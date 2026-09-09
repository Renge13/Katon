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
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);
  const timerRef = useRef(null);

  async function copy() {
    // SELECT FIRST, ALWAYS. It is the fallback AND it is the feedback: on a
    // browser where the write succeeds the selection is harmless, and on one
    // where it does not she is left with the URL highlighted and one gesture
    // from copying it herself.
    const node = textRef.current;
    if (node && typeof window !== 'undefined' && window.getSelection) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // The selection above IS the outcome. Deliberately no error copy: telling
      // her the copy failed helps less than the highlighted text she can act on,
      // and `error_body` is for a broken reading, not a broken clipboard.
    }
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
          {copied ? CHROME_COPY.copy_link_done : CHROME_COPY.copy_link}
        </button>
      )}
    </div>
  );
}
