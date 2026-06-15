'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ZoneStatusBadge from './ZoneStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { communityZonesApi } from '@/lib/api/community-zones.api'
import type { ApiError } from '@/lib/api'
import type { CommunityZone, CommunityZoneStatus } from '@/types/bpa.types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'coming_soon', label: 'Coming Soon' },
]

export default function ZoneListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<CommunityZoneStatus | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => communityZonesApi.list({ page, limit: 20, status: status || undefined }),
    [page, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, status])
  const zones = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this zone? This cannot be undone.')) return
    await mutate(() => communityZonesApi.remove(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Community Zones"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Zones' }]}
        action={
          <div className="d-flex gap-2">
            <Link href="/community-care/zone-demand" className="btn btn-outline-primary">
              <Icon icon="solar:ranking-bold" className="me-1" />Clinic Priority
            </Link>
            {can('community_zones:create') && (
              <Link href="/community-care/zones/create" className="btn btn-primary">
                <Icon icon="solar:add-circle-bold" className="me-1" />New Zone
              </Link>
            )}
          </div>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as CommunityZoneStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Zone</th>
                  <th>Location</th>
                  <th>Contributors</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No zones found</td></tr>
                ) : zones.map((z: CommunityZone) => (
                  <tr key={z.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/zones/${z.id}`)}>
                    <td>
                      <div className="fw-semibold">{z.name}</div>
                      <div className="text-muted small">{z.slug}</div>
                    </td>
                    <td>
                      <div className="small">{z.city}, {z.district}</div>
                      <div className="text-muted small">{z.division}</div>
                    </td>
                    <td>
                      <div className="small">{z.currentContributors} / {z.targetContributors}</div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ZoneStatusBadge status={z.status} />
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        {can('community_zones:read') && (
                          <Link href={`/community-care/zones/${z.id}`} className="btn btn-soft-primary btn-sm">
                            <Icon icon="solar:pen-bold" />
                          </Link>
                        )}
                        {can('community_zones:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(z.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} zones · Page {meta.page} of {meta.totalPages}</small>
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
