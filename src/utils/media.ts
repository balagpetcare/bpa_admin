import { resolveMediaSource } from '@/lib/utils/media-url'
import type { FileCategory, MediaFile } from '@/types/bpa.types'

/**
 * Shared utility for resolving media URLs consistently across the admin panel.
 */
export function getMediaImageUrl(media: any): string {
  if (!media) return 'https://placehold.co/600x400?text=No+Media';
  return resolveMediaSource(media) ?? 'https://placehold.co/600x400?text=Invalid+Media';
}

// ─── File-type classification (images, docs, archives, video) ─────
//
// Centralized so every media preview surface (Campaign Media manager,
// media library grid, gallery pickers) makes the same "how do I show
// this?" decision instead of each component assuming everything is a
// renderable <img>.

export type MediaPreviewType = 'image' | 'svg' | 'video' | 'pdf' | 'document' | 'archive' | 'unknown'

/** Any object that carries enough info to classify — a MediaFile, a CampaignMedia item, or a loose shape from an older API response. */
type MediaLike =
  | (Partial<MediaFile> & { mediaFile?: Partial<MediaFile> })
  | null
  | undefined

function resolveFile(media: MediaLike): Partial<MediaFile> | undefined {
  if (!media) return undefined
  if (media.mediaFile) return media.mediaFile
  return media as Partial<MediaFile>
}

function nameForExtension(file: Partial<MediaFile> | undefined): string {
  if (!file) return ''
  return file.originalName || file.filename || file.url || ''
}

export function getFileExtension(media: MediaLike): string {
  const file = resolveFile(media)
  if (file?.extension) return file.extension.toLowerCase()
  const name = nameForExtension(file).split('?')[0].split('#')[0]
  const idx = name.lastIndexOf('.')
  return idx === -1 ? '' : name.slice(idx + 1).toLowerCase()
}

const HEIC_HEIF = new Set(['heic', 'heif'])

/**
 * True when a plain `<img src=...>` can be expected to render this file in
 * a normal desktop/mobile browser. JPG/PNG/GIF/WEBP/BMP/AVIF/ICO qualify.
 * SVG is excluded here (it renders fine but needs its own "is it safe"
 * check — see getMediaPreviewType). HEIC/HEIF are excluded because most
 * desktop browsers (Chrome, Firefox) still can't decode them natively.
 */
export function isBrowserPreviewableImage(media: MediaLike): boolean {
  const file = resolveFile(media)
  if (!file) return false
  const ext = getFileExtension(media)
  if (ext === 'svg' || HEIC_HEIF.has(ext)) return false
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif', 'ico'].includes(ext)) return true

  const mime = (file.mimeType || '').toLowerCase()
  if (!mime.startsWith('image/')) return false
  if (mime === 'image/svg+xml' || mime === 'image/heic' || mime === 'image/heif') return false
  return true
}

/**
 * Decides how a file should be previewed: as an <img>, as a (safe) inline
 * SVG, as a <video>, or as one of the file-type icon cards (pdf/document/
 * archive/unknown). Prefers the backend-computed `fileCategory` when
 * present, falling back to extension/MIME sniffing for older records.
 */
export function getMediaPreviewType(media: MediaLike): MediaPreviewType {
  const file = resolveFile(media)
  if (!file) return 'unknown'

  const ext = getFileExtension(media)
  const mime = (file.mimeType || '').toLowerCase()
  const category = file.fileCategory as FileCategory | undefined

  if (ext === 'svg' || mime === 'image/svg+xml') return 'svg'
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'
  if (category === 'archive' || ['zip', 'rar', '7z'].includes(ext)) return 'archive'
  if (category === 'video' || mime.startsWith('video/')) return 'video'
  if (isBrowserPreviewableImage(media)) return 'image'
  if (category === 'document' || ['doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext)) {
    return 'document'
  }
  // HEIC/HEIF and any other non-browser-previewable image land here too —
  // there's no safe <img> preview, so callers should render the file icon
  // card rather than attempt an <img> that will error.
  return 'unknown'
}

/** Iconify icon name for the file-type fallback card (Solar icon set, matches the rest of the admin UI). */
export function getFileIcon(media: MediaLike): string {
  const type = getMediaPreviewType(media)
  const ext = getFileExtension(media)
  switch (type) {
    case 'pdf':
      return 'solar:file-text-bold-duotone'
    case 'archive':
      return 'solar:archive-down-minimlistic-bold-duotone'
    case 'video':
      return 'solar:videocamera-record-bold-duotone'
    case 'svg':
      return 'solar:code-square-bold-duotone'
    case 'document':
      if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'solar:document-add-bold-duotone'
      return 'solar:document-text-bold-duotone'
    case 'image':
      return 'solar:gallery-bold-duotone'
    default:
      return 'solar:file-corrupted-bold-duotone'
  }
}

/** Human label for the fallback card, e.g. "PDF file", "ZIP archive". */
export function getFileTypeLabel(media: MediaLike): string {
  const ext = getFileExtension(media)
  const type = getMediaPreviewType(media)
  if (ext) return `${ext.toUpperCase()} file`
  switch (type) {
    case 'archive': return 'Archive file'
    case 'document': return 'Document'
    case 'video': return 'Video'
    default: return 'File'
  }
}
