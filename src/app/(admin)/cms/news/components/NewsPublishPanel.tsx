'use client'

import { Card, Form, Button } from 'react-bootstrap'
import CustomFlatpickr from '@/components/CustomFlatpickr'
import type { NewsStatus } from '@/types/bpa.types'

interface NewsPublishPanelProps {
  status: NewsStatus
  publishedAt: string | null | undefined
  isFeatured: boolean
  onStatusChange: (s: NewsStatus) => void
  onPublishedAtChange: (d: string | null) => void
  onFeaturedChange: (v: boolean) => void
  onSaveDraft: () => void
  onPublish: () => void
  onArchive?: () => void
  saving: boolean
  isEdit?: boolean
}

export default function NewsPublishPanel({
  status,
  publishedAt,
  isFeatured,
  onStatusChange,
  onPublishedAtChange,
  onFeaturedChange,
  onSaveDraft,
  onPublish,
  onArchive,
  saving,
  isEdit,
}: NewsPublishPanelProps) {
  const statusColor = { draft: 'secondary', published: 'success', archived: 'dark' }[status]

  return (
    <Card className="mb-3">
      <Card.Header className="py-2">
        <h6 className="mb-0">Publish Settings</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className={`badge bg-${statusColor}`}>{status}</span>
          <Form.Select
            size="sm"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as NewsStatus)}
            style={{ width: 'auto' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Form.Select>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Publish Date</Form.Label>
          <CustomFlatpickr
            className="form-control form-control-sm"
            placeholder="Schedule publish date…"
            value={publishedAt ? new Date(publishedAt) : undefined}
            options={{ enableTime: true, dateFormat: 'Y-m-d H:i', allowInput: true }}
            onChange={(dates: Date[]) => onPublishedAtChange(dates[0]?.toISOString() ?? null)}
          />
          <Form.Text className="text-muted">Leave empty to publish immediately.</Form.Text>
        </Form.Group>

        <Form.Check
          type="switch"
          id="isFeatured"
          label="Featured article"
          checked={isFeatured}
          onChange={(e) => onFeaturedChange(e.target.checked)}
          className="mb-3"
        />

        <div className="d-grid gap-2">
          <Button variant="primary" onClick={onPublish} disabled={saving}>
            {saving ? 'Saving…' : status === 'published' ? 'Update' : 'Publish'}
          </Button>
          <Button variant="outline-secondary" onClick={onSaveDraft} disabled={saving}>
            Save Draft
          </Button>
          {isEdit && onArchive && status !== 'archived' && (
            <Button variant="outline-danger" onClick={onArchive} disabled={saving}>
              Archive
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
