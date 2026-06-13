import { api } from '../api'
import type { CommunityZone, PaginationQuery } from '@/types/bpa.types'

export interface ZoneCreatePayload {
  name: string
  slug: string
  description?: string
  city: string
  district: string
  division: string
  targetContributors: number
  targetAmountBdt: number
  clinicAddress?: string
  clinicPhone?: string
  mapEmbedUrl?: string
  latitude?: string
  longitude?: string
  coverImageId?: string
  sortOrder?: number
  status?: string
}

export type ZoneUpdatePayload = Partial<ZoneCreatePayload>

export const communityZonesApi = {
  list: (params?: PaginationQuery & { status?: string }) =>
    api.getPaginated<CommunityZone>('/admin/community-zones', params),
  getById: (id: string) => api.get<CommunityZone>(`/admin/community-zones/${id}`),
  create: (data: ZoneCreatePayload) => api.post<CommunityZone>('/admin/community-zones', data),
  update: (id: string, data: ZoneUpdatePayload) =>
    api.patch<CommunityZone>(`/admin/community-zones/${id}`, data),
  remove: (id: string) => api.delete<void>(`/admin/community-zones/${id}`),
}
