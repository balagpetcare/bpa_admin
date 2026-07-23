import { api } from '@/lib/api'
import type { CampaignAnalyticsSummary, GlobalCampaignAnalytics, QRScanLog } from '@/types/bpa.types'

interface PagedResult<T> {
  items: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const campaignAnalyticsApi = {
  getGlobal: () => api.get<GlobalCampaignAnalytics>('/admin/analytics/campaigns/global'),

  getSummary: (campaignId: string) => api.get<CampaignAnalyticsSummary>(`/admin/analytics/campaigns/${campaignId}/summary`),

  getBySession: (campaignId: string) => api.get<unknown[]>(`/admin/analytics/campaigns/${campaignId}/by-session`),

  getByLocation: (campaignId: string) => api.get<unknown>(`/admin/analytics/campaigns/${campaignId}/by-location`),

  getByDoctor: (campaignId: string) => api.get<unknown[]>(`/admin/analytics/campaigns/${campaignId}/by-doctor`),

  getByVolunteer: (campaignId: string) => api.get<unknown[]>(`/admin/analytics/campaigns/${campaignId}/by-volunteer`),

  getVaccinationKpis: (campaignId: string) => api.get<unknown>(`/admin/analytics/campaigns/${campaignId}/vaccination-kpis`),

  getSmsKpis: (campaignId: string) => api.get<{ totalSmsSent: number; totalSmsFailed: number }>(`/admin/analytics/campaigns/${campaignId}/sms-kpis`),

  getRevenue: (campaignId: string) => api.get<unknown>(`/admin/analytics/campaigns/${campaignId}/revenue`),

  getRegistrationsOverTime: (campaignId: string) =>
    api.get<Array<{ date: string; total: number; paid: number }>>(`/admin/analytics/campaigns/${campaignId}/registrations-over-time`),

  getQrScanLogs: (campaignId: string, params?: { page?: number; limit?: number }) =>
    api.get<PagedResult<QRScanLog>>(`/admin/analytics/campaigns/${campaignId}/qr-scan-logs`, params),
}
