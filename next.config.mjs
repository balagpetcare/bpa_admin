/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
  // NOTE: output: 'standalone' is intentionally NOT set for admin-panel.
  // Next.js 16.0.8 has a bug where standalone output fails with ENOENT on
  // middleware.js.nft.json when Edge Runtime middleware (middleware.ts) is
  // present. The admin-panel uses Edge Runtime middleware for auth.
  // The Docker image uses `next start` instead (see admin-panel/Dockerfile).
  // Landing-web, which has no middleware.ts, correctly uses standalone.
};

export default nextConfig;
