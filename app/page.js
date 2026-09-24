import Funnel from '@/components/Funnel.jsx';
import { checkoutOpen } from '@/lib/paymentFence';

// The state-driven funnel:
// input → ~2.5s anticipation → sharecard → free read → bridge → paywall → unlock.
export default function HomePage() {
  return <Funnel salesOpen={checkoutOpen()} />;
}
