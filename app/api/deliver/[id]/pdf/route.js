import { serveDeliveryPdf } from '@/lib/deliver/handlers.js';
import { buildCompleteEditionPdf } from '@/lib/pdf/build.js';

export const runtime = 'nodejs';

// GET /api/deliver/[id]/pdf
// The Complete Edition, gated on `row.paid === true`. Prompt M build step 6.
//
// THIS FILE IS WHERE THE TWO HALVES MEET, and that is the whole reason the builder
// is passed in rather than imported by the handler. `lib/render/cache.js` carries
// `server-only`, which is satisfied only by a bundler or by
// `--conditions=react-server`; `@react-pdf/renderer` needs the CLIENT React build
// and its reconciler crashes under that condition. Under plain `node` the two are
// mutually exclusive, which is why every route-handler test in this repo runs with
// that flag and could not otherwise reach the gate. Inside Next they coexist - the
// bundler satisfies `server-only` and a Node route is not an RSC. See
// scripts/build-pdf.mjs, which pays the same cost with a child process.
//
// The builder runs the page-reference fixed point and REFUSES to emit a document
// whose cross-references drifted, so a failure here is a 500 rather than a wrong
// document. That is deliberate (prompt M correction 3: ship-blocking).
export async function GET(request, { params }) {
  const { id } = await params;
  return serveDeliveryPdf(request, id, { renderPdf: buildCompleteEditionPdf });
}
