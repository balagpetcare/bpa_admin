'use client'

import { useCallback, useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { fetchAllPages } from '@/utils/pagination'
import { Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi, type MembershipCampaign, type MembershipDocumentItem, type MembershipMediaItem } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'

function MediaEditor({ show, onHide, item, campaigns, onSaved }: { show: boolean; onHide: () => void; item?: MembershipMediaItem | null; campaigns: MembershipCampaign[]; onSaved: () => void }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => { setForm({ campaignId: item?.campaignId ?? campaigns[0]?.id ?? '', mediaFileId: item?.mediaFileId ?? null, titleEn: item?.titleEn ?? '', titleBn: item?.titleBn ?? '', altText: item?.altText ?? '', role: item?.role ?? 'gallery', sortOrder: item?.sortOrder ?? 0, isActive: item?.isActive ?? true, previewUrl: item?.mediaFile?.url ?? null, previewMimeType: item?.mediaFile?.mimeType ?? null }) }, [item, show, campaigns])
  async function save() {
    const payload = { campaignId: form.campaignId, mediaFileId: form.mediaFileId, titleEn: form.titleEn || null, titleBn: form.titleBn || null, altText: form.altText || null, role: form.role, sortOrder: Number(form.sortOrder || 0), isActive: !!form.isActive }
    if (item) await membershipCampaignApi.updateMedia(item.id, payload)
    else await membershipCampaignApi.createMedia(payload)
    onSaved()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg"><Modal.Header closeButton><Modal.Title>{item ? 'Edit Media' : 'Add Media'}</Modal.Title></Modal.Header><Modal.Body><Row className="g-3"><Col md={6}><Form.Label>Campaign</Form.Label><Form.Select value={form.campaignId ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, campaignId: e.target.value }))}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.titleEn}</option>)}</Form.Select></Col><Col md={6}><Form.Label>Role</Form.Label><Form.Select value={form.role ?? 'gallery'} onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))}><option value="gallery">Gallery</option><option value="hero">Hero</option><option value="mobile_banner">Mobile Banner</option><option value="thumbnail">Thumbnail</option><option value="video_poster">Video</option></Form.Select></Col><Col md={12}><MediaPickerInput value={form.mediaFileId} previewUrl={form.previewUrl} previewMimeType={form.previewMimeType} onChange={(fileId, file) => setForm((s: any) => ({ ...s, mediaFileId: fileId, previewUrl: file?.url ?? null, previewMimeType: file?.mimeType ?? null }))} label="Media File" /></Col><Col md={4}><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} /></Col><Col md={4}><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} /></Col><Col md={4}><Form.Label>Alt Text</Form.Label><Form.Control value={form.altText ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, altText: e.target.value }))} /></Col><Col md={6}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col><Col md={6}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col></Row></Modal.Body><Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={save} disabled={!form.mediaFileId}>Save</Button></Modal.Footer></Modal>
  )
}

function DocumentEditor({ show, onHide, item, campaigns, onSaved }: { show: boolean; onHide: () => void; item?: MembershipDocumentItem | null; campaigns: MembershipCampaign[]; onSaved: () => void }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => { setForm({ campaignId: item?.campaignId ?? campaigns[0]?.id ?? '', mediaFileId: item?.mediaFileId ?? null, documentType: item?.documentType ?? 'document', code: item?.code ?? '', titleEn: item?.titleEn ?? '', titleBn: item?.titleBn ?? '', descriptionEn: item?.descriptionEn ?? '', descriptionBn: item?.descriptionBn ?? '', fileUrl: item?.fileUrl ?? '', sortOrder: item?.sortOrder ?? 0, isActive: item?.isActive ?? true, previewUrl: item?.mediaFile?.url ?? null, previewMimeType: item?.mediaFile?.mimeType ?? null }) }, [item, show, campaigns])
  async function save() {
    const payload = { campaignId: form.campaignId, mediaFileId: form.mediaFileId || null, documentType: form.documentType, code: form.code || null, titleEn: form.titleEn, titleBn: form.titleBn || null, descriptionEn: form.descriptionEn || null, descriptionBn: form.descriptionBn || null, fileUrl: form.fileUrl || null, sortOrder: Number(form.sortOrder || 0), isActive: !!form.isActive }
    if (item) await membershipCampaignApi.updateDocument(item.id, payload)
    else await membershipCampaignApi.createDocument(payload)
    onSaved()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg"><Modal.Header closeButton><Modal.Title>{item ? 'Edit Document' : 'Add Document'}</Modal.Title></Modal.Header><Modal.Body><Row className="g-3"><Col md={6}><Form.Label>Campaign</Form.Label><Form.Select value={form.campaignId ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, campaignId: e.target.value }))}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.titleEn}</option>)}</Form.Select></Col><Col md={6}><Form.Label>Document Type</Form.Label><Form.Control value={form.documentType ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, documentType: e.target.value }))} /></Col><Col md={12}><MediaPickerInput value={form.mediaFileId} previewUrl={form.previewUrl} previewMimeType={form.previewMimeType} onChange={(fileId, file) => setForm((s: any) => ({ ...s, mediaFileId: fileId, previewUrl: file?.url ?? null, previewMimeType: file?.mimeType ?? null }))} label="Document File" emptyLabel="Select document" mimeTypePrefix="application/" /></Col><Col md={4}><Form.Label>Code</Form.Label><Form.Control value={form.code ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} /></Col><Col md={4}><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} /></Col><Col md={4}><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} /></Col><Col md={6}><Form.Label>Description (EN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionEn: e.target.value }))} /></Col><Col md={6}><Form.Label>Description (BN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionBn: e.target.value }))} /></Col><Col md={6}><Form.Label>External URL</Form.Label><Form.Control value={form.fileUrl ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, fileUrl: e.target.value }))} /></Col><Col md={3}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col><Col md={3}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col></Row></Modal.Body><Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={save}>Save</Button></Modal.Footer></Modal>
  )
}

export default function MembershipMediaDocumentsContent() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { can } = usePermission()
  const [editingMedia, setEditingMedia] = useState<MembershipMediaItem | null | undefined>(undefined)
  const [editingDocument, setEditingDocument] = useState<MembershipDocumentItem | null | undefined>(undefined)
  const mediaFn = useCallback(() => membershipCampaignApi.listMedia({ page, limit }), [page, limit])
  const documentsFn = useCallback(() => membershipCampaignApi.listDocuments({ page, limit }), [page, limit])
  const campaignsFn = useCallback(() => fetchAllPages<any>((p, l) => membershipCampaignApi.listCampaigns({ page: p, limit: l })).then(d => ({ data: d })), [page, limit])
  const { data: mediaData, loading: mediaLoading, error: mediaError, refetch: refetchMedia } = useApi(mediaFn, [])
  const { data: documentsData, loading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useApi(documentsFn, [])
  const { data: campaignsData } = useApi(campaignsFn, [])
  const campaigns = campaignsData?.data ?? []
  return (
    <div className="container-fluid">
      <PageHeader title="Media & Documents" breadcrumbs={[{ label: 'Membership Management' }, { label: 'Media & Documents' }]} />
      <ApiErrorAlert error={(mediaError || documentsError) as ApiError | null} />
      <Row className="g-3">
        <Col lg={6}>
          <Card><Card.Header className="d-flex justify-content-between align-items-center"><h5 className="mb-0">Media</h5>{can('membership_media:create') && <Button size="sm" onClick={() => setEditingMedia(null)}>Add Media</Button>}</Card.Header><Card.Body><LoadingOverlay loading={mediaLoading}><Table hover className="align-middle"><thead><tr><th>Campaign</th><th>Role</th><th>File</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{mediaData?.data?.map((item) => <tr key={item.id}><td>{item.campaign?.titleEn ?? item.campaignId}</td><td>{item.role}</td><td>{item.mediaFile?.originalName ?? item.mediaFileId}</td><td><StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} /></td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_media:update') && <Button size="sm" variant="soft-primary" onClick={() => setEditingMedia(item)}>Edit</Button>}{can('membership_media:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this media item'))) return; await membershipCampaignApi.deleteMedia(item.id); refetchMedia() }}>Delete</Button>}</td></tr>)}</tbody></Table>
{mediaData?.meta && mediaData.meta.totalPages > 1 && <Pagination page={mediaData.meta.page} limit={mediaData.meta.limit} total={mediaData.meta.total} totalPages={mediaData.meta.totalPages} hasPrev={mediaData.meta.hasPrev} hasNext={mediaData.meta.hasNext} onPageChange={setPage} onLimitChange={setLimit} />}
</LoadingOverlay></Card.Body></Card>
        </Col>
        <Col lg={6}>
          <Card><Card.Header className="d-flex justify-content-between align-items-center"><h5 className="mb-0">Documents</h5>{can('membership_documents:create') && <Button size="sm" onClick={() => setEditingDocument(null)}>Add Document</Button>}</Card.Header><Card.Body><LoadingOverlay loading={documentsLoading}><Table hover className="align-middle"><thead><tr><th>Campaign</th><th>Type</th><th>Title</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{documentsData?.data?.map((item) => <tr key={item.id}><td>{item.campaign?.titleEn ?? item.campaignId}</td><td>{item.documentType}</td><td>{item.titleEn}</td><td><StatusBadge status={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} /></td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_documents:update') && <Button size="sm" variant="soft-primary" onClick={() => setEditingDocument(item)}>Edit</Button>}{can('membership_documents:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this document'))) return; await membershipCampaignApi.deleteDocument(item.id); refetchDocuments() }}>Delete</Button>}</td></tr>)}</tbody></Table></LoadingOverlay></Card.Body></Card>
        </Col>
      </Row>
      <MediaEditor show={editingMedia !== undefined} onHide={() => setEditingMedia(undefined)} item={editingMedia ?? null} campaigns={campaigns} onSaved={() => { setEditingMedia(undefined); refetchMedia() }} />
      <DocumentEditor show={editingDocument !== undefined} onHide={() => setEditingDocument(undefined)} item={editingDocument ?? null} campaigns={campaigns} onSaved={() => { setEditingDocument(undefined); refetchDocuments() }} />
    </div>
  )
}
