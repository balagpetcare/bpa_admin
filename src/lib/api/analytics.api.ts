import { api } from '../api'
import type { AnalyticsSummary } from '@/types/bpa.types'

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y'

export interface TrafficPoint {
  date: string
  pageViews: number
  uniqueVisitors: number
}

export interface FormStats {
  volunteers: number
  contacts: number
  memberships: number
  period: string
}

export interface AnalyticsParams {
  period?: AnalyticsPeriod
  from?: string
  to?: string
}

export const analyticsApi = {
  summary: () => api.get<AnalyticsSummary>('/admin/analytics/summary'),

  traffic: (params?: AnalyticsParams) =>
    api.get<TrafficPoint[]>(
      '/admin/analytics/traffic',
      params as Record<string, string | undefined>,
    ),

  forms: (params?: AnalyticsParams) =>
    api.get<FormStats>(
      '/admin/analytics/forms',
      params as Record<string, string | undefined>,
    ),
}
