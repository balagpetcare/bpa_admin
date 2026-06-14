import { getSession } from 'next-auth/react'
import { api, ApiError } from '../api'
import { isUuid } from '../uuid'
import type {
  PetCensusSubmission,
  PetCensusAnalyticsSummary,
  PetCensusCampaign,
  PetCensusPublicSubmitResult,
  PetCensusStatusLookupResult,
  MediaFile,
  PaginationQuery,
} from '@/types/bpa.types'

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

function requireValidId(id: string, entity: string) {
  const normalizedId = id?.trim() ?? ''
  if (!normalizedId || !isUuid(normalizedId)) {
    throw new ApiError('VALIDATION_ERROR', `${entity} id is missing or invalid.`)
  }
  return normalizedId
}

export const petCensusApi = {
  // Submissions (Admin)
  list: (params?: PaginationQuery) => api.getPaginated<PetCensusSubmission>('/admin/pet-census', params),
  getById: (id: string) => api.get<PetCensusSubmission>(`/admin/pet-census/${requireValidId(id, 'Submission')}`),
  update: (id: string, data: any) =>
    api.patch<PetCensusSubmission>(`/admin/pet-census/${requireValidId(id, 'Submission')}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch<PetCensusSubmission>(`/admin/pet-census/${requireValidId(id, 'Submission')}/status`, { status }),
  remove: (id: string) => api.delete<void>(`/admin/pet-census/${requireValidId(id, 'Submission')}`),

  exportCsv: async (params?: any): Promise<Blob> => {
    const url = new URL(`${BASE_URL}/admin/pet-census/export`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
      })
    }
    const session = await getSession()
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    })
    if (!res.ok) throw new Error('Failed to export CSV')
    return res.blob()
  },

  getAnalytics: () => api.get<PetCensusAnalyticsSummary>('/admin/pet-census/analytics'),

  // Campaigns (Admin)
  listCampaigns: () => api.get<PetCensusCampaign[]>('/admin/pet-census/campaigns'),
  getCampaign: (id: string) => api.get<PetCensusCampaign>(`/admin/pet-census/campaigns/${requireValidId(id, 'Campaign')}`),
  createCampaign: (data: any) => api.post<PetCensusCampaign>('/admin/pet-census/campaigns', data),
  updateCampaign: (id: string, data: any) =>
    api.patch<PetCensusCampaign>(`/admin/pet-census/campaigns/${requireValidId(id, 'Campaign')}`, data),

  // Public API
  submitPublic: (data: any) => api.post<PetCensusPublicSubmitResult>('/public/pet-census', data),
  lookupStatus: (mobile: string, petName?: string) =>
    api.get<PetCensusStatusLookupResult>('/public/pet-census/status', { mobile, petName: petName || undefined }),
  uploadPublicPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<MediaFile>('/public/pet-census/upload-photo', formData)
  },
}
