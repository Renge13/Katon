import { servePairPdf } from '@/lib/pair/servePdf.js';
import { buildPairPdf } from '@/lib/pdf/build.js';

export const runtime = 'nodejs';

// GET /api/pair/[id]/pdf — the compat document, for a paid pair.
//
// THE COMPOSER IS WIRED HERE AND NOT IN THE HANDLER, which is the `server-only`
// seam `lib/deliver/handlers.js` documents: under `--conditions=react-server` a
// module importing the PDF builder cannot also import `render/cache.js`, and one
// importing the cache cannot import the builder. Inside Next both coexist - a Node
// route is not an RSC - so the route file joins them and `lib/pair/servePdf.js`
// stays testable under the condition its siblings use.
export async function GET(request, { params }) {
  const { id } = await params;
  return servePairPdf(request, id, { renderPdf: buildPairPdf });
}
