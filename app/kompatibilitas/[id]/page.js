import PasanganReport from '@/components/PasanganReport.jsx';
import { paymentsProvider } from '@/lib/paymentFence';

// `/kompatibilitas/[id]` — pending before the webhook lands, the report after.
//
// The id is a nanoid(21) from a CSPRNG and it IS the access: no account, and in
// v1 nothing is emailed. It is a bearer URL by design, which is why it is not
// enumerable.
//
// BOTH FLAGS ARE RESOLVED ON THE SERVER, because `PAYMENTS_PROVIDER` is a server
// variable and a client cannot read it:
//
//   salesClosed   an unpaid pair must not be offered a resume button that
//                 cannot complete. A PAID pair is unaffected - closing sales
//                 does not revoke what somebody already bought.
//   mockPayments  the free-walk unlock is rendered as a CONTROL whenever the
//                 provider is mock and the pair is unpaid, so a walker is never
//                 stranded on a bare URL with nothing to act on. It cannot exist
//                 in production: `paymentsProvider()` downgrades mock to closed
//                 whenever VERCEL_ENV is production.
export default async function PairPage({ params }) {
  const { id } = await params;
  const provider = paymentsProvider();
  return (
    <PasanganReport
      id={id}
      salesClosed={provider === 'closed'}
      mockPayments={provider === 'mock'}
    />
  );
}
