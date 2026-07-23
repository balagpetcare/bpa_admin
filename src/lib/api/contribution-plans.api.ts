import { api } from '../api'
import type { ContributionPlan, PaginationQuery } from '@/types/bpa.types'

export interface PlanCreatePayload {
  title: string
  slug: string
  contributionType?: string
  amountBdt: number
  currency?: string
  description?: string
  benefitsSummaryJson?: string[]
  legalDisclaimerText?: string
  isActive?: boolean
  sortOrder?: number
}

export type PlanUpdatePayload = Partial<PlanCreatePayload>

export const contributionPlansApi = {
  list: (params?: PaginationQuery & { isActive?: boolean }) => api.getPaginated<ContributionPlan>('/admin/contribution-plans', params),
  getById: (id: string) => api.get<ContributionPlan>(`/admin/contribution-plans/${id}`),
  create: (data: PlanCreatePayload) => api.post<ContributionPlan>('/admin/contribution-plans', data),
  update: (id: string, data: PlanUpdatePayload) => api.patch<ContributionPlan>(`/admin/contribution-plans/${id}`, data),
  remove: (id: string) => api.delete<void>(`/admin/contribution-plans/${id}`),
}
