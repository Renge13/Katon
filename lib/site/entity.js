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
// `address` IS STILL NOT IN THE FOOTER, and now renders on /tentang instead
// (Reyner's ruling, 2026-08-05). The 08-03 ruling that dropped it entirely was
// correct for the criteria Xendit had stated at the time (Kira, ticket 2686100,
// 3 Aug), which did not ask for an entity address. The SECOND rejection does ask:
// "Make sure it contains your product / services, prices, checkout page, address,
// and contact number." So the address is back on the site but NOT in the footer -
// the footer stays visually quiet, and a contact section on the business-description
// page is where a reviewer looks anyway. Absence from the FOOTER is still a
// decision; do not "restore" it there.
//
// `email` is hello@katon.app, on the domain the reviewer is already looking at,
// forwarding to Reyner's private mailbox (CONFIRMED by Reyner 2026-08-03). The
// gmail on the NIB was rejected as the public contact: a payment merchant whose
// only contact is a free mail domain reads as unverified.
// ============================================================

// `whatsapp` is the contact number the second rejection asks for, given by Reyner
// 2026-08-05. Two renderings of ONE number, held side by side and deliberately NOT
// derived from each other: `whatsapp` is the display form in the 0-prefix convention
// an Indonesian reader expects, `whatsappE164` is what a wa.me link requires (the
// leading 0 replaced by the 62 country code). A regex doing that substitution at
// render time is one silent bug away from a dead contact link on the one page a
// merchant reviewer opens to check the contact details.
export const ENTITY = {
  name: 'PT Katon Digital Nusantara',
  address:
    'Jalan Oliander 1 Blok P Nomor 9, Sektor 1-2 BSD, Rawabuntu, Serpong, Kota Tangerang Selatan, Banten 15318',
  email: 'hello@katon.app',
  whatsapp: '0818805913',
  whatsappE164: '62818805913',
};
