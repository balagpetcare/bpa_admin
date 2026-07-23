import { api } from '../api'
import type { DiagnosticCenterService, DiagnosticServiceCategory, PaginationQuery } from '@/types/bpa.types'

export interface DiagnosticCenterServiceCreatePayload {
  titleEn: string
  titleBn: string
  descriptionEn?: string
  descriptionBn?: string
  category: DiagnosticServiceCategory
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export type DiagnosticCenterServiceUpdatePayload = Partial<DiagnosticCenterServiceCreatePayload>

export const diagnosticCenterServicesApi = {
  list: (params?: PaginationQuery & { category?: DiagnosticServiceCategory; isActive?: boolean }) =>
    api.getPaginated<DiagnosticCenterService>('/admin/diagnostic-center-services', params),
  getById: (id: string) => api.get<DiagnosticCenterService>(`/admin/diagnostic-center-services/${id}`),
  create: (data: DiagnosticCenterServiceCreatePayload) => api.post<DiagnosticCenterService>('/admin/diagnostic-center-services', data),
  update: (id: string, data: DiagnosticCenterServiceUpdatePayload) =>
    api.patch<DiagnosticCenterService>(`/admin/diagnostic-center-services/${id}`, data),
  remove: (id: string) => api.delete<void>(`/admin/diagnostic-center-services/${id}`),
}
