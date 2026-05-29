import Funnel from '@/components/Funnel.jsx';

// The state-driven funnel:
// input → ~2.5s anticipation → sharecard → free read → bridge → paywall → unlock.
export default function HomePage() {
  return <Funnel />;
}
