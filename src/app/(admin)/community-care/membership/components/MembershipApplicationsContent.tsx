'use client'

import { useCallback, useState } from 'react'
import { Button, Card, Form, InputGroup, Modal, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi, type MembershipApplication } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipApplicationsContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<MembershipApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listApplications({ page, limit: 20, search: search || undefined, status: status || undefined }), [page, search, status])
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status])

  async function openDetail(id: string) {
    const detail = await membershipCampaignApi.getApplication(id)
    setSelected(detail)
    setReviewNotes(detail.reviewNotes ?? '')
  }

  return (
    <div className="container-fluid">
      <PageHeader title="Applications" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Applications' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <div className="d-flex gap-2 mb-3">
            <InputGroup><InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text><Form.Control placeholder="Search applicant, mobile, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></InputGroup>
            <Form.Select style={{ maxWidth: 220 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}><option value="">All Statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="pending_payment">Pending Payment</option><option value="paid">Paid</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Form.Select>
          </div>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead><tr><th>Applicant</th><th>Plan</th><th>Payment</th><th>Submitted</th><th>Status</th><th>Review</th><th className="text-end">Actions</th></tr></thead>
              <tbody>{data?.data?.map((item) => <tr key={item.id}><td><div className="fw-semibold">{item.applicantName}</div><div className="small text-muted">{item.applicantMobile}</div></td><td>{item.plan?.nameEn ?? item.planId}</td><td>{item.payment ? `${item.payment.amount} ${item.payment.currency}` : '-'}</td><td>{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-'}</td><td><StatusBadge status={item.status} /></td><td className="small">{item.reviewNotes ?? '-'}</td><td className="text-end d-flex gap-1 justify-content-end"><Button size="sm" variant="soft-primary" onClick={() => openDetail(item.id)}>View</Button></td></tr>)}</tbody>
            </Table>
            {data?.meta && data.meta.totalPages > 1 && <div className="d-flex justify-content-between"><small className="text-muted">Page {data.meta.page} of {data.meta.totalPages}</small><div className="d-flex gap-1"><Button size="sm" variant="outline-secondary" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button size="sm" variant="outline-secondary" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>}
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <Modal show={!!selected} onHide={() => setSelected(null)} size="xl">
        <Modal.Header closeButton><Modal.Title>Application Review</Modal.Title></Modal.Header>
        <Modal.Body>{selected && <div className="d-grid gap-3"><Card><Card.Body><div className="row g-3"><div className="col-md-6"><div className="text-muted small">Applicant</div><div className="fw-semibold">{selected.applicantName}</div><div>{selected.applicantMobile}</div><div>{selected.applicantEmail ?? '-'}</div></div><div className="col-md-6"><div className="text-muted small">Plan</div><div>{selected.plan?.nameEn ?? '-'}</div><div className="text-muted small mt-2">Payment</div><div>{selected.payment ? `${selected.payment.amount} ${selected.payment.currency} · ${selected.payment.status}` : 'No payment record'}</div></div><div className="col-12"><div className="text-muted small">Address</div><div>{selected.applicantAddress ?? '-'}</div></div><div className="col-12"><div className="text-muted small">Submitted Documents</div><div>{selected.documentUrls?.length ? selected.documentUrls.map((url) => <div key={url}><a href={url} target="_blank" rel="noreferrer">{url}</a></div>) : '-'}</div></div><div className="col-12"><div className="text-muted small">Review Details</div><div>{selected.reviewNotes ?? 'No review notes yet.'}</div></div></div></Card.Body></Card><Form.Group><Form.Label>Review Notes</Form.Label><Form.Control as="textarea" rows={4} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} /></Form.Group></div>}</Modal.Body>
        <Modal.Footer>{selected && <><Button variant="light" onClick={() => setSelected(null)}>Close</Button>{can('membership_applications:update') && <Button variant="outline-danger" onClick={async () => { if (!(await confirmDialog({ title: 'Reject application?', text: 'This will mark the application as rejected.', confirmText: 'Reject', variant: 'danger' }))) return; await membershipCampaignApi.reviewApplication(selected.id, { status: 'rejected', reviewNotes }); const refreshed = await membershipCampaignApi.getApplication(selected.id); setSelected(refreshed); refetch() }}>Reject</Button>}{can('membership_applications:update') && <Button variant="outline-success" onClick={async () => { await membershipCampaignApi.reviewApplication(selected.id, { status: 'approved', reviewNotes }); const refreshed = await membershipCampaignApi.getApplication(selected.id); setSelected(refreshed); refetch() }}>Approve</Button>}{can('memberships:update') && ['paid', 'approved'].includes(selected.status) && <Button onClick={async () => { await membershipCampaignApi.activateMembership(selected.id, {}); const refreshed = await membershipCampaignApi.getApplication(selected.id); setSelected(refreshed); refetch() }}>Activate Membership</Button>}</>}</Modal.Footer>
      </Modal>
    </div>
  )
}

