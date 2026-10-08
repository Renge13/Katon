'use client';
// ============================================================
// components/SourceCapture.jsx — the link code's first touch (Prompt BM, 2026-10-08)
// ============================================================
// Mounted once in app/layout.js, next to PageAnalytics. The layout persists across
// client navigations, so this effect runs once per full page load: it records the tab
// session's first touch and strips `k` from the address bar. Everything it does, and
// why, is in lib/site/linkSource.js. Renders nothing.
//
// A LAYOUT EFFECT, NOT A PASSIVE ONE. Passive effects run children first, and a page can
// rewrite the address in its own (components/Funnel.jsx puts `/?jam=tambah` back to `/`
// with replaceState), which would take `k` with it before this read the URL. Every
// layout effect runs before any passive one, so the landing URL is read as it arrived.
// ============================================================

import { useLayoutEffect } from 'react';
import { captureSource } from '../lib/site/linkSource.js';

export default function SourceCapture() {
  useLayoutEffect(() => { captureSource(window); }, []);
  return null;
}
