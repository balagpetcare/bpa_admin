'use client'

import { Icon } from '@iconify/react'
import { getFileIcon, getFileTypeLabel, getMediaImageUrl, getMediaPreviewType } from '@/utils/media'

interface MediaPreviewProps {
  /** A MediaFile, a CampaignMedia item (with `.mediaFile`), or any object with url/mimeType. */
  media: any
  alt?: string
  /** object-fit for the <img>/<video> element. */
  fit?: 'contain' | 'cover'
  className?: string
  style?: React.CSSProperties
  /** Shown inside the fallback card, e.g. the original filename. */
  filename?: string
  /** Renders View/Download links in the fallback card when a URL is resolvable. */
  showActions?: boolean
}

/**
 * Type-aware media preview: renders an <img> for browser-previewable
 * image formats, a plain <img> for SVG (browsers render SVG safely as a
 * raster image via <img> — no inline markup is ever injected, so this
 * stays XSS-safe even for untrusted SVGs), a <video> for video files, and
 * a professional file-type fallback card (icon + type + filename +
 * View/Download) for everything else — PDFs, Office docs, archives, and
 * HEIC/HEIF images the browser can't decode. Never shows a raw "Load
 * Error" broken-image state.
 */
export default function MediaPreview({ media, alt, fit = 'contain', className, style, filename, showActions = true }: MediaPreviewProps) {
  const previewType = getMediaPreviewType(media)
  const url = getMediaImageUrl(media)
  const resolvedFilename = filename ?? media?.mediaFile?.originalName ?? media?.originalName ?? media?.mediaFile?.filename ?? media?.filename
  const isMissing = Boolean(media?.missing ?? media?.mediaFile?.missing)

  // Genuinely-unavailable files (confirmed absent in storage, not just a
  // slow/failed image load) get an explicit state rather than silently
  // rendering a generic placeholder image that looks like real content.
  if (isMissing) {
    return (
      <div
        className={className ?? 'w-100 h-100'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: 16,
          textAlign: 'center',
          background: '#fff5f5',
          ...style,
        }}>
        <Icon icon="solar:gallery-remove-bold-duotone" style={{ fontSize: 40, opacity: 0.7 }} className="text-danger" />
        <div className="small fw-semibold text-danger">File Missing</div>
        {resolvedFilename && (
          <div className="text-muted text-truncate" style={{ fontSize: 11, maxWidth: '100%' }}>
            {resolvedFilename}
          </div>
        )}
      </div>
    )
  }

  if (previewType === 'image' || previewType === 'svg') {
    return (
      <img
        src={url}
        alt={alt ?? resolvedFilename ?? 'Media preview'}
        className={className ?? `w-100 h-100 object-fit-${fit}`}
        style={style}
        onError={(e) => {
          // Only swap in a placeholder if the image genuinely 404s/CORS-fails —
          // this is a last-resort net (broken URL), not the primary path.
          e.currentTarget.onerror = null
          e.currentTarget.src = 'https://placehold.co/800x400?text=Image+Unavailable'
        }}
      />
    )
  }

  if (previewType === 'video') {
    return <video src={url} controls className={className ?? `w-100 h-100 object-fit-${fit}`} style={style} />
  }

  return (
    <div
      className={className ?? 'w-100 h-100'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 16,
        textAlign: 'center',
        background: '#f8f9fa',
        ...style,
      }}>
      <Icon icon={getFileIcon(media)} style={{ fontSize: 40, opacity: 0.7 }} className="text-primary" />
      <div className="small fw-semibold text-dark">{getFileTypeLabel(media)}</div>
      {resolvedFilename && (
        <div className="text-muted text-truncate" style={{ fontSize: 11, maxWidth: '100%' }}>
          {resolvedFilename}
        </div>
      )}
      {showActions && url && (
        <div className="d-flex gap-2 mt-1">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-0 px-2" style={{ fontSize: 11 }}>
            View
          </a>
          <a href={url} download className="btn btn-xs btn-outline-secondary py-0 px-2" style={{ fontSize: 11 }}>
            Download
          </a>
        </div>
      )}
    </div>
  )
}
