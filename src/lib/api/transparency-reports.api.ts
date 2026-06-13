import { api } from '../api'
import type { TransparencyReport, PaginationQuery } from '@/types/bpa.types'

export interface TransparencyReportPayload {
  title: string
  slug: string
  reportType: string
  periodStart: string
  periodEnd: string
  totalCollectedBdt: number
  totalSpentBdt: number
  balanceBdt?: number
  breakdownJson?: Record<string, unknown>
  summaryMd?: string
  bodyMd?: string
  attachmentUrl?: string
  coverImageId?: string | null
  status?: string
}

export type TransparencyReportUpdatePayload = Partial<TransparencyReportPayload>

export const transparencyReportsApi = {
  list: (params?: PaginationQuery & { status?: string; reportType?: string }) =>
    api.getPaginated<TransparencyReport>('/admin/transparency-reports', params),
  getById: (id: string) => api.get<TransparencyReport>(`/admin/transparency-reports/${id}`),
  create: (data: TransparencyReportPayload) =>
    api.post<TransparencyReport>('/admin/transparency-reports', data),
  update: (id: string, data: TransparencyReportUpdatePayload) =>
    api.patch<TransparencyReport>(`/admin/transparency-reports/${id}`, data),
  remove: (id: string) => api.delete<void>(`/admin/transparency-reports/${id}`),
  publish: (id: string) =>
    api.patch<TransparencyReport>(`/admin/transparency-reports/${id}/publish`, {}),
  unpublish: (id: string) =>
    api.patch<TransparencyReport>(`/admin/transparency-reports/${id}/unpublish`, {}),
}
