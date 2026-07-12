'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Form, InputGroup, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipMembersContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listMemberships({ page, limit: 20, search: search || undefined, status: status || undefined }), [page, search, status])
  const { data, loading, error } = useApi(fetchFn, [page, search, status])
  return (
    <div className="container-fluid">
      <PageHeader title="Active Members" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Active Members' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card><Card.Body><div className="d-flex gap-2 mb-3"><InputGroup><InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text><Form.Control placeholder="Search by member, card, or membership number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></InputGroup><Form.Select style={{ maxWidth: 220 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}><option value="">All Statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></Form.Select></div><LoadingOverlay loading={loading}><Table hover className="align-middle"><thead><tr><th>Membership</th><th>Plan</th><th>Member</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{data?.data?.map((item: any) => <tr key={item.id}><td><div className="fw-semibold">{item.membershipNumber ?? '-'}</div><div className="small text-muted">{item.cardNumber ?? '-'}</div></td><td>{item.plan?.nameEn ?? item.planNameSnapshot ?? '-'}</td><td>{item.user?.name ?? '-'}</td><td><StatusBadge status={item.membershipRecordStatus ?? item.status} /></td><td className="text-end"><Link href={`/community-care/membership/members/${item.id}`} className="btn btn-soft-primary btn-sm">View</Link></td></tr>)}</tbody></Table></LoadingOverlay></Card.Body></Card>
    </div>
  )
}
