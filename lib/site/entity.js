// ============================================================
// The legal entity behind katon.app
// ============================================================
// Xendit's merchant review asks the site to name the entity that receives the
// money. These three strings are the answer, and they are user-facing chrome, so
// rule 20 applies: keyboard characters only.
//
// `name` and `address` must match the NIB CHARACTER FOR CHARACTER. A merchant
// name that differs from the registration document by a word is exactly the
// mismatch that got ticket 2686100 rejected once already, so do not "tidy" the
// address: no reordering, no abbreviating Nomor to No., no adding a comma.
//
// `email` is hello@katon.app, on the domain the reviewer is already looking at,
// forwarding to Reyner's private mailbox (CONFIRMED by Reyner 2026-08-03). The
// gmail on the NIB was rejected as the public contact: a payment merchant whose
// only contact is a free mail domain reads as unverified.
// ============================================================

export const ENTITY = {
  name: 'PT Katon Digital Nusantara',
  address:
    'Jalan Oliander 1 Blok P Nomor 9, Sektor 1-2 BSD, Rawabuntu, Serpong, Kota Tangerang Selatan, Banten 15318',
  email: 'hello@katon.app',
};
