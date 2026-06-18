'use client'

import { useState } from 'react'
import { Modal, Button, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import SmsStatusBadge from './SmsStatusBadge'
import type { SmsLog } from '@/types/bpa.types'

interface Props {
  log: SmsLog | null
  isOpen: boolean
  onClose: () => void
  onResend: (id: string, force?: boolean) => Promise<void>
}

export default function SmsLogDetailsModal({ log, isOpen, onClose, onResend }: Props) {
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!log) return null

  const handleResend = async (force = false) => {
    setResending(true)
    setResendResult(null)
    try {
      await onResend(log.id, force)
      setResendResult({ success: true, message: 'SMS resent successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setResendResult({ success: false, message: msg })
    } finally {
      setResending(false)
    }
  }

  const canResend = !log.isOtp && log.status !== 'sent'
  const maxReached = log.attemptCount >= log.maxAttempts

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>SMS Log Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resendResult && (
          <Alert variant={resendResult.success ? 'success' : 'danger'} dismissible onClose={() => setResendResult(null)}>
            {resendResult.message}
          </Alert>
        )}

        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="text-muted small mb-1">Log ID</div>
            <code className="text-dark" style={{ fontSize: 12 }}>{log.id}</code>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Idempotency Key</div>
            <code className="text-primary small">{log.idempotencyKey ?? '—'}</code>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Recipient</div>
            <div className="fw-semibold">{log.isOtp ? (log.recipientMasked ?? '***masked***') : log.to}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Status</div>
            <SmsStatusBadge status={log.status} />
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">OTP</div>
            <Badge bg={log.isOtp ? 'warning' : 'secondary'}>{log.isOtp ? 'Yes — not resendable' : 'No'}</Badge>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Module</div>
            <Badge bg="light" text="dark">{log.module ?? '—'}</Badge>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Message Type</div>
            <span className="small">{log.messageType ?? '—'}</span>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Reference</div>
            <span className="small font-monospace">{log.reference ?? '—'}</span>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Attempts</div>
            <span className="small">{log.attemptCount} / {log.maxAttempts}</span>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Provider</div>
            <Badge bg="secondary" className="text-uppercase">{log.provider}</Badge>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Provider Ref</div>
            <code className="small">{log.providerRef ?? '—'}</code>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Sent At</div>
            <div className="small">{log.sentAt ? new Date(log.sentAt).toLocaleString() : '—'}</div>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Created</div>
            <div className="small">{new Date(log.createdAt).toLocaleString()}</div>
          </Col>
          {log.failureReason && (
            <Col md={6}>
              <div className="text-muted small mb-1">Failure Reason</div>
              <Badge bg="danger">{log.failureReason}</Badge>
            </Col>
          )}
          {log.failureDetail && (
            <Col xs={12}>
              <div className="text-muted small mb-1">Failure Detail</div>
              <div className="text-danger small">{log.failureDetail}</div>
            </Col>
          )}
          {!log.isOtp && log.body && (
            <Col xs={12}>
              <div className="text-muted small mb-1">Message Body</div>
              <pre className="bg-light border rounded p-3 small mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13 }}>
                {log.body}
              </pre>
            </Col>
          )}
          {log.isOtp && (
            <Col xs={12}>
              <Alert variant="warning" className="small py-2 mb-0">
                <Icon icon="solar:lock-bold" className="me-1" />
                OTP message body is hidden for security.
              </Alert>
            </Col>
          )}
        </Row>

        {log.attempts && log.attempts.length > 0 && (
          <div className="mb-3">
            <div className="fw-semibold small mb-2">Attempt History</div>
            {log.attempts.map((attempt) => (
              <div key={attempt.id} className="border rounded p-2 mb-2 small">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-semibold">Attempt #{attempt.attemptNumber}</span>
                  <Badge bg={attempt.status === 'sent' ? 'success' : 'danger'}>{attempt.status}</Badge>
                </div>
                <div className="text-muted">{new Date(attempt.attemptedAt).toLocaleString()}</div>
                {attempt.errorCode && <div className="text-danger mt-1">Error: {attempt.errorCode} — {attempt.errorMessage}</div>}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {canResend && (
          <>
            <Button
              variant="warning"
              size="sm"
              disabled={resending || maxReached}
              onClick={() => handleResend(false)}
              title={maxReached ? 'Max attempts reached. Use force resend.' : 'Resend this SMS'}
            >
              {resending ? <Spinner size="sm" className="me-1" /> : <Icon icon="solar:refresh-bold" className="me-1" />}
              Resend
            </Button>
            {maxReached && (
              <Button
                variant="danger"
                size="sm"
                disabled={resending}
                onClick={() => handleResend(true)}
                title="Force resend ignoring max attempts limit"
              >
                Force Resend
              </Button>
            )}
          </>
        )}
        {log.isOtp && (
          <span className="text-muted small me-auto">OTP messages cannot be resent by admin.</span>
        )}
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
