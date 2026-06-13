'use client'

import { useState, useCallback } from 'react'
import { Card, Row, Col, InputGroup, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaGrid from './MediaGrid'
import MediaUploadZone from './MediaUploadZone'
import MediaDetailModal from './MediaDetailModal'
import MediaTypeFilter, { type MediaFilterType } from './MediaTypeFilter'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { mediaApi } from '@/lib/api/media.api'
import type { MediaFile } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const MIME_FILTER: Record<MediaFilterType, string | undefined> = {
  all: undefined,
  image: 'image/',
  document: 'application/',
  video: 'video/',
}

export default function MediaPageContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<MediaFilterType>('all')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const mimeFilter = MIME_FILTER[filterType]

  const fetchFn = useCallback(
    () => mediaApi.list({ page, limit: 30, search: search || undefined, mimeType: mimeFilter }),
    [page, search, mimeFilter],
  )

  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, mimeFilter])

  const files = data?.data ?? []
  const meta = data?.meta ?? null

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilterChange = (type: MediaFilterType) => { setFilterType(type); setPage(1) }

  const handleUploaded = (newFiles: MediaFile[]) => {
    void newFiles
    refetch()
  }

  const handleView = (file: MediaFile) => { setSelectedFile(file); setDetailOpen(true) }
  const handleUpdated = (updated: MediaFile) => { setSelectedFile(updated); refetch() }

  return (
    <div className="container-fluid">
      <PageHeader title="Media Library" breadcrumbs={[{ label: 'Assets & Config' }, { label: 'Media Library' }]} />

      <ApiErrorAlert error={error as ApiError | null} />

      {can('media:create') && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Upload Files</h6>
          </Card.Header>
          <Card.Body>
            <MediaUploadZone onUploaded={handleUploaded} />
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <MediaTypeFilter active={filterType} onChange={handleFilterChange} />
            </Col>
            <Col xs={12} sm="auto">
              <InputGroup size="sm" style={{ minWidth: 240 }}>
                <InputGroup.Text>
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <MediaGrid
            files={files}
            meta={meta}
            loading={loading}
            onView={handleView}
            onDeleted={refetch}
            onPageChange={(p) => setPage(p)}
          />
        </Card.Body>
      </Card>

      <MediaDetailModal file={selectedFile} isOpen={detailOpen} onClose={() => setDetailOpen(false)} onUpdated={handleUpdated} />
    </div>
  )
}
