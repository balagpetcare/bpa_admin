import { getApiOrigin } from '@/lib/utils/api-url';

const KNOWN_DEV_MEDIA_HOSTS = new Set([
  'localhost:4000',
  '127.0.0.1:4000',
  '10.0.2.2:4000',
  '192.168.10.111:4000',
]);

const DEV_LAN_HOST_PATTERN = /^192\.168\.\d{1,3}\.\d{1,3}:4000$/;
const UPLOADS_PATH_PATTERN = /\/uploads\/[^?#]+(?:\?[^#]*)?(?:#.*)?$/i;

function isDevMediaHost(host: string): boolean {
  return KNOWN_DEV_MEDIA_HOSTS.has(host) || DEV_LAN_HOST_PATTERN.test(host);
}

function extractUploadsPath(raw: string): string | null {
  const match = raw.match(/\/uploads\/[^?#]+(?:\?[^#]*)?(?:#.*)?$/i);
  return match ? match[0] : null;
}

export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  if (trimmed.startsWith('/uploads/')) {
    return `${getApiOrigin()}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${getApiOrigin()}/${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (isDevMediaHost(url.host)) {
        const uploadsPath = extractUploadsPath(`${url.pathname}${url.search}${url.hash}`);
        return uploadsPath ? `${getApiOrigin()}${uploadsPath}` : trimmed;
      }
      return trimmed;
    } catch {
      const uploadsPath = extractUploadsPath(trimmed);
      return uploadsPath ? `${getApiOrigin()}${uploadsPath}` : trimmed;
    }
  }

  if (UPLOADS_PATH_PATTERN.test(`/${trimmed.replace(/^\/+/, '')}`)) {
    return `${getApiOrigin()}/${trimmed.replace(/^\/+/, '')}`;
  }

  return trimmed;
}

export function resolveMediaSource(
  media: { url?: string | null; mediaFile?: { url?: string | null } | null; coverImage?: { url?: string | null } | null } | string | null | undefined,
): string | null {
  if (!media) return null;
  if (typeof media === 'string') return resolveMediaUrl(media);
  return resolveMediaUrl(media.url ?? media.mediaFile?.url ?? media.coverImage?.url ?? null);
}
