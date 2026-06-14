import { apiClient } from '../api'

export interface SiteSettings {
  id: string
  createdAt: string
  updatedAt: string
  siteName: string
  siteTagline: string | null
  organizationName: string
  officialPhone: string | null
  supportPhone: string | null
  supportEmail: string | null
  officeAddress: string | null
  primaryLogoUrl: string | null
  secondaryLogoUrl: string | null
  faviconUrl: string | null
  defaultMetaTitle: string | null
  defaultMetaDescription: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
  registrationErrorTitle: string
  registrationErrorMessage: string
  emergencyNotice: string | null
}

export type UpdateSiteSettingsDto = Partial<Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>>

export const siteSettingsApi = {
  get: () => apiClient<SiteSettings>('/admin/site-settings'),
  update: (dto: UpdateSiteSettingsDto) =>
    apiClient<SiteSettings>('/admin/site-settings', { method: 'PUT', body: dto }),
}
