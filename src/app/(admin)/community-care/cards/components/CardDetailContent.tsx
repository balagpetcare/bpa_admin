'use client'

import { useState, useCallback } from 'react'
import { Card, Row, Col, Button, Form, Modal, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CardStatusBadge from './CardStatusBadge'
import QrCodeImage from '@/components/ui/QrCodeImage'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { useNotificationContext } from '@/context/useNotificationContext'
import { carePartnerCardsApi } from '@/lib/api/care-partner-cards.api'
import type { ApiError } from '@/lib/api'

export default function CardDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const { can } = usePermission()
  const { showNotification } = useNotificationContext()
  const { mutate, loading: mutating } = useApiMutation<unknown, unknown>()
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')

  const fetchFn = useCallback(() => carePartnerCardsApi.getById(id), [id])
  const { data: card, loading, error, refetch } = useApi(fetchFn, [id])

  function buildVerifyUrl(qrToken: string) {
    const base = process.env['NEXT_PUBLIC_FRONTEND_URL'] ?? (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/verify/care-card/${qrToken}`
  }

  async function handleCopyLink(qrToken: string) {
    try {
      await navigator.clipboard.writeText(buildVerifyUrl(qrToken))
      showNotification({ message: 'Verification link copied to clipboard', variant: 'success' })
    } catch {
      showNotification({ message: 'Failed to copy link', variant: 'danger' })
    }
  }

  async function handleRevoke() {
    if (!revokeReason.trim()) return
    await mutate(() => carePartnerCardsApi.revoke(id, revokeReason), undefined)
    setShowRevokeModal(false)
    setRevokeReason('')
    refetch()
  }

  async function handleReactivate() {
    if (!confirm('Reactivate this card?')) return
    await mutate(() => carePartnerCardsApi.reactivate(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Card Detail"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Partner Cards', href: '/community-care/cards' }, { label: 'Detail' }]}
        action={
          <Button variant="outline-secondary" size="sm" onClick={() => router.push('/community-care/cards')}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />
            Back
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {card && (
          <Row className="g-3">
            <Col lg={6}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Card Info</span>
                  <CardStatusBadge status={card.status} />
                </Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Card Number</dt>
                    <dd className="col-sm-8 font-monospace fw-bold">{card.cardNumber}</dd>
                    <dt className="col-sm-4">Zone</dt>
                    <dd className="col-sm-8">{card.zone.name}</dd>
                    <dt className="col-sm-4">Issued</dt>
                    <dd className="col-sm-8">{card.issuedAt ? new Date(card.issuedAt).toLocaleDateString() : '—'}</dd>
                    <dt className="col-sm-4">Expires</dt>
                    <dd className="col-sm-8">{card.expiresAt ? new Date(card.expiresAt).toLocaleDateString() : '—'}</dd>
                    {card.revokedAt && (
                      <>
                        <dt className="col-sm-4">Revoked</dt>
                        <dd className="col-sm-8">{new Date(card.revokedAt).toLocaleDateString()}</dd>
                        <dt className="col-sm-4">Reason</dt>
                        <dd className="col-sm-8">{card.revocationReason}</dd>
                      </>
                    )}
                  </dl>
                  <div className="mt-3 d-flex gap-2">
                    {card.status === 'active' && can('care_partner_cards:update') && (
                      <Button variant="danger" size="sm" onClick={() => setShowRevokeModal(true)} disabled={mutating}>
                        <Icon icon="solar:forbidden-circle-bold" className="me-1" />
                        Revoke
                      </Button>
                    )}
                    {card.status === 'revoked' && can('care_partner_cards:update') && (
                      <Button variant="success" size="sm" onClick={handleReactivate} disabled={mutating}>
                        <Icon icon="solar:check-circle-bold" className="me-1" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Contributor</Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Name</dt>
                    <dd className="col-sm-8">{card.contribution.contributorName}</dd>
                    <dt className="col-sm-4">Mobile</dt>
                    <dd className="col-sm-8">{card.contribution.contributorMobile}</dd>
                    <dt className="col-sm-4">Plan</dt>
                    <dd className="col-sm-8">{card.contribution.plan.title}</dd>
                    <dt className="col-sm-4">Amount</dt>
                    <dd className="col-sm-8 fw-bold">৳{Number(card.contribution.amountBdt).toLocaleString()}</dd>
                    <dt className="col-sm-4">Contribution</dt>
                    <dd className="col-sm-8">
                      <Link href={`/community-care/contributors/${card.contributionId}`} className="font-monospace small">
                        {card.contribution.contributionNumber}
                      </Link>
                    </dd>
                  </dl>
                </Card.Body>
              </Card>
            </Col>
            {/* QR Code preview */}
            <Col lg={4}>
              <Card>
                <Card.Header className="fw-semibold d-flex align-items-center gap-2">
                  <Icon icon="solar:qr-code-bold-duotone" />
                  Verification QR
                </Card.Header>
                <Card.Body className="d-flex flex-column align-items-center gap-3">
                  <QrCodeImage value={buildVerifyUrl(card.qrToken)} size={180} />
                  <p className="text-muted small text-center mb-0 font-monospace" style={{ wordBreak: 'break-all', fontSize: '0.65rem' }}>
                    {card.qrToken}
                  </p>
                  <Button variant="outline-primary" size="sm" className="w-100" onClick={() => handleCopyLink(card.qrToken)}>
                    <Icon icon="solar:copy-bold" className="me-1" />
                    Copy Verification Link
                  </Button>
                  <a href={buildVerifyUrl(card.qrToken)} target="_blank" rel="noopener noreferrer" className="btn btn-soft-secondary btn-sm w-100">
                    <Icon icon="solar:link-bold" className="me-1" />
                    Open Verify Page
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="border-warning bg-warning-subtle">
                <Card.Body>
                  <Icon icon="solar:shield-warning-bold" className="me-2 text-warning" />
                  <small>
                    {card.legalDisclaimerSnapshot ??
                      card.contribution.plan.legalDisclaimerText ??
                      'Care Partner Card is a contribution recognition and service benefit card only. It is not ownership, share, profit-sharing, investment, or financial return. Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.'}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </LoadingOverlay>

      <Modal show={showRevokeModal} onHide={() => setShowRevokeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Revoke Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Reason for revocation <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRevokeModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevoke} disabled={!revokeReason.trim() || mutating}>
            {mutating && <span className="spinner-border spinner-border-sm me-2" />}
            Revoke Card
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
