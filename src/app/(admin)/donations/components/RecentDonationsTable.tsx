'use client'

import { Card, Table, Badge, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import type { Donation } from '@/lib/api/donations.api'

interface Props {
  donations: Donation[]
}

function maskEmail(email?: string): string {
  if (!email) return '—'
  const parts = email.split('@')
  if (parts.length !== 2) return email
  const name = parts[0]
  const domain = parts[1]
  if (name.length <= 2) return `*@${domain}`
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`
}

function maskPhone(phone?: string): string {
  if (!phone) return '—'
  if (phone.length <= 6) return '***'
  return `${phone.slice(0, 3)}*****${phone.slice(-3)}`
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
      return (
        <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1">
          Success
        </Badge>
      )
    case 'pending':
      return (
        <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-2 py-1">
          Pending
        </Badge>
      )
    case 'pending_review':
      return (
        <Badge bg="info-subtle" className="text-info border border-info-subtle px-2 py-1">
          Under Review
        </Badge>
      )
    case 'failed':
      return (
        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-2 py-1">
          Failed
        </Badge>
      )
    case 'refunded':
      return (
        <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1">
          Refunded
        </Badge>
      )
    default:
      return (
        <Badge bg="light" className="text-dark px-2 py-1">
          {status}
        </Badge>
      )
  }
}

export default function RecentDonationsTable({ donations }: Props) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="d-flex align-items-center justify-content-between bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <Icon icon="solar:history-bold-duotone" className="text-primary fs-20" />
          <span>Recent Donations</span>
        </h5>
        <Link href="/donations/list" passHref legacyBehavior>
          <Button variant="link" className="p-0 text-decoration-none small d-flex align-items-center gap-1">
            <span>View All</span>
            <Icon icon="solar:arrow-right-linear" />
          </Button>
        </Link>
      </Card.Header>
      <Card.Body className="p-0">
        {donations.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Icon icon="solar:clipboard-list-bold-duotone" className="fs-36 mb-2" />
            <p className="mb-0">No donations available.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
              <thead className="table-light text-muted small uppercase">
                <tr>
                  <th className="ps-3">Reference</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Purpose / Campaign</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => {
                  const targetName = d.isAnonymous ? 'Anonymous Donor' : d.donorName
                  const targetContact = d.isAnonymous ? '—' : d.donorEmail ? maskEmail(d.donorEmail) : d.donorPhone ? maskPhone(d.donorPhone) : '—'

                  const allocation = d.campaign?.titleEn || d.purpose?.titleEn || 'General Care Fund'

                  return (
                    <tr key={d.id} className="border-bottom border-light">
                      <td className="ps-3 font-monospace fw-semibold text-dark">{d.referenceNo}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark small">{targetName}</span>
                          <span className="text-muted fs-12">{targetContact}</span>
                        </div>
                      </td>
                      <td className="fw-bold text-dark">৳{Number(d.amount).toLocaleString()}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>
                        <div className="d-flex flex-column">
                          <span className="text-dark small text-truncate">{allocation}</span>
                          <span className="text-muted fs-11">{d.campaign ? 'Campaign' : d.purpose ? 'Purpose' : 'General'}</span>
                        </div>
                      </td>
                      <td className="small text-muted">{d.source || 'Online/EPS'}</td>
                      <td>{getStatusBadge(d.status)}</td>
                      <td className="text-muted small">
                        {new Date(d.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="text-end pe-3">
                        <Link href={`/donations/list?search=${d.referenceNo}`} passHref legacyBehavior>
                          <Button variant="soft-primary" size="sm" className="btn-icon">
                            <Icon icon="solar:eye-bold-duotone" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
