import { ReadingByToken } from '@/components/Funnel.jsx';

// Persistent re-access route. The [token] is the reading id (nanoid PK) — the same
// value sendReadingLink builds into katon.app/r/<token> and the funnel pushes to the
// URL on reading creation. The client component fetches the existing server-gated
// endpoints and renders the reading (full paid content if paid, else teaser+paywall;
// invalid token → a clean not-found state). No gating lives here — it stays in /full.
export default async function ReadingPage({ params }) {
  const { token } = await params; // Next 15: params is async
  return <ReadingByToken token={token} />;
}
