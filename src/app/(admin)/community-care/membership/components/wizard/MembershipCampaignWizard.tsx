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
import { membershipCampaignApi, type MembershipCampaign, type MembershipCampaignStatus } from '@/lib/api/membership-campaign.api'

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
import CampaignPlansStep from './steps/CampaignPlansStep'
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
      {currentStepId === 'plans' && <CampaignPlansStep />}
      {currentStepId === 'review' && <CampaignReviewStep />}
    </div>
  )
}

function MembershipCampaignWizardInner({ campaign, campaignId, refetch }: { campaign?: MembershipCampaign | null; campaignId?: string; refetch: () => void }) {
  const router = useRouter()
  const { can } = usePermission()
  const wizard = useCampaignWizard(campaign)
  const [deleteError, setDeleteError] = useState<ApiError | null>(null)
  
  const { mutate, loading: saving, error: mutError } = useApiMutation<MembershipCampaign, CampaignWizardFormValues>()
  const isEdit = Boolean(campaignId)

  // Map backend validation errors to form fields
  React.useEffect(() => {
    if (mutError && mutError.code === 'VALIDATION_ERROR' && Array.isArray(mutError.details)) {
      mutError.details.forEach((err: any) => {
        if (err.path && typeof err.path === 'string') {
          wizard.form.setError(err.path as any, { type: 'server', message: err.message })
        }
      })
    }
  }, [mutError, wizard.form])

  async function submitForm(values: CampaignWizardFormValues, asDraft: boolean = false, continueToNextStep: boolean = false) {
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

    let payloadToSubmit: Partial<MembershipCampaign> = payload as Partial<MembershipCampaign>

    if (campaignId) {
      const dirtyFields = Object.keys(wizard.form.formState.dirtyFields)
      const dirtyPayload: any = {}
      for (const k of dirtyFields) {
        if (k in payload) {
          dirtyPayload[k] = (payload as any)[k]
        }
      }

      // If we are publishing, or saving as draft, or a status change was explicitly requested, include status
      const isPublishingNow = continueToNextStep === false && !asDraft && wizard.isLastStep
      if (asDraft || isPublishingNow || dirtyFields.includes('status')) {
        dirtyPayload.status = payload.status
      }

      // if nothing is dirty, just pretend it succeeded
      if (Object.keys(dirtyPayload).length === 0) {
        if (continueToNextStep && !wizard.isLastStep) wizard.nextStep()
        else if (wizard.isLastStep && !asDraft) router.push('/community-care/membership/campaigns')
        return
      }
      payloadToSubmit = dirtyPayload
    }

    const result = await mutate(async () => (
      campaignId
        ? membershipCampaignApi.updateCampaign(campaignId, payloadToSubmit)
        : membershipCampaignApi.createCampaign(payloadToSubmit)
    ), values)
    
    if (!result) return

    // Clear dirty state on save
    wizard.form.reset(values, { keepValues: true, keepDirty: false })
    
    if (!campaignId) {
      const step = continueToNextStep && !wizard.isLastStep 
        ? wizard.steps[wizard.currentStepIndex + 1].id 
        : wizard.currentStepId
      router.push(`/community-care/membership/campaigns/${result.id}/edit?step=${step}`)
    } else {
      if (continueToNextStep && !wizard.isLastStep) {
        wizard.nextStep() // this just navigates internally in useWizardContext
      } else {
        refetch()
        if (wizard.isLastStep && !asDraft) {
          router.push('/community-care/membership/campaigns')
        }
      }
    }
  }

  async function handleSaveAsDraft() {
    const values = wizard.form.getValues()
    await submitForm(values, true, false)
  }

  async function handleSaveAndContinue(newStatus?: MembershipCampaignStatus) {
    if (wizard.isLastStep) {
      // Final step: validate everything
      const isValid = await wizard.form.trigger()
      if (!isValid) return
      const values = wizard.form.getValues()
      if (newStatus) values.status = newStatus
      await submitForm(values, false, false)
    } else {
      // Step-by-step: validate current step fields only
      const currentStepFields = wizard.steps[wizard.currentStepIndex].fields
      const isValid = await wizard.form.trigger(currentStepFields as any)
      if (!isValid) {
        // focus first error
        const errors = wizard.form.formState.errors
        const firstErrorField = currentStepFields.find(f => errors[f as keyof typeof errors])
        if (firstErrorField) wizard.form.setFocus(firstErrorField as any)
        return
      }
      
      const values = wizard.form.getValues()
      // If we are creating, default to draft so it doesn't accidentally publish early
      if (!campaignId && values.status !== 'draft') {
        values.status = 'draft'
      }
      
      await submitForm(values, false, true)
    }
  }

  async function handleDelete() {
    if (!campaignId) return
    const title = campaign?.titleEn ?? 'this campaign'
    if (!(await confirmDelete(title))) return
    
    // We should use a mutation or try-catch to show backend relation/conflict errors
    try {
      await membershipCampaignApi.deleteCampaign(campaignId)
      router.push('/community-care/membership/campaigns')
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err)
      } else {
        alert('Failed to delete campaign. It might be linked to other records.')
      }
    }
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

        <ApiErrorAlert error={mutError || deleteError} />

        <LoadingOverlay loading={saving}>
          <MembershipCampaignWizardHeader />
          <WizardContent />
          <MembershipCampaignWizardFooter
            onSaveAsDraft={handleSaveAsDraft}
            onSubmit={handleSaveAndContinue}
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

  const isHydrating = !!campaignId && (!campaign && !error)

  if (loading || isHydrating) {
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
