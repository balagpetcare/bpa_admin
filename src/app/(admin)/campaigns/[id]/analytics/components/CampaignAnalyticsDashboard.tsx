'use client'

import { useCallback } from 'react'
import { Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { campaignAnalyticsApi } from '@/lib/api/campaign-analytics.api'
import type { ApiError } from '@/lib/api'
import type { CampaignAnalyticsSummary } from '@/types/bpa.types'

function ProgressBar({ label, value, max, variant = 'primary' }: { label: string; value: number; max: number; variant?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">{label}</small>
        <small className={`text-${variant} fw-semibold`}>{value} / {max} ({pct}%)</small>
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div
          className={`progress-bar bg-${variant}`}
          role="progressbar"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, variant }: { icon: string; label: string; value: number | string; variant: string }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-md bg-soft-${variant} rounded flex-centered flex-shrink-0`}>
            <Icon icon={icon} className={`fs-24 text-${variant}`} />
          </div>
          <div>
            <p className="text-muted mb-0 small">{label}</p>
            <h3 className="mb-0 text-dark">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default function CampaignAnalyticsDashboard({ campaignId }: { campaignId: string }) {
  const summaryFn = useCallback(() => campaignAnalyticsApi.getSummary(campaignId), [campaignId])
  const sessionFn = useCallback(() => campaignAnalyticsApi.getBySession(campaignId), [campaignId])
  const doctorFn = useCallback(() => campaignAnalyticsApi.getByDoctor(campaignId), [campaignId])
  const vacFn = useCallback(() => campaignAnalyticsApi.getVaccinationKpis(campaignId), [campaignId])

  const { data: summary, loading: sumLoading, error: sumErr } = useApi(summaryFn, [campaignId])
  const { data: sessions, loading: sesLoading } = useApi(sessionFn, [campaignId])
  const { data: doctors } = useApi(doctorFn, [campaignId])
  const { data: vacKpis } = useApi(vacFn, [campaignId])

  const s = summary as CampaignAnalyticsSummary | null
  const c = s?.counters

  return (
    <div className="container-fluid">
      <PageHeader
        title="Analytics"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Analytics' },
        ]}
      />

      <ApiErrorAlert error={sumErr as ApiError | null} />

      <LoadingOverlay loading={sumLoading}>
        {c && (
          <>
            {/* Campaign Health */}
            <Card className="mb-3">
              <Card.Header><h6 className="mb-0">Campaign Health</h6></Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <ProgressBar label="Payment Conversion" value={c.totalPaid} max={c.totalRegistrations} variant="success" />
                    <ProgressBar label="Vaccination Rate" value={c.totalVaccinated} max={c.totalPaid} variant="info" />
                  </Col>
                  <Col md={6}>
                    <ProgressBar label="Certificate Rate" value={c.totalCertificates} max={c.totalVaccinated} variant="warning" />
                    <ProgressBar label="Pets Registered" value={c.totalPets} max={c.totalRegistrations * 3} variant="primary" />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:clipboard-list-bold-duotone" label="Registrations" value={c.totalRegistrations} variant="primary" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:wallet-money-bold-duotone" label="Paid" value={c.totalPaid} variant="success" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:syringe-bold-duotone" label="Vaccinated" value={c.totalVaccinated} variant="info" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:document-text-bold-duotone" label="Certificates" value={c.totalCertificates} variant="warning" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:dollar-minimalistic-bold-duotone" label="Revenue (BDT)" value={`৳${Number(c.totalRevenueBdt).toLocaleString()}`} variant="success" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:confounded-square-bold-duotone" label="No-Show" value={s?.noShow ?? 0} variant="danger" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:chat-round-bold-duotone" label="SMS Sent" value={c.totalSmsSent} variant="secondary" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard icon="solar:close-circle-bold-duotone" label="SMS Failed" value={c.totalSmsFailed} variant="danger" />
              </Col>
            </Row>
          </>
        )}
      </LoadingOverlay>

      <Row className="g-3">
        {/* Sessions breakdown */}
        <Col lg={7}>
          <Card>
            <Card.Header><h6 className="mb-0">Sessions Breakdown</h6></Card.Header>
            <Card.Body className="p-0">
              <LoadingOverlay loading={sesLoading}>
                <Table hover className="table-sm mb-0">
                  <thead className="table-light">
                    <tr><th>Date</th><th>Venue</th><th>Capacity</th><th>Booked</th><th>Vaccinated</th></tr>
                  </thead>
                  <tbody>
                    {((sessions as unknown[]) ?? []).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-3 text-muted">No sessions</td></tr>
                    ) : ((sessions as Array<{
                      id: string; sessionDate: string; startTime: string; endTime: string;
                      capacity: number; bookedCount: number; vaccinated: number;
                      venue: { name: string } | null
                    }>) ?? []).map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                        <td>{s.venue?.name ?? '—'}</td>
                        <td>{s.capacity}</td>
                        <td>{s.bookedCount}</td>
                        <td><Badge bg="info">{s.vaccinated}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </LoadingOverlay>
            </Card.Body>
          </Card>
        </Col>

        {/* Vaccination by vaccine */}
        <Col lg={5}>
          <Card>
            <Card.Header><h6 className="mb-0">Vaccinations by Vaccine</h6></Card.Header>
            <Card.Body className="p-0">
              <Table hover className="table-sm mb-0">
                <thead className="table-light">
                  <tr><th>Vaccine</th><th>Count</th></tr>
                </thead>
                <tbody>
                  {((vacKpis as { byVaccine?: Array<{ vaccine: string; count: number }> })?.byVaccine ?? []).length === 0 ? (
                    <tr><td colSpan={2} className="text-center py-3 text-muted">No data</td></tr>
                  ) : ((vacKpis as { byVaccine?: Array<{ vaccine: string; count: number }> })?.byVaccine ?? []).map(v => (
                    <tr key={v.vaccine}>
                      <td>{v.vaccine}</td>
                      <td><Badge bg="primary">{v.count}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Doctor breakdown */}
        {((doctors as unknown[]) ?? []).length > 0 && (
          <Col lg={12}>
            <Card>
              <Card.Header><h6 className="mb-0">Doctor Performance</h6></Card.Header>
              <Card.Body className="p-0">
                <Table hover className="table-sm mb-0">
                  <thead className="table-light">
                    <tr><th>Doctor</th><th>Specialization</th><th>Vaccinations</th></tr>
                  </thead>
                  <tbody>
                    {((doctors as Array<{
                      doctor: { name: string; specialization?: string };
                      vaccinationsAdministered: number
                    }>) ?? []).map((d, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{d.doctor.name}</td>
                        <td>{(d.doctor as { specialization?: string }).specialization ?? '—'}</td>
                        <td><Badge bg="info">{d.vaccinationsAdministered}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}
