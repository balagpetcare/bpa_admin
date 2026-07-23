'use client'

import { useCallback, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Button, Card, Form, Modal, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi } from '@/hooks/useApi'
import { membershipCampaignApi, type MembershipUpgrade } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

export default function MembershipUpgradesContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [selected, setSelected] = useState<MembershipUpgrade | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const fetchFn = useCallback(() => membershipCampaignApi.listUpgrades({ page, limit }), [page, limit])
  const { data, loading, error, refetch } = useApi(fetchFn, [])
  async function openDetail(id: string) {
    const detail = await membershipCampaignApi.getUpgrade(id)
    setSelected(detail)
    setReviewNotes(detail.reviewNotes ?? '')
  }
  return (
    <div className="container-fluid">
      <PageHeader title="Upgrades" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Upgrades' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Membership</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Credit</th>
                  <th>Payable</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.membership?.membershipNumber ?? item.membershipId}</td>
                    <td>{item.fromPlan?.code ?? '-'}</td>
                    <td>{item.toPlan?.code ?? '-'}</td>
                    <td>{item.pricing.eligibleCredit ?? 0}</td>
                    <td>{item.pricing.upgradePayable ?? 0}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-end">
                      <Button size="sm" variant="soft-primary" onClick={() => openDetail(item.id)}>
                        View
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
          <Modal.Title>Upgrade Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="d-grid gap-3">
              <div>
                <div className="text-muted small">Current Plan</div>
                <div>
                  {selected.fromPlan?.code} → {selected.toPlan?.code}
                </div>
              </div>
              <div>
                <div className="text-muted small">Pricing</div>
                <div>
                  Target Plan Price: {selected.pricing.targetPlanPrice ?? 0} | Credit: {selected.pricing.eligibleCredit ?? 0} | Payable:{' '}
                  {selected.pricing.upgradePayable ?? 0}
                </div>
              </div>
              <div>
                <div className="text-muted small">Entitlement Change</div>
                <div>
                  {selected.entitlement.beforeMaxCoveredPets} → {selected.entitlement.afterMaxCoveredPets} covered pets
                </div>
              </div>
              <Form.Group>
                <Form.Label>Review Notes</Form.Label>
                <Form.Control as="textarea" rows={4} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selected && (
            <>
              <Button variant="light" onClick={() => setSelected(null)}>
                Close
              </Button>
              {selected.status !== 'completed' && (
                <Button
                  variant="outline-danger"
                  onClick={async () => {
                    await membershipCampaignApi.reviewUpgrade(selected.id, { status: 'cancelled', reviewNotes })
                    const refreshed = await membershipCampaignApi.getUpgrade(selected.id)
                    setSelected(refreshed)
                    refetch()
                  }}>
                  Cancel Upgrade
                </Button>
              )}
              {selected.status !== 'completed' && (
                <Button
                  onClick={async () => {
                    await membershipCampaignApi.reviewUpgrade(selected.id, { status: 'completed', reviewNotes })
                    const refreshed = await membershipCampaignApi.getUpgrade(selected.id)
                    setSelected(refreshed)
                    refetch()
                  }}>
                  Mark Completed
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}
