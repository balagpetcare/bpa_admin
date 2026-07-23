'use client'

import { useCallback, useState } from 'react'
import { Card, Row, Col, Badge, Table, Button, Alert } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { registrationsApi } from '@/lib/api/registrations.api'
import type { ApiError } from '@/lib/api'
import type { CampaignRegistration, CampaignRegistrationStatus } from '@/types/bpa.types'

const STATUS_COLORS: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'warning',
  paid: 'success',
  checked_in: 'info',
  vaccinated: 'primary',
  certificate_issued: 'secondary',
  completed: 'dark',
  no_show: 'danger',
  cancelled: 'danger',
}

export default function RegistrationDetail({ campaignId, registrationId }: { campaignId: string; registrationId: string }) {
  const router = useRouter()
  const fetchFn = useCallback(() => registrationsApi.getById(registrationId), [registrationId])
  const { data: reg, loading, error, refetch } = useApi(fetchFn, [registrationId])
  const { mutate: doAction, loading: acting, error: actionError } = useApiMutation<CampaignRegistration, unknown>()

  async function handleConfirmPayment() {
    if (!confirm('Confirm manual payment? This will mark the registration as paid.')) return
    const result = await doAction(() => registrationsApi.confirmManualPayment(registrationId), undefined)
    if (result) refetch()
  }

  async function handleCancel() {
    if (!confirm('Cancel this registration? This will release the booked slots.')) return
    await doAction(() => registrationsApi.cancel(registrationId), undefined)
    router.push(`/campaigns/${campaignId}/registrations`)
  }

  if (loading)
    return (
      <LoadingOverlay loading>
        <div style={{ minHeight: 200 }} />
      </LoadingOverlay>
    )
  if (error) return <ApiErrorAlert error={error as ApiError} />
  if (!reg) return null

  return (
    <div className="container-fluid">
      {actionError && <Alert variant="danger">{(actionError as ApiError).message}</Alert>}
      <PageHeader
        title={reg.bookingNumber}
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Registrations', href: `/campaigns/${campaignId}/registrations` },
          { label: reg.bookingNumber },
        ]}
      />

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Registration Info</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                <Col xs={6}>
                  <small className="text-muted d-block">Booking #</small>
                  <code>{reg.bookingNumber}</code>
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={STATUS_COLORS[reg.status]} className="text-capitalize">
                    {reg.status.replace(/_/g, ' ')}
                  </Badge>
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Amount</small>৳{reg.totalAmountBdt}
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Guest</small>
                  {reg.isGuest ? 'Yes' : 'No'}
                </Col>
                <Col xs={12}>
                  <small className="text-muted d-block">Created</small>
                  {new Date(reg.createdAt).toLocaleString()}
                </Col>
                {reg.notes && (
                  <Col xs={12}>
                    <small className="text-muted d-block">Notes</small>
                    {reg.notes}
                  </Col>
                )}
                <Col xs={12} className="pt-2 d-flex gap-2 flex-wrap">
                  {reg.status === 'pending_payment' && (
                    <Button size="sm" variant="success" onClick={handleConfirmPayment} disabled={acting}>
                      Confirm Manual Payment
                    </Button>
                  )}
                  {!['cancelled', 'completed', 'certificate_issued'].includes(reg.status) && (
                    <Button size="sm" variant="outline-danger" onClick={handleCancel} disabled={acting}>
                      Cancel Registration
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Owner</h6>
            </Card.Header>
            <Card.Body>
              <div className="fw-semibold">{reg.owner.ownerName}</div>
              <div>{reg.owner.mobile}</div>
              {reg.owner.email && <div className="text-muted">{reg.owner.email}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Session</h6>
            </Card.Header>
            <Card.Body>
              <div>{new Date(reg.session.sessionDate).toLocaleDateString()}</div>
              <div>
                {reg.session.startTime} – {reg.session.endTime}
              </div>
              <div className="text-muted">{reg.session.venue?.name ?? '—'}</div>
            </Card.Body>
          </Card>
        </Col>
        {reg.payment && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Payment</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col xs={6}>
                    <small className="text-muted d-block">Status</small>
                    {reg.payment.status}
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted d-block">Amount</small>৳{reg.payment.amount}
                  </Col>
                  {reg.payment.merchantTxnId && (
                    <Col xs={12}>
                      <small className="text-muted d-block">Txn ID</small>
                      <code>{reg.payment.merchantTxnId}</code>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Card>
        <Card.Header>
          <h6 className="mb-0">Pet Bookings ({reg.petBookings.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Pet</th>
                <th>Status</th>
                <th>Services</th>
                <th>Checked In</th>
                <th>Vaccinated</th>
              </tr>
            </thead>
            <tbody>
              {reg.petBookings.map((pb) => (
                <tr key={pb.id}>
                  <td>
                    <div className="fw-semibold">{pb.pet.name}</div>
                    <small className="text-muted text-capitalize">
                      {pb.pet.petType}
                      {pb.pet.breed ? ` · ${pb.pet.breed}` : ''}
                    </small>
                  </td>
                  <td>
                    <Badge bg={STATUS_COLORS[pb.status]} className="text-capitalize">
                      {pb.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td>
                    {pb.services.map((s) => (
                      <Badge key={s.id} bg={s.administered ? 'success' : 'secondary'} className="me-1">
                        {s.campaignService.name}
                      </Badge>
                    ))}
                  </td>
                  <td>{pb.checkedInAt ? new Date(pb.checkedInAt).toLocaleString() : '—'}</td>
                  <td>{pb.vaccinatedAt ? new Date(pb.vaccinatedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}
