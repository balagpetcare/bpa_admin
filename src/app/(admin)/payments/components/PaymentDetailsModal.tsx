'use client'

import { useState } from 'react'
import { Modal, Button, Row, Col, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PaymentStatusBadge from './PaymentStatusBadge'
import { paymentsApi } from '@/lib/api/payments.api'
import type { Payment } from '@/types/bpa.types'

interface PaymentDetailsModalProps {
  payment: Payment | null
  isOpen: boolean
  onClose: () => void
  onSynced?: (updated: Payment) => void
}

function formatAmount(amount: string, currency: string) {
  const num = parseFloat(amount)
  return isNaN(num) ? amount : `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export default function PaymentDetailsModal({ payment, isOpen, onClose, onSynced }: PaymentDetailsModalProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<string | null>(null)

  if (!payment) return null

  const displayStatus = (localStatus ?? payment.status) as Payment['status']

  const handleSync = async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      const result = await paymentsApi.sync(payment.id)
      setLocalStatus(result.status)
      if (onSynced) onSynced({ ...payment, status: result.status })
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const canSync = payment.merchantTxnId && payment.status === 'pending'

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="text-muted small mb-1">Payment ID</div>
            <code className="text-dark" style={{ fontSize: 12 }}>
              {payment.id}
            </code>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Purpose</div>
            <Badge bg="info" className="text-capitalize">
              {payment.purpose}
            </Badge>
          </Col>

          <Col md={6}>
            <div className="text-muted small mb-1">Merchant TXN ID</div>
            <code className="text-primary small">{payment.merchantTxnId ?? '—'}</code>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">EPS TXN ID</div>
            <code className="text-secondary small">{payment.epsTxnId ?? '—'}</code>
          </Col>

          <Col md={4}>
            <div className="text-muted small mb-1">Amount</div>
            <div className="fw-semibold fs-5">{formatAmount(payment.amount, payment.currency)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Method</div>
            <Badge bg="secondary">{payment.gateway === 'eps' ? 'Online Payment' : payment.gateway}</Badge>
          </Col>
          <Col md={4}>
            <div className="text-muted small mb-1">Status</div>
            <PaymentStatusBadge status={displayStatus} />
          </Col>

          <Col md={6}>
            <div className="text-muted small mb-1">Created</div>
            <div>{new Date(payment.createdAt).toLocaleString()}</div>
          </Col>
          <Col md={6}>
            <div className="text-muted small mb-1">Last Updated</div>
            <div>{new Date(payment.updatedAt).toLocaleString()}</div>
          </Col>
        </Row>

        {syncError && <div className="alert alert-danger py-2 small mb-3">{syncError}</div>}

        {payment.payload && (
          <div>
            <div className="text-muted small mb-1">Payload / Application Data</div>
            <pre
              className="bg-light border rounded p-3 small mb-0"
              style={{ maxHeight: 250, overflow: 'auto', fontSize: 12, fontFamily: 'monospace' }}>
              {JSON.stringify(payment.payload, null, 2)}
            </pre>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {canSync && (
          <Button variant="outline-primary" size="sm" onClick={handleSync} disabled={syncing} className="me-auto">
            {syncing ? (
              <>
                <Spinner size="sm" className="me-1" /> Syncing…
              </>
            ) : (
              <>
                <Icon icon="solar:refresh-bold" className="me-1" /> Sync with EPS
              </>
            )}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
