'use client'

import { useCallback, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Alert, Button, Card, Form, Modal, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi, type MembershipReplacement } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipReplacementsContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { isSuperAdmin } = usePermission()
  const [selected, setSelected] = useState<MembershipReplacement | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [newPetId, setNewPetId] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listReplacements({ page, limit }), [page, limit])
  const { data, loading, error, refetch } = useApi(fetchFn, [])
  async function openDetail(id: string) {
    const detail = await membershipCampaignApi.getReplacement(id)
    setSelected(detail)
    setReviewNotes(detail.reviewNotes ?? '')
    setNewPetId(detail.newPetId ?? '')
  }
  return (
    <div className="container-fluid">
      <PageHeader title="Replacement Requests" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Replacement Requests' }]} />
      <Alert variant="secondary" className="small">
        There is intentionally no normal “Remove Covered Pet” action. Only deceased, permanently lost, or restricted admin correction flows are
        available. Admin correction should be used only by the highest permission role.
      </Alert>
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Membership</th>
                  <th>Old Pet</th>
                  <th>Reason</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.membership?.membershipNumber ?? item.membershipId}</td>
                    <td>{item.oldCoveredPet?.pet?.name ?? item.oldCoveredPetId}</td>
                    <td>{item.reason}</td>
                    <td>{item.requestedByUser?.name ?? item.requestedByStaff?.name ?? '-'}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-end">
                      <Button size="sm" variant="soft-primary" onClick={() => openDetail(item.id)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data?.meta && data.meta.totalPages > 1 && (
              <Pagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                hasPrev={data.meta.hasPrev}
                hasNext={data.meta.hasNext}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </LoadingOverlay>
        </Card.Body>
      </Card>
      <Modal show={!!selected} onHide={() => setSelected(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Replacement Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="d-grid gap-3">
              <div>
                <div className="text-muted small">Old Pet</div>
                <div className="fw-semibold">{selected.oldCoveredPet?.pet?.name ?? selected.oldCoveredPetId}</div>
              </div>
              <div>
                <div className="text-muted small">Reason</div>
                <div>{selected.reason}</div>
              </div>
              <div>
                <div className="text-muted small">Supporting Document</div>
                <div>
                  {selected.supportingDocumentUrl ? (
                    <a href={selected.supportingDocumentUrl} target="_blank" rel="noreferrer">
                      {selected.supportingDocumentUrl}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted small">Service History</div>
                <div>{selected.membership?.serviceUsages?.length ?? 0} historical service record(s) remain preserved.</div>
              </div>
              <Form.Group>
                <Form.Label>Review Notes</Form.Label>
                <Form.Control as="textarea" rows={4} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
              </Form.Group>
              {selected.status === 'APPROVED' && (
                <Form.Group>
                  <Form.Label>Replacement Pet ID</Form.Label>
                  <Form.Control
                    value={newPetId}
                    onChange={(e) => setNewPetId(e.target.value)}
                    placeholder="Enter the approved replacement pet UUID"
                  />
                </Form.Group>
              )}{' '}
              {selected.reason === 'ADMIN_CORRECTION' && !isSuperAdmin && (
                <Alert variant="danger" className="small mb-0">
                  Admin correction is restricted to the highest permission role.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selected && (
            <>
              <Button variant="light" onClick={() => setSelected(null)}>
                Close
              </Button>
              {selected.status === 'REQUESTED' && (
                <>
                  <Button
                    variant="outline-danger"
                    onClick={async () => {
                      if (!(await confirmDialog({ title: 'Reject request?', confirmText: 'Reject', variant: 'danger' }))) return
                      await membershipCampaignApi.rejectReplacement(selected.id, { reviewNotes })
                      const refreshed = await membershipCampaignApi.getReplacement(selected.id)
                      setSelected(refreshed)
                      refetch()
                    }}>
                    Reject
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={async () => {
                      await membershipCampaignApi.approveReplacement(selected.id, { reviewNotes })
                      const refreshed = await membershipCampaignApi.getReplacement(selected.id)
                      setSelected(refreshed)
                      refetch()
                    }}>
                    Approve
                  </Button>
                </>
              )}
              {selected.status === 'APPROVED' && (
                <Button
                  onClick={async () => {
                    await membershipCampaignApi.completeReplacement(selected.id, { newPetId, reviewNotes })
                    const refreshed = await membershipCampaignApi.getReplacement(selected.id)
                    setSelected(refreshed)
                    refetch()
                  }}>
                  Complete Replacement
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}
