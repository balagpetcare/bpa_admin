import { getContentSecurityPolicy, getRemotePatterns } from './media-config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: getRemotePatterns(),
  },
  // CSP headers are now managed dynamically by middleware.ts to support nonces.
  // NOTE: output: 'standalone' is intentionally NOT set for admin-panel.
  // Next.js 16.0.8 has a bug where standalone output fails with ENOENT on
  // middleware.js.nft.json when Edge Runtime middleware (middleware.ts) is
  // present. The admin-panel uses Edge Runtime middleware for auth.
  // The Docker image uses `next start` instead (see admin-panel/Dockerfile).
  // Landing-web, which has no middleware.ts, correctly uses standalone.
  async redirects() {
    return [
      {
        // /auth/lock-screen used to render an unmodified Larkon template
        // demo page ("Hi! Gaston", a non-functional password form, a
        // dead-end "Sign Up" link). A redirect() call in the route's own
        // page.tsx handles this for real browsers, but App Router can
        // serve that as an RSC payload instead of a raw HTTP redirect on
        // some request shapes — a config-level redirect here guarantees a
        // real HTTP 307 for every client (browsers, bots, health checks),
        // independent of JS execution.
        source: '/auth/lock-screen',
        destination: '/auth/sign-in?reason=session_expired&redirectTo=/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
