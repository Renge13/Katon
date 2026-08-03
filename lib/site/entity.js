// ============================================================
// The legal entity behind katon.app
// ============================================================
// Xendit's merchant review asks the site to name the entity that receives the
// money. These three strings are the answer, and they are user-facing chrome, so
// rule 20 applies: keyboard characters only.
//
// `name` and `address` must match the NIB COMPONENT FOR COMPONENT: same street,
// number, sector, kelurahan, kecamatan, city, province and postcode, in that
// order. NOT character for character, which an earlier version of this comment
// claimed and which was never true of its own strings. Checked against the NIB
// PDF on 2026-08-03:
//
//   Nama Pelaku Usaha : PT KATON DIGITAL NUSANTARA
//   Alamat Kantor     : Jalan Oliander 1 Blok P Nomor 9, Sektor 1-2 BSD,
//                       Desa/Kelurahan Rawabuntu, Kec. Serpong, Kota Tangerang
//                       Selatan, Provinsi Banten, Kode Pos: 15318
//
// The document sets the name in ALL CAPS, which is the form's rendering
// convention and not the name's typography, so `name` stays title case. The
// address drops the `Desa/Kelurahan`, `Kec.`, `Provinsi` and `Kode Pos:` field
// labels, which are form furniture rather than address components, and rule 20
// asks for plain composed Indonesian.
//
// `address` IS NOT RENDERED ANYWHERE TODAY (Reyner's ruling, 2026-08-03). Xendit's
// stated website criteria (Kira, ticket 2686100, 3 Aug) do not ask for an entity
// address, and the site footer reads better without one. It is kept here because
// the PDF artifact and any future invoice will want it, and because deriving it
// again from the NIB is worse than storing it once. Its absence from the footer is
// a decision, not an omission - do not "restore" it.
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
