import * as yup from 'yup'
import { MembershipCampaign } from '@/lib/api/membership-campaign.api'

export const wizardSchema = yup.object({
  slug: yup.string().required('Slug is required'),
  titleEn: yup.string().required('English title is required'),
  titleBn: yup.string().required('Bangla title is required'),
  shortDescriptionEn: yup.string().nullable().default(''),
  shortDescriptionBn: yup.string().nullable().default(''),
  descriptionEn: yup.string().nullable().default(''),
  descriptionBn: yup.string().nullable().default(''),
  heroImageUrl: yup.string().nullable().default(''),
  mobileImageUrl: yup.string().nullable().default(''),
  thumbnailUrl: yup.string().nullable().default(''),
  status: yup.string().required('Status is required'),
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
  supportEmail: yup.string().email('Invalid email format').nullable().default(''),
  supportWhatsapp: yup.string().nullable().default(''),
  supportAddress: yup.string().nullable().default(''),
})

export type CampaignWizardFormValues = yup.InferType<typeof wizardSchema>

export const WIZARD_STEPS = [
  { id: 'basics', title: 'Campaign Basics', fields: ['slug', 'titleEn', 'titleBn', 'status', 'publishedAt', 'shortDescriptionEn', 'shortDescriptionBn'] as const },
  { id: 'content', title: 'Description & Content', fields: ['descriptionEn', 'descriptionBn'] as const },
  { id: 'schedule', title: 'Offer & Schedule', fields: ['offerStartAt', 'offerEndAt', 'applicationStartAt', 'applicationEndAt'] as const },
  { id: 'media', title: 'Media', fields: ['heroImageUrl', 'mobileImageUrl', 'thumbnailUrl'] as const },
  { id: 'policy', title: 'Policy & Eligibility', fields: ['eligibilityContentEn', 'eligibilityContentBn', 'howItWorksContentEn', 'howItWorksContentBn', 'termsContentEn', 'termsContentBn', 'refundPolicyEn', 'refundPolicyBn'] as const },
  { id: 'support', title: 'Organizer & Support', fields: ['organizerNameEn', 'organizerNameBn', 'supportPhone', 'supportEmail', 'supportWhatsapp', 'supportAddress'] as const },
  { id: 'review', title: 'Review & Publish', fields: [] as const },
] as const

export type WizardStepId = typeof WIZARD_STEPS[number]['id']

export function asInputDateTime(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const tzOffset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tzOffset * 60000)
  return local.toISOString().slice(0, 16)
}

export function campaignToWizardValues(campaign?: MembershipCampaign | null): CampaignWizardFormValues {
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
