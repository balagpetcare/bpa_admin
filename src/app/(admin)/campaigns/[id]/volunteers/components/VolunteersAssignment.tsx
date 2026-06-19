'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { usersApi } from '@/lib/api/users.api'
import type { ApiError } from '@/lib/api'
import type { CampaignVolunteer, AdminUser } from '@/types/bpa.types'

const ADMIN_USERS_PAGE_SIZE = 100

export default function VolunteersAssignment({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const assignedFn = useCallback(() => campaignsApi.listVolunteers(campaignId), [campaignId])
  const usersFn = useCallback(() => usersApi.list({ limit: ADMIN_USERS_PAGE_SIZE }), [])
  const { data: assigned, loading, error, refetch } = useApi(assignedFn, [campaignId])
  const { data: usersData } = useApi(usersFn, [])

  const assignedIds = new Set((assigned ?? []).map((v: CampaignVolunteer) => v.userId))
  const availableUsers = (usersData?.data ?? []).filter((u: AdminUser) => !assignedIds.has(u.id))

  async function handleAssign() {
    if (!userId) return
    await mutate(() => campaignsApi.assignVolunteer(campaignId, { userId }), undefined)
    setShowModal(false); setUserId(''); refetch()
  }

  async function handleRemove(uId: string) {
    if (!confirm('Remove this volunteer from the campaign?')) return
    await mutate(() => campaignsApi.removeVolunteer(campaignId, uId), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Volunteer Assignment"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Volunteers' }]}
        action={
          can('campaigns:assign') ? (
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Icon icon="solar:add-circle-bold" className="me-1" />Assign Volunteer
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
                <tr><th>Volunteer</th><th>Email</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {(assigned ?? []).length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-muted">No volunteers assigned yet</td></tr>
                ) : (assigned ?? []).map((a: CampaignVolunteer) => (
                  <tr key={a.id}>
                    <td className="fw-semibold">{a.user.name}</td>
                    <td>{a.user.email}</td>
                    <td className="text-end">
                      {can('campaigns:assign') && (
                        <Button variant="soft-danger" size="sm" onClick={() => handleRemove(a.userId)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Assign Volunteer</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select User</Form.Label>
            <Form.Select value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Choose user…</option>
              {availableUsers.map((u: AdminUser) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign} disabled={saving || !userId}>{saving ? 'Saving…' : 'Assign'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
