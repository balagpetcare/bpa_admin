'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { ApiError } from '@/lib/api'
import { membershipCampaignApi, type MembershipCampaign } from '@/lib/api/membership-campaign.api'

// Import wizard dependencies
import { useCampaignWizard } from './useCampaignWizard'
import { CampaignWizardFormValues } from './wizard.types'
import MembershipCampaignWizardHeader from './MembershipCampaignWizardHeader'
import MembershipCampaignWizardFooter from './MembershipCampaignWizardFooter'

// Import steps
import CampaignBasicsStep from './steps/CampaignBasicsStep'
import CampaignContentStep from './steps/CampaignContentStep'
import CampaignScheduleStep from './steps/CampaignScheduleStep'
import CampaignMediaStep from './steps/CampaignMediaStep'
import CampaignPolicyStep from './steps/CampaignPolicyStep'
import CampaignSupportStep from './steps/CampaignSupportStep'
import CampaignReviewStep from './steps/CampaignReviewStep'

function asIso(value?: string | null) {
  return value ? new Date(value).toISOString() : null
}

function WizardContent() {
  const { currentStepId } = useWizardContext()

  return (
    <div className="wizard-content">
      {currentStepId === 'basics' && <CampaignBasicsStep />}
      {currentStepId === 'content' && <CampaignContentStep />}
      {currentStepId === 'schedule' && <CampaignScheduleStep />}
      {currentStepId === 'media' && <CampaignMediaStep />}
      {currentStepId === 'policy' && <CampaignPolicyStep />}
      {currentStepId === 'support' && <CampaignSupportStep />}
      {currentStepId === 'review' && <CampaignReviewStep />}
    </div>
  )
}

function MembershipCampaignWizardInner({ campaign, campaignId, refetch }: { campaign?: MembershipCampaign | null; campaignId?: string; refetch: () => void }) {
  const router = useRouter()
  const { can } = usePermission()
  const wizard = useCampaignWizard(campaign)
  const [mutationError, setMutationError] = useState<ApiError | null>(null)
  
  const { mutate, loading: saving } = useApiMutation<MembershipCampaign, CampaignWizardFormValues>()
  const isEdit = Boolean(campaignId)

  async function submitForm(values: CampaignWizardFormValues, asDraft: boolean = false) {
    if (asDraft) {
      values.status = 'draft'
    }

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

    // Clear dirty state on save
    wizard.form.reset(values, { keepValues: true, keepDirty: false })
    
    if (!campaignId) {
      router.push(`/community-care/membership/campaigns/${result.id}/edit`)
    } else {
      refetch()
    }
  }

  async function handleSaveAsDraft() {
    const values = wizard.form.getValues()
    // Validation is skipped or reduced for draft? We still trigger basic validation.
    // Let's just submit with status draft.
    await submitForm(values, true)
  }

  async function handleComplete() {
    const isValid = await wizard.form.trigger()
    if (!isValid) return
    await submitForm(wizard.form.getValues(), false)
  }

  async function handleDelete() {
    if (!campaignId) return
    if (!(await confirmDelete('this campaign'))) return
    await membershipCampaignApi.deleteCampaign(campaignId)
    router.push('/community-care/membership/campaigns')
  }

  // To prevent the hook error, re-export useContext from the wizard.
  // Actually, we must import useWizardContext locally
  return (
    <wizard.Provider value={wizard}>
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

        <ApiErrorAlert error={mutationError} onDismiss={() => setMutationError(null)} />

        <LoadingOverlay loading={saving}>
          <MembershipCampaignWizardHeader />
          <WizardContent />
          <MembershipCampaignWizardFooter 
            onSaveAsDraft={handleSaveAsDraft}
            onSubmit={handleComplete}
            isSaving={saving}
          />
        </LoadingOverlay>
      </div>
    </wizard.Provider>
  )
}

// Needed because useWizardContext must be used inside Provider
import { useWizardContext } from './useCampaignWizard'

export default function MembershipCampaignWizard({ campaignId }: { campaignId?: string }) {
  const { data: campaign, loading, error, refetch } = useApi(
    campaignId ? () => membershipCampaignApi.getCampaign(campaignId) : null,
    [campaignId],
  )

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <LoadingOverlay loading={true}><div style={{ height: '300px' }} /></LoadingOverlay>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid mt-4">
        <ApiErrorAlert error={error as ApiError} />
      </div>
    )
  }

  return <MembershipCampaignWizardInner campaign={campaign} campaignId={campaignId} refetch={refetch} />
}
