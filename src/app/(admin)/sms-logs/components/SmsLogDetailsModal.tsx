'use client'

import { Modal, Button, Row, Col, Badge } from 'react-bootstrap'
import SmsStatusBadge from './SmsStatusBadge'
import type { SmsLog } from '@/types/bpa.types'

interface SmsLogDetailsModalProps {
  log: SmsLog | null
  isOpen: boolean
  onClose: () => void
}

export default function SmsLogDetailsModal({ log, isOpen, onClose }: SmsLogDetailsModalProps) {
  if (!log) return null

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>SMS Log Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="text-muted small mb-1">Log ID</div>
            <code className="text-dark" style={{ fontSize: 12 }}>{log.id}</code>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Provider Reference</div>
            <code className="text-primary">{log.providerRef ?? '—'}</code>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Recipient</div>
            <div className="fw-semibold">{log.to}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Provider</div>
            <Badge bg="secondary" className="text-uppercase">{log.provider}</Badge>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Status</div>
            <SmsStatusBadge status={log.status} />
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Sent At</div>
            <div>{log.sentAt ? new Date(log.sentAt).toLocaleString() : '—'}</div>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Created</div>
            <div>{new Date(log.createdAt).toLocaleString()}</div>
          </Col>
          <Col xs={12}>
            <div className="text-muted small mb-1">Message Body</div>
            <pre
              className="bg-light border rounded p-3 small mb-0"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13 }}
            >
              {log.body}
            </pre>
          </Col>
          {log.failureReason && (
            <Col xs={12}>
              <div className="text-muted small mb-1">Failure Reason</div>
              <div className="text-danger small">{log.failureReason}</div>
            </Col>
          )}
        </Row>

        {log.payload && (
          <div>
            <div className="text-muted small mb-1">Raw Payload</div>
            <pre
              className="bg-light border rounded p-3 small mb-0"
              style={{ maxHeight: 250, overflow: 'auto', fontSize: 12, fontFamily: 'monospace' }}
            >
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
