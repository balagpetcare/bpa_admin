'use client'

import { Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { LiveAnalyticsData } from '@/lib/api/analytics.api'

interface LiveControlTabProps {
  liveData: LiveAnalyticsData | null
  loading: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function LiveControlTab({ liveData, loading }: LiveControlTabProps) {
  const data = liveData ?? { activeVisitors: 0, recentEvents: [], recentPayments: [], recentInquiries: [] }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Active visitors monitor */}
      <Row className="g-3">
        <Col xs={12}>
          <Card className="border-0 shadow-sm bg-dark text-white overflow-hidden position-relative">
            <Card.Body className="d-flex align-items-center justify-content-between p-4 position-relative" style={{ zIndex: 2 }}>
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="live-pulse bg-success rounded-circle" style={{ width: '10px', height: '10px', display: 'inline-block' }} />
                  <span className="text-success small fw-bold text-uppercase tracking-wider">Live Control Room</span>
                </div>
                <h1 className="display-4 fw-bold mb-0 text-white">{data.activeVisitors}</h1>
                <p className="text-muted small mb-0">Estimated active users online in the last 5 minutes.</p>
              </div>
              <div className="text-muted opacity-25 d-none d-md-block">
                <Icon icon="solar:pulse-bold-duotone" style={{ fontSize: '100px' }} />
              </div>
            </Card.Body>
            <style jsx global>{`
              .live-pulse {
                animation: pulse-animation 1.5s infinite;
              }
              @keyframes pulse-animation {
                0% { transform: scale(0.9); opacity: 0.8; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0.8; }
              }
            `}</style>
          </Card>
        </Col>
      </Row>

      {/* Main monitoring feeds */}
      <Row className="g-3">
        {/* Live stream */}
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:chat-line-bold-duotone" className="text-primary" />
                <span>Live Operations Log</span>
              </h6>
              {loading && <Spinner animation="border" size="sm" variant="primary" />}
            </Card.Header>
            <Card.Body className="p-0 overflow-auto" style={{ maxHeight: '420px' }}>
              {data.recentEvents.length === 0 ? (
                <div className="text-center text-muted py-5 small">Waiting for incoming public session logs...</div>
              ) : (
                data.recentEvents.map((ev) => {
                  let icon = 'solar:eye-bold-duotone'
                  let color = 'primary'
                  if (ev.type.includes('START') || ev.type.includes('FORM')) {
                    icon = 'solar:pen-new-round-bold-duotone'
                    color = 'warning'
                  }
                  if (ev.type.includes('SUBMIT') || ev.type.includes('COMPLETED') || ev.action?.includes('completed')) {
                    icon = 'solar:check-circle-bold-duotone'
                    color = 'success'
                  }
                  if (ev.type.includes('FAILED') || ev.action?.includes('failed') || ev.type.includes('FAIL')) {
                    icon = 'solar:shield-warning-bold-duotone'
                    color = 'danger'
                  }

                  return (
                    <div key={ev.id} className="d-flex align-items-center gap-3 p-3 border-bottom border-light">
                      <div className={`flex-shrink-0 rounded-circle text-${color} bg-soft-${color} flex-centered`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon icon={icon} width={18} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <span className="small fw-semibold text-dark text-truncate d-block">
                          {ev.title || `${ev.module} · ${ev.action}`}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(ev.createdAt)}</span>
                      </div>
                      <Badge bg={`${color}-subtle`} className={`text-${color} border border-${color}-subtle text-uppercase`} style={{ fontSize: '0.6rem' }}>
                        {ev.type}
                      </Badge>
                    </div>
                  )
                })
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Live payments & inquires */}
        <Col xs={12} lg={5} className="d-flex flex-column gap-3">
          {/* Incoming payments */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Live Payments Queue</h6>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
                <tbody>
                  {data.recentPayments.map((p) => {
                    const variant = p.status === 'success' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'
                    return (
                      <tr key={p.id} className="border-bottom border-light">
                        <td className="ps-3 py-2 small fw-bold text-dark">
                          ৳{Number(p.amount).toLocaleString()}
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg={`${variant}-subtle`} className={`text-${variant} border border-${variant}-subtle`}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="text-end pe-3 py-2 text-muted small" style={{ fontSize: '0.7rem' }}>
                          {timeAgo(p.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                  {data.recentPayments.length === 0 && (
                    <tr>
                      <td className="text-center text-muted py-4 small">No recent transactions.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Incoming inquiries */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Live Inquiries Queue</h6>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
                <tbody>
                  {data.recentInquiries.map((inq) => {
                    const variant = inq.status === 'unread' ? 'danger' : 'success'
                    return (
                      <tr key={inq.id} className="border-bottom border-light">
                        <td className="ps-3 py-2 small">
                          <span className="fw-semibold text-dark text-truncate d-block" style={{ maxWidth: '140px' }}>
                            {inq.name}
                          </span>
                          <span className="text-muted text-truncate d-block" style={{ fontSize: '0.65rem', maxWidth: '140px' }}>
                            {inq.subject}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg={`${variant}-subtle`} className={`text-${variant} border border-${variant}-subtle`}>
                            {inq.status}
                          </Badge>
                        </td>
                        <td className="text-end pe-3 py-2 text-muted small" style={{ fontSize: '0.7rem' }}>
                          {timeAgo(inq.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                  {data.recentInquiries.length === 0 && (
                    <tr>
                      <td className="text-center text-muted py-4 small">No recent support inquiries.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
