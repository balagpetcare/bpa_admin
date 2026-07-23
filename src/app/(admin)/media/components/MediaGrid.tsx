'use client'

import { Row, Col, Pagination } from 'react-bootstrap'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaCard from './MediaCard'
import type { MediaFile, PaginationMeta } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

interface MediaGridProps {
  files: MediaFile[]
  meta: PaginationMeta | null
  loading: boolean
  onView: (file: MediaFile) => void
  onDeleted: () => void
  onPageChange: (page: number) => void
  onDeleteError: (error: ApiError) => void
}

export default function MediaGrid({ files, meta, loading, onView, onDeleted, onPageChange, onDeleteError }: MediaGridProps) {
  return (
    <div>
      <LoadingOverlay loading={loading}>
        <div>
          {files.length === 0 && !loading ? (
            <EmptyState
              icon="solar:gallery-wide-bold-duotone"
              title="No files found"
              description="Upload files to start building your media library."
            />
          ) : (
            <Row xs={2} sm={3} md={4} lg={5} xl={6} className="g-3">
              {files.map((file) => (
                <Col key={file.id}>
                  <MediaCard file={file} onView={onView} onDeleted={onDeleted} onDeleteError={onDeleteError} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </LoadingOverlay>

      {meta && meta.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <small className="text-muted">
            {meta.total} file{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
          </small>
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev disabled={!meta.hasPrev} onClick={() => onPageChange(meta.page - 1)} />
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <Pagination.Item key={i + 1} active={i + 1 === meta.page} onClick={() => onPageChange(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={!meta.hasNext} onClick={() => onPageChange(meta.page + 1)} />
          </Pagination>
        </div>
      )}
    </div>
  )
}
