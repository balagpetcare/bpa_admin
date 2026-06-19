/**
 * Returns the bare API origin — no trailing slash, no /api/v1 suffix.
 *
 * Env-var precedence (first defined wins):
 *   NEXT_PUBLIC_API_URL  e.g. http://localhost:4000/api/v1
 *                        (trailing /api/v1 stripped automatically)
 *
 * Dev fallback:  http://localhost:4000
 * Prod fallback: https://api.bangladeshpetassociation.com
 */
export function getApiOrigin(): string {
  const raw =
    process.env['NEXT_PUBLIC_API_URL'] ||
    (process.env['NODE_ENV'] === 'production'
      ? 'https://api.bangladeshpetassociation.com'
      : 'http://localhost:4000');

  return raw.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

export function getApiBase(): string {
  return `${getApiOrigin()}/api/v1`;
}
