import { api } from '../api'
import type { PaginatedResult } from '@/types/bpa.types'

export type MembershipCampaignStatus = 'draft' | 'scheduled' | 'application_open' | 'application_closed' | 'published' | 'archived' | 'cancelled'
export type MembershipApplicationStatus = 'draft' | 'submitted' | 'pending_payment' | 'paid' | 'approved' | 'rejected'
export type MembershipRecordStatus = 'active' | 'pending' | 'suspended' | 'expired' | 'cancelled'
export type MembershipUpgradeStatus = 'pending_payment' | 'paid' | 'completed' | 'cancelled' | 'failed'
export type MembershipCoveredPetStatus = 'ACTIVE' | 'DECEASED' | 'LOST' | 'REPLACEMENT_PENDING' | 'REPLACED' | 'REMOVED_BY_ADMIN_CORRECTION'
export type MembershipPricingStatus = 'upcoming' | 'offer_active' | 'regular_price' | 'unavailable'

export interface MembershipTierLink {
  id: string
  code?: string | null
  slug: string
  nameEn: string
  nameBn: string
  launchPrice?: number | null
  regularPrice?: number | null
  minPets?: number | null
  includedPets?: number | null
  maxPets?: number | null
  validityMonths?: number | null
  version?: number | null
  status?: string | null
}

export interface MembershipPlan {
  id: string
  campaignId: string
  tierId: string
  code: string
  nameEn: string
  nameBn: string | null
  regularPriceSnapshot: number
  campaignPrice: number
  minPetsSnapshot: number
  includedPetsSnapshot: number
  maxPetsSnapshot: number
  validityMonthsSnapshot: number
  benefitsSnapshot?: string[] | null
  tierVersion?: number | null
  allowPriceIncrease?: boolean
  regularPrice: number
  offerPrice: number | null
  maxCoveredPets: number | null
  validityYears?: number | null
  validityMonths?: number | null
  maximumReplacementCount?: number | null
  replacementRequiresApproval?: boolean
  replacementFee?: number | null
  sortOrder?: number
  isActive?: boolean
  changeReason?: string | null
  effectiveAt?: string | null
  existingMembersAffected?: boolean
  updatedAt?: string | null
  campaign?: { id: string; titleEn: string; slug: string } | null
  tier?: MembershipTierLink | null
}

export interface MembershipPlanHistoryEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  changedBy: string
  changedAt: string
  previousValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  reason?: string | null
  effectiveDate?: string | null
  existingMembersAffected: boolean
}

export interface MembershipBenefit {
  id: string
  campaignId: string
  code?: string | null
  titleEn: string
  titleBn?: string | null
  descriptionEn?: string | null
  descriptionBn?: string | null
  icon?: string | null
  sortOrder?: number
  isActive?: boolean
  plans?: Array<{ planId: string }>
  campaign?: { id: string; titleEn: string; slug: string } | null
}

export interface MembershipMediaItem {
  id: string
  campaignId: string
  mediaFileId: string
  role: string
  titleEn?: string | null
  titleBn?: string | null
  altText?: string | null
  sortOrder?: number
  isActive?: boolean
  mediaFile?: { id: string; url: string; mimeType: string; originalName: string } | null
  campaign?: { id: string; titleEn: string; slug: string } | null
}

export interface MembershipDocumentItem {
  id: string
  campaignId: string
  mediaFileId?: string | null
  documentType: string
  code?: string | null
  titleEn: string
  titleBn?: string | null
  descriptionEn?: string | null
  descriptionBn?: string | null
  fileUrl?: string | null
  sortOrder?: number
  isActive?: boolean
  mediaFile?: { id: string; url: string; mimeType: string; originalName: string } | null
  campaign?: { id: string; titleEn: string; slug: string } | null
}

export interface MembershipFaqItem {
  id: string
  campaignId: string
  questionEn: string
  questionBn?: string | null
  answerEn: string
  answerBn?: string | null
  sortOrder?: number
  isActive?: boolean
  campaign?: { id: string; titleEn: string; slug: string } | null
}

export interface MembershipCampaign {
  id: string
  slug: string
  titleEn: string
  titleBn: string
  shortDescriptionEn?: string | null
  shortDescriptionBn?: string | null
  descriptionEn?: string | null
  descriptionBn?: string | null
  heroImageUrl?: string | null
  mobileImageUrl?: string | null
  thumbnailUrl?: string | null
  status: MembershipCampaignStatus
  offerStartAt?: string | null
  offerEndAt?: string | null
  applicationStartAt?: string | null
  applicationEndAt?: string | null
  publishedAt?: string | null
  eligibilityContentEn?: string | null
  eligibilityContentBn?: string | null
  howItWorksContentEn?: string | null
  howItWorksContentBn?: string | null
  termsContentEn?: string | null
  termsContentBn?: string | null
  refundPolicyEn?: string | null
  refundPolicyBn?: string | null
  organizerNameEn?: string | null
  organizerNameBn?: string | null
  supportPhone?: string | null
  supportEmail?: string | null
  supportWhatsapp?: string | null
  supportAddress?: string | null
  notes?: string | null
  plans?: MembershipPlan[]
  benefits?: MembershipBenefit[]
  mediaItems?: MembershipMediaItem[]
  documents?: MembershipDocumentItem[]
  faqs?: MembershipFaqItem[]
  createdAt?: string
  updatedAt?: string
}

export interface MembershipCampaignPreview {
  id: string
  slug: string
  campaignStatus: MembershipCampaignStatus
  applicationStatus: string
  offerStatus: string
  heroImageUrl?: string | null
  mobileImageUrl?: string | null
  thumbnailUrl?: string | null
  shortDescription?: string | null
  pricing: {
    regularPrice: number | null
    offerPrice: number | null
    effectivePrice: number | null
    discountAmount: number
    discountPercentage: number
    isOfferActive: boolean
    pricingStatus: MembershipPricingStatus
    offerEndsAt?: string | null
    offerStartsAt?: string | null
    applicationEndsAt?: string | null
    serverNow?: string
    serverTime?: string
    remainingOfferTimeMs?: number
  }
  availablePlans: Array<{
    id: string
    tierId: string
    code: string
    nameEn: string
    nameBn: string
    regularPriceSnapshot: number
    campaignPrice: number
    minPetsSnapshot: number
    includedPetsSnapshot: number
    maxPetsSnapshot: number
    benefitsSnapshot?: string[] | null
    tierVersion?: number | null
    tier?: MembershipTierLink | null
    maxCoveredPets: number
    validityYears?: number | null
    validityMonths?: number | null
    regularPrice: number
    offerPrice: number | null
    effectivePrice: number
    discountAmount: number
    discountPercentage: number
    isOfferActive: boolean
    pricingStatus: MembershipPricingStatus
    offerEndsAt?: string | null
    applicationEndsAt?: string | null
    serverNow?: string
  }>
  applicationAvailability: {
    isOpen: boolean
    startsAt: string | null
    endsAt: string | null
    timezone: string
  }
  serverTime: string
  remainingOfferTimeMs: number
  plans: Array<{
    id: string
    tierId: string
    code: string
    nameEn: string
    nameBn: string
    regularPriceSnapshot: number
    campaignPrice: number
    minPetsSnapshot: number
    includedPetsSnapshot: number
    maxPetsSnapshot: number
    validityMonthsSnapshot: number
    benefitsSnapshot?: string[] | null
    tierVersion?: number | null
    allowPriceIncrease?: boolean
    tier?: MembershipTierLink | null
    regularPrice: number | null
    offerPrice: number | null
    maxCoveredPets: number
    validityYears?: number | null
    validityMonths?: number | null
    maximumReplacementCount?: number | null
    replacementRequiresApproval?: boolean
    replacementFee?: number | null
    sortOrder?: number
    isActive?: boolean
    pricing: {
      regularPrice: number
      offerPrice: number | null
      effectivePrice: number
      discountAmount: number
      discountPercentage: number
      isOfferActive: boolean
      pricingStatus: MembershipPricingStatus
      offerEndsAt?: string | null
      offerStartsAt?: string | null
      applicationEndsAt?: string | null
      serverNow?: string
      serverTime?: string
      remainingOfferTimeMs?: number
    }
  }>
}

export interface MembershipApplication {
  id: string
  applicationNumber: string
  campaignId: string
  planId: string
  userId: string
  paymentId?: string | null
  applicantName: string
  applicantMobile: string
  applicantEmail?: string | null
  applicantAddress?: string | null
  regularPriceSnapshot: number
  offerPriceSnapshot?: number | null
  finalPriceSnapshot: number
  tierIdSnapshot?: string | null
  tierCodeSnapshot?: string | null
  tierNameEnSnapshot?: string | null
  tierNameBnSnapshot?: string | null
  tierVersionSnapshot?: number | null
  minCoveredPetsSnapshot?: number | null
  includedPetsSnapshot?: number | null
  maxCoveredPetsSnapshot?: number | null
  validityMonthsSnapshot?: number | null
  benefitsSnapshot?: string[] | null
  status: MembershipApplicationStatus
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  notes?: string | null
  reviewNotes?: string | null
  documentUrls?: string[]
  campaign?: { id: string; slug: string; titleEn: string; titleBn: string; status: string } | null
  plan?: MembershipPlan | null
  payment?: { id: string; status: string; amount: number; currency: string; merchantTxnId?: string | null } | null
  membershipId?: string | null
  createdAt: string
  updatedAt: string
}

export interface MembershipDetail {
  id: string
  membershipNumber?: string | null
  cardNumber?: string | null
  membershipStatus: string
  qrVerificationData?: { membershipId: string; membershipNumber?: string | null; cardNumber?: string | null; verifyPath?: string } | null
  validity: { validFrom?: string | null; validUntil?: string | null; activatedAt?: string | null }
  plan:
    | MembershipPlan
    | {
        id?: string | null
        tierId?: string | null
        tierCodeSnapshot?: string | null
        tierNameEnSnapshot?: string | null
        tierNameBnSnapshot?: string | null
        tierVersion?: number | null
        code?: string | null
        nameEn?: string | null
        nameBn?: string | null
        minPetsSnapshot?: number | null
        includedPetsSnapshot?: number | null
        maxPetsSnapshot?: number | null
        validityMonths?: number | null
        benefitsSnapshot?: string[] | null
        regularPrice?: number | null
        offerPrice?: number | null
        maxCoveredPets?: number | null
      }
  maximumCoveredPets?: number | null
  currentCoveredPets: Array<{
    id: string
    petId: string
    slotNumber: number
    status: string
    linkedAt: string
    pet?: { id: string; name?: string | null; petType?: string | null }
  }>
  remainingSlots: number
  replacementAllowance?: { maximumReplacementCount?: number | null; usedReplacementCount?: number | null }
  linkedPetHistory: Array<{
    id: string
    petId: string
    slotNumber: number
    status: string
    linkedAt: string
    linkedAtClinic?: { id: string; name: string } | null
    replacementOfCoveredPetId?: string | null
    replacedByCoveredPetId?: string | null
    isReplacement?: boolean
    pet?: any
  }>
  benefits: MembershipBenefit[]
  serviceUsageHistory: Array<{
    id: string
    serviceDate: string
    serviceCode: string
    serviceName: string
    status: string
    clinic?: { id: string; name: string } | null
    pet?: any
  }>
  upgradeOptions?: Array<{
    id: string
    code: string
    nameEn: string
    nameBn?: string | null
    maxCoveredPets: number
    regularPrice?: number | null
    offerPrice?: number | null
  }>
}

export interface MembershipReplacement {
  id: string
  membershipId: string
  oldCoveredPetId: string
  newPetId?: string | null
  reason: string
  status: string
  supportingDocumentUrl?: string | null
  reviewNotes?: string | null
  requestedAt: string
  reviewedAt?: string | null
  completedAt?: string | null
  oldCoveredPet?: any
  newPet?: any
  membership?: any
  requestedByUser?: any
  requestedByStaff?: any
  reviewedByAdmin?: any
}

export interface MembershipUpgrade {
  id: string
  membershipId: string
  paymentId?: string | null
  status: MembershipUpgradeStatus
  requestedAt: string
  reviewedAt?: string | null
  completedAt?: string | null
  reviewNotes?: string | null
  pricing: { regularPrice: number | null; targetPlanPrice: number | null; upgradePayable: number | null; eligibleCredit: number | null }
  entitlement: { beforeMaxCoveredPets: number; afterMaxCoveredPets: number }
  membership?: { id: string; membershipNumber?: string | null; cardNumber?: string | null } | null
  fromPlan?: { id: string; code: string; nameEn: string; nameBn?: string | null; maxCoveredPets: number } | null
  toPlan?: { id: string; code: string; nameEn: string; nameBn?: string | null; maxCoveredPets: number } | null
  payment?: { id: string; status: string; amount: number | null; currency: string; merchantTxnId?: string | null } | null
}

export interface MembershipCoveredPetListItem {
  id: string
  membershipId: string
  petId: string
  slotNumber: number
  status: MembershipCoveredPetStatus
  linkedAt: string
  isReplacement?: boolean
  replacementOfCoveredPetId?: string | null
  replacedByCoveredPetId?: string | null
  membership?: { id: string; membershipNumber?: string | null; cardNumber?: string | null } | null
  pet?: any
  linkedAtClinic?: { id: string; name: string } | null
}

export interface MembershipServiceUsageItem {
  id: string
  membershipId: string
  petId: string
  clinicId: string
  benefitId?: string | null
  coveredPetId?: string | null
  serviceCode: string
  serviceName: string
  regularPrice: number
  discountAmount: number
  payableAmount: number
  serviceDate: string
  status: string
  membership?: { id: string; membershipNumber?: string | null; cardNumber?: string | null } | null
  pet?: any
  clinic?: { id: string; name: string } | null
  benefit?: { id: string; titleEn: string } | null
  staff?: { id: string; name?: string | null } | null
  doctor?: { id: string; name?: string | null } | null
}

export interface MembershipReports {
  campaigns: number
  applicationsByStatus: Array<{ status: string; _count: { _all: number } }>
  membershipsByStatus: Array<{ membershipRecordStatus: string; _count: { _all: number } }>
  upgradesByStatus: Array<{ status: string; _count: { _all: number } }>
}

export interface ClinicMembershipLookupParams {
  clinicId: string
  qrToken?: string
  membershipNumber?: string
  cardNumber?: string
  mobile?: string
  email?: string
  accountId?: string
}

export interface ClinicMembershipOwnerSummary {
  userId: string
  applicantName: string
  mobile?: string | null
  email?: string | null
}

export interface ClinicMembershipSummary {
  id: string
  membershipNumber?: string | null
  cardNumber?: string | null
  qrToken?: string | null
  status: string
  validFrom?: string | null
  validUntil?: string | null
  maxCoveredPets: number
  activeCoveredPetCount: number
  remainingPetSlots: number
  replacementPendingCount: number
  upgradeRequired: boolean
  owner: ClinicMembershipOwnerSummary
}

export interface ClinicMembershipLinkedPetHistory {
  id: string
  petId: string
  petName: string
  slotNumber: number
  status: string
  linkedAt: string
  coveredSince?: string | null
  linkedAtClinicId?: string | null
}

export interface ClinicMembershipServiceUsageHistory {
  id: string
  serviceDate: string
  serviceCode: string
  serviceName: string
  clinicId: string
  notes?: string | null
}

export interface ClinicMembershipDetail extends ClinicMembershipSummary {
  linkedPetHistory: ClinicMembershipLinkedPetHistory[]
  serviceUsageHistory: ClinicMembershipServiceUsageHistory[]
}

export interface ClinicMembershipPet {
  id: string
  name: string
  petType?: string | null
  gender?: string | null
  breed?: string | null
  color?: string | null
  isCovered: boolean
  coveredStatus?: string | null
  slotNumber?: number | null
  coveredSince?: string | null
  eligibleForMembership: boolean
  canBeLinkedNow: boolean
}

export interface ClinicMembershipPetsResponse {
  owner: {
    id: string
    userId: string
    ownerName: string
    mobile?: string | null
    email?: string | null
  }
  maxCoveredPets: number
  activeCoveredPetCount: number
  remainingPetSlots: number
  upgradeRequired: boolean
  replacementPendingCount: number
  pets: ClinicMembershipPet[]
}

export interface ClinicMembershipCreatePetDto {
  name: string
  petType: string
  gender: string
  approxAge?: string
  breed?: string
  color?: string
  weightKg?: number
  photoId?: string
  notes?: string
}

export interface ClinicMembershipLinkPetResult {
  id: string
  membershipId: string
  petId: string
  slotNumber: number
  status: string
  linkedAt: string
  currentPetCount: number
  maxCoveredPets: number
}

export interface ClinicMembershipServiceUsageDto {
  clinicId: string
  petId: string
  benefitId: string
  serviceCode: string
  serviceName: string
  regularPrice: number
  discountAmount: number
  payableAmount: number
  serviceDate?: string
  doctorId?: string
  notes?: string
}

export interface ClinicMembershipReplacementDto {
  clinicId: string
  oldCoveredPetId: string
  reason: 'DECEASED' | 'PERMANENTLY_LOST'
  supportingDocumentUrl?: string
  notes?: string
}

const base = '/admin/membership'

export const membershipCampaignApi = {
  listCampaigns: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipCampaign>(`${base}/campaigns`, params),
  getCampaign: (id: string) => api.get<MembershipCampaign>(`${base}/campaigns/${id}`),
  getCampaignPreview: (id: string) => api.get<MembershipCampaignPreview>(`${base}/campaigns/${id}/preview`),
  createCampaign: (data: Partial<MembershipCampaign>) => api.post<MembershipCampaign>(`${base}/campaigns`, data),
  updateCampaign: (id: string, data: Partial<MembershipCampaign>) => api.put<MembershipCampaign>(`${base}/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete<void>(`${base}/campaigns/${id}`),

  listPlans: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipPlan>(`${base}/plans`, params),
  getPlanHistory: (id: string) => api.get<MembershipPlanHistoryEntry[]>(`${base}/plans/${id}/history`),
  createPlan: (data: Partial<MembershipPlan>) => api.post<MembershipPlan>(`${base}/plans`, data),
  updatePlan: (id: string, data: Partial<MembershipPlan>) => api.put<MembershipPlan>(`${base}/plans/${id}`, data),
  deletePlan: (id: string) => api.delete<void>(`${base}/plans/${id}`),
  syncPlans: (campaignId: string) => api.post<{ syncedCount: number; totalPlans: number }>(`${base}/campaigns/${campaignId}/plans/sync`),

  listBenefits: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipBenefit>(`${base}/benefits`, params),
  createBenefit: (data: Partial<MembershipBenefit> & { planIds?: string[] }) => api.post<MembershipBenefit>(`${base}/benefits`, data),
  updateBenefit: (id: string, data: Partial<MembershipBenefit> & { planIds?: string[] }) =>
    api.put<MembershipBenefit>(`${base}/benefits/${id}`, data),
  deleteBenefit: (id: string) => api.delete<void>(`${base}/benefits/${id}`),

  listMedia: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipMediaItem>(`${base}/media`, params),
  createMedia: (data: Partial<MembershipMediaItem>) => api.post<MembershipMediaItem>(`${base}/media`, data),
  updateMedia: (id: string, data: Partial<MembershipMediaItem>) => api.put<MembershipMediaItem>(`${base}/media/${id}`, data),
  deleteMedia: (id: string) => api.delete<void>(`${base}/media/${id}`),

  listDocuments: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipDocumentItem>(`${base}/documents`, params),
  createDocument: (data: Partial<MembershipDocumentItem>) => api.post<MembershipDocumentItem>(`${base}/documents`, data),
  updateDocument: (id: string, data: Partial<MembershipDocumentItem>) => api.put<MembershipDocumentItem>(`${base}/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete<void>(`${base}/documents/${id}`),

  listFaqs: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipFaqItem>(`${base}/faqs`, params),
  createFaq: (data: Partial<MembershipFaqItem>) => api.post<MembershipFaqItem>(`${base}/faqs`, data),
  updateFaq: (id: string, data: Partial<MembershipFaqItem>) => api.put<MembershipFaqItem>(`${base}/faqs/${id}`, data),
  deleteFaq: (id: string) => api.delete<void>(`${base}/faqs/${id}`),

  listApplications: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipApplication>(`${base}/applications`, params),
  getApplication: (id: string) => api.get<MembershipApplication>(`${base}/applications/${id}`),
  reviewApplication: (id: string, data: { status: 'approved' | 'rejected'; reviewNotes?: string | null }) =>
    api.post<MembershipApplication>(`${base}/applications/${id}/review`, data),
  activateMembership: (id: string, data?: { validFrom?: string; activatedAt?: string; reviewNotes?: string | null }) =>
    api.post<MembershipDetail>(`${base}/applications/${id}/activate`, data ?? {}),

  listMemberships: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<any>(`${base}/memberships`, params),
  getMembership: (id: string) => api.get<MembershipDetail>(`${base}/memberships/${id}`),
  updateMembershipStatus: (id: string, data: { status: MembershipRecordStatus; notes?: string | null }) =>
    api.patch<MembershipDetail>(`${base}/memberships/${id}/status`, data),

  listCoveredPets: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipCoveredPetListItem>(`${base}/covered-pets`, params),

  listReplacements: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipReplacement>(`${base}/membership-pet-replacements`, params),
  getReplacement: (id: string) => api.get<MembershipReplacement>(`${base}/membership-pet-replacements/${id}`),
  approveReplacement: (id: string, data?: { reviewNotes?: string | null }) =>
    api.post<MembershipReplacement>(`${base}/membership-pet-replacements/${id}/approve`, data ?? {}),
  rejectReplacement: (id: string, data?: { reviewNotes?: string | null }) =>
    api.post<MembershipReplacement>(`${base}/membership-pet-replacements/${id}/reject`, data ?? {}),
  completeReplacement: (id: string, data: { newPetId: string; reviewNotes?: string | null }) =>
    api.post<MembershipReplacement>(`${base}/membership-pet-replacements/${id}/complete`, data),

  listUpgrades: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipUpgrade>(`${base}/upgrades`, params),
  getUpgrade: (id: string) => api.get<MembershipUpgrade>(`${base}/upgrades/${id}`),
  reviewUpgrade: (id: string, data: { status: 'completed' | 'cancelled'; reviewNotes?: string | null }) =>
    api.post<MembershipUpgrade>(`${base}/upgrades/${id}/review`, data),

  listServiceUsage: (params?: Record<string, string | number | boolean | undefined>) =>
    api.getPaginated<MembershipServiceUsageItem>(`${base}/service-usage`, params),

  getReports: () => api.get<MembershipReports>(`${base}/reports`),
}

export const membershipClinicApi = {
  lookupMembership: (params: ClinicMembershipLookupParams) =>
    api.get<ClinicMembershipSummary>('/clinic/memberships/lookup', params as unknown as Record<string, string | number | boolean | undefined>),
  getMembership: (membershipId: string, clinicId: string) => api.get<ClinicMembershipDetail>(`/clinic/memberships/${membershipId}`, { clinicId }),
  getMembershipPets: (membershipId: string, clinicId: string) =>
    api.get<ClinicMembershipPetsResponse>(`/clinic/memberships/${membershipId}/pets`, { clinicId }),
  createPet: (membershipId: string, clinicId: string, data: ClinicMembershipCreatePetDto) =>
    api.post<ClinicMembershipPet>(`/clinic/memberships/${membershipId}/pets?clinicId=${encodeURIComponent(clinicId)}`, data),
  linkCoveredPet: (membershipId: string, clinicId: string, petId: string) =>
    api.post<ClinicMembershipLinkPetResult>(`/clinic/memberships/${membershipId}/covered-pets?clinicId=${encodeURIComponent(clinicId)}`, { petId }),
  createServiceUsage: (membershipId: string, data: ClinicMembershipServiceUsageDto) =>
    api.post<MembershipServiceUsageItem>(`/clinic/memberships/${membershipId}/service-usage`, data),
  createReplacementRequest: (membershipId: string, data: ClinicMembershipReplacementDto) =>
    api.post<MembershipReplacement>(`/clinic/memberships/${membershipId}/pet-replacements`, data),
}
