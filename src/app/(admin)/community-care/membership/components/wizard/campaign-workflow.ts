'use client'

import type { MembershipCampaign, MembershipPlan } from '@/lib/api/membership-campaign.api'
import type { CampaignWizardFormValues } from './wizard.types'

export type CampaignPublishState = 'draft' | 'scheduled' | 'published' | 'paused' | 'archived'

export interface CampaignStatusSummary {
  label: string
  value: string
  tone: 'success' | 'warning' | 'danger' | 'info' | 'secondary'
}

export interface PublishIssue {
  severity: 'error' | 'warning'
  message: string
}

const TEST_CAMPAIGN_RE = /test campaign/i

export function getPublishStateLabel(status: string | undefined): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'scheduled':
      return 'Scheduled'
    case 'published':
      return 'Published'
    case 'application_open':
      return 'Published'
    case 'application_closed':
      return 'Paused'
    case 'archived':
      return 'Archived'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status || 'Draft'
  }
}

export function getStatusTone(status: string | undefined): CampaignStatusSummary['tone'] {
  switch (status) {
    case 'published':
    case 'application_open':
      return 'success'
    case 'scheduled':
      return 'info'
    case 'application_closed':
      return 'warning'
    case 'archived':
      return 'secondary'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

export function hasTestCampaignTitle(titleEn?: string | null, titleBn?: string | null) {
  return TEST_CAMPAIGN_RE.test(titleEn ?? '') || TEST_CAMPAIGN_RE.test(titleBn ?? '')
}

export function getPublishIssues(
  values: CampaignWizardFormValues,
  campaign?: MembershipCampaign | null,
  now = new Date(),
  targetStatus: string = values.status,
  _preview?: unknown,
): PublishIssue[] {
  const issues: PublishIssue[] = []
  const isPublishing = targetStatus === 'published' || targetStatus === 'scheduled'
  const hasRequiredIdentity = Boolean(values.titleEn?.trim() && values.titleBn?.trim() && values.slug?.trim())
  const hasMedia = Boolean(
    values.heroImageUrl?.trim() &&
    values.mobileImageUrl?.trim() &&
    values.thumbnailUrl?.trim() &&
    (values.heroImageMimeType ? values.heroImageMimeType.startsWith('image/') && Number(values.heroImageSizeBytes ?? 0) > 0 : true) &&
    (values.mobileImageMimeType ? values.mobileImageMimeType.startsWith('image/') && Number(values.mobileImageSizeBytes ?? 0) > 0 : true) &&
    (values.thumbnailMimeType ? values.thumbnailMimeType.startsWith('image/') && Number(values.thumbnailSizeBytes ?? 0) > 0 : true),
  )
  const hasPlans = Boolean(
    campaign?.plans?.some((plan: MembershipPlan) => {
      if (plan.isActive !== true) return false
      if (!plan.code || plan.code.trim() === '') return false
      const regularPrice = Number(plan.regularPrice)
      if (isNaN(regularPrice) || regularPrice <= 0) return false
      const maxCoveredPets = Number(plan.maxCoveredPets)
      if (isNaN(maxCoveredPets) || maxCoveredPets <= 0) return false
      if (!plan.validityYears && !plan.validityMonths) return false

      if (plan.offerPrice !== null) {
        const offerPrice = Number(plan.offerPrice)
        if (isNaN(offerPrice) || offerPrice < 0 || offerPrice > regularPrice) return false
      }
      return true
    }),
  )
  const hasValidApplicationDates = Boolean(
    values.applicationStartAt && values.applicationEndAt && new Date(values.applicationEndAt) > new Date(values.applicationStartAt),
  )
  const applicationClosed = Boolean(values.applicationEndAt && new Date(values.applicationEndAt) < now)
  const offerWindowValid = Boolean(!values.offerStartAt || !values.offerEndAt || new Date(values.offerEndAt) > new Date(values.offerStartAt))

  if (!offerWindowValid) issues.push({ severity: 'error', message: 'Offer end must be after offer start.' })
  if (isPublishing && !hasRequiredIdentity)
    issues.push({ severity: 'error', message: 'Publishing requires campaign title, slug, and bilingual identity fields.' })
  if (isPublishing && !hasMedia) issues.push({ severity: 'error', message: 'Publishing requires valid hero, mobile, and thumbnail media.' })
  if (isPublishing && !hasPlans) issues.push({ severity: 'error', message: 'Publishing requires at least one active plan.' })
  if (isPublishing && !hasValidApplicationDates) issues.push({ severity: 'error', message: 'Application end must be after application start.' })

  if (applicationClosed && isPublishing) {
    issues.push({ severity: 'warning', message: 'Application window is already closed. Archive the campaign or edit the dates before publishing.' })
  }

  if (hasTestCampaignTitle(values.titleEn, values.titleBn)) {
    issues.push({ severity: 'warning', message: 'Campaign titles containing "Test Campaign" should not be used outside development.' })
  }

  return issues
}
