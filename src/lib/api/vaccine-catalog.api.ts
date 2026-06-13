import { api } from '../api'
import type { VaccineCatalog, CertificateTemplate, PaginatedResult } from '@/types/bpa.types'

export interface VaccineCatalogListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export const vaccineCatalogApi = {
  // Vaccines
  list: (params?: VaccineCatalogListParams) =>
    api.get<PaginatedResult<VaccineCatalog>>(
      '/admin/vaccine-catalog/vaccines',
      params as Record<string, string | number | boolean | undefined>,
    ),
  getById: (id: string) => api.get<VaccineCatalog>(`/admin/vaccine-catalog/vaccines/${id}`),
  create: (dto: { name: string; species?: string; standardIntervalDays?: number; manufacturer?: string; description?: string }) =>
    api.post<VaccineCatalog>('/admin/vaccine-catalog/vaccines', dto),
  update: (id: string, dto: Partial<{ name: string; species: string; standardIntervalDays: number; manufacturer: string; description: string; isActive: boolean }>) =>
    api.patch<VaccineCatalog>(`/admin/vaccine-catalog/vaccines/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/admin/vaccine-catalog/vaccines/${id}`),

  // Certificate Templates
  listTemplates: () => api.get<CertificateTemplate[]>('/admin/vaccine-catalog/certificate-templates'),
  createTemplate: (dto: { name: string; htmlTemplate: string }) =>
    api.post<CertificateTemplate>('/admin/vaccine-catalog/certificate-templates', dto),
  updateTemplate: (id: string, dto: Partial<{ name: string; htmlTemplate: string; isActive: boolean }>) =>
    api.patch<CertificateTemplate>(`/admin/vaccine-catalog/certificate-templates/${id}`, dto),
  removeTemplate: (id: string) => api.delete<void>(`/admin/vaccine-catalog/certificate-templates/${id}`),
}
