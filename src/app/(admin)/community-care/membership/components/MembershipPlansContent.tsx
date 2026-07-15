'use client'

import { useCallback, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Row, Col, Table, Placeholder, Spinner } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import Pagination from '@/components/ui/Pagination'
import StatusBadge from '@/components/ui/StatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { ApiError } from '@/lib/api'
import { membershipCampaignApi, type MembershipPlan, type MembershipPlanHistoryEntry } from '@/lib/api/membership-campaign.api'

function SkeletonTable() {
  return (
    <Table hover responsive className="align-middle">
      <thead>
        <tr>
          <th>Tier</th>
          <th>Display</th>
          <th>Pricing</th>
          <th>Pets</th>
          <th>Validity</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, idx) => (
          <tr key={idx}>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={6} />
                <br />
                <Placeholder xs={4} size="sm" />
              </Placeholder>
            </td>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={8} />
              </Placeholder>
            </td>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={5} />
                <br />
                <Placeholder xs={5} />
              </Placeholder>
            </td>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={4} />
              </Placeholder>
            </td>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={3} />
              </Placeholder>
            </td>
            <td>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={4} />
              </Placeholder>
            </td>
            <td className="text-end">
              <Placeholder.Button variant="secondary" xs={4} aria-hidden="true" />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function PlanHistoryModal({ plan, show, onHide }: { plan: MembershipPlan | null; show: boolean; onHide: () => void }) {
  const historyFn = useCallback(
    () => (plan ? membershipCampaignApi.getPlanHistory(plan.id) : Promise.resolve([] as MembershipPlanHistoryEntry[])),
    [plan],
  )
  const { data, loading, error } = useApi(show && plan ? historyFn : null, [show, plan?.id])

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pricing and Change History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ApiErrorAlert error={error as ApiError | null} />
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table hover responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>Changed</th>
                <th>By</th>
                <th>Reason</th>
                <th>Effective</th>
                <th>Members Affected</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No history records found.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.changedAt).toLocaleString()}</td>
                    <td>{entry.changedBy}</td>
                    <td>{entry.reason || '-'}</td>
                    <td>{entry.effectiveDate ? new Date(entry.effectiveDate).toLocaleString() : 'Immediate'}</td>
                    <td>
                      <Badge bg={entry.existingMembersAffected ? 'warning' : 'success'}>{entry.existingMembersAffected ? 'Yes' : 'No'}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  )
}

function OverrideEditorModal({
  show,
  onHide,
  onSaved,
  plan,
}: {
  show: boolean
  onHide: () => void
  onSaved: () => void
  plan: MembershipPlan | null
}) {
  const [draft, setDraft] = useState<Partial<MembershipPlan>>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { mutate, loading } = useApiMutation<MembershipPlan, void>()

  // Initialize draft when modal opens
  useCallback(() => {
    if (show && plan) {
      setDraft({
        offerPrice: plan.offerPrice ?? null,
        maxCoveredPets: plan.maxCoveredPets ?? null,
        validityMonths: plan.validityMonths ?? null,
        benefitsSnapshot: plan.benefitsSnapshot ?? null,
      })
      setErrorMsg(null)
    }
  }, [show, plan])

  function setField<K extends keyof MembershipPlan>(field: K, value: any) {
    setDraft((curr) => ({ ...curr, [field]: value }))
  }

  async function handleSave() {
    if (!plan) return
    setErrorMsg(null)

    const payload = {
      offerPrice: draft.offerPrice,
      maxCoveredPets: draft.maxCoveredPets,
      validityMonths: draft.validityMonths,
      benefitsSnapshot: draft.benefitsSnapshot,
      changeReason: 'Admin updated plan overrides.',
    }

    const result = await mutate(() => membershipCampaignApi.updatePlan(plan.id, payload), undefined)
    if (result) onSaved()
  }

  if (!plan) return null
  const masterTier = plan.tier

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Edit Overrides for {plan.nameEn}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Alert variant="info" className="mb-4">
          <strong>Master Tier Context:</strong>
          <br />
          Regular Price: {masterTier?.regularPrice ?? plan.regularPriceSnapshot}
          <br />
          Max Pets: {masterTier?.maxPets ?? plan.maxPetsSnapshot}
          <br />
          Validity (Months): {masterTier?.validityMonths ?? plan.validityMonthsSnapshot}
        </Alert>

        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Promotional Price (Override)</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                value={draft.offerPrice ?? ''}
                onChange={(e) => setField('offerPrice', e.target.value ? Number(e.target.value) : null)}
                placeholder="Inherits from tier if empty"
              />
              <Button variant="outline-secondary" onClick={() => setField('offerPrice', null)}>
                Clear Override
              </Button>
            </div>
          </Col>

          <Col md={6}>
            <Form.Label>Maximum Pets (Override)</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                value={draft.maxCoveredPets ?? ''}
                onChange={(e) => setField('maxCoveredPets', e.target.value ? Number(e.target.value) : null)}
                placeholder="Inherits from tier if empty"
              />
              <Button variant="outline-secondary" onClick={() => setField('maxCoveredPets', null)}>
                Clear Override
              </Button>
            </div>
          </Col>

          <Col md={6}>
            <Form.Label>Validity Months (Override)</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                value={draft.validityMonths ?? ''}
                onChange={(e) => setField('validityMonths', e.target.value ? Number(e.target.value) : null)}
                placeholder="Inherits from tier if empty"
              />
              <Button variant="outline-secondary" onClick={() => setField('validityMonths', null)}>
                Clear Override
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Overrides'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default function MembershipPlansContent({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [historyPlan, setHistoryPlan] = useState<MembershipPlan | null>(null)

  const { mutate, loading: mutating, error: mutationError, clearError } = useApiMutation<any, void>()
  const { mutate: mutateSync, loading: syncing } = useApiMutation<{ syncedCount: number; totalPlans: number }, void>()

  const plansFn = useCallback(() => membershipCampaignApi.listPlans({ page, limit, campaignId }), [campaignId, page, limit])

  const { data, loading, error, refetch } = useApi(plansFn, [campaignId, page, limit])

  async function toggleActive(plan: MembershipPlan) {
    if (!window.confirm(`Are you sure you want to ${plan.isActive ? 'deactivate' : 'activate'} this plan?`)) return
    clearError()
    const result = await mutate(
      () =>
        membershipCampaignApi.updatePlan(plan.id, {
          isActive: !plan.isActive,
          changeReason: plan.isActive ? 'Admin deactivated plan.' : 'Admin reactivated plan.',
        }),
      undefined,
    )
    if (result) refetch()
  }

  async function resetToDefaults(plan: MembershipPlan) {
    if (!window.confirm('Are you sure you want to reset this plan to tier defaults? All overrides will be cleared.')) return
    clearError()
    const result = await mutate(
      () =>
        membershipCampaignApi.updatePlan(plan.id, {
          offerPrice: null,
          maxCoveredPets: null,
          validityMonths: null,
          benefitsSnapshot: null,
          changeReason: 'Admin reset plan to tier defaults.',
        }),
      undefined,
    )
    if (result) refetch()
  }

  async function handleSyncPlans() {
    clearError()
    const result = await mutateSync(() => membershipCampaignApi.syncPlans(campaignId), undefined)
    if (result) {
      refetch()
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Campaign Plans & Offers"
        breadcrumbs={[{ label: 'Membership Management' }, { label: 'Campaign Plans & Offers' }]}
        action={
          can('membership_plans:create') ? (
            <Button onClick={handleSyncPlans} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync Plans from Active Tiers'}
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />
      <ApiErrorAlert error={mutationError} onDismiss={clearError} />

      {!error && (
        <Card>
          <Card.Body>
            {loading ? (
              <SkeletonTable />
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-3">No campaign plans found.</p>
                {can('membership_plans:create') && (
                  <Button onClick={handleSyncPlans} disabled={syncing}>
                    {syncing ? 'Syncing...' : 'Sync Plans from Active Tiers'}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Display</th>
                      <th>Pricing</th>
                      <th>Pets</th>
                      <th>Validity</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((item) => {
                      const regular = item.regularPrice ?? item.regularPriceSnapshot ?? 0
                      const offer = item.offerPrice ?? item.campaignPrice ?? regular
                      const discount = Math.max(0, regular - offer)

                      const hasPriceOverride = item.offerPrice != null
                      const hasPetsOverride = item.maxCoveredPets != null && item.maxCoveredPets !== item.maxPetsSnapshot
                      const hasValidityOverride = item.validityMonths != null

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-semibold">{item.code}</div>
                            <div className="small text-muted">{item.tier?.nameEn ?? 'Master Tier'}</div>
                          </td>
                          <td>
                            <div>{item.nameEn}</div>
                            {item.nameBn && <div className="small text-muted">{item.nameBn}</div>}
                          </td>
                          <td>
                            <div>Regular: BDT {regular.toLocaleString()}</div>
                            <div className="small text-success">Campaign: BDT {offer.toLocaleString()}</div>
                            <div className="small text-muted">Discount: BDT {discount.toLocaleString()}</div>
                            {hasPriceOverride ? (
                              <Badge bg="primary" className="mt-1">
                                Overridden
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="mt-1">
                                Inherited
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div>Included: {item.includedPetsSnapshot}</div>
                            <div>Max: {item.maxCoveredPets ?? item.maxPetsSnapshot}</div>
                            {hasPetsOverride ? (
                              <Badge bg="primary" className="mt-1">
                                Overridden
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="mt-1">
                                Inherited
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div>{item.validityMonths ?? item.validityMonthsSnapshot} months</div>
                            {hasValidityOverride ? (
                              <Badge bg="primary" className="mt-1">
                                Overridden
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="mt-1">
                                Inherited
                              </Badge>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} />
                            <div className="small text-muted mt-1">
                              Updated:
                              <br />
                              {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="d-flex flex-column gap-2 align-items-end">
                              {can('membership_plans:update') && (
                                <>
                                  <Button size="sm" variant="soft-primary" onClick={() => setEditingPlan(item)}>
                                    Edit Overrides
                                  </Button>
                                  <Button size="sm" variant="outline-warning" onClick={() => resetToDefaults(item)} disabled={mutating}>
                                    Reset to Defaults
                                  </Button>
                                  <Button size="sm" variant="outline-secondary" onClick={() => toggleActive(item)} disabled={mutating}>
                                    {item.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </>
                              )}
                              {can('membership_plans:read') && (
                                <Button size="sm" variant="outline-info" onClick={() => setHistoryPlan(item)}>
                                  History
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
              </>
            )}
          </Card.Body>
        </Card>
      )}

      <OverrideEditorModal
        show={Boolean(editingPlan)}
        onHide={() => setEditingPlan(null)}
        onSaved={() => {
          setEditingPlan(null)
          refetch()
        }}
        plan={editingPlan}
      />
      <PlanHistoryModal plan={historyPlan} show={Boolean(historyPlan)} onHide={() => setHistoryPlan(null)} />
    </div>
  )
}
