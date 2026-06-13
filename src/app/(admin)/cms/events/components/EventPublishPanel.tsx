'use client'

import { Card, Button } from 'react-bootstrap'
import type { EventStatus } from '@/types/bpa.types'

interface EventPublishPanelProps {
  status: EventStatus
  onStatusChange: (s: EventStatus) => void
  onSaveDraft: () => void
  onPublish: () => void
  onCancel?: () => void
  saving: boolean
  isEdit?: boolean
}

export default function EventPublishPanel({
  status,
  onStatusChange,
  onSaveDraft,
  onPublish,
  onCancel,
  saving,
  isEdit,
}: EventPublishPanelProps) {
  const statusColor = { draft: 'secondary', published: 'success', cancelled: 'danger' }[status]

  return (
    <Card className="mb-3">
      <Card.Header className="py-2">
        <h6 className="mb-0">Publish Settings</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className={`badge bg-${statusColor}`}>{status}</span>
        </div>

        <div className="d-grid gap-2">
          <Button variant="primary" onClick={onPublish} disabled={saving}>
            {saving ? 'Saving…' : status === 'published' ? 'Update' : 'Publish'}
          </Button>
          <Button variant="outline-secondary" onClick={onSaveDraft} disabled={saving}>
            Save Draft
          </Button>
          {isEdit && onCancel && status !== 'cancelled' && (
            <Button variant="outline-danger" onClick={onCancel} disabled={saving}>
              Cancel Event
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
