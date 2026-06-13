'use client'

import { useCallback } from 'react'
import { Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CampaignStatusBadge from '../../components/CampaignStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'

const LIFECYCLE_ACTIONS: { status: string; action: string; label: string; variant: string }[] = [
  { status: 'draft', action: 'publish', label: 'Publish', variant: 'success' },
  { status: 'published', action: 'openRegistration', label: 'Open Registration', variant: 'primary' },
  { status: 'registration_open', action: 'closeRegistration', label: 'Close Registration', variant: 'warning' },
  { status: 'registration_closed', action: 'complete', label: 'Mark Completed', variant: 'info' },
]

export default function CampaignDetailContent({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const router = useRouter()
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(() => campaignsApi.getById(campaignId), [campaignId])
  const { data: campaign, loading, error, refetch } = useApi(fetchFn, [campaignId])

  async function handleLifecycle(action: string) {
    const lifecycleMap: Record<string, (id: string) => Promise<unknown>> = {
      publish: campaignsApi.publish,
      openRegistration: campaignsApi.openRegistration,
      closeRegistration: campaignsApi.closeRegistration,
      complete: campaignsApi.complete,
    }
    await mutate(() => lifecycleMap[action](campaignId), undefined)
    refetch()
  }

  async function handleCancel() {
    if (!confirm('Cancel this campaign?')) return
    await mutate(() => campaignsApi.cancel(campaignId), undefined)
    refetch()
  }

  if (loading) return <LoadingOverlay loading><div style={{ minHeight: 200 }} /></LoadingOverlay>
  if (error) return <ApiErrorAlert error={error as ApiError} />
  if (!campaign) return null

  const nextAction = LIFECYCLE_ACTIONS.find(a => a.status === campaign.status)

  return (
    <div className="container-fluid">
      <PageHeader
        title={campaign.title}
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Campaigns', href: '/campaigns' }, { label: campaign.title }]}
        action={
          <div className="d-flex gap-2">
            {nextAction && can('campaigns:lifecycle') && (
              <Button variant={nextAction.variant} onClick={() => handleLifecycle(nextAction.action)}>
                <Icon icon="solar:check-circle-bold" className="me-1" />{nextAction.label}
              </Button>
            )}
            {!['completed', 'cancelled'].includes(campaign.status) && can('campaigns:lifecycle') && (
              <Button variant="outline-danger" onClick={handleCancel}>Cancel Campaign</Button>
            )}
            {campaign.status === 'draft' && can('campaigns:update') && (
              <Link href={`/campaigns/${campaignId}/edit`} className="btn btn-outline-primary">
                <Icon icon="solar:pen-bold" className="me-1" />Edit
              </Link>
            )}
          </div>
        }
      />

      <Row className="g-3 mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}><small className="text-muted d-block">Status</small><CampaignStatusBadge status={campaign.status} /></Col>
                <Col md={6}><small className="text-muted d-block">Type</small><Badge bg="primary-subtle" text="primary" className="text-capitalize">{campaign.campaignType.replace('_', ' ')}</Badge></Col>
                <Col md={6}><small className="text-muted d-block">Start Date</small><span>{new Date(campaign.startDate).toLocaleString()}</span></Col>
                <Col md={6}><small className="text-muted d-block">End Date</small><span>{new Date(campaign.endDate).toLocaleString()}</span></Col>
                <Col md={6}><small className="text-muted d-block">Base Price</small><span>৳{campaign.basePriceBdt}</span></Col>
                <Col md={6}><small className="text-muted d-block">Max Pets/Booking</small><span>{campaign.maxPetsPerBooking}</span></Col>
                {campaign.description && <Col md={12}><small className="text-muted d-block">Description</small><p className="mb-0">{campaign.description}</p></Col>}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h6 className="mb-3">Management</h6>
              <div className="d-grid gap-2">
                <Link href={`/campaigns/${campaignId}/sessions`} className="btn btn-outline-secondary btn-sm text-start">
                  <Icon icon="solar:calendar-bold-duotone" className="me-2" />Sessions ({campaign.sessions?.length ?? 0})
                </Link>
                <Link href={`/campaigns/${campaignId}/services`} className="btn btn-outline-secondary btn-sm text-start">
                  <Icon icon="solar:sticker-bold-duotone" className="me-2" />Services ({campaign.services?.length ?? 0})
                </Link>
                <Link href={`/campaigns/${campaignId}/doctors`} className="btn btn-outline-secondary btn-sm text-start">
                  <Icon icon="solar:stethoscope-bold-duotone" className="me-2" />Doctors ({campaign.doctors?.length ?? 0})
                </Link>
                <Link href={`/campaigns/${campaignId}/volunteers`} className="btn btn-outline-secondary btn-sm text-start">
                  <Icon icon="solar:hand-heart-bold-duotone" className="me-2" />Volunteers ({campaign.volunteers?.length ?? 0})
                </Link>
                <Link href={`/campaigns/${campaignId}/registrations`} className="btn btn-outline-primary btn-sm text-start">
                  <Icon icon="solar:clipboard-list-bold-duotone" className="me-2" />Registrations
                </Link>
                <Link href={`/campaigns/${campaignId}/waitlist`} className="btn btn-outline-warning btn-sm text-start">
                  <Icon icon="solar:clock-circle-bold-duotone" className="me-2" />Waitlist
                </Link>
                <Link href={`/campaigns/${campaignId}/checkin`} className="btn btn-outline-success btn-sm text-start">
                  <Icon icon="solar:qr-code-bold-duotone" className="me-2" />Check-In / Vaccinate
                </Link>
                <Link href={`/campaigns/${campaignId}/vaccination`} className="btn btn-outline-info btn-sm text-start">
                  <Icon icon="solar:syringe-bold-duotone" className="me-2" />Vaccination Records
                </Link>
                <Link href={`/campaigns/${campaignId}/certificates`} className="btn btn-outline-primary btn-sm text-start">
                  <Icon icon="solar:document-text-bold-duotone" className="me-2" />Certificates
                </Link>
                <Link href={`/campaigns/${campaignId}/media`} className="btn btn-outline-primary btn-sm text-start">
                  <Icon icon="solar:gallery-bold-duotone" className="me-2" />Media Gallery
                </Link>
                <Link href={`/campaigns/${campaignId}/analytics`} className="btn btn-outline-secondary btn-sm text-start">
                  <Icon icon="solar:chart-bold-duotone" className="me-2" />Analytics
                </Link>
                <Link href={`/campaigns/${campaignId}/qr-logs`} className="btn btn-outline-dark btn-sm text-start">
                  <Icon icon="solar:qr-code-linear" className="me-2" />QR Scan Logs
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sessions preview */}
      {(campaign.sessions?.length ?? 0) > 0 && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Upcoming Sessions</h6>
            <Link href={`/campaigns/${campaignId}/sessions`} className="btn btn-sm btn-outline-primary">Manage</Link>
          </Card.Header>
          <Card.Body className="p-0">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light"><tr><th>Date</th><th>Time</th><th>Venue</th><th>Capacity</th></tr></thead>
              <tbody>
                {campaign.sessions.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                    <td>{s.startTime} – {s.endTime}</td>
                    <td>{s.venue?.name ?? '—'}</td>
                    <td>{s.bookedCount} / {s.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
