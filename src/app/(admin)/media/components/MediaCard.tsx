'use client'

import { useState } from 'react'
import { Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { usePermission } from '@/hooks/usePermission'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { ApiError } from '@/lib/api'
import { mediaApi } from '@/lib/api/media.api'
import MediaPreview from '@/components/ui/MediaPreview'
import type { MediaFile } from '@/types/bpa.types'

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
  onDeleteError: (error: ApiError) => void
}

export default function MediaCard({ file, onView, onDeleted, onDeleteError }: MediaCardProps) {
  const { can } = usePermission()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (deleting) return
    const ok = await confirmDelete(file.originalName)
    if (ok) {
      try {
        setDeleting(true)
        await mediaApi.remove(file.id)
        onDeleted()
      } catch (error) {
        onDeleteError(error instanceof ApiError ? error : new ApiError('UNKNOWN', String(error)))
      } finally {
        setDeleting(false)
      }
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
        <MediaPreview
          media={file}
          alt={file.altText ?? file.originalName}
          fit="cover"
          filename={file.originalName}
          showActions={false}
          style={{ width: '100%', height: '100%' }}
        />
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
          disabled={deleting}
        >
          <Icon icon={deleting ? 'svg-spinners:3-dots-fade' : 'solar:trash-bin-trash-bold'} />
        </button>
      )}
      <style>{`.media-card:hover .media-card-delete { opacity: 1 !important; }`}</style>
    </Card>
  )
}
