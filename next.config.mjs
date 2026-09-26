/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router. The shared `public/` directory serves static assets.

  // Stage 5 reads docs/content/renderer-prompt.txt at runtime (lib/render/prompt.js).
  // A `.txt` has no import form the bundler can follow the way `glossary.json` is
  // followed, so the file is traced explicitly. Without this the file is absent from
  // the serverless bundle and the renderer throws ENOENT on the first cache miss in
  // production while working perfectly in dev.
  outputFileTracingIncludes: {
    // BOTH prompts. The pair prompt is READ AT RUNTIME exactly like the
    // mirror's, so a missing trace entry is a deploy that throws at module load
    // on every route touching the render chain - the failure the mirror entry's
    // own comment in lib/render/prompt.js describes.
    '/api/**/*': [
      './docs/content/renderer-prompt.txt',
      './docs/content/compat-renderer-prompt.txt',
      // Voice v2 (round 2, VOICE=v2 on Preview only). Read at module load exactly
      // like the two above, so untraced they would throw on every render route.
      './docs/content/renderer-prompt-v2.txt',
      './docs/content/compat-renderer-prompt-v2.txt',
      './docs/content/voice-examples-v2.txt',
      // THE HANZI FACE, added 2026-09-21. Same fault as the two prompts above and
      // the same fix, one asset later: `lib/pdf/fonts.js` reads it with
      // `fs.readFileSync(path.join(...))`, which no bundler can follow, so without
      // this entry it is absent from the lambda and BOTH PDF routes throw a bodyless
      // 500 on every deployed request while every local build is perfect. Measured
      // off `app/api/pair/[id]/pdf/route.js.nft.json`: 238 files traced, 0 fonts.
      './lib/pdf/fonts/noto-serif-tc-han.ttf',
      // THE HEADING FACE, added 2026-09-22 (AB §4, A12). Same reason, same failure
      // mode: `lib/pdf/fonts.js` reads these with `fs.readFileSync(path.join(...))`,
      // which no bundler can follow, so without these two lines both PDF routes 500
      // in the lambda while every local build is perfect. That is #123 exactly, and
      // the whole point of writing them here in the same commit as the registration.
      './lib/pdf/fonts/spectral-400.ttf',
      './lib/pdf/fonts/spectral-600.ttf',
    ],
  },
};

export default nextConfig;
