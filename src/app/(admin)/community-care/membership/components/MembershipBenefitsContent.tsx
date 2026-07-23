'use client'

import { useCallback, useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi, type MembershipBenefit, type MembershipCampaign, type MembershipPlan } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

function BenefitEditor({
  show,
  onHide,
  item,
  campaigns,
  plans,
  onSaved,
}: {
  show: boolean
  onHide: () => void
  item?: MembershipBenefit | null
  campaigns: MembershipCampaign[]
  plans: MembershipPlan[]
  onSaved: () => void
}) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      campaignId: item?.campaignId ?? campaigns[0]?.id ?? '',
      code: item?.code ?? '',
      titleEn: item?.titleEn ?? '',
      titleBn: item?.titleBn ?? '',
      descriptionEn: item?.descriptionEn ?? '',
      descriptionBn: item?.descriptionBn ?? '',
      icon: item?.icon ?? '',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
      planIds: item?.plans?.map((p) => p.planId) ?? [],
    })
  }, [item, show, campaigns])
  async function save() {
    const payload = { ...form, sortOrder: Number(form.sortOrder || 0), isActive: !!form.isActive }
    if (item) await membershipCampaignApi.updateBenefit(item.id, payload)
    else await membershipCampaignApi.createBenefit(payload)
    onSaved()
  }
  const filteredPlans = plans.filter((plan) => plan.campaignId === form.campaignId)
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{item ? 'Edit Benefit' : 'Add Benefit'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Campaign</Form.Label>
            <Form.Select value={form.campaignId ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, campaignId: e.target.value, planIds: [] }))}>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.titleEn}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Code</Form.Label>
            <Form.Control value={form.code ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} />
          </Col>
          <Col md={6}>
            <Form.Label>Title (EN)</Form.Label>
            <Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} />
          </Col>
          <Col md={6}>
            <Form.Label>Title (BN)</Form.Label>
            <Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} />
          </Col>
          <Col md={6}>
            <Form.Label>Description (EN)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.descriptionEn ?? ''}
              onChange={(e) => setForm((s: any) => ({ ...s, descriptionEn: e.target.value }))}
            />
          </Col>
          <Col md={6}>
            <Form.Label>Description (BN)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.descriptionBn ?? ''}
              onChange={(e) => setForm((s: any) => ({ ...s, descriptionBn: e.target.value }))}
            />
          </Col>
          <Col md={4}>
            <Form.Label>Icon</Form.Label>
            <Form.Control value={form.icon ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, icon: e.target.value }))} />
          </Col>
          <Col md={4}>
            <Form.Label>Sort Order</Form.Label>
            <Form.Control value={form.sortOrder ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} />
          </Col>
          <Col md={4}>
            <Form.Check
              type="switch"
              label="Active"
              checked={!!form.isActive}
              onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))}
            />
          </Col>
          <Col md={12}>
            <Form.Label>Plans</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {filteredPlans.map((plan) => (
                <Form.Check
                  key={plan.id}
                  type="checkbox"
                  label={`${plan.code} · ${plan.nameEn}`}
                  checked={(form.planIds ?? []).includes(plan.id)}
                  onChange={(e) =>
                    setForm((s: any) => ({
                      ...s,
                      planIds: e.target.checked ? [...(s.planIds ?? []), plan.id] : (s.planIds ?? []).filter((id: string) => id !== plan.id),
                    }))
                  }
                />
              ))}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default function MembershipBenefitsContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { can } = usePermission()
  const [editing, setEditing] = useState<MembershipBenefit | null | undefined>(undefined)
  const benefitsFn = useCallback(() => membershipCampaignApi.listBenefits({ page, limit }), [page, limit])
  const campaignsFn = useCallback(
    () => fetchAllPages<any>((p, l) => membershipCampaignApi.listCampaigns({ page: p, limit: l })).then((d) => ({ data: d })),
    [page, limit],
  )
  const plansFn = useCallback(
    () => fetchAllPages<any>((p, l) => membershipCampaignApi.listPlans({ page: p, limit: l })).then((d) => ({ data: d })),
    [page, limit],
  )
  const { data, loading, error, refetch } = useApi(benefitsFn, [])
  const { data: campaignsData } = useApi(campaignsFn, [])
  const { data: plansData } = useApi(plansFn, [])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Benefits"
        breadcrumbs={[{ label: 'Membership Management' }, { label: 'Benefits' }]}
        action={can('membership_benefits:create') ? <Button onClick={() => setEditing(null)}>Add Benefit</Button> : undefined}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Title</th>
                  <th>Code</th>
                  <th>Plans</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.campaign?.titleEn ?? item.campaignId}</td>
                    <td>{item.titleEn}</td>
                    <td>{item.code ?? '-'}</td>
                    <td>{item.plans?.length ?? 0}</td>
                    <td>
                      <StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="text-end d-flex gap-1 justify-content-end">
                      {can('membership_benefits:update') && (
                        <Button size="sm" variant="soft-primary" onClick={() => setEditing(item)}>
                          Edit
                        </Button>
                      )}
                      {can('membership_benefits:delete') && (
                        <Button
                          size="sm"
                          variant="soft-danger"
                          onClick={async () => {
                            if (!(await confirmDelete('this benefit'))) return
                            await membershipCampaignApi.deleteBenefit(item.id)
                            refetch()
                          }}>
                          Delete
                        </Button>
                      )}
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
      <BenefitEditor
        show={editing !== undefined}
        onHide={() => setEditing(undefined)}
        item={editing ?? null}
        campaigns={campaignsData?.data ?? []}
        plans={plansData?.data ?? []}
        onSaved={() => {
          setEditing(undefined)
          refetch()
        }}
      />
    </div>
  )
}
