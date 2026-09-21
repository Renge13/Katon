import { handleDokuNotification } from '@/lib/doku/notify';

export const runtime = 'nodejs';

// POST /api/doku/notify — DOKU's signed notification, and the only place `paid`
// flips for a real payment (CLAUDE.md rule 18).
//
// THIN ON PURPOSE. Everything is in `lib/doku/notify.js` because `node --test`
// cannot resolve Next's `@/` alias, so a handler written here is a handler no spec
// can reach - and this is the one route in the app where an unreachable-by-tests
// handler is unacceptable.
//
// THE PATH IS PART OF THE SIGNATURE. `Request-Target` is `/api/doku/notify`, passed
// to the verifier as a literal rather than derived from the request, so moving this
// file breaks verification for every notification DOKU has been configured to send.
// Moving it means re-registering the URL in the DOKU Back Office.
export async function POST(request) {
  return handleDokuNotification(request);
}
