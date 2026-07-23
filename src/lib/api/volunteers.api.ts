import { api } from '../api'
import type { Volunteer, PaginatedResult, VolunteerStatus } from '@/types/bpa.types'

export interface VolunteerListParams {
  page?: number
  limit?: number
  search?: string
  status?: VolunteerStatus
}

export const volunteersApi = {
  list: (params?: VolunteerListParams) =>
    api.get<PaginatedResult<Volunteer>>('/volunteers', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<Volunteer>(`/volunteers/${id}`),

  updateStatus: (id: string, status: VolunteerStatus) => api.patch<Volunteer>(`/volunteers/${id}/status`, { status }),
}
