'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ContributionStatusBadge from './ContributionStatusBadge'
import { useApi } from '@/hooks/useApi'
import { careContributionsApi } from '@/lib/api/care-contributions.api'
import type { ApiError } from '@/lib/api'
import type { CareContribution, ContributionStatus } from '@/types/bpa.types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

export default function ContributorListContent() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ContributionStatus | ''>('')

  const fetchFn = useCallback(
    () => careContributionsApi.list({ page, limit: 20, status: status || undefined }),
    [page, status],
  )
  const { data, loading, error } = useApi(fetchFn, [page, status])
  const contributions = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contributors"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Contributors' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as ContributionStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Contribution #</th>
                  <th>Contributor</th>
                  <th>Plan / Zone</th>
                  <th>Amount</th>
                  <th>Card</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No contributions found</td></tr>
                ) : contributions.map((c: CareContribution) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/contributors/${c.id}`)}>
                    <td className="font-monospace small">{c.contributionNumber}</td>
                    <td>
                      <div className="fw-semibold">{c.isAnonymous ? 'Anonymous' : c.contributorName}</div>
                      <div className="text-muted small">{c.contributorMobile}</div>
                    </td>
                    <td>
                      <div className="small">{c.plan.title}</div>
                      <div className="text-muted small">{c.zone.name}</div>
                    </td>
                    <td className="fw-semibold">৳{Number(c.amountBdt).toLocaleString()}</td>
                    <td>
                      {c.carePartnerCard ? (
                        <span className="font-monospace small text-success">{c.carePartnerCard.cardNumber}</span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ContributionStatusBadge status={c.status} />
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="soft-primary"
                        size="sm"
                        onClick={() => router.push(`/community-care/contributors/${c.id}`)}
                      >
                        <Icon icon="solar:eye-bold" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} contributions · Page {meta.page} of {meta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
