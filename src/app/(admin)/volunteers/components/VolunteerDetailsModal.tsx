'use client'

import { Modal, Button, Row, Col, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { volunteersApi } from '@/lib/api/volunteers.api'
import type { Volunteer, VolunteerStatus } from '@/types/bpa.types'

interface VolunteerDetailsModalProps {
  volunteer: Volunteer | null
  isOpen: boolean
  onClose: () => void
  onStatusChanged: () => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Row className="mb-2">
      <Col xs={4} className="text-muted fw-semibold small">
        {label}
      </Col>
      <Col xs={8} className="small">
        {value ?? <span className="text-muted fst-italic">Not provided</span>}
      </Col>
    </Row>
  )
}

export default function VolunteerDetailsModal({ volunteer, isOpen, onClose, onStatusChanged }: VolunteerDetailsModalProps) {
  const { can } = usePermission()
  const { mutate, loading } = useApiMutation<Volunteer, VolunteerStatus>()

  const changeStatus = async (newStatus: VolunteerStatus) => {
    if (!volunteer) return
    const label = newStatus === 'approved' ? 'approve' : 'reject'
    const confirmed = await confirmDialog({
      title: `${label.charAt(0).toUpperCase() + label.slice(1)} volunteer?`,
      text: `This will mark ${volunteer.name}'s application as ${newStatus}.`,
      confirmText: label.charAt(0).toUpperCase() + label.slice(1),
      variant: newStatus === 'approved' ? 'info' : 'danger',
    })
    if (!confirmed) return
    await mutate((s) => volunteersApi.updateStatus(volunteer.id, s), newStatus)
    onStatusChanged()
    onClose()
  }

  if (!volunteer) return null

  const statusColor: Record<VolunteerStatus, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
              {volunteer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div>{volunteer.name}</div>
              <Badge bg={statusColor[volunteer.status]} className="fw-normal fs-6">
                {volunteer.status}
              </Badge>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h6 className="text-muted mb-2 text-uppercase small fw-bold">Contact Information</h6>
            <InfoRow label="Email" value={<a href={`mailto:${volunteer.email}`}>{volunteer.email}</a>} />
            <InfoRow label="Phone" value={volunteer.phone} />
          </Col>
          <Col md={6}>
            <h6 className="text-muted mb-2 text-uppercase small fw-bold">Application Details</h6>
            <InfoRow label="Submitted" value={new Date(volunteer.createdAt).toLocaleDateString()} />
            <InfoRow label="Updated" value={new Date(volunteer.updatedAt).toLocaleDateString()} />
          </Col>
        </Row>
        <hr />
        <h6 className="text-muted mb-2 text-uppercase small fw-bold">Interest & Availability</h6>
        <InfoRow label="Area of Interest" value={volunteer.areaOfInterest} />
        <InfoRow label="Availability" value={volunteer.availability} />
        {volunteer.message && (
          <>
            <h6 className="text-muted mb-2 mt-3 text-uppercase small fw-bold">Message</h6>
            <div className="bg-light rounded p-3 small">{volunteer.message}</div>
          </>
        )}
      </Modal.Body>
      {can('volunteers:update') && volunteer.status === 'pending' && (
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button variant="danger" onClick={() => changeStatus('rejected')} disabled={loading}>
            <Icon icon="solar:close-circle-bold" className="me-1" />
            Reject
          </Button>
          <Button variant="success" onClick={() => changeStatus('approved')} disabled={loading}>
            <Icon icon="solar:check-circle-bold" className="me-1" />
            Approve
          </Button>
        </Modal.Footer>
      )}
      {volunteer.status !== 'pending' && (
        <Modal.Footer>
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}
