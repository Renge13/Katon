'use client';
// ============================================================
// components/PageAnalytics.jsx — Vercel Web Analytics, page views only
// ============================================================
// Prompt BG §2.4 (2026-10-06). Cookieless page views from `@vercel/analytics`, mounted
// once in app/layout.js. A client component because `beforeSend` is a function and the
// layout is a server component. Every event passes through `analyticsUrl`, which takes
// the reading token or pair id out of the URL and drops the query
// (lib/site/analyticsUrl.js says why). No custom events: the funnel's own events stay
// in `funnel_event` (lib/analytics/events.js), and Hobby has none anyway.
//
// It collects nothing until Web Analytics is enabled on the Vercel project, and nothing
// in development (the package sends only in production builds on Vercel).
// ============================================================

import { Analytics } from '@vercel/analytics/next';
import { analyticsUrl } from '../lib/site/analyticsUrl.js';

const beforeSend = (event) => ({ ...event, url: analyticsUrl(event.url) });

export default function PageAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
