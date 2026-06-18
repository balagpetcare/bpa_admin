import { apiClient } from '../api'

export interface SiteSettings {
  id: string
  createdAt: string
  updatedAt: string
  // Identity
  siteName: string
  siteTagline: string | null
  tagline: string | null
  organizationName: string
  legalName: string | null
  websiteUrl: string | null
  // Contact
  officialPhone: string | null
  supportPhone: string | null
  emergencyPhone: string | null
  whatsappNumber: string | null
  generalEmail: string | null
  supportEmail: string | null
  contactEmail: string | null
  vaccinationEmail: string | null
  primaryPhone: string | null
  secondaryPhone: string | null
  officeHours: string | null
  // Address
  officeAddress: string | null
  addressLine1: string | null
  addressLine2: string | null
  addressLine: string | null
  area: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  mapEmbedUrl: string | null
  mapLink: string | null
  // Branding
  primaryLogoUrl: string | null
  secondaryLogoUrl: string | null
  faviconUrl: string | null
  defaultMetaTitle: string | null
  defaultMetaDescription: string | null
  receiptFooterNote: string | null
  donationReceiptTermsBn: string | null
  donationReceiptTermsEn: string | null
  // Social
  facebookUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
  // Public messages
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
