'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { locationsApi } from '@/lib/api/locations.api'
import type { ApiError } from '@/lib/api'
import type { CampaignSession, Venue } from '@/types/bpa.types'

const EMPTY = { venueId: '', sessionDate: '', startTime: '09:00', endTime: '17:00', capacity: '50', notes: '' }

export default function SessionsManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CampaignSession | null>(null)
  const [form, setForm] = useState(EMPTY)
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const sessionsFn = useCallback(() => campaignsApi.listSessions(campaignId), [campaignId])
  const venuesFn = useCallback(() => locationsApi.listVenues(undefined, { isActive: true }), [])
  const { data: sessions, loading, error, refetch } = useApi(sessionsFn, [campaignId])
  const { data: venues } = useApi(venuesFn, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(s: CampaignSession) {
    setEditing(s)
    setForm({ venueId: s.venue?.id ?? '', sessionDate: s.sessionDate.slice(0, 10), startTime: s.startTime, endTime: s.endTime, capacity: String(s.capacity), notes: s.notes ?? '' })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.venueId || !form.sessionDate) return
    const dto = { venueId: form.venueId, sessionDate: form.sessionDate, startTime: form.startTime, endTime: form.endTime, capacity: Number(form.capacity), notes: form.notes || undefined }
    if (editing) { await mutate(() => campaignsApi.updateSession(campaignId, editing.id, dto), undefined) }
    else { await mutate(() => campaignsApi.createSession(campaignId, dto), undefined) }
    setShowModal(false); refetch()
  }

  async function handleDelete(sessionId: string) {
    if (!confirm('Delete this session?')) return
    await mutate(() => campaignsApi.deleteSession(campaignId, sessionId), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Sessions"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Sessions' }]}
        action={
          can('campaign_sessions:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold" className="me-1" />Add Session
            </Button>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr><th>Date</th><th>Time</th><th>Venue</th><th>Capacity</th><th>Notes</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {(sessions ?? []).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No sessions yet</td></tr>
                ) : (sessions ?? []).map((s: CampaignSession) => (
                  <tr key={s.id}>
                    <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                    <td>{s.startTime} – {s.endTime}</td>
                    <td>{s.venue?.name ?? <span className="text-muted">—</span>}<div className="text-muted small">{s.venue?.zone?.cityCorporation?.name}</div></td>
                    <td>{s.bookedCount} / {s.capacity}</td>
                    <td>{s.notes ?? <span className="text-muted">—</span>}</td>
                    <td className="text-end">
                      {can('campaign_sessions:update') && <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(s)}><Icon icon="solar:pen-bold" /></Button>}
                      {can('campaign_sessions:delete') && <Button variant="soft-danger" size="sm" onClick={() => handleDelete(s.id)}><Icon icon="solar:trash-bin-trash-bold" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit' : 'Add'} Session</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Select value={form.venueId} onChange={(e) => setForm(f => ({ ...f, venueId: e.target.value }))}>
                <option value="">Select venue</option>
                {(venues ?? []).map((v: Venue) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={form.sessionDate} onChange={(e) => setForm(f => ({ ...f, sessionDate: e.target.value }))} />
            </Form.Group>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label>Start Time</Form.Label>
                <Form.Control type="time" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </Col>
              <Col>
                <Form.Label>End Time</Form.Label>
                <Form.Control type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" min="1" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
