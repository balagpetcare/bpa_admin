'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import CopyButton from '@/components/ui/CopyButton'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPreview from '@/components/ui/MediaPreview'
import { useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { mediaApi } from '@/lib/api/media.api'
import type { MediaFile } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

interface MediaDetailModalProps {
  file: MediaFile | null
  isOpen: boolean
  onClose: () => void
  onUpdated: (updated: MediaFile) => void
}

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaDetailModal({ file, isOpen, onClose, onUpdated }: MediaDetailModalProps) {
  const { can } = usePermission()
  const [altText, setAltText] = useState('')
  const { mutate, loading, error, clearError } = useApiMutation<MediaFile, string>()

  useEffect(() => {
    if (file) setAltText(file.altText ?? '')
    if (isOpen) clearError()
  }, [file, isOpen, clearError])

  const handleSave = async () => {
    if (!file) return
    const result = await mutate((text) => mediaApi.updateAltText(file.id, text || null), altText)
    if (result) onUpdated(result)
  }

  if (!file) return null

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-truncate" style={{ maxWidth: '90%' }}>
          {file.originalName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />
        <Row>
          <Col md={7} className="mb-3 mb-md-0">
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: 260 }}>
              <MediaPreview
                media={file}
                alt={file.altText ?? file.originalName}
                fit="contain"
                filename={file.originalName}
              />
            </div>
          </Col>
          <Col md={5}>
            <table className="table table-sm table-borderless small mb-3">
              <tbody>
                <tr><td className="text-muted fw-semibold" style={{ width: 80 }}>File</td><td className="text-break">{file.filename}</td></tr>
                <tr><td className="text-muted fw-semibold">Type</td><td>{file.mimeType}</td></tr>
                <tr><td className="text-muted fw-semibold">Size</td><td>{formatBytes(file.sizeBytes)}</td></tr>
                <tr><td className="text-muted fw-semibold">Uploaded</td><td>{new Date(file.createdAt).toLocaleDateString()}</td></tr>
              </tbody>
            </table>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">URL</Form.Label>
              <div className="d-flex gap-1">
                <Form.Control readOnly size="sm" value={file.url} className="text-truncate" />
                <CopyButton value={file.url} />
              </div>
            </Form.Group>

            {can('media:update') && (
              <Form.Group>
                <Form.Label className="fw-semibold small">Alt Text</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                />
              </Form.Group>
            )}
          </Col>
        </Row>
      </Modal.Body>
      {can('media:update') && (
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Alt Text'}</Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}
