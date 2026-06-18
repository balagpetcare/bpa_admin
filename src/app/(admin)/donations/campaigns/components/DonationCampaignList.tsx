'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, ProgressBar } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { listCampaigns, deleteCampaign, type DonationCampaign } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

const STATUS_OPTS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_VARIANT: Record<string, string> = {
  draft: 'secondary', published: 'success', completed: 'info', cancelled: 'danger',
}

export default function DonationCampaignList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => listCampaigns({ search: search || undefined, status: status || undefined }),
    [search, status],
  )
  const { data: campaigns, loading, error, refetch } = useApi(fetchFn, [search, status])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete campaign "${title}"?`)) return
    await mutate(() => deleteCampaign(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Donation Campaigns"
        breadcrumbs={[{ label: 'Donations' }, { label: 'Campaigns' }]}
        action={
          <Link href="/donations/campaigns/create" className="btn btn-primary btn-sm">
            <Icon icon="solar:add-circle-bold" className="me-1" />New Campaign
          </Link>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Campaign</th>
                  <th>Purpose</th>
                  <th style={{ minWidth: 160 }}>Progress</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(campaigns ?? []).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No campaigns found.</td></tr>
                ) : (
                  (campaigns ?? []).map((c: DonationCampaign) => {
                    const goal = Number(c.goalAmount)
                    const raised = Number(c.raisedAmount || c.currentAmount || 0)
                    const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/donations/campaigns/${c.id}`)}>
                        <td>
                          <div className="fw-semibold">{c.titleEn}</div>
                          <div className="text-muted small">{c.slug}</div>
                        </td>
                        <td>
                          {c.purpose
                            ? <Badge bg="success-subtle" text="success">{c.purpose.titleEn}</Badge>
                            : <span className="text-muted small">—</span>}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar now={pct} style={{ height: 6, flex: 1 }} variant="success" />
                            <small className="text-muted">{pct}%</small>
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>৳{raised.toLocaleString()} / ৳{goal.toLocaleString()}</div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Badge bg={`${STATUS_VARIANT[c.status] ?? 'secondary'}-subtle`} text={STATUS_VARIANT[c.status] ?? 'secondary'} className="text-capitalize">
                            {c.status}
                          </Badge>
                        </td>
                        <td>
                          {c.isFeatured ? <Icon icon="solar:star-bold" className="text-warning" /> : null}
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex gap-1 justify-content-end">
                            <Link href={`/donations/campaigns/${c.id}`} className="btn btn-soft-primary btn-sm" title="Edit">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                            <Button variant="soft-danger" size="sm" title="Delete" onClick={() => handleDelete(c.id, c.titleEn)}>
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
