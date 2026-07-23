import { api, apiClient } from '../api'
import type { PaginationQuery, MediaFile } from '@/types/bpa.types'

export type ClinicTriState = 'UNKNOWN' | 'YES' | 'NO'
export type ClinicVerificationStatus = 'UNKNOWN' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'
export type ClinicClaimStatus = 'UNCLAIMED' | 'PENDING' | 'CLAIMED'
export type ClinicFacilityType = 'LABORATORY' | 'SURGERY' | 'IMAGING' | 'PHARMACY' | 'HOSPITALIZATION' | 'HOME_SERVICE'
export type ClinicAnimalType = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'REPTILE' | 'SMALL_MAMMAL' | 'EXOTIC' | 'OTHER'
export type ClinicSocialPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'WEBSITE' | 'OTHER'

export interface ClinicSocialLink {
  id?: string
  platform: ClinicSocialPlatform
  url: string
  label?: string | null
}

export interface ClinicOrganization {
  id: string
  name: string
  slug: string
  description: string | null
  // Legacy plain-URL fields — still readable for records saved before the
  // Central Media Library picker existed. `logoMedia`/`coverMedia` (when
  // present) is always the current image; these are only the fallback.
  logoUrl: string | null
  coverImageUrl: string | null
  logoMediaId: string | null
  coverMediaId: string | null
  logoMedia?: MediaFile | null
  coverMedia?: MediaFile | null
  website: string | null
  email: string | null
  verificationStatus: ClinicVerificationStatus
  claimedStatus: ClinicClaimStatus
  published: boolean
  featured: boolean
  archivedAt: string | null
  socialLinks: ClinicSocialLink[]
  createdAt: string
  updatedAt: string
  _count?: { branches: number }
}

export interface ClinicBranchPhone {
  id?: string
  phoneNumber: string
  label?: string | null
  isPrimary: boolean
  whatsappAvailable: ClinicTriState
  sortOrder: number
}

export interface ClinicBranchOpeningHours {
  id?: string
  dayOfWeek: number
  opensAt: string | null
  closesAt: string | null
  isClosed: boolean
  note?: string | null
}

export interface ClinicBranchFacility {
  id?: string
  facilityType: ClinicFacilityType
  available: ClinicTriState
  notes?: string | null
}

export interface ClinicBranchService {
  id?: string
  serviceName: string
  notes?: string | null
}

export interface ClinicBranchAnimalTypeEntry {
  id?: string
  animalType: ClinicAnimalType
  note?: string | null
}

export interface ClinicBranchImage {
  id?: string
  url: string
  // Set when this image came from the Central Media Library picker (the
  // normal path going forward); absent for legacy plain-URL rows.
  mediaFileId?: string | null
  mediaFile?: MediaFile | null
  isCover: boolean
  sortOrder: number
  altText?: string | null
}

export interface ClinicBranchSource {
  id?: string
  sourceUrl: string
  label?: string | null
}

export interface ClinicBranch {
  id: string
  organizationId: string
  organization?: { id: string; name: string; slug: string }
  branchName: string
  slug: string | null
  address: string | null
  area: string | null
  cityCorporation: string | null
  district: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  googleMapUrl: string | null
  email: string | null
  emergencyAvailability: ClinicTriState
  open24Hours: ClinicTriState
  appointmentRequired: ClinicTriState
  accessibilityNotes: string | null
  verificationStatus: ClinicVerificationStatus
  lastVerifiedAt: string | null
  published: boolean
  archivedAt: string | null
  importNotes: string | null
  phones: ClinicBranchPhone[]
  socialLinks: ClinicSocialLink[]
  openingHours: ClinicBranchOpeningHours[]
  facilities: ClinicBranchFacility[]
  services: ClinicBranchService[]
  animalTypes: ClinicBranchAnimalTypeEntry[]
  images: ClinicBranchImage[]
  sources: ClinicBranchSource[]
  dataQualityWarnings?: string[]
  createdAt: string
  updatedAt: string
}

export type ClinicStatusFilter = 'active' | 'archived' | 'all'
export type ClinicSortBy = 'name' | 'createdAt' | 'updatedAt' | 'lastVerifiedAt'

export interface ClinicOrganizationListQuery extends PaginationQuery {
  search?: string
  published?: 'true' | 'false' | 'all'
  featured?: 'true' | 'false'
  verificationStatus?: ClinicVerificationStatus
  status?: ClinicStatusFilter
  sortBy?: ClinicSortBy
  sortDir?: 'asc' | 'desc'
}

export interface ClinicBranchListQuery extends PaginationQuery {
  search?: string
  organizationId?: string
  published?: 'true' | 'false' | 'all'
  verificationStatus?: ClinicVerificationStatus
  status?: ClinicStatusFilter
  area?: string
  district?: string
  cityCorporation?: string
  emergencyAvailability?: ClinicTriState
  open24Hours?: ClinicTriState
  missingCoordinates?: 'true'
  missingPhone?: 'true'
  missingHours?: 'true'
  unverifiedOnly?: 'true'
  sortBy?: ClinicSortBy
  sortDir?: 'asc' | 'desc'
}

export type ClinicBulkAction = 'publish' | 'unpublish' | 'archive' | 'restore'

export interface PermanentDeletePayload {
  reason: string
  confirmationText: string
}

export interface ClinicImportRowResult {
  rowNumber: number
  clinicName: string | null
  branchArea: string | null
  importKey: string
  status: 'inserted' | 'updated' | 'unchanged' | 'skipped' | 'invalid'
  reason?: string
}

export interface ClinicImportReport {
  totalRows: number
  inserted: number
  updated: number
  unchanged: number
  skipped: number
  invalid: number
  committed: boolean
  rows: ClinicImportRowResult[]
}

export const clinicsApi = {
  organizations: {
    list: (params?: ClinicOrganizationListQuery) =>
      api.getPaginated<ClinicOrganization>('/admin/clinics/organizations', params as Record<string, string | number | boolean | undefined>),
    getById: (id: string) => api.get<ClinicOrganization>(`/admin/clinics/organizations/${id}`),
    create: (data: Partial<ClinicOrganization>) => api.post<ClinicOrganization>('/admin/clinics/organizations', data),
    update: (id: string, data: Partial<ClinicOrganization>) => api.patch<ClinicOrganization>(`/admin/clinics/organizations/${id}`, data),
    setPublished: (id: string, published: boolean) => api.patch<ClinicOrganization>(`/admin/clinics/organizations/${id}/publish`, { published }),
    archive: (id: string, reason?: string) => api.patch<ClinicOrganization>(`/admin/clinics/organizations/${id}/archive`, { reason }),
    restore: (id: string) => api.patch<ClinicOrganization>(`/admin/clinics/organizations/${id}/restore`, {}),
    bulkAction: (ids: string[], action: ClinicBulkAction) => api.post<{ affected: number }>('/admin/clinics/organizations/bulk', { ids, action }),
    /** Permanent delete — GLOBAL_SUPER_ADMIN only server-side; requires typed confirmation + reason. */
    remove: (id: string, payload: PermanentDeletePayload) =>
      apiClient<void>(`/admin/clinics/organizations/${id}`, { method: 'DELETE', body: payload }),
  },
  branches: {
    list: (params?: ClinicBranchListQuery) =>
      api.getPaginated<ClinicBranch>('/admin/clinics/branches', params as Record<string, string | number | boolean | undefined>),
    getById: (id: string) => api.get<ClinicBranch>(`/admin/clinics/branches/${id}`),
    create: (data: Partial<ClinicBranch> & { organizationId: string; branchName: string }) => api.post<ClinicBranch>('/admin/clinics/branches', data),
    update: (id: string, data: Partial<ClinicBranch>) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}`, data),
    setPublished: (id: string, published: boolean) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}/publish`, { published }),
    updateRelated: (
      id: string,
      data: Partial<{
        phones: ClinicBranchPhone[]
        socialLinks: ClinicSocialLink[]
        openingHours: ClinicBranchOpeningHours[]
        facilities: ClinicBranchFacility[]
        services: ClinicBranchService[]
        animalTypes: ClinicBranchAnimalTypeEntry[]
        images: ClinicBranchImage[]
        sources: ClinicBranchSource[]
      }>,
    ) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}/related`, data),
    archive: (id: string, reason?: string) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}/archive`, { reason }),
    restore: (id: string) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}/restore`, {}),
    duplicate: (id: string) => api.post<ClinicBranch>(`/admin/clinics/branches/${id}/duplicate`, {}),
    bulkAction: (ids: string[], action: ClinicBulkAction) =>
      api.post<{ affected: number; skipped?: string[] }>('/admin/clinics/branches/bulk', { ids, action }),
    addImage: (id: string, image: { url: string; mediaFileId?: string | null; isCover?: boolean; sortOrder?: number; altText?: string | null }) =>
      api.post<ClinicBranch>(`/admin/clinics/branches/${id}/images`, image),
    removeImage: (id: string, imageId: string) => api.delete<ClinicBranch>(`/admin/clinics/branches/${id}/images/${imageId}`),
    reorderImages: (id: string, order: string[]) => api.patch<ClinicBranch>(`/admin/clinics/branches/${id}/images/reorder`, { order }),
    /** Permanent delete — GLOBAL_SUPER_ADMIN only server-side; requires typed confirmation + reason. */
    remove: (id: string, payload: PermanentDeletePayload) => apiClient<void>(`/admin/clinics/branches/${id}`, { method: 'DELETE', body: payload }),
  },
  import: {
    run: (file: File, commit: boolean) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.upload<ClinicImportReport>(`/admin/clinics/import?commit=${commit ? 'true' : 'false'}`, formData)
    },
  },
}
