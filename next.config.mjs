/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is the default in Next 15. The old Vite app (src/, index.html,
  // vite.config.js) coexists in the tree as a reference during the migration and
  // is NOT compiled by Next — Next only builds `app/` and what it imports.
  // The shared `public/` directory works for both Vite and Next.
  //
  // NOTE: the legacy Vite demo was moved from `src/pages/` → `src/demo/` so Next
  // does not auto-detect it as a Pages Router and try to compile it. (Restricting
  // pageExtensions instead breaks App Router resolution.) Revert is irrelevant —
  // `src/` is deleted in Phase 4b cleanup.

  // The repo's flat ESLint config is tuned for the Vite React app and lints the
  // legacy `src/` files (pre-existing warnings) with rules that don't fit Next
  // route handlers. Don't let it gate Next builds. `npm run lint` still runs it.
  // TODO(Phase 4b): remove this once legacy `src/` is deleted, so Next lint runs
  // on builds again (with a Next-appropriate ESLint config).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
