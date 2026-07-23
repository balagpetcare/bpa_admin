'use client'

import { useCallback } from 'react'
import { Card, Badge, Row, Col, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { StaffDutyRole } from '@/types/bpa.types'
import dayjs from 'dayjs'

const DUTY_LABELS: Record<StaffDutyRole, { label: string; color: string; icon: string }> = {
  QR_SCAN: { label: 'QR Scan', color: 'info', icon: 'solar:qr-code-bold' },
  CHECK_IN: { label: 'Check-In', color: 'primary', icon: 'solar:check-circle-bold' },
  VACCINATION_DESK: { label: 'Vaccination Desk', color: 'success', icon: 'solar:syringe-bold' },
  CERTIFICATE_DESK: { label: 'Certificate Desk', color: 'warning', icon: 'solar:diploma-bold' },
  SESSION_MANAGER: { label: 'Session Manager', color: 'danger', icon: 'solar:crown-bold' },
  GENERAL_VOLUNTEER: { label: 'General Volunteer', color: 'secondary', icon: 'solar:user-hand-up-bold' },
}

function DutyChip({ duty }: { duty: StaffDutyRole }) {
  const d = DUTY_LABELS[duty] ?? { label: duty, color: 'secondary', icon: 'solar:star-bold' }
  return (
    <span className={`badge bg-${d.color}-subtle text-${d.color} d-inline-flex align-items-center gap-1`}>
      <Icon icon={d.icon} />
      {d.label}
    </span>
  )
}

export default function MyAssignedCampaignsPage() {
  const fetchFn = useCallback(() => campaignsApi.getMyAssignedCampaigns(), [])
  const { data, loading, error } = useApi(fetchFn, [])

  const campaigns = (() => {
    const raw = data as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.data)) return raw.data
    return []
  })()

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h4 className="fw-bold mb-0">My Assigned Campaigns</h4>
        <div className="text-muted small">Campaigns you are assigned to as staff or volunteer</div>
      </div>

      <ApiErrorAlert error={error as ApiError | null} />

      <LoadingOverlay loading={loading}>
        {!loading && campaigns.length === 0 && (
          <Alert variant="info" className="d-flex align-items-center gap-2">
            <Icon icon="solar:info-circle-bold" style={{ fontSize: 22 }} />
            <div>You are not assigned to any campaigns. Contact your campaign manager to get assigned.</div>
          </Alert>
        )}

        <Row className="g-3">
          {campaigns.map((campaign: any) => {
            const assignments = campaign.myAssignments ?? []
            const activeDuties: StaffDutyRole[] = [
              ...new Set(assignments.filter((a: any) => a.isActive).map((a: any) => a.dutyRole)),
            ] as StaffDutyRole[]

            return (
              <Col key={campaign.id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{campaign.title}</h6>
                      <span
                        className={`badge bg-${campaign.status === 'registration_open' ? 'success' : campaign.status === 'completed' ? 'secondary' : 'primary'}-subtle text-${campaign.status === 'registration_open' ? 'success' : campaign.status === 'completed' ? 'secondary' : 'primary'} small`}>
                        {campaign.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-muted small mb-2">
                      <Icon icon="solar:calendar-bold" className="me-1" />
                      {dayjs(campaign.startDate).format('DD MMM')} – {dayjs(campaign.endDate).format('DD MMM YYYY')}
                    </div>

                    {/* My duty roles */}
                    <div className="mb-3">
                      <div className="small text-muted fw-semibold mb-1">Your duties:</div>
                      {activeDuties.length === 0 ? (
                        <span className="text-muted small">No active duty assignments</span>
                      ) : (
                        <div className="d-flex flex-wrap gap-1">
                          {activeDuties.map((d) => (
                            <DutyChip key={d} duty={d} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sessions assigned to */}
                    {assignments.filter((a: any) => a.sessionId && a.session).length > 0 && (
                      <div className="mb-3">
                        <div className="small text-muted fw-semibold mb-1">Your sessions:</div>
                        {assignments
                          .filter((a: any) => a.sessionId && a.session)
                          .map((a: any) => (
                            <div key={a.id} className="small text-muted">
                              <Icon icon="solar:calendar-date-bold" className="me-1" />
                              {dayjs(a.session.sessionDate).format('DD MMM YYYY')} · {a.session.startTime}
                              {a.session.venue?.name && <span> · {a.session.venue.name}</span>}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Quick action links based on duty */}
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <Link href={`/campaigns/${campaign.id}/field-ops`} className="btn btn-primary btn-sm">
                        <Icon icon="solar:play-bold" className="me-1" />
                        Field Ops
                      </Link>
                      {activeDuties.includes('SESSION_MANAGER') && (
                        <Link href={`/campaigns/${campaign.id}`} className="btn btn-outline-secondary btn-sm">
                          <Icon icon="solar:eye-bold" className="me-1" />
                          Campaign Detail
                        </Link>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      </LoadingOverlay>
    </div>
  )
}
