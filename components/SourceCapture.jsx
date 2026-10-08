'use client';
// ============================================================
// components/SourceCapture.jsx — the link code's first touch (Prompt BM, 2026-10-08)
// ============================================================
// Mounted once in app/layout.js, next to PageAnalytics. The layout persists across
// client navigations, so this effect runs once per full page load: it records the tab
// session's first touch and strips `k` from the address bar. Everything it does, and
// why, is in lib/site/linkSource.js. Renders nothing.
//
// A LAYOUT EFFECT, AS AN ORDERING GUARANTEE. A page may rewrite the address in its own
// effects (components/Funnel.jsx puts `/?jam=tambah` back to `/` with replaceState), and
// a capture that ran after that would lose `k`. Every layout effect runs before any
// passive one, so the URL is read as it arrived whatever a page does in its effects.
// MEASURED 2026-10-08 on a local production build, landing on /?k=th-arch1&jam=tambah:
// the layout effect captured `th-arch1`; so did a plain useEffect, because Funnel's
// rewrite waits for the post-hydration render of its useSyncExternalStore snapshot; a
// capture deferred 1s lost it (k: null). So this is a guarantee, not a fix for a race
// that bites today.
// ============================================================

import { useLayoutEffect } from 'react';
import { captureSource } from '../lib/site/linkSource.js';

export default function SourceCapture() {
  useLayoutEffect(() => { captureSource(window); }, []);
  return null;
}
