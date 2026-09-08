import PasanganReport from '@/components/PasanganReport.jsx';

// `/kompatibilitas/[id]` — pending before the webhook lands, the report after.
//
// The id is a nanoid(21) from a CSPRNG and it IS the access: no account, and in
// v1 nothing is emailed. It is a bearer URL by design, which is why it is not
// enumerable.
export default async function PairPage({ params }) {
  const { id } = await params;
  return <PasanganReport id={id} />;
}
