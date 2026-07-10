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
};

export default nextConfig;
