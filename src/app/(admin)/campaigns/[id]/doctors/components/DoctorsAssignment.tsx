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
import { doctorsApi } from '@/lib/api/doctors.api'
import type { ApiError } from '@/lib/api'
import type { CampaignDoctor, Doctor } from '@/types/bpa.types'

export default function DoctorsAssignment({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [doctorId, setDoctorId] = useState('')
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const assignedFn = useCallback(() => campaignsApi.listDoctors(campaignId), [campaignId])
  const allDoctorsFn = useCallback(() => doctorsApi.list({ limit: 200, isActive: true }), [])
  const { data: assigned, loading, error, refetch } = useApi(assignedFn, [campaignId])
  const { data: allDoctorsData } = useApi(allDoctorsFn, [])

  const assignedIds = new Set((assigned ?? []).map((d: CampaignDoctor) => d.doctorId))
  const availableDoctors = (allDoctorsData?.data ?? []).filter((d: Doctor) => !assignedIds.has(d.id))

  async function handleAssign() {
    if (!doctorId) return
    await mutate(() => campaignsApi.assignDoctor(campaignId, { doctorId }), undefined)
    setShowModal(false); setDoctorId(''); refetch()
  }

  async function handleRemove(dId: string) {
    if (!confirm('Remove this doctor from the campaign?')) return
    await mutate(() => campaignsApi.removeDoctor(campaignId, dId), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Doctor Assignment"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Doctors' }]}
        action={
          can('campaigns:assign') ? (
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Icon icon="solar:add-circle-bold" className="me-1" />Assign Doctor
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
                <tr><th>Doctor</th><th>License</th><th>Specialization</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {(assigned ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-muted">No doctors assigned yet</td></tr>
                ) : (assigned ?? []).map((a: CampaignDoctor) => (
                  <tr key={a.id}>
                    <td className="fw-semibold">{a.doctor.name}</td>
                    <td>{a.doctor.licenseNumber ?? <span className="text-muted">—</span>}</td>
                    <td>{a.doctor.specialization ?? <span className="text-muted">—</span>}</td>
                    <td className="text-end">
                      {can('campaigns:assign') && (
                        <Button variant="soft-danger" size="sm" onClick={() => handleRemove(a.doctorId)}>
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
        <Modal.Header closeButton><Modal.Title>Assign Doctor</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Doctor</Form.Label>
            <Form.Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Choose doctor…</option>
              {availableDoctors.map((d: Doctor) => (
                <option key={d.id} value={d.id}>{d.name}{d.licenseNumber ? ` (${d.licenseNumber})` : ''}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign} disabled={saving || !doctorId}>{saving ? 'Saving…' : 'Assign'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
