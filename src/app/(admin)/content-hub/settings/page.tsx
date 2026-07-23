'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'

export default function SettingsPage() {
  const [autoApprove, setAutoApprove] = useState(true)
  const [cacheTime, setCacheTime] = useState(300)
  const [allowGuests, setAllowGuests] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('Content Hub settings updated successfully.')
    }, 800)
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader title="Content Hub Settings" breadcrumbs={[{ label: 'Content Hub' }, { label: 'Settings' }]} />

      <Row className="max-w-3xl">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-light fw-bold">General Settings</Card.Header>
            <Card.Body className="space-y-4">
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="auto-approve-comments"
                  label="Auto-Approve User Comments"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="fw-bold"
                />
                <Form.Text className="text-muted d-block ms-4">
                  If enabled, new comments are visible instantly. If disabled, they require manual admin approval.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="allow-guests-view"
                  label="Allow Guests Read-Only View"
                  checked={allowGuests}
                  onChange={(e) => setAllowGuests(e.target.checked)}
                  className="fw-bold"
                />
                <Form.Text className="text-muted d-block ms-4">
                  Unauthenticated guests can view videos and community updates but must sign in to react or comment.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">CDN & API Cache Revalidation Time (seconds)</Form.Label>
                <Form.Control type="number" value={cacheTime} onChange={(e) => setCacheTime(parseInt(e.target.value, 10))} placeholder="300" />
                <Form.Text className="text-muted">
                  Sets the incremental static regeneration (ISR) page caching lifetimes on the public site.
                </Form.Text>
              </Form.Group>

              <Button variant="primary" onClick={handleSave} disabled={saving} className="mt-4">
                <Icon icon="solar:diskette-bold" className="me-1" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
