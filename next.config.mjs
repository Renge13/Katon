/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router. The shared `public/` directory serves static assets.

  // Stage 5 reads docs/content/renderer-prompt.txt at runtime (lib/render/prompt.js).
  // A `.txt` has no import form the bundler can follow the way `glossary.json` is
  // followed, so the file is traced explicitly. Without this the file is absent from
  // the serverless bundle and the renderer throws ENOENT on the first cache miss in
  // production while working perfectly in dev.
  outputFileTracingIncludes: {
    '/api/**/*': ['./docs/content/renderer-prompt.txt'],
  },
};

export default nextConfig;
