'use client'

import { useState } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import ContactStatusBadge from './ContactStatusBadge'
import ContactReplyPanel from './ContactReplyPanel'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { contactsApi } from '@/lib/api/contacts.api'
import type { ContactSubmission, ContactStatus } from '@/types/bpa.types'

interface ContactDetailsModalProps {
  contact: ContactSubmission | null
  isOpen: boolean
  onClose: () => void
  onStatusChanged: () => void
}

export default function ContactDetailsModal({ contact, isOpen, onClose, onStatusChanged }: ContactDetailsModalProps) {
  const [updating, setUpdating] = useState(false)

  if (!contact) return null

  const handleMarkStatus = async (newStatus: ContactStatus) => {
    const labels: Record<ContactStatus, string> = { unread: 'Unread', read: 'Read', replied: 'Replied' }
    const confirmed = await confirmDialog({
      title: `Mark as ${labels[newStatus]}?`,
      text: `This will update the status to "${labels[newStatus]}".`,
      confirmText: 'Yes, update',
      variant: 'info',
    })
    if (!confirmed) return
    setUpdating(true)
    try {
      await contactsApi.updateStatus(contact.id, newStatus)
      onStatusChanged()
      onClose()
    } catch {
      // error handled by API
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Contact Message</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-3">
          <Col md={6}>
            <div className="text-muted small mb-1">Name</div>
            <div className="fw-semibold">{contact.name}</div>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Email</div>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </Col>
          {contact.phone && (
            <Col md={6}>
              <div className="text-muted small mb-1">Phone</div>
              <div>{contact.phone}</div>
            </Col>
          )}
          <Col md={6}>
            <div className="text-muted small mb-1">Status</div>
            <ContactStatusBadge status={contact.status} />
          </Col>
          {contact.subject && (
            <Col md={12}>
              <div className="text-muted small mb-1">Subject</div>
              <div className="fw-semibold">{contact.subject}</div>
            </Col>
          )}
          <Col md={12}>
            <div className="text-muted small mb-1">Received</div>
            <div>{new Date(contact.createdAt).toLocaleString()}</div>
          </Col>
        </Row>

        <div className="border rounded p-3 bg-light mb-3">
          <div className="text-muted small mb-1">Message</div>
          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{contact.message}</p>
        </div>

        <ContactReplyPanel status={contact.status} repliedAt={contact.repliedAt} />
      </Modal.Body>
      <Modal.Footer>
        {contact.status === 'unread' && (
          <Button variant="outline-secondary" size="sm" disabled={updating} onClick={() => handleMarkStatus('read')}>
            <Icon icon="solar:eye-bold" className="me-1" />Mark as Read
          </Button>
        )}
        {contact.status !== 'replied' && (
          <Button variant="success" size="sm" disabled={updating} onClick={() => handleMarkStatus('replied')}>
            <Icon icon="solar:check-circle-bold" className="me-1" />Mark as Replied
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
