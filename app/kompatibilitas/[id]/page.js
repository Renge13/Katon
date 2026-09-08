import PasanganReport from '@/components/PasanganReport.jsx';
import { paymentsProvider } from '@/lib/paymentFence';

// `/kompatibilitas/[id]` — pending before the webhook lands, the report after.
//
// The id is a nanoid(21) from a CSPRNG and it IS the access: no account, and in
// v1 nothing is emailed. It is a bearer URL by design, which is why it is not
// enumerable.
//
// `salesClosed` is read on the SERVER and passed down, for the same reason the
// pre-payment page does it: an unpaid pair must not be offered a resume button
// that cannot complete. A PAID pair is unaffected - closing sales does not
// revoke what somebody already bought.
export default async function PairPage({ params }) {
  const { id } = await params;
  return <PasanganReport id={id} salesClosed={paymentsProvider() === 'closed'} />;
}
