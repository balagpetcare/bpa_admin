'use client'

import { useState } from 'react'
import { Modal, Button, Alert, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { RetryFailedResult } from '@/lib/api/sms-logs.api'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<RetryFailedResult>
}

export default function RetryFailedModal({ isOpen, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RetryFailedResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await onConfirm()
      setResult(r)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Retry Failed SMS</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!result && !error && (
          <p className="mb-0">
            You are about to resend failed transactional SMS messages. OTP messages will be skipped. Continue?
          </p>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {result && (
          <Alert variant="success">
            <div className="fw-semibold mb-2">Retry complete</div>
            <ul className="mb-0 small">
              <li>Attempted: <strong>{result.attempted}</strong></li>
              <li>Sent: <strong>{result.sent}</strong></li>
              <li>Failed: <strong>{result.failed}</strong></li>
              <li>Skipped: <strong>{result.skipped}</strong> (OTP: {result.skippedOtp}, Max Attempts: {result.skippedMaxAttempts})</li>
            </ul>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!result && (
          <Button variant="warning" disabled={loading} onClick={handleConfirm}>
            {loading ? <Spinner size="sm" className="me-1" /> : <Icon icon="solar:refresh-bold" className="me-1" />}
            Confirm Retry
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
