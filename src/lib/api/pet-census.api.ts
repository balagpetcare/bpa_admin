import { api } from '../api'
import { getSession } from 'next-auth/react'
import type { PetCensusPetType, PetCensusSubmission, PaginationQuery } from '@/types/bpa.types'

export interface PetCensusListParams extends PaginationQuery {
  status?: string
  zoneId?: string
  petType?: PetCensusPetType | ''
  area?: string
  vaccinationInterest?: boolean
  communityClinicInterest?: boolean
  communityPetShopInterest?: boolean
  carePartnerInterest?: boolean
  dateFrom?: string
  dateTo?: string
}

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

async function exportCsv(params?: PetCensusListParams): Promise<Blob> {
  const url = new URL(`${BASE_URL}/admin/pet-census/export`)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  const session = await getSession()
  const res = await fetch(url.toString(), {
    headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
  })
  if (!res.ok) throw new Error('Unable to export pet census submissions')
  return res.blob()
}

export const petCensusApi = {
  list: (params?: PetCensusListParams) =>
    api.getPaginated<PetCensusSubmission>('/admin/pet-census', params),
  getById: (id: string) => api.get<PetCensusSubmission>(`/admin/pet-census/${id}`),
  update: (id: string, data: { status?: string; adminNote?: string | null }) =>
    api.patch<PetCensusSubmission>(`/admin/pet-census/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch<PetCensusSubmission>(`/admin/pet-census/${id}/status`, { status }),
  exportCsv,
  remove: (id: string) => api.delete<void>(`/admin/pet-census/${id}`),
}
