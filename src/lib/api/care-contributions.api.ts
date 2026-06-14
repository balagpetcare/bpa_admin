import { api } from '../api'
import type { CareContribution, PaginationQuery } from '@/types/bpa.types'

export interface ContributionUpdatePayload {
  status?: string
  contributorName?: string
  contributorMobile?: string
  contributorEmail?: string
  contributorAddress?: string
}

export const careContributionsApi = {
  list: (params?: PaginationQuery & { status?: string; zoneId?: string; planId?: string }) =>
    api.getPaginated<CareContribution>('/admin/care-contributions', params),
  getById: (id: string) => api.get<CareContribution>(`/admin/care-contributions/${id}`),
  update: (id: string, data: ContributionUpdatePayload) =>
    api.patch<CareContribution>(`/admin/care-contributions/${id}`, data),
}
