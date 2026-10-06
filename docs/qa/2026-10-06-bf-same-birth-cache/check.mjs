// Run from the repo root: node --conditions=react-server docs/qa/2026-10-06-bf-same-birth-cache/check.mjs
// Prompt BF §1e, report only: the same birth date created twice. Does the second
// reading's text come from the result cache (rule 16) or call Gemini again?
// Runs the real create + serve handlers on the local in-memory store; the provider's
// network call is stubbed and COUNTED, so no money is spent.
const R = new URL('../../../', import.meta.url).href;
const { createMirrorReading, serveMirrorReading } = await import(R + 'lib/mirror/handlers.js');
const { __clearMemCache } = await import(R + 'lib/render/cache.js');
const { assembleFallback } = await import(R + 'lib/render/fallback.js');
const { semanticFromRow } = await import(R + 'lib/mirror/reading.js');
const { __clearMemRateLimit } = await import(R + 'lib/ratelimit.js');

process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
let calls = 0;
let mode = 'pass';
const mem = () => globalThis.__katonReadingMem;

function stub(semanticJson) {
  globalThis.fetch = async () => {
    calls += 1;
    if (mode === 'fail') return new Response('upstream down', { status: 503 });
    const reading = { blocks: assembleFallback(semanticJson).blocks, penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.' };
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(reading) }] }, finishReason: 'STOP' }] });
  };
}
const req = (method, body) => new Request('http://localhost/api/mirror', {
  method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
});
async function createAndServe(body) {
  const created = await (await createMirrorReading(req('POST', body))).json();
  stub(semanticFromRow(mem().get(created.token)).semanticJson);
  const before = calls;
  const served = await (await serveMirrorReading(req('GET'), created.token)).json();
  return { token: created.token, providerCalls: calls - before, cached: served.meta?.cached, source: served.meta?.source, error: served.error };
}

async function scenario(name, first, second, firstMode = 'pass') {
  mem().clear(); __clearMemCache(); __clearMemRateLimit(); calls = 0;
  mode = firstMode;
  const a = await createAndServe(first);
  mode = 'pass';
  const b = await createAndServe(second);
  console.log(`\n${name}`);
  console.log('  first ', JSON.stringify(a));
  console.log('  second', JSON.stringify(b));
}

await scenario('A. same date, same hour, same gender', { birthDate: '1989-09-13', birthTime: '04:00', gender: 'female' }, { birthDate: '1989-09-13', birthTime: '04:00', gender: 'female' });
await scenario('B. same date, no hour both times', { birthDate: '1989-09-13', birthTime: null }, { birthDate: '1989-09-13', birthTime: null });
await scenario('C. same date and hour, different gender', { birthDate: '1989-09-13', birthTime: '04:00', gender: 'female' }, { birthDate: '1989-09-13', birthTime: '04:00', gender: 'male' });
await scenario('D. same date, hour added the second time (H3 path)', { birthDate: '1989-09-13', birthTime: null }, { birthDate: '1989-09-13', birthTime: '04:00' });
await scenario('E. same date, the first render FLOORED (provider down)', { birthDate: '1989-09-13', birthTime: '04:00' }, { birthDate: '1989-09-13', birthTime: '04:00' }, 'fail');
// Control: the instrument must be able to report a provider call at all.
console.log('\ncontrol: scenario A first serve must show providerCalls >= 1 and cached false, or this check proves nothing.');
