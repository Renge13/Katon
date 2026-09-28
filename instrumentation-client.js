// ============================================================
// instrumentation-client.js — Vercel BotID Basic, client half (Prompt AK §3.3)
// ============================================================
// Reyner's ruling 6, as changed by AJ amendment 2: BotID Basic on the
// create-reading route only (docs/product/ah-protection-rulings-2026-09-28.md).
// Next.js 15.3+ runs this file on every page load, which is where
// vercel.com/docs/botid/get-started puts initBotId(); the page that sends the POST
// (components/Funnel.jsx, the home page) is one of them. It attaches BotID's headers
// ONLY to the request listed below, and app/api/mirror/route.js checks them.
//
// ONE ENTRY, ON PURPOSE. Not the permalink or result-page GET, not the paid pages,
// the PDFs, the DOKU notify route, or a re-render of an existing reading. Never Deep
// Analysis: that is a paid Firewall toggle in the Vercel dashboard, left off.
// ============================================================

import { initBotId } from 'botid/client/core';

initBotId({
  protect: [{ path: '/api/mirror', method: 'POST' }],
});
