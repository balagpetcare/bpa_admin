'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CardStatusBadge from './CardStatusBadge'
import { useApi } from '@/hooks/useApi'
import { carePartnerCardsApi } from '@/lib/api/care-partner-cards.api'
import type { ApiError } from '@/lib/api'
import type { CarePartnerCard, CarePartnerCardStatus } from '@/types/bpa.types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
]

export default function CardListContent() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<CarePartnerCardStatus | ''>('')

  const fetchFn = useCallback(
    () => carePartnerCardsApi.list({ page, limit: 20, status: status || undefined }),
    [page, status],
  )
  const { data, loading, error } = useApi(fetchFn, [page, status])
  const cards = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader
        title="Care Partner Cards"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Partner Cards' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as CarePartnerCardStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Card Number</th>
                  <th>Contributor</th>
                  <th>Zone</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No cards found</td></tr>
                ) : cards.map((c: CarePartnerCard) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/cards/${c.id}`)}>
                    <td className="font-monospace fw-bold small">{c.cardNumber}</td>
                    <td>
                      <div className="fw-semibold small">{c.contribution.contributorName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.contribution.contributorMobile}</div>
                    </td>
                    <td className="small">{c.zone.name}</td>
                    <td className="small">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '—'}</td>
                    <td className="small">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <CardStatusBadge status={c.status} />
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <Button variant="soft-primary" size="sm" onClick={() => router.push(`/community-care/cards/${c.id}`)}>
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
              <small className="text-muted">{meta.total} cards · Page {meta.page} of {meta.totalPages}</small>
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
