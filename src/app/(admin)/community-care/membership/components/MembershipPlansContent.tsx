'use client'

import { useCallback, useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Alert, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi, type MembershipPlan, type MembershipCampaign } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

function PlanEditor({ show, onHide, item, campaigns, onSaved }: { show: boolean; onHide: () => void; item?: MembershipPlan | null; campaigns: MembershipCampaign[]; onSaved: () => void }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      campaignId: item?.campaignId ?? campaigns[0]?.id ?? '',
      code: item?.code ?? '',
      nameEn: item?.nameEn ?? '',
      nameBn: item?.nameBn ?? '',
      regularPrice: item?.regularPrice ?? 0,
      offerPrice: item?.offerPrice ?? '',
      maxCoveredPets: item?.maxCoveredPets ?? 3,
      validityYears: item?.validityYears ?? 1,
      validityMonths: item?.validityMonths ?? '',
      maximumReplacementCount: item?.maximumReplacementCount ?? 1,
      replacementRequiresApproval: item?.replacementRequiresApproval ?? true,
      replacementFee: item?.replacementFee ?? '',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
    })
  }, [item, show, campaigns])
  async function save() {
    const payload = { ...form, regularPrice: Number(form.regularPrice), offerPrice: form.offerPrice === '' ? null : Number(form.offerPrice), maxCoveredPets: Number(form.maxCoveredPets), validityYears: form.validityYears === '' ? null : Number(form.validityYears), validityMonths: form.validityMonths === '' ? null : Number(form.validityMonths), maximumReplacementCount: Number(form.maximumReplacementCount), replacementFee: form.replacementFee === '' ? null : Number(form.replacementFee), sortOrder: Number(form.sortOrder), isActive: !!form.isActive, replacementRequiresApproval: !!form.replacementRequiresApproval }
    if (item) await membershipCampaignApi.updatePlan(item.id, payload)
    else await membershipCampaignApi.createPlan(payload)
    onSaved()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{item ? 'Edit Plan' : 'Create Plan'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="small mb-3">
          Changing a plan’s maximum pet count must not retroactively change existing membership snapshots. Existing active members retain their stored entitlement unless an approved migration is performed.
        </Alert>
        <Row className="g-3">
          <Col md={6}><Form.Label>Campaign</Form.Label><Form.Select value={form.campaignId ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, campaignId: e.target.value }))}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.titleEn}</option>)}</Form.Select></Col>
          <Col md={6}><Form.Label>Plan Code</Form.Label><Form.Control value={form.code ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Name (EN)</Form.Label><Form.Control value={form.nameEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, nameEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Name (BN)</Form.Label><Form.Control value={form.nameBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, nameBn: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Regular Price</Form.Label><Form.Control value={form.regularPrice ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, regularPrice: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Offer Price</Form.Label><Form.Control value={form.offerPrice ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, offerPrice: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Maximum Covered Pets</Form.Label><Form.Control value={form.maxCoveredPets ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, maxCoveredPets: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Validity Years</Form.Label><Form.Control value={form.validityYears ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, validityYears: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Validity Months</Form.Label><Form.Control value={form.validityMonths ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, validityMonths: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Replacement Limit</Form.Label><Form.Control value={form.maximumReplacementCount ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, maximumReplacementCount: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Replacement Fee</Form.Label><Form.Control value={form.replacementFee ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, replacementFee: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col>
          <Col md={4}><Form.Check type="switch" label="Replacement Requires Approval" checked={!!form.replacementRequiresApproval} onChange={(e) => setForm((s: any) => ({ ...s, replacementRequiresApproval: e.target.checked }))} /></Col>
          <Col md={4}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={save}>Save</Button></Modal.Footer>
    </Modal>
  )
}

export default function MembershipPlansContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { can } = usePermission()
  const [editing, setEditing] = useState<MembershipPlan | null | undefined>(undefined)
  const plansFn = useCallback(() => membershipCampaignApi.listPlans({ page, limit }), [page, limit])
  const campaignsFn = useCallback(() => fetchAllPages<any>((p, l) => membershipCampaignApi.listCampaigns({ page: p, limit: l })).then(d => ({ data: d })), [page, limit])
  const { data, loading, error, refetch } = useApi(plansFn, [])
  const { data: campaignsData } = useApi(campaignsFn, [])
  const campaigns = campaignsData?.data ?? []

  return (
    <div className="container-fluid">
      <PageHeader title="Plans & Pricing" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Plans & Pricing' }]} action={can('membership_plans:create') ? <Button onClick={() => setEditing(null)}>Add Plan</Button> : undefined} />
      <Alert variant="warning" className="small">Changing a plan’s maximum pet count must not retroactively change existing membership snapshots. Existing active members retain their stored entitlement unless an approved migration is performed.</Alert>
      <ApiErrorAlert error={error as ApiError | null} />
      <Card><Card.Body><LoadingOverlay loading={loading}><Table hover className="align-middle"><thead><tr><th>Campaign</th><th>Code</th><th>Name</th><th>Prices</th><th>Pets</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{data?.data?.map((item) => <tr key={item.id}><td>{item.campaign?.titleEn ?? item.campaignId}</td><td>{item.code}</td><td>{item.nameEn}</td><td><div>Regular: {item.regularPrice}</div><div className="small text-muted">Offer: {item.offerPrice ?? '-'}</div></td><td>{item.maxCoveredPets}</td><td><StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} /></td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_plans:update') && <Button size="sm" variant="soft-primary" onClick={() => setEditing(item)}>Edit</Button>}{can('membership_plans:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this plan'))) return; await membershipCampaignApi.deletePlan(item.id); refetch() }}>Delete</Button>}</td></tr>)}</tbody></Table>
{data?.meta && data.meta.totalPages > 1 && <Pagination page={data.meta.page} limit={data.meta.limit} total={data.meta.total} totalPages={data.meta.totalPages} hasPrev={data.meta.hasPrev} hasNext={data.meta.hasNext} onPageChange={setPage} onLimitChange={setLimit} />}
</LoadingOverlay></Card.Body></Card>
      <PlanEditor show={editing !== undefined} onHide={() => setEditing(undefined)} item={editing ?? null} campaigns={campaigns} onSaved={() => { setEditing(undefined); refetch() }} />
    </div>
  )
}
