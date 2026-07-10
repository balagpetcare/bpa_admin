const DEV_REMOTE_PATTERNS = [
  { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '10.0.2.2', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '192.168.10.111', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
];

const PLACEHOLDER_PATTERN = { protocol: 'https', hostname: 'placehold.co', pathname: '/**' };
const DEV_HOSTNAME_PATTERN = /^192\.168\.\d{1,3}\.\d{1,3}$/;

function normalizeOrigin(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return null;
  }
}

function apiOriginFromBase(raw) {
  if (!raw) return null;
  return normalizeOrigin(String(raw).replace(/\/api\/v1\/?$/, ''));
}

function patternFromUrl(raw, pathname = '/**') {
  const origin = normalizeOrigin(raw);
  if (!origin) return null;
  const url = new URL(origin);
  return {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port || undefined,
    pathname,
  };
}

function uniquePatterns(patterns) {
  const seen = new Set();
  return patterns.filter((pattern) => {
    if (!pattern) return false;
    const key = JSON.stringify(pattern);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAllowedMediaOrigins(env = process.env) {
  const origins = new Set([
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://10.0.2.2:4000',
    'http://192.168.10.111:4000',
  ]);

  const candidates = [
    apiOriginFromBase(env.NEXT_PUBLIC_API_BASE_URL),
    apiOriginFromBase(env.NEXT_PUBLIC_API_URL),
    normalizeOrigin(env.NEXT_PUBLIC_MEDIA_CDN_URL),
    normalizeOrigin(env.NEXT_PUBLIC_CDN_URL),
    normalizeOrigin(env.NEXT_PUBLIC_B2_PUBLIC_URL),
    normalizeOrigin(env.NEXT_PUBLIC_BACKBLAZE_B2_URL),
  ];

  for (const origin of candidates) {
    if (origin) origins.add(origin);
  }

  return Array.from(origins);
}

export function getRemotePatterns(env = process.env) {
  const envPatterns = uniquePatterns(
    [
      patternFromUrl(apiOriginFromBase(env.NEXT_PUBLIC_API_BASE_URL) ?? apiOriginFromBase(env.NEXT_PUBLIC_API_URL), '/uploads/**'),
      patternFromUrl(env.NEXT_PUBLIC_MEDIA_CDN_URL),
      patternFromUrl(env.NEXT_PUBLIC_CDN_URL),
      patternFromUrl(env.NEXT_PUBLIC_B2_PUBLIC_URL),
      patternFromUrl(env.NEXT_PUBLIC_BACKBLAZE_B2_URL),
    ],
  );

  return uniquePatterns([...DEV_REMOTE_PATTERNS, ...envPatterns, PLACEHOLDER_PATTERN]);
}

export function getContentSecurityPolicy(env = process.env, nonce = '') {
  const isDev = env.NODE_ENV !== 'production';

  const mediaOrigins = getAllowedMediaOrigins(env)
    .filter(Boolean)
    .filter((origin) => isDev || !DEV_HOSTNAME_PATTERN.test(new URL(origin).hostname));

  let scriptSrc = "script-src 'self'";
  if (isDev) {
    scriptSrc += " 'unsafe-inline' 'unsafe-eval'";
  } else {
    if (nonce) {
      scriptSrc += ` 'nonce-${nonce}' 'strict-dynamic'`;
    }
  }

  const styleSrc = "style-src 'self' 'unsafe-inline'";

  let connectSrc = "connect-src 'self' " + mediaOrigins.join(' ');
  if (isDev) {
    connectSrc += " ws://localhost:3001 ws://127.0.0.1:3001";
  }

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    scriptSrc,
    styleSrc,
    "font-src 'self' data:",
    "form-action 'self'",
    connectSrc,
    "img-src 'self' data: blob: " + mediaOrigins.join(' '),
    "media-src 'self' data: blob: " + mediaOrigins.join(' '),
  ];

  if (!isDev) {
    csp.push("upgrade-insecure-requests");
  }

  return csp.join('; ');
}
