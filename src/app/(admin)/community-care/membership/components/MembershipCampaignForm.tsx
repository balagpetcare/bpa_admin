'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Col, Form, Modal, Row, Table, Alert } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { confirmDialog, confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { ApiError } from '@/lib/api'
import {
  membershipCampaignApi,
  type MembershipCampaign,
  type MembershipPlan,
  type MembershipBenefit,
  type MembershipFaqItem,
  type MembershipMediaItem,
  type MembershipDocumentItem,
} from '@/lib/api/membership-campaign.api'
import MembershipHtmlEditor from './MembershipHtmlEditor'

const schema = yup.object({
  slug: yup.string().required(),
  titleEn: yup.string().required(),
  titleBn: yup.string().required(),
  shortDescriptionEn: yup.string().nullable().default(''),
  shortDescriptionBn: yup.string().nullable().default(''),
  descriptionEn: yup.string().nullable().default(''),
  descriptionBn: yup.string().nullable().default(''),
  heroImageUrl: yup.string().nullable().default(''),
  mobileImageUrl: yup.string().nullable().default(''),
  thumbnailUrl: yup.string().nullable().default(''),
  status: yup.string().required(),
  offerStartAt: yup.string().nullable().default(''),
  offerEndAt: yup.string().nullable().default(''),
  applicationStartAt: yup.string().nullable().default(''),
  applicationEndAt: yup.string().nullable().default(''),
  publishedAt: yup.string().nullable().default(''),
  eligibilityContentEn: yup.string().nullable().default(''),
  eligibilityContentBn: yup.string().nullable().default(''),
  howItWorksContentEn: yup.string().nullable().default(''),
  howItWorksContentBn: yup.string().nullable().default(''),
  termsContentEn: yup.string().nullable().default(''),
  termsContentBn: yup.string().nullable().default(''),
  refundPolicyEn: yup.string().nullable().default(''),
  refundPolicyBn: yup.string().nullable().default(''),
  organizerNameEn: yup.string().nullable().default(''),
  organizerNameBn: yup.string().nullable().default(''),
  supportPhone: yup.string().nullable().default(''),
  supportEmail: yup.string().nullable().default(''),
  supportWhatsapp: yup.string().nullable().default(''),
  supportAddress: yup.string().nullable().default(''),
})

type FormValues = yup.InferType<typeof schema>

function asInputDateTime(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const tzOffset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tzOffset * 60000)
  return local.toISOString().slice(0, 16)
}

function asIso(value?: string | null) {
  return value ? new Date(value).toISOString() : null
}

function campaignDefaults(campaign?: MembershipCampaign | null): FormValues {
  return {
    slug: campaign?.slug ?? '',
    titleEn: campaign?.titleEn ?? '',
    titleBn: campaign?.titleBn ?? '',
    shortDescriptionEn: campaign?.shortDescriptionEn ?? '',
    shortDescriptionBn: campaign?.shortDescriptionBn ?? '',
    descriptionEn: campaign?.descriptionEn ?? '',
    descriptionBn: campaign?.descriptionBn ?? '',
    heroImageUrl: campaign?.heroImageUrl ?? '',
    mobileImageUrl: campaign?.mobileImageUrl ?? '',
    thumbnailUrl: campaign?.thumbnailUrl ?? '',
    status: campaign?.status ?? 'draft',
    offerStartAt: asInputDateTime(campaign?.offerStartAt),
    offerEndAt: asInputDateTime(campaign?.offerEndAt),
    applicationStartAt: asInputDateTime(campaign?.applicationStartAt),
    applicationEndAt: asInputDateTime(campaign?.applicationEndAt),
    publishedAt: asInputDateTime(campaign?.publishedAt),
    eligibilityContentEn: campaign?.eligibilityContentEn ?? '',
    eligibilityContentBn: campaign?.eligibilityContentBn ?? '',
    howItWorksContentEn: campaign?.howItWorksContentEn ?? '',
    howItWorksContentBn: campaign?.howItWorksContentBn ?? '',
    termsContentEn: campaign?.termsContentEn ?? '',
    termsContentBn: campaign?.termsContentBn ?? '',
    refundPolicyEn: campaign?.refundPolicyEn ?? '',
    refundPolicyBn: campaign?.refundPolicyBn ?? '',
    organizerNameEn: campaign?.organizerNameEn ?? '',
    organizerNameBn: campaign?.organizerNameBn ?? '',
    supportPhone: campaign?.supportPhone ?? '',
    supportEmail: campaign?.supportEmail ?? '',
    supportWhatsapp: campaign?.supportWhatsapp ?? '',
    supportAddress: campaign?.supportAddress ?? '',
  }
}

function RelationSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1">{title}</h5>
          <div className="text-muted small">{description}</div>
        </div>
        {action}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}

function PlanModal({
  show,
  onHide,
  onSave,
  plan,
  campaignId,
}: {
  show: boolean
  onHide: () => void
  onSave: () => void
  plan?: MembershipPlan | null
  campaignId: string
}) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      code: plan?.code ?? '',
      nameEn: plan?.nameEn ?? '',
      nameBn: plan?.nameBn ?? '',
      regularPrice: plan?.regularPrice ?? 0,
      offerPrice: plan?.offerPrice ?? '',
      maxCoveredPets: plan?.maxCoveredPets ?? 3,
      validityYears: plan?.validityYears ?? 1,
      validityMonths: plan?.validityMonths ?? '',
      maximumReplacementCount: plan?.maximumReplacementCount ?? 1,
      replacementRequiresApproval: plan?.replacementRequiresApproval ?? true,
      replacementFee: plan?.replacementFee ?? '',
      sortOrder: plan?.sortOrder ?? 0,
      isActive: plan?.isActive ?? true,
    })
  }, [plan, show])
  async function submit() {
    const payload = {
      campaignId,
      code: form.code,
      nameEn: form.nameEn,
      nameBn: form.nameBn,
      regularPrice: Number(form.regularPrice || 0),
      offerPrice: form.offerPrice === '' ? null : Number(form.offerPrice),
      maxCoveredPets: Number(form.maxCoveredPets || 0),
      validityYears: form.validityYears === '' ? null : Number(form.validityYears),
      validityMonths: form.validityMonths === '' ? null : Number(form.validityMonths),
      maximumReplacementCount: Number(form.maximumReplacementCount || 0),
      replacementRequiresApproval: Boolean(form.replacementRequiresApproval),
      replacementFee: form.replacementFee === '' ? null : Number(form.replacementFee),
      sortOrder: Number(form.sortOrder || 0),
      isActive: Boolean(form.isActive),
    }
    if (plan) await membershipCampaignApi.updatePlan(plan.id, payload)
    else await membershipCampaignApi.createPlan(payload)
    onSave()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{plan ? 'Edit Plan' : 'Add Plan'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="small">
          Changing a plan’s maximum pet count must not retroactively change existing membership snapshots. Existing active members retain their stored entitlement unless an approved migration is performed.
        </Alert>
        <Row className="g-3">
          {[
            ['code', 'Plan Code'], ['nameEn', 'Name (EN)'], ['nameBn', 'Name (BN)'],
            ['regularPrice', 'Regular Price'], ['offerPrice', 'Offer Price'],
            ['maxCoveredPets', 'Maximum Covered Pets'], ['validityYears', 'Validity Years'], ['validityMonths', 'Validity Months'],
            ['maximumReplacementCount', 'Replacement Limit'], ['replacementFee', 'Replacement Fee'], ['sortOrder', 'Sort Order'],
          ].map(([key, label]) => (
            <Col md={key.includes('name') ? 6 : 4} key={key}>
              <Form.Group>
                <Form.Label>{label}</Form.Label>
                <Form.Control value={form[key] ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, [key]: e.target.value }))} />
              </Form.Group>
            </Col>
          ))}
          <Col md={6}><Form.Check type="switch" label="Replacement Requires Approval" checked={!!form.replacementRequiresApproval} onChange={(e) => setForm((s: any) => ({ ...s, replacementRequiresApproval: e.target.checked }))} /></Col>
          <Col md={6}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={submit}>Save</Button></Modal.Footer>
    </Modal>
  )
}

function BenefitModal({ show, onHide, onSave, benefit, campaignId, plans }: { show: boolean; onHide: () => void; onSave: () => void; benefit?: MembershipBenefit | null; campaignId: string; plans: MembershipPlan[] }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      code: benefit?.code ?? '',
      titleEn: benefit?.titleEn ?? '',
      titleBn: benefit?.titleBn ?? '',
      descriptionEn: benefit?.descriptionEn ?? '',
      descriptionBn: benefit?.descriptionBn ?? '',
      icon: benefit?.icon ?? '',
      sortOrder: benefit?.sortOrder ?? 0,
      isActive: benefit?.isActive ?? true,
      planIds: benefit?.plans?.map((p) => p.planId) ?? [],
    })
  }, [benefit, show])
  async function submit() {
    const payload = { ...form, campaignId, sortOrder: Number(form.sortOrder || 0), planIds: form.planIds }
    if (benefit) await membershipCampaignApi.updateBenefit(benefit.id, payload)
    else await membershipCampaignApi.createBenefit(payload)
    onSave()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{benefit ? 'Edit Benefit' : 'Add Benefit'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}><Form.Label>Code</Form.Label><Form.Control value={form.code ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Icon</Form.Label><Form.Control value={form.icon ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, icon: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Description (EN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Description (BN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? 0} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col>
          <Col md={6}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
          <Col md={12}>
            <Form.Label>Plans</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {plans.map((plan) => (
                <Form.Check
                  key={plan.id}
                  type="checkbox"
                  label={`${plan.code} · ${plan.nameEn}`}
                  checked={form.planIds?.includes(plan.id)}
                  onChange={(e) => setForm((s: any) => ({
                    ...s,
                    planIds: e.target.checked ? [...(s.planIds ?? []), plan.id] : (s.planIds ?? []).filter((id: string) => id !== plan.id),
                  }))}
                />
              ))}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={submit}>Save</Button></Modal.Footer>
    </Modal>
  )
}

function FaqModal({ show, onHide, onSave, item, campaignId }: { show: boolean; onHide: () => void; onSave: () => void; item?: MembershipFaqItem | null; campaignId: string }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      questionEn: item?.questionEn ?? '',
      questionBn: item?.questionBn ?? '',
      answerEn: item?.answerEn ?? '',
      answerBn: item?.answerBn ?? '',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
    })
  }, [item, show])
  async function submit() {
    const payload = { ...form, campaignId, sortOrder: Number(form.sortOrder || 0) }
    if (item) await membershipCampaignApi.updateFaq(item.id, payload)
    else await membershipCampaignApi.createFaq(payload)
    onSave()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{item ? 'Edit FAQ' : 'Add FAQ'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={6}><Form.Label>Question (EN)</Form.Label><Form.Control as="textarea" rows={2} value={form.questionEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, questionEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Question (BN)</Form.Label><Form.Control as="textarea" rows={2} value={form.questionBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, questionBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Answer (EN)</Form.Label><Form.Control as="textarea" rows={4} value={form.answerEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, answerEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Answer (BN)</Form.Label><Form.Control as="textarea" rows={4} value={form.answerBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, answerBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? 0} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col>
          <Col md={6}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={submit}>Save</Button></Modal.Footer>
    </Modal>
  )
}

function MediaModal({ show, onHide, onSave, item, campaignId }: { show: boolean; onHide: () => void; onSave: () => void; item?: MembershipMediaItem | null; campaignId: string }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      mediaFileId: item?.mediaFileId ?? null,
      titleEn: item?.titleEn ?? '',
      titleBn: item?.titleBn ?? '',
      altText: item?.altText ?? '',
      role: item?.role ?? 'gallery',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
      previewUrl: item?.mediaFile?.url ?? null,
      previewMimeType: item?.mediaFile?.mimeType ?? null,
    })
  }, [item, show])
  async function submit() {
    const payload = { campaignId, mediaFileId: form.mediaFileId, titleEn: form.titleEn, titleBn: form.titleBn, altText: form.altText, role: form.role, sortOrder: Number(form.sortOrder || 0), isActive: !!form.isActive }
    if (item) await membershipCampaignApi.updateMedia(item.id, payload)
    else await membershipCampaignApi.createMedia(payload)
    onSave()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{item ? 'Edit Media' : 'Add Media'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <MediaPickerInput
              value={form.mediaFileId}
              previewUrl={form.previewUrl}
              previewMimeType={form.previewMimeType}
              onChange={(fileId, file) => setForm((s: any) => ({ ...s, mediaFileId: fileId, previewUrl: file?.url ?? null, previewMimeType: file?.mimeType ?? null }))}
              label="Media File"
              mimeTypePrefix={form.role === 'video_poster' ? 'video/' : undefined}
            />
          </Col>
          <Col md={4}><Form.Label>Role</Form.Label><Form.Select value={form.role} onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))}><option value="gallery">Gallery</option><option value="hero">Hero</option><option value="mobile_banner">Mobile Banner</option><option value="thumbnail">Thumbnail</option><option value="video_poster">Video</option></Form.Select></Col>
          <Col md={4}><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Alt Text</Form.Label><Form.Control value={form.altText ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, altText: e.target.value }))} /></Col>
          <Col md={3}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? 0} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col>
          <Col md={3}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={submit} disabled={!form.mediaFileId}>Save</Button></Modal.Footer>
    </Modal>
  )
}

function DocumentModal({ show, onHide, onSave, item, campaignId }: { show: boolean; onHide: () => void; onSave: () => void; item?: MembershipDocumentItem | null; campaignId: string }) {
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      mediaFileId: item?.mediaFileId ?? null,
      documentType: item?.documentType ?? 'document',
      code: item?.code ?? '',
      titleEn: item?.titleEn ?? '',
      titleBn: item?.titleBn ?? '',
      descriptionEn: item?.descriptionEn ?? '',
      descriptionBn: item?.descriptionBn ?? '',
      fileUrl: item?.fileUrl ?? '',
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
      previewUrl: item?.mediaFile?.url ?? null,
      previewMimeType: item?.mediaFile?.mimeType ?? null,
    })
  }, [item, show])
  async function submit() {
    const payload = {
      campaignId,
      mediaFileId: form.mediaFileId || null,
      documentType: form.documentType,
      code: form.code || null,
      titleEn: form.titleEn,
      titleBn: form.titleBn || null,
      descriptionEn: form.descriptionEn || null,
      descriptionBn: form.descriptionBn || null,
      fileUrl: form.fileUrl || null,
      sortOrder: Number(form.sortOrder || 0),
      isActive: !!form.isActive,
    }
    if (item) await membershipCampaignApi.updateDocument(item.id, payload)
    else await membershipCampaignApi.createDocument(payload)
    onSave()
  }
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton><Modal.Title>{item ? 'Edit Document' : 'Add Document'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <MediaPickerInput
              value={form.mediaFileId}
              previewUrl={form.previewUrl}
              previewMimeType={form.previewMimeType}
              onChange={(fileId, file) => setForm((s: any) => ({ ...s, mediaFileId: fileId, previewUrl: file?.url ?? null, previewMimeType: file?.mimeType ?? null }))}
              label="Library Document"
              mimeTypePrefix="application/"
              emptyLabel="Select document"
            />
          </Col>
          <Col md={4}><Form.Label>Document Type</Form.Label><Form.Control value={form.documentType ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, documentType: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Code</Form.Label><Form.Control value={form.code ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} /></Col>
          <Col md={4}><Form.Label>Sort Order</Form.Label><Form.Control value={form.sortOrder ?? 0} onChange={(e) => setForm((s: any) => ({ ...s, sortOrder: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Title (EN)</Form.Label><Form.Control value={form.titleEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Title (BN)</Form.Label><Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, titleBn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Description (EN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionEn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionEn: e.target.value }))} /></Col>
          <Col md={6}><Form.Label>Description (BN)</Form.Label><Form.Control as="textarea" rows={3} value={form.descriptionBn ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, descriptionBn: e.target.value }))} /></Col>
          <Col md={8}><Form.Label>External File URL</Form.Label><Form.Control value={form.fileUrl ?? ''} onChange={(e) => setForm((s: any) => ({ ...s, fileUrl: e.target.value }))} /></Col>
          <Col md={4}><Form.Check type="switch" label="Active" checked={!!form.isActive} onChange={(e) => setForm((s: any) => ({ ...s, isActive: e.target.checked }))} /></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide}>Cancel</Button><Button onClick={submit}>Save</Button></Modal.Footer>
    </Modal>
  )
}

export default function MembershipCampaignForm({ campaignId }: { campaignId?: string }) {
  const router = useRouter()
  const isEdit = Boolean(campaignId)
  const { can, isSuperAdmin } = usePermission()
  const [mutationError, setMutationError] = useState<ApiError | null>(null)
  const [planModal, setPlanModal] = useState<MembershipPlan | null | undefined>(undefined)
  const [benefitModal, setBenefitModal] = useState<MembershipBenefit | null | undefined>(undefined)
  const [faqModal, setFaqModal] = useState<MembershipFaqItem | null | undefined>(undefined)
  const [mediaModal, setMediaModal] = useState<MembershipMediaItem | null | undefined>(undefined)
  const [documentModal, setDocumentModal] = useState<MembershipDocumentItem | null | undefined>(undefined)

  const { data: campaign, loading, error, refetch } = useApi(
    campaignId ? () => membershipCampaignApi.getCampaign(campaignId) : null,
    [campaignId],
  )

  const { mutate, loading: saving } = useApiMutation<MembershipCampaign, FormValues>()
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: campaignDefaults(),
  })

  useEffect(() => {
    if (campaign) reset(campaignDefaults(campaign))
  }, [campaign, reset])

  const plans = useMemo(() => campaign?.plans ?? [], [campaign])
  const benefits = useMemo(() => campaign?.benefits ?? [], [campaign])
  const faqs = useMemo(() => campaign?.faqs ?? [], [campaign])
  const mediaItems = useMemo(() => campaign?.mediaItems ?? [], [campaign])
  const documents = useMemo(() => campaign?.documents ?? [], [campaign])

  async function submit(values: FormValues) {
    const payload = {
      ...values,
      heroImageUrl: values.heroImageUrl || null,
      mobileImageUrl: values.mobileImageUrl || null,
      thumbnailUrl: values.thumbnailUrl || null,
      offerStartAt: asIso(values.offerStartAt),
      offerEndAt: asIso(values.offerEndAt),
      applicationStartAt: asIso(values.applicationStartAt),
      applicationEndAt: asIso(values.applicationEndAt),
      publishedAt: asIso(values.publishedAt),
      supportEmail: values.supportEmail || null,
      supportPhone: values.supportPhone || null,
      supportWhatsapp: values.supportWhatsapp || null,
      supportAddress: values.supportAddress || null,
      shortDescriptionEn: values.shortDescriptionEn || null,
      shortDescriptionBn: values.shortDescriptionBn || null,
      descriptionEn: values.descriptionEn || null,
      descriptionBn: values.descriptionBn || null,
      eligibilityContentEn: values.eligibilityContentEn || null,
      eligibilityContentBn: values.eligibilityContentBn || null,
      howItWorksContentEn: values.howItWorksContentEn || null,
      howItWorksContentBn: values.howItWorksContentBn || null,
      termsContentEn: values.termsContentEn || null,
      termsContentBn: values.termsContentBn || null,
      refundPolicyEn: values.refundPolicyEn || null,
      refundPolicyBn: values.refundPolicyBn || null,
      organizerNameEn: values.organizerNameEn || null,
      organizerNameBn: values.organizerNameBn || null,
    }
    const result = await mutate(async () => (
      campaignId
        ? membershipCampaignApi.updateCampaign(campaignId, payload as Partial<MembershipCampaign>)
        : membershipCampaignApi.createCampaign(payload as Partial<MembershipCampaign>)
    ), values)
    if (!result) return
    setMutationError(null)
    if (!campaignId) router.push(`/community-care/membership/campaigns/${result.id}/edit`)
    else refetch()
  }

  async function handleDelete() {
    if (!campaignId) return
    if (!(await confirmDelete('this campaign'))) return
    await membershipCampaignApi.deleteCampaign(campaignId)
    router.push('/community-care/membership/campaigns')
  }

  const status = watch('status')

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Membership Campaign' : 'Create Membership Campaign'}
        breadcrumbs={[
          { label: 'Membership Management' },
          { label: 'Membership Campaigns', href: '/community-care/membership/campaigns' },
          { label: isEdit ? (campaign?.titleEn ?? 'Edit') : 'Create' },
        ]}
        action={
          <div className="d-flex gap-2">
            {isEdit && can('membership_campaigns:delete') && (
              <Button variant="outline-danger" onClick={handleDelete}>
                <Icon icon="solar:trash-bin-trash-bold" className="me-1" />Delete
              </Button>
            )}
            <Button variant="light" onClick={() => router.push('/community-care/membership/campaigns')}>Back</Button>
          </div>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />
      <ApiErrorAlert error={mutationError} onDismiss={() => setMutationError(null)} />

      <LoadingOverlay loading={loading || saving}>
        <Form onSubmit={handleSubmit(submit)}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Campaign Basics</h5>
                <div className="text-muted small">English and Bangla content, pricing windows, publishing, and support information.</div>
              </div>
              <div className="d-flex gap-2">
                {can('membership_campaigns:update') && <Button type="submit">Save Campaign</Button>}
                {isEdit && can('membership_campaigns:update') && status !== 'published' && (
                  <Button type="button" variant="outline-success" onClick={async () => {
                    if (!(await confirmDialog({ title: 'Publish campaign?', text: 'This will make the campaign visible to the app when its windows are open.', confirmText: 'Publish', variant: 'warning' }))) return
                    setValue('status', 'published')
                    void handleSubmit(submit)()
                  }}>Publish</Button>
                )}
                {isEdit && can('membership_campaigns:update') && status === 'published' && (
                  <Button type="button" variant="outline-secondary" onClick={async () => {
                    if (!(await confirmDialog({ title: 'Unpublish campaign?', text: 'The campaign will no longer be publicly active.', confirmText: 'Unpublish', variant: 'warning' }))) return
                    setValue('status', 'draft')
                    void handleSubmit(submit)()
                  }}>Unpublish</Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}><Form.Label>Slug</Form.Label><Controller name="slug" control={control} render={({ field }) => <Form.Control {...field} isInvalid={!!errors.slug} />} /></Col>
                <Col md={4}><Form.Label>Status</Form.Label><Controller name="status" control={control} render={({ field }) => (
                  <Form.Select {...field}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="application_open">Application Open</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                )} /></Col>
                <Col md={4}><Form.Label>Publish At</Form.Label><Controller name="publishedAt" control={control} render={({ field }) => <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Form.Label>Title (EN)</Form.Label><Controller name="titleEn" control={control} render={({ field }) => <Form.Control {...field} isInvalid={!!errors.titleEn} />} /></Col>
                <Col md={6}><Form.Label>Title (BN)</Form.Label><Controller name="titleBn" control={control} render={({ field }) => <Form.Control {...field} isInvalid={!!errors.titleBn} />} /></Col>
                <Col md={6}><Form.Label>Short Description (EN)</Form.Label><Controller name="shortDescriptionEn" control={control} render={({ field }) => <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Form.Label>Short Description (BN)</Form.Label><Controller name="shortDescriptionBn" control={control} render={({ field }) => <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={12}><Form.Label>Full Description (EN)</Form.Label><Controller name="descriptionEn" control={control} render={({ field }) => <Form.Control as="textarea" rows={4} value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={12}><Form.Label>Full Description (BN)</Form.Label><Controller name="descriptionBn" control={control} render={({ field }) => <Form.Control as="textarea" rows={4} value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={4}>
                  <Controller name="heroImageUrl" control={control} render={({ field }) => (
                    <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Hero Image" emptyLabel="Select hero image" />
                  )} />
                </Col>
                <Col md={4}>
                  <Controller name="mobileImageUrl" control={control} render={({ field }) => (
                    <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Mobile Image" emptyLabel="Select mobile image" />
                  )} />
                </Col>
                <Col md={4}>
                  <Controller name="thumbnailUrl" control={control} render={({ field }) => (
                    <MediaPickerInput value={field.value} previewUrl={field.value} onChange={(_, file) => field.onChange(file?.url ?? '')} label="Thumbnail" emptyLabel="Select thumbnail" />
                  )} />
                </Col>
                <Col md={3}><Form.Label>Offer Start</Form.Label><Controller name="offerStartAt" control={control} render={({ field }) => <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={3}><Form.Label>Offer End</Form.Label><Controller name="offerEndAt" control={control} render={({ field }) => <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={3}><Form.Label>Application Start</Form.Label><Controller name="applicationStartAt" control={control} render={({ field }) => <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={3}><Form.Label>Application End</Form.Label><Controller name="applicationEndAt" control={control} render={({ field }) => <Form.Control type="datetime-local" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header><h5 className="mb-0">Policy & Informational Content</h5></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}><Controller name="eligibilityContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Eligibility (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="eligibilityContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Eligibility (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="howItWorksContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="How It Works (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="howItWorksContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="How It Works (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="termsContentEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Terms (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="termsContentBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Terms (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="refundPolicyEn" control={control} render={({ field }) => <MembershipHtmlEditor label="Refund Policy (EN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Controller name="refundPolicyBn" control={control} render={({ field }) => <MembershipHtmlEditor label="Refund Policy (BN)" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header><h5 className="mb-0">Organizer & Support</h5></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}><Form.Label>Organizer (EN)</Form.Label><Controller name="organizerNameEn" control={control} render={({ field }) => <Form.Control value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={6}><Form.Label>Organizer (BN)</Form.Label><Controller name="organizerNameBn" control={control} render={({ field }) => <Form.Control value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={4}><Form.Label>Support Phone</Form.Label><Controller name="supportPhone" control={control} render={({ field }) => <Form.Control value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={4}><Form.Label>Support Email</Form.Label><Controller name="supportEmail" control={control} render={({ field }) => <Form.Control type="email" value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={4}><Form.Label>Support WhatsApp</Form.Label><Controller name="supportWhatsapp" control={control} render={({ field }) => <Form.Control value={field.value ?? ''} onChange={field.onChange} />} /></Col>
                <Col md={12}><Form.Label>Support Address</Form.Label><Controller name="supportAddress" control={control} render={({ field }) => <Form.Control as="textarea" rows={2} value={field.value ?? ''} onChange={field.onChange} />} /></Col>
              </Row>
            </Card.Body>
          </Card>

          {isEdit && campaignId && (
            <>
              <RelationSection title="Plans & Pricing" description="Configure plan code, pricing, covered pet limit, validity, and replacement rules." action={can('membership_plans:create') ? <Button size="sm" onClick={() => setPlanModal(null)}><Icon icon="solar:add-circle-bold" className="me-1" />Add Plan</Button> : undefined}>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Code</th><th>Name</th><th>Regular</th><th>Offer</th><th>Pets</th><th>Validity</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                    <tbody>
                      {plans.map((plan) => (
                        <tr key={plan.id}>
                          <td>{plan.code}</td><td>{plan.nameEn}</td><td>{plan.regularPrice}</td><td>{plan.offerPrice ?? '-'}</td><td>{plan.maxCoveredPets}</td><td>{plan.validityYears ? `${plan.validityYears} year(s)` : `${plan.validityMonths} month(s)`}</td><td>{plan.isActive ? 'Active' : 'Inactive'}</td>
                          <td className="text-end d-flex gap-1 justify-content-end">
                            {can('membership_plans:update') && <Button size="sm" variant="soft-primary" onClick={() => setPlanModal(plan)}>Edit</Button>}
                            {can('membership_plans:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this plan'))) return; await membershipCampaignApi.deletePlan(plan.id); refetch() }}>Delete</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </RelationSection>

              <RelationSection title="Benefits" description="Attach bilingual benefit content and map benefits to one or more plans." action={can('membership_benefits:create') ? <Button size="sm" onClick={() => setBenefitModal(null)}>Add Benefit</Button> : undefined}>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Title</th><th>Code</th><th>Plans</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                    <tbody>{benefits.map((benefit) => (
                      <tr key={benefit.id}><td>{benefit.titleEn}</td><td>{benefit.code ?? '-'}</td><td>{benefit.plans?.length ?? 0}</td><td>{benefit.isActive ? 'Active' : 'Inactive'}</td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_benefits:update') && <Button size="sm" variant="soft-primary" onClick={() => setBenefitModal(benefit)}>Edit</Button>}{can('membership_benefits:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this benefit'))) return; await membershipCampaignApi.deleteBenefit(benefit.id); refetch() }}>Delete</Button>}</td></tr>
                    ))}</tbody>
                  </Table>
                </div>
              </RelationSection>

              <RelationSection title="FAQs" description="Manage the campaign FAQ content in English and Bangla." action={can('membership_faqs:create') ? <Button size="sm" onClick={() => setFaqModal(null)}>Add FAQ</Button> : undefined}>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Question</th><th>Sort</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                    <tbody>{faqs.map((faq) => (
                      <tr key={faq.id}><td>{faq.questionEn}</td><td>{faq.sortOrder ?? 0}</td><td>{faq.isActive ? 'Active' : 'Inactive'}</td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_faqs:update') && <Button size="sm" variant="soft-primary" onClick={() => setFaqModal(faq)}>Edit</Button>}{can('membership_faqs:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this FAQ'))) return; await membershipCampaignApi.deleteFaq(faq.id); refetch() }}>Delete</Button>}</td></tr>
                    ))}</tbody>
                  </Table>
                </div>
              </RelationSection>

              <RelationSection title="Gallery & Videos" description="Hero image, mobile image, gallery, thumbnails, and video assets for the mobile campaign detail page." action={can('membership_media:create') ? <Button size="sm" onClick={() => setMediaModal(null)}>Add Media</Button> : undefined}>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Role</th><th>Title</th><th>File</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                    <tbody>{mediaItems.map((item) => (
                      <tr key={item.id}><td>{item.role}</td><td>{item.titleEn ?? '-'}</td><td>{item.mediaFile?.originalName ?? item.mediaFileId}</td><td>{item.isActive ? 'Active' : 'Inactive'}</td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_media:update') && <Button size="sm" variant="soft-primary" onClick={() => setMediaModal(item)}>Edit</Button>}{can('membership_media:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this media item'))) return; await membershipCampaignApi.deleteMedia(item.id); refetch() }}>Delete</Button>}</td></tr>
                    ))}</tbody>
                  </Table>
                </div>
              </RelationSection>

              <RelationSection title="Documents" description="Attach membership documents for viewers and downloads." action={can('membership_documents:create') ? <Button size="sm" onClick={() => setDocumentModal(null)}>Add Document</Button> : undefined}>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Type</th><th>Title</th><th>File</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                    <tbody>{documents.map((doc) => (
                      <tr key={doc.id}><td>{doc.documentType}</td><td>{doc.titleEn}</td><td>{doc.mediaFile?.originalName ?? doc.fileUrl ?? '-'}</td><td>{doc.isActive ? 'Active' : 'Inactive'}</td><td className="text-end d-flex gap-1 justify-content-end">{can('membership_documents:update') && <Button size="sm" variant="soft-primary" onClick={() => setDocumentModal(doc)}>Edit</Button>}{can('membership_documents:delete') && <Button size="sm" variant="soft-danger" onClick={async () => { if (!(await confirmDelete('this document'))) return; await membershipCampaignApi.deleteDocument(doc.id); refetch() }}>Delete</Button>}</td></tr>
                    ))}</tbody>
                  </Table>
                </div>
              </RelationSection>
            </>
          )}
        </Form>
      </LoadingOverlay>

      {campaignId && (
        <>
          <PlanModal show={planModal !== undefined} onHide={() => setPlanModal(undefined)} onSave={() => { setPlanModal(undefined); refetch() }} plan={planModal ?? null} campaignId={campaignId} />
          <BenefitModal show={benefitModal !== undefined} onHide={() => setBenefitModal(undefined)} onSave={() => { setBenefitModal(undefined); refetch() }} benefit={benefitModal ?? null} campaignId={campaignId} plans={plans} />
          <FaqModal show={faqModal !== undefined} onHide={() => setFaqModal(undefined)} onSave={() => { setFaqModal(undefined); refetch() }} item={faqModal ?? null} campaignId={campaignId} />
          <MediaModal show={mediaModal !== undefined} onHide={() => setMediaModal(undefined)} onSave={() => { setMediaModal(undefined); refetch() }} item={mediaModal ?? null} campaignId={campaignId} />
          <DocumentModal show={documentModal !== undefined} onHide={() => setDocumentModal(undefined)} onSave={() => { setDocumentModal(undefined); refetch() }} item={documentModal ?? null} campaignId={campaignId} />
        </>
      )}

      {isEdit && isSuperAdmin && (
        <Alert variant="secondary" className="mt-3">
          Admin correction capabilities should be restricted to the highest permission role. There is intentionally no normal covered-pet removal action anywhere in the membership management interface.
        </Alert>
      )}
    </div>
  )
}
