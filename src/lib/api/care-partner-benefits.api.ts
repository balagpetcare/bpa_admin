import { api } from '../api'
import type { CarePartnerBenefit, CarePartnerBenefitCategory, PaginationQuery } from '@/types/bpa.types'

export interface CarePartnerBenefitCreatePayload {
  titleEn: string
  titleBn: string
  descriptionEn?: string
  descriptionBn?: string
  icon?: string
  category: CarePartnerBenefitCategory
  sortOrder?: number
  isActive?: boolean
}

export type CarePartnerBenefitUpdatePayload = Partial<CarePartnerBenefitCreatePayload>

export const carePartnerBenefitsApi = {
  list: (params?: PaginationQuery & { category?: CarePartnerBenefitCategory; isActive?: boolean }) =>
    api.getPaginated<CarePartnerBenefit>('/admin/care-partner-benefits', params),
  getById: (id: string) => api.get<CarePartnerBenefit>(`/admin/care-partner-benefits/${id}`),
  create: (data: CarePartnerBenefitCreatePayload) => api.post<CarePartnerBenefit>('/admin/care-partner-benefits', data),
  update: (id: string, data: CarePartnerBenefitUpdatePayload) => api.patch<CarePartnerBenefit>(`/admin/care-partner-benefits/${id}`, data),
  remove: (id: string) => api.delete<void>(`/admin/care-partner-benefits/${id}`),
}
