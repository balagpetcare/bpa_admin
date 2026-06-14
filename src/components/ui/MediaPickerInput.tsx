'use client'

import { useState, useCallback } from 'react'
import { Button, Modal, Row, Col, InputGroup, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useApi } from '@/hooks/useApi'
import { mediaApi } from '@/lib/api/media.api'
import { getMediaImageUrl } from '@/utils/media'
import type { MediaFile } from '@/types/bpa.types'
import ApiErrorAlert from './ApiErrorAlert'
import { ApiError } from '@/lib/api'

interface MediaPickerInputProps {
  value: string | null | undefined       // selected mediaFile id
  previewUrl?: string | null             // current preview url (from existing record)
  previewMimeType?: string | null
  onChange: (fileId: string | null, file: MediaFile | null) => void
  label?: string
  helpText?: string
  mimeTypePrefix?: string
  dialogTitle?: string
  emptyLabel?: string
  uploadLabel?: string
  accept?: string
  enableUpload?: boolean
  customTrigger?: React.ReactNode
}

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaPickerInput({
  value,
  previewUrl,
  previewMimeType,
  onChange,
  label,
  helpText,
  mimeTypePrefix = 'image/',
  dialogTitle = 'Select Media from Library',
  emptyLabel = 'Select image',
  uploadLabel = 'Upload file',
  accept,
  enableUpload = true,
  customTrigger,
}: MediaPickerInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<ApiError | null>(null)

  const fetchFn = useCallback(
    () => mediaApi.list({ page, limit: 24, search: search || undefined, mimeType: mimeTypePrefix }),
    [page, search, mimeTypePrefix],
  )
  const { data, loading } = useApi(open ? fetchFn : null, [open, page, search])
  const files = data?.data ?? []
  const meta = data?.meta ?? null

  const handleSelect = (file: MediaFile) => {
    setPreviewFile(file)
    onChange(file.id, file)
    setOpen(false)
  }

  const handleClear = () => {
    setPreviewFile(null)
    onChange(null, null)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (mimeTypePrefix && !file.type.startsWith(mimeTypePrefix)) {
      setUploadError(new ApiError('INVALID_MEDIA_TYPE', `Please upload a ${mimeTypePrefix.replace('/', '')} file.`))
      event.target.value = ''
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const uploaded = await mediaApi.upload(file)
      setPreviewFile(uploaded)
      onChange(uploaded.id, uploaded)
    } catch (error) {
      setUploadError(error instanceof ApiError ? error : new ApiError('UPLOAD_FAILED', String(error)))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const displayUrl = previewFile?.url ?? previewUrl
  const resolvedDisplayUrl = displayUrl ? getMediaImageUrl(displayUrl) : null
  const displayMimeType = previewFile?.mimeType ?? previewMimeType ?? null
  const isVideo = !!displayMimeType && displayMimeType.startsWith('video/')

  if (customTrigger) {
    return (
      <div className="d-inline-block">
        <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
          {customTrigger}
        </div>
        {/* Library picker modal (same as below) */}
        <Modal show={open} onHide={() => setOpen(false)} size="xl" scrollable>
          <Modal.Header closeButton>
            <Modal.Title>{dialogTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-start mb-3">
              <InputGroup size="sm" style={{ maxWidth: 300 }}>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </InputGroup>

              {enableUpload && (
                <div>
                  <Form.Label htmlFor={`media-upload-${label ?? 'picker'}`} className="btn btn-sm btn-outline-primary mb-0">
                    <Icon icon={uploading ? 'solar:refresh-bold' : 'solar:upload-bold-duotone'} className="me-1" />
                    {uploading ? 'Uploading...' : uploadLabel}
                  </Form.Label>
                  <Form.Control
                    id={`media-upload-${label ?? 'picker'}`}
                    type="file"
                    className="d-none"
                    accept={accept}
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </div>
              )}
            </div>

            <ApiErrorAlert error={uploadError} onDismiss={() => setUploadError(null)} />

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : files.length === 0 ? (
              <p className="text-center text-muted py-4">No matching media found.</p>
            ) : (
              <Row xs={3} sm={4} md={5} lg={6} className="g-2">
                {files.map((file) => (
                  <Col key={file.id}>
                    <div
                      className={`border rounded overflow-hidden ${value === file.id ? 'border-primary border-2' : ''}`}
                      style={{ cursor: 'pointer', aspectRatio: '1' }}
                      onClick={() => handleSelect(file)}
                      title={file.originalName}
                    >
                      {file.mimeType.startsWith('video/') ? (
                        <video
                          src={getMediaImageUrl(file)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaImageUrl(file)}
                          alt={file.altText ?? file.originalName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      {value === file.id && (
                        <Badge bg="primary" className="position-absolute top-0 end-0 m-1">
                          <Icon icon="solar:check-circle-bold" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-truncate small text-muted mb-0 mt-1" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="small text-muted mb-0" style={{ fontSize: '0.7rem' }}>
                      {formatBytes(file.sizeBytes)}
                    </p>
                  </Col>
                ))}
              </Row>
            )}

            {meta && meta.totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>
                  ‹ Prev
                </Button>
                <span className="align-self-center small text-muted">
                  Page {meta.page} / {meta.totalPages}
                </span>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>
                  Next ›
                </Button>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setOpen(false)}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

  return (
    <div>
      {label && <Form.Label className="fw-semibold">{label}</Form.Label>}

      {resolvedDisplayUrl ? (
        <div className="position-relative d-inline-block">
          {isVideo ? (
            <video
              src={resolvedDisplayUrl}
              className="rounded border"
              style={{ maxHeight: 160, maxWidth: '100%', display: 'block', objectFit: 'cover' }}
              controls
              muted
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedDisplayUrl}
              alt="Selected media"
              className="rounded border"
              style={{ maxHeight: 160, maxWidth: '100%', display: 'block', objectFit: 'cover' }}
            />
          )}
          <div className="mt-2 d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setOpen(true)}>
              <Icon icon="solar:pen-bold" className="me-1" />
              Change
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleClear}>
              <Icon icon="solar:close-circle-bold" className="me-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border rounded d-flex align-items-center justify-content-center bg-light"
          style={{ height: 120, cursor: 'pointer' }}
          onClick={() => setOpen(true)}
          role="button"
        >
          <div className="text-center text-muted">
            <Icon icon="solar:gallery-add-bold-duotone" style={{ fontSize: 32 }} />
            <p className="mb-0 small mt-1">{emptyLabel}</p>
          </div>
        </div>
      )}

      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}

      {/* Library picker modal */}
      <Modal show={open} onHide={() => setOpen(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{dialogTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-start mb-3">
            <InputGroup size="sm" style={{ maxWidth: 300 }}>
              <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
              <Form.Control
                placeholder="Search media..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </InputGroup>

            {enableUpload && (
              <div>
                <Form.Label htmlFor={`media-upload-${label ?? 'picker'}`} className="btn btn-sm btn-outline-primary mb-0">
                  <Icon icon={uploading ? 'solar:refresh-bold' : 'solar:upload-bold-duotone'} className="me-1" />
                  {uploading ? 'Uploading...' : uploadLabel}
                </Form.Label>
                <Form.Control
                  id={`media-upload-${label ?? 'picker'}`}
                  type="file"
                  className="d-none"
                  accept={accept}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
            )}
          </div>

          <ApiErrorAlert error={uploadError} onDismiss={() => setUploadError(null)} />

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-muted py-4">No matching media found.</p>
          ) : (
            <Row xs={3} sm={4} md={5} lg={6} className="g-2">
              {files.map((file) => (
                <Col key={file.id}>
                  <div
                    className={`border rounded overflow-hidden ${value === file.id ? 'border-primary border-2' : ''}`}
                    style={{ cursor: 'pointer', aspectRatio: '1' }}
                    onClick={() => handleSelect(file)}
                    title={file.originalName}
                  >
                    {file.mimeType.startsWith('video/') ? (
                      <video
                        src={getMediaImageUrl(file)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getMediaImageUrl(file)}
                        alt={file.altText ?? file.originalName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    {value === file.id && (
                      <Badge bg="primary" className="position-absolute top-0 end-0 m-1">
                        <Icon icon="solar:check-circle-bold" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-truncate small text-muted mb-0 mt-1" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="small text-muted mb-0" style={{ fontSize: '0.7rem' }}>
                    {formatBytes(file.sizeBytes)}
                  </p>
                </Col>
              ))}
            </Row>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>
                ‹ Prev
              </Button>
              <span className="align-self-center small text-muted">
                Page {meta.page} / {meta.totalPages}
              </span>
              <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>
                Next ›
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setOpen(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
