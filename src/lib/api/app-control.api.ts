import { api } from '../api'
import type { PaginatedResult } from '@/types/bpa.types'

export type AppControlStatus = 'draft' | 'published' | 'archived'
export type AppControlDestinationType =
  | 'CAMPAIGN'
  | 'MEMBERSHIP'
  | 'DONATION'
  | 'PET_CENSUS'
  | 'SERVICE'
  | 'INTERNAL_PAGE'
  | 'EXTERNAL_URL'
  | 'NONE'

export type AppControlTargetAudience = 'all' | 'guest' | 'member' | 'donor' | 'volunteer' | 'staff'
export type AppHomeSectionType =
  | 'HERO_SLIDER'
  | 'QUICK_ACTIONS'
  | 'ACTIVE_CAMPAIGNS'
  | 'MEMBERSHIP_OFFER'
  | 'DONATION_CTA'
  | 'PET_CENSUS_CTA'
  | 'FEATURED_SERVICES'
  | 'OFFERS'
  | 'LATEST_UPDATES'
  | 'PARTNER_CLINICS'
  | 'EMERGENCY_NOTICE'

export interface AppControlRecord {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  mobileImageUrl: string | null
  ctaText: string | null
  destinationType: AppControlDestinationType
  destinationValue: string | null
  sortOrder: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  targetAudience: AppControlTargetAudience
  status: AppControlStatus
  createdById?: string | null
  updatedById?: string | null
  createdAt: string
  updatedAt: string
}

export interface AppThemeSettingRecord extends AppControlRecord {
  primaryColor: string | null
  secondaryColor: string | null
  accentColor: string | null
  fontFamily: string | null
  logoUrl: string | null
}

export interface AppVersionSettingRecord extends AppControlRecord {
  minimumVersion: string
  latestVersion: string
  forceUpdate: boolean
  releaseNotes: string | null
}

export interface AppAuditLogRecord {
  id: string
  entityType: string
  entityId: string | null
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish'
  title: string | null
  summary: string | null
  payload: Record<string, unknown> | null
  previousPayload: Record<string, unknown> | null
  createdById: string | null
  updatedById: string | null
  createdAt: string
  updatedAt: string
}

export interface AppControlListParams {
  page?: number
  limit?: number
  status?: AppControlStatus | ''
  isActive?: boolean | ''
  destinationType?: AppControlDestinationType | ''
  search?: string
}

export interface AppControlPayload {
  title?: string | null
  subtitle?: string | null
  description?: string | null
  imageUrl?: string | null
  mobileImageUrl?: string | null
  ctaText?: string | null
  destinationType?: AppControlDestinationType
  destinationValue?: string | null
  sortOrder?: number
  isActive?: boolean
  startsAt?: string | null
  endsAt?: string | null
  targetAudience?: AppControlTargetAudience
  status?: AppControlStatus
}

export interface AppThemeSettingPayload extends AppControlPayload {
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  fontFamily?: string | null
  logoUrl?: string | null
}

export interface AppVersionSettingPayload extends AppControlPayload {
  minimumVersion?: string
  latestVersion?: string
  forceUpdate?: boolean
  releaseNotes?: string | null
}

export const APP_CONTROL_PAGE_OPTIONS = [
  { value: 'app_dashboard', label: 'App Dashboard' },
  { value: 'home_page_builder', label: 'Home Page Builder' },
  { value: 'banners_sliders', label: 'Banners & Sliders' },
  { value: 'quick_actions', label: 'Quick Actions' },
  { value: 'featured_services', label: 'Featured Services' },
  { value: 'campaign_blocks', label: 'Campaign Blocks' },
  { value: 'offers_promotions', label: 'Offers & Promotions' },
  { value: 'page_cms', label: 'Page CMS' },
  { value: 'app_navigation', label: 'App Navigation' },
  { value: 'theme_branding', label: 'Theme & Branding' },
  { value: 'push_notifications', label: 'Push Notifications' },
  { value: 'popup_notice', label: 'Popup / Notice' },
  { value: 'version_control', label: 'Version Control' },
  { value: 'maintenance_mode', label: 'Maintenance Mode' },
  { value: 'audit_logs', label: 'Audit Logs' },
] as const

export const APP_HOME_SECTION_OPTIONS: Array<{ value: AppHomeSectionType; label: string; summary: string; critical?: boolean }> = [
  { value: 'HERO_SLIDER', label: 'Hero Slider', summary: 'Top-of-home promotional carousel and key campaign messaging.', critical: true },
  { value: 'QUICK_ACTIONS', label: 'Quick Actions', summary: 'Shortcut buttons for core app actions such as donate, join, or register.', critical: true },
  { value: 'ACTIVE_CAMPAIGNS', label: 'Active Campaigns', summary: 'Live campaigns and current participation opportunities.', critical: true },
  { value: 'MEMBERSHIP_OFFER', label: 'Membership Offer', summary: 'Membership upsell, benefits, and join flow entry point.' },
  { value: 'DONATION_CTA', label: 'Donation CTA', summary: 'Donation-focused callout block for current giving priorities.' },
  { value: 'PET_CENSUS_CTA', label: 'Pet Census CTA', summary: 'Pet census registration and awareness section.' },
  { value: 'FEATURED_SERVICES', label: 'Featured Services', summary: 'Highlighted member or public services available in the app.' },
  { value: 'OFFERS', label: 'Offers', summary: 'Promotional offers, discounts, and time-bound incentives.' },
  { value: 'LATEST_UPDATES', label: 'Latest Updates', summary: 'News, announcements, and latest content stream.' },
  { value: 'PARTNER_CLINICS', label: 'Partner Clinics', summary: 'Clinic partners, support locations, and emergency access links.' },
  { value: 'EMERGENCY_NOTICE', label: 'Emergency Notice', summary: 'High-priority emergency or service interruption notice.', critical: true },
] as const

function paramsWithBooleans(params?: AppControlListParams) {
  return {
    ...params,
    isActive: params?.isActive === '' || params?.isActive === undefined ? undefined : String(params.isActive),
    status: params?.status || undefined,
    destinationType: params?.destinationType || undefined,
    search: params?.search || undefined,
  } as Record<string, string | number | boolean | undefined>
}

export const appControlApi = {
  list: <T = AppControlRecord>(resource: string, params?: AppControlListParams) =>
    api.getPaginated<T>(`/admin/app-control/${resource}`, paramsWithBooleans(params)),

  getById: <T = AppControlRecord>(resource: string, id: string) =>
    api.get<T>(`/admin/app-control/${resource}/${id}`),

  create: <T = AppControlRecord, P = AppControlPayload>(resource: string, payload: P) =>
    api.post<T>(`/admin/app-control/${resource}`, payload),

  update: <T = AppControlRecord, P = Partial<AppControlPayload>>(resource: string, id: string, payload: P) =>
    api.patch<T>(`/admin/app-control/${resource}/${id}`, payload),

  remove: (resource: string, id: string) =>
    api.delete<void>(`/admin/app-control/${resource}/${id}`),

  publish: <T = AppControlRecord>(resource: string, id: string, published: boolean) =>
    api.patch<T>(`/admin/app-control/${resource}/${id}/publish`, { published }),

  reorder: (resource: string, items: Array<{ id: string; sortOrder: number }>) =>
    api.patch<{ reordered: number }>(`/admin/app-control/${resource}/reorder`, { items }),

  listAuditLogs: (params?: { page?: number; limit?: number; action?: string; entityType?: string; search?: string }) =>
    api.getPaginated<AppAuditLogRecord>('/admin/app-control/audit-logs', params as Record<string, string | number | boolean | undefined>),
}

export type AppControlPaginated<T> = PaginatedResult<T>
