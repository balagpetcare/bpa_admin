import { apiClient } from '../api'

export interface EmailLayoutSetting {
  id: string
  name: string
  isDefault: boolean
  status: 'active' | 'inactive'
  locale: 'en' | 'bn'
  headerLogoUrl: string | null
  headerTitle: string
  headerSubtitle: string | null
  headerBackgroundColor: string
  headerTextColor: string
  footerLogoUrl: string | null
  footerText: string | null
  footerSupportEmail: string | null
  footerPhonePrimary: string | null
  footerPhoneSecondary: string | null
  footerWebsiteUrl: string | null
  footerAddress: string | null
  footerBackgroundColor: string
  footerTextColor: string
  buttonPrimaryColor: string
  buttonTextColor: string
  legalNote: string | null
  customHeaderHtml: string | null
  customFooterHtml: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEmailLayoutDto {
  name: string
  isDefault?: boolean
  status?: 'active' | 'inactive'
  locale: 'en' | 'bn'
  headerLogoUrl?: string | null
  headerTitle: string
  headerSubtitle?: string | null
  headerBackgroundColor?: string
  headerTextColor?: string
  footerLogoUrl?: string | null
  footerText?: string | null
  footerSupportEmail?: string | null
  footerPhonePrimary?: string | null
  footerPhoneSecondary?: string | null
  footerWebsiteUrl?: string | null
  footerAddress?: string | null
  footerBackgroundColor?: string
  footerTextColor?: string
  buttonPrimaryColor?: string
  buttonTextColor?: string
  legalNote?: string | null
  customHeaderHtml?: string | null
  customFooterHtml?: string | null
}

export type UpdateEmailLayoutDto = Partial<CreateEmailLayoutDto>

export interface PreviewLayoutRequest {
  layoutId?: string | null
  layoutData?: UpdateEmailLayoutDto | null
  locale?: 'en' | 'bn'
  subject?: string
  bodyHtml?: string
  previewText?: string
}

export interface SendTestEmailRequest {
  email: string
  layoutId?: string | null
  layoutData?: UpdateEmailLayoutDto | null
  locale?: 'en' | 'bn'
}

export const emailLayoutsApi = {
  list: () => apiClient<EmailLayoutSetting[]>('/admin/email-layouts'),
  get: (id: string) => apiClient<EmailLayoutSetting>(`/admin/email-layouts/${id}`),
  create: (dto: CreateEmailLayoutDto) => apiClient<EmailLayoutSetting>('/admin/email-layouts', { method: 'POST', body: dto }),
  update: (id: string, dto: UpdateEmailLayoutDto) => apiClient<EmailLayoutSetting>(`/admin/email-layouts/${id}`, { method: 'PATCH', body: dto }),
  setDefault: (id: string) => apiClient<EmailLayoutSetting>(`/admin/email-layouts/${id}/set-default`, { method: 'POST' }),
  preview: (req: PreviewLayoutRequest) => apiClient<{ html: string }>('/admin/email-layouts/preview', { method: 'POST', body: req }),
  sendTest: (req: SendTestEmailRequest) => apiClient<{ message: string }>('/admin/email-layouts/send-test', { method: 'POST', body: req }),
}
