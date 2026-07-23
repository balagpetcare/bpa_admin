import { api } from '../api'

export type AnalyticsPeriod = 'today' | 'yesterday' | 'last7d' | 'last30d' | 'thisMonth' | 'custom'

export interface AnalyticsParams {
  range?: AnalyticsPeriod
  from?: string
  to?: string
}

export interface FormStats {
  volunteers: number
  contacts: number
  memberships: number
  period: string
}

export interface TrafficPoint {
  date: string
  pageViews: number
  uniqueVisitors: number
}

export interface TrafficAnalyticsData {
  trafficPoints: TrafficPoint[]
  topPages: Array<{ path: string; pageViews: number }>
  deviceBreakdown: Array<{ device: string; count: number }>
  referrers: Array<{ referrer: string; count: number }>
}

export interface AnalyticsOverview {
  users: { total: number; growth: number }
  revenue: { total: number }
  memberships: { total: number; growth: number }
  donations: { total: number; growth: number }
  campaigns: { active: number; registrations: number }
  petCensus: { total: number; growth: number }
  support: { total: number; growth: number }
}

export interface RevenueAnalytics {
  revenuePoints: Array<{ date: string; amount: number }>
  methodBreakdown: Array<{ method: string; count: number; amount: number }>
  rates: { success: number; failed: number; pending: number }
}

export interface MembershipAnalytics {
  membershipPoints: Array<{ date: string; count: number }>
  tierBreakdown: Array<{ name: string; count: number }>
  zoneBreakdown: Array<{ name: string; count: number }>
}

export interface CampaignAnalyticsData {
  campaignPoints: Array<{ date: string; count: number }>
  campaignBreakdown: Array<{ title: string; count: number; amount: number }>
  capacities: Array<{ title: string; capacity: number; booked: number; percent: number }>
}

export interface DonationAnalyticsData {
  donationPoints: Array<{ date: string; count: number; amount: number }>
  campaignsProgress: Array<{ title: string; goal: number; raised: number; percent: number }>
  purposeBreakdown: Array<{ title: string; count: number; amount: number }>
}

export interface PetCensusAnalyticsData {
  censusPoints: Array<{ date: string; count: number }>
  zoneBreakdown: Array<{ name: string; count: number }>
  petTypes: Array<{ type: string; count: number }>
}

export interface SupportAnalyticsData {
  supportPoints: Array<{ date: string; count: number }>
  categoryBreakdown: Array<{ name: string; count: number }>
  replied: number
  pending: number
}

export interface ConversionFunnelData {
  membership: Array<{ stage: string; count: number }>
  donation: Array<{ stage: string; count: number }>
  campaign: Array<{ stage: string; count: number }>
  census: Array<{ stage: string; count: number }>
}

export interface LiveAnalyticsData {
  activeVisitors: number
  recentEvents: Array<{
    id: string
    type: string
    module: string
    action: string
    title: string
    createdAt: string
  }>
  recentPayments: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
  recentInquiries: Array<{
    id: string
    name: string
    subject: string
    status: string
    createdAt: string
  }>
}

export const analyticsApi = {
  overview: (params?: AnalyticsParams) => api.get<AnalyticsOverview>('/admin/analytics/overview', params as any),

  traffic: (params?: AnalyticsParams) => api.get<TrafficAnalyticsData>('/admin/analytics/traffic', params as any),

  revenue: (params?: AnalyticsParams) => api.get<RevenueAnalytics>('/admin/analytics/revenue', params as any),

  membership: (params?: AnalyticsParams) => api.get<MembershipAnalytics>('/admin/analytics/membership', params as any),

  campaigns: (params?: AnalyticsParams) => api.get<CampaignAnalyticsData>('/admin/analytics/campaigns', params as any),

  donations: (params?: AnalyticsParams) => api.get<DonationAnalyticsData>('/admin/analytics/donations', params as any),

  petCensus: (params?: AnalyticsParams) => api.get<PetCensusAnalyticsData>('/admin/analytics/pet-census', params as any),

  support: (params?: AnalyticsParams) => api.get<SupportAnalyticsData>('/admin/analytics/support', params as any),

  conversions: (params?: AnalyticsParams) => api.get<ConversionFunnelData>('/admin/analytics/conversions', params as any),

  live: () => api.get<LiveAnalyticsData>('/admin/analytics/live'),

  summary: () => api.get<any>('/admin/analytics/summary'),

  forms: (params?: AnalyticsParams) => api.get<any>('/admin/analytics/forms', params as any),
}
