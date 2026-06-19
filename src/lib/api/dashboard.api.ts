import { api } from '../api'

export interface DashboardSummary {
  todayRevenue: number
  monthRevenue: number
  revenueChangePercent: number
  totalUsers: number
  newUsersToday: number
  activeMembers: number
  newMembersToday: number
  pendingMembershipPayments: number
  donationsToday: number
  donationAmountToday: number
  activeCampaigns: number
  campaignRegistrationsToday: number
  pendingCampaignPayments: number
  petCensusToday: number
  unreadContactInquiries: number
  unrepliedContactInquiries: number
  failedSmsToday: number
  pendingSmsQueue: number
  failedPaymentsToday: number
  pendingManualPayments: number
  systemHealth: {
    database: string
    api: string
    sms: string
    email: string
    storage: string
    payments: string
  }
  trends: {
    revenue: Array<{ date: string; amount: number }>
    memberships: Array<{ date: string; count: number }>
    campaigns: Array<{ date: string; count: number }>
    petCensus: Array<{ date: string; count: number }>
    contacts: Array<{ date: string; count: number }>
    paymentStatuses: Array<{ status: string; count: number }>
    membershipTiers: Array<{ name: string; count: number }>
    donationCampaigns: Array<{ id: string; title: string; goal: number; raised: number; percent: number }>
    campaignCapacities: Array<{ id: string; title: string; capacity: number; booked: number; percent: number }>
    zoneDemand: Array<{ id: string; name: string; censusCount: number }>
  }
}

export interface PendingActions {
  newInquiries: Array<{ id: string; name: string; subject: string | null; priority: string; createdAt: string }>
  pendingMfsPayments: Array<{ id: string; amountBdt: number; memberName: string; createdAt: string; tier: { nameEn: string } }>
  pendingCampaignRegs: Array<{ id: string; bookingNumber: string; createdAt: string; campaign: { title: string } }>
  failedSms: Array<{ id: string; recipientMasked: string | null; messageType: string | null; failureReason: string | null; createdAt: string }>
}

export interface ActivityFeedItem {
  id: string
  _type: 'contact_inquiry' | 'membership' | 'donation' | 'campaign_registration' | 'pet_census'
  createdAt: string
  [key: string]: unknown
}

export interface RecentActivity {
  feed: ActivityFeedItem[]
}

export interface SystemHealth {
  database: 'healthy' | 'error'
  sms: { queued: number; failed: number; sent: number; status: 'healthy' | 'degraded' }
  email: { queued: number; failed: number; status: 'healthy' | 'degraded' }
  payments: { failedLast24h: number; status: 'healthy' | 'degraded' }
  checkedAt: string
}

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/admin/dashboard/summary'),
  recentActivity: () => api.get<RecentActivity>('/admin/dashboard/recent-activity'),
  pendingActions: () => api.get<PendingActions>('/admin/dashboard/pending-actions'),
  systemHealth: () => api.get<SystemHealth>('/admin/dashboard/system-health'),
}
