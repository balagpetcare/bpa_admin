'use client'

import { Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { usePermission } from '@/hooks/usePermission'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { mediaApi } from '@/lib/api/media.api'
import type { MediaFile } from '@/types/bpa.types'

const MIME_ICON: Record<string, string> = {
  'application/pdf': 'solar:file-text-bold-duotone',
  'application/msword': 'solar:file-text-bold-duotone',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'solar:file-text-bold-duotone',
  'application/vnd.ms-excel': 'solar:file-bold-duotone',
  'text/plain': 'solar:file-bold-duotone',
}

function getIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'solar:gallery-bold-duotone'
  if (mimeType.startsWith('video/')) return 'solar:video-frame-bold-duotone'
  return MIME_ICON[mimeType] ?? 'solar:file-bold-duotone'
}

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

interface MediaCardProps {
  file: MediaFile
  onView: (file: MediaFile) => void
  onDeleted: () => void
}

export default function MediaCard({ file, onView, onDeleted }: MediaCardProps) {
  const { can } = usePermission()
  const isImage = file.mimeType.startsWith('image/')

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await confirmDelete(file.originalName)
    if (ok) {
      await mediaApi.remove(file.id)
      onDeleted()
    }
  }

  return (
    <Card
      className="h-100 border media-card"
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onClick={() => onView(file)}
    >
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={{ height: 140, overflow: 'hidden' }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.altText ?? file.originalName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Icon icon={getIcon(file.mimeType)} style={{ fontSize: 48 }} className="text-muted" />
        )}
      </div>
      <Card.Body className="p-2">
        <p className="mb-0 small fw-semibold text-truncate" title={file.originalName}>
          {file.originalName}
        </p>
        <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>
          {formatBytes(file.sizeBytes)}
        </p>
      </Card.Body>
      {can('media:delete') && (
        <button
          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 py-0 px-1 media-card-delete"
          style={{ opacity: 0, transition: 'opacity 0.15s', fontSize: '0.75rem' }}
          onClick={handleDelete}
          title="Delete"
        >
          <Icon icon="solar:trash-bin-trash-bold" />
        </button>
      )}
      <style>{`.media-card:hover .media-card-delete { opacity: 1 !important; }`}</style>
    </Card>
  )
}
