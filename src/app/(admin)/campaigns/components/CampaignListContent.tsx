'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CampaignStatusBadge from './CampaignStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { CampaignListItem, CampaignStatus, CampaignType } from '@/types/bpa.types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'registration_open', label: 'Registration Open' },
  { value: 'registration_closed', label: 'Registration Closed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'microchip', label: 'Microchip' },
  { value: 'health_camp', label: 'Health Camp' },
  { value: 'spay_neuter', label: 'Spay/Neuter' },
]

export default function CampaignListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CampaignStatus | ''>('')
  const [campaignType, setCampaignType] = useState<CampaignType | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => campaignsApi.list({ page, limit: 20, search: search || undefined, status: status || undefined, campaignType: campaignType || undefined }),
    [page, search, status, campaignType],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status, campaignType])
  const campaigns = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this campaign? Only draft campaigns can be deleted.')) return
    await mutate(() => campaignsApi.remove(id), undefined)
    refetch()
  }

  async function handleLifecycle(id: string, action: 'publish' | 'openRegistration' | 'closeRegistration' | 'complete' | 'cancel' | 'reopen') {
    await mutate(() => campaignsApi[action](id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Campaigns"
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Campaigns' }]}
        action={
          can('campaigns:create') ? (
            <Link href="/campaigns/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />New Campaign
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control placeholder="Search campaigns..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as CampaignStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={campaignType} onChange={(e) => { setCampaignType(e.target.value as CampaignType | ''); setPage(1) }}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Sessions</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No campaigns found</td></tr>
                ) : (
                  campaigns.map((c: CampaignListItem) => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)}>
                      <td>
                        <div className="fw-semibold">{c.title}</div>
                        <div className="text-muted small">{c.slug}</div>
                      </td>
                      <td className="text-capitalize"><Badge bg="primary-subtle" text="primary">{c.campaignType.replace('_', ' ')}</Badge></td>
                      <td onClick={(e) => e.stopPropagation()}><CampaignStatusBadge status={c.status} /></td>
                      <td>
                        <div className="small">{new Date(c.startDate).toLocaleDateString()}</div>
                        <div className="small text-muted">→ {new Date(c.endDate).toLocaleDateString()}</div>
                      </td>
                      <td><Badge bg="secondary-subtle" text="secondary">{c._count.sessions}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-end">
                          {c.status === 'draft' && can('campaigns:lifecycle') && (
                            <Button variant="soft-success" size="sm" title="Publish" onClick={() => handleLifecycle(c.id, 'publish')}>
                              <Icon icon="solar:check-circle-bold" />
                            </Button>
                          )}
                          {c.status === 'cancelled' && can('campaigns:lifecycle') && (
                            <Button variant="soft-warning" size="sm" title="Reopen" onClick={() => {
                              if (confirm('Are you sure you want to reopen this cancelled campaign?')) handleLifecycle(c.id, 'reopen')
                            }}>
                              <Icon icon="solar:refresh-bold" />
                            </Button>
                          )}
                          {can('campaigns:read') && (
                            <Link href={`/campaigns/${c.id}`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:eye-bold" />
                            </Link>
                          )}
                          {c.status === 'draft' && can('campaigns:delete') && (
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(c.id)}>
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} campaigns · Page {meta.page} of {meta.totalPages}</small>
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
