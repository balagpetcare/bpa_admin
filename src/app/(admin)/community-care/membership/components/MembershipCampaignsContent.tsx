'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Col, Form, InputGroup, Row, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipCampaignsContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listCampaigns({ page, limit: 20, search: search || undefined, status: status || undefined }), [page, search, status])
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Membership Campaigns"
        breadcrumbs={[{ label: 'Membership Management' }, { label: 'Membership Campaigns' }]}
        action={can('membership_campaigns:create') ? <Link href="/community-care/membership/campaigns/create" className="btn btn-primary"><Icon icon="solar:add-circle-bold" className="me-1" />New Campaign</Link> : undefined}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={6}><InputGroup><InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text><Form.Control value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search campaigns..." /></InputGroup></Col>
            <Col md={3}><Form.Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}><option value="">All Statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="application_open">Application Open</option><option value="closed">Closed</option><option value="archived">Archived</option></Form.Select></Col>
          </Row>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead><tr><th>Campaign</th><th>Slug</th><th>Window</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.id}>
                    <td><div className="fw-semibold">{item.titleEn}</div><div className="small text-muted">{item.titleBn}</div></td>
                    <td>{item.slug}</td>
                    <td><div className="small">{item.applicationStartAt ? new Date(item.applicationStartAt).toLocaleDateString() : '-'}</div><div className="small text-muted">to {item.applicationEndAt ? new Date(item.applicationEndAt).toLocaleDateString() : '-'}</div></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="text-end d-flex gap-1 justify-content-end">
                      {can('membership_campaigns:update') && <Link href={`/community-care/membership/campaigns/${item.id}/edit`} className="btn btn-soft-primary btn-sm">Edit</Link>}
                      {can('membership_campaigns:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this campaign'))) return; await membershipCampaignApi.deleteCampaign(item.id); refetch() }}>Delete</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data?.meta && data.meta.totalPages > 1 && <div className="d-flex justify-content-between"><small className="text-muted">Page {data.meta.page} of {data.meta.totalPages}</small><div className="d-flex gap-1"><Button size="sm" variant="outline-secondary" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button size="sm" variant="outline-secondary" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
