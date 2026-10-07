// ============================================================
// The legal entity behind katon.app
// ============================================================
// Xendit's merchant review asks the site to name the entity that receives the
// money. These three strings are the answer, and they are user-facing chrome, so
// rule 20 applies: keyboard characters only.
//
// SINCE 2026-10-06 (Prompt BE §1b) `address` IS CITY AND PROVINCE ONLY, by Reyner's
// ruling; what follows is the record of the full address it was checked against.
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
//
// NO PHONE NUMBER IS ON THE SITE. A WhatsApp contact number was added for Xendit's
// second rejection 2026-08-05 and removed by Reyner 2026-10-07 (Prompt BD1 §5);
// email is the only contact channel. Asserted on the rendered /tentang by
// tests/kontak-no-whatsapp.spec.mjs.
// ============================================================

export const ENTITY = {
  name: 'PT Katon Digital Nusantara',
  // SHOWN AS CITY AND PROVINCE ONLY (Prompt BE §1b, Reyner 2026-10-06). The full NIB
  // address is the record in the comment at the top of this file; no page shows the street.
  address: 'Tangerang Selatan, Banten',
  email: 'hello@katon.app',
};
